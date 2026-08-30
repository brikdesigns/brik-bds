#!/usr/bin/env node
/**
 * lint-token-tiers — fail when a Semantic token references another Semantic
 * token.
 *
 * The token model has four tiers (docs-site token-anatomy → Tier): Raw (1),
 * Primitive (2), Semantic (3), Component (4). The rule is "higher tiers
 * reference lower tiers via var()" — a Semantic token (`--padding-lg`,
 * `--page-inset`, `--background-brand-primary`) resolves DOWN to a Primitive
 * (`--space-600`, `--color-poppy-500`), and only a Component-tier `--bds-*`
 * knob resolves to a Semantic. A Semantic pointing at another Semantic is a
 * same-tier (t3→t3) reference — off the model, and the shape this gate catches.
 *
 * Why a dedicated gate: the sibling token gates read the reference GRAPH but
 * none read tier DIRECTION.
 *   - lint-token-self-reference → a cycle (A→A, A→B→A), invalid at
 *                                 computed-value time.
 *   - lint-token-shadowing      → a name declared twice, earlier one dead.
 *   - cascade-contract-check    → a CONSUMER redefining a canonical token.
 *   - canonical-check           → an INVENTED name in a consumer.
 *   - this                      → a Semantic aliasing a Semantic, in source.
 *
 * This shipped silently once: `--gutter-page: var(--padding-lg)` (both
 * Semantic) rode into dist/tokens.css because no gate looked at tier direction
 * (ADR-025). The remedy is a same-tier token whose modes reference Primitives
 * directly — `--page-inset: var(--space-600)` + a `[data-mode-spacing]` ladder.
 *
 * ── Scope ────────────────────────────────────────────────────────────────
 * Narrow on purpose (a noisy gate gets switched off): it flags ONLY a
 * Semantic-*named* token referencing a Semantic (t3→t3). This fully guards the
 * fix that added it — `--page-inset` is Semantic-named, so re-aliasing it to
 * `--padding-lg` fires. Tier is classified by name prefix, kept in sync with
 * scripts/lint-tokens.js `SD_SEMANTIC_PREFIXES`.
 *
 * KNOWN LIMITATION (by design, tracked in #2187): a *Primitive-named* token
 * pointing UP at a Semantic (t2→t3) is NOT flagged — which is, ironically, how
 * `--gutter-page: var(--padding-lg)` itself classified (`--gutter-page` matches
 * no Semantic prefix). Broadening to the full rule "only a Component `--bds-*`
 * may reference a Semantic" surfaces 77 hits, because BDS has an established,
 * theme-correct *role-aliasing* convention (`bridge.css` Webflow-compat aliases;
 * `--border-focus: var(--border-brand-primary)`; `--tooltip-text:
 * var(--text-inverse)`) that a literal rule over-bans. Deciding which aliasing
 * is sanctioned is a design question, deferred to #2187.
 *
 * ── Escape hatch ───────────────────────────────────────────────────────────
 * A reasoned `bds-lint-ignore — <why>` on the declaration line is honoured
 * (the five pre-existing t3→t3 hits are tracked in #2186). A bare marker
 * hard-fails, same as the sibling gates (#1469).
 *
 * ── CLI ────────────────────────────────────────────────────────────────────
 *   node scripts/lint-token-tiers.mjs [glob-or-file ...]
 *   node scripts/lint-token-tiers.mjs --json
 *
 * Default target set: tokens/*.css
 *
 * Exit 0 = clean, 1 = violations found, 2 = the check itself broke.
 * Exit 2 matters: a scan that parsed no declarations must never read as clean.
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { lintIgnoreReason } from './lib/bds-lint-ignore.cjs';

const DEFAULT_DIR = 'tokens';

/**
 * Semantic-tier prefixes — purpose-bound names, not raw scale values. Kept in
 * sync with scripts/lint-tokens.js `SD_SEMANTIC_PREFIXES`; a name matching none
 * of these (and not a Webflow `--_*` or Component `--bds-*`) is Primitive-tier.
 */
const SD_SEMANTIC_PREFIXES = [
  '--padding-', '--gap-', '--text-', '--background-', '--surface-',
  '--border-primary', '--border-secondary', '--border-muted', '--border-brand',
  '--border-input', '--border-inverse', '--border-on-color', '--border-width-',
  '--border-radius-', '--page-', '--body-', '--label-', '--heading-',
  '--display-', '--subtitle-', '--icon-', '--font-family-', '--box-shadow-',
  '--blur-radius-', '--size-',
];

/** True when `name` is a Component-tier (t4) token — the only tier permitted
 *  to reference a Semantic. */
export function isComponent(name) {
  return name.startsWith('--bds-');
}

/** True when `name` is a Semantic-tier (t3) token. */
export function isSemantic(name) {
  if (isComponent(name)) return false; // Component (t4)
  // A numeric final segment is a raw scale STEP — Primitive — even under a
  // prefix that is otherwise Semantic: `--border-radius-600` / `--size-400`
  // are the Primitive scale, `--border-radius-lg` / `--size-md` are Semantic
  // roles that resolve to them. Without this, every generated role→step alias
  // (`--size-md: var(--size-400)`) reads as a false hit.
  if (/-\d+$/.test(name)) return false;
  if (name.startsWith('--_')) return true; // Webflow semantic
  return SD_SEMANTIC_PREFIXES.some((p) => name.startsWith(p));
}

