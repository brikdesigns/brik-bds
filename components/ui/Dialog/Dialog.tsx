import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useCallback,
} from 'react';
import { createPortal } from 'react-dom';
import { bdsClass } from '../../utils';

export type DialogVariant = 'default' | 'destructive';

export interface DialogProps {
  /** Whether the dialog is visible */
  isOpen: boolean;
  /** Called when the dialog should close */
  onClose: () => void;
  /** Dialog title */
  title: string;
  /** Description text */
  description?: string;
  /** Custom body content (overrides description) */
  children?: ReactNode;
  /** Confirm button label */
  confirmLabel?: string;
  /** Cancel button label */
  cancelLabel?: string;
  /** Called when confirm is clicked */
  onConfirm?: () => void;
  /** Visual variant — destructive uses red confirm button */
  variant?: DialogVariant;
  /** Close on backdrop click */
  closeOnBackdrop?: boolean;
}

const backdropStyles: CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.4)', // bds-lint-ignore — no overlay token
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const panelStyles: CSSProperties = {
  backgroundColor: 'var(--surface-primary)',
  borderRadius: 'var(--border-radius-md)',
  boxShadow: '0px 4px 32px rgba(0, 0, 0, 0.24)', // bds-lint-ignore — no shadow token
  maxWidth: 440,
  width: '100%',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--gap-lg)',
  padding: 'var(--padding-xl)',
};

const titleStyles: CSSProperties = {
  fontFamily: 'var(--font-family-heading)',
  fontSize: 'var(--heading-sm)',
  fontWeight: 'var(--font-weight-bold)' as unknown as number,
  lineHeight: 'var(--font-line-height-snug)',
  color: 'var(--text-primary)',
  margin: 0,
};

const descriptionStyles: CSSProperties = {
  fontFamily: 'var(--font-family-body)',
  fontSize: 'var(--body-md)',
  lineHeight: 'var(--font-line-height-normal)',
  color: 'var(--text-secondary)',
  margin: 0,
};

const actionsStyles: CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 'var(--gap-md)',
  flexWrap: 'wrap',
};

const buttonBase: CSSProperties = {
  fontFamily: 'var(--font-family-label)',
  fontWeight: 'var(--font-weight-semi-bold)' as unknown as number,
  fontSize: 'var(--label-sm)',
  lineHeight: 'var(--font-line-height-normal)',
  padding: 'var(--padding-sm) var(--padding-lg)',
  borderRadius: 'var(--border-radius-sm)',
  cursor: 'pointer',
  border: 'none',
  transition: 'filter 0.15s ease',
};

const cancelButtonStyles: CSSProperties = {
  ...buttonBase,
  backgroundColor: 'var(--surface-secondary)',
  color: 'var(--text-primary)',
  border: 'var(--border-width-sm) solid var(--border-secondary)',
};

const confirmButtonStyles: Record<DialogVariant, CSSProperties> = {
  default: {
    ...buttonBase,
    backgroundColor: 'var(--background-brand-primary)',
    color: 'var(--text-on-color-dark)',
  },
  destructive: {
    ...buttonBase,
    backgroundColor: 'var(--color-system-red)',
    color: 'var(--text-on-color-dark)',
  },
};

/**
 * Dialog — focused confirmation overlay for user decisions.
 *
 * Simpler than Modal — intended for confirm/cancel flows.
 * Uses portal rendering, escape-to-close, and backdrop click.
 */
export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  variant = 'default',
  closeOnBackdrop = true,
}: DialogProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdrop && e.target === e.currentTarget) onClose();
  };

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
  };

  const dialog = (
    <div
      className={bdsClass('bds-dialog-backdrop')}
      style={backdropStyles}
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        className={bdsClass('bds-dialog')}
        style={panelStyles}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="bds-dialog-title"
        aria-describedby={description ? 'bds-dialog-desc' : undefined}
      >
        <h2 id="bds-dialog-title" style={titleStyles}>
          {title}
        </h2>
        {children || (description && (
          <p id="bds-dialog-desc" style={descriptionStyles}>
            {description}
          </p>
        ))}
        <div style={actionsStyles}>
          <button
            type="button"
            style={cancelButtonStyles}
            onClick={onClose}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            style={confirmButtonStyles[variant]}
            onClick={handleConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
}

export default Dialog;
