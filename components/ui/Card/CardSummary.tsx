import { type HTMLAttributes, type CSSProperties } from 'react';

/**
 * CardSummary type variants
 */
export type CardSummaryType = 'numeric' | 'price';

/**
 * Text link configuration
 */
export interface CardSummaryTextLink {
  /** Link label text */
  label: string;
  /** Optional href (renders as <a>) */
  href?: string;
  /** Optional click handler (renders as <button> if no href) */
  onClick?: () => void;
}

/**
 * CardSummary component props
 */
export interface CardSummaryProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Label text displayed above the value */
  label: string;
  /** The display value — pass a formatted string or number */
  value: string | number;
  /** Type variant: numeric displays as-is, price formats as currency */
  type?: CardSummaryType;
  /** Optional text link in the top-right corner */
  textLink?: CardSummaryTextLink;
}

/**
 * Format value based on type
 */
function formatValue(value: string | number, type: CardSummaryType): string {
  if (typeof value === 'string') return value;
  if (type === 'price') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  }
  return value.toLocaleString();
}

/**
 * Container styles
 *
 * Token reference (from brik-bds.webflow.css):
 * - --_color---surface--primary (card background)
 * - --_color---border--primary (card border color)
 * - --_border-width---lg = 1px (visible border)
 */
const containerStyles: CSSProperties = {
  backgroundColor: 'var(--_color---surface--primary)',
  border: 'var(--_border-width---lg) solid var(--_color---border--primary)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  justifyContent: 'center',
};

/**
 * Inner padding wrapper
 *
 * Token reference (from brik-bds.webflow.css):
 * - --_space---lg = 16px (inner padding, Base mode)
 * - --_space---gap--md = 8px (gap between content and link)
 */
const innerStyles: CSSProperties = {
  display: 'flex',
  gap: 'var(--_space---gap--md)',
  alignItems: 'flex-start',
  padding: 'var(--_space---lg)',
};

/**
 * Label styles — Figma: body/lg
 *
 * Token reference (from brik-bds.webflow.css):
 * - --_typography---font-family--body (theme-aware body font)
 * - --_typography---body--lg = font-size--200 = 18px
 * - --_color---text--secondary
 */
const labelStyles: CSSProperties = {
  fontFamily: 'var(--_typography---font-family--body)',
  fontSize: 'var(--_typography---body--lg)',
  color: 'var(--_color---text--secondary)',
  lineHeight: 1.5,
  margin: 0,
};

/**
 * Value styles — Figma: heading/xxl (font-size/900 = 40.5px)
 *
 * NOTE: Figma names this "heading/xxl" but the Webflow CSS token is
 * --_typography---heading--x-large (both = font-size--900 = 40.5px).
 * This is a known naming mismatch between Figma and Webflow tokens.
 *
 * Token reference (from brik-bds.webflow.css):
 * - --_typography---font-family--heading (theme-aware heading font)
 * - --_typography---heading--x-large = font-size--900 = 40.5px
 * - --font-weight--bold = 700
 * - --_color---text--primary
 */
const valueStyles: CSSProperties = {
  fontFamily: 'var(--_typography---font-family--heading)',
  fontSize: 'var(--_typography---heading--x-large)',
  fontWeight: 'var(--font-weight--bold)' as unknown as number,
  color: 'var(--_color---text--primary)',
  lineHeight: 1.1,
  margin: 0,
};

/**
 * Text link styles — Figma: label/sm
 *
 * Token reference (from brik-bds.webflow.css):
 * - --_typography---font-family--label (theme-aware label font)
 * - --_typography---label--sm = font-size--75 = 14px
 * - --font-weight--semi-bold = 600
 * - --_color---text--brand (theme-aware accent color)
 */
const textLinkStyles: CSSProperties = {
  fontFamily: 'var(--_typography---font-family--label)',
  fontSize: 'var(--_typography---label--sm)',
  fontWeight: 'var(--font-weight--semi-bold)' as unknown as number,
  color: 'var(--_color---text--brand)',
  lineHeight: 1.1,
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  cursor: 'pointer',
  background: 'none',
  border: 'none',
  padding: 0,
  textAlign: 'center' as const,
};

/**
 * CardSummary — compact metric/stat card with label, large value, and optional text link.
 *
 * Two type variants:
 * - `numeric` — displays a plain number (default)
 * - `price` — formats the value as currency (USD)
 *
 * The text link can be shown or hidden via the `textLink` prop.
 *
 * @example
 * ```tsx
 * <CardSummary label="Total" value={42} />
 * <CardSummary label="Amount Due" value={150.5} type="price" textLink={{ label: "View Details", href: "/billing" }} />
 * ```
 */
export function CardSummary({
  label,
  value,
  type = 'numeric',
  textLink,
  className = '',
  style,
  ...props
}: CardSummaryProps) {
  const formatted = formatValue(value, type);

  return (
    <div
      className={className || undefined}
      style={{ ...containerStyles, ...style }}
      {...props}
    >
      <div style={innerStyles}>
        {/* Left: label + value */}
        <div style={{ flex: '1 0 0', display: 'flex', flexDirection: 'column', gap: 'var(--_space---gap--sm)', minWidth: 0 }}>
          <p style={labelStyles}>{label}</p>
          <p style={valueStyles}>{formatted}</p>
        </div>

        {/* Right: optional text link */}
        {textLink && (
          <div style={{ flex: '1 0 0', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: 0 }}>
            {textLink.href ? (
              <a href={textLink.href} style={textLinkStyles} onClick={textLink.onClick}>
                {textLink.label}
              </a>
            ) : (
              <button type="button" style={textLinkStyles} onClick={textLink.onClick}>
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
