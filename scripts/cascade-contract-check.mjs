#!/usr/bin/env node
/**
 * cascade-contract-check — enforce the BDS token adoption contract in consumers.
 *
 * ADR-013 §2. The companion to canonical-check:
 *   - canonical-check         → forbids INVENTED token names (`--surface-paper`).
 *   - cascade-contract-check  → forbids REDEFINING canonical tokens, and
 *                               catches typography family↔size mismatches.
 *
 * Three rules:
 *
 * 1. no-redefinition — a consumer consumes BDS tokens; it does not redefine
 *    them (the cascade adoption contract, see cascade.mdx).
 *    - SCALE families (`--heading-*`, `--display-*`, `--font-size-*`):
 *      redefining is a violation ANYWHERE in consumer CSS. A Brand Kit varies
 *      font-*family*, never the shared type scale — the brikdesigns `:root`
 *      heading remap is the canonical offender (load-bearing + invisible for
 *      ~3 months).
 *    - BRANDABLE families (`--surface-*`, `--text-*`, `--border-*`, `--page-*`,
 *      `--background-*`): redefining is allowed ONLY inside Brand-Kit scope —
 *      a `theme-{client}.css` file, or a selector scoped to `.theme-{client}`
 *      / `[data-audience|service|department]`. At a bare `:root` (or any
 *      non-brand selector) it is a violation. This is the one allowed
 *      exception the contract names: brand-color (and brand neutral) override.
 *
 * 2. typography-family — within a single CSS rule, a `font-family:
 *    var(--font-family-X)` declaration and a font-size token `var(--Y-…)` must
 *    share a family (X === Y). Catches e.g. a display family paired with a
 *    heading-scale size (the home-hero token-pairing bug, brikdesigns #536).
 *
 * 3. import-layer — every CSS `@import` of `@brikdesigns/bds/tokens.css` or
 *    `styles.css` carries a NAMED `layer()` clause. `dist/tokens.css` ships
 *    fully unlayered, so `layer(bds-tokens)` at the import site is the only
 *    thing placing it in the cascade; a plain `@import` makes it unlayered CSS,
 *    which beats every layered rule and silently defeats a client theme in
 *    `@layer client-theme`. A bare `layer` (anonymous) also fails — an
 *    anonymous layer can't be named in a `@layer` statement, so it can't be
 *    ordered against `client-theme`. Astro/Vite **JS** `import '….css'` cannot
 *    carry `layer()` and cascades by source order instead; the rule anchors on
 *    the `@import` at-rule so those are never flagged (brik-bds#1437).
 *
 * Why this lives in @brikdesigns/bds (not a per-repo copy): one owner, no
 * fork. `bds@x.y` ships the gate that matches `bds@x.y`'s token registry;
 * consumers import it into their own `lint-tokens` run. Per-repo copies are
 * exactly the drift this rule exists to stop. See cascade.mdx (the adoption
 * contract) and ADR-013.
 *
 * ── CLI ────────────────────────────────────────────────────────────────────
 *   cascade-contract-check <file.css...>      Scan CSS files; non-zero on violations
 *   cascade-contract-check --exempt <list>    Comma-separated token names / regexes
 *                                             to skip (transitional burn-down allowlist)
 *   cascade-contract-check --format md|json   Output format (default: md for TTY)
 *   cascade-contract-check --help
 *
 * ── Library ──────────────────────────────────────────────────────────────-─
 *   import {
 *     scanCascadeContract,   // (css, opts) -> { violations, ... }
 *     assertCascadeContract, // throws on first violation (vitest-friendly)
 *     familyOfSizeToken,
 *     familyOfFontFamilyToken,
 *   } from '@brikdesigns/bds/cascade-contract-check';
 *
 * ── Exit codes ─────────────────────────────────────────────────────────────
 *   0  Clean
 *   1  Violations found
 *   2  Bad invocation (no files, unreadable file, etc.)
 */

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * Replace `/* … *​/` block-comment content with spaces while preserving every
 * character position and newline, so line numbers map 1:1 to the source. (Note:
 * canonical-check's `stripCssComments` *removes* blank/comment lines — fine for
 * its Set-returning token extraction, but it would corrupt our line numbers.)
 * CSS has no `//` line comments, so block comments are the only case.
 */
