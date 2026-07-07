#!/usr/bin/env node
/**
 * lint-inline-var — bans raw inline `var(--…)` token consumption in component TSX.
 *
 * CLAUDE.md + the component-build standard mandate CSS-over-inline: a component's
 * CSS file (BEM under `bds-`, keyed on state via class / `[data-*]` / `[aria-*]`)
 * owns styling. Inline `style={{ … 'var(--token)' … }}` objects re-introduce
 * untracked token references that bypass the cascade, can't express pseudo-states,
 * and fight external overrides on specificity. See brik-bds#892.
 *
 * ── What's flagged vs allowed ──────────────────────────────────────────────
 *
 *   Flagged   — CONSUMING a token in an inline style value:
 *                 style={{ color: 'var(--text-primary)' }}
 *
 *   Allowed   — DEFINING a `--bds-*` custom property inline (a runtime binding —
 *               the sanctioned Component-tier pattern in token-anatomy.mdx):
 *                 style={{ '--bds-slider-percent': `${pct}%` }}
 *
 * ── Baseline ────────────────────────────────────────────────────────────────
 *
 * Existing offenders are listed in BASELINE and do not fail the gate — they're
 * burned down in per-component follow-up PRs (#892). A file NOT in the baseline
 * that introduces a consuming inline var() fails the build. As each component is
 * cleaned, delete its entry from BASELINE so it can never regress.
 *
 * ── Exit codes ───────────────────────────────────────────────────────────────
 *   0  Clean — no un-baselined inline token consumption
 *   1  Violations found (new offender, or a baselined file that's now clean —
 *      remove it from BASELINE)
 *   2  Bad invocation
 *
 * ── CLI ──────────────────────────────────────────────────────────────────────
 *   lint-inline-var [dir]      Scan dir (default: components/ui)
 *   lint-inline-var --staged   Scan only staged .tsx files (pre-commit)
 *   lint-inline-var --help
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { resolve, join, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BDS_ROOT = resolve(__dirname, '..');

// ── Baseline — known offenders, burned down per-component in #892 ────────────
// Paths are repo-relative, POSIX separators. Remove an entry once its component
// is fully migrated to CSS (the gate then guards it against regression).
const BASELINE = new Set([
]);

// A line that DEFINES a `--bds-*` custom property (runtime binding) — allowed.
const BDS_DEFINE_RE = /['"]--bds-[\w-]+['"]\s*:/;
// A line that CONSUMES a token via var(--…) — the violation.
const VAR_CONSUME_RE = /var\(\s*--/;

function walkTsx(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      walkTsx(full, acc);
    } else if (
      entry.endsWith('.tsx') &&
      !entry.endsWith('.stories.tsx') &&
      !entry.endsWith('.test.tsx')
    ) {
      acc.push(full);
    }
  }
  return acc;
}

function relPosix(abs) {
  return relative(BDS_ROOT, abs).split(sep).join('/');
}

function scanFile(filePath) {
  const rel = relPosix(filePath);
  if (BASELINE.has(rel)) return { violations: [], baselinedButClean: false, rel };

  const lines = readFileSync(filePath, 'utf8').split('\n');
  const violations = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!VAR_CONSUME_RE.test(line)) continue;
    if (BDS_DEFINE_RE.test(line)) continue; // runtime binding — allowed
    violations.push({ file: rel, line: i + 1, text: line.trim() });
  }
  return { violations, rel };
}

// A baselined file that is now clean should be removed from the baseline.
function baselinedFileStillDirty(rel) {
  const abs = resolve(BDS_ROOT, rel);
  if (!existsSync(abs)) return false;
  const lines = readFileSync(abs, 'utf8').split('\n');
  return lines.some((l) => VAR_CONSUME_RE.test(l) && !BDS_DEFINE_RE.test(l));
}

const GUIDANCE =
  'Move the token into the component CSS (BEM under `bds-`, keyed on state via ' +
  'class / [data-*] / [aria-*]); inline style objects must not consume tokens. ' +
  'Defining a `--bds-*` custom property inline (runtime binding) is allowed. ' +
  'See .claude/standards/component-build.md and brik-bds#892.';

function render(allViolations, staleBaseline, scanned) {
  const out = [];
  if (allViolations.length === 0 && staleBaseline.length === 0) {
    return `lint-inline-var: clean — ${scanned} TSX file(s) scanned, 0 un-baselined inline token consumers\n`;
  }
  if (allViolations.length > 0) {
    out.push(`lint-inline-var: ${allViolations.length} inline token consumer(s) outside the baseline`);
    out.push('');
    for (const v of allViolations) {
      out.push(`  ${v.file}:${v.line}  ${v.text}`);
    }
    out.push('');
    out.push(`  ↳ ${GUIDANCE}`);
  }
  if (staleBaseline.length > 0) {
    out.push('');
    out.push(`lint-inline-var: ${staleBaseline.length} baseline entr(y/ies) now clean — remove from BASELINE in scripts/lint-inline-var.mjs:`);
    for (const rel of staleBaseline) out.push(`  ${rel}`);
  }
  return out.join('\n') + '\n';
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    process.stdout.write(
      'lint-inline-var [dir] | --staged\n\nBans raw inline var(--…) token consumption in component TSX (brik-bds#892).\n',
    );
    process.exit(0);
  }

  let files;
  if (args.includes('--staged')) {
    const out = execSync('git diff --cached --name-only --diff-filter=ACM', { cwd: BDS_ROOT })
      .toString()
      .split('\n')
      .filter((f) => f.endsWith('.tsx') && !f.endsWith('.stories.tsx') && !f.endsWith('.test.tsx'));
    files = out.map((f) => resolve(BDS_ROOT, f)).filter(existsSync);
  } else {
    const dir = args.find((a) => !a.startsWith('--')) ?? resolve(BDS_ROOT, 'components', 'ui');
    if (!existsSync(dir)) {
      process.stderr.write(`lint-inline-var: directory not found: ${dir}\n`);
      process.exit(2);
    }
    files = walkTsx(dir);
  }

  const allViolations = [];
  for (const file of files) {
    allViolations.push(...scanFile(file).violations);
  }

  // Only surface stale-baseline hints on a full scan (not --staged).
  const staleBaseline = args.includes('--staged')
    ? []
    : [...BASELINE].filter((rel) => !baselinedFileStillDirty(rel));

  process.stdout.write(render(allViolations, staleBaseline, files.length));
  process.exit(allViolations.length > 0 || staleBaseline.length > 0 ? 1 : 0);
}

main();
