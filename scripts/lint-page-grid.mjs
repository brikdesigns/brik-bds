#!/usr/bin/env node
/**
 * lint-page-grid — enforces the ADR-025 width-container recipe: a page
 * container's inline inset comes from the canonical `--page-inset` token
 * (renamed from `--gutter-page`, ADR-025; the alias was removed post-migration).
 *
 * The page-grid standard (ADR-025, published at
 * design.brikdesigns.com/docs/build-standards/page-grid) locks the container
 * recipe to `max-width: var(--content-width-*)` + `margin-inline: auto` +
 * `padding-inline: var(--page-inset)`. A container that swaps in some other
 * inset re-opens the misalignment the token exists to close: BDS sections and
 * consumer containers (nav, footer) stop lining up flush at the page edge.
 *
 * ── What's flagged vs allowed ──────────────────────────────────────────────
 *
 *   Flagged   — inside a rule that declares a page container — either
 *               `max-width: var(--content-width-*)`, or a Footer-style
 *               centering inset `…(100% - var(--content-width-*))…` — a
 *               `padding-inline` whose value never references
 *               `var(--page-inset`:
 *                 padding-inline: var(--padding-lg);
 *                 padding-inline: 24px;
 *
 *   Allowed   — the recipe (the whole point), directly or as an ADR-014 hook
 *               fallback:
 *                 padding-inline: var(--page-inset);
 *                 padding-inline: var(--bds-blueprint-section-padding-inline, var(--page-inset));
 *                 padding-inline: max(var(--page-inset), calc((100% - var(--content-width-xl)) / 2));
 *             — a container rule with NO `padding-inline` of its own (the
 *               inset is inherited from a parent shell) or one that overrides
 *               via a `--bds-*` hook custom property (the sanctioned ADR-014
 *               escape — a custom-property declaration is not `padding-inline`).
 *             — a line carrying a reasoned `bds-lint-ignore — <why>` (the
 *               shared escape hatch). A BARE `bds-lint-ignore` is itself a
 *               hard-fail (#1469): a suppression must state why.
 *
 * Scans component CSS plus blueprint CSS and the `<style>` blocks of blueprint
 * `.astro` files — the two places BDS declares page containers.
 *
 * ── Exit codes ───────────────────────────────────────────────────────────────
 *   0  Clean — every page container uses the canonical page inset
 *   1  Violations found
 *   2  Bad invocation
 *
 * ── CLI ──────────────────────────────────────────────────────────────────────
 *   lint-page-grid              Scan components/ui + content-system
 *   lint-page-grid [dir]        Scan dir
 *   lint-page-grid --staged     Scan only staged .css/.astro (pre-commit)
 *   lint-page-grid --help
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { resolve, join, relative, sep, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

import { lintIgnoreReason } from './lib/bds-lint-ignore.cjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BDS_ROOT = resolve(__dirname, '..');

const DEFAULT_DIRS = ['components/ui', 'content-system'];

/** A page container announces itself with a content-width band… */
const BAND_RE = /max-width\s*:\s*[^;}]*var\(\s*--content-width-/i;
/** …or a Footer-style centering inset computed from one. */
const CENTERING_INSET_RE = /100%\s*-\s*var\(\s*--content-width-/i;
/** The canonical inset, direct or as a hook fallback. */
const PAGE_INSET_RE = /var\(\s*--page-inset\b/i;

/**
 * Blank out `/* … *​/` comment content, preserving newlines so line numbers
 * survive. Comments carry CSS examples with braces (section-shell's header
 * does) that would otherwise break brace tracking.
 */
export function stripComments(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
}

/**
 * Split CSS text into rule blocks: `{ selector, decls: [{prop, value, line}] }`.
 * Brace-tracking only — declarations belong to the innermost open block, which
 * is always the rule that declares them in plain (non-nested) CSS. `@layer` /
 * `@media` wrappers become blocks with no declarations and fall out naturally.
 */
export function parseRuleBlocks(rawText, lineOffset = 0) {
  const text = stripComments(rawText);
  const blocks = [];
  const stack = [];
  let buf = '';
  let line = 1 + lineOffset;
  let declStartLine = line;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '\n') line++;
    if (ch === '{') {
      stack.push({ selector: buf.trim(), decls: [] });
      buf = '';
    } else if (ch === '}') {
      const block = stack.pop();
      if (block) {
        flushDecl(block, buf, declStartLine);
        blocks.push(block);
      }
      buf = '';
    } else if (ch === ';') {
      const block = stack[stack.length - 1];
      if (block) flushDecl(block, buf, declStartLine);
      buf = '';
    } else {
      // Stamp the declaration's line at its first non-whitespace character.
      if (buf.trim() === '' && !/\s/.test(ch)) declStartLine = line;
      buf += ch;
    }
  }
  return blocks;
}

function flushDecl(block, raw, line) {
  const at = raw.indexOf(':');
  if (at === -1) return;
  const prop = raw.slice(0, at).trim();
  if (!/^[a-zA-Z-]+$/.test(prop)) return; // selectors, comments, custom-prop names with values handled below
  block.decls.push({ prop: prop.toLowerCase(), value: raw.slice(at + 1).trim(), line, raw: raw.trim() });
}

/** Extract `<style>` block contents from an .astro file, with line offsets. */
export function extractAstroStyles(text) {
  const out = [];
  const re = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let m;
  while ((m = re.exec(text)) !== null) {
    const before = text.slice(0, m.index + m[0].indexOf('>') + 1);
    out.push({ css: m[1], lineOffset: before.split('\n').length - 1 });
  }
  return out;
}

/**
 * Scan CSS text for page-container rules whose `padding-inline` bypasses
 * `--page-inset`. Pure (no disk) so the rule is unit-testable.
 */
export function scanCssText(text, rel = '', lineOffset = 0, sourceLines = null) {
  const lines = sourceLines ?? text.split('\n');
  const violations = [];
  for (const block of parseRuleBlocks(text, lineOffset)) {
    const isContainer = block.decls.some(
      (d) =>
        (d.prop === 'max-width' && BAND_RE.test(`${d.prop}:${d.value}`)) ||
        (d.prop === 'padding-inline' && CENTERING_INSET_RE.test(d.value)),
    );
    if (!isContainer) continue;
    for (const d of block.decls) {
      if (d.prop !== 'padding-inline') continue;
      if (PAGE_INSET_RE.test(d.value)) continue;
      const lineText = lines[d.line - 1] ?? d.raw;
      const reason = lintIgnoreReason(lineText);
      // reason: null → no marker (flag); '' → bare marker (hard-fail, #1469);
      // non-empty → reasoned suppression (allowed).
      if (typeof reason === 'string' && reason.length > 0) continue;
      violations.push({
        file: rel,
        line: d.line,
        selector: block.selector,
        text: lineText.trim(),
        bare: reason === '',
      });
    }
  }
  return violations;
}

function scanFile(filePath) {
  const rel = relative(BDS_ROOT, filePath).split(sep).join('/');
  const text = readFileSync(filePath, 'utf8');
  if (filePath.endsWith('.astro')) {
    const allLines = text.split('\n');
    return extractAstroStyles(text).flatMap(({ css, lineOffset }) =>
      scanCssText(css, rel, lineOffset, allLines),
    );
  }
  return scanCssText(text, rel);
}

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, acc);
    else if (entry.endsWith('.css') || entry.endsWith('.astro')) acc.push(full);
  }
  return acc;
}

