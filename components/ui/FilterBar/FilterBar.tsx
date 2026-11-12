import { Children, cloneElement, isValidElement, useRef } from 'react';
import type { HTMLAttributes, ReactElement, ReactNode } from 'react';
import { Button, type ButtonSize } from '../Button';
import { Counter, type CounterStatus } from '../Counter';
import { Popover } from '../Popover';
import { SearchInput, type SearchInputProps } from '../SearchInput';
import { useElementWidth } from '../shared';
import { bdsClass } from '../../utils';
import './FilterBar.css';

/**
 * Own-width threshold below which the filter controls collapse into a
 * "Filters" popover (ADR-019). Chosen so a title + counter + ~3 controls +
 * clear still fit inline above it; below it they would wrap awkwardly. This is
 * the component's *own* width (via ResizeObserver), not the viewport, so the
 * bar collapses the same in a sidebar as full-bleed.
 */
const COLLAPSE_BELOW_PX = 600;

export type FilterBarTitleAs = 'h2' | 'h3';

export interface FilterBarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Total count before filtering */
  total: number;
  /** Count after filtering (pass same value as total when no filter is active) */
  filtered: number;
  /** Plural entity label, used in the aria-label fallback ("companies", "tasks") */
  label: string;
  /** Optional section heading rendered at heading-sm inline with the counter */
  title?: ReactNode;
  /**
   * HTML element for the title.
   * Default `h2` — the common case is one collection sibling of the page's `<h1>`.
   * Use `h3` only when the bar is nested under an existing `<h2>` (a collection
   * tab inside a record page).
   */
  titleAs?: FilterBarTitleAs;
  /** Override the counter's status when a filter is active (default: 'brand') */
  activeStatus?: CounterStatus;
  /** Callback to clear all filters. When provided, a "Clear filters" button appears while filtered < total. */
  onClear?: () => void;
  /** Label for the Clear button (default: "Clear filters") */
  clearLabel?: string;
  /**
   * FilterButton / FilterToggle children rendered on the right. Optional: a
   * collection with no filterable axes still gets a FilterBar for its title +
   * counter, and the controls row is omitted rather than left empty.
   */
  children?: ReactNode;
  /**
   * Number of currently-active filters. When the bar collapses on narrow
   * widths (see ADR-019), the trigger reads `Filters (N)` so active state is
   * visible without opening the popover. Omit (or `0`) for a plain `Filters`
   * trigger — the counter still reflects the filtered result count.
   */
  activeFilterCount?: number;
  /**
   * Action buttons (typically a `<ButtonGroup>`) rendered flush-right, AFTER
   * the filter controls. Unlike `children` (filter controls), `actions` stays
   * visible when the bar collapses on narrow widths — it does NOT fold into
   * the `Filters` popover — so secondary actions (e.g. "Export") remain
   * reachable. Filter-bar actions are never `primary`: the page header owns the
   * page's one primary. Omit when the bar has no actions.
   */
  actions?: ReactNode;
  /**
   * Size of the bar's own buttons (Clear, the collapsed `Filters` trigger),
   * forwarded to any `actions` child that has no `size` of its own. Default
   * `sm` — one step below the `md` page-header buttons so the bar sits lower in
   * the page hierarchy.
   */
  size?: ButtonSize;
  /**
   * Search slot (ADR-049 § 5–6). Takes `SearchInput` props — one of `label`,
   * `aria-label` or `aria-labelledby` is required — and renders the field at
   * the start of the bar. Its presence makes the bar a `role="search"`
   * landmark (named by the bar's `aria-label`) and mounts a `role="status"`
   * region announcing `filtered of total`, including zero. Unlike `children`,
   * the field stays visible when the bar collapses on narrow widths (ADR-019).
   *
   * The bar owns no query state: the consumer filters its rows and passes
   * `filtered`. Pass `value` to control the field (reset it from the bar's
   * `onClear`); omit it and the bar clears the uncontrolled field itself when
   * `onClear` runs. Omit the slot and the bar claims no landmark.
   */
  search?: SearchInputProps;
}

