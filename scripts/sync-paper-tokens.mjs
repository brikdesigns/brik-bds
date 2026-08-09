#!/usr/bin/env node
/**
 * sync-paper-tokens.mjs — seed BDS design tokens into a Paper (app.paper.design) file.
 *
 * Paper is another consumer of the Style Dictionary output: this parses the default
 * `:root {}` block of dist/tokens.css, maps each custom property to one of Paper's 10
 * token types, preserves `var()` aliases, and POSTs `create_tokens` to the local Paper
 * MCP relay. No separate Figma→Paper bridge — the source of truth stays dist/tokens.css.
 *
 * Usage:
 *   node scripts/sync-paper-tokens.mjs --dry-run                 # parse + report, no relay
 *   node scripts/sync-paper-tokens.mjs <paperFileId>            # seed the open Paper file
 *   node scripts/sync-paper-tokens.mjs <paperFileId> --css <path> --relay <url>
 *
 * Notes:
 *   - Scope is the default light `:root` only. Paper holds one flat token set (no theme
 *     switching), so dark-theme / mode-variant / brand-override blocks are intentionally skipped.
 *   - Props with no Paper type (shadow, duration, easing, blur, aspect, display) are skipped.
 *   - Tokens are keyed by name and reruns DUPLICATE — sync once per Paper file.
 *   - The relay requires the Paper desktop app open (default http://127.0.0.1:29979/mcp).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const flag = (name) => { const i = argv.indexOf(name); return i >= 0 ? (argv[i + 1] ?? true) : undefined; };
const DRY = argv.includes('--dry-run');
const cssPath = flag('--css') ?? path.join(HERE, '..', 'dist', 'tokens.css');
const relay = flag('--relay') ?? 'http://127.0.0.1:29979/mcp';
const fileId = argv.find((a) => !a.startsWith('--') && argv[argv.indexOf(a) - 1] !== '--css' && argv[argv.indexOf(a) - 1] !== '--relay');

if (!DRY && !fileId) {
  console.error('usage: sync-paper-tokens.mjs <paperFileId> | --dry-run  [--css <path>] [--relay <url>]');
  process.exit(1);
}

// ---- 1. parse the first (default light) :root {} block ----
const src = fs.readFileSync(cssPath, 'utf8');
const rootStart = src.indexOf(':root {');
if (rootStart < 0) { console.error(`no :root {} block found in ${cssPath}`); process.exit(1); }
let depth = 0, body = '';
for (let i = src.indexOf('{', rootStart); i < src.length; i++) {
  const c = src[i];
  if (c === '{') depth++;
  else if (c === '}') { depth--; if (depth === 0) break; }
  body += c;
}
const decls = [...body.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi)].map((m) => [m[1], m[2].trim()]);

// ---- 2. classify into Paper token types ----
const classify = (name, val) => {
  if (/^--font-family-/.test(name)) return 'fontFamily';
  if (/^--font-weight-/.test(name)) return 'fontWeight';
  if (/^--font-size-/.test(name)) return 'fontSize';
  if (/line-height/.test(name)) return 'lineHeight';
  if (/letter-spacing|tracking/.test(name)) return 'letterSpacing';
  if (/^--breakpoint-|^--(mobile|tablet|web)$/.test(name)) return 'breakpoint';
  if (/radius/.test(name) && !/blur/.test(name)) return 'radius';
  if (/border-width/.test(name)) return 'spacing';
  if (/^--(space|gap|padding|size|content)-/.test(name)) return 'spacing';
  if (/^--(color|background|text|surface|border|icon|page|label|body|heading|subtitle|title|state|tooltip)-/.test(name)
      && /^#|^rgb|^hsl|^oklch|^oklab|^var\(/.test(val)) return 'color';
  return null; // shadow / duration / easing / blur / aspect / display → no Paper type
};

const tokens = [];
for (const [name, val] of decls) {
  const type = classify(name, val);
  if (!type) continue;
  tokens.push({ type, name, value: type === 'fontWeight' ? (Number(val) || val) : val });
}
// raw values before var() aliases so alias targets already exist when referenced
tokens.sort((a, b) => (String(a.value).startsWith('var(') ? 1 : 0) - (String(b.value).startsWith('var(') ? 1 : 0));

const byType = tokens.reduce((m, t) => ((m[t.type] = (m[t.type] || 0) + 1), m), {});
console.log(`parsed ${decls.length} props → ${tokens.length} Paper tokens (${decls.length - tokens.length} skipped)`);
console.log(byType);

if (DRY) { console.log('\n--dry-run: no relay calls made.'); process.exit(0); }

// ---- 3. MCP streamable-HTTP client ----
let sid;
const rpc = async (method, params, id) => {
  const res = await fetch(relay, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
      'MCP-Protocol-Version': '2025-06-18',
      ...(sid ? { 'mcp-session-id': sid } : {}),
    },
    body: JSON.stringify({ jsonrpc: '2.0', ...(id != null ? { id } : {}), method, ...(params ? { params } : {}) }),
  });
  if (!sid && res.headers.get('mcp-session-id')) sid = res.headers.get('mcp-session-id');
  if (id == null) return null; // notification, no response body expected
  const text = await res.text();
  const line = text.split('\n').reverse().find((l) => l.startsWith('data:'));
  if (!line) throw new Error(`no SSE data frame in response: ${text.slice(0, 200)}`);
  return JSON.parse(line.slice(5).trim());
};

await rpc('initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'bds-paper-token-sync', version: '1.0' } }, 1);
await rpc('notifications/initialized', null, null);

// ---- 4. create tokens in batches ----
const BATCH = 120;
let created = 0;
const errors = [];
for (let i = 0; i < tokens.length; i += BATCH) {
  const batch = tokens.slice(i, i + BATCH);
  const res = await rpc('tools/call', { name: 'create_tokens', arguments: { fileId, tokens: batch } }, 100 + i);
  const payload = res?.result?.content?.[0]?.text;
  let rows = [];
  try {
    rows = JSON.parse(payload).tokens ?? [];
  } catch (e) {
    console.error(`batch ${i / BATCH + 1}: unparseable response — ${e.message}`, payload);
    errors.push({ batch: i / BATCH + 1, raw: payload });
    continue;
  }
  for (const row of rows) {
    if (row.result === 'created') created++;
    else errors.push(row);
  }
  console.log(`batch ${i / BATCH + 1}: ${created}/${tokens.length} created`);
}

console.log(`\nDONE: ${created}/${tokens.length} tokens created into Paper file ${fileId}`);
if (errors.length) {
  console.error(`${errors.length} error(s):`, errors.slice(0, 10));
  process.exit(1);
}
