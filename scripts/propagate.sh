#!/bin/bash
#
# BDS Propagate — Push design system updates to consuming products
#
# Usage:
#   ./scripts/propagate.sh              # Interactive (prompts before PR)
#   ./scripts/propagate.sh --dry-run    # Preview changelog, don't push
#   ./scripts/propagate.sh --auto       # Non-interactive (for CI)
#
# What it does:
#   1. Detects new commits in brik-bds since last submodule sync
#   2. Generates a changelog grouped by type (features, fixes, updates)
#   3. Updates the submodule ref in each consumer repo
#   4. Opens a PR in each consumer with the changelog
#   5. Tags the release in brik-bds
#
# Requirements:
#   - gh CLI authenticated (gh auth status)
#   - Consumer repos cloned locally (configured below)
#
# Adding consumers:
#   Add entries to CONSUMER_DIRS and CONSUMER_SUBPATHS arrays below.
#   Index must match between both arrays.

set -euo pipefail

# ─── Configuration ────────────────────────────────────────────────
BDS_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BDS_REMOTE="origin"
BDS_BRANCH="main"

# Consumer repos — parallel arrays (bash 3 compatible)
CONSUMER_DIRS=(
  "/Users/nickstanerson/Documents/GitHub/brik-llm"
  "/Users/nickstanerson/Documents/GitHub/brik-client-portal"
)
CONSUMER_SUBPATHS=(
  "foundations/brik-bds"
  "brik-bds"
)

# ─── Argument Parsing ─────────────────────────────────────────────
DRY_RUN=false
AUTO=false
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=true ;;
    --auto)    AUTO=true ;;
    *)         echo "Unknown flag: $arg"; exit 1 ;;
  esac
done

# ─── Colors ───────────────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
DIM='\033[0;90m'
BOLD='\033[1m'
NC='\033[0m'

info()  { echo -e "${BLUE}→${NC} $1"; }
ok()    { echo -e "${GREEN}✓${NC} $1"; }
warn()  { echo -e "${YELLOW}!${NC} $1"; }
err()   { echo -e "${RED}✗${NC} $1"; }

# ─── Preflight Checks ────────────────────────────────────────────
info "Running preflight checks..."

if [ ! -f "$BDS_DIR/package.json" ]; then
  err "Not in brik-bds repo"
  exit 1
fi

if ! command -v gh &>/dev/null; then
  err "gh CLI not found. Install: brew install gh"
  exit 1
fi

if ! gh auth status &>/dev/null; then
  err "gh CLI not authenticated. Run: gh auth login"
  exit 1
fi

cd "$BDS_DIR"
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "$BDS_BRANCH" ]; then
  err "Must be on $BDS_BRANCH branch (currently on $CURRENT_BRANCH)"
  exit 1
fi

if [ -n "$(git status --porcelain)" ]; then
  err "Working tree has uncommitted changes. Commit or stash first."
  exit 1
fi

git fetch "$BDS_REMOTE" "$BDS_BRANCH" --quiet
LOCAL_HEAD=$(git rev-parse HEAD)
REMOTE_HEAD=$(git rev-parse "$BDS_REMOTE/$BDS_BRANCH")
if [ "$LOCAL_HEAD" != "$REMOTE_HEAD" ]; then
  warn "Local branch is not in sync with remote."
  warn "  Local:  $(echo "$LOCAL_HEAD" | cut -c1-7)"
  warn "  Remote: $(echo "$REMOTE_HEAD" | cut -c1-7)"
  if [ "$AUTO" = false ] && [ "$DRY_RUN" = false ]; then
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      exit 0
    fi
  fi
fi

ok "Preflight checks passed"
echo ""

# Track whether any consumer was updated (for tagging)
ANY_UPDATED=false
TOTAL_NEW_COMMITS=0
DATE_STAMP=$(date +%Y-%m-%d)
SHORT_HASH=$(echo "$LOCAL_HEAD" | cut -c1-7)

