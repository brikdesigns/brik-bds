#!/usr/bin/env node
/**
 * lint-mdx-tokens — validates BDS token NAMES used in documentation MDX against
 * the canonical registry, so a phantom token can't be documented as real.
 *
 * ── Why ──────────────────────────────────────────────────────────────────────
 * The docs-site audit (#1358) found the systemic accuracy failure: wherever a
 * page renders from live data it stayed correct; wherever a human transcribed a
 * token name into a code block or a reference table, it drifted. A doc that
 * presents `--text-info` (real name `--text-status-info`) or `--surface-success`
 * (real name `--surface-positive`) as a usable token silently misleads every
 * consumer who copies it — the same phantom-token class that produced portal
 * #512 / #553 (rolled back). `scripts/lint-tokens.js` guards component source but
 * never reads MDX; this gate closes that gap (Wave 4 drift gate, #1362).
 *
 * ── What it checks ─────────────────────────────────────────────────────────────
 * Two rules, over the same surfaces (fenced code blocks + markdown tables):
 *
 *   1. **phantom** — the name must be declared in the canonical registry
 *      (`dist/tokens.css`) OR be a component-scoped custom property declared under
 *      `components/ui/` in a `.css` file (a documented CSS-Override-API knob). A
 *      name that exists nowhere is a phantom and fails the build.
 *   2. **deprecated** — the name must not be a registry entry marked `DEPRECATED`.
 *      A deprecated alias still resolves, so rule 1 can't see it; documenting one
 *      as the usable name teaches the vocabulary consumers are migrating off.
 *      This is the #1753 drift: the 11-step numeric color scale shipped in
 *      v0.152.0 (#1737/#1739) while the primitives docs went on teaching the
 *      6-step ladder (`--color-poppy-darker`) as the system.
 *
 * The deprecated set is read from the registry, not hardcoded — any token whose
 * declaration carries `DEPRECATED` is gated in docs automatically.
 *
 * Scope is deliberately narrowed to fenced code + tables — the surfaces where a
 * token is presented as copy-pasteable fact. Prose inline-code (`--surface-*`
 * naming patterns, conceptual mentions) is out of scope.
 *
 * ── What is NOT flagged ────────────────────────────────────────────────────────
 *   • Naming-pattern placeholders — anything with a glob/interpolation/range:
 *     `--text-*`, `--surface-{role}`, `--text-service-{line}-on-light`,
 *     `--size-0…2200`, `--background-<role>`. (Detected by trailing/adjacent
 *     `* { } < [ … ...` or a dangling hyphen.)
 *   • Component-scoped knobs declared in component CSS (`--page-header-section-gap`,
 *     `--text-input-bg`) — real, just not registry tokens.
 *   • Anything on a line carrying `lint-mdx-tokens-ignore`, or inside a
 *     `{/* lint-mdx-tokens-ignore-start *\/}` … `{/* lint-mdx-tokens-ignore-end *\/}`
 *     (or the HTML-comment form) block — the escape hatch for deliberate
 *     counter-examples (the "Drift pattern" table, ❌ anti-pattern code blocks,
 *     the deprecated-alias mapping table on the Color page).
 *
 * ── Families checked ───────────────────────────────────────────────────────────
 * Only the Semantic-tier families `dist/tokens.css` is authoritative for (see
 * FAMILIES). Other prefixes (`--bds-*`, `--font-*`, `--space-*`, `--aspect-*`,
 * `--_*`, client `--theme-*`) are out of scope.
 *
 * ── Registry source ────────────────────────────────────────────────────────────
 * Reads `dist/tokens.css`. That file is git-ignored (a build artifact), so the
 * script rebuilds it via `scripts/build-dist-tokens.js` when absent — a pure,
 * network-free concat of the committed `tokens/*.css`. CI runs the build first;
 * locally it's normally already present.
 *
 * ── Exit codes ─────────────────────────────────────────────────────────────────
 *   0  Clean — every documented token name resolves and none is deprecated
 *   1  Phantom or deprecated token name(s) found
 *   2  Bad invocation / missing registry
 *
 * ── CLI ────────────────────────────────────────────────────────────────────────
 *   lint-mdx-tokens [--json] [--files <f1> <f2> …] [--tokens <registry.css>]
 *
 * `--files`  scan only the listed .mdx (else the whole docs + component corpus).
 * `--tokens` use a single explicit registry file as the known-name set and skip
 *            the dist build + component-CSS scan (hermetic mode, for tests).
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { resolve, join, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const DIST_TOKENS = join(REPO_ROOT, 'dist', 'tokens.css');
const DOCS_DIR = join(REPO_ROOT, 'docs-site', 'content', 'docs');
const COMPONENTS_DIR = join(REPO_ROOT, 'components', 'ui');

// Semantic-tier families dist/tokens.css is the authority for. A token name in
// one of these families that resolves nowhere is a phantom. Ordered longest-first
// so `--border-radius-` / `--border-width-` classify before `--border-`.
const FAMILIES = [
  '--border-radius-', '--border-width-', '--border-',
  '--background-', '--surface-', '--text-', '--color-',
  '--padding-', '--gap-', '--size-',
  '--body-', '--heading-', '--label-', '--display-', '--subtitle-',
  '--page-', '--icon-',
];
const inFamily = (t) => FAMILIES.some((p) => t.startsWith(p));

// Token-shaped match. `\w` includes `-` via the class; a trailing `-` (glob stub
// like `--text-`) is caught by the placeholder check below.
const TOKEN_RE = /--[a-zA-Z][\w-]*/g;

