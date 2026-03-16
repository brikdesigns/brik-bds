import {
  forwardRef,
  useState,
  useCallback,
  useMemo,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';
import * as Popover from '@radix-ui/react-popover';
import { bdsClass } from '../../utils';

// ─── Types ──────────────────────────────────────────────────────────

export type DatePickerSize = 'sm' | 'md' | 'lg';

export interface DatePickerProps {
  /** Selected date value */
  value?: Date | null;
  /** Called when a date is selected */
  onChange?: (date: Date | null) => void;
  /** Size variant matching BDS form components */
  size?: DatePickerSize;
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

function isDateDisabled(date: Date, minDate?: Date, maxDate?: Date): boolean {
  if (minDate && date < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())) {
    return true;
  }
  if (maxDate && date > new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate())) {
    return true;
  }
  return false;
}

// ─── Styles ─────────────────────────────────────────────────────────

/**
 * Wrapper styles — vertical stack with gap between label and field
 *
 * Token reference:
 * - --gap-md = 8px
 */
const wrapperStyles: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--gap-md)',
  color: 'var(--text-primary)',
};

/**
 * Label base styles
 *
 * Token reference:
 * - --font-family-label
 * - --font-weight-semi-bold = 600
 * - --font-line-height-tight = 100%
 */
const labelBaseStyles: CSSProperties = {
  fontFamily: 'var(--font-family-label)',
  fontWeight: 'var(--font-weight-semi-bold)' as unknown as number,
  lineHeight: 'var(--font-line-height-tight)',
  textTransform: 'capitalize',
};

/**
 * Trigger button base styles — mirrors TextInput field styles
 *
 * Token reference:
 * - --background-input
 * - --border-input
 * - --border-width-md = 1px
 * - --border-radius-md = 4px
 * - --padding-xs = 10px
 */
const triggerBaseStyles: CSSProperties = {
  width: '100%',
  padding: 'var(--padding-xs)',
  fontFamily: 'var(--font-family-body)',
  fontWeight: 'var(--font-weight-regular)' as unknown as number,
  lineHeight: 'var(--font-line-height-normal)',
  color: 'var(--text-primary)',
  backgroundColor: 'var(--background-input)',
  border: 'var(--border-width-md) solid var(--border-input)',
  borderRadius: 'var(--border-radius-md)',
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
  cursor: 'pointer',
  textAlign: 'left',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

/**
 * Helper/error text base styles
 *
 * Token reference:
 * - --font-family-body
 * - --body-sm
 * - --text-muted
 */
const helperBaseStyles: CSSProperties = {
  fontFamily: 'var(--font-family-body)',
  fontSize: 'var(--body-sm)',
  lineHeight: 'var(--font-line-height-normal)',
  color: 'var(--text-muted)',
};

/**
 * Size-specific typography tokens — matches bds-text-input sizing
 *
 * - sm: label 14px, trigger 14px
 * - md: label 16px, trigger 16px
 * - lg: label 18px, trigger 18px
 */
const sizeStyles: Record<DatePickerSize, { label: CSSProperties; trigger: CSSProperties }> = {
  sm: {
    label: { fontSize: 'var(--label-sm)' },
    trigger: { fontSize: 'var(--body-sm)' },
  },
  md: {
    label: { fontSize: 'var(--label-md)' },
    trigger: { fontSize: 'var(--body-md)' },
  },
  lg: {
    label: { fontSize: 'var(--label-lg)' },
    trigger: { fontSize: 'var(--body-lg)' },
  },
};

/**
 * Calendar popover container styles
 *
 * Token reference:
 * - --surface-primary
 * - --border-radius-md = 4px
 * - --box-shadow-lg
 * - --border-muted
 * - --padding-sm
 */
const calendarStyles: CSSProperties = {
  backgroundColor: 'var(--surface-primary)',
  borderRadius: 'var(--border-radius-md)',
  boxShadow: 'var(--box-shadow-lg)',
  border: 'var(--border-width-md) solid var(--border-muted)',
  padding: 'var(--padding-sm)',
  width: 280,
  zIndex: 50,
};

const calendarHeaderStyles: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingBottom: 'var(--padding-xs)',
};

/**
 * Month navigation button styles
 *
 * Token reference:
 * - --padding-tiny
 * - --border-radius-sm
 * - --text-secondary
 */
const navButtonStyles: CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 'var(--padding-tiny)',
  borderRadius: 'var(--border-radius-sm)',
  color: 'var(--text-secondary)',
  fontSize: 'var(--body-md)',
  lineHeight: '1',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 28,
  height: 28,
  transition: 'background-color 0.15s',
};

