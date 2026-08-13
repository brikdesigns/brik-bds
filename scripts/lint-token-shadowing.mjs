#!/usr/bin/env node
/**
 * lint-token-shadowing — fail when a token is declared twice in the same scope
 * with different values, so the earlier declaration is dead.
 *
 * `dist/tokens.css` is eight source files concatenated (see
 * build-dist-tokens.js:7): figma-tokens, figma-tokens-dark, theme-brand-brik,
 * modes-*, gap-fills, ratios, fluid-type, animations. Several of them declare
 * `:root`, so the shipped file carries four `:root` blocks and two
 * `:root[data-theme="dark"]` blocks. Same selector, same specificity — the last
 * declaration wins and every earlier one is dead CSS.
 *
 * Nothing caught this because each source file is correct in isolation. The
 * shadowing exists only in the concatenation, which no per-file lint reads.
 * Eleven tokens were shadowed when this gate was written (#1808), including
 * `--text-disabled` at dist/tokens.css:500, whose dead declaration carries a
 * doc comment describing behaviour it does not produce. That is the class named
 * in brikdesigns/brik-llm#2206: an artifact that reads as in-effect and has
 * never applied — #1785 one layer up, in a font-family stack.
 *
 * Sibling gates, and why this is none of them:
 *   - canonical-check         → forbids INVENTED token names in consumers.
 *   - cascade-contract-check  → forbids CONSUMERS redefining canonical tokens.
 *   - this                    → the REGISTRY shadowing itself, before it ships.
 * #926 covers the case this cannot see: a rendered cascade where a component
 * rule beats a token rule. That needs a browser; this does not.
 *
 * ── Disposition, per the Class-5 rule (#1468) ──────────────────────────────
 *
 * A shadow is not automatically a bug — `--box-shadow-*` is deliberately
 * overridden late to replace Style Dictionary's single-blur values. So a shadow
 * is allowed only with a disposition written down, and a bare one hard-fails:
 *
 *   • an inline `bds-lint-ignore — <reason>` comment on the WINNING declaration
 *   • or an entry in SHADOW_BACKLOG (token → tracking issue number)
 *
 * An accidental shadow has neither, and fails.
 *
 * ── CLI ────────────────────────────────────────────────────────────────────
 *   node scripts/lint-token-shadowing.mjs [file.css]   default: dist/tokens.css
 *   node scripts/lint-token-shadowing.mjs --json       machine-readable summary
 *
 * Exit 0 = clean, 1 = undisposed shadows found, 2 = the check itself broke.
 * Exit 2 matters: a parse that finds no scopes must never read as clean
 * (`gate-scanned-nothing-reports-clean`), so the denominator is asserted and
 * reported on every run.
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

/**
 * token name → tracking issue number. The shadow is owed a fix; the entry keeps
 * it visible on the board instead of silently green. A bare entry (no issue)
 * hard-fails, same as no entry at all.
 */
const SHADOW_BACKLOG = {
  // Three semantic tokens whose first declaration is dead with no marker.
  // Whether the winning value is the intended one is a token-owner call, not
  // this gate's — brik-bds#1809 records the decision and removes the dead
  // declarations from their Style Dictionary sources.
  '--text-positive': 1809,
  '--text-disabled': 1809,
  '--background-disabled': 1809,
};

const IGNORE_MARKER = 'bds-lint-ignore';

/** Strip comments but keep byte offsets stable so line numbers stay true. */
function blankComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
}

function lineOf(src, index) {
  return src.slice(0, index).split('\n').length;
}

/**
 * Top-level `selector { ... }` blocks. Nested at-rules (@media, @keyframes)
 * are skipped deliberately: a declaration inside @media is conditional, so it
 * does not shadow an unconditional one at the same selector.
 */
function topLevelBlocks(src) {
  const blocks = [];
  // The leading class must exclude braces too. With `[^\s@/]` a file whose last
  // line is `}` with no trailing newline keys the next block as `}:root`, a
  // phantom scope distinct from `:root` — so a shadow appended there is invisible.
  // Caught by the sabotage step, not by reading the regex (brik-bds#1808).
  const re = /(?:^|\n)([^\s@/{}][^{}]*?)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    blocks.push({
      selector: m[1].trim().replace(/\s+/g, ' '),
      body: m[2],
      bodyStart: m.index + m[0].indexOf('{') + 1,
    });
  }
  return blocks;
}

