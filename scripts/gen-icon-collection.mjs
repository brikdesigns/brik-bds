#!/usr/bin/env node
/**
 * gen-icon-collection.mjs — Curated offline Phosphor subset for BDS <Icon>.
 *
 * Scans shipped source for `ph:*` icon references, extracts just those icons
 * from `@iconify-json/ph` (the full 4.4 MB / 9k-icon set), and emits a trimmed
 * IconifyJSON collection at `components/icons.generated.json`. The BDS <Icon>
 * component registers this subset via `addCollection` at module load, so
 * `ph:*` icons resolve with NO runtime fetch to api.iconify.design — while the
 * shipped bundle carries ~80 icons (~40 KB) instead of the whole set.
 *
 * Modes:
 *   node scripts/gen-icon-collection.mjs           # write the collection
 *   node scripts/gen-icon-collection.mjs --check   # fail if file differs / icons missing
 *
 * The --check mode is the drift gate: it fails when a `ph:*` icon used in
 * shipped source is absent from the committed collection (so a new icon can't
 * silently fall through to the CDN), and when a referenced icon does not exist
 * in the Phosphor set at all (catches typos like the former `ph:dash-circle`).
 *
 * Companion: brikdesigns/brik-bds#1002.
 */

import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const phData = require('@iconify-json/ph/icons.json');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const OUTPUT_PATH = path.join(REPO_ROOT, 'components', 'icons.generated.json');

// Shipped source roots to scan. Stories/tests are excluded — their demo icons
// render offline in Storybook via the full set registered in .storybook/preview.tsx,
// and must not bloat the SHIPPED bundle.
const SCAN_DIRS = ['components', 'content-system', 'tokens'];
const SOURCE_EXT = /\.(ts|tsx)$/;
const EXCLUDE_FILE = /\.(stories|test|spec)\.(ts|tsx)$/;

const PH_REF = /ph:[a-z0-9-]+/g;

const checkMode = process.argv.includes('--check');

// ── Walk shipped source and collect distinct `ph:*` references ─────────────

function collectReferences() {
  const names = new Set();

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules') continue;
        walk(full);
      } else if (SOURCE_EXT.test(entry.name) && !EXCLUDE_FILE.test(entry.name)) {
        const text = fs.readFileSync(full, 'utf8');
        const matches = text.match(PH_REF);
        if (matches) for (const m of matches) names.add(m.slice('ph:'.length));
      }
    }
  }

  for (const rel of SCAN_DIRS) {
    const abs = path.join(REPO_ROOT, rel);
    if (fs.existsSync(abs)) walk(abs);
  }

  return [...names].sort();
}

// ── Expand regular references to include their `-bold` twin ────────────────
// BDS <Icon> defaults to `weight="bold"`, so a source reference `ph:foo`
// renders as `ph:foo-bold` at runtime. Bundle that twin (when Phosphor ships
// it) so the default weight resolves offline. The regular name stays in the set
// too — `weight="regular"` opts back to it. Names that already carry a weight
// suffix (`-bold`/`-fill`/…) are left alone.
const PH_WEIGHT_SUFFIXES = ['thin', 'light', 'bold', 'fill', 'duotone'];

function isWeighted(name) {
  return PH_WEIGHT_SUFFIXES.some((w) => name.endsWith(`-${w}`));
}

function withBoldTwins(names) {
  const expanded = new Set(names);
  for (const name of names) {
    if (isWeighted(name)) continue;
    const bold = `${name}-bold`;
    if (phData.icons[bold] || phData.aliases?.[bold]) expanded.add(bold);
  }
  return [...expanded].sort();
}

// ── Resolve requested names → trimmed IconifyJSON collection ───────────────
// Copies each icon's data verbatim. If a name is an alias, the alias entry is
// kept and its parent chain pulled into `icons` so the collection is closed.

function buildCollection(names) {
  const icons = {};
  const aliases = {};
  const missing = [];

  function include(name) {
    if (phData.icons[name]) {
      icons[name] = phData.icons[name];
      return true;
    }
    const alias = phData.aliases?.[name];
    if (alias) {
      aliases[name] = alias;
      return include(alias.parent); // ensure parent resolves
    }
    return false;
  }

  for (const name of names) {
    if (!include(name)) missing.push(name);
  }

  const collection = {
    prefix: phData.prefix,
    icons: Object.fromEntries(Object.keys(icons).sort().map((k) => [k, icons[k]])),
    width: phData.width,
    height: phData.height,
  };
  if (Object.keys(aliases).length > 0) {
    collection.aliases = Object.fromEntries(
      Object.keys(aliases).sort().map((k) => [k, aliases[k]]),
    );
  }

  return { collection, missing };
}

// ── Generate ───────────────────────────────────────────────────────────────

const referenced = withBoldTwins(collectReferences());
const { collection, missing } = buildCollection(referenced);
const output = JSON.stringify(collection, null, 2) + '\n';
const iconCount = Object.keys(collection.icons).length;

if (missing.length > 0) {
  console.error('ERROR: these `ph:*` icons are referenced in shipped source but do');
  console.error('not exist in @iconify-json/ph (typo, or wrong icon name):');
  for (const m of missing) console.error(`  ph:${m}`);
  console.error('\nFix the reference to a real Phosphor icon, then re-run.');
  process.exit(1);
}

// ── Check mode: fail if committed file differs ─────────────────────────────

if (checkMode) {
  if (!fs.existsSync(OUTPUT_PATH)) {
    console.error('ERROR: components/icons.generated.json does not exist.');
    console.error('Run: npm run gen:icons');
    process.exit(1);
  }

  const committed = fs.readFileSync(OUTPUT_PATH, 'utf8');
  if (output === committed) {
    console.log(`✓ components/icons.generated.json in sync (${iconCount} icons).`);
    process.exit(0);
  }

  const committedIcons = new Set(Object.keys(JSON.parse(committed).icons));
  const generatedIcons = Object.keys(collection.icons);
  const added = generatedIcons.filter((k) => !committedIcons.has(k));
  const removed = [...committedIcons].filter((k) => !collection.icons[k]);

  console.error('ERROR: components/icons.generated.json is out of sync with shipped `ph:*` usage.');
  console.error('Run: npm run gen:icons\n');
  if (added.length) console.error(`  + ${added.map((k) => 'ph:' + k).join(', ')}`);
  if (removed.length) console.error(`  - ${removed.map((k) => 'ph:' + k).join(', ')}`);
  process.exit(1);
}

// ── Write mode ──────────────────────────────────────────────────────────────

fs.writeFileSync(OUTPUT_PATH, output, 'utf8');
console.log(`✓ Wrote components/icons.generated.json (${iconCount} icons from ${referenced.length} referenced)`);
