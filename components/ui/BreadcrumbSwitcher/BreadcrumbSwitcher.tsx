import { useEffect, useRef, useState, type HTMLAttributes } from 'react';
import {
  Breadcrumb,
  type BreadcrumbItem,
  type BreadcrumbSeparator,
} from '../Breadcrumb/Breadcrumb';
import { type BdsLinkComponent } from '../NavItem';
import { Menu } from '../Menu/Menu';
import { Button } from '../Button/Button';
import { Icon } from '../Icon/Icon';
import { bdsClass } from '../../utils';
import './BreadcrumbSwitcher.css';

/**
 * A sibling record the trail can switch to — e.g. another service page in the
 * same service line, or another project on the same client.
 */
export interface BreadcrumbSwitcherOption {
  /** Display label for the sibling record. */
  label: string;
  /** Destination href. */
  href: string;
  /** The record currently being viewed — highlighted and non-navigating. */
  current?: boolean;
}

export interface BreadcrumbSwitcherProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Full crumb trail (reuses `Breadcrumb` — the last item is the current page). */
  items: BreadcrumbItem[];
  /** Sibling records to switch between, including the current one. */
  options: BreadcrumbSwitcherOption[];
  /** Accessible label for the switch trigger, e.g. `Switch service`. */
  switchLabel: string;
  /**
   * Visual separator between crumbs. Forwarded to the internal `Breadcrumb`.
   * Default `slash` (`/`); `chevron` renders `›`.
   */
  separator?: BreadcrumbSeparator;
  /**
   * Render linked crumbs with a router-aware component (Next.js `Link`, Remix
   * `Link`) for client-side routing instead of the default `<a>`. Forwarded
   * to the internal `Breadcrumb`. See ADR-012.
   */
  linkComponent?: BdsLinkComponent;
  /**
   * Called when a non-current option is selected, with its `href`. BDS owns
   * no router, so the default is a full-page navigation
   * (`window.location.href = href`) — pass a router-aware handler (e.g.
   * `(href) => router.push(href)`) for client-side routing.
   */
  onNavigate?: (href: string, option: BreadcrumbSwitcherOption) => void;
}

/**
 * BreadcrumbSwitcher — a breadcrumb trail plus a leaf-record switcher menu.
 *
 * The trailing crumb names the record being viewed. A caret after the trail
 * opens a menu of sibling records so consumers can jump between them without
 * navigating back to an index page. The `Breadcrumb` trail renders unchanged
 * — the current crumb keeps `aria-current="page"`; the caret is a separate
 * `aria-haspopup="menu"` control alongside it, never folded into the trail.
 *
 * The caret only renders when there's more than one option (nothing to
 * switch to otherwise).
 *
 * @summary Breadcrumb trail with a sibling-record switcher menu
 */
export function BreadcrumbSwitcher({
  items,
  options,
  switchLabel,
  separator,
  linkComponent,
  onNavigate,
  className,
  style,
  ...props
}: BreadcrumbSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  const activeHref = options.find((option) => option.current)?.href;
  const hasSwitcher = options.length > 1;

  useEffect(() => {
    // Return focus to the trigger when the menu closes via Escape or an
    // outside click. A click on the trigger itself already keeps native
    // button focus, so this only fires for the other two close paths.
    if (wasOpen.current && !isOpen) {
      triggerRef.current?.focus();
    }
    wasOpen.current = isOpen;
  }, [isOpen]);

  return (
    <div className={bdsClass('bds-breadcrumb-switcher', className)} style={style} {...props}>
      {/* `separator` is forwarded undefined when unset so `Breadcrumb` stays the
          single owner of the `slash` default — no second copy to drift. */}
      <Breadcrumb items={items} separator={separator} linkComponent={linkComponent} />

      {hasSwitcher && (
        <span className="bds-breadcrumb-switcher__trigger">
          <Button
            ref={triggerRef}
            variant="ghost"
            size="xs"
            label={switchLabel}
            aria-haspopup="menu"
            aria-expanded={isOpen}
            // Stop the mousedown reaching the Menu's document outside-click
            // listener, so toggling closed on the trigger doesn't
            // immediately reopen.
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => setIsOpen((open) => !open)}
            icon={<Icon icon="ph:caret-down" className="bds-breadcrumb-switcher__caret" />}
          />

          {/* Menu positions itself off this relatively positioned trigger span. */}
          <Menu
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            activeId={activeHref}
            className="bds-breadcrumb-switcher__menu"
            items={options.map((option) => ({
              id: option.href,
              label: option.label,
              onClick: () => {
                setIsOpen(false);
                if (option.current) return;
                if (onNavigate) {
                  onNavigate(option.href, option);
                } else {
                  window.location.href = option.href;
                }
              },
            }))}
          />
        </span>
      )}
    </div>
  );
}

export default BreadcrumbSwitcher;
