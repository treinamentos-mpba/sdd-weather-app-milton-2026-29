import type { LocalDate } from '../types/weather';
import { isLocalDate } from './dates';

const metricFormatter = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

export function formatMetric(value: number | null, suffix: string): string {
  return value === null ? 'Sem dados' : `${metricFormatter.format(value)} ${suffix}`;
}

const dayFormatter = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'short',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'UTC',
});

export function formatDayLabel(date: LocalDate): string {
  // UTC preserva os componentes da data local; não representa o instante do clima.
  const parsed = new Date(`${date}T00:00:00Z`);
  if (!isLocalDate(date)) {
    throw new RangeError('Data local inválida; esperado YYYY-MM-DD.');
  }
  return dayFormatter.format(parsed);
}
