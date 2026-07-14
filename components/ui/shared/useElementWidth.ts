import { useEffect, useRef, useState, type RefObject } from 'react';

/**
 * Track an element's own inline (content-box) width via `ResizeObserver`.
 *
 * The mechanism behind own-width-responsive primitives (ADR-019): a component
 * collapses on *its own* width, not the viewport, so it behaves the same in a
 * sidebar, a card, or full-bleed. Prefer this over a viewport media query for
 * any BDS primitive whose layout should react to the space it is given.
 *
 * SSR-safe: `width` is `null` until the first observation (and where
 * `ResizeObserver` is unavailable), so callers render their expanded/default
 * layout on the first paint and collapse only once a real measurement lands.
 *
 * @returns `[ref, width]` — attach `ref` to the element to measure; `width` is
 * the observed inline width in px, or `null` before the first measurement.
 */
export function useElementWidth<T extends HTMLElement = HTMLElement>(): [
  RefObject<T>,
  number | null,
] {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // contentBoxSize is the spec path; fall back to contentRect for older engines.
        const inlineSize =
          entry.contentBoxSize?.[0]?.inlineSize ?? entry.contentRect.width;
        setWidth(inlineSize);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, width];
}
