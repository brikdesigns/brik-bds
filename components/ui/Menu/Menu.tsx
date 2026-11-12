import {
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { Button } from '../Button/Button';
import { SearchInput } from '../SearchInput/SearchInput';
import { bdsClass } from '../../utils';
import './Menu.css';

const DEFAULT_SEARCH_THRESHOLD = 8;

/**
 * MenuItem data shape
 */
export interface MenuItemData {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /**
   * Optional secondary description rendered below the label as a
   * second line. When omitted, the item is single-line.
   */
  description?: string;
  /** Optional icon before the label */
  icon?: ReactNode;
  /**
   * Custom node rendered as the item's content instead of the default
   * icon + label + description — e.g. a line-colored `ServiceTag`. The item
   * stays a `role="menuitem"` button; `label` is used as its accessible name.
   */
  content?: ReactNode;
  /** Disabled state */
  disabled?: boolean;
  /** Click handler */
  onClick?: () => void;
}

/**
 * A labelled group of menu items. Mirrors `Select`'s `SelectOptionGroup` /
 * `MultiSelect`'s `MultiSelectOptionGroup` — the menu renders one section per
 * group with a non-interactive header (e.g. one group per service line).
 */
export interface MenuItemGroup {
  /** Group header label. */
  label: string;
  /** Items belonging to this group. */
  items: MenuItemData[];
}

function isItemGroup(entry: MenuItemData | MenuItemGroup): entry is MenuItemGroup {
  return 'items' in entry;
}

/** Item count, with each group counted by the items it holds. */
function countItems(entries: (MenuItemData | MenuItemGroup)[]): number {
  return entries.reduce((n, entry) => n + (isItemGroup(entry) ? entry.items.length : 1), 0);
}

/**
 * Lookup search for a {@link Menu} (ADR-049 § 1, lookup mode): type ahead to
 * pick one item from a known list. Every field is optional; pass `{}` for the
 * defaults. Further lookup controls join this object as optional fields, so
 * adding one never breaks an existing caller.
 */
export interface MenuSearch {
  /**
   * The field shows once the item count is greater than this. Default `8`;
   * `0` always shows it. A short list is scannable without a field.
   */
  threshold?: number;
  /**
   * The count `threshold` is measured against. Defaults to the number of
   * items (a group counts its items). Pass the full count when `items` is
   * already narrowed, e.g. by a filter, so the field stays put as the list
   * shrinks.
   */
  total?: number;
}

/**
 * Menu open direction relative to its trigger.
 * - `bottom` (default) — panel opens downward; the consumer's relatively
 *   positioned wrapper anchors it (unchanged contract).
 * - `top` — panel opens upward, anchored to the trigger's top edge, with no
 *   consumer inline `bottom` / `top: auto` override needed.
 */
export type MenuPlacement = 'bottom' | 'top';

/**
 * Menu component props
 */
export interface MenuProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /**
   * Menu items to display. Flat items or labelled groups — mix freely; entries
   * with an `items` key render as a `role="group"` section with a header. The
   * flat-only API stays back-compatible.
   */
  items: (MenuItemData | MenuItemGroup)[];
  /** Whether the menu is visible */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Currently active/selected item ID */
  activeId?: string;
  /**
   * Optional non-interactive header rendered above the items inside the menu
   * panel — e.g. a practice name, user email, or filter group label. Sits
   * inside the menu's outside-click ref so it does not close on press.
   * Default styling applies via `bds-menu__header`; pass any node to override.
   */
  header?: ReactNode;
  /**
   * Direction the panel opens relative to its trigger. `top` anchors the
   * panel above the trigger internally (no consumer inline override). Default
   * `bottom`. The panel is height-capped and scrolls internally when its
   * content would overflow the viewport.
   */
  placement?: MenuPlacement;
  /**
   * Lookup search (ADR-049). Above the threshold a labelled field leads the
   * panel, takes focus on open and narrows items by label, case-insensitively
   * (not by `description`); groups with no match drop out. A `role="status"`
   * line counts the matches, and `0 results` offers a "Clear search" next
   * step. The query resets each time the menu closes; Escape in the field
   * closes the menu without clearing it first. No search landmark (§ 5).
   * See {@link MenuSearch}.
   */
  search?: MenuSearch;
}

