import { type HTMLAttributes } from 'react';
import { scaleLinear } from 'd3-scale';
import { line } from 'd3-shape';
import { useElementWidth } from '../shared/useElementWidth';
import { bdsClass } from '../../utils';
import { defaultValueFormatter, type ChartColor, type ChartValueFormatter } from './chartTypes';
import './Chart.css';

export interface SparklineProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The values, oldest first. */
  data: number[];
  /**
   * Accessible name — what the trend is, e.g. "Revenue, last 12 weeks". It is
   * the image's label and the hidden data table's caption.
   */
  label: string;
  /** Name for each point in the hidden data table, e.g. week labels. Default "Point 1", "Point 2", … */
  pointLabels?: string[];
  /** Colour token suffix. Default `categorical-1`. */
  color?: ChartColor;
  /** Height in px. Default `32`. Width fills the container. */
  height?: number;
  /** Formats values in the hidden data table. */
  valueFormatter?: ChartValueFormatter;
}

const INSET = 3;

/**
 * Sparkline — a trend with no axes, legend or tooltip. It sits beside a
 * number, in `Stat`'s `supplementary` slot; the Stat's value and trend are
 * its text. A visually hidden table carries the values for screen readers.
 *
 * @summary Axis-free trend line for a Stat's supplementary slot
 */
export function Sparkline({
  data,
  label,
  pointLabels,
  color = 'categorical-1',
  height = 32,
  valueFormatter = defaultValueFormatter,
  className,
  style,
  ...props
}: SparklineProps) {
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const values = data.filter((v) => Number.isFinite(v));
  const min = values.length ? Math.min(...values) : 0;
  const max = values.length ? Math.max(...values) : 0;

  let path: string | null = null;
  let last: { x: number; y: number } | null = null;
  if (width !== null && width > 0 && data.length > 0) {
    const x = scaleLinear()
      .domain([0, Math.max(1, data.length - 1)])
      .range([INSET, width - INSET]);
    const y = scaleLinear()
      .domain(min === max ? [min - 1, max + 1] : [min, max])
      .range([height - INSET, INSET]);
    path = line<number>()
      .defined((v) => Number.isFinite(v))
      .x((_, i) => x(i))
      .y((v) => y(v))(data);
    const lastIndex = data.length - 1;
    if (Number.isFinite(data[lastIndex])) last = { x: x(lastIndex), y: y(data[lastIndex]) };
  }

  return (
    <div
      ref={ref}
      className={bdsClass('bds-sparkline', className)}
      data-chart-color={color}
      style={{ height, ...style }}
      {...props}
    >
      <svg className="bds-chart__svg" width={width ?? 0} height={height} role="img" aria-label={label}>
        {path && <path className="bds-sparkline__line" d={path} />}
        {last && <circle className="bds-sparkline__dot" cx={last.x} cy={last.y} r={INSET - 0.5} />}
      </svg>
      <table className="bds-chart__visually-hidden">
        <caption>{label}</caption>
        <thead>
          <tr>
            <th scope="col">Point</th>
            <th scope="col">Value</th>
          </tr>
        </thead>
        <tbody>
          {data.map((v, i) => (
            <tr key={i}>
              <th scope="row">{pointLabels?.[i] ?? `Point ${i + 1}`}</th>
              <td>{Number.isFinite(v) ? valueFormatter(v) : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Sparkline;
