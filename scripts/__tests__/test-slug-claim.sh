#!/usr/bin/env bash
# Locks the ticketless claim gate's decision logic — brik-bds#1663 AC-2.
#
# Only the pure half is exercised: marker keying, parse, slug round-trip. The
# staleness / identity / skew logic is NOT retested here — slug-claim.sh sources
# issue-claim.sh and reuses those functions, and test-issue-claim.sh already
# locks them. Duplicating the assertions would let the two suites disagree about
# what "still live" means, which is the exact drift the reuse exists to prevent.
#
# The load-bearing assertion is the per-slug keying: a single shared marker would
# make every claim overwrite the previous one, so the board would gate exactly
# one ticketless branch at a time while looking like it gated all of them. The
# prefix case (`tokens-foo` vs `tokens-foo-bar`) is the one that fails silently.
#
# No network, no git. The unset below is belt-and-braces per brik-bds#1539: a
# test invoked from a git hook inherits GIT_DIR, and that is how the sibling
# overlap-filters test rewrote refs in a live repo.
#
# Run: bash scripts/__tests__/test-slug-claim.sh

set -u
unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE GIT_COMMON_DIR GIT_NAMESPACE \
      GIT_OBJECT_DIRECTORY GIT_ALTERNATE_OBJECT_DIRECTORIES

LIB="$(cd "$(dirname "$0")/.." && pwd)/lib/slug-claim.sh"
[ -f "$LIB" ] || { echo "lib not found at $LIB"; exit 1; }
# shellcheck source=/dev/null
source "$LIB"

PASS=0; FAIL=0; FAILED_CASES=()

assert_eq() {
  local label="$1" want="$2" got="$3"
  if [ "$want" = "$got" ]; then PASS=$((PASS+1)); echo "  ✓ $label";
  else FAIL=$((FAIL+1)); FAILED_CASES+=("$label"); echo "  ✗ $label"; echo "      want: [$want]"; echo "      got:  [$got]"; fi
}
# Output is discarded, not just unchecked: `declare -F` prints the function name
# and parse_slug_claim prints its parsed row, which interleaved with the ✓ lines
# and made a passing run look like it was reporting failures.
assert_ok()  { local label="$1"; shift; if "$@" >/dev/null 2>&1; then PASS=$((PASS+1)); echo "  ✓ $label"; else FAIL=$((FAIL+1)); FAILED_CASES+=("$label"); echo "  ✗ $label (expected success)"; fi; }
assert_not() { local label="$1"; shift; if "$@" >/dev/null 2>&1; then FAIL=$((FAIL+1)); FAILED_CASES+=("$label"); echo "  ✗ $label (expected failure)"; else PASS=$((PASS+1)); echo "  ✓ $label"; fi; }

echo "── slug_claim_marker ──"
assert_eq "keys the marker on the slug" \
  '<!-- claim:slug=tokens-fade-gate -->' "$(slug_claim_marker tokens-fade-gate)"
assert_ok "two slugs produce DIFFERENT markers — a shared one would make each claim overwrite the last, gating one branch while appearing to gate all" \
  test "$(slug_claim_marker slug-a)" != "$(slug_claim_marker slug-b)"
assert_ok "the slug marker is not the issue-keyed marker, so the two gates cannot read each other's comments" \
  test "$(slug_claim_marker anything)" != "$CLAIM_MARKER"

echo "── parse_slug_claim ──"
BODY="$(slug_claim_body tokens-fade-gate brik-mini task/tokens-fade-gate 2026-08-04T18:00:00Z)"
assert_eq "round-trips host/branch/stamp through the rendered marker" \
  "brik-mini	task/tokens-fade-gate	2026-08-04T18:00:00Z" \
  "$(parse_slug_claim "$BODY" tokens-fade-gate)"
assert_not "rejects a body that is not a claim" parse_slug_claim "just a normal comment" tokens-fade-gate
assert_not "rejects a marker with the rows stripped" \
  parse_slug_claim "$(slug_claim_marker tokens-fade-gate) only" tokens-fade-gate
assert_not "rejects a claim for a DIFFERENT slug — otherwise one ticketless branch blocks every other" \
  parse_slug_claim "$BODY" some-other-slug

