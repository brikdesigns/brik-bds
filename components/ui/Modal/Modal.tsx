import { type ReactNode, type CSSProperties, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

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
 * Backdrop overlay styles
 *
 * Token reference:
 * - Overlay: rgba(0, 0, 0, 0.4) per Figma
 * - --padding-lg = 16px (safe area padding)
 */
const backdropStyles: CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.4)', // bds-lint-ignore — overlay, no token exists
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 'var(--padding-lg)',
  zIndex: 1000,
};

/**
 * Modal container styles
 *
 * Token reference:
 * - --surface-overlay (modal panel surface)
 * - --border-radius-md = 4px (modal corners)
 * - Shadow: 0 4px 32px 32px rgba(0,0,0,0.24) per Figma shadow-xl
 */
const getModalStyles = (size: ModalSize): CSSProperties => ({
  position: 'relative',
  width: '100%',
  maxWidth: sizeConfig[size],
  maxHeight: '90vh',
  backgroundColor: 'var(--surface-overlay)',
  borderRadius: 'var(--border-radius-md)',
  boxShadow: '0px 4px 32px 32px rgba(0, 0, 0, 0.24)', // bds-lint-ignore — shadow tokens resolve to zero
  display: 'flex',
  flexDirection: 'column',
});

/**
 * Modal header styles
 *
 * Token reference:
 * - --padding-lg (top/bottom padding)
 * - --border-muted (divider line)
 * - --border-width-sm (divider thickness)
 */
const headerStyles: CSSProperties = {
  padding: 'var(--padding-lg)',
  borderBottom: 'var(--border-width-sm) solid var(--border-muted)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexShrink: 0,
};

/**
 * Title styles
 *
 * Token reference:
 * - --font-family-heading (heading font)
 * - --heading-md = font-size-500 = 25.3px
 * - --font-weight-bold = 700
 * - --font-line-height-snug = 125%
 * - --text-primary (dark text)
 */
const titleStyles: CSSProperties = {
  fontFamily: 'var(--font-family-heading)',
  fontSize: 'var(--heading-md)',
  fontWeight: 'var(--font-weight-bold)' as unknown as number,
  lineHeight: 'var(--font-line-height-snug)',
  color: 'var(--text-primary)',
  margin: 0,
};

/**
 * Close button styles
 *
 * Token reference:
 * - --icon-md = font-size-200 = 18px (icon size per Figma solid-icon/lg)
 * - --padding-md = 16px (inner padding)
 * - --text-primary (icon color)
 * - --border-radius-md = 4px
 * - 44×44 touch target per Figma button-icon-md
 */
const closeButtonStyles: CSSProperties = {
  background: 'none',
  border: 'none',
  fontSize: 'var(--icon-md)',
  lineHeight: 'var(--font-line-height--100)',
  cursor: 'pointer',
  padding: 'var(--padding-md)',
  color: 'var(--text-primary)',
  opacity: 0.6,
  transition: 'opacity 0.2s',
  borderRadius: 'var(--border-radius-md)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

/**
 * Modal body styles
 *
 * Token reference:
 * - --padding-xl = 24px (padding)
 * - --font-family-body (body font)
 * - --body-md = 16px (body text size)
 * - --font-line-height-normal = 150%
 * - --text-primary (text color)
 */
const bodyStyles: CSSProperties = {
  padding: 'var(--padding-xl)',
  overflowY: 'auto',
  flex: 1,
  fontFamily: 'var(--font-family-body)',
  fontSize: 'var(--body-md)',
  color: 'var(--text-primary)',
  lineHeight: 'var(--font-line-height-normal)',
};

/**
 * Modal footer styles
 *
 * Token reference:
 * - --padding-xl = 24px (padding)
 * - --gap-lg = 16px (button gap)
 */
const footerStyles: CSSProperties = {
  padding: 'var(--padding-xl)',
  display: 'flex',
  gap: 'var(--gap-lg)',
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
 *       <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
 *       <Button variant="primary" onClick={handleConfirm}>Save</Button>
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
    <div className="bds-modal-backdrop" style={backdropStyles} onClick={handleBackdropClick}>
      <div ref={modalRef} className="bds-modal" style={getModalStyles(size)} role="dialog" aria-modal="true">
        {(title || showCloseButton) && (
          <div className="bds-modal-header" style={headerStyles}>
            {title && <h2 style={titleStyles}>{title}</h2>}
            {showCloseButton && (
              <button
                type="button"
                className="bds-modal-close"
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
                <FontAwesomeIcon icon={faXmark} />
              </button>
            )}
          </div>
        )}
        <div className="bds-modal-body" style={bodyStyles}>{children}</div>
        {footer && <div className="bds-modal-footer" style={footerStyles}>{footer}</div>}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

export default Modal;
