import type { IndustryPack } from '../schema';
import type { IndustrySlug, ParentIndustrySlug } from '../vocabularies';
/**
 * Returns common service/offering names for the given industry.
 * Falls back to `small-business` services when slug is unknown.
 */
export declare function getIndustryServices(slug: IndustrySlug | null | undefined): string[];
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