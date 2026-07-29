#!/usr/bin/env bash
# Contract gate for .husky/pre-push's ref-scope decision (lib/prepush-guards.sh).
#
# brik-bds#1547. The inputs are the real stdin lines git delivers, captured from a
# fixture repo on 2026-07-29 (annotated tag, lightweight tag, branch, and a mixed
# `git push origin main v9.9.7`). Using recorded real output rather than invented
# lines is the point: the whole tag-skip rests on field 3 being the remote ref.
#
# A hook cannot be exercised without pushing, which is why this logic is in a lib
# at all — the mtime staleness check it replaces sat inline and nothing could
# catch that it was content-blind.
#
# No network, no git. The unset is per brik-bds#1539: a test invoked from a git
# hook inherits GIT_DIR, and that is how the sibling overlap-filters test rewrote
# refs in the live repo. This test is invoked from exactly that hook.
#
# Run: bash scripts/__tests__/test-prepush-guards.sh

set -u
unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE GIT_COMMON_DIR GIT_NAMESPACE \
      GIT_OBJECT_DIRECTORY GIT_ALTERNATE_OBJECT_DIRECTORIES

LIB="$(cd "$(dirname "$0")/.." && pwd)/lib/prepush-guards.sh"
[ -f "$LIB" ] || { echo "lib not found at $LIB"; exit 1; }
# shellcheck source=/dev/null
source "$LIB"

PASS=0; FAIL=0; FAILED_CASES=()
assert_ok()  { local label="$1"; shift; if "$@"; then PASS=$((PASS+1)); echo "  ✓ $label"; else FAIL=$((FAIL+1)); FAILED_CASES+=("$label"); echo "  ✗ $label (expected tags-only)"; fi; }
assert_not() { local label="$1"; shift; if "$@"; then FAIL=$((FAIL+1)); FAILED_CASES+=("$label"); echo "  ✗ $label (expected NOT tags-only)"; else PASS=$((PASS+1)); echo "  ✓ $label"; fi; }

# ── Recorded git output ────────────────────────────────────────────
BRANCH='refs/heads/main d9344cdeba9220b6cec599365f2651ea63444fd6 refs/heads/main cbf61f7985157378c8ba941a6055cd1579d6c2ed'
TAG_ANNOTATED='refs/tags/v9.9.9 0c5d46037d21adb4e49cd27edddce1fbc51c1f6b refs/tags/v9.9.9 0000000000000000000000000000000000000000'
TAG_LIGHTWEIGHT='refs/tags/v9.9.8-lw cbf61f7985157378c8ba941a6055cd1579d6c2ed refs/tags/v9.9.8-lw 0000000000000000000000000000000000000000'

feed() { printf '%s\n' "$@" | push_is_tags_only; }

echo "── push_is_tags_only ──"

assert_ok  "an annotated tag push is tags-only (the release path, docs/RELEASE.md)" \
  feed "$TAG_ANNOTATED"
assert_ok  "a lightweight tag push is tags-only" feed "$TAG_LIGHTWEIGHT"
assert_ok  "two tags at once is still tags-only" feed "$TAG_ANNOTATED" "$TAG_LIGHTWEIGHT"

assert_not "a branch push is NOT tags-only" feed "$BRANCH"
assert_not "a MIXED push carries commits, so it is NOT tags-only" \
  feed "$BRANCH" "$TAG_ANNOTATED"
assert_not "tag first, branch second — order must not decide it" \
  feed "$TAG_ANNOTATED" "$BRANCH"

echo "── absence of information is never a skip ──"
assert_not "empty stdin is NOT tags-only" bash -c "source '$LIB'; printf '' | push_is_tags_only"
assert_not "blank lines only is NOT tags-only" bash -c "source '$LIB'; printf '\n\n' | push_is_tags_only"

echo "── field discipline ──"
# The remote ref is field 3. A predicate that grepped the line, or read field 1,
# would call a branch-to-tag mismatch wrong in both directions.
assert_not "a LOCAL tag pushed to a BRANCH ref is not tags-only (field 3 decides)" \
  feed 'refs/tags/v1 aaa refs/heads/main bbb'
assert_ok  "a LOCAL branch pushed to a TAG ref is tags-only (field 3 decides)" \
  feed 'refs/heads/main aaa refs/tags/v1 bbb'
assert_not "a ref merely containing the word tags is not under refs/tags/" \
  feed 'refs/heads/tags-cleanup aaa refs/heads/tags-cleanup bbb'
assert_not "refs/notes is not a tag" feed 'refs/notes/x aaa refs/notes/x bbb'
assert_ok  "a nested tag path still counts" feed 'refs/tags/rel/v1 aaa refs/tags/rel/v1 bbb'

echo ""
if [ "$FAIL" -gt 0 ]; then
  echo "── prepush-guards: $PASS passed, $FAIL failed"
  for c in "${FAILED_CASES[@]}"; do echo "    ✗ $c"; done
  exit 1
fi
echo "── prepush-guards: $PASS passed, 0 failed"
