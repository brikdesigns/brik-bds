import { type ReactNode } from 'react';
import { NavItem, type BdsLinkComponent } from '../NavItem';
import './SubNavigation.css';

export interface SubNavItem {
  label: string;
  href: string;
  active?: boolean;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface SubNavigationProps {
  /** Sub-nav items — each renders as a `NavItem` internally. */
  items: SubNavItem[];
  /** Optional header rendered above the item list (e.g. section title). */
  header?: ReactNode;
  /** Optional footer rendered below the item list. */
  footer?: ReactNode;
  /** Custom width (default: 194px). */
  width?: string;
  /** Accessible label for the nav landmark. Required when multiple navs are on the page. */
  ariaLabel?: string;
  /**
   * Render each nav item with a router-aware component (Next.js `Link`, Remix
   * `Link`) for client-side routing instead of the default bare `<a>`.
   * Forwarded to every `NavItem`. See ADR-012.
   */
  linkComponent?: BdsLinkComponent;
}

/**
 * SubNavigation — second-column nav for two-column app shells (pair with
 * a collapsed `SidebarNavigation`). Internally renders `NavItem` per entry.
 *
 * For a single-sidebar app shell, use `SidebarNavigation` directly.
 *
 * @summary Second-column sub-nav for two-column app shells
 */
export function SubNavigation({
  items,
  header,
  footer,
  width = '194px',
  ariaLabel = 'Section navigation',
  linkComponent,
}: SubNavigationProps) {
  return (
    <aside className="bds-subnav" style={{ width }} aria-label={ariaLabel}>
      {header && <div className="bds-subnav__header">{header}</div>}

      <nav className="bds-subnav__nav">
        {items.map((item) => (
          <NavItem
            key={item.href}
            label={item.label}
            href={item.href}
            icon={item.icon}
            active={item.active}
            disabled={item.disabled}
            linkComponent={linkComponent}
          />
        ))}
      </nav>

      {footer && <div className="bds-subnav__footer">{footer}</div>}
    </aside>
  );
}

export default SubNavigation;
