#!/usr/bin/env node
/**
 * measure-disabled-contrast.mjs — what a disabled control actually measures.
 *
 * BDS disables a control one of two ways (ADR-028):
 *
 *   token swap — repaint the control with --background-disabled / --text-disabled
 *   opacity fade — keep the enabled colours and fade the whole control
 *
 * The token swap is measurable by the normal contrast gate, because both sides
 * are named tokens: `contrast-gate` scores it from tokens/contrast-pairings.json.
 * The fade is NOT. `opacity` composites BOTH the fill and the label toward
 * whatever is behind the control, so the pairing that ships is a pair of
 * computed colours that appear in no token file. contrast-pairings.json has no
 * `alpha` field, so the gate cannot see them (#1667).
 *
 * This script supplies that measurement: it resolves the real token values out
 * of dist/tokens.css, composites fg and bg over the page backdrop at a given
 * alpha, and scores the result against the AA-large 3:1 floor that
 * contrast-pairings.json already applies to the disabled pairing.
 *
 * It assembles the light/dark cascade the same way validate-themes.js does, from
 * the same four source files, so a ratio printed here is directly comparable to
 * one `contrast-gate` prints. The four helpers below plus the six-line cascade
 * assembly (~50 lines) are a verbatim copy of validate-themes.js:52-105 rather
 * than an import: that file is CommonJS and sits on the CI gate's code path,
 * and this script gates nothing. KEEP THE TWO IN SYNC if the cascade order or
 * the source files change. dist/tokens.css is not an option — it is gitignored,
 * so it is absent in CI and in a fresh worktree.
 *
 * Usage:
 *   node scripts/measure-disabled-contrast.mjs              # default alphas
 *   node scripts/measure-disabled-contrast.mjs --alpha 0.4,0.5,0.65
 *   node scripts/measure-disabled-contrast.mjs --alpha=0.4,0.5,0.65
 *   node scripts/measure-disabled-contrast.mjs --sweep      # 0.40 → 0.80 table
 *
 * This reports, it does not gate: no ratio, however bad, changes the exit code.
 * It exits non-zero only when it cannot measure at all — bad usage (2) or a
 * token that no longer resolves to a colour (1), which means this script's CASES
 * have drifted from the token files and the numbers cannot be trusted.
 * Gating the fade needs an `alpha` field in contrast-pairings.json plus
 * compositing in validate-themes.js (ADR-028 § Consequences pt-2).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { contrastRatio, hexToRgb } from './lib/wcag.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const FIGMA_LIGHT = path.join(ROOT, 'tokens', 'figma-tokens.css');
const FIGMA_DARK = path.join(ROOT, 'tokens', 'figma-tokens-dark.css');
const GAP_FILLS = path.join(ROOT, 'tokens', 'gap-fills.css');
const BRAND_BRIK = path.join(ROOT, 'tokens', 'theme-brand-brik.css');

const AA_LARGE = 3;

// ── token resolution (mirrors validate-themes.js) ───────────────────────────
function parseDecls(body) {
  const vars = {};
  const re = /(--[\w-]+)\s*:\s*([^;]+);/g;
  let m;
  while ((m = re.exec(body)) !== null) {
    vars[m[1]] = m[2].replace(/\/\*[\s\S]*?\*\//g, '').trim();
  }
  return vars;
}

function extractBlock(cssPath, selectorRe) {
  if (!fs.existsSync(cssPath)) return {};
  const css = fs.readFileSync(cssPath, 'utf8');
  const m = new RegExp(selectorRe.source + '\\s*\\{', selectorRe.flags).exec(css);
  if (!m) return {};
  const start = m.index + m[0].length;
  const end = css.indexOf('}', start);
  return end === -1 ? {} : parseDecls(css.slice(start, end));
}

function resolveVar(value, vars, depth = 0) {
  if (depth > 12 || typeof value !== 'string') return value;
  const m = value.match(/^var\(\s*(--[\w-]+)\s*(?:,\s*([\s\S]+))?\)$/);
  if (!m) return value;
  const next = vars[m[1]];
  if (next === undefined) return m[2] ? resolveVar(m[2].trim(), vars, depth + 1) : value;
  return resolveVar(next, vars, depth + 1);
}

function resolveAll(merged) {
  const out = {};
  for (const [k, v] of Object.entries(merged)) out[k] = resolveVar(v, merged);
  return out;
}

// light = figma :root + gap-fills :root + .theme-brand-brik
// dark  = light + figma dark + gap-fills dark + dark .theme-brand-brik
const figmaLight = extractBlock(FIGMA_LIGHT, /:root/);
const gapFills = extractBlock(GAP_FILLS, /:root/);
const gapFillsDark = extractBlock(GAP_FILLS, /:root\[data-theme="dark"\]/);
const brandBrikLight = extractBlock(BRAND_BRIK, /(?:^|\})\s*\.theme-brand-brik/m);
const figmaDark = extractBlock(FIGMA_DARK, /:root\[data-theme="dark"\]/);
const brandBrikDark = extractBlock(BRAND_BRIK, /:root\[data-theme="dark"\]\s*\.theme-brand-brik/);

const LIGHT = resolveAll({ ...figmaLight, ...gapFills, ...brandBrikLight });
const DARK = resolveAll({
  ...figmaLight,
  ...gapFills,
  ...brandBrikLight,
  ...figmaDark,
  ...gapFillsDark,
  ...brandBrikDark,
});

/**
 * Resolve a token to an opaque hex colour.
 *
 * Deliberately narrower than CSS: only #rgb and #rrggbb pass. hexToRgb() in
 * scripts/lib/wcag.mjs handles those two forms only — hand it #rrggbbaa and it
 * silently returns the wrong channels (`#336699ff` → [102,153,255]). A token
 * that grows an alpha channel must fail loudly here rather than produce a
 * plausible wrong ratio.
 */
