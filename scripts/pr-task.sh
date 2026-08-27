#!/usr/bin/env bash
# pr-task.sh — Push the current BDS task branch and create a PR.
#
# Targets origin/main. Generates a summary from the commit log automatically.
#
# Usage:
#   ./scripts/pr-task.sh              # auto-generate title + body from commits
#   ./scripts/pr-task.sh "Custom PR title"   # override title
#   ./scripts/pr-task.sh --no-issue "<reason>"  # feat/fix with no tracked issue
#   ./scripts/pr-task.sh --area area:tooling    # set the area:* label explicitly
#
# Labels: GitHub does NOT copy a linked issue's labels onto its PR, so this
# script inherits the area:* / size:* / theme:* labels of every issue the commit
# range references, plus a Type label from the conventional-commit prefix. The
# pr-label-gate CI check requires at least one area:*, so the script refuses to
# open a PR without one — pass --area, or label the linked issue (#1979).
#
# Issue link: the issue numbers resolved from the commit range are written into
# the PR body as `Closes #N` / `Refs #N` lines. GitHub parses closing keywords
# from the PR BODY only, never from commit messages, so a `(#N)` in a commit
# subject leaves `closingIssuesReferences` empty and the board loses the work —
# 16 of the last 21 merged feat/fix PRs in this repo landed that way (#1882).
# The pr-issue-link-gate CI check hard-fails any feat/fix PR whose body has no
# reference, so this script refuses to open one — add `Closes #N` to a commit
# body, or take the documented hatch with --no-issue "<reason>".
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

# Same-path open-PR check. The ticket-keyed gate in new-task.sh (#1533) cannot
# see two DIFFERENT tickets editing one file — #1528 and #1529 both rewrote
# scripts/propagate.sh, 54 minutes apart. brik-bds#1545 / brik-llm#1485.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/lib/pr-path-overlap.sh
source "${SCRIPT_DIR}/lib/pr-path-overlap.sh"
# shellcheck source=scripts/lib/issue-links.sh
source "${SCRIPT_DIR}/lib/issue-links.sh"
# shellcheck source=scripts/lib/pr-labels.sh
source "${SCRIPT_DIR}/lib/pr-labels.sh"

# ── Parse flags ──
NO_ISSUE_REASON=""
AREA_OVERRIDE=""
POSITIONAL_ARGS=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    --skip-story-check)
      SKIP_STORY_CHECK=1
      shift
      ;;
    --area)
      # Set the area:* label explicitly, for work whose linked issue carries
      # none (or for --no-issue work). Accepts "area:tooling" or bare "tooling".
      AREA_OVERRIDE="$2"
      [[ "$AREA_OVERRIDE" == area:* ]] || AREA_OVERRIDE="area:${AREA_OVERRIDE}"
      shift 2
      ;;
    --no-issue)
      # Escape hatch for genuinely issue-less feat/fix work. Mirrors the
      # repro:none pair: label + reason, both required, neither hidden.
      NO_ISSUE_REASON="$2"
      shift 2
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
      # an explicit assertion that the story was rendered and its assertions run
      # (#1058) rather than silently auto-confirming, which would rubber-stamp an
      # unverified visual change. Pixels are NOT what this flag attests to —
      # visual.yml is the pixel gate, and it runs after the PR opens.
      echo -e "${YELLOW}   → STORY_VERIFIED=1 — proceeding (non-interactive); visual.yml gates pixels on the PR.${NC}"
    else
      # Non-interactive with no assertion → fail closed with an actionable path,
      # never a silent EOF-block or a hang on an input-less stdin (#1110).
      #
      # Deliberately NOT `npm run chromatic`: ADR-026 scoped Chromatic to
      # publishing, and a spent snapshot quota still exits 0 having captured
      # nothing (#1967) — naming it here handed agents a green signal backed by
      # zero coverage. There is also no local pixel check to offer instead:
      # every baseline is `*-chromium-linux.png`, so a darwin run writes new
      # files rather than comparing (tests/visual/README.md).
      echo -e "${RED}✗ Component diff in a non-interactive session — the Storybook gate can't be answered here.${NC}"
      echo -e "${YELLOW}   Run the story's own assertions, then re-run with STORY_VERIFIED=1:${NC}"
      echo -e "${YELLOW}     npx vitest run --project storybook <path/to/Component.stories.tsx>${NC}"
      echo -e "${YELLOW}   Pixels are gated post-PR by visual.yml (VISUAL_GATE=1), not by this flag and not by Chromatic (#1967).${NC}"
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

