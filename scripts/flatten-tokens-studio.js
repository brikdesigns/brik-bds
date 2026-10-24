#!/usr/bin/env node
/**
 * Flatten Tokens Studio multi-set output into Style Dictionary-ready DTCG JSON.
 *
 * Tokens Studio exports one JSON with multiple Token Sets (one per collection/mode).
 * Style Dictionary needs a flat DTCG structure with all references resolvable.
 *
 * This script:
 *   1. Reads design-tokens/tokens-studio.json
 *   2. Merges primitives + one mode per collection into a flat DTCG object
 *   3. Writes design-tokens/tokens-figma.json (consumed by sd.config.tokens-studio.mjs)
 *   4. Writes separate mode files for theme variants
 *
 * The flatten itself — default modes, set wrapping, the dropped internal
 * groups, the line-height fix — is flattenTokensStudio in
 * scripts/lib/tokens-studio-compose.cjs, shared with compileClientTheme (#2836).
 *
 * Default mode selection (matches Webflow Foundations site defaults):
 *   color: light, icon: solid, border-radius: soft, spacing: default,
 *   breakpoint: default, border-width: default, elevation: subtle,
 *   typography: default
 *
 * Usage:
 *   node scripts/flatten-tokens-studio.js [--mode spacing=spacious,color=dark]
 *
 * Zero dependencies — Node.js stdlib only.
 */

const fs = require('fs');
const path = require('path');
const { flattenTokensStudio } = require('./lib/tokens-studio-compose.cjs');

const INPUT = path.join(__dirname, '../design-tokens/tokens-studio.json');
let OUTPUT = path.join(__dirname, '../design-tokens/tokens-figma.json');

// Parse CLI overrides: --mode spacing=spacious,color=dark  --output path/to/output.json
const modes = {};
const args = process.argv.slice(2);
const modeIdx = args.indexOf('--mode');
if (modeIdx !== -1 && args[modeIdx + 1]) {
  const overrides = args[modeIdx + 1].split(',');
  for (const o of overrides) {
    const [col, mode] = o.split('=');
    if (col && mode) modes[col] = mode;
  }
}
const outIdx = args.indexOf('--output');
if (outIdx !== -1 && args[outIdx + 1]) {
  OUTPUT = path.resolve(args[outIdx + 1]);
}

// ─── Main ────────────────────────────────────────────────────────

console.log('Flattening Tokens Studio output...\n');

const data = JSON.parse(fs.readFileSync(INPUT, 'utf8'));
const cleaned = flattenTokensStudio(data, { modes, log: console.log, warn: console.warn });

// Count tokens (handles collision nodes that are both token AND group)
let count = 0;
function countTokens(obj) {
  for (const val of Object.values(obj)) {
    if (val && typeof val === 'object') {
      if (val.$value !== undefined) count++;
      // Always recurse — collision nodes have both $value and children
      countTokens(val);
    }
  }
}
countTokens(cleaned);

// Write output
fs.writeFileSync(OUTPUT, JSON.stringify(cleaned, null, 2) + '\n');
console.log(`\n  Written: ${path.relative(path.join(__dirname, '..'), OUTPUT)} (${count} tokens)`);
console.log('  Ready for Style Dictionary build\n');
