import { useCallback, useMemo, useRef, useState } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type {
  DatesSetArg,
  DayCellContentArg,
  DayHeaderContentArg,
  EventClickArg,
  EventContentArg,
  EventDropArg,
  EventInput,
} from '@fullcalendar/core';
import { CalendarToolbar, type CalendarToolbarSize, type CalendarToolbarTitleAs } from '../CalendarToolbar';
import { bdsClass } from '../../utils';
import './Calendar.css';

export type CalendarView = 'month' | 'week';

export type CalendarEventTone = 'neutral' | 'positive' | 'warning' | 'negative';

export type CalendarEventColor = 'blue' | 'green' | 'orange' | 'purple' | 'yellow' | 'red';

export interface CalendarEvent<TData = unknown> {
  id: string;
  /** Visible label, and the event's accessible name. */
  title: string;
  start: Date | string;
  end?: Date | string;
  /** Default `false` — the event sits at its `start` time. */
  allDay?: boolean;
  /** Fill by meaning (status). Default `neutral`. */
  tone?: CalendarEventTone;
  /** Fill by accent hue, for categories with no status meaning. Wins over `tone`. */
  color?: CalendarEventColor;
  /** Consumer payload, handed back to `renderEvent`, `onEventClick` and `onEventMove`. */
  data?: TData;
}

export interface CalendarProps<TData = unknown>
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'children'> {
  events: CalendarEvent<TData>[];
  /** Views offered in the toolbar switch, in order. Default `['month', 'week']`. One view hides the switch. */
  views?: CalendarView[];
  /** View shown first. Default the first entry of `views`. */
  defaultView?: CalendarView;
  /** Date shown first. Default today. */
  initialDate?: Date | string;
  /** Called when an event is activated by click, Enter or Space. Makes events focusable. */
  onEventClick?: (event: CalendarEvent<TData>) => void;
  /**
   * Called when an event is dragged to a new start. Passing it turns dragging on.
   * Throw or reject to put the event back where it was.
   */
  onEventMove?: (event: CalendarEvent<TData>, start: Date) => void | Promise<void>;
  /** Event body. Default the event `title`. */
  renderEvent?: (event: CalendarEvent<TData>) => ReactNode;
  /** Filter controls for the toolbar (`Select`, `FilterButton`). */
  filters?: ReactNode;
  /** Number of active filters, shown as `Filters (N)` when the toolbar collapses. */
  activeFilterCount?: number;
  /** Trailing toolbar actions (never `primary`). */
  actions?: ReactNode;
  /** Toolbar title element. Default `h2`. */
  titleAs?: CalendarToolbarTitleAs;
  /** Toolbar control size. Default `sm`. */
  size?: CalendarToolbarSize;
  /** Week view: show the all-day row above the time grid. Default `true`. */
  allDaySlot?: boolean;
}

const FC_VIEW: Record<CalendarView, string> = {
  month: 'dayGridMonth',
  week: 'timeGridWeek',
};

const VIEW_LABEL: Record<CalendarView, string> = {
  month: 'Month',
  week: 'Week',
};

const PLUGINS = [dayGridPlugin, timeGridPlugin, interactionPlugin];

function renderDayNumber(arg: DayCellContentArg) {
  return (
    <span
      className={bdsClass('bds-calendar__day-number', arg.isToday && 'bds-calendar__day-number--today')}
    >
      {arg.dayNumberText}
    </span>
  );
}

function renderDayHeader(arg: DayHeaderContentArg) {
  return (
    <span
      className={bdsClass('bds-calendar__day-header', arg.isToday && 'bds-calendar__day-header--today')}
    >
      {arg.text}
    </span>
  );
}

/**
 * Calendar — month and week grid of dated events, headed by `CalendarToolbar`.
 *
 * Built on FullCalendar (daygrid, timegrid, interaction) and themed with BDS
 * tokens; the toolbar's navigation, title and view switch are wired for you.
 * Events take a `tone` (status) or `color` (category) for their fill. Passing `onEventMove` turns on
 * drag-to-reschedule; passing `onEventClick` makes events keyboard-focusable.
 *
 * @example
 * ```tsx
 * <Calendar
 *   events={[{ id: '1', title: 'Launch post', start: '2026-11-20T09:00', tone: 'positive' }]}
 *   onEventClick={(event) => router.push(`/posts/${event.id}`)}
 *   onEventMove={(event, start) => reschedule(event.id, start)}
 *   filters={<Select aria-label="Filter by channel" options={channelOptions} />}
 * />
 * ```
 *
 * @summary Month / week event calendar with toolbar, event fills and drag-to-reschedule
 */
