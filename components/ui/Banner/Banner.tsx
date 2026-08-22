import { type ReactNode, type HTMLAttributes } from 'react';
import { Icon } from '../Icon';
import { Warning, Info, CheckCircle } from '../../icons';
import { Badge } from '../Badge';
import { bdsClass, resolveRetiredValue } from '../../utils';
import { CloseButton } from '../CloseButton';
import './Banner.css';

export type BannerTone = 'announcement' | 'warning' | 'negative' | 'info' | 'positive';

const RETIRED_TONES: Record<string, BannerTone> = {
  error: 'negative',
  information: 'info',
  success: 'positive',
};

export interface BannerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Bold title text */
  title: ReactNode;
  /** Description text beside or below the title */
  description?: ReactNode;
  /**
   * Visual tone:
   * - `announcement` (default) — brand-primary surface for marketing notices
   * - `warning` / `negative` / `info` — secondary surface with leading
   *   status Badge icon. Switches `role` to `alert` for assistive tech.
   *   Replaces the legacy `AlertBanner` component.
   * - `positive` — secondary surface with a leading positive Badge (check
   *   icon). Renders `role="status"` (polite) — it confirms rather than alerts.
   */
  tone?: BannerTone;
  /** Action element (e.g. Button) aligned to the right */
  action?: ReactNode;
  /** Dismissible — shows close button and calls onDismiss */
  onDismiss?: () => void;
}

const STATUS_ICON: Record<Exclude<BannerTone, 'announcement'>, string> = {
  warning: Warning,
  negative: Warning,
  info: Info,
  positive: CheckCircle,
};

const STATUS_BADGE: Record<
  Exclude<BannerTone, 'announcement'>,
  'warning' | 'negative' | 'info' | 'positive'
> = {
  warning: 'warning',
  negative: 'negative',
  info: 'info',
  positive: 'positive',
};

/**
 * Banner — full-width contextual banner.
 *
 * Two tone families share the same component:
 *
 * - **`announcement`** (default) — brand-primary surface with inverse text.
 *   Use for site-wide announcements, promotions, or marketing notices.
 *   Renders with `role="banner"`.
 * - **`warning` / `negative` / `info`** — secondary surface with a
 *   leading status Badge icon and primary text. Renders with `role="alert"`.
 *   Replaces the legacy `AlertBanner` component (per ADR-004 §3 — same
 *   shape, different presets = one component with a tone prop).
 * - **`positive`** — secondary surface with a leading positive Badge (check
 *   icon). Renders with `role="status"` (polite) — a confirmation, not an alert.
 *
 * @summary Full-width banner — announcement or status tones
 */
export function Banner({
  title,
  description,
  tone,
  action,
  onDismiss,
  className,
  style,
  ...props
}: BannerProps) {
  const resolvedTone =
    resolveRetiredValue('Banner', 'tone', tone, RETIRED_TONES) ?? 'announcement';
  const isStatus = resolvedTone !== 'announcement';
  // positive is a polite confirmation (role="status"); other status tones are
  // assertive (role="alert"); announcement is a plain landmark (role="banner").
  const role = !isStatus ? 'banner' : resolvedTone === 'positive' ? 'status' : 'alert';

  const badge = isStatus ? (
    <Badge
      size="xs"
      tone={STATUS_BADGE[resolvedTone]}
      icon={<Icon icon={STATUS_ICON[resolvedTone]} />}
    />
  ) : null;

  return (
    <div
      role={role}
      className={bdsClass('bds-banner', `bds-banner--tone-${resolvedTone}`, className)}
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
            <CloseButton label="Dismiss banner" onClick={onDismiss} />
          )}
        </div>
      )}
    </div>
  );
}

export default Banner;
