import {
  Fragment,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { type BdsLinkComponent } from '../NavItem';
import { Menu } from '../Menu/Menu';
import { Button } from '../Button/Button';
import { FilterToggle } from '../FilterToggle/FilterToggle';
import { Icon } from '../Icon/Icon';
import { bdsClass } from '../../utils';
import { useElementWidth } from '../shared/useElementWidth';
import { chooseTrailLevel, foldedCrumbs, labelCap, type TrailMeasure } from './trailOverflow';
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
   * always search. The search is `Menu`'s (see `MenuSearch`).
   */
  searchThreshold?: number;
}

export interface BreadcrumbProps
  extends HTMLAttributes<HTMLElement>,
    BreadcrumbSwitchMenuProps {
  /**
   * Crumb trail in order. The last item is rendered as plain text with `aria-current="page"`; earlier items render as `<a>` when `href` is set.
   * The trail never wraps: when it does not fit its container the first crumb and the last two stay and the middle crumbs fold into a `More breadcrumbs` menu (on a narrow container, the menu plus the last crumb). A crumb with its own `switcher` never folds; when the trail still does not fit, its label ellipsises instead.
   */
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

// `useLayoutEffect` warns during server rendering; measuring only matters in the browser.
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

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
  title,
  style,
  children,
}: {
  linkComponent?: BdsLinkComponent;
  href: string;
  title: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  if (LinkComponent) {
    return (
      <LinkComponent href={href} title={title} className="bds-breadcrumb__link" style={style}>
        {children}
      </LinkComponent>
    );
  }
  return (
    <a href={href} title={title} className="bds-breadcrumb__link" style={style}>
      {children}
    </a>
  );
}

/**
 * Breadcrumb — navigation breadcrumb trail with separator variants.
 *
 * The trail is one line and never wraps. It is measured against its own
 * container: when every crumb does not fit, the first crumb and the last two
 * stay and the middle crumbs fold into a `More breadcrumbs` button that opens a
 * menu of links; when even that does not fit, only the button and the last
 * crumb remain. A crumb carrying its own `switcher` is never folded — only
 * switcher-less crumbs go into the menu, and once nothing more can fold the
 * kept labels shrink to an ellipsis instead, longest first. A label past its max width ends
 * in an ellipsis, and its full text is the accessible name and the `title`.
 * Folded crumbs render as plain links in the menu (honouring `linkComponent`).
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
 * @summary Navigation breadcrumb trail that folds overflow into a menu, optional trailing and/or per-crumb sibling-record switcher
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

  // Overflow is measured, not counted. SSR and the first paint render the full
  // trail; the hidden measuring pass below reports each crumb's natural width,
  // and the nav's own width decides how much folds. The decision reads only
  // the natural widths, never what is rendered, so collapsing cannot feed back
  // into measuring.
  const [navRef, navWidth] = useElementWidth<HTMLElement>();
  const measureRef = useRef<HTMLSpanElement>(null);
  const [natural, setNatural] = useState<Omit<TrailMeasure, 'available'> | null>(null);

  const signature = items
    .map((item) => `${item.label}\u0001${item.switcher && item.switcher.options.length > 1 ? 1 : 0}`)
    .join('\u0002');

  useIsomorphicLayoutEffect(() => {
    const root = measureRef.current;
    if (!root) return;
    const measure = () => {
      const width = (el: Element | null) => (el ? el.getBoundingClientRect().width : 0);
      const next = {
        crumbs: Array.from(root.querySelectorAll('[data-measure="crumb"]')).map(width),
        labels: Array.from(root.querySelectorAll('[data-measure="label"]')).map(width),
        overflow: width(root.querySelector('[data-measure="overflow"]')),
        separator: width(root.querySelector('[data-measure="separator"]')),
        trailing: width(root.querySelector('[data-measure="trailing"]')),
        gap: parseFloat(getComputedStyle(root).columnGap) || 0,
      };
      setNatural((prev) => (prev && JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
    // The measuring pass re-renders with the trail; `signature` stands in for `items`.
  }, [signature, separator, hasSwitcher]);

  // A crumb with a working switcher never folds (the overflow menu lists plain
  // links, so folding it would drop the switcher).
  const pinned = items.map((item) => !!item.switcher && item.switcher.options.length > 1);
  const measured = natural && navWidth !== null ? { ...natural, pinned, available: navWidth } : null;
  const level = measured ? chooseTrailLevel(measured) : 'full';
  // Nothing left to fold and still too wide: every kept label shares one max
  // width, so the longest shrink first and a short one keeps its text.
  const cap = measured ? labelCap(measured, level) : null;
  const labelStyle = cap !== null ? { maxWidth: cap } : undefined;

  const last = items.length - 1;
  const hidden = new Set(foldedCrumbs(items.length, level, pinned));
  const visible = items
    .map((item, index) => ({ item, index }))
    .filter(({ index }) => !hidden.has(index));
  // Each run of consecutive folded crumbs gets its own overflow button, placed
  // before the crumb that ends the run, so the trail keeps its order.
  const foldedRunBefore = (index: number) => {
    const run: BreadcrumbItem[] = [];
    for (let i = index - 1; hidden.has(i); i--) run.unshift(items[i]);
    return run;
  };

  return (
    <nav
      ref={navRef}
      className={bdsClass('bds-breadcrumb', cap !== null && 'bds-breadcrumb--capped', className)}
      style={style}
      aria-label="Breadcrumb"
      {...props}
    >
      {visible.map(({ item, index: i }) => {
        const isLast = i === last;
        const itemHasSwitcher = pinned[i];
        const folded = foldedRunBefore(i);
        return (
          <Fragment key={`${item.label}-${i}`}>
            {folded.length > 0 && (
              <span className="bds-breadcrumb__item">
                {i - folded.length > 0 && (
                  <span className="bds-breadcrumb__separator" aria-hidden="true">
                    {separatorChar}
                  </span>
                )}
                <BreadcrumbOverflow crumbs={folded} linkComponent={linkComponent} />
              </span>
            )}
            <span className="bds-breadcrumb__item">
              {i > 0 && (
                <span className="bds-breadcrumb__separator" aria-hidden="true">
                  {separatorChar}
                </span>
              )}
              {isLast || !item.href ? (
                <span
                  className="bds-breadcrumb__current"
                  title={item.label}
                  aria-current={isLast ? 'page' : undefined}
                  style={labelStyle}
                >
                  {item.label}
                </span>
              ) : (
                <BreadcrumbLink
                  linkComponent={linkComponent}
                  href={item.href}
                  title={item.label}
                  style={labelStyle}
                >
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
      {/* Hidden measuring pass: the full trail's natural widths. Label text is
          drawn from `data-label` (CSS) so it adds no text to the DOM or the
          accessibility tree; the buttons are disabled and out of the tab order. */}
      <span ref={measureRef} className="bds-breadcrumb__measure" aria-hidden="true">
        {items.map((item, i) => (
          <span key={i} className="bds-breadcrumb__item" data-measure="crumb">
            {i > 0 && (
              <span className="bds-breadcrumb__separator" data-measure="separator">
                {separatorChar}
              </span>
            )}
            <span
              className={bdsClass(
                'bds-breadcrumb__measure-label',
                i === last || !item.href ? 'bds-breadcrumb__current' : 'bds-breadcrumb__link',
              )}
              data-label={item.label}
              data-measure="label"
            />
            {item.switcher && item.switcher.options.length > 1 && <MeasureButton />}
          </span>
        ))}
        <span data-measure="overflow" className="bds-breadcrumb__switch">
          <MeasureButton icon="ph:dots-three" />
        </span>
        {hasSwitcher && (
          <span data-measure="trailing" className="bds-breadcrumb__switch">
            <MeasureButton />
          </span>
        )}
      </span>
    </nav>
  );
}

