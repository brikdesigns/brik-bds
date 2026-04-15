import { type AnchorHTMLAttributes, type ReactNode } from 'react';
import './TextLink.css';
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
export declare const TextLink: import("react").ForwardRefExoticComponent<TextLinkProps & import("react").RefAttributes<HTMLAnchorElement>>;
export default TextLink;
