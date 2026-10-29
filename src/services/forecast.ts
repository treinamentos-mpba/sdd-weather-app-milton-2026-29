import { normalizeWeather } from '../lib/normalizeWeather';
import type { Result } from '../types/errors';
import type { RequestContext } from '../types/services';
import type { WeatherData, WeatherLocation } from '../types/weather';
import { requestJson } from './http';

export async function fetchWeather(
  location: WeatherLocation,
  context: RequestContext,
): Promise<Result<WeatherData>> {
  const { latitude, longitude } =
    location.kind === 'city' ? location.city.coordinates : location.coordinates;
  if (
    !Number.isFinite(latitude) ||
    Math.abs(latitude) > 90 ||
    !Number.isFinite(longitude) ||
    Math.abs(longitude) > 180
  ) {
    return {
      ok: false,
      error: { kind: 'invalid-response', service: 'forecast', status: null, retryAtMs: null },
    };
  }
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.search = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
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
  }).toString();
  return requestJson(url, 'forecast', context, (data) =>
    normalizeWeather(data, location, context.now),
  );
}
