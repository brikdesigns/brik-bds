#!/usr/bin/env node
/**
 * Transform Figma Variable Export → BDS Token Pipeline
 *
 * Reads a Figma variable export (from GitFig, variables-utilities, or manual
 * export) and normalizes it into the structure our build pipeline expects.
 *
 * Input formats supported:
 *   1. Multi-block text format (variables-utilities "Export Variables" output)
 *      → Header lines like "primitives.Value.tokens.json" followed by JSON blocks
 *   2. Single DTCG JSON object (GitFig, tokenhaus, etc.)
 *   3. GitFig collection-per-file structure (directory of JSON files)
 *
 * Output: design-tokens/figma-export.json (normalized, single JSON file)
 *
 * Usage:
 *   node scripts/transform-figma-export.js                    # transform + build
 *   node scripts/transform-figma-export.js --dry-run          # preview only
 *   node scripts/transform-figma-export.js --input path.json  # custom input
 *   node scripts/transform-figma-export.js --compare          # compare vs Webflow CSS
 *
 * Zero dependencies — uses only Node.js stdlib.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DEFAULT_INPUT = path.join(ROOT, 'figma-variables.json');
const OUTPUT = path.join(ROOT, 'design-tokens', 'figma-export.json');
const WEBFLOW_DTCG = path.join(ROOT, 'design-tokens', 'tokens.json');

// ─── CLI Args ─────────────────────────────────────────────────────

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const compare = args.includes('--compare');
const inputIdx = args.indexOf('--input');
const inputPath = inputIdx !== -1 ? args[inputIdx + 1] : DEFAULT_INPUT;

// ─── Parse Multi-Block Format ─────────────────────────────────────
// The "Export Variables" format from Figma has plain-text headers
// like "primitives.Value.tokens.json" on their own line, followed
// by a JSON block. Multiple blocks are concatenated in one file.

function parseMultiBlockFormat(raw) {
  const collections = {};
  const lines = raw.split('\n');
  let currentHeader = null;
  let jsonBuffer = '';
  let braceDepth = 0;
  let inJson = false;

  for (const line of lines) {
    // Skip the "Export Variables" title line
    if (line.trim() === 'Export Variables') continue;

    // Detect header lines: "collection.mode.tokens.json"
    if (/^[\w-]+\.[\w\s-]+\.tokens\.json$/.test(line.trim()) && !inJson) {
      // Save previous block if we have one
      if (currentHeader && jsonBuffer.trim()) {
        try {
          collections[currentHeader] = JSON.parse(jsonBuffer);
        } catch (e) {
          console.error(`  Warning: Failed to parse JSON block for "${currentHeader}": ${e.message}`);
        }
      }
      currentHeader = line.trim().replace('.tokens.json', '');
      jsonBuffer = '';
      braceDepth = 0;
      inJson = false;
      continue;
    }

    // Accumulate JSON content
    if (currentHeader) {
      jsonBuffer += line + '\n';
      for (const ch of line) {
        if (ch === '{') { braceDepth++; inJson = true; }
        if (ch === '}') braceDepth--;
      }
      // If we've closed all braces, the block is complete
      if (inJson && braceDepth === 0) {
        try {
          collections[currentHeader] = JSON.parse(jsonBuffer);
        } catch (e) {
          console.error(`  Warning: Failed to parse JSON block for "${currentHeader}": ${e.message}`);
        }
        currentHeader = null;
        jsonBuffer = '';
        inJson = false;
      }
    }
  }

  // Handle last block
  if (currentHeader && jsonBuffer.trim()) {
    try {
      collections[currentHeader] = JSON.parse(jsonBuffer);
    } catch (e) {
      console.error(`  Warning: Failed to parse final JSON block for "${currentHeader}": ${e.message}`);
    }
  }

  return collections;
}

// ─── Detect and Parse Input ───────────────────────────────────────

function detectAndParse(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`Error: Input file not found: ${filePath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(filePath, 'utf8').trim();

  // Check if it starts with JSON
  if (raw.startsWith('{') || raw.startsWith('[')) {
    try {
      const parsed = JSON.parse(raw);
      // Single DTCG JSON — wrap in a collections object
      return { _format: 'single-json', _raw: parsed, collections: { 'all': parsed } };
    } catch (e) {
      console.error(`Error: File looks like JSON but failed to parse: ${e.message}`);
      process.exit(1);
    }
  }

  // Multi-block format (starts with "Export Variables" or a header line)
  if (raw.startsWith('Export Variables') || /^[\w-]+\.[\w\s-]+\.tokens\.json/.test(raw)) {
    const collections = parseMultiBlockFormat(raw);
    return { _format: 'multi-block', collections };
  }

  console.error('Error: Unrecognized input format. Expected DTCG JSON or multi-block export.');
  process.exit(1);
}

// ─── Normalize to Structured Output ───────────────────────────────

function normalizeCollections(parsed) {
  const result = {
    $description: 'Figma Variables export — normalized for BDS pipeline',
    generatedAt: new Date().toISOString(),
    sourceFormat: parsed._format,
    collections: {}
  };

  for (const [key, data] of Object.entries(parsed.collections)) {
    // Parse collection.mode from the header key
    const dotIdx = key.indexOf('.');
    let collection, mode;
    if (dotIdx !== -1) {
      collection = key.substring(0, dotIdx);
      mode = key.substring(dotIdx + 1);
    } else {
      collection = key;
      mode = 'default';
    }

    if (!result.collections[collection]) {
      result.collections[collection] = { modes: {} };
    }
    result.collections[collection].modes[mode] = data;
  }

  return result;
}

// ─── Summary Report ───────────────────────────────────────────────

function printSummary(normalized) {
  console.log('\nFigma Variable Export Summary');
  console.log('─'.repeat(50));
  console.log(`  Format detected: ${normalized.sourceFormat}`);
  console.log(`  Collections: ${Object.keys(normalized.collections).length}`);
  console.log('');

  let totalTokens = 0;

  for (const [name, collection] of Object.entries(normalized.collections)) {
    const modes = Object.keys(collection.modes);
    let tokenCount = 0;
    for (const modeData of Object.values(collection.modes)) {
      tokenCount += countTokensDeep(modeData);
    }
    totalTokens += tokenCount;
    console.log(`  ${name}`);
    console.log(`    Modes: ${modes.join(', ')}`);
    console.log(`    Tokens: ${tokenCount}`);
  }

  console.log('');
  console.log(`  Total tokens: ${totalTokens}`);
  console.log('─'.repeat(50));

  return totalTokens;
}

function countTokensDeep(obj) {
  let count = 0;
  for (const value of Object.values(obj)) {
    if (value && typeof value === 'object') {
      if (value.$value !== undefined || value.$type !== undefined) count++;
      else count += countTokensDeep(value);
    }
  }
  return count;
}

// ─── Compare vs Webflow DTCG ──────────────────────────────────────

function compareWithWebflow(normalized) {
  if (!fs.existsSync(WEBFLOW_DTCG)) {
    console.log('\n  No Webflow DTCG file found at design-tokens/tokens.json — skipping comparison.');
    return;
  }

  const webflowTokens = JSON.parse(fs.readFileSync(WEBFLOW_DTCG, 'utf8'));
  const webflowPaths = new Set();
  collectPaths(webflowTokens, '', webflowPaths);

  // Collect Figma paths from primitives collection
  const figmaPaths = new Set();
  for (const collection of Object.values(normalized.collections)) {
    for (const modeData of Object.values(collection.modes)) {
      collectPaths(modeData, '', figmaPaths);
    }
  }

  // Compare
  const onlyInFigma = [...figmaPaths].filter(p => !webflowPaths.has(p)).sort();
  const onlyInWebflow = [...webflowPaths].filter(p => !figmaPaths.has(p)).sort();
  const inBoth = [...figmaPaths].filter(p => webflowPaths.has(p));

  console.log('\nComparison: Figma vs Webflow DTCG');
  console.log('─'.repeat(50));
  console.log(`  Tokens in both:        ${inBoth.length}`);
  console.log(`  Only in Figma:         ${onlyInFigma.length}`);
  console.log(`  Only in Webflow CSS:   ${onlyInWebflow.length}`);

  if (onlyInFigma.length > 0) {
    console.log('\n  Figma-only tokens (not in Webflow CSS):');
    for (const p of onlyInFigma.slice(0, 30)) {
      console.log(`    + ${p}`);
    }
    if (onlyInFigma.length > 30) {
      console.log(`    ... and ${onlyInFigma.length - 30} more`);
    }
  }

  if (onlyInWebflow.length > 0) {
    console.log('\n  Webflow-only tokens (not in Figma):');
    for (const p of onlyInWebflow.slice(0, 30)) {
      console.log(`    - ${p}`);
    }
    if (onlyInWebflow.length > 30) {
      console.log(`    ... and ${onlyInWebflow.length - 30} more`);
    }
  }

  console.log('─'.repeat(50));
}

function collectPaths(obj, prefix, paths) {
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith('$')) continue; // skip $type, $value, $description
    const fullPath = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object') {
      if (value.$value !== undefined) {
        paths.add(fullPath);
      } else {
        collectPaths(value, fullPath, paths);
      }
    }
  }
}

// ─── Main ─────────────────────────────────────────────────────────

console.log('Transforming Figma variable export...\n');
console.log(`  Input:  ${inputPath}`);
console.log(`  Output: ${OUTPUT}`);

const parsed = detectAndParse(inputPath);
const normalized = normalizeCollections(parsed);
const totalTokens = printSummary(normalized);

if (totalTokens === 0) {
  console.error('\nError: No tokens found in the export. Check the input file format.');
  process.exit(1);
}

if (compare || args.includes('--compare')) {
  compareWithWebflow(normalized);
}

if (dryRun) {
  console.log('\n  --dry-run: No files written.');
  process.exit(0);
}

// Write normalized output
fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, JSON.stringify(normalized, null, 2) + '\n');
console.log(`\n  Written: ${path.relative(ROOT, OUTPUT)}`);
console.log('  Run "npm run build:all-tokens" to rebuild CSS + TypeScript from Webflow source.');
console.log('  Run with --compare to see differences between Figma and Webflow.');
console.log('');
