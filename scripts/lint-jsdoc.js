#!/usr/bin/env node

/**
 * BDS JSDoc / story-metadata linter.
 *
 * Enforces three rules so consumer-repo Storybook MCP queries get authored
 * answers instead of regex-extracted fragments:
 *
 *   1. Every component's main export has a preceding JSDoc containing
 *      `@summary` (matched against `components/ui/<Name>/<Name>.tsx`).
 *   2. Every `export const Name: Story` in a `*.stories.tsx` file has a
 *      preceding JSDoc containing `@summary`.
 *   3. Every story file's `meta` has one of `surface-web`, `surface-product`,
 *      or `surface-shared` in its `tags` array.
 *
 * Components that don't follow the `<Name>/<Name>.tsx` shape (currently
 * Calendar, Icons, SheetTypography) are skipped automatically — they're
 * tracked separately as Track D of the JSDoc audit.
 *
 * Usage:
 *   node scripts/lint-jsdoc.js          # check everything, exit 1 on any violation
 *
 * Wired into: pre-commit hook + `npm run lint-jsdoc`.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const COMPONENTS_DIR = path.join(ROOT, 'components', 'ui');

// ── Helpers ────────────────────────────────────────────────────

/**
 * Find a JSDoc block (`/** ... *\/`) immediately preceding `lineIdx`.
 * Returns null when the preceding non-blank lines aren't a real JSDoc —
 * e.g. a `/* ─── separator ─── *\/` block-comment ends with `*\/` but
 * starts with `/*`, not `/**`, and must not be matched.
 */
function precedingJsdoc(lines, lineIdx) {
  let i = lineIdx - 1;
  while (i >= 0 && lines[i].trim() === '') i--;
  if (i < 0) return null;
  const closer = lines[i].trim();
  if (!closer.endsWith('*/')) return null;
  const end = i;
  if (closer.startsWith('/**')) return lines[i];
  i--;
  while (i >= 0) {
    const t = lines[i].trim();
    if (t.startsWith('/**')) return lines.slice(i, end + 1).join('\n');
    if (!t.startsWith('*')) return null;
    i--;
  }
  return null;
}

const SURFACE_TAGS = new Set(['surface-web', 'surface-product', 'surface-shared']);

const errors = [];

// ── Rule 1: component main export has @summary ────────────────

const componentDirs = fs
  .readdirSync(COMPONENTS_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .filter((n) => n !== 'shared');

for (const name of componentDirs) {
  const file = path.join(COMPONENTS_DIR, name, `${name}.tsx`);
  if (!fs.existsSync(file)) continue; // Calendar / Icons / SheetTypography
  const src = fs.readFileSync(file, 'utf8');
  const lines = src.split('\n');

  const exportRe = new RegExp(
    `^(export\\s+(default\\s+)?function\\s+${name}\\b|export\\s+const\\s+${name}\\s*=\\s*forwardRef\\b|export\\s+const\\s+${name}\\b)`,
  );
  let exportLine = -1;
  for (let i = 0; i < lines.length; i++) {
    if (exportRe.test(lines[i])) {
      exportLine = i;
      break;
    }
  }
  if (exportLine === -1) {
    errors.push(`${path.relative(ROOT, file)}: main \`${name}\` export not found by linter regex`);
    continue;
  }
  const jsdoc = precedingJsdoc(lines, exportLine);
  if (!jsdoc || !/@summary\b/.test(jsdoc)) {
    errors.push(`${path.relative(ROOT, file)}:${exportLine + 1}: \`${name}\` export is missing \`@summary\` JSDoc`);
  }
}

// ── Rule 2 + 3: stories ────────────────────────────────────────

function findStoryFiles(dir) {
  const found = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) found.push(...findStoryFiles(p));
    else if (e.isFile() && e.name.endsWith('.stories.tsx')) found.push(p);
  }
  return found;
}

const storyFiles = findStoryFiles(COMPONENTS_DIR);

for (const file of storyFiles) {
  const src = fs.readFileSync(file, 'utf8');
  const lines = src.split('\n');
  const rel = path.relative(ROOT, file);

  // Rule 3: meta has a surface-* tag.
  // Find the meta declaration block and inspect its tags array.
  // We accept: `const meta:`...`= {` (with optional `:` type annotation) or
  //            `const meta = { ... } satisfies Meta<...>;`
  const metaStart = lines.findIndex((l) => /\bconst\s+meta\b[^=]*=\s*\{/.test(l));
  if (metaStart === -1) {
    errors.push(`${rel}: cannot find \`const meta = {\` declaration`);
  } else {
    // Capture from metaStart to first line that closes the block. Crude but
    // sufficient: tags arrays in meta are always within the first ~60 lines.
    const window = lines.slice(metaStart, metaStart + 80).join('\n');
    const tagsMatch = window.match(/\btags:\s*\[([^\]]*)\]/);
    if (!tagsMatch) {
      errors.push(`${rel}:${metaStart + 1}: meta has no \`tags:\` field; expected one of ${[...SURFACE_TAGS].join(' / ')}`);
    } else {
      const tagList = tagsMatch[1]
        .split(',')
        .map((t) => t.trim().replace(/^['"`]|['"`]$/g, ''))
        .filter(Boolean);
      const hasSurface = tagList.some((t) => SURFACE_TAGS.has(t));
      if (!hasSurface) {
        errors.push(`${rel}:${metaStart + 1}: meta tags missing surface-* tag (got: ${tagList.join(', ') || 'none'})`);
      }
    }
  }

  // Rule 2: every Story export has @summary.
  const storyRe = /^\s*export\s+const\s+([A-Za-z0-9_]+)\s*:\s*Story\b/;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(storyRe);
    if (!m) continue;
    const storyName = m[1];
    const jsdoc = precedingJsdoc(lines, i);
    if (!jsdoc || !/@summary\b/.test(jsdoc)) {
      errors.push(`${rel}:${i + 1}: story \`${storyName}\` missing \`@summary\` JSDoc`);
    }
  }
}

// ── Report ────────────────────────────────────────────────────

if (errors.length === 0) {
  console.log('✓ JSDoc lint clean — every component + story export has @summary, every story meta has a surface-* tag.');
  process.exit(0);
}

console.error(`✗ JSDoc lint found ${errors.length} violation(s):\n`);
for (const e of errors) console.error('  ' + e);
console.error(`\n  Fix tips:`);
console.error(`    - Component @summary: add a JSDoc with \`@summary <≤60 chars>\` above the main export.`);
console.error(`    - Story @summary: add \`/** @summary <description> */\` above each \`export const Foo: Story\`.`);
console.error(`    - Surface tag: add one of 'surface-web' | 'surface-product' | 'surface-shared' to the meta.tags array.`);
console.error(`    - See docs/STORYBOOK-WRITING-GUIDE.md → "MCP Discipline" + "Surface taxonomy" for the convention.`);
process.exit(1);