const GUIDANCE =
  'A page container insets with the canonical page inset: `padding-inline: ' +
  'var(--page-inset)` (directly, as an ADR-014 hook fallback, or inside a ' +
  '`max()` centering inset). See ADR-025 ' +
  '(design.brikdesigns.com/docs/build-standards/page-grid). A genuine ' +
  'exception needs a reasoned `bds-lint-ignore — <why>`; a bare marker is ' +
  'rejected (brik-bds issue 1469).';

function render(violations, scanned) {
  if (violations.length === 0) {
    return `lint-page-grid: clean — ${scanned} file(s) scanned, every page container uses --page-inset\n`;
  }
  const out = [
    `lint-page-grid: ${violations.length} page container(s) bypassing --page-inset (ADR-025)`,
    '',
  ];
  for (const v of violations) {
    const tag = v.bare
      ? '  ← bare bds-lint-ignore (needs a reason, brik-bds issue 1469)'
      : '';
    out.push(`  ${v.file}:${v.line}  ${v.selector} → ${v.text}${tag}`);
  }
  out.push('');
  out.push(`  ↳ ${GUIDANCE}`);
  return out.join('\n') + '\n';
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    process.stdout.write(
      'lint-page-grid [dir] | --staged\n\n' +
        'Fails any page-container rule (max-width: var(--content-width-*) or a ' +
        'content-width centering inset) whose padding-inline bypasses ' +
        '--page-inset (ADR-025, brik-bds#1628).\n',
    );
    process.exit(0);
  }

  let files;
  if (args.includes('--staged')) {
    const out = execSync('git diff --cached --name-only --diff-filter=ACM', { cwd: BDS_ROOT })
      .toString()
      .split('\n')
      .filter(
        (f) =>
          (f.startsWith('components/') || f.startsWith('content-system/')) &&
          (f.endsWith('.css') || f.endsWith('.astro')),
      );
    files = out.map((f) => resolve(BDS_ROOT, f)).filter(existsSync);
  } else {
    const dirArg = args.find((a) => !a.startsWith('--'));
    const dirs = dirArg ? [dirArg] : DEFAULT_DIRS.map((d) => resolve(BDS_ROOT, d));
    for (const dir of dirs) {
      if (!existsSync(dir)) {
        process.stderr.write(`lint-page-grid: directory not found: ${dir}\n`);
        process.exit(2);
      }
    }
    files = dirs.flatMap((d) => walk(d));
  }

  const violations = [];
  for (const file of files) violations.push(...scanFile(file));

  process.stdout.write(render(violations, files.length));
  process.exit(violations.length > 0 ? 1 : 0);
}

const isCliEntry = (() => {
  try {
    return resolve(fileURLToPath(import.meta.url)) === resolve(process.argv[1] ?? '');
  } catch (err) {
    process.stderr.write(`lint-page-grid: could not determine CLI entry — ${err.message}\n`);
    return false;
  }
})();

if (isCliEntry) main();
