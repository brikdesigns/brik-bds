#!/usr/bin/env bash
# pr-task.sh — Push the current BDS task branch and create a PR.
#
# Targets origin/main. Generates a summary from the commit log automatically.
#
# Usage:
#   ./scripts/pr-task.sh              # auto-generate title + body from commits
#   ./scripts/pr-task.sh "Custom PR title"   # override title
#
# Requirements:
#   - Must be on a task/* branch (not main).
#   - Branch must have commits ahead of main.
#   - gh CLI must be authenticated.

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

BASE_BRANCH="main"

# ── Parse flags ──
POSITIONAL_ARGS=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    --skip-story-check)
      SKIP_STORY_CHECK=1
      shift
      ;;
    -*)
      echo -e "${RED}Unknown flag: $1${NC}"
      exit 1
      ;;
    *)
      POSITIONAL_ARGS+=("$1")
      shift
      ;;
  esac
done
set -- "${POSITIONAL_ARGS[@]+"${POSITIONAL_ARGS[@]}"}"

# ── Validate branch ──
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [[ "$BRANCH" == "main" ]]; then
  echo -e "${RED}Error: Cannot create PR from 'main'. Switch to a task/* branch.${NC}"
  exit 1
fi

if [[ ! "$BRANCH" =~ ^task/ ]]; then
  echo -e "${YELLOW}Warning: Branch '$BRANCH' doesn't follow task/* naming convention.${NC}"
fi

# ── Check for commits ahead of base ──
# Existence guard only; --no-merges so a base-sync merge commit from a prior run
# can't masquerade as branch work. The displayed count is recomputed against the
# freshly-fetched origin baseline below (#1001).
COMMITS_AHEAD=$(git rev-list --count --no-merges "${BASE_BRANCH}..HEAD" 2>/dev/null || echo "0")
if [ "$COMMITS_AHEAD" -eq 0 ]; then
  echo -e "${RED}Error: No commits ahead of ${BASE_BRANCH}. Nothing to PR.${NC}"
  exit 1
fi

# ── Check for uncommitted changes ──
if [ -n "$(git status --porcelain)" ]; then
  echo -e "${RED}Error: Working tree is dirty. Commit changes before creating PR.${NC}"
  echo ""
  git status --short
  exit 1
fi

# ── Story-verification gate ──
# If the diff touches a React component (.tsx) or its CSS, confirm the
# agent verified the change in Storybook. BDS components without a
# corresponding story update are suspect — Storybook IS the test harness.
# Override with --skip-story-check for type-only or internal-lib changes.
if [[ "${SKIP_STORY_CHECK:-}" != "1" ]]; then
  git fetch origin "${BASE_BRANCH}" --quiet 2>/dev/null || true
  COMPONENT_TOUCHED=$(
    { git diff --name-only "origin/${BASE_BRANCH}...HEAD" 2>/dev/null || true; } \
      | grep -E '^components/.*\.(tsx|css)$' \
      | grep -vE '\.stories\.|\.test\.|\.spec\.|\.d\.ts$' \
      | head -5 || true
  )
  if [ -n "$COMPONENT_TOUCHED" ]; then
    echo ""
    echo -e "${YELLOW}⚠  This branch touches BDS component files:${NC}"
    echo "$COMPONENT_TOUCHED" | sed 's/^/    /'
    echo ""
    echo -e "${YELLOW}   Project rule: component changes must be verified in Storybook (npm run storybook)${NC}"
    echo -e "${YELLOW}   before opening a PR. Typecheck alone is not sufficient.${NC}"
    echo ""
    if [ -t 0 ]; then
      # Interactive TTY — confirm at the prompt (unchanged behavior).
      echo -n "   Verified in Storybook? [y/N] (or set SKIP_STORY_CHECK=1 for non-visual diffs): "
      read -r STORY_CONFIRM
      if [[ ! "$STORY_CONFIRM" =~ ^[Yy]$ ]]; then
        echo -e "${RED}✗ PR creation blocked. Verify the change in Storybook, then re-run.${NC}"
        exit 1
      fi
    elif [ "${STORY_VERIFIED:-}" = "1" ]; then
      # Non-interactive (agent / headless): the prompt can't be answered. Accept
      # an explicit assertion that the change was verified (e.g. via a headless
      # `npm run chromatic` — now possible, #1058) rather than silently
      # auto-confirming, which would rubber-stamp an unverified visual change.
      echo -e "${YELLOW}   → STORY_VERIFIED=1 — proceeding (non-interactive).${NC}"
    else
      # Non-interactive with no assertion → fail closed with an actionable path,
      # never a silent EOF-block or a hang on an input-less stdin (#1110).
      echo -e "${RED}✗ Component diff in a non-interactive session — the Storybook gate can't be answered here.${NC}"
      echo -e "${YELLOW}   Verify the change (headless: npm run chromatic), then re-run with STORY_VERIFIED=1.${NC}"
      echo -e "${YELLOW}   For a genuinely non-visual diff, use SKIP_STORY_CHECK=1 instead.${NC}"
      exit 1
    fi
  fi
