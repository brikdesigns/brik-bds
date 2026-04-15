import { type ReactNode, type HTMLAttributes } from 'react';
import './Tooltip.css';
/**
 * Tooltip placement positions
 */
export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';
/**
 * Tooltip component props
 */
export interface TooltipProps extends Omit<HTMLAttributes<HTMLDivElement>, 'content'> {
    /** Tooltip content to display */
    content: ReactNode;
    /** Placement position relative to children */
    placement?: TooltipPlacement;
    /** Delay in ms before showing the tooltip (default: 0 = instant) */
    delay?: number;
    /** Children (trigger element) */
    children: ReactNode;
}
/**
 * Tooltip - BDS themed tooltip component
 *
 * Shows contextual information on hover/focus.
 * Bubble renders via portal to `document.body` so it escapes
 * overflow containers (board columns, scroll areas, etc.).
 *
 * @example
 * ```tsx
 * <Tooltip content="Click to edit">
 *   <button>Edit</button>
 * </Tooltip>
 *
 * <Tooltip content="Helpful info" placement="right" delay={800}>
 *   <span>?</span>
 * </Tooltip>
 * ```
 */
export declare function Tooltip({ content, placement, delay, children, className, style, ...props }: TooltipProps): import("react/jsx-runtime").JSX.Element;
export default Tooltip;
