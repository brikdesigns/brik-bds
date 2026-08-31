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
#
# Freezing or retiring a consumer:
#   Add its name to FROZEN_CONSUMERS below with the reason. It is skipped with a
#   warning on every run — including an explicit --only — and the run still
#   exits 0. Remove the line to thaw a freeze; a retirement is permanent and
#   must not be removed to unblock a run.

set -euo pipefail

# shellcheck source=scripts/lib/mirror-widgets.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/mirror-widgets.sh"
# shellcheck source=scripts/lib/bump-pr-guard.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/bump-pr-guard.sh"
# shellcheck source=scripts/lib/release-tag-guard.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/release-tag-guard.sh"

# ─── Configuration ────────────────────────────────────────────────
BDS_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BDS_REMOTE="origin"
BDS_BRANCH="main"
BDS_PACKAGE_NAME="@brikdesigns/bds"

# Submodule consumers: name|path|subpath|base_branch|area_label
# area_label is applied to the opened PR — every consumer's require-area-label
# gate hard-fails a label-less PR, and gh pr create --label errors if the label
# is absent in the target repo, so the name must match that repo's own taxonomy
# (brik-llm uses area:ops; the npm consumers use area:infra).
SUBMODULE_CONSUMERS=(
  "brik-llm|/Users/nickstanerson/Documents/GitHub/brik/brik-llm|foundations/brik-bds|main|area:ops"
)

# npm consumers: name|path|base_branch|area_label
# brikdesigns migrated submodule → npm (@brikdesigns/bds in package.json; no
# .gitmodules). It is pre-launch, so PRs target staging.
NPM_CONSUMERS=(
  "brik-client-portal|/Users/nickstanerson/Documents/GitHub/product/brik-client-portal|staging|area:infra"
  "renew-pms|/Users/nickstanerson/Documents/GitHub/product/renew-pms|staging|area:infra"
  "brikdesigns|/Users/nickstanerson/Documents/GitHub/brik/brikdesigns|staging|area:infra"
)

