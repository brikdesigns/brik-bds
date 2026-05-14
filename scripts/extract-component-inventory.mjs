#!/usr/bin/env node
/**
 * extract-component-inventory.mjs — Code-mirror of components/ui/ → Notion.
 *
 * Walks `components/ui/*\/*.stories.tsx`, parses each with the TypeScript
 * compiler API to extract story-shape signal, and upserts a row per
 * component into the "Component Inventory" Notion DB (see #603 / #587
 * Phase 1 PR-C). The DB is a sibling of "UI Elements" under the
 * Components parent page; design-curated rows live in UI Elements and
 * are NOT touched by this script.
 *
 * v1 fields (minimal-core per #603 scoping):
 *   - Name              — component dir name (e.g. Button)
 *   - Component path    — components/ui/Button/Button.tsx
 *   - Story title       — meta.title literal (e.g. Components/Action/button)
 *   - Surface           — derived from meta.tags surface-* (shared/web/product/unknown)
 *   - Story exports     — raw count of `export const X (: Story)?` (excludes default meta)
 *   - Deprecated        — meta.tags includes `!manifest`
 *   - ADR-010 risk      — computed: Q3-relevant export count > 13 (see below)
 *   - Last sync         — today (ISO date)
 *
 * ADR-010 risk metric (refined #613):
 *   The raw export count over-counts Q4 (irreducible render-mode) and Q5
 *   (`!manifest`-tagged interaction tests). Those are legitimate per the
 *   matrix and don't represent Q2/Q3 inflation. We compute risk against
 *   the *Q3-relevant* count instead:
 *
 *     q3RelevantExports = totalExports − renderModeExports − manifestHiddenExports
 *
 *   This makes the threshold a Q2/Q3 inflation gauge as ADR-010 intended:
 *   "after migration: Playground + ~12 semantic variants + 1 axis-only = ~14
 *   args-driven exports, with Q4 patterns layered on top per matrix."
 *
 * Coverage % fields (argTypes / @summary) deferred to a follow-up PR
 * because they need full TypeChecker prop-counting on the paired *.tsx
 * file; v1 is the cheap-but-actionable signal that orders Phase 3 batches.
 *
 * Auth:
 *   Reads NOTION_TOKEN from .env (matches populate-notion-tokens.js).
 *
 * Usage:
 *   node scripts/extract-component-inventory.mjs            # live sync
 *   node scripts/extract-component-inventory.mjs --dry-run  # parse + log, no Notion writes
 *
 * See ADR-010 + #603.
 */

import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const { Client } = require('@notionhq/client');
require('dotenv').config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const COMPONENTS_DIR = path.join(REPO_ROOT, 'components', 'ui');

const COMPONENT_INVENTORY_DB_ID = 'b838bbf1-d682-4687-a3eb-8f94ef2b9536';

const SURFACE_TAGS = new Set(['surface-shared', 'surface-web', 'surface-product']);
const DEPRECATED_TAG = '!manifest';
const ADR_010_RISK_THRESHOLD = 13;

const dryRun = process.argv.includes('--dry-run');

// ── AST helpers ─────────────────────────────────────────────────────────

function getStringLiteralValue(node) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text;
  }
  return null;
}

function getArrayStringLiterals(node) {
  if (!ts.isArrayLiteralExpression(node)) return null;
  return node.elements
    .map(getStringLiteralValue)
    .filter((v) => v !== null);
}

/**
 * Unwraps `satisfies` and `as` clauses so callers see the underlying
 * literal. `const meta: Meta<…> = { … } satisfies Meta<…>` is the
 * Footer/Tooltip/etc. pattern; without this, the initializer node is a
 * SatisfiesExpression and the object-literal walk silently fails.
 */
function unwrapAssertions(node) {
  while (
    node &&
    (ts.isSatisfiesExpression(node) ||
      ts.isAsExpression(node) ||
      ts.isParenthesizedExpression(node) ||
      ts.isTypeAssertionExpression?.(node))
  ) {
    node = node.expression;
  }
  return node;
}

/**
 * Finds the `const meta` declaration and pulls out title + tags.
 * Pattern: `const meta: Meta<typeof X> = { title: '...', tags: [...] }`.
 */