// Chars that, immediately after a token, mark it as a naming-pattern placeholder
// rather than a literal name: glob `*`, interpolation `{`, `<[` placeholders,
// range `…` / `...`.
const PLACEHOLDER_AFTER = /^(?:\*|\{|<|\[|…|\.\.\.)/;

const LINE_IGNORE = 'lint-mdx-tokens-ignore';
const BLOCK_START = /lint-mdx-tokens-ignore-start/;
const BLOCK_END = /lint-mdx-tokens-ignore-end/;

// ── Registry ────────────────────────────────────────────────────────────────

function ensureDistTokens() {
  if (existsSync(DIST_TOKENS)) return;
  // Rebuild the canonical artifact (pure concat of committed tokens/*.css).
  execFileSync('node', [join(__dirname, 'build-dist-tokens.js')], {
    cwd: REPO_ROOT,
    stdio: 'ignore',
  });
  if (!existsSync(DIST_TOKENS)) {
    process.stderr.write(
      `lint-mdx-tokens: could not build ${relative(REPO_ROOT, DIST_TOKENS)}; run "npm run build:dist-tokens".\n`,
    );
    process.exit(2);
  }
}

function declaredNamesIn(css) {
  const names = new Set();
  for (const m of css.matchAll(/^\s*(--[\w-]+)\s*:/gm)) names.add(m[1]);
  return names;
}

// Names whose declaration is annotated `DEPRECATED` — the alias layer #1739 laid
// over the numeric stops, plus any future retirement marked the same way. Read
// from the registry so the gate never needs a hand-maintained list.
function deprecatedNamesIn(css) {
  const names = new Set();
  for (const m of css.matchAll(/^\s*(--[\w-]+)\s*:[^\n]*DEPRECATED/gm)) names.add(m[1]);
  return names;
}

// The replacement a DEPRECATED comment names, e.g.
// `--color-poppy-darker: var(--color-poppy-800); /** DEPRECATED — use color.poppy.800 … */`
// → `--color-poppy-800`. Used only to make the failure message actionable.
function replacementsIn(css) {
  const map = new Map();
  for (const m of css.matchAll(/^\s*(--[\w-]+)\s*:\s*var\((--[\w-]+)\)[^\n]*DEPRECATED/gm)) {
    map.set(m[1], m[2]);
  }
  return map;
}

function walk(dir, pred, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const e of readdirSync(dir)) {
    const full = join(dir, e);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, pred, acc);
    else if (pred(full)) acc.push(full);
  }
  return acc;
}

function buildKnownTokens(tokensOverride) {
  // Hermetic mode (tests): a single explicit registry file, no dist build and
  // no component-CSS scan.
  if (tokensOverride) {
    const css = readFileSync(resolve(tokensOverride), 'utf8');
    return {
      known: declaredNamesIn(css),
      deprecated: deprecatedNamesIn(css),
      replacements: replacementsIn(css),
    };
  }
  ensureDistTokens();
  const registry = readFileSync(DIST_TOKENS, 'utf8');
  const known = declaredNamesIn(registry);
  // ∪ component-scoped custom properties (CSS-Override-API knobs) — real names
  // that legitimately never enter the registry.
  for (const css of walk(COMPONENTS_DIR, (f) => f.endsWith('.css'))) {
    for (const n of declaredNamesIn(readFileSync(css, 'utf8'))) known.add(n);
  }
  return {
    known,
    deprecated: deprecatedNamesIn(registry),
    replacements: replacementsIn(registry),
  };
}

