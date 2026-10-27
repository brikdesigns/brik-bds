#!/usr/bin/env node
// Fails CI when ANY open issue has no parent (brikdesigns#1528, widened #1612;
// ported to brik-bds by brik-bds#2792 — adapted, not rewritten, per brik-llm#3427).
//
// The convention: `issue-style.md` § The discovery contract requires every
// filed issue to get a HOME — `addSubIssue` onto the umbrella it belongs
// to, or an explicit statement of why none fits. Without one the issue is
// unreachable by every pickup path the fleet has: `/resume` walks an umbrella's
// sub-issues, `resume-orphan-scan.sh` reports unparented issues only at
// `priority:p0-now` / `p1-week`, and `issue-overlap.sh` keys on the number
// appearing in a branch or PR. An unparented p2 is findable only by scrolling
// the backlog.
//
// #1612 widened the scan from `meta:agent-discovered` to ALL open issues: the
// contract was enforced only on the one self-applied label, so measured
// 2026-09-14, 18 of 20 open orphans carried no `meta:agent-discovered` label and
// the gate never saw them — any issue filed without that tag skipped the home
// requirement. This is stricter than the fleet's agent-discovered-only contract,
// ratified by the operator for brikdesigns (and ported to brik-bds, #2792). The exclusions below (a Project, or
// a reasoned opt-out) still carry every legitimate top-level case.
//
// Measured 2026-09-13, before the first backfill: 23 of 41 open agent-discovered
// issues had no parent and NONE of the 23 was p0/p1 — so no pickup path reached
// a single one. The oldest, #552, had been invisible since 2026-06-21.
//
// Why this is a gate and not a one-off cleanup: the backfill was the easy half.
// A backlog that leaks refills at the rate work gets done, because the leak is a
// side effect of doing the work — one ticket routinely files three.
//
// Going-forward ratchet, same shape as lint-section-id.mjs: orphans listed in
// scripts/orphan-issue-baseline.json are grandfathered. A new orphan fails.
// A baseline entry that is no longer an orphan ALSO fails, so the baseline can
// never overstate the remaining debt. brikdesigns ships it empty; brik-bds ships it
// seeded with the orphans the 2026-10-26 backfill knowingly left (brik-bds#2792).
//
// Two exclusions, by rule rather than by baseline entry:
//   • `meta:project` — a Project is top-level by design (pm-system.md: Release →
//     Project → Issue → sub-issue, with no Project-under-Project), so "no
//     parent" is its CORRECT state, not debt. Baselining it would assert the
//     opposite and would need re-justifying every time the list is read.
//   • an `<!-- orphan-ok: <reason> -->` marker in the body — the discovery
//     contract's own "state in the body why none fits" escape hatch. The reason
//     is required; a bare marker does not exempt.
//
// Cost: one GraphQL query per run (≤100 issues/page), against a bucket the
// whole fleet shares — so it runs in the existing `verify` job rather than as
// its own workflow, and never on a loop.
//
// Usage:
//   npm run lint:orphan-issues
// Self-test:
//   npm run test:lint:orphan-issues

import fs from 'node:fs';
import url from 'node:url';
import { spawnSync } from 'node:child_process';

export const BASELINE_PATH = 'scripts/orphan-issue-baseline.json';
export const REPO = 'brikdesigns/brik-bds';

// No `labels:` filter — the gate scans every open issue (#1612). Scope is
// narrowed in `findOrphans` instead, by the two exclusions (meta:project, and a
// reasoned orphan-ok marker), so a legitimate top-level issue never counts.
const QUERY = `query($owner:String!,$name:String!,$cursor:String){
  repository(owner:$owner,name:$name){
    issues(first:100, states:OPEN, after:$cursor){
      pageInfo{ hasNextPage endCursor }
      nodes{
        number title body
        parent{ number repository{ nameWithOwner } }
        labels(first:30){ nodes{ name } }
      }
    }
  }
}`;

/** Does this issue's body carry a reasoned opt-out?
 *
 *  `<!-- orphan-ok: <reason> -->`. The reason is load-bearing: the discovery
 *  contract asks for WHY no umbrella fits, and a bare marker answers nothing —
 *  it is the same "well-shaped but empty" disposition `handoff-lint.sh` rejects
 *  for a `DROPPED:` with no text after the colon. */
