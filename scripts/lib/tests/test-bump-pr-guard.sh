#!/usr/bin/env bash
# Locks existing_bump_pr (#1918) — the check that stops propagate.sh opening a
# second PR for a bump already waiting on review.
#
# propagate decides a consumer is behind by reading origin/<base>. An unmerged
# PR never moves that ref, and the branch name is date-stamped, so the next
# morning's run opens an identical PR under a fresh name. brikdesigns #981/#982
# (v0.165.0) and #475/#476 (v0.93.2) are the pairs that landed.
#
# What this does NOT prove: that gh's real output parses. That needs the network
# and a consumer repo. This covers the match decision — which branch counts as
# "the same bump" — which is the part that was missing.
#
# Hermetic: stubbed PR listings, no gh, no network.
#
# Run: bash scripts/lib/tests/test-bump-pr-guard.sh

set -u
LIB="$(cd "$(dirname "$0")/.." && pwd)/bump-pr-guard.sh"
[ -f "$LIB" ] || { echo "bump-pr-guard.sh not found at $LIB"; exit 1; }
# shellcheck source=scripts/lib/bump-pr-guard.sh
source "$LIB"

PASS=0; FAIL=0; FAILED_CASES=()
check() {
  local label="$1" want="$2" got="$3"
  if [ "$want" = "$got" ]; then PASS=$((PASS+1)); echo "  ✓ $label";
  else FAIL=$((FAIL+1)); FAILED_CASES+=("$label"); echo "  ✗ $label"; echo "      want: [$want]"; echo "      got:  [$got]"; fi
}

# Stubs stand in for `gh pr list --json headRefName,url` — one TAB-separated
# `<headRefName>\t<url>` line per open PR.
list_none() { :; }
list_yesterdays_bump() {
  printf 'bds-update/2026-08-19-v0.165.0\thttps://github.com/brikdesigns/brikdesigns/pull/981\n'
}
list_other_work() {
  printf 'task/tokens-gate-accuracy\thttps://github.com/brikdesigns/brikdesigns/pull/984\n'
  printf 'bds-update/2026-08-19-v0.164.1\thttps://github.com/brikdesigns/brikdesigns/pull/970\n'
}
list_mixed() {
  printf 'task/some-feature\thttps://github.com/brikdesigns/brikdesigns/pull/900\n'
  printf 'bds-update/2026-08-19-v0.165.0\thttps://github.com/brikdesigns/brikdesigns/pull/981\n'
}
list_submodule_bump() {
  printf 'bds-update/2026-08-19-5e8a13b\thttps://github.com/brikdesigns/brik-llm/pull/1540\n'
}
list_fails() { echo "gh: could not resolve repo" >&2; return 1; }

echo "── the duplicate propagate opened is detected ──"
OUT="$(existing_bump_pr "-v0.165.0" list_yesterdays_bump)"; RC=$?
check "returns 0" "0" "$RC"
check "echoes the open PR url" "https://github.com/brikdesigns/brikdesigns/pull/981" "$OUT"

echo "── a consumer with no open PR is still bumped ──"
OUT="$(existing_bump_pr "-v0.165.0" list_none)"; RC=$?
check "returns 1" "1" "$RC"
check "echoes nothing" "" "$OUT"

echo "── an open PR for a DIFFERENT version does not block the bump ──"
OUT="$(existing_bump_pr "-v0.165.0" list_other_work)"; RC=$?
check "returns 1" "1" "$RC"
check "echoes nothing" "" "$OUT"

echo "── the match survives unrelated PRs in the listing ──"
OUT="$(existing_bump_pr "-v0.165.0" list_mixed)"; RC=$?
check "returns 0" "0" "$RC"
check "echoes the bump PR, not the task PR" "https://github.com/brikdesigns/brikdesigns/pull/981" "$OUT"

echo "── a non-propagate branch ending in the version is ignored ──"
list_impostor() { printf 'task/pin-v0.165.0\thttps://github.com/brikdesigns/brikdesigns/pull/999\n'; }
OUT="$(existing_bump_pr "-v0.165.0" list_impostor)"; RC=$?
check "returns 1" "1" "$RC"
check "echoes nothing" "" "$OUT"

echo "── the submodule track matches on the BDS short SHA ──"
OUT="$(existing_bump_pr "-5e8a13b" list_submodule_bump)"; RC=$?
check "returns 0" "0" "$RC"
check "echoes the open PR url" "https://github.com/brikdesigns/brik-llm/pull/1540" "$OUT"

echo "── a version is not matched by a longer one that ends the same way ──"
list_longer() { printf 'bds-update/2026-08-19-v10.165.0\thttps://github.com/brikdesigns/brikdesigns/pull/995\n'; }
OUT="$(existing_bump_pr "-v0.165.0" list_longer)"; RC=$?
check "returns 1" "1" "$RC"
check "echoes nothing" "" "$OUT"

echo "── a failed query opens the PR rather than skipping the release ──"
OUT="$(existing_bump_pr "-v0.165.0" list_fails 2>/dev/null)"; RC=$?
check "returns 1 (propagate proceeds)" "1" "$RC"
check "echoes nothing" "" "$OUT"

echo "── an empty suffix never blocks every bump ──"
OUT="$(existing_bump_pr "" list_yesterdays_bump)"; RC=$?
check "returns 1" "1" "$RC"
check "echoes nothing" "" "$OUT"

echo ""
echo "  $PASS passed, $FAIL failed"
if [ "$FAIL" -gt 0 ]; then
  printf '  failed: %s\n' "${FAILED_CASES[@]}"
  exit 1
fi
