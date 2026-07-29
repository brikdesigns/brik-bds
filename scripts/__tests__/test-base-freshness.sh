#!/usr/bin/env bash
# Contract gate for the merge-time base-freshness check (lib/base-freshness.sh).
#
# brik-bds#1546, the merge-time slice of brik-llm#1485. The case that matters
# most is the one this test reproduces from scratch in a fixture repo:
# brik-client-portal#2538 merged as an EMPTY commit because #2539 had already
# moved the same pin, and every "how big is the diff" signal read healthy right
# up to the merge.
#
# So the load-bearing assertion here is not "REDUNDANT is detected" — it is that
# the THREE-DOT diff in that same fixture is NON-empty. If a future edit swaps
# the predicate for the obvious `git diff base...HEAD --stat`, that assertion
# fails and says why. Without it the test would pass on the wrong comparison.
#
# No network. A throwaway repo for the git half; the API half runs through an
# injected blob reader. The unset below is per brik-bds#1539: a test invoked from
# a git hook inherits GIT_DIR, which is how the sibling overlap-filters test
# rewrote refs in the live repo.
#
# Run: bash scripts/__tests__/test-base-freshness.sh

set -u
unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE GIT_COMMON_DIR GIT_NAMESPACE \
      GIT_OBJECT_DIRECTORY GIT_ALTERNATE_OBJECT_DIRECTORIES

LIB="$(cd "$(dirname "$0")/.." && pwd)/lib/base-freshness.sh"
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

flat() { tr -d ' ' | paste -sd, -; }

