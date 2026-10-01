#!/usr/bin/env node
/**
 * gen-icon-collection — Curated offline Phosphor subset for a BDS `<Icon>` consumer.
 *
 * Scans source for `ph:*` icon references, extracts just those icons from
 * `@iconify-json/ph` (the full 4.4 MB / 9k-icon set), and emits a trimmed
 * IconifyJSON collection. A consumer's `addCollection` call then registers
 * this subset so `ph:*` icons resolve with NO runtime fetch to
 * api.iconify.design, while the shipped bundle carries only what source uses.
 *
 * Published from BDS (`@brikdesigns/bds/gen-icon-collection`, bin
 * `gen-icon-collection`) so every consumer runs the SAME code rather than a
 * per-repo copy — a fork silently drops behavior a copy-paste doesn't carry
 * forward, which is how brikdesigns/brikdesigns#1370 lost the bold-twin
 * expansion below (brik-bds#2406).
 *
 * Modes:
 *   gen-icon-collection                     # write the collection
 *   gen-icon-collection --check              # fail if file differs / icons missing
 *   gen-icon-collection --src a,b --out p    # consumer source roots + output path
 *
 * The --check mode is the drift gate: it fails when a `ph:*` icon used in
 * shipped source is absent from the committed collection (so a new icon can't
 * silently fall through to the CDN), and when a referenced icon does not exist
 * in the Phosphor set at all (catches typos like the former `ph:dash-circle`).
 *
 * Companion: brikdesigns/brik-bds#1002, brikdesigns/brik-bds#2406.
 */

import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);

// ── Defaults ─────────────────────────────────────────────────────────────
// Resolved against `process.cwd()`, not this module's install location — a
// consumer invokes the published bin from their own repo root, and BDS's own
// `npm run gen:icons` already runs with cwd === the BDS repo root, so the two
// cases share one resolution rule.

export const DEFAULT_SCAN_DIRS = ['components', 'content-system', 'tokens'];
export const DEFAULT_OUTPUT_PATH = 'components/icons.generated.json';

const SOURCE_EXT = /\.(ts|tsx)$/;
const EXCLUDE_FILE = /\.(stories|test|spec)\.(ts|tsx)$/;
const PH_REF = /ph:[a-z0-9-]+/g;

// ── Walk source and collect distinct `ph:*` references ─────────────────────
// Stories/tests are excluded — their demo icons render offline in Storybook
// via the full set registered separately, and must not bloat the SHIPPED
// bundle.

/**
 * Every distinct bare `ph:*` reference (name only, no `ph:` prefix) under
 * `srcDirs`, resolved against `cwd`.
 */
