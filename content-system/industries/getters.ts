import type { IndustryPack, ServiceEntry } from '../schema';
import type { IndustrySlug, ParentIndustrySlug } from '../vocabularies';
import { industryPacks } from './index';
import { smallBusiness } from './small-business';

/**
 * Industry vocabulary getters — billing / intake suggestion seeds.
 *
 * Each getter accepts an `IndustrySlug` (or null/undefined) and returns the
 * corresponding flat string array from that industry's pack. Falls back to
 * the `small-business` pack when the slug is null, undefined, or does not
 * match any registered pack.
 *
 * These are consumed by suggestion-driven comboboxes in the portal Intel tab.
 * The arrays are suggestion seeds, not locked enums — clients can always
 * enter free-text values that don't appear here.
 */

function resolvePack(slug: IndustrySlug | null | undefined) {
  if (!slug) return smallBusiness;
  return industryPacks[slug] ?? smallBusiness;
}

/**
 * Returns common service/offering names for the given industry.
 * Falls back to `small-business` services when slug is unknown.
 */
export function getIndustryServices(slug: IndustrySlug | null | undefined): string[] {
  return [...resolvePack(slug).services];
}

/**
 * Returns the structured services catalog for the given industry — each entry
 * carries slug, displayName, aliases, category, and optional regulatoryNote.
 * Falls back to the `small-business` pack's catalog when slug is unknown.
 *
 * Distinct from `getIndustryServices` (flat string array of suggestion seeds).
 * Consumers that need slug-level attribution or alias matching (e.g. the
 * portal's `<CatalogPicker>` wiring for `services_offered`) read from this
 * getter; UIs that only need a suggestion dropdown keep using the flat one.
 */
export function getIndustryServicesCatalog(
  slug: IndustrySlug | null | undefined,
): readonly ServiceEntry[] {
  return resolvePack(slug).servicesCatalog;
}

/**
 * One pain-point entry shaped for the portal's `<CatalogPicker>`.
 *
 * The pack's `customerPainPoints[]` has a richer shape (`summary`,
 * optional `segment`, optional `detail`) — this getter flattens it to
 * the minimal `{ slug, displayName }` that CatalogPicker expects so
 * consumers can pass the result directly without writing an adapter.
 * Call the pack's `customerPainPoints` member directly when you need
 * segment + detail.
 */
export interface IndustryPainPointEntry {
  slug: string;
  displayName: string;
  aliases?: readonly string[];
}

/**
 * Slugify a free-text string for use as a stable identifier. Lowercase,
 * collapse non-alphanumerics to `-`, trim leading/trailing dashes, cap
 * at 40 chars so CustomerPainPoint's long summaries don't produce
 * unreadable slugs.
 */
function toSlug(raw: string): string {
  const base = raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)
    .replace(/-$/, '');
  return base || 'custom';
}

/**
 * Returns the customer-pain-point catalog for the given industry, shaped
 * for the portal's `<CatalogPicker>`. Each entry carries a stable slug
 * derived from the pack's `summary` field plus the `summary` itself as
 * `displayName`. Falls back to the `small-business` pack when slug is
 * unknown.
 *
 * Pain points are client-intel that industry intel seeds — Brik has
 * learned a durable set of verticalized frictions (dental: cost anxiety,
 * insurance confusion, trust deficit; real-estate: reservation
 * confusion, hookup details, rig-size limits) and each client picks
 * from those, plus their own observed frictions as custom entries.
 */
export function getIndustryPainPoints(
  slug: IndustrySlug | null | undefined,
): readonly IndustryPainPointEntry[] {
  const pack = resolvePack(slug);
  return pack.customerPainPoints.map((pp) => ({
    slug: toSlug(pp.summary),
    displayName: pp.summary,
  }));
}

