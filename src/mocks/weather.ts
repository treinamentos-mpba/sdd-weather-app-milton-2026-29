import type { WeatherData } from '../types/weather';

// Dados ilustrativos fixos para desenvolvimento da UI, não uma previsão real.
export const mockWeatherData: WeatherData = {
  location: {
    kind: 'city',
    city: {
      id: 3450554,
      name: 'Salvador',
      region: 'Bahia',
      country: 'Brasil',
      coordinates: {
        latitude: -12.9714,
        longitude: -38.5014,
      },
      timeZone: 'America/Bahia',
    },
  },
  timeZone: 'America/Bahia',
  periodStart: '2026-10-29',
  current: {
    temperatureC: 28.4,
    apparentTemperatureC: 30.2,
    weatherCode: 2,
    relativeHumidityPct: 72,
    windSpeedKmh: 18.5,
    referenceTimeMs: Date.parse('2026-10-29T14:00:00-03:00'),
  },
  forecast: [
    {
      date: '2026-10-29',
      weatherCode: 2,
      minTemperatureC: 24.1,
      maxTemperatureC: 29.8,
      maxPrecipitationProbabilityPct: 20,
      meanRelativeHumidityPct: 74,
      maxWindSpeedKmh: 22,
    },
    {
      date: '2026-10-30',
      weatherCode: 61,
      minTemperatureC: 23.8,
      maxTemperatureC: 28.2,
      maxPrecipitationProbabilityPct: 70,
      meanRelativeHumidityPct: 82,
      maxWindSpeedKmh: 25,
    },
    {
      date: '2026-10-31',
      weatherCode: 3,
      minTemperatureC: 24,
      maxTemperatureC: 28.9,
      maxPrecipitationProbabilityPct: 40,
      meanRelativeHumidityPct: 78,
      maxWindSpeedKmh: 20,
    },
    {
      date: '2026-11-01',
      weatherCode: 1,
      minTemperatureC: 24.3,
      maxTemperatureC: 30.1,
      maxPrecipitationProbabilityPct: 10,
      meanRelativeHumidityPct: 70,
      maxWindSpeedKmh: 19,
    },
    {
      date: '2026-11-02',
      weatherCode: 0,
      minTemperatureC: 24.5,
      maxTemperatureC: 30.6,
      maxPrecipitationProbabilityPct: 0,
      meanRelativeHumidityPct: 68,
      maxWindSpeedKmh: 21,
    },
  ],
  completedAtMs: Date.parse('2026-10-29T14:05:00-03:00'),
  partial: false,
};
