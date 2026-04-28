#!/usr/bin/env bash
# cleanup-merged-worktrees.sh — Remove worktrees whose PR is merged or whose branch ref is missing.
#
# Run this after merging PRs. Safe by default: prints a plan, asks "y" to apply.
# Skips:
#   - The primary worktree (the one git worktree list lists first)
#   - Any worktree whose branch has an OPEN PR
#   - Worktrees with a dirty working tree (uncommitted changes)
#   - Worktrees whose branch never had a PR (could be lost work — manual review)
#   - Worktrees explicitly named via --keep
#
# Usage:
#   ./scripts/cleanup-merged-worktrees.sh                # interactive
#   ./scripts/cleanup-merged-worktrees.sh --yes          # apply without prompt
#   ./scripts/cleanup-merged-worktrees.sh --dry-run      # show plan only
#   ./scripts/cleanup-merged-worktrees.sh --keep foo     # spare a specific worktree

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

DRY_RUN=0
ASSUME_YES=0
KEEP_LIST=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run) DRY_RUN=1; shift ;;
    --yes|-y)  ASSUME_YES=1; shift ;;
    --keep)    KEEP_LIST+=("$2"); shift 2 ;;
    -h|--help) sed -n '2,18p' "$0"; exit 0 ;;
    *)         echo -e "${RED}Unknown flag: $1${NC}"; exit 1 ;;
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

REPO_SLUG="$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || echo '')"
if [ -z "$REPO_SLUG" ]; then
  echo -e "${RED}Error: gh CLI not authenticated or no repo detected.${NC}"
  exit 1
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

if [ ${#WORKTREE_LINES[@]} -eq 0 ]; then
  echo -e "${GREEN}No non-primary worktrees. Nothing to clean.${NC}"
  exit 0
fi

TO_REMOVE=()
SPARED=()
SPARED_REASONS=()

for line in "${WORKTREE_LINES[@]}"; do
  wt_path="$(echo "$line" | cut -f1)"
  branch_ref="$(echo "$line" | cut -f2)"
  detached="$(echo "$line" | cut -f3)"
  wt_name="$(basename "$wt_path")"
  branch_name="${branch_ref#refs/heads/}"

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

if [ ${#TO_REMOVE[@]} -eq 0 ]; then
  echo -e "${GREEN}Nothing to remove.${NC}"
  exit 0
fi

echo -e "${RED}Will remove (${#TO_REMOVE[@]}):${NC}"
for entry in "${TO_REMOVE[@]}"; do
  wt_path="${entry%%|||*}"; rest="${entry#*|||}"
  branch_name="${rest%%|||*}"; reason="${rest#*|||}"
  printf "  - %s\n      branch: %s\n      reason: %s\n" "$(basename "$wt_path")" "${branch_name:-<none>}" "$reason"
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
done

git worktree prune
echo ""
echo -e "${GREEN}Cleanup complete.${NC}"
git worktree list
