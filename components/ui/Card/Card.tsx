import { type HTMLAttributes, type ReactNode, type CSSProperties } from 'react';
import { bdsClass } from '../../utils';

/**
 * Card variant types
 */
export type CardVariant = 'default' | 'outlined' | 'elevated';

/**
 * Card padding sizes
 */
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

/**
 * Card component props
 */
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Card style variant */
  variant?: CardVariant;
  /** Children content */
  children: ReactNode;
  /** Whether card is clickable/interactive */
  interactive?: boolean;
  /** Link href (makes card a link) */
  href?: string;
  /** Padding size */
  padding?: CardPadding;
}

/**
 * Padding values using BDS spacing tokens
 *
 * Token reference:
 * - --padding-none = 0px
 * - --padding-sm = 12px
 * - --padding-md = 16px
 * - --padding-lg = 24px
 */
const paddingStyles: Record<CardPadding, string> = {
  none: 'var(--padding-none)',
  sm: 'var(--padding-sm)',
  md: 'var(--padding-md)',
  lg: 'var(--padding-lg)',
};

/**
 * Variant-based styles using BDS tokens
 *
 * Token reference:
 * - --surface-primary (card background)
 * - --surface-secondary (outlined card background)
 * - --border-width-md (standard border)
 * - --border-secondary (subtle border)
 * - --box-shadow-md (elevation shadow)
 */
const variantStyles: Record<CardVariant, CSSProperties> = {
  default: {
    backgroundColor: 'var(--surface-primary)',
    border: 'none',
    boxShadow: 'var(--box-shadow-none)',
  },
  outlined: {
    backgroundColor: 'var(--surface-secondary)',
    border: 'var(--border-width-md) solid var(--border-secondary)',
    boxShadow: 'var(--box-shadow-none)',
  },
  elevated: {
    backgroundColor: 'var(--surface-primary)',
    border: 'none',
    boxShadow: 'var(--box-shadow-md)',
  },
};

/**
 * Base card styles using BDS tokens
 *
 * Token reference:
 * - --gap-md = 8px (content gap)
 * - --border-radius-md = 4px (card corners)
 */
const baseStyles: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--gap-md)',
  borderRadius: 'var(--border-radius-md)',
  transition: 'box-shadow 0.2s, transform 0.2s',
};

/**
 * Card - BDS themed card container component
 *
 * Uses CSS variables for theming. Supports default, outlined, and elevated variants.
 * All spacing, colors, and border-radius reference BDS tokens.
 *
 * @example
 * ```tsx
 * <Card variant="outlined" padding="lg">
 *   <CardTitle>Feature Title</CardTitle>
 *   <CardDescription>Feature description goes here.</CardDescription>
 * </Card>
 * ```
 */
export function Card({
  variant = 'outlined',
  children,
  interactive = false,
  href,
  padding = 'md',
  className = '',
  style,
  ...props
}: CardProps) {
  const combinedStyles: CSSProperties = {
    ...baseStyles,
    ...variantStyles[variant],
    padding: paddingStyles[padding],
    cursor: interactive || href ? 'pointer' : undefined,
    ...style,
  };

  // Render as anchor if href is provided
  if (href) {
    return (
      <a
        href={href}
        className={bdsClass('bds-card', className)}
        style={{ ...combinedStyles, textDecoration: 'none', color: 'inherit' }}
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </a>
    );
  }

  return (
    <div className={bdsClass('bds-card', className)} style={combinedStyles} {...props}>
      {children}
    </div>
  );
}

/**
 * CardTitle - Title for cards
 *
 * Token reference:
 * - --font-family-heading
 * - --heading-md
 * - --text-primary
 */
export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
  as?: 'h2' | 'h3' | 'h4';
}

export function CardTitle({ children, as: Tag = 'h3', className = '', style, ...props }: CardTitleProps) {
  const titleStyles: CSSProperties = {
    fontFamily: 'var(--font-family-heading)',
    fontSize: 'var(--heading-md)',
    fontWeight: 'var(--font-weight-semi-bold)' as unknown as number,
    margin: 0,
    color: 'var(--text-primary)',
    ...style,
  };

  return (
    <Tag className={bdsClass('bds-card-title', className)} style={titleStyles} {...props}>
      {children}
    </Tag>
  );
}

/**
 * CardDescription - Description text for cards
 *
 * Token reference:
 * - --font-family-body
 * - --body-md
 * - --text-secondary
 */
export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
}

export function CardDescription({ children, className = '', style, ...props }: CardDescriptionProps) {
  const descStyles: CSSProperties = {
    fontFamily: 'var(--font-family-body)',
    fontSize: 'var(--body-md)',
    color: 'var(--text-secondary)',
    margin: 0,
    lineHeight: 'var(--font-line-height-normal)',
    ...style,
  };

  return (
    <p className={bdsClass('bds-card-description', className)} style={descStyles} {...props}>
      {children}
    </p>
  );
}

/**
 * CardFooter - Footer section for cards
 *
 * Token reference:
 * - --padding-sm = 12px (top padding)
 */
export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardFooter({ children, className = '', style, ...props }: CardFooterProps) {
  const footerStyles: CSSProperties = {
    marginTop: 'auto',
    paddingTop: 'var(--padding-sm)',
    ...style,
  };

  return (
    <div className={bdsClass('bds-card-footer', className)} style={footerStyles} {...props}>
      {children}
    </div>
  );
}

export default Card;
