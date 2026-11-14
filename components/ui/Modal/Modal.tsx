import { type ReactNode, useEffect, useId, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '../Button';
import { CloseButton } from '../CloseButton';
import { bdsClass, resolveRetiredValue, type ModalAccessibleNameProps } from '../../utils';
import './Modal.css';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type ModalPreset = 'confirm';
export type ModalConfirmVariant = 'primary' | 'negative';

const RETIRED_CONFIRM_VARIANTS: Record<string, ModalConfirmVariant> = { destructive: 'negative' };

type DismissProps = Pick<
  React.ComponentPropsWithoutRef<typeof Dialog.Content>,
  'onEscapeKeyDown' | 'onPointerDownOutside' | 'onInteractOutside' | 'onCloseAutoFocus'
>;

interface ModalBaseProps {
  isOpen: boolean;
  onClose: () => void;
  size?: ModalSize;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
}

interface ModalDefaultBaseProps extends ModalBaseProps {
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

interface ModalConfirmPresetBaseProps extends ModalBaseProps {
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
   *   - supports `confirmVariant="negative"` for delete-type actions
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

// A dialog must have an accessible name: a `title` (labels the dialog via
// `aria-labelledby`) or an `aria-label` for a titleless modal. Omitting both
// is a type error.
type ModalDefaultProps = ModalDefaultBaseProps & ModalAccessibleNameProps;
type ModalConfirmPresetProps = ModalConfirmPresetBaseProps & ModalAccessibleNameProps;

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
 *   confirmVariant="negative"
 *   onConfirm={handleDelete}
 * />
 * ```
 *
 * @summary Portal-rendered overlay with backdrop and escape
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
  const titleId = useId();

  // Radix returns focus to a <Dialog.Trigger>; Modal is controlled by `isOpen`
  // and has none, so remember the opener ourselves. This effect runs before the
  // portalled content mounts and moves focus inside.
  const openerRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (isOpen) openerRef.current = document.activeElement as HTMLElement | null;
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen]);

  // Radix Dialog owns the focus trap, focus-in on open, focus return on close,
  // Escape and outside-pointer dismissal. BDS classes own the styling.
  const dismissProps: DismissProps = {
    onEscapeKeyDown: (event) => { if (!closeOnEscape) event.preventDefault(); },
    onPointerDownOutside: (event) => { if (!closeOnBackdrop) event.preventDefault(); },
    onInteractOutside: (event) => { if (!closeOnBackdrop) event.preventDefault(); },
    onCloseAutoFocus: (event) => {
      event.preventDefault();
      openerRef.current?.focus();
    },
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="bds-modal-backdrop">
          {isConfirmPreset
            ? renderConfirmPreset(props as ModalConfirmPresetProps, onClose, titleId, dismissProps)
            : renderDefault(props as ModalDefaultProps, onClose, size, titleId, dismissProps)}
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function renderDefault(
  { title, children, footer, showCloseButton = true, 'aria-label': ariaLabel }: ModalDefaultProps,
  onClose: () => void,
  size: ModalSize,
  titleId: string,
  dismissProps: DismissProps,
) {
  return (
    <Dialog.Content
      {...dismissProps}
      className={bdsClass('bds-modal', `bds-modal--size-${size}`)}
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      aria-label={title ? undefined : ariaLabel}
      aria-describedby={undefined}
    >
      {(title || showCloseButton) && (
        <div className="bds-modal__header">
          {title && <h2 id={titleId} className="bds-modal__title">{title}</h2>}
          {showCloseButton && (
            <CloseButton className="bds-modal__close" onClick={onClose} />
          )}
        </div>
      )}
      <div className="bds-modal__body">{children}</div>
      {footer && <div className="bds-modal__footer">{footer}</div>}
    </Dialog.Content>
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
    confirmVariant,
    confirmDisabled,
    confirmLoading,
    'aria-label': ariaLabel,
  }: ModalConfirmPresetProps,
  onClose: () => void,
  titleId: string,
  dismissProps: DismissProps,
) {
  const resolvedConfirmVariant =
    resolveRetiredValue('Modal', 'confirmVariant', confirmVariant, RETIRED_CONFIRM_VARIANTS) ?? 'primary';
  const descId = description ? `${titleId}-desc` : undefined;

  const autoFooter = (
    <>
      <Button variant="secondary" onClick={onClose}>
        {cancelLabel}
      </Button>
      <Button
        tone={resolvedConfirmVariant === 'negative' ? 'negative' : undefined}
        onClick={() => onConfirm?.()}
        disabled={confirmDisabled}
        loading={confirmLoading}
      >
        {confirmLabel}
      </Button>
    </>
  );

  return (
    <Dialog.Content
      {...dismissProps}
      className={bdsClass('bds-modal', 'bds-modal--preset-confirm')}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      aria-label={title ? undefined : ariaLabel}
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
    </Dialog.Content>
  );
}

export default Modal;
