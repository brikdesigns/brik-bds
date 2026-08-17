#!/usr/bin/env bash
# sweep-board-claims.sh — delete finished `--no-issue` claims from the ticketless
# claim board.
#
# `new-task.sh --no-issue` writes a slug-keyed claim comment to the board
# (brik-bds#1663) so a second session on the same slug is refused. The claim is
# rewritten in place per slug, but nothing ever removed it when the work merged —
# so the board accreted one comment per slug EVER used instead of one per LIVE
# branch, which is what its body promises. Six had piled up by 2026-08-06.
#
# Why this is its own script (brikdesigns/brik-llm#2252): this phase used to be
# phase 4 of `cleanup-merged-worktrees.sh`, which has been replaced by the
# canonical `sweep-merged-worktrees.sh` — a file that is byte-identical in
# brik-llm, brik-bds, brik-client-portal and brikdesigns and gated on that by
# scripts/audit/reaper-twin-drift.py in brik-llm. The claim board exists in
# brik-bds ONLY:
#
#   $ rg -l 'claim board|claim-board' brik-llm/scripts portal/scripts brikdesigns/scripts
#     (no matches)
#
# so a byte-identical twin cannot carry it. Extracting it is what let brik-bds
# adopt the twin without either losing this sweep or forking the reaper.
#
# Deliberately NOT keyed on a present worktree, and therefore not a phase of a
# worktree sweeper at all: a claim outlives its worktree, and every one of the six
# that had accumulated had no worktree and no branch. Keying on the worktree would
# clean exactly the claims that never accumulate — which is also why running this
# separately from the reaper costs nothing.
#
# No primary-worktree guard, unlike the reaper: this script removes no directory
# and deletes no ref. Its only mutation is `DELETE /issues/comments/{id}` on the
# board, which is correct from any checkout.
#
# Spares:
#   - A claim whose PR is OPEN (active work — the claim is doing its job)
#   - A claim with no PR yet that is still FRESH (a live session may not have pushed)
#   - Any claim whose id, slug or timestamp will not parse (someone's marker that
#     we cannot read — deleting it is the wrong default)
#
# Usage:
#   ./scripts/sweep-board-claims.sh              # interactive: print plan, ask
#   ./scripts/sweep-board-claims.sh --dry-run    # print plan only
#   ./scripts/sweep-board-claims.sh --yes        # apply without prompting
#
# Verdict logic lives in claim_sweep_verdict (scripts/lib/slug-claim.sh) and is
# covered by scripts/__tests__/test-slug-claim.sh — pure, so it is tested without
# a network.

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

DRY_RUN=0
ASSUME_YES=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run) DRY_RUN=1; shift ;;
    --yes|-y)  ASSUME_YES=1; shift ;;
    -h|--help) sed -n '2,48p' "$0"; exit 0 ;;
    *)         echo -e "${RED}Unknown flag: $1${NC}" >&2; exit 1 ;;
  esac
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Resolve the repo slug from the git remote — local, free, and it keeps working
# when the shared GraphQL bucket is empty. The predecessor called `gh repo view`
# (1 GraphQL point) and read ANY failure, including a rate-limit 403, as "gh CLI
# not authenticated" — which sent a live session hunting a token problem on
# 2026-07-26 while auth was healthy the whole time (brik-llm#1590 / #1587).
# shellcheck source=scripts/lib/gh-error-classify.sh
source "${SCRIPT_DIR}/lib/gh-error-classify.sh"
# shellcheck source=scripts/lib/slug-claim.sh
source "${SCRIPT_DIR}/lib/slug-claim.sh"

REPO_SLUG="$(gh_repo_slug || true)"
if [ -z "$REPO_SLUG" ]; then
  # No usable origin remote, so fall back to gh and let the classifier name
  # whatever actually failed instead of guessing "not authenticated".
  GH_ERR="$(mktemp)"
  REPO_SLUG="$(gh repo view --json nameWithOwner -q .nameWithOwner 2>"$GH_ERR" || true)"
  if [ -z "$REPO_SLUG" ]; then
    echo -e "${RED}Error: could not determine the GitHub repo for this checkout.${NC}" >&2
    gh_explain_failure "$(cat "$GH_ERR")" >/dev/null
    rm -f "$GH_ERR"
    exit 1
  fi
  rm -f "$GH_ERR"
fi