# Frozen consumers: name|reason
# A code-frozen repo accepts NO writes — no commits, PRs, merges, dependency
# bumps, or migrations — until the freeze is lifted. That rule lives in the
# cross-repo CLAUDE.md, which only humans and agent sessions read; this list is
# how the unattended 09:00 run learns it. Without it, renew-pms took 14 merged
# bump PRs (#429–#444) between its freeze date and 2026-07-29 while every
# interactive session was correctly refusing the same work. brik-bds#1526.
#
# Leave the consumer in its track above and add it here — deleting its row
# instead loses the path + base branch and the reason it stopped.
#
# Freeze vs retirement — the difference matters to whoever reads this next:
#   - A freeze is temporary. Remove the one line here to thaw it.
#   - A retirement is permanent. The canonical list is
#     brik-llm/operations/retired-repos.txt, CI-asserted by
#     brik-llm/operations/hooks/test/test-retired-repos.sh. Never remove a
#     retired entry to unblock a run — the repo is dead and archived on GitHub,
#     so the push would fail anyway.
FROZEN_CONSUMERS=(
  "renew-pms|RETIRED 2026-07-29 (frozen since 2026-07-05) — dead and unsupported, permanently; not a liftable freeze. See brik-llm/operations/retired-repos.txt"
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

# Echoes the freeze reason and returns 0 when $1 is in FROZEN_CONSUMERS.
# Kept to bash-3.2 constructs (no associative arrays) — the launchd plist runs
# this under /bin/bash, which is 3.2 on macOS.
frozen_reason() {
  local candidate="$1" entry name reason
  for entry in "${FROZEN_CONSUMERS[@]}"; do
    IFS='|' read -r name reason <<< "$entry"
    [ "$name" = "$candidate" ] && { echo "$reason"; return 0; }
  done
  return 1
}

# ─── Headless-aware git ───────────────────────────────────────────
# Signing is enforced globally on the operator's machines (commit.gpgsign=true,
# gpg.format=ssh, key = the 1Password-held ed25519). On the headless mini
# (brik-mini) the 1Password *desktop* SSH agent is unavailable, so any git op
# that signs (commit, annotated tag) or rides SSH transport (pull/push/fetch to
# an SSH-canonical remote such as brik-llm) dies — this was bds-propagate's
# exit 128. git-sign-headless loads the signing key from 1Password into a
# private, ephemeral ssh-agent (key never on disk) and runs one git command
# against it. It is a safe passthrough for HTTPS remotes too (the gh credential
# helper still handles HTTPS auth; the SSH command + signing config go unused).
#
# Route ONLY remote-touching + signing ops through it (commit, tag -a, pull,
# push, fetch, submodule update). Local ops (checkout/add/status/branch/…) stay
# on plain git so we don't spawn an agent for nothing. Off the mini, the desktop
# agent works — call git directly.
# Lists a consumer's OPEN PRs as `<headRefName><TAB><url>` — the input shape
# existing_bump_pr (scripts/lib/bump-pr-guard.sh) reads. Run from the consumer
# checkout so gh resolves the repo from that repo's own remote.
open_prs_of() {
  local path="$1"
  (cd "$path" && gh pr list --state open --limit 100 \
     --json headRefName,url --jq '.[] | "\(.headRefName)\t\(.url)"')
}

GIT_SIGN_HEADLESS="/Users/nickstanerson/Documents/GitHub/brik/brik-llm/operations/security/bin/git-sign-headless"
git_signed() {
  if [ "$(hostname -s 2>/dev/null)" = "brik-mini" ] && [ -x "$GIT_SIGN_HEADLESS" ]; then
    "$GIT_SIGN_HEADLESS" -- "$@"
  else
    git "$@"
  fi
}

# ─── npm registry auth (GitHub Packages) ──────────────────────────
# The consumer .npmrc files authenticate to npm.pkg.github.com via
# ${PACKAGES_READ_TOKEN}. Interactive shells get it from the profile; the
# launchd context that runs this agent starts from a bare env (PATH + HOME
# only), so npm install fails E401 Unauthorized and the npm track is silently
# skipped. Self-source the same env file the shell uses (the established
# entrypoint pattern — cf. the notion wrapper sourcing notion.env). No value is
# ever echoed; npm reads it from the exported env.
PACKAGES_ENV="$HOME/.secrets/brik-packages.env"
if [ -z "${PACKAGES_READ_TOKEN:-}" ] && [ -f "$PACKAGES_ENV" ]; then
  set -a
  # shellcheck disable=SC1090
  source "$PACKAGES_ENV"
  set +a
fi

# Tracks whether any consumer failed in a way the daily digest should surface.
# We finish every consumer + tag the release, then exit non-zero at the end so
# launchd's exit-code check (morning-check launch_agents) flags it instead of
# the failure being swallowed by a warn-and-return.
DEGRADED=false

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

# node powers the closing-keyword neutralizer the submodule track pipes its
# changelog through (see scripts/lib/neutralize-closing-keywords.mjs). Without
# it, a pasted `closes #N` would auto-close the wrong consumer issue on merge
# (brik-llm#1240 / the #729 collision) — so fail loud rather than ship a raw
# changelog. The npm track already needs node for `npm install`.
if ! command -v node &>/dev/null; then
  err "node not found — required to neutralize closing-keywords in PR bodies (brik-llm#1240)."
  exit 1
fi

# Headless signing path must be live before we mutate anything (real run only).
# Fails loud + early here instead of mid-propagation with a half-opened PR.
if [ "$(hostname -s 2>/dev/null)" = "brik-mini" ] && [ "$DRY_RUN" = false ]; then
  if [ ! -x "$GIT_SIGN_HEADLESS" ]; then
    err "git-sign-headless not found/executable at $GIT_SIGN_HEADLESS (headless signing required on the mini)"
    exit 1
  fi
  if ! "$GIT_SIGN_HEADLESS" --check &>/dev/null; then
    err "git-sign-headless probe failed — cannot sign headless. Check op SA token + key access."
    exit 1
  fi
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

git_signed fetch "$BDS_REMOTE" "$BDS_BRANCH" --quiet

# The version + commit we propagate are sourced from origin/<branch>, NOT the
# local working tree. The launchd agent that runs this (com.brikdesigns.bds-
# propagate) never pulls brik-bds first, so a stale local checkout would read an
# OLD package.json version and open *downgrade* PRs at every consumer — exactly
# the 0.96.0 → 0.93.2 regression that landed on brikdesigns 2026-06-13/14.
# Reading from origin/<branch> here (symmetric with how the npm track reads each
# consumer's current version from origin/<base>) makes a stale local checkout
# harmless. The per-consumer downgrade guard below is the second line of defence.
LOCAL_HEAD=$(git rev-parse "$BDS_REMOTE/$BDS_BRANCH")
BDS_VERSION=$(git show "$BDS_REMOTE/$BDS_BRANCH:package.json" | jq -r '.version')
if [ -z "$BDS_VERSION" ] || [ "$BDS_VERSION" = "null" ]; then
  err "Could not read .version from $BDS_REMOTE/$BDS_BRANCH:package.json"
  exit 1
fi
if [ "$(git rev-parse HEAD)" != "$LOCAL_HEAD" ]; then
  warn "Local checkout ($(git rev-parse --short HEAD)) differs from $BDS_REMOTE/$BDS_BRANCH ($(echo "$LOCAL_HEAD" | cut -c1-7)) — propagating origin's bds@$BDS_VERSION, not the local copy."
fi

ok "Preflight passed — bds@$BDS_VERSION at $(echo "$LOCAL_HEAD" | cut -c1-7) (source: $BDS_REMOTE/$BDS_BRANCH)"
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
  local name="$1" path="$2" subpath="$3" base="$4" area_label="$5"

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
  new_commits=$(git -C "$BDS_DIR" log --oneline "${current_sha}..${LOCAL_HEAD}" 2>/dev/null | wc -l | tr -d ' ')

  if [ "$new_commits" -eq 0 ]; then
    ok "$name already at $(echo "$current_sha" | cut -c1-7) — no update needed"
    echo ""
    return
  fi

  # An unmerged PR from a previous run leaves origin/<base> untouched, so the
  # commits-behind count above still says "behind" — and the date-stamped branch
  # name means nothing collides. Without this the next day's run opens a second
  # PR for the same SHA (#1918). Not a DEGRADED condition: skipping is correct.
  local open_pr
  if open_pr=$(existing_bump_pr "-$SHORT_HASH" open_prs_of "$path"); then
    ok "$name already has an open PR for $SHORT_HASH — $open_pr"
    echo ""
    return
  fi

  info "$name is $new_commits commits behind"
  # Neutralize closing-keywords BEFORE the changelog is shown or embedded: the
  # BDS commit subjects carry `closes #N` for BDS issues, but pasted into the
  # consumer PR body GitHub resolves them against the consumer's tracker and
  # auto-closes the wrong issue on merge (brik-llm#1240 / the #729 collision).
  # pipefail (set -euo) aborts the run if node fails — never ship a raw body.
  local changelog
  changelog=$(generate_changelog "$current_sha" "$LOCAL_HEAD" \
    | node "$BDS_DIR/scripts/lib/neutralize-closing-keywords.mjs")
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

  local pr_branch="bds-update/${DATE_STAMP}-${SHORT_HASH}"
  local worktree_path="${path}-worktrees/bds-propagate-${DATE_STAMP}-${SHORT_HASH}"

  # Fetch latest base so the worktree branches from a fresh ref
  git_signed -C "$path" fetch origin "$base" --quiet 2>/dev/null || \
    warn "$name: could not fetch origin/$base — worktree will branch from local ref"

  # Clean up any leftover worktree/branch from a previous failed run
  git -C "$path" worktree remove --force "$worktree_path" 2>/dev/null || true
  git -C "$path" branch -D "$pr_branch" 2>/dev/null || true

  # Create an isolated worktree from origin/$base — primary checkout is never touched
  git -C "$path" worktree add "$worktree_path" -b "$pr_branch" "origin/${base}"
  info "Worktree: $worktree_path"
  cd "$worktree_path"

  # Update submodule
  git_signed submodule update --init --remote --quiet -- "$subpath" 2>/dev/null || {
    info "Falling back to manual submodule update..."
    (cd "$subpath" && git_signed fetch origin main --quiet && git checkout --quiet "$LOCAL_HEAD")
  }
  git add "$subpath"

  if git diff --cached --quiet; then
    warn "$name submodule already at $LOCAL_HEAD — no change"
    cd "$BDS_DIR"
    git -C "$path" worktree remove --force "$worktree_path"
    git -C "$path" branch -D "$pr_branch" 2>/dev/null || true
    echo ""
    return
  fi

  git_signed commit -m "chore(bds): update submodule — $new_commits commits" --quiet
  git_signed push -u origin "$pr_branch" --quiet
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
    --head "$pr_branch" \
    --label "$area_label")
  ok "PR: $pr_url"
  ANY_UPDATED=true

  # Remove worktree + local branch — PR is on the remote; local ref no longer needed
  cd "$BDS_DIR"
  git -C "$path" worktree remove --force "$worktree_path"
  git -C "$path" branch -D "$pr_branch" 2>/dev/null || true
  echo ""
}

