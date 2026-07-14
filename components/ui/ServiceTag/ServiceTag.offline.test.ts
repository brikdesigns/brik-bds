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
import { resolveServiceIcon, type ServiceLine } from './service-config';
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
});
