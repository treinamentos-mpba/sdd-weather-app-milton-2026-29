import { isRecord, parseCity } from '../lib/validation';
import type { Result } from '../types/errors';
import type { CitySearchResult, RequestContext } from '../types/services';
import { fetchWithTimeout } from './http';

function normalizeCities(data: unknown): Result<CitySearchResult> {
  const invalid: Result<CitySearchResult> = {
    ok: false,
    error: {
      kind: 'invalid-response',
      service: 'geocoding',
      retryAtMs: null,
      status: null,
    },
  };
  if (!isRecord(data) || data.error === true) return invalid;
  if (data.results === undefined) {
    return { ok: true, value: { cities: [], partial: false } };
  }
  if (!Array.isArray(data.results)) return invalid;

  const cities = data.results.map(parseCity).filter((city) => city !== null);
  if (data.results.length > 0 && cities.length === 0) return invalid;
  return {
    ok: true,
    value: {
      cities: cities.slice(0, 10),
      partial: cities.length !== data.results.length,
    },
  };
}

export async function searchCities(
  query: string,
  context: RequestContext,
): Promise<Result<CitySearchResult>> {
  const name = query.trim();
  if (!name) return { ok: true, value: { cities: [], partial: false } };

  const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
  url.search = new URLSearchParams({
    name,
    count: '10',
    language: 'pt',
    format: 'json',
  }).toString();
  return fetchWithTimeout(url, 'geocoding', context, normalizeCities);
}
