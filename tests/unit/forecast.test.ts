import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchWeather } from '../../src/services/weatherService';
import type { Result } from '../../src/types/errors';
import type { WeatherData } from '../../src/types/weather';
import { forecastLocation, forecastResponse } from '../fixtures/forecast';

const now = Date.parse('2026-10-29T18:00:00Z');
const context = () => ({ signal: new AbortController().signal, now: () => now });

function mockResponse(body: unknown, status = 200, headers?: HeadersInit) {
  const fetchMock = vi
    .fn()
    .mockResolvedValue(new Response(JSON.stringify(body), { status, headers }));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function success(result: Result<WeatherData>): WeatherData {
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error('Esperado resultado meteorológico utilizável.');
  return result.value;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('fetchWeather', () => {
  it('consulta current/daily, valida unidades e mapeia cinco dias sem perder o alvo', async () => {
    const fetchMock = mockResponse(forecastResponse());
    const data = success(await fetchWeather(forecastLocation, context()));
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.origin + url.pathname).toBe('https://api.open-meteo.com/v1/forecast');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      latitude: '52.52',
      longitude: '13.42',
      current:
        'temperature_2m,apparent_temperature,weather_code,relative_humidity_2m,wind_speed_10m,precipitation,pressure_msl',
      daily:
        'weather_code,temperature_2m_min,temperature_2m_max,precipitation_probability_max,relative_humidity_2m_mean,wind_speed_10m_max',
      forecast_days: '5',
      timezone: 'auto',
      temperature_unit: 'celsius',
      wind_speed_unit: 'kmh',
      precipitation_unit: 'mm',
      timeformat: 'iso8601',
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(data).toMatchObject({
      location: forecastLocation,
      timeZone: 'Europe/Berlin',
      periodStart: '2026-10-29',
      completedAtMs: now,
      partial: false,
      current: {
        temperatureC: 12.3,
        apparentTemperatureC: 10.1,
        weatherCode: 3,
        relativeHumidityPct: 70,
        windSpeedKmh: 15,
        precipitationMm: 0.4,
        pressureMslHpa: 1013,
        referenceTimeMs: Date.parse('2026-10-29T13:00:00Z'),
      },
    });
    expect(data.forecast).toHaveLength(5);
    expect(data.forecast[0]).toEqual({
      date: '2026-10-29',
      weatherCode: 3,
      minTemperatureC: 8,
      maxTemperatureC: 14,
      maxPrecipitationProbabilityPct: 20,
      meanRelativeHumidityPct: 70,
      maxWindSpeedKmh: 20,
    });
    expect(data.forecast[4]).toEqual({
      date: '2026-11-02',
      weatherCode: 1,
      minTemperatureC: 5,
      maxTemperatureC: 12,
      maxPrecipitationProbabilityPct: 10,
      meanRelativeHumidityPct: 60,
      maxWindSpeedKmh: 15,
    });
  });

  it.each(['current', 'daily'])('preserva a seção utilizável quando %s falta', async (section) => {
    mockResponse({ ...forecastResponse(), [section]: undefined });
    const data = success(await fetchWeather(forecastLocation, context()));
    expect(data.partial).toBe(true);
    if (section === 'current') {
      expect(data.current).toBeNull();
      expect(data.forecast).toHaveLength(5);
    } else {
      expect(data.current?.temperatureC).toBe(12.3);
      expect(data.forecast).toEqual([]);
      expect(data.periodStart).toBeNull();
    }
  });

  it('normaliza zeros, temperaturas negativas e valores inválidos independentemente', async () => {
    const body = forecastResponse();
    body.current = {
      ...body.current,
      temperature_2m: -5,
      apparent_temperature: 0,
      weather_code: 999,
      relative_humidity_2m: 0,
      wind_speed_10m: 0,
      precipitation: 0,
      pressure_msl: 0,
    };
    body.daily.precipitation_probability_max[0] = 101;
    body.daily.wind_speed_10m_max[0] = -1;
    body.daily.temperature_2m_min[0] = -10;
    mockResponse(body);
    const data = success(await fetchWeather(forecastLocation, context()));
    expect(data.current).toMatchObject({
      temperatureC: -5,
      apparentTemperatureC: 0,
      weatherCode: null,
      relativeHumidityPct: 0,
      windSpeedKmh: 0,
      precipitationMm: 0,
      pressureMslHpa: null,
    });
    expect(data.forecast[0]).toMatchObject({
      minTemperatureC: -10,
      maxPrecipitationProbabilityPct: null,
      maxWindSpeedKmh: null,
    });
    expect(data.partial).toBe(true);
  });

  it('invalida apenas campos com unidade incompatível ou ausente', async () => {
    const body = forecastResponse();
    body.current_units.temperature_2m = '°F';
    body.current_units.precipitation = '';
    body.daily_units.wind_speed_10m_max = 'm/s';
    mockResponse(body);
    const data = success(await fetchWeather(forecastLocation, context()));
    expect(data.current).toMatchObject({
      temperatureC: null,
      apparentTemperatureC: 10.1,
      precipitationMm: null,
    });
    expect(data.forecast.every((day) => day.maxWindSpeedKmh === null)).toBe(true);
    expect(data.partial).toBe(true);
  });

  it('série curta invalida só a variável; mínima maior que máxima não é trocada', async () => {
    const body = forecastResponse();
    body.daily.weather_code.pop();
    body.daily.temperature_2m_min[0] = 20;
    mockResponse(body);
    const data = success(await fetchWeather(forecastLocation, context()));
    expect(data.forecast.every((day) => day.weatherCode === null)).toBe(true);
    expect(data.forecast[0]).toMatchObject({ minTemperatureC: null, maxTemperatureC: null });
    expect(data.forecast[1]).toMatchObject({ minTemperatureC: 7, maxTemperatureC: 12 });
    expect(data.partial).toBe(true);
  });

  it('lacuna mantém a associação por data e gera placeholder, sem deslocar valores', async () => {
    const body = forecastResponse();
    body.daily.time[1] = 'data inválida';
    mockResponse(body);
    const data = success(await fetchWeather(forecastLocation, context()));
    expect(data.forecast).toHaveLength(5);
    expect(data.forecast[1]).toMatchObject({
      date: '2026-10-30',
      minTemperatureC: null,
      maxTemperatureC: null,
    });
    expect(data.forecast[2]).toMatchObject({ date: '2026-10-31', minTemperatureC: 6 });
    expect(data.partial).toBe(true);
  });

  it('invalida todas as ocorrências de data duplicada', async () => {
    const body = forecastResponse();
    body.daily.time[2] = body.daily.time[1];
    mockResponse(body);
    const data = success(await fetchWeather(forecastLocation, context()));
    expect(data.forecast[1]).toMatchObject({ date: '2026-10-30', minTemperatureC: null });
    expect(data.forecast[2]).toMatchObject({ date: '2026-10-31', minTemperatureC: null });
    expect(data.forecast[3]).toMatchObject({ date: '2026-11-01', minTemperatureC: 7 });
    expect(data.partial).toBe(true);
  });

  it('preenche dia ausente sem deslocar séries e ignora datas fora do período', async () => {
    const body = forecastResponse();
    body.daily.time = ['2026-10-29', '2026-10-31', '2026-11-01', '2026-11-02', '2026-11-03'];
    mockResponse(body);
    const data = success(await fetchWeather(forecastLocation, context()));
    expect(data.forecast).toHaveLength(5);
    expect(data.forecast[1]).toMatchObject({ date: '2026-10-30', minTemperatureC: null });
    expect(data.forecast[2]).toMatchObject({ date: '2026-10-31', minTemperatureC: 7 });
    expect(data.forecast[4]).toMatchObject({ date: '2026-11-02', minTemperatureC: 7 });
    expect(data.partial).toBe(true);
  });

  it.each(['fuso', 'início', 'ordem'])('não inventa período com %s inválido', async (reason) => {
    const body = forecastResponse();
    if (reason === 'fuso') body.timezone = 'Invalid/Zone';
    if (reason === 'início') body.daily.time[0] = '2026-02-30';
    if (reason === 'ordem') body.daily.time.reverse();
    mockResponse(body);
    const data = success(await fetchWeather(forecastLocation, context()));
    expect(data.forecast).toEqual([]);
    expect(data.periodStart).toBeNull();
    expect(data.partial).toBe(true);
    if (reason === 'fuso') {
      expect(data.timeZone).toBeNull();
      expect(data.current?.referenceTimeMs).toBeNull();
    }
  });

  it('aceita referência com offset mesmo sem fuso e nunca usa o fuso da cidade', async () => {
    const body = forecastResponse();
    body.timezone = '';
    body.current.time = '2026-10-29T14:00:00+01:00';
    mockResponse(body);
    const data = success(await fetchWeather(forecastLocation, context()));
    expect(data.current?.referenceTimeMs).toBe(Date.parse('2026-10-29T13:00:00Z'));
    expect(data.timeZone).toBeNull();
    expect(data.forecast).toEqual([]);
  });

  it.each([
    null,
    {},
    { error: true },
    { current: { time: '2026-10-29T14:00' }, current_units: { time: 'iso8601' } },
    { ...forecastResponse(), current: undefined, current_units: undefined, daily_units: undefined },
  ])('nenhuma seção utilizável retorna erro, não sucesso: %j', async (body) => {
    mockResponse(body);
    await expect(fetchWeather(forecastLocation, context())).resolves.toEqual({
      ok: false,
      error: { kind: 'invalid-response', service: 'forecast', status: null, retryAtMs: null },
    });
  });

  it('aceita alvo device e não o substitui pelas coordenadas da grade', async () => {
    mockResponse(forecastResponse());
    const location = { kind: 'device' as const, coordinates: { latitude: 0, longitude: 0 } };
    const data = success(await fetchWeather(location, context()));
    expect(data.location).toEqual(location);
  });

  it.each([400, 500, 429])('classifica HTTP %i com serviço forecast', async (status) => {
    mockResponse({}, status, { 'Retry-After': '30' });
    await expect(fetchWeather(forecastLocation, context())).resolves.toMatchObject({
      ok: false,
      error: {
        service: 'forecast',
        kind: status === 429 ? 'rate-limit' : 'http',
        status,
        retryAtMs: status === 429 ? now + 30_000 : null,
      },
    });
  });

  it('rejeita JSON inválido e distingue rejeição de rede', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{')));
    await expect(fetchWeather(forecastLocation, context())).resolves.toMatchObject({
      ok: false,
      error: { kind: 'invalid-response', service: 'forecast' },
    });
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Falha de conexão')));
    await expect(fetchWeather(forecastLocation, context())).resolves.toMatchObject({
      ok: false,
      error: { kind: 'network', service: 'forecast' },
    });
  });

  it('cancelamento externo impede sucesso tardio', async () => {
    const controller = new AbortController();
    mockResponse(forecastResponse());
    controller.abort();
    await expect(
      fetchWeather(forecastLocation, { ...context(), signal: controller.signal }),
    ).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('retorna falha sem rede para coordenadas inválidas', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    await expect(
      fetchWeather(
        {
          kind: 'device',
          coordinates: { latitude: 91, longitude: 0 },
        },
        context(),
      ),
    ).resolves.toMatchObject({
      ok: false,
      error: { kind: 'invalid-response', service: 'forecast' },
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
