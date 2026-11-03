import { describe, it, expect } from 'vitest';

import libraryJson from '../../blueprints/blueprint-library.json';
import { ATMOSPHERE_VALUES, DEPRECATED_ATMOSPHERES, type Atmosphere } from '../vocabularies';
import { WIRED_BLUEPRINT_KEYS } from './astro/types';
import {
  normalizeBlueprintLibrary,
  validateBlueprintLibrary,
  type BlueprintLibrary,
} from './index';
import {
  SHORTLIST_WEIGHTS,
  resolveBlueprintShortlist,
  resolveBlueprintShortlistWithScores,
  scoreBlueprintForProfile,
  type BlueprintShortlistProfile,
} from './resolver';

const library = libraryJson as BlueprintLibrary;

const validation = validateBlueprintLibrary(library);
if (!validation.ok) {
  throw new Error(
    `Library fixture failed validation — fix scripts/validate-blueprints.mjs first.\n${validation.issues
      .map((issue) => `  ${issue.key}.${issue.field}: ${issue.message}`)
      .join('\n')}`,
  );
}
const normalized = normalizeBlueprintLibrary(library);

describe('resolveBlueprintShortlist', () => {
  it('ranks the three handoff-expected blueprints at the top for a Trustworthy/Warm/Professional dental client', () => {
    const profile: BlueprintShortlistProfile = {
      brand_personality: ['Trustworthy', 'Warm', 'Professional'],
      industry_slug: 'dental',
    };

    const ranked = resolveBlueprintShortlist(profile, normalized);
    const topThreeKeys = ranked.slice(0, 3).map((bp) => bp.key);

    // Was `story_split` / `team_bio_grid` / `contact_form_split` until
    // #2308. Two of those three dispatched on neither rail, so the shortlist
    // was recommending a dental client blueprints that render
    // `<BlueprintFallback>` — they are roadmap candidates now, not inventory.
    // Do NOT "restore" the old expectation by re-adding them to the library:
    // that is the bug. A candidate re-enters this shortlist by being built.
    expect(topThreeKeys).toEqual(
      expect.arrayContaining([
        'story_split',
        'hero_interior_minimal',
        'two_column_detail',
      ]),
    );
  });

  it('never shortlists a blueprint that dispatches on neither rail', () => {
    // The invariant #2308 bought: `is_active` means shippable, so every
    // blueprint the resolver can offer has a component. Guards the whole
    // shortlist surface rather than the one dental profile above.
    const profile: BlueprintShortlistProfile = {
      brand_personality: ['Trustworthy', 'Warm', 'Professional'],
      industry_slug: 'dental',
    };

    const ranked = resolveBlueprintShortlist(profile, normalized);

    expect(ranked.length).toBeGreaterThan(0);
    for (const bp of ranked) {
      expect(WIRED_BLUEPRINT_KEYS).toContain(bp.key);
    }
  });

  it('awards universal + industry + personality weighting per SHORTLIST_WEIGHTS', () => {
    const profile: BlueprintShortlistProfile = {
      brand_personality: ['Trustworthy', 'Warm', 'Professional'],
      industry_slug: 'dental',
    };

    const entries = resolveBlueprintShortlistWithScores(profile, normalized);
    const byKey = new Map(entries.map((e) => [e.blueprint.key, e]));

    const about = byKey.get('story_split');
    expect(about).toBeDefined();
    expect(about!.industry_match).toBe(true);
    expect(about!.is_universal).toBe(true);
    expect(about!.personality_hits).toEqual(
      expect.arrayContaining(['Trustworthy', 'Warm', 'Professional']),
    );
    expect(about!.score).toBe(
      SHORTLIST_WEIGHTS.universalBonus +
        SHORTLIST_WEIGHTS.industrySlugMatch +
        SHORTLIST_WEIGHTS.perPersonalityHit * 3,
    );
  });

  it('includes universal-only blueprints regardless of industry slug match', () => {
    const profile: BlueprintShortlistProfile = {
      brand_personality: ['Minimal'],
      industry_slug: 'dental',
    };

    const ranked = resolveBlueprintShortlist(profile, normalized);

    const universalOnlyKeys = normalized
      .filter((bp) => bp.is_universal && bp.industry_slugs.length === 0)
      .map((bp) => bp.key);

    for (const key of universalOnlyKeys) {
      expect(ranked.some((bp) => bp.key === key)).toBe(true);
    }
  });

  it('excludes blueprints with zero axis hits and no universal flag', () => {
    const profile: BlueprintShortlistProfile = {
      brand_personality: ['Playful'],
      style_preferences: ['Playful'],
      industry_slug: 'small-business',
    };

    const entries = resolveBlueprintShortlistWithScores(profile, normalized);
    for (const entry of entries) {
      expect(entry.score > 0 || entry.is_universal).toBe(true);
    }

    const omitted = normalized.filter(
      (bp) =>
        !bp.is_universal &&
        scoreBlueprintForProfile(bp, profile).score === 0,
    );
    for (const bp of omitted) {
      expect(entries.some((e) => e.blueprint.key === bp.key)).toBe(false);
    }
  });

  it('returns a stable order for equal scores (input-library order wins)', () => {
    const profile: BlueprintShortlistProfile = {
      brand_personality: ['Trustworthy'],
      industry_slug: 'dental',
    };

    const first = resolveBlueprintShortlist(profile, normalized);
    const second = resolveBlueprintShortlist(profile, normalized);

    expect(first.map((bp) => bp.key)).toEqual(second.map((bp) => bp.key));
  });

  it('honors the limit option without reshuffling the ranking', () => {
    const profile: BlueprintShortlistProfile = {
      brand_personality: ['Trustworthy', 'Warm', 'Professional'],
      industry_slug: 'dental',
    };

    const full = resolveBlueprintShortlist(profile, normalized);
    const capped = resolveBlueprintShortlist(profile, normalized, { limit: 5 });

    expect(capped).toHaveLength(5);
    expect(capped.map((bp) => bp.key)).toEqual(
      full.slice(0, 5).map((bp) => bp.key),
    );
  });

  it('tolerates a profile with no axes picked — returns universals only', () => {
    const ranked = resolveBlueprintShortlist({}, normalized);

    expect(ranked.length).toBeGreaterThan(0);
    for (const bp of ranked) {
      expect(bp.is_universal).toBe(true);
    }
  });

  it('hides inactive blueprints unless includeInactive is set', () => {
    const hasInactive = normalized.some((bp) => !bp.is_active);
    if (!hasInactive) return; // no inactive entries to validate against yet

    const profile: BlueprintShortlistProfile = {
      brand_personality: ['Trustworthy'],
    };

    const ranked = resolveBlueprintShortlist(profile, normalized);
    for (const bp of ranked) expect(bp.is_active).toBe(true);

    const withInactive = resolveBlueprintShortlist(profile, normalized, {
      includeInactive: true,
    });
    expect(withInactive.length).toBeGreaterThanOrEqual(ranked.length);
  });
});

