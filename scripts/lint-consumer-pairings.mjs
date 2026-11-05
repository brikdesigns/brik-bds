#!/usr/bin/env node
/**
 * lint-consumer-pairings — fails a consumer repo whose CSS composes a color pairing the
 * BDS contrast contract does not clear (#1155).
 *
 * The contract (`tokens/contrast-pairings.json`, gated by `npm run contrast-gate`) scores
 * BDS's OWN token resolutions. A consumer that reassigns a `--bds-surface-*` /
 * `--bds-background-*` token, or hard-codes a raw color on one, creates a pairing the gate
 * never saw; the consumer's axe run was the first thing to catch it (brikdesigns#676,
 * `#bdbdbd` on `#4f4f4f` = 4.35:1). Two rules:
 *
 *   pairing-fails        a `--bds-*` override changes a color that a contract pairing uses
 *                        as fg or bg, and the pair, re-scored with the consumer's value,
 *                        falls below that pairing's FLOOR. The floor is the gate's, not
 *                        the aspiration: AA-large rows 3:1, every other row 4.5:1 (AAA is
 *                        a non-blocking aim — validate-themes.js, ADR-015).
 *   unvalidated-surface  a raw color (hex / rgb()) assigned to a `--bds-surface-*` /
 *                        `--bds-background-*` / `--bds-page-*` token that NO contract
 *                        pairing uses as a background: nothing says any text is legible on it.
 *
 * Reads the shipped `dist/contrast-pairings.resolved.json` (generated from the dataset by
 * `validate-themes.js --emit-resolved`) — one row per pairing x mode, with the hex BDS
 * resolves each token to. A `[data-theme="dark"]` / `.dark` / `prefers-color-scheme: dark`
 * scope is the dark mode; an override anywhere else applies to both modes unless a dark
 * scope also sets it. Faded (`alpha`) and translucent-foreground pairings are not
 * re-scored: they composite onto a backdrop and no token holds the result.
 *
 * Same baseline contract as lint-consumer-shadows: known violations live in a `--baseline`
 * file keyed by file + rule + name; one beyond it fails, a stale entry fails, and
 * `--write-baseline` refuses to add or grow an entry once the file exists.
 *
 * Escape hatch: `bds-lint-ignore <rule> — <reason> #<issue>` on the offending line or the
 * line above. The reason must carry an issue ref; a marker without one is rejected.
 *
 * Usage:
 *   lint-consumer-pairings [path...]                default: ./src
 *   lint-consumer-pairings src --baseline .bds-pairings-baseline.json
 *   lint-consumer-pairings src --baseline <f> --write-baseline
 *   lint-consumer-pairings --pairings <file>        override the resolved dataset
 *
 * Exit: 0 clean · 1 violations / stale baseline · 2 bad invocation or unreadable dataset.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { contrastRatio, toRgb } from './lib/wcag.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));

const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const GREEN = '\x1b[32m';
const DIM = '\x1b[2m';
const NC = '\x1b[0m';

const SKIP_DIRS = new Set(['node_modules', 'dist', 'build', 'out', 'coverage', '.next', '.git', '.astro']);
const SOURCE_EXT = /\.css$/;
const DARK_SCOPE = /data-theme\s*=\s*["']?dark|(?:^|[\s.:])dark\b|prefers-color-scheme\s*:\s*dark/;
const SURFACE_TOKEN = /^--bds-(?:surface|background|page)-/;
const MODES = ['light', 'dark'];

function fail(message) {
  process.stderr.write(`lint-consumer-pairings: ${message}\n`);
  process.exit(2);
}

function parseArgs(argv) {
  const opts = { paths: [], pairings: null, baseline: null, writeBaseline: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--pairings') opts.pairings = argv[++i];
    else if (a === '--baseline') opts.baseline = argv[++i];
    else if (a === '--write-baseline') opts.writeBaseline = true;
    else if (a.startsWith('--')) fail(`unknown flag ${a}`);
    else opts.paths.push(a);
  }
  if (opts.paths.length === 0) opts.paths.push('src');
  if (opts.writeBaseline && !opts.baseline) fail('--write-baseline needs --baseline <file>');
  return opts;
}

function loadPairings(path) {
  if (!existsSync(path)) {
    fail(`resolved pairings not found at ${path} (BDS: npm run build:contrast-pairings)`);
  }
  try {
    const data = JSON.parse(readFileSync(path, 'utf8'));
    if (!Array.isArray(data.rows) || !data.colors) fail(`${path} is not a resolved pairing set (no rows / colors)`);
    return data;
  } catch (err) {
    return fail(`cannot parse ${path}: ${err.message}`);
  }
}

function cssFiles(root) {
  if (!existsSync(root)) fail(`path not found: ${root}`);
  const out = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) walk(join(dir, entry.name));
      } else if (SOURCE_EXT.test(entry.name)) {
        out.push(join(dir, entry.name));
      }
    }
  };
  if (SOURCE_EXT.test(root)) return [root];
  walk(root);
  return out;
}

/** Blank comment bodies, keeping offsets — a comment that names a token must not mint a declaration. */
const blankComments = (src) => src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));

