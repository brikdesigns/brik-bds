#!/usr/bin/env node
/**
 * slot-pattern-check — Structural BEM-slot enforcement for the Brik Design
 * System.
 *
 * Enforces the ADR-008 §4 grammar for `bds-*` class names by *shape*, not by
 * an enumerated list. This is the "pattern gate" that supersedes the closed
 * `SLOT-ALLOWLIST.md` enumeration (ADR-008 §2) — see ADR-017.
 *
 * Why a pattern gate instead of an allowlist. The enumerated allowlist was
 * never enforced (Phase C of ADR-008 never shipped — #1080), and by 2026-07
 * 329 of 396 in-use slots were unlisted. A naive allowlist lint would flood
 * violations on shipped, correct code. A cross-block-reuse ban is a non-starter
 * too: 77 slots (`__title` ×22, `__label` ×21, `__icon` ×18) are *intentionally*
 * generic and reused across blocks. What genuinely drifts is slot *shape* —
 * camelCase (`__myTitle`), single underscores (`__title_text`), stray uppercase
 * (`__Title`), empty or malformed segments. Those a regex catches with zero
 * maintenance and no reconciliation debt.
 *
 * The grammar (ADR-008 §4). A canonical class is one of:
 *   bds-<block>
 *   bds-<block>--<modifier>
 *   bds-<block>__<slot>
 *   bds-<block>__<slot>--<modifier>
 * where <block>, <slot>, <modifier> are each kebab-case:
 *   [a-z][a-z0-9]*(-[a-z0-9]+)*   (block starts with a letter)
 *   [a-z0-9]+(-[a-z0-9]+)*        (slot / modifier)
 * No single underscores, no other separators, no double `__`/`--`, no layout
 * name baked into a slot (structural, not enforceable here — see §3 + the
 * separate lint-blueprint-naming.mjs banned-suffix list).
 *
 * What this does NOT do. It does not check membership against dist/styles.css
 * (that's canonical-class-check.mjs — parallel-taxonomy collisions in consumer
 * repos), and it does not enforce §3's appearance/theme-modifier ban (semantic;
 * lint-blueprint-naming.mjs owns the banned-suffix list). It skips `--bds-*` CSS
 * custom properties (Tier-4 token hooks — ADR-014's namespace, not BEM slots).
 * And it cannot see through interpolation or string concatenation: a modifier
 * built from a runtime value (`` `bds-x--${enumProp}` ``) is judged as valid
 * regardless of what the value resolves to — so a prop literal that is itself
 * off-pattern (a snake_case enum member) escapes this gate, the same blind spot
 * the enumerated allowlist had. This gate is purely the structural shape of the
 * static `bds-*` class *names* authored in BDS source.
 *
 * ── CLI ────────────────────────────────────────────────────────────────────
 *   slot-pattern-check <path...>         Scan paths for off-pattern bds- classes
 *   slot-pattern-check --files <a> <b>   Explicit file list (husky staged mode)
 *   slot-pattern-check --format md|json  Output format (default: md for TTY)
 *   slot-pattern-check --help            Show this message
 *
 * ── Exit codes ─────────────────────────────────────────────────────────────
 *   0  Clean — every bds-* class matches the grammar
 *   1  Off-pattern classes found
 *   2  Bad invocation
 */

