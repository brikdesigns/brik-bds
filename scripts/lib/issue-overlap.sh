#!/usr/bin/env bash
# issue-overlap.sh — warn when a ticket is already being worked somewhere else.
#
# Sourced by new-task.sh before a worktree is created, and callable standalone
# by the /resume skill. Closes brik-llm#1533 (the detection slice of #1485).
#
# Why this exists: on 2026-07-26 two independent sessions both worked brik-llm
# #1525 — one built the portal migration (brik-client-portal#2412) + client
# wiring (#1531), another built the golden-set eval (#1530). Two retrieval-eval
# harnesses landed on main the same night (#1532 to consolidate). Neither
# session saw the other, because the only overlap detection that existed keyed
# on branch-name slug, and the two slugs shared no keyword. Keying on the ISSUE
# NUMBER is what catches that class.
#
# ── This file is a byte-identical copy. brikdesigns/brik-llm is the SOURCE. ────
#
# Four repos ship it, and they are separate git repos, so these are deliberate
# copies and not an import:
#
#   brikdesigns/brik-llm                       ← SOURCE OF TRUTH, edit here
#   brikdesigns/brik-bds                       ← copy
#   brikdesigns/brik-client-portal             ← copy
#   brikdesigns/treehouse-pediatric-dentistry  ← copy
#
# all at scripts/lib/issue-overlap.sh.
#
# NEVER edit this file anywhere but brik-llm. Fix it there and re-sync every copy
# in the same change — brik-llm's `overlap-twin-drift` workflow compares each
# copy's sha256 against brik-llm's and reads a local edit as DRIFT, not an
# improvement. It fails on a missing copy too.
#
# (This paragraph is deliberately worded to be TRUE in all four copies. The
# header it replaced said "identical twins … keep all three in sync", which read
# as an instruction to whichever copy you had open and was false in every copy.)
#
# What that cost, measured 2026-08-20 for #2442: four copies, four different
# md5s, a 130-line spread, and the fourth copy not named at all. All three
# consumers still carried the fail-open #2422/#2298 had already fixed in
# brik-llm, so `new-task.sh --issue` there created a branch when this gate could
# not run — the #1485 duplicate-work class it exists to stop. Drift ran the other
# way too: brik-bds grew sibling detection (#1663) that brik-llm lacked for 18
# days. A sync claim with no gate behind it is what let both happen, so the gate
# ships with the re-sync.
#
# Usage (sourced):
#   source scripts/lib/issue-overlap.sh
#   check_issue_overlap "1525"                       # issue in the current repo
#   check_issue_overlap "brikdesigns/brik-llm#1525"  # cross-repo reference
#
# Usage (standalone, for /resume — reports without prompting):
#   scripts/lib/issue-overlap.sh --report 1522
#
# Exit / return codes:
#   0  no overlap found, or the operator chose to continue
#   1  operator aborted at the prompt (sourced mode only)
#   2  bad usage / unresolvable issue reference
#   4  the issue does not exist in the resolved repo — check did NOT run (#2298)
#   5  the issue could not be read (transport/auth) — check did NOT run (#2422)
#
# 4 and 5 are NOT "no overlap". A caller that treats any non-zero as "proceed"
# has reinstated the fail-open both of those tickets are about; see
# new-task.sh's guarded call for the shape that refuses instead.

_IO_YELLOW='\033[1;33m'
_IO_GREEN='\033[0;32m'
_IO_RED='\033[0;31m'
_IO_NC='\033[0m'

# gh_repo_slug / gh_explain_failure (#1590). Guarded because a twin repo may not
# carry the file yet — _io_repo_slug degrades to the old API call if it's absent.
_IO_LIB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -r "${_IO_LIB_DIR}/gh-error-classify.sh" ]; then
  # shellcheck source=scripts/lib/gh-error-classify.sh
  source "${_IO_LIB_DIR}/gh-error-classify.sh"
fi