# The prefix case. `contains()` on the marker is substring matching, so without
# the closing `-->` in the marker and the Slug-row equality check, a claim on
# `tokens-fade` would read as a live claim on `tokens-fade-gate` and refuse
# unrelated work — a false refusal nobody would trace back to here.
PREFIX_BODY="$(slug_claim_body tokens-fade brik-mini task/tokens-fade 2026-08-04T18:00:00Z)"
assert_not "a claim on a PREFIX slug does not match the longer slug" \
  parse_slug_claim "$PREFIX_BODY" tokens-fade-gate
assert_not "a claim on the LONGER slug does not match its prefix" \
  parse_slug_claim "$BODY" tokens-fade
assert_ok "the prefix claim still parses for its own slug" \
  parse_slug_claim "$PREFIX_BODY" tokens-fade

echo "── slug_to_phrase ──"
assert_eq "hyphens become spaces so the IDF title scorer tokenises the slug" \
  "tooling slug claim board" "$(slug_to_phrase tooling-slug-claim-board)"
assert_eq "a single-word slug survives unchanged" "tokens" "$(slug_to_phrase tokens)"

echo "── claim_sweep_verdict (sweep-board-claims.sh) ──"
FRESH="$(date -u -j -f %s "$(( 1900000000 - 600 ))" +%Y-%m-%dT%H:%M:%SZ 2>/dev/null \
         || date -u -d "@$(( 1900000000 - 600 ))" +%Y-%m-%dT%H:%M:%SZ)"
STALE="$(date -u -j -f %s "$(( 1900000000 - 90000 ))" +%Y-%m-%dT%H:%M:%SZ 2>/dev/null \
         || date -u -d "@$(( 1900000000 - 90000 ))" +%Y-%m-%dT%H:%M:%SZ)"
NOW=1900000000

assert_eq "a merged PR's claim is swept" "sweep" "$(claim_sweep_verdict MERGED "$FRESH" "$NOW")"
assert_eq "a closed (rejected) PR's claim is swept" "sweep" "$(claim_sweep_verdict CLOSED "$FRESH" "$NOW")"
assert_eq "an OPEN PR's claim is kept — that claim is doing its job" \
  "keep" "$(claim_sweep_verdict OPEN "$STALE" "$NOW")"

# The dangerous case. An early sweep mis-extracted the slug, so every claim
# looked like "no PR, stale" and a live claim would have been deleted. A claim
# with no PR yet is a session that has not pushed — keep it while it is fresh.
assert_eq "no PR + FRESH claim is kept (session may not have pushed yet)" \
  "keep" "$(claim_sweep_verdict "" "$FRESH" "$NOW")"
assert_eq "no PR + stale claim is swept (it already blocks nobody)" \
  "sweep" "$(claim_sweep_verdict "" "$STALE" "$NOW")"
assert_eq "an unknown PR state is never deleted" \
  "keep" "$(claim_sweep_verdict WEIRD "$STALE" "$NOW")"
# An unparseable stamp reads as stale upstream; with no PR that means sweep, and
# the caller separately refuses to act on a claim whose fields did not extract.
assert_eq "an unreadable stamp with no PR is swept, not silently kept forever" \
  "sweep" "$(claim_sweep_verdict "" "garbage" "$NOW")"

echo "── reuse contract with issue-claim.sh ──"
# If these stop resolving, slug-claim.sh has been detached from the shared
# staleness logic and this suite is no longer covering what it claims to.
for fn in claim_identity claim_is_stale claim_is_foreign claim_stamp_to_epoch claim_age_human; do
  assert_ok "inherits ${fn} from issue-claim.sh rather than reimplementing it" \
    declare -F "$fn"
done
assert_ok "inherits the staleness window" test -n "${CLAIM_STALE_SECONDS:-}"
assert_ok "the board number is set" test -n "${SLUG_CLAIM_BOARD:-}"

echo ""
if [ "$FAIL" -gt 0 ]; then
  echo "── slug-claim: $PASS passed, $FAIL failed"
  for c in "${FAILED_CASES[@]}"; do echo "    ✗ $c"; done
  exit 1
fi
echo "── slug-claim: $PASS passed, 0 failed"
