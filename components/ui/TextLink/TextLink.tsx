import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from 'react';
import { bdsClass } from '../../utils';

/**
 * TextLink size variants
 */
export type TextLinkSize = 'default' | 'small';

/**
 * TextLink component props
 */
export interface TextLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Size variant */
  size?: TextLinkSize;
  /** Children content */
  children: ReactNode;
  /** Optional icon before text */
  iconBefore?: ReactNode;
  /** Optional icon after text */
  iconAfter?: ReactNode;
}

/**
 * TextLink - BDS themed link component
 *
 * Uses Webflow CSS classes directly to ensure perfect theme integration.
 * Muted text color that transitions to brand color on hover.
 *
 * @example
 * ```tsx
 * <TextLink href="/about">Learn More</TextLink>
 * <TextLink href="/contact" size="small">Contact Us</TextLink>
 * ```
 */
export const TextLink = forwardRef<HTMLAnchorElement, TextLinkProps>(
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
    const combinedClassName = bdsClass(
      'text-link',
      'bds-text-link',
      size === 'small' && 'small',
      size === 'small' && 'bds-text-link-small',
      className
    );

    return (
      <a ref={ref} className={combinedClassName} {...props}>
        {iconBefore && <span className="link-icon-before bds-text-link-icon-before">{iconBefore}</span>}
        {children}
        {iconAfter && <span className="link-icon-after bds-text-link-icon-after">{iconAfter}</span>}
      </a>
    );
  }
);

TextLink.displayName = 'TextLink';

export default TextLink;
