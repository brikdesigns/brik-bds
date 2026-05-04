import { type HTMLAttributes, type ReactNode } from 'react';
import { bdsClass } from '../../utils';
import './PageHeader.css';

export interface MetadataItem {
  label: string;
  value: ReactNode;
}

export interface PageHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /** Page title — rendered as the H1. */
  title: string;
  /** Optional subtitle paragraph rendered under the title. */
  subtitle?: string;
  /** Badge displayed to the left of the title (e.g. ServiceBadge) */
  badge?: ReactNode;
  /** Breadcrumb element (typically a `Breadcrumb` component) rendered above the title row. */
  breadcrumbs?: ReactNode;
  /** Right-aligned action element(s) (primary `Button`, dropdown menu, etc.). */
  actions?: ReactNode;
  /** Optional `TabBar` (or equivalent) rendered at the bottom of the header — page-level navigation. */
  tabs?: ReactNode;
  /** Key/value pairs rendered below the title row (e.g. Owner, Status, Updated). */
  metadata?: MetadataItem[];
  /** Summary content (e.g. stat cards) rendered between metadata and tabs. */
  stats?: ReactNode;
  /** Title scale. Default: 'lg' */
  size?: 'sm' | 'md' | 'lg';
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
  className,
  style,
  ...props
}: PageHeaderProps) {
  return (
    <div
      className={bdsClass('bds-page-header', size !== 'lg' && `bds-page-header--${size}`, className)}
      style={style}
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
        {actions && <div className="bds-page-header__actions">{actions}</div>}
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
