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

export interface FilterBarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Total count before filtering */
  total: number;
  /** Count after filtering (pass same value as total when no filter is active) */
  filtered: number;
  /** Plural entity label, used in the aria-label fallback ("companies", "tasks") */
  label: string;
  /** Optional section heading rendered at heading-sm inline with the counter */
  title?: ReactNode;
  /** Override the counter's status when a filter is active (default: 'brand') */
  activeStatus?: CounterStatus;
  /** Callback to clear all filters. When provided, a "Clear filters" button appears while filtered < total. */
  onClear?: () => void;
  /** Label for the Clear button (default: "Clear filters") */
  clearLabel?: string;
  /** FilterButton / FilterToggle children rendered on the right */
  children: ReactNode;
  /**
   * Number of currently-active filters. When the bar collapses on narrow
   * widths (see ADR-019), the trigger reads `Filters (N)` so active state is
   * visible without opening the popover. Omit (or `0`) for a plain `Filters`
   * trigger — the counter still reflects the filtered result count.
   */
  activeFilterCount?: number;
}

/**
 * FilterBar — shared heading + counter + filter-controls row for list views.
 *
 * Layout: `[title] [counter]          [filter children] [clear?]`
 *
 * The counter shows the current filtered count. When `filtered < total` the
 * counter switches to `activeStatus` (default `brand`) and, if `onClear` is
 * provided, a ghost "Clear filters" button appears after the filter controls.
 *
 * On narrow *own* widths (below ~600px, via ResizeObserver — ADR-019) the
 * filter controls collapse into a `Filters` popover so they never wrap
 * awkwardly; pass `activeFilterCount` to surface `Filters (N)` when collapsed.
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
  activeStatus = 'brand',
  onClear,
  clearLabel = 'Clear filters',
  children,
  activeFilterCount,
  className,
  style,
  ...props
}: FilterBarProps) {
  const isFiltered = filtered < total;
  const ariaLabel =
    (props['aria-label'] as string | undefined) ??
    (typeof title === 'string' ? `${title} filter bar` : `${label} filter bar`);

  const [ref, width] = useElementWidth<HTMLDivElement>();
  const collapsed = width !== null && width < COLLAPSE_BELOW_PX;

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
      {title && <h2 className="bds-filter-bar__title">{title}</h2>}
      <Counter
        count={filtered}
        status={isFiltered ? activeStatus : 'neutral'}
        size="sm"
      />

      {collapsed ? (
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
      )}
    </div>
  );
}

export default FilterBar;
