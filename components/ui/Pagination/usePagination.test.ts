/**
 * usePagination unit tests.
 *
 * The `components` vitest project runs in a node environment (no DOM), so —
 * as with useAddableList — we cover the exported pure decisions the hook is
 * built from. The state wiring is covered by the Pagination story play tests.
 */
import { describe, it, expect } from 'vitest';
import { clampPage, getTotalPages } from './usePagination';

describe('getTotalPages', () => {
  it('rounds a partial last page up', () => {
    expect(getTotalPages(240, 25)).toBe(10);
    expect(getTotalPages(251, 25)).toBe(11);
  });

  it('never drops below 1 for an empty or negative set', () => {
    expect(getTotalPages(0, 25)).toBe(1);
    expect(getTotalPages(-5, 25)).toBe(1);
  });

  it('guards a zero page size', () => {
    expect(getTotalPages(10, 0)).toBe(10);
  });
});

describe('clampPage', () => {
  it('keeps an in-range page', () => {
    expect(clampPage(3, 10)).toBe(3);
  });

  it('pulls a page past the end back to the last page', () => {
    expect(clampPage(12, 10)).toBe(10);
  });

  it('lifts a page below 1', () => {
    expect(clampPage(0, 10)).toBe(1);
    expect(clampPage(-2, 10)).toBe(1);
  });

  it('treats NaN as page 1', () => {
    expect(clampPage(Number.NaN, 10)).toBe(1);
  });
});
