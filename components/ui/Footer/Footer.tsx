import { type HTMLAttributes, type ReactNode, type CSSProperties } from 'react';
import { bdsClass } from '../../utils';

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
 * Variant styles
 *
 * Token reference:
 * - default: --surface-primary bg, standard text colors
 * - brand: --surface-brand-primary bg, inverse text
 */
const variantStyles: Record<FooterVariant, {
  container: CSSProperties;
  heading: CSSProperties;
  link: CSSProperties;
  tagline: CSSProperties;
  copyright: CSSProperties;
}> = {
  default: {
    container: {
      backgroundColor: 'var(--surface-primary)',
      borderTop: 'var(--border-width-lg) solid var(--border-secondary)',
    },
    heading: { color: 'var(--text-primary)' },
    link: { color: 'var(--text-secondary)' },
    tagline: { color: 'var(--text-secondary)' },
    copyright: { color: 'var(--text-muted)' },
  },
  brand: {
    container: {
      backgroundColor: 'var(--surface-brand-primary)',
    },
    heading: { color: 'var(--text-inverse)' },
    link: { color: 'var(--text-inverse)' },
    tagline: { color: 'var(--text-inverse)' },
    copyright: { color: 'var(--text-inverse)' },
  },
};

/**
 * Footer container styles
 *
 * Token reference:
 * - --padding-xl = 32px (vertical padding)
 * - --padding-lg = 24px (horizontal padding)
 * - --gap-xl = 24px (gap between sections)
 */
const footerStyles: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--gap-xl)',
  padding: 'var(--padding-xl) var(--padding-lg)',
  width: '100%',
  boxSizing: 'border-box',
};

/**
 * Top section: logo + columns layout
 *
 * Token reference:
 * - --gap-xl = 24px
 */
const topSectionStyles: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 'var(--gap-xl)',
  width: '100%',
};

/**
 * Logo area styles
 */
const logoAreaStyles: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--gap-md)',
  minWidth: 200,
  flex: '1 1 200px',
};

/**
 * Columns container styles
 */
const columnsContainerStyles: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 'var(--gap-xl)',
  flex: '2 1 400px',
};

/**
 * Individual column styles
 *
 * Token reference (from Webflow .footer-list):
 * - --gap-md = 8px (gap between links)
 */
const columnStyles: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--gap-md)',
  flex: '1 1 140px',
  minWidth: 0,
};

/**
 * Column heading styles
 *
 * Token reference:
 * - --font-family-label
 * - --label-md = font-size/100 = 16px
 * - --font-weight-semi-bold = 600
 */
const headingStyles: CSSProperties = {
  fontFamily: 'var(--font-family-label)',
  fontSize: 'var(--label-md)',
  fontWeight: 'var(--font-weight-semi-bold)' as unknown as number,
  lineHeight: 'var(--font-line-height-snug)',
  margin: 0,
};

/**
 * Column link styles
 *
 * Token reference:
 * - --font-family-body
 * - --body-sm = font-size/75 = 14px
 * - --font-weight-regular = 400
 */
const linkStyles: CSSProperties = {
  fontFamily: 'var(--font-family-body)',
  fontSize: 'var(--body-sm)',
  fontWeight: 'var(--font-weight-regular)' as unknown as number,
  lineHeight: 'var(--font-line-height-normal)',
  textDecoration: 'none',
  transition: 'opacity 0.15s ease',
};

/**
 * Tagline styles
 *
 * Token reference:
 * - --font-family-body
 * - --body-sm = 14px
 */
const taglineStyles: CSSProperties = {
  fontFamily: 'var(--font-family-body)',
  fontSize: 'var(--body-sm)',
  fontWeight: 'var(--font-weight-regular)' as unknown as number,
  lineHeight: 'var(--font-line-height-normal)',
  margin: 0,
  maxWidth: 280,
};

/**
 * Bottom bar styles (copyright + social)
 *
 * Token reference:
 * - --border-secondary (top border)
 * - --padding-md = 16px (top padding)
 */
const bottomBarStyles: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 'var(--gap-lg)',
  paddingTop: 'var(--padding-md)',
  borderTop: 'var(--border-width-sm) solid var(--border-secondary)',
};

/**
 * Copyright text styles
 *
 * Token reference:
 * - --font-family-body
 * - --body-xs = font-size/50 = 11.54px
 */
const copyrightStyles: CSSProperties = {
  fontFamily: 'var(--font-family-body)',
  fontSize: 'var(--body-xs)',
  fontWeight: 'var(--font-weight-regular)' as unknown as number,
  margin: 0,
};

/**
 * Social links container
 */
const socialContainerStyles: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--gap-md)',
};

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
  const v = variantStyles[variant];

  return (
    <footer
      className={bdsClass('bds-footer', className)}
      style={{ ...footerStyles, ...v.container, ...style }}
      {...props}
    >
      {/* Top section: logo + columns */}
      <div style={topSectionStyles}>
        {(logo || tagline) && (
          <div style={logoAreaStyles}>
            {logo}
            {tagline && <p style={{ ...taglineStyles, ...v.tagline }}>{tagline}</p>}
          </div>
        )}
        {columns.length > 0 && (
          <div style={columnsContainerStyles}>
            {columns.map((col) => (
              <div key={col.heading} style={columnStyles}>
                <h6 style={{ ...headingStyles, ...v.heading }}>{col.heading}</h6>
                {col.links.map((link) => (
                  <a
                    key={link.href + link.label}
                    href={link.href}
                    style={{ ...linkStyles, ...v.link }}
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
        <div style={bottomBarStyles}>
          {copyright && <p style={{ ...copyrightStyles, ...v.copyright }}>{copyright}</p>}
          {socialLinks && <div style={socialContainerStyles}>{socialLinks}</div>}
        </div>
      )}
    </footer>
  );
}

export default Footer;
