import { type ReactNode, useMemo, useState } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../Table';
import { bdsClass } from '../../utils';
import {
  canHideSeries,
  estimateLabelWidth,
  resolveSeriesColors,
  shouldShowLegend,
  toggleSeries,
  type ChartColor,
  type ChartSeries,
  type ResolvedChartSeries,
} from './chartTypes';

/* Internal building blocks shared by the framed charts. Not exported from the
   package index — consumers compose `BarChart` / `LineChart` / `DonutChart`,
   which pass these to `ChartFrame`'s `legend` and `table` slots. */

export function ChartSwatch({ color, off = false }: { color: ChartColor; off?: boolean }) {
  return (
    <span
      className={bdsClass('bds-chart__swatch', off && 'bds-chart__swatch--hidden')}
      data-chart-color={color}
      aria-hidden="true"
    />
  );
}

export interface ChartLegendItem {
  key: string;
  label: string;
  color: ChartColor;
  /** Trailing text — a donut slice's value and share. */
  detail?: string;
}

export interface ChartLegendProps {
  items: ChartLegendItem[];
  /** Keys of hidden series. Only read when `onToggle` is set. */
  hidden?: readonly string[];
  /**
   * When set, each item is a toggle button (`aria-pressed`). The toggle for the
   * last visible series is disabled, so a chart never shows zero series.
   */
  onToggle?: (key: string) => void;
}

/**
 * Series legend. Renders nothing for a single item — a single series is named
 * by the chart title (ADR-050 § 3).
 */
export function ChartLegend({ items, hidden = [], onToggle }: ChartLegendProps) {
  if (!shouldShowLegend(items.length)) return null;
  const keys = items.map((item) => item.key);

  return (
    <ul className="bds-chart__legend" aria-label="Series">
      {items.map((item) => {
        const isHidden = onToggle ? hidden.includes(item.key) : false;
        const content = (
          <>
            <ChartSwatch color={item.color} off={isHidden} />
            <span className="bds-chart__legend-label">{item.label}</span>
            {item.detail && <span className="bds-chart__legend-detail">{item.detail}</span>}
          </>
        );

        return (
          <li key={item.key} className="bds-chart__legend-item">
            {onToggle ? (
              <button
                type="button"
                className="bds-chart__legend-toggle"
                aria-pressed={!isHidden}
                disabled={!isHidden && !canHideSeries(hidden, item.key, keys)}
                onClick={() => onToggle(item.key)}
              >
                {content}
              </button>
            ) : (
              <span className="bds-chart__legend-static">{content}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export interface ChartDataTableColumn {
  key: string;
  label: string;
  /** Right-align numeric columns. */
  numeric?: boolean;
}

export interface ChartDataTableProps {
  /** Accessible name — usually "<chart title> data". */
  label: string;
  columns: ChartDataTableColumn[];
  rows: Array<Record<string, ReactNode>>;
}

/** The data-table alternative every chart offers (ADR-050 § 3) — a real `Table`. */
export function ChartDataTable({ label, columns, rows }: ChartDataTableProps) {
  return (
    <Table aria-label={label} scrollable headerBackground="primary" headerBorder>
      <TableHeader>
        <TableRow>
          {columns.map((col) => (
            <TableHead key={col.key} scope="col" className={col.numeric ? 'bds-chart__cell--align-end' : undefined}>
              {col.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, i) => (
          <TableRow key={i}>
            {columns.map((col) => (
              <TableCell key={col.key} className={col.numeric ? 'bds-chart__cell--align-end' : undefined}>
                {row[col.key]}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export interface ChartTooltipRow {
  key: string;
  label: string;
  color: ChartColor;
  value: string;
}

/** Tooltip body — a heading line and one swatch + label + value row per series. */
export function ChartTooltipContent({ title, rows }: { title: string; rows: ChartTooltipRow[] }) {
  return (
    <>
      <span className="bds-chart__tooltip-title">{title}</span>
      {rows.map((row) => (
        <span key={row.key} className="bds-chart__tooltip-row">
          <ChartSwatch color={row.color} />
          <span>{row.label}</span>
          <span className="bds-chart__tooltip-value">{row.value}</span>
        </span>
      ))}
    </>
  );
}

/** Text for a `Table` / `aria-label` when the title is not a plain string. */
export function titleText(title: ReactNode, fallback = 'Chart'): string {
  return typeof title === 'string' || typeof title === 'number' ? String(title) : fallback;
}

/** Shorten a label to `maxWidth` px (estimated), ending in an ellipsis. */
export function truncateLabel(text: string, maxWidth: number): string {
  if (estimateLabelWidth(text) <= maxWidth) return text;
  const chars = Math.max(1, Math.floor(maxWidth / estimateLabelWidth('m')) - 1);
  return `${text.slice(0, chars)}…`;
}

/**
 * Series colour + legend-toggle state shared by `BarChart` and `LineChart`.
 * Hiding goes through `toggleSeries`, so the last visible series cannot be hidden.
 */
export function useSeriesToggle(series: ChartSeries[]) {
  const resolved = useMemo(() => resolveSeriesColors(series), [series]);
  const [hidden, setHidden] = useState<string[]>([]);
  const keys = resolved.map((s) => s.key);
  // Drop stale keys if `series` changes under us, and never let it reach zero visible.
  const liveHidden = hidden.filter((k) => keys.includes(k));
  const visible = resolved.filter((s) => !liveHidden.includes(s.key));
  const shown: ResolvedChartSeries[] = visible.length > 0 ? visible : resolved;

  const legend = (
    <ChartLegend
      items={resolved.map(({ key, label, color }) => ({ key, label, color }))}
      hidden={liveHidden}
      onToggle={(key) => setHidden((current) => toggleSeries(current.filter((k) => keys.includes(k)), key, keys))}
    />
  );

  return { resolved, visible: shown, legend };
}
