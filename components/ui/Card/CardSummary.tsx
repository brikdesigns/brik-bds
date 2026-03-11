import { type HTMLAttributes, type CSSProperties } from 'react';
import { bdsClass } from '../../utils';

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
 * - --surface-primary (card background)
 * - --border-muted (subtle card border)
 * - --border-width-md = 1px (visible border)
 */
const containerStyles: CSSProperties = {
  backgroundColor: 'var(--surface-primary)',
  border: 'var(--border-width-md) solid var(--border-muted)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  justifyContent: 'center',
};

/**
 * Inner padding wrapper
 *
 * Token reference (from brik-bds.webflow.css):
 * - --padding-lg = 16px (inner padding, Base mode)
 * - --gap-md = 8px (gap between content and link)
 */
const innerStyles: CSSProperties = {
  display: 'flex',
  gap: 'var(--gap-md)',
  alignItems: 'flex-start',
  padding: 'var(--padding-lg)',
};

/**
 * Label styles — Figma: body/lg
 *
 * Token reference (from brik-bds.webflow.css):
 * - --font-family-body (theme-aware body font)
 * - --body-lg = font-size--200 = 18px
 * - --text-secondary
 */
const labelStyles: CSSProperties = {
  fontFamily: 'var(--font-family-body)',
  fontSize: 'var(--body-lg)',
  color: 'var(--text-secondary)',
  lineHeight: 'var(--font-line-height-normal)',
  margin: 0,
};

/**
 * Value styles — Figma: heading/xxl (font-size/900 = 40.5px)
 *
 * NOTE: Figma names this "heading/xxl" but the Webflow CSS token is
 * --heading-xl (both = font-size--900 = 40.5px).
 * This is a known naming mismatch between Figma and Webflow tokens.
 *
 * Token reference (from brik-bds.webflow.css):
 * - --font-family-heading (theme-aware heading font)
 * - --heading-xl = font-size--900 = 40.5px
 * - --font-weight-bold = 700
 * - --text-primary
 */
const valueStyles: CSSProperties = {
  fontFamily: 'var(--font-family-heading)',
  fontSize: 'var(--heading-xl)',
  fontWeight: 'var(--font-weight-bold)' as unknown as number,
  color: 'var(--text-primary)',
  lineHeight: 'var(--font-line-height-tight)',
  margin: 0,
};

/**
 * Text link styles — Figma: label/sm
 *
 * Token reference (from brik-bds.webflow.css):
 * - --font-family-label (theme-aware label font)
 * - --label-sm = font-size--75 = 14px
 * - --font-weight-semi-bold = 600
 * - --text-brand-primary (theme-aware accent color)
 */
const textLinkStyles: CSSProperties = {
  fontFamily: 'var(--font-family-label)',
  fontSize: 'var(--label-sm)',
  fontWeight: 'var(--font-weight-semi-bold)' as unknown as number,
  color: 'var(--text-brand-primary)',
  lineHeight: 'var(--font-line-height-tight)',
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
      className={bdsClass('bds-card-summary', className)}
      style={{ ...containerStyles, ...style }}
      {...props}
    >
      <div style={innerStyles}>
        {/* Left: label + value */}
        <div style={{ flex: '1 0 0', display: 'flex', flexDirection: 'column', gap: 'var(--gap-sm)', minWidth: 0 }}>
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
