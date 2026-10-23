import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { type BdsLinkComponent } from '../NavItem';
import { Menu } from '../Menu/Menu';
import { Button } from '../Button/Button';
import { SearchInput } from '../SearchInput/SearchInput';
import { FilterToggle } from '../FilterToggle/FilterToggle';
import { Icon } from '../Icon/Icon';
import { bdsClass } from '../../utils';
import './Breadcrumb.css';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  /**
   * Sibling records THIS crumb can switch to — e.g. the "client" crumb on an
   * admin project page switching between clients, not just the trailing
   * project-to-project switcher. Renders the same caret + menu as the
   * top-level {@link BreadcrumbProps.options}, inline right after this
   * crumb's label/link and before the separator to the next crumb. Two or
   * more `options` are required to render anything — fewer renders nothing,
   * same floor as the trailing switcher.
   */
  switcher?: BreadcrumbSwitchMenuProps & {
    /** Sibling records to switch between, including the current one. */
    options: BreadcrumbSwitchOption[];
    /**
     * Accessible label for this crumb's switch trigger, e.g. `Switch client`.
     * Required (not optional, unlike the top-level `switchLabel`) — a trail
     * can carry more than one per-crumb switcher, so each needs its own
     * distinguishing name rather than falling back to a shared generic label.
     */
    switchLabel: string;
    /**
     * Called when a non-current option is selected, with its `href`. Defaults
     * to a full-page navigation (`window.location.href = href`) — pass a
     * router-aware handler for client-side routing. Independent of the
     * top-level {@link BreadcrumbProps.onNavigate}.
     */
    onNavigate?: (href: string, option: BreadcrumbSwitchOption) => void;
  };
}

export type BreadcrumbSeparator = 'slash' | 'chevron';

/**
 * A sibling record the trail can switch to — e.g. another service page in the
 * same service line, or another project on the same client. Passing two or
 * more of these to {@link Breadcrumb} (via {@link BreadcrumbProps.options} or
 * a per-crumb {@link BreadcrumbItem.switcher}) renders a caret + switcher menu.
 */
export interface BreadcrumbSwitchOption {
  /** Display label for the sibling record. */
  label: string;
  /** Destination href. */
  href: string;
  /** The record currently being viewed — highlighted and non-navigating. */
  current?: boolean;
  /**
   * Secondary text shown under the label, e.g. the record's industry. Display
   * only — search matches the label, not the hint.
   */
  hint?: string;
  /**
   * Data a {@link BreadcrumbSwitchFilter} matches against, keyed by facet
   * name — e.g. `{ industry: 'dental' }`. Never rendered; an option without
   * the facet is hidden when a filter on that facet is on (unless `current`).
   */
  facets?: Record<string, string>;
}

/**
 * A binary on/off filter shown as a `FilterToggle` in a switcher menu. Off by
 * default. When on, options narrow client-side to those where
 * `option.facets[facet] === value`; the `current` option always stays visible.
 * Several filters on at once narrow together (an option must satisfy all).
 */
export interface BreadcrumbSwitchFilter {
  /** Stable identifier for this filter within its switcher. */
  id: string;
  /** Toggle label and accessible name, e.g. `Same industry`. */
  label: string;
  /** Key into each option's `facets` to compare. */
  facet: string;
  /** Facet value an option must equal to stay visible while the filter is on. */
  value: string;
}

/**
 * Search, filter and scope props shared by the top-level switcher and every
 * per-crumb {@link BreadcrumbItem.switcher}. All optional; the menu is a plain
 * list without them.
 */
export interface BreadcrumbSwitchMenuProps {
  /**
   * Binary filters rendered as `FilterToggle`s above the list, off by default.
   * See {@link BreadcrumbSwitchFilter}.
   */
  filters?: BreadcrumbSwitchFilter[];
  /**
   * Text rendered above the list naming what it contains, e.g.
   * `Clients with Online Business Listings`.
   */
  scopeLabel?: string;
  /**
   * A labelled search box (filters options by label, case-insensitive) shows
   * once the option count is greater than this. Default `8`; pass `0` to
   * always search.
   */
  searchThreshold?: number;
}

