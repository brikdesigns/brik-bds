import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from 'react';
import { bdsClass } from '../../utils';
import './TextLink.css';

/**
 * TextLink size variants
 */
export type TextLinkSize = 'default' | 'small';

/**
 * TextLink color tone
 */
export type TextLinkTone = 'brand' | 'neutral';

/**
 * TextLink underline visibility
 */
export type TextLinkUnderline = 'hover' | 'always' | 'none';

/**
 * TextLink component props
 */
export interface TextLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Size variant */
  size?: TextLinkSize;
  /**
   * Color tone. `brand` (default) uses the brand link color at rest — the
   * right choice for a page-level link or CTA, where the link stands out from
   * body copy. `neutral` uses `--text-primary` at rest — for a lower-emphasis
   * link that reads as an identifier rather than a call-to-action (e.g. the
   * name cell in a table). Both tones transition to `--text-brand-primary` on
   * hover, so color still signals interactivity.
   */
  tone?: TextLinkTone;
  /**
   * Underline visibility. `hover` (default) reveals the underline only on
   * hover — the right choice for a standalone link. `always` keeps the
   * underline visible at rest, for a link embedded inline in running prose,
   * where color alone isn't a sufficient cue (WCAG 1.4.1 Use of Color).
   * `none` suppresses the underline entirely (rest AND hover, including the
   * seamless icon underline) — for a link that signals interactivity through
   * color alone and must never underline a leading Avatar / indicator, such as
   * a table cell. Only sound where the surrounding context already marks the
   * link as interactive (not for a link inline in prose — see WCAG 1.4.1).
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
 * <TextLink href="/acme" tone="neutral" underline="none">Acme Co</TextLink>
 * ```
 *
 * @summary Themed inline link with size + variant options
 */
export const TextLink = forwardRef<HTMLAnchorElement, TextLinkProps>(
  (
    {
      size = 'default',
      tone = 'brand',
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
      tone === 'neutral' && 'bds-text-link--tone-neutral',
      underline === 'always' && 'bds-text-link--underline-always',
      underline === 'none' && 'bds-text-link--underline-none',
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
