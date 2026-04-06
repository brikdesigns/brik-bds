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
  { name: 'Grid Audit', cmd: 'node scripts/audit-grid.js --summary' },
  { name: 'Theme Compliance', cmd: 'node scripts/validate-themes.js' },
  { name: 'TypeScript', cmd: 'npm run typecheck' },
  { name: 'Storybook Build', cmd: 'npm run build-storybook' },
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
