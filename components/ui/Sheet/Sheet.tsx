import { type ReactNode, type CSSProperties, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@iconify/react';
import { XBold, ArrowLeftBold, Pen } from '../../icons';
import { Button } from '../Button';
import { bdsClass } from '../../utils';
import './Sheet.css';

export type SheetSide = 'right' | 'left' | 'bottom';

export interface SheetTab {
  id: string;
  label: string;
  content: ReactNode;
}

export type SheetVariant = 'default' | 'floating';
export type SheetMode = 'read' | 'edit';

/**
 * Ancillary action rendered on the left side of the auto-footer (e.g.
 * "Refresh Brief", "Run Extraction"). Suppressed when `mode === 'edit'`
 * to avoid ambiguity about what Save commits.
 *
 * Ignored when a custom `footer` is supplied — compose manually in that case.
 */
export interface SheetSecondaryAction {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
}

export interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  children?: ReactNode;
  side?: SheetSide;
  title?: ReactNode;
  /**
   * Eyebrow label rendered above the title in `text-muted`. Use for short
   * categorical context like entity type or parent record (e.g. "Company",
   * "Strategic Brief").
   */
  subtitle?: ReactNode;
  /**
   * Long-form secondary text rendered under the title. Use for record state,
   * timestamps, or descriptive context (e.g. "Active · Updated 2 days ago").
   */
  description?: ReactNode;
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
  /**
   * When set, renders a back button in the header for nested sheet navigation.
   */
  onBack?: () => void;
  /**
   * Sheet mode. When set, the footer auto-renders mode-appropriate actions
   * unless a custom `footer` is provided.
   * - `read` with `onEdit` → renders `[Close] [Edit]` (primary Edit)
   * - `edit` → renders `[Cancel] [Save]` (primary Save)
   */
  mode?: SheetMode;
  /** Triggered from the primary action in read mode (switch to edit) */
  onEdit?: () => void;
  /** Triggered from the primary action in edit mode (commit changes) */
  onSave?: () => void;
  /** Triggered from the secondary action in edit mode. Falls back to `onClose`. */
  onCancel?: () => void;
  editLabel?: string;
  saveLabel?: string;
  cancelLabel?: string;
  closeLabel?: string;
  /** Disable the save button (e.g. while form is invalid) */
  saveDisabled?: boolean;
  /** Show loading state on the save button */
  saveLoading?: boolean;
  /**
   * Custom footer. When provided, overrides mode-driven auto-footer.
   * Use this for non-standard action sets.
   */
  footer?: ReactNode;
  /**
   * Optional left-aligned ancillary action rendered in the auto-footer
   * alongside the mode-driven primary actions. Suppressed in edit mode.
   * Ignored when a custom `footer` is supplied.
   */
  secondaryAction?: SheetSecondaryAction;
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
 * Read / edit mode: pass `mode="read"` with `onEdit` for a view-only sheet that
 * exposes a primary Edit action in the footer. Pass `mode="edit"` with `onSave`
 * to switch into form state with Cancel / Save actions. Custom `footer` always
 * wins when supplied.
 */
export function Sheet({
  isOpen,
  onClose,
  children,
  side = 'right',
  title,
  subtitle,
  description,
  width = '400px',
  variant = 'default',
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
  onBack,
  mode,
  onEdit,
  onSave,
  onCancel,
  editLabel = 'Edit',
  saveLabel = 'Save',
  cancelLabel = 'Cancel',
  closeLabel = 'Close',
  saveDisabled,
  saveLoading,
  footer,
  secondaryAction,
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

  const widthStyle: CSSProperties | undefined =
    side !== 'bottom' ? { width } : undefined;

  const activeTabContent = tabs?.find((t) => t.id === activeTab)?.content;

  // Secondary action renders on the left side of the footer in read mode only.
  // Hidden during edit to keep Save's commit surface unambiguous.
  const secondaryActionNode = secondaryAction && mode !== 'edit' ? (
    <Button
      variant="secondary"
      onClick={secondaryAction.onClick}
      disabled={secondaryAction.disabled}
      loading={secondaryAction.loading}
      iconBefore={secondaryAction.icon}
    >
      {secondaryAction.label}
    </Button>
  ) : null;

  const primaryActionsNode = (() => {
    if (mode === 'edit' && onSave) {
      return (
        <>
          <Button variant="ghost" onClick={onCancel ?? onClose}>
            {cancelLabel}
          </Button>
          <Button
            variant="primary"
            onClick={onSave}
            disabled={saveDisabled}
            loading={saveLoading}
          >
            {saveLabel}
          </Button>
        </>
      );
    }
    if (mode === 'read' && onEdit) {
      return (
        <>
          <Button variant="ghost" onClick={onClose}>
            {closeLabel}
          </Button>
          <Button variant="primary" onClick={onEdit} iconBefore={<Icon icon={Pen} />}>
            {editLabel}
          </Button>
        </>
      );
    }
    return null;
  })();

  const resolvedFooter = (() => {
    if (footer !== undefined) return footer;
    if (!secondaryActionNode && !primaryActionsNode) return null;
    return (
      <>
        <div className="bds-sheet__footer-secondary">{secondaryActionNode}</div>
        <div className="bds-sheet__footer-primary">{primaryActionsNode}</div>
      </>
    );
  })();

  const hasHeaderContent = title || subtitle || description || onBack || showCloseButton;

  const sheet = (
    <>
      {!isFloating && <div className="bds-sheet-backdrop" onClick={handleBackdropClick} />}
      <div
        className={bdsClass('bds-sheet', `bds-sheet--${side}`, isFloating ? 'bds-sheet--floating' : '')}
        role="dialog"
        aria-modal={!isFloating}
        style={widthStyle}
      >
        {hasHeaderContent && (
          <div className={bdsClass('bds-sheet__header', tabs ? 'bds-sheet__header--has-tabs' : '')}>
            <div className="bds-sheet__header-top">
              <div className="bds-sheet__header-lead">
                {onBack && (
                  <button
                    type="button"
                    onClick={onBack}
                    className="bds-sheet__back-btn"
                    aria-label="Back"
                  >
                    <Icon icon={ArrowLeftBold} />
                  </button>
                )}
                <div className="bds-sheet__titles">
                  {subtitle && <span className="bds-sheet__subtitle">{subtitle}</span>}
                  {title && <h2 className="bds-sheet__title">{title}</h2>}
                  {description && <p className="bds-sheet__description">{description}</p>}
                </div>
              </div>
              {showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  className="bds-sheet__close"
                  aria-label="Close"
                >
                  <Icon icon={XBold} />
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
        {resolvedFooter && <div className="bds-sheet__footer">{resolvedFooter}</div>}
      </div>
    </>
  );

  return createPortal(sheet, document.body);
}

export default Sheet;