/** Every `--bds-*` declaration in a file: `{ name, value, mode, line }`. */
function declarations(source) {
  const css = blankComments(source);
  const out = [];
  const stack = [];
  let start = 0;
  const lineAt = (offset) => css.slice(0, offset).split('\n').length;
  const take = (end) => {
    const raw = css.slice(start, end);
    const m = raw.match(/^\s*(--bds-[\w-]+)\s*:\s*([\s\S]+?)\s*$/);
    if (m) {
      const offset = start + raw.indexOf(m[1]);
      out.push({ name: m[1], value: m[2], mode: stack.some((s) => DARK_SCOPE.test(s)) ? 'dark' : 'light', line: lineAt(offset) });
    }
  };
  for (let i = 0; i < css.length; i++) {
    const c = css[i];
    if (c === '{') {
      stack.push(css.slice(start, i).trim());
      start = i + 1;
    } else if (c === '}') {
      take(i);
      stack.pop();
      start = i + 1;
    } else if (c === ';') {
      take(i);
      start = i + 1;
    }
  }
  return out;
}

/** `bds-lint-ignore <rule> — <reason> #N` on this line or the one above (original text, comments intact). */
function ignoreState(lines, i, rule) {
  for (const line of [lines[i], lines[i - 1]]) {
    if (!line || !line.includes('bds-lint-ignore')) continue;
    const after = line.slice(line.indexOf('bds-lint-ignore') + 'bds-lint-ignore'.length);
    const reason = after.replace(/\*\/|-->/g, '').replace(new RegExp(`^\\s*${rule}\\b`), '').replace(/^[\s—:–-]+/, '').trim();
    return /#\d+/.test(reason) ? 'ignored' : 'bare';
  }
  return null;
}

