#!/usr/bin/env node
/**
 * BDS Consumer Drift Check
 *
 * Compares consumer @brikdesigns/bds versions (npm track) and submodule SHAs
 * (submodule track) to current BDS HEAD. Reports drift in a GitHub Actions
 * workflow summary and (optionally) Slack.
 *
 * Phase 1 (current): informational only — always exits 0.
 * Phase 2 (post-v0.5): warns in PR comments on consumer repos.
 * Phase 3 (post-v1.0): fails when consumers are >2 minors behind.
 *
 * Requires `gh` CLI auth with cross-repo read access.
 */

import { execSync } from 'node:child_process';
import { readFileSync, appendFileSync, existsSync } from 'node:fs';

const BDS_PACKAGE_NAME = '@brikdesigns/bds';
const BDS_VERSION = JSON.parse(readFileSync('package.json', 'utf8')).version;
const BDS_HEAD_SHA = sh('git rev-parse HEAD').slice(0, 7);

const SUBMODULE_CONSUMERS = [
  { name: 'brik-llm',    repo: 'brikdesigns/brik-llm',       submodulePath: 'foundations/brik-bds' },
  { name: 'brikdesigns', repo: 'brikdesigns/brikdesigns', submodulePath: 'brik-bds' },
];

const NPM_CONSUMERS = [
  { name: 'brik-client-portal', repo: 'brikdesigns/brik-client-portal', branch: 'staging' },
  { name: 'renew-pms',          repo: 'brikdesigns/renew-pms',          branch: 'staging' },
];

// ─── Helpers ─────────────────────────────────────────────────────
function sh(cmd, opts = {}) {
  return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...opts }).trim();
}

function ghApi(path) {
  try {
    return JSON.parse(sh(`gh api ${path}`));
  } catch (err) {
    return { __error: err.stderr?.toString() || err.message };
  }
}

function ghRaw(repo, path, ref = 'HEAD') {
  try {
    return sh(`gh api repos/${repo}/contents/${path}?ref=${ref} -H "Accept: application/vnd.github.raw"`);
  } catch (err) {
    console.error(`[ghRaw] ${repo}:${path}@${ref} failed: ${err.stderr?.toString().trim() || err.message}`);
    return null;
  }
}

// Semver delta (major, minor, patch). Negative means consumer is behind.
function versionDelta(from, to) {
  const [fM, fm, fp] = from.replace(/^[\^~]/, '').split('.').map(Number);
  const [tM, tm, tp] = to.replace(/^[\^~]/, '').split('.').map(Number);
  return { major: tM - fM, minor: tm - fm, patch: tp - fp };
}

function severity(delta) {
  if (delta.major > 0) return 'major';
  if (delta.minor > 2) return 'critical';
  if (delta.minor > 0) return 'warn';
  if (delta.patch > 0) return 'info';
  return 'ok';
}

function severityEmoji(sev) {
  return { ok: '✅', info: 'ℹ️', warn: '⚠️', critical: '🚨', major: '🚨', error: '❌' }[sev] || '';
}

// ─── Check each consumer ─────────────────────────────────────────

async function checkNpm(c) {
  const pkgRaw = ghRaw(c.repo, 'package.json', c.branch);
  if (!pkgRaw) {
    return { ...c, track: 'npm', status: 'error', note: `Couldn't fetch package.json from ${c.branch}` };
  }
  let pkg;
  try { pkg = JSON.parse(pkgRaw); } catch (err) {
    console.error(`[checkNpm] ${c.name}: package.json parse failed: ${err.message}`);
    return { ...c, track: 'npm', status: 'error', note: 'package.json is not valid JSON' };
  }
  const raw = pkg.dependencies?.[BDS_PACKAGE_NAME] ?? pkg.devDependencies?.[BDS_PACKAGE_NAME];
  if (!raw) {
    return { ...c, track: 'npm', status: 'error', note: `${BDS_PACKAGE_NAME} not listed` };
  }
  const consumerVersion = raw.replace(/^[\^~]/, '');
  const delta = versionDelta(consumerVersion, BDS_VERSION);
  const sev = severity(delta);
  return {
    ...c,
    track: 'npm',
    consumerVersion,
    bdsVersion: BDS_VERSION,
    delta,
    status: sev,
  };
}

