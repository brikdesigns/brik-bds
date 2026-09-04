/**
 * ContactIcon offline-resolution / no-404 regression test (split from
 * `SocialIcon` in brik-bds#1716 — see SocialIcon.offline.test.ts for the
 * social-platform sibling suite).
 *
 * The guarantee: ContactIcon renders every mark from a BDS-bundled inline set
 * with no request to a consumer's `/public/icons/` or a CDN — so it can never
 * 404, the same offline contract ServiceTag's #1242 fix established. The
 * `components` vitest project runs in node with no network, so this asserts
 * the invariants that make the guarantee hold:
 *   1. `CONTACT_ICON_SVGS` bundles a non-empty inline set at module load.
 *   2. Every one of the 5 marks from brik-bds#1716 is bundled.
 *   3. Every bundled mark carries the badge (`.bds-contact-icon__bg`) + glyph
 *      (`.bds-contact-icon__glyph`, `fill="currentColor"`) split the `type`
 *      prop depends on.
 *   4. `contactIconLabel` (the default `aria-label` ContactIcon renders
 *      unless `decorative` is passed) resolves a real, non-empty display
 *      name for every mark.
 *   5. `ContactIconEmphasis` has no `'brand'` member — contact marks have no
 *      brand identity, unlike `SocialIcon`. This is a type-level guarantee
 *      (`@ts-expect-error`), checked by `tsc --noEmit`, not a runtime branch.
 * JSX is avoided to keep this a `.test.ts` file (include glob is `**\/*.test.ts`);
 * that scopes this suite to the label-derivation logic, not the `role`/
 * `aria-hidden`/`aria-label` render output itself — no `.test.tsx` rendering
 * harness exists elsewhere in this repo (Logo included) to mirror.
 */
import { describe, it, expect } from 'vitest';
import { CONTACT_ICON_SVGS, CONTACT_ICON_PLATFORMS, type ContactIconPlatform } from './contact-icons.generated';
import { contactIconLabel, type ContactIconEmphasis } from './ContactIcon';

const EXPECTED_PLATFORMS: ContactIconPlatform[] = ['message', 'email', 'website', 'calendar', 'phone'];

describe('ContactIcon — offline mark resolution (no 404)', () => {
  it('bundles a non-empty inline SVG set at module load (zero network)', () => {
    const keys = Object.keys(CONTACT_ICON_SVGS);
    expect(keys.length).toBeGreaterThan(0);
    expect(CONTACT_ICON_SVGS[keys[0]]).toContain('<path');
  });

  it('bundles all 5 marks from the brik-bds#1716 contact-only set', () => {
    expect(CONTACT_ICON_PLATFORMS.sort()).toEqual([...EXPECTED_PLATFORMS].sort());
    for (const platform of EXPECTED_PLATFORMS) {
      expect(CONTACT_ICON_SVGS[platform], `"${platform}" must be bundled`).toBeDefined();
    }
  });

  it('every mark carries an independently targetable bg path + a currentColor glyph path', () => {
    for (const platform of EXPECTED_PLATFORMS) {
      const svg = CONTACT_ICON_SVGS[platform];
      expect(svg, `"${platform}" must be bundled`).toBeDefined();
      expect(svg, `"${platform}" bg path must be present`).toContain('class="bds-contact-icon__bg"');
      expect(svg, `"${platform}" glyph path must be present`).toContain('class="bds-contact-icon__glyph"');
      expect(svg, `"${platform}" glyph must use fill="currentColor" to stay recolorable`).toContain(
        'fill="currentColor"',
      );
    }
  });

  it('resolving an unknown mark is a TypeScript-level guarantee, not a runtime miss', () => {
    // ContactIconPlatform is derived from the bundled set (see
    // contact-icons.generated.ts) — there is no "unmapped mark" path to fall
    // back from, unlike ServiceTag's free-text serviceName resolution.
    for (const platform of EXPECTED_PLATFORMS) {
      expect(CONTACT_ICON_SVGS[platform]).toBeDefined();
    }
  });
});

describe('ContactIcon — default accessible name (decorative vs labeled branch)', () => {
  it('resolves a non-empty display name for every bundled mark', () => {
    for (const platform of EXPECTED_PLATFORMS) {
      const label = contactIconLabel(platform);
      expect(label, `"${platform}" must resolve a non-empty label`).toBeTruthy();
      expect(typeof label).toBe('string');
    }
  });

  it('humanizes every mark (no brand-cased override table needed, unlike SocialIcon)', () => {
    expect(contactIconLabel('message')).toBe('Message');
    expect(contactIconLabel('email')).toBe('Email');
    expect(contactIconLabel('website')).toBe('Website');
    expect(contactIconLabel('calendar')).toBe('Calendar');
    expect(contactIconLabel('phone')).toBe('Phone');
  });
});

describe('ContactIcon — no brand emphasis (brik-bds#1716)', () => {
  it('ContactIconEmphasis has no "brand" member — a type-level guarantee, not a runtime check', () => {
    // Contact marks have no brand identity, so unlike SocialIconEmphasis,
    // ContactIconEmphasis is intentionally narrower. This assignment must fail
    // `tsc --noEmit` — if `brand` is ever added back to the union, this line
    // stops erroring and the test itself fails (an unused `@ts-expect-error`
    // is a type error).
    // @ts-expect-error — 'brand' is not assignable to ContactIconEmphasis.
    const invalidEmphasis: ContactIconEmphasis = 'brand';
    expect(invalidEmphasis).toBe('brand');
  });
});
