import { type ReactNode, type CSSProperties, type HTMLAttributes } from 'react';
import { bdsClass } from '../../utils';
import { Badge } from '../Badge';

/**
 * AlertBanner variant types
 */
export type AlertBannerVariant = 'warning' | 'error' | 'information';

/**
 * AlertBanner component props
 */
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

/**
 * Variant → Badge status mapping
 *
 * Token reference:
 * - warning → Badge status="warning" (--color-system-yellow)
 * - error → Badge status="error" (--color-system-red)
 * - information → Badge status="neutral" (--background-secondary)
 */
const badgeStatusMap: Record<AlertBannerVariant, 'warning' | 'error' | 'neutral'> = {
  warning: 'warning',
  error: 'error',
  information: 'neutral',
};

/**
 * Variant → Font Awesome icon class mapping
 */
const iconClassMap: Record<AlertBannerVariant, string> = {
  warning: 'fa-solid fa-triangle-exclamation',
  error: 'fa-solid fa-triangle-exclamation',
  information: 'fa-solid fa-circle-info',
};

/**
 * AlertBanner container styles
 *
 * Token reference:
 * - --surface-secondary (light gray background)
 * - --text-primary (dark text)
 * - --padding-lg = 24px (all sides)
 * - --border-radius-sm = 2px (corners)
 * - --gap-lg = 16px (gap between content and action)
 */
const bannerStyles: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 'var(--gap-lg)',
  backgroundColor: 'var(--surface-secondary)',
  color: 'var(--text-primary)',
  padding: 'var(--padding-lg)',
  borderRadius: 'var(--border-radius-sm)',
  width: '100%',
  boxSizing: 'border-box',
};

/**
 * Inner wrapper — badge + content side by side
 */
const innerStyles: CSSProperties = {
  display: 'flex',
  gap: 'var(--gap-sm)',
  alignItems: 'flex-start',
  flex: '1 1 0',
  minWidth: 0,
};

/**
 * Content wrapper — title + description stacked
 *
 * Token reference:
 * - --gap-sm = 4px (gap between title and description)
 */
const contentStyles: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--gap-sm)',
  flex: '1 1 0',
  minWidth: 0,
};

/**
 * Title text styles
 *
 * Token reference:
 * - --font-family-label (label font)
 * - --font-weight-semi-bold (SemiBold)
 * - --label-md = font-size-100 = 16px
 * - --font-line-height-tight = 100% (tight)
 */
const titleStyles: CSSProperties = {
  fontFamily: 'var(--font-family-label)',
  fontWeight: 'var(--font-weight-semi-bold)' as unknown as number,
  fontSize: 'var(--label-md)',
  lineHeight: 'var(--font-line-height-tight)',
};

/**
 * Description text styles
 *
 * Token reference:
 * - --font-family-body (body font)
 * - --font-weight-regular (Regular)
 * - --body-md = font-size-100 = 16px
 * - --font-line-height-normal = 150% (comfortable reading)
 */
const descriptionStyles: CSSProperties = {
  fontFamily: 'var(--font-family-body)',
  fontWeight: 'var(--font-weight-regular)' as unknown as number,
  fontSize: 'var(--body-md)',
  lineHeight: 'var(--font-line-height-normal)',
};

/**
 * AlertBanner - BDS alert notification banner
 *
 * A contextual banner for important messages requiring user attention.
 * Uses a secondary surface background with an icon-only Badge, title,
 * description, and optional action button.
 *
 * Variants:
 * - warning: yellow badge with triangle icon
 * - error: red badge with triangle-exclamation icon
 * - information: neutral badge with circle-info icon
 *
 * @example
 * ```tsx
 * <AlertBanner
 *   variant="information"
 *   title="Update available"
 *   description="A new version is ready to install"
 *   action={<Button variant="primary" size="sm">Update now</Button>}
 * />
 * ```
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
    <div role="alert" className={bdsClass('bds-alert-banner', className)} style={{ ...bannerStyles, ...style }} {...props}>
      <div style={innerStyles}>
        <Badge
          size="xs"
          status={badgeStatusMap[variant]}
          icon={<i className={iconClassMap[variant]} />}
        />
        <div style={contentStyles}>
          <span style={titleStyles}>{title}</span>
          {description && <span style={descriptionStyles}>{description}</span>}
        </div>
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  );
}

export default AlertBanner;
