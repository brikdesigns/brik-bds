#!/usr/bin/env node
/**
 * Sync Figma variables into tokens-studio.json.
 *
 * Reads the JSON dump produced by `bun scripts/pull-variables.js <channel-id>`
 * (the dev plugin + WebSocket relay pipeline — the only reliable path on a
 * Pro plan) and patches `design-tokens/tokens-studio.json` so the next
 * Style Dictionary build emits the new values.
 *
 * Two input shapes are accepted:
 *
 *   1. pull-variables.js output (current pipeline)
 *      { totalCollections, totalVariables,
 *        collections: [{ name, modes: [{ name, modeId }] }],
 *        variables: [{
 *          id, name, resolvedType, collection, description, scopes,
 *          valuesByMode: { <modeName>: <directValue> | { alias: "VariableID:..." } }
 *        }] }
 *
 *   2. Legacy flat MCP-style map (kept for back-compat — one-shot dumps):
 *      { "color/system/green-light": "#bef4d4", ... }
 *
 * For shape 1 (the supported pipeline):
 *   - Each variable is routed into the `{collection}/{modeName}` top-level
 *     set in tokens-studio.json (e.g. `color/light`, `color/dark`,
 *     `border-radius/soft`, `primitives/value`).
 *   - Alias values are resolved via an id→name map built from the dump and
 *     written as Tokens Studio reference syntax: `{a.b.c}`.
 *   - Every mode in `valuesByMode` is written; we never collapse to modes[0].
 *   - Existing `$description` is preserved when the dump's description is
 *     empty (the dump returns `""` for any variable without a Figma
 *     description, so we never wipe an existing one).
 *
 * Usage:
 *   node scripts/sync-figma-mcp.js <pull-output.json> [--dry-run] [--build]
 *
 * Flags:
 *   --dry-run   Show what would change without writing
 *   --build     Run `npm run build:all-tokens` after patching
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
  console.error('Usage: node scripts/sync-figma-mcp.js <pull-output.json> [--dry-run] [--build]');
  console.error('  <pull-output.json>  JSON file produced by `bun scripts/pull-variables.js`');
  process.exit(1);
}

// ─── Read inputs ─────────────────────────────────────────────────

const rawData = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
const tokensStudio = JSON.parse(fs.readFileSync(TOKENS_FILE, 'utf8'));

// ─── Normalize: handle the current plugin output shape ─────────────
// The Claude-Talk-to-Figma plugin's `get_variables` returns variables nested
// per-collection (`collections[].variables[]`) and uses modeId-keyed values.
// Older versions of this script expected a flat top-level `variables[]` with
// each variable carrying its `collection` name and modeName-keyed values.
// Normalize the nested shape to the flat shape so the downstream patch
// routine doesn't have to know which version produced the dump.
if (
  !Array.isArray(rawData.variables) &&
  Array.isArray(rawData.collections) &&
  rawData.collections.some((c) => Array.isArray(c.variables))
) {
  const flatVariables = [];
  for (const col of rawData.collections) {
    if (!Array.isArray(col.variables)) continue;
    // Build a modeId → modeName lookup once per collection so we can rekey
    // each variable's valuesByMode to the human-readable mode name (which is
    // what tokens-studio.json sets are keyed by, e.g. `color/light`).
    const modeIdToName = new Map((col.modes || []).map((m) => [m.modeId, m.name]));
    for (const v of col.variables) {
      const valuesByModeName = {};
      for (const [modeId, modeValue] of Object.entries(v.valuesByMode || {})) {
        const modeName = modeIdToName.get(modeId) || modeId;
        valuesByModeName[modeName] = modeValue;
      }
      flatVariables.push({
        id: v.id,
        name: v.name,
        resolvedType: v.resolvedType,
        collection: col.name,
        valuesByMode: valuesByModeName,
        description: v.description || '',
        scopes: v.scopes || [],
      });
    }
  }
  rawData.variables = flatVariables;
  rawData.totalCollections = rawData.collections.length;
  rawData.totalVariables = flatVariables.length;
}

// ─── Normalize variable names (strip Figma annotations) ────────────
// Figma uses suffix annotations like ` [base]` to mark canonical-step
// variables in a scale (e.g. `color/poppy/light [base]` is the base of
// the poppy scale; siblings are `lighter`, `lightest`, `dark`, `darker`,
// `darkest`). The bracket-annotation is design-system metadata, not part
// of the token's identity — and the characters break CSS-variable
// generation. Strip them here so downstream tooling (tokens-studio.json,
// Style Dictionary, dist/tokens.css) all use the clean name.
//
// The annotation stays in Figma as the source-of-truth marker.
function sanitizeFigmaName(name) {
  if (typeof name !== 'string') return name;
  // Strip ` [anything]` suffix at end of path segments.
  return name.replace(/ \[[^\]]+\]/g, '');
}

if (Array.isArray(rawData.variables)) {
  for (const v of rawData.variables) {
    v.name = sanitizeFigmaName(v.name);
  }
}

// ─── Helpers ─────────────────────────────────────────────────────

function inferTypeFromResolved(resolvedType, varName) {
  // resolvedType is set by pull-variables.js (FLOAT / COLOR / STRING / BOOLEAN).
  switch (resolvedType) {
    case 'COLOR':   return 'color';
    case 'FLOAT':   return 'number';
    case 'BOOLEAN': return 'boolean';
    case 'STRING':
      return varName.startsWith('font-family/') ? 'fontFamily' : 'string';
    default:
      return 'string';
  }
}

// Legacy path-prefix inference — only used by the back-compat flat-map shape
// (no resolvedType available there).
function inferTypeFromPath(varPath) {
  const first = varPath.split('/')[0];
  const numeric = new Set([
    'font-size', 'font-weight', 'font-line-height',
    'space', 'size', 'border-radius', 'border-width', 'gap', 'padding',
    'shadow-blur', 'shadow-offset', 'shadow-spread',
    'duration', 'delay',
  ]);
  if (first === 'color') return 'color';
  if (first === 'font-family') return 'fontFamily';
  if (numeric.has(first)) return 'number';
  return 'color';
}

// Walk or create nested object path.
function getOrCreate(obj, pathParts) {
  let current = obj;
  for (const part of pathParts) {
    if (!current[part]) current[part] = {};
    current = current[part];
  }
  return current;
}

// Convert a Figma variable name ("color/grayscale/white") into a Tokens
// Studio reference value ("{color.grayscale.white}").
function toTokenRef(varName) {
  return `{${varName.replace(/\//g, '.')}}`;
}

// Convert Figma's normalized RGBA (0-1 floats) into a CSS hex string.
// Alpha is included only when < 1 (8-char hex); fully opaque colors stay 6-char.
function rgbaToHex({ r, g, b, a }) {
  const to255 = (x) => Math.round(Math.max(0, Math.min(1, x)) * 255);
  const hex = [to255(r), to255(g), to255(b)]
    .map((n) => n.toString(16).padStart(2, '0'))
    .join('');
  if (typeof a === 'number' && a < 1) {
    return '#' + hex + to255(a).toString(16).padStart(2, '0');
  }
  return '#' + hex;
}

// Resolve a single mode value into its tokens-studio.json $value.
//   - Direct primitive (string | number) → as-is.
//   - RGBA color object { r, g, b, a } → hex string (#rrggbb or #rrggbbaa).
//   - Alias object → "{a.b.c}". Two shapes accepted, in this order:
//       (a) Current plugin: { type: 'VARIABLE_ALIAS', id: 'VariableID:...' }
//       (b) Legacy:         { alias: 'VariableID:...' }
//   - Anything else → null (caller decides to skip).
function resolveValue(modeValue, idToName) {
  if (typeof modeValue === 'string' || typeof modeValue === 'number') {
    return modeValue;
  }
  if (modeValue && typeof modeValue === 'object') {
    // Alias — current plugin shape ({ type, id }) takes precedence
    if (modeValue.type === 'VARIABLE_ALIAS' && typeof modeValue.id === 'string') {
      const targetName = idToName.get(modeValue.id);
      if (!targetName) return null; // dangling alias
      return toTokenRef(targetName);
    }
    // Alias — legacy shape ({ alias: 'VariableID:...' })
    if (typeof modeValue.alias === 'string') {
      const targetName = idToName.get(modeValue.alias);
      if (!targetName) return null;
      return toTokenRef(targetName);
    }
    // RGBA color from Figma Variables API
    if (
      typeof modeValue.r === 'number' &&
      typeof modeValue.g === 'number' &&
      typeof modeValue.b === 'number'
    ) {
      return rgbaToHex(modeValue);
    }
  }
  return null;
}

// ─── Patch routine ───────────────────────────────────────────────

const changes = {
  perSet: new Map(),         // setKey → { updated: [], added: [], skipped: [] }
  unknownSets: new Set(),    // setKeys missing from tokens-studio.json
  danglingAliases: [],       // { varName, mode, aliasId }
  groupCollisions: [],       // { setKey, varPath } — leaf path conflicts with a group
  totalUpdated: 0,
  totalAdded: 0,
  totalSkipped: 0,
};

function bucket(setKey) {
  if (!changes.perSet.has(setKey)) {
    changes.perSet.set(setKey, { updated: [], added: [], skipped: [] });
  }
  return changes.perSet.get(setKey);
}

function applyToSet(setKey, varName, $value, $type, $description, $extensions) {
  const set = tokensStudio[setKey];
  if (!set) {
    changes.unknownSets.add(setKey);
    return;
  }

  const parts = varName.split('/');
  const parentPath = parts.slice(0, -1);
  const leafKey = parts[parts.length - 1];
  const parent = getOrCreate(set, parentPath);

  const existing = parent[leafKey];

  if (existing && existing.$value !== undefined) {
    // Existing leaf — diff and update only what changed.
    //
    // tokens-studio.json uses richer DTCG types (`dimension`, `fontWeight`,
    // `lineHeight`, etc.) than what we can derive from Figma's coarse
    // `resolvedType` (FLOAT / COLOR / STRING / BOOLEAN). Preserving the
    // curated `$type` + `$extensions` is the safe default — only fill
    // them in when missing. Same for `$description`: Figma returns "" for
    // any variable without a description, so we never wipe an existing one.
    const oldValue = existing.$value;
    const fields = {};
    if (existing.$value !== $value) fields.$value = $value;
    if (existing.$type === undefined && $type) fields.$type = $type;
    if (existing.$extensions === undefined && $extensions) fields.$extensions = $extensions;
    if (existing.$description === undefined && $description) {
      fields.$description = $description;
    }

    if (Object.keys(fields).length === 0) {
      // No-op — counted neither updated nor skipped.
      return;
    }

    Object.assign(parent[leafKey], fields);
    bucket(setKey).updated.push({
      path: varName,
      old: oldValue,
      new: $value,
      changedFields: Object.keys(fields),
    });
    changes.totalUpdated += 1;
    return;
  }

  if (existing && typeof existing === 'object' && existing.$value === undefined) {
    // Leaf path collides with an existing group node — skip with a warning.
    changes.groupCollisions.push({ setKey, varPath: varName });
    bucket(setKey).skipped.push({ path: varName, reason: 'group-collision' });
    changes.totalSkipped += 1;
    return;
  }

  // New leaf.
  parent[leafKey] = {
    $extensions: $extensions || { 'com.figma.scopes': ['ALL_SCOPES'] },
    $type,
    $value,
  };
  if ($description) parent[leafKey].$description = $description;
  bucket(setKey).added.push({ path: varName, value: $value });
  changes.totalAdded += 1;
}

// ─── Dispatch on input shape ─────────────────────────────────────

const isPullShape = Array.isArray(rawData.variables) && Array.isArray(rawData.collections);

if (isPullShape) {
  // ─── Shape 1: pull-variables.js dump ─────────────────────────
  const idToName = new Map(rawData.variables.map(v => [v.id, v.name]));

  for (const v of rawData.variables) {
    const $type = inferTypeFromResolved(v.resolvedType, v.name);
    const $description = (v.description && v.description.length > 0) ? v.description : undefined;
    const $extensions = (Array.isArray(v.scopes) && v.scopes.length > 0)
      ? { 'com.figma.scopes': v.scopes.slice() }
      : undefined;

    for (const [modeName, modeValue] of Object.entries(v.valuesByMode || {})) {
      const setKey = `${v.collection}/${modeName}`;
      const $value = resolveValue(modeValue, idToName);

      if ($value === null) {
        if (modeValue && typeof modeValue === 'object' && typeof modeValue.alias === 'string') {
          changes.danglingAliases.push({ varName: v.name, mode: modeName, aliasId: modeValue.alias });
        }
        bucket(setKey).skipped.push({ path: v.name, reason: 'unresolvable-value' });
        changes.totalSkipped += 1;
        continue;
      }

      applyToSet(setKey, v.name, $value, $type, $description, $extensions);
    }
  }
} else {
  // ─── Shape 2: legacy flat-map (one-shot dumps) ───────────────
  // Routes everything into `primitives/value`. Used only for back-compat
  // with manual `get_variable_defs` paste-ins; the supported pipeline is
  // shape 1.
  const flatMap = (typeof rawData === 'object' && !Array.isArray(rawData)) ? rawData : {};
  for (const [varName, value] of Object.entries(flatMap)) {
    if (typeof value === 'string' && value.startsWith('Font(')) {
      bucket('primitives/value').skipped.push({ path: varName, reason: 'font-composite' });
      changes.totalSkipped += 1;
      continue;
    }
    if (typeof value !== 'string' && typeof value !== 'number') {
      bucket('primitives/value').skipped.push({ path: varName, reason: 'non-primitive' });
      changes.totalSkipped += 1;
      continue;
    }
    applyToSet('primitives/value', varName, value, inferTypeFromPath(varName));
  }
}

// ─── Report ──────────────────────────────────────────────────────

console.log('\n🔄 Figma → tokens-studio.json sync\n');

if (changes.unknownSets.size > 0) {
  console.warn(`⚠️  ${changes.unknownSets.size} set(s) referenced by the dump are missing from tokens-studio.json:`);
  for (const k of changes.unknownSets) console.warn(`     ${k}`);
  console.warn('     Add them to $metadata.tokenSetOrder + create the set object before re-syncing.\n');
}

if (changes.danglingAliases.length > 0) {
  console.warn(`⚠️  ${changes.danglingAliases.length} alias(es) reference variables that were not in the dump:`);
  for (const d of changes.danglingAliases.slice(0, 10)) {
    console.warn(`     ${d.varName} [${d.mode}] → ${d.aliasId}`);
  }
  if (changes.danglingAliases.length > 10) console.warn(`     …and ${changes.danglingAliases.length - 10} more`);
  console.warn('');
}

if (changes.groupCollisions.length > 0) {
  console.warn(`⚠️  ${changes.groupCollisions.length} variable path(s) collide with existing group nodes (skipped):`);
  for (const g of changes.groupCollisions.slice(0, 10)) {
    console.warn(`     ${g.setKey}  ${g.varPath}`);
  }
  console.warn('');
}

if (changes.perSet.size > 0) {
  // Stable sort by tokenSetOrder when available, else alpha.
  const order = (tokensStudio.$metadata && Array.isArray(tokensStudio.$metadata.tokenSetOrder))
    ? tokensStudio.$metadata.tokenSetOrder
    : null;
  const setKeys = Array.from(changes.perSet.keys()).sort((a, b) => {
    if (order) {
      const ai = order.indexOf(a);
      const bi = order.indexOf(b);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
    }
    return a.localeCompare(b);
  });

  console.log('Per-set summary:');
  for (const setKey of setKeys) {
    const c = changes.perSet.get(setKey);
    const u = c.updated.length, a = c.added.length, s = c.skipped.length;
    if (u + a + s === 0) continue;
    console.log(`  ${setKey.padEnd(28)}  ${u} updated  ${a} added  ${s} skipped`);
  }

  // Detail sections — capped to keep output scannable on a large diff.
  const SAMPLE = 25;
  if (changes.totalUpdated > 0) {
    console.log(`\nUpdated (${changes.totalUpdated}):`);
    let shown = 0;
    for (const setKey of setKeys) {
      for (const c of changes.perSet.get(setKey).updated) {
        if (shown >= SAMPLE) break;
        console.log(`  [${setKey}] ${c.path}: ${c.old} → ${c.new}`);
        shown += 1;
      }
      if (shown >= SAMPLE) break;
    }
    if (changes.totalUpdated > SAMPLE) console.log(`  …and ${changes.totalUpdated - SAMPLE} more`);
  }

  if (changes.totalAdded > 0) {
    console.log(`\nAdded (${changes.totalAdded}):`);
    let shown = 0;
    for (const setKey of setKeys) {
      for (const c of changes.perSet.get(setKey).added) {
        if (shown >= SAMPLE) break;
        console.log(`  [${setKey}] ${c.path}: ${c.value}`);
        shown += 1;
      }
      if (shown >= SAMPLE) break;
    }
    if (changes.totalAdded > SAMPLE) console.log(`  …and ${changes.totalAdded - SAMPLE} more`);
  }
}

if (changes.totalUpdated === 0 && changes.totalAdded === 0) {
  console.log('No changes detected — tokens-studio.json is up to date.');
  if (changes.totalSkipped > 0) console.log(`(${changes.totalSkipped} value(s) skipped — see warnings above.)`);
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
