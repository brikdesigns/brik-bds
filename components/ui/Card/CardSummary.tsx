import { type HTMLAttributes } from 'react';
import { bdsClass } from '../../utils';
import './CardSummary.css';

export type CardSummaryType = 'numeric' | 'price';

export interface CardSummaryTextLink {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface CardSummaryProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  label: string;
  value: string | number;
  type?: CardSummaryType;
  textLink?: CardSummaryTextLink;
}

function formatValue(value: string | number, type: CardSummaryType): string {
  if (typeof value === 'string') return value;
  if (type === 'price') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  }
  return value.toLocaleString();
}

/**
 * CardSummary — compact metric/stat card with label, large value, and optional text link.
 *
 * @deprecated Use `<Card preset="summary">` instead. Same prop names
 * (`label`, `value`, `type`, `textLink`), same layout, same number
 * formatting (currency for `type="price"`, locale-formatted otherwise).
 * Slated for deletion in a future major version once the 12 portal
 * consumers migrate.
 *
 * Migration:
 * ```tsx
 * // before
 * <CardSummary label="Revenue" value={48250.75} type="price"
 *   textLink={{ label: 'Details', href: '/revenue' }} />
 *
 * // after
 * <Card preset="summary" label="Revenue" value={48250.75} type="price"
 *   textLink={{ label: 'Details', href: '/revenue' }} />
 * ```
 *
 * Tracked under ADR-004 — see docs/adrs/ADR-004-component-bloat-guardrails.md.
 */
export function CardSummary({
  label,
  value,
  type = 'numeric',
  textLink,
  className,
  style,
  ...props
}: CardSummaryProps) {
  const formatted = formatValue(value, type);

  return (
    <div className={bdsClass('bds-card-summary', className)} style={style} {...props}>
      <div className="bds-card-summary__inner">
        <div className="bds-card-summary__content">
          <p className="bds-card-summary__label">{label}</p>
          <p className="bds-card-summary__value">{formatted}</p>
        </div>
        {textLink && (
          <div className="bds-card-summary__link-area">
            {textLink.href ? (
              <a href={textLink.href} className="bds-card-summary__link" onClick={textLink.onClick}>
                {textLink.label}
              </a>
            ) : (
              <button type="button" className="bds-card-summary__link" onClick={textLink.onClick}>
                {textLink.label}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CardSummary;