fi

# ── Check if PR already exists ──
EXISTING_PR=$(gh pr list --head "$BRANCH" --json number --jq '.[0].number' 2>/dev/null || echo "")
if [ -n "$EXISTING_PR" ]; then
  PR_URL=$(gh pr view "$EXISTING_PR" --json url --jq '.url')
  echo -e "${GREEN}PR already exists: ${PR_URL}${NC}"
  exit 0
fi

# ── Sync with base (catches semantic conflicts from parallel work) ──
echo -e "${YELLOW}~ Fetching origin/${BASE_BRANCH}...${NC}"
git fetch origin "${BASE_BRANCH}" --quiet

BEHIND=$(git rev-list --count "HEAD..origin/${BASE_BRANCH}")
if [ "$BEHIND" -gt 0 ]; then
  echo -e "${YELLOW}~ Base moved ${BEHIND} commit(s) ahead — merging to detect semantic conflicts...${NC}"
  if ! git merge --no-edit "origin/${BASE_BRANCH}"; then
    echo ""
    echo -e "${RED}✗ Merge conflict with ${BASE_BRANCH}. Resolve manually, commit, re-run.${NC}"
    exit 1
  fi
  echo -e "${YELLOW}~ Re-running test suite against merged tree...${NC}"
  # Use vitest's exit code — stdout parsing was fragile (matched "passed" inside
  # summaries that also reported failures). --retry=2 absorbs Radix portal
  # timing jitter in Storybook interaction tests without hiding real breakage.
  if ! npm test -- --retry=2; then
    echo ""
    echo -e "${RED}✗ Tests failed after merging ${BASE_BRANCH}.${NC}"
    echo -e "${RED}  A parallel PR introduced an incompatible change. Fix locally, commit, re-run.${NC}"
    exit 1
  fi
fi

# ── Push if needed ──
UPSTREAM=$(git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null || echo "")
EXPECTED_UPSTREAM="origin/${BRANCH}"
if [ -z "$UPSTREAM" ] || [ "$UPSTREAM" != "$EXPECTED_UPSTREAM" ]; then
  echo -e "${YELLOW}~ Pushing branch to origin (setting upstream)...${NC}"
  git push -u origin "$BRANCH"
else
  LOCAL=$(git rev-parse HEAD)
  REMOTE=$(git rev-parse @{u} 2>/dev/null || echo "")
  if [ "$LOCAL" != "$REMOTE" ]; then
    echo -e "${YELLOW}~ Pushing new commits to origin...${NC}"
    git push
  fi
fi

