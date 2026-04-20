import type { IndustrySlug } from '../vocabularies';
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
//# sourceMappingURL=getters.d.ts.map