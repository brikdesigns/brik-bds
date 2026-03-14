import { type ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { bdsClass } from '../../utils';
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
export function Snackbar({
  isOpen,
  onClose,
  message,
  action,
  duration = 4000,
  position = 'bottom',
  variant = 'default',
}: SnackbarProps) {
  useEffect(() => {
    if (!isOpen || duration === 0) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const snackbar = (
    <div
      className={bdsClass('bds-snackbar', `bds-snackbar--${variant}`, `bds-snackbar--${position}`)}
      role="status"
      aria-live="polite"
    >
      <span className="bds-snackbar__message">{message}</span>
      {action}
      <button
        type="button"
        onClick={onClose}
        className="bds-snackbar__close"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );

  return createPortal(snackbar, document.body);
}

export default Snackbar;
