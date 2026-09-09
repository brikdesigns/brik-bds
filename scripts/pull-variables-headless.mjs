#!/usr/bin/env node
/**
 * pull-variables-headless — pull Figma variables WITHOUT the WebSocket relay.
 *
 * The relay pipeline (`bun scripts/pull-variables.js <channel>` +
 * scripts/figma-pull-tokens.sh) needs Figma Desktop plus a plugin instance
 * listening on localhost:3055. brik-mini is headless, so that path can never
 * run on the primary host — `lsof -nP -iTCP:3055` returns nothing there.
 *
 * The REST Variables API is not the escape hatch: GET
 * /v1/files/:key/variables/local requires "a Full seat in an Enterprise org"
 * (developers.figma.com/docs/rest-api/variables, read 2026-09-09) and Brik is
 * on Pro. It answers 403 regardless of token.
 *
 * What DOES work headless is the Figma MCP `use_figma` tool: the same Plugin
 * API surface the relay exposes, reached by `fileKey`, with no Desktop app and
 * no local port. It is an MCP tool, so the agent calls it rather than a shell —
 * which makes this a capture-then-merge script rather than a one-shot:
 *
 *   1. node scripts/pull-variables-headless.mjs --emit-code [--start=N]
 *        → prints the extraction JS. Pass it verbatim as `use_figma`'s `code`
 *          with `fileKey` set to the Library file, and save the returned JSON.
 *
 *   2. Repeat step 1 with --start=<the previous chunk's `sliceEnd`> until a
 *        chunk reports `sliceEnd === totalVariables`.
 *
 *   3. node scripts/pull-variables-headless.mjs <chunk...>.json -o dump.json
 *        → checks the chunks tile the variable list with no gap or overlap,
 *          then emits a pull-variables.js-shaped dump.
 *
 *   4. node scripts/sync-figma-mcp.js dump.json --library=brand-kit
 *        → unchanged. Step 3's output is the only thing this script promises;
 *          nothing downstream knows which transport produced the dump.
 *
 * ── Why chunks, and why the tiling check is load-bearing ───────────────────
 * An MCP tool result is capped at 20 KB; the Brand Kit serializes to ~68 KB, so
 * a single-call pull returns SILENTLY TRUNCATED JSON. That is the worst possible
 * input to this pipeline: sync-figma-mcp.js prunes any leaf a touched set did
 * not produce (brik-bds#754), so a dump missing its tail reads as "the designer
 * deleted these" and deletes them. The extraction therefore emits a byte-budgeted
 * slice with explicit `sliceStart`/`sliceEnd`/`totalVariables`, and step 3
 * refuses to emit a dump unless the slices cover [0, totalVariables) exactly.
 * Truncation becomes a hard error instead of a deletion.
 *
 * ── What the extraction normalizes, and what it deliberately does not ──────
 * Colors are emitted as hex because the float RGBA Figma returns is ~9x larger
 * per value and sync-figma-mcp.js accepts a hex string unchanged (`resolveValue`,
 * sync-figma-mcp.js:412-415). Aliases are passed through as Figma's own
 * `{ type: 'VARIABLE_ALIAS', id }` — sync-figma-mcp.js:418 already resolves that
 * shape, and re-encoding it here would be a second copy of logic that can drift.
 *
 * Usage:
 *   node scripts/pull-variables-headless.mjs --emit-code [--start=N] [--budget=N]
 *   node scripts/pull-variables-headless.mjs <chunk.json>... [-o <out.json>]
 *
 * Flags:
 *   --emit-code       Print the `use_figma` extraction JS and exit
 *   --start=N         Variable index the emitted extraction begins at (default 0)
 *   --budget=N        Serialized-byte budget per chunk (default 14000, under the
 *                     20 KB MCP result cap with room for the envelope)
 *   -o <path>         Write the dump to a file instead of stdout
 *
 * Zero dependencies — Node.js stdlib only.
 */

import fs from 'node:fs';

// ─── Parse CLI args ──────────────────────────────────────────────

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};

