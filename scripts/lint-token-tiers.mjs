#!/usr/bin/env node
/**
 * lint-token-tiers — enforce tier DIRECTION: a token may reference a Semantic
 * token only when the reference is tier-legal.
 *
 * The token model has four tiers (docs-site token-anatomy → Tier): Raw (1),
 * Primitive (2), Semantic (3), Component (4). The rule is "higher tiers
 * reference lower tiers via var()" — a Semantic token (`--padding-lg`,
 * `--page-inset`, `--background-brand-primary`) resolves DOWN to a Primitive
 * (`--space-600`, `--color-poppy-500`), and only a Component-tier `--bds-*`
 * knob resolves to a Semantic.
 *
 * ── The one sanctioned exception: color role-aliasing (ADR-035) ─────────────
 * A Semantic MAY alias another Semantic when the target resolves to a
 * `--color-*` Primitive. Color is the theme-varying axis: `--border-focus:
 * var(--border-brand-primary)` means "the focus ring IS the brand border", and
 * because `--border-brand-primary` is redefined per theme, the alias theme-
 * tracks for free from one line. Banning it would force the alias to be re-
 * declared in every theme block and would decouple focus from brand — a
 * regression, not a purity win (#2187). So a color→color alias is legal.
 *
 * Every OTHER Semantic→Semantic reference is off-model, because a non-color
 * Semantic (spacing/size/type/radius/width) carries a mode or scale LADDER that
 * must not be parasitized. `--gutter-page: var(--padding-lg)` (ADR-025) borrowed
 * `--padding-lg`'s density ladder for a page inset — coupling unrelated concerns.
 * The remedy is a token that resolves its scale from Primitives directly
 * (`--page-inset: var(--space-600)` + a `[data-mode-spacing]` ladder;
 * `--display-fluid-lg: clamp(…, var(--font-size-1600))`).
 *
 * Why a dedicated gate: the sibling token gates read the reference GRAPH but
 * none read tier DIRECTION.
 *   - lint-token-self-reference → a cycle (A→A, A→B→A).
 *   - lint-token-shadowing      → a name declared twice.
 *   - cascade-contract-check    → a CONSUMER redefining a canonical token.
 *   - canonical-check           → an INVENTED name in a consumer.
 *   - this                      → an off-model Semantic alias, in source.
 *
 * ── Scope ────────────────────────────────────────────────────────────────
 * Broad rule (ADR-035, #2187): ANY non-Component token that references a
 * non-color Semantic is flagged — both a Semantic-named token (t3→t3) and a
 * Primitive-named token pointing UP at a Semantic (t2→t3, the exact shape
 * `--gutter-page: var(--padding-lg)` shipped as, since `--gutter-page` matches
 * no Semantic prefix). Tier is classified by name prefix, kept in sync with
 * scripts/lint-tokens.js `SD_SEMANTIC_PREFIXES`; "resolves to color" is computed
 * from the actual reference graph, so it stays correct as tokens are added.
 *
 * `tokens/compat/bridge.css` (the Webflow double-dash → SD-name alias layer) is
 * held OUT of the default scan set structurally — it lives in a subdirectory the
 * non-recursive `tokens/*.css` scan does not reach — because it is an alias layer
 * by definition and never concatenates into dist/tokens.css (ADR-035).
 *
 * ── Escape hatch ───────────────────────────────────────────────────────────
 * A reasoned `bds-lint-ignore — <why>` on the declaration line is honoured. A
 * bare marker hard-fails, same as the sibling gates (#1469).
 *
 * ── CLI ────────────────────────────────────────────────────────────────────
 *   node scripts/lint-token-tiers.mjs [glob-or-file ...]
 *   node scripts/lint-token-tiers.mjs --json
 *
 * Default target set: tokens/*.css (non-recursive — excludes tokens/compat/)
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
  '--border-input', '--border-inverse', '--border-on-color', '--border-focus',
  '--border-width-', '--border-radius-', '--page-', '--body-', '--label-',
  '--heading-', '--display-', '--subtitle-', '--icon-', '--font-family-',
  '--box-shadow-', '--blur-radius-', '--size-', '--tooltip-', '--measure-',
];

/** True when `name` is a Component-tier (t4) token — the only tier permitted
 *  to reference a Semantic unconditionally. */
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

