#!/usr/bin/env node

/**
 * BDS Health Data Builder
 *
 * Runs health.js, lint-tokens.js, audit-grid.js, and token-coverage.js in --json mode
 * and merges output into a single file for the Storybook Health Dashboard.
 *
 * Output: .storybook/public/health-data.json
 *
 * Usage:
 *   node scripts/build-health-data.js          # build data
 *   node scripts/build-health-data.js --quiet  # suppress status output
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', '.storybook', 'public', 'health-data.json');
const quiet = process.argv.includes('--quiet');

function log(msg) {
  if (!quiet) console.log(msg);
}

function runJson(script) {
  try {
    const raw = execSync(`node ${path.join(__dirname, script)} --json`, {
      encoding: 'utf8',
      timeout: 30000,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return JSON.parse(raw);
  } catch (err) {
    // Script may exit non-zero but still produce valid JSON on stdout
    if (err.stdout) {
      try { return JSON.parse(err.stdout); } catch { /* fall through */ }
    }
    return { error: `Failed to run ${script}: ${err.message}` };
  }
}

log('Building health data for Storybook dashboard...');

const data = {
  generatedAt: new Date().toISOString(),
  health: runJson('health.js'),
  lint: runJson('lint-tokens.js'),
  grid: runJson('audit-grid.js'),
  coverage: runJson('token-coverage.js'),
};

fs.writeFileSync(OUT, JSON.stringify(data, null, 2));
log(`  ✓ Written to ${path.relative(process.cwd(), OUT)}`);
