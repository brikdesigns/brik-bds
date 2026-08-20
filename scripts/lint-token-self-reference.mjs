#!/usr/bin/env node
/**
 * lint-token-self-reference — fail when a custom property substitutes itself.
 *
 * `--box-shadow-md: var(--box-shadow-md);` is a dependency cycle. Per CSS
 * Custom Properties §3.2 Resolving Dependency Cycles, every custom property in
 * a cycle is invalid at computed-value time, so the name resolves to the
 * guaranteed-invalid value — it is *unset*, not merely unchanged. An earlier
 * correct declaration of the same name does NOT come back: the cascade picks
 * the winning declaration first, and the cycle poisons that winner.
 *
 * That is what made #1919 invisible. `tokens/bridge.css` re-declared fifteen
 * word-scale names this way. Each was already defined correctly upstream in
 * figma-tokens.css / gap-fills.css, so the file read as harmless aliasing — but
 * any consumer that loaded bridge.css lost all fifteen. Verified in Chromium
 * against the real dist files: loading dist/tokens.css alone gives
 * `--border-radius-md: 12px`; loading dist/tokens.css + dist/bridge.css gives
 * the empty string.
 *
 * The failure mode is the dangerous one — silent. No parse error, no console
 * warning, no visual diff at the authoring site. Only a consumer four repos
 * away quietly losing a border radius.
 *
 * Sibling gates, and why this is none of them:
 *   - lint-token-shadowing    → a token declared TWICE with different values,
 *                               so the earlier one is dead. Reads the
 *                               concatenated dist/tokens.css.
 *   - cascade-contract-check  → a CONSUMER redefining a canonical token.
 *   - canonical-check         → an INVENTED token name in a consumer.
 *   - this                    → a token defined in terms of ITSELF, in source,
 *                               before it ships. Reads tokens/*.css, including
 *                               the files that never reach dist/tokens.css.
 *
 * bridge.css is exactly that blind spot: it is exported as
 * `@brikdesigns/bds/bridge.css` and is NOT concatenated into dist/tokens.css,
 * so the shadowing gate never reads it.
 *
 * ── Indirect cycles ────────────────────────────────────────────────────────
 * A → B → A is the same defect and equally invalid. The scan resolves the
 * alias graph per file and reports the cycle path, not only the self-edge.
 *
 * ── CLI ────────────────────────────────────────────────────────────────────
 *   node scripts/lint-token-self-reference.mjs [glob-or-file ...]
 *   node scripts/lint-token-self-reference.mjs --json
 *
 * Default target set: tokens/*.css
 *
 * Exit 0 = clean, 1 = cycles found, 2 = the check itself broke.
 * Exit 2 matters: a scan that parsed no declarations must never read as clean
 * (`gate-scanned-nothing-reports-clean`), so the denominator is asserted and
 * reported on every run.
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const DEFAULT_DIR = 'tokens';

/** Strip comments but keep byte offsets stable so line numbers stay true. */
function blankComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
}

/**
 * Every `--name: <value>;` declaration in the file, with the custom properties
 * its value substitutes. Declaration-level, not scope-level: a cycle is a cycle
 * regardless of which `:root` block it sits in, because the winning declaration
 * is what gets poisoned.
 */
function parseDeclarations(src) {
  const clean = blankComments(src);
  const decls = [];
  const re = /(--[A-Za-z0-9_-]+)\s*:\s*([^;{}]*);/g;
  let m;
  while ((m = re.exec(clean)) !== null) {
    const [, name, rawValue] = m;
    const value = rawValue.trim();
    const refs = [...value.matchAll(/var\(\s*(--[A-Za-z0-9_-]+)/g)].map((r) => r[1]);
    decls.push({
      name,
      value,
      refs,
      line: clean.slice(0, m.index).split('\n').length,
    });
  }
  return decls;
}

/**
 * Cycles reachable from the declarations in one file. `edges` is the last
 * declaration per name — the cascade winner within this file, which is the one
 * that decides whether the name is poisoned.
 */
function findCycles(decls) {
  const edges = new Map();
  for (const d of decls) edges.set(d.name, d);

  const findings = [];
  const seen = new Set();

  for (const start of edges.keys()) {
    if (seen.has(start)) continue;
    const pathList = [];
    const onPath = new Map();
    let cur = start;

    while (cur !== undefined && edges.has(cur) && !onPath.has(cur)) {
      onPath.set(cur, pathList.length);
      pathList.push(cur);
      // Follow only single-reference aliases. A value that substitutes two or
      // more properties is a composite, not an alias chain, and a cycle through
      // it needs the full graph walk this gate deliberately does not do — the
      // self-edge and simple chains are what shipped as bugs.
      const d = edges.get(cur);
      cur = d.refs.length === 1 ? d.refs[0] : undefined;
    }

    if (cur !== undefined && onPath.has(cur)) {
      const cycle = pathList.slice(onPath.get(cur));
      const key = [...cycle].sort().join('>');
      if (!seen.has(key)) {
        seen.add(key);
        for (const n of cycle) seen.add(n);
        const head = edges.get(cycle[0]);
        findings.push({
          token: cycle[0],
          cycle,
          direct: cycle.length === 1,
          line: head.line,
          value: head.value,
        });
      }
    }
    for (const n of pathList) seen.add(n);
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
      for (const f of findCycles(decls)) {
        findings.push({ ...f, file: path.relative(process.cwd(), target) });
      }
    }
  } catch (err) {
    console.error(`SCAN FAILED — ${err.message}`);
    process.exit(2);
  }

  // A parse that found nothing is a broken parse, not a clean tree.
  if (files === 0 || declarations === 0) {
    console.error(`SCAN FAILED — parsed ${files} file(s) / ${declarations} declaration(s).`);
    console.error('A zero denominator is a broken scan, not a clean registry.');
    process.exit(2);
  }

  if (json) {
    console.log(JSON.stringify({ files, declarations, cycles: findings.length, findings }, null, 2));
    process.exit(findings.length > 0 ? 1 : 0);
  }

  // Denominator first, always — what was scanned, not only what was found.
  console.error(`lint-token-self-reference: ${files} file(s), ${declarations} declaration(s) checked`);

  for (const f of findings) {
    const shape = f.direct ? 'self-reference' : `cycle ${f.cycle.join(' → ')} → ${f.cycle[0]}`;
    console.error(`  ✗ ${f.file}:${f.line}  ${f.token}: ${f.value}`);
    console.error(`      ${shape} — invalid at computed-value time, so the name is unset`);
  }

  if (findings.length > 0) {
    console.error('');
    console.error(`${findings.length} custom propert${findings.length === 1 ? 'y' : 'ies'} defined in terms of itself.`);
    console.error('Point each at a real primitive, or delete it if the name is already defined upstream.');
    console.error('Spec: https://www.w3.org/TR/css-variables-1/ § Resolving Dependency Cycles');
    process.exit(1);
  }

  console.error(`clean — no self-referential custom properties`);
  process.exit(0);
}

main();
