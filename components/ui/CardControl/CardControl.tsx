import { type HTMLAttributes, type ReactNode, type CSSProperties } from 'react';
import { bdsClass } from '../../utils';

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
 * - --surface-primary (white background)
 * - --border-width-lg = 1px (border)
 * - --border-muted (border color)
 * - --border-radius-lg = 8px (corners)
 * - --padding-xl = 32px (padding)
 */
const cardStyles: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--padding-xl)',
  padding: 'var(--padding-xl)',
  backgroundColor: 'var(--surface-primary)',
  border: 'var(--border-width-lg) solid var(--border-muted)',
  borderRadius: 'var(--border-radius-lg)',
  boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.06)', // bds-lint-ignore — shadow tokens resolve to zero
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
  gap: 'var(--padding-lg)',
  flex: 1,
  minWidth: 0,
};

/**
 * Text group styles (title + description)
 */
const textGroupStyles: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--gap-sm)',
  minWidth: 0,
};

/**
 * Title styles
 *
 * Token reference:
 * - --font-family-label (label font)
 * - --label-lg = font-size-200 = 18px
 * - --font-weight-semi-bold = 600
 * - --font-line-height-tight = 100% (tight)
 * - --text-primary
 */
const titleStyles: CSSProperties = {
  fontFamily: 'var(--font-family-label)',
  fontSize: 'var(--label-lg)',
  fontWeight: 'var(--font-weight-semi-bold)' as unknown as number,
  lineHeight: 'var(--font-line-height-tight)',
  color: 'var(--text-primary)',
  margin: 0,
};

/**
 * Description styles
 *
 * Token reference:
 * - --font-family-body (body font)
 * - --body-md = font-size-100 = 16px
 * - --font-line-height-normal = 150%
 * - --text-muted
 */
const descriptionStyles: CSSProperties = {
  fontFamily: 'var(--font-family-body)',
  fontSize: 'var(--body-md)',
  lineHeight: 'var(--font-line-height-normal)',
  color: 'var(--text-muted)',
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
      className={bdsClass('bds-card-control', className)}
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
