import { type HTMLAttributes, type ReactNode, type CSSProperties } from 'react';

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
 * - --_space---none = 0px
 * - --_space---sm = 6px
 * - --_space---md = 8px
 * - --_space---lg = 16px
 */
const paddingStyles: Record<CardPadding, string> = {
  none: 'var(--_space---none)',
  sm: 'var(--_space---sm)',
  md: 'var(--_space---md)',
  lg: 'var(--_space---lg)',
};

/**
 * Variant-based styles using BDS tokens
 *
 * Token reference:
 * - --_color---surface--primary (card background)
 * - --_color---surface--secondary (outlined card background)
 * - --_border-width---sm (thin border)
 * - --_color---border--secondary (subtle border)
 * - --_box-shadow---md (elevation shadow)
 */
const variantStyles: Record<CardVariant, CSSProperties> = {
  default: {
    backgroundColor: 'var(--_color---surface--primary)',
    border: 'none',
    boxShadow: 'var(--_box-shadow---none)',
  },
  outlined: {
    backgroundColor: 'var(--_color---surface--secondary)',
    border: 'var(--_border-width---sm) solid var(--_color---border--secondary)',
    boxShadow: 'var(--_box-shadow---none)',
  },
  elevated: {
    backgroundColor: 'var(--_color---surface--primary)',
    border: 'none',
    boxShadow: 'var(--_box-shadow---md)',
  },
};

/**
 * Base card styles using BDS tokens
 *
 * Token reference:
 * - --_space---gap--md = 8px (content gap)
 * - --_border-radius---md = 4px (card corners)
 */
const baseStyles: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--_space---gap--md)',
  borderRadius: 'var(--_border-radius---md)',
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
        className={className || undefined}
        style={{ ...combinedStyles, textDecoration: 'none', color: 'inherit' }}
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </a>
    );
  }

  return (
    <div className={className || undefined} style={combinedStyles} {...props}>
      {children}
    </div>
  );
}

/**
 * CardTitle - Title for cards
 *
 * Token reference:
 * - --_typography---font-family--heading
 * - --_typography---heading--medium
 * - --_color---text--primary
 */
export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
  as?: 'h2' | 'h3' | 'h4';
}

export function CardTitle({ children, as: Tag = 'h3', className = '', style, ...props }: CardTitleProps) {
  const titleStyles: CSSProperties = {
    fontFamily: 'var(--_typography---font-family--heading)',
    fontSize: 'var(--_typography---heading--medium)',
    fontWeight: 'var(--font-weight--semi-bold)' as unknown as number,
    margin: 0,
    color: 'var(--_color---text--primary)',
    ...style,
  };

  return (
    <Tag className={className || undefined} style={titleStyles} {...props}>
      {children}
    </Tag>
  );
}

/**
 * CardDescription - Description text for cards
 *
 * Token reference:
 * - --_typography---font-family--body
 * - --_typography---body--md-base
 * - --_color---text--secondary
 */
export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
}

export function CardDescription({ children, className = '', style, ...props }: CardDescriptionProps) {
  const descStyles: CSSProperties = {
    fontFamily: 'var(--_typography---font-family--body)',
    fontSize: 'var(--_typography---body--md-base)',
    color: 'var(--_color---text--secondary)',
    margin: 0,
    lineHeight: 'var(--font-line-height--150)',
    ...style,
  };

  return (
    <p className={className || undefined} style={descStyles} {...props}>
      {children}
    </p>
  );
}

/**
 * CardFooter - Footer section for cards
 *
 * Token reference:
 * - --_space---sm = 6px (top padding)
 */
export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardFooter({ children, className = '', style, ...props }: CardFooterProps) {
  const footerStyles: CSSProperties = {
    marginTop: 'auto',
    paddingTop: 'var(--_space---sm)',
    ...style,
  };

  return (
    <div className={className || undefined} style={footerStyles} {...props}>
      {children}
    </div>
  );
}

export default Card;
