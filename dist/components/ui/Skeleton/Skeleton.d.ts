import type { HTMLAttributes } from 'react';
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
export declare function Skeleton({ variant, width, height, className, style, ...props }: SkeletonProps): import("react/jsx-runtime").JSX.Element;
export default Skeleton;
