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
import { resolveServiceIcon, serviceIconOverrides, type ServiceLine } from './service-config';
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
});
