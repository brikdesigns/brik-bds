import { describe, expect, it } from 'vitest';
import { chooseTrailLevel, foldedCrumbs, type TrailMeasure } from './trailOverflow';

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

/** `pinned` flags for a trail of `n` crumbs with a switcher on each index in `on`. */
const switchersOn = (n: number, on: number[]) => Array.from({ length: n }, (_, i) => on.includes(i));

describe('foldedCrumbs', () => {
  it('folds the same crumbs as before for a trail with no switchers', () => {
    expect(foldedCrumbs(6, 'full')).toEqual([]);
    expect(foldedCrumbs(6, 'collapsed')).toEqual([1, 2, 3]);
    expect(foldedCrumbs(6, 'minimal')).toEqual([0, 1, 2, 3, 4]);
    expect(foldedCrumbs(6, 'minimal', switchersOn(6, []))).toEqual([0, 1, 2, 3, 4]);
    expect(foldedCrumbs(3, 'minimal')).toEqual([0, 1]);
  });

  it('never folds a crumb that carries a switcher', () => {
    expect(foldedCrumbs(5, 'collapsed', switchersOn(5, [1]))).toEqual([2]);
    expect(foldedCrumbs(5, 'minimal', switchersOn(5, [1]))).toEqual([0, 2, 3]);
    expect(foldedCrumbs(4, 'minimal', switchersOn(4, [0, 1, 2]))).toEqual([]);
  });
});

describe('chooseTrailLevel with per-crumb switchers', () => {
  it('keeps today\'s levels for a trail whose pinned flags are all false', () => {
    const none = { ...base, pinned: switchersOn(6, []) };
    expect(chooseTrailLevel({ ...none, available: 640 })).toBe('full');
    expect(chooseTrailLevel({ ...none, available: 639 })).toBe('collapsed');
    expect(chooseTrailLevel({ ...none, available: 368 })).toBe('collapsed');
    expect(chooseTrailLevel({ ...none, available: 367 })).toBe('minimal');
    expect(chooseTrailLevel({ ...none, crumbs: [100, 100, 100], pinned: switchersOn(3, []), available: 250 })).toBe('minimal');
  });

  it('never folds a three-crumb trail whose crumbs all carry a switcher (Companies / Company / Tab)', () => {
    const trail = { ...base, crumbs: [100, 100, 100], pinned: switchersOn(3, [0, 1, 2]) };
    expect(chooseTrailLevel({ ...trail, available: 250 })).toBe('full');
    expect(chooseTrailLevel({ ...trail, available: 120 })).toBe('full');
  });

  it('folds nothing on a four-crumb trail with switchers on crumbs 0, 1 and 2 (Companies / Company / Projects / Project)', () => {
    const trail = { ...base, crumbs: [100, 100, 100, 100], pinned: switchersOn(4, [0, 1, 2]) };
    expect(chooseTrailLevel({ ...trail, available: 300 })).toBe('full');
    expect(chooseTrailLevel({ ...trail, available: 120 })).toBe('full');
  });

  it('folds a switcher-less first crumb when that is what it takes', () => {
    // Full = 300 + 2*8 = 316. Folding Home: 32 + 100 + 100 + 2*8 = 248.
    const trail = { ...base, crumbs: [100, 100, 100], pinned: switchersOn(3, [1]) };
    expect(chooseTrailLevel({ ...trail, available: 316 })).toBe('full');
    expect(chooseTrailLevel({ ...trail, available: 250 })).toBe('minimal');
  });

  it('measures the kept switcher crumbs and one overflow button per folded run', () => {
    // A / B⌄ / C / D / E. Full = 500 + 4*8 = 532.
    // collapsed folds C: A + B + (12+32) + D + E + 4*8 = 476.
    // minimal folds A and C+D: 32 + B + (12+32) + E + 3*8 = 300.
    const trail = { ...base, crumbs: [100, 100, 100, 100, 100], pinned: switchersOn(5, [1]) };
    expect(chooseTrailLevel({ ...trail, available: 532 })).toBe('full');
    expect(chooseTrailLevel({ ...trail, available: 531 })).toBe('collapsed');
    expect(chooseTrailLevel({ ...trail, available: 476 })).toBe('collapsed');
    expect(chooseTrailLevel({ ...trail, available: 475 })).toBe('minimal');
    // Below that nothing more can fold: the kept labels ellipsise instead.
    expect(chooseTrailLevel({ ...trail, available: 100 })).toBe('minimal');
  });
});
