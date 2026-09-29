/**
 * Icon weight-resolution regression test (#1050).
 *
 * `<Icon>` picks its Phosphor weight in this precedence: explicit `weight` prop
 * → ambient provider default (ThemeProvider's `defaultIconWeight`) → `'bold'`.
 * Weight is applied by rewriting the Phosphor icon *name* (`ph:star` →
 * `ph:star-fill`), so the contract under test is the resolved name handed to
 * Iconify — not pixels. We stub `@iconify/react` to echo that name into markup,
 * making the assertion deterministic and independent of the bundled subset;
 * React context propagates through `renderToStaticMarkup`, so ThemeProvider's
 * default reaches the nested `<Icon>` with no DOM.
 */
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect, vi } from 'vitest';
import { PHOSPHOR_WEIGHT_TOKEN, DEFAULT_ICON_WEIGHT } from './icon-weight';
import type { IconWeight } from './icon-weight';
// Vite raw-import of the type module's source (see types/raw.d.ts), so the
// carve-out doc assertion reads the TSDoc without a node:fs dependency.
import iconWeightSource from './icon-weight.ts?raw';

vi.mock('@iconify/react', async () => {
  const { createElement: h } = await import('react');
  return {
    addCollection: () => {},
    // Echo the resolved icon name so the rendered markup reveals the weight.
    Icon: (props: { icon?: unknown }) => h('span', { 'data-icon': String(props.icon) }),
  };
});

// Imported after the mock so Icon.tsx binds to the stubbed Iconify Icon.
const { Icon } = await import('./Icon');
const { ThemeProvider } = await import('../../providers/ThemeProvider');
// The story meta itself is the unit under test below — imported after the mock
// because Icon.stories.tsx pulls in ./Icon.
const meta = (await import('./Icon.stories')).default;

const nameOf = (markup: string) => markup.match(/data-icon="([^"]*)"/)?.[1];

const render = (
  defaultIconWeight: IconWeight | undefined,
  props: { weight?: IconWeight },
) => {
  const icon = createElement(Icon, { icon: 'ph:star', ...props });
  const tree = defaultIconWeight
    ? createElement(ThemeProvider, { defaultIconWeight, persist: false, applyToBody: false, children: icon })
    : icon;
  return nameOf(renderToStaticMarkup(tree));
};

describe('Icon — weight resolution', () => {
  it('falls back to outline-bold (ph:star-bold) with no provider and no prop', () => {
    // The #2405 vocabulary rename must NOT move the rendered glyph: the default
    // resolves to the same `ph:star-bold` it did when named `bold`.
    expect(render(undefined, {})).toBe('ph:star-bold');
  });

  it('takes the provider default when no prop is given', () => {
    expect(render('fill', {})).toBe('ph:star-fill');
  });

  it('lets an explicit weight prop win over the provider default', () => {
    expect(render('fill', { weight: 'outline-bold' })).toBe('ph:star-bold');
  });

  it('outline resolves to the unsuffixed Phosphor name (no rewrite)', () => {
    expect(render('outline-bold', { weight: 'outline' })).toBe('ph:star');
  });

  it('deprecated aliases resolve identically to their renamed weights', () => {
    // `bold` ≡ `outline-bold`, `regular` ≡ `outline` — the aliases exist only so
    // consumers migrate on their own cadence; they must render the same glyph.
    expect(render(undefined, { weight: 'bold' })).toBe(render(undefined, { weight: 'outline-bold' }));
    expect(render(undefined, { weight: 'regular' })).toBe(render(undefined, { weight: 'outline' }));
    expect(render(undefined, { weight: 'bold' })).toBe('ph:star-bold');
    expect(render(undefined, { weight: 'regular' })).toBe('ph:star');
  });

  it('rewrites fill on a linear glyph (visual no-op — the documented carve-out)', () => {
    // `fill` on a glyph with no enclosed area (ph:arrows-clockwise) still
    // rewrites the name, but is a visual no-op. The carve-out is documented on
    // the IconWeight type so authors reach for outline-bold, not fill; here we
    // assert both the rewrite and that the type's TSDoc names the carve-out.
    const markup = renderToStaticMarkup(createElement(Icon, { icon: 'ph:arrows-clockwise', weight: 'fill' }));
    expect(nameOf(markup)).toBe('ph:arrows-clockwise-fill');

    expect(iconWeightSource).toMatch(/linear-glyph carve-out/i);
    expect(iconWeightSource).toContain('arrows-clockwise');
  });
});

/**
 * The `<Icon weight>` Storybook control drifted off the type for two renames
 * (#2627): it advertised Phosphor's flat list, so `thin`/`light` silently
 * no-opped through `applyWeight` and the ratified `outline-*` names could not be
 * selected at all. These assertions derive both sides from source — the
 * deprecated set is parsed out of `icon-weight.ts`, never hard-coded — so the
 * next rename fails here instead of stranding the control again.
 */
describe('Icon — story weight control tracks IconWeight (#2627)', () => {
  const storyOptions = meta.argTypes?.weight?.options as string[] | undefined;
  const deprecated = [...iconWeightSource.matchAll(/@deprecated[\s\S]*?\*\/\s*\|\s*'([^']+)'/g)].map((m) => m[1]);

  it('parses the @deprecated aliases out of icon-weight.ts', () => {
    // Guards the two assertions below: an empty parse would pass them vacuously.
    expect(deprecated).toEqual(['regular', 'bold']);
    expect(storyOptions).toBeDefined();
  });

  it('offers only weights applyWeight can resolve', () => {
    // An option missing from PHOSPHOR_WEIGHT_TOKEN falls through to the bare
    // Phosphor name — a silent no-op, not an error. See Icon.tsx applyWeight.
    for (const option of storyOptions ?? []) {
      expect(Object.keys(PHOSPHOR_WEIGHT_TOKEN)).toContain(option);
    }
  });

  it('offers every canonical weight and no deprecated alias', () => {
    const canonical = Object.keys(PHOSPHOR_WEIGHT_TOKEN).filter((w) => !deprecated.includes(w));
    expect([...(storyOptions ?? [])].sort()).toEqual([...canonical].sort());
  });

  it('names outline-bold as the default in the control description', () => {
    expect(meta.argTypes?.weight?.description).toContain(DEFAULT_ICON_WEIGHT);
  });
});
