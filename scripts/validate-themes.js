#!/usr/bin/env node

/**
 * BDS Theme Compliance Validator
 *
 * Static CSS parser that validates all 9 themes for:
 *   1. Token resolution — every semantic color token resolves to a value
 *   2. WCAG AA contrast — critical text/background pairs meet 4.5:1
 *   3. Font family assignments — heading/body/label are set per theme
 *
 * Usage:
 *   node scripts/validate-themes.js         # human-readable report
 *   node scripts/validate-themes.js --json  # machine-readable JSON
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const FIGMA_CSS = path.join(ROOT, 'tokens', 'figma-tokens.css');
const THEMES_CSS = path.join(ROOT, 'tokens', 'website-themes.css');
const GAP_FILLS = path.join(ROOT, 'tokens', 'gap-fills.css');

const jsonMode = process.argv.includes('--json');

// ─── WCAG Contrast Helpers ──────────────────────────────────────────

function hexToRgb(hex) {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const n = parseInt(hex, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function srgbToLinear(c) {
  c = c / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function luminance([r, g, b]) {
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

function contrastRatio(hex1, hex2) {
  const l1 = luminance(hexToRgb(hex1));
  const l2 = luminance(hexToRgb(hex2));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// ─── CSS Parsing ────────────────────────────────────────────────────

function parseVarsFromBlock(css) {
  const vars = {};
  const re = /^\s*(--[\w-]+)\s*:\s*(.+?)\s*;/gm;
  let m;
  while ((m = re.exec(css)) !== null) {
    vars[m[1]] = m[2].replace(/\/\*.*?\*\//g, '').trim();
  }
  return vars;
}

function parseCssBlocks(cssPath) {
  if (!fs.existsSync(cssPath)) return {};
  const css = fs.readFileSync(cssPath, 'utf8');

  const blocks = {};

  // Parse :root block
  const rootMatch = css.match(/:root\s*\{([^}]+)\}/s);
  if (rootMatch) {
    blocks[':root'] = parseVarsFromBlock(rootMatch[1]);
  }

  // Parse .body.theme-N blocks
  const themeRe = /\.body\.theme-([\w-]+)\s*\{([^}]+)\}/gs;
  let m;
  while ((m = themeRe.exec(css)) !== null) {
    blocks[`theme-${m[1]}`] = parseVarsFromBlock(m[2]);
  }

  return blocks;
}

function resolveVar(value, vars, depth = 0) {
  if (depth > 10) return value;
  const m = value.match(/^var\((--[\w-]+)(?:\s*,\s*(.+))?\)$/);
  if (!m) return value;
  const resolved = vars[m[1]];
  if (!resolved) return m[2] ? resolveVar(m[2], vars, depth + 1) : value;
  return resolveVar(resolved, vars, depth + 1);
}

// ─── Theme Building ─────────────────────────────────────────────────

function buildThemeVars(rootVars, themeOverrides) {
  const merged = { ...rootVars, ...themeOverrides };
  // Resolve all var() references
  const resolved = {};
  for (const [key, val] of Object.entries(merged)) {
    resolved[key] = resolveVar(val, merged);
  }
  return resolved;
}

// ─── Validation ─────────────────────────────────────────────────────

const CONTRAST_PAIRS = [
  { text: '--text-primary', bg: '--page-primary', label: 'Body text on page' },
  { text: '--text-primary', bg: '--surface-primary', label: 'Body text on surface' },
  { text: '--text-secondary', bg: '--page-primary', label: 'Secondary text on page' },
  { text: '--text-inverse', bg: '--surface-brand-primary', label: 'Inverse text on brand' },
  { text: '--text-primary', bg: '--background-primary', label: 'Body text on background' },
];

const FONT_TOKENS = ['--font-family-heading', '--font-family-body', '--font-family-label'];

const SEMANTIC_COLORS = [
  '--text-primary', '--text-secondary', '--text-muted', '--text-inverse', '--text-brand-primary',
  '--background-primary', '--background-secondary', '--surface-primary', '--surface-secondary',
  '--surface-brand-primary', '--border-primary', '--border-muted', '--page-primary',
];

function isHex(value) {
  return /^#[0-9a-fA-F]{3,8}$/.test(value);
}

function validateTheme(name, vars) {
  const issues = [];

  // 1. Token resolution — check semantic colors resolve to actual values
  const unresolved = [];
  for (const token of SEMANTIC_COLORS) {
    const val = vars[token];
    if (!val || val.startsWith('var(')) {
      unresolved.push(token);
    }
  }
  if (unresolved.length > 0) {
    issues.push({ type: 'unresolved', tokens: unresolved });
  }

  // 2. Contrast checks
  const contrastIssues = [];
  for (const pair of CONTRAST_PAIRS) {
    const textVal = vars[pair.text];
    const bgVal = vars[pair.bg];
    if (!textVal || !bgVal || !isHex(textVal) || !isHex(bgVal)) continue;
    const ratio = contrastRatio(textVal, bgVal);
    if (ratio < 4.5) {
      contrastIssues.push({ ...pair, ratio: Math.round(ratio * 100) / 100, pass: false });
    } else {
      contrastIssues.push({ ...pair, ratio: Math.round(ratio * 100) / 100, pass: true });
    }
  }
  if (contrastIssues.some(c => !c.pass)) {
    issues.push({ type: 'contrast', pairs: contrastIssues });
  }

  // 3. Font family assignments
  const fonts = {};
  for (const token of FONT_TOKENS) {
    fonts[token] = vars[token] || 'unset';
  }
  issues.push({ type: 'fonts', fonts });

  return { name, issues, contrastPairs: contrastIssues, fonts };
}

// ─── Main ───────────────────────────────────────────────────────────

const figmaBlocks = parseCssBlocks(FIGMA_CSS);
const themeBlocks = parseCssBlocks(THEMES_CSS);
const gapBlocks = parseCssBlocks(GAP_FILLS);

const rootVars = { ...(figmaBlocks[':root'] || {}), ...(gapBlocks[':root'] || {}), ...(themeBlocks[':root'] || {}) };

// Determine theme names from CSS
const themeNames = Object.keys(themeBlocks).filter(k => k.startsWith('theme-'));
if (!themeNames.includes('theme-brik')) themeNames.unshift('theme-brik');

const results = [];

for (const themeName of themeNames) {
  const overrides = themeBlocks[themeName] || {};
  const vars = buildThemeVars(rootVars, overrides);
  results.push(validateTheme(themeName, vars));
}

// Also validate base (no theme = :root only)
const baseVars = buildThemeVars(rootVars, {});
results.unshift(validateTheme('base (no theme)', baseVars));

if (jsonMode) {
  console.log(JSON.stringify({ themes: results }, null, 2));
} else {
  console.log('\n🎨 BDS Theme Compliance Report\n');
  for (const theme of results) {
    const hasFailures = theme.issues.some(i =>
      i.type === 'unresolved' || (i.type === 'contrast' && i.pairs.some(p => !p.pass))
    );
    const icon = hasFailures ? '⚠️' : '✅';
    console.log(`${icon} ${theme.name}`);

    for (const issue of theme.issues) {
      if (issue.type === 'unresolved') {
        console.log(`   Unresolved tokens: ${issue.tokens.join(', ')}`);
      }
      if (issue.type === 'contrast') {
        for (const pair of issue.pairs) {
          const status = pair.pass ? '  ✓' : '  ✗';
          console.log(`  ${status} ${pair.label}: ${pair.ratio}:1${pair.pass ? '' : ' (FAIL < 4.5:1)'}`);
        }
      }
      if (issue.type === 'fonts') {
        const distinct = new Set(Object.values(issue.fonts)).size;
        if (distinct === 1 && Object.values(issue.fonts)[0] !== 'unset') {
          console.log(`   Fonts: all same (${Object.values(issue.fonts)[0]})`);
        } else {
          for (const [token, val] of Object.entries(issue.fonts)) {
            console.log(`   ${token}: ${val}`);
          }
        }
      }
    }
    console.log('');
  }
}
