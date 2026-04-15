import { type ReactNode } from 'react';
import './Dialog.css';
export type DialogVariant = 'default' | 'destructive';
export interface DialogProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children?: ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm?: () => void;
    variant?: DialogVariant;
    closeOnBackdrop?: boolean;
}
/**
 * Dialog — focused confirmation overlay for user decisions.
 *
 * Simpler than Modal — intended for confirm/cancel flows.
 */
export declare function Dialog({ isOpen, onClose, title, description, children, confirmLabel, cancelLabel, onConfirm, variant, closeOnBackdrop, }: DialogProps): import("react").ReactPortal | null;
export default Dialog;
