#!/usr/bin/env bash
# cleanup-merged-worktrees.sh — Remove worktrees + remote refs whose PR is merged.
#
# Run this after merging PRs. Safe by default: prints a plan, asks "y" to apply.
# Three phases:
#   1. Worktree sweep — remove local worktrees whose PR is MERGED/CLOSED, plus
#      their local branch and (unless --no-remote-sweep) their origin ref.
#   2. Orphan-remote sweep — origin/task/* refs with no local worktree whose
#      PR is MERGED/CLOSED also get deleted (skipped under --no-remote-sweep).
#   3. Board-claim sweep — delete finished `--no-issue` claims from the ticketless
#      claim board (skipped under --no-board-sweep). Runs independently of phases
#      1-2 on purpose: a claim outlives its worktree, so keying the sweep on a
#      present worktree would never clean the ones that actually accumulate.
#      Six claims from merged PRs had piled up by 2026-08-06 (brik-bds#1663).
# Spares:
#   - The primary worktree (git worktree list's first entry)
#   - Any branch whose PR is OPEN
#   - Worktrees with a dirty working tree (uncommitted changes)
#   - Branches that never had a PR (could be lost work — manual review)
#   - Worktrees explicitly named via --keep
#
# Usage:
#   ./scripts/cleanup-merged-worktrees.sh                  # interactive
#   ./scripts/cleanup-merged-worktrees.sh --yes            # apply without prompt
#   ./scripts/cleanup-merged-worktrees.sh --dry-run        # show plan only
#   ./scripts/cleanup-merged-worktrees.sh --keep foo       # spare a specific worktree
#   ./scripts/cleanup-merged-worktrees.sh --no-remote-sweep  # skip phase 2 + remote deletes
#   ./scripts/cleanup-merged-worktrees.sh --no-board-sweep   # skip phase 3 (board claims)

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

DRY_RUN=0
ASSUME_YES=0
KEEP_LIST=()
REMOTE_SWEEP=1
BOARD_SWEEP=1

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)         DRY_RUN=1; shift ;;
    --yes|-y)          ASSUME_YES=1; shift ;;
    --keep)            KEEP_LIST+=("$2"); shift 2 ;;
    --no-remote-sweep) REMOTE_SWEEP=0; shift ;;
    --no-board-sweep)  BOARD_SWEEP=0; shift ;;
    -h|--help)         sed -n '2,30p' "$0"; exit 0 ;;
    *)                 echo -e "${RED}Unknown flag: $1${NC}"; exit 1 ;;
  esac
done

PROJECT_ROOT="$(git rev-parse --show-toplevel)"
PRIMARY_PATH="$(git worktree list --porcelain | awk '/^worktree /{print $2; exit}')"
if [ "$PROJECT_ROOT" != "$PRIMARY_PATH" ]; then
  echo -e "${RED}Error: cleanup-merged-worktrees.sh must run from the primary worktree.${NC}"
  echo "  Here:    $PROJECT_ROOT"
  echo "  Primary: $PRIMARY_PATH"
  exit 1
fi

# Resolve the repo slug from the git remote — local, free, and it keeps working
# when the shared GraphQL bucket is empty. This used to call `gh repo view`
# (1 GraphQL point) and read ANY failure, including a rate-limit 403, as
# "gh CLI not authenticated" — which sent a live session hunting a token problem
# on 2026-07-26 while auth was healthy the whole time (brik-llm#1590 / #1587).
# shellcheck source=scripts/lib/gh-error-classify.sh
source "$(dirname "${BASH_SOURCE[0]}")/lib/gh-error-classify.sh"

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

git fetch --prune origin --quiet

# Bash 3.2 compatible: read into array via while loop
WORKTREE_LINES=()
while IFS= read -r line; do
  [ -n "$line" ] && WORKTREE_LINES+=("$line")
