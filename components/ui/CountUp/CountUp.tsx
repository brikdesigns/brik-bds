import { type HTMLAttributes, type ReactNode, useEffect, useRef } from 'react';
import { bdsClass } from '../../utils';
import { animateCountUp } from './countUpDriver';
import './CountUp.css';

/** CountUp component props */
export interface CountUpProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * The final stat, rendered verbatim as the element's text. The driver counts
   * up to its numeric part while preserving any prefix/suffix/grouping —
   * `4,800+` counts to `4,800` and re-appends `+`, `98%` counts to `98%`. A
   * value with no number (`N/A`) renders static.
   */
  children: ReactNode;
}

/**
 * CountUp — a number that counts up to its final value when scrolled into view.
 *
 * The final value is the element's real text content, so with JS off, under
 * `prefers-reduced-motion: reduce`, or for an unparseable value it renders as a
 * plain static number — the animation is a pure enhancement on top (the same
 * by-construction gate `_Media.astro`'s `bg-video` uses). Duration and easing
 * come from `--bds-count-up-duration` / `--bds-count-up-ease` (token-backed:
 * `--duration-xl` / `--ease-out`), overridable per consumer.
 *
 * `tabular-nums` (in `CountUp.css`) holds the width steady as digits change, so
 * the surrounding layout does not jitter through the sweep.
 *
 * Distinct from `Counter`, the static numeric-count *indicator*: this is the
 * motion primitive behind the blueprint `contentMotion: count-up` axis value
 * (brik-bds#2529), not a badge.
 *
 * @example
 * ```tsx
 * <CountUp>4,800+</CountUp>
 * ```
 *
 * @summary A number that counts up into view, reduced-motion-gated by construction
 */
export function CountUp({ children, className, ...props }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    // The count fires once, when at least half the number is in view.
    // `animateCountUp` reads `prefers-reduced-motion` synchronously at that
    // moment and no-ops when reduced — so the reduced-motion gate has no stale
    // React-state window (see its docstring). Leaving the final value is the
    // safe default: it is already the DOM text.
    let cancel: (() => void) | undefined;
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            obs.disconnect();
            cancel = animateCountUp(el);
          }
        });
      },
      { threshold: 0.5 },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      cancel?.();
    };
  }, []);

  return (
    <span ref={ref} className={bdsClass('bds-count-up', className)} {...props}>
      {children}
    </span>
  );
}

export default CountUp;
