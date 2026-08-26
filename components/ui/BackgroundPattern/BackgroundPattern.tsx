import { type HTMLAttributes } from 'react';
import { bdsClass } from '../../utils';
import './BackgroundPattern.css';

/**
 * BackgroundPattern shape — the form axis (ADR-033 § 2: mutually exclusive
 * visual shape, no valence), so the prop is `variant` like Card / Skeleton /
 * ServiceTag.
 * - `dot-grid`  — radial-gradient dot lattice.
 * - `line-grid` — linear-gradient grid lines.
 */
export type BackgroundPatternVariant = 'dot-grid' | 'line-grid';

export interface BackgroundPatternProps extends HTMLAttributes<HTMLDivElement> {
  /** Pattern shape. Default `dot-grid`. */
  variant?: BackgroundPatternVariant;
  /**
   * Fade the pattern out toward the edges of its container via
   * `mask-image`. Default `false` (uniform coverage).
   */
  fade?: boolean;
}

/**
 * BackgroundPattern — decorative CSS-gradient texture layer.
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
 *   <BackgroundPattern variant="dot-grid" fade />
 *   <div style={{ position: 'relative', zIndex: 1 }}>Content</div>
 * </div>
 * ```
 *
 * @summary Decorative CSS-gradient background texture
 */
export function BackgroundPattern({
  variant = 'dot-grid',
  fade = false,
  className,
  style,
  ...props
}: BackgroundPatternProps) {
  return (
    <div
      className={bdsClass(
        'bds-background-pattern',
        `bds-background-pattern--variant-${variant}`,
        className
      )}
      data-fade={fade || undefined}
      aria-hidden="true"
      style={style}
      {...props}
    />
  );
}

export default BackgroundPattern;
