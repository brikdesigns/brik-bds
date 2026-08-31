/**
 * Icon offline-resolution regression test (#1002).
 *
 * The guarantee: BDS `<Icon>` resolves `ph:*` from a bundled subset with no
 * request to api.iconify.design. The `components` vitest project runs in node
 * with no network, so a synchronous static render that emits real `<svg>`
 * markup is proof the icon resolved offline — a CDN-dependent icon would render
 * an empty placeholder here. JSX is avoided to keep this a `.test.ts` file (the
 * project's include glob is `**\/*.test.ts`).
 */
import { describe, it, expect } from 'vitest';
import { iconLoaded, getIcon } from '@iconify/react';
import { addBrikIcons } from './Icon';
import { offlineGapAt, BUNDLED_BASE_COUNT, offlineGapWarning } from './offline-coverage';

describe('Icon — offline resolution', () => {
  it('registers the bundled Phosphor subset at module load (no CDN needed)', () => {
    // Importing ./Icon runs addCollection(subset) as a side effect.
    expect(iconLoaded('ph:rocket')).toBe(true);
    expect(iconLoaded('ph:minus-circle')).toBe(true);
  });

  it('resolves a bundled icon to real SVG body data synchronously (zero network)', () => {
    // getIcon reads only the in-memory store — a non-null body here proves the
    // icon is bundled and never triggers a fetch to api.iconify.design.
    const data = getIcon('ph:magnifying-glass');
    expect(data).not.toBeNull();
    expect(data?.body).toContain('<path');
  });

  it('leaves an icon outside the subset to Iconify default (the documented fallback boundary)', () => {
    // `ph:atom` exists in Phosphor but is not used in shipped BDS source, so it
    // is intentionally not bundled — it would fall through to a runtime fetch.
    expect(iconLoaded('ph:atom')).toBe(false);
  });

  it('reports zero offline gap for the bundled weights (regular + bold twin)', () => {
    // The gen script bundles each base icon plus its `-bold` twin (#2253), so
    // both weights the general set ships resolve with no CDN fetch.
    expect(offlineGapAt('regular')).toBe(0);
    expect(offlineGapAt('bold')).toBe(0);
    expect(BUNDLED_BASE_COUNT).toBeGreaterThan(0);
  });

  it('reports a non-zero offline gap for weights with no bundled glyphs', () => {
    // fill/duotone/thin/light carry glyphs only where source uses them (today
    // just star-fill), so most bundled icons would fetch from the CDN — this is
    // the gap ThemeProvider warns on when set as a default weight.
    expect(offlineGapAt('fill')).toBeGreaterThan(0);
    expect(offlineGapAt('duotone')).toBe(BUNDLED_BASE_COUNT);
    expect(offlineGapAt('thin')).toBe(BUNDLED_BASE_COUNT);
  });

  it('emits the dev warning only for under-covered default weights (ThemeProvider gate)', () => {
    // ThemeProvider console.warns this message (dev only) at mount — the pure
    // function is what verifies the mechanism without a DOM.
    expect(offlineGapWarning('regular')).toBeNull();
    expect(offlineGapWarning('bold')).toBeNull();
    const warning = offlineGapWarning('fill');
    expect(warning).toContain('defaultIconWeight="fill"');
    expect(warning).toContain('Iconify');
  });

  it('addBrikIcons() registers a consumer collection for offline resolution', () => {
    expect(iconLoaded('demo:spark')).toBe(false);
    addBrikIcons({
      prefix: 'demo',
      icons: { spark: { body: '<path d="M8 0l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/>' } },
      width: 16,
      height: 16,
    });
    expect(iconLoaded('demo:spark')).toBe(true);
  });
});
