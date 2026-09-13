/**
 * BlockContentMotion — the shared content-motion dispatcher for the blueprint
 * motion axis (ADR-039 §Decision 2, brik-bds#2529). The content half of the
 * axis; `BlockReveal` is the block-entrance half.
 *
 * `contentMotion` is a curated closed union (`none | marquee | count-up |
 * animated-svg`). An agent selects a value and this dispatcher renders its
 * children through the matching motion primitive — a blueprint never hand-rolls
 * a `@keyframes` or an inline `animation:`.
 *
 *   none         — passthrough: the adopting block owns the static container
 *                  (the default; existing rendering unchanged).
 *   marquee      — wraps children in the `Marquee` primitive (`bds-marquee*`),
 *                  a seamless scrolling ticker, reduced-motion-gated by that
 *                  component (the track stops and wraps under
 *                  `prefers-reduced-motion: reduce`).
 *   count-up     — wraps its child number in the `CountUp` primitive
 *                  (`bds-count-up`), which counts up to the final value when
 *                  scrolled into view. The final number IS the DOM text, so with
 *                  JS off / under reduced motion it renders static (#2532).
 *   animated-svg — NOT rendered here yet (AnimatedIcon rail decision, #2533).
 *
 * The one remaining unbuilt value falls through to passthrough by design: this
 * dispatcher shipped with the block that first adopts `marquee` (a component
 * unreachable from `BlueprintDispatcher` cannot ship, #2012), and each value
 * lands with its own adopting block in its sub-issue (`count-up` → StatsDarkBar,
 * #2532). A block adopting the axis sets only values it renders, so passthrough
 * is never reached for `animated-svg` in practice.
 *
 * **Reduced-motion-gated by construction** (AC): `marquee` inherits the
 * `Marquee` primitive's pure-CSS `@media (prefers-reduced-motion: reduce)` gate
 * (`components/ui/Marquee/Marquee.css`); `count-up`'s final value is its real
 * text and the sweep is a pure JS enhancement over it — no JS / reduced motion
 * leaves the static number. So an agent selecting a motion value cannot ship
 * un-gated motion. This mirrors `BlockReveal`'s CSS gate.
 *
 * The `bds-marquee*` classes are single-sourced in `Marquee.css` (→
 * `dist/styles.css`) so `canonical-class-check` sees them and the Astro rail can
 * emit the equivalent DOM (`_Marquee.astro`). `contentMotion: none` renders a
 * bare fragment, so adopting the axis changes no existing rendering.
 *
 * @summary Blueprint content-motion dispatcher — renders `marquee` through the `Marquee` primitive selected by the `contentMotion` axis, reduced-motion-gated by construction.
 */
import { type ReactNode } from 'react';

import { CountUp } from '../../../components/ui/CountUp/CountUp';
import { Marquee, type MarqueeProps } from '../../../components/ui/Marquee/Marquee';
import type { BlueprintContentMotion } from '../astro/types';

export interface BlockContentMotionProps {
  /** Which content-motion treatment the block renders with. See `BlueprintContentMotion`. Default `none`. */
  contentMotion?: BlueprintContentMotion;
  /** The content the motion treatment wraps — for `marquee`, the item strip the ticker scrolls; for `count-up`, the number to count to. */
  children: ReactNode;
  /**
   * Marquee tuning, forwarded only when `contentMotion === 'marquee'`. Omitted
   * → the `Marquee` primitive's own defaults (`ltr`, edge fade on, no pause).
   */
  marquee?: Pick<MarqueeProps, 'direction' | 'pauseOnHover' | 'fade' | 'gap' | 'logoHeight'>;
}

export function BlockContentMotion({ contentMotion = 'none', children, marquee }: BlockContentMotionProps) {
  if (contentMotion === 'marquee') {
    return <Marquee {...marquee}>{children}</Marquee>;
  }
  if (contentMotion === 'count-up') {
    return <CountUp>{children}</CountUp>;
  }
  // none / animated-svg — passthrough (animated-svg renders through its own
  // primitive once its sub-issue wires an adopting block, #2533).
  return <>{children}</>;
}

export default BlockContentMotion;
