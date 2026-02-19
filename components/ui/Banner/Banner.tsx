import { type ReactNode, type CSSProperties, type HTMLAttributes } from 'react';

/**
 * Banner component props
 */
export interface BannerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Bold title text */
  title: ReactNode;
  /** Description text beside the title */
  description?: ReactNode;
  /** Action element (e.g. Button) aligned to the right */
  action?: ReactNode;
  /** Dismissible — shows close button and calls onDismiss */
  onDismiss?: () => void;
}

/**
 * Banner container styles
 *
 * Token reference:
 * - --_color---surface--brand-primary (brand blue background)
 * - --_color---text--inverse (white text on brand surface)
 * - --_space---lg = 24px (vertical padding)
 * - --_space---xl = 32px (horizontal padding)
 * - --_border-radius---sm = 2px (corners)
 * - --_space---gap--lg = 16px (gap between content and action)
 */
const bannerStyles: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 'var(--_space---gap--lg)',
  backgroundColor: 'var(--_color---surface--brand-primary)',
  color: 'var(--_color---text--inverse)',
  padding: 'var(--_space---lg) var(--_space---xl)',
  borderRadius: 'var(--_border-radius---sm)',
  width: '100%',
  boxSizing: 'border-box',
};

/**
 * Content wrapper — title + description inline
 *
 * Token reference:
 * - --_space---gap--md = 8px (gap between title and description)
 *
 * Figma text styles:
 * - Title: label/md — font-family/label, SemiBold, font-size/100 (16px), line-height 1
 * - Description: body/md — font-family/body, Regular, font-size/100 (16px), line-height 1.5
 */
const contentStyles: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 'var(--_space---gap--md)',
  minWidth: 0,
};

const titleStyles: CSSProperties = {
  fontFamily: 'var(--_typography---font-family--label)',
  fontWeight: 'var(--font-weight--semi-bold)' as unknown as number,
  fontSize: 'var(--_typography---label--md-base)',
  lineHeight: 'var(--font-line-height--100)',
};

const descriptionStyles: CSSProperties = {
  fontFamily: 'var(--_typography---font-family--body)',
  fontWeight: 'var(--font-weight--regular)' as unknown as number,
  fontSize: 'var(--_typography---body--md-base)',
  lineHeight: 'var(--font-line-height--150)',
};

const closeButtonStyles: CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'inherit',
  cursor: 'pointer',
  padding: 'var(--_space---gap--sm)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  fontSize: 'var(--_typography---body--sm)',
  opacity: 0.8,
};

/**
 * Banner - BDS marketing banner component
 *
 * A full-width branded banner with title, description, and optional action.
 * Uses brand-primary surface with inverse text. Ideal for announcements,
 * promotions, or site-wide notices.
 *
 * Responsive: flex-wraps content and action when the container narrows.
 *
 * @example
 * ```tsx
 * <Banner
 *   title="New feature"
 *   description="Check out our latest update"
 *   action={<Button variant="secondary" size="sm">Learn more</Button>}
 * />
 * ```
 */
export function Banner({
  title,
  description,
  action,
  onDismiss,
  style,
  ...props
}: BannerProps) {
  return (
    <div role="banner" style={{ ...bannerStyles, ...style }} {...props}>
      <div style={contentStyles}>
        <span style={titleStyles}>{title}</span>
        {description && <span style={descriptionStyles}>{description}</span>}
      </div>
      {(action || onDismiss) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--_space---gap--md)', flexShrink: 0 }}>
          {action}
          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Dismiss banner"
              style={closeButtonStyles}
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
