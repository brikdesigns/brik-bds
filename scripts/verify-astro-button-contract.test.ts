/**
 * Astro Button class-contract gate (brik-bds#1441).
 *
 * The Astro blueprints (`content-system/blueprints/astro/*.astro`) hand-roll
 * `Button`'s markup as literal class strings
 * (`bds-button bds-button--{variant} bds-button--{size}` + a
 * `bds-button__content` span) because Astro can't render the React `<Button>`.
 * That copy is invisible to the type system: if `Button`'s class contract
 * changes — a renamed modifier, a dropped variant, a restructured content slot
 * — the Astro buttons keep the stale classes and silently lose their styling.
 *
 * This test pins the hand-rolled markup to `Button`'s real output. The contract
 * is derived from `Button` itself (never hardcoded here), so it tracks the
 * component:
 *   - outer tokens come from `composeButtonClasses` across every variant × size
 *     × modifier;
 *   - element/slot tokens (`__content`, `__icon`, …) are extracted from
 *     `Button.tsx` source.
 * A change to either that the Astro files don't follow fails this test — the
 * signal to update the hand-rolls (or, longer-term, replace them with a shared
 * Astro partial per #1438).
 *
 * Lives under `scripts/` (the `scripts` vitest project, run by `npm test` in
 * CI) alongside the other lint/gate tooling, not under `content-system/`, so it
 * can use node built-ins without dragging `@types/node` into the browser-facing
 * package tsconfig.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  composeButtonClasses,
  type ButtonSize,
  type ButtonVariant,
} from '../components/ui/Button';

const HERE = dirname(fileURLToPath(import.meta.url));
const ASTRO_DIR = join(HERE, '../content-system/blueprints/astro');
const BUTTON_TSX = join(HERE, '../components/ui/Button/Button.tsx');

const VARIANTS: ButtonVariant[] = [
  'primary', 'outline', 'secondary', 'ghost', 'inverse', 'on-color',
  'destructive', 'positive', 'danger', 'danger-outline', 'danger-ghost',
];
const SIZES: ButtonSize[] = ['tiny', 'sm', 'md', 'lg', 'xl'];

const BUTTON_TOKEN = /bds-(?:icon-)?button[\w-]*/g;

/** Every `bds-button*` token the real Button can emit. */
function contractTokens(): Set<string> {
  const tokens = new Set<string>();

  // Outer classes, exhaustively across the prop space that drives them.
  for (const variant of VARIANTS) {
    for (const size of SIZES) {
      for (const iconOnly of [false, true]) {
        for (const fullWidth of [false, true]) {
          for (const loading of [false, true]) {
            for (const selected of [false, true]) {
              const cls = composeButtonClasses({
                variant, size, iconOnly, fullWidth, loading, selected,
              });
              for (const m of cls.match(BUTTON_TOKEN) ?? []) tokens.add(m);
            }
          }
        }
      }
    }
  }

  // Element/slot classes that live in the render, not composeButtonClasses.
  const src = readFileSync(BUTTON_TSX, 'utf8');
  for (const m of src.match(BUTTON_TOKEN) ?? []) tokens.add(m);

  return tokens;
}

function astroFiles(): { name: string; text: string }[] {
  return readdirSync(ASTRO_DIR)
    .filter((f: string) => f.endsWith('.astro'))
    .map((f: string) => ({ name: f, text: readFileSync(join(ASTRO_DIR, f), 'utf8') }));
}

/** `bds-button*` tokens on real class attributes, not in doc comments. */
function buttonTokensInMarkup(text: string): string[] {
  const withoutBlockComments = text.replace(/\/\*[\s\S]*?\*\//g, '');
  const tokens: string[] = [];
  for (const line of withoutBlockComments.split('\n')) {
    if (/^\s*\*/.test(line)) continue; // JSDoc continuation line
    for (const m of line.match(BUTTON_TOKEN) ?? []) tokens.push(m);
  }
  return tokens;
}

describe('Astro blueprint Button class contract (#1441)', () => {
  const contract = contractTokens();
  const files = astroFiles();

  it('every hand-rolled bds-button* class exists in Button’s real contract', () => {
    const offenders: string[] = [];
    for (const { name, text } of files) {
      for (const token of new Set(buttonTokensInMarkup(text))) {
        if (!contract.has(token)) offenders.push(`${name}: "${token}"`);
      }
    }
    expect(
      offenders,
      `Astro buttons use classes Button no longer emits — update the hand-roll ` +
        `(or migrate to a shared partial, #1438):\n  ${offenders.join('\n  ')}`,
    ).toEqual([]);
  });

  it('every Astro file that renders a button includes the bds-button__content slot', () => {
    const missing = files
      .filter(({ text }) => {
        const markup = buttonTokensInMarkup(text);
        return markup.some((t) => t.startsWith('bds-button--')) &&
          !markup.includes('bds-button__content');
      })
      .map(({ name }) => name);
    expect(
      missing,
      `these Astro files render a bds-button but omit the bds-button__content ` +
        `label slot Button requires:\n  ${missing.join('\n  ')}`,
    ).toEqual([]);
  });

  it('sanity: the derived contract and the scan both found real tokens', () => {
    expect(contract.has('bds-button')).toBe(true);
    expect(contract.has('bds-button__content')).toBe(true);
    expect(files.some(({ text }) => buttonTokensInMarkup(text).length > 0)).toBe(true);
  });
});
