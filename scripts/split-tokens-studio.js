#!/usr/bin/env node
/**
 * One-time migration: split the monolithic tokens-studio.json into per-Library files.
 *
 * Outputs:
 *   design-tokens/foundations.json        — Foundations Library sets
 *   design-tokens/brand-kits/brik.json    — Brik Brand Kit sets (color/light + color/dark)
 *
 * After this runs, tokens-studio.json is regenerated via merge-tokens-studio.js.
 * The original tokens-studio.json is left untouched — this script is non-destructive.
 *
 * Usage:
 *   node scripts/split-tokens-studio.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

const INPUT = path.join(__dirname, '../design-tokens/tokens-studio.json');
const FOUNDATIONS_OUTPUT = path.join(__dirname, '../design-tokens/foundations.json');
const BRAND_KIT_OUTPUT = path.join(__dirname, '../design-tokens/brand-kits/brik.json');

// Sets that belong to Brand Kit libraries (one per client).
// All remaining sets belong to the Foundations Library.
const BRAND_KIT_SETS = new Set(['color/light', 'color/dark']);

const tokensStudio = JSON.parse(fs.readFileSync(INPUT, 'utf8'));

const foundations = {};
const brandKit = {};
const foundationsOrder = [];
const brandKitOrder = [];

for (const [key, value] of Object.entries(tokensStudio)) {
  if (key.startsWith('$')) continue;
  if (BRAND_KIT_SETS.has(key)) {
    brandKit[key] = value;
    brandKitOrder.push(key);
  } else {
    foundations[key] = value;
    foundationsOrder.push(key);
  }
}

// Derive $metadata for each Library from the original, filtering tokenSetOrder
const originalOrder = tokensStudio.$metadata?.tokenSetOrder ?? [];

foundations.$metadata = {
  ...tokensStudio.$metadata,
  tokenSetOrder: originalOrder.filter((k) => !BRAND_KIT_SETS.has(k)),
};

brandKit.$metadata = {
  tokenSetOrder: originalOrder.filter((k) => BRAND_KIT_SETS.has(k)),
};

// $themes live in Foundations (they reference mode picks across all sets)
if (tokensStudio.$themes) {
  foundations.$themes = tokensStudio.$themes;
}

console.log('Split plan:');
console.log(`  foundations.json   — ${foundationsOrder.length} sets: ${foundationsOrder.join(', ')}`);
console.log(`  brand-kits/brik.json — ${brandKitOrder.length} sets: ${brandKitOrder.join(', ')}`);

if (dryRun) {
  console.log('\n--dry-run: no files written.');
  process.exit(0);
}

fs.mkdirSync(path.dirname(BRAND_KIT_OUTPUT), { recursive: true });
fs.writeFileSync(FOUNDATIONS_OUTPUT, JSON.stringify(foundations, null, 2) + '\n', 'utf8');
fs.writeFileSync(BRAND_KIT_OUTPUT, JSON.stringify(brandKit, null, 2) + '\n', 'utf8');

console.log('\n✅ Wrote:');
console.log(`   ${FOUNDATIONS_OUTPUT}`);
console.log(`   ${BRAND_KIT_OUTPUT}`);
