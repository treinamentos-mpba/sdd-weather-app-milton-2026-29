import { describe, expect, it } from 'vitest';
import { formatDayLabel, formatMetric } from '../../src/lib/format';

describe('formatDayLabel', () => {
  it.each([
    ['2026-10-29', 'qui., 29/10/2026'],
    ['2026-11-01', 'dom., 01/11/2026'],
    ['2027-01-01', 'sex., 01/01/2027'],
    ['2028-02-29', 'ter., 29/02/2028'],
  ])('preserva a data local %s', (date, label) => {
    expect(formatDayLabel(date)).toBe(label);
  });

  it.each([
    '2026-02-30',
    '2026-02-29',
    '2026-13-01',
    '',
    '29/10/2026',
  ])('rejeita data inválida %s sem normalização silenciosa', (date) => {
    expect(() => formatDayLabel(date)).toThrow(RangeError);
  });
});

describe('formatMetric', () => {
  it.each([
    [0, '%', '0 %'],
    [12.34, 'km/h', '12,3 km/h'],
    [1.25, 'mm', '1,3 mm'],
    [null, 'hPa', 'Sem dados'],
  ])('formata %s com unidade %s e tratamento de ausência', (value, suffix, expected) => {
    expect(formatMetric(value, suffix)).toBe(expected);
  });
});