function maskComments(css) {
  let out = '';
  const n = css.length;
  let i = 0;
  while (i < n) {
    if (css[i] === '/' && css[i + 1] === '*') {
      out += '  ';
      i += 2;
      while (i < n && !(css[i] === '*' && css[i + 1] === '/')) {
        out += css[i] === '\n' ? '\n' : ' ';
        i++;
      }
      if (i < n) { out += '  '; i += 2; }
    } else {
      out += css[i];
      i++;
    }
  }
  return out;
}

// ── Token family model ──────────────────────────────────────────────────────

/**
 * Scale families: the shared type scale. A consumer may NEVER redefine these —
 * a Brand Kit changes `--font-family-*`, not the scale steps.
 */
export const SCALE_FAMILIES = ['heading', 'display', 'font-size'];

/**
 * Brandable families: semantic color/surface tokens a Brand Kit legitimately
 * overrides — but only within brand scope (a `theme-{client}.css` file or a
 * `.theme-{client}` / `[data-*]` selector). Redefining them at a bare `:root`
 * is off-contract.
 */
export const BRANDABLE_FAMILIES = ['surface', 'text', 'border', 'page', 'background'];

/** `--font-family-{family}` → family. Mirrors dist/tokens.css. */
export const FONT_FAMILY_TO_FAMILY = {
  '--font-family-heading': 'heading',
  '--font-family-display': 'display',
  '--font-family-body': 'body',
  '--font-family-label': 'label',
  '--font-family-subtitle': 'subtitle',
};

/** font-size token prefix → family. `--font-size-*` is the raw math scale (no family). */
const SIZE_PREFIX_TO_FAMILY = [
  ['--heading-', 'heading'],
  ['--display-', 'display'],
  ['--body-', 'body'],
  ['--label-', 'label'],
  ['--subtitle-', 'subtitle'],
];

