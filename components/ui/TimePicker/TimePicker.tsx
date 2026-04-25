import {
  forwardRef,
  useState,
  useCallback,
  useRef,
  useEffect,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Icon } from '@iconify/react';
import { Clock } from '../../icons';
import { bdsClass } from '../../utils';
import './TimePicker.css';

// ─── Types ──────────────────────────────────────────────────────────

export type TimePickerSize = 'sm' | 'md' | 'lg';

export interface TimePickerProps {
  /** Selected time value in HH:mm (24h) format */
  value?: string;
  /** Called when a time is selected — value in HH:mm (24h) format */
  onChange?: (value: string) => void;
  /** Size variant matching BDS form components */
  size?: TimePickerSize;
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
  /** Minute step interval (default 1) */
  minuteStep?: number;
  /** Use 24-hour display (default false — shows AM/PM) */
  use24Hour?: boolean;
  /** Input id */
  id?: string;
  /** Additional className */
  className?: string;
}

// ─── Helpers ────────────────────────────────────────────────────────

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function parse24(value: string): { hour: number; minute: number } {
  const [h, m] = value.split(':').map(Number);
  return { hour: h ?? 0, minute: m ?? 0 };
}

function to12(hour24: number): { hour12: number; period: 'AM' | 'PM' } {
  const period: 'AM' | 'PM' = hour24 >= 12 ? 'PM' : 'AM';
  let hour12 = hour24 % 12;
  if (hour12 === 0) hour12 = 12;
  return { hour12, period };
}

function to24(hour12: number, period: 'AM' | 'PM'): number {
  if (period === 'AM') return hour12 === 12 ? 0 : hour12;
  return hour12 === 12 ? 12 : hour12 + 12;
}

function formatDisplay(value: string, use24Hour: boolean): string {
  const { hour, minute } = parse24(value);
  if (use24Hour) return `${pad(hour)}:${pad(minute)}`;
  const { hour12, period } = to12(hour);
  return `${pad(hour12)}:${pad(minute)} ${period}`;
}

function generateMinutes(step: number): number[] {
  const minutes: number[] = [];
  for (let m = 0; m < 60; m += step) minutes.push(m);
  return minutes;
}

// ─── ScrollColumn Sub-component ─────────────────────────────────────

