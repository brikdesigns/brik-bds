import type { Personality, VisualStyle, IndustrySlug } from '../vocabularies';
import type {
  Mood,
  IndustryTag,
  SectionType,
  PatternType,
  BlueprintTier,
} from './vocabularies';
import {
  isMood,
  isIndustryTag,
  isSectionType,
  isPatternType,
  isBlueprintTier,
} from './vocabularies';
import {
  projectMoodsToPersonality,
  projectMoodsToVisualStyle,
  projectIndustryTagsToSlugs,
} from './bridges';

/**
 * Blueprint — a single entry in the BDS blueprint library.
 *
 * Authors hand-write the match fields (`moods`, `industries`) and layout
 * content; projections (`personality`, `visualStyle`, `industrySlugs`)
 * are derived by `normalizeBlueprint()` at load time and not stored in
 * the JSON source. Never hand-author projection fields — it diverges
 * from the bridge and silently breaks resolver shortlists.
 *
 * Shape mirrors the portal `design_blueprints` Supabase table
 * (migrations 00080, 00081) plus the v2 interaction-pattern extensions.
 * The portal re-seeds from this JSON; the JSON does not read from the
 * portal. BDS is upstream.
 */
export interface Blueprint {
  /** Unique slug, e.g. "hero_split_60_40". Stable — external references rely on it. */
  key: string;
  /** Human label, e.g. "Split Hero 60/40". */
  name: string;
  section_type: SectionType;

  // ── Match fields (authored) ────────────────────────────────────
  /** Brand-feel tags. Projected onto Personality + VisualStyle via bridges. */
  moods: readonly Mood[];
  /** Industry-fit tags. Projected onto IndustrySlug via bridge. */
  industries: readonly IndustryTag[];

  // ── Layout archetype (v1, current) ─────────────────────────────
  /** Prose description of the layout — feeds the mockup generator system prompt. */
  layout_spec: string;
  /** Optional CSS pattern notes or snippets. */
  css_hints?: string;
  /** Optional HTML snippet using BDS `var()` tokens. */
  html_snippet?: string;
  /** Optional CSS snippet using BDS `var()` tokens. */
  css_snippet?: string;

  // ── Interaction pattern (v2, optional) ─────────────────────────
  /**
   * v2 pivot: blueprints may describe behavior instead of (or alongside)
   * layout. When a Paper artboard supplies the layout, the blueprint's
   * value is the `pattern_spec` + `js_snippet`. Populated as the library
   * accumulates reusable interaction patterns.
   */
  pattern_type?: PatternType;
  pattern_spec?: string;
  js_snippet?: string;

  // ── Content contract ──────────────────────────────────────────
  /**
   * Per-client facts this blueprint requires to render its canonical
   * shape. Entries are snake_case identifiers matching optional fields
   * on `ClientFacts` (from `@brikdesigns/bds/blueprints-astro`) — e.g.
   * `hero_image_url`, `phone`, `email`, `address`, `hours`.
   *
   * The portal `dev_scaffold_site` task preflights the content bundle
   * against this list before emitting a client Astro repo — if a
   * required fact is null for any page that uses this blueprint, the
   * task fails with a structured error and the repo is not generated.
   * See docs/BLUEPRINTS-ASTRO-PACKAGE.md §2.4.
   *
   * An empty array means "no client-fact requirements" — the blueprint
   * renders fully from `section` content alone (heading, body, items,
   * cta). Most blueprints fall in this bucket; only hero-with-image,
   * contact, and CTA-with-contact-channels genuinely require client
   * facts today.
   *
   * Field names are snake_case to match `company_profiles` columns
   * directly. The scaffold task projects snake_case → ClientFacts
   * (which uses camelCase for canonical fields + an index signature
   * for extras). Extending this list is cheap — add the field to
   * `ClientFacts` (or rely on the index signature), list the key here,
   * bump the blueprint's version, update `last_reviewed`.
   */
  required_facts: readonly string[];

  // ── Metadata ──────────────────────────────────────────────────
  /** Where the pattern was captured from — "Framer - Buildaxa", "Vale demo", etc. */
  source?: string;
  tier: BlueprintTier;
  is_active: boolean;
  /** Semver. Bump on content change. */
  version: string;
  /** ISO date YYYY-MM-DD. */
  last_reviewed: string;
}

/**
 * NormalizedBlueprint — what the library emits after running authored
 * entries through the bridges. Consumers should type against this when
 * querying, not the raw `Blueprint` interface.
 */
export interface NormalizedBlueprint extends Blueprint {
  /** Derived from `moods` via MOOD_TO_PERSONALITY. */
  personality: readonly Personality[];
  /** Derived from `moods` via MOOD_TO_VISUAL_STYLE. May be empty. */
  visual_style: readonly VisualStyle[];
  /**
   * Derived from `industries` via INDUSTRY_TAG_TO_SLUG.
   * Empty when the blueprint is universal-only (see `is_universal`).
   */
  industry_slugs: readonly IndustrySlug[];
  /** True when `industries` includes `universal`. */
  is_universal: boolean;
}

/**
 * Library envelope — metadata surrounding the blueprint array so
 * consumers can detect version mismatches and review staleness.
 */
export interface BlueprintLibrary {
  /** Semver for the library as a whole. Bumps when the set changes. */
  version: string;
  /** ISO date YYYY-MM-DD of last full review. */
  last_reviewed: string;
  /** Review cadence reminder. */
  review_cadence: 'quarterly' | 'biannual' | 'annual';
  blueprints: readonly Blueprint[];
}

