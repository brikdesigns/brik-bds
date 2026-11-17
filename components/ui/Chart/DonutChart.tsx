import { useState } from 'react';
import { arc, pie, type PieArcDatum } from 'd3-shape';
import { ChartFrame, type ChartTooltipState } from './ChartFrame';
import { ChartDataTable, ChartLegend, ChartTooltipContent, titleText } from './ChartParts';
import {
  CHART_CATEGORICAL_COLORS,
  DEFAULT_CHART_EMPTY,
  defaultValueFormatter,
  formatCategory,
  readValue,
  type ChartBaseProps,
  type ChartColor,
  type ChartDatum,
  type ChartValueFormatter,
} from './chartTypes';

export interface DonutChartProps extends ChartBaseProps {
  /** One row per slice, in the order they should run clockwise from 12 o'clock. Keep it to 5 or fewer. */
  data: ChartDatum[];
  /** The `data` field naming each slice. */
  categoryKey: string;
  /** The numeric `data` field sizing each slice. */
  valueKey: string;
  /**
   * Colour per category name. Unset categories take `categorical-1` … `-6` by
   * position. Use it for a status split (`positive` / `warning` / `negative`)
   * or to keep one data set's colour across a page.
   */
  colors?: Partial<Record<string, ChartColor>>;
  /** Formats values in the centre, the legend, the tooltip and the data table. */
  valueFormatter?: ChartValueFormatter;
  /** Text under the centre total. Default `"Total"`. */
  centerLabel?: string;
  /** Heads the data table's first column. Default `"Category"`. */
  categoryLabel?: string;
}

interface Slice {
  key: string;
  label: string;
  value: number;
  color: ChartColor;
}

const percentFormat = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 });

/**
 * DonutChart — share of a whole, at 5 categories or fewer. The centre holds
 * the total; the legend names every slice with its value and share.
 *
 * @summary Share of a whole — 5 categories or fewer
 */
export function DonutChart({
  data,
  categoryKey,
  valueKey,
  colors = {},
  valueFormatter = defaultValueFormatter,
  centerLabel = 'Total',
  categoryLabel = 'Category',
  title,
  empty,
  emptyState = DEFAULT_CHART_EMPTY,
  ...frameProps
}: DonutChartProps) {
  const [tooltip, setTooltip] = useState<ChartTooltipState | null>(null);
  const name = titleText(title);

  const slices: Slice[] = data.map((d, i) => {
    const label = formatCategory(d[categoryKey]);
    return {
      key: `${i}-${label}`,
      label,
      value: Math.max(0, readValue(d, valueKey) ?? 0),
      color: colors[label] ?? CHART_CATEGORICAL_COLORS[i % CHART_CATEGORICAL_COLORS.length],
    };
  });
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const share = (v: number) => (total > 0 ? percentFormat.format(v / total) : percentFormat.format(0));

  const legend = (
    <ChartLegend
      items={slices.map((s) => ({
        key: s.key,
        label: s.label,
        color: s.color,
        detail: `${valueFormatter(s.value)} · ${share(s.value)}`,
      }))}
    />
  );

  const table = (
    <ChartDataTable
      label={`${name} data`}
      columns={[
        { key: 'category', label: categoryLabel },
        { key: 'value', label: 'Value', numeric: true },
        { key: 'share', label: 'Share', numeric: true },
      ]}
      rows={slices.map((s) => ({ category: s.label, value: valueFormatter(s.value), share: share(s.value) }))}
    />
  );

  return (
    <ChartFrame
      title={title}
      legend={legend}
      tooltip={tooltip}
      table={table}
      empty={empty ?? (data.length === 0 || total === 0)}
      emptyState={emptyState}
      {...frameProps}
    >
      {({ width, height }) => {
        const radius = Math.max(0, Math.min(width, height) / 2 - 2);
        const cx = width / 2;
        const cy = height / 2;
        const arcs = pie<Slice>()
          .sort(null)
          .value((s) => s.value)(slices);
        const shape = arc<PieArcDatum<Slice>>()
          .innerRadius(radius * 0.62)
          .outerRadius(radius);

        return (
          <svg
            className="bds-chart__svg"
            width={width}
            height={height}
            role="img"
            aria-label={`${name}, donut chart of ${slices.length} categories`}
            onPointerLeave={() => setTooltip(null)}
          >
            <g transform={`translate(${cx},${cy})`}>
              {arcs.map((a) => {
                const [mx, my] = shape.centroid(a);
                return (
                  <g key={a.data.key} data-chart-color={a.data.color}>
                    <path
                      className="bds-chart__slice"
                      d={shape(a) ?? undefined}
                      onPointerEnter={() =>
                        setTooltip({
                          x: cx + mx,
                          y: cy + my,
                          content: (
                            <ChartTooltipContent
                              title={a.data.label}
                              rows={[
                                {
                                  key: a.data.key,
                                  label: share(a.data.value),
                                  color: a.data.color,
                                  value: valueFormatter(a.data.value),
                                },
                              ]}
                            />
                          ),
                        })
                      }
                    />
                  </g>
                );
              })}
              <text className="bds-chart__center-value" textAnchor="middle" dominantBaseline="middle" y={-8}>
                {valueFormatter(total)}
              </text>
              <text className="bds-chart__center-label" textAnchor="middle" dominantBaseline="middle" y={14}>
                {centerLabel}
              </text>
            </g>
          </svg>
        );
      }}
    </ChartFrame>
  );
}

export default DonutChart;
