#!/usr/bin/env node
/**
 * lint-component-props — verifies hand-curated component prop tables in the
 * docs-site against the TypeScript source, so a documented prop can't drift
 * from the component it describes.
 *
 * ── Why ──────────────────────────────────────────────────────────────────────
 * The docs-site audit (#1358) found 23/36 component prop-table mismatches: wrong
 * types, wrong defaults, props that no longer exist. #1370 hand-corrected them,
 * but a hand-fix without a gate re-drifts. Storybook already auto-extracts the
 * FULL reference; the docs-site tables are deliberately *curated summaries*
 * (a chosen subset with human defaults). So this is a verification gate, not a
 * generator: it keeps the curation and checks that every prop an author DID
 * document is accurate against source. Wave 4 drift gate, #1362.
 *
 * ── How a table opts in ────────────────────────────────────────────────────────
 * Put an explicit marker on the line before the table header:
 *
 *   {/* props-check: ButtonProps @ components/ui/Button/Button.tsx *\/}
 *
 *   | Prop | Type | Default |
 *   |---|---|---|
 *   | `variant` | `ButtonVariant` | `'primary'` |
 *
 * The marker names the exported props type and its source file. A docs page can
 * carry several markers (Button / LinkButton / IconButton are curated views of
 * one `ButtonProps`). Unmarked tables are ignored — the gate is opt-in, so it
 * ships green and grows as components are annotated.
 *
 * ── What is checked, per DOCUMENTED prop ───────────────────────────────────────
 *   • Existence — the prop is a real property of the resolved type (via the TS
 *     type-checker, so intersections / unions / `Omit` / HTML-attribute spreads
 *     all resolve). A documented-but-nonexistent prop (rename, typo) fails.
 *   • Type — the documented type equals the source type, alias-preserved
 *     (`ButtonVariant`, `ReactNode`), after stripping ` | undefined`, a leading
 *     `React.`, and the `*(required)*` curation note.
 *   • Default — when the component destructures a literal default for the prop
 *     (`{ variant = 'primary' }`), the documented default must match it. Props
 *     with no extractable source default are not default-checked (no false
 *     positive on HTML-inherited defaults like `disabled` → `false`).
 *
 * Props that exist in source but the author chose NOT to document are fine —
 * curation is the author's call; the gate only polices what's written.
 *
 * ── Exit codes ─────────────────────────────────────────────────────────────────
 *   0  Clean — every documented prop matches source
 *   1  Drift found
 *   2  Bad invocation (marker points at a missing file/type, malformed table)
 *
 * ── CLI ────────────────────────────────────────────────────────────────────────
 *   lint-component-props [--json] [--files <f1.mdx> …] [--root <dir>]
 *
 * `--files` verify only the listed .mdx (else every docs-site component page).
 * `--root`  resolve tsconfig + marker paths under this dir instead of the repo
 *           (hermetic fixtures, for tests).
 */

