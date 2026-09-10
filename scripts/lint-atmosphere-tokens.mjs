#!/usr/bin/env node

/**
 * BDS Atmosphere Token Lint (brik-bds#2372)
 *
 * Atmosphere decoration colours (orbs, glows, vignettes, spotlights) must
 * derive from the client's brand hue or a canonical `--background-accent-*`
 * role via `color-mix()`. They may NOT:
 *
 *   1. Declare an off-canon `--ambient-*` / `--atmosphere-*` custom-property
 *      family (the parallel-taxonomy sin closed in brik-bds#354).
 *   2. Hardcode a brand palette literal — e.g. Birdwell's gold
 *      `rgba(196, 154, 47, …)`, which leaked into every "effect" atmosphere
 *      when editorial-luxury was extracted from the Birdwell site.
 *   3. (effect atmospheres) use a `color-mix()` whose source colour is
 *      anything other than a canonical `--background-brand-primary` /
 *      `--background-accent-*` role.
 *
 * This is the regression gate for #2372: it fails on the pre-fix CSS and
 * passes on the brand/accent-derived version. Runs in `npm run validate`.
 *
 * Note: the vitest block in content-system/atmospheres/index.test.ts reads
 * CSS via `import.meta.glob(…?raw)`, which returns EMPTY strings under
 * Vite 8 + Vitest — so those content assertions are vacuous. This script
 * reads the files directly with `fs` and is the real gate. (tracked: the
 * glob-vacuity finding is filed separately.)
 *
 * Usage:
 *   node scripts/lint-atmosphere-tokens.mjs
 *
 * Exit codes:
 *   0 = clean
 *   1 = violations found
 */

import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const dir = fileURLToPath(new URL('../content-system/atmospheres/', import.meta.url));

// Effect atmospheres — the ones that paint decorative colour. The other
// slugs (clean-bright, minimal-clinical, none) add no colour and only need
// the universal rules 1–2.
const EFFECT_FILES = new Set([
  'editorial-luxury.css',
  'cinematic-dramatic.css',
  'warm-soft.css',
  'organic-textured.css',
]);

const cssFiles = readdirSync(dir).filter((f) => f.endsWith('.css'));
const errors = [];

for (const file of cssFiles) {
  const content = readFileSync(new URL(`../content-system/atmospheres/${file}`, import.meta.url), 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, i) => {
    const n = i + 1;

    // Rule 1 — no off-canon custom-property declaration.
    if (/^\s*--(ambient|atmosphere)[\w-]*\s*:/.test(line)) {
      errors.push(`${file}:${n}  off-canon token declaration — derive from --background-brand-primary / --background-accent-* via color-mix()\n    ${line.trim()}`);
    }

    // Rule 2 — no raw rgb()/rgba() colour literal (data-URI grain uses
    // feColorMatrix numbers, masks use #000 — neither is rgb()/rgba()).
    if (/\brgba?\(/.test(line)) {
      errors.push(`${file}:${n}  hardcoded colour literal — decoration colour must be a canonical brand/accent role\n    ${line.trim()}`);
    }

    // Rule 3 — every real color-mix() in an effect atmosphere pulls a
    // canonical role. Match `color-mix(in …` (the real function form) so
    // prose mentions of `color-mix()` in doc comments don't trip it.
    if (EFFECT_FILES.has(file) && line.includes('color-mix(in ') && !/var\(--background-(brand-primary|accent-[a-z]+)\)/.test(line)) {
      errors.push(`${file}:${n}  color-mix() does not source a canonical --background-brand-primary / --background-accent-* role\n    ${line.trim()}`);
    }
  });

  // Rule 3b — effect atmospheres must actually derive via color-mix().
  if (EFFECT_FILES.has(file) && !content.includes('color-mix(in ')) {
    errors.push(`${file}  effect atmosphere declares no color-mix() decoration — expected brand/accent-derived colour`);
  }
}

if (errors.length > 0) {
  console.error(`lint-atmosphere-tokens: ${errors.length} violation(s)\n`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  process.exit(1);
}

console.log(`lint-atmosphere-tokens: clean — ${cssFiles.length} atmosphere CSS file(s), brand/accent-derived decoration only`);
