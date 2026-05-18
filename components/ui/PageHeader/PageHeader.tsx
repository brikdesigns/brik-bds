import { type HTMLAttributes, type ReactNode } from 'react';
import { Icon } from '@iconify/react';
import { Pen } from '../../icons';
import { Button } from '../Button';
import { ButtonGroup } from '../ButtonGroup';
import { bdsClass } from '../../utils';
import './PageHeader.css';

export interface MetadataItem {
  label: string;
  value: ReactNode;
}

/**
 * Bimodal page state, symmetric with {@link import('../Sheet').SheetMode `SheetMode`}.
 *
 * - `read` — the page renders read-only content; auto-renders `[Edit]`
 *   in `actions` when `onEdit` is provided.
 * - `edit` — the page renders a form; auto-renders `[Cancel] [Save]`
 *   ButtonGroup in `actions` when `onSave` is provided.
 *
 * An explicit `actions` prop always wins over mode-driven actions
 * (mirrors `Sheet`'s `footer` override).
 *
 * When `mode` is unset, `PageHeader` behaves as before — no breaking change.
 */
export type PageHeaderMode = 'read' | 'edit';

export interface PageHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /** Page title — rendered as the H1. */
  title: string;
  /** Optional subtitle paragraph rendered under the title. */
  subtitle?: string;
  /** Badge displayed to the left of the title (e.g. `<ServiceTag variant="icon">`) */
  badge?: ReactNode;
  /** Breadcrumb element (typically a `Breadcrumb` component) rendered above the title row. */
  breadcrumbs?: ReactNode;
  /**
   * Right-aligned action element(s) (primary `Button`, dropdown menu, etc.).
   * When set, overrides any mode-driven auto-actions.
   */
  actions?: ReactNode;
  /** Optional `TabBar` (or equivalent) rendered at the bottom of the header — page-level navigation. */
  tabs?: ReactNode;
  /** Key/value pairs rendered below the title row (e.g. Owner, Status, Updated). */
  metadata?: MetadataItem[];
  /** Summary content (e.g. stat cards) rendered between metadata and tabs. */
  stats?: ReactNode;
  /** Title scale. Default: 'lg' */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Bimodal page state. Drives auto-rendered `actions` when no explicit
   * `actions` slot is provided. See {@link PageHeaderMode}.
   */
  mode?: PageHeaderMode;
  /** Navigation handler in read mode. Wires the auto-rendered `[Edit]` button. */
  onEdit?: () => void;
  /** Submit handler in edit mode. Wires the auto-rendered `[Save]` button. */
  onSave?: () => void;
  /** Discard handler in edit mode. Wires the auto-rendered `[Cancel]` button. */
  onCancel?: () => void;
  /** Show loading state on the auto-rendered `[Save]` button. */
  saveLoading?: boolean;
  /** Disable the auto-rendered `[Save]` button (e.g. while form is invalid). */
  saveDisabled?: boolean;
  /** Label for the auto-rendered `[Edit]` button. Default `"Edit"`. */
  editLabel?: string;
  /** Label for the auto-rendered `[Save]` button. Default `"Save"`. */
  saveLabel?: string;
  /** Label for the auto-rendered `[Cancel]` button. Default `"Cancel"`. */
  cancelLabel?: string;
}

/**
 * PageHeader — composable page-level header with breadcrumbs, badge, actions, metadata, stats, and tabs.
 *
 * ## Tunable spacing
 *
 * Four component-scoped CSS variables on `.bds-page-header` let consumers
 * adjust the internal rhythm without forking the component. Override at any
 * cascade level (theme file, `globals.css`, `style` prop). Defaults preserve
 * the lean 0.57.0 shape:
 *
 * - `--page-header-section-gap` (default `var(--gap-xl)` = 24px) — between
 *   root sections (inner / metadata / stats / tabs).
 * - `--page-header-content-gap` (default `var(--gap-sm)` = 6px) — between
 *   the title-row and the subtitle.
 * - `--page-header-actions-gap` (default `var(--gap-sm)` = 6px) — between
 *   the content column (title + subtitle) and the actions column.
 * - `--page-header-padding-bottom` (default `0`) — breathing room before the
 *   bottom divider, useful when the divider sits flush against the title.
 *
 * @summary Page-level header — title, breadcrumbs, actions, tabs
 */
export function PageHeader({
  title,
  subtitle,
  badge,
  breadcrumbs,
  actions,
  tabs,
  metadata,
  stats,
  size = 'lg',
  mode,
  onEdit,
  onSave,
  onCancel,
  saveLoading,
  saveDisabled,
  editLabel = 'Edit',
  saveLabel = 'Save',
  cancelLabel = 'Cancel',
  className,
  style,
  ...props
}: PageHeaderProps) {
  // Explicit `actions` wins; otherwise compose mode-driven actions.
  // `mode='read'` + `onEdit` → `[Edit]` (primary, pen icon).
  // `mode='edit'` + (onSave || onCancel) → `[Cancel] [Save]` ButtonGroup.
  const resolvedActions: ReactNode = (() => {
    if (actions !== undefined) return actions;
    if (mode === 'read' && onEdit) {
      return (
        <Button variant="primary" onClick={onEdit} iconBefore={<Icon icon={Pen} />}>
          {editLabel}
        </Button>
      );
    }
    if (mode === 'edit' && (onSave || onCancel)) {
      return (
        <ButtonGroup align="end">
          {onCancel && (
            <Button variant="ghost" onClick={onCancel}>
              {cancelLabel}
            </Button>
          )}
          {onSave && (
            <Button
              variant="primary"
              onClick={onSave}
              disabled={saveDisabled}
              loading={saveLoading}
            >
              {saveLabel}
            </Button>
          )}
        </ButtonGroup>
      );
    }
    return null;
  })();

  return (
    <div
      className={bdsClass('bds-page-header', size !== 'lg' && `bds-page-header--${size}`, className)}
      style={style}
      data-mode={mode}
      {...props}
    >
      {breadcrumbs}

      <div className="bds-page-header__inner">
        <div className="bds-page-header__content">
          <div className="bds-page-header__title-row">
            {badge && <div className="bds-page-header__badge">{badge}</div>}
            <h1 className="bds-page-header__title">{title}</h1>
          </div>
          {subtitle && <p className="bds-page-header__subtitle">{subtitle}</p>}
        </div>
        {resolvedActions && <div className="bds-page-header__actions">{resolvedActions}</div>}
      </div>

      {metadata && metadata.length > 0 && (
        <div className="bds-page-header__metadata">
          <div className="bds-page-header__metadata-inner">
            {metadata.map((item) => (
              <div key={item.label} className="bds-page-header__metadata-item">
                <span className="bds-page-header__metadata-label">{item.label}</span>
                <span className="bds-page-header__metadata-value">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats && <div className="bds-page-header__stats">{stats}</div>}

      {tabs && <div className="bds-page-header__tabs">{tabs}</div>}
    </div>
  );
}

export default PageHeader;
