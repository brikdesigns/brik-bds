import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from 'react';
import { bdsClass, resolveRetiredProp, resolveRetiredValue } from '../../utils';
import './TextLink.css';

/**
 * TextLink size variants
 */
export type TextLinkSize = 'sm' | 'md';

/** Retired size spellings, honoured for one minor version (ADR-033 § 3). */
const RETIRED_SIZES: Record<string, TextLinkSize> = { default: 'md', small: 'sm' };

/**
 * TextLink hue source — which palette the link colour is drawn from
 * (ADR-033 § 2's `emphasis` axis).
 */
export type TextLinkEmphasis = 'brand' | 'neutral';


/**
 * TextLink underline visibility
 */
export type TextLinkUnderline = 'hover' | 'always' | 'none';

/**
 * TextLink component props
 */
export interface TextLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Size variant. Default `md`. */
  size?: TextLinkSize;
  /**
   * Hue source. `brand` (default) uses the brand link color at rest — the
   * right choice for a page-level link or CTA, where the link stands out from
   * body copy. `neutral` uses `--bds-text-primary` at rest — for a lower-emphasis
   * link that reads as an identifier rather than a call-to-action (e.g. the
   * name cell in a table). Both values transition to `--bds-text-brand-primary` on
   * hover, so color still signals interactivity.
   */
  emphasis?: TextLinkEmphasis;
  /**
   * @deprecated Use `emphasis` instead (ADR-033 § 2). Honoured for one minor
   * version; `emphasis` wins when both are passed.
   */
  tone?: TextLinkEmphasis;
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
 * <TextLink href="/contact" size="sm">Contact Us</TextLink>
 * <TextLink href="/pricing" underline="always">inline in a sentence</TextLink>
 * <TextLink href="/acme" emphasis="neutral" underline="none">Acme Co</TextLink>
 * ```
 *
 * @summary Themed inline link with size + variant options
 */
export const TextLink = forwardRef<HTMLAnchorElement, TextLinkProps>(
  (
    {
      size = 'md',
      emphasis,
      tone,
      underline = 'hover',
      children,
      iconBefore,
      iconAfter,
      className = '',
      ...props
    },
    ref
  ) => {
    const resolvedEmphasis =
      resolveRetiredProp('TextLink', 'tone', 'emphasis', tone, emphasis) ?? 'brand';

    const resolvedSize = resolveRetiredValue('TextLink', 'size', size, RETIRED_SIZES);

    const combinedClassName = bdsClass(
      'text-link',
      'bds-text-link',
      resolvedSize === 'sm' && 'small',
      resolvedSize === 'sm' && 'bds-text-link--size-sm',
      resolvedEmphasis === 'neutral' && 'bds-text-link--emphasis-neutral',
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
