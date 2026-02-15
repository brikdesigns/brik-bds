import { type HTMLAttributes, type ReactNode, type CSSProperties } from 'react';

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
 * Tab item
 */
export interface TabItem {
  /** Tab label */
  label: string;
  /** Whether this tab is currently active */
  active?: boolean;
  /** Click handler */
  onClick?: () => void;
}

/**
 * Metadata key-value item
 */
export interface MetadataItem {
  /** Metadata label */
  label: string;
  /** Metadata value — string or ReactNode (e.g. badge + text) */
  value: ReactNode;
}

/**
 * PageHeader component props
 */
export interface PageHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /** Page title (heading) */
  title: string;
  /** Optional subtitle/description beneath title */
  subtitle?: string;
  /** Breadcrumb navigation trail */
  breadcrumbs?: BreadcrumbItem[];
  /** Action buttons rendered on the right */
  actions?: ReactNode;
  /** Tab bar items — renders horizontal tab navigation */
  tabs?: TabItem[];
  /** Metadata key-value pairs — renders below title with border separator */
  metadata?: MetadataItem[];
}

/**
 * Container styles
 *
 * Figma spec: flex column, gap 24px, px 80px, py padding/md (24px)
 *
 * Token reference:
 * - --_space---gap--lg = 24px (gap between sections)
 * - --_space---xl = 24px (vertical padding)
 */
const containerStyles: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--_space---gap--lg)',
  alignItems: 'flex-start',
  justifyContent: 'center',
  padding: 'var(--_space---xl) 80px',
  width: '100%',
};

/**
 * Breadcrumb styles
 *
 * Token reference:
 * - --_typography---font-family--label (label font)
 * - --_typography---label--sm = 14px
 * - --_color---text--brand (active breadcrumb link)
 * - --_color---text--muted (separator + current page)
 * - --_space---gap--md = 16px (gap between items)
 */
const breadcrumbWrapperStyles: CSSProperties = {
  display: 'flex',
  gap: 'var(--_space---gap--md)',
  alignItems: 'center',
};

const breadcrumbLinkStyles: CSSProperties = {
  fontFamily: 'var(--_typography---font-family--label)',
  fontSize: 'var(--_typography---label--sm)',
  fontWeight: 'var(--font-weight--semi-bold)' as unknown as number,
  lineHeight: 1,
  color: 'var(--_color---text--brand)',
  textDecoration: 'none',
  cursor: 'pointer',
};

const breadcrumbCurrentStyles: CSSProperties = {
  ...breadcrumbLinkStyles,
  color: 'var(--_color---text--muted)',
  cursor: 'default',
};

const breadcrumbSeparatorStyles: CSSProperties = {
  fontFamily: 'var(--_typography---font-family--label)',
  fontSize: 'var(--_typography---label--md-base)',
  color: 'var(--_color---text--muted)',
  lineHeight: 1,
  padding: '0 var(--_space---tiny)',
};

/**
 * Inner padding (title row)
 *
 * Figma spec: flex row, gap 8px, title area (flex 1) + buttons (right)
 */
const innerPaddingStyles: CSSProperties = {
  display: 'flex',
  gap: 'var(--_space---gap--sm)',
  alignItems: 'flex-start',
  width: '100%',
};

/**
 * Content wrapper (title + subtitle)
 *
 * Token reference:
 * - --_typography---font-family--heading (heading font)
 * - --_typography---heading--lg = 32px (title)
 * - --_typography---font-family--body (body font)
 * - --_typography---body--lg = 18px (subtitle)
 * - --_color---text--inverse (white text — designed for dark backgrounds)
 * - --font-weight--bold = 700
 */
const contentWrapperStyles: CSSProperties = {
  display: 'flex',
  flex: '1 0 0',
  flexDirection: 'column',
  gap: 'var(--_space---gap--sm)',
  alignItems: 'flex-start',
  justifyContent: 'center',
  minWidth: 0,
  color: 'var(--_color---text--inverse)',
};

const titleStyles: CSSProperties = {
  fontFamily: 'var(--_typography---font-family--heading)',
  fontSize: 'var(--_typography---heading--lg)',
  fontWeight: 'var(--font-weight--bold)' as unknown as number,
  lineHeight: 1.1,
  margin: 0,
};

const subtitleStyles: CSSProperties = {
  fontFamily: 'var(--_typography---font-family--body)',
  fontSize: 'var(--_typography---body--lg)',
  fontWeight: 400,
  lineHeight: 1.5,
  margin: 0,
};

/**
 * Button wrapper
 */
const buttonWrapperStyles: CSSProperties = {
  display: 'flex',
  gap: 'var(--_space---gap--sm)',
  alignItems: 'flex-start',
  justifyContent: 'flex-end',
  flexShrink: 0,
};

/**
 * Tab bar styles
 *
 * Token reference:
 * - --_typography---font-family--label (label font)
 * - --_typography---label--md-base = 16px
 * - --_color---text--brand (active tab)
 * - --_color---text--secondary (inactive tab)
 * - --_space---gap--lg = 24px (gap between tabs)
 */
const tabBarStyles: CSSProperties = {
  display: 'flex',
  gap: 'var(--_space---gap--lg)',
  alignItems: 'center',
  width: '100%',
};

