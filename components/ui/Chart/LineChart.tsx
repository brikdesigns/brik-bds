import { useState, type PointerEvent } from 'react';
import { scaleLinear, scalePoint, scaleTime } from 'd3-scale';
import { line } from 'd3-shape';
import { ChartFrame, type ChartTooltipState } from './ChartFrame';
import {
  ChartDataTable,
  ChartTooltipContent,
  titleText,
  truncateLabel,
  useSeriesToggle,
} from './ChartParts';
import {
  DEFAULT_CHART_EMPTY,
  defaultValueFormatter,
  estimateLabelWidth,
  formatCategory,
  readValue,
  type ChartBaseProps,
  type ChartDatum,
  type ChartSeries,
  type ChartValueFormatter,
} from './chartTypes';

export interface LineChartProps extends ChartBaseProps {
  /** One row per x position, in order. */
  data: ChartDatum[];
  /** The `data` field on the x axis — Dates plot on a time scale, numbers on a linear one, strings evenly spaced. */
  xKey: string;
  /** Numeric fields to plot, one line each. With more than one, each line is labelled at its end. */
  series: ChartSeries[];
  /** Formats values on the axis, in the tooltip and in the data table. */
  valueFormatter?: ChartValueFormatter;
  /** Formats x values in the tooltip and the data table. Default: short date for Dates, else the value as text. */
  xFormatter?: (value: ChartDatum[string]) => string;
  /** Caption for the x axis. Also heads the data table's first column. */
  xAxisLabel?: string;
  /** Caption for the value axis — the unit. */
  yAxisLabel?: string;
}

const PAD = 8;
const TICK_BAND = 24;
const END_LABEL_GAP = 14;

type XKind = 'time' | 'linear' | 'point';

function xKindOf(values: ChartDatum[string][]): XKind {
  const first = values.find((v) => v !== null && v !== undefined);
  if (first instanceof Date) return 'time';
  if (typeof first === 'number') return 'linear';
  return 'point';
}

/** Push labels apart so no two sit closer than `gap` px, keeping their order. */
function spreadLabels<T extends { y: number }>(labels: T[], gap: number, max: number): T[] {
  const sorted = [...labels].sort((a, b) => a.y - b.y);
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].y - sorted[i - 1].y < gap) sorted[i] = { ...sorted[i], y: sorted[i - 1].y + gap };
  }
  const overflow = sorted.length ? sorted[sorted.length - 1].y - max : 0;
  return overflow > 0 ? sorted.map((l) => ({ ...l, y: l.y - overflow })) : sorted;
}

/**
 * LineChart — change over continuous time. One line per series; with more
 * than one, each is labelled at its end and the legend toggles them.
 *
 * @summary Change over continuous time — one line per series
 */
