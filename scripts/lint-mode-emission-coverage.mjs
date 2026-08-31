#!/usr/bin/env node
/**
 * lint-mode-emission-coverage — fail CI when a multi-modal Figma collection has
 * no corresponding emitted `[data-mode-*]` block (BDS #932, parent #340).
 *
 * The drift that motivated #340: `design-tokens/tokens-studio.json` carried
 * spacing / typography / border-radius / elevation as multi-modal collections
 * for MONTHS while only their default mode reached `dist/tokens.css` — because
 * nothing failed when a multi-modal source had no emission. This guard closes
 * that: every multi-modal source collection must be either WIRED (emitted as a
 * `[data-mode-{attr}]` block) or EXCLUDED by name with a reason. A new dormant
 * collection added in Figma, or an emission silently dropped, fails the build.
 *
 * A "multi-modal collection" = a top-level `collection/{mode}` group in
 * tokens-studio.json with more than one mode, excluding `primitives`.
 *
 * Sources of truth (no duplicated wiring knowledge):
 *   - COLLECTIONS registry (imported from generate-modes-css.mjs) → the
 *     registry-wired collections + their data-mode attribute (cfg.attr ?? key).
 *   - WIRED_LEGACY → collections emitted outside the registry (border-width via
 *     the hand-authored modes-borderwidth.css, appended in MODE_FILES).
 *   - EXCLUDED → intentionally-unwired collections, each with a named reason.
 *
 * Run:
 *   node scripts/lint-mode-emission-coverage.mjs          # reads dist/tokens.css
 *   node scripts/lint-mode-emission-coverage.mjs --json
 *
 * dist/tokens.css must exist (npm run build:dist-tokens) — the guard reads the
 * actual emitted output, not the registry's intent, so a registry entry that
 * fails to emit is still caught.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { COLLECTIONS } from './generate-modes-css.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const TOKENS_STUDIO = path.join(ROOT, 'design-tokens/tokens-studio.json');
const DIST_TOKENS = path.join(ROOT, 'dist/tokens.css');

// Collections emitted OUTSIDE the COLLECTIONS registry (AC bullet 4). Maps the
// source collection name → its data-mode attribute.
const WIRED_LEGACY = {
  'border-width': 'borderwidth', // hand-authored tokens/modes-borderwidth.css (pre-registry)
};

// Intentionally-unwired multi-modal collections — named, never silent (AC bullet 2).
const EXCLUDED = {
  breakpoint: 'pending the #931 research spike — undecided whether breakpoint fits the data-mode paradigm',
  color: 'light/dark ships via the [data-theme="dark"] cascade (figma-tokens-dark.css), not a [data-mode-*] block',
};

/** Multi-modal collections in the Figma source: `collection/{mode}` groups with
 *  >1 mode, excluding `primitives`. Returns { collection: [modes] }. */
export function multiModalCollections(data) {
  const byColl = {};
  for (const key of Object.keys(data)) {
    const slash = key.indexOf('/');
    if (slash < 0) continue; // $metadata, global, etc. — not a collection/mode slice
    const coll = key.slice(0, slash);
    const mode = key.slice(slash + 1);
    (byColl[coll] ??= []).push(mode);
  }
  const out = {};
  for (const [coll, modes] of Object.entries(byColl)) {
    if (coll === 'primitives') continue;
    if (modes.length > 1) out[coll] = modes;
  }
  return out;
}

/** collection → data-mode attribute, from the registry then the legacy map. */
export function wiredAttrFor(collection) {
  const cfg = COLLECTIONS[collection];
  if (cfg) return cfg.attr ?? collection;
  if (collection in WIRED_LEGACY) return WIRED_LEGACY[collection];
  return null;
}

/** True when dist declares a `[data-mode-{attr}=` selector block. */
function isEmitted(css, attr) {
  return css.includes(`[data-mode-${attr}=`);
}

export function findCoverageViolations(data, css) {
  const collections = multiModalCollections(data);
  const rows = [];
  for (const [coll, modes] of Object.entries(collections)) {
    if (coll in EXCLUDED) {
      // Stale-exclusion guard: an excluded collection that HAS an emission means
      // it got wired and the exclusion is now a lie — force it out of the list.
      const staleAttr = wiredAttrFor(coll) ?? coll;
      const wrongly = isEmitted(css, staleAttr);
      rows.push({
        collection: coll, modes: modes.length, status: wrongly ? 'stale-exclusion' : 'excluded',
        detail: wrongly
          ? `excluded but emits [data-mode-${staleAttr}] — remove it from EXCLUDED`
          : EXCLUDED[coll],
      });
      continue;
    }
    const attr = wiredAttrFor(coll);
    if (attr === null) {
      rows.push({
        collection: coll, modes: modes.length, status: 'dormant',
        detail: `multi-modal (${modes.join('|')}) but not wired and not excluded — wire it under #340 or add to EXCLUDED with a reason`,
      });
      continue;
    }
    if (!isEmitted(css, attr)) {
      rows.push({
        collection: coll, modes: modes.length, status: 'missing-emission',
        detail: `wired (attr data-mode-${attr}) but no [data-mode-${attr}] block in dist/tokens.css — emission dropped`,
      });
      continue;
    }
    rows.push({ collection: coll, modes: modes.length, status: 'ok', detail: `[data-mode-${attr}]` });
  }
  return rows;
}

function main() {
  const json = process.argv.includes('--json');
  if (!fs.existsSync(DIST_TOKENS)) {
    console.error('✗ dist/tokens.css not found — run `npm run build:dist-tokens` first.');
    process.exit(1);
  }
  const data = JSON.parse(fs.readFileSync(TOKENS_STUDIO, 'utf8'));
  const css = fs.readFileSync(DIST_TOKENS, 'utf8');
  const rows = findCoverageViolations(data, css);

  if (json) {
    console.log(JSON.stringify(rows, null, 2));
  }

  const bad = rows.filter((r) => r.status === 'dormant' || r.status === 'missing-emission' || r.status === 'stale-exclusion');
  const ok = rows.filter((r) => r.status === 'ok');
  const excluded = rows.filter((r) => r.status === 'excluded');

  if (!json) {
    console.log('mode-emission coverage — multi-modal source collections vs. emitted [data-mode-*]:');
    for (const r of rows.sort((a, b) => a.collection.localeCompare(b.collection))) {
      const mark = r.status === 'ok' ? '✓' : r.status === 'excluded' ? '·' : '✗';
      console.log(`  ${mark} ${r.collection.padEnd(15)} ${r.status.padEnd(16)} ${r.detail}`);
    }
    console.log('');
  }

  if (bad.length > 0) {
    console.error(`✗ ${bad.length} mode-emission coverage violation(s). Each multi-modal Figma collection must be`);
    console.error('  emitted as a [data-mode-*] block (wire it under #340) or named in EXCLUDED with a reason.');
    process.exit(1);
  }
  console.log(`✓ mode-emission coverage clean — ${ok.length} wired, ${excluded.length} excluded, 0 dormant.`);
}

const isCliEntry = path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1] ?? '');
if (isCliEntry) main();
