import { describe, expect, it } from 'vitest';
import { formatEuro, parseBelgianAmount, parseReceiptAmount } from './money.js';

describe('parseBelgianAmount', () => {
  it('parses Belfius statement amounts', () => {
    expect(parseBelgianAmount('+ 697,58')).toBe(69758);
    expect(parseBelgianAmount('-   6,95')).toBe(-695);
    expect(parseBelgianAmount('+1.250,00')).toBe(125000);
    expect(parseBelgianAmount('-1.300,00')).toBe(-130000);
    expect(parseBelgianAmount('448,39')).toBe(44839);
  });
  it('rejects decimal points and garbage', () => {
    expect(() => parseBelgianAmount('4.20')).toThrow();
    expect(() => parseBelgianAmount('abc')).toThrow();
  });
});

describe('parseReceiptAmount', () => {
  it('parses Colruyt receipt amounts', () => {
    expect(parseReceiptAmount('242.68')).toBe(24268);
    expect(parseReceiptAmount('-1.39')).toBe(-139);
  });
});

describe('formatEuro', () => {
  it('formats the Belgian way with a non-breaking space', () => {
    expect(formatEuro(125000)).toBe('€\u00a01.250,00');
    expect(formatEuro(-695)).toBe('− €\u00a06,95');
    expect(formatEuro(5)).toBe('€\u00a00,05');
  });
});
