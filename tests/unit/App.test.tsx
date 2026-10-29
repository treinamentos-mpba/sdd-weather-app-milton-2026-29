import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/App';
import { mockWeatherData } from '../../src/mocks/weather';
import { fetchWeather, searchCities } from '../../src/services/weatherService';
import type { Result } from '../../src/types/errors';
import type { CitySearchResult } from '../../src/types/services';
import type { City, WeatherData } from '../../src/types/weather';

vi.mock('../../src/services/weatherService', () => ({
  searchCities: vi.fn(),
  fetchWeather: vi.fn(),
}));

const city: City = {
  id: 1,
  name: 'Salvador',
  region: 'Bahia',
  country: 'Brasil',
  coordinates: { latitude: -12.97, longitude: -38.49 },
  timeZone: 'America/Bahia',
};
const cities: Result<CitySearchResult> = {
  ok: true,
  value: { cities: [city], partial: false },
};
const data: WeatherData = { ...mockWeatherData, location: { kind: 'city', city } };

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((accept) => {
    resolve = accept;
  });
  return { promise, resolve };
}

afterEach(() => {
  vi.resetAllMocks();
  vi.useRealTimers();
});

describe('App integrado', () => {
  it('alterna todas as temperaturas dez vezes sem acumular arredondamento ou consultar novamente (EC-21/34/44)', async () => {
    const user = userEvent.setup();
    if (!data.current) throw new Error('O mock deve conter condições atuais.');
    const source: WeatherData = {
      ...data,
      current: { ...data.current, temperatureC: 12.34, apparentTemperatureC: -0.04 },
      forecast: data.forecast.map((day) => ({
        ...day,
        minTemperatureC: -1.25,
        maxTemperatureC: 12.34,
      })),
    };
    const original = structuredClone(source);
    vi.mocked(searchCities).mockResolvedValue(cities);
    vi.mocked(fetchWeather).mockResolvedValue({ ok: true, value: source });
    render(<App />);
    await user.type(screen.getByRole('textbox', { name: 'Nome da cidade' }), 'Salvador{Enter}');
    await user.click(screen.getByRole('button', { name: 'Salvador, Bahia, Brasil' }));
    const current = within(screen.getByRole('region', { name: 'Clima em Salvador' }));
    const forecast = within(screen.getByRole('region', { name: 'Previsão de 5 dias' }));

    for (let index = 0; index < 10; index++) {
      await user.click(screen.getByRole('radio', { name: 'Fahrenheit' }));
      expect(current.getByText('54,2 °F', { exact: false })).toBeInTheDocument();
      expect(current.getByText('Sensação térmica: 31,9 °F')).toBeInTheDocument();
      for (const card of forecast.getAllByRole('article')) {
        expect(within(card).getByText('54,2 °F')).toBeInTheDocument();
        expect(within(card).getByText('29,8 °F')).toBeInTheDocument();
      }
      expect(within(screen.getByRole('main')).queryByText(/°C/)).not.toBeInTheDocument();

      await user.click(screen.getByRole('radio', { name: 'Celsius' }));
      expect(current.getByText('12,3 °C', { exact: false })).toBeInTheDocument();
      expect(current.getByText('Sensação térmica: 0 °C')).toBeInTheDocument();
      for (const card of forecast.getAllByRole('article')) {
        expect(within(card).getByText('12,3 °C')).toBeInTheDocument();
        expect(within(card).getByText('-1,3 °C')).toBeInTheDocument();
      }
      expect(within(screen.getByRole('main')).queryByText(/°F/)).not.toBeInTheDocument();
      expect(current.getByText('18,5 km/h')).toBeInTheDocument();
      expect(current.getByText('0,4 mm')).toBeInTheDocument();
    }
    expect(source).toEqual(original);
    expect(searchCities).toHaveBeenCalledTimes(1);
    expect(fetchWeather).toHaveBeenCalledTimes(1);
  });

  it('inicia sem mock/rede e busca exige escolha explícita antes da previsão', async () => {
    const user = userEvent.setup();
    const search = deferred<Result<CitySearchResult>>();
    const forecast = deferred<Result<WeatherData>>();
    vi.mocked(searchCities).mockReturnValue(search.promise);
    vi.mocked(fetchWeather).mockReturnValue(forecast.promise);
    render(<App />);
    expect(screen.getByRole('status')).toHaveTextContent('Qual é o seu próximo destino?');
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
    expect(searchCities).not.toHaveBeenCalled();
    expect(fetchWeather).not.toHaveBeenCalled();
    expect(screen.queryByText(/dados fictícios/i)).not.toBeInTheDocument();
    const input = screen.getByRole('textbox', { name: 'Nome da cidade' });
    await user.type(input, 'Salvador{Enter}');
    expect(screen.getByRole('search')).toHaveAttribute('aria-busy', 'true');
    expect(input).toBeEnabled();
    expect(screen.getByRole('status')).toHaveTextContent('Buscando cidades');
    expect(input).toHaveFocus();
    await act(async () => {
      search.resolve(cities);
      await search.promise;
    });
    expect(input).toHaveFocus();
    expect(fetchWeather).not.toHaveBeenCalled();
    expect(screen.getByRole('search')).toHaveAttribute('aria-busy', 'false');
    await user.click(screen.getByRole('button', { name: 'Salvador, Bahia, Brasil' }));
    expect(screen.getByText('Carregando o clima…')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Dados meteorológicos' })).toHaveAttribute(
      'aria-busy',
      'true',
    );
    expect(screen.getByText('Carregando o clima…').closest('[aria-busy="true"]')).toBeNull();
    await user.click(screen.getByRole('radio', { name: 'Fahrenheit' }));
    await act(async () => {
      forecast.resolve({ ok: true, value: data });
      await forecast.promise;
    });
    expect(screen.getByRole('region', { name: 'Clima em Salvador' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Dados meteorológicos' })).toHaveAttribute(
      'aria-busy',
      'false',
    );
    expect(screen.getAllByRole('article')).toHaveLength(5);
    const main = within(screen.getByRole('main'));
    expect(main.getAllByText(/°F/)).toHaveLength(12);
    expect(main.queryByText(/°C/)).not.toBeInTheDocument();
    expect(screen.getByText('83,1 °F', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('0,4 mm')).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: 'Celsius' }));
    expect(main.getAllByText(/°C/)).toHaveLength(12);
    expect(searchCities).toHaveBeenCalledTimes(1);
    expect(fetchWeather).toHaveBeenCalledTimes(1);
  });

  it('vazio é busca sem resultados; erro repete o termo enviado e preserva foco', async () => {
    const user = userEvent.setup();
    vi.mocked(searchCities)
      .mockResolvedValueOnce({
        ok: true,
        value: { cities: [], partial: false },
      })
      .mockResolvedValueOnce({
        ok: false,
        error: { kind: 'network', service: 'geocoding', status: null, retryAtMs: null },
      })
      .mockResolvedValueOnce(cities);
    render(<App />);
    const input = screen.getByRole('textbox', { name: 'Nome da cidade' });
    await user.type(input, 'Nenhuma{Enter}');
    expect(screen.getByRole('status')).toHaveTextContent('Nenhuma cidade encontrada');
    await user.clear(input);
    await user.type(input, 'Salvador{Enter}');
    expect(screen.getByRole('alert')).toHaveTextContent('Falha de rede.');
    await user.clear(input);
    await user.type(input, 'Texto não enviado');
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(screen.getByRole('main')).toHaveFocus();
    expect(searchCities).toHaveBeenLastCalledWith('Salvador', expect.any(Object));
    expect(screen.getByRole('button', { name: 'Salvador, Bahia, Brasil' })).toBeInTheDocument();
    expect(fetchWeather).not.toHaveBeenCalled();
  });

  it('forecast com erro não apaga resultados; retry consulta só o alvo selecionado', async () => {
    const user = userEvent.setup();
    const other = { ...city, id: 2, region: 'Outra região' };
    vi.mocked(searchCities).mockResolvedValue({
      ok: true,
      value: { cities: [city, other], partial: false },
    });
    vi.mocked(fetchWeather)
      .mockResolvedValueOnce({
        ok: false,
        error: { kind: 'timeout', service: 'forecast', status: null, retryAtMs: null },
      })
      .mockResolvedValueOnce({
        ok: true,
        value: { ...data, location: { kind: 'city', city: other } },
      });
    render(<App />);
    await user.type(screen.getByRole('textbox'), 'Salvador{Enter}');
    await user.click(screen.getByRole('button', { name: 'Salvador, Outra região, Brasil' }));
    expect(screen.getByRole('alert')).toHaveTextContent('A requisição demorou demais.');
    expect(screen.getByRole('button', { name: 'Salvador, Bahia, Brasil' })).toBeInTheDocument();
    expect(screen.queryByText('Nenhuma cidade encontrada')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(screen.getAllByRole('article')).toHaveLength(5);
    expect(screen.getByRole('region', { name: 'Clima em Salvador' })).toHaveTextContent(
      'Outra região',
    );
    expect(searchCities).toHaveBeenCalledTimes(1);
    expect(fetchWeather).toHaveBeenLastCalledWith(
      { kind: 'city', city: other },
      expect.any(Object),
    );
  });

  it('mostra resposta parcial e aviso de fuso em vez de fabricar dados', async () => {
    const user = userEvent.setup();
    vi.mocked(searchCities).mockResolvedValue(cities);
    vi.mocked(fetchWeather).mockResolvedValue({
      ok: true,
      value: {
        ...data,
        current: null,
        timeZone: null,
        periodStart: null,
        forecast: [],
        partial: true,
      },
    });
    render(<App />);
    await user.type(screen.getByRole('textbox'), 'Salvador{Enter}');
    await user.click(screen.getByRole('button', { name: 'Salvador, Bahia, Brasil' }));
    expect(screen.getByText(/Dados parcialmente disponíveis/)).toBeInTheDocument();
    expect(screen.getByText('Condições atuais indisponíveis.')).toBeInTheDocument();
    expect(screen.getByText('Previsão indisponível.')).toBeInTheDocument();
    expect(screen.getByText(/Fuso indisponível/)).toBeInTheDocument();
    expect(screen.getByText(/Consulta concluída em/)).toHaveTextContent('(UTC)');
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
  });

  it('não permite selecionar homônimos sem contexto distintivo', async () => {
    const user = userEvent.setup();
    vi.mocked(searchCities).mockResolvedValue({
      ok: true,
      value: { cities: [city, { ...city, id: 2 }], partial: false },
    });
    render(<App />);
    await user.type(screen.getByRole('textbox'), 'Salvador{Enter}');
    for (const button of screen.getAllByRole('button', { name: 'Salvador, Bahia, Brasil' })) {
      expect(button).toBeDisabled();
    }
    expect(screen.getAllByText(/Resultados indistinguíveis/)).toHaveLength(2);
    expect(fetchWeather).not.toHaveBeenCalled();
  });

  it('rate limit bloqueia busca/retry até o prazo sem request automático', async () => {
    vi.useFakeTimers();
    vi.mocked(searchCities)
      .mockResolvedValueOnce({
        ok: false,
        error: {
          kind: 'rate-limit',
          service: 'geocoding',
          status: 429,
          retryAtMs: Date.now() + 30_000,
        },
      })
      .mockResolvedValueOnce(cities);
    render(<App />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Salvador' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));
    });
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeDisabled();
    expect(screen.getByText(/Busca temporariamente bloqueada/)).toBeInTheDocument();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_000);
    });
    expect(searchCities).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeEnabled();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    });
    expect(searchCities).toHaveBeenCalledTimes(2);
  });
});