TMPROOT="$(mktemp -d "${TMPDIR:-/tmp}/brik-freshness-test-XXXXXXXX")"
trap 'rm -rf "$TMPROOT"' EXIT
case "$TMPROOT" in
  /*/brik-freshness-test-*) : ;;
  *) echo "refusing to run: TMPROOT looks wrong ($TMPROOT)"; exit 1 ;;
esac

echo "── paths_needing_apply ──"

THREE='package.json
package-lock.json'

assert_eq "no path differs from base → nothing needs applying (the #2538 case)" "" \
  "$(paths_needing_apply "$THREE" "" | flat)"
assert_eq "one path still differs → only that path" "package.json" \
  "$(paths_needing_apply "$THREE" 'package.json' | flat)"
assert_eq "both still differ → both" "package.json,package-lock.json" \
  "$(paths_needing_apply "$THREE" 'package.json
package-lock.json' | flat)"
assert_eq "a base-tip difference OUTSIDE the PR's file list is ignored" "" \
  "$(paths_needing_apply "$THREE" 'src/unrelated.ts' | flat)"
assert_eq "empty three-dot → nothing" "" "$(paths_needing_apply "" 'package.json' | flat)"
assert_eq "output order follows the PR's file list, de-duplicated" "package.json" \
  "$(paths_needing_apply 'package.json' 'package.json
package.json' | flat)"

echo "── freshness_verdict ──"
assert_eq "changed paths, none needing apply → REDUNDANT" "REDUNDANT" \
  "$(freshness_verdict "$THREE" "")"
assert_eq "changed paths, one needing apply → FRESH" "FRESH" \
  "$(freshness_verdict "$THREE" "package.json")"
assert_eq "a PR that changes nothing at all → REDUNDANT" "REDUNDANT" \
  "$(freshness_verdict "" "")"

echo "── blob_pair_same ──"
assert_ok  "identical blob SHAs are the same content" blob_pair_same 26853f54 26853f54
assert_not "different blob SHAs differ" blob_pair_same 26853f54 7e5c95d2
assert_ok  "absent on both sides is the same — nothing to write" blob_pair_same "" ""
assert_not "absent on one side only differs" blob_pair_same "" 26853f54

echo "── local mode: the #2538 scenario, rebuilt from scratch ──"

REPO="$TMPROOT/r"
git init -q -b main "$REPO"

# Prove the fixture is what the git calls actually resolve to before any of them
# mutate anything — belt to the unset above's braces (#1539). Physical paths:
# macOS mktemp hands back /var/folders/… while git resolves /private/var.
FIXTURE_GITDIR="$(cd "$REPO" && git rev-parse --absolute-git-dir)"
TMPROOT_REAL="$(cd "$TMPROOT" && pwd -P)"
case "$FIXTURE_GITDIR" in
  "$TMPROOT_REAL"/*) : ;;
  *) echo "refusing to run: fixture git-dir escaped the sandbox"; echo "  expected under: $TMPROOT_REAL"; echo "  actually: $FIXTURE_GITDIR"; exit 1 ;;
esac

git -C "$REPO" config user.email t@example.com
git -C "$REPO" config user.name Test

# Fork point: the old pin.
printf '{"dependencies":{"@brikdesigns/bds":"^0.136.0"}}\n' > "$REPO/package.json"
printf 'lock 0.136.0\n' > "$REPO/package-lock.json"
git -C "$REPO" add -A && git -C "$REPO" commit -qm "base: bds 0.136.0"
FORK="$(git -C "$REPO" rev-parse HEAD)"

# The automation bump (#2538) — branched from the fork point.
git -C "$REPO" checkout -q -b bump "$FORK"
printf '{"dependencies":{"@brikdesigns/bds":"^0.137.0"}}\n' > "$REPO/package.json"
printf 'lock 0.137.0\n' > "$REPO/package-lock.json"
git -C "$REPO" add -A && git -C "$REPO" commit -qm "chore(bds): bump to 0.137.0"

# The other session (#2539) lands the SAME pin on main, plus its own file.
git -C "$REPO" checkout -q main
printf '{"dependencies":{"@brikdesigns/bds":"^0.137.0"}}\n' > "$REPO/package.json"
printf 'lock 0.137.0\n' > "$REPO/package-lock.json"
printf 'export const Switcher = () => null\n' > "$REPO/switcher.tsx"
git -C "$REPO" add -A && git -C "$REPO" commit -qm "refactor: adopt shared component (moves the pin too)"

# THE ASSERTION THAT MATTERS: the naive signal still reports two changed files.
assert_eq "the three-dot diff is NON-empty — the obvious check reads healthy here" \
  "package-lock.json,package.json" \
  "$(cd "$REPO" && git diff --name-only main...bump | sort | flat)"

# …and the two-dot diff is not empty either: it lists `switcher.tsx`, which main
# ADDED and this branch simply does not have. So neither raw diff is the
# predicate — a two-dot emptiness test would call this FRESH just as wrongly as
# the three-dot one calls it changed. Only the intersection is right: no path in
# the PR's own file list still differs from the base tip.
assert_eq "the two-dot diff is not empty either — it lists a file the BASE added" \
  "switcher.tsx" "$(cd "$REPO" && git diff --name-only main..bump | flat)"

assert_eq "neither of the PR's own two paths appears in that two-dot list" "" \
  "$(cd "$REPO" && git diff --name-only main..bump | grep -E '^package(-lock)?\.json$' | flat)"

assert_eq "local mode calls it REDUNDANT" "REDUNDANT" \
  "$(cd "$REPO" && check_base_freshness_local main bump 2>/dev/null)"

assert_eq "the CLI exits 1 on REDUNDANT" "1" \
  "$(cd "$REPO" && bash "$LIB" --local main bump >/dev/null 2>&1; echo $?)"

echo "── local mode: a genuinely fresh bump ──"

# Same setup, but main never moved the pin.
REPO2="$TMPROOT/r2"
git init -q -b main "$REPO2"
git -C "$REPO2" config user.email t@example.com
git -C "$REPO2" config user.name Test
printf '{"dependencies":{"@brikdesigns/bds":"^0.136.0"}}\n' > "$REPO2/package.json"
git -C "$REPO2" add -A && git -C "$REPO2" commit -qm base
git -C "$REPO2" checkout -q -b bump
printf '{"dependencies":{"@brikdesigns/bds":"^0.137.0"}}\n' > "$REPO2/package.json"
git -C "$REPO2" add -A && git -C "$REPO2" commit -qm bump
git -C "$REPO2" checkout -q main

assert_eq "local mode calls a real bump FRESH" "FRESH" \
  "$(cd "$REPO2" && check_base_freshness_local main bump 2>/dev/null)"
assert_eq "and names the path that still needs applying" "package.json" \
  "$(cd "$REPO2" && check_base_freshness_local main bump 2>&1 >/dev/null | flat)"
assert_eq "the CLI exits 0 on FRESH" "0" \
  "$(cd "$REPO2" && bash "$LIB" --local main bump >/dev/null 2>&1; echo $?)"

# A branch with no commits of its own: nothing to apply, so REDUNDANT — the
# "already merged / empty branch" shape.
git -C "$REPO2" checkout -q -b nothing main
assert_eq "a branch identical to base is REDUNDANT" "REDUNDANT" \
  "$(cd "$REPO2" && check_base_freshness_local main nothing 2>/dev/null)"

echo "── remote mode: per-path blob comparison ──"

# Injected blob reader: "<nwo> <path> <ref>" → SHA. Models #2538 exactly —
# identical blobs at base tip and head for both files.
same_blobs() {
  case "$2" in
    package.json)      echo 26853f54 ;;
    package-lock.json) echo 7e5c95d2 ;;
    *)                 echo "" ;;
  esac
}
assert_eq "identical blobs at base and head → nothing needs applying" "" \
  "$(BF_BLOB_CMD=same_blobs _bf_remote_needing o/r BASE HEAD "$THREE" | flat)"

# One file moved on head only.
moved_blobs() {
  case "$2:$3" in
    package.json:BASE) echo old ;;
    package.json:HEAD) echo new ;;
    package-lock.json:*) echo 7e5c95d2 ;;
    *) echo "" ;;
  esac
}
assert_eq "a path whose blob differs is reported" "package.json" \
  "$(BF_BLOB_CMD=moved_blobs _bf_remote_needing o/r BASE HEAD "$THREE" | flat)"

# A path the PR deletes, already absent on base: both reads empty → nothing to do.
absent_blobs() { echo ""; }
assert_eq "a path absent on both sides is not reported" "" \
  "$(BF_BLOB_CMD=absent_blobs _bf_remote_needing o/r BASE HEAD 'removed.ts' | flat)"

# A path present on base but absent at head (the PR deletes it) is a real change.
deleted_blobs() { case "$3" in BASE) echo 26853f54 ;; *) echo "" ;; esac; }
assert_eq "a deletion still to apply IS reported" "removed.ts" \
  "$(BF_BLOB_CMD=deleted_blobs _bf_remote_needing o/r BASE HEAD 'removed.ts' | flat)"

echo "── sourcing safety ──"

# Sourcing must be inert: no shell options leaked into the caller, and no abort
# under `set -u`. Both bit during development — the lib originally ran
# `set -uo pipefail`, and its CLI guard read an unset BASH_SOURCE array. Callers
# are pr-task.sh / new-task.sh / hooks, all of which run `set -euo pipefail`.
assert_eq "sourcing under set -u does not abort" "sourced-ok" \
  "$(bash -c "set -euo pipefail; source '$LIB'; echo sourced-ok" 2>&1)"
assert_eq "sourcing does not turn on errexit in the caller" "no-errexit" \
  "$(bash -c "source '$LIB'; case \$- in *e*) echo LEAKED-errexit ;; *) echo no-errexit ;; esac" 2>&1)"
assert_eq "sourcing does not turn on nounset in the caller" "no-nounset" \
  "$(bash -c "source '$LIB'; case \$- in *u*) echo LEAKED-nounset ;; *) echo no-nounset ;; esac" 2>&1)"
assert_eq "sourcing runs no CLI block and prints nothing" "" \
  "$(bash -c "source '$LIB'" 2>&1)"

echo "── remote mode: reference parsing ──"
assert_eq "owner/repo#N resolves cross-repo" "brikdesigns brik-client-portal 2538" \
  "$(_bf_resolve_ref 'brikdesigns/brik-client-portal#2538')"
assert_not "garbage is rejected rather than guessed at" _bf_resolve_ref 'not-a-pr-ref!!'
assert_not "an empty ref is rejected" _bf_resolve_ref ''

echo ""
if [ "$FAIL" -gt 0 ]; then
  echo "── base-freshness: $PASS passed, $FAIL failed"
  for c in "${FAILED_CASES[@]}"; do echo "    ✗ $c"; done
  exit 1
fi
echo "── base-freshness: $PASS passed, 0 failed"