// ─── The extraction, verbatim ────────────────────────────────────
//
// Kept as source rather than prose so `--emit-code` and the contract this
// script validates can never disagree. Emits the FLAT shape sync-figma-mcp.js
// documents as shape 1 (sync-figma-mcp.js:22-27) — a top-level `variables[]`
// whose entries carry their own `collection` — so no normalization pass runs
// between here and the patch routine.
function extractionCode(start, budget) {
  return `const START = ${start};
const BUDGET = ${budget};

const cols = await figma.variables.getLocalVariableCollectionsAsync();
const vars = await figma.variables.getLocalVariablesAsync();

// Stable total order: collection declaration order, then variable id. Chunks are
// sliced from this list across separate tool calls, so the order must not depend
// on anything that could vary between them.
const ordered = [];
for (const c of cols) {
  const mine = vars.filter(v => v.variableCollectionId === c.id);
  mine.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  for (const v of mine) ordered.push({ v, collection: c.name });
}

const to255 = (x) => Math.round(Math.max(0, Math.min(1, x)) * 255);
const rgbaToHex = ({ r, g, b, a }) => {
  const hex = [to255(r), to255(g), to255(b)].map(n => n.toString(16).padStart(2, '0')).join('');
  return a < 1 ? '#' + hex + to255(a).toString(16).padStart(2, '0') : '#' + hex;
};

const pack = ({ v, collection }) => {
  const valuesByMode = {};
  for (const [modeId, val] of Object.entries(v.valuesByMode || {})) {
    valuesByMode[modeId] =
      (val && typeof val === 'object' && typeof val.r === 'number') ? rgbaToHex(val) : val;
  }
  return {
    id: v.id,
    name: v.name,
    resolvedType: v.resolvedType,
    collection,
    description: v.description || '',
    scopes: v.scopes || [],
    valuesByMode,
  };
};

const slice = [];
let bytes = 0;
let i = START;
for (; i < ordered.length; i++) {
  const p = pack(ordered[i]);
  const size = JSON.stringify(p).length;
  if (slice.length > 0 && bytes + size > BUDGET) break;
  slice.push(p);
  bytes += size;
}

return JSON.stringify({
  totalVariables: ordered.length,
  sliceStart: START,
  sliceEnd: i,
  collections: cols.map(c => ({
    name: c.name,
    modes: c.modes.map(m => ({ modeId: m.modeId, name: m.name })),
  })),
  variables: slice,
});`;
}

if (args.includes('--emit-code')) {
  const start = Number(flag('start', '0'));
  const budget = Number(flag('budget', '14000'));
  if (!Number.isInteger(start) || start < 0) {
    console.error('ERROR: --start must be a non-negative integer');
    process.exit(1);
  }
  if (!Number.isInteger(budget) || budget < 1000) {
    console.error('ERROR: --budget must be an integer >= 1000');
    process.exit(1);
  }
  process.stdout.write(extractionCode(start, budget) + '\n');
  process.exit(0);
}

const outIdx = args.indexOf('-o');
const outFile = outIdx !== -1 ? args[outIdx + 1] : null;
// Skip `-o`'s value, but only when `-o` is actually present — with no `-o`,
// indexOf returns -1 and a naive `i !== outIdx + 1` drops argv[0], silently
// eating the first chunk.
const outValueIdx = outIdx === -1 ? -1 : outIdx + 1;
const inputFiles = args.filter((a, i) => !a.startsWith('-') && i !== outValueIdx);

if (inputFiles.length === 0) {
  console.error('Usage: node scripts/pull-variables-headless.mjs <chunk.json>... [-o <out.json>]');
  console.error('       node scripts/pull-variables-headless.mjs --emit-code [--start=N]');
  process.exit(1);
}

// ─── Read the chunks ─────────────────────────────────────────────
//
// `use_figma` returns the extraction's return value, so a saved chunk is either
// the JSON object itself or the JSON string it returned. Accept both — whoever
// pastes a raw tool result should not have to know which.

function readChunk(file) {
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    console.error(`ERROR: ${file} is not readable JSON: ${err.message}`);
    process.exit(1);
  }
  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed);
    } catch (err) {
      console.error(`ERROR: ${file} holds a string that is not JSON: ${err.message}`);
      process.exit(1);
    }
  }
  return parsed;
}

