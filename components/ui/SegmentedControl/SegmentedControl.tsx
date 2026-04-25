import { type HTMLAttributes, type CSSProperties } from 'react';
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
  fontWeight: 'var(--font-weight-semi-bold)' as unknown as number,
  lineHeight: 'var(--font-line-height-tight)',
  textAlign: 'center',
  whiteSpace: 'nowrap',
  cursor: 'pointer',
  background: 'none',
  border: 'none',
  borderRadius: 'var(--border-radius-sm)',
  color: 'var(--text-secondary)',
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

  return (
    <div
      className={bdsClass('bds-segmented-control', className)}
      style={containerStyles}
      role="radiogroup"
      {...props}
    >
      {items.map((item) => {
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
            type="button"
            role="radio"
            aria-checked={isActive}
            disabled={isDisabled}
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
