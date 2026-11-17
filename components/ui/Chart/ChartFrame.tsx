import { type HTMLAttributes, type ReactNode, useId, useState } from 'react';
import * as RadixPopover from '@radix-ui/react-popover';
import { Button } from '../Button';
import { Skeleton } from '../Skeleton';
import { DataViewShell, type DataViewEmpty } from '../DataView/DataView';
import { useElementWidth } from '../shared/useElementWidth';
import { bdsClass } from '../../utils';
import { DEFAULT_CHART_HEIGHT } from './chartTypes';
import './Chart.css';

/** Where the tooltip points, in px from the plot's top-left corner, and what it says. */
export interface ChartTooltipState {
  x: number;
  y: number;
  content: ReactNode;
}

/** The measured plot box handed to `ChartFrame`'s render function. */
export interface ChartPlotSize {
  width: number;
  height: number;
}

export interface ChartFrameProps
  extends Omit<HTMLAttributes<HTMLElement>, 'title' | 'children'> {
  /** Chart title — rendered as an `<h2>` at `heading-sm`. */
  title: ReactNode;
  /** One line under the title — the period, the unit, the source. */
  description?: ReactNode;
  /** Legend slot — sits between the header and the plot. */
  legend?: ReactNode;
  /** Axis slot — the value axis caption, shown above the plot. */
  yAxisLabel?: ReactNode;
  /** Axis slot — the category / time axis caption, shown under the plot. */
  xAxisLabel?: ReactNode;
  /** Tooltip slot — pointer-only, anchored at `x`/`y` inside the plot. `null` closes it. */
  tooltip?: ChartTooltipState | null;
  /**
   * Data-table alternative (ADR-050 § 3). When set, a "Show data table" button
   * reveals it under the plot. Every chart in the family passes one.
   */
  table?: ReactNode;
  /** Plot height in px. Default `240`. */
  height?: number;
  /** Render the loading skeleton instead of the plot. */
  loading?: boolean;
  /** When set, render an error `Banner` instead of the plot. */
  error?: string | null;
  /** Title for the error banner. Default `"Couldn't load"`. */
  errorTitle?: string;
  /** Render the empty state instead of the plot. */
  empty?: boolean;
  /** Empty-state copy. An object renders `<EmptyState>`; a node renders as-is. */
  emptyState?: DataViewEmpty;
  /** Override the loading skeleton. */
  skeleton?: ReactNode;
  /**
   * Draws the marks. Called with the frame's own measured width (ADR-019) once
   * it is known — nothing is drawn on the server or before the first measure.
   */
  children: (size: ChartPlotSize) => ReactNode;
}

/**
 * ChartFrame — everything in a chart that is not the marks: title, legend,
 * axis captions, tooltip, loading / empty / error states and the data-table
 * alternative. `BarChart`, `LineChart` and `DonutChart` render inside it; use
 * it directly only to build a new chart type.
 *
 * @summary Chart chrome — title, legend, tooltip, states, table
 */
export function ChartFrame({
  title,
  description,
  legend,
  yAxisLabel,
  xAxisLabel,
  tooltip = null,
  table,
  height = DEFAULT_CHART_HEIGHT,
  loading,
  error,
  errorTitle,
  empty,
  emptyState,
  skeleton,
  children,
  className,
  ...props
}: ChartFrameProps) {
  const [bodyRef, width] = useElementWidth<HTMLDivElement>();
  const [showTable, setShowTable] = useState(false);
  const titleId = useId();
  const tableId = useId();
  const hasContent = !error && !loading && !empty;

  return (
    <section className={bdsClass('bds-chart', className)} aria-labelledby={titleId} {...props}>
      <div className="bds-chart__header">
        <div className="bds-chart__heading">
          <h2 id={titleId} className="bds-chart__title">
            {title}
          </h2>
          {description && <p className="bds-chart__description">{description}</p>}
        </div>
        {table && hasContent && (
          <Button
            variant="ghost"
            size="sm"
            aria-expanded={showTable}
            aria-controls={tableId}
            onClick={() => setShowTable((open) => !open)}
          >
            {showTable ? 'Hide data table' : 'Show data table'}
          </Button>
        )}
      </div>

      {hasContent && legend}

      <div ref={bodyRef} className="bds-chart__body">
        <DataViewShell
          loading={loading}
          error={error}
          errorTitle={errorTitle}
          empty={empty}
          emptyState={emptyState}
          skeleton={skeleton}
          defaultSkeleton={<Skeleton variant="rectangular" width="100%" height={height} />}
        >
          {yAxisLabel && <p className="bds-chart__axis-label" data-axis="y">{yAxisLabel}</p>}
          <RadixPopover.Root open={tooltip !== null}>
            <div className="bds-chart__plot" style={{ height }}>
              {width !== null && width > 0 && children({ width, height })}
              <RadixPopover.Anchor asChild>
                <span
                  className="bds-chart__tooltip-anchor"
                  style={tooltip ? { left: tooltip.x, top: tooltip.y } : undefined}
                  aria-hidden="true"
                />
              </RadixPopover.Anchor>
            </div>
            <RadixPopover.Portal>
              <RadixPopover.Content
                className="bds-chart__tooltip"
                side="top"
                sideOffset={8}
                role="tooltip"
                onOpenAutoFocus={(e) => e.preventDefault()}
                onCloseAutoFocus={(e) => e.preventDefault()}
              >
                {tooltip?.content}
              </RadixPopover.Content>
            </RadixPopover.Portal>
          </RadixPopover.Root>
          {xAxisLabel && <p className="bds-chart__axis-label" data-axis="x">{xAxisLabel}</p>}
        </DataViewShell>
      </div>

      {table && hasContent && (
        <div id={tableId} className="bds-chart__table" hidden={!showTable}>
          {table}
        </div>
      )}
    </section>
  );
}

export default ChartFrame;
