#!/usr/bin/env node

/**
 * BDS Contrast Pairing Gate
 *
 * Static CSS validator for the canonical accessible color-pairing set
 * (tokens/contrast-pairings.json). Resolves every pairing's foreground +
 * background token in the Brik LIGHT and DARK default themes and checks it
 * against its WCAG threshold (AAA 7:1 / AA 4.5:1 / AA-large 3:1).
 *
 *   - A real sub-threshold pairing FAILS the gate (exit 1).
 *   - A pairing flagged `darkException` whose DARK result is sub-threshold is
 *     REPORTED as a known, tracked exception (the systemic dark-mode service
 *     gap, brik-bds#823) and does NOT fail the gate.
 *   - A pairing flagged `appliesTo: ["light"|"dark"]` is evaluated ONLY in the
 *     listed theme(s); in any other theme it is marked n/a (mode-scoped). Use
 *     this for components that swap fg AND bg by theme (e.g. the inverse-surface
 *     hero card, brik-bds#1017), where the off-theme token combination never
 *     paints and scoring it would be meaningless.
 *
 * Source of truth: tokens/contrast-pairings.json (also feeds the Storybook
 * ContrastCompliance dashboard and the primitives/color-pairings.mdx matrix).
 *
 * Usage:
 *   node scripts/validate-themes.js               # human-readable report, exit 1 on failure
 *   node scripts/validate-themes.js --json        # machine-readable JSON
 *   node scripts/validate-themes.js --emit-matrix # Markdown matrix for the foundation doc
 *   node scripts/validate-themes.js --check-matrix # fail if color-pairings.mdx matrix drifted from the generator
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const FIGMA_LIGHT = path.join(ROOT, 'tokens', 'figma-tokens.css');
const FIGMA_DARK = path.join(ROOT, 'tokens', 'figma-tokens-dark.css');
const GAP_FILLS = path.join(ROOT, 'tokens', 'gap-fills.css');
const BRAND_BRIK = path.join(ROOT, 'tokens', 'theme-brand-brik.css');

const DATASET = require(path.join(ROOT, 'tokens', 'contrast-pairings.json'));

const jsonMode = process.argv.includes('--json');
const matrixMode = process.argv.includes('--emit-matrix');
const checkMatrixMode = process.argv.includes('--check-matrix');

const PAIRINGS_MDX = path.join(ROOT, 'docs-site', 'content', 'docs', 'primitives', 'color-pairings.mdx');
const MATRIX_START = '{/* matrix:start';
const MATRIX_END = '{/* matrix:end */}';

// ─── CSS parsing ────────────────────────────────────────────────────

function parseDecls(blockBody) {
  const vars = {};
  const re = /(--[\w-]+)\s*:\s*([^;]+);/g;
  let m;
  while ((m = re.exec(blockBody)) !== null) {
    vars[m[1]] = m[2].replace(/\/\*[\s\S]*?\*\//g, '').trim();
  }
  return vars;
}

/** Extract the flat declaration body of the first rule whose selector matches
 *  `selectorRe` (a RegExp matching the selector text immediately before `{`). */
function extractBlock(cssPath, selectorRe) {
  if (!fs.existsSync(cssPath)) return {};
  const css = fs.readFileSync(cssPath, 'utf8');
  const src = new RegExp(selectorRe.source + '\\s*\\{', selectorRe.flags);
  const m = src.exec(css);
  if (!m) return {};
  const start = m.index + m[0].length;
  const end = css.indexOf('}', start);
  if (end === -1) return {};
  return parseDecls(css.slice(start, end));
}

function resolveVar(value, vars, depth = 0) {
  if (depth > 12 || typeof value !== 'string') return value;
  const m = value.match(/^var\(\s*(--[\w-]+)\s*(?:,\s*([\s\S]+))?\)$/);
  if (!m) return value;
  const resolved = vars[m[1]];
  if (resolved === undefined) return m[2] ? resolveVar(m[2].trim(), vars, depth + 1) : value;
  return resolveVar(resolved, vars, depth + 1);
}

function resolveAll(merged) {
  const out = {};
  for (const [k, v] of Object.entries(merged)) out[k] = resolveVar(v, merged);
  return out;
}

// ─── Theme assembly (the real Brik default cascade) ─────────────────
// light = figma :root + gap-fills :root + .theme-brand-brik
// dark  = light + figma dark :root[data-theme=dark] + gap-fills dark + dark .theme-brand-brik
//   gap-fills dark sits after figma dark (equal specificity, loaded later in the
//   import cascade) and before brandBrikDark (which pins at higher specificity).

const figmaLight = extractBlock(FIGMA_LIGHT, /:root/);
const gapFills = extractBlock(GAP_FILLS, /:root/);
const gapFillsDark = extractBlock(GAP_FILLS, /:root\[data-theme="dark"\]/);
const brandBrikLight = extractBlock(BRAND_BRIK, /(?:^|\})\s*\.theme-brand-brik/m);
const figmaDark = extractBlock(FIGMA_DARK, /:root\[data-theme="dark"\]/);
const brandBrikDark = extractBlock(BRAND_BRIK, /:root\[data-theme="dark"\]\s*\.theme-brand-brik/);

