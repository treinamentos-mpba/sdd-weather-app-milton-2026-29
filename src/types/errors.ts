import type { EpochMs } from './weather';

export type ServiceName = 'geocoding' | 'forecast' | 'geolocation' | 'preferences';

export type ErrorKind =
  | 'network'
  | 'http'
  | 'timeout'
  | 'rate-limit'
  | 'invalid-response'
  | 'permission-denied'
  | 'unavailable'
  | 'storage-read'
  | 'storage-write'
  | 'storage-remove'
  | 'unexpected';

export interface AppError {
  kind: ErrorKind;
  service: ServiceName;
  retryAtMs: EpochMs | null;
  status: number | null;
}

export type Result<T> = { ok: true; value: T } | { ok: false; error: AppError };
