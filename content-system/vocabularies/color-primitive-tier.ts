/**
 * Color Primitive Tier — the canonical brand-tier vocabulary that decides
 * which canonical BDS token slots a profile's color primitive resolves into.
 *
 * Single source of truth shared by the portal theme generator
 * (`generate-theme-css.ts` → `findPrimitiveByTier`), `resolve-theme.ts`
 * (which previously declared the type locally), and any future per-client
 * repo that reads primitives by tier. Drift here breaks brand-color
 * resolution silently — pinning the vocabulary to a BDS contract makes
 * speculative tier additions impossible without a definition step here
 * first.
 *
 * Tier values are scoped to BRAND-TIER decisions only — they never
 * override canonical neutral slots (`--text-primary` / `--surface-primary` /
 * etc.). Per the BDS canonical token registry, neutral slots resolve from
 * the white / black / gray primitives exclusively. To shift a brand's body
 * surface or body text to a warm-tinted neutral (e.g. Vale's cream +
 * moss-deepest), redefine that brand's `white` or `black` primitive hex
 * value rather than introducing a parallel "paper" / "ink" tier. Same root
 * cause as the canonical-token-rollback runbook (2026-04-27) which retired
 * the parallel surface/text alias taxonomy at the CSS-var layer.
 *
 * Source of truth:
 *   https://design.brikdesigns.com/docs/primitives/color
 *   node_modules/@brikdesigns/bds/dist/tokens.css
 *
 * Tier semantics:
 *   - primary    — chromatic brand identity. Drives `--text-brand-primary`,
 *                  accents, `--text-link`.
 *   - secondary  — supporting brand color. Tag-only today; no automatic
 *                  mapping.
 *   - tertiary   — third-tier brand color. Tag-only by contract (ADR-012).
 *   - accent     — non-primary chromatic color (Brik's tertiary brand
 *                  colour; may be neutral OR chromatic by palette size).
 *                  Tag-only by contract (ADR-012).
 *   - neutral    — gray ramp source. Drives gray-ramp neutral resolution.
 *   - brand-fill — AA-safe variant of primary used for filled brand
 *                  surfaces (`--background-brand-primary`) and brand-
 *                  colored text (`--text-brand-primary`). Specify when
 *                  primary fails AA contrast against the paper/white
 *                  surface (Vale's olive #698339 is 3.4:1 on white;
 *                  olive-deep #3d4c23 is 9.0:1).
 *
 * Why no separate body-surface / body-text brand-tier: those tier values
 * (named "paper" and "ink" in portal PR #576) were reverted in #577
 * because they pushed brand-tinted values into canonical neutral token
 * slots, violating the BDS taxonomy where neutral tokens must resolve
 * from neutral primitives. To shift body neutrals brand-side, redefine
 * the brand's white/black primitive hex values; do not introduce
 * parallel tier vocabulary.
 *
 * Why no `--*-brand-tertiary` / `--*-brand-accent` slot (ADR-012, ratified
 * 2026-06-23): `tertiary`/`accent` are tag-only by CONTRACT, not as a
 * stopgap awaiting a slot. Adding one is the same speculative parallel-
 * brand-tier shape #512/#553 rolled back, and a single slot cannot encode
 * that the accent/tertiary tier is neutral OR chromatic by palette size.
 * Resolution rule:
 *   - CHROMATIC tertiary/accent → consumed as the raw `--color-{name}` /
 *     `--color-{name}-{stop}` primitive (a canonical name already in
 *     tokens.css). No brand slot; referenced ad hoc by generators/CSS.
 *   - NEUTRAL tertiary/accent → resolves via the existing neutral path
 *     (`neutral`-tier gray-ramp; in the mockup generator, the dark/light/
 *     mid role assignment). Never gets a chromatic slot.
 * `secondary` is unaffected — it keeps its canonical `--*-brand-secondary`
 * slot. A future client genuinely needing a tertiary slot returns here for
 * a definition step first.
 */
export const COLOR_PRIMITIVE_TIERS = [
  'primary',
  'secondary',
  'tertiary',
  'accent',
  'neutral',
  'brand-fill',
] as const;

export type ColorPrimitiveTier = (typeof COLOR_PRIMITIVE_TIERS)[number];

export const isColorPrimitiveTier = (value: string): value is ColorPrimitiveTier =>
  (COLOR_PRIMITIVE_TIERS as readonly string[]).includes(value);
