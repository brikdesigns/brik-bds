import { type HTMLAttributes } from 'react';
import {
  Breadcrumb,
  type BreadcrumbItem,
  type BreadcrumbSeparator,
  type BreadcrumbSwitchOption,
} from '../Breadcrumb/Breadcrumb';
import { type BdsLinkComponent } from '../NavItem';

/**
 * @deprecated Use `<Breadcrumb options={…} switchLabel={…} onNavigate={…} />`
 * instead — the switcher folded into `Breadcrumb` as optional props (#2521).
 * This shim forwards unchanged and will be removed in a future major.
 */
export type BreadcrumbSwitcherOption = BreadcrumbSwitchOption;

export interface BreadcrumbSwitcherProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Full crumb trail (reuses `Breadcrumb` — the last item is the current page). */
  items: BreadcrumbItem[];
  /** Sibling records to switch between, including the current one. */
  options: BreadcrumbSwitcherOption[];
  /** Accessible label for the switch trigger, e.g. `Switch service`. */
  switchLabel: string;
  /** Visual separator between crumbs. Forwarded to the internal `Breadcrumb`. */
  separator?: BreadcrumbSeparator;
  /** Router-aware link component for client-side routing. See ADR-012. */
  linkComponent?: BdsLinkComponent;
  /** Called when a non-current option is selected, with its `href`. */
  onNavigate?: (href: string, option: BreadcrumbSwitcherOption) => void;
}

/**
 * BreadcrumbSwitcher — a breadcrumb trail plus a leaf-record switcher menu.
 *
 * @deprecated The switcher folded into {@link Breadcrumb} as optional
 * `options` / `switchLabel` / `onNavigate` props (#2521). Use
 * `<Breadcrumb options={…} switchLabel={…} onNavigate={…} />` directly. This
 * shim forwards unchanged and will be removed in a future major.
 *
 * @summary Deprecated shim — use Breadcrumb with options instead
 */
export function BreadcrumbSwitcher({
  items,
  options,
  switchLabel,
  separator,
  linkComponent,
  onNavigate,
  ...props
}: BreadcrumbSwitcherProps) {
  return (
    <Breadcrumb
      items={items}
      options={options}
      switchLabel={switchLabel}
      separator={separator}
      linkComponent={linkComponent}
      onNavigate={onNavigate}
      {...props}
    />
  );
}

export default BreadcrumbSwitcher;
