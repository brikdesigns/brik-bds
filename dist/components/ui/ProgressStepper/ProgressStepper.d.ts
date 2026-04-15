import { type HTMLAttributes } from 'react';
import './ProgressStepper.css';
export type ProgressStepperSize = 'sm' | 'md';
export type StepStatus = 'complete' | 'active' | 'upcoming';
export interface ProgressStep {
    /** Step label text */
    label: string;
    /** Optional description shown below the label */
    description?: string;
}
export interface ProgressStepperProps extends HTMLAttributes<HTMLElement> {
    /** Array of step definitions */
    steps: ProgressStep[];
    /** Zero-indexed active step */
    activeStep: number;
    /** Size variant */
    size?: ProgressStepperSize;
    /**
     * When true, users can only navigate to completed steps — not skip ahead.
     * Upcoming steps are visually muted and non-interactive.
     * When false (default), all steps are clickable.
     */
    linear?: boolean;
    /** Callback when a step is clicked */
    onStepClick?: (index: number) => void;
}
/**
 * ProgressStepper — vertical step progression indicator.
 *
 * Shows numbered steps with complete/active/upcoming states.
 * Complete steps show a checkmark, active step is highlighted,
 * upcoming steps are muted.
 *
 * Use `linear` to prevent skipping ahead — only completed and active
 * steps are clickable. The user must advance via a primary CTA.
 */
export declare function ProgressStepper({ steps, activeStep, size, linear, onStepClick, className, style, ...props }: ProgressStepperProps): import("react/jsx-runtime").JSX.Element;
export default ProgressStepper;
