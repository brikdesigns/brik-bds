/**
 * Shared service-tag domain config — types, constants, and helpers consumed
 * by ServiceTag. Previously also consumed by the deprecated ServiceBadge
 * component (removed in #572; dir renamed in #731).
 */

import { SERVICE_ICON_SVGS } from './service-icons.generated';

/**
 * Service-line identifier. `back-office` is canonical; `service` is a
 * **@deprecated** alias kept for non-breaking package-API compat during the
 * cross-repo rename (the underlying color tokens already use `*-back-office`).
 * Pass `back-office` in new code — `service` is slated for removal in a future
 * major version.
 */
export type ServiceLine = 'brand' | 'marketing' | 'information' | 'product' | 'back-office' | 'service';

/**
 * Size scale shared with ServiceTag.
 */
export type ServiceTagSize = 'sm' | 'md' | 'lg';

/**
 * @deprecated Renamed to `ServiceTagSize` after the Badge → ServiceTag rename
 * (dir renamed in #731). Kept for one release as a non-breaking package-API
 * hatch; removable in the next major version.
 */
export type ServiceBadgeSize = ServiceTagSize;

export const categoryConfig: Record<ServiceLine, { token: string; label: string }> = {
  brand: { token: 'yellow', label: 'Brand' },
  marketing: { token: 'green', label: 'Marketing' },
  information: { token: 'blue', label: 'Information' },
  product: { token: 'purple', label: 'Product' },
  'back-office': { token: 'orange', label: 'Back Office' },
  // @deprecated alias of 'back-office' — same orange tokens. Kept for API compat.
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

/**
 * On-disk icon directory for a service line. Assets live under
 * `icons/back-office/` (dir === category) since the #800 rename. The only
 * override left is the **@deprecated** `service` alias, mapped to the canonical
 * `back-office` dir so the compat path keeps resolving until its removal.
 * Every other line: dir === category.
 */
const iconDirOverrides: Partial<Record<ServiceLine, string>> = { service: 'back-office' };
function iconDir(category: ServiceLine): string {
  return iconDirOverrides[category] ?? category;
}

/**
 * Derive the glyph key (file basename, no dir/extension) for a service name —
 * override map first, then the per-line naming convention. Pure string logic;
 * the returned key may or may not exist in the bundled set (callers that need a
 * guaranteed-present key use {@link resolveServiceIcon}, which falls back).
 */
function deriveIconName(category: ServiceLine, serviceName: string): string {
  if (serviceIconOverrides[serviceName]) {
    return serviceIconOverrides[serviceName];
  }
  const normalized = normalizeServiceName(serviceName);
  if (category === 'information') {
    return `info-${normalized.replace('information-', '')}`;
  }
  return `${category}-${normalized.replace(`${category}-`, '')}`;
}

/**
 * @deprecated ServiceTag now renders glyphs from the BDS-bundled inline set
 * (#1242) — it no longer fetches a URL from the consumer's `/public/icons/`, so
 * this path is unused internally. Kept one release for API compat; consumers on
 * the old URL model can migrate off their `/public/icons/` service assets. Use
 * {@link resolveServiceIcon} to get a guaranteed-bundled glyph key instead.
 */
export function getServiceIconPath(category: ServiceLine, serviceName: string): string {
  return `/icons/${iconDir(category)}/${deriveIconName(category, serviceName)}.svg`;
}

/**
 * Resolve a service to a glyph key **guaranteed present** in the bundled set.
 * Order: the derived per-service key if bundled, else the service-line default
 * (always bundled). Because the result is always a real bundled key, ServiceTag
 * can never emit a missing glyph — the durable fix for the 54/73 icon 404s that
 * the old consumer-shipped-file model produced (#1242).
 *
 * @param serviceName Omit for a line-level tag — resolves straight to the
 *   service-line default glyph.
 */
export function resolveServiceIcon(category: ServiceLine, serviceName?: string): string {
  if (serviceName) {
    const derived = deriveIconName(category, serviceName);
    if (SERVICE_ICON_SVGS[derived]) return derived;
  }
  return serviceLineDefaultIcon[category];
}

/**
 * Service-line default glyph key — the line-level glyph used when an icon
 * variant has no specific `serviceName` (e.g. a category tag with no service),
 * and the guaranteed fallback in {@link resolveServiceIcon}. Every value here
 * MUST be a bundled glyph key (see service-icons.generated.ts); the drift gate
 * `npm run gen:service-icons:check` keeps the source set in sync.
 */
const serviceLineDefaultIcon: Record<ServiceLine, string> = {
  brand: 'brand-design',
  marketing: 'marketing-design',
  information: 'information-design',
  product: 'product-design',
  'back-office': 'back-office-design',
  // @deprecated alias of 'back-office' — same default icon.
  service: 'back-office-design',
};

/**
 * @deprecated Superseded by {@link resolveServiceIcon} (glyphs render from the
 * BDS-bundled inline set, not a consumer URL — #1242). Kept one release for API
 * compat.
 */
export function getServiceLineIconPath(category: ServiceLine): string {
  return `/icons/${iconDir(category)}/${serviceLineDefaultIcon[category]}.svg`;
}
