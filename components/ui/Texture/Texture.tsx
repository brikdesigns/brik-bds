import { type HTMLAttributes } from 'react';
import { bdsClass } from '../../utils';
import './Texture.css';

/**
 * Texture shape — the form axis (ADR-033 § 2: mutually exclusive
 * visual shape, no valence), so the prop is `variant` like Card / Skeleton /
 * ServiceTag.
 * - `dot-grid`  — radial-gradient dot lattice.
 * - `line-grid` — linear-gradient grid lines.
 * - `diagonal`  — repeating-linear-gradient 45° slash hatch.
 */
export type TextureVariant = 'dot-grid' | 'line-grid' | 'diagonal';

export interface TextureProps extends HTMLAttributes<HTMLDivElement> {
  /** Pattern shape. Default `dot-grid`. */
  variant?: TextureVariant;
  /**
   * Fade the pattern out toward the edges of its container via
   * `mask-image`. Default `false` (uniform coverage).
   */
  fade?: boolean;
}

/**
 * Texture — decorative CSS-gradient texture layer.
 *
 * Absolutely positioned (`inset: 0; z-index: 0`) and non-interactive
 * (`pointer-events: none`) — place it as the first child of a
 * `position: relative` container, with real content stacked above it via
 * its own `position: relative; z-index: 1` (or higher).
 *
 * Static by construction — plain CSS gradients, no animation, no JS-driven
 * motion — so it carries no `prefers-reduced-motion` concern.
 *
 * @example
 * ```tsx
 * <div style={{ position: 'relative' }}>
 *   <Texture variant="dot-grid" fade />
 *   <div style={{ position: 'relative', zIndex: 1 }}>Content</div>
 * </div>
 * ```
 *
 * @summary Decorative CSS-gradient background texture
 */
export function Texture({
  variant = 'dot-grid',
  fade = false,
  className,
  style,
  ...props
}: TextureProps) {
  return (
    <div
      className={bdsClass(
        'bds-texture',
        `bds-texture--variant-${variant}`,
        // @deprecated marker for one minor: consumer selectors such as
        // `:not(.bds-background-pattern)` keep matching. Styles live on `.bds-texture`.
        'bds-background-pattern',
        className
      )}
      data-fade={fade || undefined}
      aria-hidden="true"
      style={style}
      {...props}
    />
  );
}

export default Texture;
