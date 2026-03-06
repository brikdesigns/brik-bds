import { type HTMLAttributes, type CSSProperties, useState } from 'react';
import { bdsClass } from '../../utils';

/**
 * Brik service categories
 */
export type ServiceCategory = 'brand' | 'marketing' | 'information' | 'product' | 'service';

/**
 * ServiceBadge size variants
 *
 * Token reference (Base mode):
 * - sm: 20px — inline/table use
 * - md: 28px — default, card/list context
 * - lg: 40px — hero/feature context
 */
export type ServiceBadgeSize = 'sm' | 'md' | 'lg';

/**
 * ServiceBadge display modes
 *
 * - badge: colored square with optional icon (default)
 * - label: small badge + category name text
 */
export type ServiceBadgeMode = 'badge' | 'label';

export interface ServiceBadgeProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Service category */
  category: ServiceCategory;
  /** Display mode */
  mode?: ServiceBadgeMode;
  /** Size variant */
  size?: ServiceBadgeSize;
  /** Optional service name — used to resolve the specific service icon SVG */
  serviceName?: string;
}

/**
 * Category configuration — maps service categories to their color tokens
 * and display labels. Uses semantic service tokens from BDS.
 *
 * Token pattern (webflow-tokens.css):
 * - background: --_color---background--service-{category}
 * - text/icon:  --_color---text--service-{category}
 * - light bg:   --services--{token}-light
 */
export const categoryConfig: Record<ServiceCategory, { token: string; label: string }> = {
  brand: { token: 'yellow', label: 'Brand' },
  marketing: { token: 'green', label: 'Marketing' },
  information: { token: 'blue', label: 'Information' },
  product: { token: 'purple', label: 'Product' },
  service: { token: 'orange', label: 'Back Office' },
};

/**
 * Manual mapping for services with non-standard icon filenames
 */
const serviceIconOverrides: Record<string, string> = {
  'Brand Identity Bundle': 'brand-design',
  'Logo Update': 'brand-logo',
  'Premium Logo Design': 'brand-logo',
  'Standard Logo Design': 'brand-logo',
  'Comprehensive Marketing Audit & Consultation': 'marketing-consulting',
  'Custom Large E-Commerce Web Development and Design': 'marketing-web-design',
  'Custom Large Web Development and Design': 'marketing-web-design',
  'Custom Standard E-Commerce Web Development and Design': 'marketing-web-design',
  'Custom Standard Web Development and Design': 'marketing-web-design',
  'Email Drip Campaign (Up to 6 Emails)': 'marketing-email',
  'Landing Pages': 'marketing-landing-pages',
  'Patient Experience Mapping': 'patient-experience',
  'Social Media Graphic Designs': 'marketing-social-graphics',
  'Swag and Merchandise Design': 'marketing-swag',
  'Website Experience Mapping': 'website-experience',
  'Automated Workflow and AI Integration': 'back-office-automation-ai',
  'CRM Setup and Data Cleanup': 'back-office-crm-data',
  'Customer Journey Mapping': 'back-office-journey-mapping',
  'Digital File Organization': 'back-office-digital-file-organization',
  'Software and Subscription Audit': 'back-office-audit',
  'Software Automation Setup': 'back-office-automated-workflow',
  'Standard Operating Procedures (SOP) Creation': 'back-office-business-solutions',
  'Training Setup & Organization': 'back-office-consulting',
  'Information Design': 'information-design',
};

function normalizeServiceName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

function getServiceIconPath(category: ServiceCategory, serviceName: string): string {
  if (serviceIconOverrides[serviceName]) {
    return `/icons/${category}/${serviceIconOverrides[serviceName]}.svg`;
  }
  const normalized = normalizeServiceName(serviceName);
  if (category === 'information') {
    return `/icons/${category}/info-${normalized.replace('information-', '')}.svg`;
  }
  return `/icons/${category}/${category}-${normalized.replace(`${category}-`, '')}.svg`;
}

/**
 * Size styles using BDS tokens
 *
 * Token reference:
 * - --border-radius-sm = 2px
 * - --border-radius-md = 4px
 */
const sizeMap: Record<ServiceBadgeSize, { box: number; iconScale: number; radius: string }> = {
  sm: { box: 20, iconScale: 0.55, radius: 'var(--border-radius-sm)' },
  md: { box: 28, iconScale: 0.6, radius: 'var(--border-radius-md)' },
  lg: { box: 40, iconScale: 0.6, radius: 'var(--border-radius-md)' },
};

/**
 * ServiceBadge — Brik service category badge component
 *
 * Renders a colored square badge for Brik service categories
 * (brand, marketing, information, product, service). Supports
 * optional service-specific icons and a label display mode.
 *
 * Colors use BDS semantic service tokens that map to the
 * services color palette (green, yellow, blue, purple, orange).
 *
 * @example
 * ```tsx
 * // Category badge (colored square)
 * <ServiceBadge category="marketing" />
 *
 * // With specific service icon
 * <ServiceBadge category="brand" serviceName="Brand Design" />
 *
 * // Label mode (badge + text)
 * <ServiceBadge category="product" mode="label" />
 *
 * // Size variants
 * <ServiceBadge category="service" size="lg" />
 * ```
 */
export function ServiceBadge({
  category,
  mode = 'badge',
  size = 'md',
  serviceName,
  className = '',
  style,
  ...props
}: ServiceBadgeProps) {
  const config = categoryConfig[category];
  const { box, iconScale, radius } = sizeMap[size];
  const [imageError, setImageError] = useState(false);

  const badgeStyles: CSSProperties = {
    width: `${box}px`,
    height: `${box}px`,
    borderRadius: radius,
    backgroundColor: `var(--_color---background--service-${category})`,
    color: `var(--_color---text--service-${category})`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
  };

  const iconSize = Math.round(box * iconScale);

  const badge = (
    <div
      className={bdsClass('bds-service-badge', `bds-service-badge-${category}`, className)}
      style={{ ...badgeStyles, ...style }}
      title={serviceName || config.label}
      {...props}
    >
      {serviceName && !imageError && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={getServiceIconPath(category, serviceName)}
          alt=""
          width={iconSize}
          height={iconSize}
          style={{ objectFit: 'contain', display: 'block' }}
          onError={() => setImageError(true)}
        />
      )}
    </div>
  );

  if (mode === 'label') {
    const labelStyles: CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--gap-md)',
      fontFamily: 'var(--font-family-label)',
      fontSize: 'var(--body-sm)',
      fontWeight: 'var(--font-weight-semi-bold)' as unknown as number,
      lineHeight: 'var(--font-line-height-tight)',
      color: `var(--_color---text--service-${category})`,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.5px',
    };

    return (
      <div style={labelStyles}>
        {badge}
        <span>{config.label}</span>
      </div>
    );
  }

  return badge;
}

export default ServiceBadge;
