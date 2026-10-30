#!/usr/bin/env node
/**
 * Compose per-Library token files into the unified tokens-studio.json that
 * Style Dictionary consumes.
 *
 * Reads:
 *   design-tokens/foundations.json          — Foundations Library
 *   design-tokens/brand-kits/{slug}.json    — one Brand Kit Library, only with --slug
 *
 * Writes:
 *   design-tokens/tokens-studio.json
 *
 * Merge contract: see mergeLibraries in scripts/lib/tokens-studio-compose.cjs.
 *
 * Usage:
 *   node scripts/merge-tokens-studio.js [--slug=brik] [--dry-run] [--check]
 *
 * With no --slug the output is Foundations alone, which is what `:root` ships
 * (brik-bds#2910). It used to default to "brik", so every consumer's `:root`
 * was Foundations + Brik and an unbound client slot fell back to Poppy. Brik
 * is now compiled like any client kit, into `.theme-brand-brik`, by
 * scripts/build-brand-brik-theme.mjs. --slug stays for one-off inspection.
 *
 * --check is the drift gate (brik-bds#1747). tokens-studio.json is GENERATED,
 * but it is committed and it looks hand-editable, so an edit lands there
 * instead of in the Library file that owns the token — and survives until the
 * next regeneration silently deletes it. That is exactly what happened to
 * `typography/default.font-weight.heading`: #1717 added it here, neither
 * Library got it, and a rebuild dropped `--font-weight-heading` from every
 * Style Dictionary output. Nothing failed, because no check compared this
 * file against its own sources.
 */

const fs = require('fs');
const path = require('path');
const { mergeLibraries } = require('./lib/tokens-studio-compose.cjs');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const check = args.includes('--check');
const slugArg = args.find((a) => a.startsWith('--slug='));
const slug = slugArg ? slugArg.split('=')[1] : null;

const FOUNDATIONS_FILE = path.join(__dirname, '../design-tokens/foundations.json');
const BRAND_KIT_FILE = slug ? path.join(__dirname, `../design-tokens/brand-kits/${slug}.json`) : null;
const OUTPUT_FILE = path.join(__dirname, '../design-tokens/tokens-studio.json');

if (!fs.existsSync(FOUNDATIONS_FILE)) {
  console.error(`ERROR: ${FOUNDATIONS_FILE} not found.`);
  console.error('Run node scripts/split-tokens-studio.js first.');
  process.exit(1);
}
if (BRAND_KIT_FILE && !fs.existsSync(BRAND_KIT_FILE)) {
  console.error(`ERROR: ${BRAND_KIT_FILE} not found.`);
  console.error(`Create design-tokens/brand-kits/${slug}.json by pulling the Brand Kit Library.`);
  process.exit(1);
}

const foundations = JSON.parse(fs.readFileSync(FOUNDATIONS_FILE, 'utf8'));
const brandKit = BRAND_KIT_FILE ? JSON.parse(fs.readFileSync(BRAND_KIT_FILE, 'utf8')) : {};

// The merge contract lives in lib/tokens-studio-compose.cjs, shared with
// compileClientTheme so a client theme and this file cannot drift (#2836).
const { merged, foundationsOrder, brandKitOrder, mergedOrder } = mergeLibraries(foundations, brandKit);

console.log(
  slug
    ? `Merging foundations (${foundationsOrder.length} sets) + brand-kits/${slug} (${brandKitOrder.length} sets)`
    : `Foundations only (${foundationsOrder.length} sets)`,
);
console.log(`tokenSetOrder (${mergedOrder.length}): ${mergedOrder.join(', ')}`);

const output = JSON.stringify(merged, null, 2) + '\n';

if (dryRun) {
  console.log('\n--dry-run: no files written.');
  process.exit(0);
}

if (check) {
  const committed = fs.existsSync(OUTPUT_FILE) ? fs.readFileSync(OUTPUT_FILE, 'utf8') : null;
  if (committed !== output) {
    console.error(
      `\n✗ design-tokens/tokens-studio.json does not match a fresh merge of its sources.\n` +
        `  It is GENERATED — the fix is never to edit it. Put the token in the Library\n` +
        `  that owns it (design-tokens/foundations.json, or a brand-kits/*.json for a brand value),\n` +
        `  then run: npm run merge:tokens-studio\n` +
        `  Inspect the drift with: npm run merge:tokens-studio && git diff design-tokens/tokens-studio.json\n`,
    );
    process.exit(1);
  }
  console.log('\n✓ design-tokens/tokens-studio.json is in sync with its Library sources.');
  process.exit(0);
}

fs.writeFileSync(OUTPUT_FILE, output, 'utf8');
console.log(`\n✅ Wrote ${OUTPUT_FILE}`);