# owner/name for the current repo, for zero GraphQL points (#1748).
#
# `gh repo view --json nameWithOwner` costs 1 point and runs on the fleet's hot
# path — new-task.sh sources this lib on every task branch. Worse, an exhausted
# bucket makes it echo nothing, so the caller returned 2 ("unresolvable issue
# reference") for what is a quota problem. `gh_repo_slug` reads `origin` locally
# and costs nothing; the API is the fallback for a checkout with no usable
# remote, and its failure is named by class instead of swallowed.
_io_repo_slug() {
  local slug err
  if declare -F gh_repo_slug >/dev/null 2>&1 && slug="$(gh_repo_slug)"; then
    printf '%s\n' "$slug"
    return 0
  fi
  err="$(mktemp "${TMPDIR:-/tmp}/io-slug-err.XXXXXXXX")"
  if slug="$(gh repo view --json nameWithOwner --jq .nameWithOwner 2>"$err")" \
    && [ -n "$slug" ]; then
    rm -f "$err"
    printf '%s\n' "$slug"
    return 0
  fi
  if declare -F gh_explain_failure >/dev/null 2>&1; then
    gh_explain_failure "$(cat "$err" 2>/dev/null)" >/dev/null
  fi
  rm -f "$err"
  return 1
}

# Resolve "1525" or "owner/repo#1525" into OWNER REPO NUMBER on stdout.
# Bare numbers resolve against the current repo.
_io_resolve_ref() {
  local ref="$1" owner repo num
  if [[ "$ref" =~ ^([A-Za-z0-9._-]+)/([A-Za-z0-9._-]+)#?([0-9]+)$ ]]; then
    owner="${BASH_REMATCH[1]}"; repo="${BASH_REMATCH[2]}"; num="${BASH_REMATCH[3]}"
  elif [[ "$ref" =~ ^#?([0-9]+)$ ]]; then
    num="${BASH_REMATCH[1]}"
    local nwo
    nwo="$(_io_repo_slug)" || return 2
    [ -z "$nwo" ] && return 2
    owner="${nwo%%/*}"; repo="${nwo##*/}"
  else
    return 2
  fi
  printf '%s %s %s\n' "$owner" "$repo" "$num"
}

# Print every PR that GitHub already associates with this issue, in any repo.
# Uses the issue's own timeline, so a cross-repo PR (the #1525 case: a
# brik-client-portal PR against a brik-llm issue) is caught — a same-repo
# `gh pr list` search would miss it entirely.
_io_linked_prs() {
  local owner="$1" repo="$2" num="$3"
  gh api graphql -f query="
    query {
      repository(owner: \"$owner\", name: \"$repo\") {
        issue(number: $num) {
          state
          title
          timelineItems(first: 100, itemTypes: [CROSS_REFERENCED_EVENT, CONNECTED_EVENT]) {
            nodes {
              ... on CrossReferencedEvent {
                source {
                  ... on PullRequest {
                    number state title repository { nameWithOwner }
                  }
                }
              }
              ... on ConnectedEvent {
                subject {
                  ... on PullRequest {
                    number state title repository { nameWithOwner }
                  }
                }
              }
            }
          }
        }
      }
    }" --jq '
      .data.repository.issue.timelineItems.nodes
      | map(.source // .subject)
      | map(select(. != null and .number != null))
      | unique_by(.number)
      | .[]
      | "\(.repository.nameWithOwner)#\(.number) [\(.state)] \(.title)"
    ' 2>/dev/null || true
}

# Org-wide PR search on the bare issue number. Second signal, because the
# timeline alone is not enough: a cross-repo `Closes brikdesigns/brik-llm#N`
# closes the issue WITHOUT emitting a CrossReferencedEvent (verified 2026-07-26
# — brik-client-portal#2455 closed brik-llm#1551 and left no timeline link), and
# the qualified string is not indexed by search either.
#
# Searching the bare number is the only form that works — GitHub's tokenizer
# drops `#`, so "#1551" and "brik-llm#1551" are no more precise (verified).
# That makes the raw result set noisy, so it is filtered two ways:
#   - any OPEN pr is kept: an open PR on this number is the actual concurrency
#     risk this gate exists to catch, and a false positive there is cheap;
#   - a CLOSED/MERGED pr is kept only when the number appears in its TITLE,
#     which is where a real reference lands. Without this, every PR whose own
#     number happens to sit near the issue number shows up as noise.
_io_searched_prs() {
  local num="$1" org="$2"
  # `gh api --jq` takes only a program — it has no --arg — so the number is
  # inlined. Safe: _io_resolve_ref already constrained it to [0-9]+.
  gh api -X GET search/issues \
    --raw-field q="${num} type:pr org:${org}" \
    --jq ".items[]
      | {repo: (.repository_url|split(\"/\")|last), number, title, state,
         merged: (.pull_request.merged_at != null)}
      | select(.state == \"open\" or (.title | test(\"#${num}(\\\\D|\$)\")))
      | \"\(.repo)#\(.number) [\(if .merged then \"MERGED\" else (.state|ascii_upcase) end)] \(.title)\"" \
    2>/dev/null | head -8 || true
}

# Read "<state>\t<title>". THREE outcomes, and collapsing them is what #2422 and
# #2298 both are:
#
#   rc 0 + stdout   the read succeeded
#   rc 3            the API answered definitively: no such issue
#   rc 2            the read FAILED — transport, auth, timeout. "Could not tell."
#
# Measured with gh 2.x on 2026-08-20, because the three are NOT separable by
# stdout alone:
#
#   ok          rc=0  stdout="open\tTitle"    stderr=""
#   404         rc=1  stdout=<raw JSON body>  stderr="gh: Not Found (HTTP 404)"
#   401         rc=1  stdout=<raw JSON body>  stderr="gh: Bad credentials (HTTP 401)"
#   no network  rc=1  stdout=""               stderr='Get "https://…": proxyconnect…'
#
# Note the PAYLOAD ON STDOUT whenever `--jq` cannot apply. The previous body was
#
#     gh api … --jq '…' 2>/dev/null || true
#
# so a 404 body became the issue's "state" and landed under the ⚠ PRs-already-
# linked banner (#2298), while a network failure became the empty string that the
# caller reported as "no parallel work" (#2422). gh's EXIT STATUS is what
# separates all four; stdout cannot.
#
# Retried ONCE, and only on a transport failure: the observed rate was 1 in 4 on
# an issue that was readable seconds before and after, while a 404 is a settled
# answer that a retry cannot improve.
#
# gh's stderr is handed back through $4, a caller-owned file — NOT a global. This
# function is invoked inside a command substitution, so anything it assigns to a
# global is set in a subshell and lost; the first cut of this fix did exactly
# that and the diagnostic came out empty.
_io_issue_state() {
  local owner="$1" repo="$2" num="$3" errout="${4:-}"
  local out rc errfile attempt
  errfile="$(mktemp)"
  for attempt in 1 2; do
    if out="$(gh api "repos/$owner/$repo/issues/$num" --jq '.state + "\t" + .title' 2>"$errfile")"; then
      rc=0
    else
      rc=$?
    fi
    if [ "$rc" -eq 0 ] && [ -n "$out" ]; then
      rm -f "$errfile"
      printf '%s' "$out"
      return 0
    fi
    if grep -q 'HTTP 404' "$errfile" 2>/dev/null; then
      [ -n "$errout" ] && tr '\n' ' ' < "$errfile" > "$errout"
      rm -f "$errfile"
      return 3
    fi
    if [ "$attempt" -eq 1 ]; then sleep 1; fi
  done
  [ -n "$errout" ] && tr '\n' ' ' < "$errfile" > "$errout"
  rm -f "$errfile"
  return 2
}

# Branches (local + remote) whose name carries the issue number as a distinct
# token — `1525` matches `task/rag-1525` and `task/1525-eval`, but not `11525`.
_io_matching_branches() {
  local num="$1"
  {
    git branch --format='%(refname:short)' 2>/dev/null
    git branch -r --format='%(refname:short)' 2>/dev/null | grep -v HEAD
  } | grep -E "(^|[^0-9])${num}([^0-9]|$)" || true
}

# check_issue_overlap <issue-ref> [--report]
# --report prints findings and always returns 0 (no prompt) — for /resume.
check_issue_overlap() {
  local ref="${1:-}" mode="${2:-prompt}"
  [ -z "$ref" ] && return 0

  if ! command -v gh >/dev/null 2>&1; then
    echo -e "${_IO_YELLOW}⚠  gh not on PATH — skipping the issue-overlap check.${_IO_NC}" >&2
    return 0
  fi

  local resolved owner repo num
  if ! resolved="$(_io_resolve_ref "$ref")"; then
    echo -e "${_IO_RED}Error: could not parse issue reference '${ref}'.${_IO_NC}" >&2
    echo "  Expected: 1525  or  owner/repo#1525" >&2
    return 2
  fi
  read -r owner repo num <<<"$resolved"

  # "I could not tell" must NOT wear the shape of "I found nothing". Both of the
  # old fail-open branches returned 0, so new-task.sh:270 read an unanswered
  # lookup as an all-clear and created the branch with the gate never having run
  # (#2422) — the failure mode #2298's own AC4 calls the more serious half.
  local state_line state title read_rc=0 read_err errfile
  errfile="$(mktemp)"
  state_line="$(_io_issue_state "$owner" "$repo" "$num" "$errfile")" || read_rc=$?
  read_err="$(cat "$errfile" 2>/dev/null)"
  rm -f "$errfile"

  if [ "$read_rc" -eq 3 ]; then
    echo "" >&2
    echo -e "${_IO_RED}✗ ${owner}/${repo}#${num} not found — the overlap check did NOT run.${_IO_NC}" >&2
    echo -e "   A bare number resolves against ${owner}/${repo}; for another repo pass 'owner/repo#${num}'." >&2
    return 4
  fi

  if [ "$read_rc" -ne 0 ] || [ -z "$state_line" ]; then
    echo "" >&2
    echo -e "${_IO_RED}✗ Could not read ${owner}/${repo}#${num} — the overlap check did NOT run.${_IO_NC}" >&2
    echo -e "   ${_IO_YELLOW}This is NOT a 'no parallel work' result. Retry before starting work.${_IO_NC}" >&2
    [ -n "$read_err" ] && echo "   gh: ${read_err}" >&2
    return 5
  fi

  state="${state_line%%$'\t'*}"
  title="${state_line#*$'\t'}"

  local prs searched branches findings=0
  prs="$(_io_linked_prs "$owner" "$repo" "$num")"
  searched="$(_io_searched_prs "$num" "$owner")"
  branches="$(_io_matching_branches "$num")"

  # Drop search hits the timeline already reported. The two sources key
  # differently (owner/repo#N vs repo#N), so normalise to repo#N before
  # comparing — and skip the whole ticket's own number in the current repo.
  if [ -n "$prs" ] && [ -n "$searched" ]; then
    # Two-file read, not awk -v: a -v value cannot carry literal newlines, and
    # awk fails outright on one — which would silently blank the search list.
    searched="$(awk '
      function key(s,   f, g, h, m) {
        split(s, f, " "); split(f[1], g, "#"); m = split(g[1], h, "/")
        return h[m] "#" g[2]
      }
      NR == FNR { if ($0 != "") seen[key($0)] = 1; next }
      { if ($0 != "" && !(key($0) in seen)) print }
    ' <(printf '%s\n' "$prs") <(printf '%s\n' "$searched"))"
  fi

  echo "" >&2
  echo -e "${_IO_YELLOW}▸ Issue-overlap check — ${owner}/${repo}#${num} [${state}]${_IO_NC}" >&2
  echo "    ${title}" >&2

  if [ "$state" = "closed" ]; then
    echo "" >&2
    echo -e "${_IO_YELLOW}⚠  This issue is already CLOSED.${_IO_NC}" >&2
    findings=1
  fi

  if [ -n "$prs" ]; then
    echo "" >&2
    echo -e "${_IO_YELLOW}⚠  PRs already linked to this issue:${_IO_NC}" >&2
    echo "$prs" | sed 's/^/    /' >&2
    findings=1
  fi

  if [ -n "$searched" ]; then
    echo "" >&2
    echo -e "${_IO_YELLOW}⚠  PRs mentioning ${num} (org-wide search — may include unrelated):${_IO_NC}" >&2
    echo "$searched" | sed 's/^/    /' >&2
    findings=1
  fi

  if [ -n "$branches" ]; then
    echo "" >&2
    echo -e "${_IO_YELLOW}⚠  Branches naming this issue number:${_IO_NC}" >&2
    echo "$branches" | sed 's/^/    /' >&2
    findings=1
  fi

  if [ "$findings" -eq 0 ]; then
    echo -e "    ${_IO_GREEN}No parallel branch or PR found.${_IO_NC}" >&2
    return 0
  fi

  [ "$mode" = "--report" ] && return 0

  echo "" >&2
  echo -e "${_IO_YELLOW}   Another track may already be building this ticket.${_IO_NC}" >&2
  echo -e "${_IO_YELLOW}   Check the hits above before duplicating work (brik-llm#1485).${_IO_NC}" >&2
  _io_confirm
  return 0
}

# Gate the warning on acknowledgement WITHOUT ever aborting the caller.
#
# This replaces a bare `read -r`, which killed the pickup outright: on EOF `read`
# returns 1, new-task.sh calls this function unguarded under `set -euo pipefail`
# (scripts/new-task.sh:236 / :19), so a closed stdin took down the script before
# the worktree was created — and the usual trigger is a noisy org-wide search hit
# on a long-merged PR. Reproduced on 2026-07-29 (#1692); fixed first in
# brikdesigns/brik-bds#1549, ported here.
#
# Same contract as new-task.sh's own confirm(): interactive TTY waits, everything
# else prints and proceeds. NEW_TASK_YES=1 is honoured so one env var covers every
# prompt in the pickup path.
_io_confirm() {
  if [ "${NEW_TASK_YES:-0}" = "1" ] || [ ! -t 0 ]; then
    echo -e "${_IO_YELLOW}   → non-interactive: proceeding automatically.${_IO_NC}" >&2
    return 0
  fi
  echo -e "${_IO_YELLOW}   Press Enter to continue anyway, Ctrl+C to abort.${_IO_NC}" >&2
  # `|| true` even on a TTY: a terminal can still deliver EOF (Ctrl+D), and that
  # must not be the difference between a worktree and no worktree.
  read -r || true
}

# ── Sibling-issue detection (#1663) ────────────────────────────────────────────
#
# The number-keyed gate above is blind to the commonest duplicate shape: two
# sessions each notice the same problem, each FILE THEIR OWN ISSUE, and each
# claim their own number. Both gates are satisfied while the work is identical.
# Measured 2026-08-02: #1645 (14:16Z) and #1648 (14:40Z) were the same brik-rag
# ingest-cap fix, and produced PRs #1650 and #1651 thirty seconds apart.
#
# Scores open issue titles against this one by SHARED SIGNIFICANT TOKENS, then
# weights each shared token by inverse document frequency across the open set —
# so a rare pair like "standards"+"ingest" outranks a common domain phrase like
# "story"+"shape", which otherwise buries the signal under six false positives.
# Verified against the real pair: scoring #1648's title with #1645 open returns
# #1645 alone at 2.00, and an unrelated title returns only itself.
#
# It protects the SECOND mover only, and cannot see a session that files later.
# Neither this nor pr-path-overlap.sh could have caught the 30-second PR race in
# #1660/#1661 — nothing polling GitHub can. This closes the 23-minute case.
#
# Written first in brik-bds (#1663) and ported here by #2442, which is the whole
# point of the gate below: this block existed in ONE of four copies for 18 days,
# so brik-llm's own new-task.sh never had sibling detection at all.
#
# It sits BEFORE the standalone guard on purpose. brik-bds had it after, past an
# `exit $?`, so `issue-overlap.sh --report N` never defined these at all — only
# sourced callers saw them.
_IO_TITLE_MIN_TOKENS="${_IO_TITLE_MIN_TOKENS:-2}"
_IO_TITLE_MIN_SCORE="${_IO_TITLE_MIN_SCORE:-0.5}"

# Emits "number<TAB>score<TAB>shared<TAB>title" per candidate, best first.
_io_similar_open_issues() {
  local owner="$1" repo="$2" num="$3" title="$4" rows
  command -v node >/dev/null 2>&1 || return 0

  rows="$(gh issue list --repo "${owner}/${repo}" --state open --limit 200 \
            --json number,title 2>/dev/null)" || return 0
  [ -z "$rows" ] && return 0

  SELF_NUM="$num" TITLE="$title" node --input-type=commonjs -e '
    const fs = require("node:fs");
    const STOP = new Set(("a an the and or but if is are was were be been being of to in on for " +
      "from with without at by as it its this that these those not no never when where which who " +
      "whom how why what add adds added fix fixes fixed use uses using make makes made into onto " +
      "over under every all any some more most less least than then so such via per we our you your"
      ).split(/\s+/));
    const sig = (t) => [...new Set(String(t || "").toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ").split(/[\s-]+/)
      .filter((w) => w.length >= 4 && !STOP.has(w)))];
    const rows = JSON.parse(fs.readFileSync(0, "utf8"));
    const self = Number(process.env.SELF_NUM);
    const minTokens = Number(process.env.MIN_TOKENS || 2);
    const minScore = Number(process.env.MIN_SCORE || 0.5);
    const df = new Map();
    for (const r of rows) for (const w of sig(r.title)) df.set(w, (df.get(w) ?? 0) + 1);
    const target = sig(process.env.TITLE);
    rows.map((r) => {
      const have = new Set(sig(r.title));
      const shared = target.filter((w) => have.has(w));
      return { r, shared, score: shared.reduce((a, w) => a + 1 / (df.get(w) ?? 1), 0) };
    })
      .filter((x) => x.r.number !== self && x.shared.length >= minTokens && x.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .forEach((x) => console.log([x.r.number, x.score.toFixed(2), x.shared.join("+"), x.r.title].join("\t")));
  ' <<<"$rows"
}

# Warn (never block) when another OPEN issue looks like the same problem.
check_title_overlap() {
  local ref="${1:-}" mode="${2:-prompt}"
  [ -z "$ref" ] && return 0
  command -v gh >/dev/null 2>&1 || return 0

  local resolved owner repo num
  resolved="$(_io_resolve_ref "$ref")" || return 0
  read -r owner repo num <<<"$resolved"

  # `|| return 0` is load-bearing, and was NOT needed in brik-bds's version.
  # There, _io_issue_state ended in `|| true` and could only return 0; #2422 gave
  # it rc 2 (unreadable) and rc 3 (no such issue). new-task.sh runs under
  # `set -euo pipefail`, so an unguarded assignment from a command substitution
  # that returns non-zero takes the whole script down before the worktree exists.
  # This gate is advisory — an unreadable title means no advice, never an abort.
  local state_line title siblings
  state_line="$(_io_issue_state "$owner" "$repo" "$num")" || return 0
  [ -z "$state_line" ] && return 0
  title="${state_line#*$'\t'}"

  siblings="$(MIN_TOKENS="$_IO_TITLE_MIN_TOKENS" MIN_SCORE="$_IO_TITLE_MIN_SCORE" \
              _io_similar_open_issues "$owner" "$repo" "$num" "$title")"
  [ -z "$siblings" ] && return 0

  echo "" >&2
  echo -e "${_IO_YELLOW}⚠  Open issues that look like the same problem:${_IO_NC}" >&2
  printf '%s\n' "$siblings" | awk -F'\t' '{ printf "    #%s  [%s]  %s\n", $1, $3, $4 }' >&2
  echo "" >&2
  echo -e "${_IO_YELLOW}   Two sessions each filing their own ticket is how #1645/#1648 became${_IO_NC}" >&2
  echo -e "${_IO_YELLOW}   duplicate PRs #1650/#1651. Read those before building (#1663).${_IO_NC}" >&2

  [ "$mode" = "--report" ] && return 0
  _io_confirm
  return 0
}

# Same warning for work that has no issue to compare FROM — `--no-issue`, where
# the branch slug is the only statement of intent that exists.
#
# This is the half of #1663 that check_title_overlap structurally cannot cover:
# it needs an issue number to read a title off. #1660 was a `--no-issue` branch
# that duplicated issue #1661, so the duplicate was an OPEN ISSUE the session
# never looked for. Scoring the slug against open titles is the only signal
# available before a PR exists.
#
# Self-exclusion is passed 0: a ticketless slug has no issue of its own to skip,
# and issue numbering starts at 1.
check_phrase_overlap() {
  local phrase="${1:-}" mode="${2:-prompt}"
  [ -z "$phrase" ] && return 0
  command -v gh >/dev/null 2>&1 || return 0

  local nwo owner repo siblings
  nwo="$(_io_repo_slug)" || return 0
  [ -z "$nwo" ] && return 0
  owner="${nwo%%/*}"; repo="${nwo##*/}"

  siblings="$(MIN_TOKENS="$_IO_TITLE_MIN_TOKENS" MIN_SCORE="$_IO_TITLE_MIN_SCORE" \
              _io_similar_open_issues "$owner" "$repo" 0 "$phrase")"
  [ -z "$siblings" ] && return 0

  echo "" >&2
  echo -e "${_IO_YELLOW}⚠  This slug looks like an open issue that already exists:${_IO_NC}" >&2
  printf '%s\n' "$siblings" | awk -F'\t' '{ printf "    #%s  [%s]  %s\n", $1, $3, $4 }' >&2
  echo "" >&2
  echo -e "${_IO_YELLOW}   --no-issue means \"genuinely no ticket\". If one of these IS the ticket,${_IO_NC}" >&2
  echo -e "${_IO_YELLOW}   re-run with --issue <N> so the claim gate can see you (#1663).${_IO_NC}" >&2

  [ "$mode" = "--report" ] && return 0
  _io_confirm
  return 0
}

# Standalone invocation: scripts/lib/issue-overlap.sh [--report] <issue-ref>
#
# BOTH detectors run, and that is the point of #2765. This dispatch called only
# check_issue_overlap, so `/resume` step 4 — which shells out to exactly this
# path — never saw a sibling issue. #2717 and #2747 were filed 18 hours apart,
# both p1/M, both children of the same umbrella #2472, both about the same lens
# on the same Item, and `--report` on #2747 printed "No parallel branch or PR
# found." It was telling the truth about branches and PRs and silent about the
# duplicate sitting beside it.
#
# The title half is ADVISORY and returns 0 on anything it cannot read, so it
# cannot change this script's exit status. The number half's rc is therefore
# still the one that propagates — rc 4/5 ("the gate did NOT run") must keep
# reaching new-task.sh's guard, which is what #2422/#2298 bought.
# The dispatch is a FUNCTION, not inline under the guard, so a test can stub both
# detectors and assert the calls. Inline it could not be reached: the guard only
# fires when the file is run as a script, and by then the lib's own definitions
# have overridden any stub a test could inject.
#
# That matters more than it sounds. The #2765 defect was a dispatch that omitted a
# call — a class no unit test of the scorer can catch, and the only class this
# file's history says actually happens. See scripts/test/test-overlap-standalone-dispatch.sh.
_io_main() {
  local mode="prompt" ref rc=0
  if [ "${1:-}" = "--report" ]; then
    mode="--report"; ref="${2:-}"
  else
    ref="${1:-}"
  fi

  if [ "$mode" = "--report" ]; then
    check_issue_overlap "$ref" --report || rc=$?
  else
    check_issue_overlap "$ref" || rc=$?
  fi

  # Only when the number half could actually read the issue. rc 4 (no such
  # issue) and rc 5 (unreadable) mean the gate did NOT run, and a title lookup
  # would fail the same way and print nothing — running it would only add noise
  # to a failure the caller is about to refuse on (#2422 / #2298).
  if [ "$rc" -eq 0 ]; then
    if [ "$mode" = "--report" ]; then
      check_title_overlap "$ref" --report
    else
      check_title_overlap "$ref"
    fi
  fi

  return "$rc"
}

if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
  _io_main "$@"
  exit $?
fi
