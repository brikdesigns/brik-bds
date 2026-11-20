import { useState } from 'react';
import { scaleBand, scaleLinear } from 'd3-scale';
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
  stackSegments,
  type ChartBaseProps,
  type ChartDatum,
  type ChartSeries,
  type ChartValueFormatter,
} from './chartTypes';

export type BarChartOrientation = 'vertical' | 'horizontal';

export interface BarChartProps extends ChartBaseProps {
  /** One row per category. */
  data: ChartDatum[];
  /** The `data` field naming each category. */
  categoryKey: string;
  /** Numeric fields to plot. Several series render as grouped bars, or stacked with `stacked`; keep it to 6 or fewer. */
  series: ChartSeries[];
  /** `vertical` (column, the default) or `horizontal` (bar — use it for long category labels). */
  orientation?: BarChartOrientation;
  /** Formats values on the axis, in the tooltip and in the data table. */
  valueFormatter?: ChartValueFormatter;
  /** Caption for the category axis. Also heads the data table's first column. */
  categoryAxisLabel?: string;
  /** Caption for the value axis — the unit. */
  valueAxisLabel?: string;
  /** Stack the series into one bar per category instead of grouping them. Segments sum to the category total. */
  stacked?: boolean;
}

const PAD = 8;
const TICK_BAND = 24;

/**
 * BarChart — compare categories. Column by default; `orientation="horizontal"`
 * for long category labels. Several series render as grouped bars with a
 * legend that toggles them.
 *
 * @summary Compare categories — column or horizontal bar
 */
