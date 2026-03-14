import { type ReactNode, type CSSProperties, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { bdsClass } from '../../utils';
import './Sheet.css';

export type SheetSide = 'right' | 'left' | 'bottom';

export interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  side?: SheetSide;
  title?: ReactNode;
  /** Width for left/right sheets (default: 400px) */
  width?: string;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
}

/**
 * Sheet — sliding panel overlay for contextual content.
 *
 * Width is a runtime value passed via inline style since it's user-configurable.
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
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
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

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdrop && e.target === e.currentTarget) onClose();
  };

  // Width is runtime-configurable, so it stays as inline style
  const widthStyle: CSSProperties | undefined =
    side !== 'bottom' ? { width } : undefined;

  const sheet = (
    <>
      <div className="bds-sheet-backdrop" onClick={handleBackdropClick} />
      <div
        className={bdsClass('bds-sheet', `bds-sheet--${side}`)}
        role="dialog"
        aria-modal="true"
        style={widthStyle}
      >
        {(title || showCloseButton) && (
          <div className="bds-sheet__header">
            {title && <h2 className="bds-sheet__title">{title}</h2>}
            {showCloseButton && (
              <button type="button" onClick={onClose} className="bds-sheet__close" aria-label="Close">
                ×
              </button>
            )}
          </div>
        )}
        <div className="bds-sheet__body">{children}</div>
      </div>
    </>
  );

  return createPortal(sheet, document.body);
}

export default Sheet;
