import type { HTMLAttributes, ReactNode } from 'react';
import { Button } from '../Button';
import { Counter, type CounterStatus } from '../Counter';
import { Popover } from '../Popover';
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
   * the `Filters` popover — so primary/secondary actions (e.g. "Assign")
   * remain reachable. Omit when the bar has no actions.
   */
  actions?: ReactNode;
}

/**
 * FilterBar — shared heading + counter + filter-controls row for list views.
 *
 * Layout: `[title] [counter]          [filter children] [clear?] [actions]`
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
        <Button variant="ghost" size="md" onClick={onClear}>
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
      {...props}
    >
      {title && <TitleTag className="bds-filter-bar__title">{title}</TitleTag>}
      <Counter
        count={filtered}
        status={isFiltered ? activeStatus : 'neutral'}
        size="sm"
      />

      {hasControls &&
        (collapsed ? (
          <div className="bds-filter-bar__collapse">
            <Popover
              content={
                <div className="bds-filter-bar__collapse-panel">{controls}</div>
              }
            >
              <Button variant="secondary" size="md">
                {triggerLabel}
              </Button>
            </Popover>
          </div>
        ) : (
          <div className="bds-filter-bar__controls">{controls}</div>
        ))}

      {actions && <div className="bds-filter-bar__actions">{actions}</div>}
    </div>
  );
}

export default FilterBar;
