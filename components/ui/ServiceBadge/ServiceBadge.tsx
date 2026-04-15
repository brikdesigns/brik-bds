import { type HTMLAttributes, useState } from 'react';
import { bdsClass } from '../../utils';
import './ServiceBadge.css';

export type ServiceCategory = 'brand' | 'marketing' | 'information' | 'product' | 'service';
export type ServiceBadgeSize = 'sm' | 'md' | 'lg';
/** @deprecated `mode` is no longer used. ServiceBadge is icon-only. Use ServiceTag for text labels. */
export type ServiceBadgeMode = 'badge' | 'label';

export interface ServiceBadgeProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Service category */
  category: ServiceCategory;
  /**
   * Display mode
   * @deprecated This prop is ignored. ServiceBadge is icon-only going forward. Use `ServiceTag variant="icon"` for the same visual. Use `ServiceTag variant="text"` or `variant="icon-text"` for text labels.
   */
  mode?: ServiceBadgeMode;
  /** Size variant */
  size?: ServiceBadgeSize;
  /** Optional service name — used to resolve the specific service icon SVG */
  serviceName?: string;
}

export const categoryConfig: Record<ServiceCategory, { token: string; label: string }> = {
  brand: { token: 'yellow', label: 'Brand' },
  marketing: { token: 'green', label: 'Marketing' },
  information: { token: 'blue', label: 'Information' },
  product: { token: 'purple', label: 'Product' },
  service: { token: 'orange', label: 'Back Office' },
};

export const serviceIconOverrides: Record<string, string> = {
  // Brand
  'Brand Identity': 'brand-design',
  'Brand Identity Bundle': 'brand-design',
  'Logo Update': 'brand-logo',
  'Premium Logo Design': 'brand-logo',
  'Standard Logo Design': 'brand-logo',
  'Print Materials': 'info-print-design',
  // Marketing
  'Comprehensive Marketing Audit & Consultation': 'marketing-consulting',
  'Custom Large E-Commerce Web Development and Design': 'marketing-web-design',
  'Custom Large Web Development and Design': 'marketing-web-design',
  'Custom Standard E-Commerce Web Development and Design': 'marketing-web-design',
  'Custom Standard Web Development and Design': 'marketing-web-design',
  'Email Drip Campaign (Up to 6 Emails)': 'marketing-email',
  'Landing Pages': 'marketing-landing-pages',
  'Patient Experience Mapping': 'patient-experience',
  'Social Media Graphic Designs': 'marketing-social-graphics',
  'Social Media Graphics': 'marketing-social-graphics',
  'Swag and Merchandise Design': 'marketing-swag',
  'Swag & Merchandise Design': 'marketing-swag',
  'Web Design & Development': 'marketing-web-design',
  'Website Experience Mapping': 'website-experience',
  // Information
  'Information Design': 'information-design',
  'Infographics': 'info-infographics',
  // Back Office (service) — DB uses & where overrides used "and"
  'Automated Workflow and AI Integration': 'back-office-automation-ai',
  'Automated Workflow & AI Integration': 'back-office-automation-ai',
  'Back Office Consulting': 'back-office-consulting',
  'Back Office Customer Support': 'back-office-customer-support',
  'Back Office Design': 'back-office-design',
  'Back Office Software Audit': 'back-office-software-audit',
  'Back Office SOP Creation': 'back-office-sop-creation',
  'Back Office Training Setup': 'back-office-training-setup',
  'CRM Setup and Data Cleanup': 'back-office-crm-data',
  'CRM Setup & Data Cleanup': 'back-office-crm-data',
  'Customer Journey Mapping': 'back-office-journey-mapping',
  'Digital File Organization': 'back-office-digital-file-organization',
  'Software and Subscription Audit': 'back-office-audit',
  'Software & Subscription Audit': 'back-office-audit',
  'Software Automation Setup': 'back-office-automated-workflow',
  'SOP Creation': 'back-office-sop-creation',
  'Standard Operating Procedures (SOP) Creation': 'back-office-business-solutions',
  'Training Setup & Organization': 'back-office-training-setup',
};

export function normalizeServiceName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export function getServiceIconPath(category: ServiceCategory, serviceName: string): string {
  if (serviceIconOverrides[serviceName]) {
    return `/icons/${category}/${serviceIconOverrides[serviceName]}.svg`;
  }
  const normalized = normalizeServiceName(serviceName);
  if (category === 'information') {
    return `/icons/${category}/info-${normalized.replace('information-', '')}.svg`;
  }
  return `/icons/${category}/${category}-${normalized.replace(`${category}-`, '')}.svg`;
}

// bds-lint-ignore — Figma-driven badge dimensions
const iconScaleMap: Record<ServiceBadgeSize, number> = { sm: 0.55, md: 0.6, lg: 0.6 };
const boxSizeMap: Record<ServiceBadgeSize, number> = { sm: 20, md: 28, lg: 40 };

/**
 * @deprecated Use `ServiceTag variant="icon"` instead. ServiceBadge is kept for backwards compatibility only.
 *
 * ServiceBadge — icon-only colored square badge for a Brik service category.
 * The `mode="label"` prop is no longer supported; use `ServiceTag` for text labels.
 *
 * @example
 * // Migration: replace ServiceBadge with ServiceTag
 * // Old: <ServiceBadge category="brand" serviceName="Brand Identity Bundle" size="lg" />
 * // New: <ServiceTag category="brand" variant="icon" serviceName="Brand Identity Bundle" size="lg" />
 */
export function ServiceBadge({
  category,
  mode: _mode,
  size = 'md',
  serviceName,
  className,
  style,
  ...props
}: ServiceBadgeProps) {
  const config = categoryConfig[category];
  const [imageError, setImageError] = useState(false);
  const iconSize = Math.round(boxSizeMap[size] * iconScaleMap[size]);

  return (
    <div
      className={bdsClass(
        'bds-service-badge',
        `bds-service-badge--${size}`,
        `bds-service-badge--${category}`,
        className,
      )}
      style={style}
      title={serviceName || config.label}
      {...props}
    >
      {serviceName && !imageError && (
        <img
          src={getServiceIconPath(category, serviceName)}
          alt=""
          width={iconSize}
          height={iconSize}
          className="bds-service-badge__icon"
          onError={() => setImageError(true)}
        />
      )}
    </div>
  );
}

export default ServiceBadge;
