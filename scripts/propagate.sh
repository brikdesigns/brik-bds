#!/bin/bash
#
# BDS Propagate — Two-track design-system propagation
#
# Usage:
#   ./scripts/propagate.sh              # Interactive (prompts before PR)
#   ./scripts/propagate.sh --dry-run    # Preview changelog, don't push
#   ./scripts/propagate.sh --auto       # Non-interactive (for CI)
#   ./scripts/propagate.sh --only <name>   # Target a single consumer
#
# Tracks:
#   Submodule consumers (brik-llm, brikdesigns):
#     → Updates git submodule SHA in consumer, opens PR with commit-log changelog
#   npm consumers (brik-client-portal, renew-pms):
#     → Runs `npm update @brikdesigns/bds`, commits package.json + lockfile, opens PR
#
# Requirements:
#   - gh CLI authenticated
#   - Consumer repos cloned at paths configured below
#   - npm registry auth for @brikdesigns/bds (GitHub Packages)
#
# Adding a consumer:
#   Add an entry to SUBMODULE_CONSUMERS or NPM_CONSUMERS below.
#   Fields are pipe-delimited (|) to allow colons in paths.

set -euo pipefail

# ─── Configuration ────────────────────────────────────────────────
BDS_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BDS_REMOTE="origin"
BDS_BRANCH="main"
BDS_PACKAGE_NAME="@brikdesigns/bds"

# Submodule consumers: name|path|subpath|base_branch
SUBMODULE_CONSUMERS=(
  "brik-llm|/Users/nickstanerson/Documents/GitHub/brik/brik-llm|foundations/brik-bds|main"
  "brikdesigns|/Users/nickstanerson/Documents/GitHub/brik/brikdesigns|brik-bds|main"
)

# npm consumers: name|path|base_branch
NPM_CONSUMERS=(
  "brik-client-portal|/Users/nickstanerson/Documents/GitHub/product/brik-client-portal|staging"
  "renew-pms|/Users/nickstanerson/Documents/GitHub/product/renew-pms|staging"
)

# ─── Argument Parsing ─────────────────────────────────────────────
DRY_RUN=false
AUTO=false
ONLY=""
while [ $# -gt 0 ]; do
  case "$1" in
    --dry-run) DRY_RUN=true; shift ;;
    --auto)    AUTO=true; shift ;;
    --only)    ONLY="$2"; shift 2 ;;
    *)         echo "Unknown flag: $1"; exit 1 ;;
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

# ─── Preflight ────────────────────────────────────────────────────
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

if ! command -v jq &>/dev/null; then
  err "jq not found. Install: brew install jq"
  exit 1
fi

cd "$BDS_DIR"
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "$BDS_BRANCH" ] && [ "$DRY_RUN" = false ]; then
  warn "Not on $BDS_BRANCH (currently $CURRENT_BRANCH) — continuing in dry-run only"
  if [ "$AUTO" = false ]; then
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    [[ ! $REPLY =~ ^[Yy]$ ]] && exit 0
  fi
fi

if [ -n "$(git status --porcelain)" ] && [ "$DRY_RUN" = false ]; then
  err "Working tree has uncommitted changes. Commit or stash first."
  exit 1
fi

git fetch "$BDS_REMOTE" "$BDS_BRANCH" --quiet
LOCAL_HEAD=$(git rev-parse HEAD)
BDS_VERSION=$(jq -r '.version' "$BDS_DIR/package.json")

ok "Preflight passed — bds@$BDS_VERSION at $(echo "$LOCAL_HEAD" | cut -c1-7)"
echo ""

DATE_STAMP=$(date +%Y-%m-%d)
SHORT_HASH=$(echo "$LOCAL_HEAD" | cut -c1-7)
ANY_UPDATED=false

