#!/usr/bin/env node

/**
 * BDS Health Gate (#2366)
 *
 * Turns the three passive Health-Dashboard reporters — completeness, grid,
 * token coverage — into a blocking ratchet. Runs each in --json (the same way
 * build-health-data.js aggregates them), reads the committed floors from
 * tokens/health-baseline.json, and exits 1 if any metric fell below its floor.
 *
 * Ratchet, no regression: a PR may hold or improve a metric, never drop below.
 * Lint is already gated by lint-tokens.js in release.yml / tokens-gate.yml, so
 * it is not repeated here.
 *
 * Usage:
 *   node scripts/health-gate.js          # gate against tokens/health-baseline.json
 *   node scripts/health-gate.js --json   # machine-readable result, still sets exit code
 *   node scripts/health-gate.js --write  # re-seed floors from current values (CI-only)
 *
 * Env:
 *   HEALTH_BASELINE   override the baseline path (used by the self-test)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BASELINE = process.env.HEALTH_BASELINE || path.join(__dirname, '..', 'tokens', 'health-baseline.json');
const jsonMode = process.argv.includes('--json');
const writeMode = process.argv.includes('--write');

// ─── Metric extraction ──────────────────────────────────────────────
// Each reporter emits a different --json shape; map key → (script, pluck).

const METRICS = {
  completeness: { script: 'health.js', pluck: j => j.completeness?.pct },
  grid: { script: 'audit-grid.js', pluck: j => j.spatialPct },
  coverage: { script: 'token-coverage.js', pluck: j => j.usagePct },
};

function runJson(script) {
  try {
    const raw = execSync(`node ${path.join(__dirname, script)} --json`, {
      encoding: 'utf8',
      timeout: 30000,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return JSON.parse(raw);
  } catch (err) {
    // Reporters exit non-zero on their own thresholds but still emit JSON.
    if (err.stdout) {
      try { return JSON.parse(err.stdout); } catch { /* fall through */ }
    }
    return null;
  }
}

/**
 * Pure evaluation — no I/O. Given measured values and baseline floors, return
 * a row per metric and whether the whole gate passes. Exported so the self-test
 * can prove the below-floor case without shelling out to the real reporters.
 */
function evaluate(values, baseline) {
  const rows = Object.keys(baseline.metrics).map(key => {
    const floor = baseline.metrics[key].floor;
    const value = values[key];
    const measured = typeof value === 'number';
    // A metric we could not measure is a failure, not a silent pass — the
    // ratchet must fail closed.
    const pass = measured && value >= floor;
    return { key, label: baseline.metrics[key].label, floor, value, measured, pass };
  });
  return { pass: rows.every(r => r.pass), rows };
}

function gather() {
  const values = {};
  for (const [key, { script, pluck }] of Object.entries(METRICS)) {
    const json = runJson(script);
    values[key] = json ? pluck(json) : undefined;
  }
  return values;
}

function main() {
  const baseline = JSON.parse(fs.readFileSync(BASELINE, 'utf8'));
  const values = gather();

  // Regen mode (CI-only): overwrite each floor with the current measured value.
  // The ratchet only ever moves floors up in practice, but this records exactly
  // what was measured — an unmeasurable metric aborts rather than writing a hole.
  if (writeMode) {
    for (const key of Object.keys(baseline.metrics)) {
      const v = values[key];
      if (typeof v !== 'number') {
        console.error(`✗ ${key} could not be measured — refusing to write a baseline with a gap.`);
        process.exit(1);
      }
      baseline.metrics[key].floor = v;
    }
    fs.writeFileSync(BASELINE, JSON.stringify(baseline, null, 2) + '\n');
    console.log(`✓ Re-seeded floors: ${Object.entries(baseline.metrics).map(([k, m]) => `${k}=${m.floor}`).join(', ')}`);
    process.exit(0);
  }

  const { pass, rows } = evaluate(values, baseline);

  if (jsonMode) {
    console.log(JSON.stringify({ pass, rows }, null, 2));
  } else {
    console.log('\n🩺 BDS Health Gate (ratchet — no regression)\n');
    for (const r of rows) {
      const mark = r.pass ? '✓' : '✗';
      const shown = r.measured ? `${r.value}%` : 'UNMEASURED';
      console.log(`  ${mark}  ${r.label.padEnd(38)} ${String(shown).padStart(11)}  (floor ${r.floor}%)`);
    }
    console.log('');
    if (!pass) {
      console.log('  A metric fell below its committed floor. Raise it, or — if this is an');
      console.log('  intentional improvement to the floor — run the Update Health Baseline');
      console.log('  workflow. Baselines are never regenerated locally.\n');
    }
  }

  process.exit(pass ? 0 : 1);
}

module.exports = { evaluate, METRICS };

if (require.main === module) main();
