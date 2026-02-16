import { type HTMLAttributes, type ReactNode, type CSSProperties } from 'react';

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
 *
 * Composable page header that accepts BDS components as children:
 * - breadcrumbs: pass a <Breadcrumb> component
 * - actions: pass <Button> components
 * - tabs: pass a <TabBar> component
 * - metadata: data array rendered as key-value grid
 */
export interface PageHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /** Page title (heading) */
  title: string;
  /** Optional subtitle/description beneath title */
  subtitle?: string;
  /** Breadcrumb navigation — pass a <Breadcrumb> component */
  breadcrumbs?: ReactNode;
  /** Action buttons — pass <Button> components */
  actions?: ReactNode;
  /** Tab navigation — pass a <TabBar> component */
  tabs?: ReactNode;
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
 * - --_typography---heading--large = font-size-700 = 32px (title)
 * - --_typography---font-family--body (body font)
 * - --_typography---body--lg = font-size-200 = 18px (subtitle)
 * - --font-weight--bold = 700
 *
 * Text color inherits from parent context — no forced color.
 * Place on a dark section and set color: var(--_color---text--inverse)
 * on the parent, or use on a light background with default text color.
 */
const contentWrapperStyles: CSSProperties = {
  display: 'flex',
  flex: '1 0 0',
  flexDirection: 'column',
  gap: 'var(--_space---gap--sm)',
  alignItems: 'flex-start',
  justifyContent: 'center',
  minWidth: 0,
};

const titleStyles: CSSProperties = {
  fontFamily: 'var(--_typography---font-family--heading)',
  fontSize: 'var(--_typography---heading--large)',
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
 * PageHeader — BDS composable page header
 *
 * Flexible page-level header that composes BDS components:
 * - **Breadcrumb** for navigation trail
 * - **Button** for action buttons
 * - **TabBar** for tab navigation
 * - Metadata grid for key-value pairs
 *
 * No background or forced text color — inherits from parent context.
 * Place inside a dark section with appropriate text color, or use on light backgrounds.
 *
 * Two primary layouts from Figma (node 26911-20720):
 * - **Tabbed**: breadcrumbs + title + actions + tab bar
 * - **With metadata**: breadcrumbs + title + actions + metadata grid
 *
 * @example
 * ```tsx
 * import { PageHeader, Breadcrumb, TabBar, Button } from '@brik/bds';
 *
 * <PageHeader
 *   title="My Account"
 *   subtitle="Manage your membership plan."
 *   breadcrumbs={
 *     <Breadcrumb items={[
 *       { label: 'Home', href: '/' },
 *       { label: 'Settings', href: '/settings' },
 *       { label: 'Account' },
 *     ]} />
 *   }
 *   actions={
 *     <>
 *       <Button variant="primary">Save</Button>
 *       <Button variant="secondary">Cancel</Button>
 *     </>
 *   }
 *   tabs={
 *     <TabBar items={[
 *       { label: 'Overview', active: true },
 *       { label: 'Billing' },
 *       { label: 'Security' },
 *     ]} />
 *   }
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
      {/* Breadcrumbs — pass a <Breadcrumb> component */}
      {breadcrumbs}

      {/* Title row: title/subtitle + actions */}
      <div style={innerPaddingStyles}>
        <div style={contentWrapperStyles}>
          <h1 style={titleStyles}>{title}</h1>
          {subtitle && <p style={subtitleStyles}>{subtitle}</p>}
        </div>
        {actions && <div style={buttonWrapperStyles}>{actions}</div>}
      </div>

      {/* Tab bar — pass a <TabBar> component */}
      {tabs}

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
