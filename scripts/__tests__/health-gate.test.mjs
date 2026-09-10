import { describe, it, expect } from 'vitest';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCRIPT = join(__dirname, '..', 'health-gate.js');
const REPO_ROOT = join(__dirname, '..', '..');
const require = createRequire(import.meta.url);
const { evaluate } = require('../health-gate.js');

const baseline = {
  metrics: {
    completeness: { floor: 90, label: 'Completeness' },
    grid: { floor: 80, label: 'Grid' },
    coverage: { floor: 30, label: 'Coverage' },
  },
};

describe('health-gate evaluate() — the ratchet', () => {
  it('passes when every metric is at or above its floor', () => {
    const r = evaluate({ completeness: 90, grid: 85, coverage: 42 }, baseline);
    expect(r.pass).toBe(true);
    expect(r.rows.every(x => x.pass)).toBe(true);
  });

  // The AC: a metric below its floor must fail the gate.
  it('FAILS when one metric drops below its floor', () => {
    const r = evaluate({ completeness: 89, grid: 85, coverage: 42 }, baseline);
    expect(r.pass).toBe(false);
    expect(r.rows.find(x => x.key === 'completeness').pass).toBe(false);
  });

  // Fail-closed: an unmeasurable metric is a failure, never a silent pass.
  it('FAILS when a metric could not be measured', () => {
    const r = evaluate({ completeness: 99, grid: undefined, coverage: 42 }, baseline);
    expect(r.pass).toBe(false);
    expect(r.rows.find(x => x.key === 'grid').measured).toBe(false);
  });
});

/** Run the real CLI with a baseline whose floors are set to a given value. */
function runCli(floors) {
  const { mkdtempSync, writeFileSync } = require('node:fs');
  const { tmpdir } = require('node:os');
  const file = join(mkdtempSync(join(tmpdir(), 'health-gate-')), 'baseline.json');
  writeFileSync(file, JSON.stringify({
    metrics: {
      completeness: { floor: floors, source: '', label: 'Completeness' },
      grid: { floor: floors, source: '', label: 'Grid' },
      coverage: { floor: floors, source: '', label: 'Coverage' },
    },
  }));
  let code = 0;
  let stdout = '';
  try {
    stdout = execFileSync('node', [SCRIPT, '--json'], {
      encoding: 'utf8',
      cwd: REPO_ROOT,
      env: { ...process.env, HEALTH_BASELINE: file },
    });
  } catch (err) {
    code = err.status ?? 1;
    stdout = err.stdout?.toString() ?? '';
  }
  return { code, json: JSON.parse(stdout) };
}

describe('health-gate CLI — end to end against the real reporters', () => {
  it('exits 0 when floors are trivially satisfiable (0%)', () => {
    const { code, json } = runCli(0);
    expect(code).toBe(0);
    expect(json.pass).toBe(true);
  });

  it('exits 1 when floors are impossible (101%)', () => {
    const { code, json } = runCli(101);
    expect(code).toBe(1);
    expect(json.pass).toBe(false);
  });
});
