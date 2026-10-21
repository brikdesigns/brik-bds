#!/usr/bin/env bash
# Regression test for brik-bds#2783 — propagate.sh preflight rejected valid
# App-token auth whenever an unrelated, INACTIVE stored gh account was dead
# (e.g. a rotated brik-ci-bot[bot] token still cached in hosts.yml). Live
# instance: this blocked every consumer bump, daily LaunchAgent lane included.
#
# Root cause, confirmed against gh's own source (cli/cli
# pkg/cmd/auth/status/status.go) and against this box's real broken state:
# text-mode `gh auth status` aggregates across EVERY stored host account and
# exits non-zero if any one errors — active or not. propagate.sh's preflight
# called it directly.
#
# The fix: `gh auth status --json hosts` (exits 0 regardless of other
# accounts' state, confirmed live) + a jq filter that checks only the ACTIVE
# account, since propagate only ever acts as that identity.
#
# What this proves: the real jq predicate extracted from propagate.sh — not a
# re-typed copy that could drift from it — passes the exact scenario that was
# broken and still fails when the active account itself is the dead one.
#
# What this does NOT prove: that `gh auth status --json hosts` itself always
# exits 0 on a dead stored account for every gh version. That is gh's
# contract; confirmed for the installed version this session, not retested
# here.
#
# Hermetic: canned JSON fixtures, real jq (already a hard dependency). No
# network, no real gh.
#
# Run: bash scripts/lib/tests/test-propagate-auth-preflight.sh

set -u

SCRIPT="$(cd "$(dirname "$0")/../../" && pwd)/propagate.sh"
[ -f "$SCRIPT" ] || { echo "propagate.sh not found at $SCRIPT"; exit 1; }

PASS=0; FAIL=0; FAILED_CASES=()
check() {
  local label="$1" want="$2" got="$3"
  if [ "$want" = "$got" ]; then PASS=$((PASS+1)); echo "  ✓ $label";
  else FAIL=$((FAIL+1)); FAILED_CASES+=("$label"); echo "  ✗ $label"; echo "      want: [$want]"; echo "      got:  [$got]"; fi
}

# Pull the live jq filter out of propagate.sh's preflight block so this test
# runs the real predicate. A missing match means the check moved or regressed
# in shape, not that the fixtures below are stale.
JQ_FILTER="$(grep -oE "jq -e '[^']*'" "$SCRIPT" | head -1 | sed -E "s/^jq -e '(.*)'\$/\1/")"
[ -n "$JQ_FILTER" ] || { echo "FAIL: auth-check jq filter not found in $SCRIPT (did brik-bds#2783's fix move or regress?)"; exit 1; }

run_predicate() {
  # $1 = canned `gh auth status --json hosts` JSON
  echo "$1" | jq -e "$JQ_FILTER" >/dev/null 2>&1
}

echo "── the real predicate tolerates a dead INACTIVE account ──"

ACTIVE_HEALTHY_ONE_DEAD='{"hosts":{"github.com":[
  {"login":"brik-agent-app[bot]","active":true,"state":"success"},
  {"login":"brik-ci-bot[bot]","active":false,"state":"error"}
]}}'
if run_predicate "$ACTIVE_HEALTHY_ONE_DEAD"; then
  PASS=$((PASS+1)); echo "  ✓ active healthy + one dead stored account → preflight passes"
else
  FAIL=$((FAIL+1)); FAILED_CASES+=("active healthy + one dead stored account")
  echo "  ✗ active healthy + one dead stored account → preflight should pass"
fi

echo "── the real predicate still fails when the ACTIVE account is the dead one ──"

ACTIVE_DEAD='{"hosts":{"github.com":[
  {"login":"brik-agent-app[bot]","active":true,"state":"error"},
  {"login":"nstaner","active":false,"state":"success"}
]}}'
if ! run_predicate "$ACTIVE_DEAD"; then
  PASS=$((PASS+1)); echo "  ✓ active account itself dead → preflight still fails"
else
  FAIL=$((FAIL+1)); FAILED_CASES+=("active account itself dead")
  echo "  ✗ active account itself dead → preflight should still fail"
fi

echo "── negative control: the OLD predicate is what broke (checker is not vacuous) ──"

# The pre-fix line was `gh auth status &>/dev/null` with no --json: per gh's
# own source, that aggregates every stored entry and fails if any one !=
# success. Reproduced as a jq equivalent over the same fixture to prove the
# scenario this test exists for would have failed the old check.
old_predicate_passes() {
  echo "$1" | jq -e '[.hosts[][] | select(.state != "success")] | length == 0' >/dev/null 2>&1
}
if ! old_predicate_passes "$ACTIVE_HEALTHY_ONE_DEAD"; then
  PASS=$((PASS+1)); echo "  ✓ old predicate fails on this exact scenario (test is not vacuous)"
else
  FAIL=$((FAIL+1)); FAILED_CASES+=("old predicate fails on this exact scenario")
  echo "  ✗ old predicate did not fail here — this test proves nothing"
fi

echo ""
echo "  propagate-auth-preflight: ${PASS} passed, ${FAIL} failed"
if [ "$FAIL" -gt 0 ]; then
  printf '\n  ✗ %s\n' "${FAILED_CASES[@]}"
  exit 1
fi
