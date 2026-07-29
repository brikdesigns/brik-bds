#!/usr/bin/env node

/**
 * BDS Full Validation Suite
 *
 * Runs all checks in sequence and reports pass/fail for each.
 * Used by pre-push hook and manual validation.
 *
 * Usage:
 *   node scripts/validate-all.js
 *   npm run validate:full
 */

const { execSync } = require('child_process');

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const DIM = '\x1b[2m';
const NC = '\x1b[0m';

const steps = [
  { name: 'Token Lint', cmd: 'node scripts/lint-tokens.js --errors-only' },
  { name: 'JSDoc Lint', cmd: 'node scripts/lint-jsdoc.js' },
  { name: 'Grid Audit', cmd: 'node scripts/audit-grid.js --summary' },
  { name: 'Theme Compliance', cmd: 'node scripts/validate-themes.js' },
  { name: 'Blueprint Library', cmd: 'node scripts/validate-blueprints.mjs' },
  { name: 'BCS Vocab',        cmd: 'node scripts/bcs-vocab-check.mjs' },
  { name: 'Cascade Vocab',    cmd: 'node scripts/token-cascade-vocab-check.mjs' },
  { name: 'Inline var()',     cmd: 'node scripts/lint-inline-var.mjs' },
  // Canonical-check requires dist/tokens.css. Ensure it's built before scanning.
  // The build is fast (~1s) and idempotent, so re-running has near-zero cost.
  { name: 'Canonical Tokens', cmd: 'npm run build:dist-tokens >/dev/null && npm run canonical-check' },
  { name: 'Component Axes',  cmd: 'npm run typegen:axes:check' },
  { name: 'TypeScript', cmd: 'npm run typecheck' },
  { name: 'Storybook Build', cmd: 'npm run build-storybook' },
  // Must run AFTER the Storybook build — it validates docs cross-links + story
  // IDs against storybook-static/index.json (the build's own output).
  { name: 'Doc Links', cmd: 'node scripts/lint-doc-links.js' },
  // Validates token NAMES documented in MDX code blocks + tables against the
  // canonical registry. Self-builds dist/tokens.css if absent (already built
  // above by Canonical Tokens), so ordering here is not load-bearing.
  { name: 'MDX Tokens', cmd: 'node scripts/lint-mdx-tokens.mjs' },
  // Enforces the heading hard rule (no em dash / backtick / parenthetical /
  // slash / arrow in an ##/### heading or frontmatter title) over content/docs.
  // Pure MDX text read — no build, ordering not load-bearing.
  { name: 'MDX Headings', cmd: 'node scripts/lint-mdx-headings.mjs' },
  // A component deprecated at the component level (@deprecated on its export, or
  // a Deprecated/ Storybook title) must carry a deprecation callout on its docs
  // page. Reads component .tsx + MDX; no build, ordering not load-bearing.
  { name: 'MDX Deprecations', cmd: 'node scripts/lint-mdx-deprecations.mjs' },
  // Verifies hand-curated component prop tables (docs-site) against the TS
  // source for any table carrying a {/* props-check: … */} marker. Opt-in, so
  // ordering is not load-bearing.
  { name: 'Component Props', cmd: 'node scripts/lint-component-props.mjs' },
  // Every PUBLIC component export (index.ts re-export) must be referenced in
  // its sibling MDX page. Reads index.ts + .tsx + MDX; no build, ordering not
  // load-bearing. Exempts wip/!manifest placeholders, Tools/ dev utilities,
  // and Foundation galleries. Shipped with an empty violation set (#1495).
  { name: 'MDX Coverage', cmd: 'node scripts/lint-mdx-coverage.mjs' },

  // Guards the overlap gate's pure helpers. new-task.sh refuses to run outside
  // the primary worktree, so its inline logic can't be exercised by a test —
  // that is why the helpers live in scripts/lib/. brik-llm ships this same test
  // but wires it to nothing, which is how an untested guard rots. brik-bds#1533.
  //
  // A bash test in a directory of .test.mjs files, deliberately: it is kept
  // byte-identical to the brik-llm and brik-client-portal copies, and vitest
  // only globs .test.* so it never collides with `npm test`.
  { name: 'Overlap Filters', cmd: 'bash scripts/__tests__/test-overlap-filters.sh' },
];

console.log('\n═══════════════════════════════════════════');
console.log('  BDS Full Validation Suite');
console.log('  ' + new Date().toISOString().slice(0, 16));
console.log('═══════════════════════════════════════════\n');

let failures = 0;

for (const step of steps) {
  process.stdout.write(`  ${step.name.padEnd(22)} `);
  const start = Date.now();
  try {
    execSync(step.cmd, {
      encoding: 'utf8',
      timeout: 300000, // 5 minutes max per step
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`${GREEN}PASS${NC}  ${DIM}${elapsed}s${NC}`);
  } catch (err) {
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`${RED}FAIL${NC}  ${DIM}${elapsed}s${NC}`);
    if (err.stderr) {
      const summary = err.stderr.toString().split('\n').filter(l => l.trim()).slice(0, 3).join('\n');
      if (summary) console.log(`  ${DIM}${summary}${NC}`);
    }
    failures++;
  }
}

console.log('\n═══════════════════════════════════════════');
if (failures === 0) {
  console.log(`  ${GREEN}All ${steps.length} checks passed${NC}`);
} else {
  console.log(`  ${RED}${failures} of ${steps.length} checks failed${NC}`);
}
console.log('═══════════════════════════════════════════\n');

process.exit(failures > 0 ? 1 : 0);
