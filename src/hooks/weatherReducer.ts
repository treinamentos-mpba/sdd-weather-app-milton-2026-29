import type { AppError } from '../types/errors';
import type { CitySearchResult } from '../types/services';
import type { WeatherControllerState, WeatherState } from '../types/state';
import type { WeatherData, WeatherLocation } from '../types/weather';

export type WeatherAction =
  | { type: 'search-start'; query: string }
  | { type: 'search-success'; query: string; result: CitySearchResult }
  | { type: 'search-error'; query: string; error: AppError }
  | { type: 'weather-start'; target: WeatherLocation }
  | { type: 'weather-success'; target: WeatherLocation; data: WeatherData }
  | { type: 'weather-error'; target: WeatherLocation; error: AppError };

export const initialWeatherState: WeatherControllerState = {
  search: { status: 'idle' },
  weather: { status: 'idle' },
  geocodingBlockedUntilMs: null,
  forecastBlockedUntilMs: null,
};

function snapshotFor(state: WeatherState, target: WeatherLocation): WeatherData | null {
  if (!('target' in state) || !state.target || !state.snapshot) return null;
  const previous = state.target;
  const same =
    previous.kind === 'city' && target.kind === 'city'
      ? previous.city.id === target.city.id
      : previous.kind === 'device' &&
        target.kind === 'device' &&
        previous.coordinates.latitude === target.coordinates.latitude &&
        previous.coordinates.longitude === target.coordinates.longitude;
  return same ? state.snapshot : null;
}

export function weatherReducer(
  state: WeatherControllerState,
  action: WeatherAction,
): WeatherControllerState {
  switch (action.type) {
    case 'search-start':
      return { ...state, search: { status: 'loading', query: action.query } };
    case 'search-success':
      return {
        ...state,
        search: action.result.cities.length
          ? { status: 'success', query: action.query, ...action.result }
          : { status: 'empty', query: action.query },
      };
    case 'search-error':
      return {
        ...state,
        search: { status: 'error', query: action.query, error: action.error },
        geocodingBlockedUntilMs: action.error.retryAtMs,
      };
    case 'weather-start':
      return {
        ...state,
        weather: {
          status: 'loading',
          phase: 'forecast',
          target: action.target,
          snapshot: snapshotFor(state.weather, action.target),
        },
      };
    case 'weather-success':
      return {
        ...state,
        weather: { status: 'success', target: action.target, snapshot: action.data },
      };
    case 'weather-error':
      return {
        ...state,
        weather: {
          status: 'error',
          target: action.target,
          error: action.error,
          snapshot: snapshotFor(state.weather, action.target),
        },
        forecastBlockedUntilMs: action.error.retryAtMs,
      };
  }
}
