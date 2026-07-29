#!/usr/bin/env bash
# Locks the claim gate's decision logic — brik-bds#1541 (slice of brik-llm#1485).
#
# Only the pure half is exercised: parse / staleness / identity. That is where
# the gate can be wrong in a way nobody notices, and new-task.sh refuses to run
# outside the primary worktree so anything inline there is untestable.
#
# No network, no git. The unset below is belt-and-braces per brik-bds#1539: a
# test invoked from a git hook inherits GIT_DIR, and that is how the sibling
# overlap-filters test rewrote refs in a live repo.
#
# Run: bash scripts/__tests__/test-issue-claim.sh

set -u
unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE GIT_COMMON_DIR GIT_NAMESPACE \
      GIT_OBJECT_DIRECTORY GIT_ALTERNATE_OBJECT_DIRECTORIES

LIB="$(cd "$(dirname "$0")/.." && pwd)/lib/issue-claim.sh"
[ -f "$LIB" ] || { echo "lib not found at $LIB"; exit 1; }
# shellcheck source=/dev/null
source "$LIB"

PASS=0; FAIL=0; FAILED_CASES=()

assert_eq() {
  local label="$1" want="$2" got="$3"
  if [ "$want" = "$got" ]; then PASS=$((PASS+1)); echo "  ✓ $label";
  else FAIL=$((FAIL+1)); FAILED_CASES+=("$label"); echo "  ✗ $label"; echo "      want: [$want]"; echo "      got:  [$got]"; fi
}
assert_ok()  { local label="$1"; shift; if "$@"; then PASS=$((PASS+1)); echo "  ✓ $label"; else FAIL=$((FAIL+1)); FAILED_CASES+=("$label"); echo "  ✗ $label (expected success)"; fi; }
assert_not() { local label="$1"; shift; if "$@"; then FAIL=$((FAIL+1)); FAILED_CASES+=("$label"); echo "  ✗ $label (expected failure)"; else PASS=$((PASS+1)); echo "  ✓ $label"; fi; }

NOW=1900000000   # fixed clock: a real `date` call would make staleness untestable

echo "── parse_claim ──"
BODY="$(claim_marker_body brik-mini task/foo-1 2026-07-29T18:00:00Z)"
assert_eq "round-trips host/branch/stamp through the rendered marker" \
  "brik-mini	task/foo-1	2026-07-29T18:00:00Z" "$(parse_claim "$BODY")"
assert_not "rejects a body that is not a claim" parse_claim "just a normal comment"
assert_not "rejects a marker with the rows stripped" parse_claim "$CLAIM_MARKER only"
assert_eq "a branch containing a slash survives" \
  "task/scope-name-1541" "$(parse_claim "$(claim_marker_body h task/scope-name-1541 2026-01-01T00:00:00Z)" | cut -f2)"

echo "── claim_stamp_to_epoch (BSD + GNU date) ──"
assert_eq "parses an ISO-8601 Zulu stamp" "1769904000" "$(claim_stamp_to_epoch 2026-02-01T00:00:00Z)"
assert_not "rejects garbage" claim_stamp_to_epoch "not-a-date"
assert_not "rejects empty" claim_stamp_to_epoch ""

echo "── claim_is_stale ──"
FRESH="$(date -u -j -f %s "$(( NOW - 600 ))" +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -d "@$(( NOW - 600 ))" +%Y-%m-%dT%H:%M:%SZ)"
OLD="$(date -u -j -f %s "$(( NOW - 90000 ))" +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -d "@$(( NOW - 90000 ))" +%Y-%m-%dT%H:%M:%SZ)"
FUTURE="$(date -u -j -f %s "$(( NOW + 90000 ))" +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -d "@$(( NOW + 90000 ))" +%Y-%m-%dT%H:%M:%SZ)"
assert_not "a 10-minute-old claim is NOT stale (it blocks)" claim_is_stale "$FRESH" "$NOW" 43200
assert_ok  "a 25-hour-old claim IS stale" claim_is_stale "$OLD" "$NOW" 43200
assert_ok  "an unparseable stamp reads as stale — a malformed claim must never wedge a ticket" \
  claim_is_stale "garbage" "$NOW" 43200
SKEWED="$(date -u -j -f %s "$(( NOW + 2 ))" +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -d "@$(( NOW + 2 ))" +%Y-%m-%dT%H:%M:%SZ)"
assert_not "a stamp 2s AHEAD of the clock is still LIVE — the machines are not NTP-locked, and treating any future stamp as stale meant 1s of drift silently voided a live claim (age was -1 in testing)" \
  claim_is_stale "$SKEWED" "$NOW" 43200
assert_ok  "a stamp 25h in the future is bogus data, not skew → stale" \
  claim_is_stale "$FUTURE" "$NOW" 43200
assert_ok  "exactly at the window is stale" claim_is_stale "$OLD" "$NOW" 90000

echo "── claim_is_foreign ──"
assert_not "same host AND branch is my own claim — silent re-entry" \
  claim_is_foreign brik-mini task/a brik-mini task/a
assert_ok "same host, different branch is a second session on this machine" \
  claim_is_foreign brik-mini task/a brik-mini task/b
assert_ok "different host is a second machine" \
  claim_is_foreign nicks-macbook-pro-m1 task/a brik-mini task/a

echo "── claim_age_human ──"
assert_eq "under an hour renders minutes" "42m" "$(claim_age_human 2520)"
assert_eq "over an hour renders hours + minutes" "3h30m" "$(claim_age_human 12600)"

echo ""
if [ "$FAIL" -gt 0 ]; then
  echo "── issue-claim: $PASS passed, $FAIL failed"
  for c in "${FAILED_CASES[@]}"; do echo "    ✗ $c"; done
  exit 1
fi
echo "── issue-claim: $PASS passed, 0 failed"
