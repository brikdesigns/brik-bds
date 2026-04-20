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
//# sourceMappingURL=getters.d.ts.map