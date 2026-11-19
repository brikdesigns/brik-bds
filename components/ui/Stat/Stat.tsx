import { type HTMLAttributes, type ReactNode, type ElementType } from 'react';
import { bdsClass } from '../../utils';
import { Icon } from '../Icon';
import './Stat.css';

/** Which slot reads first. DOM order follows visual order. */
export type StatOrder = 'value-first' | 'label-first';
/** Value size — maps to the `--heading-{size}` scale. */
export type StatSize = 'lg' | 'xl' | '2xl';

/** Direction of a `trend` — picks the arrow and the valence colour. */
export type StatTrendDirection = 'up' | 'down' | 'flat';

export interface StatTrend {
  /** The change — `"+12%"`, `"3 fewer than last month"`. Pre-formatted. */
  delta: ReactNode;
  direction: StatTrendDirection;
}

const TREND_ICON: Record<StatTrendDirection, string> = {
  up: 'ph:arrow-up',
  down: 'ph:arrow-down',
  flat: 'ph:arrow-right',
};

/** Direction → valence class on the trend (`tone` axis, ADR-033). */
const TREND_TONE: Record<StatTrendDirection, string> = {
  up: 'positive',
  down: 'negative',
  flat: 'neutral',
};

export interface StatProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** The figure — `"24"`, `"98%"`, `"$1.2M"`. */
  value: ReactNode;
  /** What the figure counts — `"Years in practice"`. */
  label: ReactNode;
  /** Optional supporting line under the pair — a trend, a period, a source. */
  detail?: ReactNode;
  /** Change against a prior period — an arrow plus the pre-formatted delta, beside `meta`. */
  trend?: StatTrend;
  /** A Badge (or icon) reading the metric's state — `<Badge status="positive">On track</Badge>`. */
  meta?: ReactNode;
  /** A slot under the figure for a ProgressBar or Meter. A time series belongs in a chart, not here. */
  supplementary?: ReactNode;
  /** Context for the figure — clamped to two lines. */
  description?: ReactNode;
  /** Which slot reads first. Default `value-first`. */
  order?: StatOrder;
  /** Value size. Default `xl`. */
  size?: StatSize;
  /** Text slots switch to `--text-on-color-dark` for a filled brand/dark surface. */
  onColor?: boolean;
  /** HTML element to render as. Default `div`. */
  as?: ElementType;
}

/**
 * Stat — a figure and what it counts, as one unbordered Block.
 *
 * The unit inside a stats band, a hero proof strip, or a dashboard row.
 * Stat owns the rhythm between its own slots and nothing else: arrange
 * several with `Grid` or `Cluster`, and wrap one in `Card` when it needs a
 * surface (`Card layout="metric"` is that bordered tile).
 *
 * @example
 * ```tsx
 * <Grid columns={3}>
 *   <Stat value="24" label="Years in practice" />
 *   <Stat value="3,000+" label="Patients served" />
 *   <Stat value="4.9" label="Average rating" detail="From 412 reviews" />
 * </Grid>
 * ```
 *
 * @summary A figure and what it counts — value, label, optional detail, trend, meta, supplementary, description.
 */
export function Stat({
  value,
  label,
  detail,
  trend,
  meta,
  supplementary,
  description,
  order = 'value-first',
  size = 'xl',
  onColor = false,
  as: Element = 'div',
  className,
  ...props
}: StatProps) {
  const valueNode = value != null && <div className="bds-stat__value">{value}</div>;
  const labelNode = label != null && <div className="bds-stat__label">{label}</div>;

  return (
    <Element
      className={bdsClass(
        'bds-stat',
        `bds-stat--size-${size}`,
        onColor && 'bds-stat--emphasis-on-color',
        className,
      )}
      {...props}
    >
      {order === 'label-first' ? labelNode : valueNode}
      {order === 'label-first' ? valueNode : labelNode}
      {detail != null && <div className="bds-stat__detail">{detail}</div>}
      {(trend != null || meta != null) && (
        <div className="bds-stat__meta">
          {meta}
          {trend != null && (
            <span className={bdsClass('bds-stat__trend', `bds-stat__trend--tone-${TREND_TONE[trend.direction]}`)}>
              <Icon icon={TREND_ICON[trend.direction]} aria-hidden="true" />
              {trend.delta}
            </span>
          )}
        </div>
      )}
      {supplementary != null && <div className="bds-stat__supplementary">{supplementary}</div>}
      {description != null && <div className="bds-stat__description">{description}</div>}
    </Element>
  );
}

export default Stat;
