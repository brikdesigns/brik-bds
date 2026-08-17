/**
 * ServiceTag offline-resolution / no-404 regression test (#1242).
 *
 * The guarantee: ServiceTag renders every service glyph from a BDS-bundled
 * inline set with no request to a consumer's `/public/icons/` — so it can never
 * 404 (the old string-derived-URL model 404'd for 54/73 live services). The
 * `components` vitest project runs in node with no network, so this asserts the
 * two invariants that make the guarantee hold:
 *   1. `resolveServiceIcon` ALWAYS returns a key present in the bundled set.
 *   2. Every service-line default is bundled (it is the guaranteed fallback).
 * JSX is avoided to keep this a `.test.ts` file (include glob is `**\/*.test.ts`).
 */
import { describe, it, expect } from 'vitest';
import {
  resolveServiceIcon,
  serviceIconOverrides,
  normalizeServiceName,
  SERVICE_LINE_GLYPH_PREFIX,
  type ServiceLine,
} from './service-config';
import { SERVICE_ICON_SVGS } from './service-icons.generated';

const LINES: ServiceLine[] = [
  'brand',
  'marketing',
  'information',
  'product',
  'back-office',
  'service',
];

describe('ServiceTag — offline glyph resolution (no 404)', () => {
  it('bundles a non-empty inline SVG set at module load (zero network)', () => {
    const keys = Object.keys(SERVICE_ICON_SVGS);
    expect(keys.length).toBeGreaterThan(0);
    // Bundled markup is real inner SVG — a `<path`, never a URL or empty box.
    expect(SERVICE_ICON_SVGS[keys[0]]).toContain('<path');
  });

  it('resolves a line-level tag (no serviceName) to a bundled glyph for every line', () => {
    for (const line of LINES) {
      const key = resolveServiceIcon(line);
      expect(SERVICE_ICON_SVGS[key], `line default for "${line}" must be bundled`).toBeDefined();
    }
  });

  it('resolves a known mapped service to its specific bundled glyph', () => {
    const key = resolveServiceIcon('back-office', 'CRM Setup and Data Cleanup');
    expect(key).toBe('back-office-crm-data');
    expect(SERVICE_ICON_SVGS[key]).toContain('<path');
  });

  it('falls back to the bundled line default for an UNMAPPED service — never a miss', () => {
    // A tiered DB name the icon set will never enumerate (the exact 404 case).
    const key = resolveServiceIcon('back-office', 'CRM Setup and Data Cleanup (High-End)');
    expect(SERVICE_ICON_SVGS[key]).toBeDefined();
    expect(key).toBe('back-office-design'); // the back-office line default
  });

  it('every override target and line default is a real bundled key (no dangling map entry)', () => {
    for (const line of LINES) {
      const key = resolveServiceIcon(line, `${line} definitely-not-a-real-service xyz`);
      expect(SERVICE_ICON_SVGS[key]).toBeDefined();
    }
  });

  // `deriveIconName` matches the override key by EXACT string, so a CMS record
  // spelled "X and Y" misses an "X & Y"-only entry and silently renders the
  // line default. Two such gaps shipped a generic glyph on brikdesigns.com
  // (#1774): "Training Setup and Organization" and "Web Design and
  // Development". Both conjunction spellings must be present, on the same glyph.
  it('pairs every " & " override key with its " and " spelling, and vice versa', () => {
    const missing: string[] = [];
    for (const [name, glyph] of Object.entries(serviceIconOverrides)) {
      const sibling = name.includes(' & ')
        ? name.replace(/ & /g, ' and ')
        : name.includes(' and ')
          ? name.replace(/ and /g, ' & ')
          : null;
      if (!sibling) continue;
      if (serviceIconOverrides[sibling] !== glyph) {
        missing.push(`"${name}" → ${glyph} has no matching "${sibling}"`);
      }
    }
    expect(missing, `alias-pair parity gaps:\n${missing.join('\n')}`).toEqual([]);
  });

  it('resolves the #1774 regressions to their own glyph, not the line default', () => {
    expect(resolveServiceIcon('back-office', 'Training Setup and Organization')).toBe(
      'back-office-training-setup',
    );
    expect(resolveServiceIcon('marketing', 'Web Design and Development')).toBe(
      'marketing-web-design',
    );
  });

  // #1775: 14 of the 37 live brikdesigns.com service names resolved to their
  // line default because they had no override and their normalized name did not
  // match a bundled basename — so they read as generic on the plans/services
  // pages. These ten had an obvious bundled pair; each must reach it.
  it('resolves the #1775 names to their own glyph, not the line default', () => {
    const expected: [ServiceLine, string, string][] = [
      ['brand', 'Logo Design', 'brand-logo'],
      ['brand', 'Letterhead Stationary', 'brand-stationary'],
      ['brand', 'Online Business Listings', 'brand-listings'],
      ['marketing', 'Email Marketing', 'marketing-email'],
      ['product', 'Mobile App Design', 'product-app-design'],
      ['product', 'SaaS and Enterprise Design', 'product-enterprise-design'],
      ['product', 'SaaS & Enterprise Design', 'product-enterprise-design'],
      ['information', 'Intake Forms', 'info-intake-form'],
      ['information', 'Sales Resources', 'info-sales-materials'],
      ['information', 'Signage Design', 'info-signage'],
      ['information', 'Welcome Onboarding Kit', 'info-welcome-kit'],
    ];
    for (const [line, name, glyph] of expected) {
      expect(resolveServiceIcon(line, name), `"${name}" must resolve to ${glyph}`).toBe(glyph);
      expect(SERVICE_ICON_SVGS[glyph]).toContain('<path');
    }
  });

  // #1775 AC 2 — the last four names now reach a specific glyph. No bundled art
  // depicts a slide deck or a proposal, so these share the closest existing
  // glyph rather than sitting on the line default. Sharing is the established
  // pattern (`marketing-web-design` serves 10 names). If art is commissioned
  // later, repoint these; the assertion that matters is "not the line default".
  it('gives the four #1775 art-less names a specific glyph, not the line default', () => {
    const expected: [string, string][] = [
      ['Presentation Design', 'info-layout-design'],
      ['Sales Pitch Deck', 'info-sales-materials'],
      ['Sales Proposal', 'info-sales-materials'],
      ['One-Pager', 'info-intake-form'],
    ];
    for (const [name, glyph] of expected) {
      expect(resolveServiceIcon('information', name), name).toBe(glyph);
      expect(resolveServiceIcon('information', name)).not.toBe('info-design');
      expect(SERVICE_ICON_SVGS[glyph]).toContain('<path');
    }
  });

  // Zero live `information` service may fall back now. This is the AC-4 gate for
  // the whole #1775 effort: it fails the moment a new name lands unmapped, which
  // is exactly how 14 of 37 went generic unnoticed.
  it('leaves NO live information service on the line default', () => {
    const live = [
      'Infographics', 'Intake Forms', 'Layout Design', 'One-Pager',
      'Presentation Design', 'Print Materials', 'Sales Pitch Deck',
      'Sales Proposal', 'Sales Resources', 'Signage Design',
      'Welcome Onboarding Kit',
    ];
    const generic = live.filter((n) => resolveServiceIcon('information', n) === 'info-design');
    expect(generic, `still generic: ${generic.join(', ')}`).toEqual([]);
  });

  // The naming convention, enforced. A glyph whose basename does not start with
  // its line's prefix is unreachable by derivation and can only ever be found via
  // an override — a silent trap for the next person adding art. Two glyphs had
  // already fallen in (`patient-experience`, `website-experience`, renamed in
  // #1775), and nothing would have caught a third.
  it('names every bundled glyph with its service line prefix', () => {
    const prefixes = [...new Set(Object.values(SERVICE_LINE_GLYPH_PREFIX))];
    const offenders = Object.keys(SERVICE_ICON_SVGS).filter(
      (key) => !prefixes.some((p) => key.startsWith(`${p}-`)),
    );
    expect(
      offenders,
      `glyphs with no line prefix (unreachable by derivation):\n${offenders.join('\n')}\n` +
        `valid prefixes: ${prefixes.join(', ')}`,
    ).toEqual([]);
  });

  // The prefix table must actually match what deriveIconName builds, or the
  // convention above is documentation that lies.
  it('derives keys that match the declared prefix for every line', () => {
    for (const [line, prefix] of Object.entries(SERVICE_LINE_GLYPH_PREFIX)) {
      const key = resolveServiceIcon(line as ServiceLine, 'Totally Unmapped Service Xyz');
      // Unmapped -> line default, which must itself carry the line prefix.
      expect(key.startsWith(`${prefix}-`), `${line} default "${key}" lacks "${prefix}-"`).toBe(true);
    }
  });

  // `information` abbreviates to `info-`; assert the abbreviation rather than
  // trusting the branch, since it is the one line whose prefix != its id.
  it('abbreviates the information line to info-', () => {
    expect(SERVICE_LINE_GLYPH_PREFIX.information).toBe('info');
    expect(normalizeServiceName('Sales Pitch Deck')).toBe('sales-pitch-deck');
    // A brand-new information service with matching art resolves with no override.
    expect(resolveServiceIcon('information', 'Signage')).toBe('info-signage');
  });
});
