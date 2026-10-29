import type { AppError } from './errors';
import type { City, WeatherData, WeatherLocation } from './weather';

export type SearchState =
  | { status: 'idle' }
  | { status: 'loading'; query: string }
  | { status: 'success'; query: string; cities: readonly City[]; partial: boolean }
  | { status: 'empty'; query: string }
  | { status: 'error'; query: string; error: AppError };

export type WeatherState =
  | { status: 'idle' }
  | { status: 'loading'; phase: 'location' }
  | {
      status: 'loading';
      phase: 'forecast';
      target: WeatherLocation;
      snapshot: WeatherData | null;
    }
  | { status: 'success'; target: WeatherLocation; snapshot: WeatherData }
  | {
      status: 'error';
      target: WeatherLocation | null;
      snapshot: WeatherData | null;
      error: AppError;
    };

export interface WeatherControllerState {
  search: SearchState;
  weather: WeatherState;
  geocodingBlockedUntilMs: number | null;
  forecastBlockedUntilMs: number | null;
}
