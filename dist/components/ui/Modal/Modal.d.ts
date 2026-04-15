import { type ReactNode } from 'react';
import './Modal.css';
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: ReactNode;
    children: ReactNode;
    footer?: ReactNode;
    size?: ModalSize;
    closeOnBackdrop?: boolean;
    closeOnEscape?: boolean;
    showCloseButton?: boolean;
}
/**
 * Modal — portal-rendered dialog with backdrop, escape key, and scroll lock.
 */
export declare function Modal({ isOpen, onClose, title, children, footer, size, closeOnBackdrop, closeOnEscape, showCloseButton, }: ModalProps): import("react").ReactPortal | null;
export default Modal;
