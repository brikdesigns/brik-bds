#!/usr/bin/env python3
"""automerge-eligibility.py — Decide whether a PR may merge without an operator.

Context: every PR waits on the operator today, which is a queue cost across the
4-8 sessions brik-mini runs at once. brik-llm's
`.claude/references/session-contract.md` § Auto-merge policy (fleet canon) names
the low-risk shape that should not wait. This file is the machine-readable half
of that policy for THIS repo — the prose points here, not the other way round,
so there is exactly one place the rules live.

brik-bds port of the brik-llm policy (brik-llm#3396; policy origin brik-llm#2046).
The four criteria and the qa-marker convention are identical; only REPO_DEFAULT
and the exclusion table differ — exclusions are per-repo policy content, which is
why this file is NOT a watched twin (the table diverges by design, and declaring
every row a delta would gate nothing).

Four criteria, all of which must hold (brik-llm#2046):

  1. size       — the PR carries `size:xs` or `size:s`
  2. type       — the linked issue's native Issue Type is Task or Bug
  3. qa         — a qa review comment marked `pass` exists, and is NEWER than the
                  head commit
  4. paths      — no changed file matches the hard-exclusion table below

CI green is deliberately NOT checked here. `gh pr merge --auto` already waits on
every required status check, and re-implementing that would be a second, weaker
copy of branch protection that drifts from it. This file decides *whether to arm*
auto-merge; GitHub decides *when it fires*.

Criterion 3 is the one that is easy to get wrong. A qa review is only evidence
about the code it read, so a `pass` older than the head commit proves nothing —
a session could earn a pass on a clean diff and then push anything. Staleness is
therefore a blocker, not a warning, and a `findings` marker newer than the last
`pass` blocks outright.

The exclusions are PATH-based and asserted by tests rather than described in
prose, per this ticket's AC. A judgement-based exclusion ("don't auto-merge
anything risky") is exactly the advisory shape that fails silently: the reviewer
who has to apply it is the one being removed from the loop.

Transport note: brik-bds `main` is queue-managed (merge-queue-main ruleset,
bds#2412). The arming workflow calls `gh pr merge --auto` with NO strategy flag —
a `--squash` flag is rejected on a queue-managed branch (observed on
brik-llm#3396); the queue's own merge_method decides the strategy.

Usage:
  scripts/audit/automerge-eligibility.py --pr 2487            # human-readable to stderr
  scripts/audit/automerge-eligibility.py --pr 2487 --json     # verdict to stdout
  scripts/audit/automerge-eligibility.py --paths a.mjs b.css  # offline path check

Exit codes:
  0  ran successfully — read `eligible` from the verdict, do not read the exit code
  2  could not evaluate (bad usage, gh failure, unreadable PR)

Read-only: this script never merges anything and never writes. The workflow
that acts on its verdict is .github/workflows/automerge.yml.
"""

from __future__ import annotations

import argparse
import fnmatch
import json
import subprocess
import sys

REPO_DEFAULT = "brikdesigns/brik-bds"

# Hard exclusions — always human-merged regardless of size. Per-repo policy
# content (the brik-llm table guards operations/security/ and LaunchAgents this
# repo does not have); the test suite asserts every pattern against a real repo
# path plus a near-miss, so a pattern that silently matches nothing fails CI.
#
# Each entry is (glob, why). The `why` is surfaced in the verdict: a blocked PR
# should say which rule blocked it, not just that something did.
#
# Deliberately NOT excluded: components/**. "New components need the
# operator" (ratified 2026-09-15, brik-llm#3396) is already enforced by
# criteria 1–2 — a new component is Feature-typed and ≥ size:m, so it never
# qualifies — and a path rule here would also block the one-line size:xs bugfix
# inside an existing component, which is exactly the PR this policy exists to
# unblock.
EXCLUDED_PATHS: list[tuple[str, str]] = [
    # Design tokens — consumed by every Brik surface; the blast radius is not
    # proportional to the diff size. dist/ builds FROM these sources, so the
    # source dirs are what need the human.
    ("tokens/**", "design tokens (fleet-wide blast radius)"),
    ("design-tokens/**", "design tokens (fleet-wide blast radius)"),
    # Secrets-shaped files. This repo should never carry one; a PR adding one
    # must see a human, not a queue.
    ("**/.env*", "environment file"),
    ("**/*.pem", "key material"),
    # Canon. A wrong rule here propagates to every future session, and the
    # blast radius is not proportional to the diff size.
    ("CLAUDE*.md", "agent canon"),
    ("**/CLAUDE*.md", "agent canon"),
    (".claude/**", "agent canon, skills, references, standards"),
    ("BDS-CONSUMER.md", "consumer canon (imported by every consumer repo's CLAUDE.md)"),
    # CI and hooks. A workflow edit can disable the very gates this policy
    # relies on, including this one.
    (".github/workflows/**", "CI workflow"),
    (".github/required-checks.json", "required-check declaration"),
    (".husky/**", "git hooks"),
    # The npm publish surface — release.yml is covered above; the manifest
    # decides what ships to every consumer install.
    ("package.json", "npm publish manifest"),
]

