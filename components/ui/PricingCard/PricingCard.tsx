import { type HTMLAttributes, type ReactNode, type CSSProperties } from 'react';
import { bdsClass } from '../../utils';

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
 * Base card styles
 *
 * Token reference:
 * - --surface-primary (card background)
 * - --border-width-md (border weight)
 * - --border-secondary (border color)
 * - --border-radius-md (card corners)
 * - --padding-lg = 24px (padding)
 * - --gap-lg = 16px (section gap)
 */
const baseCardStyles: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--gap-lg)',
  padding: 'var(--padding-lg)',
  backgroundColor: 'var(--surface-primary)',
  border: 'var(--border-width-md) solid var(--border-secondary)',
  borderRadius: 'var(--border-radius-md)',
  width: '100%',
  minWidth: 0,
  boxSizing: 'border-box',
};

/**
 * Highlighted card overrides
 *
 * Token reference:
 * - --border-width-lg = 1px (visible border weight, was --border-width-md)
 *   Actually using md for a thicker border on highlighted
 * - --border-brand-primary (brand-colored border)
 * - --box-shadow-md (subtle elevation)
 */
const highlightedOverrides: CSSProperties = {
  border: 'var(--border-width-md) solid var(--border-brand-primary)',
  boxShadow: 'var(--box-shadow-md)',
};

/**
 * Title styles
 *
 * Token reference:
 * - --font-family-heading
 * - --heading-sm (font-size/300 = 20px)
 * - --font-weight-bold = 700
 * - --font-line-height-snug = 125%
 * - --text-primary
 */
const titleStyles: CSSProperties = {
  fontFamily: 'var(--font-family-heading)',
  fontSize: 'var(--heading-sm)',
  fontWeight: 'var(--font-weight-bold)' as unknown as number,
  lineHeight: 'var(--font-line-height-snug)',
  color: 'var(--text-primary)',
  margin: 0,
};

/**
 * Price styles
 *
 * Token reference:
 * - --font-family-heading
 * - --heading-xl (font-size/900 — large price display)
 * - --font-weight-bold = 700
 * - --font-line-height-tight = 100%
 * - --text-primary
 */
const priceStyles: CSSProperties = {
  fontFamily: 'var(--font-family-heading)',
  fontSize: 'var(--heading-xl)',
  fontWeight: 'var(--font-weight-bold)' as unknown as number,
  lineHeight: 'var(--font-line-height-tight)',
  color: 'var(--text-primary)',
  margin: 0,
};

/**
 * Period styles (the "/month" part)
 *
 * Token reference:
 * - --body-sm (font-size/75 = 14px)
 * - --font-weight-regular = 400
 * - --text-muted
 */
const periodStyles: CSSProperties = {
  fontFamily: 'var(--font-family-body)',
  fontSize: 'var(--body-sm)',
  fontWeight: 'var(--font-weight-regular)' as unknown as number,
  color: 'var(--text-muted)',
};

/**
 * Description styles
 *
 * Token reference:
 * - --font-family-body
 * - --body-sm (font-size/75 = 14px)
 * - --font-line-height-normal = 150%
 * - --text-secondary
 */
const descriptionStyles: CSSProperties = {
  fontFamily: 'var(--font-family-body)',
  fontSize: 'var(--body-sm)',
  fontWeight: 'var(--font-weight-regular)' as unknown as number,
  lineHeight: 'var(--font-line-height-normal)',
  color: 'var(--text-secondary)',
  margin: 0,
};

/**
 * Features list styles
 *
 * Token reference:
 * - --gap-md = 8px (gap between feature items)
 * - --font-family-body
 * - --body-sm (font-size/75 = 14px)
 * - --font-line-height-normal = 150%
 * - --text-primary
 */
const featuresListStyles: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--gap-md)',
  margin: 0,
  padding: 0,
  listStyle: 'none',
};

const featureItemStyles: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 'var(--gap-md)',
  fontFamily: 'var(--font-family-body)',
  fontSize: 'var(--body-sm)',
  lineHeight: 'var(--font-line-height-normal)',
  color: 'var(--text-primary)',
};

/**
 * Checkmark icon styles
 *
 * Token reference:
 * - --font-family-icon (Font Awesome)
 * - --text-brand-primary (brand color for checkmark)
 */
const checkmarkStyles: CSSProperties = {
  fontFamily: 'var(--font-family-icon)',
  color: 'var(--text-brand-primary)',
  flexShrink: 0,
  lineHeight: 'var(--font-line-height-normal)',
};

/**
 * Action footer styles
 */
const actionStyles: CSSProperties = {
  marginTop: 'auto',
  paddingTop: 'var(--padding-sm)',
};

/**
 * Divider styles between price section and features
 *
 * Token reference:
 * - --border-width-md (line thickness)
 * - --border-muted (subtle separator)
 */
const dividerStyles: CSSProperties = {
  border: 'none',
  borderTop: 'var(--border-width-md) solid var(--border-muted)',
  margin: 0,
};

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
  const combinedStyles: CSSProperties = {
    ...baseCardStyles,
    ...(highlighted ? highlightedOverrides : {}),
    ...style,
  };

  return (
    <div
      className={bdsClass('bds-pricing-card', highlighted && 'bds-pricing-card-highlighted', className)}
      style={combinedStyles}
      {...props}
    >
      {/* Header: badge + title */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)' }}>
        {badge && <div style={{ alignSelf: 'flex-start' }}>{badge}</div>}
        <h3 style={titleStyles}>{title}</h3>
      </div>

      {/* Price block */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--gap-xs)' }}>
        <span style={priceStyles}>{price}</span>
        {period && <span style={periodStyles}>{period}</span>}
      </div>

      {description && <p style={descriptionStyles}>{description}</p>}

      {/* Divider before features */}
      {features && features.length > 0 && <hr style={dividerStyles} />}

      {/* Features list */}
      {features && features.length > 0 && (
        <ul style={featuresListStyles}>
          {features.map((feature) => (
            <li key={feature} style={featureItemStyles}>
              <span style={checkmarkStyles} aria-hidden="true">{'\uF00C'}</span>
              {feature}
            </li>
          ))}
        </ul>
      )}

      {/* Action */}
      {action && <div style={actionStyles}>{action}</div>}
    </div>
  );
}

export default PricingCard;