# ─── Changelog Generation (submodule track) ───────────────────────
# Groups commits by conventional-commit type between two SHAs
generate_changelog() {
  local from_sha="$1"
  local to_sha="$2"
  local FEATURES="" FIXES="" UPDATES="" OTHER=""

  while IFS= read -r line; do
    hash=$(echo "$line" | awk '{print $1}')
    msg=$(echo "$line" | cut -d' ' -f2-)
    case "$msg" in
      feat*)                               FEATURES="${FEATURES}- ${msg} (\`${hash}\`)"$'\n' ;;
      fix*)                                FIXES="${FIXES}- ${msg} (\`${hash}\`)"$'\n' ;;
      refactor*|chore*|docs*|style*|perf*|ci*|build*|test*)
                                           UPDATES="${UPDATES}- ${msg} (\`${hash}\`)"$'\n' ;;
      Add\ *|add\ *)                       FEATURES="${FEATURES}- ${msg} (\`${hash}\`)"$'\n' ;;
      Fix\ *)                              FIXES="${FIXES}- ${msg} (\`${hash}\`)"$'\n' ;;
      Update\ *|Align\ *)                  UPDATES="${UPDATES}- ${msg} (\`${hash}\`)"$'\n' ;;
      *)                                   OTHER="${OTHER}- ${msg} (\`${hash}\`)"$'\n' ;;
    esac
  done < <(git -C "$BDS_DIR" log --oneline "${from_sha}..${to_sha}")

  local out=""
  [ -n "$FEATURES" ] && out="${out}### Features"$'\n'"${FEATURES}"$'\n'
  [ -n "$FIXES" ]    && out="${out}### Fixes"$'\n'"${FIXES}"$'\n'
  [ -n "$UPDATES" ]  && out="${out}### Updates"$'\n'"${UPDATES}"$'\n'
  [ -n "$OTHER" ]    && out="${out}### Other"$'\n'"${OTHER}"$'\n'
  printf '%s' "$out"
}