# ── Build PR title ──
if [ $# -ge 1 ]; then
  PR_TITLE="$1"
else
  # Prefer the latest NON-MERGE commit subject — a conventional-commit line
  # (`fix(build): …`). `--no-merges` skips the `Merge origin/main …` commit a
  # base-sync creates, so an advanced base never turns the PR title into the
  # merge-commit subject or the branch slug (brik-bds#1018; same root cause as
  # the portal fix in brik-client-portal#1444).
  PR_TITLE=$(git log --no-merges --format=%s -1 "${BASE_BRANCH}..HEAD")
  if [ -z "$PR_TITLE" ]; then
    # Fallback: task/bds-button-variants → bds: button variants
    SCOPE=$(echo "$BRANCH" | sed 's|task/||' | cut -d'-' -f1)
    DESC=$(echo "$BRANCH" | sed 's|task/[a-z]*-||' | tr '-' ' ')
    PR_TITLE="${SCOPE}: ${DESC}"
  fi
fi

# ── Build PR body from commit log ──
# Baseline against origin/${BASE_BRANCH} (fetched above), not local ${BASE_BRANCH}:
# the sync step's `git merge origin/${BASE_BRANCH}` at :115 makes every commit that
# merge introduced reachable from HEAD but not from the lagging local ref, so a
# local-base log/count would list them all (plus the merge commit) as if they were
# this PR's work. --no-merges also drops the merge commit itself. See #1001.
COMMIT_LOG=$(git log --oneline --no-merges "origin/${BASE_BRANCH}..HEAD" --reverse)
COMMIT_BULLETS=$(echo "$COMMIT_LOG" | sed 's/^[a-f0-9]* /- /')
COMMITS_AHEAD=$(git rev-list --count --no-merges "origin/${BASE_BRANCH}..HEAD")

PR_BODY=$(cat <<EOF
## Summary
${COMMIT_BULLETS}

## Consumer sync plan
- [ ] Portal: \`npm update @brikdesigns/bds\` after merge + version publish
- [ ] renew-pms: submodule bump (until npm migration lands)
- [ ] brikdesigns: \`./scripts/bds-sync.sh\`

## Test plan
- [ ] Storybook: visual verification on affected stories
- [ ] \`npm test -- --run\` passes
- [ ] \`npm run lint-tokens\` passes
- [ ] Dark mode checked (if applicable)

## Knowledge capture
- [ ] Non-obvious decisions / learnings captured: \`brik-rag remember "<key insight>"\`

Generated with [Claude Code](https://claude.ai/code)
EOF
)

# ── Create PR ──
echo -e "${YELLOW}~ Creating PR targeting ${BASE_BRANCH}...${NC}"
# `set -e` does NOT abort on a failed command substitution inside an assignment,
# so guard explicitly — otherwise a `gh pr create` failure is swallowed and the
# success banner below prints with the error text as the "PR URL". See #808.
if ! PR_URL=$(gh pr create --base "${BASE_BRANCH}" --title "$PR_TITLE" --body "$PR_BODY" 2>&1); then
  echo ""
  echo -e "${RED}=========================================${NC}"
  echo -e "${RED}  PR creation failed${NC}"
  echo -e "${RED}=========================================${NC}"
  echo ""
  printf '%s\n' "$PR_URL" | sed 's/^/  /'
  echo ""
  echo -e "  ${YELLOW}Branch '${BRANCH}' was pushed${NC} — fix the error above, then re-run"
  echo "  ./scripts/pr-task.sh, or open the PR manually:"
  echo "    gh pr create --base ${BASE_BRANCH} --title \"<title>\""
  echo ""
  exit 1
fi

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  PR created${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "  $PR_URL"
echo ""
echo "  Branch:  $BRANCH → ${BASE_BRANCH}"
echo "  Commits: $COMMITS_AHEAD ahead of ${BASE_BRANCH}"
echo ""
echo -e "  ${YELLOW}Knowledge capture:${NC} did anything non-obvious come up?"
echo "    brik-rag remember \"<key insight from this task>\""
echo ""

# ── Worktree cleanup hint ──
WORKTREE_DIR=$(git rev-parse --show-toplevel)
if [[ "$WORKTREE_DIR" == *"worktrees"* ]]; then
  echo -e "  ${YELLOW}Cleanup (run after PR is merged):${NC}"
  echo "    rm -rf ${WORKTREE_DIR}"
  echo "    cd $(dirname "$WORKTREE_DIR")/../brik-bds && git worktree prune"
  echo ""
fi