const chunks = inputFiles.map((f) => ({ file: f, data: readChunk(f) }));
const errors = [];

// ─── Check the chunks tile the variable list exactly ─────────────

const totals = new Set(chunks.map((c) => c.data?.totalVariables));
if (totals.size !== 1 || ![...totals][0] || !Number.isInteger([...totals][0])) {
  errors.push(
    `chunks disagree on \`totalVariables\` (${[...totals].join(', ')}) — they are from different pulls`
  );
}
const totalVariables = [...totals][0];

const sorted = [...chunks].sort((a, b) => a.data.sliceStart - b.data.sliceStart);
let cursor = 0;
for (const { file, data } of sorted) {
  if (!Number.isInteger(data.sliceStart) || !Number.isInteger(data.sliceEnd)) {
    errors.push(`${file}: missing \`sliceStart\`/\`sliceEnd\` — not extraction output`);
    continue;
  }
  if (data.sliceStart !== cursor) {
    errors.push(
      data.sliceStart > cursor
        ? `gap: variables [${cursor}, ${data.sliceStart}) are in no chunk — re-run --emit-code --start=${cursor}`
        : `overlap: ${file} restarts at ${data.sliceStart} but ${cursor} was already covered`
    );
  }
  if (!Array.isArray(data.variables) || data.variables.length !== data.sliceEnd - data.sliceStart) {
    errors.push(
      `${file}: holds ${data.variables?.length ?? 0} variable(s) but claims [${data.sliceStart}, ${data.sliceEnd}) — TRUNCATED`
    );
  }
  cursor = Math.max(cursor, data.sliceEnd);
}
if (Number.isInteger(totalVariables) && cursor !== totalVariables) {
  errors.push(
    `chunks cover ${cursor} of ${totalVariables} variable(s) — re-run --emit-code --start=${cursor} for the rest`
  );
}

// ─── Validate the merged content ─────────────────────────────────

const collections = sorted[0]?.data?.collections;
if (!Array.isArray(collections) || collections.length === 0) {
  errors.push('missing `collections` — the first chunk is not extraction output');
}

const modeIdsByCollection = new Map();
for (const col of collections ?? []) {
  if (typeof col?.name !== 'string' || !col.name) {
    errors.push('a collection is missing `name`');
    continue;
  }
  if (!Array.isArray(col.modes) || col.modes.length === 0) {
    errors.push(`collection ${col.name}: missing \`modes\``);
    continue;
  }
  const ids = new Set();
  for (const m of col.modes) {
    if (typeof m?.modeId !== 'string' || typeof m?.name !== 'string') {
      errors.push(`collection ${col.name}: a mode is missing \`modeId\` or \`name\``);
    } else {
      ids.add(m.modeId);
    }
  }
  modeIdsByCollection.set(col.name, ids);
}

const variables = sorted.flatMap((c) => c.data.variables ?? []);
const seenIds = new Set();
const aliasRefs = [];

for (const v of variables) {
  if (typeof v?.id !== 'string' || typeof v?.name !== 'string') {
    errors.push('a variable is missing `id` or `name`');
    continue;
  }
  if (seenIds.has(v.id)) {
    errors.push(`${v.name}: duplicate variable id ${v.id} — chunks overlap`);
  }
  seenIds.add(v.id);
  if (typeof v.resolvedType !== 'string') errors.push(`${v.name}: missing \`resolvedType\``);
  if (typeof v.collection !== 'string') {
    errors.push(`${v.name}: missing \`collection\``);
    continue;
  }
  const modeIds = modeIdsByCollection.get(v.collection);
  if (!modeIds) {
    errors.push(`${v.name}: collection "${v.collection}" is not in the collections list`);
    continue;
  }
  if (!v.valuesByMode || typeof v.valuesByMode !== 'object') {
    errors.push(`${v.name}: missing \`valuesByMode\``);
    continue;
  }
  // Every mode the collection declares must carry a value. A variable short a
  // mode is how a half-captured dark ramp would otherwise slip through.
  for (const modeId of modeIds) {
    if (!(modeId in v.valuesByMode)) errors.push(`${v.collection}/${v.name}: no value for mode ${modeId}`);
  }
  for (const [modeId, val] of Object.entries(v.valuesByMode)) {
    if (!modeIds.has(modeId)) errors.push(`${v.collection}/${v.name}: value keyed by unknown mode ${modeId}`);
    if (val && typeof val === 'object' && val.type === 'VARIABLE_ALIAS') {
      aliasRefs.push({ from: `${v.collection}/${v.name}`, modeId, id: val.id });
    }
  }
}

