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
function resolvePack(slug) {
    if (!slug)
        return smallBusiness;
    return industryPacks[slug] ?? smallBusiness;
}
/**
 * Returns common service/offering names for the given industry.
 * Falls back to `small-business` services when slug is unknown.
 */
export function getIndustryServices(slug) {
    return [...resolvePack(slug).services];
}
/**
 * Returns accepted payment methods and financing mechanisms for the given
 * industry. Falls back to `small-business` payment types when slug is unknown.
 */
export function getIndustryPaymentTypes(slug) {
    return [...resolvePack(slug).paymentTypes];
}
/**
 * Returns insurance carrier names relevant to the given industry.
 * Returns an empty array for industries where insurance is not a factor
 * (e.g. `real-estate-rv-mhc`, `small-business`).
 * Falls back to `small-business` (empty array) when slug is unknown.
 */
export function getIndustryInsuranceProviders(slug) {
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
export function getIndustryConditions(slug) {
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
export function getIndustryProcedures(slug) {
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
export function getIndustryAmenities(slug) {
    const pack = resolvePack(slug);
    return pack.amenitiesCatalog ? pack.amenitiesCatalog.map((entry) => entry.displayName) : [];
}
/**
 * Returns every industry pack whose `parentIndustry` matches the given
 * parent slug. Drives portal UI that filters sub-industries by parent
 * bucket. Returns an empty array when no packs match (valid for parents
 * like `other` that have no graduated sub-packs).
 */
export function getIndustriesForParent(parentSlug) {
    return Object.values(industryPacks).filter((pack) => pack.parentIndustry === parentSlug);
}
//# sourceMappingURL=getters.js.map