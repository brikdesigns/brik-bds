/**
 * compile-client-theme.mjs — a Brand Kit in, a CSS string out (brik-bds#2836).
 *
 * The committed Brik build runs four steps through the filesystem:
 *
 *   generate-color-ramps.mjs --apply   kit families → 11-step ramps
 *   merge-tokens-studio.js             Foundations + kit → tokens-studio.json
 *   flatten-tokens-studio.js           → tokens-figma.json
 *   style-dictionary build             → build/figma/css/variables.css
 *
 * compileClientTheme runs the same four steps in memory, on the same code —
 * applyRamp, mergeLibraries, flattenTokensStudio and cssPlatform are the
 * functions those scripts call — so a client theme and the Brik build cannot
 * compile differently. It reads Foundations (unless passed) and writes nothing.
 *
 * Node-only: Style Dictionary is not a browser dependency, so this ships as
 * the `@brikdesigns/bds/compile-client-theme` subpath, not from the lib entry.
 */

import fs from 'node:fs';
import { register } from '@tokens-studio/sd-transforms';
import StyleDictionary from 'style-dictionary';

import { applyRamp } from './generate-color-ramps.mjs';
import { registerBdsHooks, cssPlatform } from './lib/sd-bds.mjs';
import compose from './lib/tokens-studio-compose.cjs';

const { mergeLibraries, flattenTokensStudio } = compose;

const FOUNDATIONS_URL = new URL('../design-tokens/foundations.json', import.meta.url);

register(StyleDictionary);
registerBdsHooks(StyleDictionary);

let foundationsCache;
function readFoundations() {
  foundationsCache ??= JSON.parse(fs.readFileSync(FOUNDATIONS_URL, 'utf8'));
  return foundationsCache;
}

/**
 * Compile a Brand Kit to the `--bds-*` custom-property sheet.
 *
 * @param {object} kit  A Brand Kit, shaped like design-tokens/brand-kits/brik.json.
 *                      Never mutated.
 * @param {object} [opts]
 * @param {object} [opts.foundations]  Foundations Library; defaults to the one this package ships.
 * @param {Record<string,string>} [opts.modes]  Mode per collection, over the flatten defaults.
 * @param {string} [opts.selector]  Rule the properties are declared on. Default `:root`.
 * @returns {Promise<string>}
 */
export async function compileClientTheme(kit, opts = {}) {
  const { foundations = readFoundations(), modes = {}, selector = ':root' } = opts;

  const brandKit = structuredClone(kit);
  const families = brandKit?.['primitives/value']?.color;
  if (families && typeof families === 'object') {
    for (const familyName of Object.keys(families)) {
      families[familyName] = applyRamp(familyName, families[familyName]);
    }
  }

  const { merged } = mergeLibraries(foundations, brandKit);
  const tokens = flattenTokensStudio(merged, { modes });

  const sd = new StyleDictionary({
    tokens,
    preprocessors: ['tokens-studio', 'bds/retire-word-steps'],
    log: { verbosity: 'silent', warnings: 'disabled' },
    platforms: { css: cssPlatform({ selector }) },
  });
  const [file] = await sd.formatPlatform('css');
  return file.output;
}
