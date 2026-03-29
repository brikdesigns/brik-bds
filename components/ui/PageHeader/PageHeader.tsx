import { type HTMLAttributes, type ReactNode } from 'react';
import { bdsClass } from '../../utils';
import './PageHeader.css';

export interface MetadataItem {
  label: string;
  value: ReactNode;
}

export interface PageHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  /** Badge displayed to the left of the title (e.g. ServiceBadge) */
  badge?: ReactNode;
  breadcrumbs?: ReactNode;
  actions?: ReactNode;
  tabs?: ReactNode;
  metadata?: MetadataItem[];
  /** Show divider and top padding above metadata. Default: true */
  showDivider?: boolean;
  /** Remove horizontal padding (for layouts that provide their own). Default: false */
  flush?: boolean;
  /** Title scale. Default: 'lg' */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * PageHeader — composable page-level header with breadcrumbs, badge, actions, metadata, and tabs.
 */
export function PageHeader({
  title,
  subtitle,
  badge,
  breadcrumbs,
  actions,
  tabs,
  metadata,
  showDivider = true,
  flush = false,
  size = 'lg',
  className,
  style,
  ...props
}: PageHeaderProps) {
  return (
    <div
      className={bdsClass('bds-page-header', flush && 'bds-page-header--flush', size !== 'lg' && `bds-page-header--${size}`, className)}
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
        <div className={bdsClass('bds-page-header__metadata', !showDivider && 'bds-page-header__metadata--no-divider')}>
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
