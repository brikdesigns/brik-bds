#!/usr/bin/env node
/**
 * lint-consumer-shadows — fails a consumer repo that re-creates a BDS component (#2702).
 *
 * Consumers redefine BDS primitives under BDS names (a local `Field`, `Divider`,
 * `Skeleton`, `Icon`) or hand-apply a BDS root class (`className="bds-button …"` on a
 * `next/link`), and nothing catches it. Two rules:
 *
 *   shadow-component   a component DEFINED in the consumer whose name is a BDS export.
 *                      Exempt when the same file imports that name from
 *                      `@brikdesigns/bds` — that is a thin wrapper, not a copy.
 *   hand-applied-class a BDS component ROOT class (`bds-button`, `bds-icon-button`…)
 *                      written as a class string outside BDS. Modifiers (`bds-button--md`)
 *                      and elements (`bds-button__content`) alone are not flagged, and
 *                      neither is a CSS selector (`.bds-button`).
 *
 * The export list is the shipped `dist/bds-manifest.json`, the same file `bds-find` reads.
 * Ships from BDS as one CLI so every consumer runs the identical rule.
 *
 * Baseline that can only shrink (same shape of contract as tokens/naming-canon-baseline.json):
 * known violations live in a `--baseline` file keyed by file + rule + name, with a count.
 * A violation beyond the baseline fails; a baseline entry that no longer violates ALSO
 * fails (stale), so an entry cannot outlive its fix. `--write-baseline` refuses to add or
 * grow an entry once the file exists.
 *
 * Escape hatch: `bds-lint-ignore <rule> — <reason>` on the offending line or the line above.
 * A bare marker is rejected (#1469).
 *
 * Usage:
 *   lint-consumer-shadows [path...]                 default: ./src
 *   lint-consumer-shadows src --baseline .bds-shadow-baseline.json
 *   lint-consumer-shadows src --baseline <f> --write-baseline
 *   lint-consumer-shadows --manifest <file>         override the manifest
 *
 * Exit: 0 clean · 1 violations / stale baseline · 2 bad invocation or unreadable manifest.
 */
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const GREEN = '\x1b[32m';
const DIM = '\x1b[2m';
const NC = '\x1b[0m';

const SKIP_DIRS = new Set(['node_modules', 'dist', 'build', 'out', 'coverage', '.next', '.git', '.astro']);
const SOURCE_EXT = /\.(?:tsx|ts|jsx|js|mjs)$/;
const SKIP_FILE = /\.(?:d\.ts|test\.[a-z]+|spec\.[a-z]+|stories\.[a-z]+)$/;
const BDS_SPECIFIER = /^@brikdesigns\/bds(?:\/|$)/;

function fail(message) {
  process.stderr.write(`lint-consumer-shadows: ${message}\n`);
  process.exit(2);
}

function parseArgs(argv) {
  const opts = { paths: [], manifest: null, baseline: null, writeBaseline: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--manifest') opts.manifest = argv[++i];
    else if (a === '--baseline') opts.baseline = argv[++i];
    else if (a === '--write-baseline') opts.writeBaseline = true;
    else if (a.startsWith('--')) fail(`unknown flag ${a}`);
    else opts.paths.push(a);
  }
  if (opts.paths.length === 0) opts.paths.push('src');
  if (opts.writeBaseline && !opts.baseline) fail('--write-baseline needs --baseline <file>');
  return opts;
}

/** `{ exports: Set<Name>, roots: Set<'bds-button'> }` from the shipped manifest. */
function loadManifest(path) {
  if (!existsSync(path)) {
    fail(`manifest not found at ${path} (BDS: npm run build:inspector-manifest)`);
  }
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(path, 'utf8'));
  } catch (err) {
    fail(`cannot parse ${path}: ${err.message}`);
  }
  const components = Object.values(manifest.components ?? {});
  return {
    exports: new Set(components.map((c) => c.name)),
    roots: new Set(components.map((c) => c.class_prefix).filter(Boolean)),
  };
}

