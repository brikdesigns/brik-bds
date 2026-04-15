import { type ReactNode, type HTMLAttributes } from 'react';
import './Toast.css';
export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';
export interface ToastProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
    /** Bold title text */
    title: ReactNode;
    /** Description text below the title */
    description?: ReactNode;
    /** Visual variant — renders a colored Badge icon; surface stays neutral */
    variant?: ToastVariant;
    /** Called when the close button is clicked */
    onDismiss?: () => void;
}
/**
 * Toast — white surface notification with optional colored Badge
 *
 * The surface NEVER changes color — only the badge communicates
 * success, error, warning, or info status.
 */
export declare function Toast({ title, description, variant, onDismiss, className, style, ...props }: ToastProps): import("react/jsx-runtime").JSX.Element;
export default Toast;