const tabBaseStyles: CSSProperties = {
  fontFamily: 'var(--_typography---font-family--label)',
  fontSize: 'var(--_typography---label--md-base)',
  fontWeight: 'var(--font-weight--semi-bold)' as unknown as number,
  lineHeight: 1,
  textAlign: 'center',
  cursor: 'pointer',
  background: 'none',
  border: 'none',
  padding: 0,
};

const tabActiveStyles: CSSProperties = {
  ...tabBaseStyles,
  color: 'var(--_color---text--brand)',
};

const tabInactiveStyles: CSSProperties = {
  ...tabBaseStyles,
  color: 'var(--_color---text--secondary)',
};

/**
 * Metadata styles
 *
 * Token reference:
 * - --_color---border--secondary (top border)
 * - --_space---xl = 24px (padding-top)
 * - --_space---gap--sm = 8px (label-value gap)
 * - --_typography---font-family--label (label font)
 * - --_typography---label--sm = 14px (label size)
 * - --_color---text--primary (label color)
 * - --_typography---font-family--body (value font)
 * - --_color---text--accent (value color)
 */
const metadataWrapperStyles: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'center',
  width: '100%',
  borderTop: 'var(--_border-width---sm) solid var(--_color---border--secondary)',
};

const metadataInnerStyles: CSSProperties = {
  display: 'flex',
  gap: 'var(--_space---gap--sm)',
  alignItems: 'flex-start',
  paddingTop: 'var(--_space---xl)',
  width: '100%',
};

const metadataItemStyles: CSSProperties = {
  display: 'flex',
  flex: '1 0 0',
  flexDirection: 'column',
  gap: 'var(--_space---gap--sm)',
  alignItems: 'flex-start',
  justifyContent: 'center',
  minWidth: 0,
};

const metadataLabelStyles: CSSProperties = {
  fontFamily: 'var(--_typography---font-family--label)',
  fontSize: 'var(--_typography---label--sm)',
  fontWeight: 'var(--font-weight--semi-bold)' as unknown as number,
  lineHeight: 1.1,
  color: 'var(--_color---text--primary)',
};

const metadataValueStyles: CSSProperties = {
  fontFamily: 'var(--_typography---font-family--body)',
  fontSize: 'var(--_typography---body--sm)',
  fontWeight: 400,
  lineHeight: 1.5,
  color: 'var(--_color---text--accent)',
};

/**
 * PageHeader - BDS themed page header component
 *
 * Flexible page-level header with breadcrumbs, title/subtitle,
 * action buttons, tab navigation, and metadata sections.
 * Designed for dark backgrounds (title uses inverse/white text).
 *
 * Two primary layouts from Figma:
 * - **Tabbed**: breadcrumbs + title + actions + tab bar
 * - **With metadata**: breadcrumbs + title + actions + metadata key-value grid
 *
 * @example
 * ```tsx
 * // Tabbed variant
 * <PageHeader
 *   title="My Account"
 *   subtitle="Manage your membership plan."
 *   breadcrumbs={[
 *     { label: 'Home', href: '/' },
 *     { label: 'Settings', href: '/settings' },
 *     { label: 'Account' },
 *   ]}
 *   actions={<Button variant="primary">Save</Button>}
 *   tabs={[
 *     { label: 'Overview', active: true },
 *     { label: 'Billing' },
 *     { label: 'Security' },
 *   ]}
 * />
 *
 * // Metadata variant
 * <PageHeader
 *   title="Brand Design"
 *   subtitle="Service details and billing info."
 *   metadata={[
 *     { label: 'Category', value: 'Brand Design' },
 *     { label: 'Billing', value: 'One-time' },
 *   ]}
 * />
 * ```
 */
export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
  tabs,
  metadata,
  className = '',
  style,
  ...props
}: PageHeaderProps) {
  return (
    <div
      className={className || undefined}
      style={{ ...containerStyles, ...style }}
      {...props}
    >
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav style={breadcrumbWrapperStyles} aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, i) => {
            const isLast = i === breadcrumbs.length - 1;
            return (
              <span key={`${crumb.label}-${i}`} style={{ display: 'contents' }}>
                {i > 0 && <span style={breadcrumbSeparatorStyles} aria-hidden="true">/</span>}
                {isLast || !crumb.href ? (
                  <span style={breadcrumbCurrentStyles} aria-current={isLast ? 'page' : undefined}>
                    {crumb.label}
                  </span>
                ) : (
                  <a href={crumb.href} style={breadcrumbLinkStyles}>
                    {crumb.label}
                  </a>
                )}
              </span>
            );
          })}
        </nav>
      )}

      {/* Title row: title/subtitle + actions */}
      <div style={innerPaddingStyles}>
        <div style={contentWrapperStyles}>
          <h1 style={titleStyles}>{title}</h1>
          {subtitle && <p style={subtitleStyles}>{subtitle}</p>}
        </div>
        {actions && <div style={buttonWrapperStyles}>{actions}</div>}
      </div>

      {/* Tab bar */}
      {tabs && tabs.length > 0 && (
        <div style={tabBarStyles} role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              type="button"
              role="tab"
              aria-selected={tab.active || false}
              style={tab.active ? tabActiveStyles : tabInactiveStyles}
              onClick={tab.onClick}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Metadata */}
      {metadata && metadata.length > 0 && (
        <div style={metadataWrapperStyles}>
          <div style={metadataInnerStyles}>
            {metadata.map((item) => (
              <div key={item.label} style={metadataItemStyles}>
                <span style={metadataLabelStyles}>{item.label}</span>
                <span style={metadataValueStyles}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default PageHeader;
