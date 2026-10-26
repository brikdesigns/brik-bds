import { useId, type CSSProperties, type MouseEvent, type ReactNode } from 'react';
import { NavItem, type BdsLinkComponent } from '../NavItem';
import { type DotStatus } from '../Dot';
import './SubNavigation.css';

export interface SubNavItem {
  label: string;
  href: string;
  active?: boolean;
  icon?: ReactNode;
  disabled?: boolean;
  /**
   * Group header text. Consecutive items sharing the same `group` render under
   * one header; items without a `group` render with no header. Flat lists (no
   * `group` on any item) are unchanged.
   */
  group?: string;
  /**
   * Show a small indicator dot after the label — a decorative attention cue.
   * `true` renders the brand-default dot; pass a {@link DotStatus} for a
   * specific status.
   */
  dot?: boolean | DotStatus;
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
  /**
   * Draw the right-side border (the divider between the sub-nav panel and the
   * content column). Default `true`. Set `false` for shells that supply their
   * own separation (e.g. a content-side border or a background step). Only the
   * right border is affected — the header/footer dividers are unchanged.
   */
  bordered?: boolean;
  /** Accessible label for the nav landmark. Required when multiple navs are on the page. */
  ariaLabel?: string;
  /**
   * Render each nav item with a router-aware component (Next.js `Link`, Remix
   * `Link`) for client-side routing instead of the default bare `<a>`.
   * Forwarded to every `NavItem`. See ADR-012.
   */
  linkComponent?: BdsLinkComponent;
  /**
   * Called when an enabled item is clicked, before navigation. Lets a consumer
   * route with its own router (call `event.preventDefault()` and push the
   * route). Not called for `disabled` items.
   */
  onSelect?: (item: SubNavItem, event: MouseEvent<HTMLAnchorElement>) => void;
}

/**
 * SubNavigation — second-column nav for two-column app shells (pair with
 * a collapsed `SidebarNavigation`). Internally renders `NavItem` per entry.
 *
 * For a single-sidebar app shell, use `SidebarNavigation` directly.
 *
 * At tablet width and up it is a sticky, full-height rail: it sticks below the
 * shell top bar (`--bds-shell-top-bar-height`; override with
 * `--bds-subnav-top: 0` for a shell with no top bar) and scrolls on its own
 * only when its items overflow. Below the tablet breakpoint it becomes a single
 * horizontally scrolling row.
 *
 * @summary Second-column sub-nav for two-column app shells
 */
export function SubNavigation({
  items,
  header,
  footer,
  width = '194px',
  ariaLabel = 'Section navigation',
  bordered = true,
  linkComponent,
  onSelect,
}: SubNavigationProps) {
  const groupIdBase = useId();

  // Split into runs of consecutive items sharing a group (ungrouped = one run).
  const runs: { group?: string; items: SubNavItem[] }[] = [];
  for (const item of items) {
    const last = runs[runs.length - 1];
    if (last && last.group === item.group) last.items.push(item);
    else runs.push({ group: item.group, items: [item] });
  }

  const renderItem = (item: SubNavItem) => (
    <NavItem
      key={item.href}
      label={item.label}
      href={item.href}
      icon={item.icon}
      active={item.active}
      disabled={item.disabled}
      dot={item.dot}
      linkComponent={linkComponent}
      onClick={onSelect ? (e) => onSelect(item, e) : undefined}
    />
  );

  return (
    <aside
      className="bds-subnav"
      style={{ '--bds-subnav-width': width } as CSSProperties}
      aria-label={ariaLabel}
      data-bordered={bordered ? undefined : 'false'}
    >
      {header && <div className="bds-subnav__header">{header}</div>}

      <nav className="bds-subnav__nav">
        {runs.map((run, i) => {
          if (run.group === undefined) {
            return run.items.map(renderItem);
          }
          const labelId = `${groupIdBase}-${i}`;
          return (
            <div key={`${run.group}-${i}`} className="bds-subnav__group" role="group" aria-labelledby={labelId}>
              <div id={labelId} className="bds-subnav__group-label">{run.group}</div>
              {run.items.map(renderItem)}
            </div>
          );
        })}
      </nav>

      {footer && <div className="bds-subnav__footer">{footer}</div>}
    </aside>
  );
}

export default SubNavigation;
