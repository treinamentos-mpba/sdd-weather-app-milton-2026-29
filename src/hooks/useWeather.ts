import { useCallback, useEffect, useReducer, useRef } from 'react';
import { getServiceErrorMessage } from '../lib/errors';
import { fetchWeather, searchCities } from '../services/weatherService';
import type { AppError, Result } from '../types/errors';
import type { RequestContext } from '../types/services';
import type { City, WeatherLocation } from '../types/weather';
import { initialWeatherState, weatherReducer } from './weatherReducer';

type Operation =
  | { kind: 'search'; query: string; failed: boolean }
  | { kind: 'weather'; city: City; failed: boolean };

interface Pending {
  key: string;
  controller: AbortController;
}

export default function useWeather() {
  const [state, dispatch] = useReducer(weatherReducer, initialWeatherState);
  const pendingSearch = useRef<Pending | null>(null);
  const pendingWeather = useRef<Pending | null>(null);
  const lastOperation = useRef<Operation | null>(null);
  const blockedUntil = useRef<{ search: number | null; weather: number | null }>({
    search: null,
    weather: null,
  });
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      pendingSearch.current?.controller.abort();
      pendingWeather.current?.controller.abort();
      pendingSearch.current = null;
      pendingWeather.current = null;
    };
  }, []);

  const run = useCallback(
    async <T>(
      operation: Operation,
      key: string,
      request: (context: RequestContext) => Promise<Result<T>>,
      start: () => void,
      accept: (value: T) => void,
      fail: (error: AppError) => void,
    ) => {
      const pending = operation.kind === 'search' ? pendingSearch : pendingWeather;
      const deadline = blockedUntil.current[operation.kind];
      if (
        !mounted.current ||
        pending.current?.key === key ||
        (deadline !== null && deadline > Date.now())
      )
        return;
      pending.current?.controller.abort();
      const active: Pending = { key, controller: new AbortController() };
      pending.current = active;
      lastOperation.current = operation;
      start();
      const isCurrent = () =>
        mounted.current && pending.current === active && !active.controller.signal.aborted;
      try {
        const result = await request({ signal: active.controller.signal, now: Date.now });
        if (!isCurrent()) return;
        if (result.ok) {
          accept(result.value);
        } else {
          operation.failed = true;
          blockedUntil.current[operation.kind] = result.error.retryAtMs;
          fail(result.error);
        }
      } catch {
        if (!isCurrent()) return;
        operation.failed = true;
        const service = operation.kind === 'search' ? 'geocoding' : 'forecast';
        console.error(`Falha assíncrona inesperada: unexpected/${service}.`);
        fail({ kind: 'unexpected', service, status: null, retryAtMs: null });
      } finally {
        if (pending.current === active) pending.current = null;
      }
    },
    [],
  );

  const search = useCallback(
    async (name: string) => {
      const query = name.trim();
      if (!query) return;
      await run(
        { kind: 'search', query, failed: false },
        query,
        (context) => searchCities(query, context),
        () => dispatch({ type: 'search-start', query }),
        (result) => dispatch({ type: 'search-success', query, result }),
        (error) => dispatch({ type: 'search-error', query, error }),
      );
    },
    [run],
  );

  const selectCity = useCallback(
    async (city: City) => {
      const target: WeatherLocation = { kind: 'city', city };
      await run(
        { kind: 'weather', city, failed: false },
        String(city.id),
        (context) => fetchWeather(target, context),
        () => dispatch({ type: 'weather-start', target }),
        (data) =>
          dispatch({
            type: 'weather-success',
            target,
            data: { ...data, completedAtMs: Date.now() },
          }),
        (error) => dispatch({ type: 'weather-error', target, error }),
      );
    },
    [run],
  );

  const retry = useCallback(async () => {
    const operation = lastOperation.current;
    if (!operation?.failed) return;
    if (operation.kind === 'search') await search(operation.query);
    else await selectCity(operation.city);
  }, [search, selectCity]);

  const searchError = state.search.status === 'error' ? state.search.error : null;
  const weatherError = state.weather.status === 'error' ? state.weather.error : null;
  const data = 'snapshot' in state.weather ? state.weather.snapshot : null;
  return {
    state,
    searchState: state.search,
    weatherState: state.weather,
    geocodingBlockedUntilMs: state.geocodingBlockedUntilMs,
    forecastBlockedUntilMs: state.forecastBlockedUntilMs,
    data,
    cities: state.search.status === 'success' ? state.search.cities : [],
    query: 'query' in state.search ? state.search.query : '',
    searchError,
    weatherError,
    searchErrorMessage: searchError ? getServiceErrorMessage(searchError) : null,
    weatherErrorMessage: weatherError ? getServiceErrorMessage(weatherError) : null,
    search,
    selectCity,
    retry,
  };
}
