/**
 * Overflow rule for a Breadcrumb trail (Carbon: "the first and last two page
 * links should be shown, but the remaining breadcrumbs in between are
 * condensed into an overflow menu"; on small viewports "start with the
 * overflow first, following by one breadcrumb").
 *
 * Pure so it can be tested without a layout engine: Breadcrumb measures the
 * natural widths once in a hidden pass and feeds them here, so the decision
 * never depends on what is currently rendered (no measure/collapse loop).
 */

/**
 * - `full` — every crumb.
 * - `collapsed` — first crumb, `…`, last two crumbs.
 * - `minimal` — `…`, last crumb.
 */
export type TrailLevel = 'full' | 'collapsed' | 'minimal';

export interface TrailMeasure {
  /** Natural width of each crumb, leading separator and per-crumb switcher included. */
  crumbs: number[];
  /** Width of the overflow button alone. */
  overflow: number;
  /** Width of one separator. */
  separator: number;
  /** Width of the trailing `options` switcher; 0 when there is none. */
  trailing: number;
  /** Gap between sibling flex children. */
  gap: number;
  /** Width the trail has to fit in. 0 means not measured yet. */
  available: number;
}

export function chooseTrailLevel({
  crumbs,
  overflow,
  separator,
  trailing,
  gap,
  available,
}: TrailMeasure): TrailLevel {
  const n = crumbs.length;
  // Unmeasured (SSR, first paint) or too few crumbs to fold: keep everything.
  // A lone long label is handled by its own ellipsis.
  if (available <= 0 || n < 3) return 'full';

  const tail = trailing > 0 ? gap + trailing : 0;
  const sum = (widths: number[]) => widths.reduce((total, w) => total + w, 0);

  const full = sum(crumbs) + gap * (n - 1) + tail;
  if (full <= available) return 'full';

  // With three crumbs "first and last two" is the whole trail — nothing to fold.
  if (n >= 4) {
    const collapsed =
      crumbs[0] + (separator + overflow) + crumbs[n - 2] + crumbs[n - 1] + gap * 3 + tail;
    if (collapsed <= available) return 'collapsed';
  }
  return 'minimal';
}
