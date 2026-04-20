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
 * These are consumed by suggestion-driven comboboxes in the portal Intel tab
 * (Billing sheet, PR B1). The arrays are suggestion seeds, not locked enums —
 * clients can always enter free-text values that don't appear here.
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
//# sourceMappingURL=getters.js.map