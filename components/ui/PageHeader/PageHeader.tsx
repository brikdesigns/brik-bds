import { type HTMLAttributes, type ReactNode } from 'react';
import { Icon } from '../Icon';
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
  /**
   * Leading identity mark rendered to the left of the title — an `Avatar` for a
   * company or software entity, a `ServiceTag variant="icon"` for a service.
   */
  media?: ReactNode;
  /**
   * @deprecated Renamed to {@link PageHeaderProps.media}. `Badge` is the status
   * component; this slot has only ever held an identity mark, and the mismatch
   * got a correctly-rendered company avatar reported as a defect (#1705). Kept
   * as a non-breaking alias for one release — pass `media` in new code.
   */
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
  /**
   * Title scale. Default: 'lg'.
   *
   * The step names are offset from the tokens they render — `lg` is the
   * page-title default and renders `--heading-xl`, the Section-headline step
   * the build standards assign a page's `<h1>`. Only `md` and `sm` name-match
   * their token. `lg` is not `--heading-lg`. See brik-bds#1997.
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Pin the header to the top of its scroll container on scroll
   * (`position: sticky`). Renders an opaque `--surface-primary` background so
   * body content scrolls cleanly beneath it. Default `false` — non-sticky
   * consumers are unaffected. The header sticks within the nearest scrolling
   * ancestor; ensure that container, not the window, owns the scroll.
   */
  sticky?: boolean;
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
 * PageHeader — composable page-level header with breadcrumbs, media, actions, metadata, and tabs.
 *
 * ## Tunable spacing
 *
 * Four component-scoped CSS variables on `.bds-page-header` let consumers
 * adjust the internal rhythm without forking the component. Override at any
 * cascade level (theme file, `globals.css`, `style` prop). Defaults preserve
 * the lean 0.57.0 shape:
 *
 * - `--page-header-section-gap` (default `--gap-xl`, 24px) — between
 *   root sections (inner / metadata / tabs).
 * - `--page-header-content-gap` (default `--gap-lg`, 16px) — between
 *   the title-row and the subtitle.
 * - `--page-header-actions-gap` (default `--gap-sm`, 6px) — between
 *   the content column (title + subtitle) and the actions column.
 * - `--page-header-padding-bottom` (default `0`) — bottom padding below the
 *   header. The header draws no default divider (a header with no `tabs` ends
 *   flush against the body; a `tabs` slot renders TabBar's own 2px baseline),
 *   so this is `0` unless a consumer restores a manual divider and wants
 *   breathing room above it.
 *
 * @summary Page-level header — title, breadcrumbs, actions, tabs
 */
export function PageHeader({
  title,
  subtitle,
  media,
  badge,
  breadcrumbs,
  actions,
  tabs,
  metadata,
  size = 'lg',
  sticky = false,
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
  // `media` is the canonical slot; `badge` is the deprecated alias (#1705).
  const resolvedMedia: ReactNode = media ?? badge;

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
      className={bdsClass(
        'bds-page-header',
        size !== 'lg' && `bds-page-header--${size}`,
        sticky && 'bds-page-header--sticky',
        className,
      )}
      style={style}
      data-mode={mode}
      {...props}
    >
      {breadcrumbs}

      <div className="bds-page-header__inner">
        <div className="bds-page-header__content">
          <div className="bds-page-header__title-row">
            {/* `media` wins over the deprecated `badge` alias, so a consumer
                mid-migration that passes both renders one mark, not two. */}
            {resolvedMedia && <div className="bds-page-header__media">{resolvedMedia}</div>}
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

      {tabs && <div className="bds-page-header__tabs">{tabs}</div>}
    </div>
  );
}

export default PageHeader;