// ── MDX scan ──────────────────────────────────────────────────────────────────

function relPosix(abs) {
  return relative(REPO_ROOT, abs).split(sep).join('/');
}

function scanFile(file, { known, deprecated, replacements }) {
  const rel = relPosix(file);
  const lines = readFileSync(file, 'utf8').split('\n');
  const violations = [];
  let inFence = false;
  let inIgnoreBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (BLOCK_START.test(line)) inIgnoreBlock = true;
    if (BLOCK_END.test(line)) { inIgnoreBlock = false; continue; }

    // Fence toggle (``` or ~~~). The fence line itself carries no tokens.
    if (/^\s*(```|~~~)/.test(line)) { inFence = !inFence; continue; }

    const isTable = !inFence && /^\s*\|/.test(line);
    if (!inFence && !isTable) continue;          // scope: fenced code + tables only
    if (inIgnoreBlock) continue;
    if (line.includes(LINE_IGNORE)) continue;

    for (const m of line.matchAll(TOKEN_RE)) {
      const tok = m[0];
      if (!inFamily(tok)) continue;
      if (tok.endsWith('-')) continue;           // dangling glob stub (`--text-`)
      const after = line.slice(m.index + tok.length);
      if (PLACEHOLDER_AFTER.test(after)) continue; // `--surface-{role}`, `--text-*`
      if (deprecated.has(tok)) {
        violations.push({
          file: rel,
          line: i + 1,
          token: tok,
          kind: 'deprecated',
          replacement: replacements.get(tok) ?? null,
          text: line.trim(),
        });
        continue;
      }
      if (known.has(tok)) continue;
      violations.push({ file: rel, line: i + 1, token: tok, kind: 'phantom', text: line.trim() });
    }
  }
  return violations;
}

// ── Main ────────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  const jsonMode = args.includes('--json');
  const filesIdx = args.indexOf('--files');
  const explicit = filesIdx !== -1
    ? args.slice(filesIdx + 1).filter((f) => !f.startsWith('--'))
    : null;
  const tokensIdx = args.indexOf('--tokens');
  const tokensOverride = tokensIdx !== -1 ? args[tokensIdx + 1] : null;

  const registry = buildKnownTokens(tokensOverride);

  const files = explicit
    ? explicit.map((f) => resolve(f)).filter((f) => f.endsWith('.mdx') && existsSync(f))
    : [
        ...walk(DOCS_DIR, (f) => f.endsWith('.mdx')),
        ...walk(COMPONENTS_DIR, (f) => f.endsWith('.mdx')),
      ];

  const violations = [];
  for (const f of files) violations.push(...scanFile(f, registry));

  if (jsonMode) {
    console.log(JSON.stringify(
      { files: files.length, known: registry.known.size, violations }, null, 2,
    ));
    process.exit(violations.length > 0 ? 1 : 0);
  }

  const phantoms = violations.filter((v) => v.kind === 'phantom');
  const stale = violations.filter((v) => v.kind === 'deprecated');

  if (violations.length === 0) {
    console.log(
      `lint-mdx-tokens: clean — ${files.length} MDX file(s), ${registry.known.size} known token names, ` +
      `${registry.deprecated.size} deprecated, 0 phantom(s), 0 deprecated use(s)\n`,
    );
    process.exit(0);
  }

  console.log(
    `\nlint-mdx-tokens: ${phantoms.length} phantom + ${stale.length} deprecated token name(s) in docs MDX\n`,
  );
  const byFile = {};
  for (const v of violations) (byFile[v.file] ||= []).push(v);
  for (const [f, vs] of Object.entries(byFile)) {
    console.log(`  ${f}`);
    for (const v of vs.sort((a, b) => a.line - b.line)) {
      const why = v.kind === 'deprecated'
        ? `— DEPRECATED${v.replacement ? `, use ${v.replacement}` : ''}`
        : '— not in dist/tokens.css nor any component CSS';
      console.log(`    ${v.line}: \x1b[31m${v.token}\x1b[0m  ${why}`);
    }
  }
  console.log(
    '\n  A token name in a code block or table must resolve to a real, current token.\n' +
    '  Fix: correct the name against dist/tokens.css (grep it), or\n' +
    '  mark a deliberate counter-example with lint-mdx-tokens-ignore /\n' +
    '  {/* lint-mdx-tokens-ignore-start *\/} … {/* lint-mdx-tokens-ignore-end *\/}.\n',
  );
  process.exit(1);
}

main();