done < <(git worktree list --porcelain | awk '
  /^worktree /     {wt=$2; br=""; det=0}
  /^branch /       {br=$2}
  /^detached/      {det=1}
  /^$/             {if (wt && wt != primary) print wt "\t" br "\t" det; wt=""; br=""; det=0}
  END              {if (wt && wt != primary) print wt "\t" br "\t" det}
' primary="$PRIMARY_PATH")

TO_REMOVE=()
SPARED=()
SPARED_REASONS=()
TO_REMOVE_ORPHAN_REMOTE=()  # entries: branch_name|||reason
# branches we've already classified via worktree iteration; orphan-remote
# sweep skips these to avoid double-counting.
SEEN_BRANCHES=()

if [ ${#WORKTREE_LINES[@]} -gt 0 ]; then
for line in "${WORKTREE_LINES[@]}"; do
  wt_path="$(echo "$line" | cut -f1)"
  branch_ref="$(echo "$line" | cut -f2)"
  detached="$(echo "$line" | cut -f3)"
  wt_name="$(basename "$wt_path")"
  branch_name="${branch_ref#refs/heads/}"
  [ -n "$branch_name" ] && SEEN_BRANCHES+=("$branch_name")

  # --keep
  keep_match=0
  if [ ${#KEEP_LIST[@]} -gt 0 ]; then
    for k in "${KEEP_LIST[@]}"; do
      if [ "$wt_name" = "$k" ]; then keep_match=1; break; fi
    done
  fi
  if [ "$keep_match" = "1" ]; then
    SPARED+=("$wt_path"); SPARED_REASONS+=("kept (--keep)")
    continue
  fi

  # Dirty tree → spare
  if [ -d "$wt_path" ] && [ -n "$(git -C "$wt_path" status --porcelain 2>/dev/null)" ]; then
    SPARED+=("$wt_path"); SPARED_REASONS+=("dirty working tree — manual review")
    continue
  fi

  # Stranded (detached or branch ref missing) → safe to remove
  if [ "$detached" = "1" ] || [ -z "$branch_ref" ] || ! git show-ref --verify --quiet "$branch_ref"; then
    TO_REMOVE+=("$wt_path|||$branch_name|||stranded (branch ref missing)")
    continue
  fi

  # PR state
  pr_json="$(gh pr list --repo "$REPO_SLUG" --state all --head "$branch_name" --limit 1 --json number,state 2>/dev/null || echo '[]')"
  pr_state="$(echo "$pr_json" | jq -r '.[0].state // empty')"
  pr_number="$(echo "$pr_json" | jq -r '.[0].number // empty')"

  case "$pr_state" in
    OPEN)
      SPARED+=("$wt_path"); SPARED_REASONS+=("PR #${pr_number} OPEN — active work")
      ;;
    MERGED)
      TO_REMOVE+=("$wt_path|||$branch_name|||PR #${pr_number} MERGED")
      ;;
    CLOSED)
      TO_REMOVE+=("$wt_path|||$branch_name|||PR #${pr_number} CLOSED (rejected)")
      ;;
    "")
      SPARED+=("$wt_path"); SPARED_REASONS+=("no PR opened — manual review (could be lost work)")
      ;;
    *)
      SPARED+=("$wt_path"); SPARED_REASONS+=("unknown PR state: $pr_state")
      ;;
  esac
done
fi

# Phase 2 — orphan-remote sweep: origin/task/* refs with no local worktree.
if [ "$REMOTE_SWEEP" = "1" ]; then
  while IFS= read -r remote_branch; do
    [ -z "$remote_branch" ] && continue

    # Skip branches already classified by the worktree pass
    seen=0
    if [ ${#SEEN_BRANCHES[@]} -gt 0 ]; then
      for sb in "${SEEN_BRANCHES[@]}"; do
        if [ "$sb" = "$remote_branch" ]; then seen=1; break; fi
      done
    fi
    [ "$seen" = "1" ] && continue

    pr_json="$(gh pr list --repo "$REPO_SLUG" --state all --head "$remote_branch" --limit 1 --json number,state 2>/dev/null || echo '[]')"
    pr_state="$(echo "$pr_json" | jq -r '.[0].state // empty')"
    pr_number="$(echo "$pr_json" | jq -r '.[0].number // empty')"

    case "$pr_state" in
      MERGED) TO_REMOVE_ORPHAN_REMOTE+=("$remote_branch|||PR #${pr_number} MERGED") ;;
      CLOSED) TO_REMOVE_ORPHAN_REMOTE+=("$remote_branch|||PR #${pr_number} CLOSED (rejected)") ;;
      # OPEN / "" / unknown → leave alone (active or lost work)
    esac
  done < <(git for-each-ref 'refs/remotes/origin/task/*' --format='%(refname:lstrip=3)')
