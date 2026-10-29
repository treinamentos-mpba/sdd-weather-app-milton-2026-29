import type { WeatherLocation } from '../../src/types/weather';

export const forecastLocation: WeatherLocation = {
  kind: 'city',
  city: {
    id: 1,
    name: 'Cidade de exemplo',
    region: null,
    country: null,
    coordinates: { latitude: 52.52, longitude: 13.42 },
    timeZone: 'Europe/Berlin',
  },
};

export function forecastResponse() {
  return {
    latitude: 52.5,
    longitude: 13.4,
    timezone: 'Europe/Berlin',
    current_units: {
      time: 'iso8601',
      temperature_2m: '°C',
      apparent_temperature: '°C',
      weather_code: 'wmo code',
      relative_humidity_2m: '%',
      wind_speed_10m: 'km/h',
      precipitation: 'mm',
      pressure_msl: 'hPa',
    },
    current: {
      time: '2026-10-29T14:00',
      temperature_2m: 12.3,
      apparent_temperature: 10.1,
      weather_code: 3,
      relative_humidity_2m: 70,
      wind_speed_10m: 15,
      precipitation: 0.4,
      pressure_msl: 1013,
    },
    daily_units: {
      time: 'iso8601',
      weather_code: 'wmo code',
      temperature_2m_min: '°C',
      temperature_2m_max: '°C',
      precipitation_probability_max: '%',
      relative_humidity_2m_mean: '%',
      wind_speed_10m_max: 'km/h',
    },
    daily: {
      time: ['2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02'],
      weather_code: [3, 61, 2, 3, 1],
      temperature_2m_min: [8, 7, 6, 7, 5],
      temperature_2m_max: [14, 12, 13, 11, 12],
      precipitation_probability_max: [20, 70, 30, 40, 10],
      relative_humidity_2m_mean: [70, 80, 65, 75, 60],
      wind_speed_10m_max: [20, 25, 18, 22, 15],
    },
  };
}
