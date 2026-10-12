#!/usr/bin/env node
/**
 * generate-component-axes.mjs — Typegen for the BDS component axis matrix.
 *
 * Reads every `components/ui/*\/*.tsx`, finds exported type aliases whose
 * names end in Variant | Appearance | Size | Status and whose values are
 * string-literal unions, then emits `dist/component-axes.json`.
 *
 * Also emits the `@modes` entry: the five `[data-mode-*]` expression axes
 * (ADR-039 Style axis, #2774), read from their BCS vocabulary modules in
 * `content-system/vocabularies/`. Those axes are NOT component props — no
 * component declares them — but the portal's enum gate reads one manifest, so
 * they are surfaced here rather than in a second file. The key is `@modes`
 * because `@` cannot begin a TS export name, so it can never collide with a
 * component; `scripts/lint-blueprint-naming.mjs` looks components up by name
 * and is unaffected by it.
 *
 * Modes:
 *   node scripts/generate-component-axes.mjs           # write to dist/
 *   node scripts/generate-component-axes.mjs --check   # fail if file differs
 *
 * See ADR-009.
 */

import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ts = require('typescript');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const COMPONENTS_DIR = path.join(REPO_ROOT, 'components', 'ui');
const VOCABULARIES_DIR = path.join(REPO_ROOT, 'content-system', 'vocabularies');
const OUTPUT_PATH = path.join(REPO_ROOT, 'manifest', 'component-axes.json');

// Expression-mode axes → the vocabulary module + `as const` array holding the
// axis's closed value list. Keyed by the `data-mode-<key>` attribute segment,
// which is what a consumer actually sets and is NOT always the module stem
// (border-radius emits `data-mode-radius`).
//
// Adding a sixth axis is a deliberate row here, by design — but the VALUES
// are never written here. They come from the vocabulary module, which
// `content-system/vocabularies/expression-modes.test.ts` holds equal to the
// `[data-mode-*]` selectors in tokens/modes-*.css. A Figma mode rename
// therefore fails that test, not this generator.
const MODE_AXES = {
  borderwidth: ['borderwidth-mode.ts', 'BORDERWIDTH_MODE_VALUES'],
  elevation: ['elevation-mode.ts', 'ELEVATION_MODE_VALUES'],
  radius: ['radius-mode.ts', 'RADIUS_MODE_VALUES'],
  spacing: ['spacing-mode.ts', 'SPACING_MODE_VALUES'],
  typography: ['typography-mode.ts', 'TYPOGRAPHY_MODE_VALUES'],
};

/** Reserved manifest key for the mode axes. `@` can't start a TS export name. */
const MODES_KEY = '@modes';

// Axis suffix → canonical axis prop name
const AXIS_SUFFIXES = {
  Variant: 'variant',
  Appearance: 'appearance',
  Size: 'size',
  Status: 'status',
};

const checkMode = process.argv.includes('--check');

// ── Extract string literal values from a union type node ──────────────────

function extractStringLiterals(typeNode) {
  const values = [];

  function walk(node) {
    if (ts.isLiteralTypeNode(node) && ts.isStringLiteral(node.literal)) {
      values.push(node.literal.text);
    } else if (ts.isUnionTypeNode(node)) {
      node.types.forEach(walk);
    } else if (ts.isParenthesizedTypeNode(node)) {
      walk(node.type);
    }
  }

  walk(typeNode);
  return values.length > 0 ? values : null;
}

// ── Parse one .tsx file and extract axis types ────────────────────────────

function parseFile(filePath) {
  const sourceText = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    /* setParentNodes */ true,
    ts.ScriptKind.TSX,
  );

  const axes = {};

  ts.forEachChild(sourceFile, (node) => {
    if (!ts.isTypeAliasDeclaration(node)) return;

    const isExported = (node.modifiers ?? []).some(
      (m) => m.kind === ts.SyntaxKind.ExportKeyword,
    );
    if (!isExported) return;

    const typeName = node.name.text;

    for (const [suffix, axisName] of Object.entries(AXIS_SUFFIXES)) {
      if (typeName.endsWith(suffix)) {
        const values = extractStringLiterals(node.type);
        if (values) axes[axisName] = values;
        break;
      }
    }
  });

  return Object.keys(axes).length > 0 ? axes : null;
}

// ── Extract an `export const NAME = ['a','b'] as const` value list ────────

