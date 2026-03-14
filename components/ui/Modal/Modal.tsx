import { type ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { bdsClass } from '../../utils';
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
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

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

  const modal = (
    <div className="bds-modal-backdrop" onClick={handleBackdropClick}>
      <div
        ref={modalRef}
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
                <FontAwesomeIcon icon={faXmark} />
              </button>
            )}
          </div>
        )}
        <div className="bds-modal__body">{children}</div>
        {footer && <div className="bds-modal__footer">{footer}</div>}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

export default Modal;
