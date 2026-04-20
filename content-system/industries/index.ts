import type { IndustryPack } from '../schema';
import type { IndustrySlug } from '../vocabularies';
import { dental } from './dental';
import { realEstateRvMhc } from './real-estate-rv-mhc';
import { smallBusiness } from './small-business';

/**
 * Industry pack registry — maps every slug in INDUSTRY_SLUGS to its IndustryPack.
 *
 * When adding a new pack:
 *   1. Add the slug to `vocabularies/industry.ts`
 *   2. Create `{slug}.ts` and `{slug}.mdx` in this folder
 *   3. Import and add to the registry below
 *
 * Type-level guarantee: the record is constrained to IndustrySlug keys, so
 * TypeScript will flag any missing entry when new slugs are added to the
 * vocabulary.
 */
export const industryPacks: Record<IndustrySlug, IndustryPack> = {
  'dental': dental,
  'real-estate-rv-mhc': realEstateRvMhc,
  'small-business': smallBusiness,
};

export { dental, realEstateRvMhc, smallBusiness };
export { getIndustryServices, getIndustryPaymentTypes, getIndustryInsuranceProviders } from './getters';
