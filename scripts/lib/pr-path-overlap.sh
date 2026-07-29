#!/usr/bin/env bash
# pr-path-overlap.sh — warn when an open PR already touches a path in this diff.
#
# Sourced by pr-task.sh after the base-sync, before the PR is created. Closes
# brik-bds#1545 (the same-path slice of brik-llm#1485).
#
# Why this exists, and why the ticket-keyed gate cannot cover it: #1533 keys on
# the ISSUE NUMBER. On 2026-07-29 two PRs from two sessions changed only
# `scripts/propagate.sh`, 54 minutes apart, under two different tickets —
# #1528 (14:27:06Z) and #1529 (15:21:41Z). No number-keyed predicate can see
# that; the overlap was in the paths. Same lines re-litigated three times.
#
# Why it warns rather than blocks: two sessions editing one file is often
# legitimate — the second pass on the 2026-07-20 hook consolidation caught two
# stale refs the first missed (brik-llm#1485, first comment). The cost this
# removes is discovering the collision at merge time instead of at open time.
#
# The pure decision logic lives at the top so a test can exercise it without a
# network or a repo. pr-task.sh guards on branch and tree state and refuses to
# run from a clean main, so anything inline there is untestable — the same
# reason lib/overlap-filters.sh and lib/issue-claim.sh exist.
#
# Usage (sourced):
#   source scripts/lib/pr-path-overlap.sh
#   check_pr_path_overlap main "$BRANCH"
#
# Return codes: always 0. This is a warning, not a gate.

# shellcheck disable=SC2148  # sourced

_PPO_YELLOW='\033[1;33m'
_PPO_GREEN='\033[0;32m'
_PPO_NC='\033[0m'

# ── Pure helpers (no network, no git) ──────────────────────────────

# Exact-match intersection of two newline-separated path lists, order-preserving
# on the SECOND list and de-duplicated.
#
# Exact match only, deliberately: `components/ui/button.tsx` and
# `components/ui/button.css` are two different files, and a same-directory
# heuristic would report the whole of `components/ui/` as one overlap. That is
# how new-task.sh's keyword variant (a single word from the slug, :285-307)
# generates noise, and a gate that is usually wrong trains everyone to skip it —
# measured in #1533, where 6 of 6 emittable warnings were false positives before
# filtering.
intersect_paths() {
  local mine="${1:-}" theirs="${2:-}"
  [ -n "$mine" ] && [ -n "$theirs" ] || return 0
  awk '
    NR == FNR { if ($0 != "") mine[$0] = 1; next }
    { if ($0 != "" && ($0 in mine) && !seen[$0]++) print }
  ' <(printf '%s\n' "$mine") <(printf '%s\n' "$theirs")
}

# Read open-PR records on stdin and echo only those sharing a path with MINE.
#
#   in:   number<TAB>headRefName<TAB>title<TAB>path,path,path
#   out:  number<TAB>title<TAB>shared,shared
#
# MY_BRANCH is excluded by HEAD REF, not by number: at pr-task.sh time this
# branch's PR does not exist yet, so there is no number to compare against, and
# a re-run after a push must not report the branch against itself.
#
# Paths arrive comma-joined (the shape new-task.sh already uses). A comma inside
# a filename would mis-split — no tracked path in this repo has one
# (`git ls-files | grep -c ,` → 0) and because the match is exact, a mis-split
# can only MISS a warning, never invent one.
overlapping_prs() {
  local mine="${1:-}" my_branch="${2:-}" num head title paths shared
  [ -n "$mine" ] || return 0
  while IFS=$'\t' read -r num head title paths; do
    [ -n "$num" ] || continue
    [ -n "$my_branch" ] && [ "$head" = "$my_branch" ] && continue
    shared="$(intersect_paths "$mine" "$(printf '%s' "$paths" | tr ',' '\n')")"
    [ -n "$shared" ] || continue
    printf '%s\t%s\t%s\n' "$num" "$title" "$(printf '%s\n' "$shared" | paste -sd, -)"
  done
}

# ── Network-touching orchestration ─────────────────────────────────

