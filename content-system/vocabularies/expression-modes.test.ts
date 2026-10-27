/// <reference types="vite/client" />
import { describe, it, expect } from 'vitest';

import { SPACING_MODE_VALUES, isSpacingMode } from './spacing-mode';
import { RADIUS_MODE_VALUES, isRadiusMode } from './radius-mode';
import { ELEVATION_MODE_VALUES, isElevationMode } from './elevation-mode';
import { TYPOGRAPHY_MODE_VALUES, isTypographyMode } from './typography-mode';
import {
  BORDERWIDTH_MODE_VALUES,
  BORDERWIDTH_MODE_DEPRECATED_ALIASES,
  isBorderWidthMode,
} from './borderwidth-mode';

/**
 * Expression-mode vocabulary contract (ADR-039 amendment, #2774).
 *
 * The five Style-axis vocabularies must equal the `[data-mode-*]` selector
 * values the shipped CSS actually switches on. "BDS CSS selector values win"
 * is the rule; this is the instrument that enforces it.
 *
 * WHY THE CSS AND NOT THE REGISTRY. All five mode files are emitted from the
 * COLLECTIONS registry in `scripts/generate-modes-css.mjs` (border-width since
 * #2601), but the CSS is the artifact that actually ships in dist/tokens.css —
 * a drift the CSS does not show cannot reach a browser.
 *
 * DEFAULT MODES ARE NOT MEMBERS. Each axis has a default expressed by the
 * ABSENCE of the attribute (`soft` radius, `subtle` elevation, `default`
 * border-width/spacing/typography). No selector carries them, so no
 * vocabulary does either — see each module's header.
 *
 * DEPRECATED ALIASES ARE SELECTORS, NOT MEMBERS. A retired mode name kept for
 * one release (border-width `bold` → `thick`) is matched by the CSS, so the
 * selector set is members + aliases.
 */

/**
 * The mode CSS, read through Vite's `?raw` loader rather than `node:fs` —
 * `@types/node` is not a dependency of this repo, so a fs import fails
 * `npm run typecheck` even though it runs fine under vitest. Same approach the
 * sibling atmosphere suite takes to repo files.
 */
