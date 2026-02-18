import { type HTMLAttributes, type ReactNode, type CSSProperties } from 'react';

/**
 * CardControl component props
 */
export interface CardControlProps extends HTMLAttributes<HTMLDivElement> {
  /** Title text */
  title: string;
  /** Description text */
  description?: string;
  /** Badge or icon displayed before the title */
  badge?: ReactNode;
  /** Action element on the right (Switch, Button, etc.) */
  action?: ReactNode;
}

/**
 * Card container styles
 *
 * Token reference:
 * - --_color---surface--primary (white background)
 * - --_border-width---lg = 1px (border)
 * - --_color---border--muted (border color)
 * - --_border-radius---lg = 8px (corners)
 * - --_space---xl = 32px (padding)
 */
const cardStyles: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--_space---xl)',
  padding: 'var(--_space---xl)',
  backgroundColor: 'var(--_color---surface--primary)',
  border: 'var(--_border-width---lg) solid var(--_color---border--muted)',
  borderRadius: 'var(--_border-radius---lg)',
  boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  width: '100%',
  boxSizing: 'border-box',
  flexWrap: 'wrap',
};

/**
 * Left content area styles (badge + text)
 */
const contentStyles: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--_space---lg)',
  flex: 1,
  minWidth: 0,
};

/**
 * Text group styles (title + description)
 */
const textGroupStyles: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--_space---gap--sm)',
  minWidth: 0,
};

/**
 * Title styles
 *
 * Token reference:
 * - --_typography---font-family--label (label font)
 * - --_typography---label--lg = font-size-200 = 18px
 * - --font-weight--semi-bold = 600
 * - --font-line-height--100 = 100% (tight)
 * - --_color---text--primary
 */
const titleStyles: CSSProperties = {
  fontFamily: 'var(--_typography---font-family--label)',
  fontSize: 'var(--_typography---label--lg)',
  fontWeight: 'var(--font-weight--semi-bold)' as unknown as number,
  lineHeight: 'var(--font-line-height--100)',
  color: 'var(--_color---text--primary)',
  margin: 0,
};

/**
 * Description styles
 *
 * Token reference:
 * - --_typography---font-family--body (body font)
 * - --_typography---body--md-base = font-size-100 = 16px
 * - --font-line-height--150 = 150%
 * - --_color---text--muted
 */
const descriptionStyles: CSSProperties = {
  fontFamily: 'var(--_typography---font-family--body)',
  fontSize: 'var(--_typography---body--md-base)',
  lineHeight: 'var(--font-line-height--150)',
  color: 'var(--_color---text--muted)',
  margin: 0,
};

/**
 * Action area styles — prevents shrinking
 */
const actionStyles: CSSProperties = {
  flexShrink: 0,
};

/**
 * CardControl - Settings control card component
 *
 * A card layout for settings and controls. Left side displays an optional
 * badge/icon, title, and description. Right side holds an action element
 * (Switch, Button, Badge, etc.).
 *
 * @example
 * ```tsx
 * <CardControl
 *   title="Notifications"
 *   description="Receive email notifications for updates"
 *   badge={<Badge size="xs" status="positive" icon={<FontAwesomeIcon icon={faCheck} />} />}
 *   action={<Switch checked={enabled} onChange={handleChange} />}
 * />
 * ```
 */
export function CardControl({
  title,
  description,
  badge,
  action,
  className = '',
  style,
  ...props
}: CardControlProps) {
  const combinedStyles: CSSProperties = {
    ...cardStyles,
    ...style,
  };

  return (
    <div
      className={className || undefined}
      style={combinedStyles}
      {...props}
    >
      <div style={contentStyles}>
        {badge}
        <div style={textGroupStyles}>
          <p style={titleStyles}>{title}</p>
          {description && <p style={descriptionStyles}>{description}</p>}
        </div>
      </div>
      {action && <div style={actionStyles}>{action}</div>}
    </div>
  );
}

export default CardControl;