const dayHeaderStyles: CSSProperties = {
  fontFamily: 'var(--font-family-label)',
  fontSize: 'var(--body-xs)',
  fontWeight: 'var(--font-weight-medium)' as unknown as number,
  color: 'var(--text-muted)',
  textAlign: 'center',
  padding: 'var(--gap-xs) 0',
};

const dayButtonBase: CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  borderRadius: 'var(--border-radius-sm)',
  fontFamily: 'var(--font-family-body)',
  fontSize: 'var(--body-sm)',
  lineHeight: '1',
  width: 32,
  height: 32,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background-color 0.15s, color 0.15s',
  color: 'var(--text-primary)',
};

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
      style={calendarStyles}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-label="Choose date"
    >
      {/* Header: month/year nav */}
      <div style={calendarHeaderStyles}>
        <button
          type="button"
          className="bds-date-picker__nav-button"
          onClick={prevMonth}
          style={navButtonStyles}
          aria-label="Previous month"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          ‹
        </button>
        <span
          style={{
            fontFamily: 'var(--font-family-label)',
            fontSize: 'var(--body-sm)',
            fontWeight: 'var(--font-weight-semi-bold)' as unknown as number,
            color: 'var(--text-primary)',
          }}
        >
          {MONTHS[month]} {year}
        </span>
        <button
          type="button"
          className="bds-date-picker__nav-button"
          onClick={nextMonth}
          style={navButtonStyles}
          aria-label="Next month"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          ›
        </button>
      </div>

      {/* Day-of-week headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {DAYS.map((d) => (
          <div key={d} style={dayHeaderStyles}>
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}
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

          const dayStyle: CSSProperties = {
            ...dayButtonBase,
            ...(disabled
              ? { color: 'var(--text-muted)', cursor: 'not-allowed', opacity: 0.4 }
              : {}),
            ...(selected
              ? {
                  backgroundColor: 'var(--surface-brand-primary)',
                  color: 'var(--text-inverse)',
                  fontWeight: 'var(--font-weight-semi-bold)' as unknown as number,
                }
              : {}),
            ...(today && !selected
              ? {
                  border: 'var(--border-width-md) solid var(--border-brand-primary)',
                  fontWeight: 'var(--font-weight-semi-bold)' as unknown as number,
                }
              : {}),
          };

          return (
            <button
              key={day.toISOString()}
              type="button"
              className="bds-date-picker__day"
              style={dayStyle}
              disabled={disabled}
              onClick={() => {
                if (!disabled) onChange(day);
              }}
              onMouseEnter={(e) => {
                if (!disabled && !selected) {
                  e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!disabled && !selected) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
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
 * ```
 */
export const DatePicker = forwardRef<HTMLButtonElement, DatePickerProps>(
  (
    {
      value = null,
      onChange,
      size = 'md',
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
    const sizeStyle = sizeStyles[size];

    const handleSelect = useCallback(
      (date: Date) => {
        onChange?.(date);
        setOpen(false);
      },
      [onChange]
    );

    const triggerStyles: CSSProperties = {
      ...triggerBaseStyles,
      ...sizeStyle.trigger,
      ...(hasError ? { borderColor: 'var(--system--red)' } : {}),
      ...(disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}),
      ...(open ? { borderColor: 'var(--border-brand-primary)' } : {}),
    };

    return (
      <div
        className={bdsClass('bds-date-picker', `bds-date-picker--${size}`, className)}
        style={{
          ...wrapperStyles,
          width: fullWidth ? '100%' : 'auto',
        }}
      >
        {label && (
          <label
            htmlFor={inputId}
            style={{
              ...labelBaseStyles,
              ...sizeStyle.label,
              ...(hasError ? { color: 'var(--system--red)' } : {}),
            }}
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
              className="bds-date-picker__trigger"
              style={triggerStyles}
              aria-invalid={hasError}
              aria-describedby={
                error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
              }
            >
              <span style={value ? {} : { color: 'var(--text-muted)' }}>
                {value ? formatDate(value) : placeholder}
              </span>
              <span
                style={{ color: 'var(--text-muted)', fontSize: 'var(--body-sm)' }}
                aria-hidden
              >
                ▾
              </span>
            </button>
          </Popover.Trigger>

          <Popover.Portal>
            <Popover.Content
              sideOffset={4}
              align="start"
              style={{ outline: 'none' }}
            >
              <Calendar
                value={value}
                onChange={handleSelect}
                minDate={minDate}
                maxDate={maxDate}
                onClose={() => setOpen(false)}
              />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        {error && (
          <span
            id={`${inputId}-error`}
            style={{ ...helperBaseStyles, color: 'var(--system--red)' }}
            role="alert"
          >
            {error}
          </span>
        )}

        {helperText && !error && (
          <span id={`${inputId}-helper`} style={helperBaseStyles}>
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';

export default DatePicker;
