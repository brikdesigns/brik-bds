import { type ReactNode, type CSSProperties, type HTMLAttributes } from 'react';

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
 * - --_color---surface--secondary (light gray background)
 * - --_color---text--primary (dark text)
 * - --_space---lg = 16px (vertical padding)
 * - --_space---xl = 24px (horizontal padding)
 * - --_border-radius---sm = 2px (corners)
 * - --_space---gap--lg = 16px (gap between content and action)
 */
const bannerStyles: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 'var(--_space---gap--lg)',
  backgroundColor: 'var(--_color---surface--secondary)',
  color: 'var(--_color---text--primary)',
  padding: 'var(--_space---lg) var(--_space---xl)',
  borderRadius: 'var(--_border-radius---sm)',
  width: '100%',
  boxSizing: 'border-box',
};

/**
 * Inner wrapper — icon + content side by side
 */
const innerStyles: CSSProperties = {
  display: 'flex',
  gap: 'var(--_space---gap--md)',
  alignItems: 'flex-start',
  flex: '1 1 0',
  minWidth: 0,
};

/**
 * Icon styles
 *
 * Token reference:
 * - --_typography---body--lg = font-size-150 = 18px (icon size via semantic token)
 */
const iconStyles: CSSProperties = {
  fontSize: 'var(--_typography---body--lg)',
  lineHeight: 'var(--font-line-height--150)',
  flexShrink: 0,
};

/**
 * Content wrapper — title + description stacked
 *
 * Token reference:
 * - --_space---gap--sm = 4px (gap between title and description)
 */
const contentStyles: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--_space---gap--md)',
  flex: '1 1 0',
  minWidth: 0,
};

/**
 * Title text styles
 *
 * Token reference:
 * - --_typography---font-family--label (label font)
 * - --font-weight--semi-bold (SemiBold)
 * - --_typography---label--md-base = font-size-100 = 16px
 * - --font-line-height--100 = 100% (tight)
 */
const titleStyles: CSSProperties = {
  fontFamily: 'var(--_typography---font-family--label)',
  fontWeight: 'var(--font-weight--semi-bold)' as unknown as number,
  fontSize: 'var(--_typography---label--md-base)',
  lineHeight: 'var(--font-line-height--100)',
};

/**
 * Description text styles
 *
 * Token reference:
 * - --_typography---font-family--body (body font)
 * - --font-weight--regular (Regular)
 * - --_typography---body--md-base = font-size-100 = 16px
 * - --font-line-height--150 = 150% (comfortable reading)
 */
const descriptionStyles: CSSProperties = {
  fontFamily: 'var(--_typography---font-family--body)',
  fontWeight: 'var(--font-weight--regular)' as unknown as number,
  fontSize: 'var(--_typography---body--md-base)',
  lineHeight: 'var(--font-line-height--150)',
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
  style,
  ...props
}: AlertBannerProps) {
  return (
    <div role="alert" style={{ ...bannerStyles, ...style }} {...props}>
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
