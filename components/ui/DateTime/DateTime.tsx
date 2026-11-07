import { type HTMLAttributes } from 'react';
import { bdsClass } from '../../utils';
import './DateTime.css';

/**
 * Which of the three shapes a rendered date takes.
 * - `date` — a calendar day (`Nov 6, 2026`)
 * - `timestamp` — a zone-labelled instant (`Nov 6, 2026, 2:30 PM CST`)
 * - `relative` — an age (`3 days ago`), exact timestamp on hover
 */
export type DateTimeMode = 'date' | 'timestamp' | 'relative';

/** An ISO string, a `Date`, epoch milliseconds, or nothing. */
export type DateTimeValue = string | number | Date | null | undefined;

export interface DateTimeProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** The value to render — ISO string, `Date`, or epoch ms. `null`/`undefined`/unparseable renders the empty label. */
  value: DateTimeValue;
  /** Which shape to render. Default `date`. */
  mode?: DateTimeMode;
  /**
   * IANA zone the value is displayed in (`"America/Chicago"`). Omit to use the
   * runtime zone. DateTime only labels the zone it is given — the consumer
   * owns which zone that is.
   */
  timeZone?: string;
  /** Reference instant for `relative`. Default: the current time. Pass it for deterministic output. */
  now?: Date | number;
  /** Text rendered when `value` is empty. Default `—`. */
  emptyLabel?: string;
}

const LOCALE = 'en-US';
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

function toDate(value: DateTimeValue): Date | null {
  if (value == null || value === '') return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatTimestamp(date: Date, timeZone?: string): string {
  return new Intl.DateTimeFormat(LOCALE, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone,
    timeZoneName: 'short',
  }).format(date);
}

function formatDay(date: Date, timeZone: string | undefined): string {
  return new Intl.DateTimeFormat(LOCALE, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone,
  }).format(date);
}

const UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ['year', 365 * 24 * 60 * 60],
  ['month', 30 * 24 * 60 * 60],
  ['day', 24 * 60 * 60],
  ['hour', 60 * 60],
  ['minute', 60],
];

function formatRelative(date: Date, now: Date): string {
  const seconds = Math.round((date.getTime() - now.getTime()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto' });
  const abs = Math.abs(seconds);
  for (const [unit, size] of UNITS) {
    if (abs >= size) return rtf.format(Math.trunc(seconds / size), unit);
  }
  return rtf.format(0, 'second');
}

/**
 * DateTime — one home for a rendered date: a calendar day, a zone-labelled
 * instant, or an age.
 *
 * Renders a `<time dateTime={ISO}>`. `relative` carries the exact
 * zone-labelled timestamp in `title`; `timestamp` always ends in a zone label
 * (`CST`). A date-only string (`2026-11-06`) is a calendar day and never
 * shifts with the zone. A Field value is `date` or `timestamp`, never
 * `relative`; a feed row or card meta line is `relative`.
 *
 * @example
 * ```tsx
 * <DateTime value="2026-11-06" />
 * <DateTime mode="timestamp" value="2026-11-06T20:30:00Z" timeZone="America/Chicago" />
 * <DateTime mode="relative" value={row.updatedAt} timeZone="America/Chicago" />
 * ```
 *
 * @summary A date, zone-labelled timestamp, or relative age
 */
export function DateTime({
  value,
  mode = 'date',
  timeZone,
  now,
  emptyLabel = '—',
  className,
  title,
  ...props
}: DateTimeProps) {
  const date = toDate(value);

  if (!date) {
    return (
      <span className={bdsClass('bds-date-time', 'bds-date-time--empty', className)} {...props}>
        {emptyLabel}
      </span>
    );
  }

  const dayOnly = typeof value === 'string' && DATE_ONLY.test(value);
  const iso = dayOnly ? (value as string) : date.toISOString();

  let text: string;
  let resolvedTitle = title;
  if (dayOnly) {
    // A date-only string is a calendar day with no instant: every mode renders
    // the day in UTC, so it never shifts and never invents a time.
    text = formatDay(date, 'UTC');
  } else if (mode === 'relative') {
    text = formatRelative(date, now === undefined ? new Date() : new Date(now));
    resolvedTitle = title ?? formatTimestamp(date, timeZone);
  } else if (mode === 'timestamp') {
    text = formatTimestamp(date, timeZone);
  } else {
    text = formatDay(date, timeZone);
  }

  return (
    <time
      className={bdsClass('bds-date-time', className)}
      dateTime={iso}
      title={resolvedTitle}
      {...props}
    >
      {text}
    </time>
  );
}

export default DateTime;