function ScrollColumn({
  items,
  selected,
  onSelect,
  ariaLabel,
}: {
  items: { value: number | string; label: string }[];
  selected: number | string;
  onSelect: (value: number | string) => void;
  ariaLabel: string;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  // Scroll selected item into view on mount and when selection changes
  useEffect(() => {
    if (selectedRef.current && listRef.current) {
      const list = listRef.current;
      const item = selectedRef.current;
      const listRect = list.getBoundingClientRect();
      const itemRect = item.getBoundingClientRect();
      const offset = itemRect.top - listRect.top - list.clientHeight / 2 + itemRect.height / 2;
      list.scrollTop += offset;
    }
  }, [selected]);

  return (
    <div
      ref={listRef}
      className="bds-time-picker__column"
      role="listbox"
      aria-label={ariaLabel}
    >
      {items.map((item) => {
        const isSelected = item.value === selected;
        return (
          <button
            key={item.value}
            ref={isSelected ? selectedRef : undefined}
            type="button"
            role="option"
            className={bdsClass(
              'bds-time-picker__cell',
              isSelected && 'bds-time-picker__cell--selected',
            )}
            aria-selected={isSelected}
            onClick={(e: ReactMouseEvent) => {
              e.preventDefault();
              onSelect(item.value);
            }}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── TimePicker Component ───────────────────────────────────────────

/**
 * TimePicker - BDS themed time picker component
 *
 * Fully token-based — all styles reference BDS semantic design tokens.
 * Uses Radix UI Popover for accessible popover behavior.
 * Matches form component conventions: label, helperText, error, size variants.
 *
 * @example
 * ```tsx
 * <TimePicker size="sm" label="Start Time" placeholder="Select time" />
 * <TimePicker size="md" label="End Time" value="14:30" minuteStep={5} />
 * <TimePicker size="lg" label="Appointment" use24Hour error="Time is required" />
 * ```
 *
 * @summary Themed time picker (12h/24h, configurable step)
 */
export const TimePicker = forwardRef<HTMLButtonElement, TimePickerProps>(
  (
    {
      value = '09:00',
      onChange,
      size = 'md',
      label,
      helperText,
      error,
      placeholder = 'Select time',
      fullWidth = false,
      disabled = false,
      minuteStep = 1,
      use24Hour = false,
      id,
      className = '',
    },
    ref
  ) => {
    const [open, setOpen] = useState(false);
    const inputId = id || `timepicker-${Math.random().toString(36).substring(2, 11)}`;
    const hasError = Boolean(error);

    const { hour: hour24, minute } = parse24(value);
    const { hour12, period } = to12(hour24);

    // ── Column data ──

    const hours = use24Hour
      ? Array.from({ length: 24 }, (_, i) => ({ value: i, label: pad(i) }))
      : Array.from({ length: 12 }, (_, i) => {
          const h = i + 1; // 1–12
          return { value: h, label: pad(h) };
        });

    const minutes = generateMinutes(minuteStep).map((m) => ({
      value: m,
      label: pad(m),
    }));

    const periods = [
      { value: 'AM' as const, label: 'AM' },
      { value: 'PM' as const, label: 'PM' },
    ];

    // ── Handlers ──

    const emit = useCallback(
      (h24: number, m: number) => {
        onChange?.(`${pad(h24)}:${pad(m)}`);
      },
      [onChange],
    );

    const handleHourSelect = useCallback(
      (h: number | string) => {
        const numH = Number(h);
        if (use24Hour) {
          emit(numH, minute);
        } else {
          emit(to24(numH, period), minute);
        }
      },
      [use24Hour, minute, period, emit],
    );

    const handleMinuteSelect = useCallback(
      (m: number | string) => {
        emit(hour24, Number(m));
      },
      [hour24, emit],
    );

    const handlePeriodSelect = useCallback(
      (p: number | string) => {
        emit(to24(hour12, p as 'AM' | 'PM'), minute);
      },
      [hour12, minute, emit],
    );

    return (
      <div
        className={bdsClass(
          'bds-time-picker',
          `bds-time-picker--${size}`,
          fullWidth && 'bds-time-picker--full-width',
          className,
        )}
      >
        {label && (
          <label
            htmlFor={inputId}
            className={bdsClass(
              'bds-time-picker__label',
              hasError && 'bds-time-picker__label--error',
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
                'bds-time-picker__trigger',
                hasError && 'bds-time-picker__trigger--error',
                disabled && 'bds-time-picker__trigger--disabled',
                open && 'bds-time-picker__trigger--open',
              )}
              aria-invalid={hasError}
              aria-describedby={
                error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
              }
            >
              <span className={value ? undefined : 'bds-time-picker__placeholder'}>
                {value ? formatDisplay(value, use24Hour) : placeholder}
              </span>
              <span className="bds-time-picker__icon" aria-hidden>
                <Icon icon={Clock} />
              </span>
            </button>
          </Popover.Trigger>

          <Popover.Portal>
            <Popover.Content
              sideOffset={4}
              align="start"
              className="bds-time-picker__popover"
              aria-label="Choose time"
            >
              <div
                className="bds-time-picker__columns"
              >
                <ScrollColumn
                  items={hours}
                  selected={use24Hour ? hour24 : hour12}
                  onSelect={handleHourSelect}
                  ariaLabel="Hour"
                />
                <ScrollColumn
                  items={minutes}
                  selected={minute}
                  onSelect={handleMinuteSelect}
                  ariaLabel="Minute"
                />
                {!use24Hour && (
                  <ScrollColumn
                    items={periods}
                    selected={period}
                    onSelect={handlePeriodSelect}
                    ariaLabel="AM or PM"
                  />
                )}
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        {error && (
          <span
            id={`${inputId}-error`}
            className="bds-time-picker__helper bds-time-picker__helper--error"
            role="alert"
          >
            {error}
          </span>
        )}

        {helperText && !error && (
          <span id={`${inputId}-helper`} className="bds-time-picker__helper">
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

TimePicker.displayName = 'TimePicker';

export default TimePicker;
