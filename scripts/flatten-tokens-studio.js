#!/usr/bin/env node
/**
 * Flatten Tokens Studio multi-set output into Style Dictionary-ready DTCG JSON.
 *
 * Tokens Studio exports one JSON with multiple Token Sets (one per collection/mode).
 * Style Dictionary needs a flat DTCG structure with all references resolvable.
 *
 * This script:
 *   1. Reads design-tokens/tokens-studio.json
 *   2. Merges primitives + one mode per collection into a flat DTCG object
 *   3. Writes design-tokens/tokens-figma.json (consumed by sd.config.tokens-studio.mjs)
 *   4. Writes separate mode files for theme variants
 *
 * Default mode selection (matches Webflow Foundations site defaults):
 *   color: light, icon: solid, border-radius: soft, spacing: default,
 *   breakpoint: default, border-width: default, elevation: subtle,
 *   typography: default
 *
 * Usage:
 *   node scripts/flatten-tokens-studio.js [--mode spacing=spacious,color=dark]
 *
 * Zero dependencies — Node.js stdlib only.
 */

const fs = require('fs');
const path = require('path');

const INPUT = path.join(__dirname, '../design-tokens/tokens-studio.json');
let OUTPUT = path.join(__dirname, '../design-tokens/tokens-figma.json');

// Default modes — these match the Webflow Foundations site defaults
const DEFAULT_MODES = {
  primitives: 'value',
  color: 'light',
  icon: 'solid',
  'border-radius': 'soft',
  spacing: 'default',
  breakpoint: 'default',
  'border-width': 'default',
  elevation: 'subtle',
  typography: 'default',
};

// Parse CLI overrides: --mode spacing=spacious,color=dark  --output path/to/output.json
const args = process.argv.slice(2);
const modeIdx = args.indexOf('--mode');
if (modeIdx !== -1 && args[modeIdx + 1]) {
  const overrides = args[modeIdx + 1].split(',');
  for (const o of overrides) {
    const [col, mode] = o.split('=');
    if (col && mode) DEFAULT_MODES[col] = mode;
  }
}
const outIdx = args.indexOf('--output');
if (outIdx !== -1 && args[outIdx + 1]) {
  OUTPUT = path.resolve(args[outIdx + 1]);
}

// ─── Deep merge ──────────────────────────────────────────────────

function deepMerge(target, source) {
  for (const [key, val] of Object.entries(source)) {
    if (val && typeof val === 'object' && !Array.isArray(val) && val.$value === undefined) {
      if (!target[key] || typeof target[key] !== 'object') {
        target[key] = {};
      }
      deepMerge(target[key], val);
    } else {
      target[key] = val;
    }
  }
  return target;
}

// ─── Strip Figma-specific extensions (keep $value, $type, $description) ──

function cleanToken(token) {
  const cleaned = {};
  if (token.$value !== undefined) cleaned.$value = token.$value;
  if (token.$type !== undefined) cleaned.$type = token.$type;
  if (token.$description !== undefined) cleaned.$description = token.$description;
  return cleaned;
}

function cleanTree(obj) {
  const result = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val && typeof val === 'object') {
      if (val.$value !== undefined) {
        result[key] = cleanToken(val);
        // Handle collision: node is both a token AND a group (e.g. icon collection
        // sets icon.$value while typography collection adds icon.tiny, icon.xs, etc.)
        for (const [ck, cv] of Object.entries(val)) {
          if (ck.startsWith('$')) continue;
          if (cv && typeof cv === 'object') {
            if (cv.$value !== undefined) {
              result[key][ck] = cleanToken(cv);
            } else {
              const sub = cleanTree(cv);
              if (Object.keys(sub).length > 0) {
                result[key][ck] = sub;
              }
            }
          }
        }
        // Warn about collision so it's visible in build output
        const childKeys = Object.keys(result[key]).filter(k => !k.startsWith('$'));
        if (childKeys.length > 0) {
          console.warn(`  COLLISION: "${key}" is both a token ($value) and a group (${childKeys.length} children: ${childKeys.slice(0, 3).join(', ')}${childKeys.length > 3 ? '...' : ''})`);
        }
      } else {
        const cleaned = cleanTree(val);
        if (Object.keys(cleaned).length > 0) {
          result[key] = cleaned;
        }
      }
    }
  }
  return result;
}

