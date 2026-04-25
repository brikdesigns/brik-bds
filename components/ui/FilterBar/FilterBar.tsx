import type { HTMLAttributes, ReactNode } from 'react';
import { Button } from '../Button';
import { Counter, type CounterStatus } from '../Counter';
import { bdsClass } from '../../utils';
import './FilterBar.css';

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
  className,
  style,
  ...props
}: FilterBarProps) {
  const isFiltered = filtered < total;
  const ariaLabel =
    (props['aria-label'] as string | undefined) ??
    (typeof title === 'string' ? `${title} filter bar` : `${label} filter bar`);

  return (
    <div
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

      <div className="bds-filter-bar__controls">
        {children}
        {onClear && isFiltered && (
          <Button variant="ghost" size="md" onClick={onClear}>
            {clearLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

export default FilterBar;