# ONE gh call for every open PR and its files, never one call per PR: the fleet
# shares a single hourly GitHub API bucket
# (rag:github-api-quota-is-shared-across-the-fleet) and this runs on every PR.
#
# `--json files` caps at 100 files per PR (GraphQL page size). A PR bigger than
# that can hide an overlap past file 100 — an under-report, which is the safe
# direction for a warning.
#
# GH_OPEN_PR_CMD is the test injection point; it defaults to the real gh.
_ppo_my_paths() {
  git diff --name-only "origin/${1}..HEAD"
}

_ppo_open_prs() {
  gh pr list --state open --limit 100 \
    --json number,headRefName,title,files \
    --jq '.[] | "\(.number)\t\(.headRefName)\t\(.title)\t\(.files | map(.path) | join(","))"' \
    2>/dev/null
}

# check_pr_path_overlap <base-branch> <my-branch>
check_pr_path_overlap() {
  local base="${1:?check_pr_path_overlap needs a base branch}" my_branch="${2:-}"

  if ! command -v gh >/dev/null 2>&1; then
    echo -e "${_PPO_YELLOW}⚠  gh not on PATH — skipping the same-path open-PR check.${_PPO_NC}" >&2
    return 0
  fi

  # Two-dot against the fetched remote base: pr-task.sh merges origin/$base
  # before this runs, so a three-dot diff would re-list everything that merge
  # brought in as if it were this branch's work (the #1001 class).
  #
  # PPO_DIFF_CMD is the test injection point — without it, exercising this
  # function would mean running `git diff` against whatever repo the test happens
  # to be standing in, which is the #1539 failure mode in read-only clothing.
  local mine
  mine="$(${PPO_DIFF_CMD:-_ppo_my_paths} "$base" 2>/dev/null || true)"
  if [ -z "$mine" ]; then
    return 0
  fi

  # Status and output captured from ONE invocation. Calling twice — once for the
  # data, once to test whether it failed — would double the quota cost of the
  # cheapest branch.
  local records rc=0
  records="$(${GH_OPEN_PR_CMD:-_ppo_open_prs})" || rc=$?
  if [ "$rc" -ne 0 ]; then
    # A failed call must say so out loud rather than read as an all-clear.
    echo -e "${_PPO_YELLOW}⚠  Could not list open PRs — same-path check skipped, not passed.${_PPO_NC}" >&2
    return 0
  fi
  [ -n "$records" ] || return 0

  local hits
  hits="$(printf '%s\n' "$records" | overlapping_prs "$mine" "$my_branch")"
  if [ -z "$hits" ]; then
    echo -e "  ${_PPO_GREEN}No open PR touches a path in this diff.${_PPO_NC}"
    return 0
  fi

  echo ""
  echo -e "${_PPO_YELLOW}⚠  Open PR(s) already touching a path in this diff:${_PPO_NC}"
  printf '%s\n' "$hits" | awk -F'\t' '{ printf "    PR #%s — %s\n        %s\n", $1, $2, $3 }'
  echo ""
  echo -e "${_PPO_YELLOW}   Different tickets, same file is invisible to the ticket-keyed gate${_PPO_NC}"
  echo -e "${_PPO_YELLOW}   (#1533): brik-bds #1528 and #1529 rewrote the same 15 lines of${_PPO_NC}"
  echo -e "${_PPO_YELLOW}   scripts/propagate.sh 54 minutes apart. brik-llm#1485.${_PPO_NC}"
  echo ""
  echo -e "${_PPO_YELLOW}   Read those PRs before merging this one.${_PPO_NC}"

  # Never block and never hang: a closed stdin in an agent session must not sit
  # on `read` (#1099, and the same defect still live in issue-overlap.sh's
  # prompt — brik-bds#1549).
  if [ -t 0 ]; then
    echo -e "${_PPO_YELLOW}   Press Enter to continue, Ctrl+C to abort.${_PPO_NC}"
    read -r || true
  else
    echo -e "${_PPO_YELLOW}   → non-interactive: continuing.${_PPO_NC}"
  fi
  return 0
}