/**
 * FilterBar — shared heading + counter + filter-controls row for list views.
 *
 * Layout: `[search?] [title] [counter]          [filter children] [clear?] [actions]`
 *
 * The counter shows the current filtered count. When `filtered < total` the
 * counter switches to `activeStatus` (default `brand`) and, if `onClear` is
 * provided, a ghost "Clear filters" button appears after the filter controls.
 *
 * `children` is optional. A collection with no filterable axes still uses a
 * FilterBar for its title + counter — the controls row is dropped entirely
 * rather than rendered empty — so an unfilterable list never needs a
 * hand-rolled heading row.
 *
 * `search` adds a `SearchInput` at the start of the bar and makes the bar a
 * `role="search"` landmark (ADR-049 § 5); the count then follows the query and
 * is announced through a status region, zero included (§ 6). The field is not a
 * filter control, so it stays inline when the controls collapse. The bar's
 * `onClear` clears an uncontrolled field; for a controlled one, reset `value`
 * there.
 *
 * The bar owns no outer margin; the gap to the display below belongs to the
 * consumer's layout primitive.
 *
 * On narrow *own* widths (below ~600px, via ResizeObserver — ADR-019) the
 * filter controls collapse into a `Filters` popover so they never wrap
 * awkwardly; pass `activeFilterCount` to surface `Filters (N)` when collapsed.
 * `actions` is exempt from this collapse — it always renders flush-right
 * after the controls/popover, so a primary action never hides behind a
 * popover trigger.
 *
 * @example
 * ```tsx
 * const [statusFilter, setStatusFilter] = useState<string | undefined>();
 *
 * <FilterBar
 *   title="Engagements"
 *   total={rows.length}
 *   filtered={filtered.length}
 *   label="engagements"
 *   onClear={() => setStatusFilter(undefined)}
 * >
 *   <FilterButton label="Status" value={statusFilter} onChange={setStatusFilter} options={...} />
 * </FilterBar>
 * ```
 *
 * @summary Heading + counter + filter controls row for list views
 */
export function FilterBar({
  total,
  filtered,
  label,
  title,
  titleAs = 'h2',
  activeStatus = 'brand',
  onClear,
  clearLabel = 'Clear filters',
  children,
  activeFilterCount,
  actions,
  size = 'sm',
  search,
  className,
  style,
  ...props
}: FilterBarProps) {
  const TitleTag = titleAs;
  const isFiltered = filtered < total;
  const ariaLabel =
    (props['aria-label'] as string | undefined) ??
    (typeof title === 'string' ? `${title} filter bar` : `${label} filter bar`);

  const [ref, width] = useElementWidth<HTMLDivElement>();
  const collapsed = width !== null && width < COLLAPSE_BELOW_PX;

  // The bar owns no query state. A controlled field (`search.value`) is reset
  // by the consumer's `onClear`; an uncontrolled one the bar clears itself, the
  // same way SearchInput's clear button does (native setter + input event, so
  // `search.onChange` and the field's own clear affordance both hear about it).
  const searchRef = useRef<HTMLInputElement>(null);
  const handleClear = () => {
    const input = searchRef.current;
    if (input && search?.value === undefined && input.value !== '') {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      setter?.call(input, '');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    onClear?.();
  };

  // A bar with no filter children and no visible Clear button has no controls
  // row at all — it renders neither the inline slot nor the collapse popover,
  // so an unfilterable collection reads as a title + counter, not as an empty
  // flex slot or a `Filters` trigger that opens onto nothing.
  const hasControls = Boolean(children) || Boolean(onClear && isFiltered);

  // Rendered in exactly one place at a time (inline OR inside the popover), so
  // the interactive filter controls are never duplicated in the DOM.
  const controls = (
    <>
      {children}
      {onClear && isFiltered && (
        <Button variant="ghost" size={size} onClick={handleClear}>
          {clearLabel}
        </Button>
      )}
    </>
  );

  const triggerLabel =
    activeFilterCount && activeFilterCount > 0
      ? `Filters (${activeFilterCount})`
      : 'Filters';

  return (
    <div
      ref={ref}
      className={bdsClass('bds-filter-bar', className)}
      style={style}
      aria-label={ariaLabel}
      role={search ? 'search' : undefined}
      {...props}
    >
      {search && <SearchInput ref={searchRef} {...search} />}
      {title && <TitleTag className="bds-filter-bar__title">{title}</TitleTag>}
      <Counter
        count={filtered}
        status={isFiltered ? activeStatus : 'neutral'}
        size="sm"
      />
      {/* Always mounted so assistive tech announces the change, zero included;
          a live region inserted already populated is often missed. */}
      {search && (
        <span className="bds-filter-bar__status" role="status">
          {`${filtered} of ${total} ${label}`}
        </span>
      )}

      {hasControls &&
        (collapsed ? (
          <div className="bds-filter-bar__collapse">
            <Popover
              content={
                <div className="bds-filter-bar__collapse-panel">{controls}</div>
              }
            >
              <Button variant="secondary" size={size}>
                {triggerLabel}
              </Button>
            </Popover>
          </div>
        ) : (
          <div className="bds-filter-bar__controls">{controls}</div>
        ))}

      {actions && (
        <div className="bds-filter-bar__actions">
          {Children.map(actions, (action) =>
            isValidElement<{ size?: ButtonSize }>(action) && action.props.size === undefined
              ? cloneElement(action as ReactElement<{ size?: ButtonSize }>, { size })
              : action,
          )}
        </div>
      )}
    </div>
  );
}

export default FilterBar;
