import { type ReactNode, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { bdsClass } from '../../utils';
import './Dialog.css';

export type DialogVariant = 'default' | 'destructive';

export interface DialogProps {
  /** Whether the dialog is rendered. Returns `null` when false. */
  isOpen: boolean;
  /** Called on backdrop click, Escape key, or the Cancel button. Caller is responsible for setting `isOpen` to false. */
  onClose: () => void;
  /** Heading text rendered in the dialog. Required for accessible labelling. */
  title: string;
  /** Body paragraph rendered under the title. Ignored when `children` is supplied. */
  description?: string;
  /** Custom body content. Replaces `description` when provided. */
  children?: ReactNode;
  /** Label for the primary action button. Default `"Confirm"`. */
  confirmLabel?: string;
  /** Label for the secondary cancel button. Default `"Cancel"`. */
  cancelLabel?: string;
  /** Called when the primary action is clicked. Caller is responsible for closing the dialog (typically by toggling `isOpen`). */
  onConfirm?: () => void;
  /** Visual variant. `default` uses the brand-primary confirm button; `destructive` switches it to the destructive treatment for delete-style confirmations. */
  variant?: DialogVariant;
  /** Close when the backdrop is clicked. Default `true`. */
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
