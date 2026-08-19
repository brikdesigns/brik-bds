import {
  forwardRef,
  useState,
  useCallback,
  useMemo,
  type KeyboardEvent,
} from 'react';
import * as Popover from '@radix-ui/react-popover';
import { bdsClass } from '../../utils';
import './DatePicker.css';

// ─── Types ──────────────────────────────────────────────────────────

export type DatePickerSize = 'sm' | 'md' | 'lg';
export type DatePickerPrecision = 'day' | 'month';

export interface DatePickerProps {
  /** Selected date value */
  value?: Date | null;
  /** Called when a date is selected */
  onChange?: (date: Date | null) => void;
  /** Size variant matching BDS form components */
  size?: DatePickerSize;
  /**
   * Selection granularity. `'day'` (default) renders the day-grid calendar.
   * `'month'` renders a 12-month grid with year navigation and snaps
   * `onChange` to the first of the selected month.
   */
  precision?: DatePickerPrecision;
  /** Optional label */
  label?: string;
  /** Helper text below input */
  helperText?: string;
  /** Error message (triggers error state) */
  error?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Full width */
  fullWidth?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Input id */
  id?: string;
  /** Additional className */
  className?: string;
}

// ─── Constants ──────────────────────────────────────────────────────

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// ─── Helpers ────────────────────────────────────────────────────────

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

function isDateDisabled(date: Date, minDate?: Date, maxDate?: Date): boolean {
  if (minDate && date < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())) {
    return true;
  }
  if (maxDate && date > new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate())) {
    return true;
  }
  return false;
}

// A month is disabled only when its *entire* span falls outside the
// min/max range — a month straddling the boundary stays selectable.
function isMonthDisabled(year: number, month: number, minDate?: Date, maxDate?: Date): boolean {
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);
  if (minDate) {
    const min = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
    if (monthEnd < min) return true;
  }
  if (maxDate) {
    const max = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate());
    if (monthStart > max) return true;
  }
  return false;
}

// ─── Calendar Sub-component ─────────────────────────────────────────