// ─── Main ────────────────────────────────────────────────────────

console.log('Flattening Tokens Studio output...\n');

const data = JSON.parse(fs.readFileSync(INPUT, 'utf8'));

// Identify available sets
const sets = Object.keys(data).filter(k => k[0] !== '$' && k !== 'global');
const collections = {};
for (const s of sets) {
  const parts = s.split('/');
  const col = parts[0];
  const mode = parts[1] || 'value';
  if (!collections[col]) collections[col] = [];
  collections[col].push(mode);
}

console.log('  Collections found:');
for (const [col, modes] of Object.entries(collections)) {
  const selected = DEFAULT_MODES[col] || modes[0];
  const marker = modes.includes(selected) ? selected : modes[0] + ' (fallback)';
  console.log(`    ${col}: ${modes.join(', ')}  → using "${marker}"`);
}

// ─── Detect if a set's direct children are all leaf tokens ────
// Sets like border-width/default and breakpoint/default have tokens
// directly at root ({sm: {$value}, md: {$value}}) with no parent
// group wrapper. These need wrapping under the collection name so
// they don't orphan into the global namespace.

function needsWrapping(setData) {
  for (const val of Object.values(setData)) {
    if (val && typeof val === 'object' && val.$value !== undefined) {
      return true; // direct leaf tokens at root — needs wrapping
    }
  }
  return false;
}

// Merge selected sets
const merged = {};
for (const [col, modes] of Object.entries(collections)) {
  const selected = DEFAULT_MODES[col] || modes[0];
  const setKey = modes.length === 1 && modes[0] === 'value'
    ? `${col}/${modes[0]}`
    : `${col}/${selected}`;

  const setData = data[setKey];
  if (!setData) {
    console.warn(`  WARNING: Set "${setKey}" not found, skipping`);
    continue;
  }

  // Wrap rootless semantic sets under their collection name
  // e.g. border-width/default → { "border-width": { sm, md, lg } }
  //      breakpoint/default   → { "breakpoint": { web, tablet, mobile } }
  if (col !== 'primitives' && needsWrapping(setData)) {
    console.log(`    ↳ Wrapping "${setKey}" tokens under "${col}"`);
    deepMerge(merged, { [col]: setData });
  } else {
    deepMerge(merged, setData);
  }
}

// ─── Fix font-line-height: Tokens Studio exports % as px ─────
// Figma stores line-height as percentages (110%, 125%, 150%) but
// Tokens Studio exports them as "110px", "125px". Convert back.

if (merged['font-line-height']) {
  for (const [key, token] of Object.entries(merged['font-line-height'])) {
    if (token && token.$value && typeof token.$value === 'string' && token.$value.endsWith('px')) {
      const num = parseFloat(token.$value);
      // Line-height values are percentages (100-200 range), not pixel values
      if (num >= 100 && num <= 300) {
        const fixed = `${num}%`;
        console.log(`    ↳ Fixed font-line-height/${key}: ${token.$value} → ${fixed}`);
        token.$value = fixed;
        token.$type = 'number'; // percentage, not dimension
      }
    }
  }
}

// Clean Figma-specific extensions
const cleaned = cleanTree(merged);

// Count tokens (handles collision nodes that are both token AND group)
let count = 0;
function countTokens(obj) {
  for (const val of Object.values(obj)) {
    if (val && typeof val === 'object') {
      if (val.$value !== undefined) count++;
      // Always recurse — collision nodes have both $value and children
      countTokens(val);
    }
  }
}
countTokens(cleaned);

// Write output
fs.writeFileSync(OUTPUT, JSON.stringify(cleaned, null, 2) + '\n');
console.log(`\n  Written: ${path.relative(path.join(__dirname, '..'), OUTPUT)} (${count} tokens)`);
console.log('  Ready for Style Dictionary build\n');