# ─── npm Track ────────────────────────────────────────────────────
propagate_npm() {
  local name="$1" path="$2" base="$3" area_label="$4"

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
  (cd "$path" && git_signed fetch origin "$base" --quiet 2>/dev/null || true)

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

  # Downgrade guard — second line of defence behind the origin-sourced version
  # above. Refuse to propagate a version OLDER than the consumer already pins.
  # `npm install bds@<older>` silently downgrades a working consumer, which the
  # consumer's token gate / lint pass but `next build` does not — the failure
  # mode behind brikdesigns #475/#476 (0.96.0 → 0.93.2). DEGRADED forces a
  # non-zero exit so the daily digest surfaces it instead of swallowing it.
  local newest
  newest=$(printf '%s\n%s\n' "$current_version" "$BDS_VERSION" | sort -V | tail -n1)
  if [ "$BDS_VERSION" != "$newest" ]; then
    err "$name: refusing to propagate bds@$BDS_VERSION — it is OLDER than the consumer's current $current_version (downgrade)."
    err "  This usually means the brik-bds checkout was stale at run time. The version is now sourced from $BDS_REMOTE/$BDS_BRANCH; re-run once the intended release is on origin."
    DEGRADED=true
    echo ""
    return
  fi

  # Same hole as the submodule track: an unmerged bump PR does not move
  # origin/<base>, so the version check above still says "behind" tomorrow, and
  # the date-stamped branch name collides with nothing. brikdesigns #981/#982
  # (v0.165.0) and #475/#476 (v0.93.2) are the duplicates this closes (#1918).
  local open_pr
  if open_pr=$(existing_bump_pr "-v$BDS_VERSION" open_prs_of "$path"); then
    ok "$name already has an open PR for $BDS_VERSION — $open_pr"
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

  local pr_branch="bds-update/${DATE_STAMP}-v${BDS_VERSION}"
  local worktree_path="${path}-worktrees/bds-propagate-${DATE_STAMP}-v${BDS_VERSION}"

  # Clean up any leftover worktree/branch from a previous failed run
  git -C "$path" worktree remove --force "$worktree_path" 2>/dev/null || true
  git -C "$path" branch -D "$pr_branch" 2>/dev/null || true

  # Create an isolated worktree from origin/$base — primary checkout is never touched
  git -C "$path" worktree add "$worktree_path" -b "$pr_branch" "origin/${base}"
  info "Worktree: $worktree_path"
  cd "$worktree_path"

  # npm install the explicit new version
  info "Running npm install $BDS_PACKAGE_NAME@$BDS_VERSION..."
  if ! npm install --save "$BDS_PACKAGE_NAME@$BDS_VERSION" --silent 2>&1 | tail -5; then
    err "npm install failed in $name — check registry auth (PACKAGES_READ_TOKEN)"
    err "Worktree left for diagnosis: $worktree_path"
    DEGRADED=true
    cd "$BDS_DIR"
    echo ""
    return
  fi

  if git diff --quiet package.json package-lock.json; then
    warn "No changes after npm install — consumer may already satisfy the range"
    cd "$BDS_DIR"
    git -C "$path" worktree remove --force "$worktree_path"
    git -C "$path" branch -D "$pr_branch" 2>/dev/null || true
    echo ""
    return
  fi

  # Re-sync mirrored widgets in the SAME commit as the bump (#1587) — without
  # this the portal's #1583 parity gate fails the PR propagate just opened.
  # See scripts/lib/mirror-widgets.sh for why the source is node_modules.
  local synced
  synced=$(sync_mirrored_widgets "$worktree_path" "$BDS_PACKAGE_NAME" \
             "$BDS_DIR/scripts/sync-devbar-widgets.sh" --list-portal-mirror)
  if [ -n "$synced" ]; then
    echo "$synced" | while IFS= read -r f; do git add "$f"; done
    info "Re-synced $(echo "$synced" | wc -l | tr -d ' ') mirrored widget(s) from the installed package"
  fi

  git add package.json package-lock.json
  git_signed commit -m "chore(bds): bump $BDS_PACKAGE_NAME to $BDS_VERSION" --quiet
  git_signed push -u origin "$pr_branch" --quiet
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
    --head "$pr_branch" \
    --label "$area_label")
  ok "PR: $pr_url"
  ANY_UPDATED=true

  # Remove worktree + local branch — PR is on the remote; local ref no longer needed
  cd "$BDS_DIR"
  git -C "$path" worktree remove --force "$worktree_path"
  git -C "$path" branch -D "$pr_branch" 2>/dev/null || true
  echo ""
}