/**
 * Does `name` resolve — transitively, through the reference graph — to a
 * `--color-*` Primitive? This is the color role-alias discriminator (ADR-035):
 * a Semantic→Semantic reference is sanctioned iff the target bottoms out at a
 * color, the one theme-varying axis. `defs` maps a token name to the custom
 * properties its value substitutes. Unknown/undefined names (raw-valued
 * Primitives like `--space-600`, `--font-size-1600`) resolve to `false`.
 */
export function resolvesToColor(name, defs, seen = new Set()) {
  if (name.startsWith('--color-')) return true;
  if (seen.has(name)) return false; // cycle guard — a cycle never reaches a color
  seen.add(name);
  const refs = defs[name];
  if (!refs || refs.length === 0) return false;
  return refs.some((r) => resolvesToColor(r, defs, seen));
}

/** Build the `name → refs` resolution table from a flat list of declarations.
 *  First definition wins (a token redefined per theme still resolves the same
 *  color axis). */
export function buildDefs(decls) {
  const defs = {};
  for (const d of decls) if (!(d.name in defs)) defs[d.name] = d.refs;
  return defs;
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
 * Non-Component tokens that reference a non-color Semantic token — the off-model
 * shape. A Semantic (t3) or Primitive-named (t2) token that aliases a Semantic
 * whose value does NOT resolve to a `--color-*` Primitive is flagged; a color
 * role-alias (target resolves to color) is sanctioned (ADR-035). `defs` defaults
 * to a table built from `decls` alone — pass a global table so cross-file
 * targets (a role defined in figma-tokens.css) resolve correctly.
 */
export function findTierViolations(decls, sourceLines = null, defs = null) {
  const table = defs ?? buildDefs(decls);
  const findings = [];
  for (const d of decls) {
    if (isComponent(d.name)) continue; // t4 may reference any lower tier
    const semanticRefs = d.refs.filter(isSemantic);
    if (semanticRefs.length === 0) continue;
    // Sanctioned: color role-aliasing — every referenced Semantic resolves to a
    // --color-* Primitive (theme-tracks). Off-model: any ref that does not.
    const offModel = semanticRefs.filter((r) => !resolvesToColor(r, table));
    if (offModel.length === 0) continue;
    // Honour a reasoned bds-lint-ignore on the declaration line; a bare marker
    // is itself a hard-fail (#1469).
    const lineText = sourceLines?.[d.line - 1] ?? '';
    const reason = lintIgnoreReason(lineText);
    if (typeof reason === 'string' && reason.length > 0) continue;
    findings.push({ token: d.name, refs: offModel, line: d.line, value: d.value, bare: reason === '' });
  }
  return findings;
}

function collectTargets(args) {
  if (args.length > 0) return args;
  if (!fs.existsSync(DEFAULT_DIR)) {
    throw new Error(`default target directory ${DEFAULT_DIR}/ not found — run from the repo root`);
  }
  // Non-recursive on purpose: tokens/compat/ (the bridge alias layer) is held
  // out of the tier-direction scan by living in a subdirectory (ADR-035).
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
    // Parse every target once, then build ONE global resolution table so a
    // color role-alias whose target is defined in another file still resolves.
    const parsed = [];
    for (const target of targets) {
      const src = fs.readFileSync(target, 'utf8');
      const decls = parseDeclarations(src);
      parsed.push({ target, decls, lines: src.split('\n') });
      files += 1;
      declarations += decls.length;
    }
    const defs = buildDefs(parsed.flatMap((p) => p.decls));
    for (const p of parsed) {
      for (const f of findTierViolations(p.decls, p.lines, defs)) {
        findings.push({ ...f, file: path.relative(process.cwd(), p.target) });
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
    console.error(`      off-model → references ${f.refs.join(', ')} (a non-color Semantic) — resolve to a Primitive, not another Semantic`);
  }

  if (findings.length > 0) {
    console.error('');
    console.error(`${findings.length} token(s) referencing a non-color Semantic token.`);
    console.error('Point each at a Primitive (--space-*, --font-size-*, a numeric scale step, …). If it');
    console.error('must track a mode, give it its own [data-mode-*] ladder over Primitives (ADR-025,');
    console.error('--page-inset). A color role-alias (target resolves to --color-*) is allowed (ADR-035).');
    console.error('A deliberate, temporary alias takes a reasoned `bds-lint-ignore — <why>`.');
    console.error('Tier model: design.brikdesigns.com/docs/foundation/token-anatomy#tier');
    process.exit(1);
  }

  console.error('clean — no token references a non-color Semantic token');
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
