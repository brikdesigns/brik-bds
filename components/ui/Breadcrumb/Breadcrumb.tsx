import { Fragment, useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { type BdsLinkComponent } from '../NavItem';
import { Menu } from '../Menu/Menu';
import { Button } from '../Button/Button';
import { Icon } from '../Icon/Icon';
import { bdsClass } from '../../utils';
import './Breadcrumb.css';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export type BreadcrumbSeparator = 'slash' | 'chevron';

/**
 * A sibling record the trail can switch to — e.g. another service page in the
 * same service line, or another project on the same client. Passing two or
 * more of these to {@link Breadcrumb} renders a caret + switcher menu after
 * the trail.
 */
export interface BreadcrumbSwitchOption {
  /** Display label for the sibling record. */
  label: string;
  /** Destination href. */
  href: string;
  /** The record currently being viewed — highlighted and non-navigating. */
  current?: boolean;
}

export interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  /** Crumb trail in order. The last item is rendered as plain text with `aria-current="page"`; earlier items render as `<a>` when `href` is set. */
  items: BreadcrumbItem[];
  /** Visual separator between crumbs. Default `slash` (`/`); `chevron` renders `›`. */
  separator?: BreadcrumbSeparator;
  /**
   * Render each linked crumb with a router-aware component (Next.js `Link`,
   * Remix `Link`) for client-side routing instead of the default bare `<a>`.
   * The current (last) crumb is always plain text. See ADR-012.
   */
  linkComponent?: BdsLinkComponent;
  /**
   * Sibling records to switch between, including the current one. When two or
   * more are passed, a caret after the trail opens a menu of them so consumers
   * can jump between siblings without navigating back to an index page. Fewer
   * than two renders no caret (nothing to switch to), and the trail stays a
   * pure, stateless breadcrumb.
   */
  options?: BreadcrumbSwitchOption[];
  /** Accessible label for the switch trigger, e.g. `Switch service`. Required when `options` is passed. */
  switchLabel?: string;
  /**
   * Called when a non-current option is selected, with its `href`. BDS owns
   * no router, so the default is a full-page navigation
   * (`window.location.href = href`) — pass a router-aware handler (e.g.
   * `(href) => router.push(href)`) for client-side routing.
   */
  onNavigate?: (href: string, option: BreadcrumbSwitchOption) => void;
}

const SEPARATOR_CHARS: Record<BreadcrumbSeparator, string> = {
  slash: '/',
  chevron: '›',
};

/**
 * Renders a linked crumb via the injected `linkComponent` (client-side routing)
 * or a bare `<a>` when none is provided. See ADR-012.
 */
function BreadcrumbLink({
  linkComponent: LinkComponent,
  href,
  children,
}: {
  linkComponent?: BdsLinkComponent;
  href: string;
  children: ReactNode;
}) {
  if (LinkComponent) {
    return (
      <LinkComponent href={href} className="bds-breadcrumb__link">
        {children}
      </LinkComponent>
    );
  }
  return (
    <a href={href} className="bds-breadcrumb__link">
      {children}
    </a>
  );
}

/**
 * Breadcrumb — navigation breadcrumb trail with separator variants.
 *
 * Pass two or more `options` (plus a `switchLabel`) to render a sibling-record
 * switcher: a caret after the trail opens a menu of siblings. Without them the
 * trail is a pure, stateless breadcrumb.
 *
 * @summary Navigation breadcrumb trail, optional sibling-record switcher
 */
export function Breadcrumb({
  items,
  separator = 'slash',
  linkComponent,
  options,
  switchLabel,
  onNavigate,
  className,
  style,
  ...props
}: BreadcrumbProps) {
  const separatorChar = SEPARATOR_CHARS[separator];

  // The caret only renders when there's more than one option (nothing to
  // switch to otherwise). The switch state lives in BreadcrumbSwitch, which
  // only mounts here — so a plain breadcrumb carries no menu state.
  const hasSwitcher = !!options && options.length > 1;

  /* Below the tablet breakpoint the intermediate crumbs collapse behind a
   * single `…` (Breadcrumb.css). Only worth doing with two or more of them —
   * a three-crumb trail fits at 375px and would lose its one middle label for
   * nothing. Everything else relies on the always-on wrap + per-crumb
   * ellipsis. See #468. */
  const collapses = items.length > 3;

  return (
    <nav
      className={bdsClass('bds-breadcrumb', className)}
      style={style}
      aria-label="Breadcrumb"
      {...props}
    >
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        const isIntermediate = i > 0 && !isLast;
        return (
          <Fragment key={`${item.label}-${i}`}>
            {collapses && i === 1 && (
              <span
                className="bds-breadcrumb__item bds-breadcrumb__item--ellipsis"
                aria-hidden="true"
              >
                <span className="bds-breadcrumb__separator">{separatorChar}</span>
                <span className="bds-breadcrumb__ellipsis">…</span>
              </span>
            )}
            <span
              className={bdsClass(
                'bds-breadcrumb__item',
                isIntermediate && collapses && 'bds-breadcrumb__item--collapsible'
              )}
            >
              {i > 0 && (
                <span className="bds-breadcrumb__separator" aria-hidden="true">
                  {separatorChar}
                </span>
              )}
              {isLast || !item.href ? (
                <span
                  className="bds-breadcrumb__current"
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <BreadcrumbLink linkComponent={linkComponent} href={item.href}>
                  {item.label}
                </BreadcrumbLink>
              )}
            </span>
          </Fragment>
        );
      })}
      {hasSwitcher && (
        <BreadcrumbSwitch options={options!} switchLabel={switchLabel} onNavigate={onNavigate} />
      )}
    </nav>
  );
}

/**
 * BreadcrumbSwitch — the caret trigger + sibling-record menu rendered after the
 * trail when {@link Breadcrumb} gets two or more `options`. Kept internal (not
 * exported) so it only mounts when needed and a plain breadcrumb stays
 * stateless. The trailing crumb keeps `aria-current="page"`; this caret is a
 * separate `aria-haspopup="menu"` control alongside it, never folded into the
 * trail.
 */
function BreadcrumbSwitch({
  options,
  switchLabel,
  onNavigate,
}: {
  options: BreadcrumbSwitchOption[];
  switchLabel?: string;
  onNavigate?: (href: string, option: BreadcrumbSwitchOption) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  const activeHref = options.find((option) => option.current)?.href;

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
    <span className="bds-breadcrumb__switch">
      <Button
        ref={triggerRef}
        variant="ghost"
        size="xs"
        // `switchLabel` is the accessible name; fall back to a generic label so
        // the caret is never unlabelled if a consumer omits it (it's typed
        // required on the deprecated BreadcrumbSwitcher shim).
        label={switchLabel ?? 'Switch record'}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        // Stop the mousedown reaching the Menu's document outside-click
        // listener, so toggling closed on the trigger doesn't immediately
        // reopen.
        onMouseDown={(e) => e.stopPropagation()}
        onClick={() => setIsOpen((open) => !open)}
        icon={<Icon icon="ph:caret-down" className="bds-breadcrumb__switch-caret" />}
      />

      {/* Menu positions itself off this relatively positioned trigger span. */}
      <Menu
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        activeId={activeHref}
        className="bds-breadcrumb__switch-menu"
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
  );
}

export default Breadcrumb;
