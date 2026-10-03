#!/usr/bin/env node
/**
 * check-bds-binding — fails a consumer that overrides a pre-ADR-043 token name (#2720).
 *
 * From 0.195.0, BDS components read only `--bds-*` names (ADR-043). `prefix-bridge.css`
 * aliases each old name to its `--bds-` name, so a READ of `--text-primary` keeps
 * resolving. An OVERRIDE of `--text-primary` changes only the alias, though, and no BDS
 * component sees it. Typecheck and build stay green while themed pages render Brik
 * defaults: tncld#188 shipped exactly that, and its primary buttons went Poppy.
 *
 * Generalised from brikdesigns/tncld `scripts/check-bds-binding.mjs` (tncld#190), which is
 * itself brik-client-portal's `theme-bds-binding.test.ts` (#4454). Ships from BDS so every
 * consumer, and propagate.sh before it opens a bump, runs the identical rule.
 *
 *   old-name-override  a bridged old name declared with a value, in CSS / SCSS / Astro or as
 *                      an inline style key in TSX / JSX / TS / JS / Astro. Two shapes are
 *                      legal: the re-scope alias `--X: var(--bds-X)`, and a pair where the
 *                      same `{ … }` block also sets `--bds-X` (the old name then only
 *                      serves site code that still reads it).
 *   binding-shape      with `--theme <file>` only. Every `--bds-*` the theme declares must
 *                      be a real BDS name: a token in `tokens.css`, or a component hook
 *                      `styles.css` reads (`--bds-footer-surface`). With `--id <id>` other
 *                      than `bds`, it must also be bound in the ADR-043 § 6 shape
 *                      `--bds-X: var(--{id}-X)`, with `--{id}-X` declared in the same block.
 *                      For System ID `bds` the binding collapses to `--bds-X: value`, so any
 *                      value is legal.
 *
 * The bridge and token list are read from THIS package's `dist/`, so the check always
 * matches the BDS version the consumer has installed.
 *
 * Usage:
 *   bds-check-binding [path...]                       default: ./src, else .
 *   bds-check-binding src --theme src/styles/theme-tncld.css --id tncld
 *   bds-check-binding --bridge <f> --tokens <f> --styles <f>   override the dist/ inputs
 *
 * Exit: 0 clean · 1 violations · 2 bad invocation or unreadable bridge.
 */
import { existsSync, readFileSync, readdirSync, realpathSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const NC = '\x1b[0m';

const SKIP_DIRS = new Set(['node_modules', 'dist', 'build', 'out', 'coverage', '.next', '.git', '.astro', '.netlify']);
const CSS_EXT = /\.(?:css|scss|astro)$/;
const JS_EXT = /\.(?:tsx|jsx|ts|js|mjs|astro)$/;
const SKIP_FILE = /\.(?:d\.ts|test\.[a-z]+|spec\.[a-z]+|stories\.[a-z]+)$/;

// The last declaration in a block may omit its `;`, so `}` also terminates.
const DECL = /(--[a-z0-9-]+)\s*:\s*([^;{}]+)(?:;|(?=\}))/g;
// Inline style object keys: `'--text-primary': value` / `"--text-primary": value`.
const INLINE = /['"](--[a-z0-9-]+)['"]\s*:\s*([^,}\n]+)/g;
// A sanity floor: a moved or renamed bridge must fail loudly, not pass vacuously.
const MIN_BRIDGED = 500;

function fail(message) {
  process.stderr.write(`check-bds-binding: ${message}\n`);
  process.exit(2);
}

function parseArgs(argv) {
  const opts = {
    paths: [],
    bridge: join(HERE, '../dist/prefix-bridge.css'),
    tokens: join(HERE, '../dist/tokens.css'),
    styles: join(HERE, '../dist/styles.css'),
    theme: null,
    id: null,
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const value = () => {
      const v = argv[++i];
      if (!v || v.startsWith('--')) fail(`${arg} needs a value`);
      return v;
    };
    if (arg === '--bridge') opts.bridge = value();
    else if (arg === '--tokens') opts.tokens = value();
    else if (arg === '--styles') opts.styles = value();
    else if (arg === '--theme') opts.theme = value();
    else if (arg === '--id') opts.id = value();
    else if (arg === '--help' || arg === '-h') {
      process.stdout.write('Usage: bds-check-binding [path...] [--theme <file> [--id <system-id>]]\n');
      process.exit(0);
    } else if (arg.startsWith('--')) fail(`unknown flag ${arg}`);
    else opts.paths.push(arg);
  }
  if (opts.id && !opts.theme) fail('--id needs --theme');
  if (!opts.paths.length) opts.paths.push(existsSync('src') ? 'src' : '.');
  return opts;
}

/** Blank out comments without moving any offset, so line numbers stay true. */
const stripComments = (text) => text.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));

const lineOf = (text, index) => text.slice(0, index).split('\n').length;

/** The text of the innermost `{ … }` around `index`, or the whole file outside any block. */
function enclosingBlock(text, index) {
  let depth = 0;
  let open = -1;
  for (let i = index - 1; i >= 0; i--) {
    if (text[i] === '}') depth++;
    else if (text[i] === '{') {
      if (depth === 0) { open = i; break; }
      depth--;
    }
  }
  depth = 0;
  let close = text.length;
  for (let i = index; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}') {
      if (depth === 0) { close = i; break; }
      depth--;
    }
  }
  return text.slice(open + 1, close);
}