/**
 * One keyword entry shaped for the portal's `<CatalogPicker>`. Same
 * structural shape as IndustryPainPointEntry / ServiceEntry — every
 * Stream C getter normalizes to `{ slug, displayName, aliases? }` so
 * consumers wire through CatalogPicker uniformly.
 *
 * `tier` flags whether the entry came from `keywordBank.primary`
 * (brand/category-level) or `keywordBank.serviceLevel` (service- or
 * procedure-level). Consumers can regroup by tier when surfacing picks
 * in read-only views.
 */
export interface IndustryKeywordEntry {
  slug: string;
  displayName: string;
  aliases?: readonly string[];
  tier: 'primary' | 'service-level';
}

/**
 * Returns the SEO keyword catalog for the given industry, merged from
 * `keywordBank.primary` (brand/category) and `keywordBank.serviceLevel`
 * (service/procedure). Each entry carries a `tier` flag. Falls back to
 * the `small-business` pack when slug is unknown. Duplicate slugs
 * across the two tiers are dropped — `primary` wins first.
 *
 * Stream C canary #3: SEO keywords as BCS-seeded client intel. Clients
 * pick the industry keywords they want to target + add long-tails as
 * custom entries. Downstream site-structure work consumes the picked
 * slugs to seed page H1s and meta descriptions.
 */
export function getIndustryKeywords(
  slug: IndustrySlug | null | undefined,
): readonly IndustryKeywordEntry[] {
  const pack = resolvePack(slug);
  const out: IndustryKeywordEntry[] = [];
  const seen = new Set<string>();
  for (const kw of pack.keywordBank.primary) {
    const s = toSlug(kw);
    if (seen.has(s)) continue;
    seen.add(s);
    out.push({ slug: s, displayName: kw, tier: 'primary' });
  }
  for (const kw of pack.keywordBank.serviceLevel) {
    const s = toSlug(kw);
    if (seen.has(s)) continue;
    seen.add(s);
    out.push({ slug: s, displayName: kw, tier: 'service-level' });
  }
  return out;
}

/**
 * One CTA-defaults entry shaped for `<CatalogPicker>`. Same structural
 * shape as every other Stream C getter's output — `{ slug, displayName,
 * aliases? }` — so consumers wire uniformly.
 */
export interface IndustryCtaEntry {
  slug: string;
  displayName: string;
  aliases?: readonly string[];
}

/**
 * Returns the "approved" CTA defaults for the given industry. These are
 * the spoken-form CTAs the industry typically converts on — used as seed
 * options in the Brand Identity sheet's CTA Language section. Clients
 * pick from these + can add custom variants with source='custom'.
 *
 * Pairs with `getIndustryCtaRejected` — together they form the
 * Approved/Rejected split the existing `cta_language` column already
 * tracks on `company_profiles`.
 */
export function getIndustryCtaApproved(
  slug: IndustrySlug | null | undefined,
): readonly IndustryCtaEntry[] {
  return resolvePack(slug).ctaDefaults.approved.map((cta) => ({
    slug: toSlug(cta),
    displayName: cta,
  }));
}

/**
 * Returns the "rejected" CTA defaults for the given industry — phrasing
 * that demonstrably underperforms or signals the wrong tone. Drives the
 * client-side rejection list in the Brand Identity sheet.
 */
export function getIndustryCtaRejected(
  slug: IndustrySlug | null | undefined,
): readonly IndustryCtaEntry[] {
  return resolvePack(slug).ctaDefaults.rejected.map((cta) => ({
    slug: toSlug(cta),
    displayName: cta,
  }));
}

/**
 * Returns accepted payment methods and financing mechanisms for the given
 * industry. Falls back to `small-business` payment types when slug is unknown.
 */
export function getIndustryPaymentTypes(slug: IndustrySlug | null | undefined): string[] {
  return [...resolvePack(slug).paymentTypes];
}

/**
 * Returns insurance carrier names relevant to the given industry.
 * Returns an empty array for industries where insurance is not a factor
 * (e.g. `real-estate-rv-mhc`, `small-business`).
 * Falls back to `small-business` (empty array) when slug is unknown.
 */
