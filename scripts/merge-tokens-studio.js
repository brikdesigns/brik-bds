#!/usr/bin/env node
/**
 * Compose per-Library token files into the unified tokens-studio.json that
 * Style Dictionary consumes.
 *
 * Reads:
 *   design-tokens/foundations.json          — Foundations Library
 *   design-tokens/brand-kits/{slug}.json    — one Brand Kit Library
 *
 * Writes:
 *   design-tokens/tokens-studio.json
 *
 * Merge contract:
 *   - Brand Kit wins on any token path that appears in both Libraries
 *     within the same set (deep merge, Brand Kit values replace Foundations).
 *   - tokenSetOrder: Foundations sets first, then Brand Kit sets.
 *   - $themes: preserved from Foundations (they reference mode picks across
 *     all sets; Brand Kit doesn't define themes).
 *
 * Usage:
 *   node scripts/merge-tokens-studio.js [--slug=brik] [--dry-run]
 *
 * The default slug is "brik". Add more Brand Kits by running with a different
 * slug once the corresponding brand-kits/{slug}.json exists.
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const slugArg = args.find((a) => a.startsWith('--slug='));
const slug = slugArg ? slugArg.split('=')[1] : 'brik';

const FOUNDATIONS_FILE = path.join(__dirname, '../design-tokens/foundations.json');
const BRAND_KIT_FILE = path.join(__dirname, `../design-tokens/brand-kits/${slug}.json`);
const OUTPUT_FILE = path.join(__dirname, '../design-tokens/tokens-studio.json');

if (!fs.existsSync(FOUNDATIONS_FILE)) {
  console.error(`ERROR: ${FOUNDATIONS_FILE} not found.`);
  console.error('Run node scripts/split-tokens-studio.js first.');
  process.exit(1);
}
if (!fs.existsSync(BRAND_KIT_FILE)) {
  console.error(`ERROR: ${BRAND_KIT_FILE} not found.`);
  console.error(`Create design-tokens/brand-kits/${slug}.json by pulling the Brand Kit Library.`);
  process.exit(1);
}

const foundations = JSON.parse(fs.readFileSync(FOUNDATIONS_FILE, 'utf8'));
const brandKit = JSON.parse(fs.readFileSync(BRAND_KIT_FILE, 'utf8'));

// Deep merge two token set objects. `override` wins on any conflicting leaf.
function deepMerge(base, override) {
  if (!base || typeof base !== 'object') return override;
  if (!override || typeof override !== 'object') return base;
  const result = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      result[key] &&
      typeof result[key] === 'object' &&
      !Array.isArray(result[key])
    ) {
      result[key] = deepMerge(result[key], value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

// Build merged tokenSetOrder: Foundations first, then Brand Kit (deduped).
const foundationsOrder =
  foundations.$metadata?.tokenSetOrder ??
  Object.keys(foundations).filter((k) => !k.startsWith('$'));
const brandKitOrder =
  brandKit.$metadata?.tokenSetOrder ??
  Object.keys(brandKit).filter((k) => !k.startsWith('$'));
const mergedOrder = [
  ...foundationsOrder,
  ...brandKitOrder.filter((k) => !foundationsOrder.includes(k)),
];

// Merge token sets (non-metadata keys).
const merged = {};

for (const [key, value] of Object.entries(foundations)) {
  if (!key.startsWith('$')) merged[key] = value;
}
for (const [key, value] of Object.entries(brandKit)) {
  if (key.startsWith('$')) continue;
  merged[key] = merged[key] ? deepMerge(merged[key], value) : value;
}

// Reconstruct $metadata.
merged.$metadata = {
  ...foundations.$metadata,
  tokenSetOrder: mergedOrder,
};

// Preserve $themes from Foundations.
if (foundations.$themes) {
  merged.$themes = foundations.$themes;
}

console.log(`Merging foundations (${foundationsOrder.length} sets) + brand-kits/${slug} (${brandKitOrder.length} sets)`);
console.log(`tokenSetOrder (${mergedOrder.length}): ${mergedOrder.join(', ')}`);

if (dryRun) {
  console.log('\n--dry-run: no files written.');
  process.exit(0);
}

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(merged, null, 2) + '\n', 'utf8');
console.log(`\n✅ Wrote ${OUTPUT_FILE}`);
