#!/usr/bin/env node
/**
 * generate-component-axes.mjs — Typegen for the BDS component axis matrix.
 *
 * Reads every `components/ui/*\/*.tsx`, finds exported type aliases whose
 * names end in Variant | Appearance | Size | Status and whose values are
 * string-literal unions, then emits `dist/component-axes.json`.
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
const OUTPUT_PATH = path.join(REPO_ROOT, 'manifest', 'component-axes.json');

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

// ── Scan all component directories ───────────────────────────────────────

const manifest = {};

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
    const count = Object.keys(manifest).length;
    console.log(`✓ manifest/component-axes.json in sync (${count} components).`);
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

const count = Object.keys(manifest).length;
console.log(`✓ Wrote manifest/component-axes.json (${count} components)`);
for (const [comp, axes] of Object.entries(manifest)) {
  const summary = Object.entries(axes)
    .map(([k, v]) => `${k}(${v.length})`)
    .join(', ');
  console.log(`  ${comp}: ${summary}`);
}
