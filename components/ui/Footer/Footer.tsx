import { type HTMLAttributes, type ReactNode, Fragment } from 'react';
import { type BdsLinkComponent } from '../NavItem';
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
  /**
   * Open in a new tab with `rel="noopener noreferrer"` — for off-site links
   * (social profiles, external resources). Renders a bare `<a>` even when a
   * `linkComponent` is set, since client-side routing doesn't apply to
   * external URLs. Default false.
   */
  external?: boolean;
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
 * Render level for footer column headings
 */
export type FooterColumnHeadingLevel = 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

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
  /**
   * Render level for column headings. Defaults to `h4` so a page whose last
   * in-page heading is `h2` or `h3` keeps `heading-order` (axe) intact —
   * the footer is a universal layout component, and a hardcoded `h6` skips
   * levels on most pages. Opt down (`h5` / `h6`) on pages with deeper trees.
   */
  columnHeadingLevel?: FooterColumnHeadingLevel;
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
  /**
   * Render column + bottom-bar links with a router-aware component (Next.js
   * `Link`, Remix `Link`) for client-side routing instead of the default bare
   * `<a>`. Applies to every `columns[].links[]` and `bottomLinks[]` entry. See
   * ADR-012.
   */
  linkComponent?: BdsLinkComponent;
}

/**
 * Footer variant
 */
export type FooterVariant = 'default' | 'brand' | 'inverse';

/**
 * Renders a footer link with the injected `linkComponent` (client-side routing)
 * or a bare `<a>` when none is provided. Footer links always carry an `href`
 * and have no disabled state, so the dispatch is a straight fallback. See
 * ADR-012.
 */
function FooterLink({
  linkComponent: LinkComponent,
  href,
  external = false,
  className,
  children,
}: {
  linkComponent?: BdsLinkComponent;
  href: string;
  external?: boolean;
  className: string;
  children: ReactNode;
}) {
  // External links open in a new tab and bypass the router `linkComponent` —
  // client-side routing doesn't apply to off-site URLs.
  if (external) {
    return (
      <a href={href} className={className} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  if (LinkComponent) {
    return (
      <LinkComponent href={href} className={className}>
        {children}
      </LinkComponent>
    );
  }
  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

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
  columnHeadingLevel = 'h4',
  copyright,
  bottomLinks,
  socialLinks,
  aboveTop,
  variant = 'default',
  linkComponent,
  className = '',
  style,
  ...props
}: FooterProps) {
  const hasBottom =
    copyright || (bottomLinks && bottomLinks.length > 0) || socialLinks;
  const hasBottomLeft =
    copyright || (bottomLinks && bottomLinks.length > 0);
  const HeadingTag = columnHeadingLevel;

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
                <HeadingTag className="bds-footer__heading">{col.heading}</HeadingTag>
                {col.links.map((link) => (
                  <FooterLink
                    key={link.href + link.label}
                    linkComponent={linkComponent}
                    href={link.href}
                    external={link.external}
                    className="bds-footer__link"
                  >
                    {link.adornment && (
                      <span className="bds-footer__link-adornment">
                        {link.adornment}
                      </span>
                    )}
                    {link.label}
                  </FooterLink>
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
                        <FooterLink
                          linkComponent={linkComponent}
                          href={link.href}
                          className="bds-footer__bottom-link"
                        >
                          {link.label}
                        </FooterLink>
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
