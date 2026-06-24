import { type HTMLAttributes } from 'react';
import { bdsClass } from '../../utils';
import { ServiceTag } from '../ServiceTag/ServiceTag';
import { type ServiceLine } from '../ServiceTag/service-config';
import './ProductSummaryCard.css';

export interface ProductSummaryCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Parent service line — drives the leading `ServiceTag` colour + glyph. */
  serviceLine: ServiceLine;
  /** Specific service/offering name used to resolve the `ServiceTag` glyph. */
  serviceName?: string;
  /** Caption above the value, e.g. "Interested in" or "Selected plan". */
  label: string;
  /** The offering / plan name, e.g. "Standard Logo Design". */
  value: string;
  /** Price, e.g. "$650". Rendered below the value as secondary text. */
  price?: string;
  /** Billing frequency, e.g. "one time" or "monthly". Joined to price with a `•`. */
  frequency?: string;
}

/**
 * ProductSummaryCard — compact summary of a selected product/service: a leading
 * `ServiceTag` beside a stacked label → value → price • frequency block.
 *
 * Used in lead-capture flows to echo the offering or plan a visitor clicked
 * through on. The label/value pair carries the selection; price + frequency are
 * secondary supporting detail.
 *
 * @summary Selected product/service summary — ServiceTag + label/value + price
 */
export function ProductSummaryCard({
  serviceLine,
  serviceName,
  label,
  value,
  price,
  frequency,
  className,
  style,
  ...props
}: ProductSummaryCardProps) {
  // Join only the parts that exist so a missing price or frequency never leaves
  // a dangling separator.
  const detail = [price, frequency].filter(Boolean).join(' • ');

  return (
    <div className={bdsClass('bds-product-summary-card', className)} style={style} {...props}>
      <ServiceTag
        category={serviceLine}
        variant="icon"
        size="lg"
        serviceName={serviceName}
        className="bds-product-summary-card__icon"
      />
      <div className="bds-product-summary-card__content">
        <span className="bds-product-summary-card__label">{label}</span>
        <span className="bds-product-summary-card__value">{value}</span>
        {detail && <span className="bds-product-summary-card__description">{detail}</span>}
      </div>
    </div>
  );
}

export default ProductSummaryCard;
