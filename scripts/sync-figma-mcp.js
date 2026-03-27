#!/usr/bin/env node
/**
 * Sync Figma variables into tokens-studio.json via MCP output.
 *
 * This script bridges the Figma MCP `get_variable_defs` output (flat key-value)
 * into the W3C DTCG structure used by our Style Dictionary pipeline.
 *
 * Usage:
 *   1. Claude calls `get_variable_defs` on the Figma Foundations file
 *   2. Claude writes the JSON result to a temp file
 *   3. This script patches tokens-studio.json with updated values
 *   4. Then runs `npm run build:sd-figma` to regenerate CSS/JS/Swift
 *
 *   node scripts/sync-figma-mcp.js <mcp-output.json> [--dry-run] [--build]
 *
 * Flags:
 *   --dry-run   Show what would change without writing
 *   --build     Run `npm run build:sd-figma` after patching
 *
 * Zero dependencies — Node.js stdlib only.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const TOKENS_FILE = path.join(__dirname, '../design-tokens/tokens-studio.json');

// ─── Parse CLI args ──────────────────────────────────────────────

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const runBuild = args.includes('--build');
const inputFile = args.find(a => !a.startsWith('--'));

if (!inputFile) {
  console.error('Usage: node scripts/sync-figma-mcp.js <mcp-output.json> [--dry-run] [--build]');
  console.error('  <mcp-output.json>  JSON file with get_variable_defs output');
  process.exit(1);
}

// ─── Read inputs ─────────────────────────────────────────────────

const mcpData = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
const tokensStudio = JSON.parse(fs.readFileSync(TOKENS_FILE, 'utf8'));

// ─── Map MCP variable paths to tokens-studio.json structure ──────
//
// MCP returns: { "color/system/green-light": "#bef4d4", ... }
// tokens-studio.json has: { "primitives/value": { "color": { "system": { "green-light": { "$value": "#bef4d4" } } } } }
//
// Strategy:
//   1. Parse the MCP key path (e.g., "color/system/green-light")
//   2. Walk the tokens-studio.json "primitives/value" set to find matches
//   3. Update $value if found, add new entry if not found
//   4. Also check semantic sets (color/light, color/dark) for alias references

const PRIMITIVES_KEY = 'primitives/value';

// Known type inference from path prefix
function inferType(varPath) {
  const first = varPath.split('/')[0];
  const typeMap = {
    'color': 'color',
    'font-size': 'number',
    'font-weight': 'number',
    'font-family': 'fontFamily',
    'font-line-height': 'number',
    'space': 'number',
    'size': 'number',
    'border-radius': 'number',
    'border-width': 'number',
    'gap': 'number',
    'padding': 'number',
    'shadow-blur': 'number',
    'shadow-offset': 'number',
    'shadow-spread': 'number',
    'duration': 'number',
    'delay': 'number',
  };
  return typeMap[first] || 'color';
}

// Walk or create nested object path
function getOrCreate(obj, pathParts) {
  let current = obj;
  for (const part of pathParts) {
    if (!current[part]) current[part] = {};
    current = current[part];
  }
  return current;
}

// ─── Patch tokens ────────────────────────────────────────────────

const changes = { updated: [], added: [], skipped: [] };

for (const [varPath, value] of Object.entries(mcpData)) {
  const parts = varPath.split('/');

  // Skip non-primitive values (Font composites, etc.)
  if (typeof value === 'string' && value.startsWith('Font(')) {
    changes.skipped.push(varPath);
    continue;
  }

  // Navigate to the parent in primitives set
  const primitives = tokensStudio[PRIMITIVES_KEY];
  if (!primitives) {
    console.error(`Token set "${PRIMITIVES_KEY}" not found in tokens-studio.json`);
    process.exit(1);
  }

  const parentPath = parts.slice(0, -1);
  const leafKey = parts[parts.length - 1];
  const parent = getOrCreate(primitives, parentPath);

  if (parent[leafKey] && parent[leafKey].$value !== undefined) {
    // Existing token — update value
    const oldValue = parent[leafKey].$value;
    if (oldValue !== value) {
      parent[leafKey].$value = value;
      changes.updated.push({ path: varPath, old: oldValue, new: value });
    }
  } else if (parent[leafKey] && typeof parent[leafKey] === 'object' && parent[leafKey].$value === undefined) {
    // It's a group node, not a leaf — skip
    changes.skipped.push(varPath);
  } else {
    // New token — add it
    parent[leafKey] = {
      $extensions: { 'com.figma.scopes': ['ALL_SCOPES'] },
      $type: inferType(varPath),
      $value: value,
    };
    changes.added.push({ path: varPath, value });
  }
}

// ─── Report ──────────────────────────────────────────────────────

console.log('\n🔄 Figma MCP → tokens-studio.json sync\n');

if (changes.updated.length) {
  console.log(`Updated (${changes.updated.length}):`);
  for (const c of changes.updated) {
    console.log(`  ${c.path}: ${c.old} → ${c.new}`);
  }
}

if (changes.added.length) {
  console.log(`\nAdded (${changes.added.length}):`);
  for (const c of changes.added) {
    console.log(`  ${c.path}: ${c.value}`);
  }
}

if (changes.skipped.length) {
  console.log(`\nSkipped (${changes.skipped.length}): composites/groups`);
}

if (!changes.updated.length && !changes.added.length) {
  console.log('No changes detected — tokens-studio.json is up to date.');
  process.exit(0);
}

// ─── Write ───────────────────────────────────────────────────────

if (dryRun) {
  console.log('\n--dry-run: no files written.');
} else {
  fs.writeFileSync(TOKENS_FILE, JSON.stringify(tokensStudio, null, 2) + '\n', 'utf8');
  console.log(`\n✅ Wrote ${TOKENS_FILE}`);
}

// ─── Build ───────────────────────────────────────────────────────

if (runBuild && !dryRun) {
  console.log('\n🔨 Running npm run build:all-tokens...\n');
  try {
    execSync('npm run build:all-tokens', {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
    });

    // ── Auto-propagate build output to consumed token files ──
    // tokens/figma-tokens.css is the file consuming projects import via submodule.
    // It has a curated header — preserve it, replace only the :root block.
    const buildOutput = path.join(__dirname, '../build/figma/css/variables.css');
    const consumedFile = path.join(__dirname, '../tokens/figma-tokens.css');

    if (fs.existsSync(buildOutput) && fs.existsSync(consumedFile)) {
      const buildCSS = fs.readFileSync(buildOutput, 'utf8');
      const consumed = fs.readFileSync(consumedFile, 'utf8');

      // Extract :root block from build output
      const buildRoot = buildCSS.match(/:root\s*\{[\s\S]*?\n\}/);
      if (buildRoot) {
        // Replace :root block in consumed file, keep header
        const updated = consumed.replace(/:root\s*\{[\s\S]*?\n\}/, buildRoot[0]);
        fs.writeFileSync(consumedFile, updated, 'utf8');
        console.log(`\n✅ Propagated build output → tokens/figma-tokens.css`);
      }
    }

    console.log('\n✅ Token build complete.');
  } catch (e) {
    console.error('\n❌ Build failed:', e.message);
    process.exit(1);
  }
}
