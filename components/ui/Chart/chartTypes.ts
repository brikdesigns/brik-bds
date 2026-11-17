import type { CSSProperties, ReactNode } from 'react';
import type { DataViewEmpty } from '../DataView/DataView';

/**
 * A chart colour — the suffix of one `--bds-chart-*` token (ADR-050 § 1).
 *
 * - `brand` — the one highlighted series, or a single-series chart.
 * - `neutral` — context: the comparison period, "other", a target line.
 * - `categorical-1` … `-6` — peer series, in this fixed order.
 * - `positive` · `warning` · `negative` · `info` — a series that *is* a status.
 */
export type ChartColor =
  | 'brand'
  | 'neutral'
  | 'categorical-1'
  | 'categorical-2'
  | 'categorical-3'
  | 'categorical-4'
  | 'categorical-5'
  | 'categorical-6'
  | 'positive'
  | 'warning'
  | 'negative'
  | 'info';

/** Peer-series colours, in the fixed order ADR-050 § 1 assigns them. */
export const CHART_CATEGORICAL_COLORS: readonly ChartColor[] = [
  'categorical-1',
  'categorical-2',
  'categorical-3',
  'categorical-4',
  'categorical-5',
  'categorical-6',
];

/** One plotted series — a numeric column of `data`. */
export interface ChartSeries {
  /** The `data` field holding this series' values. */
  key: string;
  /** Text name — shown in the legend, the tooltip and the data table. */
  label: string;
  /**
   * Colour token suffix. Defaults to `brand` for a single series and to
   * `categorical-1` … `-6` by position for several. Set it when one data set
   * must keep one colour across every chart on a page.
   */
  color?: ChartColor;
}

/** One row of chart data. Category / x fields are strings, numbers or Dates; series fields are numbers. */
export type ChartDatum = Record<string, string | number | Date | null | undefined>;

/** Formats a numeric value for axis ticks, tooltips and the data table. */
export type ChartValueFormatter = (value: number) => string;

/** A series with its colour resolved. */
export interface ResolvedChartSeries extends ChartSeries {
  color: ChartColor;
}

/** Props every framed chart (`BarChart`, `LineChart`, `DonutChart`) shares with `ChartFrame`. */
export interface ChartBaseProps {
  /** Chart title — rendered as an `<h2>`. A single-series chart is named by it, so it is required. */
  title: ReactNode;
  /** One line under the title — the period, the unit, the source. */
  description?: ReactNode;
  /** Plot height in px, excluding title, legend and axis labels. Default `240`. */
  height?: number;
  /** Render the loading skeleton instead of the chart. */
  loading?: boolean;
  /** When set, render an error `Banner` instead of the chart. */
  error?: string | null;
  /** Title for the error banner. Default `"Couldn't load"`. */
  errorTitle?: string;
  /** Render the empty state. Defaults to `true` when `data` is empty. */
  empty?: boolean;
  /** Empty-state copy. Default `{ title: 'No data to show' }`. */
  emptyState?: DataViewEmpty;
  /** Override the loading skeleton. */
  skeleton?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/** Default empty-state copy for every framed chart. */
export const DEFAULT_CHART_EMPTY: DataViewEmpty = { title: 'No data to show' };

/** Default plot height, px. */
export const DEFAULT_CHART_HEIGHT = 240;

const numberFormat = new Intl.NumberFormat('en-US');

/** Default value formatter — grouped integers / decimals, en-US. */
export const defaultValueFormatter: ChartValueFormatter = (value) => numberFormat.format(value);

/** Text for a category or x value — Dates render as a short date. */
export function formatCategory(value: ChartDatum[string]): string {
  if (value instanceof Date) {
    return value.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  if (value === null || value === undefined) return '';
  return String(value);
}

/** Read a numeric series value from a row; anything non-finite reads as `null` (a gap). */
export function readValue(datum: ChartDatum, key: string): number | null {
  const v = datum[key];
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

/**
 * Give every series a colour: its own `color`, else `brand` when it is the
 * only series, else the categorical colour at its position.
 */
export function resolveSeriesColors(series: ChartSeries[]): ResolvedChartSeries[] {
  return series.map((s, i) => ({
    ...s,
    color:
      s.color ??
      (series.length === 1
        ? 'brand'
        : CHART_CATEGORICAL_COLORS[i % CHART_CATEGORICAL_COLORS.length]),
  }));
}

/** ADR-050 § 3 — a legend renders only with more than one series. */
export function shouldShowLegend(seriesCount: number): boolean {
  return seriesCount > 1;
}

/** Whether `key` may be hidden — false when it is already hidden or is the last visible series. */
export function canHideSeries(hidden: readonly string[], key: string, keys: readonly string[]): boolean {
  if (hidden.includes(key)) return false;
  const visibleCount = keys.filter((k) => !hidden.includes(k)).length;
  return visibleCount > 1;
}

/**
 * Toggle one series in the hidden list. Showing always succeeds; hiding the
 * last visible series is refused and returns `hidden` unchanged (ADR-050 § 3).
 */
export function toggleSeries(hidden: readonly string[], key: string, keys: readonly string[]): string[] {
  if (hidden.includes(key)) return hidden.filter((k) => k !== key);
  if (!canHideSeries(hidden, key, keys)) return [...hidden];
  return [...hidden, key];
}

/** Rough px width of a label at the chart's `body-xs` size — sizes the axis gutters. */
export function estimateLabelWidth(text: string): number {
  return Math.ceil(text.length * 6.5);
}
