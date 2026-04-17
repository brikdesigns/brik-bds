#!/usr/bin/env node

/**
 * BDS 4-Point Grid Audit
 *
 * Reads the Style Dictionary CSS output and reports which token VALUES align
 * with the 4-point mathematical grid (all values divisible by 4px).
 *
 * Audits: spacing, sizing, border-radius, font-size (informational).
 * Font sizes use a type scale and are reported separately — they follow
 * their own mathematical ratio, not the spatial grid.
 *
 * Usage:
 *   node scripts/audit-grid.js            # full report
 *   node scripts/audit-grid.js --summary  # summary only
 *
 * Future: When migrating to rem, 4px = 0.25rem (at 16px base).
 */

const fs = require('fs');
const path = require('path');

const FIGMA_CSS = path.join(__dirname, '..', 'tokens', 'figma-tokens.css');
const GAP_FILLS_CSS = path.join(__dirname, '..', 'tokens', 'gap-fills.css');

const GRID_BASE = 4;

// Token categories to audit, with their primitive prefix (SD single-dash naming)
const CATEGORIES = [
  { name: 'Spacing (--space-)', prefix: '--space-', spatial: true },
  { name: 'Sizing (--size-)', prefix: '--size-', spatial: true },
  { name: 'Border Radius (--border-radius-)', prefix: '--border-radius-', spatial: true },
  { name: 'Border Width (--border-width-)', prefix: '--border-width-', spatial: false }, // 1-4px, too small for grid
  { name: 'Font Size (--font-size-)', prefix: '--font-size-', spatial: false }, // type scale, not spatial grid
];

// Semantic token categories (resolved to primitives via var() references)
const SEMANTIC_CATEGORIES = [
  { name: 'Semantic Spacing (--padding-/--gap-)', prefix: '--padding-' },
  { name: 'Semantic Gap (--gap-)', prefix: '--gap-' },
  { name: 'Semantic Size (--size-icon-)', prefix: '--size-icon-' },
];

function parseCssFile(filePath) {
  const css = fs.readFileSync(filePath, 'utf8');
  const lines = css.split('\n');

  // Collect all token declarations: name → value
  const tokens = new Map();
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (/^(:root|\.body)\s*\{/.test(line) || /^\.body\.theme-\d+/.test(line)) {
      i++;
      let depth = 1;
      while (i < lines.length && depth > 0) {
        if (lines[i].includes('{')) depth++;
        if (lines[i].includes('}')) depth--;

        const match = lines[i].match(/^\s*(--[\w-]+):\s*(.+?);/);
        if (match) {
          // Only store first occurrence (avoid theme overrides for audit)
          if (!tokens.has(match[1])) {
            tokens.set(match[1], match[2].trim());
          }
        }
        i++;
      }
      continue;
    }
    i++;
  }

  return tokens;
}

function extractPx(value) {
  // Direct px value
  const pxMatch = value.match(/^(\d+(?:\.\d+)?)px$/);
  if (pxMatch) return parseFloat(pxMatch[1]);
  return null;
}

function resolvePx(value, tokens) {
  // If direct px
  const direct = extractPx(value);
  if (direct !== null) return direct;

  // If var() reference, resolve
  const varMatch = value.match(/^var\((--[\w-]+)\)$/);
  if (varMatch && tokens.has(varMatch[1])) {
    return extractPx(tokens.get(varMatch[1]));
  }

  return null;
}