function extractConstStringArray(filePath, constName) {
  const sourceFile = ts.createSourceFile(
    filePath,
    fs.readFileSync(filePath, 'utf8'),
    ts.ScriptTarget.Latest,
    /* setParentNodes */ true,
    ts.ScriptKind.TS,
  );

  let values = null;

  ts.forEachChild(sourceFile, (node) => {
    if (!ts.isVariableStatement(node)) return;
    const isExported = (node.modifiers ?? []).some(
      (m) => m.kind === ts.SyntaxKind.ExportKeyword,
    );
    if (!isExported) return;

    for (const decl of node.declarationList.declarations) {
      if (!ts.isIdentifier(decl.name) || decl.name.text !== constName) continue;

      // Unwrap `[...] as const` / `[...] satisfies T` down to the literal.
      let init = decl.initializer;
      while (
        init &&
        (ts.isAsExpression(init) ||
          ts.isSatisfiesExpression(init) ||
          ts.isParenthesizedExpression(init))
      ) {
        init = init.expression;
      }
      if (!init || !ts.isArrayLiteralExpression(init)) continue;

      // Every element must be a plain string literal. A spread or a computed
      // value means the list is no longer statically readable, and emitting a
      // partial one would publish a shorter enum than the vocabulary holds.
      const out = [];
      for (const el of init.elements) {
        if (!ts.isStringLiteral(el)) return;
        out.push(el.text);
      }
      values = out;
    }
  });

  return values;
}

function collectModeAxes() {
  const axes = {};
  for (const key of Object.keys(MODE_AXES).sort()) {
    const [moduleFile, constName] = MODE_AXES[key];
    const filePath = path.join(VOCABULARIES_DIR, moduleFile);
    if (!fs.existsSync(filePath)) {
      console.error(`ERROR: ${MODES_KEY}.${key} — missing ${path.relative(REPO_ROOT, filePath)}`);
      process.exit(1);
    }
    const values = extractConstStringArray(filePath, constName);
    if (!values || values.length === 0) {
      console.error(
        `ERROR: ${MODES_KEY}.${key} — could not read ${constName} from ` +
          `${path.relative(REPO_ROOT, filePath)} as a static string list.`,
      );
      process.exit(1);
    }
    axes[key] = values;
  }
  return axes;
}

// ── Scan all component directories ───────────────────────────────────────

// `@modes` first so the mode axes stay at a fixed position in the emitted
// JSON regardless of how the component list grows.
const manifest = { [MODES_KEY]: collectModeAxes() };

const componentDirs = fs
  .readdirSync(COMPONENTS_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

for (const componentName of componentDirs) {
  const componentDir = path.join(COMPONENTS_DIR, componentName);

  const tsxFiles = fs
    .readdirSync(componentDir)
    .filter(
      (f) =>
        f.endsWith('.tsx') &&
        !f.endsWith('.stories.tsx') &&
        !f.endsWith('.test.tsx') &&
        !f.endsWith('.spec.tsx'),
    );

  for (const tsxFile of tsxFiles) {
    const filePath = path.join(componentDir, tsxFile);
    const exportedName = tsxFile.replace(/\.tsx$/, '');
    const axes = parseFile(filePath);
    if (axes) manifest[exportedName] = axes;
  }
}

const output = JSON.stringify(manifest, null, 2) + '\n';

// ── Check mode: fail if committed file differs ────────────────────────────

if (checkMode) {
  if (!fs.existsSync(OUTPUT_PATH)) {
    console.error('ERROR: manifest/component-axes.json does not exist.');
    console.error('Run: npm run typegen:axes');
    process.exit(1);
  }

  const committed = fs.readFileSync(OUTPUT_PATH, 'utf8');
  if (output === committed) {
    const count = Object.keys(manifest).filter((k) => k !== MODES_KEY).length;
    console.log(
      `✓ manifest/component-axes.json in sync (${count} components + ${MODES_KEY}).`,
    );
    process.exit(0);
  }

  const committedObj = JSON.parse(committed);
  const generatedObj = JSON.parse(output);

  console.error('ERROR: manifest/component-axes.json is out of sync with component types.');
  console.error('Run: npm run typegen:axes\n');

  for (const [comp, axes] of Object.entries(generatedObj)) {
    const prev = committedObj[comp];
    if (!prev) {
      console.error(`  NEW:     ${comp}`);
      continue;
    }
    for (const [axis, values] of Object.entries(axes)) {
      const prevValues = prev[axis];
      if (!prevValues || JSON.stringify(values) !== JSON.stringify(prevValues)) {
        const added = values.filter((v) => !(prevValues ?? []).includes(v));
        const removed = (prevValues ?? []).filter((v) => !values.includes(v));
        if (added.length || removed.length) {
          console.error(`  CHANGED: ${comp}.${axis}`);
          if (added.length) console.error(`    + ${added.join(', ')}`);
          if (removed.length) console.error(`    - ${removed.join(', ')}`);
        }
      }
    }
  }
  for (const comp of Object.keys(committedObj)) {
    if (!generatedObj[comp]) console.error(`  REMOVED: ${comp}`);
  }

  process.exit(1);
}

// ── Write mode ────────────────────────────────────────────────────────────

fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
fs.writeFileSync(OUTPUT_PATH, output, 'utf8');

const count = Object.keys(manifest).filter((k) => k !== MODES_KEY).length;
console.log(`✓ Wrote manifest/component-axes.json (${count} components + ${MODES_KEY})`);
for (const [comp, axes] of Object.entries(manifest)) {
  const summary = Object.entries(axes)
    .map(([k, v]) => `${k}(${v.length})`)
    .join(', ');
  console.log(`  ${comp}: ${summary}`);
}
