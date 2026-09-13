/**
 * count-up driver — the framework-agnostic parse + animate logic behind the
 * `CountUp` primitive (React) and `_CountUp.astro` partial (Astro rail).
 *
 * The React rail imports this module directly; the Astro rail cannot (a shipped
 * `.astro` partial must stay self-contained for consumer builds — the same
 * rationale `_Media.astro` states for duplicating `FrameRatio`), so it mirrors
 * this logic in `_CountUp.astro`'s processed `<script>`. This module is the
 * unit-tested source of truth for the parse + format contract both rails mirror;
 * keep that copy in sync with `parseCountUpValue` / `formatCountUp` here.
 *
 * **Reduced-motion + no-JS = the final number, by construction.** The DOM ships
 * the final value as real text; `animateCountUp` only ever *transiently* steps
 * it from 0 up to that value. If the driver never runs — JS off, reduced motion,
 * an unparseable value — the final number is already in the DOM (mirrors
 * `_Media.astro`'s "still state applies even if JS never arrives").
 */

/** The pieces of a stat string the driver animates around. */
export interface ParsedCountUp {
  /** Non-numeric lead — e.g. `$` in `$2M`. */
  readonly prefix: string;
  /** Non-numeric tail — e.g. `+` in `4,800+`, `%` in `98%`, `h` in `24h`. */
  readonly suffix: string;
  /** The numeric target the count sweeps up to. */
  readonly target: number;
  /** Fraction digits to hold constant while counting (`98.5%` → 1). */
  readonly decimals: number;
  /** Whether the source used thousands separators (`4,800` → group the sweep). */
  readonly useGrouping: boolean;
}

// The first numeric run in the string: an optional sign, digits with optional
// thousands commas, and an optional decimal part. Anything before it is prefix,
// anything after is suffix. No match → the value is not a count-up target.
const NUMERIC_RUN = /-?[\d,]*\.?\d+/;

/**
 * Split a stat string into its animatable parts. Returns `null` when there is
 * no number to count (e.g. `N/A`), which the caller treats as "render static".
 */
export function parseCountUpValue(raw: string): ParsedCountUp | null {
  const match = NUMERIC_RUN.exec(raw);
  if (!match) return null;

  const numStr = match[0];
  const prefix = raw.slice(0, match.index);
  const suffix = raw.slice(match.index + numStr.length);
  const target = parseFloat(numStr.replace(/,/g, ''));
  if (Number.isNaN(target)) return null;

  const dot = numStr.indexOf('.');
  const decimals = dot === -1 ? 0 : numStr.length - dot - 1;
  const useGrouping = numStr.includes(',');

  return { prefix, suffix, target, decimals, useGrouping };
}

/** Format an in-flight value back into the source's shape (prefix/suffix/grouping/decimals). */
export function formatCountUp(value: number, parsed: ParsedCountUp): string {
  const body = value.toLocaleString('en-US', {
    minimumFractionDigits: parsed.decimals,
    maximumFractionDigits: parsed.decimals,
    useGrouping: parsed.useGrouping,
  });
  return `${parsed.prefix}${body}${parsed.suffix}`;
}

/**
 * A cubic-bézier easing function `y(x)` for `x` in `[0, 1]`, so the count honours
 * the same curve as CSS `--ease-*` (default `--ease-out`). Newton–Raphson on the
 * x-polynomial, the standard closed approach; five iterations is ample for a
 * value tween. Mirrors what the browser does for a CSS `cubic-bezier()` timing.
 */
export function cubicBezier(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): (x: number) => number {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const slopeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

  return (x: number) => {
    let t = x;
    for (let i = 0; i < 5; i++) {
      const err = sampleX(t) - x;
      const d = slopeX(t);
      if (Math.abs(err) < 1e-4 || d === 0) break;
      t -= err / d;
    }
    return sampleY(t);
  };
}

/** `"500ms"` → 500, `"0.5s"` → 500. Falls back to 500 on an unreadable value. */
export function parseDurationMs(value: string): number {
  const v = value.trim();
  const n = parseFloat(v);
  if (Number.isNaN(n)) return 500;
  return v.endsWith('ms') ? n : v.endsWith('s') ? n * 1000 : n;
}

/** Parse a CSS `cubic-bezier(...)` / `linear` easing string into a `y(x)` function. */
export function parseEase(value: string): (t: number) => number {
  const bezier = /cubic-bezier\(\s*([\d.-]+)\s*,\s*([\d.-]+)\s*,\s*([\d.-]+)\s*,\s*([\d.-]+)\s*\)/.exec(value);
  if (bezier) {
    return cubicBezier(
      parseFloat(bezier[1]),
      parseFloat(bezier[2]),
      parseFloat(bezier[3]),
      parseFloat(bezier[4]),
    );
  }
  return (t) => t; // linear / unreadable → constant-rate sweep
}

/**
 * Sweep an element's text from 0 up to its own final value, reading duration +
 * easing from its `--bds-count-up-duration` / `--bds-count-up-ease` custom
 * properties (token-backed). The element's current `textContent` is the target;
 * the exact source string is restored verbatim when the sweep completes, so no
 * formatting round-trip can drift the final rendering.
 *
 * Returns a cancel function that stops the sweep and restores the final value —
 * call it on unmount / re-run.
 */
export function animateCountUp(el: HTMLElement): () => void {
  // Reduced motion → leave the final value (already the DOM text). Read
  // synchronously at call time, NOT via a React hook that starts `false` and
  // corrects a commit later — that stale-value window would let an
  // above-the-fold sweep start before the setting is read. This mirrors the
  // Astro rail's synchronous `matchMedia` guard (`_CountUp.astro`), so both
  // rails gate identically and the by-construction claim actually holds.
  if (
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return () => {};
  }

  const raw = el.textContent ?? '';
  const parsed = parseCountUpValue(raw);
  if (!parsed) return () => {};

  const styles = getComputedStyle(el);
  const durationMs = parseDurationMs(styles.getPropertyValue('--bds-count-up-duration'));
  const ease = parseEase(styles.getPropertyValue('--bds-count-up-ease'));

  let raf = 0;
  let startTs = 0;
  let cancelled = false;

  el.textContent = formatCountUp(0, parsed);

  const step = (ts: number) => {
    if (cancelled) return;
    if (!startTs) startTs = ts;
    const progress = durationMs <= 0 ? 1 : Math.min(1, (ts - startTs) / durationMs);
    if (progress < 1) {
      el.textContent = formatCountUp(parsed.target * ease(progress), parsed);
      raf = requestAnimationFrame(step);
    } else {
      el.textContent = raw; // restore the exact source string
    }
  };

  raf = requestAnimationFrame(step);

  return () => {
    cancelled = true;
    if (raf) cancelAnimationFrame(raf);
    el.textContent = raw;
  };
}
