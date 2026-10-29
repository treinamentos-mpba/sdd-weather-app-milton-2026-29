export type Unit = 'celsius' | 'fahrenheit';
// Aliases documentam o domínio; validação em runtime pertence à fronteira de dados.
export type LocalDate = string;
export type EpochMs = number;
export type IanaTimeZone = string;

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface CityIdentity {
  name: string;
  region: string | null;
  country: string | null;
}

export interface City extends CityIdentity {
  id: number;
  coordinates: Coordinates;
  timeZone: IanaTimeZone | null;
}

export type WeatherLocation =
  | { kind: 'city'; city: City }
  | { kind: 'device'; coordinates: Coordinates };

export type WeatherCode =
  | 0
  | 1
  | 2
  | 3
  | 45
  | 48
  | 51
  | 53
  | 55
  | 56
  | 57
  | 61
  | 63
  | 65
  | 66
  | 67
  | 71
  | 73
  | 75
  | 77
  | 80
  | 81
  | 82
  | 85
  | 86
  | 95
  | 96
  | 99;

export interface CurrentWeather {
  temperatureC: number | null;
  apparentTemperatureC: number | null;
  weatherCode: WeatherCode | null;
  relativeHumidityPct: number | null;
  windSpeedKmh: number | null;
  precipitationMm: number | null;
  // Pressão reduzida ao nível do mar, não pressão de superfície.
  pressureMslHpa: number | null;
  // Referência do dado do modelo, não medição observada nem conclusão da consulta.
  referenceTimeMs: EpochMs | null;
}

export interface ForecastDay {
  date: LocalDate;
  // Condição mais severa prevista para o dia, segundo o provedor.
  weatherCode: WeatherCode | null;
  minTemperatureC: number | null;
  maxTemperatureC: number | null;
  maxPrecipitationProbabilityPct: number | null;
  meanRelativeHumidityPct: number | null;
  // Vento máximo a 10 m, não rajada.
  maxWindSpeedKmh: number | null;
}

export interface WeatherData {
  location: WeatherLocation;
  timeZone: IanaTimeZone | null;
  periodStart: LocalDate | null;
  current: CurrentWeather | null;
  // Cinco dias normalizados ou [] quando não há período local confiável.
  forecast: readonly ForecastDay[];
  completedAtMs: EpochMs;
  partial: boolean;
}

export interface Preferences {
  city?: CityIdentity;
  unit?: Unit;
}