function readCss(file) {
  try {
    return stripComments(readFileSync(file, 'utf8'));
  } catch {
    fail(`cannot read ${file}`);
  }
}

/** Old (pre-ADR-043) name → the `--bds-` name the bridge aliases it to. */
function loadBridge(file) {
  const bridged = new Map();
  for (const [, name, value] of readCss(file).matchAll(DECL)) {
    const target = value.trim().match(/^var\((--bds-[a-z0-9-]+)\)$/)?.[1];
    if (target) bridged.set(name, target);
  }
  if (bridged.size < MIN_BRIDGED) fail(`read only ${bridged.size} bridged names from ${file}`);
  return bridged;
}

function walk(path, out) {
  const st = statSync(path, { throwIfNoEntry: false });
  if (!st) fail(`no such path: ${path}`);
  if (st.isFile()) {
    out.push(path);
    return out;
  }
  for (const entry of readdirSync(path, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name) && !entry.name.endsWith('-worktrees')) walk(join(path, entry.name), out);
    } else if ((CSS_EXT.test(entry.name) || JS_EXT.test(entry.name)) && !SKIP_FILE.test(entry.name)) {
      out.push(join(path, entry.name));
    }
  }
  return out;
}

/** Strip one matched pair of JS string quotes; a CSS value like `'Lato', serif` is left whole. */
const unquote = (v) => {
  const t = v.trim();
  return /^(['"`])[^'"`]*\1$/.test(t) ? t.slice(1, -1).trim() : t;
};

/** `old-name-override`: one problem string per old name declared with a value. */
export function findOverrides(file, rawText, bridged) {
  const problems = [];
  const scans = [];
  if (CSS_EXT.test(file)) scans.push([stripComments(rawText), DECL]);
  if (JS_EXT.test(file)) scans.push([rawText, INLINE]);
  const seen = new Set();
  for (const [text, pattern] of scans) {
    for (const match of text.matchAll(pattern)) {
      const [, name, rawValue] = match;
      const target = bridged.get(name);
      if (!target) continue;
      const value = unquote(rawValue);
      if (value.replace(/\s+/g, '') === `var(${target})`) continue;
      const block = enclosingBlock(text, match.index);
      if (new RegExp(`['"]?${target}['"]?\\s*:`).test(block)) continue;
      const line = lineOf(text, match.index);
      const key = `${line}:${name}`;
      if (seen.has(key)) continue;
      seen.add(key);
      problems.push(`${file}:${line}: ${name}: ${value} — set ${target} instead (old-name-override)`);
    }
  }
  return problems;
}

/** `binding-shape`: the theme's `--bds-*` declarations. */
export function checkTheme(file, rawText, bdsNames, id) {
  const problems = [];
  const text = stripComments(rawText);
  for (const [, selector, body] of text.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const decls = [...body.matchAll(DECL)].map(([, name, value]) => ({ name, value: value.trim() }));
    const sel = selector.trim();
    for (const { name, value } of decls) {
      if (!name.startsWith('--bds-')) continue;
      if (!bdsNames.has(name)) {
        problems.push(`${file}: ${sel}: ${name} is not a BDS token (binding-shape)`);
        continue;
      }
      if (!id || id === 'bds') continue;
      const own = `--${id}-${name.slice('--bds-'.length)}`;
      if (value !== `var(${own})`) {
        problems.push(`${file}: ${sel}: ${name}: ${value} — expected var(${own}) (binding-shape)`);
      } else if (!decls.some((d) => d.name === own)) {
        problems.push(`${file}: ${sel}: ${name} binds ${own}, which this block never declares (binding-shape)`);
      }
    }
  }
  return problems;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const bridged = loadBridge(opts.bridge);
  const problems = [];

  const files = opts.paths.flatMap((p) => walk(resolve(p), []));
  for (const file of files) {
    problems.push(...findOverrides(relative(process.cwd(), file), readFileSync(file, 'utf8'), bridged));
  }

  if (opts.theme) {
    const bdsNames = new Set(bridged.values());
    for (const [, name] of readCss(opts.tokens).matchAll(DECL)) if (name.startsWith('--bds-')) bdsNames.add(name);
    for (const [, name] of readCss(opts.styles).matchAll(/(--bds-[a-z0-9-]+)/g)) bdsNames.add(name);
    problems.push(...checkTheme(opts.theme, readCss(opts.theme), bdsNames, opts.id));
  }

  if (problems.length) {
    process.stderr.write(`${RED}check-bds-binding: ${problems.length} problem(s) (ADR-043, brik-bds#2720):${NC}\n`);
    for (const p of problems) process.stderr.write(`  ✗ ${p}\n`);
    process.exit(1);
  }
  process.stdout.write(
    `${GREEN}check-bds-binding: ok${NC} — ${files.length} file(s), no old-name overrides (${bridged.size} bridged names checked)\n`,
  );
}

// realpath: npx runs the bin through a node_modules/.bin symlink, and on macOS a
// tmpdir path crosses /var → /private/var. A literal compare skips main() there
// and exits 0 having checked nothing.
if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) main();
