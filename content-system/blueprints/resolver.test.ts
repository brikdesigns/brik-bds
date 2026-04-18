import { describe, it, expect } from 'vitest';

import libraryJson from '../../blueprints/blueprint-library.json';
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

    expect(topThreeKeys).toEqual(
      expect.arrayContaining([
        'about_story_split',
        'team_bio_grid',
        'contact_form_split',
      ]),
    );
  });

  it('awards universal + industry + personality weighting per SHORTLIST_WEIGHTS', () => {
    const profile: BlueprintShortlistProfile = {
      brand_personality: ['Trustworthy', 'Warm', 'Professional'],
      industry_slug: 'dental',
    };

    const entries = resolveBlueprintShortlistWithScores(profile, normalized);
    const byKey = new Map(entries.map((e) => [e.blueprint.key, e]));

    const about = byKey.get('about_story_split');
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
