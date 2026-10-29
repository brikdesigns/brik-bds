/**
 * Pure trigger logic for PageHeader's `condenseOnScroll`. The DOM wiring
 * (sentinel + IntersectionObserver, scroll-parent lookup) is asserted in a real
 * browser by PageHeader.condense.browser.test.ts — node has no layout.
 */
import { describe, it, expect } from 'vitest';
import { hasScrolledPast, nextCondensed } from './condenseOnScroll';

const root = { top: 0 };

describe('hasScrolledPast', () => {
  it('is false while the sentinel is inside the root', () => {
    expect(hasScrolledPast({ isIntersecting: true, boundingClientRect: { top: 40 }, rootBounds: root })).toBe(false);
  });

  it('is true once the sentinel has left through the top edge', () => {
    expect(hasScrolledPast({ isIntersecting: false, boundingClientRect: { top: -1 }, rootBounds: root })).toBe(true);
  });

  it('is false when the sentinel is not intersecting because it is still BELOW the root', () => {
    // A header further down the page than the first screen — not yet reached.
    expect(hasScrolledPast({ isIntersecting: false, boundingClientRect: { top: 900 }, rootBounds: root })).toBe(false);
  });

  it('measures against the root edge, which already includes the pin offset', () => {
    // rootMargin `-64px` puts the root edge at 64; a sentinel at 50 has passed it.
    expect(
      hasScrolledPast({ isIntersecting: false, boundingClientRect: { top: 50 }, rootBounds: { top: 64 } }),
    ).toBe(true);
  });

  it('treats a missing rootBounds (cross-origin frame) as a root edge at 0', () => {
    expect(hasScrolledPast({ isIntersecting: false, boundingClientRect: { top: -10 }, rootBounds: null })).toBe(true);
    expect(hasScrolledPast({ isIntersecting: false, boundingClientRect: { top: 10 }, rootBounds: null })).toBe(false);
  });
});

describe('nextCondensed — the hysteresis between the pin line and the far threshold', () => {
  it('condenses once past the far threshold, whatever it was before', () => {
    expect(nextCondensed(false, true, true)).toBe(true);
    expect(nextCondensed(true, true, true)).toBe(true);
  });

  it('expands once back before the pin line, whatever it was before', () => {
    expect(nextCondensed(true, false, false)).toBe(false);
    expect(nextCondensed(false, false, false)).toBe(false);
  });

  it('keeps its state between the two — a shrink-induced scroll shift cannot flip it', () => {
    expect(nextCondensed(true, true, false)).toBe(true);
    expect(nextCondensed(false, true, false)).toBe(false);
  });
});
