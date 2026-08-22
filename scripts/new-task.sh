#!/usr/bin/env bash
# new-task.sh — Create an isolated git worktree for a single BDS task.
#
# Branches from origin/main. Enforces task/{scope}-{name} naming.
# Installs dependencies in the new worktree.
#
# Usage:
#   ./scripts/new-task.sh {scope}-{name}
#   ./scripts/new-task.sh bds-button-variants
#   ./scripts/new-task.sh tokens-figma-pull
#
# Flags (--issue / --no-issue / --base / --yes) may be written before or after
# the slug.
#
# Creates:
#   ../brik-bds-worktrees/{scope}-{name}/   on branch  task/{scope}-{name}
#
# Requirements:
#   - Must be run from the repo root.
#   - Requires a clean working tree (no uncommitted changes).
#
# Why this exists: the shared main-repo `.git/HEAD` drifts silently when a
# second session checks out a task/* branch, and every edit afterward lands
# on the wrong branch. Worktrees are the fix — each session gets its own
# HEAD. See the Git Release Workflow Notion doc (Per-Repo Playbook table
# flagged BDS worktrees "Critical" after the 2026-04-19 incident).

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# ── Config ──
BASE_BRANCH="main"
ISSUE_REF=""
NO_ISSUE=0
OVER_BUDGET=0

# Issue-number overlap gate. Worktrees isolate FILES, not INTENT: two sessions
# can each create a correct worktree and build the same fix. brik-bds took four
# collisions in 95 minutes on 2026-07-29 — see brik-llm#1485 for the evidence —
# and this repo was the only one of three with no gate at all (brik-bds#1533).
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/lib/issue-overlap.sh
source "${SCRIPT_DIR}/lib/issue-overlap.sh"
# shellcheck source=scripts/lib/overlap-filters.sh
source "${SCRIPT_DIR}/lib/overlap-filters.sh"
# Same-path overlap gate (brik-llm#2313). Complements every gate above, all of
# which key on the TICKET — none can see two sessions on different tickets
# editing the same file.
# shellcheck source=scripts/lib/pr-path-overlap.sh
source "${SCRIPT_DIR}/lib/pr-path-overlap.sh"
# Session size-budget gate (brik-llm#2045, mirrored per brik-llm#2052). Sourced
# after issue-overlap.sh — _sb_resolve_ref reuses _io_resolve_ref when present.
# shellcheck source=scripts/lib/session-budget.sh
source "${SCRIPT_DIR}/lib/session-budget.sh"
# Claim gate — the overlap gate above keys on branches and PRs, and two of the
# four collisions on 2026-07-29 had neither (a close race and a body edit).
# brik-bds#1541.
# shellcheck source=scripts/lib/issue-claim.sh
source "${SCRIPT_DIR}/lib/issue-claim.sh"
# Ticketless claim gate — --no-issue had nothing to write a claim to, so it
# claimed nothing and a parallel --no-issue session got no signal. brik-bds#1663.
# shellcheck source=scripts/lib/slug-claim.sh
source "${SCRIPT_DIR}/lib/slug-claim.sh"

# Auto-proceed past interactive warnings when there's no TTY (agent / headless
# session), or when explicitly opted in via --yes / NEW_TASK_YES=1. Without
# this, the warning prompts below `read -r` from a closed stdin and the script
# hangs or reads EOF unpredictably (#1099). Interactive TTY behavior is
# unchanged — prompts still appear and wait.
AUTO_YES="${NEW_TASK_YES:-0}"

# ── Resolve repo root ──
PROJECT_ROOT="$(git rev-parse --show-toplevel)"
WORKTREE_BASE="$(dirname "$PROJECT_ROOT")/brik-bds-worktrees"

