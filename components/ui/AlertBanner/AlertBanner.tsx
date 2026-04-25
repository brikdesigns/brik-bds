import { type ReactNode, type HTMLAttributes } from 'react';
import { Icon } from '@iconify/react';
import { Warning, Info } from '../../icons';
import { bdsClass } from '../../utils';
import { Badge } from '../Badge';
import './AlertBanner.css';

export type AlertBannerVariant = 'warning' | 'error' | 'information';

export interface AlertBannerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Bold title text */
  title: ReactNode;
  /** Description text below the title */
  description?: ReactNode;
  /** Variant determines icon and badge color */
  variant?: AlertBannerVariant;
  /** Action element (e.g. Button) aligned to the right */
  action?: ReactNode;
}

const badgeStatusMap: Record<AlertBannerVariant, 'warning' | 'error' | 'info'> = {
  warning: 'warning',
  error: 'error',
  information: 'info',
};

const iconMap: Record<AlertBannerVariant, string> = {
  warning: Warning,
  error: Warning,
  information: Info,
};

/**
 * AlertBanner — contextual banner for important messages
 *
 * Uses a secondary surface background with an icon-only Badge,
 * title, description, and optional action button.
 *
 * @deprecated Use `<Banner tone="warning|error|information">` instead.
 * Same shape, same visual treatment, with `tone="information"` covering
 * the previous `variant="information"` default. The consolidated Banner
 * component also supports `onDismiss` for a close button. Slated for
 * deletion in a future major version once consumers migrate.
 *
 * Migration:
 * ```tsx
 * // before
 * <AlertBanner variant="warning" title="Heads up" description="..."
 *   action={<Button>Review</Button>} />
 *
 * // after
 * <Banner tone="warning" title="Heads up" description="..."
 *   action={<Button>Review</Button>} />
 * ```
 *
 * Tracked under ADR-004 — see docs/adrs/ADR-004-component-bloat-guardrails.md.
 *
 * @summary Status banner (deprecated — use Banner)
 */
export function AlertBanner({
  title,
  description,
  variant = 'information',
  action,
  className,
  style,
  ...props
}: AlertBannerProps) {
  return (
    <div role="alert" className={bdsClass('bds-alert-banner', className)} style={style} {...props}>
      <div className="bds-alert-banner__inner">
        <Badge
          size="xs"
          status={badgeStatusMap[variant]}
          icon={<Icon icon={iconMap[variant]} />}
        />
        <div className="bds-alert-banner__content">
          <span className="bds-alert-banner__title">{title}</span>
          {description && <span className="bds-alert-banner__description">{description}</span>}
        </div>
      </div>
      {action && <div className="bds-alert-banner__action">{action}</div>}
    </div>
  );
}

export default AlertBanner;