const lightVars = resolveAll({ ...figmaLight, ...gapFills, ...brandBrikLight });
const darkVars = resolveAll({ ...figmaLight, ...gapFills, ...brandBrikLight, ...figmaDark, ...gapFillsDark, ...brandBrikDark });

const THEMES = [
  { key: 'light', label: 'Brik · Light', vars: lightVars },
  { key: 'dark', label: 'Brik · Dark', vars: darkVars },
];

// ─── Evaluation ─────────────────────────────────────────────────────

async function main() {
  const { contrastRatio, isHex } = await import('./lib/wcag.mjs');
  const { thresholds } = DATASET;

  const round = (n) => Math.round(n * 100) / 100;

  const results = []; // { pairing, theme, ratio, threshold, thresholdType, status }
  let hardFailures = 0;
  let exceptions = 0;

  let aaaWarnings = 0;

  for (const pairing of DATASET.pairings) {
    const target = thresholds[pairing.thresholdType];
    // Hard floor = WCAG AA conformance: 3:1 for large/muted, 4.5:1 otherwise.
    // AAA (7:1) is an aspiration for body text, not a blocking gate.
    const floor = pairing.thresholdType === 'AA-large' ? thresholds['AA-large'] : thresholds['AA'];
    for (const theme of THEMES) {
      const fgVal = theme.vars[pairing.fg];
      const bgVal = theme.vars[pairing.bg];
      let status, ratio = null;

      if (pairing.appliesTo && !pairing.appliesTo.includes(theme.key)) {
        // Pairing is mode-scoped: it only renders in the listed theme(s). The
        // CSS swaps fg (or bg) by theme, so evaluating it in the off-theme
        // would score a combination that never paints. Skip — not a failure.
        status = 'na';
      } else if (!fgVal || !bgVal || !isHex(fgVal) || !isHex(bgVal)) {
        status = 'unresolved';
      } else {
        ratio = round(contrastRatio(fgVal, bgVal));
        if (ratio >= target) {
          status = 'pass';
        } else if (ratio >= floor) {
          // Clears the AA floor but misses the AAA aspiration → warn, don't block.
          status = 'warn';
          aaaWarnings++;
        } else if (theme.key === 'dark' && pairing.darkException) {
          // Genuine sub-AA in dark on a known-fragile service pairing (brik-bds#823).
          status = 'exception';
          exceptions++;
        } else {
          status = 'fail';
          hardFailures++;
        }
      }
      results.push({
        label: pairing.label,
        group: pairing.group,
        fg: pairing.fg,
        bg: pairing.bg,
        theme: theme.key,
        themeLabel: theme.label,
        thresholdType: pairing.thresholdType,
        threshold: target,
        ratio,
        status,
        exception: pairing.darkException || null,
      });
    }
  }

  if (jsonMode) {
    console.log(JSON.stringify({ themes: THEMES.map((t) => t.key), results, hardFailures, exceptions, aaaWarnings }, null, 2));
  } else if (matrixMode) {
    emitMatrix(results);
  } else if (checkMatrixMode) {
    checkMatrix(results); // exits 0 (in sync) / 1 (drift or markers missing)
  } else {
    report(results, hardFailures, exceptions, aaaWarnings);
  }

  // Unresolved canonical tokens are a real problem (drift / typo) → fail.
  const unresolved = results.filter((r) => r.status === 'unresolved').length;
  process.exit(hardFailures > 0 || unresolved > 0 ? 1 : 0);
}

// ─── Output ─────────────────────────────────────────────────────────

const ICON = { pass: '✓', warn: '·', fail: '✗', exception: '⚠', unresolved: '?' };

