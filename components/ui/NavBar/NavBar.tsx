import { type HTMLAttributes, type ReactNode } from 'react';
import { type BdsLinkComponent } from '../NavItem';
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
  /**
   * Render each nav link with a router-aware component (Next.js `Link`, Remix
   * `Link`) for client-side routing instead of the default bare `<a>`. See
   * ADR-012.
   */
  linkComponent?: BdsLinkComponent;
}

/**
 * Renders a nav link via the injected `linkComponent` (client-side routing) or
 * a bare `<a>` when none is provided. See ADR-012.
 */
function NavBarLinkItem({
  linkComponent: LinkComponent,
  href,
  className,
  ariaCurrent,
  children,
}: {
  linkComponent?: BdsLinkComponent;
  href: string;
  className: string;
  ariaCurrent?: 'page';
  children: ReactNode;
}) {
  if (LinkComponent) {
    return (
      <LinkComponent href={href} className={className} aria-current={ariaCurrent}>
        {children}
      </LinkComponent>
    );
  }
  return (
    <a href={href} className={className} aria-current={ariaCurrent}>
      {children}
    </a>
  );
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
 *
 * @summary Horizontal top navigation bar with brand and links
 */
export function NavBar({
  logo,
  links = [],
  actions,
  sticky = false,
  linkComponent,
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
              <NavBarLinkItem
                key={link.href}
                linkComponent={linkComponent}
                href={link.href}
                className={bdsClass(
                  'bds-nav-bar__link',
                  link.active ? 'bds-nav-bar__link--active' : undefined,
                )}
                ariaCurrent={link.active ? 'page' : undefined}
              >
                {link.label}
              </NavBarLinkItem>
            ))}
          </div>
        )}
      </div>
      {actions && <div className="bds-nav-bar__actions">{actions}</div>}
    </nav>
  );
}

export default NavBar;
