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

# ── #2633: an agent's hand-bump on a task/* branch ──
# Stubs stand in for `gh pr diff` output.
diff_agent_bump() {
  printf '%s\n' '--- a/package.json' '+++ b/package.json' \
    '-    "@brikdesigns/bds": "0.192.0",' '+    "@brikdesigns/bds": "0.192.1",'
}
diff_caret_bump() { printf '%s\n' '+    "@brikdesigns/bds": "^0.192.1"'; }
diff_removed_only() { printf '%s\n' '-    "@brikdesigns/bds": "0.192.1",'; }
diff_other_dep() { printf '%s\n' '+    "@brikdesigns/bds-extra": "0.192.1",'; }
diff_longer_version() { printf '%s\n' '+    "@brikdesigns/bds": "0.192.10",'; }

echo "── an agent PR pinning the same release is detected ──"
diff_agent_bump | diff_pins_package "@brikdesigns/bds" "0.192.1"; check "exact pin returns 0" "0" "$?"
diff_caret_bump | diff_pins_package "@brikdesigns/bds" "0.192.1"; check "caret pin returns 0" "0" "$?"

echo "── diffs that do not pin that release are ignored ──"
diff_agent_bump | diff_pins_package "@brikdesigns/bds" "0.192.2"; check "different version returns 1" "1" "$?"
diff_removed_only | diff_pins_package "@brikdesigns/bds" "0.192.1"; check "removed line returns 1" "1" "$?"
diff_other_dep | diff_pins_package "@brikdesigns/bds" "0.192.1"; check "other package returns 1" "1" "$?"
diff_longer_version | diff_pins_package "@brikdesigns/bds" "0.192.1"; check "0.192.10 is not 0.192.1" "1" "$?"
diff_agent_bump | diff_pins_package "@brikdesigns/bds" ""; check "empty version returns 1" "1" "$?"

# ── #2633: a newer bump supersedes an older open one ──
list_stale_bumps() {
  printf 'bds-update/2026-09-20-v0.192.0\thttps://github.com/brikdesigns/brikdesigns/pull/1738\n'
  printf 'task/some-feature\thttps://github.com/brikdesigns/brikdesigns/pull/900\n'
  printf 'bds-update/2026-09-29-v0.192.2\thttps://github.com/brikdesigns/brikdesigns/pull/1876\n'
  printf 'bds-update/2026-09-30-v0.193.0\thttps://github.com/brikdesigns/brikdesigns/pull/1900\n'
  printf 'bds-update/2026-08-19-5e8a13b\thttps://github.com/brikdesigns/brik-llm/pull/1540\n'
}

echo "── only OLDER npm-track bump PRs are superseded ──"
OUT="$(superseded_bump_prs "0.192.2" list_stale_bumps)"; RC=$?
check "returns 0" "0" "$RC"
check "echoes only the older bump" "https://github.com/brikdesigns/brikdesigns/pull/1738" "$OUT"

echo "── sort is by version, not string (0.9.0 < 0.10.0) ──"
list_string_trap() { printf 'bds-update/2026-01-01-v0.9.0\thttps://x/pull/1\n'; }
OUT="$(superseded_bump_prs "0.10.0" list_string_trap)"
check "0.9.0 superseded by 0.10.0" "https://x/pull/1" "$OUT"

echo "── a failed query or empty version supersedes nothing ──"
OUT="$(superseded_bump_prs "0.192.2" list_fails 2>/dev/null)"; check "failed query echoes nothing" "" "$OUT"
OUT="$(superseded_bump_prs "" list_stale_bumps)"; check "empty version echoes nothing" "" "$OUT"

# ── #2633 option a: only a patch bump auto-clears a consumer's version freeze ──
echo "── is_patch_bump ──"
is_patch_bump "0.192.1" "0.192.2";  check "0.192.1 → 0.192.2 is a patch" "0" "$?"
is_patch_bump "0.192.9" "0.192.10"; check "0.192.9 → 0.192.10 is a patch" "0" "$?"
is_patch_bump "0.192.2" "0.193.0";  check "minor bump is not" "1" "$?"
is_patch_bump "0.192.2" "1.192.3";  check "major bump is not" "1" "$?"
is_patch_bump "0.192.2" "0.192.1";  check "downgrade is not" "1" "$?"
is_patch_bump "0.192.2" "0.192.2";  check "equal is not" "1" "$?"
is_patch_bump "0.192.2" "0.192.3-beta.1"; check "prerelease is not" "1" "$?"
is_patch_bump "" "0.192.3";         check "empty from is not" "1" "$?"
is_patch_bump "0.192.08" "0.192.09"; check "leading zeros compare as decimal" "0" "$?"

# ─── claim_worktree / cleanup_claimed_worktree (#1676) ─────────────
# Forces a real `git push` failure (pre-receive hook rejects) under set -e, the
# exact shape of the four 403 nights, and checks the EXIT trap removes the
# worktree + branch without masking the failure.
echo "cleanup_claimed_worktree"
WT_TMP="$(mktemp -d)"
git init -q --bare "$WT_TMP/remote.git"
printf '#!/bin/sh\necho "remote: Write access to repository not granted." >&2\nexit 1\n' > "$WT_TMP/remote.git/hooks/pre-receive"
chmod +x "$WT_TMP/remote.git/hooks/pre-receive"
git init -q -b main "$WT_TMP/consumer"
git -C "$WT_TMP/consumer" -c user.email=t@t -c user.name=t commit -q --allow-empty -m init
git -C "$WT_TMP/consumer" remote add origin "$WT_TMP/remote.git"

# $1 = shell snippet run after the claim, inside the worktree
run_claimed() {
  bash -c '
    set -euo pipefail
    source "$1"; trap cleanup_claimed_worktree EXIT
    repo="$2"; wt="$2-wt"; br="bds-update/test"
    git -C "$repo" worktree add -q "$wt" -b "$br" main
    claim_worktree "$repo" "$wt" "$br"
    cd "$wt"
    eval "$3"
  ' _ "$LIB" "$WT_TMP/consumer" "$1" >/dev/null 2>&1
}

if run_claimed 'git push -q -u origin bds-update/test'; then rc=0; else rc=1; fi
check "push failure exits non-zero" "1" "$rc"
check "push failure removes the worktree" "0" "$([ -d "$WT_TMP/consumer-wt" ] && echo 1 || echo 0)"
check "push failure deletes the local branch" "" \
  "$(git -C "$WT_TMP/consumer" branch --list 'bds-update/test')"

run_claimed 'false'
check "any failure after the claim is cleaned up" "0" "$([ -d "$WT_TMP/consumer-wt" ] && echo 1 || echo 0)"

# A deliberate keep (npm install failure → "left for diagnosis") releases the
# claim first, so the trap leaves it alone and the run still exits 0.
run_claimed 'release_worktree'
check "released claim exits 0" "0" "$?"
check "released claim keeps the worktree" "1" "$([ -d "$WT_TMP/consumer-wt" ] && echo 1 || echo 0)"
rm -rf "$WT_TMP"

echo ""
echo "  $PASS passed, $FAIL failed"
if [ "$FAIL" -gt 0 ]; then
  printf '  failed: %s\n' "${FAILED_CASES[@]}"
  exit 1
fi
