#!/usr/bin/env node

/**
 * Storybook Story-Shape Linter (ADR-006 §Enforcement)
 *
 * Two tiers of checks:
 *
 * 1. HARD (gating) — banned story export names. Per ADR-006 Part B + the
 *    story-vs-control matrix (ADR-010), a story export must be named after the
 *    state it demonstrates — never after a render-mode gallery. Gallery exports
 *    duplicate the sidebar and forfeit per-state Chromatic / MCP / Controls /
 *    a11y coverage, and `*And*` compounds merge two axes that should split.
 *
 *      Banned exact names:  Variants, Tones, Patterns, Examples
 *      Banned compound:     any PascalCase `…AndY` join (e.g. SizesAndVariants) —
 *                           matched as `[a-z]And[A-Z]` so real words like
 *                           `Expanded` or `Android` never trip it.
 *
 *    There is NO grandfather allowlist for this tier: the Phase 3 sweep
 *    (#1278, #1279) emptied the set repo-wide before the gate shipped, so every
 *    file is expected to pass. `--enforce` exits 1 on any HARD violation.
 *
 * 2. CONSOLIDATION (gating — graduated #1308 Step 7) — the two statically-
 *    decidable "consolidation" slop patterns from the story-shape standard's
 *    `## Consolidation rules` section:
 *
 *      duplicate-args        Two exports whose `args` are structurally identical
 *                            (same keys, same value text). One is dead weight —
 *                            they render the same. Fold the redundant one.
 *      boolean-toggle-story  A non-Default story that differs from `Default`
 *                            ONLY in boolean-valued args. Per matrix Q2 a boolean
 *                            toggle is a Control, not a dedicated story.
 *
 *    These shipped ADVISORY (non-gating) in #1359 while the audit sweep ran, so
 *    CI/pre-commit stayed green on files that predated the rules. #1308 Step 7
 *    cleared the repo, so they GRADUATED to `--enforce`: they now fail the build
 *    exactly like the HARD tier. (The `--matrix-strict` staging flag that used
 *    to gate them is retired — `--enforce` covers both tiers.) The other two
 *    consolidation rules (non-visual-prop-only stories; cross-component/shell
 *    relocation) are not statically decidable and stay skill/PR-review enforced.
 *
 * `## Variants` / `## Patterns` are REQUIRED/optional *MDX H2 headings* on the
 * docs page (ADR-007) — a different layer. This lint only inspects `.stories.tsx`
 * export names + args, never MDX. See ADR-006 §Reconciliation with ADR-007.
 *
 * Usage:
 *   node scripts/lint-story-shape.js                 # full report (exit 0)
 *   node scripts/lint-story-shape.js --json          # machine-readable
 *   node scripts/lint-story-shape.js --enforce       # exit 1 on HARD or
 *                                                    #   CONSOLIDATION violations
 *   node scripts/lint-story-shape.js <file>...       # lint only the given files
 *
 * Exit codes:
 *   0 — report printed (default)
 *   1 — fatal error (no story files found), OR any HARD / CONSOLIDATION
 *       violation under --enforce
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
// HARD rules (mirror of ADR-006 §Part B banned-export table)
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
  if (name === 'Playground') {
    return `\`export const Playground\` — the canonical sandbox story is named \`Default\` (renamed by #694; swept + gated by #1321). Rename the export and its MDX \`<Canvas of={Stories.Playground}>\` references.`;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Structural HARD rules (#1321) — MCP-payload discipline
//
// These mirror the story-shape standard's MCP section: every story export
// carries an `@summary` ≤ 60 chars (MCP truncates past that), every meta has
// exactly one surface tag, deprecated components hide behind `!manifest`, and
// play-assertion `InteractionTest…` stories are tagged out of discovery.
// ---------------------------------------------------------------------------

const SUMMARY_MAX = 60;
const SURFACE_TAG_RE = /surface-(?:web|product|shared)/g;

/** The meta object's top-level entries (`const meta … = { … }` or `export default { … }`), or null. */
function metaEntries(content) {
  const m = content.match(/(?:const meta[^=]*=|export default)\s*\{/);
  if (!m) return null;
  const open = m.index + m[0].length - 1;
  const close = matchClose(content, open);
  if (close === -1) return null;
  return parseTopLevelEntries(content.slice(open + 1, close));
}

/** Collapse an `@summary` tag's text (runs until the next `@tag` or the end of the JSDoc). */
function summaryTextFrom(jsdoc) {
  const m = jsdoc.match(/@summary\s+([\s\S]*?)(?=\n\s*\*\s*@|\*\/)/);
  if (!m) return null;
  return m[1]
    .split('\n')
    .map((l) => l.replace(/^\s*\*\s?/, '').trim())
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * The `@summary` for one story export — from the JSDoc block immediately
 * preceding the export, or an inline JSDoc at the top of the story object
 * (both shapes appear in the standard's examples).
 */
function summaryForExport(content, exportIndex, objOpen, objClose) {
  // A single JSDoc block (no `*/` inside) whose end abuts the export.
  const ONE_JSDOC = /\/\*\*(?:[^*]|\*(?!\/))*\*\//;
  const before = content.slice(0, exportIndex);
  const jm = before.match(new RegExp(`(${ONE_JSDOC.source})\\s*$`));
  if (jm) {
    const s = summaryTextFrom(jm[1]);
    if (s !== null) return s;
  }
  // Inline shape: `export const X: Story = { /** … @summary … */ args: … }` —
  // the JSDoc must open the story object, not annotate a nested member.
  if (objOpen !== -1 && objClose !== -1) {
    const body = content.slice(objOpen, objClose);
    const im = body.match(new RegExp(`^\\{\\s*(${ONE_JSDOC.source})`));
    if (im) {
      const s = summaryTextFrom(im[1]);
      if (s !== null) return s;
    }
  }
  return null;
}

/** True when `<Name>/<Name>.tsx` carries a component-level `@deprecated` (JSDoc directly before an export — same bar as lint-mdx-deprecations). */
function componentIsDeprecated(storyFilePath) {
  const dir = path.dirname(storyFilePath);
  const name = path.basename(storyFilePath).replace(/\.stories\.tsx$/, '');
  const srcPath = path.join(dir, `${name}.tsx`);
  if (!fs.existsSync(srcPath)) return false;
  const src = fs.readFileSync(srcPath, 'utf8');
  for (const m of src.matchAll(/\/\*\*[\s\S]*?\*\//g)) {
    if (!/@deprecated/.test(m[0])) continue;
    if (/^\s*export\s/.test(src.slice(m.index + m[0].length).split('\n').find((l) => l.trim() !== '') || '')) {
      return true;
    }
  }
  return false;
}

/** Structural violations for one file (rules 2–5 of #1321). */
function structuralViolations(filePath, content) {
  const out = [];
  const meta = metaEntries(content);
  const metaTagsRaw = meta && meta.get('tags') ? meta.get('tags').raw : '';
  const metaTitleRaw = meta && meta.get('title') ? meta.get('title').raw : '';

  // Rule: exactly one surface tag on the meta.
  const surfaceCount = (metaTagsRaw.match(SURFACE_TAG_RE) || []).length;
  if (surfaceCount !== 1) {
    out.push({
      rule: 'surface-tag',
      name: 'meta',
      line: 1,
      message: `meta.tags carries ${surfaceCount} surface tags — exactly one of surface-web / surface-product / surface-shared is required (MCP filtering depends on it).`,
    });
  }

  // Rule: deprecated component (or Deprecated/ title) ⇒ meta !manifest.
  const deprecated = componentIsDeprecated(filePath) || /^['"]Deprecated\//.test(metaTitleRaw);
  if (deprecated && !metaTagsRaw.includes('!manifest')) {
    out.push({
      rule: 'deprecated-manifest',
      name: 'meta',
      line: 1,
      message: `component is @deprecated (or titled Deprecated/) but meta.tags lacks '!manifest' — deprecated stories must hide from MCP discovery in the same PR that deprecates them.`,
    });
  }

  // Per-export rules: @summary presence + length, InteractionTest tagging.
  const re = /^export const ([A-Z][A-Za-z0-9_]*)\b[^=]*=\s*\{/gm;
  let m;
  while ((m = re.exec(content))) {
    const name = m[1];
    const line = content.slice(0, m.index).split('\n').length;
    const objOpen = m.index + m[0].length - 1;
    const objClose = matchClose(content, objOpen);
    const top = objClose !== -1 ? parseTopLevelEntries(content.slice(objOpen + 1, objClose)) : new Map();

    const summary = summaryForExport(content, m.index, objOpen, objClose);
    if (summary === null || summary === '') {
      out.push({
        rule: 'missing-summary',
        name,
        line,
        message: `\`${name}\` has no \`@summary\` JSDoc — every story export needs one (feeds the MCP get-documentation payload).`,
      });
    } else if (summary.length > SUMMARY_MAX) {
      out.push({
        rule: 'summary-too-long',
        name,
        line,
        message: `\`${name}\` @summary is ${summary.length} chars — MCP truncates past ${SUMMARY_MAX}. Compress to one line.`,
      });
    }

    if (name.startsWith('InteractionTest')) {
      const tagsRaw = top.get('tags') ? top.get('tags').raw : '';
      if (!tagsRaw.includes('!manifest')) {
        out.push({
          rule: 'interaction-test-manifest',
          name,
          line,
          message: `\`${name}\` is a play-assertion story but lacks story-level \`tags: ['!manifest']\` — it pollutes MCP discovery.`,
        });
      }
      if (top.has('name')) {
        out.push({
          rule: 'interaction-test-name-override',
          name,
          line,
          message: `\`${name}\` overrides \`name:\` — the InteractionTest prefix must stay visible in the sidebar (drop the display-name override).`,
        });
      }
    }
  }

  return out;
}

// ---------------------------------------------------------------------------
// Args extraction (for the ADVISORY tier)
//
// Deliberately lightweight — no TS parser dependency, matching the rest of the
// scripts/ lint suite. It brace-matches the `args: { … }` object literal of
// each story export and reads its top-level keys + raw value text. Values it
// can't reduce to a primitive (identifiers, arrays, objects, JSX, functions)
// are kept as opaque raw text: two opaque values are "equal" only if their text
// matches, and an opaque value is never classified as boolean. Stories with no
// `args` (pure `render`) contribute no args map and are skipped by both rules.
// ---------------------------------------------------------------------------

/** Index of the `}` / `]` / `)` matching the opener at `open`, or -1. */
function matchClose(src, open) {
  const pairs = { '{': '}', '[': ']', '(': ')' };
  const closer = pairs[src[open]];
  let depth = 0;
  let str = null; // active string delimiter: ' " `
  for (let i = open; i < src.length; i++) {
    const c = src[i];
    const prev = src[i - 1];
    if (str) {
      if (c === str && prev !== '\\') str = null;
      continue;
    }
    if (c === "'" || c === '"' || c === '`') {
      str = c;
      continue;
    }
    if (c === '/' && src[i + 1] === '/') {
      const nl = src.indexOf('\n', i);
      i = nl === -1 ? src.length : nl;
      continue;
    }
    if (c === '/' && src[i + 1] === '*') {
      const end = src.indexOf('*/', i + 2);
      i = end === -1 ? src.length : end + 1;
      continue;
    }
    if (c === '{' || c === '[' || c === '(') depth++;
    else if (c === '}' || c === ']' || c === ')') {
      depth--;
      if (depth === 0 && c === closer) return i;
    }
  }
  return -1;
}

/** Parse a top-level `key: value` object-literal body into a Map. */
function parseTopLevelEntries(body) {
  const entries = new Map();
  let i = 0;
  const n = body.length;
  while (i < n) {
    // Skip whitespace / commas / comments.
    for (;;) {
      while (i < n && /[\s,]/.test(body[i])) i++;
      if (body[i] === '/' && body[i + 1] === '/') {
        const nl = body.indexOf('\n', i);
        i = nl === -1 ? n : nl + 1;
        continue;
      }
      if (body[i] === '/' && body[i + 1] === '*') {
        const end = body.indexOf('*/', i + 2);
        i = end === -1 ? n : end + 2;
        continue;
      }
      break;
    }
    if (i >= n) break;
    // Read a key (identifier or quoted).
    let key = null;
    if (body[i] === "'" || body[i] === '"') {
      const q = body[i];
      let j = i + 1;
      while (j < n && !(body[j] === q && body[j - 1] !== '\\')) j++;
      key = body.slice(i + 1, j);
      i = j + 1;
    } else {
      const m = body.slice(i).match(/^([A-Za-z_$][\w$]*)/);
      if (!m) {
        i++;
        continue;
      }
      key = m[1];
      i += m[1].length;
    }
    while (i < n && /\s/.test(body[i])) i++;
    if (body[i] !== ':') continue; // shorthand / spread / not a plain entry — skip
    i++; // past ':'
    while (i < n && /\s/.test(body[i])) i++;
    // Read the value up to the next top-level comma.
    let depth = 0;
    let str = null;
    const start = i;
    for (; i < n; i++) {
      const c = body[i];
      const prev = body[i - 1];
      if (str) {
        if (c === str && prev !== '\\') str = null;
        continue;
      }
      if (c === "'" || c === '"' || c === '`') {
        str = c;
        continue;
      }
      if (c === '/' && body[i + 1] === '/') {
        const nl = body.indexOf('\n', i);
        i = (nl === -1 ? n : nl) - 1; // -1: loop's i++ lands on the newline
        continue;
      }
      if (c === '/' && body[i + 1] === '*') {
        const end = body.indexOf('*/', i + 2);
        i = (end === -1 ? n : end + 2) - 1;
        continue;
      }
      // Track only bracket pairs — NOT `<`/`>`, which collide with `=>` arrows
      // far more often than raw JSX (JSX arg values carry no top-level commas).
      if (c === '{' || c === '[' || c === '(') depth++;
      else if (c === '}' || c === ']' || c === ')') depth--;
      else if (c === ',' && depth === 0) break;
    }
    const raw = body.slice(start, i).trim();
    if (key) entries.set(key, { raw, isBoolean: raw === 'true' || raw === 'false' });
    i++; // past comma
  }
  return entries;
}

/**
 * Extract each story export's args map + whether it is *declarative* (no
 * `render` and no `play` — so its args alone define what it shows). Only
 * declarative stories are comparable by args: a `play`-bearing story with the
 * same args as another still tests different behavior, and a `render` story's
 * output isn't defined by args at all.
 * @returns {{ name: string, line: number, args: Map|null, declarative: boolean }[]}
 */
function extractStories(content) {
  const stories = [];
  const re = /^export const ([A-Z][A-Za-z0-9_]*)\b[^=]*=\s*\{/gm;
  let m;
  while ((m = re.exec(content))) {
    const name = m[1];
    const line = content.slice(0, m.index).split('\n').length;
    const objOpen = m.index + m[0].length - 1; // index of the `{`
    const objClose = matchClose(content, objOpen);
    let argsMap = null;
    let declarative = false;
    if (objClose !== -1) {
      const top = parseTopLevelEntries(content.slice(objOpen + 1, objClose));
      declarative = !top.has('render') && !top.has('play');
      const argsEntry = top.get('args');
      if (argsEntry && argsEntry.raw.startsWith('{')) {
        argsMap = parseTopLevelEntries(argsEntry.raw.slice(1, -1));
      }
    }
    stories.push({ name, line, args: argsMap, declarative });
  }
  return stories;
}

function serializeArgs(map) {
  return [...map.entries()]
    .map(([k, v]) => `${k}=${v.raw}`)
    .sort()
    .join(' ');
}

/** Advisory findings for one file's parsed stories. */
function advisoriesFor(stories) {
  const out = [];
  // Only declarative stories (no render / no play) are comparable by args.
  const withArgs = stories.filter((s) => s.declarative && s.args && s.args.size > 0);

  // Rule: duplicate-args — two exports with structurally identical args.
  const bySig = new Map();
  for (const s of withArgs) {
    const sig = serializeArgs(s.args);
    if (bySig.has(sig)) {
      const first = bySig.get(sig);
      out.push({
        rule: 'duplicate-args',
        name: s.name,
        line: s.line,
        message: `\`${s.name}\` has args identical to \`${first.name}\` — they render the same. Fold the redundant story (consolidation rule 1).`,
      });
    } else {
      bySig.set(sig, s);
    }
  }

  // Rule: boolean-toggle-story — a non-Default story differing from Default
  // only in boolean-valued args (matrix Q2 → Control, not a story).
  const def = withArgs.find((s) => s.name === 'Default');
  if (def) {
    for (const s of withArgs) {
      if (s.name === 'Default') continue;
      const keys = new Set([...def.args.keys(), ...s.args.keys()]);
      const differing = [];
      let allBoolean = true;
      for (const k of keys) {
        const a = def.args.get(k);
        const b = s.args.get(k);
        if ((a && b && a.raw === b.raw) || (!a && !b)) continue; // same
        differing.push(k);
        const present = b || a; // value on whichever side has it
        if (!present.isBoolean) allBoolean = false;
      }
      if (differing.length > 0 && allBoolean) {
        out.push({
          rule: 'boolean-toggle-story',
          name: s.name,
          line: s.line,
          message: `\`${s.name}\` differs from \`Default\` only by boolean toggle(s): ${differing.join(', ')}. Per matrix Q2 these are Controls, not a dedicated story — fold into \`Default\` (consolidation rule 2).`,
        });
      }
    }
  }

  return out;
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

  try {
    violations.push(...structuralViolations(filePath, content));
  } catch {
    // Structural parsing is best-effort on exotic files; never crash the lint.
  }

  let advisories = [];
  try {
    advisories = advisoriesFor(extractStories(content));
  } catch {
    // Parsing is best-effort; never let an advisory-tier parse error fail lint.
    advisories = [];
  }

  return { file: path.relative(REPO_ROOT, filePath), violations, advisories };
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
  // Conforming = clean on BOTH gating tiers (banned/structural + consolidation,
  // which graduated to hard under --enforce in #1308 Step 7).
  const conforming = results.filter((r) => r.violations.length === 0 && r.advisories.length === 0);
  const violating = results.filter((r) => r.violations.length > 0);
  const advised = results.filter((r) => r.advisories.length > 0);
  const advisoryCount = results.reduce((n, r) => n + r.advisories.length, 0);

  if (FLAG_JSON) {
    console.log(
      JSON.stringify(
        {
          total: results.length,
          conforming: conforming.length,
          violating: violating.length,
          advisoryFiles: advised.length,
          advisoryCount,
          results,
        },
        null,
        2,
      ),
    );
    const fail = FLAG_ENFORCE && (violating.length > 0 || advisoryCount > 0);
    process.exit(fail ? 1 : 0);
  }

  console.log(`\nADR-006 Storybook story-shape lint`);
  console.log(`════════════════════════════════════════════════════════════`);
  console.log(`Total story files:  ${results.length}`);
  console.log(`Conforming:         ${conforming.length}`);
  console.log(`Violating (banned): ${violating.length}`);
  console.log(`Consolidation:      ${advisoryCount} in ${advised.length} file(s)\n`);

  if (violating.length === 0) {
    console.log(`✓ No banned story exports (Variants / Tones / Patterns / Examples / *And* compounds).`);
  } else {
    console.log('Banned story exports (HARD — gate under --enforce):');
    for (const r of violating) {
      console.log(`\n  ${r.file}`);
      for (const v of r.violations) console.log(`    [${v.rule}] L${v.line}: ${v.message}`);
    }
  }

  if (advisoryCount > 0) {
    console.log('\nConsolidation violations (rules 1–2 / matrix Q2 — HARD, gate under --enforce):');
    for (const r of advised) {
      console.log(`\n  ${r.file}`);
      for (const a of r.advisories) console.log(`    [${a.rule}] L${a.line}: ${a.message}`);
    }
  }
  console.log('');

  if (FLAG_ENFORCE && (violating.length > 0 || advisoryCount > 0)) {
    const parts = [];
    if (violating.length > 0) parts.push('banned story exports');
    if (advisoryCount > 0) parts.push('consolidation violations');
    console.log(`--enforce: ${parts.join(' + ')} detected, exiting 1`);
    process.exit(1);
  }
  process.exit(0);
}

main();