import { readFileSync, statSync, readdirSync } from 'node:fs';
import { join, sep, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// ── Grammar ────────────────────────────────────────────────────────────────

const BLOCK = '[a-z][a-z0-9]*(?:-[a-z0-9]+)*';
const SEG = '[a-z0-9]+(?:-[a-z0-9]+)*';

/**
 * The full canonical grammar as a single anchored pattern.
 *   bds-<block>(__<slot>)?(--<modifier>)?
 */
export const CANONICAL_CLASS = new RegExp(
  `^bds-${BLOCK}(?:__${SEG})?(?:--${SEG})?$`,
);

export const DEFAULT_SCAN_EXTENSIONS = Object.freeze(['.tsx', '.jsx', '.css']);

export const DEFAULT_EXCLUDE_PATH_PATTERNS = Object.freeze([
  /(^|\/)__tests__(\/|$)/,
  /\.test\.(ts|tsx|mjs|js)$/,
  /(^|\/)node_modules(\/|$)/,
  /(^|\/)dist(\/|$)/,
  /(^|\/)\.git(\/|$)/,
  /(^|\/)storybook-static(\/|$)/,
]);

// ── Extraction ───────────────────────────────────────────────────────────────

/**
 * Pull every `bds-*` class token out of a body of source. Handles the shapes
 * BDS actually authors: string literals in `className=`, `bdsClass('bds-x')`,
 * and template literals (`` `bds-x__slot--${size}` ``).
 *
 * Template interpolation `${…}` is normalized to a single valid segment char
 * (`x`) before matching, so `bds-x__center--${size}` reads as
 * `bds-x__center--x` and passes — a dynamic modifier is not a shape violation.
 *
 * Honors `bds-lint-ignore` line comments (same convention as the sibling
 * canonical-class-check / lint-blueprint-naming scripts).
 */
export function extractBdsClasses(text) {
  const lines = text
    .split(/\r?\n/)
    .filter((line) => !line.includes('bds-lint-ignore'));
  // Normalize interpolation so a dynamic tail doesn't read as a malformed one.
  const normalized = lines.join('\n').replace(/\$\{[^}]*\}/g, 'x');
  // Permissive token capture: start at `bds-`, consume anything that could be
  // part of a (possibly-malformed) class name so we can then judge its shape.
  // Stops at a genuine class boundary (quote, backtick, whitespace, `{`, etc).
  const re = /bds-[A-Za-z0-9_-]+/g;
  const found = new Set();
  let m;
  while ((m = re.exec(normalized)) !== null) {
    // Skip `--bds-*` CSS custom properties. Those are Tier-4 component-token
    // hooks (ADR-014's `--bds-{component}-{property}` namespace), not BEM slot
    // classes — a different naming authority this gate must not police. Detect
    // by the two chars preceding the match being `--`.
    if (normalized[m.index - 1] === '-' && normalized[m.index - 2] === '-') continue;
    // A token ending in a separator is a dynamic prefix — `'bds-badge--' + tone`
    // (string concat, not template interpolation, which normalizes to a valid
    // segment above). The real slot/modifier is a runtime value we can't judge
    // statically, so skip it; the base block is still validated wherever it
    // appears whole. Tradeoff: a fully-static trailing-separator typo baked into
    // a string literal (`"bds-card__title-"`) is indistinguishable from a concat
    // prefix and is also skipped — erring toward a rare missed typo rather than
    // flooding on the common concat pattern.
    if (/[-_]$/.test(m[0])) continue;
    found.add(m[0]);
  }
  return found;
}

/**
 * Classify a single class token.
 *   { ok: true }                       — matches the grammar
 *   { ok: false, reason }              — off-pattern, with a human reason
 */
export function classifyClass(cls) {
  if (CANONICAL_CLASS.test(cls)) return { ok: true };
  let reason;
  if (/[A-Z]/.test(cls)) reason = 'uppercase (use kebab-case)';
  else if (/[^a-z0-9_-]/.test(cls)) reason = 'illegal character';
  else if (/(?<!_)_(?!_)/.test(cls)) reason = 'single underscore (use `__` for slots)';
  else if (/__.*__/.test(cls)) reason = 'multiple `__` separators';
  else if (/--.*--/.test(cls)) reason = 'multiple `--` separators';
  else if (/-{3,}/.test(cls)) reason = 'stray hyphens';
  else reason = 'off-pattern (expected bds-<block>__<slot>--<modifier>)';
  return { ok: false, reason };
}

// ── Path walking ─────────────────────────────────────────────────────────────

function isExcluded(path, patterns) {
  return patterns.some((p) => (typeof p === 'string' ? path.includes(p) : p.test(path)));
}

function walk(root, opts, acc = []) {
  const {
    extensions = DEFAULT_SCAN_EXTENSIONS,
    excludePathPatterns = DEFAULT_EXCLUDE_PATH_PATTERNS,
  } = opts;
  let stat;
  try {
    stat = statSync(root);
  } catch {
    return acc;
  }
  if (stat.isFile()) {
    if (isExcluded(root, excludePathPatterns)) return acc;
    if (extensions.some((e) => root.endsWith(e))) acc.push(root);
    return acc;
  }
  if (!stat.isDirectory()) return acc;
  for (const entry of readdirSync(root)) {
    const child = join(root, entry);
    if (isExcluded(child, excludePathPatterns)) continue;
    walk(child, opts, acc);
  }
  return acc;
}

// ── Public scan API ──────────────────────────────────────────────────────────

/**
 * Scan filesystem paths for off-pattern `bds-*` classes. Returns the violation
 * list, files scanned, and total distinct classes seen. Does NOT throw.
 */
