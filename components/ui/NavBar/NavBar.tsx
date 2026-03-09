import { type HTMLAttributes, type ReactNode, type CSSProperties } from 'react';
import { bdsClass } from '../../utils';

/**
 * Navigation link item
 */
export interface NavBarLink {
  /** Display label */
  label: string;
  /** Link URL */
  href: string;
  /** Whether this link is currently active */
  active?: boolean;
}

/**
 * NavBar component props
 */
export interface NavBarProps extends HTMLAttributes<HTMLElement> {
  /** Logo element (image, SVG, or text) */
  logo: ReactNode;
  /** Navigation links */
  links?: NavBarLink[];
  /** Right-side actions (buttons, dropdowns) */
  actions?: ReactNode;
  /** Sticky positioning */
  sticky?: boolean;
}

/**
 * Nav container styles
 *
 * Token reference (from Webflow .navbar):
 * - --surface-nav (navbar background)
 * - --padding-md = 16px (vertical padding)
 * - z-index: 100
 */
const navStyles: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  padding: 'var(--padding-md) var(--padding-lg)',
  backgroundColor: 'var(--surface-nav)',
  boxSizing: 'border-box',
  zIndex: 100,
};

/**
 * Links container styles
 *
 * Token reference:
 * - --gap-lg = 16px (gap between links)
 */
const linksContainerStyles: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--gap-lg)',
  flexWrap: 'wrap',
};

/**
 * Link base styles
 *
 * Token reference:
 * - --font-family-label
 * - --label-sm = font-size/75 = 14px
 * - --font-weight-regular = 400
 * - --text-secondary (default)
 * - --text-primary (active)
 */
const linkBaseStyles: CSSProperties = {
  fontFamily: 'var(--font-family-label)',
  fontSize: 'var(--label-sm)',
  fontWeight: 'var(--font-weight-regular)' as unknown as number,
  lineHeight: 'var(--font-line-height-snug)',
  color: 'var(--text-secondary)',
  textDecoration: 'none',
  transition: 'color 0.15s ease',
  cursor: 'pointer',
};

const linkActiveStyles: CSSProperties = {
  fontWeight: 'var(--font-weight-semi-bold)' as unknown as number,
  color: 'var(--text-primary)',
};

/**
 * Actions container styles
 */
const actionsContainerStyles: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--gap-md)',
  flexShrink: 0,
};

/**
 * NavBar - BDS horizontal top navigation bar
 *
 * A responsive navigation bar with logo, links, and optional action area.
 * Matches the Webflow .navbar component structure.
 *
 * @example
 * ```tsx
 * <NavBar
 *   logo={<img src="/logo.svg" alt="Logo" height={32} />}
 *   links={[
 *     { label: 'Home', href: '/', active: true },
 *     { label: 'Features', href: '/features' },
 *     { label: 'Pricing', href: '/pricing' },
 *   ]}
 *   actions={<Button size="sm">Get Started</Button>}
 * />
 * ```
 */
export function NavBar({
  logo,
  links = [],
  actions,
  sticky = false,
  className = '',
  style,
  ...props
}: NavBarProps) {
  return (
    <nav
      className={bdsClass('bds-nav-bar', className)}
      style={{
        ...navStyles,
        position: sticky ? 'sticky' : 'relative',
        top: sticky ? 0 : undefined,
        ...style,
      }}
      {...props}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-xl)', flexWrap: 'wrap', minWidth: 0 }}>
        <div style={{ flexShrink: 0 }}>{logo}</div>
        {links.length > 0 && (
          <div style={linksContainerStyles}>
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                style={{
                  ...linkBaseStyles,
                  ...(link.active ? linkActiveStyles : {}),
                }}
                aria-current={link.active ? 'page' : undefined}
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </div>
      {actions && <div style={actionsContainerStyles}>{actions}</div>}
    </nav>
  );
}

export default NavBar;