const keyOf = (v) => `${v.file}|${v.rule}|${v.name}`;
const RAW_COLOR = (v) => !/^var\(/.test(v) && toRgb(v) !== null;

function scan(files, data, cwd) {
  const barePairs = new Set(data.rows.map((r) => r.bg));
  const hits = [];
  const unscored = [];

  // Pass 1: the consumer's effective override map, per mode (a dark scope shadows the base).
  const over = { light: {}, dark: {} };
  const perFile = files.map((file) => {
    const source = readFileSync(file, 'utf8');
    const decls = declarations(source);
    for (const d of decls) over[d.mode][d.name] = { ...d, file: relative(cwd, file) };
    return { file: relative(cwd, file), lines: source.split('\n'), decls };
  });
  const effective = (name, mode) => (mode === 'dark' ? over.dark[name] ?? over.light[name] : over.light[name]) ?? null;

  /** A consumer value as a color BDS can score, or null. */
  const colorOf = (value, mode, depth = 0) => {
    if (depth > 8) return null;
    if (toRgb(value) !== null) return value;
    const m = value.match(/^var\(\s*(--[\w-]+)\s*(?:,\s*([\s\S]+))?\)$/);
    if (!m) return null;
    const own = effective(m[1], mode);
    if (own) return colorOf(own.value, mode, depth + 1);
    return data.colors[mode]?.[m[1]] ?? (m[2] ? colorOf(m[2].trim(), mode, depth + 1) : null);
  };

  for (const { file, lines, decls } of perFile) {
    const push = (d, rule, name, extra) => {
      const state = ignoreState(lines, d.line - 1, rule);
      if (state === 'ignored') return;
      hits.push({ file, line: d.line, rule, name, bare: state === 'bare', ...extra });
    };

    for (const d of decls) {
      if (SURFACE_TOKEN.test(d.name) && RAW_COLOR(d.value) && !barePairs.has(d.name)) {
        push(d, 'unvalidated-surface', d.name, { value: d.value });
      }
    }

    // pairing-fails: attribute to the bg override when there is one, else the fg override.
    for (const row of data.rows) {
      const bgOver = effective(row.bg, row.mode);
      const fgOver = effective(row.fg, row.mode);
      const site = bgOver ?? fgOver;
      if (!site || site.file !== file) continue;
      const bg = bgOver ? colorOf(bgOver.value, row.mode) : row.bgValue;
      const fg = fgOver ? colorOf(fgOver.value, row.mode) : row.fgValue;
      if (!bg || !fg) {
        unscored.push(`${file}:${site.line} ${site.name}`);
        continue;
      }
      const ratio = contrastRatio(fg, bg);
      if (ratio >= row.floor) continue;
      push(site, 'pairing-fails', `${row.fg} on ${row.bg} (${row.mode})`, {
        ratio: Math.round(ratio * 100) / 100,
        floor: row.floor,
        thresholdType: row.thresholdType,
        fg,
        bg,
      });
    }
  }
  return { hits, unscored: [...new Set(unscored)] };
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
const data = loadPairings(resolve(opts.pairings ?? join(HERE, '..', 'dist', 'contrast-pairings.resolved.json')));
const cwd = process.cwd();
const files = opts.paths.flatMap((p) => cssFiles(resolve(p)));
const { hits, unscored } = scan(files, data, cwd);

// One violation per (file, rule, name): the same pairing seen from two modes is two names, but a
// repeated row must not double-count.
const seenKeys = new Set();
const violations = hits.filter((v) => {
  const k = `${keyOf(v)}|${v.line}`;
  if (seenKeys.has(k)) return false;
  seenKeys.add(k);
  return true;
});

const counts = {};
for (const v of violations) counts[keyOf(v)] = (counts[keyOf(v)] ?? 0) + 1;
const baseline = readBaseline(opts.baseline);

if (opts.writeBaseline) {
  if (baseline) {
    const grown = Object.entries(counts).filter(([k, n]) => n > (baseline[k] ?? 0)).map(([k]) => k);
    if (grown.length) {
      process.stderr.write(`lint-consumer-pairings: refusing to grow the baseline — it can only shrink:\n`);
      grown.forEach((k) => process.stderr.write(`  + ${k}\n`));
      process.exit(2);
    }
  }
  const entries = Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(
    opts.baseline,
    JSON.stringify({ _comment: 'Known consumer pairing violations (lint-consumer-pairings, #1155). Can only shrink.', entries }, null, 2) + '\n',
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
  console.log(
    `${GREEN}✓${NC} lint-consumer-pairings: ${files.length} file(s) scanned, no failing pairings${violations.length ? ` (${violations.length} baselined)` : ''}.` +
      (unscored.length ? ` ${DIM}${unscored.length} override(s) not scoreable (non-color value).${NC}` : ''),
  );
  process.exit(0);
}

console.log(`\n${RED}✗ lint-consumer-pairings: ${excess.length} new violation(s), ${stale.length} stale baseline entr${stale.length === 1 ? 'y' : 'ies'}${NC}\n`);
for (const v of excess) {
  console.log(`  ${v.file}:${v.line}  ${RED}${v.rule}${NC}  ${v.name}`);
  if (v.rule === 'pairing-fails') {
    console.log(`      ${v.fg} on ${v.bg} = ${v.ratio}:1, below the ${v.thresholdType} floor ${v.floor}:1 — fix the value; never hand-edit hex at the consumer layer`);
  } else {
    console.log(`      raw ${v.value} on a surface no contract pairing validates — use a BDS token, or add the pairing to BDS first`);
  }
  if (v.bare) console.log(`      ${YELLOW}bds-lint-ignore needs a reason and an issue ref: \`bds-lint-ignore ${v.rule} — <why> #<issue>\`${NC}`);
}
for (const k of stale) {
  console.log(`  ${YELLOW}stale baseline${NC}  ${k}  ${DIM}no longer violates — remove it (rerun with --write-baseline)${NC}`);
}
console.log();
process.exit(1);
