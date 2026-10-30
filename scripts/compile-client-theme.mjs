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

import { register } from '@tokens-studio/sd-transforms';
import StyleDictionary from 'style-dictionary';

import { applyRamp } from './generate-color-ramps.mjs';
import { registerBdsHooks, cssPlatform } from './lib/sd-bds.mjs';
import compose from './lib/tokens-studio-compose.cjs';

// Imported, not read from disk: consumers bundle this subpath, and a bundled
// import.meta.url no longer points into this package.
import FOUNDATIONS from '../design-tokens/foundations.json' with { type: 'json' };

const { mergeLibraries, flattenTokensStudio } = compose;

register(StyleDictionary);
registerBdsHooks(StyleDictionary);

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
  const { foundations = FOUNDATIONS, modes = {}, selector = ':root' } = opts;

  const brandKit = structuredClone(kit);
  brandKit['primitives/value'] ??= {};
  const families = (brandKit['primitives/value'].color ??= {});
  // A client kit that names no grays of its own ramps the Foundations
  // grayscale. applyRamp also re-derives the six word steps as aliases onto the
  // numeric scale, which bds/retire-word-steps requires (numeric since #2912).
  families.grayscale ??= structuredClone(foundations['primitives/value'].color.grayscale);
  for (const familyName of Object.keys(families)) {
    families[familyName] = applyRamp(familyName, families[familyName]);
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
