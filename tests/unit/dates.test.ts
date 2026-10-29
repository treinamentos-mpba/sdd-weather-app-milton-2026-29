import { describe, expect, it } from 'vitest';
import { fiveDates, isLocalDate, parseReferenceTime } from '../../src/lib/dates';

describe('datas meteorológicas', () => {
  it('preserva calendário na virada do ano, sem usar o fuso do dispositivo', () => {
    expect(fiveDates('2026-12-30')).toEqual([
      '2026-12-30',
      '2026-12-31',
      '2027-01-01',
      '2027-01-02',
      '2027-01-03',
    ]);
    expect(isLocalDate('2026-02-30')).toBe(false);
    expect(() => fiveDates('2026-02-30')).toThrow(RangeError);
  });

  it.each([
    ['2026-10-29T13:00:00-03:00', null, '2026-10-29T16:00:00Z'],
    ['2026-10-29T14:00', 'Europe/Berlin', '2026-10-29T13:00:00Z'],
    ['2026-10-29T00:00', 'America/Bahia', '2026-10-29T03:00:00Z'],
    ['2026-07-01T10:15', 'Asia/Kathmandu', '2026-07-01T04:30:00Z'],
    ['2026-03-08T03:30', 'America/New_York', '2026-03-08T07:30:00Z'],
    ['2026-11-01T02:30', 'America/New_York', '2026-11-01T07:30:00Z'],
  ])('resolve %s em %s por correspondência única', (value, zone, expected) => {
    expect(parseReferenceTime(value, zone)).toBe(Date.parse(expected));
  });

  it.each([
    ['2026-03-08T02:30', 'America/New_York'],
    ['2026-11-01T01:30', 'America/New_York'],
    ['2026-04-05T01:45', 'Australia/Lord_Howe'],
    ['2011-12-30T12:00', 'Pacific/Apia'],
    ['2026-10-29T14:00', null],
    ['2026-02-30T12:00Z', null],
    ['2026-10-29T24:00Z', null],
    ['2026-10-29T12:60Z', null],
    ['inválido', null],
  ])('não inventa instante para referência inválida/ambígua %s', (value, zone) => {
    expect(parseReferenceTime(value, zone)).toBeNull();
  });
});
