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
