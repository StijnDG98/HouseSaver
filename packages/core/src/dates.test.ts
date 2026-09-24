import { describe, expect, it } from 'vitest';
import { daysBetween, parseBelgianDate, parseShortBelgianDate } from './dates.js';

describe('dates', () => {
  it('parses statement and receipt dates', () => {
    expect(parseBelgianDate('14-08-2026')).toBe('2026-08-14');
    expect(parseBelgianDate('10/08/2026')).toBe('2026-08-10');
    expect(parseShortBelgianDate('18/07/26')).toBe('2026-07-18');
  });
  it('computes booking lag', () => {
    expect(daysBetween('2026-07-18', '2026-07-20')).toBe(2);
  });
});
