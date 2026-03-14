import { type HTMLAttributes, type ReactNode } from 'react';
import { bdsClass } from '../../utils';
import './NavBar.css';

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
      className={bdsClass(
        'bds-nav-bar',
        sticky ? 'bds-nav-bar--sticky' : undefined,
        className,
      )}
      style={style}
      {...props}
    >
      <div className="bds-nav-bar__left">
        <div className="bds-nav-bar__logo">{logo}</div>
        {links.length > 0 && (
          <div className="bds-nav-bar__links">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={bdsClass(
                  'bds-nav-bar__link',
                  link.active ? 'bds-nav-bar__link--active' : undefined,
                )}
                aria-current={link.active ? 'page' : undefined}
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </div>
      {actions && <div className="bds-nav-bar__actions">{actions}</div>}
    </nav>
  );
}

export default NavBar;
