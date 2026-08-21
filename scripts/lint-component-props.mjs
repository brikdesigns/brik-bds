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
 * An optional `omit=` list drops named props from the coverage check below,
 * for a prop the page deliberately does not curate:
 *
 *   {/* props-check: FooProps @ components/ui/Foo/Foo.tsx omit=legacyMode *\/}
 *
 * ── The type-note convention ─────────────────────────────────────────────────
 * A Type cell may end in a parenthetical note carrying information the source
 * type cannot — a unit, the concrete shape a slot expects, an example value:
 *
 *   | `delay` | `number (ms)` | `200` |
 *   | `children` | `ReactNode (BoardColumns)` | — |
 *
 * The note is stripped only as a FALLBACK, after the cell as written has failed
 * to match, and only when what remains matches source exactly. So a note adds
 * information but can never mask drift: `string (ms)` against a `number` source
 * strips to `string`, still mismatches, and still fails. Keep notes short — the
 * cell is a summary, and prose belongs in the surrounding copy (#1916).
 *
 * ── What is checked, per DOCUMENTED prop ───────────────────────────────────────
 *   • Existence — the prop is a real property of the resolved type (via the TS
 *     type-checker, so intersections / unions / `Omit` / HTML-attribute spreads
 *     all resolve). A documented-but-nonexistent prop (rename, typo) fails.
 *   • Type — the documented type equals the source type, alias-preserved
 *     (`ButtonVariant`, `ReactNode`), after stripping ` | undefined`, a leading
 *     `React.`, and the `*(required)*` curation note — or, failing that, after
 *     also stripping a trailing type note (§ The type-note convention).
 *   • Default — when the component destructures a literal default for the prop
 *     (`{ variant = 'primary' }`), the documented default must match it. Props
 *     with no extractable source default are not default-checked (no false
 *     positive on HTML-inherited defaults like `disabled` → `false`).
 *
 * ── What is checked, per SOURCE prop (coverage, #1944) ────────────────────────
 * Every prop DECLARED on the props type appears in some marked table for that
 * type on the page. Reported as `undocumented-prop`.
 *
 * This narrows the original curation model. That model held that omitting a
 * prop was always the author's call, on the grounds that Storybook
 * auto-extracts the full reference — true for a human browsing Storybook, and
 * false for every text-based path into the docs. `<ArgTypes>` is rendered at
 * runtime and never enters the MDX, so the docs-site, brik-rag, and grep all
 * see only the curated subset. A prop absent from both the docs-site table and
 * the component's own MDX prose is unreachable to an agent, which is how
 * consumers end up hand-rolling chrome for a slot that already exists
 * (`DataSection.headerControl` is the worked case).
 *
 * Curation is still the author's call — it is now explicit rather than silent:
 *   • `omit=` on the marker drops a prop deliberately.
 *   • `className` / `style` / `id` / `key` / `ref` are never required; the
 *     table's "plus all standard HTML attributes" sentence documents them.
 *   • Only DECLARED props count. `getPropertiesOfType` resolves the full
 *     structural type, so inherited HTML attributes would otherwise flood the
 *     check with hundreds of DOM props that no curated table should list.
 *
 * ── Exit codes ─────────────────────────────────────────────────────────────────
 *   0  Clean — every documented prop matches source, every declared prop is documented
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

const MARKER_RE = /props-check:\s*([A-Za-z_]\w*)\s*@\s*([^\s*]+?\.tsx)((?:\s+omit=[\w,]+)?)/;

// Props every table covers collectively via its "plus all standard HTML
// attributes" sentence rather than a row of their own. Excluded from the
// coverage check so that sentence stays the single place they're documented.
const PASSTHROUGH_PROPS = new Set(['className', 'style', 'id', 'key', 'ref']);

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
    const omit = new Set(
      (m[3] || '').replace(/\s*omit=/, '').split(',').map((s) => s.trim()).filter(Boolean),
    );
    tables.push({ typeName: m[1], file: m[2], header, rows, omit, markerLine: i + 1 });
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

// If `pt` (or `pt` minus `undefined`) is a union of literals, return the
// expanded `'a' | 'b' | 'c'` form (strings single-quoted, numbers bare); else
// null. Lets a doc that spells out an aliased union match source.
//
// Numeric literals count (#1917). `GridColumns = 1 | 2 | 3 | 4 | 5 | 6 |
// 'auto-fit' | 'auto-fill'` is the same authoring style as an all-string union
// and the docs page spells it out for the same reason — a consumer wants the
// allowed values, not the alias name. Requiring every member to be a *string*
// literal rejected the whole union for its numeric half, so the only way to
// pass was to delete the expansion.
function expandLiteralUnion(pt) {
  if (!pt.isUnion()) return null;
  const members = pt.types.filter((m) => (m.flags & ts.TypeFlags.Undefined) === 0);
  if (members.length === 0) return null;
  if (!members.every((m) => m.isStringLiteral() || m.isNumberLiteral())) return null;
  return members.map((m) => (m.isStringLiteral() ? `'${m.value}'` : `${m.value}`)).join(' | ');
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
      const expanded = expandLiteralUnion(pt);
      if (expanded) entry.types.add(expanded);
      map.set(sym.getName(), entry);
    }
  }
  return { map, own: ownProps(decl) };
}

// The prop names declared DIRECTLY on `decl` — the component's own API surface,
// excluding everything reached through `extends` / `Omit<HTMLAttributes<…>>`.
//
// This is what makes the coverage check (§ What is checked, per SOURCE prop)
// possible at all: `getPropertiesOfType` resolves the full structural type, so
// it hands back every inherited DOM attribute — hundreds of them, none of which
// a curated table should list. Only the members written in this declaration are
// the component's own contract, so only those are required to appear.
//
// An interface contributes `decl.members`. A type alias contributes the members
// of its type literal, or of each type-literal constituent of an intersection
// (`type FooProps = Base & { extra: string }`). An alias with no literal of its
// own (a bare `Omit<…>` / mapped type) contributes nothing — there is no
// hand-written surface to require.
function ownProps(decl) {
  const out = new Set();
  const addMembers = (members) => {
    for (const mem of members ?? []) {
      if (!ts.isPropertySignature(mem) && !ts.isMethodSignature(mem)) continue;
      if (ts.isIdentifier(mem.name) || ts.isStringLiteral(mem.name)) out.add(mem.name.text);
    }
  };
  if (ts.isInterfaceDeclaration(decl)) {
    addMembers(decl.members);
  } else if (ts.isTypeAliasDeclaration(decl)) {
    const collect = (node) => {
      if (ts.isTypeLiteralNode(node)) addMembers(node.members);
      else if (ts.isIntersectionTypeNode(node) || ts.isUnionTypeNode(node)) node.types.forEach(collect);
      else if (ts.isParenthesizedTypeNode(node)) collect(node.type);
    };
    collect(decl.type);
  }
  return out;
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
//
// `stripNote` additionally drops a TRAILING parenthetical curation note —
// `number (ms)`, `ReactNode (BoardColumns)`, `string (CSS grid template)`. The
// caller only passes it as a fallback, after the verbatim cell has already
// failed to match, so a note can never mask a real mismatch: `string (ms)`
// against a `number` source strips to `string` and still fails (#1916).
const normType = (t, { stripNote = false } = {}) => {
  let s = t
    .replace(/`/g, '')
    .replace(/\*?\(required\)\*?/gi, '');
  // Before the union sort below, so a note containing `|` can't reorder members.
  if (stripNote) s = s.replace(/\s*\*?\([^()]*\)\*?\s*$/, '');
  s = s
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
  const documentedByType = new Map(); // `${abs}#${typeName}` → Set<propName>
  const firstTableForType = new Map(); // same key → the table to report against
  for (const t of tablesByFile) {
    const key = `${t.abs}#${t.typeName}`;
    if (!documentedByType.has(key)) {
      documentedByType.set(key, new Set());
      firstTableForType.set(key, t);
    }
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
      names.forEach((n) => documentedByType.get(key).add(n));
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
        const srcTypes = [...meta.types].map((s) => normType(s)).filter(Boolean);
        // docType === '' ⇒ function/uncomparable → skip. No src types ⇒ skip.
        if (docType !== '' && srcTypes.length > 0 && !srcTypes.includes(docType)) {
          // Fallback only: a trailing curation note is allowed when what remains
          // matches source EXACTLY. Anything else is reported against the cell as
          // written, never against the stripped form (#1916).
          const bare = normType(row.cells[ti], { stripNote: true });
          if (bare === docType || !srcTypes.includes(bare)) {
            violations.push({ ...loc, prop: name, kind: 'type-mismatch',
              detail: `type documented as "${docType}", source is ${srcTypes.map((s) => `"${s}"`).join(' | ')}` });
          }
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

  // ── Coverage: every own-declared prop appears in SOME table for its type ────
  //
  // Keyed on type, not table. One props type is often curated into several
  // tables on a page (Button / LinkButton / IconButton are three views of
  // `ButtonProps`), and a prop documented in any one of them is documented.
  // Reported against the FIRST marker for that type, which is where an author
  // adding the missing row will start.
  for (const [key, seen] of documentedByType) {
    const t = firstTableForType.get(key);
    const own = typeCache.get(key)?.own;
    if (!own || own.size === 0) continue;
    const undocumented = [...own].filter(
      (p) => !seen.has(p) && !PASSTHROUGH_PROPS.has(p) && !t.omit.has(p),
    );
    for (const p of undocumented) {
      violations.push({
        file: relPosix(t.mdx), line: t.markerLine, type: t.typeName, prop: p,
        kind: 'undocumented-prop',
        detail: `${t.typeName} declares "${p}" but no marked table on this page documents it`,
      });
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
