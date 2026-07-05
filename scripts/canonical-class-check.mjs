#!/usr/bin/env node
/**
 * canonical-class-check — Canonical CSS-class enforcement for the Brik
 * Design System.
 *
 * Validates that component-tier class names referenced in source code (or
 * defined in consumer CSS) either consume the canonical `bds-*` allowlist
 * parsed from `dist/styles.css`, or do not collide with a canonical
 * primitive vocabulary.
 *
 * Why this exists. The canonical token registry has a sibling problem at
 * the component-class layer: client repos invent parallel taxonomies
 * (`.btn--primary`, `.card`, `.tp-card__bio-btn`) that re-implement
 * primitives BDS already publishes (`bds-button`, `bds-card`). This is the
 * same drift mode that produced portal #512/#553 at the token layer.
 *
 * What gets flagged.
 *   1. Class definitions in CSS / scoped Astro <style> that match a known
 *      canonical root with the `bds-` prefix stripped — e.g. `.button` or
 *      `.button--primary` while BDS publishes `bds-button`.
 *   2. Class definitions matching a known shorthand alias (`btn` → `button`).
 *   3. Class references in `class="..."` / `className="..."` markup that
 *      contain those same forbidden roots.
 *   4. Invented `bds-*` names not in the allowlist (e.g. `.bds-button-cta`
 *      where the canonical scale is only `--tiny|sm|md|lg|xl`).
 *
 * What is intentionally NOT flagged.
 *   - Project-namespaced BEM blocks like `.tp-card__portrait` — `tp-card`
 *     is a project-local block name, not a primitive collision. Layout CSS
 *     stays project-local.
 *   - Utility classes (`.flex`, `.grid`, `.container`) that don't collide
 *     with BDS primitive vocabulary.
 *
 * ── CLI ────────────────────────────────────────────────────────────────────
 *   canonical-class-check <path...>           Scan paths for class violations
 *   canonical-class-check --css <file>        Scan a CSS file for violating
 *                                             definitions (runtime mode — strict)
 *   canonical-class-check --allowlist <file>  Override allowlist source
 *                                             (default: dist/styles.css)
 *   canonical-class-check --aliases <list>    Comma-separated alias=canonical
 *                                             pairs (e.g. 'btn=button')
 *   canonical-class-check --exempt <patterns> Comma-separated regex of class
 *                                             roots to skip
 *   canonical-class-check --format md|json    Output format (default: md for
 *                                             TTY, json otherwise)
 *   canonical-class-check --help              Show this message
 *
 * ── Library ────────────────────────────────────────────────────────────────
 *   import {
 *     parseClassAllowlist,
 *     parseClassAllowlistFromFile,
 *     classSourceScan,
 *     classRuntimeScan,
 *     assertCanonicalClasses,
 *   } from '@brikdesigns/bds/canonical-class-check';
 *
 * ── Exit codes ─────────────────────────────────────────────────────────────
 *   0  Clean — no parallel-taxonomy class names detected
 *   1  Violations found
 *   2  Bad invocation (missing args, unreadable allowlist, etc.)
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { resolve, join, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { stripCssComments } from './canonical-check.mjs';

// ── Defaults ─────────────────────────────────────────────────────────────

/**
 * Shorthand → canonical aliases. Keys are class-root names that are
 * unambiguously shorthand for a BDS canonical root. The check treats them
 * as forbidden whenever the corresponding `bds-<value>` exists in the
 * allowlist. Extend cautiously — every entry forbids real client code.
 */
export const DEFAULT_CLASS_ALIASES = Object.freeze({
  btn: 'button',
});