# ── Fetch base (every range below is origin/BASE..HEAD) ──
echo -e "${YELLOW}~ Fetching origin/${BASE_BRANCH}...${NC}"
git fetch origin "${BASE_BRANCH}" --quiet

# ── Build PR title ──
# Resolved here, BEFORE the base-sync merge and the push, because the
# issue-link gate below is scoped on it. Prefer the latest NON-MERGE commit
# subject — a conventional-commit line (`fix(build): …`). `--no-merges` skips
# the `Merge origin/main …` commit a base-sync from a PRIOR run created, so an
# advanced base never turns the PR title into the merge-commit subject or the
# branch slug (brik-bds#1018; same root cause as the portal fix in
# brik-client-portal#1444).
if [ $# -ge 1 ]; then
  PR_TITLE="$1"
else
  PR_TITLE=$(git log --no-merges --format=%s -1 "${BASE_BRANCH}..HEAD")
  if [ -z "$PR_TITLE" ]; then
    # Fallback: task/bds-button-variants → bds: button variants
    SCOPE=$(echo "$BRANCH" | sed 's|task/||' | cut -d'-' -f1)
    DESC=$(echo "$BRANCH" | sed 's|task/[a-z]*-||' | tr '-' ' ')
    PR_TITLE="${SCOPE}: ${DESC}"
  fi
fi

# ── Resolve the issues this PR is for ──
# Polarity rules, the closing-keyword grammar and the portable word boundary all
# live in lib/issue-links.sh, where scripts/__tests__/test-issue-links.sh can
# exercise them without a repo or a network.
#
# --no-issue: the documented hatch. Both halves — the `Issue-exempt:` line this
# adds to the body and the `issue:none` label applied after the PR is created —
# are required by pr-issue-link-gate; a label with no reason is a silent waiver,
# a reason with no label is invisible on the board.
if [ -n "$NO_ISSUE_REASON" ] && ! issue_exempt_reason_ok "$NO_ISSUE_REASON"; then
  echo -e "${RED}✗ --no-issue reason is ${#NO_ISSUE_REASON} chars; pr-issue-link-gate needs >= ${ISSUE_LINK_MIN_REASON_CHARS}.${NC}"
  echo -e "${RED}  Say what the work is and why no issue tracks it.${NC}"
  exit 1
fi
ISSUE_LINKS=$(resolve_issue_links "origin/${BASE_BRANCH}..HEAD" "$NO_ISSUE_REASON")

# Gate: never open a feat/fix PR that pr-issue-link-gate will immediately fail.
# Runs BEFORE the base-sync merge and the push, deliberately — two reasons, both
# learned in brik-client-portal#3105:
#
#   1. A gate that fires after the push leaves the branch on the remote, so its
#      own advice ("amend, then re-run") would need a non-fast-forward push to
#      follow — which the git rules disallow. Gate first, and a failure leaves
#      origin untouched.
#   2. The merge below makes HEAD a merge commit. `git commit --amend` then
#      rewrites the MERGE commit's message, not the work commit's, silently
#      producing a merge commit wearing a `feat(...)` subject. Gating first
#      makes that state unreachable.
#
# Only feat/fix are in the gate's scope, so a chore/docs/ci branch with no issue
# refs opens normally.
if issue_link_required "$PR_TITLE" && [ -z "$ISSUE_LINKS" ]; then
  echo -e "${RED}✗ No issue reference could be resolved for this feat/fix PR.${NC}"
  echo -e "${RED}  The pr-issue-link-gate CI check requires one in the PR body. Either:${NC}"
  echo -e "${RED}    - add \`Closes #N\` to the commit body, then re-run:${NC}"
  echo -e "${RED}        git commit --amend        (HEAD is $(git log --format=%h -1) \"$(git log --format=%s -1 | cut -c1-40)\")${NC}"
  echo -e "${RED}    - reference the issue as #N in a commit subject, then re-run, or${NC}"
  echo -e "${RED}    - re-run with --no-issue \"<reason, >= ${ISSUE_LINK_MIN_REASON_CHARS} chars>\" if no issue tracks this work.${NC}"
  echo -e "${YELLOW}  Nothing has been pushed — the merge and push run after this gate.${NC}"
  exit 1
fi

# ── Resolve project-tracking labels (before pushing anything) ──
# GitHub does NOT copy a linked issue's labels onto its PR, so PRs opened by this
# script were born label-less and needed a manual `gh pr edit` to reach parity —
# three in a row (#1969, #1974, #1978) before #1979 filed it. Resolve up front:
#   - a Type label from the conventional-commit prefix, IF this repo has one
#   - the area:* / size:* / theme:* labels of every issue this PR references
#   - an explicit --area override
#
# The resolution policy lives in lib/pr-labels.sh (pure, offline, tested by
# scripts/__tests__/test-pr-labels.sh). This block only supplies it with live
# data — the repo's label list and each referenced issue's labels.
#
# One deliberate divergence from the portal: `lib/issue-links.sh` resolves bare
# `#N` only (`issue_refs_in_subjects` strips to digits), so there is no
# cross-repo `owner/repo#N` form to split here. If that lib ever grows one, port
# the portal's split too or cross-repo refs will silently inherit nothing.
LABELS_TO_ADD=()

# Fetched once, then grepped as a VARIABLE — never `gh … | grep -q`; see the
# pipefail/SIGPIPE note in lib/pr-labels.sh. Resolved before every branch below
# because each existence-checks against it and `set -u` aborts if it is unset.
REPO_LABELS=$(gh label list --limit 200 --json name --jq '.[].name')

TYPE_LABEL=$(type_label_for_title "$PR_TITLE")
if [ -n "$TYPE_LABEL" ] && label_known "$TYPE_LABEL" "$REPO_LABELS"; then
  LABELS_TO_ADD+=("$TYPE_LABEL")
fi

# The --no-issue hatch's label half, folded in here so it lands in the same
# `gh pr edit` as everything else (it used to be its own call after create).
if [ -n "$NO_ISSUE_REASON" ]; then
  LABELS_TO_ADD+=("issue:none")
fi

if [ -n "$AREA_OVERRIDE" ]; then
  # Fail fast on a typo'd override. Otherwise it satisfies the area gate below
  # but `gh pr edit` silently drops it (the label does not exist), which
  # reintroduces the label-less PR this guard exists to prevent.
  if ! label_known "$AREA_OVERRIDE" "$REPO_LABELS"; then
    echo -e "${RED}✗ --area '${AREA_OVERRIDE}' is not an existing label in this repo.${NC}"
    echo -e "${RED}  Valid area labels:${NC}"
    grep '^area:' <<< "$REPO_LABELS" | sed 's/^/    /'
    exit 1
  fi
  LABELS_TO_ADD+=("$AREA_OVERRIDE")
fi

# Inherit from the issues this PR is for, read off the rendered $ISSUE_LINKS
# block so the labels and the linkage can never disagree.
for ref_num in $(refs_from_issue_links "$ISSUE_LINKS"); do
  ISSUE_LABELS=$(gh issue view "$ref_num" --json labels --jq '.labels[].name' 2>/dev/null || true)
  for l in $(inheritable_labels "$ISSUE_LABELS"); do
    if label_known "$l" "$REPO_LABELS"; then
      LABELS_TO_ADD+=("$l")
    else
      echo -e "${YELLOW}⚠  #${ref_num} carries '${l}', which does not exist in this repo — skipped.${NC}" >&2
    fi
  done
done

# Gate: never open a PR that pr-label-gate will immediately fail.
if ! has_area_label "$(printf '%s\n' "${LABELS_TO_ADD[@]+"${LABELS_TO_ADD[@]}"}")"; then
  echo -e "${RED}✗ No area:* label could be resolved for this PR.${NC}"
  echo -e "${RED}  The pr-label-gate CI check requires one. Either:${NC}"
  echo -e "${RED}    - re-run with --area area:<x>   (e.g. --area area:tooling), or${NC}"
  echo -e "${RED}    - add an area:* label to the linked issue, then re-run.${NC}"
  echo -e "${YELLOW}  Valid area labels:${NC}"
  grep '^area:' <<< "$REPO_LABELS" | sed 's/^/    /'
  echo -e "${YELLOW}  Nothing has been pushed — the merge and push run after this gate.${NC}"
  exit 1
fi

# ── Sync with base (catches semantic conflicts from parallel work) ──
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

# ── Same-path open-PR check ──
# Runs AFTER the base-sync above so the diff is measured against the base this
# PR will actually target, and BEFORE the push so the collision is visible while
# nothing has been published yet. Warns and returns 0 — two sessions on one file
# is often legitimate, and the cost this removes is finding out at merge time.
check_pr_path_overlap "$BASE_BRANCH" "$BRANCH"

# ── Push if needed ──
# SC1083: `@{u}` is git's upstream shorthand, not a brace expansion. Annotated
# rather than rewritten because issue-link-resolver-check.yml shellchecks this
# file at --severity=warning (#1882).
# shellcheck disable=SC1083
UPSTREAM=$(git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null || echo "")
EXPECTED_UPSTREAM="origin/${BRANCH}"
if [ -z "$UPSTREAM" ] || [ "$UPSTREAM" != "$EXPECTED_UPSTREAM" ]; then
  echo -e "${YELLOW}~ Pushing branch to origin (setting upstream)...${NC}"
  git push -u origin "$BRANCH"
else
  LOCAL=$(git rev-parse HEAD)
  # shellcheck disable=SC1083  # `@{u}` is git's upstream shorthand
  REMOTE=$(git rev-parse @{u} 2>/dev/null || echo "")
  if [ "$LOCAL" != "$REMOTE" ]; then
    echo -e "${YELLOW}~ Pushing new commits to origin...${NC}"
    git push
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
- [ ] brikdesigns: \`npm update @brikdesigns/bds\` after merge + version publish
- [ ] brik-llm: submodule pointer bump

## Test plan
- [ ] Storybook: visual verification on affected stories
- [ ] \`npm test -- --run\` passes
- [ ] \`npm run lint-tokens\` passes
- [ ] Dark mode checked (if applicable)

## Knowledge capture
- [ ] Non-obvious decisions / learnings captured: \`brik-rag remember "<key insight>"\`

${ISSUE_LINKS}
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

# ── Apply the resolved labels ──
# One `gh pr edit` for everything resolved above: the inherited area:* / size:* /
# theme:*, the Type label, and `issue:none` when the hatch was taken. Both gates
# that read labels re-run on `labeled`, so the PR flips green as they arrive.
#
# A failure here is LOUD, not a warning. Two gates depend on this call:
# pr-label-gate needs the area:* (guaranteed present by the gate above), and
# pr-issue-link-gate needs `issue:none` whenever the body claims an exemption —
# a body claiming a waiver the gate rejects is worse than no waiver at all.
PR_NUMBER=$(gh pr view "$BRANCH" --json number --jq '.number' 2>/dev/null || echo "")
if [ -n "$PR_NUMBER" ]; then
  UNIQUE=$(dedupe_labels "$(printf '%s\n' "${LABELS_TO_ADD[@]+"${LABELS_TO_ADD[@]}"}")")
  ADD_ARGS=()
  while IFS= read -r l; do
    [ -z "$l" ] && continue
    ADD_ARGS+=(--add-label "$l")
  done <<< "$UNIQUE"
  if [ ${#ADD_ARGS[@]} -gt 0 ] && gh pr edit "$PR_NUMBER" "${ADD_ARGS[@]}" >/dev/null 2>&1; then
    echo -e "${GREEN}~ Labels applied:${NC} $(echo "$UNIQUE" | tr '\n' ' ')"
  else
    echo -e "${RED}⚠ Could not apply labels — pr-label-gate will fail (and if --no-issue${NC}"
    echo -e "${RED}  was used, the hatch is HALF-TAKEN). Add them by hand:${NC}"
    echo -e "${RED}    gh pr edit ${PR_NUMBER:-<n>} $(echo "$UNIQUE" | sed 's/^/--add-label /' | tr '\n' ' ')${NC}"
  fi
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
# Points at the reaper, NOT a bare `rm -rf`. That hint ran no dirty check, no PR
# check and no landed check, so an operator or agent following it on an unmerged or
# uncommitted worktree lost that work with no recovery path — the class
# brikdesigns/brik-llm#1634 exists to close. The reaper decides on PR state plus an
# ancestor test plus a reflog not-started guard, and is dry-run by default.
WORKTREE_DIR=$(git rev-parse --show-toplevel)
if [[ "$WORKTREE_DIR" == *"worktrees"* ]]; then
  echo -e "  ${YELLOW}Cleanup (run after PR is merged, from the primary worktree):${NC}"
  echo "    cd $(dirname "$WORKTREE_DIR")/../brik-bds"
  echo "    ./scripts/sweep-merged-worktrees.sh                            # dry-run first"
  echo "    ./scripts/sweep-merged-worktrees.sh --apply --delete-branches --sweep-remote-refs"
  echo ""
fi
