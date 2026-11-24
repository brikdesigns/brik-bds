import { describe, expect, it } from 'vitest';
import { chooseTrailLevel, type TrailMeasure } from './trailOverflow';

/* Six crumbs of 100px (separator included), an 8px gap, a 32px overflow
 * button with a 12px separator. Full trail = 6*100 + 5*8 = 640. */
const base: TrailMeasure = {
  crumbs: [100, 100, 100, 100, 100, 100],
  overflow: 32,
  separator: 12,
  trailing: 0,
  gap: 8,
  available: 1000,
};

describe('chooseTrailLevel', () => {
  it('keeps the full trail when it fits', () => {
    expect(chooseTrailLevel(base)).toBe('full');
    expect(chooseTrailLevel({ ...base, available: 640 })).toBe('full');
  });

  it('folds the middle (first + … + last two) when the full trail does not fit', () => {
    // 100 + (12+32) + 100 + 100 + 3*8 = 368
    expect(chooseTrailLevel({ ...base, available: 639 })).toBe('collapsed');
    expect(chooseTrailLevel({ ...base, available: 368 })).toBe('collapsed');
  });

  it('falls to … + last when even the folded trail does not fit', () => {
    expect(chooseTrailLevel({ ...base, available: 367 })).toBe('minimal');
    expect(chooseTrailLevel({ ...base, available: 120 })).toBe('minimal');
  });

  it('counts the trailing switcher against the budget', () => {
    expect(chooseTrailLevel({ ...base, trailing: 40, available: 640 })).toBe('collapsed');
    expect(chooseTrailLevel({ ...base, trailing: 40, available: 688 })).toBe('full');
  });

  it('never folds a trail that fits, however many crumbs', () => {
    expect(chooseTrailLevel({ ...base, crumbs: [50, 50, 50], available: 200 })).toBe('full');
  });

  it('goes straight to … + last for a three-crumb trail that overflows (nothing to keep but the ends)', () => {
    expect(chooseTrailLevel({ ...base, crumbs: [100, 100, 100], available: 250 })).toBe('minimal');
  });

  it('leaves one- and two-crumb trails to the label ellipsis', () => {
    expect(chooseTrailLevel({ ...base, crumbs: [300], available: 100 })).toBe('full');
    expect(chooseTrailLevel({ ...base, crumbs: [300, 300], available: 100 })).toBe('full');
  });

  it('stays full before anything has been measured (SSR / first paint)', () => {
    expect(chooseTrailLevel({ ...base, available: 0 })).toBe('full');
  });
});
