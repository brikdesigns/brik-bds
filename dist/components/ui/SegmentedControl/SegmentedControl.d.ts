import { type HTMLAttributes } from 'react';
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
 */
export declare function SegmentedControl({ items, value, onChange, size, fullWidth, disabled, className, style, ...props }: SegmentedControlProps): import("react/jsx-runtime").JSX.Element;
export default SegmentedControl;
