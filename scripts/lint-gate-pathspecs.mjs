#!/usr/bin/env node
/**
 * lint-gate-pathspecs.mjs — assert every classifier pathspec in every workflow
 * still points at something that exists.
 *
 * Why this gate exists (brik-bds#2326):
 *
 * The group gates (#2098) moved each member's `paths:` filter from TRIGGER level
 * to a job-level `git diff --name-only ... -- <pathspec>` classifier. That is
 * what makes a gate eligible to be a required check — a trigger-level skip
 * leaves the check Pending forever, a job-level one reports.
 *
 * But it moves the filter somewhere nothing validates. A trigger-level `paths:`
 * that names a moved file is equally broken, yet the failure is worse here:
 * the aggregate job ALWAYS reports, so the gate goes green while one of its
 * arms has quietly stopped matching anything. On `main` today that had already
 * happened twice —
 *
 *   - tokens-gate.yml named docs-site/content/docs/primitives/{color-pairings,
 *     token-anatomy}.mdx after the tree moved to foundation/, so a PR editing
 *     only color-pairings.mdx did not run `contrast-matrix:check`, the step
 *     that asserts the matrix IN THAT FILE matches the generator.
 *   - contracts-gate.yml named .claude/references/session-contract.md, a
 *     brik-llm-only doc that has never been tracked in this repo.
 *
 * `.github/required-checks.json` § _why rule 1 says the classifier's pathspec
 * must be the UNION of its members' former paths, never narrower. Rot narrows
 * it without an edit, which is why the rule needs a gate and not just prose.
 *
 * What it checks, for every `.github/workflows/*.yml`:
 *
 *   1. LITERAL pathspec (no glob metacharacter) → must be in `git ls-files`.
 *   2. GLOB pathspec → its non-glob directory prefix must contain at least one
 *      tracked file. Catches `docs-site/content/docs/primitives/**` after the
 *      directory is gone, which is the same rot one level up.
 *
 * Deliberately NOT checked: whether a glob matches anything right now. A gate
 * may legitimately watch a pattern with no current members (`assets/logo-*.svg`
 * with no logos yet is a real, intended state).
 *
 * Scope: only pathspecs passed to `git diff ... --`. Trigger-level `paths:`
 * lists are already visible in review as YAML and are covered by
 * pr-trigger-scan.py; this is about the ones hidden inside a run block.
 *
 * Two call shapes reach `git diff`, and BOTH are read (brik-bds#2450):
 *
 *   1. INLINE — the pathspecs sit on the `git diff ... --` command itself.
 *   2. VIA A HELPER — a multi-arm classifier defines a shell function that
 *      forwards `"$@"` to `git diff`, and the pathspecs sit on the CALL sites:
 *
 *          diff_matches() { ... git diff --name-only "$B" "$H" -- "$@" ... }
 *          LINTS="$(diff_matches \
 *            'docs-site/content/docs/**' \
 *            ...)"
 *
 * Reading shape 1 alone made this gate silently partial. `docs-gate.yml` takes
 * shape 2 for its three arms, so 24 of its pathspecs (21 unique) were never
 * checked, and the linter's total is a count rather than an expectation — an
 * under-count is indistinguishable from a small repo. It surfaced the other way
 * round in #2449: refactoring `contracts-gate.yml` onto the helper dropped the
 * repo total 56 → 47 with no error, because that file's nine went out of view.
 */

import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const WORKFLOW_DIR = '.github/workflows';
const GLOB_CHARS = /[*?[\]]/;

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const DIM = '\x1b[2m';
const NC = '\x1b[0m';

/**
 * Single-quoted tokens on a fragment that are plausibly pathspecs.
 *
 * The exclusions are the same in both call shapes, and they are load-bearing:
 * a leading `-` is a flag, a `$` is an unexpanded variable (`"$@"`, `"$BASE_SHA"`),
 * and a space means prose rather than a path.
 */
export function quotedPathspecs(fragment) {
  const specs = [];
  for (const m of fragment.matchAll(/'([^']+)'/g)) {
    const spec = m[1];
    if (spec.startsWith('-') || spec.includes('$') || spec.includes(' ')) continue;
    specs.push(spec);
  }
  return specs;
}

