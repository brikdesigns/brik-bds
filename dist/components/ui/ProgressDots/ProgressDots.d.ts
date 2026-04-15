import { type HTMLAttributes } from 'react';
import './ProgressDots.css';
export type ProgressDotsSize = 'sm' | 'md';
export interface ProgressDotsProps extends HTMLAttributes<HTMLElement> {
    /** Total number of steps */
    count: number;
    /** Zero-indexed active step */
    activeStep: number;
    /** Size variant */
    size?: ProgressDotsSize;
    /**
     * When true, only completed dots (before active) are clickable.
     * When false (default), all dots are clickable.
     */
    linear?: boolean;
    /** Callback when a dot is clicked */
    onDotClick?: (index: number) => void;
}
/**
 * ProgressDots — horizontal dot indicator for multi-step flows.
 *
 * Lightweight companion to ProgressStepper. Shows the current position
 * in a flow with animated width transitions. Use on mobile or as a
 * compact alternative to the full vertical stepper.
 *
 * Respects the same `linear` prop as ProgressStepper — when true,
 * users can only tap back to completed dots.
 */
export declare function ProgressDots({ count, activeStep, size, linear, onDotClick, className, style, ...props }: ProgressDotsProps): import("react/jsx-runtime").JSX.Element;
export default ProgressDots;