# ─── Process Each Consumer ────────────────────────────────────────
for i in "${!CONSUMER_DIRS[@]}"; do
  CONSUMER_DIR="${CONSUMER_DIRS[$i]}"
  SUBMODULE_PATH="${CONSUMER_SUBPATHS[$i]}"
  CONSUMER_NAME=$(basename "$CONSUMER_DIR")

  echo -e "${BOLD}━━━ Consumer: $CONSUMER_NAME ━━━${NC}"

  if [ ! -d "$CONSUMER_DIR/.git" ]; then
    warn "Consumer repo not found at $CONSUMER_DIR — skipping"
    echo ""
    continue
  fi

  # Get current submodule commit
  cd "$CONSUMER_DIR"
  SUBMODULE_COMMIT=$(git submodule status "$SUBMODULE_PATH" 2>/dev/null | awk '{print $1}' | tr -d '+- ')

  if [ -z "$SUBMODULE_COMMIT" ]; then
    warn "Submodule $SUBMODULE_PATH not found in $CONSUMER_NAME — skipping"
    echo ""
    continue
  fi

  # Count new commits
  cd "$BDS_DIR"
  NEW_COMMITS=$(git log --oneline "$SUBMODULE_COMMIT..HEAD" 2>/dev/null | wc -l | tr -d ' ')

  if [ "$NEW_COMMITS" -eq 0 ]; then
    ok "$CONSUMER_NAME is already up to date"
    echo ""
    continue
  fi

  info "$NEW_COMMITS new commits since last sync"
  echo ""

  # ─── Generate Changelog ──────────────────────────────────────
  FEATURES=""
  FIXES=""
  UPDATES=""
  OTHER=""

  while IFS= read -r line; do
    hash=$(echo "$line" | awk '{print $1}')
    msg=$(echo "$line" | cut -d' ' -f2-)

    case "$msg" in
      Add\ *|add\ *)     FEATURES="${FEATURES}- ${msg} (\`${hash}\`)\n" ;;
      Fix\ *|fix\ *)     FIXES="${FIXES}- ${msg} (\`${hash}\`)\n" ;;
      Update\ *|update\ *|Align\ *|align\ *)
                          UPDATES="${UPDATES}- ${msg} (\`${hash}\`)\n" ;;
      *)                  OTHER="${OTHER}- ${msg} (\`${hash}\`)\n" ;;
    esac
  done < <(git log --oneline "$SUBMODULE_COMMIT..HEAD")

  CHANGELOG=""
  [ -n "$FEATURES" ] && CHANGELOG="${CHANGELOG}### New\n${FEATURES}\n"
  [ -n "$FIXES" ]    && CHANGELOG="${CHANGELOG}### Fixes\n${FIXES}\n"
  [ -n "$UPDATES" ]  && CHANGELOG="${CHANGELOG}### Updates\n${UPDATES}\n"
  [ -n "$OTHER" ]    && CHANGELOG="${CHANGELOG}### Other\n${OTHER}\n"

  echo -e "${DIM}─── Changelog ───${NC}"
  echo -e "$CHANGELOG"
  echo -e "${DIM}─────────────────${NC}"

  if [ "$DRY_RUN" = true ]; then
    info "[dry-run] Would update $CONSUMER_NAME submodule and open PR"
    TOTAL_NEW_COMMITS=$NEW_COMMITS
    echo ""
    continue
  fi

  # ─── Confirm ─────────────────────────────────────────────────
  if [ "$AUTO" = false ]; then
    read -p "Update $CONSUMER_NAME and open PR? (Y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Nn]$ ]]; then
      warn "Skipped $CONSUMER_NAME"
      echo ""
      continue
    fi
  fi

  # ─── Update Submodule ───────────────────────────────────────
  cd "$CONSUMER_DIR"

  # Stash any local changes in consumer before switching
  CONSUMER_STASHED=false
  if [ -n "$(git status --porcelain)" ]; then
    git stash -u --quiet -m "bds-propagate: auto-stash before update"
    CONSUMER_STASHED=true
    info "Stashed local changes in $CONSUMER_NAME"
  fi

  CONSUMER_BRANCH=$(git branch --show-current)
  if [ "$CONSUMER_BRANCH" != "main" ]; then
    warn "$CONSUMER_NAME is on branch $CONSUMER_BRANCH, switching to main"
    git checkout main --quiet
  fi
  git pull --quiet

  PR_BRANCH="bds-update/${DATE_STAMP}-${SHORT_HASH}"
  git branch -D "$PR_BRANCH" 2>/dev/null || true
  git checkout -b "$PR_BRANCH" --quiet
  info "Created branch: $PR_BRANCH"

  # Update submodule to latest remote (fetches from brik-bds origin/main)
  git submodule update --init --remote --quiet -- "$SUBMODULE_PATH" 2>/dev/null || {
    # Fallback: manually update inside the submodule
    info "Using manual submodule update..."
    (cd "$SUBMODULE_PATH" && git fetch origin main --quiet && git checkout --quiet "$LOCAL_HEAD")
  }

  git add "$SUBMODULE_PATH"

  if git diff --cached --quiet; then
    ok "$CONSUMER_NAME submodule already at latest — no changes"
    git checkout main --quiet
    git branch -D "$PR_BRANCH" 2>/dev/null || true
    echo ""
    continue
  fi

  COMMIT_MSG="Update brik-bds submodule — $NEW_COMMITS changes"
  git commit -m "$COMMIT_MSG" --quiet
  git push -u origin "$PR_BRANCH" --quiet
  ok "Pushed $PR_BRANCH"

  # ─── Create PR ──────────────────────────────────────────────
  PR_TITLE="Update BDS: $NEW_COMMITS design system changes"

  # Write changelog to temp file for clean PR body
  CHANGELOG_RENDERED=$(echo -e "$CHANGELOG")
  PR_BODY="## BDS Update — $DATE_STAMP