function extractMeta(sourceFile) {
  let meta = { title: null, tags: [] };

  ts.forEachChild(sourceFile, (node) => {
    if (!ts.isVariableStatement(node)) return;
    for (const decl of node.declarationList.declarations) {
      if (!ts.isIdentifier(decl.name) || decl.name.text !== 'meta') continue;
      const initializer = unwrapAssertions(decl.initializer);
      if (!initializer || !ts.isObjectLiteralExpression(initializer)) continue;

      for (const prop of initializer.properties) {
        if (!ts.isPropertyAssignment(prop)) continue;
        if (!ts.isIdentifier(prop.name)) continue;

        if (prop.name.text === 'title') {
          meta.title = getStringLiteralValue(prop.initializer);
        } else if (prop.name.text === 'tags') {
          meta.tags = getArrayStringLiterals(prop.initializer) ?? [];
        }
      }
    }
  });

  return meta;
}

/**
 * Walks exported story constants and classifies each by ADR-010 axis.
 *
 * Returns three counts:
 *   - total            — every `export const X` (excludes default meta)
 *   - renderMode       — story object has a `render:` property (Q4 irreducible
 *                        OR ADR-006 axis-only gallery exception)
 *   - manifestHidden   — story object has `tags: [..., '!manifest', ...]`
 *                        (Q5 interaction test OR explicitly hidden from MCP)
 *
 * Q3-relevant count (used for risk) = total − renderMode − manifestHidden.
 * Stories may match both renderMode and manifestHidden — they're counted in
 * both buckets but only subtracted once (set semantics on the export name).
 */
function analyzeStoryExports(sourceFile) {
  const renderModeNames = new Set();
  const manifestHiddenNames = new Set();
  const allNames = new Set();

  ts.forEachChild(sourceFile, (node) => {
    if (!ts.isVariableStatement(node)) return;
    const isExported = (node.modifiers ?? []).some(
      (m) => m.kind === ts.SyntaxKind.ExportKeyword,
    );
    if (!isExported) return;

    for (const decl of node.declarationList.declarations) {
      if (!ts.isIdentifier(decl.name) || decl.name.text === 'meta') continue;
      const exportName = decl.name.text;
      allNames.add(exportName);

      const initializer = unwrapAssertions(decl.initializer);
      if (!initializer || !ts.isObjectLiteralExpression(initializer)) continue;

      for (const prop of initializer.properties) {
        if (!ts.isPropertyAssignment(prop) && !ts.isShorthandPropertyAssignment(prop)) continue;
        if (!ts.isIdentifier(prop.name)) continue;

        if (prop.name.text === 'render') {
          renderModeNames.add(exportName);
        } else if (prop.name.text === 'tags' && ts.isPropertyAssignment(prop)) {
          const tags = getArrayStringLiterals(prop.initializer) ?? [];
          if (tags.includes('!manifest')) manifestHiddenNames.add(exportName);
        }
      }
    }
  });

  const excluded = new Set([...renderModeNames, ...manifestHiddenNames]);
  return {
    total: allNames.size,
    renderMode: renderModeNames.size,
    manifestHidden: manifestHiddenNames.size,
    q3Relevant: allNames.size - excluded.size,
  };
}

function parseStoryFile(filePath) {
  const sourceText = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    /* setParentNodes */ true,
    ts.ScriptKind.TSX,
  );

  const meta = extractMeta(sourceFile);
  const exports = analyzeStoryExports(sourceFile);

  const surfaceTag = meta.tags.find((t) => SURFACE_TAGS.has(t));
  const surface = surfaceTag ? surfaceTag.replace('surface-', '') : 'unknown';
  const deprecated = meta.tags.includes(DEPRECATED_TAG);

  return {
    storyTitle: meta.title,
    surface,
    deprecated,
    storyExports: exports.total,
    q3RelevantExports: exports.q3Relevant,
    renderModeExports: exports.renderMode,
    manifestHiddenExports: exports.manifestHidden,
    risk: exports.q3Relevant > ADR_010_RISK_THRESHOLD,
    tags: meta.tags,
  };
}

// ── Walk components/ui/ ────────────────────────────────────────────────

