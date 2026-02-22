import { type HTMLAttributes, type CSSProperties } from 'react';
import { bdsClass } from '../../utils';

/**
 * Skeleton shape variants
 */
export type SkeletonVariant = 'text' | 'circular' | 'rectangular';

/**
 * Skeleton component props
 */
export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Shape variant */
  variant?: SkeletonVariant;
  /** Width (CSS value or number for px) */
  width?: string | number;
  /** Height (CSS value or number for px) */
  height?: string | number;
}

/**
 * Shimmer animation keyframes
 * Matches existing BDS pattern from css/animations.css
 */
const shimmerKeyframes = `
  @keyframes bds-skeleton-shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

/**
 * Base skeleton styles using BDS tokens
 *
 * Uses the shimmer pattern from animations.css:
 * - Linear gradient with subtle contrast transition
 * - Animated background position for shimmer effect
 *
 * Theme-aware tokens adapt for dark mode:
 * - Light: --_color---background--secondary = #f2f2f2, --_color---page--secondary = #e0e0e0
 * - Dark:  --_color---background--secondary = black,   --_color---page--secondary = #333
 */
const baseStyles: CSSProperties = {
  display: 'inline-block',
  backgroundColor: 'var(--_color---background--secondary)',
  backgroundImage: `linear-gradient(
    90deg,
    var(--_color---background--secondary) 25%,
    var(--_color---page--secondary) 50%,
    var(--_color---background--secondary) 75%
  )`,
  backgroundSize: '200% 100%',
  animation: 'bds-skeleton-shimmer 1.5s infinite',
};

/**
 * Default dimensions per variant
 */
const variantDefaults: Record<SkeletonVariant, { width: string; height: string; borderRadius: string }> = {
  text: {
    width: '100%',
    height: '1em',
    borderRadius: 'var(--_border-radius---md)',
  },
  circular: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
  },
  rectangular: {
    width: '100%',
    height: '140px',
    borderRadius: 'var(--_border-radius---md)',
  },
};

/**
 * Skeleton - BDS themed loading placeholder
 *
 * Shows an animated placeholder while content is loading.
 * Uses the shimmer animation pattern from BDS animations.css.
 *
 * @example
 * ```tsx
 * // Text loading
 * <Skeleton variant="text" width="200px" />
 *
 * // Avatar loading
 * <Skeleton variant="circular" width={48} height={48} />
 *
 * // Card loading
 * <Skeleton variant="rectangular" width="300px" height="200px" />
 * ```
 */
export function Skeleton({
  variant = 'text',
  width,
  height,
  className = '',
  style,
  ...props
}: SkeletonProps) {
  const variantStyle = variantDefaults[variant];

  const combinedStyles: CSSProperties = {
    ...baseStyles,
    width: width !== undefined ? (typeof width === 'number' ? `${width}px` : width) : variantStyle.width,
    height: height !== undefined ? (typeof height === 'number' ? `${height}px` : height) : variantStyle.height,
    borderRadius: variantStyle.borderRadius,
    ...style,
  };

  return (
    <>
      <style>{shimmerKeyframes}</style>
      <div
        role="status"
        aria-label="Loading"
        aria-live="polite"
        className={bdsClass('bds-skeleton', className)}
        style={combinedStyles}
        {...props}
      />
    </>
  );
}

export default Skeleton;