# ── Must run from the primary worktree on main ──
# Running new-task.sh from inside another task worktree creates nested state
# that breaks the one-worktree-per-task contract. The primary worktree is
# also the one place main is meant to live — if it's on a task branch,
# something else already broke.
PRIMARY_PATH="$(git worktree list --porcelain | awk '/^worktree /{print $2; exit}')"
if [ "$PROJECT_ROOT" != "$PRIMARY_PATH" ]; then
  echo -e "${RED}Error: new-task.sh must be run from the primary worktree.${NC}"
  echo ""
  echo "  Here:    $PROJECT_ROOT"
  echo "  Primary: $PRIMARY_PATH"
  echo ""
  echo "  cd into the primary worktree first:"
  echo "    cd $PRIMARY_PATH && ./scripts/new-task.sh $*"
  exit 1
fi

PRIMARY_BRANCH="$(git -C "$PRIMARY_PATH" branch --show-current || echo '(detached)')"
case "$PRIMARY_BRANCH" in
  main|staging) ;;
  *)
    echo -e "${RED}Error: primary worktree is on '${PRIMARY_BRANCH}', not a base branch.${NC}"
    echo ""
    echo "  The primary worktree at $PRIMARY_PATH must stay on ${BASE_BRANCH} (or staging)."
    echo "  Task work lives in ../brik-bds-worktrees/{slug} — never in the primary."
    echo ""
    echo "  To fix:"
    echo "    cd $PRIMARY_PATH"
    echo "    git status                  # inspect any uncommitted work"
    echo "    git switch ${BASE_BRANCH}   # return to the base branch"
    exit 1
    ;;
esac

# ── Parse flags ──
# Flags are accepted on either side of the slug. The loop used to `break` at the
# first positional, so `new-task.sh {slug} --issue N` silently dropped the flag
# and fell through to derive_issue_from_slug — gating AND claiming whatever
# trailing number the slug happened to carry rather than N. A trailing --yes was
# dropped the same way, leaving a headless session on a blocking prompt. #1619.
POSITIONAL=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    --base)
      BASE_BRANCH="$2"
      shift 2
      ;;
    --issue)
      ISSUE_REF="$2"
      shift 2
      ;;
    --no-issue)
      NO_ISSUE=1
      shift
      ;;
    --over-budget)
      OVER_BUDGET=1
      shift
      ;;
    --yes|-y)
      AUTO_YES=1
      shift
      ;;
    -*)
      echo -e "${RED}Unknown flag: $1${NC}"
      exit 1
      ;;
    *)
      POSITIONAL+=("$1")
      shift
      ;;
  esac
done
# `${arr[@]+...}` guards the empty-array expansion under `set -u` on bash 3.2.
set -- ${POSITIONAL[@]+"${POSITIONAL[@]}"}

# No interactive stdin (agent / piped / CI) → treat as opt-in to proceed.
if [ ! -t 0 ]; then
  AUTO_YES=1
fi

# confirm — gate a warning on operator acknowledgement. In an interactive TTY
# it waits for Enter (Ctrl+C to abort); non-interactively it prints a note and
# proceeds so the script never blocks on a closed stdin (#1099).
confirm() {
  if [ "$AUTO_YES" = "1" ]; then
    echo -e "${YELLOW}   → non-interactive: proceeding automatically.${NC}"
  else
    read -r
  fi
}

