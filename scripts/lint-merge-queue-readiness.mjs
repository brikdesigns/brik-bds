#!/usr/bin/env node
/**
 * lint-merge-queue-readiness.mjs — is every required-check workflow ready to run
 * under a GitHub merge queue?
 *
 * Why this exists (brik-bds#2413, part of #2412):
 *
 * A merge queue validates a PR by building a `merge_group` and re-running the
 * branch's required status checks against the rebased head. GitHub couples the
 * two: the merge-group required checks ARE the branch-protection required checks,
 * not a separate list. A workflow that triggers only on `pull_request` produces
 * NO check-run for the merge group, so the required context never reports and the
 * group sits pending forever — `main` wedges.
 *
 * That is the exact class `.github/required-checks.json` § _why already guards for
 * the trigger-level case (brik-llm#1937 arm B; closed incidents #2089, #2322): a
 * required context that never reports is worse than a red one, because nothing
 * renders and "all checks passed" is what a stuck queue looks like too.
 *
 * So before the 17 required workflows are migrated to `on: merge_group`, and
 * before the `merge_queue` ruleset is ever enabled on `main`, this auditor makes
 * the gap MEASURABLE and REGRESSION-PROOF:
 *
 *   - Report mode (default): print a per-context readiness table and an `N/17
 *     ready` summary, then exit 0. Safe to run anywhere; it does NOT block `main`
 *     while the gap is the expected state.
 *   - `--enforce`: exit 1 if any required context's workflow lacks a `merge_group`
 *     trigger. This is the mode the eventual queue-enable PR gates on — flip the
 *     ruleset only once `--enforce` is clean.
 *
 * It reads the required set from `.github/required-checks.json` (the same
 * in-tree source of truth the contexts auditor uses), so it can never drift from
 * what protection actually requires.
 *
 * Parsing note: there is no YAML dependency in this repo, and adding one for a
 * lint script is not worth it. The two things this needs — the `on:` trigger set
 * and the contexts a workflow produces — are read with focused line parsing,
 * covered by fixtures in scripts/__tests__/lint-merge-queue-readiness.test.mjs.
 * A GitHub check context is a job's `name:` when set, else its job id; both are
 * collected so the three contexts whose job name differs from their file name
 * (`require-area-label`→pr-label-gate, `require-issue-link`→pr-issue-link-gate,
 * `closing-keyword-guard`→bump-pr-closing-keyword-guard) still resolve.
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const WORKFLOW_DIR = '.github/workflows';
const REQUIRED_CHECKS_JSON = '.github/required-checks.json';

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const DIM = '\x1b[2m';
const NC = '\x1b[0m';

/**
 * The set of trigger names in a workflow's top-level `on:` block.
 *
 * Handles the three YAML shapes GitHub accepts:
 *   on: push                       → {'push'}
 *   on: [pull_request, merge_group] → {'pull_request','merge_group'}
 *   on:                            → block form; 2-space-indented keys
 *     pull_request:
 *     merge_group:
 *
 * The block ends at the next column-0 line that is not blank or a comment.
 */