// ── Validation ────────────────────────────────────────────────────

export interface ValidationIssue {
  key: string;
  field: string;
  message: string;
}

export interface ValidationResult {
  ok: boolean;
  issues: readonly ValidationIssue[];
}

/**
 * Validate a Blueprint authored entry against the locked vocabularies.
 * Dependency-free — returns a diagnostic bundle instead of throwing,
 * so callers can surface all drift in one pass.
 */
export function validateBlueprint(bp: Blueprint): ValidationResult {
  const issues: ValidationIssue[] = [];
  const push = (field: string, message: string) =>
    issues.push({ key: bp.key, field, message });

  if (!bp.key || !/^[a-z][a-z0-9_]*$/.test(bp.key)) {
    push('key', `Invalid key "${bp.key}" — must be snake_case lowercase.`);
  }
  if (!bp.name?.trim()) push('name', 'Name is required.');
  if (!isSectionType(bp.section_type)) {
    push('section_type', `Unknown section_type "${bp.section_type}".`);
  }

  if (!Array.isArray(bp.moods) || bp.moods.length === 0) {
    push('moods', 'At least one mood is required.');
  } else {
    for (const m of bp.moods) {
      if (!isMood(m)) push('moods', `Unknown mood "${m}".`);
    }
  }

  if (!Array.isArray(bp.industries) || bp.industries.length === 0) {
    push('industries', 'At least one industry tag is required.');
  } else {
    for (const i of bp.industries) {
      if (!isIndustryTag(i)) push('industries', `Unknown industry tag "${i}".`);
    }
  }

  if (!bp.layout_spec?.trim() && !bp.pattern_spec?.trim()) {
    push(
      'layout_spec',
      'Must have either layout_spec or pattern_spec — a blueprint with neither describes nothing.',
    );
  }

  if (bp.pattern_type !== undefined && !isPatternType(bp.pattern_type)) {
    push('pattern_type', `Unknown pattern_type "${bp.pattern_type}".`);
  }

  if (!isBlueprintTier(bp.tier)) {
    push('tier', `Unknown tier "${bp.tier}".`);
  }

  if (!/^\d+\.\d+\.\d+/.test(bp.version ?? '')) {
    push('version', `Invalid semver "${bp.version}".`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(bp.last_reviewed ?? '')) {
    push('last_reviewed', `Invalid ISO date "${bp.last_reviewed}".`);
  }

  // required_facts MUST be present (even if empty). An undefined array
  // means an author forgot to declare the contract — which would let
  // the scaffold-task preflight silently pass blueprints with missing
  // client-facts. Empty array is the correct signal for "no required
  // facts," not omission.
  if (!Array.isArray(bp.required_facts)) {
    push(
      'required_facts',
      'Must be an array of snake_case client-fact identifiers (empty array if none required).',
    );
  } else {
    for (const f of bp.required_facts) {
      if (typeof f !== 'string' || !/^[a-z][a-z0-9_]*$/.test(f)) {
        push(
          'required_facts',
          `Invalid required_fact "${f}" — must be snake_case lowercase string.`,
        );
      }
    }
  }

  return { ok: issues.length === 0, issues };
}

/**
 * Validate a whole library envelope. Returns the flattened issue list
 * across every blueprint plus any envelope-level problems.
 */
export function validateBlueprintLibrary(
  library: BlueprintLibrary,
): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!/^\d+\.\d+\.\d+/.test(library.version ?? '')) {
    issues.push({
      key: '<library>',
      field: 'version',
      message: `Invalid semver "${library.version}".`,
    });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(library.last_reviewed ?? '')) {
    issues.push({
      key: '<library>',
      field: 'last_reviewed',
      message: `Invalid ISO date "${library.last_reviewed}".`,
    });
  }

  const seen = new Set<string>();
  for (const bp of library.blueprints) {
    if (seen.has(bp.key)) {
      issues.push({
        key: bp.key,
        field: 'key',
        message: `Duplicate key "${bp.key}".`,
      });
    }
    seen.add(bp.key);
    const result = validateBlueprint(bp);
    issues.push(...result.issues);
  }

  // Sanity-check bridges — if a valid projection field accidentally lands
  // in the authored data, catch it before it shadows the derived value.
  for (const bp of library.blueprints as readonly (Blueprint & {
    personality?: unknown;
    visual_style?: unknown;
    industry_slugs?: unknown;
  })[]) {
    for (const field of ['personality', 'visual_style', 'industry_slugs'] as const) {
      if (bp[field] !== undefined) {
        issues.push({
          key: bp.key,
          field,
          message: `Projection field "${field}" is derived — remove from source JSON.`,
        });
      }
    }
  }

  return { ok: issues.length === 0, issues };
}

/**
 * Normalize an authored Blueprint by attaching derived projection fields.
 * Assumes the input has already been validated; callers should run
 * `validateBlueprint` first or gate on `validateBlueprintLibrary`.
 */
export function normalizeBlueprint(bp: Blueprint): NormalizedBlueprint {
  return {
    ...bp,
    personality: projectMoodsToPersonality(bp.moods),
    visual_style: projectMoodsToVisualStyle(bp.moods),
    industry_slugs: projectIndustryTagsToSlugs(bp.industries),
    is_universal: bp.industries.includes('universal'),
  };
}

/**
 * Normalize every entry in a library. Safe to call after
 * `validateBlueprintLibrary` reports `ok: true`.
 */
export function normalizeBlueprintLibrary(
  library: BlueprintLibrary,
): readonly NormalizedBlueprint[] {
  return library.blueprints.map(normalizeBlueprint);
}