/**
 * Class roots that are exempt from the "matches a canonical root" rule.
 * Use sparingly — every entry is a primitive that BDS would otherwise own.
 *
 * `card` is exempted because it's a generic noun that frequently appears in
 * project-local section blocks (e.g. `.team-card__name` vs `bds-card`).
 * Distinguishing requires more context than a regex can provide; we rely
 * on review for `card` and only enforce the pure-`btn`/`button` collision
 * + invented `bds-*` cases by default. Consumers can drop the exemption.
 *
 * `cta` is exempted for the same reason once the `bds-cta` block exists
 * (brik-bds#582): the source scanner's `.<name>` class regex also matches
 * property access, and `section.cta` is a load-bearing field of the
 * `BlueprintProps` data contract used across every blueprint renderer
 * (`const cta = section.cta`, `priceCard.cta.url`, …). Those are data reads,
 * not `.cta` class selectors, so the collision with the new `bds-cta`
 * canonical root is a false positive a regex can't tell apart.
 */
export const DEFAULT_CLASS_EXEMPT_PATTERNS = Object.freeze([
  /^card$/,
  /^cta$/,
]);

export const DEFAULT_SCAN_EXTENSIONS = Object.freeze([
  '.css',
  '.astro',
  '.tsx',
  '.jsx',
  '.html',
]);

export const DEFAULT_EXCLUDE_PATH_PATTERNS = Object.freeze([
  /(^|\/)__tests__(\/|$)/,
  /\.test\.(ts|tsx|mjs|js)$/,
  /(^|\/)node_modules(\/|$)/,
  /(^|\/)dist(\/|$)/,
  /(^|\/)\.git(\/|$)/,
  /(^|\/)storybook-static(\/|$)/,
]);

// ── Allowlist parsing ────────────────────────────────────────────────────

/**
 * Parse a styles.css string into a Set of canonical `bds-*` class names.
 * Captures every class selector — handles compound selectors, pseudo-class
 * suffixes, attribute selectors, and BEM modifiers.
 *
 * The parser is intentionally permissive: it captures `.bds-foo`,
 * `.bds-foo--bar`, `.bds-foo__bar`. It strips a trailing colon (pseudo)
 * or `[` (attribute) or whitespace boundary.
 */
export function parseClassAllowlist(cssText) {
  const allowlist = new Set();
  const stripped = stripCssComments(cssText);
  // Match `.bds-<name>` where <name> is BEM-conformant: lowercase letters,
  // digits, hyphens, double-hyphen modifiers, double-underscore elements.
  // Anchor on a non-class character (start, whitespace, or selector
  // combinator) so we don't accept `.foo.bds-fake` as a separate token —
  // wait, we DO want that, because `.foo.bds-fake` is two classes joined.
  // The boundary is `.` — every class starts with one.
  const re = /\.(bds-[a-z][a-z0-9_-]*)/g;
  let match;
  while ((match = re.exec(stripped)) !== null) {
    allowlist.add(match[1]);
  }
  return allowlist;
}

export function parseClassAllowlistFromFile(path) {
  if (!existsSync(path)) {
    throw new Error(
      `canonical-class-check: allowlist source not found at ${path}\n` +
      `  Expected BDS dist/styles.css. Run \`npm install\` (consumers) or ` +
      `\`npm run build:lib\` (BDS itself) to populate.`,
    );
  }
  return parseClassAllowlist(readFileSync(path, 'utf8'));
}

/**
 * Locate the canonical dist/styles.css. Resolution order mirrors
 * canonical-check.mjs:
 *   1. Explicit CLI / opts argument
 *   2. node_modules/@brikdesigns/bds/dist/styles.css (consumers)
 *   3. dist/styles.css next to this script (BDS itself)
 */
export function resolveDefaultClassAllowlistPath(cwd = process.cwd()) {
  const consumerPath = resolve(cwd, 'node_modules/@brikdesigns/bds/dist/styles.css');
  if (existsSync(consumerPath)) return consumerPath;
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const selfPath = resolve(__dirname, '..', 'dist', 'styles.css');
  if (existsSync(selfPath)) return selfPath;
  return consumerPath;
}

// ── Root extraction ──────────────────────────────────────────────────────

/**
 * Split a BEM-conformant class name into its block root.
 * `bds-avatar`            → `bds-avatar`
 * `bds-avatar--lg`        → `bds-avatar`
 * `bds-avatar__image`     → `bds-avatar`
 * `bds-accordion-item`    → `bds-accordion-item`     (no separator)
 * `bds-accordion-item__icon` → `bds-accordion-item`
 * `tp-card__bio-btn`      → `tp-card`
 * `btn--primary`          → `btn`
 */