# ── Validate input ──
if [ $# -lt 1 ]; then
  echo -e "${RED}Usage: $0 [--base branch] [--over-budget] (--issue N | --no-issue) {scope}-{name}${NC}"
  echo ""
  echo "  scope = area of BDS (bds, tokens, stories, indicators, actions, forms, layout, content-system)"
  echo "  name  = what the task delivers (button-variants, figma-pull, badge-chip-typography)"
  echo ""
  echo "  Example: $0 bds-button-variants"
  echo "  Example: $0 --issue 1533 tooling-overlap-gate"
  echo ""
  echo "  --issue takes 1533 or owner/repo#1533 and reports any branch or PR"
  echo "  already carrying that ticket, in this repo or any other."
  echo ""
  echo "  A ticket is REQUIRED. It is derived automatically when the slug ends in"
  echo "  the number (e.g. tooling-overlap-gate-1533). Use --no-issue only for"
  echo "  genuinely ticketless work — it then keys both checks on the SLUG:"
  echo "  it warns if an open issue looks like the same problem, and refuses if"
  echo "  another session already claimed that slug on the claim board."
  echo ""
  echo "  Base branch: ${BASE_BRANCH} (override with --base)"
  echo ""
  echo "  The ticket's size:* label is charged against this session's budget"
  echo "  (1 L, or 2-3 M, or ~5 S/XS). Over budget refuses; --over-budget takes"
  echo "  it anyway. See .claude/references/session-contract.md § Entry."
  echo "    scripts/lib/session-budget.sh --status   # running total"
  exit 1
fi

TASK_NAME="$1"
BRANCH_NAME="task/${TASK_NAME}"

# ── Validate naming convention ──
if [[ ! "$TASK_NAME" =~ ^[a-z]+-[a-z0-9]+ ]]; then
  echo -e "${RED}Error: Task name must follow {scope}-{name} pattern.${NC}"
  echo ""
  echo "  Got:      $TASK_NAME"
  echo "  Expected: {scope}-{name}  (e.g., bds-button-variants, tokens-figma-pull)"
  echo ""
  echo "  Valid scopes: bds, tokens, stories, indicators, actions, forms, layout, content-system, docs"
  exit 1
fi

# ── Issue-number overlap gate ──
# Order: explicit --issue > derived from the slug > refuse. --no-issue is the
# deliberate escape hatch for genuinely ticketless work, and it is loud.
if [ -z "$ISSUE_REF" ] && [ "$NO_ISSUE" != "1" ]; then
  DERIVED_ISSUE="$(derive_issue_from_slug "$TASK_NAME")"
  if [ -n "$DERIVED_ISSUE" ]; then
    ISSUE_REF="$DERIVED_ISSUE"
    echo -e "${YELLOW}▸ Derived --issue ${ISSUE_REF} from the slug (pass --issue to override, --no-issue to skip).${NC}"
  fi
fi

if [ -n "$ISSUE_REF" ]; then
  # Guarded, and the guard is load-bearing in BOTH directions (brik-llm#2422,
  # ported here by brik-llm#2442).
  #
  # Findings return 0 — an overlap warns and proceeds, which is #1549/brik-llm#1692
  # and must not regress. But rc 4 (no such issue) and rc 5 (unreadable) mean the
  # gate DID NOT RUN, and creating the worktree on that is the fail-open. Until
  # this landed, the bare call read an unanswered lookup as an all-clear — so a
  # dead network or an expired token created the branch with no check at all,
  # which is the brik-llm#1485 duplicate-work class the gate exists to stop.
  overlap_rc=0
  check_issue_overlap "$ISSUE_REF" || overlap_rc=$?
  if [ "$overlap_rc" -ne 0 ]; then
    echo ""
    echo -e "${RED}✗ Refusing to create a worktree — the overlap gate could not run.${NC}"
    echo ""
    echo -e "${RED}  Worktrees isolate files, not intent. Without this check nothing${NC}"
    echo -e "${RED}  catches a parallel session on the same ticket (brik-llm#1485,${NC}"
    echo -e "${RED}  where #1525 was built twice).${NC}"
    echo ""
    case "$overlap_rc" in
      2) echo -e "${YELLOW}  The reference could not be parsed. Use 1525 or owner/repo#1525.${NC}" ;;
      4) echo -e "${YELLOW}  That issue does not exist in the repo the number resolved against.${NC}"
         echo -e "${YELLOW}  Check the number, or pass the cross-repo form owner/repo#N.${NC}" ;;
      5) echo -e "${YELLOW}  The read failed rather than came back empty — usually transient.${NC}"
         echo -e "${YELLOW}  Re-run the same command; it retries once on its own first.${NC}" ;;
      *) echo -e "${YELLOW}  Unexpected gate status ${overlap_rc}.${NC}" ;;
    esac
    echo ""
    echo -e "${YELLOW}  Deliberately proceeding without the gate: re-run with --no-issue${NC}"
    echo -e "${YELLOW}  (which also forgoes the session size budget).${NC}"
    exit 1
  fi
  # Catches the shape the number-keyed check cannot see: another session filed
  # its OWN issue for the same problem, so both claims are satisfied while the
  # work is identical (#1663). Advisory — it never refuses, and never aborts on
  # an unreadable title either (see the `|| return 0` in check_title_overlap).
  check_title_overlap "$ISSUE_REF"
  check_ticket_path_overlap "$ISSUE_REF"
  # Guarded: check_session_budget returns 1 to refuse; an unguarded call under
  # set -e would exit before the refusal's remedy lines are read. brik-llm#2045.
  if ! check_session_budget "$ISSUE_REF" "$OVER_BUDGET"; then
    exit 1
  fi
  # Refuses when another session holds a live claim; otherwise claims it.
  if ! check_issue_claim "$ISSUE_REF" "$BRANCH_NAME"; then
    exit 1
  fi
