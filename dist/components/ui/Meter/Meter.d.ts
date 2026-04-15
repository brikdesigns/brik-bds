import { type HTMLAttributes } from 'react';
import './Meter.css';
/**
 * Meter status variants — maps to BDS system color tokens
 */
export type MeterStatus = 'positive' | 'warning' | 'error' | 'neutral';
/**
 * Meter size variants — controls bar height
 */
export type MeterSize = 'sm' | 'md' | 'lg';
/**
 * Label position relative to the bar
 */
export type MeterLabelPosition = 'above' | 'below';
/**
 * Meter component props
 *
 * Horizontal bar gauge that visualizes a value relative to a maximum.
 */
export interface MeterProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
    /** Current value */
    value: number;
    /** Maximum value */
    max: number;
    /** Status variant — drives fill color via system tokens */
    status?: MeterStatus;
    /** Bar height: sm=8px, md=12px, lg=16px */
    size?: MeterSize;
    /** Label text (e.g. "Pass", "Fair", "Fail") */
    label?: string;
    /** Show formatted value (default: true) */
    showValue?: boolean;
    /** Custom value formatter (default: "6/7") */
    valueFormatter?: (value: number, max: number) => string;
    /** Position label/value above or below the bar (default: "below") */
    labelPosition?: MeterLabelPosition;
}
/**
 * Meter — a horizontal bar gauge for visualizing scores and ratings.
 *
 * Uses BDS system color tokens for status-driven fill colors.
 *
 * @example
 * ```tsx
 * <Meter value={6} max={7} status="positive" label="Pass" />
 * <Meter value={3} max={10} status="warning" label="Fair" size="lg" />
 * <Meter value={1} max={5} status="error" label="Fail" showValue={false} />
 * ```
 */
export declare function Meter({ value, max, status, size, label, showValue, valueFormatter, labelPosition, className, style, ...rest }: MeterProps): import("react/jsx-runtime").JSX.Element;
export default Meter;