function findInventoryRows() {
  const rows = [];
  const componentDirs = fs
    .readdirSync(COMPONENTS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  for (const componentName of componentDirs) {
    const componentDir = path.join(COMPONENTS_DIR, componentName);
    const storyFiles = fs
      .readdirSync(componentDir)
      .filter((f) => f.endsWith('.stories.tsx'));

    if (storyFiles.length === 0) continue;

    // Convention: one stories file per directory, named ComponentName.stories.tsx.
    // If multiple, prefer the one matching the dir name; otherwise take the first.
    const preferred =
      storyFiles.find((f) => f === `${componentName}.stories.tsx`) ?? storyFiles[0];
    const storyPath = path.join(componentDir, preferred);
    const tsxName = preferred.replace(/\.stories\.tsx$/, '');
    const componentPath = path
      .join('components', 'ui', componentName, `${tsxName}.tsx`)
      .replaceAll(path.sep, '/');

    const parsed = parseStoryFile(storyPath);
    rows.push({
      name: componentName,
      componentPath,
      ...parsed,
    });
  }

  return rows;
}

// ── Notion upsert ──────────────────────────────────────────────────────

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const RATE_LIMIT_MS = 350; // 3 req/s ceiling per populate-notion-tokens.js

function buildProperties(row, today) {
  return {
    Name: { title: [{ text: { content: row.name } }] },
    'Component path': {
      rich_text: [{ text: { content: row.componentPath } }],
    },
    'Story title': {
      rich_text: [{ text: { content: row.storyTitle ?? '' } }],
    },
    Surface: { select: { name: row.surface } },
    'Story exports': { number: row.storyExports },
    Deprecated: { checkbox: row.deprecated },
    'ADR-010 risk': { checkbox: row.risk },
    'Last sync': { date: { start: today } },
  };
}

async function fetchExistingPages(notion) {
  const byName = new Map();
  let cursor = undefined;
  do {
    const response = await notion.databases.query({
      database_id: COMPONENT_INVENTORY_DB_ID,
      page_size: 100,
      start_cursor: cursor,
    });
    for (const page of response.results) {
      const name = page.properties?.Name?.title?.[0]?.plain_text;
      if (name) byName.set(name, page.id);
    }
    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);
  return byName;
}

async function upsertRow(notion, row, existingId, today) {
  const properties = buildProperties(row, today);
  if (existingId) {
    await notion.pages.update({ page_id: existingId, properties });
    return 'updated';
  }
  await notion.pages.create({
    parent: { database_id: COMPONENT_INVENTORY_DB_ID },
    properties,
  });
  return 'created';
}

// ── Main ───────────────────────────────────────────────────────────────

function logRowsTable(rows) {
  const header = ['Name', 'Surface', 'Exports', 'Q3', 'Risk', 'Deprecated', 'Story title'];
  const cols = [header, ...rows.map((r) => [
    r.name,
    r.surface,
    String(r.storyExports),
    String(r.q3RelevantExports),
    r.risk ? '⚠️ ' : '  ',
    r.deprecated ? 'yes' : '   ',
    r.storyTitle ?? '(no meta.title)',
  ])];
  const widths = header.map((_, i) => Math.max(...cols.map((row) => row[i].length)));
  for (const row of cols) {
    console.log(row.map((cell, i) => cell.padEnd(widths[i])).join('  '));
  }
}

async function main() {
  const rows = findInventoryRows();
  const today = new Date().toISOString().slice(0, 10);

  console.log(`Parsed ${rows.length} components from ${COMPONENTS_DIR}\n`);
  logRowsTable(rows);

  const riskCount = rows.filter((r) => r.risk).length;
  const deprecatedCount = rows.filter((r) => r.deprecated).length;
  const unknownSurfaceCount = rows.filter((r) => r.surface === 'unknown').length;
  console.log(
    `\nSummary: ${rows.length} total · ${riskCount} ADR-010 risk · ` +
    `${deprecatedCount} deprecated · ${unknownSurfaceCount} unknown surface`,
  );

  if (dryRun) {
    console.log('\n(dry-run: no Notion writes)');
    return;
  }

  if (!process.env.NOTION_TOKEN) {
    console.error('ERROR: NOTION_TOKEN missing. Set it in .env (see .env.example).');
    process.exit(1);
  }

  const notion = new Client({ auth: process.env.NOTION_TOKEN });
  console.log(`\nFetching existing pages from Component Inventory DB...`);
  const existing = await fetchExistingPages(notion);
  console.log(`  ${existing.size} existing rows.\n`);

  let created = 0;
  let updated = 0;
  let failed = 0;
  for (const row of rows) {
    try {
      const result = await upsertRow(notion, row, existing.get(row.name), today);
      if (result === 'created') {
        created += 1;
        console.log(`  \x1b[32m+\x1b[0m ${row.name}`);
      } else {
        updated += 1;
        console.log(`  \x1b[34m~\x1b[0m ${row.name}`);
      }
    } catch (err) {
      failed += 1;
      console.error(`  \x1b[31mx\x1b[0m ${row.name}: ${err.message}`);
    }
    await delay(RATE_LIMIT_MS);
  }

  console.log(`\nDone. ${created} created · ${updated} updated · ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
