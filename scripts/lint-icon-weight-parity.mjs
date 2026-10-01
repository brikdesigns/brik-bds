#!/usr/bin/env node
/**
 * lint-icon-weight-parity — does a consumer's bundled icon collection cover
 * the glyph its OWN default weight will actually request at runtime?
 *
 * `gen-icon-collection --check` only asserts a collection matches what it
 * would itself regenerate. That is silent about a consumer whose generator
 * never learned to bundle a weight twin at all — brikdesigns' fork of
 * `gen-icon-collection.mjs` dropped the `-bold` expansion, so its own
 * `--check` passed while every icon it ships renders Phosphor regular, not
 * the `outline-bold` every other Brik surface renders (brik-bds#2406).
 *
 * This gate resolves the *rendered* name — the bare `ph:*` reference with the
 * weight suffix `<Icon>` applies at render — and asserts THAT name, not the
 * bare reference, is in the committed collection.
 *
 * Modes:
 *   lint-icon-weight-parity                                   # check defaults below
 *   lint-icon-weight-parity --src a,b --collection p --weight outline-bold
 *
 * Published from BDS (`@brikdesigns/bds/lint-icon-weight-parity`, bin
 * `lint-icon-weight-parity`) so a consumer runs the same weight-resolution
 * rule BDS's own `<Icon>` uses, rather than re-deriving a suffix map that can
 * drift from it.
 *
 * Companion: brikdesigns/brik-bds#2406.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { collectReferences, DEFAULT_SCAN_DIRS, isWeighted } from './gen-icon-collection.mjs';

// ── Semantic weight → Phosphor suffix ───────────────────────────────────────
// Mirrors `PHOSPHOR_WEIGHT_TOKEN` in `components/ui/Icon/icon-weight.ts` —
// kept as a literal here (not imported) because this script ships as plain
// ESM with no TS loader, the same reason `gen-icon-collection.mjs` duplicates
// `PH_WEIGHT_SUFFIXES` rather than importing it. If `icon-weight.ts` changes
// its Phosphor token mapping, update this literal to match.
export const PHOSPHOR_WEIGHT_TOKEN = {
  'outline-thin': 'thin',
  'outline-light': 'light',
  outline: '',
  'outline-bold': 'bold',
  fill: 'fill',
  duotone: 'duotone',
  regular: '',
  bold: 'bold',
};

export const DEFAULT_WEIGHT = 'outline-bold';
export const DEFAULT_COLLECTION_PATH = 'components/icons.generated.json';

/**
 * The glyph name `<Icon>` actually requests for a bare `ph:*` reference at
 * `weight` — mirrors `applyWeight` in `components/ui/Icon/Icon.tsx`. A name
 * that already carries an explicit weight suffix passes through unchanged,
 * same as the atom.
 */
export function resolveAtWeight(name, weight) {
  if (isWeighted(name)) return name;
  const token = PHOSPHOR_WEIGHT_TOKEN[weight];
  return token ? `${name}-${token}` : name;
}

/**
 * Which of `names`, resolved at `weight`, are absent from `collection`.
 * Checks both `icons` and `aliases` keys — a resolved name can be bundled
 * either way (see `buildCollection` in gen-icon-collection.mjs).
 */
export function checkWeightParity({ names, collection, weight }) {
  const bundled = new Set([
    ...Object.keys(collection.icons ?? {}),
    ...Object.keys(collection.aliases ?? {}),
  ]);
  const missing = [];
  for (const name of names) {
    const resolved = resolveAtWeight(name, weight);
    if (!bundled.has(resolved)) missing.push({ name, resolved });
  }
  return { missing, checked: names.length, weight };
}

// ── CLI ──────────────────────────────────────────────────────────────────

const USAGE = `lint-icon-weight-parity — bundled-collection coverage at a consumer's default icon weight

  lint-icon-weight-parity                      Check defaults below
  lint-icon-weight-parity --src a,b,c           Comma-separated source roots to scan
                                                 (default: ${DEFAULT_SCAN_DIRS.join(',')})
  lint-icon-weight-parity --collection <path>   Committed collection to check against
                                                 (default: ${DEFAULT_COLLECTION_PATH})
  lint-icon-weight-parity --weight <weight>     Semantic weight to resolve against
                                                 (default: ${DEFAULT_WEIGHT})
                                                 one of: ${Object.keys(PHOSPHOR_WEIGHT_TOKEN).join(', ')}
  lint-icon-weight-parity --help                Show this message

  All paths are resolved against the current working directory.
`;

function parseCliArgs(argv) {
  const opts = { src: null, collection: null, weight: null, help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') opts.help = true;
    else if (a === '--src') opts.src = argv[++i].split(',').map((s) => s.trim()).filter(Boolean);
    else if (a === '--collection') opts.collection = argv[++i];
    else if (a === '--weight') opts.weight = argv[++i];
    else {
      process.stderr.write(`lint-icon-weight-parity: unknown argument ${a}\n`);
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

  const weight = opts.weight ?? DEFAULT_WEIGHT;
  if (!(weight in PHOSPHOR_WEIGHT_TOKEN)) {
    console.error(`lint-icon-weight-parity: unknown weight "${weight}"`);
    console.error(`  one of: ${Object.keys(PHOSPHOR_WEIGHT_TOKEN).join(', ')}`);
    process.exit(2);
  }

  const cwd = process.cwd();
  const srcDirs = opts.src ?? DEFAULT_SCAN_DIRS;
  const collectionPath = path.resolve(cwd, opts.collection ?? DEFAULT_COLLECTION_PATH);

  if (!fs.existsSync(collectionPath)) {
    console.error(`ERROR: ${path.relative(cwd, collectionPath)} does not exist.`);
    console.error('Run: gen-icon-collection');
    process.exit(2);
  }

  const collection = JSON.parse(fs.readFileSync(collectionPath, 'utf8'));
  const names = collectReferences({ srcDirs, cwd });
  const { missing, checked } = checkWeightParity({ names, collection, weight });

  if (missing.length > 0) {
    console.error(
      `ERROR: ${missing.length} of ${checked} referenced \`ph:*\` icon(s) have no offline glyph ` +
      `at weight "${weight}" in ${path.relative(cwd, collectionPath)}:`,
    );
    for (const { name, resolved } of missing) {
      console.error(`  ph:${name}  →  ph:${resolved}  (not bundled)`);
    }
    console.error(
      '\nThese icons would fetch from the Iconify CDN at the weight this app renders by ' +
      'default. Re-run gen-icon-collection so the resolved names are bundled.',
    );
    process.exit(1);
  }

  console.log(`✓ ${checked} referenced \`ph:*\` icon(s) resolve offline at weight "${weight}".`);
  process.exit(0);
}

// argv[1] needs fs.realpathSync — see gen-icon-collection.mjs (brik-bds#2663).
const isCliEntry = (() => {
  try {
    const argv1 = process.argv[1];
    if (!argv1) return false;
    return path.resolve(fileURLToPath(import.meta.url)) === fs.realpathSync(path.resolve(argv1));
  } catch (err) {
    process.stderr.write(`lint-icon-weight-parity: could not determine CLI entry — ${err.message}\n`);
    return false;
  }
})();

if (isCliEntry) main();