export function classRoot(className) {
  const dunder = className.indexOf('__');
  const ddash = className.indexOf('--');
  let cut = className.length;
  if (dunder !== -1 && dunder < cut) cut = dunder;
  if (ddash !== -1 && ddash < cut) cut = ddash;
  return className.slice(0, cut);
}

/**
 * Reduce a full class allowlist to its set of distinct block roots.
 * `Set('bds-button', 'bds-button--primary', 'bds-button__content')`
 *   → `Set('bds-button')`
 */
export function canonicalRoots(allowlist) {
  const roots = new Set();
  for (const cls of allowlist) {
    if (!cls.startsWith('bds-')) continue;
    roots.add(classRoot(cls));
  }
  return roots;
}

// ── Class extraction from source ─────────────────────────────────────────

/**
 * Extract every class token referenced in markup attributes
 * (`class="..."`, `className="..."`) and CSS class selectors (`.foo`,
 * `.foo--bar { … }`) within a body of text. Returns a Set of distinct
 * class names.
 *
 * Honors `bds-lint-ignore` line comments — same convention as the rest of
 * BDS lint scripts. A line containing the literal string is skipped.
 *
 * Only top-level class definitions and markup attributes are captured.
 * Embedded class fragments inside JS template literals are not parsed
 * (they appear in `className={\`...\`}` use cases, but flat-string capture
 * via the `class=` regex covers the common shape).
 */
