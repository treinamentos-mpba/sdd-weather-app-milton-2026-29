import type { City, EpochMs } from './weather';

export interface RequestContext {
  signal: AbortSignal;
  now: () => EpochMs;
}

export interface CitySearchResult {
  cities: readonly City[];
  partial: boolean;
}