function hexOf(token, vars) {
  const raw = resolveVar(vars[token] ?? token, vars);
  if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(raw)) {
    throw new Error(
      `cannot measure ${token}: resolved to "${raw}", not an opaque #rgb/#rrggbb colour.\n` +
        `  Either the token was renamed (update CASES) or it now carries alpha ` +
        `(wcag.mjs hexToRgb cannot read #rrggbbaa).`,
    );
  }
  return raw;
}

// ── compositing ─────────────────────────────────────────────────────────────
const composite = (over, under, alpha) =>
  '#' +
  hexToRgb(over)
    .map((v, i) => Math.round(alpha * v + (1 - alpha) * hexToRgb(under)[i]))
    .map((v) => v.toString(16).padStart(2, '0'))
    .join('');

/**
 * Controls whose disabled state is the question ADR-028 answers.
 *
 * `fill: null` means the control has no background of its own, so the page
 * backdrop shows through — the fade case that survives, because only the label
 * moves toward the backdrop while the "fill" already is the backdrop.
 */
const CASES = [
  // ── fill-bearing (the three token-swap components) ──
  { group: 'fill-bearing', label: 'Button primary', fill: '--background-brand-primary', text: '--text-on-color-dark' },
  { group: 'fill-bearing', label: 'Button secondary', fill: '--background-secondary', text: '--text-primary' },
  { group: 'fill-bearing', label: 'Button destructive', fill: '--background-negative', text: '--text-on-color-dark' },
  { group: 'fill-bearing', label: 'FilterButton active', fill: '--background-brand-primary', text: '--text-on-color-dark' },
  { group: 'fill-bearing', label: 'FilterToggle active', fill: '--background-brand-primary', text: '--text-on-color-dark' },
  // ── fill-bearing, already faded (the precedent the fade route relies on) ──
  { group: 'fill-bearing (already fades)', label: 'Chip primary', fill: '--background-inverse', text: '--text-inverse' },
  { group: 'fill-bearing (already fades)', label: 'Chip secondary', fill: '--background-secondary', text: '--text-primary' },
  // The same fill with the on-color foreground its two siblings already moved
  // to. Tag.css:34-43 and SegmentedControl.css:10-13 both pair
  // `--background-secondary` with `--text-on-color-light` precisely because
  // `--text-primary` fails dark AA on it; Chip is the last holdout (#1701).
  { group: 'fill-bearing (already fades)', label: 'Chip secondary → on-color', fill: '--background-secondary', text: '--text-on-color-light' },
  { group: 'fill-bearing (already fades)', label: 'Tag solid', fill: '--background-secondary', text: '--text-on-color-light' },
  { group: 'fill-bearing (already fades)', label: 'Tag muted', fill: '--background-status-neutral', text: '--text-status-neutral' },
  // Only the ITEM carries :disabled here, never the track — so these fade
  // toward the track, not the page. An inactive item is transparent (fill-less
  // against the track); an active one paints the `--background-primary` pill.
  { group: 'fill-bearing (already fades)', label: 'SegmentedControl item, inactive', fill: null, backdrop: '--background-secondary', text: '--text-on-color-light' },
  { group: 'fill-bearing (already fades)', label: 'SegmentedControl item, active', fill: '--background-primary', backdrop: '--background-secondary', text: '--text-primary' },
  // ── fill-less (the cohort the fade suits) ──
  { group: 'fill-less', label: 'Button outline / ghost label', fill: null, text: '--text-primary' },
  { group: 'fill-less', label: 'TextInput value', fill: null, text: '--text-primary' },
  { group: 'fill-less', label: 'TextInput placeholder', fill: null, text: '--text-muted' },
  { group: 'fill-less', label: 'DatePicker day (muted swap)', fill: null, text: '--text-muted' },
  { group: 'fill-less', label: 'Select value', fill: null, text: '--text-primary' },
];

