import { type ReactNode, type CSSProperties, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { bdsClass } from '../../utils';

/**
 * Sheet side
 */
export type SheetSide = 'right' | 'left' | 'bottom';

/**
 * Sheet component props
 */
export interface SheetProps {
  /** Open/closed state */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Sheet content */
  children: ReactNode;
  /** Which side the sheet slides from */
  side?: SheetSide;
  /** Optional title */
  title?: ReactNode;
  /** Width for left/right sheets (default: 400px) */
  width?: string;
  /** Close on backdrop click */
  closeOnBackdrop?: boolean;
  /** Close on escape key */
  closeOnEscape?: boolean;
  /** Show close button */
  showCloseButton?: boolean;
}

/**
 * Backdrop styles
 *
 * Token reference:
 * - Overlay: rgba(0, 0, 0, 0.4) per Figma (same as Modal)
 */
const backdropStyles: CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.4)', // bds-lint-ignore — overlay, no token exists
  zIndex: 1000,
};

/**
 * Sheet panel styles
 *
 * Token reference:
 * - --surface-primary (background)
 * - --padding-xl = 32px (padding)
 */
const basePanelStyles: CSSProperties = {
  position: 'fixed',
  backgroundColor: 'var(--surface-primary)',
  boxShadow: '0px 4px 32px 32px rgba(0, 0, 0, 0.24)', // bds-lint-ignore — shadow tokens resolve to zero
  display: 'flex',
  flexDirection: 'column',
  zIndex: 1001,
  overflowY: 'auto',
  boxSizing: 'border-box',
};

/**
 * Side-specific panel positioning
 */
const sideStyles = (side: SheetSide, width: string): CSSProperties => {
  switch (side) {
    case 'right':
      return { top: 0, right: 0, bottom: 0, width, maxWidth: '90vw' };
    case 'left':
      return { top: 0, left: 0, bottom: 0, width, maxWidth: '90vw' };
    case 'bottom':
      return { left: 0, right: 0, bottom: 0, maxHeight: '80vh' };
  }
};

/**
 * Header styles
 *
 * Token reference:
 * - --padding-xl = 32px
 * - --border-muted (divider)
 */
const headerStyles: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: 'var(--padding-xl)',
  borderBottom: 'var(--border-width-sm) solid var(--border-muted)',
  flexShrink: 0,
};

/**
 * Title styles
 *
 * Token reference:
 * - --font-family-heading
 * - --heading-sm = 20px
 * - --font-weight-bold = 700
 * - --text-primary
 */
const titleStyles: CSSProperties = {
  fontFamily: 'var(--font-family-heading)',
  fontSize: 'var(--heading-sm)',
  fontWeight: 'var(--font-weight-bold)' as unknown as number,
  lineHeight: 'var(--font-line-height-snug)',
  color: 'var(--text-primary)',
  margin: 0,
};

/**
 * Close button styles
 */
const closeButtonStyles: CSSProperties = {
  background: 'none',
  border: 'none',
  fontSize: 'var(--body-lg)',
  lineHeight: 'var(--font-line-height-tight)',
  cursor: 'pointer',
  padding: 'var(--padding-sm)',
  color: 'var(--text-primary)',
  opacity: 0.6,
  borderRadius: 'var(--border-radius-sm)',
};

/**
 * Body styles
 */
const bodyStyles: CSSProperties = {
  flex: 1,
  padding: 'var(--padding-xl)',
  overflowY: 'auto',
};

/**
 * Sheet - BDS side/bottom overlay panel
 *
 * A sliding panel overlay for contextual content, detail views,
 * or supplementary actions. Supports right, left, and bottom positions.
 *
 * @example
 * ```tsx
 * <Sheet
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Details"
 *   side="right"
 * >
 *   <p>Panel content goes here</p>
 * </Sheet>
 * ```
 */
export function Sheet({
  isOpen,
  onClose,
  children,
  side = 'right',
  title,
  width = '400px',
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
}: SheetProps) {
  // Escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdrop && e.target === e.currentTarget) onClose();
  };

  const sheet = (
    <>
      <div
        className="bds-sheet-backdrop"
        style={backdropStyles}
        onClick={handleBackdropClick}
      />
      <div
        className={bdsClass('bds-sheet')}
        role="dialog"
        aria-modal="true"
        style={{
          ...basePanelStyles,
          ...sideStyles(side, width),
        }}
      >
        {(title || showCloseButton) && (
          <div style={headerStyles}>
            {title && <h2 style={titleStyles}>{title}</h2>}
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                style={closeButtonStyles}
                aria-label="Close"
              >
                ×
              </button>
            )}
          </div>
        )}
        <div style={bodyStyles}>{children}</div>
      </div>
    </>
  );

  return createPortal(sheet, document.body);
}

export default Sheet;
