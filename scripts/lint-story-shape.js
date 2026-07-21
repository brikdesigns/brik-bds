#!/usr/bin/env node

/**
 * Storybook Story-Shape Linter (ADR-006 §Enforcement)
 *
 * Rejects banned story export names in `*.stories.tsx` files. Per ADR-006
 * Part B + the story-vs-control matrix (ADR-010), a story export must be named
 * after the state it demonstrates — never after a render-mode gallery. Gallery
 * exports duplicate the sidebar and forfeit per-state Chromatic / MCP / Controls
 * / a11y coverage, and `*And*` compounds merge two axes that should split.
 *
 * Banned exact names:  Variants, Tones, Patterns, Examples
 * Banned compound:     any PascalCase `…AndY` join (e.g. SizesAndVariants) —
 *                      matched as `[a-z]And[A-Z]` so real words like `Expanded`
 *                      or `Android` never trip it.
 *
 * There is NO grandfather allowlist: the Phase 3 sweep (#1278, #1279) emptied
 * the set repo-wide before this gate shipped, so every file is expected to pass
 * from day one. A new violation means a newly-authored file broke the rule.
 *
 * `## Variants` / `## Patterns` are REQUIRED/optional *MDX H2 headings* on the
 * docs page (ADR-007) — a different layer. This lint only inspects `.stories.tsx`
 * export names, never MDX. See ADR-006 §Reconciliation with ADR-007.
 *
 * Usage:
 *   node scripts/lint-story-shape.js               # full report (exit 0)
 *   node scripts/lint-story-shape.js --json        # machine-readable
 *   node scripts/lint-story-shape.js --enforce     # exit 1 on violations
 *   node scripts/lint-story-shape.js <file>...     # lint only the given files
 *
 * Exit codes:
 *   0 — report printed (default; --enforce changes this)
 *   1 — fatal error (no story files found) OR violations under --enforce
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const FLAG_ENFORCE = args.includes('--enforce');
const FLAG_JSON = args.includes('--json');
const EXPLICIT_FILES = args.filter((a) => !a.startsWith('--'));

const REPO_ROOT = path.resolve(__dirname, '..');

// Story files live under these roots (mirrors the story-shape standard's scope).
const STORY_ROOTS = ['components/ui', 'stories', 'content-system/blueprints'];

// Directories never worth walking.
const SKIP_DIRS = new Set(['node_modules', 'dist', 'storybook-static', '.git', 'coverage']);

// ---------------------------------------------------------------------------
// Rules (mirror of ADR-006 §Part B banned-export table)
// ---------------------------------------------------------------------------

const BANNED_EXACT = new Set(['Variants', 'Tones', 'Patterns', 'Examples']);
// PascalCase "X and Y" join — a lowercase char, `And`, then an uppercase char.
const BANNED_COMPOUND = /[a-z]And[A-Z]/;

function reasonFor(name) {
  if (BANNED_EXACT.has(name)) {
    return `\`export const ${name}\` is a banned render-mode gallery name (ADR-006 Part B). Split into args-driven stories named after each state, or keep one axis-only gallery named after the axis (e.g. \`Sizes\`).`;
  }
  if (BANNED_COMPOUND.test(name)) {
    return `\`export const ${name}\` merges two axes ("And" in a story name). Split into one story per axis.`;
  }
  return null;
}

// ---------------------------------------------------------------------------
// File discovery
// ---------------------------------------------------------------------------

function walkStoryFiles(dir, acc) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc; // root may not exist in every checkout (e.g. stories/)
  }
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walkStoryFiles(path.join(dir, entry.name), acc);
    } else if (entry.isFile() && entry.name.endsWith('.stories.tsx')) {
      acc.push(path.join(dir, entry.name));
    }
  }
  return acc;
}

function findStoryFiles() {
  if (EXPLICIT_FILES.length > 0) {
    return EXPLICIT_FILES.map((f) => path.resolve(REPO_ROOT, f)).filter(
      (f) => f.endsWith('.stories.tsx') && fs.existsSync(f),
    );
  }
  const acc = [];
  for (const root of STORY_ROOTS) walkStoryFiles(path.join(REPO_ROOT, root), acc);
  return acc;
}

// ---------------------------------------------------------------------------
// Lint one file
// ---------------------------------------------------------------------------

function lintFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const violations = [];
  const lines = content.split('\n');
  const exportRe = /^export const ([A-Z][A-Za-z0-9_]*)\b/;

  lines.forEach((text, i) => {
    const m = text.match(exportRe);
    if (!m) return;
    const name = m[1];
    const reason = reasonFor(name);
    if (reason) violations.push({ rule: 'banned-story-export', name, message: reason, line: i + 1 });
  });

  return { file: path.relative(REPO_ROOT, filePath), violations };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const files = findStoryFiles();
  if (files.length === 0) {
    if (EXPLICIT_FILES.length > 0) process.exit(0); // no story files among the given paths
    console.error(`No *.stories.tsx files found under ${STORY_ROOTS.join(', ')}`);
    process.exit(1);
  }

  const results = files.map(lintFile);
  const conforming = results.filter((r) => r.violations.length === 0);
  const violating = results.filter((r) => r.violations.length > 0);

  if (FLAG_JSON) {
    console.log(
      JSON.stringify(
        { total: results.length, conforming: conforming.length, violating: violating.length, results },
        null,
        2,
      ),
    );
    process.exit(FLAG_ENFORCE && violating.length > 0 ? 1 : 0);
  }

  console.log(`\nADR-006 Storybook story-shape lint`);
  console.log(`════════════════════════════════════════════════════════════`);
  console.log(`Total story files:  ${results.length}`);
  console.log(`Conforming:         ${conforming.length}`);
  console.log(`Violating:          ${violating.length}\n`);

  if (violating.length === 0) {
    console.log(`✓ No banned story exports (Variants / Tones / Patterns / Examples / *And* compounds).\n`);
    process.exit(0);
  }

  console.log('Banned story exports:');
  for (const r of violating) {
    console.log(`\n  ${r.file}`);
    for (const v of r.violations) console.log(`    [${v.rule}] L${v.line}: ${v.message}`);
  }
  console.log('');

  if (FLAG_ENFORCE) {
    console.log('--enforce: banned story exports detected, exiting 1');
    process.exit(1);
  }
  process.exit(0);
}

main();
