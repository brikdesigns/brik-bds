import { type HTMLAttributes, type CSSProperties } from 'react';
import { bdsClass } from '../../utils';

/**
 * Breadcrumb item
 */
export interface BreadcrumbItem {
  /** Display label */
  label: string;
  /** Link href — omit for current (non-clickable) page */
  href?: string;
}

/**
 * Separator variant
 *
 * Figma reference: node 26432-15231 shows two variants:
 * - slash: "/" character
 * - chevron: "›" right-pointing angle
 */
export type BreadcrumbSeparator = 'slash' | 'chevron';

/**
 * Breadcrumb component props
 */
export interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  /** Breadcrumb trail items — last item renders as current page (muted) */
  items: BreadcrumbItem[];
  /** Separator between items */
  separator?: BreadcrumbSeparator;
}

/**
 * Separator characters
 */
const SEPARATOR_CHARS: Record<BreadcrumbSeparator, string> = {
  slash: '/',
  chevron: '›',
};

/**
 * Wrapper styles
 *
 * Figma spec: auto-layout row, gap/md (8px)
 *
 * Token reference:
 * - --gap-md = 8px (gap between items + separators)
 */
const wrapperStyles: CSSProperties = {
  display: 'flex',
  gap: 'var(--gap-md)',
  alignItems: 'center',
};

/**
 * Breadcrumb link styles
 *
 * Figma spec: font-family/label, font-size/75 (14px), SemiBold, text/brand-primary
 *
 * Token reference:
 * - --font-family-label (label font)
 * - --label-sm = 14px (font-size/75)
 * - --font-weight-semi-bold = 600
 * - --text-brand-primary (active breadcrumb link)
 */
const linkStyles: CSSProperties = {
  fontFamily: 'var(--font-family-label)',
  fontSize: 'var(--label-sm)',
  fontWeight: 'var(--font-weight-semi-bold)' as unknown as number,
  lineHeight: 'var(--font-line-height-tight)',
  color: 'var(--text-brand-primary)',
  textDecoration: 'none',
  textTransform: 'capitalize' as const,
  cursor: 'pointer',
};

/**
 * Current page (last item) styles
 *
 * Figma spec: same as link but text/muted, non-clickable
 *
 * Token reference:
 * - --text-muted (current page color)
 */
const currentStyles: CSSProperties = {
  ...linkStyles,
  color: 'var(--text-muted)',
  cursor: 'default',
};

/**
 * Separator styles
 *
 * Figma spec: font-family/icon, font-size/100 (16px), text/muted, padding/tiny horizontal
 *
 * Token reference:
 * - --font-family-label (separator font)
 * - --label-md = 16px (font-size/100)
 * - --text-muted (separator color)
 * - --padding-tiny = 8px (horizontal padding)
 */
const separatorStyles: CSSProperties = {
  fontFamily: 'var(--font-family-label)',
  fontSize: 'var(--label-md)',
  color: 'var(--text-muted)',
  lineHeight: 'var(--font-line-height-tight)',
  padding: '0 var(--padding-tiny)',
};

/**
 * Breadcrumb — BDS navigation breadcrumb trail
 *
 * Standalone breadcrumb component matching Figma spec (node 26432-15231).
 * Supports slash and chevron separator variants.
 * The last item renders as the current page (muted, non-clickable).
 *
 * Can be used independently or composed inside PageHeader.
 *
 * @example
 * ```tsx
 * <Breadcrumb
 *   items={[
 *     { label: 'Home', href: '/' },
 *     { label: 'Products', href: '/products' },
 *     { label: 'Design System' },
 *   ]}
 *   separator="slash"
 * />
 * ```
 */
export function Breadcrumb({
  items,
  separator = 'slash',
  className = '',
  style,
  ...props
}: BreadcrumbProps) {
  const separatorChar = SEPARATOR_CHARS[separator];

  return (
    <nav
      className={bdsClass('bds-breadcrumb', className)}
      style={{ ...wrapperStyles, ...style }}
      aria-label="Breadcrumb"
      {...props}
    >
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={`${item.label}-${i}`} style={{ display: 'contents' }}>
            {i > 0 && (
              <span style={separatorStyles} aria-hidden="true">
                {separatorChar}
              </span>
            )}
            {isLast || !item.href ? (
              <span
                className="bds-breadcrumb-item"
                style={currentStyles}
                aria-current={isLast ? 'page' : undefined}
              >
                {item.label}
              </span>
            ) : (
              <a href={item.href} className="bds-breadcrumb-link" style={linkStyles}>
                {item.label}
              </a>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export default Breadcrumb;
