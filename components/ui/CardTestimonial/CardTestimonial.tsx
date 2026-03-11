import { type HTMLAttributes, type CSSProperties } from 'react';
import { bdsClass } from '../../utils';

/**
 * CardTestimonial variant
 */
export type CardTestimonialVariant = 'brand' | 'outlined';

/**
 * CardTestimonial component props
 */
export interface CardTestimonialProps extends HTMLAttributes<HTMLDivElement> {
  /** The testimonial quote text */
  quote: string;
  /** Author's name */
  authorName: string;
  /** Author's role or title (e.g., "Owner, Bloom Cafe") */
  authorRole?: string;
  /** Star rating (1-5). Omit to hide stars. */
  rating?: 1 | 2 | 3 | 4 | 5;
  /** Visual variant */
  variant?: CardTestimonialVariant;
}

/**
 * Variant-based styles
 *
 * Token reference (from Figma card-testimonial):
 * - Brand: --surface-brand-primary bg, --text-inverse text
 * - Outlined: --surface-primary bg, standard border, normal text colors
 */
const variantStyles: Record<CardTestimonialVariant, {
  card: CSSProperties;
  quote: CSSProperties;
  body: CSSProperties;
  name: CSSProperties;
  role: CSSProperties;
  star: CSSProperties;
  quoteMark: CSSProperties;
}> = {
  brand: {
    card: {
      backgroundColor: 'var(--surface-brand-primary)',
    },
    quote: {},
    body: {
      color: 'var(--text-inverse)',
    },
    name: {
      color: 'var(--text-inverse)',
    },
    role: {
      color: 'var(--text-inverse)',
    },
    star: {
      color: 'var(--color-system-yellow)',
    },
    quoteMark: {
      color: 'var(--text-inverse)',
    },
  },
  outlined: {
    card: {
      backgroundColor: 'var(--surface-primary)',
      border: 'var(--border-width-md) solid var(--border-secondary)',
    },
    quote: {},
    body: {
      color: 'var(--text-primary)',
    },
    name: {
      color: 'var(--text-primary)',
    },
    role: {
      color: 'var(--text-secondary)',
    },
    star: {
      color: 'var(--color-system-yellow)',
    },
    quoteMark: {
      color: 'var(--text-brand-primary)',
    },
  },
};

/**
 * Base card styles
 *
 * Token reference:
 * - --padding-lg = 24px (padding — Figma: padding/lg)
 * - --gap-lg = 16px (gap between sections — Figma: gap/lg)
 * - --border-radius-md = card corners
 */
const baseCardStyles: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--gap-lg)',
  padding: 'var(--padding-lg)',
  borderRadius: 'var(--border-radius-md)',
  width: '100%',
  minWidth: 0,
  boxSizing: 'border-box',
};

/**
 * Quote mark styles (the large opening quotation mark)
 *
 * Token reference (from Figma display/xl):
 * - --font-family-display
 * - Very large size — using heading--xx-large as closest available
 * - --font-weight-bold = 700
 * - --font-line-height-tight = 100%
 */
const quoteMarkStyles: CSSProperties = {
  fontFamily: 'var(--font-family-display)',
  fontSize: 'var(--heading-huge)',
  fontWeight: 'var(--font-weight-bold)' as unknown as number,
  lineHeight: 'var(--font-line-height-tight)',
  margin: 0,
  userSelect: 'none',
};

/**
 * Quote body text styles
 *
 * Token reference (from Figma body/md):
 * - --font-family-body
 * - --body-md (font-size/100 = 16px)
 * - --font-weight-regular = 400
 * - --font-line-height-normal = 150%
 */
const quoteBodyStyles: CSSProperties = {
  fontFamily: 'var(--font-family-body)',
  fontSize: 'var(--body-md)',
  fontWeight: 'var(--font-weight-regular)' as unknown as number,
  lineHeight: 'var(--font-line-height-normal)',
  margin: 0,
};

/**
 * Author name styles
 *
 * Token reference (from Figma label/md):
 * - --font-family-label
 * - --label-md (font-size/100 = 16px)
 * - --font-weight-semi-bold = 600
 * - --font-line-height-snug = 125%
 */
const authorNameStyles: CSSProperties = {
  fontFamily: 'var(--font-family-label)',
  fontSize: 'var(--label-md)',
  fontWeight: 'var(--font-weight-semi-bold)' as unknown as number,
  lineHeight: 'var(--font-line-height-snug)',
  margin: 0,
};

/**
 * Author role styles
 *
 * Token reference (from Figma body/sm):
 * - --font-family-body
 * - --body-sm (font-size/75 = 14px)
 * - --font-weight-regular = 400
 * - --font-line-height-normal = 150%
 */
const authorRoleStyles: CSSProperties = {
  fontFamily: 'var(--font-family-body)',
  fontSize: 'var(--body-sm)',
  fontWeight: 'var(--font-weight-regular)' as unknown as number,
  lineHeight: 'var(--font-line-height-normal)',
  margin: 0,
};

/**
 * Attribution container styles
 *
 * Token reference:
 * - --gap-xs = 4px (tight gap between name and role — Figma: gap 4px)
 */
const attributionStyles: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--gap-xs)',
};

/**
 * Star rating styles
 *
 * Token reference:
 * - --font-family-icon (Font Awesome)
 * - --heading-lg (font-size/700 = 32px — Figma star size)
 * - --gap-md = 8px (gap between stars)
 */
const starContainerStyles: CSSProperties = {
  display: 'flex',
  gap: 'var(--gap-md)',
  fontFamily: 'var(--font-family-icon)',
  fontSize: 'var(--heading-lg)',
  lineHeight: 'var(--font-line-height-snug)',
};

/**
 * CardTestimonial - BDS customer testimonial card
 *
 * Displays a customer quote with attribution and optional star rating.
 * Supports brand (colored) and outlined visual variants.
 *
 * Based on Figma component: card-testimonial (within bds-3-column-testimonial-carousel)
 *
 * @example
 * ```tsx
 * <CardTestimonial
 *   quote="This service completely transformed our business."
 *   authorName="Sarah Chen"
 *   authorRole="Owner, Bloom Cafe"
 *   rating={5}
 * />
 * ```
 */
export function CardTestimonial({
  quote,
  authorName,
  authorRole,
  rating,
  variant = 'brand',
  className = '',
  style,
  ...props
}: CardTestimonialProps) {
  const v = variantStyles[variant];

  const combinedStyles: CSSProperties = {
    ...baseCardStyles,
    ...v.card,
    ...style,
  };

  return (
    <div className={bdsClass('bds-card-testimonial', className)} style={combinedStyles} {...props}>
      <div style={{ ...quoteMarkStyles, ...v.quoteMark }} aria-hidden="true">
        {'\u201C'}
      </div>

      <blockquote style={{ ...quoteBodyStyles, ...v.body, margin: 0 }}>
        {quote}
      </blockquote>

      <div style={attributionStyles}>
        <p style={{ ...authorNameStyles, ...v.name }}>{authorName}</p>
        {authorRole && (
          <p style={{ ...authorRoleStyles, ...v.role }}>{authorRole}</p>
        )}
      </div>

      {rating != null && rating > 0 && (
        <div style={{ ...starContainerStyles, ...v.star }} role="img" aria-label={`${rating} out of 5 stars`}>
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} style={{ opacity: i < rating ? 1 : 0.3 }}>
              {'\uF005'}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default CardTestimonial;
