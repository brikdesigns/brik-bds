import { type HTMLAttributes, type CSSProperties, type KeyboardEvent, useRef } from 'react';
import { bdsClass } from '../../utils';
import './SegmentedControl.css';

/**
 * Individual segment item
 */
export interface SegmentItem {
  /** Segment label */
  label: string;
  /** Unique value for this segment (defaults to label if omitted) */
  value?: string;
  /** Whether this segment is disabled */
  disabled?: boolean;
}

/** Size variants */
export type SegmentedControlSize = 'sm' | 'md' | 'lg';

/**
 * SegmentedControl component props
 */
export interface SegmentedControlProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Segment items */
  items: SegmentItem[];
  /** Currently selected value */
  value?: string;
  /** Selection change handler */
  onChange?: (value: string) => void;
  /** Size variant */
  size?: SegmentedControlSize;
  /** Expand to fill container width */
  fullWidth?: boolean;
  /** Disable all segments */
  disabled?: boolean;
}

/* ── Container styles ── */

const containerBase: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  backgroundColor: 'var(--background-secondary)',
  borderRadius: 'var(--border-radius-md)',
  padding: 'var(--border-width-lg)',
  boxSizing: 'border-box',
  gap: 'var(--border-width-lg)',
};

/* ── Size-specific segment styles ── */

const sizeStyles: Record<SegmentedControlSize, CSSProperties> = {
  sm: {
    padding: 'var(--gap-xs) var(--padding-md)',
    fontSize: 'var(--label-sm)',
  },
  md: {
    padding: 'var(--gap-sm) var(--padding-lg)',
    fontSize: 'var(--label-md)',
  },
  lg: {
    padding: 'var(--gap-md) var(--padding-xl)',
    fontSize: 'var(--label-md)',
  },
};

/* ── Segment base ── */

const segmentBase: CSSProperties = {
  fontFamily: 'var(--font-family-label)',
  fontWeight: 'var(--font-weight-semibold)' as unknown as number,
  lineHeight: 'var(--font-line-height-tight)',
  textAlign: 'center',
  whiteSpace: 'nowrap',
  cursor: 'pointer',
  // backgroundColor (not the `background` shorthand) so base and active set the
  // SAME property — mixing shorthand + non-shorthand triggers React's
  // "conflicting style property" rerender warning. See #993.
  backgroundColor: 'transparent',
  border: 'none',
  borderRadius: 'var(--border-radius-sm)',
  // Inactive label sits on the --background-secondary track, which is a light-ish
  // neutral surface in BOTH themes (grayscale-lightest light / grayscale-light dark).
  // --text-secondary flips to grayscale-light in dark mode and collapses onto the
  // track (same stop → ~1:1, invisible). --text-on-color-light is fixed dark in both
  // themes → AA on the track either way. See contrast-pairings.json.
  color: 'var(--text-on-color-light)',
  minWidth: 0,
  transition: 'background-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease',
};

const activeSegmentStyles: CSSProperties = {
  backgroundColor: 'var(--background-primary)',
  color: 'var(--text-primary)',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)', // bds-lint-ignore — subtle elevation for active pill
};

/**
 * SegmentedControl — BDS toggle control for switching between views or modes
 *
 * A pill-shaped container with mutually exclusive segments. Unlike TabBar
 * (which is for navigation), SegmentedControl is for toggling between
 * closely related content views within the same context.
 *
 * @example
 * ```tsx
 * const [view, setView] = useState('grid');
 *
 * <SegmentedControl
 *   value={view}
 *   onChange={setView}
 *   items={[
 *     { label: 'Grid', value: 'grid' },
 *     { label: 'List', value: 'list' },
 *   ]}
 * />
 * ```
 *
 * @summary Toggle between mutually-exclusive views or modes
 */
export function SegmentedControl({
  items,
  value,
  onChange,
  size = 'md',
  fullWidth = false,
  disabled = false,
  className = '',
  style,
  ...props
}: SegmentedControlProps) {
  const containerStyles: CSSProperties = {
    ...containerBase,
    ...(fullWidth ? { display: 'flex', width: '100%' } : {}),
    ...style,
  };

  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Indices of segments that can receive focus (enabled).
  const enabledIndices = items.reduce<number[]>((acc, item, index) => {
    if (!(disabled || item.disabled)) acc.push(index);
    return acc;
  }, []);

  // Roving tab stop: the selected enabled segment, else the first enabled one.
  // The radiogroup exposes a single Tab stop; arrow keys move within it.
  const selectedIndex = items.findIndex(
    (item) => (item.value ?? item.label) === value && !(disabled || item.disabled),
  );
  const tabStopIndex = selectedIndex >= 0 ? selectedIndex : (enabledIndices[0] ?? -1);

  const focusAndSelect = (index: number) => {
    const item = items[index];
    if (!item) return;
    itemRefs.current[index]?.focus();
    onChange?.(item.value ?? item.label);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (enabledIndices.length === 0) return;
    const focusedIndex = itemRefs.current.findIndex((el) => el === document.activeElement);
    const fromPos = enabledIndices.indexOf(focusedIndex >= 0 ? focusedIndex : tabStopIndex);
    if (fromPos === -1) return;

    let nextPos = fromPos;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        nextPos = (fromPos + 1) % enabledIndices.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        nextPos = (fromPos - 1 + enabledIndices.length) % enabledIndices.length;
        break;
      case 'Home':
        nextPos = 0;
        break;
      case 'End':
        nextPos = enabledIndices.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    focusAndSelect(enabledIndices[nextPos]);
  };

  return (
    <div
      className={bdsClass('bds-segmented-control', className)}
      style={containerStyles}
      role="radiogroup"
      {...props}
      onKeyDown={handleKeyDown}
    >
      {items.map((item, index) => {
        const itemValue = item.value ?? item.label;
        const isActive = itemValue === value;
        const isDisabled = disabled || item.disabled;

        const segmentStyles: CSSProperties = {
          ...segmentBase,
          ...sizeStyles[size],
          ...(isActive ? activeSegmentStyles : {}),
          ...(fullWidth ? { flex: 1 } : {}),
        };

        return (
          <button
            key={itemValue}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={isActive}
            disabled={isDisabled}
            tabIndex={index === tabStopIndex ? 0 : -1}
            className={bdsClass(
              'bds-segmented-control-item',
              isActive ? 'bds-segmented-control-item--active' : '',
            )}
            style={segmentStyles}
            onClick={() => onChange?.(itemValue)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

export default SegmentedControl;
