import { act, renderHook } from '@testing-library/react';
import { StrictMode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import useWeather from '../../src/hooks/useWeather';
import { mockWeatherData } from '../../src/mocks/weather';
import { fetchWeather, searchCities } from '../../src/services/weatherService';
import type { AppError, Result } from '../../src/types/errors';
import type { CitySearchResult } from '../../src/types/services';
import type { City, WeatherData } from '../../src/types/weather';

vi.mock('../../src/services/weatherService', () => ({
  searchCities: vi.fn(),
  fetchWeather: vi.fn(),
}));

const city: City = {
  id: 1,
  name: 'Cidade A',
  region: null,
  country: null,
  coordinates: { latitude: 0, longitude: 0 },
  timeZone: 'UTC',
};
const otherCity: City = { ...city, id: 2, name: 'Cidade B' };
const citiesResult: Result<CitySearchResult> = {
  ok: true,
  value: { cities: [city, otherCity], partial: false },
};
const weatherData: WeatherData = {
  ...mockWeatherData,
  location: { kind: 'city', city },
};
const weatherResult: Result<WeatherData> = { ok: true, value: weatherData };

function failure(
  service: AppError['service'],
  kind: AppError['kind'] = 'network',
  retryAtMs: number | null = null,
): Result<never> {
  return {
    ok: false,
    error: {
      kind,
      service,
      status: kind === 'rate-limit' ? 429 : null,
      retryAtMs,
    },
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((accept, fail) => {
    resolve = accept;
    reject = fail;
  });
  return { promise, resolve, reject };
}

afterEach(() => {
  vi.resetAllMocks();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('useWeather', () => {
  it('inicia idle sem rede, inclusive em StrictMode, e ignora busca vazia', async () => {
    const { result } = renderHook(() => useWeather(), { wrapper: StrictMode });
    expect(result.current.searchState.status).toBe('idle');
    expect(result.current.weatherState.status).toBe('idle');
    expect(result.current.data).toBeNull();
    expect(result.current.cities).toEqual([]);
    await act(() => result.current.search(' \n '));
    await act(() => result.current.retry());
    expect(searchCities).not.toHaveBeenCalled();
    expect(fetchWeather).not.toHaveBeenCalled();
  });

  it('faz trim, busca cidades sem selecionar automaticamente e consulta só após escolha', async () => {
    vi.mocked(searchCities).mockResolvedValue(citiesResult);
    vi.mocked(fetchWeather).mockResolvedValue(weatherResult);
    const { result } = renderHook(() => useWeather());
    await act(() => result.current.search(' Cidade A '));
    expect(searchCities).toHaveBeenCalledWith('Cidade A', {
      signal: expect.any(AbortSignal),
      now: expect.any(Function),
    });
    expect(result.current.query).toBe('Cidade A');
    expect(result.current.cities).toEqual([city, otherCity]);
    expect(result.current.searchState.status).toBe('success');
    expect(fetchWeather).not.toHaveBeenCalled();
    await act(() => result.current.selectCity(otherCity));
    expect(fetchWeather).toHaveBeenCalledWith(
      { kind: 'city', city: otherCity },
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(result.current.weatherState.status).toBe('success');
    expect(result.current.data?.forecast).toHaveLength(5);
  });

  it('limpa resultados anteriores durante loading e produz empty só na busca', async () => {
    vi.mocked(searchCities).mockResolvedValueOnce(citiesResult);
    const waiting = deferred<Result<CitySearchResult>>();
    const { result } = renderHook(() => useWeather());
    await act(() => result.current.search('A'));
    vi.mocked(searchCities).mockReturnValueOnce(waiting.promise);
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.search('B');
    });
    expect(result.current.searchState.status).toBe('loading');
    expect(result.current.cities).toEqual([]);
    await act(async () => {
      waiting.resolve({ ok: true, value: { cities: [], partial: false } });
      await pending;
    });
    expect(result.current.searchState.status).toBe('empty');
    expect(result.current.weatherState.status).toBe('idle');
  });

  it('retry repete o termo enviado que falhou e não repete um sucesso', async () => {
    vi.mocked(searchCities)
      .mockResolvedValueOnce(failure('geocoding'))
      .mockResolvedValueOnce(citiesResult);
    const { result } = renderHook(() => useWeather());
    await act(() => result.current.search(' A '));
    expect(result.current.searchState.status).toBe('error');
    expect(result.current.searchErrorMessage).toBe('Falha de rede.');
    await act(() => result.current.search('  '));
    await act(() => result.current.retry());
    expect(searchCities).toHaveBeenNthCalledWith(2, 'A', expect.any(Object));
    await act(() => result.current.retry());
    expect(searchCities).toHaveBeenCalledTimes(2);
  });

  it('retry de forecast não repete geocoding e confirma conclusão no aceite', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-29T19:00:00Z'));
    vi.mocked(fetchWeather)
      .mockResolvedValueOnce(failure('forecast', 'timeout'))
      .mockResolvedValueOnce(weatherResult);
    const { result } = renderHook(() => useWeather());
    await act(() => result.current.selectCity(city));
    expect(result.current.weatherErrorMessage).toBe('A requisição demorou demais.');
    await act(() => result.current.retry());
    expect(fetchWeather).toHaveBeenCalledTimes(2);
    expect(searchCities).not.toHaveBeenCalled();
    expect(result.current.data?.completedAtMs).toBe(Date.now());
  });

  it('descarta respostas e finally antigos e deduplica só enquanto pendente', async () => {
    const first = deferred<Result<CitySearchResult>>();
    const second = deferred<Result<CitySearchResult>>();
    vi.mocked(searchCities)
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise)
      .mockResolvedValue(citiesResult);
    const { result } = renderHook(() => useWeather());
    let a!: Promise<void>;
    let b!: Promise<void>;
    act(() => {
      a = result.current.search('A');
    });
    const firstSignal = vi.mocked(searchCities).mock.calls[0][1].signal;
    await act(() => result.current.search('A'));
    expect(searchCities).toHaveBeenCalledTimes(1);
    act(() => {
      b = result.current.search('B');
    });
    expect(firstSignal.aborted).toBe(true);
    await act(async () => {
      first.resolve(citiesResult);
      await a;
    });
    expect(result.current.searchState).toEqual({ status: 'loading', query: 'B' });
    await act(() => result.current.search('B'));
    expect(searchCities).toHaveBeenCalledTimes(2);
    await act(async () => {
      second.resolve({ ok: true, value: { cities: [otherCity], partial: true } });
      await b;
    });
    expect(result.current.cities).toEqual([otherCity]);
    expect(result.current.searchState).toMatchObject({ partial: true });
    await act(() => result.current.search('B'));
    expect(searchCities).toHaveBeenCalledTimes(3);
  });

  it('busca e previsão são independentes e rejeição antiga não gera diagnóstico', async () => {
    const first = deferred<Result<WeatherData>>();
    const second = deferred<Result<WeatherData>>();
    vi.mocked(fetchWeather).mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    vi.mocked(searchCities).mockResolvedValue(citiesResult);
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => useWeather());
    let a!: Promise<void>;
    let b!: Promise<void>;
    act(() => {
      a = result.current.selectCity(city);
    });
    const firstSignal = vi.mocked(fetchWeather).mock.calls[0][1].signal;
    await act(() => result.current.search('B'));
    expect(firstSignal.aborted).toBe(false);
    act(() => {
      b = result.current.selectCity(otherCity);
    });
    await act(async () => {
      first.reject(new Error('privado'));
      await a;
    });
    expect(result.current.weatherState).toMatchObject({
      status: 'loading',
      target: { kind: 'city', city: otherCity },
    });
    expect(log).not.toHaveBeenCalled();
    await act(async () => {
      second.resolve(weatherResult);
      await b;
    });
    expect(result.current.weatherState.status).toBe('success');
    expect(result.current.cities).toEqual([city, otherCity]);
  });

  it('preserva snapshot só em refresh do mesmo alvo e não mescla resposta parcial', async () => {
    vi.mocked(fetchWeather).mockResolvedValueOnce(weatherResult);
    const { result } = renderHook(() => useWeather());
    await act(() => result.current.selectCity(city));
    const initialData = result.current.data;
    const waiting = deferred<Result<WeatherData>>();
    vi.mocked(fetchWeather).mockReturnValueOnce(waiting.promise);
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.selectCity(city);
    });
    expect(result.current.weatherState.status).toBe('loading');
    expect(result.current.data).toBe(initialData);
    await act(async () => {
      waiting.resolve(failure('forecast'));
      await pending;
    });
    expect(result.current.data).toBe(initialData);
    expect(result.current.weatherState.status).toBe('error');
    vi.mocked(fetchWeather).mockResolvedValueOnce({
      ok: true,
      value: { ...weatherData, current: null, partial: true },
    });
    await act(() => result.current.retry());
    expect(result.current.data?.current).toBeNull();
    expect(result.current.data?.partial).toBe(true);
    const other = deferred<Result<WeatherData>>();
    vi.mocked(fetchWeather).mockReturnValueOnce(other.promise);
    act(() => {
      pending = result.current.selectCity(otherCity);
    });
    expect(result.current.data).toBeNull();
    await act(async () => {
      other.resolve(failure('forecast'));
      await pending;
    });
    expect(result.current.data).toBeNull();
  });

  it('nova ação aceita invalida retry da falha anterior', async () => {
    vi.mocked(fetchWeather).mockResolvedValue(failure('forecast'));
    vi.mocked(searchCities).mockResolvedValue(citiesResult);
    const { result } = renderHook(() => useWeather());
    await act(() => result.current.selectCity(city));
    await act(() => result.current.search('B'));
    await act(() => result.current.retry());
    expect(fetchWeather).toHaveBeenCalledTimes(1);
    expect(searchCities).toHaveBeenCalledTimes(1);
  });

  it.each([
    'success',
    'error',
  ] as const)('forecast antigo com %s não altera o local nem o horário do sucesso mais recente (EC-15)', async (outcome) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-29T19:00:00Z'));
    const old = deferred<Result<WeatherData>>();
    vi.mocked(fetchWeather)
      .mockReturnValueOnce(old.promise)
      .mockResolvedValueOnce({
        ok: true,
        value: { ...weatherData, location: { kind: 'city', city: otherCity } },
      });
    const { result } = renderHook(() => useWeather());
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.selectCity(city);
    });
    await act(() => result.current.selectCity(otherCity));
    const accepted = result.current.data;
    expect(accepted?.location).toEqual({ kind: 'city', city: otherCity });
    expect(accepted?.completedAtMs).toBe(Date.now());
    await act(async () => {
      await vi.advanceTimersByTimeAsync(60_000);
      old.resolve(outcome === 'success' ? weatherResult : failure('forecast'));
      await pending;
    });
    expect(result.current.data).toBe(accepted);
    expect(result.current.weatherState.status).toBe('success');
    expect(result.current.weatherError).toBeNull();
    expect(fetchWeather).toHaveBeenCalledTimes(2);
  });

  it.each([
    'search',
    'weather',
  ] as const)('bloqueio de %s não bloqueia o outro serviço', async (flow) => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    vi.mocked(searchCities).mockResolvedValue(citiesResult);
    vi.mocked(fetchWeather).mockResolvedValue(weatherResult);
    if (flow === 'search')
      vi.mocked(searchCities).mockResolvedValueOnce(failure('geocoding', 'rate-limit', 30_000));
    else vi.mocked(fetchWeather).mockResolvedValueOnce(failure('forecast', 'rate-limit', 30_000));
    const { result } = renderHook(() => useWeather());
    const action = () =>
      flow === 'search' ? result.current.search('A') : result.current.selectCity(city);
    await act(action);
    await act(() =>
      flow === 'search' ? result.current.selectCity(city) : result.current.search('A'),
    );
    await act(action);
    await act(() =>
      flow === 'search' ? result.current.search('B') : result.current.selectCity(otherCity),
    );
    expect(searchCities).toHaveBeenCalledTimes(1);
    expect(fetchWeather).toHaveBeenCalledTimes(1);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_000);
    });
    expect(searchCities).toHaveBeenCalledTimes(1);
    expect(fetchWeather).toHaveBeenCalledTimes(1);
    await act(action);
    expect(flow === 'search' ? searchCities : fetchWeather).toHaveBeenCalledTimes(2);
  });

  it('rejeição inesperada encerra loading com diagnóstico sanitizado e permite retry', async () => {
    vi.mocked(searchCities)
      .mockRejectedValueOnce(new Error('URL e termo privados'))
      .mockResolvedValueOnce(citiesResult);
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => useWeather());
    await act(() => result.current.search('termo privado'));
    expect(result.current.searchError).toMatchObject({ kind: 'unexpected', service: 'geocoding' });
    expect(log).toHaveBeenCalledExactlyOnceWith(
      'Falha assíncrona inesperada: unexpected/geocoding.',
    );
    await act(() => result.current.retry());
    expect(result.current.searchState.status).toBe('success');
  });

  it('desmontagem cancela ambos os fluxos e descarta conclusão/rejeição tardia', async () => {
    const cities = deferred<Result<CitySearchResult>>();
    const weather = deferred<Result<WeatherData>>();
    vi.mocked(searchCities).mockReturnValue(cities.promise);
    vi.mocked(fetchWeather).mockReturnValue(weather.promise);
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result, unmount } = renderHook(() => useWeather());
    let a!: Promise<void>;
    let b!: Promise<void>;
    act(() => {
      a = result.current.search('A');
      b = result.current.selectCity(city);
    });
    const searchSignal = vi.mocked(searchCities).mock.calls[0][1].signal;
    const weatherSignal = vi.mocked(fetchWeather).mock.calls[0][1].signal;
    unmount();
    expect(searchSignal.aborted).toBe(true);
    expect(weatherSignal.aborted).toBe(true);
    await act(async () => {
      cities.resolve(citiesResult);
      weather.reject(new Error('privado'));
      await Promise.all([a, b]);
    });
    expect(log).not.toHaveBeenCalled();
  });

  it.each([
    'success',
    'error',
  ] as const)('resposta antiga de busca (%s) não sobrescreve sucesso mais recente', async (outcome) => {
    const old = deferred<Result<CitySearchResult>>();
    vi.mocked(searchCities)
      .mockReturnValueOnce(old.promise)
      .mockResolvedValueOnce({
        ok: true,
        value: { cities: [otherCity], partial: false },
      });
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => useWeather());
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.search('A');
    });
    await act(() => result.current.search('B'));
    await act(async () => {
      if (outcome === 'success') old.resolve(citiesResult);
      else old.reject(new Error('privado'));
      await pending;
    });
    expect(result.current.query).toBe('B');
    expect(result.current.cities).toEqual([otherCity]);
    expect(result.current.searchState.status).toBe('success');
    expect(log).not.toHaveBeenCalled();
  });

  it('deduplica forecast e aplica bloqueio também a callbacks e retry já capturados', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const waiting = deferred<Result<WeatherData>>();
    vi.mocked(fetchWeather).mockReturnValueOnce(waiting.promise).mockResolvedValue(weatherResult);
    const { result } = renderHook(() => useWeather());
    const select = result.current.selectCity;
    const retry = result.current.retry;
    let pending!: Promise<void>;
    act(() => {
      pending = select(city);
    });
    await act(() => select(city));
    expect(fetchWeather).toHaveBeenCalledTimes(1);
    await act(async () => {
      waiting.resolve(failure('forecast', 'rate-limit', 30_000));
      await pending;
    });
    await act(() => select(otherCity));
    await act(() => retry());
    expect(fetchWeather).toHaveBeenCalledTimes(1);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_000);
    });
    await act(() => retry());
    expect(fetchWeather).toHaveBeenCalledTimes(2);
    expect(fetchWeather).toHaveBeenLastCalledWith({ kind: 'city', city }, expect.any(Object));
  });
});
