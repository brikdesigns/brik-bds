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

/**
 * Canonical, ordered list of the real service lines — the display order used
 * across the Brik ecosystem. Excludes the **@deprecated** `service` alias (it
 * duplicates `back-office`), so it is safe to map over for pickers/legends
 * without rendering a category twice. Single source of truth for consumers that
 * previously kept their own parallel category arrays (e.g. the portal's
 * `SERVICE_TAG_CATEGORIES`).
 */
export const SERVICE_LINES: readonly ServiceLine[] = [
  'brand',
  'marketing',
  'information',
  'product',
  'back-office',
] as const;

/**
 * Service name → bundled-glyph key. `deriveIconName` looks the name up by
 * EXACT string, so a name that differs only in its conjunction misses and
 * falls back to the line-default glyph.
 *
 * Invariant: any key containing ` & ` also appears with ` and ` (and vice
 * versa), both pointing at the same glyph — consumer CMS records drift between
 * the two spellings for the same service. Enforced by the alias-pair-parity
 * test in `ServiceTag.offline.test.ts`; two missing `and` forms shipped a
 * generic glyph on brikdesigns.com plan/services pages (#1774).
 */
export const serviceIconOverrides: Record<string, string> = {
  // Brand
  'Brand Identity': 'brand-design',
  'Brand Identity Bundle': 'brand-design',
  'Letterhead Stationary': 'brand-stationary',
  'Logo Design': 'brand-logo',
  'Logo Update': 'brand-logo',
  'Online Business Listings': 'brand-listings',
  'Premium Logo Design': 'brand-logo',
  'Standard Logo Design': 'brand-logo',
  'Print Materials': 'info-print-design',
  // Marketing
  'Comprehensive Marketing Audit and Consultation': 'marketing-consulting',
  'Comprehensive Marketing Audit & Consultation': 'marketing-consulting',
  'Custom Large E-Commerce Web Development and Design': 'marketing-web-design',
  'Custom Large E-Commerce Web Development & Design': 'marketing-web-design',
  'Custom Large Web Development and Design': 'marketing-web-design',
  'Custom Large Web Development & Design': 'marketing-web-design',
  'Custom Standard E-Commerce Web Development and Design': 'marketing-web-design',
  'Custom Standard E-Commerce Web Development & Design': 'marketing-web-design',
  'Custom Standard Web Development and Design': 'marketing-web-design',
  'Custom Standard Web Development & Design': 'marketing-web-design',
  'Email Drip Campaign (Up to 6 Emails)': 'marketing-email',
  'Email Marketing': 'marketing-email',
  'Landing Pages': 'marketing-landing-pages',
  'Patient Experience Mapping': 'marketing-patient-experience',
  'Social Media Graphic Designs': 'marketing-social-graphics',
  'Social Media Graphics': 'marketing-social-graphics',
  'Swag and Merchandise Design': 'marketing-swag',
  'Swag & Merchandise Design': 'marketing-swag',
  'Web Design and Development': 'marketing-web-design',
  'Web Design & Development': 'marketing-web-design',
  'Website Experience Mapping': 'marketing-website-experience',
  // Information
  'Information Design': 'info-design',
  'Infographics': 'info-infographics',
  'Intake Forms': 'info-intake-form',
  'Sales Resources': 'info-sales-materials',
  'Signage Design': 'info-signage',
  'Welcome Onboarding Kit': 'info-welcome-kit',
  // #1775 AC 2 — the last four live `information` names. No bundled art depicts
  // a slide deck or a proposal, and commissioning it needs the source set these
  // glyphs come from, which is not recorded anywhere in this repo (no
  // provenance file under icons/; they are 20×20 with ~30% inset and are NOT
  // the Phosphor set `@iconify-json/ph` bundles for <Icon> — that is 256×256).
  // So each name is pointed at the closest bundled glyph rather than left on the
  // line default. Sharing one glyph across names is the established pattern
  // here (`marketing-web-design` serves 10 names, `brand-logo` 4).
  //
  // Why NOT the line default `info-design`: it draws a presentation
  // screen on a stand, so every unmapped information service currently reads as
  // "a presentation" — actively wrong for Intake Forms, and the reason
  // Presentation Design below looks correct today purely by accident.
  'Presentation Design': 'info-layout-design', // designed slide layouts
  'Sales Pitch Deck': 'info-sales-materials', // sales collateral (bar chart)
  'Sales Proposal': 'info-sales-materials', // sales collateral (bar chart)
  'One-Pager': 'info-intake-form', // single-sheet document
  // Product
  'Mobile App Design': 'product-app-design',
  'SaaS and Enterprise Design': 'product-enterprise-design',
  'SaaS & Enterprise Design': 'product-enterprise-design',
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
  'Training Setup and Organization': 'back-office-training-setup',
  'Training Setup & Organization': 'back-office-training-setup',
};

export function normalizeServiceName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

/**
 * Glyph-key prefix for each service line — the naming convention every file in
 * `ServiceTag/icons/{line}/` must follow, and the prefix `deriveIconName` builds
 * when no override matches.
 *
 * The prefix is the line id, EXCEPT `information`, which abbreviates to `info-`.
 * That abbreviation is deliberate and load-bearing (every information glyph but
 * default included after the #1775 rename), so it is declared here rather
 * than left implicit in a branch. `service` is the deprecated `back-office`
 * alias and shares its prefix.
 *
 * Enforced by the convention test in `ServiceTag.offline.test.ts`: a glyph whose
 * basename does not start with its line's prefix can only ever be reached by an
 * override, never by derivation — a silent trap for the next person adding art.
 * Two glyphs had already fallen into it (`patient-experience`,
 * `website-experience`, renamed in #1775).
 */
export const SERVICE_LINE_GLYPH_PREFIX: Record<ServiceLine, string> = {
  brand: 'brand',
  marketing: 'marketing',
  information: 'info',
  product: 'product',
  'back-office': 'back-office',
  service: 'back-office',
};

/**
 * Derive the glyph key (file basename, no dir/extension) for a service name —
 * override map first, then the per-line naming convention
 * ({@link SERVICE_LINE_GLYPH_PREFIX}). Pure string logic; the returned key may
 * or may not exist in the bundled set (callers that need a guaranteed-present
 * key use {@link resolveServiceIcon}, which falls back).
 */
function deriveIconName(category: ServiceLine, serviceName: string): string {
  if (serviceIconOverrides[serviceName]) {
    return serviceIconOverrides[serviceName];
  }
  const normalized = normalizeServiceName(serviceName);
  const prefix = SERVICE_LINE_GLYPH_PREFIX[category];
  // Strip a leading line id the service name already carries, so "Information
  // Design" yields `info-design` rather than `info-information-design`. Both the
  // prefix and the spelled-out line id are stripped, because `information`
  // abbreviates (a name starting "Information" must not survive as-is).
  return `${prefix}-${normalized.replace(`${category}-`, '').replace(`${prefix}-`, '')}`;
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
  information: 'info-design',
  product: 'product-design',
  'back-office': 'back-office-design',
  // @deprecated alias of 'back-office' — same default icon.
  service: 'back-office-design',
};

