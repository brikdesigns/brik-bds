import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

/**
 * Inspect-widget token-allowlist coverage gate.
 *
 * The inspector (components/ui/BrikDevBar/widgets/inspect-widget.js) classifies
 * a CSS custom property as a known BDS token by prefix-matching its name against
 * VALID_TOKEN_PREFIXES. That hand-maintained list silently drifted from the real
 * token taxonomy and began flagging shipping tokens — --ease-*, --box-shadow-*,
 * --icon-*, --size-*, --layout-*, --stagger-*, … — as "UNKNOWN TOKENS".
 *
 * This gate fails when a token declared in the committed token sources isn't
 * recognized by the prefix list. Add the prefix to VALID_TOKEN_PREFIXES to fix.
 * Lives with the other file-reading .mjs gates (the `scripts` vitest project) so
 * it runs in node without dragging @types/node into the components tsconfig.
 */

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..', '..');

// Committed token sources that declare BDS custom properties: the Style
// Dictionary export plus the two hand-authored semantic layers (bridge.css owns
// --ease-*; gap-fills.css owns --content-width-*/--layout-*). dist/tokens.css is
// a build artifact and not committed, so we read source.
const TOKEN_SOURCES = [
  'tokens/figma-tokens.css',
  'tokens/bridge.css',
  'tokens/gap-fills.css',
];

// Standalone breakpoint primitives — numeric values consumed in media-query
// math, never as `var(--web)`. Not worth a prefix; documented as exceptions.
const EXCEPTIONS = new Set(['--web', '--tablet', '--mobile']);

const widgetSrc = readFileSync(
  join(repoRoot, 'components/ui/BrikDevBar/widgets/inspect-widget.js'),
  'utf8',
);
const block = widgetSrc.match(/const VALID_TOKEN_PREFIXES = \[([\s\S]*?)\];/);
if (!block) throw new Error('VALID_TOKEN_PREFIXES not found in inspect-widget.js');
const PREFIXES = [...block[1].matchAll(/'(--[a-z-]+)'/g)].map((m) => m[1]);

/** Mirror of the inspector's classifier (inspect-widget.js): startsWith match. */
const isKnown = (name) => PREFIXES.some((p) => name.startsWith(p));

const declaredNames = new Set();
for (const rel of TOKEN_SOURCES) {
  const css = readFileSync(join(repoRoot, rel), 'utf8');
  for (const m of css.matchAll(/^\s*(--[a-z0-9-]+)\s*:/gm)) declaredNames.add(m[1]);
}

describe('inspect widget — token allowlist coverage', () => {
  it('recognizes every token declared in the committed token sources', () => {
    const unrecognized = [...declaredNames]
      .filter((n) => !isKnown(n) && !EXCEPTIONS.has(n))
      .sort();
    expect(unrecognized).toEqual([]);
  });

  // Explicit regression markers for the families that were silently dropped.
  it.each([
    '--ease-out',
    '--ease-in',
    '--ease-in-out',
    '--ease-spring',
    '--box-shadow-md',
    '--icon-md',
    '--size-1000',
    '--content-width-wide',
    '--layout-md',
    '--stagger-3',
    '--page-primary',
    '--duration-normal',
  ])('classifies %s as a known token', (token) => {
    expect(isKnown(token)).toBe(true);
  });

  it('still flags genuine non-BDS custom properties as unknown', () => {
    for (const fake of ['--nav-height', '--site-gutter', '--my-random-var']) {
      expect(isKnown(fake)).toBe(false);
    }
  });
});
