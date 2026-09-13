/**
 * count-up driver contract test (brik-bds#2529). Covers the pure parse + format
 * + easing logic — the risky half that `_CountUp.astro`'s `<script>` twin
 * mirrors, so a drift in either rail's parsing is caught here. The DOM sweep
 * (`animateCountUp`) is exercised by the Storybook story, not this
 * node-environment test.
 */
import { describe, it, expect } from 'vitest';
import {
  parseCountUpValue,
  formatCountUp,
  cubicBezier,
  parseDurationMs,
  parseEase,
} from './countUpDriver';

describe('parseCountUpValue (#2529)', () => {
  it('parses a bare integer', () => {
    expect(parseCountUpValue('12')).toEqual({ prefix: '', suffix: '', target: 12, decimals: 0, useGrouping: false });
  });

  it('parses a grouped number with a suffix — 4,800+', () => {
    expect(parseCountUpValue('4,800+')).toEqual({ prefix: '', suffix: '+', target: 4800, decimals: 0, useGrouping: true });
  });

  it('parses a percentage — 98%', () => {
    expect(parseCountUpValue('98%')).toEqual({ prefix: '', suffix: '%', target: 98, decimals: 0, useGrouping: false });
  });

  it('parses a unit suffix — 24h', () => {
    expect(parseCountUpValue('24h')).toEqual({ prefix: '', suffix: 'h', target: 24, decimals: 0, useGrouping: false });
  });

  it('parses a currency prefix — $2M', () => {
    expect(parseCountUpValue('$2M')).toEqual({ prefix: '$', suffix: 'M', target: 2, decimals: 0, useGrouping: false });
  });

  it('preserves decimal places — 98.5%', () => {
    expect(parseCountUpValue('98.5%')).toEqual({ prefix: '', suffix: '%', target: 98.5, decimals: 1, useGrouping: false });
  });

  it('returns null for a value with no number (renders static)', () => {
    expect(parseCountUpValue('N/A')).toBeNull();
    expect(parseCountUpValue('—')).toBeNull();
  });
});

describe('formatCountUp (#2529)', () => {
  it('re-appends grouping + suffix mid-sweep', () => {
    const parsed = parseCountUpValue('4,800+')!;
    expect(formatCountUp(2400, parsed)).toBe('2,400+');
    expect(formatCountUp(4800, parsed)).toBe('4,800+');
  });

  it('holds decimal places constant', () => {
    const parsed = parseCountUpValue('98.5%')!;
    expect(formatCountUp(49.25, parsed)).toBe('49.3%'); // rounds to the fixed 1 dp
  });

  it('keeps prefix on a currency value', () => {
    const parsed = parseCountUpValue('$2M')!;
    expect(formatCountUp(1, parsed)).toBe('$1M');
  });
});

describe('cubicBezier (#2529)', () => {
  it('pins the endpoints', () => {
    const ease = cubicBezier(0.16, 1, 0.3, 1); // --ease-out
    expect(ease(0)).toBeCloseTo(0, 3);
    expect(ease(1)).toBeCloseTo(1, 3);
  });

  it('decelerates — --ease-out is past halfway by the time x is 0.5', () => {
    const ease = cubicBezier(0.16, 1, 0.3, 1);
    expect(ease(0.5)).toBeGreaterThan(0.5);
  });
});

describe('parseDurationMs (#2529)', () => {
  it('reads ms and s units', () => {
    expect(parseDurationMs('500ms')).toBe(500);
    expect(parseDurationMs('0.5s')).toBe(500);
  });

  it('falls back to 500 on an unreadable value', () => {
    expect(parseDurationMs('')).toBe(500);
  });
});

describe('parseEase (#2529)', () => {
  it('parses a cubic-bezier string into a working curve', () => {
    const ease = parseEase('cubic-bezier(0.16, 1, 0.3, 1)');
    expect(ease(0)).toBeCloseTo(0, 3);
    expect(ease(1)).toBeCloseTo(1, 3);
  });

  it('falls back to linear on an unreadable value', () => {
    const ease = parseEase('');
    expect(ease(0.5)).toBeCloseTo(0.5, 3);
  });
});
