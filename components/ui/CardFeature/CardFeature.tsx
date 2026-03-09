import { type HTMLAttributes, type ReactNode, type CSSProperties } from 'react';
import { bdsClass } from '../../utils';

/**
 * CardFeature alignment
 */
export type CardFeatureAlignment = 'left' | 'center';

/**
 * CardFeature component props
 */
export interface CardFeatureProps extends HTMLAttributes<HTMLDivElement> {
  /** Icon or illustration element */
  icon?: ReactNode;
  /** Card title */
  title: string;
  /** Card description */
  description?: string;
  /** Optional action element (button, link) */
  action?: ReactNode;
  /** Content alignment */
  align?: CardFeatureAlignment;
}

/**
 * Base card styles
 *
 * Token reference:
 * - --surface-primary (card background)
 * - --border-width-sm / --border-secondary (card border)
 * - --border-radius-lg = 8px (card corners)
 * - --padding-lg = 24px (card padding)
 * - --gap-lg = 16px (gap between content sections)
 */
const cardStyles: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: 'var(--surface-primary)',
  border: 'var(--border-width-sm) solid var(--border-secondary)',
  borderRadius: 'var(--border-radius-lg)',
  padding: 'var(--padding-lg)',
  gap: 'var(--gap-lg)',
  width: '100%',
  minWidth: 0,
  boxSizing: 'border-box',
};

/**
 * Icon container styles
 *
 * Token reference:
 * - --background-brand-primary (icon background circle)
 * - --text-on-color-dark (icon color on brand bg)
 * - --border-radius-lg = 8px
 */
const iconContainerStyles: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 48,
  height: 48,
  borderRadius: 'var(--border-radius-lg)',
  backgroundColor: 'var(--background-brand-primary)',
  color: 'var(--text-on-color-dark)',
  fontSize: 'var(--body-lg)',
  flexShrink: 0,
};

/**
 * Title styles
 *
 * Token reference (from Figma heading/small):
 * - --font-family-heading
 * - --heading-sm = font-size/300 = 20px
 * - --font-weight-bold = 700
 * - --font-line-height-snug = 125%
 * - --text-primary
 */
const titleStyles: CSSProperties = {
  fontFamily: 'var(--font-family-heading)',
  fontSize: 'var(--heading-sm)',
  fontWeight: 'var(--font-weight-bold)' as unknown as number,
  lineHeight: 'var(--font-line-height-snug)',
  color: 'var(--text-primary)',
  margin: 0,
};

/**
 * Description styles
 *
 * Token reference (from Figma body/sm):
 * - --font-family-body
 * - --body-sm = font-size/75 = 14px
 * - --font-weight-regular = 400
 * - --font-line-height-normal = 150%
 * - --text-secondary
 */
const descriptionStyles: CSSProperties = {
  fontFamily: 'var(--font-family-body)',
  fontSize: 'var(--body-sm)',
  fontWeight: 'var(--font-weight-regular)' as unknown as number,
  lineHeight: 'var(--font-line-height-normal)',
  color: 'var(--text-secondary)',
  margin: 0,
};

/**
 * Action area styles
 */
const actionStyles: CSSProperties = {
  marginTop: 'auto',
  paddingTop: 'var(--gap-md)',
};

/**
 * CardFeature - BDS feature showcase card
 *
 * Displays an icon, title, description, and optional action.
 * Designed for feature grids, service listings, and benefit showcases.
 *
 * @example
 * ```tsx
 * <CardFeature
 *   icon={<FontAwesomeIcon icon={faRocket} />}
 *   title="Fast Performance"
 *   description="Lightning-fast load times with optimized delivery."
 *   action={<TextLink href="/features">Learn more</TextLink>}
 * />
 * ```
 */
export function CardFeature({
  icon,
  title,
  description,
  action,
  align = 'left',
  className = '',
  style,
  ...props
}: CardFeatureProps) {
  const alignCenter = align === 'center';

  return (
    <div
      className={bdsClass('bds-card-feature', className)}
      style={{
        ...cardStyles,
        alignItems: alignCenter ? 'center' : 'flex-start',
        textAlign: alignCenter ? 'center' : 'left',
        ...style,
      }}
      {...props}
    >
      {icon && <div style={iconContainerStyles}>{icon}</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)', minWidth: 0 }}>
        <h3 style={titleStyles}>{title}</h3>
        {description && <p style={descriptionStyles}>{description}</p>}
      </div>
      {action && <div style={actionStyles}>{action}</div>}
    </div>
  );
}

export default CardFeature;
