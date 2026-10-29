/**
 * Scroll trigger for PageHeader's `condenseOnScroll`.
 *
 * ## Why a sentinel + IntersectionObserver
 *
 * Condensing SHRINKS the header, which pulls everything under it upward. A
 * trigger that reads the header's own size or position
 * (`scrollTop > header.offsetHeight`, observing the header itself) is moved by
 * that shrink and can un-condense itself. The sentinel is a zero-height sibling
 * placed immediately BEFORE the header, so it sits where the header's natural top
 * is and moves only with the scroll offset, never with the header's own size.
 *
 * The state is discrete (`data-condensed`), so it can be styled, asserted and
 * handed to a consumer. A CSS scroll-driven animation (`animation-timeline`) is
 * continuous — it has no "condensed" state to expose — so it was not used.
 *
 * ## Why two thresholds
 *
 * The sentinel is not moved by the shrink, but the SCROLL POSITION can be: the
 * content below the header moves up by the height the header lost, and a browser
 * with scroll anchoring (Chromium, measured here) answers by scrolling back by
 * the same amount — clamped at the top of the page. Condensing exactly at the
 * pin line would let that correction carry the scroll back across the line, the
 * header would expand, and the user's scroll would be yanked.
 *
 * So the header condenses only once the sentinel is a full header height PAST the
 * pin line (the shrink is always less than the header's height), and expands as
 * soon as the sentinel is back at the pin line. Any shift of up to one header
 * height after condensing leaves the sentinel still past the pin line. The state
 * between the two thresholds is "keep whatever it was".
 *
 * Pure DOM, no React: the component only wires this into an effect.
 */

/** The slice of `IntersectionObserverEntry` the trigger reads. */
export interface CondenseEntry {
  isIntersecting: boolean;
  boundingClientRect: { top: number };
  rootBounds: { top: number } | null;
}

/**
 * True once the sentinel has left the root through its TOP edge.
 *
 * `isIntersecting === false` alone is not enough: a header further down the page
 * than the first screen has a sentinel that is not intersecting because it is
 * still BELOW the root — nothing has scrolled past yet.
 */
export function hasScrolledPast(entry: CondenseEntry): boolean {
  return !entry.isIntersecting && entry.boundingClientRect.top < (entry.rootBounds?.top ?? 0);
}

/**
 * The hysteresis between the two thresholds: condensed once past the far one,
 * expanded once back before the near one, otherwise unchanged.
 */
export function nextCondensed(previous: boolean, pastPin: boolean, pastBand: boolean): boolean {
  if (pastBand) return true;
  if (!pastPin) return false;
  return previous;
}

/**
 * The element a `position: sticky` box sticks within: the nearest ancestor that
 * is a scroll container (`overflow` other than `visible`/`clip`), or `null` when
 * the window scrolls.
 */
export function findScrollParent(el: HTMLElement): HTMLElement | null {
  for (let node = el.parentElement; node && node !== document.body; node = node.parentElement) {
    const { overflowY } = getComputedStyle(node);
    if (overflowY !== 'visible' && overflowY !== 'clip') return node;
  }
  return null;
}

/**
 * Reports `true` when the header has condensed, `false` when it has expanded.
 * Returns the cleanup.
 *
 * The root edge is inset by the header's resolved `top` — `--bds-pageheader-top`
 * as set on an ancestor — so a header pinned below a shell top bar reaches its
 * pin line at the bar, not at the viewport edge behind it.
 */
export function observeCondense(
  sentinel: HTMLElement,
  header: HTMLElement,
  onChange: (condensed: boolean) => void,
): () => void {
  if (typeof IntersectionObserver === 'undefined') return () => {};

  let condensed = false;
  let pastPin = false;
  let pastBand = false;
  // Kept across reconnects: a resize while condensed must not shrink the band.
  let expandedHeight = 0;
  let observers: IntersectionObserver[] = [];

  const update = () => {
    const next = nextCondensed(condensed, pastPin, pastBand);
    if (next !== condensed) {
      condensed = next;
      onChange(next);
    }
  };

  /**
   * `inset` is how far below the root's top edge the line sits: the pin line is
   * `pinTop`, the far line is a header height ABOVE it — a negative inset, which
   * is a positive (outward) rootMargin. The sentinel leaves the root through that
   * line only once it is a full header height past the pin line.
   */
  const observeAt = (inset: number, onPast: (past: boolean) => void) => {
    const observer = new IntersectionObserver(
      (entries) => {
        const latest = entries[entries.length - 1];
        if (!latest) return;
        onPast(hasScrolledPast(latest));
        update();
      },
      { root: findScrollParent(header), rootMargin: `${-inset}px 0px 0px 0px`, threshold: 0 },
    );
    observer.observe(sentinel);
    observers.push(observer);
  };

  const connect = () => {
    observers.forEach((observer) => observer.disconnect());
    observers = [];
    const pinTop = parseFloat(getComputedStyle(header).top) || 0;
    if (header.getAttribute('data-condensed') !== 'true') {
      expandedHeight = Math.max(expandedHeight, header.getBoundingClientRect().height);
    }
    observeAt(pinTop, (past) => (pastPin = past));
    observeAt(pinTop - expandedHeight, (past) => (pastBand = past));
  };

  connect();
  // The pin offset can change with the viewport (a shell's top-bar height token).
  window.addEventListener('resize', connect);
  return () => {
    window.removeEventListener('resize', connect);
    observers.forEach((observer) => observer.disconnect());
  };
}