import { createRequire } from 'node:module';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { resolve, join, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const require = createRequire(join(REPO_ROOT, 'package.json'));
const ts = require('typescript');

// Root used for tsconfig, marker-path resolution, and default scanning. The
// `--root` flag (tests) points these at a hermetic fixture; `typescript` itself
// still loads from the real repo above.
let ROOT = REPO_ROOT;

const MARKER_RE = /props-check:\s*([A-Za-z_]\w*)\s*@\s*([^\s*]+?\.tsx)/;

// ── MDX: find marked prop tables ──────────────────────────────────────────────

function relPosix(abs) {
  return relative(ROOT, abs).split(sep).join('/');
}

// A markdown table row → trimmed cells. Splits on UNescaped `|` only (a literal
// pipe inside a cell — e.g. a union type `'a' \| 'b'` — is escaped), then
// unescapes `\|` → `|` so the cell text matches the source type.
function cells(line) {
  return line
    .replace(/^\s*\|/, '')
    .replace(/\|\s*$/, '')
    .split(/(?<!\\)\|/)
    .map((c) => c.replace(/\\\|/g, '|').trim());
}
const isDivider = (line) => /^\s*\|?[\s:|-]+\|[\s:|-]*$/.test(line) && line.includes('-');

// Returns [{ typeName, file, header, rows: [{prop,type,default,line}] }]
function findMarkedTables(mdxFile) {
  const lines = readFileSync(mdxFile, 'utf8').split('\n');
  const tables = [];
  let inFence = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*(```|~~~)/.test(line)) { inFence = !inFence; continue; }
    if (inFence) continue;
    const m = line.match(MARKER_RE);
    if (!m) continue;

    // Find the table header on the next non-blank line.
    let j = i + 1;
    while (j < lines.length && lines[j].trim() === '') j++;
    if (j >= lines.length || !/^\s*\|/.test(lines[j])) continue; // marker with no table
    const header = cells(lines[j]);
    if (!isDivider(lines[j + 1] || '')) continue;

    const rows = [];
    let k = j + 2;
    for (; k < lines.length && /^\s*\|/.test(lines[k]); k++) {
      const c = cells(lines[k]);
      rows.push({ cells: c, line: k + 1 });
    }
    tables.push({ typeName: m[1], file: m[2], header, rows, markerLine: i + 1 });
  }
  return tables;
}

// ── Source: resolve a props type + literal defaults ────────────────────────────

function buildProgram(files) {
  const cfgPath = join(ROOT, 'tsconfig.json');
  const cfg = ts.readConfigFile(cfgPath, ts.sys.readFile).config;
  const parsed = ts.parseJsonConfigFileContent(cfg, ts.sys, ROOT);
  return ts.createProgram(files, { ...parsed.options, noEmit: true });
}

const FMT = () =>
  ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope | ts.TypeFormatFlags.NoTruncation;

// If `pt` (or `pt` minus `undefined`) is a union of string literals, return the
// expanded `'a' | 'b' | 'c'` form (single-quoted); else null. Lets a doc that
// spells out an aliased union match source.
function expandStringLiteralUnion(pt) {
  if (!pt.isUnion()) return null;
  const members = pt.types.filter((m) => (m.flags & ts.TypeFlags.Undefined) === 0);
  if (members.length === 0 || !members.every((m) => m.isStringLiteral())) return null;
  return members.map((m) => `'${m.value}'`).join(' | ');
}

// Resolve `typeName` in `absFile` → Map<propName, {type, optional}>.
function propsOfType(program, checker, absFile, typeName) {
  const sf = program.getSourceFile(absFile);
  if (!sf) return { error: `source file not found in program: ${relPosix(absFile)}` };
  let decl = null;
  const visit = (n) => {
    if (
      (ts.isTypeAliasDeclaration(n) || ts.isInterfaceDeclaration(n)) &&
      n.name.text === typeName
    ) decl = n;
    else ts.forEachChild(n, visit);
  };
  ts.forEachChild(sf, visit);
  if (!decl) return { error: `type "${typeName}" not exported from ${relPosix(absFile)}` };

  const type = checker.getTypeAtLocation(decl.name);
  // A discriminated union (e.g. ButtonProps = Style & Content & (Anchor | Button))
  // exposes only the properties COMMON to every branch via getPropertiesOfType —
  // branch-specific props like `disabled` (button-only) or `href` (anchor-only)
  // are dropped. A curated doc legitimately documents those, so union the
  // properties across every constituent; a prop's type is the SET of types it
  // takes across the branches it appears in (documented type must match one).
  const constituents = type.isUnion() ? type.types : [type];
  const map = new Map(); // name → { types: Set<string> }
  for (const c of constituents) {
    for (const sym of checker.getPropertiesOfType(c)) {
      const pt = checker.getTypeOfSymbolAtLocation(sym, decl);
      const entry = map.get(sym.getName()) ?? { types: new Set() };
      // Two authoring styles are both valid: the alias name (`ButtonVariant`)
      // and the expanded literal union (`'lg' | 'md' | 'sm'`). Record both so a
      // documented type matches whichever the author wrote.
      entry.types.add(checker.typeToString(pt, decl, FMT()));
      const expanded = expandStringLiteralUnion(pt);
      if (expanded) entry.types.add(expanded);
      map.set(sym.getName(), entry);
    }
  }
  return { map };
}

// Collect literal defaults from every object-binding destructure of a param in
// the file (covers `const { variant = 'primary' } = props` and direct
// destructuring in the component signature). Map<propName, defaultText>.
function literalDefaults(program, absFile) {
  const sf = program.getSourceFile(absFile);
  const out = new Map();
  if (!sf) return out;
  const visit = (n) => {
    if (ts.isObjectBindingPattern(n)) {
      for (const el of n.elements) {
        if (el.initializer && ts.isIdentifier(el.name)) {
          const init = el.initializer;
          let text = null;
          if (ts.isStringLiteral(init)) text = `'${init.text}'`;
          else if (init.kind === ts.SyntaxKind.TrueKeyword) text = 'true';
          else if (init.kind === ts.SyntaxKind.FalseKeyword) text = 'false';
          else if (ts.isNumericLiteral(init)) text = init.text;
          if (text !== null && !out.has(el.name.text)) out.set(el.name.text, text);
        }
      }
    }
    ts.forEachChild(n, visit);
  };
  ts.forEachChild(sf, visit);
  return out;
}

// ── Normalization ──────────────────────────────────────────────────────────────

// A documented type is compared to source after: dropping backticks / the
// `*(required)*` curation note / ` | undefined` / a leading `React.`; unifying
// quote style; and — for a bare union of members — sorting the members so a
// different authoring order (`'a' | 'b'` vs `'b' | 'a'`) is not spurious drift.
// Function signatures (`=>`) are NOT type-checked (param names differ benignly);
// normType returns '' for them so the caller skips the check.
const normType = (t) => {
  let s = t
    .replace(/`/g, '')
    .replace(/\*?\(required\)\*?/gi, '')
    .replace(/\s*\|\s*undefined\b/g, '')
    .replace(/\bReact\./g, '')
    .replace(/"/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
  if (s.includes('=>')) return ''; // function type — not comparable, skip
  if (s.includes('|') && !s.includes('<') && !s.includes('&') && !s.includes('(')) {
    s = s.split('|').map((m) => m.trim()).filter(Boolean).sort().join(' | ');
  }
  return s;
};

// A Prop cell may document more than one prop name (`checked / defaultChecked`).
// Split on `/` or `,`; each name is existence-checked. Type/default are only
// checked for a single-name cell (which name would the type map to otherwise?).
const propNames = (cell) =>
  cell.replace(/`/g, '').split(/[/,]/).map((p) => p.trim()).filter(Boolean);

const normDefault = (d) => {
  const s = d.replace(/`/g, '').trim();
  if (s === '' || s === '—' || s === '-' || s === '–') return null; // "no default" cell
  return s.replace(/^["]([^"]*)["]$/, "'$1'"); // "x" → 'x'
};

// ── Main ────────────────────────────────────────────────────────────────────

function walk(dir, pred, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const e of readdirSync(dir)) {
    const full = join(dir, e);
    (statSync(full).isDirectory() ? walk(full, pred, acc) : pred(full) && acc.push(full));
  }
  return acc;
}

function main() {
  const args = process.argv.slice(2);
  const jsonMode = args.includes('--json');
  const rootIdx = args.indexOf('--root');
  if (rootIdx !== -1) ROOT = resolve(args[rootIdx + 1]);
  const filesIdx = args.indexOf('--files');
  const explicit = filesIdx !== -1
    ? args.slice(filesIdx + 1).filter((f) => !f.startsWith('--'))
    : null;

  const docsComponents = join(ROOT, 'docs-site', 'content', 'docs', 'components');
  const mdxFiles = explicit
    ? explicit.map((f) => resolve(f)).filter((f) => f.endsWith('.mdx') && existsSync(f))
    : walk(docsComponents, (f) => f.endsWith('.mdx'));

  // Gather every marked table first, so we build ONE program over all sources.
  const tablesByFile = [];
  const sourceFiles = new Set();
  const setupErrors = [];
  for (const mdx of mdxFiles) {
    const tables = findMarkedTables(mdx);
    for (const t of tables) {
      const abs = resolve(ROOT, t.file);
      if (!existsSync(abs)) {
        setupErrors.push({ file: relPosix(mdx), line: t.markerLine, msg: `marker source not found: ${t.file}` });
        continue;
      }
      sourceFiles.add(abs);
      tablesByFile.push({ mdx, abs, ...t });
    }
  }

  if (setupErrors.length) {
    for (const e of setupErrors) console.error(`✗ ${e.file}:${e.line} — ${e.msg}`);
    process.exit(2);
  }

  if (tablesByFile.length === 0) {
    const msg = 'lint-component-props: no {/* props-check: … */} markers found — nothing to verify.';
    if (jsonMode) console.log(JSON.stringify({ tables: 0, violations: [] }));
    else console.log(msg + '\n');
    process.exit(0);
  }

  const program = buildProgram([...sourceFiles]);
  const checker = program.getTypeChecker();

  const typeCache = new Map(); // `${abs}#${typeName}` → propsOfType result
  const defaultsCache = new Map(); // abs → Map

  const violations = [];
  for (const t of tablesByFile) {
    const key = `${t.abs}#${t.typeName}`;
    if (!typeCache.has(key)) typeCache.set(key, propsOfType(program, checker, t.abs, t.typeName));
    const resolved = typeCache.get(key);
    if (resolved.error) {
      console.error(`✗ ${relPosix(t.mdx)}:${t.markerLine} — ${resolved.error}`);
      process.exit(2);
    }
    if (!defaultsCache.has(t.abs)) defaultsCache.set(t.abs, literalDefaults(program, t.abs));
    const defaults = defaultsCache.get(t.abs);
    const props = resolved.map;

    // Column indices from the header (Prop / Type / Default), case-insensitive.
    const hdr = t.header.map((h) => h.toLowerCase());
    const pi = hdr.indexOf('prop');
    const ti = hdr.indexOf('type');
    const di = hdr.indexOf('default');
    if (pi === -1) continue; // not a prop table shape

    for (const row of t.rows) {
      const names = propNames(row.cells[pi] ?? '');
      if (names.length === 0) continue;
      const loc = { file: relPosix(t.mdx), line: row.line, type: t.typeName };

      // Existence — every documented name must be a real property.
      const missing = names.filter((n) => !props.get(n));
      for (const n of missing) {
        violations.push({ ...loc, prop: n, kind: 'phantom-prop',
          detail: `documented prop "${n}" is not a property of ${t.typeName}` });
      }
      if (missing.length > 0) continue;          // don't type/default-check a bad row
      if (names.length > 1) continue;            // multi-name cell: existence only
      const name = names[0];
      const meta = props.get(name);

      if (ti !== -1 && row.cells[ti] != null) {
        const docType = normType(row.cells[ti]);
        const srcTypes = [...meta.types].map(normType).filter(Boolean);
        // docType === '' ⇒ function/uncomparable → skip. No src types ⇒ skip.
        if (docType !== '' && srcTypes.length > 0 && !srcTypes.includes(docType)) {
          violations.push({ ...loc, prop: name, kind: 'type-mismatch',
            detail: `type documented as "${docType}", source is ${srcTypes.map((s) => `"${s}"`).join(' | ')}` });
        }
      }

      if (di !== -1 && row.cells[di] != null) {
        const docDefault = normDefault(row.cells[di]);
        const srcDefault = defaults.get(name) ?? null;
        if (docDefault !== null && srcDefault !== null && docDefault !== srcDefault) {
          violations.push({ ...loc, prop: name, kind: 'default-mismatch',
            detail: `default documented as "${docDefault}", source is "${srcDefault}"` });
        }
      }
    }
  }

  if (jsonMode) {
    console.log(JSON.stringify({ tables: tablesByFile.length, violations }, null, 2));
    process.exit(violations.length > 0 ? 1 : 0);
  }

  if (violations.length === 0) {
    console.log(
      `lint-component-props: clean — ${tablesByFile.length} marked table(s) verified against source, 0 drift\n`,
    );
    process.exit(0);
  }

  console.log(`\nlint-component-props: ${violations.length} prop-table drift(s)\n`);
  const byFile = {};
  for (const v of violations) (byFile[v.file] ||= []).push(v);
  for (const [f, vs] of Object.entries(byFile)) {
    console.log(`  ${f}`);
    for (const v of vs.sort((a, b) => a.line - b.line)) {
      console.log(`    ${v.line}: \x1b[31m${v.prop}\x1b[0m [${v.type}] — ${v.detail}  \x1b[2m[${v.kind}]\x1b[0m`);
    }
  }
  console.log(
    '\n  A documented prop must match the component source. Fix the table against\n' +
    '  the .tsx, or drop the prop from the table if it no longer exists.\n',
  );
  process.exit(1);
}

main();
