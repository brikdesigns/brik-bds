#!/usr/bin/env bash
# Contract gate for new-task.sh's two overlap gates (lib/overlap-filters.sh).
#
# Both gates were defeated in production and nothing caught it, because
# new-task.sh refuses to run outside the primary worktree so the inline logic was
# untestable. Measured 2026-07-27 on brik-llm:
#
#   - Gate 1 (slug-fuzzy branch match) had no merged-filter. All 20 open task/*
#     branches on origin had MERGED PRs — the oldest 757 commits behind main — so
#     100% of the warnings it could emit were false positives. It fired on a
#     branch merged in PR #308 months earlier and was duly dismissed.
#   - Gate 2 (ticket overlap) is the only check that catches duplicate WORK, and
#     it was opt-in: no --issue printed a warning and skipped. With 13 concurrent
#     sessions and 35 PRs merged into brik-llm that day, four worktrees were
#     created without it — including the one that collided.
#
# So the logic moved into a lib and this locks it. Pure functions plus a
# throwaway repo for the ancestor check; no network, no real repo touched.
#
# Run: bash scripts/__tests__/test-overlap-filters.sh

set -u

# ── Hermetic against an inherited git environment ──
# "no real repo touched" above depends on this. Every git call below is scoped
# with `git -C "$REPO"`, but -C only changes DIRECTORY — GIT_DIR wins over
# directory discovery, so with GIT_DIR exported every one of them retargets the
# real repository. Git hooks export exactly that.
#
# Wiring this test into brik-bds's pre-push (brik-bds#1533) proved it the hard
# way on 2026-07-29: `git init --bare` set core.bare=true on the live repo,
# `commit -qm base` landed on the checked-out task branch and orphaned its real
# commit, the fixture merge moved `main` to a tree that deleted the repo, and
# `push -u origin task/live` put two fixture refs on GitHub. Recoverable, but
# only because `main` on the remote happened not to move.
unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE GIT_COMMON_DIR GIT_NAMESPACE \
      GIT_OBJECT_DIRECTORY GIT_ALTERNATE_OBJECT_DIRECTORIES

LIB="$(cd "$(dirname "$0")/.." && pwd)/lib/overlap-filters.sh"
[ -f "$LIB" ] || { echo "lib not found at $LIB"; exit 1; }
# shellcheck source=/dev/null
source "$LIB"
# shellcheck source=/dev/null
source "$(cd "$(dirname "$0")/.." && pwd)/lib/identity-guard.sh"

PASS=0
FAIL=0
FAILED_CASES=()