export interface BreadcrumbProps
  extends HTMLAttributes<HTMLElement>,
    BreadcrumbSwitchMenuProps {
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

const DEFAULT_SEARCH_THRESHOLD = 8;

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
 * Any individual crumb can carry its OWN switcher too — pass `switcher` on
 * that {@link BreadcrumbItem} (e.g. the "client" crumb on an admin project
 * page switching between clients). It renders inline right after that crumb,
 * independent of the trailing `options` switcher — a trail can have neither,
 * either, or both.
 *
 * @summary Navigation breadcrumb trail, optional trailing and/or per-crumb sibling-record switcher
 */
export function Breadcrumb({
  items,
  separator = 'slash',
  linkComponent,
  options,
  switchLabel,
  onNavigate,
  filters,
  scopeLabel,
  searchThreshold,
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
        const itemHasSwitcher = !!item.switcher && item.switcher.options.length > 1;
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
              {itemHasSwitcher && (
                <BreadcrumbSwitch
                  options={item.switcher!.options}
                  switchLabel={item.switcher!.switchLabel}
                  onNavigate={item.switcher!.onNavigate}
                  filters={item.switcher!.filters}
                  scopeLabel={item.switcher!.scopeLabel}
                  searchThreshold={item.switcher!.searchThreshold}
                />
              )}
            </span>
          </Fragment>
        );
      })}
      {hasSwitcher && (
        <BreadcrumbSwitch
          options={options!}
          switchLabel={switchLabel}
          onNavigate={onNavigate}
          filters={filters}
          scopeLabel={scopeLabel}
          searchThreshold={searchThreshold}
        />
      )}
    </nav>
  );
}

/**
 * BreadcrumbSwitch — the caret trigger + sibling-record menu. Mounted once
 * after the trail when {@link Breadcrumb} gets two or more top-level
 * `options`, and again inline per crumb for any {@link BreadcrumbItem} that
 * carries its own `switcher` with two or more options — each call gets its
 * own open/close state, so multiple instances in one trail don't interfere.
 * Kept internal (not exported) so it only mounts when needed and a plain
 * breadcrumb stays stateless. The trailing crumb keeps `aria-current="page"`;
 * a caret is a separate `aria-haspopup="menu"` control alongside it, never
 * folded into the trail.
 */
function BreadcrumbSwitch({
  options,
  switchLabel,
  onNavigate,
  filters,
  scopeLabel,
  searchThreshold = DEFAULT_SEARCH_THRESHOLD,
}: BreadcrumbSwitchMenuProps & {
  options: BreadcrumbSwitchOption[];
  switchLabel?: string;
  onNavigate?: (href: string, option: BreadcrumbSwitchOption) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeFilterIds, setActiveFilterIds] = useState<ReadonlySet<string>>(new Set());
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  const activeHref = options.find((option) => option.current)?.href;

  const showSearch = options.length > searchThreshold;
  const hasFilters = !!filters && filters.length > 0;
  const hasControls = showSearch || hasFilters || !!scopeLabel;

  // A search left in the box would greet the next open with a stale narrowed
  // list. Filter toggles are a deliberate lens, so they persist across opens.
  useEffect(() => {
    if (!isOpen) setQuery('');
  }, [isOpen]);

  const visibleOptions = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const live = (filters ?? []).filter((filter) => activeFilterIds.has(filter.id));
    return options.filter((option) => {
      if (showSearch && needle && !option.label.toLowerCase().includes(needle)) return false;
      if (option.current) return true;
      return live.every((filter) => option.facets?.[filter.facet] === filter.value);
    });
  }, [options, query, filters, activeFilterIds, showSearch]);

  const toggleFilter = (id: string) =>
    setActiveFilterIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

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
        header={
          hasControls ? (
            <div className="bds-breadcrumb__switch-controls">
              {scopeLabel && <span className="bds-breadcrumb__switch-scope">{scopeLabel}</span>}
              {showSearch && (
                <SearchInput
                  size="sm"
                  fullWidth
                  aria-label="Search options"
                  placeholder="Search"
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onClear={() => setQuery('')}
                />
              )}
              {hasFilters && (
                <div className="bds-breadcrumb__switch-filters">
                  {filters!.map((filter) => (
                    <FilterToggle
                      key={filter.id}
                      size="sm"
                      label={filter.label}
                      active={activeFilterIds.has(filter.id)}
                      onToggle={() => toggleFilter(filter.id)}
                    />
                  ))}
                </div>
              )}
              {/* Always mounted so assistive tech announces the empty result;
                  a live region inserted already populated is often missed. */}
              <div className="bds-breadcrumb__switch-status" role="status">
                {visibleOptions.length === 0 ? 'No matches' : null}
              </div>
            </div>
          ) : undefined
        }
        items={visibleOptions.map((option) => ({
          id: option.href,
          label: option.label,
          description: option.hint,
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
