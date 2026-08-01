#!/usr/bin/env node
/**
 * lint-content-rhythm — bans hardcoded px/rem/em spacing between text-role
 * elements in component CSS.
 *
 * The content-rhythm standard (ADR-023 §3, published at
 * design.brikdesigns.com/docs/build-standards/content-rhythm) requires vertical
 * spacing between content to come from the mode-tied `--gap-*` scale, never a
 * literal: the scale re-modulates per spacing mode, a hardcoded px does not. A
 * composite that re-declares its own `margin`/`gap` in px re-introduces the
 * drift the retrofit (#1607) just removed — this gate closes the class so the
 * next component PR can't re-open it (#1608, under #1604).
 *
 * ── What's flagged vs allowed ──────────────────────────────────────────────
 *
 *   Flagged   — a rhythm-bearing property set to a non-zero px/rem/em literal:
 *                 gap: 8px;   margin-top: 12px;   margin: 0 0 1rem;
 *             — a mode-collapsing token (`--gap-xs` / `--gap-tiny`, both 0px in
 *               every non-default spacing mode) on an unambiguously VERTICAL
 *               property (`row-gap`, `margin`, `margin-top/-bottom/-block*`):
 *                 margin-top: var(--gap-xs);   row-gap: var(--gap-tiny);
 *               The `gap` shorthand is exempt from this rule — its direction
 *               depends on flex-direction, which a line-scanner can't see, and
 *               horizontal icon/label gaps legitimately use `--gap-xs`.
 *
 *   Allowed   — the same property driven by a token (the whole point):
 *                 gap: var(--gap-md);   margin-top: var(--gap-sm);
 *             — literals that live only inside a `var(--x, <fallback>)` default
 *               or a `--bds-*` runtime binding (a sanctioned Component-tier
 *               pattern): `margin-top: calc(var(--bds-thumb, 20px) / 2)`. The
 *               `var(...)` expressions are stripped before literal detection, so
 *               only a literal OUTSIDE a token counts.
 *             — zero (`0`, `0px`), `auto`, percentages, and horizontal-only
 *               spacing (`margin-left/right/inline`, `column-gap`): rhythm is
 *               vertical, and horizontal insets aren't content rhythm.
 *             — a line carrying a reasoned `bds-lint-ignore — <why>` (the shared
 *               escape hatch). A BARE `bds-lint-ignore` is itself a hard-fail
 *               (#1469): a suppression must state why.
 *             — `components/ui/Prose/Prose.css`, the element-adjacency owner
 *               (ADR-023) — the one file whose whole job is text-element
 *               spacing; allowlisted wholesale.
 *
 * ── Exit codes ───────────────────────────────────────────────────────────────
 *   0  Clean — no hardcoded text-rhythm spacing
 *   1  Violations found
 *   2  Bad invocation
 *
 * ── CLI ──────────────────────────────────────────────────────────────────────
 *   lint-content-rhythm [dir]      Scan dir (default: components/ui)
 *   lint-content-rhythm --staged   Scan only staged component .css (pre-commit)
 *   lint-content-rhythm --help
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { resolve, join, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

import { lintIgnoreReason } from './lib/bds-lint-ignore.cjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BDS_ROOT = resolve(__dirname, '..');

/**
 * Rhythm-bearing properties — vertical margin + gaps. Horizontal-only insets
 * (`margin-left`/`-right`/`-inline`, `column-gap`) are excluded: content rhythm
 * is the vertical relationship between stacked text roles.
 */
const RHYTHM_PROP_RE =
  /(?:^|[\s;{])(gap|row-gap|margin|margin-top|margin-bottom|margin-block|margin-block-start|margin-block-end)\s*:\s*([^;}]*)/gi;

/** A numeric px/rem/em literal (signed, decimal). */
const LITERAL_RE = /(-?\d*\.?\d+)(px|rem|em)\b/g;

/**
 * Properties that are vertical no matter the layout context. The `gap`
 * shorthand is deliberately absent: its axis depends on flex-direction,
 * and horizontal icon/label gaps legitimately use `--gap-xs`.
 */
const VERTICAL_PROPS = new Set([
  'row-gap',
  'margin',
  'margin-top',
  'margin-bottom',
  'margin-block',
  'margin-block-start',
  'margin-block-end',
]);

/**
 * Tokens that resolve to 0px in every non-default spacing mode
 * (tokens/modes-spacing.css) — banned from vertical rhythm positions
 * per ADR-023 §3 / ADR-024.
 */
const MODE_COLLAPSING_RE = /var\(\s*--gap-(?:xs|tiny)\s*[,)]/;

/** Files exempt wholesale — the sanctioned element-adjacency owners. */
const FILE_ALLOWLIST = new Set(['components/ui/Prose/Prose.css']);

/**
 * Remove every `var(...)` expression (balanced parens, nesting-safe) from a
 * declaration value. A literal inside a token's fallback default is not a
 * hardcoded rhythm value; only a literal that survives the strip counts.
 */