const MODE_CSS = import.meta.glob('../../tokens/modes-*.css', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

function readModeCss(cssFile: string): string {
  const key = Object.keys(MODE_CSS).find((p) => p.endsWith(`/${cssFile}`));
  if (key === undefined) {
    throw new Error(
      `${cssFile} not matched by the modes-*.css glob — found: ${Object.keys(MODE_CSS).join(', ')}`,
    );
  }
  return MODE_CSS[key];
}

interface ModeAxis {
  readonly axis: string;
  /** The `data-mode-<attribute>` segment, which is NOT always the file stem. */
  readonly attribute: string;
  readonly cssFile: string;
  readonly values: readonly string[];
  readonly guard: (value: string) => boolean;
  /** The attribute-absent default, asserted to be absent from the selectors. */
  readonly defaultMode: string;
  /** Retired names still matched by a selector, keyed to their replacement member. */
  readonly aliases?: Readonly<Record<string, string>>;
}

const MODE_AXES: readonly ModeAxis[] = [
  {
    axis: 'spacing-mode',
    attribute: 'spacing',
    cssFile: 'modes-spacing.css',
    values: SPACING_MODE_VALUES,
    guard: isSpacingMode,
    defaultMode: 'default',
  },
  {
    axis: 'radius-mode',
    attribute: 'radius',
    cssFile: 'modes-borderradius.css',
    values: RADIUS_MODE_VALUES,
    guard: isRadiusMode,
    defaultMode: 'soft',
  },
  {
    axis: 'elevation-mode',
    attribute: 'elevation',
    cssFile: 'modes-elevation.css',
    values: ELEVATION_MODE_VALUES,
    guard: isElevationMode,
    defaultMode: 'subtle',
  },
  {
    axis: 'typography-mode',
    attribute: 'typography',
    cssFile: 'modes-typography.css',
    values: TYPOGRAPHY_MODE_VALUES,
    guard: isTypographyMode,
    defaultMode: 'default',
  },
  {
    axis: 'borderwidth-mode',
    attribute: 'borderwidth',
    cssFile: 'modes-borderwidth.css',
    values: BORDERWIDTH_MODE_VALUES,
    guard: isBorderWidthMode,
    defaultMode: 'default',
    aliases: BORDERWIDTH_MODE_DEPRECATED_ALIASES,
  },
];

/**
 * Collect every value `[data-mode-<attribute>="…"]` is matched on in a CSS
 * source. Sorted + de-duplicated so the assertion reads as a set comparison.
 *
 * Comments are stripped first, and that is load-bearing rather than tidy:
 * every generated mode file documents its own `Selector contract:
 * \`[data-mode-x="a|b|c"]\`` in the header, which is a syntactically perfect
 * match for the pattern below. Reading it yields the phantom value `"a|b|c"`
 * — the first run of this suite reported exactly that on
 * modes-borderwidth.css.
 */
function selectorValues(css: string, attribute: string): string[] {
  const rules = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const pattern = new RegExp(`\\[data-mode-${attribute}="([^"]+)"\\]`, 'g');
  const found = new Set<string>();
  for (const match of rules.matchAll(pattern)) found.add(match[1]);
  return [...found].sort();
}

describe('expression-mode vocabularies match the shipped CSS selectors', () => {
  it.each(MODE_AXES)(
    '$axis equals the [data-mode-$attribute] values in $cssFile',
    ({ attribute, cssFile, values, aliases = {} }) => {
      expect(selectorValues(readModeCss(cssFile), attribute)).toEqual(
        [...values, ...Object.keys(aliases)].sort(),
      );
    },
  );

  it.each(MODE_AXES.filter((a) => a.aliases))(
    '$axis aliases each point at a member and pass the guard',
    ({ values, aliases = {}, guard }) => {
      for (const [alias, member] of Object.entries(aliases)) {
        expect(values).toContain(member);
        expect(values).not.toContain(alias);
        expect(guard(alias)).toBe(true);
      }
    },
  );

  it('reads one CSS file per declared axis and no stray ones', () => {
    // Positive control on the glob itself. A pattern that matched nothing
    // would make every readModeCss call throw — loud — but a pattern that
    // matched a SIXTH mode file would mean an axis ships with no vocabulary
    // and nothing above would say so.
    expect(Object.keys(MODE_CSS).map((p) => p.split('/').pop()).sort()).toEqual(
      MODE_AXES.map((a) => a.cssFile).sort(),
    );
  });

  it.each(MODE_AXES)(
    '$axis does not claim its attribute-absent default ($defaultMode)',
    ({ values, defaultMode, guard }) => {
      expect(values).not.toContain(defaultMode);
      expect(guard(defaultMode)).toBe(false);
    },
  );

  it.each(MODE_AXES)('$axis guard accepts every member', ({ values, guard }) => {
    for (const value of values) expect(guard(value)).toBe(true);
  });

  // Whether each axis then reaches dist/tokens.css is NOT asserted here.
  // `scripts/lint-mode-emission-coverage.mjs` already owns that question, and
  // dist/ is gitignored — a second copy of the check would fail in any fresh
  // checkout for a reason unrelated to the vocabularies.
});

describe('selectorValues — instrument validity', () => {
  // Positive control. Every assertion above is a comparison against this
  // parser's output; if it silently returned [] on a renamed attribute or a
  // reformatted selector, each one would compare empty-to-empty and the suite
  // would report five green axes while the CSS said something else.
  it('reads the values a real selector block carries', () => {
    const css = '[data-mode-radius="sharp"] { --a: 1px; }\n[data-mode-radius="pill"] { --a: 999px; }';
    expect(selectorValues(css, 'radius')).toEqual(['pill', 'sharp']);
  });

  it('reports a value the vocabulary does not carry', () => {
    const css = '[data-mode-radius="rounded"] { --a: 4px; }';
    expect(selectorValues(css, 'radius')).toEqual(['rounded']);
    expect([...RADIUS_MODE_VALUES].sort()).not.toEqual(['rounded']);
    expect(isRadiusMode('rounded')).toBe(false);
  });

  it('returns nothing for an attribute that is not present', () => {
    // `data-mode-motion` is the live case: ADR-039 maps expression `motion`
    // onto the animation tier precisely BECAUSE no such selector exists
    // (#2774 names it out of scope). An empty read here must stay
    // distinguishable from a match.
    expect(selectorValues('[data-mode-radius="sharp"] {}', 'motion')).toEqual([]);
  });
});