# ─── Main ─────────────────────────────────────────────────────────
# A freeze skip is a correct outcome, not a failure: it must not set DEGRADED,
# so the run still exits 0 and the daily digest keeps meaning "something broke".
# It also outranks --only — naming a frozen consumer explicitly does not thaw it.
for entry in "${SUBMODULE_CONSUMERS[@]}"; do
  IFS='|' read -r name path subpath base area_label <<< "$entry"
  [ -n "$ONLY" ] && [ "$ONLY" != "$name" ] && continue
  if reason=$(frozen_reason "$name"); then
    warn "$name skipped — $reason"
    echo ""
    continue
  fi
  propagate_submodule "$name" "$path" "$subpath" "$base" "$area_label"
done

for entry in "${NPM_CONSUMERS[@]}"; do
  IFS='|' read -r name path base area_label <<< "$entry"
  [ -n "$ONLY" ] && [ "$ONLY" != "$name" ] && continue
  if reason=$(frozen_reason "$name"); then
    warn "$name skipped — $reason"
    echo ""
    continue
  fi
  propagate_npm "$name" "$path" "$base" "$area_label"
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

  # Tag $LOCAL_HEAD (= $BDS_REMOTE/$BDS_BRANCH), never implicit HEAD. This was the
  # ONE step that still read the local checkout, against the preflight's whole
  # design — the version, the commit, and every consumer bump come from
  # origin/<branch> precisely because this agent never pulls brik-bds first
  # (see the LOCAL_HEAD comment above). On 2026-08-31 the local checkout was two
  # days stale, so `git tag -a` with no commit-ish named f491e78d — an ANCESTOR of
  # the previous tag bds-2026-08-30.1, and the exact commit already carrying
  # bds-2026-08-30. The tag was a duplicate under a new name. brik-llm#2948.
  #
  # Only the missing `workflows` permission on the App token stopped it landing.
  if ! release_tag_target_advances "$LOCAL_HEAD"; then
    err "Refusing to tag $TAG at $(echo "$LOCAL_HEAD" | cut -c1-7) — it is at or behind $(newest_release_tag)."
    err "$BDS_REMOTE/$BDS_BRANCH has not moved past the newest release tag; the consumers were bumped but nothing new was released."
    exit 1
  fi

  git_signed tag -a "$TAG" "$LOCAL_HEAD" -m "BDS release $TAG — propagated to consumers"
  git_signed push origin "$TAG" --quiet
  ok "Tagged release: $TAG at $(echo "$LOCAL_HEAD" | cut -c1-7)"
fi

echo ""
if [ "$DEGRADED" = true ]; then
  err "Completed with degraded consumers (see 'npm install failed' above) — exiting non-zero so the daily digest surfaces it."
  exit 1
fi
echo -e "${GREEN}${BOLD}Done!${NC}"