elif [ "$NO_ISSUE" = "1" ]; then
  echo -e "${YELLOW}⚠  --no-issue: no ticket to key the overlap gate on.${NC}"
  # The slug is the only statement of intent a ticketless branch has, so both
  # checks below read it instead of an issue title (#1663).
  # 1. Is there already an open issue for this? #1660 was a --no-issue branch
  #    that duplicated issue #1661.
  check_phrase_overlap "$(slug_to_phrase "$TASK_NAME")"
  # 2. Is another session already on this slug? Refuses, like the issue-keyed
  #    claim would.
  if ! check_slug_claim "$TASK_NAME" "$BRANCH_NAME"; then
    exit 1
  fi
else
  echo -e "${RED}✗ Refusing to create a worktree with no ticket.${NC}"
  echo ""
  echo -e "${RED}  The ticket-overlap gate is the only check that catches a parallel${NC}"
  echo -e "${RED}  session already working this problem. Worktrees isolate files, not${NC}"
  echo -e "${RED}  intent — brik-llm#1485 is two sessions building the same fix in two${NC}"
  echo -e "${RED}  correctly-created worktrees.${NC}"
  echo ""
  echo "  Pass a ticket:      $0 --issue <N> ${TASK_NAME}"
  echo "  Or embed it:        $0 ${TASK_NAME}-<N>"
  echo "  Genuinely none:     $0 --no-issue ${TASK_NAME}"
  exit 1
fi

# ── Check for clean working tree ──
if [ -n "$(git status --porcelain)" ]; then
  echo -e "${RED}Error: Working tree is dirty. Commit or stash changes first.${NC}"
  echo ""
  git status --short
  exit 1
fi

# ── Check branch doesn't already exist ──
if git show-ref --verify --quiet "refs/heads/${BRANCH_NAME}"; then
  echo -e "${RED}Error: Branch '${BRANCH_NAME}' already exists.${NC}"
  echo ""
  echo "  To resume:  cd ${WORKTREE_BASE}/${TASK_NAME}"
  echo "  To delete:  git branch -d ${BRANCH_NAME}"
  exit 1
fi

# ── Check for branch name reuse (previous PRs) ──
if command -v gh &>/dev/null; then
  PRIOR_PRS=$(gh pr list --state all --head "${BRANCH_NAME}" --json number,state --jq '.[] | "#\(.number) (\(.state))"' 2>/dev/null || true)
  if [ -n "$PRIOR_PRS" ]; then
    echo -e "${YELLOW}⚠  Branch name '${BRANCH_NAME}' was used in previous PRs:${NC}"
    echo "$PRIOR_PRS" | sed 's/^/    /'
    echo ""
    echo -e "${YELLOW}   Reusing names makes PR history confusing.${NC}"
    echo -e "${YELLOW}   Consider: task/${TASK_NAME}-v2 or a more specific name.${NC}"
    echo -e "${YELLOW}   Press Enter to continue anyway, Ctrl+C to abort.${NC}"
    confirm
  fi
