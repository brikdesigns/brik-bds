#!/usr/bin/env node
/**
 * canonical-check — Canonical token-name enforcement for the Brik Design System.
 *
 * Validates that `--text-*`, `--surface-*`, `--background-*`, semantic
 * `--border-*`, and `--color-*` token names referenced in source code (or
 * emitted at runtime by a generator) exist in the canonical BDS allowlist
 * parsed from `dist/tokens.css`.
 *
 * Source of truth: https://design.brikdesigns.com/docs/primitives/color
 *
 * Why this lives in @brikdesigns/bds (not a separate package): the validator's
 * sole job is reading BDS's own `dist/tokens.css`. Coupling at the package
 * level means version skew is impossible — `bds@x.y` ships with the
 * canonical-check that matches `bds@x.y`'s registry.
 *
 * ── CLI ────────────────────────────────────────────────────────────────────
 *   canonical-check <path...>           Scan paths for non-canonical names
 *   canonical-check --css <file>        Scan a CSS file for non-canonical
 *                                       definitions (runtime mode — strict)
 *   canonical-check --allowlist <file>  Override allowlist source
 *                                       (default: dist/tokens.css)
 *   canonical-check --prefixes <list>   Comma-separated prefixes to scan
 *                                       (default: text,surface,background,border,color)
 *   canonical-check --exempt <patterns> Comma-separated regex of tokens to
 *                                       skip (e.g. '^--border-(radius|width)')
 *   canonical-check --format md|json    Output format (default: md for TTY,
 *                                       json otherwise)
 *   canonical-check --help              Show this message
 *
 * ── Library ────────────────────────────────────────────────────────────────
 *   import {
 *     parseAllowlist,
 *     parseAllowlistFromFile,
 *     sourceScan,
 *     runtimeScan,
 *     assertCanonicalCss,
 *   } from '@brikdesigns/bds/canonical-check';
 *
 * ── Exit codes ─────────────────────────────────────────────────────────────
 *   0  Clean — no non-canonical names detected
 *   1  Violations found
 *   2  Bad invocation (missing args, unreadable allowlist, etc.)
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { resolve, join, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

// ── Defaults ─────────────────────────────────────────────────────────────

export const DEFAULT_PREFIXES = ['text', 'surface', 'background', 'border', 'color'];

export const DEFAULT_EXEMPT_PATTERNS = [
  // Sizing-tier border tokens — spacing primitives, not surface borders.
  // Defined under their own canonical entries (--border-radius-*, --border-width-*).
  /^--border-(radius|width)(-|$)/,
  // fumadocs vendor prefix — design-token namespace consumed by docs sites
  // that override fumadocs internals. Not BDS-canonical by design.
  /^--color-fd-/,
];

export const DEFAULT_SCAN_EXTENSIONS = ['.css', '.ts', '.tsx', '.astro', '.mjs', '.js'];

export const DEFAULT_EXCLUDE_PATH_PATTERNS = [
  /(^|\/)__tests__(\/|$)/,
  /\.test\.(ts|tsx|mjs|js)$/,
  /(^|\/)node_modules(\/|$)/,
  /(^|\/)dist(\/|$)/,
  /(^|\/)\.git(\/|$)/,
];

// ── Allowlist ────────────────────────────────────────────────────────────

/**
 * Parse a tokens.css string into the canonical Set of `--token-name`s.
 * Captures every CSS custom property *declaration* — handles both expanded
 * (one decl per line) and compact (`.foo { --x: y; --z: w }`) forms by
 * anchoring on line-start, `{`, or `;` boundaries. Skips declarations that
 * are merely `var(--name)` references — `(` is not a declaration boundary.
 */