// An alias whose target is absent resolves to null in sync-figma-mcp.js and the
// token is skipped. Report it — but as a WARNING, because in this file it is the
// normal case, not a defect: the Brand Kit subscribes to the Foundations library,
// so its whole `spacing` / `border-width` / `border-radius` collections alias
// variables that live in another file. `getLocalVariablesAsync()` returns local
// variables only, exactly as the relay plugin's `get_variables` does, so both
// transports produce the same unresolved refs and sync-figma-mcp.js:691 already
// warns about them. Failing here would make a correct pull unusable.
//
// Figma keys an imported variable `VariableID:<file-hash>/<id>`; a purely local
// id has no slash. The split matters: an external ref is a subscription to
// resolve in the OTHER library's pull, while a local one is a variable that was
// deleted out from under the alias.
const dangling = aliasRefs.filter((a) => !seenIds.has(a.id));
const external = dangling.filter((d) => d.id.includes('/'));
const localDangling = dangling.filter((d) => !d.id.includes('/'));
if (external.length > 0) {
  const names = [...new Set(external.map((d) => d.from))];
  console.error(
    `NOTE: ${external.length} alias(es) across ${names.length} variable(s) point at a subscribed library; ` +
      `they resolve when that library is pulled into its own --library target.`
  );
}
if (localDangling.length > 0) {
  const lines = localDangling.slice(0, 10).map((d) => `  ${d.from} [${d.modeId}] → ${d.id}`);
  console.error(
    `WARNING: ${localDangling.length} alias(es) point at a LOCAL variable that is not in this file:\n${lines.join('\n')}\n` +
      '  These were deleted in Figma while an alias still referenced them; sync-figma-mcp.js will skip the token.'
  );
}

if (errors.length > 0) {
  console.error(`ERROR: capture failed validation (${errors.length} problem(s)):`);
  for (const e of errors.slice(0, 25)) console.error(`  - ${e}`);
  if (errors.length > 25) console.error(`  … ${errors.length - 25} more`);
  process.exit(1);
}

// ─── Emit ────────────────────────────────────────────────────────
//
// Rekey each variable's values from modeId to mode NAME. The relay's dump is
// mode-name-keyed (sync-figma-mcp.js:26) and the set keys in the Library file
// are `{collection}/{modeName}`, so doing it here keeps the emitted dump on the
// documented shape 1 rather than relying on the nested-shape normalizer.

const modeNameById = new Map();
for (const col of collections) {
  for (const m of col.modes) modeNameById.set(`${col.name} ${m.modeId}`, m.name);
}

const dump = {
  totalCollections: collections.length,
  totalVariables: variables.length,
  collections: collections.map((c) => ({ name: c.name, modes: c.modes })),
  variables: variables.map((v) => ({
    id: v.id,
    name: v.name,
    resolvedType: v.resolvedType,
    collection: v.collection,
    description: v.description ?? '',
    scopes: v.scopes ?? [],
    valuesByMode: Object.fromEntries(
      Object.entries(v.valuesByMode).map(([modeId, val]) => [
        modeNameById.get(`${v.collection} ${modeId}`) ?? modeId,
        val,
      ])
    ),
  })),
};

const json = JSON.stringify(dump, null, 2);
if (outFile) {
  fs.writeFileSync(outFile, json + '\n');
  console.error(`✓ ${dump.totalVariables} variable(s), ${dump.totalCollections} collection(s) → ${outFile}`);
} else {
  process.stdout.write(json + '\n');
  console.error(`✓ ${dump.totalVariables} variable(s), ${dump.totalCollections} collection(s)`);
}