export function hasReasonedOptOut(body) {
  // `.*?` with the `s` flag, not `[^>]*?`: a reason may itself contain `>` — an
  // arrow like "service->back-office" (#322) — which the old class truncated at
  // the first `>`, silently voiding the marker and re-flagging the issue (#1612).
  const m = /<!--\s*orphan-ok:(.*?)-->/is.exec(body ?? '');
  return m !== null && m[1].trim().length > 0;
}

/** A Project is top-level by design — `pm-system.md`'s hierarchy has no
 *  Project-under-Project — so it is never counted as an orphan. */
export function isProject(labels) {
  return labels.includes('meta:project');
}

/** Does this issue's body declare a parent in ANOTHER repo?
 *
 *  Matches `Parent: owner/repo#N`, optionally backticked — the convention
 *  already in use (#1521 § References: "Parent: `brikdesigns/brik-llm#3406`").
 *
 *  This exists because the gate cannot see a parent in a PRIVATE other repo,
 *  while having one is a perfectly correct home. The job's `GITHUB_TOKEN` is
 *  scoped to this repository (`Issues: read` on brikdesigns alone), so GraphQL
 *  resolves `parent` to null when the parent's repo is one the token cannot
 *  read, and the issue reads as unparented.
 *
 *  Proven rather than assumed, and the visibility half is the part that is easy
 *  to get wrong. Both cross-repo cases were checked against the same CI run:
 *
 *    #1521 → brikdesigns/brik-llm#3406   brik-llm is PRIVATE  → null in CI,
 *            resolves locally under an org-scoped PAT. This is the false
 *            positive that reddened the gate.
 *    #1370 → brikdesigns/brik-bds#2404   brik-bds is PUBLIC   → resolves in CI
 *            on the repo-scoped token, and was never flagged. It carries no
 *            declaration and needs none.
 *
 *  So the exemption is narrow by construction: it only ever fires where the
 *  token genuinely cannot see, which today is one issue.
 *
 *  Deliberately NOT solved by widening the CI token: a cross-repo PAT in this
 *  workflow would buy a read this gate does not otherwise need, and the claim
 *  is cheap to state in the body where a human reading the issue sees it too.
 *  It is also not solved with `orphan-ok`, which asserts "no umbrella fits" —
 *  false here, and it would hide the issue from the ratchet permanently. */
export function declaredCrossRepoParent(body) {
  const m = /^\s*[-*]?\s*(?:\*\*)?Parent(?:\*\*)?:\s*`?([\w.-]+\/[\w.-]+)#(\d+)`?/im.exec(
    body ?? '',
  );
  return m === null ? null : `${m[1]}#${m[2]}`;
}

/** The orphans among a set of issues, as `{number, title}`, ascending.
 *
 *  Takes already-fetched nodes so the self-test can exercise the rule without a
 *  network call — the fetch is the only part that needs a token. */
export function findOrphans(nodes) {
  return nodes
    .filter((n) => n.parent == null)
    .filter((n) => !isProject((n.labels?.nodes ?? []).map((l) => l.name)))
    .filter((n) => !hasReasonedOptOut(n.body))
    // A parent this token cannot see is still a parent — see
    // declaredCrossRepoParent for why the null is a scope artefact, not debt.
    .filter((n) => declaredCrossRepoParent(n.body) === null)
    .map((n) => ({ number: n.number, title: n.title }))
    .sort((a, b) => a.number - b.number);
}

/** Compare live orphans against the grandfathered set.
 *
 *  Both directions fail, which is the whole point of a ratchet: `added` is new
 *  debt, and `stale` is debt the baseline still claims after it was paid — left
 *  unflagged, a paid-down entry leaves an allowance a future orphan hides in. */
export function diffAgainstBaseline(orphans, baselineNumbers) {
  const live = new Set(orphans.map((o) => o.number));
  const allowed = new Set(baselineNumbers);
  return {
    added: orphans.filter((o) => !allowed.has(o.number)),
    stale: [...allowed].filter((n) => !live.has(n)).sort((a, b) => a - b),
  };
}

/** One page-walked GraphQL read. Throws rather than returning empty: a gate
 *  that reports "clean" when it could not reach the API is an unrun assertion
 *  wearing a green check. */
