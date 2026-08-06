import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from 'react';
import { bdsClass } from '../../utils';
import './TextLink.css';

/**
 * TextLink size variants
 */
export type TextLinkSize = 'default' | 'small';

/**
 * TextLink underline visibility
 */
export type TextLinkUnderline = 'hover' | 'always';

/**
 * TextLink component props
 */
export interface TextLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Size variant */
  size?: TextLinkSize;
  /**
   * Underline visibility. `hover` (default) reveals the underline only on
   * hover — the right choice for a standalone link. `always` keeps the
   * underline visible at rest, for a link embedded inline in running prose,
   * where color alone isn't a sufficient cue (WCAG 1.4.1 Use of Color).
   */
  underline?: TextLinkUnderline;
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
 * <TextLink href="/pricing" underline="always">inline in a sentence</TextLink>
 * ```
 *
 * @summary Themed inline link with size + variant options
 */
export const TextLink = forwardRef<HTMLAnchorElement, TextLinkProps>(
  (
    {
      size = 'default',
      underline = 'hover',
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
      underline === 'always' && 'bds-text-link--underline-always',
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
