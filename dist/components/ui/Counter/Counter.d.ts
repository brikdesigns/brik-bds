import type { HTMLAttributes } from 'react';
import './Counter.css';
export type CounterStatus = 'success' | 'error' | 'warning' | 'neutral' | 'progress' | 'brand';
export type CounterSize = 'xs' | 'sm' | 'md' | 'lg';
export interface CounterProps extends HTMLAttributes<HTMLSpanElement> {
    /** Numeric count to display */
    count: number;
    /** Status variant */
    status?: CounterStatus;
    /** Size variant */
    size?: CounterSize;
    /** Max count — displays "99+" if exceeded */
    max?: number;
}
/**
 * Counter - Numeric count indicator with status colors.
 *
 * @example
 * ```tsx
 * <Counter count={5} status="success" />
 * <Counter count={150} max={99} status="error" size="lg" />
 * ```
 */
export declare function Counter({ count, status, size, max, className, style, ...props }: CounterProps): import("react/jsx-runtime").JSX.Element;
export default Counter;