# ─── Submodule Track ──────────────────────────────────────────────
propagate_submodule() {
  local name="$1" path="$2" subpath="$3" base="$4"

  echo -e "${BOLD}━━━ submodule :: $name ━━━${NC}"

  if [ ! -d "$path/.git" ] && [ ! -f "$path/.git" ]; then
    warn "Consumer repo not found at $path — skipping"
    echo ""
    return
  fi

  # Read current submodule SHA from consumer
  local current_sha
  current_sha=$(cd "$path" && git submodule status "$subpath" 2>/dev/null | awk '{print $1}' | tr -d '+- ')
  if [ -z "$current_sha" ]; then
    warn "Submodule $subpath not found in $name — skipping"
    echo ""
    return
  fi

  local new_commits
  new_commits=$(git -C "$BDS_DIR" log --oneline "${current_sha}..HEAD" 2>/dev/null | wc -l | tr -d ' ')

  if [ "$new_commits" -eq 0 ]; then
    ok "$name already at $(echo "$current_sha" | cut -c1-7) — no update needed"
    echo ""
    return
  fi

  info "$name is $new_commits commits behind"
  local changelog
  changelog=$(generate_changelog "$current_sha" "HEAD")
  echo -e "${DIM}─── Changelog ───${NC}"
  echo -e "$changelog"
  echo -e "${DIM}─────────────────${NC}"

  if [ "$DRY_RUN" = true ]; then
    info "[dry-run] Would update $name submodule and open PR against $base"
    echo ""
    return
  fi

  if [ "$AUTO" = false ]; then
    read -p "Update $name and open PR? (Y/n) " -n 1 -r
    echo
    [[ $REPLY =~ ^[Nn]$ ]] && { warn "Skipped $name"; echo ""; return; }
  fi

  # Stash + switch to base branch
  local stashed=false orig_branch
  cd "$path"
  orig_branch=$(git branch --show-current)
  if [ -n "$(git status --porcelain)" ]; then
    git stash -u --quiet -m "bds-propagate: auto-stash"
    stashed=true
  fi
  [ "$orig_branch" != "$base" ] && git checkout "$base" --quiet
  git pull --quiet

  local pr_branch="bds-update/${DATE_STAMP}-${SHORT_HASH}"
  git branch -D "$pr_branch" 2>/dev/null || true
  git checkout -b "$pr_branch" --quiet

  # Update submodule
  git submodule update --init --remote --quiet -- "$subpath" 2>/dev/null || {
    info "Falling back to manual submodule update..."
    (cd "$subpath" && git fetch origin main --quiet && git checkout --quiet "$LOCAL_HEAD")
  }
  git add "$subpath"

  if git diff --cached --quiet; then
    warn "$name submodule already at $LOCAL_HEAD — no change"
    git checkout "$orig_branch" --quiet
    git branch -D "$pr_branch" 2>/dev/null || true
    [ "$stashed" = true ] && git stash pop --quiet
    echo ""
    return
  fi

  git commit -m "chore(bds): update submodule — $new_commits commits" --quiet
  git push -u origin "$pr_branch" --quiet
  ok "Pushed $pr_branch"

  local pr_body
  pr_body=$(cat <<EOF
## BDS Update — $DATE_STAMP

Updates \`$subpath\` submodule to \`$SHORT_HASH\` (bds@$BDS_VERSION).

**$new_commits commits** since last sync:

$changelog

---

*Auto-generated by \`brik-bds/scripts/propagate.sh\`*
EOF
)

  local pr_url
  pr_url=$(gh pr create \
    --title "chore(bds): update submodule to bds@$BDS_VERSION" \
    --body "$pr_body" \
    --base "$base" \
    --head "$pr_branch")
  ok "PR: $pr_url"
  ANY_UPDATED=true

  # Restore
  git checkout "$orig_branch" --quiet
  [ "$stashed" = true ] && git stash pop --quiet
  echo ""
}

# ─── npm Track ────────────────────────────────────────────────────
propagate_npm() {
  local name="$1" path="$2" base="$3"

  echo -e "${BOLD}━━━ npm :: $name ━━━${NC}"

  if [ ! -d "$path/.git" ]; then
    warn "Consumer repo not found at $path — skipping"
    echo ""
    return
  fi

  if [ ! -f "$path/package.json" ]; then
    warn "No package.json in $path — skipping"
    echo ""
    return
  fi

  # Fetch origin so the next step reads a fresh ref, not a cached stale one.
  (cd "$path" && git fetch origin "$base" --quiet 2>/dev/null || true)

  # Read current consumer version from origin/<base_branch> — the branch we'll PR against.
  # Reading local package.json would show whatever's on the current checkout
  # (possibly a stale task branch), which gives a misleading dry-run.
  local base_pkg_json
  base_pkg_json=$(git -C "$path" show "origin/${base}:package.json" 2>/dev/null || echo "")
  if [ -z "$base_pkg_json" ]; then
    # Fallback: local package.json (and log the fallback)
    warn "Couldn't read package.json from origin/$base — using local copy"
    base_pkg_json=$(cat "$path/package.json")
  fi
  local current_version
  current_version=$(echo "$base_pkg_json" | jq -r ".dependencies[\"$BDS_PACKAGE_NAME\"] // .devDependencies[\"$BDS_PACKAGE_NAME\"] // empty" | sed 's/^[^0-9]*//')
  if [ -z "$current_version" ]; then
    warn "$name doesn't depend on $BDS_PACKAGE_NAME — skipping"
    echo ""
    return
  fi

  if [ "$current_version" = "$BDS_VERSION" ]; then
    ok "$name already at $BDS_VERSION"
    echo ""
    return
  fi

  info "$name: $current_version → $BDS_VERSION"
  echo -e "${DIM}─── Note ───${NC}"
  echo "  See brik-bds CHANGELOG.md or git log for details between tags"
  echo "  npm registry: https://github.com/brikdesigns/brik-bds/packages"
  echo -e "${DIM}────────────${NC}"

  if [ "$DRY_RUN" = true ]; then
    info "[dry-run] Would run npm update in $name and open PR against $base"
    echo ""
    return
  fi

  if [ "$AUTO" = false ]; then
    read -p "Update $name and open PR? (Y/n) " -n 1 -r
    echo
    [[ $REPLY =~ ^[Nn]$ ]] && { warn "Skipped $name"; echo ""; return; }
  fi

  # Stash + switch to base branch
  local stashed=false orig_branch
  cd "$path"
  orig_branch=$(git branch --show-current)
  if [ -n "$(git status --porcelain)" ]; then
    git stash -u --quiet -m "bds-propagate: auto-stash"
    stashed=true
  fi
  [ "$orig_branch" != "$base" ] && git checkout "$base" --quiet
  git pull --quiet

  local pr_branch="bds-update/${DATE_STAMP}-v${BDS_VERSION}"
  git branch -D "$pr_branch" 2>/dev/null || true
  git checkout -b "$pr_branch" --quiet

  # npm install the explicit new version
  info "Running npm install $BDS_PACKAGE_NAME@$BDS_VERSION..."
  if ! npm install --save "$BDS_PACKAGE_NAME@$BDS_VERSION" --silent 2>&1 | tail -5; then
    err "npm install failed in $name — check registry auth"
    git checkout "$orig_branch" --quiet
    [ "$stashed" = true ] && git stash pop --quiet
    echo ""
    return
  fi

  if git diff --quiet package.json package-lock.json; then
    warn "No changes after npm install — consumer may already satisfy the range"
    git checkout "$orig_branch" --quiet
    git branch -D "$pr_branch" 2>/dev/null || true
    [ "$stashed" = true ] && git stash pop --quiet
    echo ""
    return
  fi

  git add package.json package-lock.json
  git commit -m "chore(bds): bump $BDS_PACKAGE_NAME to $BDS_VERSION" --quiet
  git push -u origin "$pr_branch" --quiet
  ok "Pushed $pr_branch"

  local pr_body
  pr_body=$(cat <<EOF
## BDS Update — $DATE_STAMP

Bumps \`$BDS_PACKAGE_NAME\`: \`$current_version\` → \`$BDS_VERSION\`.

See [brik-bds](https://github.com/brikdesigns/brik-bds) for release details. CHANGELOG.md coming soon.

**Before merge:** run \`npm install\` locally and verify typecheck + build pass.

---

*Auto-generated by \`brik-bds/scripts/propagate.sh\`*
EOF
)

  local pr_url
  pr_url=$(gh pr create \
    --title "chore(bds): bump $BDS_PACKAGE_NAME to $BDS_VERSION" \
    --body "$pr_body" \
    --base "$base" \
    --head "$pr_branch")
  ok "PR: $pr_url"
  ANY_UPDATED=true

  # Restore
  git checkout "$orig_branch" --quiet
  [ "$stashed" = true ] && git stash pop --quiet
  echo ""
}

# ─── Main ─────────────────────────────────────────────────────────
for entry in "${SUBMODULE_CONSUMERS[@]}"; do
  IFS='|' read -r name path subpath base <<< "$entry"
  [ -n "$ONLY" ] && [ "$ONLY" != "$name" ] && continue
  propagate_submodule "$name" "$path" "$subpath" "$base"
done

for entry in "${NPM_CONSUMERS[@]}"; do
  IFS='|' read -r name path base <<< "$entry"
  [ -n "$ONLY" ] && [ "$ONLY" != "$name" ] && continue
  propagate_npm "$name" "$path" "$base"
done

# ─── Tag Release ──────────────────────────────────────────────────
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
  git tag -a "$TAG" -m "BDS release $TAG — propagated to consumers"
  git push origin "$TAG" --quiet
  ok "Tagged release: $TAG"
fi

echo ""
echo -e "${GREEN}${BOLD}Done!${NC}"