fi

# ── Check for overlapping scope (remote task branches) ──
# Merged-but-undeleted branches must be excluded or this gate is pure noise.
# Measured in brik-bds on 2026-07-29: 6 of 6 open `origin/task/*` branches
# already had MERGED PRs, so 100% of the warnings this could emit were false
# positives — the same result brik-llm measured before filtering (20 of 20). A
# gate that is always wrong teaches everyone to press Enter, and then the one
# real overlap rides through with the noise. brik-llm#1485 / brik-bds#1533.
#
# Two cheap local checks, then ONE gh call for the rest. Never one call per
# candidate: the fleet shares an hourly GitHub API bucket
# (rag:github-api-quota-is-shared-across-the-fleet), and this runs on every task.
SCOPE_KEYWORD="${TASK_NAME%%-*}"
CANDIDATES=$(git branch -r 2>/dev/null | grep -i "origin/task/.*${SCOPE_KEYWORD}" | grep -v HEAD || true)
SIMILAR_BRANCHES=""

if [ -n "$CANDIDATES" ]; then
  # One API call for all merged head-refs. Empty on failure, which degrades to
  # the ancestor check inside filter_live_branches rather than to silence.
  MERGED_HEADS=$(gh pr list --state merged --limit 400 --json headRefName \
                   --jq '.[].headRefName' 2>/dev/null || true)
  # Bulk filter first (cheap), then verify only the survivors individually — the
  # bulk list misses PRs older than its window, and squash-merges defeat the
  # ancestor check. See drop_merged_by_lookup.
  SIMILAR_BRANCHES=$(printf '%s\n' "$CANDIDATES" \
    | filter_live_branches "origin/${BASE_BRANCH}" "$MERGED_HEADS" \
    | drop_merged_by_lookup)
fi

if [ -n "$SIMILAR_BRANCHES" ]; then
  echo -e "${YELLOW}⚠  LIVE branches with similar scope (merged/landed ones excluded):${NC}"
  echo "$SIMILAR_BRANCHES" | sed 's/^/    /'
  echo ""
  echo -e "${YELLOW}   These carry unlanded work — a real overlap risk, not stale refs.${NC}"
  echo -e "${YELLOW}   Press Enter to continue, Ctrl+C to abort.${NC}"
  confirm
fi

# ── Check open PRs for file-level overlap ──
# Parallel PRs that touch the same files cause cascading rebase conflicts
# (see the 2026-04-19 portal #257 ↔ #258 incident captured in the Notion
# Git Release Workflow doc). Warn when open PRs touch files whose path
# fragment matches the task scope.
if command -v gh &>/dev/null; then
  OPEN_PR_FILES=$(gh pr list --state open --json number,title,files --jq \
    '.[] | "\(.number)\t\(.title)\t\(.files | map(.path) | join(","))"' 2>/dev/null || true)
  if [ -n "$OPEN_PR_FILES" ]; then
    # Heuristic: tasks with the same descriptor likely touch the same directory.
    # e.g. "bds-button-variants" → check PRs touching any "*button*" file.
    DESC_KEYWORD=$(echo "$TASK_NAME" | cut -d'-' -f2)
    OVERLAPPING=$(echo "$OPEN_PR_FILES" | grep -i "${DESC_KEYWORD}" || true)
    if [ -n "$OVERLAPPING" ]; then
      echo -e "${YELLOW}⚠  Open PR(s) may touch the same area as '${TASK_NAME}':${NC}"
      echo "$OVERLAPPING" | awk -F'\t' '{ printf "    PR #%s — %s\n", $1, $2 }'
      echo ""
      echo -e "${YELLOW}   Parallel work on overlapping files = cascading rebase conflicts.${NC}"
      echo -e "${YELLOW}   Options:${NC}"
      echo -e "${YELLOW}     1) Wait for the open PR(s) to merge, then start this task${NC}"
      echo -e "${YELLOW}     2) Chain this branch off the open PR instead of main${NC}"
      echo -e "${YELLOW}     3) Proceed (accept the rebase cost)${NC}"
      echo ""
      echo -e "${YELLOW}   Press Enter to proceed, Ctrl+C to abort.${NC}"
      confirm
    fi
  fi
