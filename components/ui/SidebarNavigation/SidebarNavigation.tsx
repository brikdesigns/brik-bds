import { type ReactNode } from 'react';
import { bdsClass } from '../../utils';
import './SidebarNavigation.css';

export interface SidebarNavItem {
  label: string;
  href: string;
  active?: boolean;
  icon?: ReactNode;
}

export interface SidebarNavigationProps {
  /** Logo node rendered at the top of the sidebar (typically a brand mark or `<img>`). */
  logo: ReactNode;
  /** Primary navigation items. Each renders as an anchor with an optional icon and active state. */
  navItems: SidebarNavItem[];
  /** Optional content rendered above the user section (e.g. settings link, theme toggle). */
  footerActions?: ReactNode;
  /** Bottom section with user identity / account controls (e.g. avatar + email + sign-out). */
  userSection?: ReactNode;
  /** Custom width (default: 260px) — runtime-configurable, stays inline */
  width?: string;
}

/**
 * SidebarNavigation — fixed sidebar with logo, nav items, footer, and user section.
 *
 * Width is a runtime prop passed via inline style.
 */
export function SidebarNavigation({
  logo,
  navItems,
  footerActions,
  userSection,
  width = '260px',
}: SidebarNavigationProps) {
  return (
    <aside className="bds-sidebar-nav" style={{ width }}>
      <div className="bds-sidebar-nav__logo">{logo}</div>

      <nav className="bds-sidebar-nav__nav">
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={bdsClass(
              'bds-sidebar-nav__item',
              item.active && 'bds-sidebar-nav__item--active',
            )}
          >
            {item.icon ? (
              item.icon
            ) : (
              <span
                className={bdsClass(
                  'bds-sidebar-nav__indicator',
                  item.active && 'bds-sidebar-nav__indicator--active',
                )}
              />
            )}
            {item.label}
          </a>
        ))}
      </nav>

      {footerActions && <div className="bds-sidebar-nav__footer">{footerActions}</div>}
      {userSection && <div className="bds-sidebar-nav__user">{userSection}</div>}
    </aside>
  );
}

export default SidebarNavigation;
