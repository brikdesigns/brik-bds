import { type HTMLAttributes, type KeyboardEvent, useRef } from 'react';
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
      className={bdsClass(
        'bds-segmented-control',
        `bds-segmented-control--${size}`,
        fullWidth && 'bds-segmented-control--full-width',
        className,
      )}
      style={style}
      role="radiogroup"
      {...props}
      onKeyDown={handleKeyDown}
    >
      {items.map((item, index) => {
        const itemValue = item.value ?? item.label;
        const isActive = itemValue === value;
        const isDisabled = disabled || item.disabled;

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
              isActive && 'bds-segmented-control-item--active',
            )}
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