export function collectReferences({ srcDirs = DEFAULT_SCAN_DIRS, cwd = process.cwd() } = {}) {
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

  for (const rel of srcDirs) {
    const abs = path.resolve(cwd, rel);
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
//
// This list mirrors `PH_WEIGHT_SUFFIXES` in `components/ui/Icon/Icon.tsx` and
// the Phosphor-token values of `PHOSPHOR_WEIGHT_TOKEN` in
// `components/ui/Icon/icon-weight.ts` — kept as a literal here (not imported)
// because this script ships as plain ESM with no TS loader; see
// scripts/lint-icon-weight-parity.mjs for the same duplication.
export const PH_WEIGHT_SUFFIXES = ['thin', 'light', 'bold', 'fill', 'duotone'];

export function isWeighted(name) {
  return PH_WEIGHT_SUFFIXES.some((w) => name.endsWith(`-${w}`));
}

export function withBoldTwins(names, phData) {
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

export function buildCollection(names, phData) {
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

// ── CLI ──────────────────────────────────────────────────────────────────

const USAGE = `gen-icon-collection — curated offline Phosphor subset for a BDS <Icon> consumer

  gen-icon-collection                    Write the collection (defaults below)
  gen-icon-collection --check            Fail if committed file differs / icons missing
  gen-icon-collection --src a,b,c        Comma-separated source roots to scan
                                          (default: ${DEFAULT_SCAN_DIRS.join(',')})
  gen-icon-collection --out <path>       Output path
                                          (default: ${DEFAULT_OUTPUT_PATH})
  gen-icon-collection --help             Show this message

  All paths are resolved against the current working directory.
`;

function parseCliArgs(argv) {
  const opts = { src: null, out: null, check: false, help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') opts.help = true;
    else if (a === '--check') opts.check = true;
    else if (a === '--src') opts.src = argv[++i].split(',').map((s) => s.trim()).filter(Boolean);
    else if (a === '--out') opts.out = argv[++i];
    else {
      process.stderr.write(`gen-icon-collection: unknown argument ${a}\n`);
      process.exit(2);
    }
  }
  return opts;
}

function main() {
  const opts = parseCliArgs(process.argv.slice(2));

  if (opts.help) {
    process.stdout.write(USAGE);
    process.exit(0);
  }

  const cwd = process.cwd();
  const srcDirs = opts.src ?? DEFAULT_SCAN_DIRS;
  const outputPath = path.resolve(cwd, opts.out ?? DEFAULT_OUTPUT_PATH);

  const phData = require('@iconify-json/ph/icons.json');
  const referenced = withBoldTwins(collectReferences({ srcDirs, cwd }), phData);
  const { collection, missing } = buildCollection(referenced, phData);
  const output = JSON.stringify(collection, null, 2) + '\n';
  const iconCount = Object.keys(collection.icons).length;

  if (missing.length > 0) {
    console.error('ERROR: these `ph:*` icons are referenced in shipped source but do');
    console.error('not exist in @iconify-json/ph (typo, or wrong icon name):');
    for (const m of missing) console.error(`  ph:${m}`);
    console.error('\nFix the reference to a real Phosphor icon, then re-run.');
    process.exit(1);
  }

  if (opts.check) {
    if (!fs.existsSync(outputPath)) {
      console.error(`ERROR: ${path.relative(cwd, outputPath)} does not exist.`);
      console.error('Run: gen-icon-collection');
      process.exit(1);
    }

    const committed = fs.readFileSync(outputPath, 'utf8');
    if (output === committed) {
      console.log(`✓ ${path.relative(cwd, outputPath)} in sync (${iconCount} icons).`);
      process.exit(0);
    }

    const committedIcons = new Set(Object.keys(JSON.parse(committed).icons));
    const generatedIcons = Object.keys(collection.icons);
    const added = generatedIcons.filter((k) => !committedIcons.has(k));
    const removed = [...committedIcons].filter((k) => !collection.icons[k]);

    console.error(`ERROR: ${path.relative(cwd, outputPath)} is out of sync with shipped `+'`ph:*`'+` usage.`);
    console.error('Run: gen-icon-collection\n');
    if (added.length) console.error(`  + ${added.map((k) => 'ph:' + k).join(', ')}`);
    if (removed.length) console.error(`  - ${removed.map((k) => 'ph:' + k).join(', ')}`);
    process.exit(1);
  }

  fs.writeFileSync(outputPath, output, 'utf8');
  console.log(`✓ Wrote ${path.relative(cwd, outputPath)} (${iconCount} icons from ${referenced.length} referenced)`);
}

// Entry-point detection — ESM doesn't have `require.main === module`. Compare
// the resolved file path of this module against argv[1]. argv[1] needs
// fs.realpathSync: npm's `bin` mechanism always invokes a published CLI
// through a node_modules/.bin symlink, and Node's ESM loader resolves
// symlinks for import.meta.url but not for argv[1] — without this the two
// sides never match and main() silently never runs (brik-bds#2663).
const isCliEntry = (() => {
  try {
    const argv1 = process.argv[1];
    if (!argv1) return false;
    return path.resolve(fileURLToPath(import.meta.url)) === fs.realpathSync(path.resolve(argv1));
  } catch (err) {
    process.stderr.write(`gen-icon-collection: could not determine CLI entry — ${err.message}\n`);
    return false;
  }
})();

if (isCliEntry) main();