function fetchIssues(repo) {
  const [owner, name] = repo.split('/');
  const nodes = [];
  let cursor = null;
  for (;;) {
    const args = [
      'api',
      'graphql',
      '-f',
      `query=${QUERY}`,
      '-F',
      `owner=${owner}`,
      '-F',
      `name=${name}`,
    ];
    if (cursor) args.push('-F', `cursor=${cursor}`);
    const res = spawnSync('gh', args, { encoding: 'utf8' });
    if (res.error) throw new Error(`could not run \`gh\` — ${res.error.message}`);
    if (res.status !== 0) throw new Error(`gh exited ${res.status}: ${(res.stderr || '').trim()}`);
    const page = JSON.parse(res.stdout).data.repository.issues;
    nodes.push(...page.nodes);
    if (!page.pageInfo.hasNextPage) break;
    cursor = page.pageInfo.endCursor;
  }
  return nodes;
}

export function readBaseline(pathname = BASELINE_PATH) {
  if (!fs.existsSync(pathname)) return [];
  const raw = JSON.parse(fs.readFileSync(pathname, 'utf8'));
  // `issues` is the list; a sibling `_comment` documents the file (JSON has no
  // comments). A bare array is also accepted.
  return Array.isArray(raw) ? raw : (raw.issues ?? []);
}

function main() {
  let baseline;
  try {
    baseline = readBaseline();
  } catch (err) {
    console.error(`lint-orphan-issues: ${BASELINE_PATH} is not valid JSON — ${err.message}`);
    return 2;
  }

  let nodes;
  try {
    nodes = fetchIssues(REPO);
  } catch (err) {
    console.error(`lint-orphan-issues: could not read ${REPO} — ${err.message}`);
    console.error(
      '  This gate asserts against live issue state, so it cannot pass offline. ' +
        'In CI, GITHUB_TOKEN must be in the environment; locally, run `gh auth login`.'
    );
    return 2;
  }

  const orphans = findOrphans(nodes);
  const { added, stale } = diffAgainstBaseline(orphans, baseline);

  if (added.length > 0 || stale.length > 0) {
    console.error(`lint-orphan-issues: ${added.length + stale.length} problem(s):`);
    for (const o of added) {
      console.error(`  #${o.number} has no parent — ${o.title}`);
    }
    for (const n of stale) {
      console.error(
        `  #${n} is listed in ${BASELINE_PATH} but is no longer an orphan ` +
          `(parented, closed, or now meta:project). Remove its entry so the ` +
          `baseline can't overstate the debt.`
      );
    }
    if (added.length > 0) {
      console.error(
        '\n  Give each one a home — `issue-style.md` § The discovery contract:\n' +
          "    gh api graphql -f query='mutation($p:ID!,$c:ID!){addSubIssue(input:{issueId:$p,subIssueId:$c}){clientMutationId}}' \\\n" +
          `      -f p="$(gh api repos/${REPO}/issues/<UMBRELLA> --jq .node_id)" \\\n` +
          `      -f c="$(gh api repos/${REPO}/issues/<ISSUE> --jq .node_id)"\n` +
          '  If it is genuinely top-level, label it `meta:project`. If no umbrella fits\n' +
          '  and it is not a Project, say why in the body:\n' +
          '    <!-- orphan-ok: <the reason no umbrella fits> -->\n' +
          '  If the parent is in ANOTHER repo, this gate cannot see it — its CI token is\n' +
          '  scoped to this repository — so declare it in the body instead:\n' +
          '    Parent: `owner/repo#N`\n' +
          '  An unparented issue is reachable by NO pickup path — not /resume, not\n' +
          '  resume-orphan-scan.sh (p0/p1 only), not issue-overlap.sh. brikdesigns#1528.'
      );
    }
    return 1;
  }

  // Named, not silent: a cross-repo home is the one exemption the gate grants
  // on evidence it cannot itself verify, so the count belongs on screen where a
  // reviewer can challenge it rather than inside a passing check.
  const crossRepo = nodes
    .filter((n) => n.parent == null)
    .map((n) => [n.number, declaredCrossRepoParent(n.body)])
    .filter(([, parent]) => parent !== null);

  console.log(
    `lint-orphan-issues: clean — ${nodes.length} open issue(s) scanned, ` +
      `${baseline.length} grandfathered orphan(s) remaining.`
  );
  if (crossRepo.length > 0) {
    console.log(
      `  ${crossRepo.length} homed by a declared cross-repo parent this token cannot resolve: ` +
        crossRepo.map(([n, parent]) => `#${n} → ${parent}`).join(', ')
    );
  }
  return 0;
}

// Importable for the self-test; only the direct invocation exits.
if (process.argv[1] && import.meta.url === url.pathToFileURL(process.argv[1]).href) {
  process.exit(main());
}