// ── Design-decision affinity (ADR-039 Style axis, #2774) ──────────────────

describe('design-decision affinity scoring', () => {
  // Synthetic: `base` has its authored arrays stripped so the math is tested
  // against a known zero. The authored arrays are tested on real entries in
  // the next block.
  const base = {
    ...normalized[0],
    atmospheres: undefined,
    animation_tiers: undefined,
    spacing_modes: undefined,
  } as (typeof normalized)[number];
  const withAffinity = {
    ...base,
    atmospheres: ['editorial-luxury'],
    animation_tiers: ['expressive'],
    spacing_modes: ['spacious'],
  } as typeof base;

  const fullPicks: BlueprintShortlistProfile = {
    atmosphere: 'editorial-luxury',
    animation_tier: 'expressive',
    spacing_mode: 'spacious',
  };

  it('adds each axis weight exactly once on a hit', () => {
    const before = scoreBlueprintForProfile(base, fullPicks);
    const after = scoreBlueprintForProfile(withAffinity, fullPicks);

    expect(after.score - before.score).toBe(
      SHORTLIST_WEIGHTS.atmosphereMatch +
        SHORTLIST_WEIGHTS.animationTierMatch +
        SHORTLIST_WEIGHTS.spacingModeMatch,
    );
    expect(after.atmosphere_match).toBe(true);
    expect(after.animation_tier_match).toBe(true);
    expect(after.spacing_mode_match).toBe(true);
  });

  it('scores nothing when the blueprint declares no affinity', () => {
    const entry = scoreBlueprintForProfile(base, fullPicks);

    expect(entry.atmosphere_match).toBe(false);
    expect(entry.animation_tier_match).toBe(false);
    expect(entry.spacing_mode_match).toBe(false);
    expect(entry.score).toBe(scoreBlueprintForProfile(base, {}).score);
  });

  it('scores nothing when the profile made no design decisions', () => {
    // The pre-#2774 caller shape. An affinity-carrying blueprint must score
    // identically for it, or publishing the vocabularies would silently
    // re-rank every existing shortlist.
    expect(scoreBlueprintForProfile(withAffinity, {}).score).toBe(
      scoreBlueprintForProfile(base, {}).score,
    );
  });

  it('scores nothing on a near-miss pick', () => {
    const entry = scoreBlueprintForProfile(withAffinity, {
      atmosphere: 'minimal-clinical',
      animation_tier: 'subtle',
      spacing_mode: 'compact',
    });

    expect(entry.atmosphere_match).toBe(false);
    expect(entry.animation_tier_match).toBe(false);
    expect(entry.spacing_mode_match).toBe(false);
    expect(entry.score).toBe(scoreBlueprintForProfile(base, {}).score);
  });

  it('never filters — an affinity miss re-ranks but cannot shrink a shortlist', () => {
    const profile: BlueprintShortlistProfile = {
      brand_personality: ['Trustworthy', 'Warm', 'Professional'],
      industry_slug: 'dental',
      atmosphere: 'editorial-luxury',
      animation_tier: 'expressive',
      spacing_mode: 'spacious',
    };

    const withoutDecisions = resolveBlueprintShortlist(
      {
        brand_personality: profile.brand_personality,
        industry_slug: profile.industry_slug,
      },
      normalized,
    );
    const withDecisions = resolveBlueprintShortlist(profile, normalized);

    expect(withDecisions.map((bp) => bp.key).sort()).toEqual(
      withoutDecisions.map((bp) => bp.key).sort(),
    );
  });

  it('lets a fully-matching blueprint outrank a bare universal one', () => {
    // The weights are tuned so the three design decisions (3+2+1 = 6) clear
    // `universalBonus` (5). That ordering is the point of the tuning, so it
    // is asserted rather than left to the constants.
    expect(
      SHORTLIST_WEIGHTS.atmosphereMatch +
        SHORTLIST_WEIGHTS.animationTierMatch +
        SHORTLIST_WEIGHTS.spacingModeMatch,
    ).toBeGreaterThan(SHORTLIST_WEIGHTS.universalBonus);
  });
});

