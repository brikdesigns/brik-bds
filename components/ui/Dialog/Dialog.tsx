import { type ReactNode, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { bdsClass } from '../../utils';
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
 *
 * @deprecated Use `<Modal preset="confirm">` instead. Same behavior, same
 * API (title, description, confirmLabel, cancelLabel, onConfirm), with
 * `confirmVariant="destructive"` covering this component's `variant="destructive"`.
 * Slated for deletion in a future major version once consumers migrate.
 *
 * Migration:
 * ```tsx
 * // before
 * <Dialog isOpen={open} onClose={close} title="Delete?" description="..."
 *   confirmLabel="Delete" onConfirm={handleDelete} variant="destructive" />
 *
 * // after
 * <Modal isOpen={open} onClose={close} preset="confirm" title="Delete?"
 *   description="..." confirmLabel="Delete" onConfirm={handleDelete}
 *   confirmVariant="destructive" />
 * ```
 *
 * Tracked under ADR-004 — see docs/adrs/ADR-004-component-bloat-guardrails.md.
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
    (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); },
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

  const dialog = (
    <div
      className="bds-dialog-backdrop"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        className="bds-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="bds-dialog-title"
        aria-describedby={description ? 'bds-dialog-desc' : undefined}
      >
        <h2 id="bds-dialog-title" className="bds-dialog__title">{title}</h2>
        {children || (description && (
          <p id="bds-dialog-desc" className="bds-dialog__description">{description}</p>
        ))}
        <div className="bds-dialog__actions">
          <button
            type="button"
            className={bdsClass('bds-dialog__button', 'bds-dialog__button--cancel')}
            onClick={onClose}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={bdsClass(
              'bds-dialog__button',
              variant === 'destructive' ? 'bds-dialog__button--destructive' : 'bds-dialog__button--confirm',
            )}
            onClick={() => onConfirm?.()}
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