/**
 * MenuItem component props (internal)
 */
export interface MenuItemProps extends HTMLAttributes<HTMLButtonElement> {
  /** Item data */
  item: MenuItemData;
  /** Whether this item is active */
  isActive?: boolean;
}

/**
 * MenuItem - Single menu option (exported for direct use)
 */
export function MenuItem({ item, isActive, className, style, ...props }: MenuItemProps) {
  const hasContent = item.content != null;
  const hasDescription = !hasContent && !!item.description;
  return (
    <button
      type="button"
      role="menuitem"
      disabled={item.disabled}
      onClick={item.onClick}
      aria-label={hasContent ? item.label : undefined}
      className={bdsClass(
        'bds-menu__item',
        isActive && 'bds-menu__item--active',
        item.disabled && 'bds-menu__item--disabled',
        hasDescription && 'bds-menu__item--with-description',
        className,
      )}
      style={style}
      {...props}
    >
      {hasContent ? (
        item.content
      ) : (
        <>
          {item.icon && <span className="bds-menu__icon">{item.icon}</span>}
          <span className="bds-menu__text">
            <span className="bds-menu__label">{item.label}</span>
            {hasDescription && (
              <span className="bds-menu__description">{item.description}</span>
            )}
          </span>
        </>
      )}
    </button>
  );
}

/**
 * Menu - BDS dropdown menu component
 *
 * A floating panel containing a list of selectable items with optional icons.
 * Closes on outside click or Escape key. Focus moves to the first enabled
 * item on open, arrow keys rove between items, and closing returns focus to
 * whatever held it before open. Use alongside a trigger element
 * (Button, IconButton, etc.) in a relatively positioned wrapper. Pass
 * `search` to add a lookup field to a long list (ADR-049).
 *
 * @example
 * ```tsx
 * <div style={{ position: 'relative' }}>
 *   <Button onClick={() => setOpen(!open)}>Options</Button>
 *   <Menu
 *     isOpen={open}
 *     onClose={() => setOpen(false)}
 *     items={[
 *       { id: '1', label: 'Edit', icon: <Icon icon="ph:pencil" /> },
 *       { id: '2', label: 'Delete', icon: <Icon icon="ph:trash" /> },
 *     ]}
 *   />
 * </div>
 * ```
 *
 * @summary Dropdown menu with items and keyboard nav
 */
