import type { Result } from '../types/errors';
import type { CurrentWeather, ForecastDay, WeatherData, WeatherLocation } from '../types/weather';
import { fiveDates, isLocalDate, parseReferenceTime } from './dates';
import { isRecord, parseTimeZone } from './validation';
import { isWeatherCode } from './weatherCodes';

function numeric(value: unknown, min = -Infinity, max = Infinity): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max
    ? value
    : null;
}

function withUnit(
  values: Record<string, unknown>,
  units: Record<string, unknown>,
  field: string,
  unit: string,
  min = -Infinity,
  max = Infinity,
): number | null {
  return units[field] === unit ? numeric(values[field], min, max) : null;
}

function normalizeCurrent(
  value: unknown,
  unitValue: unknown,
  timeZone: string | null,
): CurrentWeather | null {
  if (!isRecord(value) || !isRecord(unitValue)) return null;
  const current: CurrentWeather = {
    temperatureC: withUnit(value, unitValue, 'temperature_2m', '°C'),
    apparentTemperatureC: withUnit(value, unitValue, 'apparent_temperature', '°C'),
    weatherCode:
      unitValue.weather_code === 'wmo code' && isWeatherCode(value.weather_code)
        ? value.weather_code
        : null,
    relativeHumidityPct: withUnit(value, unitValue, 'relative_humidity_2m', '%', 0, 100),
    windSpeedKmh: withUnit(value, unitValue, 'wind_speed_10m', 'km/h', 0),
    precipitationMm: withUnit(value, unitValue, 'precipitation', 'mm', 0),
    pressureMslHpa: withUnit(value, unitValue, 'pressure_msl', 'hPa', Number.MIN_VALUE),
    referenceTimeMs: unitValue.time === 'iso8601' ? parseReferenceTime(value.time, timeZone) : null,
  };
  return Object.entries(current).some(
    ([field, value]) => field !== 'referenceTimeMs' && value !== null,
  )
    ? current
    : null;
}

function normalizeForecast(
  value: unknown,
  unitValue: unknown,
  timeZone: string | null,
): { periodStart: string | null; forecast: ForecastDay[]; partial: boolean } {
  const unavailable = { periodStart: null, forecast: [], partial: true };
  if (
    !timeZone ||
    !isRecord(value) ||
    !isRecord(unitValue) ||
    unitValue.time !== 'iso8601' ||
    !Array.isArray(value.time)
  )
    return unavailable;
  const dates: unknown[] = value.time;
  if (!isLocalDate(dates[0])) return unavailable;
  const validDates = dates.filter(isLocalDate);
  if (validDates.some((date, index) => index > 0 && date < validDates[index - 1]))
    return unavailable;
  const periodStart = dates[0];
  const expected = fiveDates(periodStart);
  const occurrences = new Map<string, number>();
  for (const date of validDates) occurrences.set(date, (occurrences.get(date) ?? 0) + 1);
  const seriesValue = (field: string, index: number): unknown => {
    const series: unknown = value[field];
    return Array.isArray(series) && series.length === dates.length ? series[index] : null;
  };
  const forecast = expected.map((date): ForecastDay => {
    const index = occurrences.get(date) === 1 ? dates.indexOf(date) : -1;
    const values: Record<string, unknown> = {};
    for (const field of Object.keys(unitValue)) {
      values[field] = index >= 0 ? seriesValue(field, index) : null;
    }
    let minTemperatureC = withUnit(values, unitValue, 'temperature_2m_min', '°C');
    let maxTemperatureC = withUnit(values, unitValue, 'temperature_2m_max', '°C');
    if (minTemperatureC !== null && maxTemperatureC !== null && minTemperatureC > maxTemperatureC) {
      minTemperatureC = null;
      maxTemperatureC = null;
    }
    return {
      date,
      weatherCode:
        unitValue.weather_code === 'wmo code' && isWeatherCode(values.weather_code)
          ? values.weather_code
          : null,
      minTemperatureC,
      maxTemperatureC,
      maxPrecipitationProbabilityPct: withUnit(
        values,
        unitValue,
        'precipitation_probability_max',
        '%',
        0,
        100,
      ),
      meanRelativeHumidityPct: withUnit(
        values,
        unitValue,
        'relative_humidity_2m_mean',
        '%',
        0,
        100,
      ),
      maxWindSpeedKmh: withUnit(values, unitValue, 'wind_speed_10m_max', 'km/h', 0),
    };
  });
  return {
    periodStart,
    forecast,
    partial:
      dates.length !== 5 ||
      dates.some((date) => !isLocalDate(date) || !expected.includes(date)) ||
      forecast.some((day) => Object.values(day).includes(null)),
  };
}

export function normalizeWeather(
  data: unknown,
  location: WeatherLocation,
  now: () => number,
): Result<WeatherData> {
  const invalid: Result<WeatherData> = {
    ok: false,
    error: { kind: 'invalid-response', service: 'forecast', status: null, retryAtMs: null },
  };
  if (!isRecord(data) || data.error === true) return invalid;
  const timeZone = parseTimeZone(data.timezone);
  const current = normalizeCurrent(data.current, data.current_units, timeZone);
  const { periodStart, forecast, partial } = normalizeForecast(
    data.daily,
    data.daily_units,
    timeZone,
  );
  const usableForecast = forecast.some((day) =>
    Object.entries(day).some(([field, value]) => field !== 'date' && value !== null),
  );
  if (!current && !usableForecast) return invalid;
  return {
    ok: true,
    value: {
      location,
      timeZone,
      periodStart,
      current,
      forecast,
      completedAtMs: now(),
      partial: partial || !current || Object.values(current).includes(null),
    },
  };
}
