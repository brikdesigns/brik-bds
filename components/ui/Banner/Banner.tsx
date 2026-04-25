import { type ReactNode, type HTMLAttributes } from 'react';
import { Icon } from '@iconify/react';
import { Warning, Info } from '../../icons';
import { Badge } from '../Badge';
import { bdsClass } from '../../utils';
import './Banner.css';

export type BannerTone = 'announcement' | 'warning' | 'error' | 'information';

export interface BannerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Bold title text */
  title: ReactNode;
  /** Description text beside or below the title */
  description?: ReactNode;
  /**
   * Visual tone:
   * - `announcement` (default) — brand-primary surface for marketing notices
   * - `warning` / `error` / `information` — secondary surface with leading
   *   status Badge icon. Switches `role` to `alert` for assistive tech.
   *   Replaces the legacy `AlertBanner` component.
   */
  tone?: BannerTone;
  /** Action element (e.g. Button) aligned to the right */
  action?: ReactNode;
  /** Dismissible — shows close button and calls onDismiss */
  onDismiss?: () => void;
}

const STATUS_ICON: Record<Exclude<BannerTone, 'announcement'>, string> = {
  warning: Warning,
  error: Warning,
  information: Info,
};

const STATUS_BADGE: Record<Exclude<BannerTone, 'announcement'>, 'warning' | 'error' | 'info'> = {
  warning: 'warning',
  error: 'error',
  information: 'info',
};

/**
 * Banner — full-width contextual banner.
 *
 * Two tone families share the same component:
 *
 * - **`announcement`** (default) — brand-primary surface with inverse text.
 *   Use for site-wide announcements, promotions, or marketing notices.
 *   Renders with `role="banner"`.
 * - **`warning` / `error` / `information`** — secondary surface with a
 *   leading status Badge icon and primary text. Renders with `role="alert"`.
 *   Replaces the legacy `AlertBanner` component (per ADR-004 §3 — same
 *   shape, different presets = one component with a tone prop).
 *
 * @summary Full-width banner — announcement or status tones
 */
export function Banner({
  title,
  description,
  tone = 'announcement',
  action,
  onDismiss,
  className,
  style,
  ...props
}: BannerProps) {
  const isStatus = tone !== 'announcement';
  const role = isStatus ? 'alert' : 'banner';

  const badge = isStatus ? (
    <Badge
      size="xs"
      status={STATUS_BADGE[tone]}
      icon={<Icon icon={STATUS_ICON[tone]} />}
    />
  ) : null;

  return (
    <div
      role={role}
      className={bdsClass('bds-banner', `bds-banner--tone-${tone}`, className)}
      style={style}
      {...props}
    >
      <div className="bds-banner__inner">
        {badge}
        <div className="bds-banner__content">
          <span className="bds-banner__title">{title}</span>
          {description && <span className="bds-banner__description">{description}</span>}
        </div>
      </div>
      {(action || onDismiss) && (
        <div className="bds-banner__actions">
          {action}
          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Dismiss banner"
              className="bds-banner__close"
            >
              <i className="fa-solid fa-xmark" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default Banner;
