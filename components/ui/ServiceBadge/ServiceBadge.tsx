import { type HTMLAttributes, useState } from 'react';
import { bdsClass } from '../../utils';
import './ServiceBadge.css';

export type ServiceCategory = 'brand' | 'marketing' | 'information' | 'product' | 'service';
export type ServiceBadgeSize = 'sm' | 'md' | 'lg';
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

export const categoryConfig: Record<ServiceCategory, { token: string; label: string }> = {
  brand: { token: 'yellow', label: 'Brand' },
  marketing: { token: 'green', label: 'Marketing' },
  information: { token: 'blue', label: 'Information' },
  product: { token: 'purple', label: 'Product' },
  service: { token: 'orange', label: 'Back Office' },
};

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
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
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

// bds-lint-ignore — Figma-driven badge dimensions
const iconScaleMap: Record<ServiceBadgeSize, number> = { sm: 0.55, md: 0.6, lg: 0.6 };
const boxSizeMap: Record<ServiceBadgeSize, number> = { sm: 20, md: 28, lg: 40 };

/**
 * ServiceBadge - Brik service category badge.
 *
 * @example
 * ```tsx
 * <ServiceBadge category="marketing" />
 * <ServiceBadge category="brand" serviceName="Brand Design" />
 * <ServiceBadge category="product" mode="label" />
 * ```
 */
export function ServiceBadge({
  category,
  mode = 'badge',
  size = 'md',
  serviceName,
  className,
  style,
  ...props
}: ServiceBadgeProps) {
  const config = categoryConfig[category];
  const [imageError, setImageError] = useState(false);
  const iconSize = Math.round(boxSizeMap[size] * iconScaleMap[size]);

  const badge = (
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

  if (mode === 'label') {
    return (
      <div className={bdsClass('bds-service-badge-label', `bds-service-badge-label--${category}`)}>
        {badge}
        <span>{config.label}</span>
      </div>
    );
  }

  return badge;
}

export default ServiceBadge;
