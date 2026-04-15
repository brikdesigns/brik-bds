import type { HTMLAttributes } from 'react';
import './Divider.css';
export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerSpacing = 'none' | 'sm' | 'md' | 'lg';
export interface DividerProps extends HTMLAttributes<HTMLHRElement> {
    /** Orientation of the divider line */
    orientation?: DividerOrientation;
    /** Spacing (margin) above and below (or left/right for vertical) */
    spacing?: DividerSpacing;
}
/**
 * Divider - Visual separator for content sections.
 *
 * @example
 * ```tsx
 * <Divider />
 * <Divider spacing="lg" />
 * <Divider orientation="vertical" />
 * ```
 */
export declare function Divider({ orientation, spacing, className, style, ...props }: DividerProps): import("react/jsx-runtime").JSX.Element;
export default Divider;