/** A disabled stand-in for a switch/overflow trigger, used only to measure its width. */
function MeasureButton({ icon = 'ph:caret-down' }: { icon?: string }) {
  return (
    <Button
      variant="ghost"
      size="xs"
      label="Measure"
      disabled
      tabIndex={-1}
      icon={<Icon icon={icon} />}
    />
  );
}

/**
 * BreadcrumbOverflow — the `More breadcrumbs` button + menu holding the crumbs
 * folded out of a trail that does not fit. A real button in the tab order; the
 * folded crumbs are plain links (honouring `linkComponent`) — a crumb with its
 * own switcher is never folded, so none is lost here. A crumb with no `href`
 * is listed but disabled.
 */
function BreadcrumbOverflow({
  crumbs,
  linkComponent,
}: {
  crumbs: BreadcrumbItem[];
  linkComponent?: BdsLinkComponent;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    // Return focus to the trigger when the menu closes via Escape or an
    // outside click (same contract as BreadcrumbSwitch).
    if (wasOpen.current && !isOpen) triggerRef.current?.focus();
    wasOpen.current = isOpen;
  }, [isOpen]);

  return (
    <span className="bds-breadcrumb__switch">
      <Button
        ref={triggerRef}
        variant="ghost"
        size="xs"
        label="More breadcrumbs"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        // Keep the mousedown away from Menu's document outside-click listener
        // so toggling closed on the trigger doesn't immediately reopen.
        onMouseDown={(e) => e.stopPropagation()}
        onClick={() => setIsOpen((open) => !open)}
        icon={<Icon icon="ph:dots-three" />}
      />
      <Menu
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        className="bds-breadcrumb__switch-menu"
        linkComponent={linkComponent}
        items={crumbs.map((crumb, i) => ({
          id: `${i}-${crumb.href ?? crumb.label}`,
          label: crumb.label,
          href: crumb.href,
          disabled: !crumb.href,
          onClick: () => setIsOpen(false),
        }))}
      />
    </span>
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
  searchThreshold,
}: BreadcrumbSwitchMenuProps & {
  options: BreadcrumbSwitchOption[];
  switchLabel?: string;
  onNavigate?: (href: string, option: BreadcrumbSwitchOption) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilterIds, setActiveFilterIds] = useState<ReadonlySet<string>>(new Set());
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  const activeHref = options.find((option) => option.current)?.href;

  const hasFilters = !!filters && filters.length > 0;
  const hasControls = hasFilters || !!scopeLabel;

  // Search is Menu's (ADR-049 lookup mode); it resets on close. Filter
  // toggles are a deliberate lens, so they persist across opens.
  const visibleOptions = useMemo(() => {
    const live = (filters ?? []).filter((filter) => activeFilterIds.has(filter.id));
    return options.filter((option) => {
      if (option.current) return true;
      return live.every((filter) => option.facets?.[filter.facet] === filter.value);
    });
  }, [options, filters, activeFilterIds]);

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
        // `total` keeps the field in place while a filter shrinks the list.
        search={{ threshold: searchThreshold, total: options.length }}
        header={
          hasControls ? (
            <div className="bds-breadcrumb__switch-controls">
              {scopeLabel && <span className="bds-breadcrumb__switch-scope">{scopeLabel}</span>}
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
