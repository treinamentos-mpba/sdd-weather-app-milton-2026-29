import type { LocalDate } from '../types/weather';

export function isLocalDate(value: unknown): value is LocalDate {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function fiveDates(start: LocalDate): LocalDate[] {
  if (!isLocalDate(start)) throw new RangeError('Data local inválida; esperado YYYY-MM-DD.');
  const first = Date.parse(`${start}T00:00:00Z`);
  return Array.from({ length: 5 }, (_, index) =>
    new Date(first + index * 86_400_000).toISOString().slice(0, 10),
  );
}

export function parseReferenceTime(value: unknown, timeZone: string | null): number | null {
  if (typeof value !== 'string') return null;
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?(Z|[+-]\d{2}:\d{2})?$/.exec(
    value,
  );
  if (
    !match ||
    !isLocalDate(match[1]) ||
    Number(match[2]) > 23 ||
    Number(match[3]) > 59 ||
    Number(match[4] ?? 0) > 59
  )
    return null;
  const localIso = `${match[1]}T${match[2]}:${match[3]}:${match[4] ?? '00'}`;
  if (match[5]) {
    const instant = Date.parse(localIso + match[5]);
    return Number.isFinite(instant) ? instant : null;
  }
  if (!timeZone) return null;

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });
  const localEpoch = (instant: number): number => {
    const parts = Object.fromEntries(
      formatter.formatToParts(instant).map(({ type, value: part }) => [type, part]),
    );
    return Date.parse(
      `${parts.year.padStart(4, '0')}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}Z`,
    );
  };
  const wallTime = Date.parse(`${localIso}Z`);
  const offsets = new Set<number>();
  // Amostra ambos os lados de transições; o round-trip rejeita lacunas e repetições.
  for (let hours = -48; hours <= 48; hours += 6) {
    const sample = wallTime + hours * 3_600_000;
    offsets.add(localEpoch(sample) - sample);
  }
  const candidates = [...offsets]
    .map((offset) => wallTime - offset)
    .filter((instant) => localEpoch(instant) === wallTime);
  return candidates.length === 1 ? candidates[0] : null;
}
