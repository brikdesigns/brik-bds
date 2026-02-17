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
 * - --_color---text--inverse (white text)
 * - --space--400 = 16px (vertical padding)
 * - --space--1200 = 48px (horizontal padding)
 * - --_border-radius---sm = 2px (corners)
 */
const bannerStyles: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 'var(--_space---gap--lg)',
  backgroundColor: 'var(--_color---surface--brand-primary)',
  color: 'var(--_color---text--inverse)',
  padding: 'var(--space--400) var(--space--1200)',
  borderRadius: 'var(--_border-radius---sm)',
  overflow: 'hidden',
  width: '100%',
};

/**
 * Content wrapper — title + description inline
 *
 * Token reference:
 * - --_space---gap--sm = 4px (gap between title and description)
 */
const contentStyles: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--_space---gap--md)',
  minWidth: 0,
};

const titleStyles: CSSProperties = {
  fontFamily: 'var(--_typography---font-family--label)',
  fontWeight: 'var(--font-weight--semi-bold)' as unknown as number,
  fontSize: 'var(--_typography---label--md-base)',
  lineHeight: 1,
  whiteSpace: 'nowrap',
};

const descriptionStyles: CSSProperties = {
  fontFamily: 'var(--_typography---font-family--body)',
  fontWeight: 'var(--font-weight--regular)' as unknown as number,
  fontSize: 'var(--_typography---body--md-base)',
  lineHeight: 1.5,
};

const closeButtonStyles: CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'inherit',
  cursor: 'pointer',
  padding: '4px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  fontSize: '14px',
  opacity: 0.8,
};

/**
 * Banner - BDS marketing banner component
 *
 * A full-width branded banner with title, description, and optional action.
 * Uses brand-primary background with inverse text. Ideal for announcements,
 * promotions, or site-wide notices.
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
    </div>
  );
}

export default Banner;
