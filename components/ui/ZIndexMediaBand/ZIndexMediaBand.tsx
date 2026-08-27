import { type HTMLAttributes, type ReactNode, type ElementType } from 'react';
import { bdsClass } from '../../utils';
import './ZIndexMediaBand.css';

/**
 * Which edges carry a seam-fade gradient — the blend between this band and the
 * section above / below it. `'none'` (default) renders no seam layer.
 */
export type ZIndexMediaBandSeam = 'none' | 'top' | 'bottom' | 'both';

export interface ZIndexMediaBandProps extends HTMLAttributes<HTMLElement> {
  /**
   * Decorative layer content (`z-index: 0`) — an illustration, `<img>`, or a
   * `BackgroundPattern`. Rendered inside an `aria-hidden`, non-interactive
   * layer, so it never enters the accessibility tree or the tab order.
   *
   * The layer renders whether or not this slot is filled: with the slot empty
   * it paints `--bds-media-band-graphic` as a `background-image`, which is the
   * themeable per-client graphic-swap path.
   */
  graphic?: ReactNode;
  /** Band content (`z-index: 2`). Sits above the decorative layer. */
  children?: ReactNode;
  /**
   * Seam-fade edges. Default `'none'`. The gradient runs from
   * `--bds-media-band-seam-to` at the edge to `--bds-media-band-seam-from` at
   * `--bds-media-band-seam-height` inward, so the band dissolves into its
   * neighbour instead of butting against it.
   */
  seam?: ZIndexMediaBandSeam;
  /** HTML element to render as. Default `div` — pass `section` for a page band. */
  as?: ElementType;
}

/**
 * ZIndexMediaBand — stacking-context band with a decorative layer behind content.
 *
 * Owns the "decorative graphic behind content" recipe as one primitive instead
 * of a hand-rolled `position: relative` wrapper per consumer: a clipped,
 * positioned parent (`z-index: 1`), a decorative layer at `z-index: 0`, content
 * at `z-index: 2`, and an optional seam-fade at `z-index: 4`.
 *
 * Depth comes from gradients and token-driven scrims — never `mix-blend-mode`,
 * which is unpredictable across the light and dark themes.
 *
 * `overflow: clip` on the parent means a decorative layer may bleed past the
 * band's box without introducing a scroll container.
 *
 * Static by construction — no animation, no JS-driven motion — so the band
 * itself carries no `prefers-reduced-motion` concern and the graphic renders
 * at rest. Motion belongs to whatever the consumer slots into `graphic`, and
 * that content owns its own reduced-motion handling.
 *
 * @example
 * ```tsx
 * <ZIndexMediaBand as="section" seam="bottom" graphic={<BackgroundPattern fade />}>
 *   <SectionHeader title="How we work" />
 * </ZIndexMediaBand>
 *
 * // Graphic supplied by a client theme instead of a slot:
 * // .theme-acme { --bds-media-band-graphic: url('/acme/workflow.svg'); }
 * <ZIndexMediaBand as="section">…</ZIndexMediaBand>
 * ```
 *
 * @summary Stacking-context band — decorative graphic behind content
 */
export function ZIndexMediaBand({
  graphic,
  children,
  seam = 'none',
  as: Element = 'div',
  className,
  style,
  ...props
}: ZIndexMediaBandProps) {
  const hasTopSeam = seam === 'top' || seam === 'both';
  const hasBottomSeam = seam === 'bottom' || seam === 'both';

  return (
    <Element
      className={bdsClass('bds-z-index-media-band', className)}
      data-seam={seam === 'none' ? undefined : seam}
      style={style}
      {...props}
    >
      <div className="bds-z-index-media-band__graphic" aria-hidden="true">
        {graphic}
      </div>
      <div className="bds-z-index-media-band__content">{children}</div>
      {hasTopSeam && (
        <div className="bds-z-index-media-band__seam" data-edge="top" aria-hidden="true" />
      )}
      {hasBottomSeam && (
        <div className="bds-z-index-media-band__seam" data-edge="bottom" aria-hidden="true" />
      )}
    </Element>
  );
}

export default ZIndexMediaBand;
