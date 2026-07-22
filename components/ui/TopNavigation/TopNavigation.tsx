import { type HTMLAttributes, type ReactNode } from 'react';
import { type BdsLinkComponent } from '../NavItem';
import { bdsClass } from '../../utils';
import './TopNavigation.css';

/**
 * Navigation link item
 */
export interface TopNavigationLink {
  /** Display label */
  label: string;
  /** Link URL */
  href: string;
  /** Whether this link is currently active */
  active?: boolean;
}

/**
 * TopNavigation component props
 */
export interface TopNavigationProps extends HTMLAttributes<HTMLElement> {
  /** Logo element (image, SVG, or text) */
  logo: ReactNode;
  /** Navigation links */
  links?: TopNavigationLink[];
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
function TopNavigationLinkItem({
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
 * TopNavigation - BDS horizontal top navigation bar
 *
 * A responsive navigation bar with logo, links, and optional action area.
 * Matches the Webflow .navbar component structure.
 *
 * @example
 * ```tsx
 * <TopNavigation
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
export function TopNavigation({
  logo,
  links = [],
  actions,
  sticky = false,
  linkComponent,
  className = '',
  style,
  ...props
}: TopNavigationProps) {
  return (
    <nav
      className={bdsClass(
        'bds-top-navigation',
        sticky ? 'bds-top-navigation--sticky' : undefined,
        className,
      )}
      style={style}
      {...props}
    >
      <div className="bds-top-navigation__left">
        <div className="bds-top-navigation__logo">{logo}</div>
        {links.length > 0 && (
          <div className="bds-top-navigation__links">
            {links.map((link) => (
              <TopNavigationLinkItem
                key={link.href}
                linkComponent={linkComponent}
                href={link.href}
                className={bdsClass(
                  'bds-top-navigation__link',
                  link.active ? 'bds-top-navigation__link--active' : undefined,
                )}
                ariaCurrent={link.active ? 'page' : undefined}
              >
                {link.label}
              </TopNavigationLinkItem>
            ))}
          </div>
        )}
      </div>
      {actions && <div className="bds-top-navigation__actions">{actions}</div>}
    </nav>
  );
}

export default TopNavigation;
