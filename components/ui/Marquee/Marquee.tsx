import { type HTMLAttributes, type ReactNode, type CSSProperties } from 'react';
import { bdsClass } from '../../utils';
import './Marquee.css';

/** Scroll direction of the marquee track */
export type MarqueeDirection = 'ltr' | 'rtl';

/** Marquee component props */
export interface MarqueeProps extends HTMLAttributes<HTMLDivElement> {
  /** Item set to scroll — logos, badges, or any inline content. Rendered twice internally for a seamless loop. */
  children: ReactNode;
  /** Scroll direction. Default `'ltr'`. */
  direction?: MarqueeDirection;
  /** Pause the scroll animation on hover. Default `false`. */
  pauseOnHover?: boolean;
  /** Apply an edge fade mask (transparent → opaque → transparent). Default `true`. */
  fade?: boolean;
  /** Gap between items — any CSS length (`number` is treated as px). Overrides the `--bds-marquee-gap` default. */
  gap?: number | string;
  /** Height applied to `img`/`svg` item children — any CSS length (`number` is treated as px). Overrides the `--bds-marquee-logo-height` default. */
  logoHeight?: number | string;
}

/**
 * Marquee — seamless, accessible scrolling item ticker (logo band, trust strip).
 *
 * Renders `children` twice on a flex track; the animation scrolls the track
 * from 0 to -50% so the loop reads as continuous. The second copy is
 * `aria-hidden` so assistive tech only announces the item set once.
 *
 * Respects `prefers-reduced-motion: reduce` — the animation stops and the
 * track collapses to a single, centered, wrapped row instead of omitting
 * motion handling entirely.
 *
 * Item images/SVGs are the consumer's responsibility for `alt` text,
 * `loading="lazy"`, and pre-monochroming — Marquee does not apply a runtime
 * `grayscale()` filter.
 *
 * @example
 * ```tsx
 * <Marquee>
 *   <img src="/logos/acme.svg" alt="Acme Co." loading="lazy" />
 *   <img src="/logos/globex.svg" alt="Globex" loading="lazy" />
 * </Marquee>
 * ```
 *
 * @summary Seamless scrolling logo/item ticker
 */
export function Marquee({
  children,
  direction = 'ltr',
  pauseOnHover = false,
  fade = true,
  gap,
  logoHeight,
  className,
  style,
  ...props
}: MarqueeProps) {
  const classes = bdsClass('bds-marquee', className);

  // Runtime bindings the CSS consumes (gap/logoHeight from props). Defining
  // --bds-* custom properties inline is the sanctioned runtime escape hatch;
  // all static token consumption lives in Marquee.css.
  const marqueeStyle: CSSProperties = {
    ...style,
    ...(gap !== undefined && { '--bds-marquee-gap': typeof gap === 'number' ? `${gap}px` : gap }),
    ...(logoHeight !== undefined && {
      '--bds-marquee-logo-height': typeof logoHeight === 'number' ? `${logoHeight}px` : logoHeight,
    }),
  } as CSSProperties;

  return (
    <div
      className={classes}
      style={marqueeStyle}
      data-direction={direction}
      data-pause-on-hover={pauseOnHover || undefined}
      data-fade={fade || undefined}
      {...props}
    >
      <div className="bds-marquee__track">
        <div className="bds-marquee__group">{children}</div>
        <div className="bds-marquee__group" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Marquee;
