import type { IndustryPack, ServiceEntry } from '../schema';
import type { IndustrySlug, ParentIndustrySlug } from '../vocabularies';
/**
 * Returns common service/offering names for the given industry.
 * Falls back to `small-business` services when slug is unknown.
 */
export declare function getIndustryServices(slug: IndustrySlug | null | undefined): string[];
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
export declare function getIndustryServicesCatalog(slug: IndustrySlug | null | undefined): readonly ServiceEntry[];
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
export declare function getIndustryPainPoints(slug: IndustrySlug | null | undefined): readonly IndustryPainPointEntry[];
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
export declare function getIndustryKeywords(slug: IndustrySlug | null | undefined): readonly IndustryKeywordEntry[];
/**
 * Returns accepted payment methods and financing mechanisms for the given
 * industry. Falls back to `small-business` payment types when slug is unknown.
 */
export declare function getIndustryPaymentTypes(slug: IndustrySlug | null | undefined): string[];
/**
 * Returns insurance carrier names relevant to the given industry.
 * Returns an empty array for industries where insurance is not a factor
 * (e.g. `real-estate-rv-mhc`, `small-business`).
 * Falls back to `small-business` (empty array) when slug is unknown.
 */
export declare function getIndustryInsuranceProviders(slug: IndustrySlug | null | undefined): string[];
/**
 * Returns patient-facing conditions treated for the given industry, as a flat
 * array of display names from the pack's conditionsCatalog. Returns an empty
 * array when the pack does not define conditions (non-healthcare verticals).
 * Falls back to `small-business` (empty array) when slug is unknown.
 *
 * For structured access to slugs, aliases, or categories, import the pack
 * directly and read `pack.conditionsCatalog`.
 */
export declare function getIndustryConditions(slug: IndustrySlug | null | undefined): string[];
/**
 * Returns procedure-level vocabulary for the given industry, as a flat array
 * of display names from the pack's proceduresCatalog. Returns an empty array
 * when the pack does not define procedures.
 * Falls back to `small-business` (empty array) when slug is unknown.
 *
 * For structured access to slugs, aliases, or categories, import the pack
 * directly and read `pack.proceduresCatalog`.
 */
export declare function getIndustryProcedures(slug: IndustrySlug | null | undefined): string[];
/**
 * Returns facility amenities/features for the given industry, as a flat array
 * of display names from the pack's amenitiesCatalog. Returns an empty array
 * when the pack does not define amenities (non-hospitality verticals).
 * Falls back to `small-business` (empty array) when slug is unknown.
 *
 * For structured access to slugs, aliases, or categories, import the pack
 * directly and read `pack.amenitiesCatalog`.
 */
export declare function getIndustryAmenities(slug: IndustrySlug | null | undefined): string[];
/**
 * Returns every industry pack whose `parentIndustry` matches the given
 * parent slug. Drives portal UI that filters sub-industries by parent
 * bucket. Returns an empty array when no packs match (valid for parents
 * like `other` that have no graduated sub-packs).
 */
export declare function getIndustriesForParent(parentSlug: ParentIndustrySlug): IndustryPack[];
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
export declare function getIndustryInsurancePlans(slug: IndustrySlug | null | undefined): string[];
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
export declare function getIndustryFinancing(slug: IndustrySlug | null | undefined): string[];
//# sourceMappingURL=getters.d.ts.map