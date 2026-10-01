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
 * ── Enforcement ──────────────────────────────────────────────────────────────
 *
 * The #892 burn-down is complete: every component is clean, so the gate enforces
 * repo-wide — any consuming inline var() in component TSX fails the build.
 * (History: offenders were once grandfathered in a BASELINE set and removed
 * per-component as they migrated to CSS; the set emptied when #892 closed.)
 *
 * ── Exit codes ───────────────────────────────────────────────────────────────
 *   0  Clean — no inline token consumption
 *   1  Violations found
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

const GUIDANCE =
  'Move the token into the component CSS (BEM under `bds-`, keyed on state via ' +
  'class / [data-*] / [aria-*]); inline style objects must not consume tokens. ' +
  'Defining a `--bds-*` custom property inline (runtime binding) is allowed. ' +
  'See .claude/standards/component-build.md and brik-bds#892.';

function render(allViolations, scanned) {
  if (allViolations.length === 0) {
    return `lint-inline-var: clean — ${scanned} TSX file(s) scanned, 0 inline token consumers\n`;
  }
  const out = [`lint-inline-var: ${allViolations.length} inline token consumer(s) in component TSX`, ''];
  for (const v of allViolations) {
    out.push(`  ${v.file}:${v.line}  ${v.text}`);
  }
  out.push('');
  out.push(`  ↳ ${GUIDANCE}`);
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
      // Scope to component TSX only — matches the whole-repo default (components/ui)
      // and the linter's stated purpose. Storybook config (.storybook/**) and other
      // non-component TSX are out of scope; #892 was a component-tier burn-down.
      .filter(
        (f) =>
          f.startsWith('components/') &&
          f.endsWith('.tsx') &&
          !f.endsWith('.stories.tsx') &&
          !f.endsWith('.test.tsx'),
      );
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

  process.stdout.write(render(allViolations, files.length));
  process.exit(allViolations.length > 0 ? 1 : 0);
}

main();
