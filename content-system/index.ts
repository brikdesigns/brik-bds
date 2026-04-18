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
 */

export * from './vocabularies';
export * from './schema';
export { industryPacks, dental, realEstateRvMhc, smallBusiness } from './industries';
export {
  voicePatterns,
  approachable,
  authoritative,
  conversational,
  direct,
  empathetic,
  expert,
  poetic,
  witty,
} from './voices';
