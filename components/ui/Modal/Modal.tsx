import { type ReactNode, type CSSProperties, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

/**
 * Modal size variants
 */
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

/**
 * Modal component props
 */
export interface ModalProps {
  /** Open/closed state */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Modal title */
  title?: ReactNode;
  /** Modal content */
  children: ReactNode;
  /** Footer content (buttons, etc.) */
  footer?: ReactNode;
  /** Size variant */
  size?: ModalSize;
  /** Close on backdrop click */
  closeOnBackdrop?: boolean;
  /** Close on escape key */
  closeOnEscape?: boolean;
  /** Show close button */
  showCloseButton?: boolean;
}

/**
 * Size configurations
 */
const sizeConfig: Record<ModalSize, string> = {
  sm: '400px',
  md: '600px',
  lg: '800px',
  xl: '1000px',
  full: '95vw',
};

/**
 * Backdrop overlay styles using BDS tokens
 */
const backdropStyles: CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 'var(--_space---lg)',
  zIndex: 1000,
  backdropFilter: 'blur(2px)',
};

/**
 * Modal container styles using BDS tokens
 *
 * Token reference:
 * - --_color---background--input (modal background)
 * - --_border-radius---lg = 8px (modal corners)
 * - --_space---lg = 16px (padding)
 */
const getModalStyles = (size: ModalSize): CSSProperties => ({
  position: 'relative',
  width: '100%',
  maxWidth: sizeConfig[size],
  maxHeight: '90vh',
  backgroundColor: 'var(--_color---background--input)',
  borderRadius: 'var(--_border-radius---lg)',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
});

/**
 * Modal header styles using BDS tokens
 *
 * Token reference:
 * - --_space---lg = 16px (padding)
 * - --_typography---font-family--heading (heading font)
 * - --_typography---heading--medium (heading size)
 * - --_color---text--primary (text color)
 */
const headerStyles: CSSProperties = {
  padding: 'var(--_space---lg)',
  borderBottom: 'var(--_border-width---sm) solid var(--_color---border--input)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexShrink: 0,
};

const titleStyles: CSSProperties = {
  fontFamily: 'var(--_typography---font-family--heading)',
  fontSize: 'var(--_typography---heading--medium)',
  fontWeight: 'var(--font-weight--semi-bold)' as unknown as number,
  color: 'var(--_color---text--primary)',
  margin: 0,
};

/**
 * Close button styles using BDS tokens
 */
const closeButtonStyles: CSSProperties = {
  background: 'none',
  border: 'none',
  fontSize: 'var(--_typography---body--lg)',
  lineHeight: 'var(--font-line-height--100)',
  cursor: 'pointer',
  padding: 'var(--_space---sm)',
  color: 'var(--_color---text--primary)',
  opacity: 0.6,
  transition: 'opacity 0.2s',
  borderRadius: 'var(--_border-radius---sm)',
};

/**
 * Modal body styles using BDS tokens
 */
const bodyStyles: CSSProperties = {
  padding: 'var(--_space---lg)',
  overflowY: 'auto',
  flex: 1,
  fontFamily: 'var(--_typography---font-family--body)',
  fontSize: 'var(--_typography---body--md-base)',
  color: 'var(--_color---text--primary)',
  lineHeight: 'var(--font-line-height--150)',
};

/**
 * Modal footer styles using BDS tokens
 */
const footerStyles: CSSProperties = {
  padding: 'var(--_space---lg)',
  borderTop: 'var(--_border-width---sm) solid var(--_color---border--input)',
  display: 'flex',
  gap: 'var(--_space---gap--md)',
  justifyContent: 'flex-end',
  flexShrink: 0,
};

/**
 * Modal - BDS themed modal dialog component
 *
 * Uses CSS variables for theming. Renders in a portal, handles escape key,
 * backdrop clicks, and body scroll locking. All spacing, colors, and
 * typography reference BDS tokens.
 *
 * @example
 * ```tsx
 * <Modal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Confirm Action"
 *   footer={
 *     <>
 *       <Button onClick={() => setIsOpen(false)}>Cancel</Button>
 *       <Button onClick={handleConfirm}>Confirm</Button>
 *     </>
 *   }
 * >
 *   Are you sure you want to proceed?
 * </Modal>
 * ```
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

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdrop && event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const modal = (
    <div style={backdropStyles} onClick={handleBackdropClick}>
      <div ref={modalRef} style={getModalStyles(size)}>
        {(title || showCloseButton) && (
          <div style={headerStyles}>
            {title && <h2 style={titleStyles}>{title}</h2>}
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                style={closeButtonStyles}
                aria-label="Close"
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '0.6';
                }}
              >
                ×
              </button>
            )}
          </div>
        )}
        <div style={bodyStyles}>{children}</div>
        {footer && <div style={footerStyles}>{footer}</div>}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

export default Modal;
