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
 *   animated-svg — renders a Lottie icon through the `AnimatedIcon` primitive
 *                  (`bds-animated-icon`) from the `animatedIcon` prop's `src`.
 *                  `children` is the static fallback: rendered when no `src` is
 *                  supplied, AND it is what the Astro rail renders — `animated-svg`
 *                  is **React-rail-only** for the live animation (#2533, ADR-039).
 *
 * **Astro-rail decision (#2533).** `marquee` (pure CSS) and `count-up` (vanilla
 * JS) each ship an Astro twin partial, so both rails animate. `AnimatedIcon` is
 * Lottie/React-only — there is no pure-CSS or trivial-vanilla-JS twin, and an
 * Astro island would ship React + the Lottie runtime into every consumer's Astro
 * build for a decorative icon. So `animated-svg` is deliberately React-rail-only:
 * the Astro adopter renders the item's static icon (the same asset that IS the
 * reduced-motion state), documented in the adopting block rather than left a
 * silent two-rail divergence (#2344). This is the fidelity boundary ADR-039's
 * contract already names (`astro/types.ts` — "React/Lottie-only, no static
 * Astro-rail partial").
 *
 * **Reduced-motion-gated by construction** (AC): `marquee` inherits the
 * `Marquee` primitive's pure-CSS `@media (prefers-reduced-motion: reduce)` gate
 * (`components/ui/Marquee/Marquee.css`); `count-up`'s final value is its real
 * text and the sweep is a pure JS enhancement over it — no JS / reduced motion
 * leaves the static number; `animated-svg` inherits `AnimatedIcon`'s synchronous
 * `prefers-reduced-motion` gate (renders the first frame static, never autoplays).
 * So an agent selecting a motion value cannot ship un-gated motion. This mirrors
 * `BlockReveal`'s CSS gate.
 *
 * The `bds-marquee*` classes are single-sourced in `Marquee.css` (→
 * `dist/styles.css`) so `canonical-class-check` sees them and the Astro rail can
 * emit the equivalent DOM (`_Marquee.astro`). `contentMotion: none` renders a
 * bare fragment, so adopting the axis changes no existing rendering.
 *
 * @summary Blueprint content-motion dispatcher — renders `marquee` through the `Marquee` primitive selected by the `contentMotion` axis, reduced-motion-gated by construction.
 */
import { type ReactNode } from 'react';

import { AnimatedIcon, type AnimatedIconProps } from '../../../components/ui/AnimatedIcon/AnimatedIcon';
import { CountUp } from '../../../components/ui/CountUp/CountUp';
import { Marquee, type MarqueeProps } from '../../../components/ui/Marquee/Marquee';
import type { BlueprintContentMotion } from '../astro/types';

export interface BlockContentMotionProps {
  /** Which content-motion treatment the block renders with. See `BlueprintContentMotion`. Default `none`. */
  contentMotion?: BlueprintContentMotion;
  /**
   * The content the motion treatment wraps — for `marquee`, the item strip the
   * ticker scrolls; for `count-up`, the number to count to; for `animated-svg`,
   * the static fallback icon rendered when no `animatedIcon.src` is supplied and
   * on the Astro rail.
   */
  children: ReactNode;
  /**
   * Marquee tuning, forwarded only when `contentMotion === 'marquee'`. Omitted
   * → the `Marquee` primitive's own defaults (`ltr`, edge fade on, no pause).
   */
  marquee?: Pick<MarqueeProps, 'direction' | 'pauseOnHover' | 'fade' | 'gap' | 'logoHeight'>;
  /**
   * Lottie source + tuning, forwarded only when `contentMotion === 'animated-svg'`.
   * `src` is required to animate; omitted → the static `children` fallback renders
   * (the by-construction reduced-motion state). `AnimatedIcon` self-gates
   * `prefers-reduced-motion`. React-rail-only (see the module docstring).
   */
  animatedIcon?: Pick<AnimatedIconProps, 'src' | 'size' | 'trigger' | 'loop' | 'label'>;
}

export function BlockContentMotion({
  contentMotion = 'none',
  children,
  marquee,
  animatedIcon,
}: BlockContentMotionProps) {
  if (contentMotion === 'marquee') {
    return <Marquee {...marquee}>{children}</Marquee>;
  }
  if (contentMotion === 'count-up') {
    return <CountUp>{children}</CountUp>;
  }
  if (contentMotion === 'animated-svg') {
    // React-rail-only: animate through AnimatedIcon when a Lottie `src` is given,
    // else fall back to the static `children` (also what the Astro rail renders).
    return animatedIcon?.src ? <AnimatedIcon {...animatedIcon} /> : <>{children}</>;
  }
  // none — passthrough: the adopting block owns the static container.
  return <>{children}</>;
}

export default BlockContentMotion;
