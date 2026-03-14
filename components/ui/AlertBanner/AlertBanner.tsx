import { type ReactNode, type HTMLAttributes } from 'react';
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

const badgeStatusMap: Record<AlertBannerVariant, 'warning' | 'error' | 'neutral'> = {
  warning: 'warning',
  error: 'error',
  information: 'neutral',
};

const iconClassMap: Record<AlertBannerVariant, string> = {
  warning: 'fa-solid fa-triangle-exclamation',
  error: 'fa-solid fa-triangle-exclamation',
  information: 'fa-solid fa-circle-info',
};

/**
 * AlertBanner — contextual banner for important messages
 *
 * Uses a secondary surface background with an icon-only Badge,
 * title, description, and optional action button.
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
          icon={<i className={iconClassMap[variant]} />}
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