export function LineChart({
  data,
  xKey,
  series,
  valueFormatter = defaultValueFormatter,
  xFormatter = formatCategory,
  xAxisLabel,
  yAxisLabel,
  title,
  empty,
  emptyState = DEFAULT_CHART_EMPTY,
  ...frameProps
}: LineChartProps) {
  const { resolved, visible, legend } = useSeriesToggle(series);
  const [active, setActive] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<ChartTooltipState | null>(null);
  const name = titleText(title);
  const xValues = data.map((d) => d[xKey]);
  const kind = xKindOf(xValues);

  const values = data.flatMap((d) => visible.map((s) => readValue(d, s.key)).filter((v): v is number => v !== null));
  const yBase = scaleLinear()
    .domain([Math.min(0, ...values), Math.max(0, ...values)])
    .nice();

  const table = (
    <ChartDataTable
      label={`${name} data`}
      columns={[
        { key: '__x', label: xAxisLabel ?? 'Period' },
        ...resolved.map((s) => ({ key: s.key, label: s.label, numeric: true })),
      ]}
      rows={data.map((d) => {
        const row: Record<string, string> = { __x: xFormatter(d[xKey]) };
        for (const s of resolved) {
          const v = readValue(d, s.key);
          row[s.key] = v === null ? '—' : valueFormatter(v);
        }
        return row;
      })}
    />
  );

  const clear = () => {
    setActive(null);
    setTooltip(null);
  };

  return (
    <ChartFrame
      title={title}
      legend={legend}
      yAxisLabel={yAxisLabel}
      xAxisLabel={xAxisLabel}
      tooltip={tooltip}
      table={table}
      empty={empty ?? data.length === 0}
      emptyState={emptyState}
      {...frameProps}
    >
      {({ width, height }) => {
        const innerH = Math.max(0, height - TICK_BAND - PAD);
        const y = yBase.copy().range([innerH, 0]);
        const yTicks = y.ticks(Math.max(2, Math.floor(innerH / 48)));
        const left = Math.max(0, ...yTicks.map((t) => estimateLabelWidth(valueFormatter(t)))) + PAD;
        const showEndLabels = visible.length > 1;
        const endLabelWidth = showEndLabels
          ? Math.min(Math.max(...visible.map((s) => estimateLabelWidth(s.label))), Math.floor(width * 0.25))
          : 0;
        const right = showEndLabels ? endLabelWidth + PAD * 2 : PAD;
        const innerW = Math.max(0, width - left - right);

        let px: (i: number) => number;
        let xTicks: Array<{ x: number; label: string }>;
        if (kind === 'time') {
          const times = xValues.map((v) => (v instanceof Date ? v : new Date(String(v))));
          const scale = scaleTime()
            .domain([times[0], times[times.length - 1]])
            .range([0, innerW]);
          const format = scale.tickFormat();
          px = (i) => scale(times[i]);
          xTicks = scale.ticks(Math.max(2, Math.floor(innerW / 90))).map((t) => ({ x: scale(t), label: format(t) }));
        } else if (kind === 'linear') {
          const nums = xValues.map((v) => Number(v));
          const scale = scaleLinear()
            .domain([Math.min(...nums), Math.max(...nums)])
            .range([0, innerW]);
          px = (i) => scale(nums[i]);
          xTicks = scale.ticks(Math.max(2, Math.floor(innerW / 80))).map((t) => ({ x: scale(t), label: String(t) }));
        } else {
          const scale = scalePoint<string>()
            .domain(data.map((_, i) => String(i)))
            .range([0, innerW]);
          const labels = xValues.map((v) => xFormatter(v));
          const widest = Math.max(0, ...labels.map(estimateLabelWidth));
          const every = Math.max(1, Math.ceil((widest + PAD) / Math.max(1, scale.step())));
          px = (i) => scale(String(i)) ?? 0;
          xTicks = labels
            .map((label, i) => ({ x: px(i), label: truncateLabel(label, scale.step() * every - PAD) }))
            .filter((_, i) => i % every === 0);
        }

        const endLabels = showEndLabels
          ? spreadLabels(
              visible.flatMap((s) => {
                for (let i = data.length - 1; i >= 0; i--) {
                  const v = readValue(data[i], s.key);
                  if (v !== null) return [{ key: s.key, label: s.label, color: s.color, y: y(v) }];
                }
                return [];
              }),
              END_LABEL_GAP,
              innerH,
            )
          : [];

        const onMove = (e: PointerEvent<SVGRectElement>) => {
          const box = e.currentTarget.getBoundingClientRect();
          const pointerX = e.clientX - box.left;
          let nearest = 0;
          for (let i = 1; i < data.length; i++) {
            if (Math.abs(px(i) - pointerX) < Math.abs(px(nearest) - pointerX)) nearest = i;
          }
          if (nearest === active) return;
          const points = visible
            .map((s) => readValue(data[nearest], s.key))
            .filter((v): v is number => v !== null);
          setActive(nearest);
          setTooltip({
            x: left + px(nearest),
            y: PAD + (points.length ? Math.min(...points.map((v) => y(v))) : innerH),
            content: (
              <ChartTooltipContent
                title={xFormatter(data[nearest][xKey])}
                rows={visible.map((s) => {
                  const v = readValue(data[nearest], s.key);
                  return { key: s.key, label: s.label, color: s.color, value: v === null ? '—' : valueFormatter(v) };
                })}
              />
            ),
          });
        };

        return (
          <svg
            className="bds-chart__svg"
            width={width}
            height={height}
            role="img"
            aria-label={`${name}, line chart of ${visible.length} series over ${data.length} points`}
          >
            <g transform={`translate(${left},${PAD})`}>
              {yTicks.map((t) => (
                <g key={t}>
                  <line className="bds-chart__grid" x1={0} x2={innerW} y1={y(t)} y2={y(t)} />
                  <text className="bds-chart__tick" x={-PAD} y={y(t)} textAnchor="end" dominantBaseline="middle">
                    {valueFormatter(t)}
                  </text>
                </g>
              ))}
              <line className="bds-chart__axis" x1={0} x2={innerW} y1={innerH} y2={innerH} />
              {xTicks.map((t, i) => (
                <text key={i} className="bds-chart__tick" x={t.x} y={innerH + 16} textAnchor="middle">
                  {t.label}
                </text>
              ))}
              {active !== null && (
                <line className="bds-chart__guide" x1={px(active)} x2={px(active)} y1={0} y2={innerH} />
              )}
              {visible.map((s) => {
                const path = line<ChartDatum>()
                  .defined((d) => readValue(d, s.key) !== null)
                  .x((_, i) => px(i))
                  .y((d) => y(readValue(d, s.key) ?? 0))(data);
                const v = active !== null ? readValue(data[active], s.key) : null;
                return (
                  <g key={s.key} data-chart-color={s.color}>
                    {path && <path className="bds-chart__line" d={path} />}
                    {active !== null && v !== null && (
                      <circle className="bds-chart__dot" cx={px(active)} cy={y(v)} r={4} />
                    )}
                  </g>
                );
              })}
              {endLabels.map((l) => (
                <text
                  key={l.key}
                  className="bds-chart__direct-label"
                  x={innerW + PAD}
                  y={l.y}
                  dominantBaseline="middle"
                >
                  {truncateLabel(l.label, endLabelWidth)}
                </text>
              ))}
              <rect
                className="bds-chart__hit"
                x={0}
                y={0}
                width={innerW}
                height={innerH}
                onPointerMove={onMove}
                onPointerLeave={clear}
              />
            </g>
          </svg>
        );
      }}
    </ChartFrame>
  );
}

export default LineChart;