function collect(cssPath) {
  const raw = fs.readFileSync(cssPath, 'utf8');
  const clean = blankComments(raw);
  const byScope = new Map();
  let declarations = 0;

  for (const block of topLevelBlocks(clean)) {
    if (!byScope.has(block.selector)) byScope.set(block.selector, new Map());
    const scope = byScope.get(block.selector);
    const declRe = /(--[A-Za-z0-9_-]+)\s*:\s*([^;]+);/g;
    let d;
    while ((d = declRe.exec(block.body)) !== null) {
      declarations += 1;
      const abs = block.bodyStart + d.index;
      const line = lineOf(clean, abs);
      // The marker is read off the RAW source: blankComments erased it.
      const rawLine = raw.split('\n')[line - 1] ?? '';
      if (!scope.has(d[1])) scope.set(d[1], []);
      scope.get(d[1]).push({
        value: d[2].trim().replace(/\s+/g, ' '),
        line,
        ignored: rawLine.includes(IGNORE_MARKER),
      });
    }
  }
  return { byScope, declarations, raw };
}

function analyse(cssPath) {
  const { byScope, declarations } = collect(cssPath);
  const findings = [];

  for (const [selector, tokens] of byScope) {
    for (const [token, decls] of tokens) {
      if (decls.length < 2) continue;
      // Same value repeated is harmless duplication, not a dead declaration.
      if (new Set(decls.map((d) => d.value)).size < 2) continue;

      const winner = decls[decls.length - 1];
      const dead = decls.slice(0, -1);
      const backlogged = Object.prototype.hasOwnProperty.call(SHADOW_BACKLOG, token)
        && Number.isInteger(SHADOW_BACKLOG[token]);

      findings.push({
        selector,
        token,
        dead: dead.map((d) => ({ value: d.value, line: d.line })),
        winner: { value: winner.value, line: winner.line },
        disposition: winner.ignored ? 'bds-lint-ignore' : backlogged ? `#${SHADOW_BACKLOG[token]}` : null,
      });
    }
  }
  return { findings, declarations, scopes: byScope.size };
}

function main() {
  const args = process.argv.slice(2);
  const json = args.includes('--json');
  const target = args.find((a) => !a.startsWith('--'))
    ?? path.join(process.cwd(), 'dist', 'tokens.css');

  if (!fs.existsSync(target)) {
    console.error(`SCAN FAILED — ${target} does not exist. Run \`npm run build:dist-tokens\` first.`);
    process.exit(2);
  }

  let result;
  try {
    result = analyse(target);
  } catch (err) {
    console.error(`SCAN FAILED — ${err.message}`);
    process.exit(2);
  }

  const { findings, declarations, scopes } = result;

  // A parse that found nothing is a broken parse, not a clean file. tokens.css
  // has ~1000 declarations across ~13 scopes; zero can only mean the block
  // regex stopped matching.
  if (scopes === 0 || declarations === 0) {
    console.error(`SCAN FAILED — parsed ${scopes} scope(s) / ${declarations} declaration(s) from ${target}.`);
    console.error('A zero denominator is a broken scan, not a clean registry.');
    process.exit(2);
  }

  const undisposed = findings.filter((f) => f.disposition === null);

  if (json) {
    console.log(JSON.stringify({
      file: path.relative(process.cwd(), target),
      scopes,
      declarations,
      shadowed: findings.length,
      undisposed: undisposed.length,
      findings,
    }, null, 2));
    process.exit(undisposed.length > 0 ? 1 : 0);
  }

  // Denominator first, always — what was scanned, not only what was found.
  console.error(`lint-token-shadowing: ${scopes} scope(s), ${declarations} declaration(s) checked in ${path.relative(process.cwd(), target)}`);

  for (const f of findings) {
    const tag = f.disposition ? `disposed (${f.disposition})` : 'UNDISPOSED';
    const head = f.disposition ? '  ·' : '  ✗';
    console.error(`${head} ${f.selector} { ${f.token} } — ${tag}`);
    for (const d of f.dead) {
      console.error(`      dead   line ${d.line}: ${d.value}`);
    }
    console.error(`      wins   line ${f.winner.line}: ${f.winner.value}`);
  }

  if (undisposed.length > 0) {
    console.error('');
    console.error(`${undisposed.length} shadowed token(s) with no disposition.`);
    console.error('Add `bds-lint-ignore — <reason>` to the winning declaration if the override is');
    console.error('deliberate, or an entry in SHADOW_BACKLOG (token → issue number) if it is owed a fix.');
    process.exit(1);
  }

  console.error(`clean — ${findings.length} shadowed token(s), all disposed.`);
  process.exit(0);
}

main();