/** Selectors that establish Brand-Kit scope (the redefinition exception). */
const BRAND_SCOPE_SELECTOR_RE = /\.theme-[a-z0-9-]+|\[data-(?:audience|service|department)\b/i;

// ── Rule 3: import-layer model ──────────────────────────────────────────────

/**
 * BDS stylesheets that MUST be imported into a named layer, and the layer the
 * contract assigns each one. `dist/tokens.css` ships fully unlayered, so the
 * `layer()` clause at the import site is the only thing placing it in the
 * cascade — a plain `@import` makes it unlayered CSS, which beats every
 * layered rule and silently defeats a client theme in `@layer client-theme`.
 * `dist/styles.css` self-wraps `@layer bds-components`, so its `layer()` is
 * belt-and-braces rather than load-bearing; the contract still requires it so
 * the layer order is declarable in one place.
 */
export const LAYERED_BDS_IMPORTS = {
  'tokens.css': 'bds-tokens',
  'styles.css': 'bds-components',
};

/**
 * A CSS `@import` of a BDS stylesheet. Captures the specifier and everything
 * up to the terminating `;` so the tail can be checked for a `layer()` clause.
 * Matches both the string form (`@import '…'`) and the `url()` form
 * (`@import url("…")`), single or double quoted.
 *
 * Deliberately anchored on `@import` so a JS/TS `import '…css'` statement can
 * never match: those cannot carry a `layer()` clause at all, and the contract
 * names source-order as their legal path (Astro/Vite — see framework-guides).
 */
const BDS_IMPORT_RE =
  /@import\s+(?:url\(\s*)?['"]([^'"]*@brikdesigns\/bds\/[^'"]+)['"]\s*\)?([^;]*);/g;

/** The `layer(name)` clause of an `@import` tail: 'named' | 'anonymous' | null. */
function importLayerClause(tail) {
  const named = tail.match(/\blayer\s*\(\s*([a-zA-Z][\w-]*)/);
  if (named) return { kind: 'named', name: named[1] };
  // `@import "x.css" layer;` is legal CSS but creates an *anonymous* layer,
  // which cannot be named in a `@layer` statement and so cannot be ordered
  // against `client-theme`. Off-contract for the same reason as no layer.
  if (/\blayer\b(?!\s*\()/.test(tail)) return { kind: 'anonymous' };
  return null;
}

/** Filenames that ARE a Brand Kit output (whole-file brand scope). */
const BRAND_SCOPE_FILE_RE = /(?:^|[\\/])theme-[a-z0-9-]+\.css$/i;

/** Family of a font-size token, or null if it is not a size token. */
export function familyOfSizeToken(token) {
  for (const [prefix, family] of SIZE_PREFIX_TO_FAMILY) {
    if (token.startsWith(prefix)) return family;
  }
  return null;
}

/** Family of a `--font-family-*` token, or null. */
export function familyOfFontFamilyToken(token) {
  return FONT_FAMILY_TO_FAMILY[token] ?? null;
}

/** Redefinition class of a declared token name: 'scale' | 'brandable' | null. */
function redefinitionClass(name) {
  if (SCALE_FAMILIES.some((f) => name.startsWith(`--${f}-`))) return 'scale';
  if (BRANDABLE_FAMILIES.some((f) => name.startsWith(`--${f}-`))) return 'brandable';
  return null;
}

function isExempt(token, exemptPatterns) {
  for (const pat of exemptPatterns) {
    if (typeof pat === 'string' && token === pat) return true;
    if (pat instanceof RegExp && pat.test(token)) return true;
  }
  return false;
}

// ── Core scan ─────────────────────────────────────────────────────────────

/**
 * Rule 3: every CSS `@import` of a BDS stylesheet carries a named `layer()`.
 *
 * A statement-level pass rather than part of the declaration scanner below —
 * `@import` is an at-rule, not a declaration, and carries no `:` for
 * `flushDeclaration` to split on.
 *
 * Only CSS `@import` at-rules are considered. A JS/TS `import '….css'` cannot
 * carry `layer()` and is contract-legal via source order, so it must never be
 * flagged; anchoring on `@import` excludes it structurally.
 */
function scanImportLayers({ stripped, file, exemptTokens = [] }) {
  const violations = [];
  BDS_IMPORT_RE.lastIndex = 0;
  let m;
  while ((m = BDS_IMPORT_RE.exec(stripped)) !== null) {
    const [, specifier, tail] = m;
    const basename = specifier.split('/').pop();
    const expectedLayer = LAYERED_BDS_IMPORTS[basename];
    // Only the two contract-governed stylesheets. An `@import` of e.g.
    // `@brikdesigns/bds/atmospheres/warm-soft.css` is not layer-governed.
    if (!expectedLayer) continue;
    if (isExempt(specifier, exemptTokens)) continue;

    const clause = importLayerClause(tail);
    if (clause?.kind === 'named') continue;

    const line = stripped.slice(0, m.index).split('\n').length;
    const why =
      basename === 'tokens.css'
        ? 'ships unlayered, so the `layer()` clause is the only thing placing it in ' +
          'the cascade — without it the file wins as unlayered CSS and a client theme ' +
          'in `@layer client-theme` can never override it'
        : 'must be placed explicitly so the layer order is declarable in one place';
    const problem =
      clause?.kind === 'anonymous'
        ? 'uses a bare `layer` (an anonymous layer, which cannot be named in a ' +
          '`@layer` statement and so cannot be ordered against `client-theme`)'
        : 'has no `layer()` clause';

    violations.push({
      rule: 'import-layer',
      severity: 'error',
      token: specifier,
      file,
      line,
      message:
        `\`@import '${specifier}'\` ${problem}. Use ` +
        `\`@import '${specifier}' layer(${expectedLayer});\` — ${basename} ${why}. ` +
        `(cascade adoption contract / ADR-013)`,
    });
  }
  return violations;
}

/**
 * Scan one CSS string for cascade-contract violations.
 *
 * A char-level scanner tracks the selector stack and line numbers so it works
 * on both expanded (`one decl per line`) and compact (`.foo { --x: y; }`)
 * formatting, and resolves a declaration's brand-scope from any enclosing
 * selector — not just the innermost one (e.g. `:root[data-theme] .theme-x {…}`).
 *
 * Does NOT throw — callers decide how to surface (CLI exits non-zero, vitest
 * uses `assertCascadeContract`).
 */
export function scanCascadeContract({ css, file = '<input>', exemptTokens = [] }) {
  const fileBrandScoped = BRAND_SCOPE_FILE_RE.test(file);
  const stripped = maskComments(css);

  const violations = [...scanImportLayers({ stripped, file, exemptTokens })];
  // Selector stack: each frame { selectors: string, brand: boolean }.
  const stack = [];
  // Per-rule accumulator for the typography-family check, parallel to `stack`.
  const ruleFonts = [];

  let buf = '';
  let line = 1;
  let bufStartLine = 1;

  const brandScopedNow = () => fileBrandScoped || stack.some((f) => f.brand);

  const flushDeclaration = () => {
    const decl = buf.trim();
    buf = '';
    if (!decl) return;
    const colon = decl.indexOf(':');
    if (colon === -1) return;
    const prop = decl.slice(0, colon).trim();
    const value = decl.slice(colon + 1).trim();

    // ── Rule 1: redefinition ──
    if (prop.startsWith('--')) {
      const klass = redefinitionClass(prop);
      if (klass && !isExempt(prop, exemptTokens)) {
        if (klass === 'scale') {
          violations.push({
            rule: 'no-redefinition',
            severity: 'error',
            token: prop,
            file,
            line: bufStartLine,
            message:
              `Consumer redefines BDS scale token \`${prop}\`. The type scale is ` +
              `shared — vary \`--font-family-*\` or emit a typography Mode, never ` +
              `redefine the scale. (cascade adoption contract / ADR-013)`,
          });
        } else if (klass === 'brandable' && !brandScopedNow()) {
          violations.push({
            rule: 'no-redefinition',
            severity: 'error',
            token: prop,
            file,
            line: bufStartLine,
            message:
              `Consumer redefines BDS semantic token \`${prop}\` outside Brand-Kit ` +
              `scope. Brand override belongs in a \`theme-{client}.css\` / ` +
              `\`.theme-{client}\` block, not a bare \`:root\`. (ADR-013)`,
          });
        }
      }
    }

    // ── Rule 2: collect font-family / font-size for the current rule ──
    const frame = ruleFonts[ruleFonts.length - 1];
    if (frame) {
      const varMatch = value.match(/var\(\s*(--[a-z0-9-]+)/i);
      const token = varMatch?.[1];
      if (prop === 'font-family' && token) {
        const fam = familyOfFontFamilyToken(token);
        if (fam) frame.familyFamily = { fam, token, line: bufStartLine };
      } else if (prop === 'font-size' && token) {
        const fam = familyOfSizeToken(token);
        if (fam) frame.sizeFamily = { fam, token, line: bufStartLine };
      }
    }
  };

  const finishRule = () => {
    const frame = ruleFonts.pop();
    if (!frame) return;
    const { familyFamily, sizeFamily } = frame;
    if (familyFamily && sizeFamily && familyFamily.fam !== sizeFamily.fam) {
      violations.push({
        rule: 'typography-family',
        severity: 'error',
        token: familyFamily.token,
        file,
        line: sizeFamily.line,
        message:
          `Typography family mismatch: \`font-family: var(${familyFamily.token})\` ` +
          `(${familyFamily.fam}) paired with \`font-size: var(${sizeFamily.token})\` ` +
          `(${sizeFamily.fam}). font-family and font-size must share a family. (ADR-013)`,
      });
    }
  };

  for (let i = 0; i < stripped.length; i++) {
    const ch = stripped[i];
    if (ch === '\n') {
      line++;
      continue;
    }
    if (ch === '{') {
      const selectors = buf.trim();
      buf = '';
      // At-rules (@media, @layer, @supports) are not real selectors — they
      // don't establish brand scope, but they DO open a brace level.
      const isAtRule = selectors.startsWith('@');
      stack.push({ selectors, brand: !isAtRule && BRAND_SCOPE_SELECTOR_RE.test(selectors) });
      // Only declaration-bearing rules carry a typography frame; @layer/@media
      // wrappers get one too (harmless — they hold no font decls directly).
      ruleFonts.push({ familyFamily: null, sizeFamily: null });
      bufStartLine = line;
    } else if (ch === '}') {
      flushDeclaration();
      finishRule();
      stack.pop();
      bufStartLine = line;
    } else if (ch === ';') {
      flushDeclaration();
      bufStartLine = line;
    } else {
      if (buf === '') bufStartLine = line;
      buf += ch;
    }
  }

  return { violations, file };
}

/**
 * Throw on the first violation. Convenience for vitest / generator tests.
 */
export function assertCascadeContract(css, opts = {}) {
  const { violations } = scanCascadeContract({ css, ...opts });
  if (violations.length > 0) {
    const v = violations[0];
    throw new Error(
      `cascade-contract-check: ${violations.length} violation(s). First:\n  ` +
      `${v.file}:${v.line} [${v.rule}] ${v.message}`,
    );
  }
}

// ── CLI ─────────────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const files = [];
  let format = process.stdout.isTTY ? 'md' : 'json';
  const exempt = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') return { help: true };
    else if (a === '--format') format = argv[++i];
    else if (a === '--exempt') {
      for (const t of (argv[++i] ?? '').split(',').map((s) => s.trim()).filter(Boolean)) {
        exempt.push(t.startsWith('/') && t.endsWith('/') ? new RegExp(t.slice(1, -1)) : t);
      }
    } else if (a.startsWith('-')) {
      process.stderr.write(`Unknown flag: ${a}\n`);
      return { bad: true };
    } else files.push(a);
  }
  return { files, format, exempt };
}

const HELP = `cascade-contract-check — enforce the BDS token adoption contract (ADR-013 §2)

Usage:
  cascade-contract-check <file.css...>
  cascade-contract-check --exempt --heading-lg,--heading-huge   transitional burn-down
  cascade-contract-check --format json

Checks consumer CSS for:
  • no-redefinition  — redefining a BDS scale (--heading/display/font-size) token
                       anywhere, or a semantic color token outside Brand-Kit scope
  • typography-family — font-family family must match font-size family in a rule
  • import-layer      — @import of bds/tokens.css or styles.css must carry a named
                        layer() clause (JS imports are exempt by construction)
`;

function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    process.stdout.write(HELP);
    process.exit(0);
  }
  if (opts.bad) process.exit(2);
  if (!opts.files.length) {
    process.stderr.write('cascade-contract-check: no CSS files given.\n');
    process.exit(2);
  }

  const all = [];
  for (const file of opts.files) {
    if (!existsSync(file)) {
      process.stderr.write(`cascade-contract-check: file not found: ${file}\n`);
      process.exit(2);
    }
    const { violations } = scanCascadeContract({
      css: readFileSync(file, 'utf8'),
      file,
      exemptTokens: opts.exempt,
    });
    all.push(...violations);
  }

  if (opts.format === 'json') {
    process.stdout.write(JSON.stringify({ violations: all }, null, 2) + '\n');
  } else if (all.length === 0) {
    process.stdout.write(
      'cascade-contract-check: OK — no redefinitions, no family mismatches, ' +
      'every BDS @import layered.\n',
    );
  } else {
    process.stdout.write(`cascade-contract-check: ${all.length} violation(s):\n`);
    for (const v of all) {
      process.stdout.write(`  ${v.file}:${v.line} [${v.rule}] ${v.token}\n    ${v.message}\n`);
    }
  }
  process.exit(all.length > 0 ? 1 : 0);
}

// Run as CLI only when invoked directly (not when imported as a library).
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