export function Calendar<TData = unknown>({
  events,
  views = ['month', 'week'],
  defaultView,
  initialDate,
  onEventClick,
  onEventMove,
  renderEvent,
  filters,
  activeFilterCount,
  actions,
  titleAs,
  size,
  allDaySlot = true,
  className,
  ...props
}: CalendarProps<TData>) {
  const calendarRef = useRef<FullCalendar>(null);
  const [view, setView] = useState<CalendarView>(defaultView ?? views[0] ?? 'month');
  const [title, setTitle] = useState('');

  const byId = useMemo(() => new Map(events.map((event) => [event.id, event])), [events]);

  const fcEvents = useMemo<EventInput[]>(
    () =>
      events.map((event) => ({
        id: event.id,
        title: event.title,
        start: event.start,
        end: event.end,
        allDay: event.allDay ?? false,
        classNames: [
          'bds-calendar__event',
          event.color
            ? `bds-calendar__event--color-${event.color}`
            : `bds-calendar__event--tone-${event.tone ?? 'neutral'}`,
        ],
      })),
    [events],
  );

  const changeView = useCallback((next: string) => {
    const nextView = next as CalendarView;
    calendarRef.current?.getApi().changeView(FC_VIEW[nextView]);
    setView(nextView);
  }, []);

  const handleDatesSet = useCallback((info: DatesSetArg) => setTitle(info.view.title), []);

  const handleEventClick = useCallback(
    (info: EventClickArg) => {
      const event = byId.get(info.event.id);
      if (!event || !onEventClick) return;
      info.jsEvent.preventDefault();
      onEventClick(event);
    },
    [byId, onEventClick],
  );

  const handleEventDrop = useCallback(
    async (info: EventDropArg) => {
      const event = byId.get(info.event.id);
      const start = info.event.start;
      if (!event || !start || !onEventMove) {
        info.revert();
        return;
      }
      try {
        await onEventMove(event, start);
      } catch {
        info.revert();
      }
    },
    [byId, onEventMove],
  );

  const handleEventContent = useCallback(
    (arg: EventContentArg) => {
      const event = byId.get(arg.event.id);
      return (
        <span className="bds-calendar__event-body">
          {event && renderEvent ? renderEvent(event) : arg.event.title}
        </span>
      );
    },
    [byId, renderEvent],
  );

  return (
    <div className={bdsClass('bds-calendar', className)} {...props}>
      <CalendarToolbar
        title={title}
        titleAs={titleAs}
        size={size}
        onPrev={() => calendarRef.current?.getApi().prev()}
        onToday={() => calendarRef.current?.getApi().today()}
        onNext={() => calendarRef.current?.getApi().next()}
        views={views.length > 1 ? views.map((v) => ({ label: VIEW_LABEL[v], value: v })) : undefined}
        view={view}
        onViewChange={changeView}
        activeFilterCount={activeFilterCount}
        actions={actions}
      >
        {filters}
      </CalendarToolbar>

      <div className="bds-calendar__grid">
        <FullCalendar
          ref={calendarRef}
          plugins={PLUGINS}
          initialView={FC_VIEW[view]}
          initialDate={initialDate}
          headerToolbar={false}
          height="auto"
          events={fcEvents}
          eventDisplay="block"
          dayMaxEvents
          nowIndicator
          allDaySlot={allDaySlot}
          editable={Boolean(onEventMove)}
          eventStartEditable={Boolean(onEventMove)}
          eventDurationEditable={false}
          eventInteractive={Boolean(onEventClick)}
          datesSet={handleDatesSet}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          eventContent={handleEventContent}
          dayCellContent={renderDayNumber}
          dayHeaderContent={renderDayHeader}
        />
      </div>
    </div>
  );
}

export default Calendar;
