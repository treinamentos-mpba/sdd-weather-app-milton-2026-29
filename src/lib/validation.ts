import type { City } from '../types/weather';

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function optionalText(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function optionalTimeZone(value: unknown): string | null {
  const timeZone = optionalText(value);
  if (!timeZone || /^[+-]/.test(timeZone)) return null;

  try {
    new Intl.DateTimeFormat('pt-BR', { timeZone });
    return timeZone;
  } catch (error) {
    if (error instanceof RangeError) return null;
    throw error;
  }
}

export function parseCity(value: unknown): City | null {
  if (
    !isRecord(value) ||
    typeof value.id !== 'number' ||
    !Number.isSafeInteger(value.id) ||
    value.id <= 0 ||
    typeof value.name !== 'string' ||
    !value.name.trim() ||
    typeof value.latitude !== 'number' ||
    !Number.isFinite(value.latitude) ||
    Math.abs(value.latitude) > 90 ||
    typeof value.longitude !== 'number' ||
    !Number.isFinite(value.longitude) ||
    Math.abs(value.longitude) > 180
  ) {
    return null;
  }

  return {
    id: value.id,
    name: value.name.trim(),
    region: optionalText(value.admin1),
    country: optionalText(value.country),
    coordinates: { latitude: value.latitude, longitude: value.longitude },
    timeZone: optionalTimeZone(value.timezone),
  };
}