export function BarChart({
  data,
  categoryKey,
  series,
  orientation = 'vertical',
  valueFormatter = defaultValueFormatter,
  categoryAxisLabel,
  valueAxisLabel,
  stacked = false,
  title,
  empty,
  emptyState = DEFAULT_CHART_EMPTY,
  ...frameProps
}: BarChartProps) {
  const { resolved, visible, legend } = useSeriesToggle(series);
  const [tooltip, setTooltip] = useState<ChartTooltipState | null>(null);
  const horizontal = orientation === 'horizontal';
  const name = titleText(title);
  const categories = data.map((d) => formatCategory(d[categoryKey]));

  const visibleKeys = visible.map((s) => s.key);
  const segmentsFor = (d: ChartDatum) => stackSegments(d, visibleKeys);
  const values = stacked
    ? data.flatMap((d) => segmentsFor(d).flatMap((g) => [g.start, g.end]))
    : data.flatMap((d) => visible.map((s) => readValue(d, s.key) ?? 0));
  const valueScale = scaleLinear()
    .domain([Math.min(0, ...values), Math.max(0, ...values)])
    .nice();

  const table = (
    <ChartDataTable
      label={`${name} data`}
      columns={[
        { key: '__category', label: categoryAxisLabel ?? 'Category' },
        ...resolved.map((s) => ({ key: s.key, label: s.label, numeric: true })),
        ...(stacked ? [{ key: '__total', label: 'Total', numeric: true }] : []),
      ]}
      rows={data.map((d, i) => {
        const row: Record<string, string> = { __category: categories[i] };
        for (const s of resolved) {
          const v = readValue(d, s.key);
          row[s.key] = v === null ? '—' : valueFormatter(v);
        }
        if (stacked) {
          row.__total = valueFormatter(resolved.reduce((sum, s) => sum + (readValue(d, s.key) ?? 0), 0));
        }
        return row;
      })}
    />
  );

  return (
    <ChartFrame
      title={title}
      legend={legend}
      yAxisLabel={horizontal ? categoryAxisLabel : valueAxisLabel}
      xAxisLabel={horizontal ? valueAxisLabel : categoryAxisLabel}
      tooltip={tooltip}
      table={table}
      empty={empty ?? data.length === 0}
      emptyState={emptyState}
      {...frameProps}
    >
      {({ width, height }) => {
        const maxFor = (d: ChartDatum) =>
          stacked
            ? Math.max(0, ...segmentsFor(d).map((g) => g.end))
            : Math.max(0, ...visible.map((s) => readValue(d, s.key) ?? 0));
        const tooltipFor = (i: number) => (
          <ChartTooltipContent
            title={categories[i]}
            rows={visible.map((s) => {
              const v = readValue(data[i], s.key);
              return { key: s.key, label: s.label, color: s.color, value: v === null ? '—' : valueFormatter(v) };
            })}
          />
        );

        if (horizontal) {
          const labelWidth = Math.min(
            Math.max(0, ...categories.map(estimateLabelWidth)),
            Math.floor(width * 0.4),
          );
          const left = labelWidth + PAD;
          const innerW = Math.max(0, width - left - PAD * 2);
          const innerH = Math.max(0, height - TICK_BAND - PAD);
          const band = scaleBand<string>().domain(categories.map((_, i) => String(i))).range([0, innerH]).paddingInner(0.2).paddingOuter(0.1);
          const group = scaleBand<string>().domain(visible.map((s) => s.key)).range([0, band.bandwidth()]).padding(0.05);
          const x = valueScale.copy().range([0, innerW]);
          const ticks = x.ticks(Math.max(2, Math.floor(innerW / 80)));

          return (
            <svg className="bds-chart__svg" width={width} height={height} onPointerLeave={() => setTooltip(null)} role="img" aria-label={`${name}, bar chart of ${data.length} categories`}>
              <g transform={`translate(${left},${PAD})`}>
                {ticks.map((t) => (
                  <g key={t}>
                    <line className="bds-chart__grid" x1={x(t)} x2={x(t)} y1={0} y2={innerH} />
                    <text className="bds-chart__tick" x={x(t)} y={innerH + 16} textAnchor="middle">
                      {valueFormatter(t)}
                    </text>
                  </g>
                ))}
                {categories.map((c, i) => (
                  <text key={i} className="bds-chart__tick" x={-PAD} y={(band(String(i)) ?? 0) + band.bandwidth() / 2} textAnchor="end" dominantBaseline="middle">
                    {truncateLabel(c, labelWidth)}
                  </text>
                ))}
                {visible.map((s) => (
                  <g key={s.key} data-chart-color={s.color}>
                    {data.map((d, i) => {
                      const seg = stacked ? segmentsFor(d).find((g) => g.key === s.key) : undefined;
                      const v = readValue(d, s.key) ?? 0;
                      const a = seg ? seg.start : 0;
                      const b = seg ? seg.end : v;
                      return (
                        <rect
                          key={i}
                          className="bds-chart__bar"
                          x={Math.min(x(a), x(b))}
                          y={(band(String(i)) ?? 0) + (stacked ? 0 : group(s.key) ?? 0)}
                          width={Math.abs(x(b) - x(a))}
                          height={stacked ? band.bandwidth() : group.bandwidth()}
                        />
                      );
                    })}
                  </g>
                ))}
                <line className="bds-chart__axis" x1={x(0)} x2={x(0)} y1={0} y2={innerH} />
                {categories.map((_, i) => {
                  const top = band(String(i)) ?? 0;
                  const maxV = maxFor(data[i]);
                  return (
                    <rect
                      key={i}
                      className="bds-chart__hit"
                      x={0}
                      y={top}
                      width={innerW}
                      height={band.bandwidth()}
                      onPointerEnter={() =>
                        setTooltip({ x: left + x(maxV), y: PAD + top, content: tooltipFor(i) })
                      }
                    />
                  );
                })}
              </g>
            </svg>
          );
        }

        const y = valueScale.copy().range([Math.max(0, height - TICK_BAND - PAD), 0]);
        const innerH = Math.max(0, height - TICK_BAND - PAD);
        const ticks = y.ticks(Math.max(2, Math.floor(innerH / 48)));
        const left = Math.max(0, ...ticks.map((t) => estimateLabelWidth(valueFormatter(t)))) + PAD;
        const innerW = Math.max(0, width - left - PAD);
        const band = scaleBand<string>().domain(categories.map((_, i) => String(i))).range([0, innerW]).paddingInner(0.2).paddingOuter(0.1);
        const group = scaleBand<string>().domain(visible.map((s) => s.key)).range([0, band.bandwidth()]).padding(0.05);
        const widest = Math.max(0, ...categories.map(estimateLabelWidth));
        const labelEvery = Math.max(1, Math.ceil((widest + PAD) / Math.max(1, band.step())));
        const labelMax = band.step() * labelEvery - PAD;

        return (
          <svg className="bds-chart__svg" width={width} height={height} onPointerLeave={() => setTooltip(null)} role="img" aria-label={`${name}, column chart of ${data.length} categories`}>
            <g transform={`translate(${left},${PAD})`}>
              {ticks.map((t) => (
                <g key={t}>
                  <line className="bds-chart__grid" x1={0} x2={innerW} y1={y(t)} y2={y(t)} />
                  <text className="bds-chart__tick" x={-PAD} y={y(t)} textAnchor="end" dominantBaseline="middle">
                    {valueFormatter(t)}
                  </text>
                </g>
              ))}
              {visible.map((s) => (
                <g key={s.key} data-chart-color={s.color}>
                  {data.map((d, i) => {
                    const seg = stacked ? segmentsFor(d).find((g) => g.key === s.key) : undefined;
                    const v = readValue(d, s.key) ?? 0;
                    const a = seg ? seg.start : 0;
                    const b = seg ? seg.end : v;
                    return (
                      <rect
                        key={i}
                        className="bds-chart__bar"
                        x={(band(String(i)) ?? 0) + (stacked ? 0 : group(s.key) ?? 0)}
                        y={Math.min(y(a), y(b))}
                        width={stacked ? band.bandwidth() : group.bandwidth()}
                        height={Math.abs(y(b) - y(a))}
                      />
                    );
                  })}
                </g>
              ))}
              <line className="bds-chart__axis" x1={0} x2={innerW} y1={y(0)} y2={y(0)} />
              {categories.map((c, i) =>
                i % labelEvery === 0 ? (
                  <text key={i} className="bds-chart__tick" x={(band(String(i)) ?? 0) + band.bandwidth() / 2} y={innerH + 16} textAnchor="middle">
                    {truncateLabel(c, labelMax)}
                  </text>
                ) : null,
              )}
              {categories.map((_, i) => {
                const start = band(String(i)) ?? 0;
                const maxV = maxFor(data[i]);
                return (
                  <rect
                    key={i}
                    className="bds-chart__hit"
                    x={start}
                    y={0}
                    width={band.bandwidth()}
                    height={innerH}
                    onPointerEnter={() =>
                      setTooltip({ x: left + start + band.bandwidth() / 2, y: PAD + y(maxV), content: tooltipFor(i) })
                    }
                  />
                );
              })}
            </g>
          </svg>
        );
      }}
    </ChartFrame>
  );
}

export default BarChart;
