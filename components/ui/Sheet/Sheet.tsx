import { type ReactNode, type CSSProperties, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@iconify/react';
import { X } from '../../icons';
import { bdsClass } from '../../utils';
import './Sheet.css';

export type SheetSide = 'right' | 'left' | 'bottom';

export interface SheetTab {
  id: string;
  label: string;
  content: ReactNode;
}

export type SheetVariant = 'default' | 'floating';

export interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  children?: ReactNode;
  side?: SheetSide;
  title?: ReactNode;
  /** Width for left/right sheets (default: 400px) */
  width?: string;
  /**
   * Visual variant:
   * - `default` — full-height overlay with backdrop (forms, edit workflows)
   * - `floating` — rounded floating panel with elevation, no backdrop (read-only detail views)
   */
  variant?: SheetVariant;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  /** Optional footer pinned to bottom of sheet */
  footer?: ReactNode;
  /** Optional tabs rendered below the header. When provided, children is ignored. */
  tabs?: SheetTab[];
  /** Controlled active tab id (defaults to first tab) */
  activeTab?: string;
  /** Called when a tab is selected */
  onTabChange?: (tabId: string) => void;
}

/**
 * Sheet — sliding panel overlay for contextual content.
 *
 * Width is a runtime value passed via inline style since it's user-configurable.
 * Close icon matches Modal dismiss treatment (FontAwesome xmark).
 *
 * Tab variant: pass `tabs` array to render a tab bar below the header.
 * Each tab's content replaces `children` in the body area.
 */
export function Sheet({
  isOpen,
  onClose,
  children,
  side = 'right',
  title,
  width = '400px',
  variant = 'default',
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
  footer,
  tabs,
  activeTab: controlledTab,
  onTabChange,
}: SheetProps) {
  const isFloating = variant === 'floating';
  const [internalTab, setInternalTab] = useState(tabs?.[0]?.id ?? '');

  const activeTab = controlledTab ?? internalTab;

  useEffect(() => {
    if (tabs && !controlledTab) {
      setInternalTab(tabs[0]?.id ?? '');
    }
  }, [tabs, controlledTab]);

  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  useEffect(() => {
    if (isOpen && !isFloating) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen, isFloating]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdrop && e.target === e.currentTarget) onClose();
  };

  const handleTabClick = (tabId: string) => {
    if (onTabChange) {
      onTabChange(tabId);
    } else {
      setInternalTab(tabId);
    }
  };

  // Width is runtime-configurable, so it stays as inline style
  const widthStyle: CSSProperties | undefined =
    side !== 'bottom' ? { width } : undefined;

  const activeTabContent = tabs?.find((t) => t.id === activeTab)?.content;

  const sheet = (
    <>
      {!isFloating && <div className="bds-sheet-backdrop" onClick={handleBackdropClick} />}
      <div
        className={bdsClass('bds-sheet', `bds-sheet--${side}`, isFloating ? 'bds-sheet--floating' : '')}
        role="dialog"
        aria-modal={!isFloating}
        style={widthStyle}
      >
        {(title || showCloseButton) && (
          <div className={bdsClass('bds-sheet__header', tabs ? 'bds-sheet__header--has-tabs' : '')}>
            <div className="bds-sheet__header-top">
              {title && <h2 className="bds-sheet__title">{title}</h2>}
              {showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  className="bds-sheet__close"
                  aria-label="Close"
                >
                  <Icon icon={X} />
                </button>
              )}
            </div>
            {tabs && (
              <div className="bds-sheet__tabs" role="tablist">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    className={bdsClass(
                      'bds-sheet__tab',
                      activeTab === tab.id ? 'bds-sheet__tab--active' : ''
                    )}
                    onClick={() => handleTabClick(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        <div className="bds-sheet__body">
          {tabs ? activeTabContent : children}
        </div>
        {footer && <div className="bds-sheet__footer">{footer}</div>}
      </div>
    </>
  );

  return createPortal(sheet, document.body);
}

export default Sheet;