/**
 * Names of shell functions in this body that forward their arguments to
 * `git diff` — i.e. `<name>() { … git diff … "$@" … }`.
 *
 * Scanning is brace-free on purpose: a workflow `run:` block is embedded YAML,
 * so brace matching would have to survive `${{ }}` expressions and heredocs.
 * Instead the body of a candidate is taken as the lines from its `() {` up to
 * the first line whose indentation returns to the definition's own — the shape
 * every classifier in this repo is written in.
 */
export function diffForwardersIn(body) {
  const lines = body.split('\n');
  const names = new Set();

  for (let i = 0; i < lines.length; i += 1) {
    const def = lines[i].match(/^(\s*)([A-Za-z_][A-Za-z0-9_]*)\s*\(\)\s*\{/);
    if (!def) continue;

    const [, indent, name] = def;
    let sawDiff = false;
    let sawForward = false;

    for (let j = i + 1; j < lines.length; j += 1) {
      const line = lines[j];
      if (line.trim() === '') continue;
      // Dedent back to the definition's column ends the function body.
      const lead = line.match(/^\s*/)[0];
      if (lead.length <= indent.length && !/^\s*\}/.test(line)) break;
      if (line.includes('git diff')) sawDiff = true;
      if (line.includes('"$@"')) sawForward = true;
      if (/^\s*\}\s*$/.test(line) && lead.length <= indent.length) break;
    }

    if (sawDiff && sawForward) names.add(name);
  }

  return names;
}

/** Does this line invoke one of the forwarder functions? */
function callsForwarder(line, forwarders) {
  for (const name of forwarders) {
    if (new RegExp(`(^|[^A-Za-z0-9_])${name}\\s`).test(line)) return true;
  }
  return false;
}