export function stripVarExpressions(value) {
  let out = '';
  let i = 0;
  while (i < value.length) {
    const at = value.indexOf('var(', i);
    if (at === -1) {
      out += value.slice(i);
      break;
    }
    out += value.slice(i, at);
    // Walk to the matching close paren from the `var(`'s own paren.
    let depth = 0;
    let j = at + 3; // index of '('
    for (; j < value.length; j++) {
      const ch = value[j];
      if (ch === '(') depth++;
      else if (ch === ')') {
        depth--;
        if (depth === 0) {
          j++;
          break;
        }
      }
    }
    i = j;
  }
  return out;
}

/** True when a value carries a non-zero px/rem/em literal outside any var(). */
export function hasHardcodedLiteral(value) {
  const bare = stripVarExpressions(value);
  LITERAL_RE.lastIndex = 0;
  let m;
  while ((m = LITERAL_RE.exec(bare)) !== null) {
    if (parseFloat(m[1]) !== 0) return true;
  }
  return false;
}

function walkCss(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walkCss(full, acc);
    else if (entry.endsWith('.css')) acc.push(full);
  }
  return acc;
}

function relPosix(abs) {
  return relative(BDS_ROOT, abs).split(sep).join('/');
}

/**
 * Scan CSS text line-by-line for hardcoded text-rhythm spacing. Pure (no disk)
 * so the rule is unit-testable; `scanFile` layers the file-allowlist + I/O on
 * top. `rel` labels the violations' `file` field.
 */
export function scanCssText(text, rel = '') {
  const lines = text.split('\n');
  const violations = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    RHYTHM_PROP_RE.lastIndex = 0;
    let m;
    while ((m = RHYTHM_PROP_RE.exec(line)) !== null) {
      const [prop, value] = [m[1], m[2]];
      const literal = hasHardcodedLiteral(value);
      const collapsing =
        VERTICAL_PROPS.has(prop.toLowerCase()) && MODE_COLLAPSING_RE.test(value);
      if (!literal && !collapsing) continue;
      const reason = lintIgnoreReason(line);
      // reason: null → no marker (flag); '' → bare marker (hard-fail, #1469);
      // non-empty → reasoned suppression (allowed).
      if (typeof reason === 'string' && reason.length > 0) continue;
      violations.push({
        file: rel,
        line: i + 1,
        prop,
        text: line.trim(),
        bare: reason === '',
        collapsing: !literal && collapsing,
      });
    }
  }
  return violations;
}

function scanFile(filePath) {
  const rel = relPosix(filePath);
  if (FILE_ALLOWLIST.has(rel)) return [];
  return scanCssText(readFileSync(filePath, 'utf8'), rel);
}

const GUIDANCE =
  'Space text roles with the mode-tied `--gap-*` scale, not a px/rem literal — ' +
  'the scale re-modulates per spacing mode, a literal does not. See ADR-023 §3 ' +
  '(design.brikdesigns.com/docs/build-standards/content-rhythm). A genuine ' +
  'non-rhythm case (optical nudge, negative border-overlap) needs a reasoned ' +
  '`bds-lint-ignore — <why>`; a bare marker is rejected (brik-bds issue 1469).';

function render(violations, scanned) {
  if (violations.length === 0) {
    return `lint-content-rhythm: clean — ${scanned} CSS file(s) scanned, 0 hardcoded text-rhythm spacing\n`;
  }
  const out = [
    `lint-content-rhythm: ${violations.length} rhythm violation(s) in component CSS (hardcoded literal or mode-collapsing token)`,
    '',
  ];
  for (const v of violations) {
    const tag = v.bare
      ? '  ← bare bds-lint-ignore (needs a reason, brik-bds issue 1469)'
      : v.collapsing
        ? '  ← --gap-xs/--gap-tiny is 0px outside default spacing mode (ADR-024)'
        : '';
    out.push(`  ${v.file}:${v.line}  ${v.text}${tag}`);
  }
  out.push('');
  out.push(`  ↳ ${GUIDANCE}`);
  return out.join('\n') + '\n';
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    process.stdout.write(
      'lint-content-rhythm [dir] | --staged\n\n' +
        'Bans hardcoded px/rem/em margin/gap between text-role elements in component CSS ' +
        '(ADR-023 §3, brik-bds#1608).\n',
    );
    process.exit(0);
  }

  let files;
  if (args.includes('--staged')) {
    const out = execSync('git diff --cached --name-only --diff-filter=ACM', { cwd: BDS_ROOT })
      .toString()
      .split('\n')
      .filter((f) => f.startsWith('components/') && f.endsWith('.css'));
    files = out.map((f) => resolve(BDS_ROOT, f)).filter(existsSync);
  } else {
    const dir = args.find((a) => !a.startsWith('--')) ?? resolve(BDS_ROOT, 'components', 'ui');
    if (!existsSync(dir)) {
      process.stderr.write(`lint-content-rhythm: directory not found: ${dir}\n`);
      process.exit(2);
    }
    files = walkCss(dir);
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
    process.stderr.write(`lint-content-rhythm: could not determine CLI entry — ${err.message}\n`);
    return false;
  }
})();

if (isCliEntry) main();
