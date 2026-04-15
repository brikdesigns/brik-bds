import type { HTMLAttributes } from 'react';
import './Dot.css';
export type DotStatus = 'default' | 'positive' | 'warning' | 'error' | 'info' | 'neutral';
export type DotSize = 'sm' | 'md' | 'lg';
export interface DotProps extends HTMLAttributes<HTMLSpanElement> {
    /** Status variant */
    status?: DotStatus;
    /** Size variant */
    size?: DotSize;
    /** Pulse animation — use for active/running states */
    pulse?: boolean;
}
/**
 * Dot - Small status indicator circle.
 *
 * @example
 * ```tsx
 * <Dot status="positive" />
 * <Dot status="error" size="lg" />
 * ```
 */
export declare function Dot({ status, size, pulse, className, style, ...props }: DotProps): import("react/jsx-runtime").JSX.Element;
export default Dot;