export function Menu({
  items,
  isOpen,
  onClose,
  activeId,
  header,
  placement = 'bottom',
  search,
  className = '',
  style,
  onKeyDown,
  ...props
}: MenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [tabStopId, setTabStopId] = useState<string | null>(null);
  // Menu does not own its trigger, so focus return restores whatever held
  // focus before open. Read during render: a child `autoFocus` (the search
  // field) takes focus at commit, before any effect of this component runs.
  const openedRef = useRef(false);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  if (isOpen && !openedRef.current && typeof document !== 'undefined') {
    returnFocusRef.current = document.activeElement as HTMLElement | null;
  }

  const showSearch =
    !!search &&
    (search.total ?? countItems(items)) > (search.threshold ?? DEFAULT_SEARCH_THRESHOLD);
  // The status stays mounted whenever search is on and the panel has a header,
  // so a consumer that narrows `items` itself (a filter in `header`) still has
  // its empty result announced while the field is hidden.
  const hasStatus = !!search && (showSearch || header != null);

  // A query left in the field would greet the next open with a stale,
  // narrowed list.
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setTabStopId(null);
    }
  }, [isOpen]);

  const needle = showSearch ? query.trim().toLowerCase() : '';
  const visibleItems = useMemo(() => {
    if (!needle) return items;
    const matches = (item: MenuItemData) => item.label.toLowerCase().includes(needle);
    return items.flatMap<MenuItemData | MenuItemGroup>((entry) => {
      if (!isItemGroup(entry)) return matches(entry) ? [entry] : [];
      const groupItems = entry.items.filter(matches);
      return groupItems.length > 0 ? [{ ...entry, items: groupItems }] : [];
    });
  }, [items, needle]);
  const visibleCount = countItems(visibleItems);

  // Roving tabindex: one enabled item is the Tab stop, the rest are -1.
  const enabledIds = useMemo(
    () =>
      visibleItems
        .flatMap((entry) => (isItemGroup(entry) ? entry.items : [entry]))
        .filter((item) => !item.disabled)
        .map((item) => item.id),
    [visibleItems],
  );
  const effectiveTabStop =
    tabStopId != null && enabledIds.includes(tabStopId) ? tabStopId : enabledIds[0];

  // Focus enters the menu on open (the search field, when shown, takes it
  // instead) and goes back to where it was on close — unless the user has
  // since moved it to another control.
  useEffect(() => {
    if (isOpen) {
      openedRef.current = true;
      if (!showSearch) {
        menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]:not(:disabled)')?.focus();
      }
      return;
    }
    if (!openedRef.current) return;
    openedRef.current = false;
    const active = document.activeElement;
    if (!active || active === document.body) returnFocusRef.current?.focus();
    returnFocusRef.current = null;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- showSearch is read only at the moment of opening
  }, [isOpen]);

  const handleMenuKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    const { key } = e;
    if (key !== 'ArrowDown' && key !== 'ArrowUp' && key !== 'Home' && key !== 'End') return;
    const target = e.target as HTMLElement;
    // Home / End in the search field move its caret.
    if ((key === 'Home' || key === 'End') && target.getAttribute('role') !== 'menuitem') return;
    const rows = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not(:disabled)') ?? [],
    );
    if (rows.length === 0) return;
    const i = rows.indexOf(target);
    let next: number;
    if (key === 'Home') next = 0;
    else if (key === 'End') next = rows.length - 1;
    else if (key === 'ArrowDown') next = i < 0 ? 0 : (i + 1) % rows.length;
    else next = i < 0 ? rows.length - 1 : (i - 1 + rows.length) % rows.length;
    e.preventDefault();
    rows[next].focus();
  };

  // ADR-049 § 6: a search always reports its count, zero included.
  const statusText =
    needle || visibleCount === 0
      ? `${visibleCount} ${visibleCount === 1 ? 'result' : 'results'}`
      : null;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose],
  );

  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, handleKeyDown, handleClickOutside]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      role="menu"
      className={bdsClass('bds-menu', `bds-menu--${placement}`, className)}
      style={style}
      {...props}
      onKeyDown={handleMenuKeyDown}
    >
      {(header != null || showSearch) && (
        <div
          className={bdsClass('bds-menu__header', hasStatus && 'bds-menu__header--sticky')}
          role="presentation"
        >
          {showSearch && (
            <SearchInput
              ref={searchRef}
              size="sm"
              fullWidth
              aria-label="Search options"
              placeholder="Search"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onClear={() => setQuery('')}
              // ADR-049 § 3: the menu is open, so Escape is the menu's to
              // close it. Stop the field clearing itself first; the query
              // resets when the menu closes.
              onKeyDown={(e) => {
                if (e.key === 'Escape') e.preventDefault();
              }}
            />
          )}
          {header}
          {/* Always mounted so assistive tech announces the count; a live
              region inserted already populated is often missed. */}
          {hasStatus && (
            <div className="bds-menu__status" role="status">
              {statusText}
            </div>
          )}
          {needle && visibleCount === 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="bds-menu__next-step"
              onClick={() => {
                setQuery('');
                searchRef.current?.focus();
              }}
            >
              Clear search
            </Button>
          )}
        </div>
      )}
      {visibleItems.map((entry) =>
        isItemGroup(entry) ? (
          <div
            key={entry.label}
            className="bds-menu__group"
            role="group"
            aria-label={entry.label}
          >
            <div className="bds-menu__title" aria-hidden="true">
              {entry.label}
            </div>
            {entry.items.map((item) => (
              <MenuItem
                key={item.id}
                item={item}
                isActive={activeId === item.id}
                tabIndex={item.id === effectiveTabStop ? 0 : -1}
                onFocus={() => setTabStopId(item.id)}
              />
            ))}
          </div>
        ) : (
          <MenuItem
            key={entry.id}
            item={entry}
            isActive={activeId === entry.id}
            tabIndex={entry.id === effectiveTabStop ? 0 : -1}
            onFocus={() => setTabStopId(entry.id)}
          />
        ),
      )}
    </div>
  );
}

export default Menu;