function report(results, hardFailures, exceptions, aaaWarnings) {
  console.log('\n🎨 BDS Contrast Pairing Gate\n');
  let lastGroup = null;
  for (const r of results) {
    if (r.theme !== 'light') continue; // group rows by pairing; print both themes on one line
    const dark = results.find((x) => x.label === r.label && x.theme === 'dark');
    if (r.group !== lastGroup) {
      console.log(`\n  ── ${r.group.toUpperCase()} ──`);
      lastGroup = r.group;
    }
    const note = (x) =>
      x.status === 'warn' ? ' (below AAA aim)' : x.status === 'exception' ? ` (exception #${x.exception.issue})` : '';
    const fmt = (x) =>
      x.status === 'unresolved' ? 'n/a' : x.status === 'na' ? 'n/a (mode-scoped)' : `${ICON[x.status]} ${x.ratio}:1${note(x)}`;
    console.log(`  ${r.label}  [target ${r.thresholdType} ≥${r.threshold}]`);
    console.log(`      light ${fmt(r)}    dark ${fmt(dark)}`);
  }
  console.log('\n  ─────────────────────────────');
  console.log(`  ${hardFailures === 0 ? '✅ PASS (WCAG AA floor)' : `❌ FAIL — ${hardFailures} pairing(s) below the AA floor`}`);
  if (aaaWarnings > 0) console.log(`  ·  ${aaaWarnings} pairing(s) clear AA but miss the AAA body aim (non-blocking)`);
  if (exceptions > 0) console.log(`  ⚠  ${exceptions} dark-mode service pairing(s) below AA — tracked exception (brik-bds#823)`);
  console.log('');
}

// Build the matrix as an array of Markdown table lines (header + separator + one
// row per pairing). Shared by --emit-matrix (prints) and --check-matrix (compares).
function buildMatrixLines(results) {
  const verdict = (r) => {
    if (r.status === 'unresolved') return 'n/a';
    if (r.status === 'na') return '—';
    if (r.status === 'exception') return `${r.ratio}:1 ⚠ (#${r.exception.issue})`;
    const tier = r.ratio >= 7 ? 'AAA' : r.ratio >= 4.5 ? 'AA' : r.ratio >= 3 ? 'AA-lg' : 'FAIL';
    return `${r.ratio}:1 ${tier}`;
  };
  const lines = ['| Pairing | Target | Light | Dark |', '|---|---|---|---|'];
  for (const r of results) {
    if (r.theme !== 'light') continue;
    const dark = results.find((x) => x.label === r.label && x.theme === 'dark');
    lines.push(`| ${r.label} | ${r.thresholdType} ≥${r.threshold} | ${verdict(r)} | ${verdict(dark)} |`);
  }
  return lines;
}

function emitMatrix(results) {
  console.log('<!-- Generated by `node scripts/validate-themes.js --emit-matrix` — do not hand-edit. -->');
  console.log(buildMatrixLines(results).join('\n'));
}

// --check-matrix: the published matrix in color-pairings.mdx must match the
// generator exactly (measured ratios included), so it can't silently drift as
// token values change. Compares the pipe-table lines inside the matrix markers.
function checkMatrix(results) {
  const rel = path.relative(ROOT, PAIRINGS_MDX);
  let src;
  try {
    src = fs.readFileSync(PAIRINGS_MDX, 'utf8');
  } catch {
    console.error(`✗ cannot read ${rel}`);
    process.exit(1);
  }
  const si = src.indexOf(MATRIX_START);
  const ei = src.indexOf(MATRIX_END);
  if (si === -1 || ei === -1 || ei < si) {
    console.error(`✗ matrix markers not found in ${rel} — expected \`${MATRIX_START} … \` … \`${MATRIX_END}\``);
    process.exit(1);
  }
  const tableLines = (s) => s.split('\n').map((l) => l.trim()).filter((l) => l.startsWith('|'));
  const committed = tableLines(src.slice(si, ei));
  const expected = buildMatrixLines(results).map((l) => l.trim());
  const n = Math.max(committed.length, expected.length);
  let firstDiff = -1;
  for (let i = 0; i < n; i++) {
    if (committed[i] !== expected[i]) { firstDiff = i; break; }
  }
  if (firstDiff !== -1) {
    console.error(`✗ ${rel} matrix is out of sync with the generator (committed ${committed.length} rows, generator ${expected.length}).`);
    console.error(`  first diff @row ${firstDiff}:\n    committed: ${committed[firstDiff] ?? '(missing)'}\n    generator: ${expected[firstDiff] ?? '(missing)'}`);
    console.error('  Fix: node scripts/validate-themes.js --emit-matrix  → replace the table between the matrix markers.');
    process.exit(1);
  }
  console.log(`✓ ${rel} matrix matches the generator (${expected.length - 2} pairings).`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