TMPROOT="$(mktemp -d "${TMPDIR:-/tmp}/brik-overlap-test-XXXXXXXX")"
trap 'rm -rf "$TMPROOT"' EXIT
case "$TMPROOT" in
  /*/brik-overlap-test-*) : ;;
  *) echo "refusing to run: TMPROOT looks wrong ($TMPROOT)"; exit 1 ;;
esac

assert_eq() {
  local label="$1" expected="$2" actual="$3"
  if [ "$expected" = "$actual" ]; then
    PASS=$((PASS+1)); echo "  ✓ $label"
  else
    FAIL=$((FAIL+1)); FAILED_CASES+=("$label: expected [$expected], got [$actual]")
    echo "  ✗ $label (expected [$expected], got [$actual])"
  fi
}

echo "── derive_issue_from_slug ──"

# The real slugs this has to handle, taken from live branches.
assert_eq "agent-brik-llm-1461 → 1461" "1461" "$(derive_issue_from_slug agent-brik-llm-1461)"
assert_eq "launch-agent-health-672 → 672" "672" "$(derive_issue_from_slug launch-agent-health-672)"
assert_eq "claude-home-sync-1301 → 1301" "1301" "$(derive_issue_from_slug claude-home-sync-1301)"
assert_eq "756-enrich-session-rows → nothing (number is leading, not trailing)" \
  "" "$(derive_issue_from_slug 756-enrich-session-rows)"

# Must NOT fire on version/phase markers — gating on a wrong but real ticket is
# worse than not gating, because it reports a false all-clear.
assert_eq "phase-2 → nothing (1 digit is a phase, not a ticket)" \
  "" "$(derive_issue_from_slug phase-2)"
assert_eq "rag-hybrid-v3 → nothing" "" "$(derive_issue_from_slug rag-hybrid-v3)"
assert_eq "phase-3-5-content-audit → nothing (mid-slug numbers are markers)" \
  "" "$(derive_issue_from_slug phase-3-5-content-audit)"
assert_eq "cross-repo-audit-20260727 → nothing (8 digits is a date)" \
  "" "$(derive_issue_from_slug cross-repo-audit-20260727)"
assert_eq "no digits at all → nothing" "" "$(derive_issue_from_slug overlap-gate-repair)"
assert_eq "empty slug → nothing" "" "$(derive_issue_from_slug "")"

echo "── filter_live_branches: merged-PR exclusion ──"

CANDS='  origin/task/alpha
  origin/task/beta
  origin/task/gamma'

# beta merged via PR → dropped. No repo needed; the ancestor check just fails.
OUT="$(printf '%s\n' "$CANDS" | filter_live_branches origin/nonexistent-base 'task/beta' | tr -d ' ' | paste -sd, -)"
assert_eq "a merged head-ref is excluded" "origin/task/alpha,origin/task/gamma" "$OUT"

OUT="$(printf '%s\n' "$CANDS" | filter_live_branches origin/nonexistent-base 'task/alpha
task/beta
task/gamma' | tr -d ' ' | paste -sd, -)"
assert_eq "all merged → nothing survives (the 20-tombstone case)" "" "$OUT"

OUT="$(printf '%s\n' "$CANDS" | filter_live_branches origin/nonexistent-base '' | tr -d ' ' | paste -sd, -)"
assert_eq "empty merged list → everything survives (gh failure must not silence)" \
  "origin/task/alpha,origin/task/beta,origin/task/gamma" "$OUT"

# Exact-match only: a merged "task/beta" must not suppress "task/beta-2".
OUT="$(printf '  origin/task/beta-2\n' | filter_live_branches origin/nonexistent-base 'task/beta' | tr -d ' ')"
assert_eq "merged task/beta does NOT suppress task/beta-2 (substring safety)" \
  "origin/task/beta-2" "$OUT"

echo "── filter_live_branches: ancestor exclusion (real repo) ──"

REPO="$TMPROOT/r"
BARE="$TMPROOT/r.git"
git init -q --bare "$BARE"
git init -q -b main "$REPO"

# Belt to the unset above's braces: prove the fixture repo is what the git calls
# actually resolve to before any of them mutate anything. If a git env var ever
# leaks past the unset — or $REPO comes through empty, which makes `git -C ""`
# target the live repo — this fails loudly instead of silently rewriting refs in
# whatever repository the caller happened to be standing in (#1539, #1634).
assert_throwaway_repo "$REPO" "overlap-filters fixture"
git -C "$REPO" config user.email t@example.com
git -C "$REPO" config user.name Test
git -C "$REPO" remote add origin "$BARE"
echo base > "$REPO/f.txt"
git -C "$REPO" add -A && git -C "$REPO" commit -qm base
git -C "$REPO" push -q -u origin main

# landed: merged into main, so an ancestor of origin/main even with no PR record.
git -C "$REPO" checkout -q -b task/landed
echo landed > "$REPO/l.txt"
git -C "$REPO" add -A && git -C "$REPO" commit -qm landed
git -C "$REPO" push -q -u origin task/landed
git -C "$REPO" checkout -q main
git -C "$REPO" merge -q --no-ff -m merge task/landed
git -C "$REPO" push -q origin main

# live: pushed, never merged.
git -C "$REPO" checkout -q -b task/live main
echo live > "$REPO/v.txt"
git -C "$REPO" add -A && git -C "$REPO" commit -qm live
git -C "$REPO" push -q -u origin task/live
git -C "$REPO" checkout -q main
git -C "$REPO" fetch -q origin

OUT="$(cd "$REPO" && printf '  origin/task/landed\n  origin/task/live\n' \
  | filter_live_branches origin/main '' | tr -d ' ' | paste -sd, -)"
assert_eq "a branch already contained in base is excluded, without any PR record" \
  "origin/task/live" "$OUT"

# And the combination: PR-merged + ancestor, both paths active at once.
OUT="$(cd "$REPO" && printf '  origin/task/landed\n  origin/task/live\n' \
  | filter_live_branches origin/main 'task/live' | tr -d ' ' | paste -sd, -)"
assert_eq "both exclusions together leave nothing" "" "$OUT"

echo "── drop_merged_by_lookup: the blind spot the bulk pass leaves ──"

# The real case that survived the bulk filter: PR #308, older than the bulk
# window AND squash-merged, so neither cheap check catches it.
fake_state() {
  case "$1" in
    task/old-squash-merged) echo "MERGED" ;;
    task/still-open)        echo "OPEN" ;;
    *)                      echo "" ;;
  esac
}
export -f fake_state 2>/dev/null || true

OUT="$(printf '  origin/task/old-squash-merged\n  origin/task/still-open\n' \
  | GH_PR_STATE_CMD=fake_state drop_merged_by_lookup | tr -d ' ' | paste -sd, -)"
assert_eq "an old squash-merged branch is dropped by direct lookup" \
  "origin/task/still-open" "$OUT"

OUT="$(printf '  origin/task/no-pr-at-all\n' \
  | GH_PR_STATE_CMD=fake_state drop_merged_by_lookup | tr -d ' ')"
assert_eq "a branch with no PR is KEPT (unlanded work must still warn)" \
  "origin/task/no-pr-at-all" "$OUT"

# A gh failure must not silently suppress a real warning.
failing_state() { return 1; }
OUT="$(printf '  origin/task/still-open\n' \
  | GH_PR_STATE_CMD=failing_state drop_merged_by_lookup | tr -d ' ')"
assert_eq "a failed lookup keeps the branch (never fail-silent)" \
  "origin/task/still-open" "$OUT"

OUT="$(printf '' | GH_PR_STATE_CMD=fake_state drop_merged_by_lookup | tr -d ' \n')"
assert_eq "empty input → empty output, no error" "" "$OUT"

echo ""
if [ "$FAIL" -gt 0 ]; then
  echo "── overlap-filters: $PASS passed, $FAIL failed"
  for c in "${FAILED_CASES[@]}"; do echo "   • $c"; done
  exit 1
fi
echo "── overlap-filters: $PASS passed, 0 failed"
