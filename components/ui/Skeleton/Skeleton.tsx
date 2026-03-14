import type { CSSProperties, HTMLAttributes } from 'react';
import { bdsClass } from '../../utils';
import './Skeleton.css';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Shape variant */
  variant?: SkeletonVariant;
  /** Width (CSS value or number for px) */
  width?: string | number;
  /** Height (CSS value or number for px) */
  height?: string | number;
}

/**
 * Skeleton - Loading placeholder with shimmer animation.
 *
 * @example
 * ```tsx
 * <Skeleton variant="text" width="200px" />
 * <Skeleton variant="circular" width={48} height={48} />
 * <Skeleton variant="rectangular" width="300px" height="200px" />
 * ```
 */
export function Skeleton({
  variant = 'text',
  width,
  height,
  className,
  style,
  ...props
}: SkeletonProps) {
  const dimensionStyle: CSSProperties = {
    ...(width !== undefined && { width: typeof width === 'number' ? `${width}px` : width }),
    ...(height !== undefined && { height: typeof height === 'number' ? `${height}px` : height }),
    ...style,
  };

  return (
    <div
      role="status"
      aria-label="Loading"
      aria-live="polite"
      className={bdsClass('bds-skeleton', `bds-skeleton--${variant}`, className)}
      style={Object.keys(dimensionStyle).length > 0 ? dimensionStyle : style}
      {...props}
    />
  );
}

export default Skeleton;
