import { type ReactNode } from 'react';
import { NavItem } from '../NavItem';
import { bdsClass } from '../../utils';
import './SidebarNavigation.css';

export interface SidebarNavItem {
  label: string;
  href: string;
  active?: boolean;
  icon?: ReactNode;
  disabled?: boolean;
}

export type SidebarPosition = 'fixed' | 'sticky';

export interface SidebarNavigationProps {
  /** Logo node rendered at the top of the sidebar (typically a brand mark or `<img>`). */
  logo: ReactNode;
  /** Primary navigation items. Each renders as a `NavItem`. */
  navItems: SidebarNavItem[];
  /** Optional content rendered above the profile section (e.g. settings link, theme toggle). */
  footerActions?: ReactNode;
  /** Bottom profile slot — avatar + identity + account controls. */
  profile?: ReactNode;
  /**
   * @deprecated Use `profile` instead. Kept for one minor version for backward
   * compatibility — slated for removal in the next major bump. If both `profile`
   * and `userSection` are passed, `profile` wins.
   */
  userSection?: ReactNode;
  /**
   * Render in collapsed (icon-only) mode. Item labels become `aria-label`;
   * visible content is the icon only. Default width drops to 80px. Pair with
   * `SubNavigation` for a two-column app shell.
   */
  collapsed?: boolean;
  /**
   * Layout positioning.
   * - `'fixed'` (default) — anchored to viewport edge; sibling content needs
   *   margin-left to clear the sidebar. Legacy single-column shells.
   * - `'sticky'` — sits in flex flow, pinned to top on scroll. Required for
   *   two-column shells paired with `SubNavigation` (no margin-left needed).
   */
  position?: SidebarPosition;
  /** Custom width (default: 260px expanded, 80px collapsed). */
  width?: string;
}

/**
 * SidebarNavigation — primary app sidebar with logo, nav items, footer, and profile.
 *
 * Internally renders `NavItem` for each entry. Toggle `collapsed` for icon-only
 * mode that pairs with `SubNavigation`. Use `position="sticky"` for two-column
 * shells; default `'fixed'` preserves the legacy single-column behavior.
 *
 * @summary App sidebar — logo, nav, footer, profile
 */
export function SidebarNavigation({
  logo,
  navItems,
  footerActions,
  profile,
  userSection,
  collapsed = false,
  position = 'fixed',
  width,
}: SidebarNavigationProps) {
  const resolvedWidth = width ?? (collapsed ? '80px' : '260px');
  const resolvedProfile = profile ?? userSection;

  return (
    <aside
      className={bdsClass(
        'bds-sidebar-nav',
        collapsed && 'bds-sidebar-nav--collapsed',
        position === 'sticky' && 'bds-sidebar-nav--sticky',
      )}
      style={{ width: resolvedWidth }}
    >
      <div className="bds-sidebar-nav__logo">{logo}</div>

      <nav className="bds-sidebar-nav__nav">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            label={item.label}
            href={item.href}
            icon={item.icon}
            active={item.active}
            disabled={item.disabled}
            iconOnly={collapsed}
          />
        ))}
      </nav>

      {footerActions && <div className="bds-sidebar-nav__footer">{footerActions}</div>}
      {resolvedProfile && <div className="bds-sidebar-nav__profile">{resolvedProfile}</div>}
    </aside>
  );
}

export default SidebarNavigation;
