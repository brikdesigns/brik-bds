import { type HTMLAttributes, type ReactNode } from 'react';
import { bdsClass } from '../../utils';
import './AppBar.css';

export interface AppBarProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Left slot — the page's breadcrumb trail (a `Breadcrumb`, or a consumer
   * wrapper around one). Absent renders nothing; the right-hand clusters stay
   * right-aligned regardless.
   */
  breadcrumbs?: ReactNode;
  /**
   * Primary actions — rendered at the right, before `utilities`. Absent
   * renders nothing.
   */
  actions?: ReactNode;
  /**
   * Utility cluster at the far right — notifications, theme toggle, profile
   * menu. Absent renders nothing.
   */
  utilities?: ReactNode;
}

/**
 * AppBar — the product app-shell bar: breadcrumbs on the left, `actions` then a
 * `utilities` cluster on the right. It is the content of `AppShell`'s `topBar`
 * slot — the shell owns pinning and height, AppBar fills the slot — and is NOT
 * `TopNavigation`, which is the marketing navbar.
 *
 * Renders a `<div>`, deliberately not a `<header>`: the product-shell canon
 * forbids a banner landmark outside `<main>` (page-structure.mdx § Product app
 * shell), so the bar adds no landmark of its own.
 *
 * @example
 * ```tsx
 * <AppShell
 *   topBar={
 *     <AppBar
 *       breadcrumbs={<Breadcrumb items={trail} />}
 *       utilities={<><NotificationBell /><ProfileMenu /></>}
 *     />
 *   }
 *   main={…}
 * />
 * ```
 *
 * @summary Product app-shell bar — breadcrumbs, actions, utilities
 */
export function AppBar({ breadcrumbs, actions, utilities, className, ...props }: AppBarProps) {
  return (
    <div className={bdsClass('bds-app-bar', className)} {...props}>
      {breadcrumbs && <div className="bds-app-bar__breadcrumbs">{breadcrumbs}</div>}
      {(actions || utilities) && (
        <div className="bds-app-bar__end">
          {actions && <div className="bds-app-bar__actions">{actions}</div>}
          {utilities && <div className="bds-app-bar__utilities">{utilities}</div>}
        </div>
      )}
    </div>
  );
}

export default AppBar;
