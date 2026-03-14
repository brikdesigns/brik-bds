import { type HTMLAttributes, type ReactNode } from 'react';
import { bdsClass } from '../../utils';
import './Card.css';

export type CardVariant = 'default' | 'outlined' | 'elevated';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  children: ReactNode;
  interactive?: boolean;
  href?: string;
  padding?: CardPadding;
}

/**
 * Card — flexible content container with variant styles
 */
export function Card({
  variant = 'outlined',
  children,
  interactive = false,
  href,
  padding = 'md',
  className,
  style,
  ...props
}: CardProps) {
  const classes = bdsClass(
    'bds-card',
    `bds-card--${variant}`,
    `bds-card--padding-${padding}`,
    interactive && 'bds-card--interactive',
    href && 'bds-card--link',
    className,
  );

  if (href) {
    return (
      <a href={href} className={classes} style={style} {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </a>
    );
  }

  return (
    <div className={classes} style={style} {...props}>
      {children}
    </div>
  );
}

/* ─── Subcomponents ──────────────────────────────────────────── */

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
  as?: 'h2' | 'h3' | 'h4';
}

export function CardTitle({ children, as: Tag = 'h3', className, style, ...props }: CardTitleProps) {
  return (
    <Tag className={bdsClass('bds-card-title', className)} style={style} {...props}>
      {children}
    </Tag>
  );
}

export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
}

export function CardDescription({ children, className, style, ...props }: CardDescriptionProps) {
  return (
    <p className={bdsClass('bds-card-description', className)} style={style} {...props}>
      {children}
    </p>
  );
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardFooter({ children, className, style, ...props }: CardFooterProps) {
  return (
    <div className={bdsClass('bds-card-footer', className)} style={style} {...props}>
      {children}
    </div>
  );
}

export default Card;
