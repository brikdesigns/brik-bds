import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from 'react';

/**
 * Link size variants
 */
export type LinkSize = 'default' | 'small';

/**
 * Link component props
 */
export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Size variant */
  size?: LinkSize;
  /** Children content */
  children: ReactNode;
  /** Optional icon before text */
  iconBefore?: ReactNode;
  /** Optional icon after text */
  iconAfter?: ReactNode;
}

/**
 * Link - BDS themed link component
 *
 * Uses Webflow CSS classes directly to ensure perfect theme integration.
 * Muted text color that transitions to brand color on hover.
 *
 * @example
 * ```tsx
 * <Link href="/about">Learn More</Link>
 * <Link href="/contact" size="small">Contact Us</Link>
 * ```
 */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  (
    {
      size = 'default',
      children,
      iconBefore,
      iconAfter,
      className = '',
      ...props
    },
    ref
  ) => {
    const sizeClass = size === 'small' ? 'small' : '';
    const combinedClassName = `text-link ${sizeClass} ${className}`.trim();

    return (
      <a ref={ref} className={combinedClassName} {...props}>
        {iconBefore && <span className="link-icon-before">{iconBefore}</span>}
        {children}
        {iconAfter && <span className="link-icon-after">{iconAfter}</span>}
      </a>
    );
  }
);

Link.displayName = 'Link';

export default Link;
