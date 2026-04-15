import { type ReactNode, type HTMLAttributes } from 'react';
import './Popover.css';
export type PopoverPlacement = 'top' | 'bottom' | 'left' | 'right';
export type PopoverTrigger = 'click' | 'hover';
export interface PopoverProps extends Omit<HTMLAttributes<HTMLDivElement>, 'content'> {
    /** The trigger element */
    children: ReactNode;
    /** Popover content */
    content: ReactNode;
    /** Placement relative to trigger */
    placement?: PopoverPlacement;
    /** How to trigger the popover */
    trigger?: PopoverTrigger;
    /** Controlled open state */
    isOpen?: boolean;
    /** Controlled change handler */
    onOpenChange?: (open: boolean) => void;
}
/**
 * Popover — floating content panel anchored to a trigger element.
 *
 * Supports click or hover triggering, 4 placements, and controlled/uncontrolled modes.
 * Uses click-outside pattern from Menu and positioning from Tooltip.
 */
export declare function Popover({ children, content, placement, trigger, isOpen: controlledOpen, onOpenChange, className, style, ...props }: PopoverProps): import("react/jsx-runtime").JSX.Element;
export default Popover;