function audit(tokens, summaryOnly) {
  let totalTokens = 0;
  let totalOnGrid = 0;
  let totalOffGrid = 0;

  console.log('\n📐 BDS 4-Point Grid Audit\n');
  console.log(`   Base unit: ${GRID_BASE}px`);
  console.log(`   Rule: All spatial values should be divisible by ${GRID_BASE}`);
  console.log(`   Exempt: 0px, 1px, 2px (micro adjustments)\n`);

  // Audit primitive tokens
  for (const cat of CATEGORIES) {
    const matching = [];
    for (const [name, value] of tokens) {
      if (name.startsWith(cat.prefix)) {
        const px = extractPx(value);
        if (px !== null) {
          matching.push({ name, value, px });
        }
      }
    }

    if (matching.length === 0) continue;

    // Sort by px value
    matching.sort((a, b) => a.px - b.px);

    const onGrid = matching.filter(t => t.px === 0 || t.px <= 2 || t.px % GRID_BASE === 0);
    const offGrid = matching.filter(t => t.px > 2 && t.px % GRID_BASE !== 0);

    if (cat.spatial) {
      totalTokens += matching.length;
      totalOnGrid += onGrid.length;
      totalOffGrid += offGrid.length;
    }

    const pct = Math.round((onGrid.length / matching.length) * 100);
    const status = offGrid.length === 0 ? '✅' : cat.spatial ? '⚠️' : 'ℹ️';

    console.log(`${status} ${cat.name}`);
    console.log(`   ${onGrid.length}/${matching.length} on grid (${pct}%)`);

    if (!summaryOnly && offGrid.length > 0) {
      console.log('   Off-grid values:');
      for (const t of offGrid) {
        const lower = Math.floor(t.px / GRID_BASE) * GRID_BASE;
        const upper = lower + GRID_BASE;
        const rem = (t.px / 16).toFixed(3);
        console.log(`     ${t.name}: ${t.px}px (${rem}rem) → nearest: ${lower}px or ${upper}px`);
      }
    }
    console.log('');
  }

  // Audit semantic tokens (resolve through var() references)
  console.log('─'.repeat(50));
  console.log('Semantic token resolution:\n');

  for (const cat of SEMANTIC_CATEGORIES) {
    const matching = [];
    for (const [name, value] of tokens) {
      if (name.startsWith(cat.prefix)) {
        const px = resolvePx(value, tokens);
        if (px !== null) {
          matching.push({ name, value, px });
        }
      }
    }

    if (matching.length === 0) continue;
    matching.sort((a, b) => a.px - b.px);

    const onGrid = matching.filter(t => t.px === 0 || t.px <= 2 || t.px % GRID_BASE === 0);
    const offGrid = matching.filter(t => t.px > 2 && t.px % GRID_BASE !== 0);

    const pct = Math.round((onGrid.length / matching.length) * 100);
    const status = offGrid.length === 0 ? '✅' : '⚠️';

    console.log(`${status} ${cat.name}`);
    console.log(`   ${onGrid.length}/${matching.length} on grid (${pct}%)`);

    if (!summaryOnly && offGrid.length > 0) {
      console.log('   Off-grid values:');
      for (const t of offGrid) {
        const lower = Math.floor(t.px / GRID_BASE) * GRID_BASE;
        const upper = lower + GRID_BASE;
        console.log(`     ${t.name}: ${t.px}px → nearest: ${lower}px or ${upper}px`);
      }
    }
    console.log('');
  }

  // Summary
  console.log('═'.repeat(50));
  const pct = totalTokens > 0 ? Math.round((totalOnGrid / totalTokens) * 100) : 100;
  console.log(`  Spatial tokens: ${totalOnGrid}/${totalTokens} on 4-point grid (${pct}%)`);
  if (totalOffGrid > 0) {
    console.log(`  ${totalOffGrid} off-grid values need review`);
    console.log('  (Fix in Figma source, not in component code)');
  }

  // REM migration note
  console.log('\n  REM conversion reference (at 16px base):');
  console.log('    4px = 0.25rem    8px = 0.5rem     12px = 0.75rem');
  console.log('   16px = 1rem      24px = 1.5rem     32px = 2rem');
  console.log('   48px = 3rem      64px = 4rem       96px = 6rem\n');
}

// JSON data collector — used when --json flag is passed
function auditJson(tokens) {
  const results = { categories: [], spatialOnGrid: 0, spatialTotal: 0, spatialPct: 0 };

  for (const cat of [...CATEGORIES, ...SEMANTIC_CATEGORIES]) {
    const matching = [];
    for (const [name, value] of tokens) {
      if (name.startsWith(cat.prefix)) {
        const px = cat.spatial !== undefined ? extractPx(value) : resolvePx(value, tokens);
        if (px !== null) matching.push({ name, value, px });
      }
    }
    if (matching.length === 0) continue;
    matching.sort((a, b) => a.px - b.px);
    const onGrid = matching.filter(t => t.px === 0 || t.px <= 2 || t.px % GRID_BASE === 0);
    const offGrid = matching.filter(t => t.px > 2 && t.px % GRID_BASE !== 0);
    const spatial = cat.spatial === true || cat.spatial === undefined;
    if (spatial) { results.spatialOnGrid += onGrid.length; results.spatialTotal += matching.length; }
    results.categories.push({
      name: cat.name,
      total: matching.length, onGrid: onGrid.length, offGrid: offGrid.length,
      pct: Math.round((onGrid.length / matching.length) * 100),
      offGridTokens: offGrid.map(t => t.name),
    });
  }
  results.spatialPct = results.spatialTotal > 0
    ? Math.round((results.spatialOnGrid / results.spatialTotal) * 100) : 100;
  return results;
}

// Main
const args = process.argv.slice(2);
const summaryOnly = args.includes('--summary');
const jsonMode = args.includes('--json');

if (!fs.existsSync(FIGMA_CSS)) {
  console.error(`ERROR: Token CSS not found at ${FIGMA_CSS}`);
  console.error('Run: npm run build:sd-figma');
  process.exit(1);
}

// Load tokens from all CSS sources
const tokens = parseCssFile(FIGMA_CSS);
if (fs.existsSync(GAP_FILLS_CSS)) {
  const gapFills = parseCssFile(GAP_FILLS_CSS);
  for (const [k, v] of gapFills) {
    if (!tokens.has(k)) tokens.set(k, v);
  }
}

if (jsonMode) {
  console.log(JSON.stringify(auditJson(tokens), null, 2));
} else {
  audit(tokens, summaryOnly);
}
