/**
 * Shared service-tag domain config — types, constants, and helpers consumed
 * by ServiceTag. Previously also consumed by the deprecated ServiceBadge
 * component (removed in #572; dir renamed in #731).
 */

export type ServiceLine = 'brand' | 'marketing' | 'information' | 'product' | 'service';

/**
 * Size scale shared with ServiceTag. Kept as `ServiceBadgeSize` for
 * non-breaking package-API stability; structurally identical to a future
 * `ServiceTagSize` if the dir is renamed.
 */
export type ServiceBadgeSize = 'sm' | 'md' | 'lg';

export const categoryConfig: Record<ServiceLine, { token: string; label: string }> = {
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

export function getServiceIconPath(category: ServiceLine, serviceName: string): string {
  if (serviceIconOverrides[serviceName]) {
    return `/icons/${category}/${serviceIconOverrides[serviceName]}.svg`;
  }
  const normalized = normalizeServiceName(serviceName);
  if (category === 'information') {
    return `/icons/${category}/info-${normalized.replace('information-', '')}.svg`;
  }
  return `/icons/${category}/${category}-${normalized.replace(`${category}-`, '')}.svg`;
}