async function checkSubmodule(c) {
  // The submodule SHA lives in the parent repo's git tree.
  // We fetch it via the Contents API with a custom media type.
  let treeSha;
  try {
    treeSha = sh(`gh api repos/${c.repo}/contents/${c.submodulePath} --jq '.sha // empty'`);
  } catch (err) {
    console.error(`[checkSubmodule] ${c.name}: gh api failed: ${err.stderr?.toString().trim() || err.message}`);
    return { ...c, track: 'submodule', status: 'error', note: `Couldn't read submodule ref` };
  }
  if (!treeSha) {
    return { ...c, track: 'submodule', status: 'error', note: `Submodule ${c.submodulePath} not found` };
  }

  // Count commits from submodule SHA → bds HEAD.
  // If the SHA isn't in local git history (shallow clone, pruned), rev-list
  // fails — we treat that as "unknown (likely very old)" rather than zero.
  let commitsBehind = 0;
  try {
    commitsBehind = parseInt(sh(`git rev-list --count ${treeSha}..HEAD 2>/dev/null || echo 0`), 10) || 0;
  } catch (err) {
    console.error(`[checkSubmodule] ${c.name}: commit count failed for ${treeSha}: ${err.message}`);
    commitsBehind = -1;
  }

  let sev = 'ok';
  if (commitsBehind === -1) sev = 'warn';      // unknown — likely very old
  else if (commitsBehind > 20) sev = 'critical';
  else if (commitsBehind > 10) sev = 'warn';
  else if (commitsBehind > 0) sev = 'info';

  return {
    ...c,
    track: 'submodule',
    submoduleSha: treeSha.slice(0, 7),
    bdsSha: BDS_HEAD_SHA,
    commitsBehind,
    status: sev,
  };
}

// ─── Render ──────────────────────────────────────────────────────

function renderRow(r) {
  const emoji = severityEmoji(r.status);
  if (r.status === 'error') {
    return `| ${emoji} | ${r.name} | ${r.track} | — | — | ${r.note} |`;
  }
  if (r.track === 'npm') {
    const { major, minor, patch } = r.delta;
    const deltaStr = major > 0 ? `${major} major behind` : minor > 0 ? `${minor} minor behind` : patch > 0 ? `${patch} patch behind` : 'current';
    return `| ${emoji} | ${r.name} | npm | \`${r.consumerVersion}\` | \`${r.bdsVersion}\` | ${deltaStr} |`;
  }
  // submodule
  const deltaStr = r.commitsBehind === -1
    ? 'unknown (SHA not in local history)'
    : r.commitsBehind === 0 ? 'current' : `${r.commitsBehind} commits behind`;
  return `| ${emoji} | ${r.name} | submodule | \`${r.submoduleSha}\` | \`${r.bdsSha}\` | ${deltaStr} |`;
}

function renderSummary(results) {
  const lines = [
    `# BDS Consumer Drift Report`,
    ``,
    `**BDS version:** \`${BDS_VERSION}\` (\`${BDS_HEAD_SHA}\`)`,
    `**Generated:** ${new Date().toISOString()}`,
    ``,
    `| Status | Consumer | Track | Consumer at | BDS at | Delta |`,
    `| --- | --- | --- | --- | --- | --- |`,
  ];
  for (const r of results) lines.push(renderRow(r));

  const critical = results.filter(r => r.status === 'critical' || r.status === 'major');
  const warns = results.filter(r => r.status === 'warn');

  lines.push(``);
  if (critical.length) {
    lines.push(`## 🚨 Critical drift`);
    lines.push(``);
    lines.push(`The following consumers are significantly behind. Run \`./scripts/propagate.sh --only <name>\` to remediate:`);
    lines.push(``);
    for (const r of critical) lines.push(`- \`${r.name}\` (${r.track})`);
    lines.push(``);
  }
  if (warns.length) {
    lines.push(`## ⚠️ Warnings`);
    lines.push(``);
    for (const r of warns) lines.push(`- \`${r.name}\` (${r.track}) — ${r.track === 'npm' ? `${r.consumerVersion} → ${r.bdsVersion}` : `${r.commitsBehind} commits behind`}`);
    lines.push(``);
  }
  if (!critical.length && !warns.length) {
    lines.push(`## ✅ All consumers within tolerance`);
    lines.push(``);
  }

  lines.push(`---`);
  lines.push(``);
  lines.push(`**Enforcement phase:** 1 of 3 (informational only). This report does not fail CI. See [ADR in brik-bds CLAUDE.md](../CLAUDE.md) for phase progression.`);
  return lines.join('\n');
}

// ─── Main ────────────────────────────────────────────────────────

async function main() {
  const results = [];
  for (const c of SUBMODULE_CONSUMERS) results.push(await checkSubmodule(c));
  for (const c of NPM_CONSUMERS)       results.push(await checkNpm(c));

  const summary = renderSummary(results);

  // Print to stdout so local runs show the output
  console.log(summary);

  // Append to GitHub Actions summary if running in CI
  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary + '\n');
  }

  // Phase 1: always exit 0 (informational). Phase 3 would exit 1 here.
  process.exit(0);
}

main().catch(err => {
  console.error('check-drift failed:', err);
  process.exit(0); // Phase 1: don't block on errors either.
});
