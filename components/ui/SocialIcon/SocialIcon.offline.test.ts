/**
 * SocialIcon offline-resolution / no-404 regression test (brik-bds#1713;
 * split from the contact marks — see ContactIcon.offline.test.ts — in
 * brik-bds#1716).
 *
 * The guarantee: SocialIcon renders every platform mark from a BDS-bundled
 * inline set with no request to a consumer's `/public/icons/` or a CDN — so it
 * can never 404, the same offline contract ServiceTag's #1242 fix established.
 * The `components` vitest project runs in node with no network, so this
 * asserts the invariants that make the guarantee hold:
 *   1. `SOCIAL_ICON_SVGS` bundles a non-empty inline set at module load.
 *   2. Every one of the 10 platforms is bundled — the 6 social marks from
 *      brik-bds#1716 plus the 4 search/review marks added alongside them.
 *   3. Every bundled mark carries the badge (`.bds-social-icon__bg`) + glyph
 *      (`.bds-social-icon__glyph`, `fill="currentColor"`) split the `type`
 *      prop depends on.
 *   4. `socialIconLabel` (the default `aria-label` SocialIcon renders unless
 *      `decorative` is passed — see SocialIcon.tsx's cold-QA a11y fix)
 *      resolves a real, non-empty display name for every platform, including
 *      the brand-cased overrides a naive humanize would get wrong.
 * JSX is avoided to keep this a `.test.ts` file (include glob is `**\/*.test.ts`);
 * that scopes this suite to the label-derivation logic, not the `role`/
 * `aria-hidden`/`aria-label` render output itself — no `.test.tsx` rendering
 * harness exists elsewhere in this repo (Logo included) to mirror.
 */
import { describe, it, expect } from 'vitest';
import { SOCIAL_ICON_SVGS, SOCIAL_ICON_PLATFORMS, type SocialIconPlatform } from './social-icons.generated';
import { socialIconLabel, type SocialIconTone } from './SocialIcon';

const EXPECTED_PLATFORMS: SocialIconPlatform[] = [
  'youtube',
  'twitter',
  'instagram',
  'facebook',
  'linkedin',
  'yelp',
  'apple',
  'bing',
  'google',
  'tiktok',
];

describe('SocialIcon — offline mark resolution (no 404)', () => {
  it('bundles a non-empty inline SVG set at module load (zero network)', () => {
    const keys = Object.keys(SOCIAL_ICON_SVGS);
    expect(keys.length).toBeGreaterThan(0);
    expect(SOCIAL_ICON_SVGS[keys[0]]).toContain('<path');
  });

  it('bundles all 10 platforms (6 social + 4 search/review)', () => {
    expect(SOCIAL_ICON_PLATFORMS.sort()).toEqual([...EXPECTED_PLATFORMS].sort());
    for (const platform of EXPECTED_PLATFORMS) {
      expect(SOCIAL_ICON_SVGS[platform], `"${platform}" must be bundled`).toBeDefined();
    }
  });

  it('every mark carries an independently targetable bg path + a currentColor glyph path', () => {
    for (const platform of EXPECTED_PLATFORMS) {
      const svg = SOCIAL_ICON_SVGS[platform];
      expect(svg, `"${platform}" must be bundled`).toBeDefined();
      expect(svg, `"${platform}" bg path must be present`).toContain('class="bds-social-icon__bg"');
      expect(svg, `"${platform}" glyph path must be present`).toContain('class="bds-social-icon__glyph"');
      expect(svg, `"${platform}" glyph must use fill="currentColor" to stay recolorable`).toContain(
        'fill="currentColor"',
      );
    }
  });

  it('resolving an unknown platform is a TypeScript-level guarantee, not a runtime miss', () => {
    // SocialIconPlatform is derived from the bundled set (see
    // social-icons.generated.ts) — there is no "unmapped platform" path to
    // fall back from, unlike ServiceTag's free-text serviceName resolution.
    for (const platform of EXPECTED_PLATFORMS) {
      expect(SOCIAL_ICON_SVGS[platform]).toBeDefined();
    }
  });
});

/**
 * Tone coverage (brik-bds#2274). `tone` renders a `bds-social-icon--{tone}`
 * class and nothing else forces a matching pair of CSS rules to exist, so
 * widening `SocialIconTone` alone would ship a class that paints nothing.
 *
 * `Record<SocialIconTone, true>` makes that widening a COMPILE error here —
 * deleting `inverse` below and running `npx tsc --noEmit` reports
 * `TS2741: Property 'inverse' is missing` (measured 2026-09-04), the same
 * shape the customer-story platform map uses.
 *
 * The paired CSS rules cannot be asserted from this project: the `components`
 * vitest project runs with Vitest's default `css: false`, which stubs a CSS
 * module to the empty string — `?raw` and `?inline` both measured length 0
 * here — so a text assertion would pass vacuously rather than guard anything.
 * The rules themselves are covered by the `AllMarks` story's tone × type grid
 * (SocialIcon.stories.tsx) under the Storybook visual gate.
 */
const TONE_COVERAGE: Record<SocialIconTone, true> = {
  grayscale: true,
  brand: true,
  accent: true,
  inverse: true,
};

describe('SocialIcon — tone coverage', () => {
  it('enumerates every tone the CSS must carry a badge + glyph rule for', () => {
    expect(Object.keys(TONE_COVERAGE).sort()).toEqual(
      ['accent', 'brand', 'grayscale', 'inverse'],
    );
  });
});

describe('SocialIcon — default accessible name (decorative vs labeled branch)', () => {
  it('resolves a non-empty display name for every bundled platform', () => {
    // This is the name SocialIcon renders as `aria-label` when `decorative`
    // is NOT passed (the default) — `decorative` skips it entirely (aria-hidden,
    // no role/label), so every platform having a real name here is what makes
    // the default (labeled) branch safe to ship unconditionally.
    for (const platform of EXPECTED_PLATFORMS) {
      const label = socialIconLabel(platform);
      expect(label, `"${platform}" must resolve a non-empty label`).toBeTruthy();
      expect(typeof label).toBe('string');
    }
  });

  it('overrides the platforms a naive humanize would capitalize wrong', () => {
    expect(socialIconLabel('youtube')).toBe('YouTube');
    expect(socialIconLabel('linkedin')).toBe('LinkedIn');
    expect(socialIconLabel('twitter')).toBe('X (Twitter)');
    expect(socialIconLabel('tiktok')).toBe('TikTok');
  });

  it('humanizes the remaining platforms (no override needed)', () => {
    expect(socialIconLabel('instagram')).toBe('Instagram');
    expect(socialIconLabel('facebook')).toBe('Facebook');
    expect(socialIconLabel('yelp')).toBe('Yelp');
    expect(socialIconLabel('apple')).toBe('Apple');
    expect(socialIconLabel('bing')).toBe('Bing');
    expect(socialIconLabel('google')).toBe('Google');
  });
});
