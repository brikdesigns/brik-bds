import { type HTMLAttributes } from 'react';
import './ProgressBar.css';
/**
 * ProgressBar component props
 */
export interface ProgressBarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'role'> {
    /** Progress value from 0 to 100 */
    value: number;
    /** Accessible label for screen readers */
    label?: string;
    /** Override fill bar color (defaults to brand-primary) */
    fillColor?: string;
}
/**
 * ProgressBar - BDS themed progress indicator
 *
 * A horizontal bar showing completion progress.
 * Uses BDS tokens for theming across all 8 theme variants.
 *
 * @example
 * ```tsx
 * <ProgressBar value={35} label="Upload progress" />
 * ```
 */
export declare function ProgressBar({ value, label, fillColor, className, style, ...props }: ProgressBarProps): import("react/jsx-runtime").JSX.Element;
export default ProgressBar;