export function parseAllowlist(cssText) {
  const allowlist = new Set();
  const re = /(?:^|[{;])\s*(--[a-z][a-z0-9-]*)\s*:/gm;
  let match;
  while ((match = re.exec(cssText)) !== null) {
    allowlist.add(match[1]);
  }
  return allowlist;
}

/** Read a file and parse its allowlist. Throws with a useful message if missing. */
export function parseAllowlistFromFile(path) {
  if (!existsSync(path)) {
    throw new Error(
      `canonical-check: allowlist source not found at ${path}\n` +
      `  Expected BDS tokens.css. Run \`npm install\` (consumers) or ` +
      `\`npm run build:lib\` (BDS itself) to populate.`,
    );
  }
  return parseAllowlist(readFileSync(path, 'utf8'));
}

/**
 * Locate the canonical tokens.css. Resolution order:
 *   1. Explicit CLI / opts argument
 *   2. node_modules/@brikdesigns/bds/dist/tokens.css (consumers)
 *   3. dist/tokens.css next to this script (BDS itself)
 */
export function resolveDefaultAllowlistPath(cwd = process.cwd()) {
  const consumerPath = resolve(cwd, 'node_modules/@brikdesigns/bds/dist/tokens.css');
  if (existsSync(consumerPath)) return consumerPath;
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const selfPath = resolve(__dirname, '..', 'dist', 'tokens.css');
  if (existsSync(selfPath)) return selfPath;
  return consumerPath; // return canonical-shaped path even if missing — error message is clearer
}

// ── CSS comment stripping ────────────────────────────────────────────────

/**
 * Strip `/* … *​/` block comments and `// …` line comments from CSS / JS / TS
 * content. Block-comment support handles continuation lines that don't start
 * with `*` (e.g. an inline reference to `--color-grayscale-*` inside a
 * /​*  *​/ block was producing a false positive `--color-grayscale` because
 * the regex grabbed the prefix up to the last alphanumeric).
 *
 * Line-comment stripping is content-aware: the `//` must not be preceded by
 * `:` (URL prefix) or be inside a string. We approximate by only stripping
 * `//` when it appears at the start of a trimmed line — which is the common
 * "//-prefixed annotation" case that motivated the original token-audit
 * exemption.
 */
export function stripCssComments(input) {
  const lines = input.split(/\r?\n/);
  const out = [];
  let inBlock = false;

  for (let raw of lines) {
    let line = raw;
    while (line.length > 0) {
      if (inBlock) {
        const e = line.indexOf('*/');
        if (e === -1) { line = ''; break; }
        line = line.slice(e + 2);
        inBlock = false;
      }
      const s = line.indexOf('/*');
      if (s === -1) break;
      const rest = line.slice(s + 2);
      const e = rest.indexOf('*/');
      if (e === -1) {
        line = line.slice(0, s);
        inBlock = true;
        break;
      }
      line = line.slice(0, s) + ' ' + rest.slice(e + 2);
    }
    if (/^[ \t]*\/\//.test(line)) continue;
    if (line !== '') out.push(line);
  }
  return out.join('\n');
}

// ── Token extraction ─────────────────────────────────────────────────────

/**
 * Extract every token name in the allowed prefixes from a body of text.
 * Returns a Set for stable diff semantics.
 *
 * Honors the `bds-lint-ignore` comment directive used elsewhere in BDS
 * (see scripts/lint-tokens.js, scripts/token-coverage.js): any line
 * containing the literal `bds-lint-ignore` is skipped before extraction,
 * matching the rest of the BDS lint toolchain. The TextInput component-
 * scoped `--text-input-focus-ring-width` CSS variable is the canonical
 * example of an intentionally non-canonical name annotated this way.
 */
export function extractTokenReferences(text, prefixes = DEFAULT_PREFIXES) {
  const filtered = text
    .split(/\r?\n/)
    .filter((line) => !line.includes('bds-lint-ignore'))
    .join('\n');
  const stripped = stripCssComments(filtered);
  const prefixGroup = prefixes.join('|');
  const re = new RegExp(`--(?:${prefixGroup})-[a-z0-9-]*[a-z0-9]`, 'g');
  const found = new Set();
  let match;
  while ((match = re.exec(stripped)) !== null) {
    found.add(match[0]);
  }
  return found;
}

/**
 * Extract every CSS custom property *declaration* (LHS of `--name:`) from a
 * CSS string, restricted to the configured prefixes. Used by `runtimeScan`
 * to validate generator output where every emitted definition must be
 * canonical.
 */
export function extractTokenDefinitions(css, prefixes = DEFAULT_PREFIXES) {
  const stripped = stripCssComments(css);
  const prefixGroup = prefixes.join('|');
  // Match on line-start, `{`, or `;` boundaries — handles both expanded
  // (one decl per line) and compact (`.foo { --x: y; }`) forms. Skips
  // `var(--x)` uses since `(` is not a declaration boundary.
  const re = new RegExp(`(?:^|[{;])\\s*(--(?:${prefixGroup})-[a-z0-9-]*[a-z0-9])\\s*:`, 'gm');
  const found = new Set();
  let match;
  while ((match = re.exec(stripped)) !== null) {
    found.add(match[1]);
  }
  return found;
}

// ── Path walking ─────────────────────────────────────────────────────────

function isExempted(path, excludePathPatterns) {
  for (const pat of excludePathPatterns) {
    if (typeof pat === 'string' && path.includes(pat)) return true;
    if (pat instanceof RegExp && pat.test(path)) return true;
  }
  return false;
}

function walkPath(root, opts, acc = []) {
  const {
    extensions = DEFAULT_SCAN_EXTENSIONS,
    excludePathPatterns = DEFAULT_EXCLUDE_PATH_PATTERNS,
  } = opts;

  let stat;
  try {
    stat = statSync(root);
  } catch {
    return acc; // path doesn't exist — caller is responsible for surfacing
  }

  if (stat.isFile()) {
    if (isExempted(root, excludePathPatterns)) return acc;
    if (extensions.some((e) => root.endsWith(e))) acc.push(root);
    return acc;
  }
  if (!stat.isDirectory()) return acc;

  for (const entry of readdirSync(root)) {
    const child = join(root, entry);
    if (isExempted(child, excludePathPatterns)) continue;
    walkPath(child, opts, acc);
  }
  return acc;
}

function isTokenExempt(token, exemptPatterns) {
  for (const pat of exemptPatterns) {
    if (typeof pat === 'string' && token === pat) return true;
    if (pat instanceof RegExp && pat.test(token)) return true;
  }
  return false;
}

// ── Public scan APIs ─────────────────────────────────────────────────────

/**
 * Scan filesystem paths for non-canonical token references.
 *
 * Returns a result object with the violation list, the source files each
 * violation appeared in, and counts. Does NOT throw — call sites decide how
 * to surface (CLI exits non-zero, vitest can use `assertCanonicalCss`).
 */
export function sourceScan(opts) {
  const {
    paths,
    allowlist,
    prefixes = DEFAULT_PREFIXES,
    extensions = DEFAULT_SCAN_EXTENSIONS,
    excludePathPatterns = DEFAULT_EXCLUDE_PATH_PATTERNS,
    exemptTokens = DEFAULT_EXEMPT_PATTERNS,
  } = opts;

  if (!allowlist || allowlist.size === 0) {
    throw new Error('canonical-check.sourceScan: allowlist is empty');
  }

  const files = [];
  for (const p of paths) {
    walkPath(p, { extensions, excludePathPatterns }, files);
  }

  const tokenToFiles = new Map();
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    const refs = extractTokenReferences(text, prefixes);
    for (const token of refs) {
      if (isTokenExempt(token, exemptTokens)) continue;
      if (allowlist.has(token)) continue;
      if (!tokenToFiles.has(token)) tokenToFiles.set(token, []);
      tokenToFiles.get(token).push(file);
    }
  }

  const violations = [...tokenToFiles.entries()]
    .map(([token, files]) => ({ token, files: [...new Set(files)].sort() }))
    .sort((a, b) => a.token.localeCompare(b.token));

  return {
    violations,
    scannedFiles: files.length,
    canonicalCount: allowlist.size,
  };
}

/**
 * Scan a CSS string (typically generator output) for non-canonical token
 * *definitions*. Stricter than `sourceScan` — every emitted `--name:` must
 * be in the allowlist (or exempt), regardless of whether the same name is
 * also defined in the allowlist source. This is the runtime gate for
 * theme-CSS generators.
 */
export function runtimeScan(opts) {
  const {
    css,
    allowlist,
    prefixes = ['text', 'surface', 'background', 'border'],
    exemptTokens = DEFAULT_EXEMPT_PATTERNS,
  } = opts;

  if (!allowlist || allowlist.size === 0) {
    throw new Error('canonical-check.runtimeScan: allowlist is empty');
  }

  const defs = extractTokenDefinitions(css, prefixes);
  const violations = [];
  for (const token of defs) {
    if (isTokenExempt(token, exemptTokens)) continue;
    if (!allowlist.has(token)) violations.push(token);
  }
  violations.sort();

  return { violations, emittedCount: defs.size };
}

/**
 * Vitest-friendly assertion. Throws on the first violation with a message
 * naming the offending tokens. Convenience wrapper around `runtimeScan` for
 * generator-output tests.
 */
export function assertCanonicalCss(css, opts = {}) {
  const allowlist = opts.allowlist
    ?? parseAllowlistFromFile(opts.allowlistPath ?? resolveDefaultAllowlistPath());
  const result = runtimeScan({ ...opts, css, allowlist });
  if (result.violations.length > 0) {
    throw new Error(
      `canonical-check: emitted CSS contains ${result.violations.length} non-canonical token name(s):\n  ` +
      result.violations.join('\n  ') +
      `\n\nSource of truth: https://design.brikdesigns.com/docs/primitives/color`,
    );
  }
}

// ── CLI ──────────────────────────────────────────────────────────────────

const USAGE = `canonical-check — Canonical token-name enforcement for @brikdesigns/bds

Usage:
  canonical-check <path...>           Scan paths for non-canonical names
  canonical-check --css <file>        Scan a CSS file for non-canonical
                                      definitions (runtime mode — strict)
  canonical-check --allowlist <file>  Override allowlist source
                                      (default: node_modules/@brikdesigns/bds/dist/tokens.css)
  canonical-check --prefixes <list>   Comma-separated prefixes to scan
                                      (default: text,surface,background,border,color)
  canonical-check --exempt <patterns> Comma-separated regex of tokens to skip
  canonical-check --format md|json    Output format (default: md for TTY, json otherwise)
  canonical-check --help              Show this message

Exit codes:
  0  Clean — no non-canonical names detected
  1  Violations found
  2  Bad invocation (missing args, unreadable allowlist)

Source of truth: https://design.brikdesigns.com/docs/primitives/color
`;

function parseCliArgs(argv) {
  const opts = {
    paths: [],
    cssFile: null,
    allowlistPath: null,
    prefixes: null,
    exemptPatterns: null,
    format: null,
    help: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') opts.help = true;
    else if (a === '--css') opts.cssFile = argv[++i];
    else if (a === '--allowlist') opts.allowlistPath = argv[++i];
    else if (a === '--prefixes') opts.prefixes = argv[++i].split(',').map((s) => s.trim()).filter(Boolean);
    else if (a === '--exempt') opts.exemptPatterns = argv[++i].split(',').map((s) => new RegExp(s));
    else if (a.startsWith('--format=')) opts.format = a.slice('--format='.length);
    else if (a === '--format') opts.format = argv[++i];
    else if (a.startsWith('-')) {
      process.stderr.write(`canonical-check: unknown flag ${a}\n`);
      process.exit(2);
    }
    else opts.paths.push(a);
  }
  if (!opts.format) opts.format = process.stdout.isTTY ? 'md' : 'json';
  return opts;
}

function renderMarkdown(result, mode) {
  if (result.violations.length === 0) {
    return `canonical-check: clean — ${mode === 'runtime' ? result.emittedCount + ' definitions' : result.scannedFiles + ' files'} scanned, 0 non-canonical names\n`;
  }
  const lines = [];
  lines.push(`canonical-check: ${result.violations.length} non-canonical token name(s) — parallel taxonomy drift`);
  lines.push(`  Source of truth: https://design.brikdesigns.com/docs/primitives/color`);
  if (mode === 'source') {
    lines.push(`  Scanned ${result.scannedFiles} files against ${result.canonicalCount} canonical tokens`);
    lines.push('');
    for (const { token, files } of result.violations) {
      const where = files.slice(0, 3).map((f) => f.split(sep).slice(-3).join('/')).join(', ');
      lines.push(`  ${token}   (${where}${files.length > 3 ? `, +${files.length - 3} more` : ''})`);
    }
  } else {
    lines.push(`  Inspected ${result.emittedCount} emitted definitions`);
    lines.push('');
    for (const token of result.violations) lines.push(`  ${token}`);
  }
  lines.push('');
  lines.push('  If a name is canonical, add it to BDS dist/tokens.css first.');
  lines.push('  Inline aliases for non-canonical names are not accepted.');
  return lines.join('\n') + '\n';
}

function renderJson(result, mode) {
  return JSON.stringify({ mode, ...result }, null, 2) + '\n';
}

function main() {
  const opts = parseCliArgs(process.argv.slice(2));

  if (opts.help) {
    process.stdout.write(USAGE);
    process.exit(0);
  }

  const allowlistPath = opts.allowlistPath ?? resolveDefaultAllowlistPath();
  let allowlist;
  try {
    allowlist = parseAllowlistFromFile(allowlistPath);
  } catch (err) {
    process.stderr.write(`${err.message}\n`);
    process.exit(2);
  }

  if (allowlist.size < 20) {
    process.stderr.write(
      `canonical-check: allowlist parse returned only ${allowlist.size} names from ${allowlistPath}\n` +
      `  Expected 50+ canonical entries. Verify the file format.\n`,
    );
    process.exit(2);
  }

  const exemptTokens = opts.exemptPatterns ?? DEFAULT_EXEMPT_PATTERNS;
  const prefixes = opts.prefixes ?? DEFAULT_PREFIXES;

  if (opts.cssFile) {
    if (!existsSync(opts.cssFile)) {
      process.stderr.write(`canonical-check: --css file not found: ${opts.cssFile}\n`);
      process.exit(2);
    }
    const css = readFileSync(opts.cssFile, 'utf8');
    const result = runtimeScan({ css, allowlist, prefixes, exemptTokens });
    process.stdout.write(opts.format === 'json' ? renderJson(result, 'runtime') : renderMarkdown(result, 'runtime'));
    process.exit(result.violations.length > 0 ? 1 : 0);
  }

  if (opts.paths.length === 0) {
    process.stderr.write(USAGE);
    process.exit(2);
  }

  const result = sourceScan({ paths: opts.paths, allowlist, prefixes, exemptTokens });
  process.stdout.write(opts.format === 'json' ? renderJson(result, 'source') : renderMarkdown(result, 'source'));
  process.exit(result.violations.length > 0 ? 1 : 0);
}

// Entry-point detection — ESM doesn't have `require.main === module`. Compare
// the resolved file path of this module against argv[1]. Wrapped because exotic
// loaders (http imports, REPL) can make `fileURLToPath` throw on a non-file
// URL; if that happens, surface it on stderr rather than swallowing — silent
// "failed to detect entry" would mean main() never runs and the CLI looks dead.
const isCliEntry = (() => {
  try {
    return resolve(fileURLToPath(import.meta.url)) === resolve(process.argv[1] ?? '');
  } catch (err) {
    process.stderr.write(`canonical-check: could not determine CLI entry — ${err.message}\n`);
    return false;
  }
})();

if (isCliEntry) main();