export function extractClassReferences(text) {
  const filtered = text
    .split(/\r?\n/)
    .filter((line) => !line.includes('bds-lint-ignore'))
    .join('\n');
  const stripped = stripCssComments(filtered);

  const classes = new Set();

  // 1. CSS class selectors: `.<name>` followed by a selector boundary
  //    (`{`, `,`, ` `, `:`, `[`, `.`, `>`, `+`, `~`, end-of-line).
  const cssRe = /\.([a-z][a-z0-9_-]*)(?=[\s{,.:[>+~]|$)/gm;
  let m;
  while ((m = cssRe.exec(stripped)) !== null) {
    classes.add(m[1]);
  }

  // 2. Markup attributes: `class="..."`, `className="..."` (and
  //    `:class="..."`, `class:list={...}` for Vue/Astro). Capture the
  //    quoted value, then split on whitespace.
  const attrRe = /\b(?:class|className)\s*=\s*["']([^"']+)["']/g;
  while ((m = attrRe.exec(stripped)) !== null) {
    for (const piece of m[1].split(/\s+/)) {
      if (piece) classes.add(piece);
    }
  }

  return classes;
}

/**
 * Extract every class *definition* (a CSS rule selector) from a CSS
 * string. Used by `classRuntimeScan` to enforce that emitted CSS does
 * not redefine canonical primitives under non-canonical names.
 */
export function extractClassDefinitions(css) {
  const stripped = stripCssComments(css);
  const re = /\.([a-z][a-z0-9_-]*)(?=[\s{,.:[>+~]|$)/gm;
  const found = new Set();
  let match;
  while ((match = re.exec(stripped)) !== null) {
    found.add(match[1]);
  }
  return found;
}

// ── Violation classification ─────────────────────────────────────────────

function isExemptRoot(root, exemptPatterns) {
  for (const pat of exemptPatterns) {
    if (typeof pat === 'string' && root === pat) return true;
    if (pat instanceof RegExp && pat.test(root)) return true;
  }
  return false;
}

/**
 * Decide whether a single class name is a violation.
 *
 * Returns one of:
 *   { kind: 'ok' }                    — class is canonical or project-local
 *   { kind: 'invented-bds', class }   — `bds-*` name not in allowlist
 *   { kind: 'shadow-root', class, canonical } — non-prefixed root collides
 *                                       with `bds-<root>` canon
 *   { kind: 'shadow-alias', class, alias, canonical } — shorthand alias
 *                                       (e.g. `btn` → `button`) collides
 */
export function classifyClass(className, opts) {
  const { allowlist, roots, aliases, exemptPatterns } = opts;
  const root = classRoot(className);

  if (root.startsWith('bds-')) {
    // Canonical-shaped. Must appear verbatim in the allowlist (any of:
    // root, root--*, root__*).
    if (allowlist.has(className)) return { kind: 'ok' };
    if (roots.has(root)) {
      // Root is canonical, but this BEM modifier/element isn't published.
      // That's an invented variant — flag it.
      return { kind: 'invented-bds', class: className };
    }
    return { kind: 'invented-bds', class: className };
  }

  if (isExemptRoot(root, exemptPatterns)) return { kind: 'ok' };

  // Direct shadow: project class root matches a canonical root with the
  // `bds-` prefix stripped (`button` shadows `bds-button`).
  if (roots.has(`bds-${root}`)) {
    return { kind: 'shadow-root', class: className, canonical: `bds-${root}` };
  }

  // Alias shadow: project class root is a shorthand for a canonical root
  // (`btn` shadows `bds-button` via aliases.btn = 'button').
  const aliasTarget = aliases[root];
  if (aliasTarget && roots.has(`bds-${aliasTarget}`)) {
    return {
      kind: 'shadow-alias',
      class: className,
      alias: root,
      canonical: `bds-${aliasTarget}`,
    };
  }

  return { kind: 'ok' };
}

// ── Path walking (mirror of canonical-check) ─────────────────────────────

function isPathExempted(path, excludePathPatterns) {
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
    return acc;
  }

  if (stat.isFile()) {
    if (isPathExempted(root, excludePathPatterns)) return acc;
    if (extensions.some((e) => root.endsWith(e))) acc.push(root);
    return acc;
  }
  if (!stat.isDirectory()) return acc;

  for (const entry of readdirSync(root)) {
    const child = join(root, entry);
    if (isPathExempted(child, excludePathPatterns)) continue;
    walkPath(child, opts, acc);
  }
  return acc;
}

// ── Public scan APIs ─────────────────────────────────────────────────────

/**
 * Scan filesystem paths for class-name violations. Mirrors
 * canonical-check.sourceScan in shape: returns the violation list, the
 * source files each violation appeared in, and counts. Does NOT throw.
 */
export function classSourceScan(opts) {
  const {
    paths,
    allowlist,
    aliases = DEFAULT_CLASS_ALIASES,
    exemptPatterns = DEFAULT_CLASS_EXEMPT_PATTERNS,
    extensions = DEFAULT_SCAN_EXTENSIONS,
    excludePathPatterns = DEFAULT_EXCLUDE_PATH_PATTERNS,
  } = opts;

  if (!allowlist || allowlist.size === 0) {
    throw new Error('canonical-class-check.classSourceScan: allowlist is empty');
  }

  const roots = canonicalRoots(allowlist);
  const files = [];
  for (const p of paths) walkPath(p, { extensions, excludePathPatterns }, files);

  // Map<className, { kind, files, canonical?, alias? }>
  const violations = new Map();
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    const refs = extractClassReferences(text);
    for (const cls of refs) {
      const verdict = classifyClass(cls, { allowlist, roots, aliases, exemptPatterns });
      if (verdict.kind === 'ok') continue;
      const existing = violations.get(cls);
      if (existing) {
        existing.files.push(file);
      } else {
        violations.set(cls, { ...verdict, files: [file] });
      }
    }
  }

  const list = [...violations.values()]
    .map((v) => ({ ...v, files: [...new Set(v.files)].sort() }))
    .sort((a, b) => a.class.localeCompare(b.class));

  return {
    violations: list,
    scannedFiles: files.length,
    canonicalCount: allowlist.size,
    canonicalRootCount: roots.size,
  };
}

/**
 * Scan a CSS string for class *definitions* that violate canon.
 * Stricter than classSourceScan — only inspects `.foo { … }` selector
 * starts, not class-attribute references. The parallel of runtimeScan.
 */
export function classRuntimeScan(opts) {
  const {
    css,
    allowlist,
    aliases = DEFAULT_CLASS_ALIASES,
    exemptPatterns = DEFAULT_CLASS_EXEMPT_PATTERNS,
  } = opts;

  if (!allowlist || allowlist.size === 0) {
    throw new Error('canonical-class-check.classRuntimeScan: allowlist is empty');
  }

  const roots = canonicalRoots(allowlist);
  const defs = extractClassDefinitions(css);
  const violations = [];
  for (const cls of defs) {
    const verdict = classifyClass(cls, { allowlist, roots, aliases, exemptPatterns });
    if (verdict.kind === 'ok') continue;
    violations.push(verdict);
  }
  violations.sort((a, b) => a.class.localeCompare(b.class));
  return {
    violations,
    emittedCount: defs.size,
    canonicalRootCount: roots.size,
  };
}

/**
 * Vitest-friendly assertion. Throws on the first violation with a message
 * naming the offending classes. Convenience wrapper around classRuntimeScan
 * for emitted-CSS tests.
 */
export function assertCanonicalClasses(css, opts = {}) {
  const allowlist = opts.allowlist
    ?? parseClassAllowlistFromFile(opts.allowlistPath ?? resolveDefaultClassAllowlistPath());
  const result = classRuntimeScan({ ...opts, css, allowlist });
  if (result.violations.length > 0) {
    const summary = result.violations
      .map((v) => {
        if (v.kind === 'shadow-root') return `${v.class}  (shadows ${v.canonical})`;
        if (v.kind === 'shadow-alias') return `${v.class}  (alias '${v.alias}' shadows ${v.canonical})`;
        return `${v.class}  (invented bds-* — not in allowlist)`;
      })
      .join('\n  ');
    throw new Error(
      `canonical-class-check: emitted CSS contains ${result.violations.length} class violation(s):\n  ` +
      summary +
      `\n\nSource of truth: BDS dist/styles.css. Use bds-* classes or project-namespaced BEM blocks.`,
    );
  }
}

// ── CLI ──────────────────────────────────────────────────────────────────

const USAGE = `canonical-class-check — Canonical CSS-class enforcement for @brikdesigns/bds

Usage:
  canonical-class-check <path...>           Scan paths for class violations
  canonical-class-check --css <file>        Scan a CSS file for violating
                                            definitions (runtime mode — strict)
  canonical-class-check --allowlist <file>  Override allowlist source
                                            (default: node_modules/@brikdesigns/bds/dist/styles.css)
  canonical-class-check --aliases <list>    Comma-separated alias=canonical
                                            pairs (default: btn=button)
  canonical-class-check --exempt <patterns> Comma-separated regex of class
                                            roots to skip
  canonical-class-check --format md|json    Output format (default: md for TTY, json otherwise)
  canonical-class-check --help              Show this message

Exit codes:
  0  Clean — no parallel-taxonomy class names detected
  1  Violations found
  2  Bad invocation (missing args, unreadable allowlist)

Source of truth: BDS dist/styles.css (component class layer).
`;

function parseCliArgs(argv) {
  const opts = {
    paths: [],
    cssFile: null,
    allowlistPath: null,
    aliases: null,
    exemptPatterns: null,
    format: null,
    help: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') opts.help = true;
    else if (a === '--css') opts.cssFile = argv[++i];
    else if (a === '--allowlist') opts.allowlistPath = argv[++i];
    else if (a === '--aliases') {
      opts.aliases = {};
      for (const pair of argv[++i].split(',')) {
        const [k, v] = pair.split('=').map((s) => s.trim());
        if (k && v) opts.aliases[k] = v;
      }
    }
    else if (a === '--exempt') opts.exemptPatterns = argv[++i].split(',').map((s) => new RegExp(s));
    else if (a.startsWith('--format=')) opts.format = a.slice('--format='.length);
    else if (a === '--format') opts.format = argv[++i];
    else if (a.startsWith('-')) {
      process.stderr.write(`canonical-class-check: unknown flag ${a}\n`);
      process.exit(2);
    }
    else opts.paths.push(a);
  }
  if (!opts.format) opts.format = process.stdout.isTTY ? 'md' : 'json';
  return opts;
}

function describeViolation(v) {
  if (v.kind === 'shadow-root') return `${v.class}  (shadows ${v.canonical})`;
  if (v.kind === 'shadow-alias') return `${v.class}  (alias '${v.alias}' shadows ${v.canonical})`;
  return `${v.class}  (invented bds-* — not in allowlist)`;
}

function renderMarkdown(result, mode) {
  if (result.violations.length === 0) {
    return `canonical-class-check: clean — ${mode === 'runtime' ? result.emittedCount + ' definitions' : result.scannedFiles + ' files'} scanned, 0 class violations against ${result.canonicalRootCount} canonical roots\n`;
  }
  const lines = [];
  lines.push(`canonical-class-check: ${result.violations.length} class violation(s) — parallel taxonomy drift`);
  lines.push(`  Source of truth: BDS dist/styles.css`);
  if (mode === 'source') {
    lines.push(`  Scanned ${result.scannedFiles} files against ${result.canonicalRootCount} canonical roots`);
    lines.push('');
    for (const v of result.violations) {
      const where = (v.files || []).slice(0, 3).map((f) => f.split(sep).slice(-3).join('/')).join(', ');
      const more = (v.files || []).length > 3 ? `, +${v.files.length - 3} more` : '';
      lines.push(`  ${describeViolation(v)}   (${where}${more})`);
    }
  } else {
    lines.push(`  Inspected ${result.emittedCount} emitted definitions`);
    lines.push('');
    for (const v of result.violations) lines.push(`  ${describeViolation(v)}`);
  }
  lines.push('');
  lines.push('  Use bds-* classes from @brikdesigns/bds, or project-namespaced BEM');
  lines.push('  for layout (e.g. .team-card__portrait). Inline aliases are not accepted.');
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

  const allowlistPath = opts.allowlistPath ?? resolveDefaultClassAllowlistPath();
  let allowlist;
  try {
    allowlist = parseClassAllowlistFromFile(allowlistPath);
  } catch (err) {
    process.stderr.write(`${err.message}\n`);
    process.exit(2);
  }

  if (allowlist.size < 20) {
    process.stderr.write(
      `canonical-class-check: allowlist parse returned only ${allowlist.size} class names from ${allowlistPath}\n` +
      `  Expected 100+ canonical entries. Verify dist/styles.css is built.\n`,
    );
    process.exit(2);
  }

  const aliases = opts.aliases ?? DEFAULT_CLASS_ALIASES;
  const exemptPatterns = opts.exemptPatterns ?? DEFAULT_CLASS_EXEMPT_PATTERNS;

  if (opts.cssFile) {
    if (!existsSync(opts.cssFile)) {
      process.stderr.write(`canonical-class-check: --css file not found: ${opts.cssFile}\n`);
      process.exit(2);
    }
    const css = readFileSync(opts.cssFile, 'utf8');
    const result = classRuntimeScan({ css, allowlist, aliases, exemptPatterns });
    process.stdout.write(opts.format === 'json' ? renderJson(result, 'runtime') : renderMarkdown(result, 'runtime'));
    process.exit(result.violations.length > 0 ? 1 : 0);
  }

  if (opts.paths.length === 0) {
    process.stderr.write(USAGE);
    process.exit(2);
  }

  const result = classSourceScan({ paths: opts.paths, allowlist, aliases, exemptPatterns });
  process.stdout.write(opts.format === 'json' ? renderJson(result, 'source') : renderMarkdown(result, 'source'));
  process.exit(result.violations.length > 0 ? 1 : 0);
}

const isCliEntry = (() => {
  try {
    return resolve(fileURLToPath(import.meta.url)) === resolve(process.argv[1] ?? '');
  } catch (err) {
    process.stderr.write(`canonical-class-check: could not determine CLI entry — ${err.message}\n`);
    return false;
  }
})();

if (isCliEntry) main();