export function getIndustryInsuranceProviders(slug: IndustrySlug | null | undefined): string[] {
  return [...resolvePack(slug).insuranceProviders];
}

/**
 * Returns patient-facing conditions treated for the given industry, as a flat
 * array of display names from the pack's conditionsCatalog. Returns an empty
 * array when the pack does not define conditions (non-healthcare verticals).
 * Falls back to `small-business` (empty array) when slug is unknown.
 *
 * For structured access to slugs, aliases, or categories, import the pack
 * directly and read `pack.conditionsCatalog`.
 */
export function getIndustryConditions(slug: IndustrySlug | null | undefined): string[] {
  const pack = resolvePack(slug);
  return pack.conditionsCatalog ? pack.conditionsCatalog.map((entry) => entry.displayName) : [];
}

/**
 * Returns procedure-level vocabulary for the given industry, as a flat array
 * of display names from the pack's proceduresCatalog. Returns an empty array
 * when the pack does not define procedures.
 * Falls back to `small-business` (empty array) when slug is unknown.
 *
 * For structured access to slugs, aliases, or categories, import the pack
 * directly and read `pack.proceduresCatalog`.
 */
export function getIndustryProcedures(slug: IndustrySlug | null | undefined): string[] {
  const pack = resolvePack(slug);
  return pack.proceduresCatalog ? pack.proceduresCatalog.map((entry) => entry.displayName) : [];
}

/**
 * Returns facility amenities/features for the given industry, as a flat array
 * of display names from the pack's amenitiesCatalog. Returns an empty array
 * when the pack does not define amenities (non-hospitality verticals).
 * Falls back to `small-business` (empty array) when slug is unknown.
 *
 * For structured access to slugs, aliases, or categories, import the pack
 * directly and read `pack.amenitiesCatalog`.
 */
export function getIndustryAmenities(slug: IndustrySlug | null | undefined): string[] {
  const pack = resolvePack(slug);
  return pack.amenitiesCatalog ? pack.amenitiesCatalog.map((entry) => entry.displayName) : [];
}

/**
 * Returns every industry pack whose `parentIndustry` matches the given
 * parent slug. Drives portal UI that filters sub-industries by parent
 * bucket. Returns an empty array when no packs match (valid for parents
 * like `other` that have no graduated sub-packs).
 */
export function getIndustriesForParent(parentSlug: ParentIndustrySlug): IndustryPack[] {
  return Object.values(industryPacks).filter((pack) => pack.parentIndustry === parentSlug);
}

/**
 * Returns the locked insurance plan / program vocabulary for the given
 * industry (e.g. Medicaid, Out-of-Network PPO for dental). Returns an
 * empty array when the pack does not define plan-level granularity.
 * Falls back to `small-business` (empty) when slug is unknown.
 *
 * Consumed by the portal's Insurance Plans MultiSelect as a locked
 * vocabulary (zero free-text). Distinct from `getIndustryInsuranceProviders`,
 * which returns the carrier list (Aetna, Cigna, etc.).
 */
export function getIndustryInsurancePlans(slug: IndustrySlug | null | undefined): string[] {
  const pack = resolvePack(slug);
  return pack.insurancePlans ? [...pack.insurancePlans] : [];
}

/**
 * Returns the locked financing-product vocabulary for the given industry
 * (e.g. CareCredit, Cherry Finance for dental). Returns an empty array
 * when the pack does not define a financing catalog.
 * Falls back to `small-business` (empty) when slug is unknown.
 *
 * Consumed by the portal's Financing MultiSelect as a locked vocabulary.
 * Distinct from the global PAYMENT_METHOD_VALUES (point-of-sale methods):
 * financing products are structured payment programs the business offers
 * to patients/residents, not methods they collect payment through.
 */
export function getIndustryFinancing(slug: IndustrySlug | null | undefined): string[] {
  const pack = resolvePack(slug);
  return pack.financing ? [...pack.financing] : [];
}