// ── Authored library affinity (#2824) ─────────────────────────────────────

describe('authored library affinity', () => {
  const entry = (key: string) => {
    const bp = normalized.find((b) => b.key === key);
    if (!bp) throw new Error(`no library entry "${key}"`);
    return bp;
  };

  it('gives every live atmosphere at least one entry and no entry a deprecated one', () => {
    const declared = new Set(normalized.flatMap((bp) => bp.atmospheres ?? []));
    const live = ATMOSPHERE_VALUES.filter((a) => !(a in DEPRECATED_ATMOSPHERES));

    expect(live.filter((a) => !declared.has(a))).toEqual([]);
    expect(Object.keys(DEPRECATED_ATMOSPHERES).filter((a) => declared.has(a as Atmosphere))).toEqual([]);
  });

  it('matches an atmosphere on a real entry', () => {
    const bp = entry('testimonials_featured_large');

    expect(scoreBlueprintForProfile(bp, { atmosphere: 'editorial-luxury' }).atmosphere_match).toBe(true);
    expect(scoreBlueprintForProfile(bp, { atmosphere: 'warm-soft' }).atmosphere_match).toBe(false);
  });

  it('scores a deprecated atmosphere pick as its replacement', () => {
    // `clean-bright` is still on stored profile rows; the library only
    // declares `none`, which replaced it.
    const bp = entry('logo_wall');

    expect(scoreBlueprintForProfile(bp, { atmosphere: 'clean-bright' }).atmosphere_match).toBe(true);
    expect(scoreBlueprintForProfile(bp, { atmosphere: 'minimal-clinical' }).atmosphere_match).toBe(true);
    expect(scoreBlueprintForProfile(entry('cta_centered'), { atmosphere: 'clean-bright' }).atmosphere_match).toBe(
      false,
    );
  });

  it('matches an animation tier on a real entry, and every moderate entry takes expressive too', () => {
    const bp = entry('stats_bar');

    expect(scoreBlueprintForProfile(bp, { animation_tier: 'moderate' }).animation_tier_match).toBe(true);
    expect(scoreBlueprintForProfile(bp, { animation_tier: 'expressive' }).animation_tier_match).toBe(true);
    expect(scoreBlueprintForProfile(bp, { animation_tier: 'subtle' }).animation_tier_match).toBe(false);

    // A client who picks more motion must not rank motion-carrying entries lower.
    const moderateOnly = normalized
      .filter((b) => b.animation_tiers?.includes('moderate') && !b.animation_tiers.includes('expressive'))
      .map((b) => b.key);
    expect(moderateOnly).toEqual([]);
  });

  it('matches a spacing mode on a real entry', () => {
    const bp = entry('hero_interior_minimal');

    expect(scoreBlueprintForProfile(bp, { spacing_mode: 'compact' }).spacing_mode_match).toBe(true);
    expect(scoreBlueprintForProfile(bp, { spacing_mode: 'spacious' }).spacing_mode_match).toBe(false);
  });
});
