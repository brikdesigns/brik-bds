import { type ReactNode, type HTMLAttributes } from 'react';
import { Icon } from '../Icon';
import { STATUS_MAP, type StatusName } from '../../status';
import { Badge } from '../Badge';
import { bdsClass, resolveRetiredValue } from '../../utils';
import { CloseButton } from '../CloseButton';
import './Banner.css';

export type BannerTone = 'warning' | 'negative' | 'info' | 'positive';

/** Hue source — `brand` paints the brand-primary surface (ADR-033 § 2). */
export type BannerEmphasis = 'brand';

/** `announcement` was the brand surface; it is a hue source now, so it moves to `emphasis="brand"`. */
const RETIRED_TONES: Record<string, string> = {
  announcement: 'announcement',
  error: 'negative',
  information: 'info',
  success: 'positive',
};
const RETIRED_REPLACEMENTS: Record<string, string> = { announcement: 'emphasis="brand"' };

export interface BannerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Bold title text */
  title: ReactNode;
  /** Description text beside or below the title */
  description?: ReactNode;
  /**
   * Valence, rendered as a leading Badge icon:
   * - `warning` / `negative` / `info` — secondary surface, `role="alert"`.
   *   Replaces the legacy `AlertBanner` component.
   * - `positive` — secondary surface, `role="status"` (polite) — it confirms
   *   rather than alerts.
   * Omit for a plain announcement.
   */
  tone?: BannerTone;
  /**
   * Hue source. `brand` paints the brand-primary surface with inverse text and
   * renders `role="banner"`. Default when neither `tone` nor `emphasis` is set.
   */
  emphasis?: BannerEmphasis;
  /** Action element (e.g. Button) aligned to the right */
  action?: ReactNode;
  /** Dismissible — shows close button and calls onDismiss */
  onDismiss?: () => void;
}

const TONE_STATUS: Record<BannerTone, StatusName> = {
  warning: 'blocked',
  negative: 'negative',
  info: 'info',
  positive: 'complete',
};

/**
 * Banner — full-width contextual banner.
 *
 * Two axes share the same component:
 *
 * - **`emphasis="brand"`** (default with no `tone`) — brand-primary surface
 *   with inverse text. Use for site-wide announcements, promotions, or
 *   marketing notices. Renders with `role="banner"`.
 * - **`warning` / `negative` / `info`** — secondary surface with a
 *   leading status Badge icon and primary text. Renders with `role="alert"`.
 *   Replaces the legacy `AlertBanner` component (per ADR-004 §3 — same
 *   shape, different presets = one component with a tone prop).
 * - **`positive`** — secondary surface with a leading positive Badge (check
 *   icon). Renders with `role="status"` (polite) — a confirmation, not an alert.
 *
 * @summary Full-width banner — brand announcement or status tones
 */
export function Banner({
  title,
  description,
  tone,
  emphasis,
  action,
  onDismiss,
  className,
  style,
  ...props
}: BannerProps) {
  const incoming = resolveRetiredValue<string>('Banner', 'tone', tone, RETIRED_TONES, RETIRED_REPLACEMENTS);
  const resolvedTone = incoming === 'announcement' ? undefined : (incoming as BannerTone | undefined);
  const resolvedEmphasis: BannerEmphasis | undefined =
    emphasis ?? (incoming === 'announcement' || incoming === undefined ? 'brand' : undefined);
  // brand is a plain landmark (role="banner"); positive is a polite confirmation
  // (role="status"); other tones are assertive (role="alert").
  const role =
    resolvedEmphasis === 'brand' ? 'banner' : resolvedTone === 'positive' ? 'status' : 'alert';

  const badge = resolvedTone ? (
    <Badge
      size="xs"
      tone={resolvedTone}
      icon={<Icon icon={STATUS_MAP[TONE_STATUS[resolvedTone]].icon} />}
    />
  ) : null;

  return (
    <div
      role={role}
      className={bdsClass(
        'bds-banner',
        resolvedTone && `bds-banner--tone-${resolvedTone}`,
        resolvedEmphasis === 'brand' && 'bds-banner--emphasis-brand',
        className,
      )}
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