ALLOWED_SIZES = {"size:xs", "size:s"}
ALLOWED_TYPES = {"Task", "Bug"}

# The qa review artifact. There was no marker convention in this repo before
# this ticket — `grep -rn 'brik-qa\|qa-review\|qa subagent' .github .claude
# operations/agents scripts` returned nothing on 2026-08-08 — so this file
# defines it. The qa subagent posts one of these as a PR comment.
QA_PASS_MARKER = "<!-- brik-qa-review: pass -->"
QA_FINDINGS_MARKER = "<!-- brik-qa-review: findings -->"


def _gh(args: list[str]) -> str:
    """Run a gh command and return raw stdout. Exits 2 on failure rather than
    returning a partial answer — a fetch that half-worked must never read as
    'no blockers found'."""
    try:
        return subprocess.run(
            ["gh", *args], capture_output=True, text=True, check=True
        ).stdout
    except FileNotFoundError:
        print("automerge-eligibility: gh not on PATH", file=sys.stderr)
        sys.exit(2)
    except subprocess.CalledProcessError as exc:
        print(
            f"automerge-eligibility: gh {' '.join(args)} failed: {exc.stderr.strip()}",
            file=sys.stderr,
        )
        sys.exit(2)


def _gh_json(args: list[str]) -> object:
    """Run a gh command expected to emit a JSON document."""
    out = _gh(args)
    if not out.strip():
        return None
    return json.loads(out)


def _gh_scalar(args: list[str]) -> str:
    """Run a `gh api --jq` command whose filter yields a bare scalar.

    `--jq '.type.name'` prints `Task`, not `"Task"` — unquoted, so it is not a
    JSON document and json.loads rejects it. Reading it as JSON raised
    JSONDecodeError against a real PR before this split existed.
    """
    return _gh(args).strip()


def path_blockers(paths: list[str]) -> list[str]:
    """Excluded paths among `paths`, as 'path (why)' strings.

    fnmatch has no `**`, so `a/**` is expanded to match both `a/x` and `a/b/x`.
    Getting this wrong in the permissive direction is the failure that matters:
    a pattern that silently matches nothing turns an exclusion into a comment.
    """
    hits: list[str] = []
    for path in paths:
        for glob, why in EXCLUDED_PATHS:
            candidates = [glob]
            if "**/" in glob:
                # `**/x` must also match a bare `x` at the repo root.
                candidates.append(glob.replace("**/", "", 1))
            if glob.endswith("/**"):
                # `a/**` must match `a/x` and `a/b/x` alike.
                candidates.append(glob[:-3] + "/*")
            if any(fnmatch.fnmatch(path, c) for c in candidates):
                hits.append(f"{path} ({why})")
                break
    return hits


