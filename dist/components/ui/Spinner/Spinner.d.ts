import { type HTMLAttributes } from 'react';
import './Spinner.css';
export type SpinnerSize = 'sm' | 'lg';
export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
    /** Size variant */
    size?: SpinnerSize;
}
/**
 * Spinner — circular loading indicator with CSS animation
 *
 * Uses BDS tokens for colors and follows the existing animation pattern.
 */
export declare function Spinner({ size, className, style, ...props }: SpinnerProps): import("react/jsx-runtime").JSX.Element;
export default Spinner;
