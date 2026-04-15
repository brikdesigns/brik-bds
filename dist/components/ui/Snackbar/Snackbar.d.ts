import { type ReactNode } from 'react';
import './Snackbar.css';
export type SnackbarPosition = 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
export type SnackbarVariant = 'default' | 'success' | 'error' | 'warning';
export interface SnackbarProps {
    /** Whether the snackbar is visible */
    isOpen: boolean;
    /** Close handler */
    onClose: () => void;
    /** Message text */
    message: ReactNode;
    /** Optional action element (button/link) */
    action?: ReactNode;
    /** Auto-dismiss duration in ms (0 = no auto-dismiss) */
    duration?: number;
    /** Screen position */
    position?: SnackbarPosition;
    /** Visual variant */
    variant?: SnackbarVariant;
}
/**
 * Snackbar — brief notification at screen edge via portal
 *
 * Auto-dismisses after `duration` ms. Supports variants for
 * success/error/warning and configurable position.
 */
export declare function Snackbar({ isOpen, onClose, message, action, duration, position, variant, }: SnackbarProps): import("react").ReactPortal | null;
export default Snackbar;
