import { type ReactNode } from 'react';
import { bdsClass } from '../../utils';
import './ActivityTimeline.css';

// ─── Types ──────────────────────────────────────────────────────────

export interface TimelineEvent {
  /** Icon element rendered inside the event dot */
  icon: ReactNode;
  /** Primary label (e.g. "Request submitted") */
  label: string;
  /** Secondary detail line (e.g. "by Emily Rivera") */
  detail?: string | null;
  /**
   * Rich body rendered below `detail` and above `timestamp` — a cluster of
   * Tags ("fields updated"), a decision paragraph, a clickable `TextLink`.
   * The consumer composes the nodes; ActivityTimeline only places them (it
   * stays a pure display component). It has no category/status channel of its
   * own: put a `Tag` here and an icon in `icon`.
   */
  content?: ReactNode;
  /** Timestamp string (pre-formatted by consumer) */
  timestamp: string;
  /**
   * Machine-readable ISO 8601 date/time for the `<time datetime>` attribute
   * (e.g. `2026-04-12` or `2026-04-12T09:30:00Z`). `timestamp` stays the
   * visible text; without `dateTime` the `<time>` element carries no datetime.
   */
  dateTime?: string;
  /** Stable React key. Defaults to `timestamp` + `label` + position. */
  id?: string;
  /** Whether this is the "origin" event — uses brand-colored dot */
  isOrigin?: boolean;
}

export interface ActivityTimelineProps {
  /** Array of timeline events to render (top → bottom, chronological) */
  events: TimelineEvent[];
  /** Additional className */
  className?: string;
}

/**
 * ActivityTimeline — vertical timeline display component.
 *
 * Renders a list of chronological events with a connecting rail,
 * icon dots, labels, detail text, optional rich content, and timestamps. The first event
 * (or any event with `isOrigin`) uses the brand-colored dot;
 * all others use a muted surface dot.
 *
 * This is a pure display component — no internal state, no data fetching.
 * The consumer provides pre-formatted events.
 *
 * @example
 * ```tsx
 * <ActivityTimeline events={[
 *   { icon: <Icon icon="ph:plus" />, label: 'Created', detail: 'by Jane', timestamp: 'Apr 12, 2026', isOrigin: true },
 *   { icon: <Icon icon="ph:user" />, label: 'Assigned', detail: 'to Nick', timestamp: 'Apr 12, 2026' },
 *   { icon: <Icon icon="ph:check-circle" />, label: 'Completed', timestamp: 'Apr 13, 2026' },
 * ]} />
 * ```
 *
 * @summary Vertical timeline of dated events
 */
export function ActivityTimeline({ events, className = '' }: ActivityTimelineProps) {
  if (events.length === 0) return null;

  return (
    <ol className={bdsClass('bds-activity-timeline', className)}>
      {events.map((event, idx) => {
        const isLast = idx === events.length - 1;
        const isOrigin = event.isOrigin ?? idx === 0;

        return (
          <li key={event.id ?? `${event.timestamp}-${event.label}-${idx}`} className="bds-activity-timeline__event">
            {/* Rail column: dot + connector line */}
            <div className="bds-activity-timeline__rail">
              <div
                className={bdsClass(
                  'bds-activity-timeline__dot',
                  isOrigin && 'bds-activity-timeline__dot--origin',
                )}
              >
                <span className="bds-activity-timeline__icon">{event.icon}</span>
              </div>
              {!isLast && <div className="bds-activity-timeline__line" />}
            </div>

            {/* Content column */}
            <div className={bdsClass('bds-activity-timeline__content', isLast && 'bds-activity-timeline__content--last')}>
              <div className="bds-activity-timeline__label">{event.label}</div>
              {event.detail && (
                <div className="bds-activity-timeline__detail">{event.detail}</div>
              )}
              {event.content && (
                <div className="bds-activity-timeline__body">{event.content}</div>
              )}
              <div className="bds-activity-timeline__timestamp">
                <time dateTime={event.dateTime}>{event.timestamp}</time>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export default ActivityTimeline;
