import { Children } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { Popover } from '../Popover';
import { SegmentedControl, type SegmentItem } from '../SegmentedControl';
import { useElementWidth, withBarSize } from '../shared';
import { CaretLeft, CaretRight } from '../../icons';
import { bdsClass } from '../../utils';
import './CalendarToolbar.css';

/**
 * Own-width threshold below which the filter controls collapse into a
 * "Filters" popover (ADR-019). Same value and mechanism as FilterBar so the two
 * bars collapse together.
 */
const COLLAPSE_BELOW_PX = 600;

export type CalendarToolbarTitleAs = 'h2' | 'h3';
export type CalendarToolbarSize = 'sm' | 'md' | 'lg';

export interface CalendarToolbarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Current period, e.g. "November 2026". Announced politely when it changes. */
  title: ReactNode;
  /**
   * HTML element for the title. Default `h2`; use `h3` when the toolbar nests
   * under an existing `<h2>`.
   */
  titleAs?: CalendarToolbarTitleAs;
  /** Step to the previous period. */
  onPrev: () => void;
  /** Jump to the current period. */
  onToday: () => void;
  /** Step to the next period. */
  onNext: () => void;
  /** Accessible name of the previous icon button (default "Previous"). */
  prevLabel?: string;
  /** Visible text of the Today button (default "Today"). */
  todayLabel?: string;
  /** Accessible name of the next icon button (default "Next"). */
  nextLabel?: string;
  /** View-switch segments, e.g. `[{ label: 'Month', value: 'month' }, { label: 'Week', value: 'week' }]`. Omit for no switch. */
  views?: SegmentItem[];
  /** Selected view value. */
  view?: string;
  /** Called with the new view value. */
  onViewChange?: (view: string) => void;
  /** Accessible name of the view switch (default "Calendar view"). */
  viewLabel?: string;
  /**
   * Filter controls (`Select`, `FilterButton`, `FilterToggle`) rendered before
   * the view switch. Each child without a `size` receives the toolbar's `size`.
   * Below ~600px of own width they fold into a `Filters` popover.
   */
  children?: ReactNode;
  /** Number of active filters, shown as `Filters (N)` when collapsed. */
  activeFilterCount?: number;
  /** Trailing action buttons (never `primary`); stay visible when collapsed. */
  actions?: ReactNode;
  /**
   * Size of every control in the toolbar — buttons, filters, view switch.
   * Default `sm` (32px), the same as FilterBar, so the two read as one family.
   */
  size?: CalendarToolbarSize;
}

/**
 * CalendarToolbar — the header row of a calendar, in the FilterBar family.
 *
 * Layout: `[‹] [Today] [›] [title]          [filters] [view switch] [actions]`
 *
 * One horizontal row on desktop, never stacked. Navigation is three
 * `secondary` buttons (icon-only Previous / Next with `aria-label`, text
 * Today); the view switch is a `SegmentedControl`. Every control shares one
 * height (`size`, default `sm`), so inputs and buttons line up the way they do
 * in `FilterBar`. Below ~600px of own width (ADR-019) the filters fold into a
 * `Filters` popover; navigation, title, and view switch stay.
 *
 * It owns no calendar state: the consumer holds the date and view and passes
 * the title string. For a plain Previous / label / Next period stepper with no
 * filters use `PeriodNav`; for a count-based collection header use `FilterBar`.
 *
 * @example
 * ```tsx
 * <CalendarToolbar
 *   title="November 2026"
 *   onPrev={prev}
 *   onToday={today}
 *   onNext={next}
 *   views={[{ label: 'Month', value: 'month' }, { label: 'Week', value: 'week' }]}
 *   view={view}
 *   onViewChange={setView}
 * >
 *   <Select aria-label="Filter by channel" options={channelOptions} />
 * </CalendarToolbar>
 * ```
 *
 * @summary Calendar header row — prev / Today / next, title, filters, view switch
 */
export function CalendarToolbar({
  title,
  titleAs = 'h2',
  onPrev,
  onToday,
  onNext,
  prevLabel = 'Previous',
  todayLabel = 'Today',
  nextLabel = 'Next',
  views,
  view,
  onViewChange,
  viewLabel = 'Calendar view',
  children,
  activeFilterCount,
  actions,
  size = 'sm',
  className,
  ...props
}: CalendarToolbarProps) {
  const TitleTag = titleAs;
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const collapsed = width !== null && width < COLLAPSE_BELOW_PX;
  const hasControls = Children.count(children) > 0 && Boolean(children);

  const controls = withBarSize(children, size);
  const triggerLabel =
    activeFilterCount && activeFilterCount > 0 ? `Filters (${activeFilterCount})` : 'Filters';

  return (
    <div
      ref={ref}
      role="group"
      aria-label="Calendar toolbar"
      className={bdsClass(
        'bds-calendar-toolbar',
        `bds-calendar-toolbar--size-${size}`,
        collapsed && 'bds-calendar-toolbar--collapsed',
        className,
      )}
      {...props}
    >
      <div className="bds-calendar-toolbar__nav" role="group" aria-label="Navigate calendar">
        <Button
          variant="secondary"
          size={size}
          icon={<Icon icon={CaretLeft} />}
          label={prevLabel}
          onClick={onPrev}
        />
        <Button variant="secondary" size={size} onClick={onToday}>
          {todayLabel}
        </Button>
        <Button
          variant="secondary"
          size={size}
          icon={<Icon icon={CaretRight} />}
          label={nextLabel}
          onClick={onNext}
        />
      </div>

      <TitleTag className="bds-calendar-toolbar__title" aria-live="polite">
        {title}
      </TitleTag>

      {hasControls &&
        (collapsed ? (
          <div className="bds-calendar-toolbar__collapse">
            <Popover
              content={<div className="bds-calendar-toolbar__collapse-panel">{controls}</div>}
            >
              <Button variant="secondary" size={size}>
                {triggerLabel}
              </Button>
            </Popover>
          </div>
        ) : (
          <div className="bds-calendar-toolbar__controls">{controls}</div>
        ))}

      {views && views.length > 0 && (
        <div className="bds-calendar-toolbar__view">
          <SegmentedControl
            size={size}
            items={views}
            value={view}
            onChange={onViewChange}
            aria-label={viewLabel}
          />
        </div>
      )}

      {actions && (
        <div className="bds-calendar-toolbar__actions">{withBarSize(actions, size)}</div>
      )}
    </div>
  );
}

export default CalendarToolbar;
