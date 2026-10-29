import { describe, expect, it } from 'vitest';
import { formatDayLabel } from '../../src/lib/format';

describe('formatDayLabel', () => {
  it.each([
    ['2026-10-29', 'qui., 29/10/2026'],
    ['2026-11-01', 'dom., 01/11/2026'],
    ['2027-01-01', 'sex., 01/01/2027'],
  ])('preserva a data local %s', (date, label) => {
    expect(formatDayLabel(date)).toBe(label);
  });

  it.each([
    '2026-02-30',
    '2026-13-01',
    '',
    '29/10/2026',
  ])('rejeita data inválida %s sem normalização silenciosa', (date) => {
    expect(() => formatDayLabel(date)).toThrow(RangeError);
  });
});
