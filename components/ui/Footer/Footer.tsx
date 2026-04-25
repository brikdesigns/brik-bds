import { type HTMLAttributes, type ReactNode } from 'react';
import { bdsClass } from '../../utils';
import './Footer.css';

/**
 * Footer link column
 */
export interface FooterColumn {
  /** Column heading */
  heading: string;
  /** Links in this column */
  links: { label: string; href: string }[];
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
 *
 * @summary Page footer with link columns and brand block
 */
export function Footer({
  logo,
  tagline,
  columns = [],
  copyright,
  socialLinks,
  variant = 'default',
  className = '',
  style,
  ...props
}: FooterProps) {
  return (
    <footer
      className={bdsClass('bds-footer', `bds-footer--${variant}`, className)}
      style={style}
      {...props}
    >
      {/* Top section: logo + columns */}
      <div className="bds-footer__top">
        {(logo || tagline) && (
          <div className="bds-footer__logo-area">
            {logo}
            {tagline && <p className="bds-footer__tagline">{tagline}</p>}
          </div>
        )}
        {columns.length > 0 && (
          <div className="bds-footer__columns">
            {columns.map((col) => (
              <div key={col.heading} className="bds-footer__column">
                <h6 className="bds-footer__heading">{col.heading}</h6>
                {col.links.map((link) => (
                  <a
                    key={link.href + link.label}
                    href={link.href}
                    className="bds-footer__link"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom bar */}
      {(copyright || socialLinks) && (
        <div className="bds-footer__bottom">
          {copyright && <p className="bds-footer__copyright">{copyright}</p>}
          {socialLinks && <div className="bds-footer__social">{socialLinks}</div>}
        </div>
      )}
    </footer>
  );
}

export default Footer;
