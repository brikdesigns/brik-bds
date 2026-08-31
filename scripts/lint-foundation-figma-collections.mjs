#!/usr/bin/env node
/**
 * lint-foundation-figma-collections.mjs
 *
 * Keeps the Foundation docs aligned to the Figma variable collections — the
 * naming source of truth. Three prior manual passes fixed drift instances and
 * none held, because nothing tied the prose back to `tokens-studio.json`. This
 * is that tie.
 *
 * Asserts, against `design-tokens/tokens-studio.json` (the Style Dictionary
 * source, one set per `{collection}/{mode}` key):
 *
 *   1. Every collection named in the "Figma variables to CSS output" table in
 *      foundation/index.mdx is a REAL Figma collection. Catches the docs
 *      renaming or inventing a collection (e.g. calling Elevation "Shadow").
 *   2. Every real Figma collection (minus META_ONLY) appears in that table.
 *      Catches a new Figma collection shipping undocumented.
 *   3. No Foundation page TITLE uses a retired synonym for a collection Figma
 *      names differently (e.g. a page titled "Shadow" when the collection is
 *      "elevation"). This is what makes the Elevation rename stick.
 *
 * Runs in the `docs lints` job of docs-gate.yml (one cheap step, no new
 * workflow, no build). Zero deps.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const STUDIO = join(ROOT, 'design-tokens', 'tokens-studio.json');
const INDEX = join(ROOT, 'docs-site', 'content', 'docs', 'foundation', 'index.mdx');
const FOUNDATION_DIR = join(ROOT, 'docs-site', 'content', 'docs', 'foundation');

// Tokens Studio keys that are not Figma variable collections.
const META_ONLY = new Set(['global', '$metadata', '$themes']);

// Page titles that are a synonym for a Figma collection Figma names otherwise.
// Key = forbidden title (lowercased); value = the Figma collection to use.
// Derived from tokens-studio: there is no `shadow` collection — it is `elevation`.
const RETIRED_TITLE_ALIASES = { shadow: 'elevation' };

const errors = [];

// ── Source of truth: the Figma collections ──────────────────────────────────
const studio = JSON.parse(readFileSync(STUDIO, 'utf8'));
const figmaCollections = new Set();
for (const key of Object.keys(studio)) {
  if (META_ONLY.has(key)) continue;
  figmaCollections.add(key.split('/')[0]);
}

// ── 1 + 2: reconcile the index.mdx collection table ─────────────────────────
const indexSrc = readFileSync(INDEX, 'utf8');
const tableHeader = '| Figma collection | Active mode | What it generates |';
const tableStart = indexSrc.indexOf(tableHeader);
if (tableStart === -1) {
  errors.push(
    `Could not find the "${tableHeader}" table in foundation/index.mdx — the ` +
      `collection-alignment gate cannot run. Did the table header change?`,
  );
} else {
  const after = indexSrc.slice(tableStart);
  const tableEnd = after.indexOf('\n\n');
  const tableBody = (tableEnd === -1 ? after : after.slice(0, tableEnd))
    .split('\n')
    .slice(2); // drop header + separator row

  const documented = new Set();
  for (const row of tableBody) {
    const m = row.match(/^\|\s*`([^`]+)`\s*\|/);
    if (m) documented.add(m[1]);
  }

  for (const c of documented) {
    if (!figmaCollections.has(c)) {
      errors.push(
        `index.mdx documents Figma collection \`${c}\`, but no such collection ` +
          `exists in design-tokens/tokens-studio.json. Real collections: ` +
          `${[...figmaCollections].sort().join(', ')}.`,
      );
    }
  }
  for (const c of figmaCollections) {
    if (!documented.has(c)) {
      errors.push(
        `Figma collection \`${c}\` (in tokens-studio.json) is missing from the ` +
          `"Figma variables to CSS output" table in foundation/index.mdx. ` +
          `Document it or add it to META_ONLY if it is not a real collection.`,
      );
    }
  }
}

// ── 3: no Foundation page title is a retired collection synonym ──────────────
for (const file of readdirSync(FOUNDATION_DIR)) {
  if (!file.endsWith('.mdx')) continue;
  const src = readFileSync(join(FOUNDATION_DIR, file), 'utf8');
  const m = src.match(/^---[\s\S]*?\btitle:\s*(.+?)\s*$/m);
  if (!m) continue;
  const title = m[1].replace(/^["']|["']$/g, '').trim().toLowerCase();
  if (RETIRED_TITLE_ALIASES[title]) {
    errors.push(
      `Foundation page ${file} is titled "${m[1].trim()}", a retired synonym. ` +
        `Figma names this collection "${RETIRED_TITLE_ALIASES[title]}" — ` +
        `title the page (and its slug) to match.`,
    );
  }
}

// ── Report ──────────────────────────────────────────────────────────────────
if (errors.length) {
  console.error('✗ Foundation ⇄ Figma collection alignment failed:\n');
  for (const e of errors) console.error(`  • ${e}\n`);
  process.exit(1);
}
console.log(
  `✓ Foundation docs aligned to ${figmaCollections.size} Figma collections ` +
    `(design-tokens/tokens-studio.json).`,
);
