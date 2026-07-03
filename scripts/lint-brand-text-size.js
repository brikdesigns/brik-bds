#!/usr/bin/env node
/**
 * lint-brand-text-size — enforce ADR-015's brand-text usage rule.
 *
 * ADR-015 (§ Advisory claim) + tokens/contrast-pairings.json state:
 *   "small body copy NEVER uses --text-brand-primary, it uses --text-primary."
 * That rule was advisory-only — the contrast gate scores token *pairings*, not
 * rendered font sizes, so it can't catch `--text-brand-primary` bound to small
 * body text (3.78:1 on white — below the AA-normal 4.5:1 floor). This lint makes
 * the rule CI-asserted (#1064 / BDS-18, AC1).
 *
 * Scope decision — body vs label:
 *   `--text-brand-primary` is legitimately used across the library for LINK / TAB /
 *   BREADCRUMB affordances, which ADR-015 gates at AA-large (3:1) as brand accent.
 *   BDS's type system separates `--body-*` (paragraph copy) from `--label-*` (UI
 *   labels/links). This lint flags brand-primary co-occurring with a SMALL BODY
 *   size (`--body-xs` / `--body-sm`) — the exact "small body copy" the rule bans —
 *   and deliberately leaves `--label-*` affordances alone. Whether small `--label-*`
 *   brand text is acceptable is the #1064 AC3 policy reconciliation, not this lint.
 *
 * Escape hatch: put `bds-lint-ignore` on the `--text-brand-primary` line (tracked
 * cases live in #1103).
 *
 * Usage:
 *   node scripts/lint-brand-text-size.js   # exit 1 on any un-ignored violation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const COMPONENTS = path.join(ROOT, 'components');
const BRAND = '--text-brand-primary';
const SMALL_BODY = /--body-(xs|sm)\b/; // paragraph copy at a small size

function componentCssFiles() {
  const out = execSync(`grep -rlE -e "${BRAND}" "${COMPONENTS}" || true`, { encoding: 'utf8' });
  return out.split('\n').filter((f) => f && f.endsWith('.css'));
}

// The enclosing rule for a declaration: nearest `{`-bearing line above, nearest
// `}`-bearing line below. Correct for flat rules and rules nested in @media.
function enclosingBlock(lines, i) {
  let start = i;
  while (start >= 0 && !lines[start].includes('{')) start--;
  let end = i;
  while (end < lines.length && !lines[end].includes('}')) end++;
  return { start, text: lines.slice(Math.max(start, 0), end + 1).join('\n') };
}

function main() {
  const violations = [];
  for (const file of componentCssFiles()) {
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, i) => {
      if (!line.includes(BRAND)) return;
      if (line.includes('bds-lint-ignore')) return;
      const { start, text } = enclosingBlock(lines, i);
      const m = text.match(SMALL_BODY);
      if (!m) return;
      const selector = start >= 0 ? lines[start].replace('{', '').trim() : '(unknown)';
      violations.push({ file: path.relative(ROOT, file), line: i + 1, selector, size: m[0] });
    });
  }

  if (violations.length === 0) {
    console.log('✓ brand-text-size: no --text-brand-primary on small body copy.');
    process.exit(0);
  }

  console.error('✗ brand-text-size: --text-brand-primary used on small body copy (ADR-015 says use --text-primary).\n');
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line}  ${v.selector}`);
    console.error(`     color: var(--text-brand-primary) in a rule sized ${v.size} — 3.78:1 on white, fails AA-normal.`);
  }
  console.error('\n  Fix: use --text-primary for body copy, or promote to a --label-* affordance role (AA-large per ADR-015).');
  console.error('  Escape hatch (tracked): add `bds-lint-ignore` on the line — see #1103.');
  process.exit(1);
}

main();
