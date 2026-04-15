import { type HTMLAttributes, type ReactNode } from 'react';
import './Footer.css';
/**
 * Footer link column
 */
export interface FooterColumn {
    /** Column heading */
    heading: string;
    /** Links in this column */
    links: {
        label: string;
        href: string;
    }[];
}
/**
 * Footer component props
 */
export interface FooterProps extends HTMLAttributes<HTMLElement> {
    /** Logo element */
    logo?: ReactNode;
    /** Optional tagline or description below the logo */
    tagline?: string;
    /** Link columns */
    columns?: FooterColumn[];
    /** Copyright text */
    copyright?: string;
    /** Social icons or links in the bottom bar */
    socialLinks?: ReactNode;
    /** Footer variant */
    variant?: FooterVariant;
}
/**
 * Footer variant
 */
export type FooterVariant = 'default' | 'brand';
/**
 * Footer - BDS page footer with link columns
 *
 * A responsive footer with logo, link columns, copyright, and social links.
 * Matches the Webflow footer structure with BDS tokens.
 *
 * @example
 * ```tsx
 * <Footer
 *   logo={<img src="/logo.svg" alt="Logo" height={24} />}
 *   columns={[
 *     { heading: 'Product', links: [{ label: 'Features', href: '/features' }] },
 *     { heading: 'Company', links: [{ label: 'About', href: '/about' }] },
 *   ]}
 *   copyright="2026 Brik Designs. All rights reserved."
 * />
 * ```
 */
export declare function Footer({ logo, tagline, columns, copyright, socialLinks, variant, className, style, ...props }: FooterProps): import("react/jsx-runtime").JSX.Element;
export default Footer;
