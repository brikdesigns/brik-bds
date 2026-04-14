import { type HTMLAttributes, type ReactNode } from 'react';
import { Icon } from '@iconify/react';
import { bdsClass } from '../../utils';
import './PricingCard.css';

/**
 * PricingCard component props
 */
export interface PricingCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Plan/tier name (e.g., "Starter", "Professional") */
  title: string;
  /** Price display (e.g., "$49", "Free", "$199") */
  price: string;
  /** Billing period (e.g., "/month", "/year", "one-time") */
  period?: string;
  /** Short description of the plan */
  description?: string;
  /** List of included features */
  features?: string[];
  /** Action element (typically a Button) */
  action?: ReactNode;
  /** Badge above the title (e.g., "Most popular") */
  badge?: ReactNode;
  /** Whether this is the highlighted/recommended plan */
  highlighted?: boolean;
}

/**
 * PricingCard - BDS pricing tier display card
 *
 * Displays a pricing plan with title, price, description, feature list,
 * and action button. Supports a highlighted state for the recommended plan.
 *
 * @example
 * ```tsx
 * <PricingCard
 *   title="Professional"
 *   price="$49"
 *   period="/month"
 *   description="For growing businesses"
 *   features={['Unlimited projects', 'Priority support', 'Custom domain']}
 *   action={<Button variant="primary">Get started</Button>}
 *   highlighted
 * />
 * ```
 */
export function PricingCard({
  title,
  price,
  period,
  description,
  features,
  action,
  badge,
  highlighted = false,
  className = '',
  style,
  ...props
}: PricingCardProps) {
  return (
    <div
      className={bdsClass(
        'bds-pricing-card',
        highlighted && 'bds-pricing-card--highlighted',
        className,
      )}
      style={style}
      {...props}
    >
      {/* Header: badge + title */}
      <div className="bds-pricing-card__header">
        {badge && <div className="bds-pricing-card__badge">{badge}</div>}
        <h3 className="bds-pricing-card__title">{title}</h3>
      </div>

      {/* Price block */}
      <div className="bds-pricing-card__price-block">
        <span className="bds-pricing-card__price">{price}</span>
        {period && <span className="bds-pricing-card__period">{period}</span>}
      </div>

      {description && <p className="bds-pricing-card__description">{description}</p>}

      {/* Divider before features */}
      {features && features.length > 0 && <hr className="bds-pricing-card__divider" />}

      {/* Features list */}
      {features && features.length > 0 && (
        <ul className="bds-pricing-card__features">
          {features.map((feature) => (
            <li key={feature} className="bds-pricing-card__feature">
              <Icon icon="ph:check" className="bds-pricing-card__checkmark" aria-hidden="true" />
              {feature}
            </li>
          ))}
        </ul>
      )}

      {/* Action */}
      {action && <div className="bds-pricing-card__action">{action}</div>}
    </div>
  );
}

export default PricingCard;
