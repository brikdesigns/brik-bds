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
# Identical twins of this file live in brik-llm/scripts/lib/ and
# brik-client-portal/scripts/lib/. They are separate git repos, so these are
# deliberate copies, not an import — keep all THREE in sync when any changes.
# brik-llm was the origin; brik-bds is the third copy (brik-bds#1533).
#
# The brik-llm and brik-client-portal headers still say "the two" — they predate
# this copy. Correcting them is a one-line edit in each, tracked on brik-bds#1533.
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

_IO_YELLOW='\033[1;33m'
_IO_GREEN='\033[0;32m'
_IO_RED='\033[0;31m'
_IO_NC='\033[0m'

# Resolve "1525" or "owner/repo#1525" into OWNER REPO NUMBER on stdout.
# Bare numbers resolve against the current repo.
_io_resolve_ref() {
  local ref="$1" owner repo num
  if [[ "$ref" =~ ^([A-Za-z0-9._-]+)/([A-Za-z0-9._-]+)#?([0-9]+)$ ]]; then
    owner="${BASH_REMATCH[1]}"; repo="${BASH_REMATCH[2]}"; num="${BASH_REMATCH[3]}"
  elif [[ "$ref" =~ ^#?([0-9]+)$ ]]; then
    num="${BASH_REMATCH[1]}"
    local nwo
    nwo="$(gh repo view --json nameWithOwner --jq .nameWithOwner 2>/dev/null || true)"
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

_io_issue_state() {
  local owner="$1" repo="$2" num="$3"
  gh api "repos/$owner/$repo/issues/$num" --jq '.state + "\t" + .title' 2>/dev/null || true
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

  local state_line state title
  state_line="$(_io_issue_state "$owner" "$repo" "$num")"
  if [ -z "$state_line" ]; then
    echo -e "${_IO_YELLOW}⚠  Could not read ${owner}/${repo}#${num} — skipping the overlap check.${_IO_NC}" >&2
    return 0
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
# (scripts/new-task.sh:190), so a closed stdin took down the script before the
# worktree was created — and the usual trigger is a false-positive org-wide
# search hit. Reproduced twice on 2026-07-29 while building #1545/#1546
# (brik-bds#1549).
#
# Same contract as new-task.sh's own confirm() (scripts/new-task.sh:134-140,
# from #1099): interactive TTY waits, everything else prints and proceeds.
# NEW_TASK_YES=1 is honoured so one env var covers both prompts.
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

# Standalone invocation: scripts/lib/issue-overlap.sh [--report] <issue-ref>
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
  if [ "${1:-}" = "--report" ]; then
    check_issue_overlap "${2:-}" --report
  else
    check_issue_overlap "${1:-}"
  fi
  exit $?
fi
