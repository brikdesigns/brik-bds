import { type ReactNode, type CSSProperties, type HTMLAttributes } from 'react';
import { bdsClass } from '../../utils';

/**
 * AlertBanner icon variants
 */
export type AlertBannerIcon = 'info' | 'warning' | 'success' | 'error';

/**
 * AlertBanner component props
 */
export interface AlertBannerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Bold title text */
  title: ReactNode;
  /** Description text below the title */
  description?: ReactNode;
  /** Icon type shown before the content */
  icon?: AlertBannerIcon;
  /** Action element (e.g. Button) aligned to the right */
  action?: ReactNode;
}

/**
 * Font Awesome icon class mapping
 */
const iconClassMap: Record<AlertBannerIcon, string> = {
  info: 'fa-solid fa-circle-info',
  warning: 'fa-solid fa-triangle-exclamation',
  success: 'fa-solid fa-circle-check',
  error: 'fa-solid fa-circle-xmark',
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
 * Inner wrapper — icon + content side by side
 */
const innerStyles: CSSProperties = {
  display: 'flex',
  gap: 'var(--gap-sm)',
  alignItems: 'flex-start',
  flex: '1 1 0',
  minWidth: 0,
};

/**
 * Icon styles
 *
 * Token reference:
 * - --body-lg = font-size-150 = 18px (icon size via semantic token)
 */
const iconStyles: CSSProperties = {
  fontSize: 'var(--body-lg)',
  lineHeight: 'var(--font-line-height-normal)',
  flexShrink: 0,
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
 * Uses a secondary surface background with an icon, title, description,
 * and optional action button.
 *
 * @example
 * ```tsx
 * <AlertBanner
 *   icon="info"
 *   title="Update available"
 *   description="A new version is ready to install"
 *   action={<Button variant="primary" size="sm">Update now</Button>}
 * />
 * ```
 */
export function AlertBanner({
  title,
  description,
  icon = 'info',
  action,
  className,
  style,
  ...props
}: AlertBannerProps) {
  return (
    <div role="alert" className={bdsClass('bds-alert-banner', className)} style={{ ...bannerStyles, ...style }} {...props}>
      <div style={innerStyles}>
        <i className={iconClassMap[icon]} style={iconStyles} />
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