fi

# Phase 3 — board-claim sweep. `--no-issue` writes a slug-keyed claim comment to
# the ticketless claim board (brik-bds#1663) so a second session is refused. The
# claim is rewritten in place per slug but nothing ever removed it when the work
# merged, so the board accreted one comment per slug ever used instead of one per
# LIVE branch, which is what its body promises.
#
# Deliberately NOT keyed on a present worktree: a claim outlives its worktree, and
# every one of the six that had piled up by 2026-08-06 had no worktree and no
# branch. Keying on the worktree would clean exactly the claims that never
# accumulate.
TO_REMOVE_CLAIMS=()  # entries: comment_id|||slug|||reason
if [ "$BOARD_SWEEP" = "1" ] && [ -r "$(dirname "${BASH_SOURCE[0]}")/lib/slug-claim.sh" ]; then
  # shellcheck source=scripts/lib/slug-claim.sh
  source "$(dirname "${BASH_SOURCE[0]}")/lib/slug-claim.sh"

  # jq extracts id/slug/stamp so the shell never has to parse the rendered
  # markdown table. An earlier version used printf+sed for that and silently
  # produced an EMPTY slug, which made every claim look like "no PR, stale" —
  # including live ones. A sweep that deletes live claims is worse than one that
  # never runs, so the fields come out of jq or the entry is skipped.
  BOARD_JSON="$(gh api "repos/$REPO_SLUG/issues/$SLUG_CLAIM_BOARD/comments" --paginate \
                 --jq '[.[]
                        | select(.body | test("<!-- claim:slug="))
                        | { id: .id,
                            slug:  (.body | capture("claim:slug=(?<s>[^ ]+) -->")   | .s),
                            stamp: (.body | capture("\\| Since \\| (?<d>[^ |]+) ") | .d) }]' \
               2>/dev/null || echo '[]')"
  BOARD_COUNT="$(echo "$BOARD_JSON" | jq 'length' 2>/dev/null || echo 0)"

  for (( i=0; i<BOARD_COUNT; i++ )); do
    c_id="$(echo "$BOARD_JSON" | jq -r ".[$i].id // empty")"
    c_slug="$(echo "$BOARD_JSON" | jq -r ".[$i].slug // empty")"
    c_stamp="$(echo "$BOARD_JSON" | jq -r ".[$i].stamp // empty")"
    # An unparseable claim is left alone rather than swept: it is someone's
    # marker and deleting what we cannot read is the wrong default.
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
fi

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  Worktree cleanup plan${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""
echo "  Primary (kept):  $PRIMARY_PATH"
echo ""

if [ ${#SPARED[@]} -gt 0 ]; then
  echo -e "${YELLOW}Spared (${#SPARED[@]}):${NC}"
  for i in "${!SPARED[@]}"; do
    printf "  - %s\n      ${YELLOW}%s${NC}\n" "$(basename "${SPARED[$i]}")" "${SPARED_REASONS[$i]}"
  done
  echo ""
fi

if [ ${#TO_REMOVE[@]} -eq 0 ] && [ ${#TO_REMOVE_ORPHAN_REMOTE[@]} -eq 0 ] \
   && [ ${#TO_REMOVE_CLAIMS[@]} -eq 0 ]; then
  echo -e "${GREEN}Nothing to remove.${NC}"
  exit 0
fi

if [ ${#TO_REMOVE[@]} -gt 0 ]; then
  echo -e "${RED}Will remove worktrees (${#TO_REMOVE[@]}):${NC}"
  for entry in "${TO_REMOVE[@]}"; do
    wt_path="${entry%%|||*}"; rest="${entry#*|||}"
    branch_name="${rest%%|||*}"; reason="${rest#*|||}"
    printf "  - %s\n      branch: %s\n      reason: %s\n" "$(basename "$wt_path")" "${branch_name:-<none>}" "$reason"
    if [ "$REMOTE_SWEEP" = "1" ] && [ -n "$branch_name" ] && git show-ref --verify --quiet "refs/remotes/origin/$branch_name"; then
      printf "      ${RED}also deleting remote: origin/%s${NC}\n" "$branch_name"
    fi
  done
  echo ""
fi

if [ ${#TO_REMOVE_ORPHAN_REMOTE[@]} -gt 0 ]; then
  echo -e "${RED}Will delete orphan remote branches (${#TO_REMOVE_ORPHAN_REMOTE[@]}):${NC}"
  for entry in "${TO_REMOVE_ORPHAN_REMOTE[@]}"; do
    branch_name="${entry%%|||*}"; reason="${entry#*|||}"
    printf "  - origin/%s\n      reason: %s\n" "$branch_name" "$reason"
  done
  echo ""
fi

if [ ${#TO_REMOVE_CLAIMS[@]} -gt 0 ]; then
  echo -e "${RED}Will delete finished claims from the ticketless board (${#TO_REMOVE_CLAIMS[@]}):${NC}"
  for entry in "${TO_REMOVE_CLAIMS[@]}"; do
    rest="${entry#*|||}"; c_slug="${rest%%|||*}"; reason="${rest#*|||}"
    printf "  - %s\n      reason: %s\n" "$c_slug" "$reason"
  done
  printf "      board: %s\n\n" "https://github.com/$REPO_SLUG/issues/${SLUG_CLAIM_BOARD:-?}"
fi

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

# Collect remote branches to delete in one push (worktree-attached + orphans)
REMOTE_DELETE_BATCH=()

if [ ${#TO_REMOVE[@]} -gt 0 ]; then
  for entry in "${TO_REMOVE[@]}"; do
    wt_path="${entry%%|||*}"; rest="${entry#*|||}"
    branch_name="${rest%%|||*}"
    echo -e "${YELLOW}~ Removing $(basename "$wt_path")...${NC}"

    if ! git worktree remove --force "$wt_path" 2>/dev/null; then
      rm -rf "$wt_path"
    fi

    if [ -n "$branch_name" ] && git show-ref --verify --quiet "refs/heads/$branch_name"; then
      git branch -D "$branch_name" >/dev/null 2>&1 || true
    fi

    if [ "$REMOTE_SWEEP" = "1" ] && [ -n "$branch_name" ] && git show-ref --verify --quiet "refs/remotes/origin/$branch_name"; then
      REMOTE_DELETE_BATCH+=("$branch_name")
    fi
  done
fi

if [ "$REMOTE_SWEEP" = "1" ] && [ ${#TO_REMOVE_ORPHAN_REMOTE[@]} -gt 0 ]; then
  for entry in "${TO_REMOVE_ORPHAN_REMOTE[@]}"; do
    branch_name="${entry%%|||*}"
    REMOTE_DELETE_BATCH+=("$branch_name")
  done
fi

if [ ${#REMOTE_DELETE_BATCH[@]} -gt 0 ]; then
  echo -e "${YELLOW}~ Deleting ${#REMOTE_DELETE_BATCH[@]} remote branch(es) on origin...${NC}"
  # Single push to delete all in one round-trip; tolerate per-ref failures.
  push_args=("origin")
  for br in "${REMOTE_DELETE_BATCH[@]}"; do
    push_args+=("--delete" "$br")
  done
  git push "${push_args[@]}" 2>&1 | sed 's/^/    /' || true
fi

if [ ${#TO_REMOVE_CLAIMS[@]} -gt 0 ]; then
  echo -e "${YELLOW}~ Deleting ${#TO_REMOVE_CLAIMS[@]} finished board claim(s)...${NC}"
  for entry in "${TO_REMOVE_CLAIMS[@]}"; do
    c_id="${entry%%|||*}"; rest="${entry#*|||}"; c_slug="${rest%%|||*}"
    if gh api -X DELETE "repos/$REPO_SLUG/issues/comments/$c_id" >/dev/null 2>&1; then
      echo "    removed claim: $c_slug"
    else
      echo -e "    ${YELLOW}could not remove claim: $c_slug (left in place)${NC}"
    fi
  done
fi

git worktree prune
echo ""
echo -e "${GREEN}Cleanup complete.${NC}"
git worktree list
