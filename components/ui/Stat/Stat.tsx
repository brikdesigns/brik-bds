import { type HTMLAttributes, type ReactNode, type ElementType } from 'react';
import { bdsClass } from '../../utils';
import './Stat.css';

/** Which slot reads first. DOM order follows visual order. */
export type StatOrder = 'value-first' | 'label-first';
/** Value size — maps to the `--heading-{size}` scale. */
export type StatSize = 'lg' | 'xl' | '2xl';

export interface StatProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** The figure — `"24"`, `"98%"`, `"$1.2M"`. */
  value: ReactNode;
  /** What the figure counts — `"Years in practice"`. */
  label: ReactNode;
  /** Optional supporting line under the pair — a trend, a period, a source. */
  detail?: ReactNode;
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
 * @summary A figure and what it counts — value, label, optional detail.
 */
export function Stat({
  value,
  label,
  detail,
  order = 'value-first',
  size = 'xl',
  onColor = false,
  as: Element = 'div',
  className,
  ...props
}: StatProps) {
  const valueNode = <div className="bds-stat__value">{value}</div>;
  const labelNode = <div className="bds-stat__label">{label}</div>;

  return (
    <Element
      className={bdsClass(
        'bds-stat',
        `bds-stat--size-${size}`,
        onColor && 'bds-stat--on-color',
        className,
      )}
      {...props}
    >
      {order === 'label-first' ? labelNode : valueNode}
      {order === 'label-first' ? valueNode : labelNode}
      {detail != null && <div className="bds-stat__detail">{detail}</div>}
    </Element>
  );
}

export default Stat;
