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
 * A crumb carrying its own switcher (two or more options) is never folded: the
 * overflow menu lists plain links, so folding it would drop the switcher. Only
 * switcher-less crumbs fold; when even that does not fit, the kept labels
 * shrink to their ellipsis instead (Breadcrumb.css). With no switchers the
 * three levels below are exactly Carbon's rule.
 *
 * - `full` — every crumb.
 * - `collapsed` — first crumb, `…`, last two crumbs (switcher crumbs in the
 *   middle stay, each folded run gets its own `…`).
 * - `minimal` — `…`, last crumb (switcher crumbs stay).
 */
export type TrailLevel = 'full' | 'collapsed' | 'minimal';

export interface TrailMeasure {
  /** Natural width of each crumb, leading separator and per-crumb switcher included. */
  crumbs: number[];
  /**
   * Per crumb, true when it carries a switcher with two or more options. Such a
   * crumb never folds. Omitted means no crumb does.
   */
  pinned?: boolean[];
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

/**
 * Indices of the crumbs a level folds into the overflow menu, ascending. The
 * last crumb and every pinned crumb always stay.
 */
export function foldedCrumbs(count: number, level: TrailLevel, pinned?: boolean[]): number[] {
  if (level === 'full') return [];
  // `collapsed` keeps the first and the last two; `minimal` keeps only the last.
  const first = level === 'collapsed' ? 1 : 0;
  const end = level === 'collapsed' ? count - 2 : count - 1;
  const folded: number[] = [];
  for (let i = first; i < end; i++) {
    if (!pinned?.[i]) folded.push(i);
  }
  return folded;
}

export function chooseTrailLevel({
  crumbs,
  pinned,
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

  // Rendered width with `folded` hidden: the kept crumbs, plus one overflow
  // button per run of consecutive folded crumbs (with its own separator unless
  // the run starts the trail), plus a gap between every pair of children.
  const width = (folded: number[]) => {
    const hidden = new Set(folded);
    let total = 0;
    let children = 0;
    for (let i = 0; i < n; i++) {
      if (!hidden.has(i)) {
        total += crumbs[i];
        children += 1;
      } else if (!hidden.has(i - 1)) {
        total += overflow + (i > 0 ? separator : 0);
        children += 1;
      }
    }
    return total + gap * (children - 1) + tail;
  };

  if (width([]) <= available) return 'full';

  // Each level folds a superset of the one before. A level that folds nothing
  // more is the same layout, so it is skipped — with three crumbs "first and
  // last two" is the whole trail, and an all-switcher trail never folds at all.
  let best: TrailLevel = 'full';
  let foldedCount = 0;
  for (const level of ['collapsed', 'minimal'] as const) {
    const folded = foldedCrumbs(n, level, pinned);
    if (folded.length === foldedCount) continue;
    best = level;
    foldedCount = folded.length;
    if (width(folded) <= available) return level;
  }
  // Nothing more can fold: the kept labels ellipsise.
  return best;
}