export function slotPatternScan(opts) {
  const {
    paths,
    extensions = DEFAULT_SCAN_EXTENSIONS,
    excludePathPatterns = DEFAULT_EXCLUDE_PATH_PATTERNS,
  } = opts;

  const files = [];
  for (const p of paths) walk(p, { extensions, excludePathPatterns }, files);

  // Map<className, { reason, files: Set }>
  const violations = new Map();
  let distinct = 0;
  const seen = new Set();
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    for (const cls of extractBdsClasses(text)) {
      if (!seen.has(cls)) {
        seen.add(cls);
        distinct++;
      }
      const verdict = classifyClass(cls);
      if (verdict.ok) continue;
      const existing = violations.get(cls);
      if (existing) existing.files.add(file);
      else violations.set(cls, { class: cls, reason: verdict.reason, files: new Set([file]) });
    }
  }

  const list = [...violations.values()]
    .map((v) => ({ ...v, files: [...v.files].sort() }))
    .sort((a, b) => a.class.localeCompare(b.class));

  return { violations: list, scannedFiles: files.length, distinctClasses: distinct };
}

// ── Rendering ────────────────────────────────────────────────────────────────

function renderMarkdown(result) {
  if (result.violations.length === 0) {
    return `slot-pattern-check: clean — ${result.scannedFiles} files, ${result.distinctClasses} distinct bds-* classes, 0 off-pattern\n`;
  }
  const lines = [
    `slot-pattern-check: ${result.violations.length} off-pattern bds-* class name(s) — ADR-008 §4 grammar`,
    `  Grammar: bds-<block>__<slot>--<modifier>, each segment kebab-case`,
    '',
  ];
  for (const v of result.violations) {
    const where = v.files.slice(0, 3).map((f) => f.split(sep).slice(-3).join('/')).join(', ');
    const more = v.files.length > 3 ? `, +${v.files.length - 3} more` : '';
    lines.push(`  ${v.class}   (${v.reason})   [${where}${more}]`);
  }
  lines.push('');
  lines.push('  Fix the class name to match the grammar, or `// bds-lint-ignore` the line');
  lines.push('  with a justification. New vocabulary needs no allowlist edit — just valid shape.');
  return lines.join('\n') + '\n';
}

// ── CLI ──────────────────────────────────────────────────────────────────────

const USAGE = `slot-pattern-check — Structural BEM-slot enforcement for @brikdesigns/bds

Usage:
  slot-pattern-check <path...>         Scan paths for off-pattern bds- classes
  slot-pattern-check --files <a> <b>   Explicit file list (husky staged mode)
  slot-pattern-check --format md|json  Output format (default: md for TTY)
  slot-pattern-check --help            Show this message

Exit codes:
  0  Clean    1  Off-pattern classes found    2  Bad invocation

Grammar: bds-<block>__<slot>--<modifier> (ADR-008 §4). Governs by shape, not
by an enumerated allowlist (ADR-017 supersedes ADR-008 §2).
`;

function main() {
  const argv = process.argv.slice(2);
  const opts = { paths: [], format: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') {
      process.stdout.write(USAGE);
      process.exit(0);
    } else if (a === '--files') {
      // consume the rest as file paths
      while (i + 1 < argv.length && !argv[i + 1].startsWith('--')) opts.paths.push(argv[++i]);
    } else if (a === '--format') opts.format = argv[++i];
    else if (a.startsWith('--format=')) opts.format = a.slice('--format='.length);
    else if (a.startsWith('-')) {
      process.stderr.write(`slot-pattern-check: unknown flag ${a}\n`);
      process.exit(2);
    } else opts.paths.push(a);
  }
  if (opts.paths.length === 0) {
    process.stderr.write(USAGE);
    process.exit(2);
  }
  const format = opts.format ?? (process.stdout.isTTY ? 'md' : 'json');
  const result = slotPatternScan({ paths: opts.paths });
  process.stdout.write(
    format === 'json' ? JSON.stringify(result, null, 2) + '\n' : renderMarkdown(result),
  );
  process.exit(result.violations.length > 0 ? 1 : 0);
}

const isCliEntry = (() => {
  try {
    return resolve(fileURLToPath(import.meta.url)) === resolve(process.argv[1] ?? '');
  } catch (err) {
    process.stderr.write(`slot-pattern-check: could not determine CLI entry — ${err.message}\n`);
    return false;
  }
})();

if (isCliEntry) main();
