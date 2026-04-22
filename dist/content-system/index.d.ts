/**
 * Brik Content System (BCS) — public surface.
 *
 * The content vocabulary that pairs with the BDS visual vocabulary.
 * Consumed by the portal resolver, brand-strategy workers, and mockup
 * generation pipelines.
 *
 * Organization mirrors BDS:
 *   - vocabularies/ — locked enums (Personality, Voice, Visual Style, Industry)
 *   - schema/       — TypeScript types for pack authoring
 *   - industries/   — industry packs (data + narrative)
 *   - voices/       — voice patterns (rules, examples, pairings)
 *   - blueprints/   — layout + interaction pattern library shape
 */
export * from './vocabularies';
export * from './schema';
export * from './blueprints';
export { ATMOSPHERE_MANIFEST, getAtmosphereImportPath, type AtmosphereManifestEntry, } from './atmospheres';
export type { IndustryPainPointEntry, IndustryKeywordEntry } from './industries';
export { industryPacks, dental, realEstateRvMhc, smallBusiness, getIndustryServices, getIndustryServicesCatalog, getIndustryPainPoints, getIndustryKeywords, getIndustryPaymentTypes, getIndustryInsuranceProviders, getIndustryConditions, getIndustryProcedures, getIndustryAmenities, getIndustriesForParent, getIndustryInsurancePlans, getIndustryFinancing, } from './industries';
export { voicePatterns, approachable, authoritative, conversational, direct, empathetic, expert, poetic, witty, } from './voices';
//# sourceMappingURL=index.d.ts.map