Updates \`$SUBMODULE_PATH\` submodule to latest (\`$SHORT_HASH\`).

**$NEW_COMMITS commits** since last sync:

$CHANGELOG_RENDERED

---

*Auto-generated by \`brik-bds/scripts/propagate.sh\`*"

  PR_URL=$(gh pr create \
    --title "$PR_TITLE" \
    --body "$PR_BODY" \
    --base main \
    --head "$PR_BRANCH" \
    2>&1)

  ok "PR created: $PR_URL"
  ANY_UPDATED=true
  TOTAL_NEW_COMMITS=$NEW_COMMITS

  # Restore consumer to original state
  git checkout main --quiet
  if [ "$CONSUMER_STASHED" = true ]; then
    if [ "$CONSUMER_BRANCH" != "main" ]; then
      git checkout "$CONSUMER_BRANCH" --quiet
    fi
    git stash pop --quiet
    info "Restored local changes in $CONSUMER_NAME"
  fi
  echo ""
done

# ─── Tag Release in brik-bds ─────────────────────────────────────
cd "$BDS_DIR"

if [ "$DRY_RUN" = true ]; then
  info "[dry-run] Would tag release: bds-$DATE_STAMP"
elif [ "$ANY_UPDATED" = true ]; then
  BASE_TAG="bds-$DATE_STAMP"
  TAG="$BASE_TAG"
  SUFFIX=1
  while git tag -l "$TAG" | grep -q .; do
    TAG="$BASE_TAG.$SUFFIX"
    SUFFIX=$((SUFFIX + 1))
  done

  git tag -a "$TAG" -m "BDS release $TAG — $TOTAL_NEW_COMMITS changes propagated"
  git push origin "$TAG" --quiet
  ok "Tagged release: $TAG"
fi

echo ""
echo -e "${GREEN}${BOLD}Done!${NC} Design system updates propagated."