function sourceFiles(root) {
  if (!existsSync(root)) fail(`path not found: ${root}`);
  if (statSync(root).isFile()) return [root];
  const out = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) walk(join(dir, entry.name));
      } else if (SOURCE_EXT.test(entry.name) && !SKIP_FILE.test(entry.name)) {
        out.push(join(dir, entry.name));
      }
    }
  };
  walk(root);
  return out;
}

/** Names this file imports AS THEMSELVES from `@brikdesigns/bds` — `{ Field }` or `{ Field as X }` source name. */
function bdsImportedNames(source) {
  const names = new Set();
  const importRe = /import\s+(?:type\s+)?(?:[\w$]+\s*,\s*)?\{([^}]*)\}\s*from\s*['"]([^'"]+)['"]/g;
  for (const m of source.matchAll(importRe)) {
    if (!BDS_SPECIFIER.test(m[2])) continue;
    for (const spec of m[1].split(',')) {
      const original = spec.trim().replace(/^type\s+/, '').split(/\s+as\s+/)[0].trim();
      if (original) names.add(original);
    }
  }
  return names;
}

const DEFINITION_RES = [
  /^\s*(?:export\s+)?(?:default\s+)?(?:async\s+)?function\s*\*?\s*([A-Z][\w$]*)\s*[(<]/,
  /^\s*(?:export\s+)?(?:default\s+)?class\s+([A-Z][\w$]*)\b/,
  /^\s*(?:export\s+)?(?:const|let|var)\s+([A-Z][\w$]*)\s*(?::[^=]+)?=/,
];

/** `bds-lint-ignore <rule> — <reason>` on this line or the one above. */
function ignoreState(lines, i, rule) {
  for (const line of [lines[i], lines[i - 1]]) {
    if (!line || !line.includes('bds-lint-ignore')) continue;
    const after = line.slice(line.indexOf('bds-lint-ignore') + 'bds-lint-ignore'.length);
    const reason = after.replace(/\*\/|-->/g, '').replace(new RegExp(`^\\s*${rule}\\b`), '').replace(/^[\s—:–-]+/, '').trim();
    return reason ? 'ignored' : 'bare';
  }
  return null;
}

/** `const X = dynamic(…)` / `lazy(…)` only defers an import — the definition lives in the imported file, which is scanned itself. */
const DEFERRED_RHS = /=\s*(?:React\.)?(?:dynamic|lazy)\s*\(/;
/** Next metadata routes default-export a function that is never imported by name (`export default function Image`). */
const NEXT_METADATA_FILE = /^(?:opengraph-image|twitter-image|icon|apple-icon)\.[a-z]+$/;

const isComment = (line) => /^\s*(?:\/\/|\/\*|\*)/.test(line);

function scanFile(path, rel, { exports, roots }) {
  const source = readFileSync(path, 'utf8');
  const lines = source.split('\n');
  const imported = bdsImportedNames(source);
  const found = [];

  // A class root counts only as a whole class-list token: quoted/space-delimited and not a
  // CSS selector (`.bds-button`) — so `bds-button--md`, `bds-button__content` and prose
  // after a dot never match on their own.
  const rootRe = /(?<![\w.-])(bds-[a-z0-9]+(?:-[a-z0-9]+)*)(?![\w-]|__)/g;

  lines.forEach((line, i) => {
    if (isComment(line)) return;
    const hits = [];
    for (const re of DEFINITION_RES) {
      const m = re.exec(line);
      if (!m || !exports.has(m[1]) || imported.has(m[1])) continue;
      if (DEFERRED_RHS.test(line)) continue;
      if (/\bexport\s+default\b/.test(line) && NEXT_METADATA_FILE.test(basename(path))) continue;
      hits.push({ rule: 'shadow-component', name: m[1] });
      break;
    }
    for (const m of line.matchAll(rootRe)) {
      if (roots.has(m[1]) && /["'`]/.test(line)) hits.push({ rule: 'hand-applied-class', name: m[1] });
    }
    for (const hit of hits) {
      const state = ignoreState(lines, i, hit.rule);
      if (state === 'ignored') continue;
      found.push({ file: rel, line: i + 1, bare: state === 'bare', ...hit });
    }
  });
  return found;
}

const keyOf = (v) => `${v.file}|${v.rule}|${v.name}`;

function tally(violations) {
  const counts = {};
  for (const v of violations) counts[keyOf(v)] = (counts[keyOf(v)] ?? 0) + 1;
  return counts;
}

function readBaseline(path) {
  if (!path || !existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf8')).entries ?? {};
  } catch (err) {
    return fail(`cannot parse baseline ${path}: ${err.message}`);
  }
}

const opts = parseArgs(process.argv.slice(2));
const manifest = loadManifest(resolve(opts.manifest ?? join(HERE, '..', 'dist', 'bds-manifest.json')));
const cwd = process.cwd();

const files = opts.paths.flatMap((p) => sourceFiles(resolve(p)));
const violations = files.flatMap((f) => scanFile(f, relative(cwd, f), manifest));
const counts = tally(violations);
const baseline = readBaseline(opts.baseline);

if (opts.writeBaseline) {
  if (baseline) {
    const grown = Object.entries(counts).filter(([k, n]) => n > (baseline[k] ?? 0)).map(([k]) => k);
    if (grown.length) {
      process.stderr.write(`lint-consumer-shadows: refusing to grow the baseline — it can only shrink:\n`);
      grown.forEach((k) => process.stderr.write(`  + ${k}\n`));
      process.exit(2);
    }
  }
  const entries = Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(
    opts.baseline,
    JSON.stringify(
      {
        $comment:
          'Known BDS shadow violations (lint-consumer-shadows, brik-bds#2702). THIS FILE CAN ONLY SHRINK: a new violation fails the gate, and so does an entry that no longer violates. Adding a row to keep a new violation green defeats the gate.',
        entries,
      },
      null,
      2,
    ) + '\n',
  );
  console.log(`${GREEN}✓${NC} wrote ${opts.baseline}: ${Object.keys(entries).length} entr${Object.keys(entries).length === 1 ? 'y' : 'ies'}.`);
  process.exit(0);
}

const allowed = baseline ?? {};
const excess = [];
const seen = {};
for (const v of violations) {
  const k = keyOf(v);
  seen[k] = (seen[k] ?? 0) + 1;
  if (v.bare || seen[k] > (allowed[k] ?? 0)) excess.push(v);
}
const stale = Object.entries(allowed).filter(([k, n]) => (counts[k] ?? 0) < n).map(([k]) => k);

if (excess.length === 0 && stale.length === 0) {
  const baselined = violations.length;
  console.log(
    `${GREEN}✓${NC} lint-consumer-shadows: ${files.length} file(s) scanned, no new shadows${baselined ? ` (${baselined} baselined)` : ''}.`,
  );
  process.exit(0);
}

const LABEL = {
  'shadow-component': 'defines a component named like a BDS export — import it from @brikdesigns/bds, or wrap it (import the BDS one and compose)',
  'hand-applied-class': 'hand-applies a BDS root class — render the BDS component instead of copying its class',
};
console.log(`\n${RED}✗ lint-consumer-shadows: ${excess.length} new violation(s), ${stale.length} stale baseline entr${stale.length === 1 ? 'y' : 'ies'}${NC}\n`);
for (const v of excess) {
  console.log(`  ${v.file}:${v.line}  ${RED}${v.rule}${NC}  ${v.name}`);
  console.log(`      ${LABEL[v.rule]}`);
  if (v.bare) console.log(`      ${YELLOW}bds-lint-ignore needs a reason: \`bds-lint-ignore ${v.rule} — <why>\`${NC}`);
}
for (const k of stale) {
  console.log(`  ${YELLOW}stale baseline${NC}  ${k}  ${DIM}no longer violates — remove it (rerun with --write-baseline)${NC}`);
}
console.log();
process.exit(1);