/** Every path git tracks, as a Set for O(1) membership. */
function trackedFiles() {
  const out = execFileSync('git', ['ls-files', '-z'], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  return new Set(out.split('\0').filter(Boolean));
}

/**
 * Pull the pathspecs out of every `git diff --name-only ... -- <specs>` in a
 * workflow body.
 *
 * The classifiers write one quoted pathspec per continued line:
 *
 *     if ! CHANGED="$(git diff --name-only "$BASE_SHA" "$HEAD_SHA" -- \
 *       'tokens/**' \
 *       'design-tokens/**' \
 *       ...
 *
 * Only tokens AFTER the standalone `--` separator are pathspecs. Everything
 * before it is revisions and flags, and everything after a pipe belongs to
 * another command. Both distinctions are load-bearing — an earlier cut of this
 * script collected every quoted token on the logical line and produced two
 * false positives on the real tree:
 *
 *   - update-visual-baselines.yml:249  `git diff --name-only 'HEAD^' HEAD -- …`
 *     → `HEAD^` is a REVISION, and would be reported as a dead path.
 *   - sync-figma-variables.yml:39      `git diff … HEAD | grep -q 'tokens-studio.json'`
 *     → that is a GREP PATTERN, and the file legitimately lives at
 *       design-tokens/tokens-studio.json.
 *
 * A gate whose first run is mostly false positives is a gate people switch off,
 * so the separator handling is the point rather than a detail.
 */
export function pathspecsIn(body) {
  const lines = body.split('\n');
  const found = [];
  const forwarders = diffForwardersIn(body);

  for (let i = 0; i < lines.length; i += 1) {
    // Shape 2: a call to a helper that forwards to `git diff`. Its pathspecs
    // are the quoted tokens on the continuation lines, with no `--` to find —
    // the separator lives inside the helper, not at the call site.
    const call = forwarders.size > 0 && callsForwarder(lines[i], forwarders);
    if (call && !lines[i].includes('git diff')) {
      let j = i;
      while (lines[j] !== undefined && lines[j].trimEnd().endsWith('\\')) {
        j += 1;
        if (lines[j] === undefined) break;
        for (const spec of quotedPathspecs(lines[j])) {
          found.push({ spec, line: j + 1 });
        }
      }
      i = j;
      continue;
    }

    if (!lines[i].includes('git diff')) continue;

    // Join this command's continuation lines, tracking which source line each
    // character came from so findings can cite a real line number.
    const segments = [];
    let j = i;
    let continues = true;
    while (continues && j < lines.length) {
      segments.push({ text: lines[j], line: j + 1 });
      continues = lines[j].trimEnd().endsWith('\\');
      j += 1;
    }
    i = j - 1;

    // Everything from the standalone `--` onward, dropping anything past a pipe.
    let seenSeparator = false;
    for (const { text, line } of segments) {
      let scan = text;

      if (!seenSeparator) {
        // A standalone `--`, not the `--` of `--name-only`.
        const sep = scan.match(/(^|\s)--(\s|\\|$)/);
        if (!sep) continue;
        seenSeparator = true;
        scan = scan.slice(sep.index + sep[0].length);
      }

      // A pipe ends the git command; later quotes belong to grep et al.
      const pipe = scan.indexOf('|');
      if (pipe !== -1) scan = scan.slice(0, pipe);

      for (const spec of quotedPathspecs(scan)) {
        found.push({ spec, line });
      }

      if (pipe !== -1) break;
    }
  }

  return found;
}

/** The leading non-glob directory of a glob pathspec, or '' if it starts glob-y. */
function globPrefix(spec) {
  const parts = spec.split('/');
  const solid = [];
  for (const part of parts) {
    if (GLOB_CHARS.test(part)) break;
    solid.push(part);
  }
  return solid.join('/');
}

function main() {
  const tracked = trackedFiles();
  const trackedDirs = new Set();
  for (const f of tracked) {
    const parts = f.split('/');
    for (let i = 1; i < parts.length; i += 1) {
      trackedDirs.add(parts.slice(0, i).join('/'));
    }
  }

  const workflows = readdirSync(WORKFLOW_DIR)
    .filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'))
    .sort();

  const findings = [];
  let checked = 0;

  for (const wf of workflows) {
    const rel = join(WORKFLOW_DIR, wf);
    const specs = pathspecsIn(readFileSync(rel, 'utf8'));

    checked += specs.length;
    findings.push(...deadPathspecs(specs, { tracked, trackedDirs, file: rel }));
  }

  if (findings.length > 0) {
    reportFindings(findings);
    process.exit(1);
  }

  console.log(
    `${GREEN}✓ lint-gate-pathspecs: clean — ${checked} classifier pathspec(s) across ` +
      `${workflows.length} workflow(s), every one resolves${NC}`,
  );
}

/**
 * The pathspecs in `specs` that no longer point at anything tracked.
 *
 * Split out of `main()` so the rule is testable against a fixture rather than
 * only against the real tree (brik-bds#2450 AC2) — a dead pathspec that the
 * extractor cannot see and one the rule does not flag fail the same way, and
 * only one of them was covered before.
 */
export function deadPathspecs(specs, { tracked, trackedDirs, file = '' }) {
  const findings = [];

  for (const { spec, line } of specs) {
    if (GLOB_CHARS.test(spec)) {
      const prefix = globPrefix(spec);
      // A bare `**` or a top-level glob has no prefix to verify.
      if (!prefix) continue;
      if (!trackedDirs.has(prefix) && !tracked.has(prefix)) {
        findings.push({
          file,
          line,
          spec,
          why: `glob prefix '${prefix}/' contains no tracked file — the directory moved or was removed`,
        });
      }
      continue;
    }

    if (!tracked.has(spec)) {
      findings.push({
        file,
        line,
        spec,
        why: 'literal path is not in `git ls-files` — it moved, was renamed, or never existed here',
      });
    }
  }

  return findings;
}

/** Print the findings and the rationale a reader needs to act on them. */
function reportFindings(findings) {
  console.error(
    `${RED}✗ lint-gate-pathspecs: ${findings.length} dead classifier pathspec(s)${NC}\n`,
  );
  for (const f of findings) {
    console.error(`  ${RED}${f.file}:${f.line}${NC}  ${YELLOW}${f.spec}${NC}`);
    console.error(`      ${f.why}\n`);
  }
  console.error(
    `${DIM}  A classifier pathspec that matches nothing narrows the gate without an${NC}\n` +
      `${DIM}  edit. The aggregate job still reports green, so the arm goes silently${NC}\n` +
      `${DIM}  dead — required-checks.json § _why rule 1. Point it at the current path,${NC}\n` +
      `${DIM}  or drop it and say why in a comment (brik-bds#2326).${NC}`,
  );
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