const PAGE = '--background-primary';

/**
 * `backdrop` overrides what the fade composites toward. It defaults to the page,
 * which is right for a control sitting directly on it — but a segment inside a
 * filled track fades toward the TRACK, and scoring it against the page reports
 * a failure the user never sees. Only the disabled element fades; its container
 * stays put, so the container is the backdrop.
 */
function score(c, vars, alpha) {
  const page = hexOf(c.backdrop ?? PAGE, vars);
  const fill = c.fill ? hexOf(c.fill, vars) : page;
  const text = hexOf(c.text, vars);
  return {
    enabled: contrastRatio(text, fill),
    faded: contrastRatio(composite(text, page, alpha), composite(fill, page, alpha)),
  };
}

// ── reporting ───────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);

function usage(message) {
  console.error(`measure-disabled-contrast: ${message}\n`);
  console.error('  node scripts/measure-disabled-contrast.mjs');
  console.error('  node scripts/measure-disabled-contrast.mjs --alpha 0.4,0.5,0.65');
  console.error('  node scripts/measure-disabled-contrast.mjs --sweep');
  process.exit(2);
}

function parseAlphas() {
  const i = argv.findIndex((a) => a === '--alpha' || a.startsWith('--alpha='));
  if (i === -1) return [0.4, 0.5];
  const raw = argv[i].startsWith('--alpha=') ? argv[i].slice('--alpha='.length) : argv[i + 1];
  if (!raw) usage('--alpha needs a value, e.g. --alpha 0.4,0.5');
  const values = raw.split(',').map(Number);
  if (values.some((v) => !Number.isFinite(v) || v <= 0 || v > 1)) {
    usage(`--alpha values must each be in (0, 1] — got "${raw}"`);
  }
  return values;
}

const alphas = parseAlphas();

const THEMES = [
  ['light', LIGHT],
  ['dark', DARK],
];

function mark(r) {
  return r >= AA_LARGE ? '✓' : '✗';
}

if (argv.includes('--sweep')) {
  console.log(`\nAlpha sweep — ratio at each opacity, ✓ = clears AA-large ${AA_LARGE}:1\n`);
  const steps = [0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8];
  for (const [theme, vars] of THEMES) {
    console.log(`  ── ${theme} ──`);
    console.log('  ' + 'control'.padEnd(30) + steps.map((s) => s.toFixed(2).padStart(7)).join(''));
    for (const c of CASES) {
      const cells = steps.map((s) => {
        const { faded } = score(c, vars, s);
        return `${faded.toFixed(2)}${mark(faded)}`.padStart(7);
      });
      console.log('  ' + c.label.padEnd(30) + cells.join(''));
    }
    console.log('');
  }
} else {
  for (const alpha of alphas) {
    console.log(`\n══ opacity: ${alpha} ══  (floor: AA-large ${AA_LARGE}:1, per tokens/contrast-pairings.json)\n`);
    for (const [theme, vars] of THEMES) {
      console.log(`  ── ${theme} ──`);
      let group = null;
      for (const c of CASES) {
        if (c.group !== group) {
          group = c.group;
          console.log(`    ${group}:`);
        }
        const { enabled, faded } = score(c, vars, alpha);
        console.log(
          `      ${mark(faded)} faded ${faded.toFixed(2).padStart(5)}:1` +
            `   (enabled ${enabled.toFixed(2)}:1)   ${c.label}`,
        );
      }
      console.log('');
    }
  }
  // The treatment that ships today, for comparison — both sides are tokens, so
  // this is the number `npm run contrast-gate` already reports.
  console.log('  ── token swap (what the 3 fill-bearing components do today) ──');
  for (const [theme, vars] of THEMES) {
    const r = contrastRatio(hexOf('--text-disabled', vars), hexOf('--background-disabled', vars));
    console.log(`      ${mark(r)} ${r.toFixed(2).padStart(5)}:1   ${theme}  --text-disabled on --background-disabled`);
  }
  console.log('');
}
