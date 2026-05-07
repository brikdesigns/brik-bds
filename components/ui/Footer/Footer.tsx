import { type HTMLAttributes, type ReactNode, Fragment } from 'react';
import { bdsClass } from '../../utils';
import './Footer.css';

/**
 * Footer link (used in column lists)
 */
export interface FooterColumnLink {
  /** Visible label */
  label: string;
  /** Destination URL */
  href: string;
  /** Optional inline content rendered before the label — typically a colored
   * badge dot, icon, or other small adornment that signals link category */
  adornment?: ReactNode;
}

/**
 * Footer link column
 */
export interface FooterColumn {
  /** Column heading */
  heading: string;
  /** Links in this column */
  links: FooterColumnLink[];
}

/**
 * Inline link rendered next to the copyright in the bottom bar
 * (separated by a bullet)
 */
export interface FooterBottomLink {
  /** Visible label */
  label: string;
  /** Destination URL */
  href: string;
}

/**
 * Footer component props
 */
export interface FooterProps extends HTMLAttributes<HTMLElement> {
  /** Logo element */
  logo?: ReactNode;
  /** Optional tagline or description below the logo */
  tagline?: string;
  /** Optional content rendered inside the logo area, below the tagline.
   * Typical use: a contact block with phone / email / address. The slot is
   * a generic ReactNode so consumers can compose any structure. */
  brandExtra?: ReactNode;
  /** Link columns */
  columns?: FooterColumn[];
  /** Copyright text */
  copyright?: string;
  /** Optional inline links rendered next to the copyright, separated by a
   * bullet. Typical use: Terms / Privacy. */
  bottomLinks?: FooterBottomLink[];
  /** Right-aligned content in the bottom bar. Typically social icons or a
   * small marketing tagline (e.g. "Made with ❤️ in Palm Beach, FL"). */
  socialLinks?: ReactNode;
  /** Optional content rendered above the standard top section, full-width.
   * Typical use: newsletter signup, announcement banner, secondary CTA. */
  aboveTop?: ReactNode;
  /** Footer variant */
  variant?: FooterVariant;
}

/**
 * Footer variant
 */
export type FooterVariant = 'default' | 'brand' | 'inverse';

/**
 * Footer - BDS page footer with link columns
 *
 * A responsive footer with logo, link columns, copyright, and social links.
 * Matches the Webflow footer structure with BDS tokens.
 *
 * @example Minimal
 * ```tsx
 * <Footer
 *   logo={<img src="/logo.svg" alt="Logo" height={24} />}
 *   columns={[
 *     { heading: 'Product', links: [{ label: 'Features', href: '/features' }] },
 *   ]}
 *   copyright="2026 Brik Designs. All rights reserved."
 * />
 * ```
 *
 * @example Marketing site (newsletter + contact + badges + extra links)
 * ```tsx
 * <Footer
 *   logo={<Logo />}
 *   tagline="We're a digital marketing and design agency."
 *   aboveTop={<NewsletterSection />}
 *   brandExtra={<ContactBlock phone="..." email="..." />}
 *   columns={[
 *     {
 *       heading: 'Services',
 *       links: [
 *         { label: 'Brand Design', href: '/brand', adornment: <ServiceDot color="yellow" /> },
 *       ],
 *     },
 *   ]}
 *   copyright="© 2026 Brik Designs. All rights reserved."
 *   bottomLinks={[
 *     { label: 'Terms', href: '/terms' },
 *     { label: 'Privacy', href: '/privacy' },
 *   ]}
 *   socialLinks={<span>Made with ❤️ in Palm Beach, FL</span>}
 * />
 * ```
 *
 * @summary Page footer with link columns and brand block
 */
export function Footer({
  logo,
  tagline,
  brandExtra,
  columns = [],
  copyright,
  bottomLinks,
  socialLinks,
  aboveTop,
  variant = 'default',
  className = '',
  style,
  ...props
}: FooterProps) {
  const hasBottom =
    copyright || (bottomLinks && bottomLinks.length > 0) || socialLinks;
  const hasBottomLeft =
    copyright || (bottomLinks && bottomLinks.length > 0);

  return (
    <footer
      className={bdsClass('bds-footer', `bds-footer--${variant}`, className)}
      style={style}
      {...props}
    >
      {/* Above-top slot: newsletter, announcement, secondary CTA */}
      {aboveTop && <div className="bds-footer__above-top">{aboveTop}</div>}

      {/* Top section: logo + columns */}
      <div className="bds-footer__top">
        {(logo || tagline || brandExtra) && (
          <div className="bds-footer__logo-area">
            {logo}
            {tagline && <p className="bds-footer__tagline">{tagline}</p>}
            {brandExtra && (
              <div className="bds-footer__brand-extra">{brandExtra}</div>
            )}
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
                    {link.adornment && (
                      <span className="bds-footer__link-adornment">
                        {link.adornment}
                      </span>
                    )}
                    {link.label}
                  </a>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom bar */}
      {hasBottom && (
        <div className="bds-footer__bottom">
          {hasBottomLeft && (
            <div className="bds-footer__bottom-left">
              {copyright && (
                <p className="bds-footer__copyright">{copyright}</p>
              )}
              {bottomLinks && bottomLinks.length > 0 && (
                <ul className="bds-footer__bottom-links">
                  {bottomLinks.map((link, i) => (
                    <Fragment key={link.href + link.label}>
                      {(i > 0 || copyright) && (
                        <li
                          aria-hidden="true"
                          className="bds-footer__bottom-sep"
                        >
                          •
                        </li>
                      )}
                      <li>
                        <a
                          href={link.href}
                          className="bds-footer__bottom-link"
                        >
                          {link.label}
                        </a>
                      </li>
                    </Fragment>
                  ))}
                </ul>
              )}
            </div>
          )}
          {socialLinks && (
            <div className="bds-footer__social">{socialLinks}</div>
          )}
        </div>
      )}
    </footer>
  );
}

export default Footer;
