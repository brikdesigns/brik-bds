import { type ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@iconify/react';
import { X } from '../../icons';
import { Button } from '../Button';
import { bdsClass } from '../../utils';
import './Modal.css';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type ModalPreset = 'confirm';
export type ModalConfirmVariant = 'primary' | 'destructive';

interface ModalBaseProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  size?: ModalSize;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
}

interface ModalDefaultProps extends ModalBaseProps {
  /**
   * Default modal — flexible header / body / footer layout.
   *
   * Provide `children` for the body and an optional `footer` slot for
   * actions. Pair with `showCloseButton={false}` if the footer alone
   * should be the dismissal surface.
   */
  preset?: undefined;
  /** Body content */
  children: ReactNode;
  /** Optional footer ReactNode (typically Button(s)) */
  footer?: ReactNode;
  /** Show the X close button in the header (default true) */
  showCloseButton?: boolean;
}

interface ModalConfirmPresetProps extends ModalBaseProps {
  /**
   * Confirm preset — compact alertdialog with title + description + locked
   * confirm/cancel footer. Replaces the legacy `Dialog` component
   * (per ADR-004 §"Resolve the existing instances").
   *
   * The preset:
   *   - sets `role="alertdialog"` and a tighter 440px width
   *   - hides the X close button (footer is the dismissal surface)
   *   - auto-renders Cancel / Confirm buttons from `confirmLabel`,
   *     `cancelLabel`, `onConfirm`
   *   - supports `confirmVariant="destructive"` for delete-type actions
   *
   * Pass a custom `footer` to override the auto-rendered actions while
   * keeping the rest of the preset.
   */
  preset: 'confirm';
  /** Description text rendered under the title */
  description?: ReactNode;
  /** Optional override for the auto-rendered footer */
  footer?: ReactNode;
  /** Confirm button label (default "Confirm") */
  confirmLabel?: string;
  /** Cancel button label (default "Cancel") */
  cancelLabel?: string;
  /** Confirm action — required for the auto-rendered footer */
  onConfirm?: () => void;
  /** Visual treatment of the confirm button (default 'primary') */
  confirmVariant?: ModalConfirmVariant;
  /** Disable the confirm button (e.g. while a request is in flight) */
  confirmDisabled?: boolean;
  /** Show loading state on the confirm button */
  confirmLoading?: boolean;
  /** Optional extra body content rendered between description and footer */
  children?: ReactNode;
}

export type ModalProps = ModalDefaultProps | ModalConfirmPresetProps;

/**
 * Modal — portal-rendered overlay with backdrop, escape key, and scroll lock.
 *
 * Two shapes share the same primitive:
 *
 * - **Default** (no `preset`) — flexible header / body / footer layout.
 *   Use for forms, multi-step flows, content viewers.
 * - **`preset="confirm"`** — compact `alertdialog` with auto-rendered
 *   confirm/cancel buttons. Replaces the legacy `Dialog` component.
 *
 * @example Default
 * ```tsx
 * <Modal isOpen={open} onClose={close} title="Edit profile" size="md"
 *   footer={<><Button variant="ghost" onClick={close}>Cancel</Button>
 *            <Button variant="primary" onClick={save}>Save</Button></>}>
 *   <ProfileForm />
 * </Modal>
 * ```
 *
 * @example Confirm preset
 * ```tsx
 * <Modal
 *   isOpen={open}
 *   onClose={close}
 *   preset="confirm"
 *   title="Delete this item?"
 *   description="This action cannot be undone."
 *   confirmLabel="Delete"
 *   confirmVariant="destructive"
 *   onConfirm={handleDelete}
 * />
 * ```
 */
export function Modal(props: ModalProps) {
  const {
    isOpen,
    onClose,
    size = 'md',
    closeOnBackdrop = true,
    closeOnEscape = true,
  } = props;

  const isConfirmPreset = props.preset === 'confirm';

  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen]);

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdrop && event.target === event.currentTarget) onClose();
  };

  if (!isOpen) return null;

  const modal = isConfirmPreset
    ? renderConfirmPreset(props as ModalConfirmPresetProps, onClose)
    : renderDefault(props as ModalDefaultProps, onClose, size);

  return createPortal(
    <div className="bds-modal-backdrop" onClick={handleBackdropClick}>
      {modal}
    </div>,
    document.body,
  );
}

function renderDefault(
  { title, children, footer, showCloseButton = true }: ModalDefaultProps,
  onClose: () => void,
  size: ModalSize,
) {
  return (
    <div
      className={bdsClass('bds-modal', `bds-modal--${size}`)}
      role="dialog"
      aria-modal="true"
    >
      {(title || showCloseButton) && (
        <div className="bds-modal__header">
          {title && <h2 className="bds-modal__title">{title}</h2>}
          {showCloseButton && (
            <button
              type="button"
              className="bds-modal__close"
              onClick={onClose}
              aria-label="Close"
            >
              <Icon icon={X} />
            </button>
          )}
        </div>
      )}
      <div className="bds-modal__body">{children}</div>
      {footer && <div className="bds-modal__footer">{footer}</div>}
    </div>
  );
}

function renderConfirmPreset(
  {
    title,
    description,
    children,
    footer,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    onConfirm,
    confirmVariant = 'primary',
    confirmDisabled,
    confirmLoading,
  }: ModalConfirmPresetProps,
  onClose: () => void,
) {
  const titleId = 'bds-modal-confirm-title';
  const descId = description ? 'bds-modal-confirm-desc' : undefined;

  const autoFooter = (
    <>
      <Button variant="secondary" onClick={onClose}>
        {cancelLabel}
      </Button>
      <Button
        variant={confirmVariant === 'destructive' ? 'destructive' : 'primary'}
        onClick={() => onConfirm?.()}
        disabled={confirmDisabled}
        loading={confirmLoading}
      >
        {confirmLabel}
      </Button>
    </>
  );

  return (
    <div
      className={bdsClass('bds-modal', 'bds-modal--preset-confirm')}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={descId}
    >
      {title && (
        <h2 id={titleId} className="bds-modal__confirm-title">{title}</h2>
      )}
      {description && (
        <p id={descId} className="bds-modal__confirm-description">{description}</p>
      )}
      {children}
      <div className="bds-modal__confirm-actions">
        {footer ?? autoFooter}
      </div>
    </div>
  );
}

export default Modal;
