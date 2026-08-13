#!/usr/bin/env node

/**
 * Theme Divergence Check — every Brand Kit override of a generated token must
 * say why.
 *
 * `tokens/theme-brand-brik.css` re-declares tokens that Style Dictionary already
 * emits into `tokens/figma-tokens.css` (light) and `tokens/figma-tokens-dark.css`
 * (dark). Some of those overrides are deliberate brand decisions; some are
 * typos. Nothing distinguished them, so an inverted value survived four months:
 * `--background-inverse` was pinned to the same primitive as `--text-inverse`,
 * rendering `Chip --primary` and `Button --inverse` at 1.00:1 while ENABLED
 * (brik-bds#1686, shipped in #50 on 2026-04-08).
 *
 * The file's own convention is the fix: a deliberate correction carries a CSS
 * comment above it explaining the why. This gate makes that convention
 * enforceable — an override with no comment fails.
 *
 * It deliberately does NOT require the override to match the generated value.
 * Several divergences are correct (the Brik dark theme is true black, so
 * `-black` where the generator says `-darkest`; brand fills hold poppy per
 * BDS-22). The check is "is this legible as intentional", not "is this equal".
 *
 * Attribution is strict on purpose: a comment explains the declaration
 * IMMEDIATELY beneath it, or any declaration whose token name it mentions. A
 * grouping label such as a bare "Background" heading therefore explains nothing
 * beyond its first token, and one block can still cover a state family by naming
 * its members.
 *
 * Usage:
 *   node scripts/lint-theme-divergence.mjs           # gate; exit 1 on an unexplained override
 *   node scripts/lint-theme-divergence.mjs --report  # full table, always exit 0
 *
 * brik-bds#1689.
 */

import { readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** `--flag value` override, so the suite can point the gate at fixtures. */
function argValue(flag) {
  const i = process.argv.indexOf(flag);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : null;
}

const BRAND = argValue('--brand') ?? join(ROOT, 'tokens', 'theme-brand-brik.css');
const GEN_LIGHT = argValue('--gen-light') ?? join(ROOT, 'tokens', 'figma-tokens.css');
const GEN_DARK = argValue('--gen-dark') ?? join(ROOT, 'tokens', 'figma-tokens-dark.css');

const reportMode = process.argv.includes('--report');
const jsonMode = process.argv.includes('--json');

const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const GREEN = '\x1b[32m';
const DIM = '\x1b[2m';
const NC = '\x1b[0m';

/**
 * Declarations inside the first block whose selector matches `selectorRe`,
 * carrying the 1-based line and whether a CSS comment introduces the run this
 * declaration belongs to.
 */
function parseBlock(cssPath, selectorRe) {
  const css = readFileSync(cssPath, 'utf8');
  const m = selectorRe.exec(css);
  if (!m) throw new Error(`No block matching ${selectorRe} in ${cssPath}`);
  const open = css.indexOf('{', m.index);
  const close = css.indexOf('}', open);
  if (open === -1 || close === -1) throw new Error(`Unterminated block in ${cssPath}`);
  const body = css.slice(open + 1, close);
  const baseLine = css.slice(0, open + 1).split('\n').length;

  const out = new Map();
  const comments = [];
  // Walk comments and declarations in source order. A comment is consumed by the
  // FIRST declaration after it and does not carry to the rest of the run.
  //
  // The looser "until the next comment" rule reads the file's grouping labels as
  // explanations: `/* Background — vibrant poppy-light base per brand canon
  // (BDS-22) */` introduces the brand fills, but the run beneath it also holds
  // --background-primary and --background-secondary, which it says nothing
  // about. That is how a lenient version of this gate passed --background-secondary
  // (the #1686-shaped value this issue exists to resolve) as explained.
  const token = /\/\*([\s\S]*?)\*\/|(--[\w-]+)\s*:\s*([^;]+);/g;
  let adjacent = null;
  let hit;
  while ((hit = token.exec(body))) {
    if (hit[2] === undefined) {
      const text = hit[1].trim();
      if (isExplanatory(text)) {
        comments.push(text);
        adjacent = text;
      } else {
        // A grouping label ("Surface", "Border") is not a reason, but it DOES
        // end the previous comment's reach — otherwise the label's own first
        // token inherits an explanation written about something above it.
        adjacent = null;
      }
      continue;
    }
    out.set(hit[2], {
      value: hit[3].trim(),
      line: baseLine + body.slice(0, hit.index).split('\n').length - 1,
      adjacent,
    });
    adjacent = null; // consumed
  }
  // A comment that NAMES the token explains it wherever it sits, which is what
  // lets one block cover a state family without repeating itself.
  for (const [name, decl] of out) {
    const named = comments.find((c) => c.includes(name));
    decl.explanation = named ?? decl.adjacent ?? null;
  }
  return out;
}

/**
 * A grouping label is not an explanation. The file organises declarations under
 * bare "Page" / "Text" / "Surface" / "Border" headings; counting those would mark
 * the first token of every group explained, and the gate would pass the #1686
 * shape it exists to catch.
 *
 * Substantive means: cites a tracking reference, or is long enough to carry a
 * reason. The real explanations in this file do both — the shortest cites #980
 * and runs 195 chars; the longest grouping label is 10.
 */
const EXPLANATION_MIN_CHARS = 40;
function isExplanatory(text) {
  if (/#\d+|BDS-\d+/.test(text)) return true;
  return text.length >= EXPLANATION_MIN_CHARS;
}

/**
 * `--color-*: #hex` primitives, for normalising an alias against a literal.
 *
 * Values are followed through primitive-to-primitive indirection, because the
 * 6-step names are themselves aliases onto the numeric scale since #1739
 * (`--color-grayscale-lightest: var(--color-grayscale-100)`). Storing the raw
 * declaration would leave the legacy name resolving to the string
 * `var(--color-grayscale-100)` while the numeric name resolves to `#f2f2f2`, so
 * a #1740 rename that changes nothing about the colour would read as 25
 * divergences needing explanation. Resolving both to the hex keeps this gate
 * measuring value, which is what its normalise() contract promises.
 */
function primitives() {
  const css = readFileSync(GEN_LIGHT, 'utf8');
  const raw = new Map();
  for (const m of css.matchAll(/(--color-[\w-]+)\s*:\s*([^;]+);/g)) {
    raw.set(m[1], m[2].trim().toLowerCase());
  }
  const out = new Map();
  for (const name of raw.keys()) {
    let value = raw.get(name);
    // Bounded: a cyclic alias would otherwise spin here.
    for (let hops = 0; hops < 10; hops++) {
      const alias = /^var\(\s*(--[\w-]+)\s*\)$/.exec(value);
      if (!alias || !raw.has(alias[1])) break;
      value = raw.get(alias[1]);
    }
    out.set(name, value);
  }
  return out;
}

const PRIMS = primitives();

const CSS_NAMED = new Map([
  ['white', '#ffffff'],
  ['black', '#000000'],
  ['transparent', 'transparent'],
]);

/**
 * Compare by resolved colour where possible, so `white` and
 * `var(--color-grayscale-white)` are not reported as a divergence — that is a
 * notation difference with nothing to explain.
 */
function normalise(value) {
  const v = value.trim().toLowerCase();
  const varMatch = /^var\(\s*(--[\w-]+)\s*\)$/.exec(v);
  if (varMatch && PRIMS.has(varMatch[1])) return PRIMS.get(varMatch[1]);
  if (CSS_NAMED.has(v)) return CSS_NAMED.get(v);
  if (/^#[0-9a-f]{6}$/.test(v)) return v;
  return v;
}

function audit(mode, genPath, genRe, brandRe) {
  const gen = parseBlock(genPath, genRe);
  const brand = parseBlock(BRAND, brandRe);

  const rows = [];
  for (const [name, b] of brand) {
    const g = gen.get(name);
    if (!g) continue; // brand-only token: nothing generated to diverge from
    if (normalise(g.value) === normalise(b.value)) continue;
    rows.push({ mode, name, generated: g.value, brand: b.value, line: b.line, explanation: b.explanation });
  }
  rows.sort((a, b) => a.line - b.line);
  return rows;
}

const rows = [
  ...audit('light', GEN_LIGHT, /^:root\s*\{/m, /^\.theme-brand-brik\s*\{/m),
  ...audit('dark', GEN_DARK, /^:root\[data-theme="dark"\]\s*\{/m, /^:root\[data-theme="dark"\]\s+\.theme-brand-brik\s*\{/m),
];

const rel = relative(ROOT, BRAND);
const unexplained = rows.filter((r) => !r.explanation);

if (jsonMode) {
  console.log(
    JSON.stringify(
      {
        total: rows.length,
        unexplained: unexplained.map(({ mode, name, generated, brand, line }) => ({
          mode,
          name,
          generated,
          brand,
          line,
        })),
        rows: rows.map((r) => ({ ...r, explained: Boolean(r.explanation) })),
      },
      null,
      2,
    ),
  );
  process.exit(unexplained.length > 0 ? 1 : 0);
}

if (reportMode) {
  console.log('\n🎨 Brand Kit divergences from the generated tokens\n');
  for (const mode of ['light', 'dark']) {
    const group = rows.filter((r) => r.mode === mode);
    console.log(`  ── ${mode} ── ${DIM}${group.length} divergence(s)${NC}`);
    for (const r of group) {
      const icon = r.explanation ? `${GREEN}✓${NC}` : `${RED}✗${NC}`;
      console.log(`   ${icon} ${rel}:${r.line}  ${r.name}`);
      console.log(`       ${DIM}generated:${NC} ${r.generated}`);
      console.log(`       ${DIM}brand:    ${NC} ${r.brand}`);
    }
    console.log('');
  }
}

if (unexplained.length === 0) {
  console.log(
    `${GREEN}✓${NC} lint-theme-divergence: ${rows.length} divergence(s), all explained by a comment.`,
  );
  process.exit(0);
}

console.log(`\n${RED}✗ lint-theme-divergence: ${unexplained.length} unexplained override(s)${NC}\n`);
for (const r of unexplained) {
  console.log(`  ${rel}:${r.line}  ${RED}${r.name}${NC}  [${r.mode}]`);
  console.log(`      generated: ${r.generated}`);
  console.log(`      brand:     ${r.brand}`);
}
console.log(
  `\n${YELLOW}  An override with no comment is indistinguishable from a typo. That is how${NC}\n` +
    `${YELLOW}  --background-inverse shipped inverted and rendered two components at 1.00:1${NC}\n` +
    `${YELLOW}  for four months (#1686).${NC}\n\n` +
    '  Fix: either revert to the generated value, or add a comment above the\n' +
    '  declaration saying why it diverges. One comment covers the contiguous run\n' +
    '  of declarations beneath it.\n',
);
process.exit(1);
