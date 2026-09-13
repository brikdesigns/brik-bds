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
 *   count-up     — NOT rendered here yet (net-new primitive, #2532).
 *   animated-svg — NOT rendered here yet (AnimatedIcon rail decision, #2533).
 *
 * The two unbuilt values fall through to passthrough by design: this dispatcher
 * ships with the block that first adopts `marquee` (a component unreachable from
 * `BlueprintDispatcher` cannot ship, #2012), and each remaining value lands with
 * its own adopting block in its sub-issue. A block adopting the axis today sets
 * only `none` / `marquee`, so passthrough is never reached for an unbuilt value
 * in practice.
 *
 * **Reduced-motion-gated by construction** (AC): `marquee` inherits the
 * `Marquee` primitive's pure-CSS `@media (prefers-reduced-motion: reduce)` gate
 * (`components/ui/Marquee/Marquee.css`) — no JS, so an agent selecting a motion
 * value cannot ship un-gated motion. This mirrors `BlockReveal`'s CSS gate.
 *
 * The `bds-marquee*` classes are single-sourced in `Marquee.css` (→
 * `dist/styles.css`) so `canonical-class-check` sees them and the Astro rail can
 * emit the equivalent DOM (`_Marquee.astro`). `contentMotion: none` renders a
 * bare fragment, so adopting the axis changes no existing rendering.
 *
 * @summary Blueprint content-motion dispatcher — renders `marquee` through the `Marquee` primitive selected by the `contentMotion` axis, reduced-motion-gated by construction.
 */
import { type ReactNode } from 'react';

import { Marquee, type MarqueeProps } from '../../../components/ui/Marquee/Marquee';
import type { BlueprintContentMotion } from '../astro/types';

export interface BlockContentMotionProps {
  /** Which content-motion treatment the block renders with. See `BlueprintContentMotion`. Default `none`. */
  contentMotion?: BlueprintContentMotion;
  /** The content the motion treatment wraps — for `marquee`, the item strip the ticker scrolls. */
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
  // none / count-up / animated-svg — passthrough (the latter two render through
  // their own primitives once their sub-issues wire an adopting block, #2532/#2533).
  return <>{children}</>;
}

export default BlockContentMotion;
