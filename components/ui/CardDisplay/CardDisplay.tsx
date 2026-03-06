import { type HTMLAttributes, type ReactNode, type CSSProperties } from 'react';
import { bdsClass } from '../../utils';

/**
 * CardDisplay component props
 */
export interface CardDisplayProps extends HTMLAttributes<HTMLDivElement> {
  /** Image source URL */
  imageSrc?: string;
  /** Image alt text */
  imageAlt?: string;
  /** Card title */
  title: string;
  /** Card description */
  description?: string;
  /** Badge or label above the title */
  badge?: ReactNode;
  /** Action element (button, link) in the footer area */
  action?: ReactNode;
  /** Link href — makes the entire card clickable */
  href?: string;
}

/**
 * Base card styles using BDS tokens
 *
 * Token reference (from Figma bds-3-column-cards):
 * - --surface-primary (card background)
 * - --border-width-sm (border weight)
 * - --border-secondary (border color)
 * - --border-radius-lg (card corner radius — 8px in Figma)
 */
const cardStyles: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: 'var(--surface-primary)',
  border: 'var(--border-width-sm) solid var(--border-secondary)',
  borderRadius: 'var(--border-radius-lg)',
  overflow: 'hidden',
  width: '100%',
  minWidth: 0,
  boxSizing: 'border-box',
};

/**
 * Image container styles
 *
 * Token reference:
 * - Image area is ~49% of card height in Figma (185px of 376px)
 */
const imageContainerStyles: CSSProperties = {
  position: 'relative',
  width: '100%',
  aspectRatio: '16 / 9',
  overflow: 'hidden',
  flexShrink: 0,
};

const imageStyles: CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
};

/**
 * Content area styles
 *
 * Token reference:
 * - --padding-md = 16px (horizontal padding — Figma: px-16)
 * - --padding-lg = 24px (bottom padding — Figma: pb-24)
 * - --gap-md = 8px (gap between content elements)
 */
const contentStyles: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--gap-md)',
  padding: 'var(--padding-lg) var(--padding-md)',
  flexGrow: 1,
  minWidth: 0,
};

/**
 * Title styles
 *
 * Token reference (from Figma heading/small):
 * - --font-family-heading
 * - --heading-sm (font-size/300 = 20px)
 * - --font-weight-bold = 700
 * - --font-line-height-snug = 125% (Figma: 1.1, closest token)
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
 * - --body-sm (font-size/75 = 14px)
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
 * Action footer styles
 *
 * Token reference:
 * - --padding-lg = 24px (top padding before action)
 */
const actionStyles: CSSProperties = {
  marginTop: 'auto',
  paddingTop: 'var(--padding-lg)',
};

/**
 * CardDisplay - BDS content display card
 *
 * A card component for showcasing content with an optional image, badge,
 * title, description, and action. Designed for product listings, blog
 * previews, feature showcases, and related content grids.
 *
 * Based on Figma component: bds-3-column-cards
 *
 * @example
 * ```tsx
 * <CardDisplay
 *   imageSrc="/photo.jpg"
 *   imageAlt="Product photo"
 *   badge={<Badge>New</Badge>}
 *   title="Product Name"
 *   description="Short description of the product."
 *   action={<Button variant="primary" size="sm">View details</Button>}
 * />
 * ```
 */
export function CardDisplay({
  imageSrc,
  imageAlt = '',
  title,
  description,
  badge,
  action,
  href,
  className = '',
  style,
  ...props
}: CardDisplayProps) {
  const combinedStyles: CSSProperties = {
    ...cardStyles,
    cursor: href ? 'pointer' : undefined,
    textDecoration: href ? 'none' : undefined,
    color: href ? 'inherit' : undefined,
    ...style,
  };

  const content = (
    <>
      {imageSrc && (
        <div style={imageContainerStyles}>
          <img src={imageSrc} alt={imageAlt} style={imageStyles} />
        </div>
      )}
      <div style={contentStyles}>
        {badge && <div>{badge}</div>}
        <h3 style={titleStyles}>{title}</h3>
        {description && <p style={descriptionStyles}>{description}</p>}
        {action && <div style={actionStyles}>{action}</div>}
      </div>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className={bdsClass('bds-card-display', className)}
        style={combinedStyles}
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {content}
      </a>
    );
  }

  return (
    <div className={bdsClass('bds-card-display', className)} style={combinedStyles} {...props}>
      {content}
    </div>
  );
}

export default CardDisplay;