# jq extracts id/slug/stamp so the shell never has to parse the rendered markdown
# table. An earlier version used printf+sed for that and silently produced an
# EMPTY slug, which made every claim look like "no PR, stale" — including live
# ones. A sweep that deletes live claims is worse than one that never runs, so the
# fields come out of jq or the entry is skipped.
BOARD_JSON="$(gh api "repos/$REPO_SLUG/issues/$SLUG_CLAIM_BOARD/comments" --paginate \
               --jq '[.[]
                      | select(.body | test("<!-- claim:slug="))
                      | { id: .id,
                          slug:  (.body | capture("claim:slug=(?<s>[^ ]+) -->")   | .s),
                          stamp: (.body | capture("\\| Since \\| (?<d>[^ |]+) ") | .d) }]' \
             2>/dev/null || echo '[]')"
BOARD_COUNT="$(echo "$BOARD_JSON" | jq 'length' 2>/dev/null || echo 0)"

TO_REMOVE_CLAIMS=()  # entries: comment_id|||slug|||reason
for (( i=0; i<BOARD_COUNT; i++ )); do
  c_id="$(echo "$BOARD_JSON" | jq -r ".[$i].id // empty")"
  c_slug="$(echo "$BOARD_JSON" | jq -r ".[$i].slug // empty")"
  c_stamp="$(echo "$BOARD_JSON" | jq -r ".[$i].stamp // empty")"
  # An unparseable claim is left alone rather than swept: it is someone's marker
  # and deleting what we cannot read is the wrong default.
  if [ -z "$c_id" ] || [ -z "$c_slug" ] || [ -z "$c_stamp" ]; then
    continue
  fi

  c_pr_json="$(gh pr list --repo "$REPO_SLUG" --state all --head "task/$c_slug" --limit 1 --json number,state 2>/dev/null || echo '[]')"
  c_pr_state="$(echo "$c_pr_json" | jq -r '.[0].state // empty')"
  c_pr_number="$(echo "$c_pr_json" | jq -r '.[0].number // empty')"

  case "$(claim_sweep_verdict "$c_pr_state" "$c_stamp" "$(date -u +%s)")" in
    sweep)
      case "$c_pr_state" in
        MERGED|CLOSED) c_reason="PR #${c_pr_number} ${c_pr_state}" ;;
        *)             c_reason="no PR and claim is stale (>${CLAIM_STALE_SECONDS}s) — already non-blocking" ;;
      esac
      TO_REMOVE_CLAIMS+=("$c_id|||$c_slug|||$c_reason")
      ;;
  esac
done

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  Ticketless claim-board sweep plan${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""
printf "  Board:  %s\n" "https://github.com/$REPO_SLUG/issues/${SLUG_CLAIM_BOARD}"
printf "  Claims: %s on the board\n\n" "$BOARD_COUNT"

if [ ${#TO_REMOVE_CLAIMS[@]} -eq 0 ]; then
  echo -e "${GREEN}Nothing to remove.${NC}"
  exit 0
fi

echo -e "${RED}Will delete finished claims (${#TO_REMOVE_CLAIMS[@]}):${NC}"
for entry in "${TO_REMOVE_CLAIMS[@]}"; do
  rest="${entry#*|||}"; c_slug="${rest%%|||*}"; reason="${rest#*|||}"
  printf "  - %s\n      reason: %s\n" "$c_slug" "$reason"
done
echo ""

if [ "$DRY_RUN" = "1" ]; then
  echo -e "${BLUE}Dry-run only. No changes made.${NC}"
  exit 0
fi

if [ "$ASSUME_YES" != "1" ]; then
  read -r -p "Apply this plan? [y/N] " ans
  case "$ans" in
    y|Y|yes|YES) ;;
    *) echo -e "${YELLOW}Aborted.${NC}"; exit 0 ;;
  esac
fi

echo ""
echo -e "${YELLOW}~ Deleting ${#TO_REMOVE_CLAIMS[@]} finished board claim(s)...${NC}"
for entry in "${TO_REMOVE_CLAIMS[@]}"; do
  c_id="${entry%%|||*}"; rest="${entry#*|||}"; c_slug="${rest%%|||*}"
  if gh api -X DELETE "repos/$REPO_SLUG/issues/comments/$c_id" >/dev/null 2>&1; then
    echo "    removed claim: $c_slug"
  else
    echo -e "    ${YELLOW}could not remove claim: $c_slug (left in place)${NC}"
  fi
done

echo ""
echo -e "${GREEN}Sweep complete.${NC}"