fi

# ── Fetch and branch from base ──
echo -e "${YELLOW}▸ Fetching latest ${BASE_BRANCH}...${NC}"
git fetch origin "${BASE_BRANCH}" --quiet

echo -e "${YELLOW}▸ Creating worktree at ${WORKTREE_BASE}/${TASK_NAME}...${NC}"
mkdir -p "$WORKTREE_BASE"
git worktree add "${WORKTREE_BASE}/${TASK_NAME}" -b "${BRANCH_NAME}" "origin/${BASE_BRANCH}"

cd "${WORKTREE_BASE}/${TASK_NAME}"

# ── Install dependencies ──
# BDS has no .env — no secrets to copy. Just deps.
echo -e "${YELLOW}▸ Installing dependencies (npm ci --prefer-offline)...${NC}"
npm ci --prefer-offline 2>&1 | tail -1

# ── Install the Playwright browser the Storybook gate needs ──
# vitest --project=storybook drives `chromium` (vitest.config.ts), and the
# visual-verification path screenshots stories with it. npm ci does NOT fetch
# browser binaries, so a fresh worktree fails with "Executable doesn't exist …
# run npx playwright install" until this runs (#812). Each Playwright version
# wants its own build, so pin to the version this worktree just installed.
echo -e "${YELLOW}▸ Installing Playwright chromium (Storybook visual gate)...${NC}"
npx playwright install chromium chromium-headless-shell 2>&1 | tail -1

# ── Install docs-site dependencies ──
# `docs-site/` is a separate npm project with its own lockfile — the root
# `npm ci` above does not reach it, so `next` is absent and
# `cd docs-site && npm run build` dies on "sh: next: command not found".
# That matters because `docs-site-build.yml` runs `next build` on every PR
# touching `docs-site/**` while the root `npm run validate` does not, so
# without this a worktree cannot pre-run the check that will gate its own PR
# (#1980). Unconditional: measured at ~6s with a warm cache, which is cheaper
# than the class of footgun it removes.
echo -e "${YELLOW}▸ Installing docs-site dependencies (separate lockfile)...${NC}"
(cd docs-site && npm ci --prefer-offline 2>&1 | tail -1)

# ── Summary ──
echo ""
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}  Task worktree ready (brik-bds)${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo ""
echo "  Branch:    ${BRANCH_NAME}"
echo "  Worktree:  ${WORKTREE_BASE}/${TASK_NAME}"
echo "  Based on:  origin/${BASE_BRANCH}"
echo ""
echo "  Next steps:"
echo "    cd ${WORKTREE_BASE}/${TASK_NAME}"
echo "    claude -p \"Task: ... Follow CLAUDE.md rules.\""
echo ""
echo "  Before merge: sync both consumers (portal, brikdesigns)."
echo ""
echo "  Gates: 'npm run validate' does NOT cover docs-site. On a docs-site/** change also run:"
echo "    (cd docs-site && npm run build)   # what docs-site-build.yml gates"
echo ""
echo "  When done (REQUIRED — branches without PRs rot):"
echo "    git diff ${BASE_BRANCH}..${BRANCH_NAME}   # review changes"
echo "    ./scripts/pr-task.sh             # push + create PR (mandatory)"
echo ""