function Calendar({
  value,
  onChange,
  minDate,
  maxDate,
  onClose,
}: {
  value: Date | null;
  onChange: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  onClose: () => void;
}) {
  const [viewDate, setViewDate] = useState(() => value ?? new Date());
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const days = useMemo(() => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const cells: (Date | null)[] = [];

    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

    return cells;
  }, [year, month]);

  const prevMonth = useCallback(() => {
    setViewDate(new Date(year, month - 1, 1));
  }, [year, month]);

  const nextMonth = useCallback(() => {
    setViewDate(new Date(year, month + 1, 1));
  }, [year, month]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  return (
    <div
      className="bds-date-picker__calendar"
      onKeyDown={handleKeyDown}
    >
      {/* Header: month/year nav */}
      <div className="bds-date-picker__calendar-header">
        <button
          type="button"
          className="bds-date-picker__nav-button"
          onClick={prevMonth}
          aria-label="Previous month"
        >
          ‹
        </button>
        <span className="bds-date-picker__month-label">
          {MONTHS[month]} {year}
        </span>
        <button
          type="button"
          className="bds-date-picker__nav-button"
          onClick={nextMonth}
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="bds-date-picker__day-header">
        {DAYS.map((d) => (
          <div key={d} className="bds-date-picker__day-label">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div
        className="bds-date-picker__day-grid"
        role="grid"
        aria-label={`${MONTHS[month]} ${year}`}
      >
        {days.map((day, i) => {
          if (!day) {
            return <div key={`empty-${i}`} />;
          }

          const selected = value ? isSameDay(day, value) : false;
          const today = isToday(day);
          const disabled = isDateDisabled(day, minDate, maxDate);

          return (
            <button
              key={day.toISOString()}
              type="button"
              className={bdsClass(
                'bds-date-picker__day',
                selected && 'bds-date-picker__day--selected',
                today && !selected && 'bds-date-picker__day--today',
              )}
              disabled={disabled}
              onClick={() => {
                if (!disabled) onChange(day);
              }}
              aria-label={day.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
              aria-selected={selected}
              role="gridcell"
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── MonthGrid Sub-component ────────────────────────────────────────

function MonthGrid({
  value,
  onChange,
  minDate,
  maxDate,
  onClose,
}: {
  value: Date | null;
  onChange: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  onClose: () => void;
}) {
  const [viewYear, setViewYear] = useState(() => (value ?? new Date()).getFullYear());

  const prevYear = useCallback(() => {
    setViewYear((y) => y - 1);
  }, []);

  const nextYear = useCallback(() => {
    setViewYear((y) => y + 1);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  return (
    <div
      className="bds-date-picker__calendar"
      onKeyDown={handleKeyDown}
    >
      {/* Header: year nav */}
      <div className="bds-date-picker__calendar-header">
        <button
          type="button"
          className="bds-date-picker__nav-button"
          onClick={prevYear}
          aria-label="Previous year"
        >
          ‹
        </button>
        <span className="bds-date-picker__month-label">{viewYear}</span>
        <button
          type="button"
          className="bds-date-picker__nav-button"
          onClick={nextYear}
          aria-label="Next year"
        >
          ›
        </button>
      </div>

      {/* Month grid */}
      <div
        className="bds-date-picker__month-grid"
        role="grid"
        aria-label={`${viewYear}`}
      >
        {MONTHS.map((monthName, monthIndex) => {
          const monthDate = new Date(viewYear, monthIndex, 1);
          const selected = value
            ? value.getFullYear() === viewYear && value.getMonth() === monthIndex
            : false;
          const disabled = isMonthDisabled(viewYear, monthIndex, minDate, maxDate);

          return (
            <button
              key={monthName}
              type="button"
              className={bdsClass(
                'bds-date-picker__month-cell',
                selected && 'bds-date-picker__month-cell--selected',
              )}
              disabled={disabled}
              onClick={() => {
                if (!disabled) onChange(monthDate);
              }}
              aria-label={formatMonthYear(monthDate)}
              aria-selected={selected}
              role="gridcell"
            >
              {monthName.slice(0, 3)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── DatePicker Component ───────────────────────────────────────────

/**
 * DatePicker - BDS themed date picker component
 *
 * Fully token-based — all styles reference BDS semantic design tokens.
 * Uses Radix UI Popover for accessible popover behavior.
 * Matches form component conventions: label, helperText, error, size variants.
 *
 * @example
 * ```tsx
 * <DatePicker size="sm" label="Start date" placeholder="Select a date" />
 * <DatePicker size="md" label="Due date" helperText="Task must be completed by this date" />
 * <DatePicker size="lg" label="Appointment" error="Date is required" />
 * <DatePicker precision="month" label="Reporting month" />
 * ```
 *
 * @summary Themed date picker (Radix Popover + calendar grid)
 */
export const DatePicker = forwardRef<HTMLButtonElement, DatePickerProps>(
  (
    {
      value = null,
      onChange,
      size = 'md',
      precision = 'day',
      label,
      helperText,
      error,
      placeholder = 'Select a date',
      fullWidth = false,
      disabled = false,
      minDate,
      maxDate,
      id,
      className = '',
    },
    ref
  ) => {
    const [open, setOpen] = useState(false);
    const inputId = id || `datepicker-${Math.random().toString(36).substring(2, 11)}`;
    const hasError = Boolean(error);

    const handleSelect = useCallback(
      (date: Date) => {
        onChange?.(date);
        setOpen(false);
      },
      [onChange]
    );

    return (
      <div
        className={bdsClass(
          'bds-date-picker',
          `bds-date-picker--${size}`,
          fullWidth && 'bds-date-picker--full-width',
          className,
        )}
      >
        {label && (
          <label
            htmlFor={inputId}
            className={bdsClass(
              'bds-date-picker__label',
              hasError && 'bds-date-picker__label--error',
            )}
          >
            {label}
          </label>
        )}

        <Popover.Root open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild disabled={disabled}>
            <button
              ref={ref}
              id={inputId}
              type="button"
              className={bdsClass(
                'bds-date-picker__trigger',
                hasError && 'bds-date-picker__trigger--error',
                disabled && 'bds-date-picker__trigger--disabled',
                open && 'bds-date-picker__trigger--open',
              )}
              aria-invalid={hasError}
              aria-describedby={
                error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
              }
            >
              <span className={value ? undefined : 'bds-date-picker__placeholder'}>
                {value
                  ? precision === 'month'
                    ? formatMonthYear(value)
                    : formatDate(value)
                  : placeholder}
              </span>
              <span className="bds-date-picker__caret" aria-hidden>
                ▾
              </span>
            </button>
          </Popover.Trigger>

          <Popover.Portal>
            <Popover.Content
              sideOffset={4}
              align="start"
              style={{ outline: 'none' }}
              aria-label={precision === 'month' ? 'Choose month' : 'Choose date'}
            >
              {precision === 'month' ? (
                <MonthGrid
                  value={value}
                  onChange={handleSelect}
                  minDate={minDate}
                  maxDate={maxDate}
                  onClose={() => setOpen(false)}
                />
              ) : (
                <Calendar
                  value={value}
                  onChange={handleSelect}
                  minDate={minDate}
                  maxDate={maxDate}
                  onClose={() => setOpen(false)}
                />
              )}
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        {error && (
          <span
            id={`${inputId}-error`}
            className="bds-date-picker__helper bds-date-picker__helper--error"
            role="alert"
          >
            {error}
          </span>
        )}

        {helperText && !error && (
          <span id={`${inputId}-helper`} className="bds-date-picker__helper">
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';

export default DatePicker;