export function extractOnTriggers(text) {
  const lines = text.split('\n');
  const triggers = new Set();

  for (let i = 0; i < lines.length; i += 1) {
    // Match `on:` at column 0, optionally quoted ("on":) — never an `on` nested
    // inside another key (e.g. a `concurrency:` value), which is why column 0.
    const head = lines[i].match(/^(?:"on"|'on'|on)\s*:(.*)$/);
    if (!head) continue;

    const inline = head[1].trim();
    if (inline) {
      // Inline scalar (`on: push`) or flow list (`on: [a, b]`).
      const list = inline.match(/^\[(.*)\]$/);
      const items = list ? list[1].split(',') : [inline];
      for (const raw of items) {
        const name = raw.trim().replace(/['"]/g, '');
        if (name) triggers.add(name);
      }
      return triggers;
    }

    // Block form: consume indented lines until a column-0 non-blank, non-comment.
    for (let j = i + 1; j < lines.length; j += 1) {
      const line = lines[j];
      if (/^\s*(#.*)?$/.test(line)) continue; // blank or comment
      if (!/^\s/.test(line)) break; // dedent to column 0 → block over
      const key = line.match(/^\s{2}([A-Za-z_][A-Za-z0-9_-]*)\s*:/);
      if (key) triggers.add(key[1]);
    }
    return triggers;
  }

  return triggers;
}

/**
 * The check contexts a workflow file produces: each job's `name:` when present,
 * else the job id. Only the first `name:` inside a job (its job-level display
 * name) counts — a `name:` nested under `steps:` is deeper-indented and ignored.
 */
export function extractContexts(text) {
  const lines = text.split('\n');
  const contexts = [];

  // Find the column-0 `jobs:` key.
  let start = -1;
  for (let i = 0; i < lines.length; i += 1) {
    if (/^jobs\s*:/.test(lines[i])) {
      start = i + 1;
      break;
    }
  }
  if (start === -1) return contexts;

  let currentJob = null;
  let jobName = null;
  const flush = () => {
    if (currentJob) contexts.push(jobName ?? currentJob);
    currentJob = null;
    jobName = null;
  };

  for (let i = start; i < lines.length; i += 1) {
    const line = lines[i];
    if (/^\S/.test(line) && line.trim() !== '') break; // dedent out of jobs:

    const job = line.match(/^\s{2}([A-Za-z_][A-Za-z0-9_-]*)\s*:\s*$/);
    if (job) {
      flush();
      currentJob = job[1];
      continue;
    }
    if (currentJob && jobName === null) {
      const nm = line.match(/^\s{4}name\s*:\s*(.+?)\s*$/);
      if (nm) jobName = nm[1].replace(/^['"]|['"]$/g, '');
    }
  }
  flush();

  return contexts;
}

/** Every workflow file, as { file, triggers:Set, contexts:string[] }. */
export function readWorkflows(dir, read = readFileSync, list = readdirSync) {
  return list(dir)
    .filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'))
    .sort()
    .map((f) => {
      const text = read(join(dir, f), 'utf8');
      return {
        file: f,
        triggers: extractOnTriggers(text),
        contexts: extractContexts(text),
      };
    });
}

/**
 * Cross the required contexts with the workflows that produce them.
 * Returns one row per required context:
 *   { context, file|null, mergeGroup:boolean, ready:boolean, error?:string }
 * `error` is set when no workflow (or more than one) produces the context —
 * either is a mapping fault the migration must not paper over.
 */
export function auditReadiness(requiredContexts, workflows) {
  const producers = new Map(); // context -> [{file, mergeGroup}]
  for (const wf of workflows) {
    const mergeGroup = wf.triggers.has('merge_group');
    for (const ctx of wf.contexts) {
      if (!producers.has(ctx)) producers.set(ctx, []);
      producers.get(ctx).push({ file: wf.file, mergeGroup });
    }
  }

  return requiredContexts.map((context) => {
    const hits = producers.get(context) ?? [];
    if (hits.length === 0) {
      return { context, file: null, mergeGroup: false, ready: false, error: 'no workflow produces this context' };
    }
    if (hits.length > 1) {
      const files = hits.map((h) => h.file).join(', ');
      return { context, file: files, mergeGroup: false, ready: false, error: `produced by ${hits.length} workflows (${files})` };
    }
    const { file, mergeGroup } = hits[0];
    return { context, file, mergeGroup, ready: mergeGroup };
  });
}

export function loadRequiredContexts(path = REQUIRED_CHECKS_JSON, read = readFileSync) {
  const data = JSON.parse(read(path, 'utf8'));
  return data.contexts ?? [];
}

function main(argv) {
  const enforce = argv.includes('--enforce');
  const required = loadRequiredContexts();
  const workflows = readWorkflows(WORKFLOW_DIR);
  const rows = auditReadiness(required, workflows);

  const ready = rows.filter((r) => r.ready).length;
  const total = rows.length;

  console.log(`${DIM}merge-queue readiness — required checks must trigger on \`merge_group\`${NC}\n`);
  for (const r of rows) {
    if (r.error) {
      console.log(`  ${RED}✗ ${r.context}${NC}  ${YELLOW}${r.error}${NC}`);
    } else if (r.ready) {
      console.log(`  ${GREEN}✓ ${r.context}${NC}  ${DIM}${r.file}${NC}`);
    } else {
      console.log(`  ${YELLOW}· ${r.context}${NC}  ${DIM}${r.file} — no \`merge_group\` trigger${NC}`);
    }
  }

  const errors = rows.filter((r) => r.error);
  const summaryColor = ready === total ? GREEN : YELLOW;
  console.log(`\n${summaryColor}${ready}/${total} required checks ready for a merge queue${NC}`);
  if (errors.length) {
    console.log(
      `${RED}${errors.length} context(s) do not map cleanly to a single workflow — fix the mapping before migrating.${NC}`,
    );
  }

  if (enforce && (ready !== total || errors.length)) {
    console.error(
      `\n${RED}✗ --enforce: not every required check triggers on \`merge_group\`.${NC}\n` +
        `${DIM}  Enabling the merge_queue ruleset now would wedge \`main\` on the contexts above.${NC}\n` +
        `${DIM}  Add \`merge_group\` to each remaining workflow first (brik-bds#2412).${NC}`,
    );
    process.exit(1);
  }

  if (!enforce && ready !== total) {
    console.log(
      `${DIM}\nReport mode — exit 0 while the gap is expected. The queue-enable PR runs${NC}\n` +
        `${DIM}\`--enforce\` and must see ${total}/${total} before the ruleset is flipped.${NC}`,
    );
  }
}

// Guard the CLI so the test file can import the parsers without running main.
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main(process.argv.slice(2));
}