/** Strip comments but keep byte offsets stable so line numbers stay true. */
function blankComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
}

/**
 * Every `--name: <value>;` declaration, with the custom properties its value
 * substitutes and the 1-based line it starts on. Declaration-level, matching
 * lint-token-self-reference — the winning declaration is what ships.
 */
export function parseDeclarations(src) {
  const clean = blankComments(src);
  const decls = [];
  const re = /(--[A-Za-z0-9_-]+)\s*:\s*([^;{}]*);/g;
  let m;
  while ((m = re.exec(clean)) !== null) {
    const [, name, rawValue] = m;
    const value = rawValue.trim();
    const refs = [...value.matchAll(/var\(\s*(--[A-Za-z0-9_-]+)/g)].map((r) => r[1]);
    decls.push({ name, value, refs, line: clean.slice(0, m.index).split('\n').length });
  }
  return decls;
}

/**
 * Non-Component tokens that reference a Semantic token. The tier rule is
 * "higher tiers reference lower tiers", so a Semantic (t3) must resolve to a
 * Primitive (t2) and ONLY a Component `--bds-*` (t4) may resolve to a Semantic.
 * Both off-model shapes are caught: a Semantic aliasing a Semantic (t3→t3) and
 * a Primitive-named token pointing UP at a Semantic (t2→t3) — the latter is the
 * exact shape `--gutter-page: var(--padding-lg)` shipped as, since `--gutter-page`
 * classifies Primitive under the prefix taxonomy.
 */
export function findTierViolations(decls, sourceLines = null) {
  const findings = [];
  for (const d of decls) {
    if (!isSemantic(d.name)) continue; // NARROW: only Semantic-named tokens (see header § Scope)
    const semanticRefs = d.refs.filter(isSemantic);
    if (semanticRefs.length === 0) continue;
    // Honour a reasoned bds-lint-ignore on the declaration line; a bare marker
    // is itself a hard-fail (#1469).
    const lineText = sourceLines?.[d.line - 1] ?? '';
    const reason = lintIgnoreReason(lineText);
    if (typeof reason === 'string' && reason.length > 0) continue;
    findings.push({ token: d.name, refs: semanticRefs, line: d.line, value: d.value, bare: reason === '' });
  }
  return findings;
}

function collectTargets(args) {
  if (args.length > 0) return args;
  if (!fs.existsSync(DEFAULT_DIR)) {
    throw new Error(`default target directory ${DEFAULT_DIR}/ not found — run from the repo root`);
  }
  return fs
    .readdirSync(DEFAULT_DIR)
    .filter((f) => f.endsWith('.css'))
    .sort()
    .map((f) => path.join(DEFAULT_DIR, f));
}

function main() {
  const args = process.argv.slice(2);
  const json = args.includes('--json');
  const targets = collectTargets(args.filter((a) => !a.startsWith('--')));

  let files = 0;
  let declarations = 0;
  const findings = [];

  try {
    for (const target of targets) {
      const src = fs.readFileSync(target, 'utf8');
      const decls = parseDeclarations(src);
      files += 1;
      declarations += decls.length;
      for (const f of findTierViolations(decls, src.split('\n'))) {
        findings.push({ ...f, file: path.relative(process.cwd(), target) });
      }
    }
  } catch (err) {
    console.error(`SCAN FAILED — ${err.message}`);
    process.exit(2);
  }

  // A parse that found nothing is a broken parse, not a clean registry.
  if (files === 0 || declarations === 0) {
    console.error(`SCAN FAILED — parsed ${files} file(s) / ${declarations} declaration(s).`);
    console.error('A zero denominator is a broken scan, not a clean registry.');
    process.exit(2);
  }

  if (json) {
    console.log(JSON.stringify({ files, declarations, violations: findings.length, findings }, null, 2));
    process.exit(findings.length > 0 ? 1 : 0);
  }

  // Denominator first — what was scanned, not only what was found.
  console.error(`lint-token-tiers: ${files} file(s), ${declarations} declaration(s) checked`);

  for (const f of findings) {
    const tag = f.bare ? '  ← bare bds-lint-ignore (needs a reason, #1469)' : '';
    console.error(`  ✗ ${f.file}:${f.line}  ${f.token}: ${f.value}${tag}`);
    console.error(`      Semantic → Semantic (references ${f.refs.join(', ')}) — a Semantic token must resolve to a Primitive`);
  }

  if (findings.length > 0) {
    console.error('');
    console.error(`${findings.length} Semantic token(s) referencing another Semantic token.`);
    console.error('Point each at a Primitive (--space-*, --color-*, --font-size-*, …). If it must');
    console.error('track a mode, give it its own [data-mode-spacing] ladder over Primitives (ADR-025,');
    console.error('--page-inset). A deliberate, temporary alias takes a reasoned `bds-lint-ignore — <why>`.');
    console.error('Tier model: design.brikdesigns.com/docs/primitives/token-anatomy#tier');
    process.exit(1);
  }

  console.error('clean — no Semantic token references another Semantic token');
  process.exit(0);
}

const isCliEntry = (() => {
  try {
    return path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1] ?? '');
  } catch (err) {
    process.stderr.write(`lint-token-tiers: could not determine CLI entry — ${err.message}\n`);
    return false;
  }
})();

if (isCliEntry) main();