def _qa_verdict(comments: list[dict], head_committed_at: str) -> str | None:
    """None when qa is satisfied, else the reason it is not.

    Only comments at or after the head commit count. Ordering is by createdAt so
    a later `findings` overrides an earlier `pass` on the same head.
    """
    relevant = [
        c
        for c in sorted(comments, key=lambda c: c.get("createdAt", ""))
        if c.get("createdAt", "") >= head_committed_at
        and (QA_PASS_MARKER in c.get("body", "") or QA_FINDINGS_MARKER in c.get("body", ""))
    ]
    if not relevant:
        stale = any(
            QA_PASS_MARKER in c.get("body", "") or QA_FINDINGS_MARKER in c.get("body", "")
            for c in comments
        )
        if stale:
            return "qa review is older than the head commit — it reviewed different code"
        return "no qa review comment on the PR"
    if QA_FINDINGS_MARKER in relevant[-1].get("body", ""):
        return "qa review reported unresolved findings"
    return None


def evaluate(pr: int, repo: str) -> dict:
    data = _gh_json(
        [
            "pr",
            "view",
            str(pr),
            "--repo",
            repo,
            "--json",
            "number,isDraft,state,labels,files,comments,commits,closingIssuesReferences",
        ]
    )
    if not isinstance(data, dict):
        print(f"automerge-eligibility: could not read {repo}#{pr}", file=sys.stderr)
        sys.exit(2)

    blockers: list[str] = []

    if data.get("isDraft"):
        blockers.append("PR is a draft")
    if data.get("state") != "OPEN":
        blockers.append(f"PR is {str(data.get('state')).lower()}, not open")

    labels = {label["name"] for label in data.get("labels", [])}
    sizes = labels & ALLOWED_SIZES
    if not sizes:
        carried = sorted(n for n in labels if n.startswith("size:"))
        blockers.append(
            f"size label is {carried[0]}, not size:xs/size:s"
            if carried
            else "no size:xs / size:s label"
        )

    issues = data.get("closingIssuesReferences") or []
    if not issues:
        blockers.append("no linked issue — Issue Type cannot be read")
    else:
        for issue in issues:
            owner_repo = repo
            url = issue.get("url", "")
            if "/issues/" in url:
                owner_repo = "/".join(url.split("/")[3:5])
            # `gh issue view --json` exposes no type field (verified 2026-08-08);
            # the native Issue Type is REST-only.
            name = _gh_scalar(
                ["api", f"repos/{owner_repo}/issues/{issue['number']}", "--jq", '.type.name // ""']
            )
            if name not in ALLOWED_TYPES:
                blockers.append(
                    f"#{issue['number']} Issue Type is "
                    f"{name or 'unset'}, not Task/Bug"
                )

    commits = data.get("commits") or []
    head_at = commits[-1].get("committedDate", "") if commits else ""
    if not head_at:
        blockers.append("could not read the head commit date")
    else:
        qa = _qa_verdict(data.get("comments") or [], head_at)
        if qa:
            blockers.append(qa)

    paths = [f["path"] for f in data.get("files", [])]
    blockers.extend(f"excluded path: {hit}" for hit in path_blockers(paths))

    return {
        "repo": repo,
        "pr": pr,
        "eligible": not blockers,
        "blockers": blockers,
        "changed_files": len(paths),
    }


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--pr", type=int, help="PR number to evaluate")
    ap.add_argument("--repo", default=REPO_DEFAULT)
    ap.add_argument("--json", action="store_true", help="verdict as JSON on stdout")
    ap.add_argument(
        "--paths", nargs="*", help="offline: report which of these paths are excluded"
    )
    args = ap.parse_args()

    if args.paths is not None:
        hits = path_blockers(args.paths)
        if args.json:
            print(json.dumps({"excluded": hits}, indent=2))
        else:
            for hit in hits:
                print(f"  excluded: {hit}", file=sys.stderr)
            print(f"{len(hits)}/{len(args.paths)} path(s) excluded", file=sys.stderr)
        return 0

    if not args.pr:
        ap.error("--pr or --paths is required")

    verdict = evaluate(args.pr, args.repo)
    if args.json:
        print(json.dumps(verdict, indent=2))
    else:
        if verdict["eligible"]:
            print(
                f"automerge-eligibility: {args.repo}#{args.pr} QUALIFIES "
                f"({verdict['changed_files']} file(s))",
                file=sys.stderr,
            )
        else:
            print(
                f"automerge-eligibility: {args.repo}#{args.pr} does not qualify",
                file=sys.stderr,
            )
            for blocker in verdict["blockers"]:
                print(f"  - {blocker}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
