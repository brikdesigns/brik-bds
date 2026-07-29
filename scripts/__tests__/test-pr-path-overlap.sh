#!/usr/bin/env bash
# Contract gate for the same-path open-PR check (lib/pr-path-overlap.sh).
#
# brik-bds#1545, the same-path slice of brik-llm#1485. What it locks:
#
#   - exact-path matching, because a directory-level heuristic is how the
#     existing keyword check (new-task.sh:285-307) produces noise, and a warning
#     that is usually wrong gets skipped — 6 of 6 emittable warnings in #1533
#     were false positives before filtering
#   - self-exclusion by HEAD REF, because at pr-task.sh time this branch has no
#     PR number to compare against
#   - a failed gh call is never silence
#
# Only the pure half runs here. pr-task.sh refuses to run from a clean main and
# guards on tree state, so its inline path is untestable — the same reason
# overlap-filters.sh and issue-claim.sh exist.
#
# No network, no git. The unset below is per brik-bds#1539: a test invoked from a
# git hook inherits GIT_DIR, and that is how the sibling overlap-filters test
# rewrote refs in the live repo.
#
# Run: bash scripts/__tests__/test-pr-path-overlap.sh

set -u
unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE GIT_COMMON_DIR GIT_NAMESPACE \
      GIT_OBJECT_DIRECTORY GIT_ALTERNATE_OBJECT_DIRECTORIES

LIB="$(cd "$(dirname "$0")/.." && pwd)/lib/pr-path-overlap.sh"
[ -f "$LIB" ] || { echo "lib not found at $LIB"; exit 1; }
# shellcheck source=/dev/null
source "$LIB"

PASS=0; FAIL=0; FAILED_CASES=()

assert_eq() {
  local label="$1" want="$2" got="$3"
  if [ "$want" = "$got" ]; then PASS=$((PASS+1)); echo "  ✓ $label";
  else FAIL=$((FAIL+1)); FAILED_CASES+=("$label"); echo "  ✗ $label"; echo "      want: [$want]"; echo "      got:  [$got]"; fi
}

# Records are tab-delimited and multi-line; flatten both axes to one comparable
# string so an assertion reads as one literal.
flat() { tr -d ' ' | tr '\t' '|' | paste -sd'|' -; }

echo "── intersect_paths ──"

MINE='scripts/propagate.sh
scripts/lib/pr-path-overlap.sh'

assert_eq "a shared path is reported" "scripts/propagate.sh" \
  "$(intersect_paths "$MINE" 'scripts/propagate.sh
docs/RELEASE.md')"

assert_eq "no shared path → nothing" "" \
  "$(intersect_paths "$MINE" 'docs/RELEASE.md
package.json')"

assert_eq "empty mine → nothing" "" "$(intersect_paths "" 'scripts/propagate.sh')"
assert_eq "empty theirs → nothing" "" "$(intersect_paths "$MINE" "")"

# The real #1528 ↔ #1529 collision: both PRs' entire file list was this one path.
assert_eq "the 2026-07-29 collision (both diffs = scripts/propagate.sh)" \
  "scripts/propagate.sh" "$(intersect_paths 'scripts/propagate.sh' 'scripts/propagate.sh')"

echo "── intersect_paths: exact match only ──"

# Same directory, same basename, different extension. Two files, not an overlap.
assert_eq "button.tsx does NOT match button.css" "" \
  "$(intersect_paths 'components/ui/button.tsx' 'components/ui/button.css')"
assert_eq "a sibling in the same directory is not an overlap" "" \
  "$(intersect_paths 'scripts/lib/issue-claim.sh' 'scripts/lib/issue-overlap.sh')"
# Prefix safety in both directions — a substring predicate would report both.
assert_eq "scripts/propagate.sh does NOT match scripts/propagate.sh.bak" "" \
  "$(intersect_paths 'scripts/propagate.sh' 'scripts/propagate.sh.bak')"
assert_eq "a directory prefix is not a path match" "" \
  "$(intersect_paths 'scripts/lib' 'scripts/lib/pr-path-overlap.sh')"

echo "── intersect_paths: de-duplication ──"
assert_eq "a path listed twice is reported once" "scripts/propagate.sh" \
  "$(intersect_paths 'scripts/propagate.sh' 'scripts/propagate.sh
scripts/propagate.sh')"

echo "── overlapping_prs ──"

# number<TAB>headRefName<TAB>title<TAB>comma-joined paths
RECORDS="$(printf '%s\n' \
  '1528	task/infra-propagate-freeze	fix(propagate): skip code-frozen consumers	scripts/propagate.sh' \
  '1544	task/tooling-reconcile	chore: reconcile staging ancestry	docs/RELEASE.md,package.json' \
  '1529	task/docs-propagate-retired	docs(propagate): mark renew-pms retired	scripts/propagate.sh,docs/RELEASE.md')"

assert_eq "only PRs sharing a path are reported, with the shared path" \
  "1528|fix(propagate):skipcode-frozenconsumers|scripts/propagate.sh|1529|docs(propagate):markrenew-pmsretired|scripts/propagate.sh" \
  "$(printf '%s\n' "$RECORDS" | overlapping_prs 'scripts/propagate.sh' 'task/mine' | flat)"

assert_eq "multiple shared paths are all listed for one PR" \
  "scripts/propagate.sh,docs/RELEASE.md" \
  "$(printf '%s\n' "$RECORDS" | overlapping_prs 'scripts/propagate.sh
docs/RELEASE.md' 'task/mine' | grep -F 1529 | cut -f3)"

assert_eq "no overlap at all → no output" "" \
  "$(printf '%s\n' "$RECORDS" | overlapping_prs 'content-system/README.md' 'task/mine' | flat)"

assert_eq "empty mine → no output (never warn on an empty diff)" "" \
  "$(printf '%s\n' "$RECORDS" | overlapping_prs '' 'task/mine' | flat)"

assert_eq "empty record set → no output" "" \
  "$(printf '' | overlapping_prs 'scripts/propagate.sh' 'task/mine' | flat)"

echo "── overlapping_prs: self-exclusion ──"

# The case this must never get wrong: my own pushed branch reported against
# itself. Keyed on head ref because this branch's PR number does not exist yet
# when pr-task.sh calls the check.
assert_eq "my own branch is excluded even though every path matches" "" \
  "$(printf '%s\n' "$RECORDS" | overlapping_prs 'scripts/propagate.sh' 'task/infra-propagate-freeze' \
     | grep -F 1528 | flat)"
assert_eq "excluding my branch leaves the OTHER overlapping PR" \
  "1529|docs(propagate):markrenew-pmsretired|scripts/propagate.sh" \
  "$(printf '%s\n' "$RECORDS" | overlapping_prs 'scripts/propagate.sh' 'task/infra-propagate-freeze' | flat)"
assert_eq "a branch name that is a PREFIX of mine is not excluded" \
  "1528|fix(propagate):skipcode-frozenconsumers|scripts/propagate.sh" \
  "$(printf '%s\n' "$RECORDS" | overlapping_prs 'scripts/propagate.sh' 'task/infra-propagate-freeze-v2' \
     | grep -F 1528 | flat)"
assert_eq "no branch passed → nothing is excluded" \
  "1528|1529" \
  "$(printf '%s\n' "$RECORDS" | overlapping_prs 'scripts/propagate.sh' '' | cut -f1 | paste -sd'|' -)"

echo "── overlapping_prs: field integrity ──"

# A title containing spaces and punctuation must survive intact — the records
# are tab-delimited, and a space-splitting read would truncate every title.
assert_eq "a title with a colon, parens and spaces survives whole" \
  "fix(propagate): skip code-frozen consumers instead of opening PRs (#1526)" \
  "$(printf '%s\n' '1528	task/x	fix(propagate): skip code-frozen consumers instead of opening PRs (#1526)	scripts/propagate.sh' \
     | overlapping_prs 'scripts/propagate.sh' 'task/mine' | cut -f2)"

assert_eq "a PR with an empty file list is skipped, not matched" "" \
  "$(printf '%s\n' '1600	task/x	empty pr	' | overlapping_prs 'scripts/propagate.sh' 'task/mine' | flat)"

echo "── check_pr_path_overlap: full orchestration (both reads injected) ──"

# Both the git read and the gh read are injected, so this exercises the real
# entry point without touching a repository or the network.
fake_diff()    { printf 'scripts/propagate.sh\n'; }
empty_diff()   { printf ''; }
fake_prs()     { printf '%s\n' "$RECORDS"; }
failing_gh()   { return 1; }
unrelated_prs() { printf '%s\n' '1544	task/other	chore: reconcile	docs/RELEASE.md'; }

run_check() { PPO_DIFF_CMD="$1" GH_OPEN_PR_CMD="$2" check_pr_path_overlap main "${3:-task/mine}" 2>&1; }

OUT="$(run_check fake_diff fake_prs)"
assert_eq "an overlapping PR is named" "yes" \
  "$(printf '%s' "$OUT" | grep -q 'PR #1528' && echo yes || echo no)"
assert_eq "the shared path is printed" "yes" \
  "$(printf '%s' "$OUT" | grep -q 'scripts/propagate.sh' && echo yes || echo no)"
assert_eq "it returns 0 — this warns, it never blocks a PR" "0" \
  "$(run_check fake_diff fake_prs >/dev/null 2>&1; echo $?)"

OUT="$(run_check fake_diff unrelated_prs)"
assert_eq "no overlap says so once, and names no PR" "yes" \
  "$(printf '%s' "$OUT" | grep -q 'No open PR touches' && echo yes || echo no)"
assert_eq "no overlap prints no PR number" "no" \
  "$(printf '%s' "$OUT" | grep -q 'PR #' && echo yes || echo no)"

OUT="$(run_check empty_diff fake_prs)"
assert_eq "an empty diff produces no output at all" "" "$OUT"

# The all-clear line and the failure line must be distinguishable — a gh outage
# reading as "no overlap found" is the fail-silent mode this whole family of
# gates exists to avoid (#1533: an untested guard rots).
OUT="$(run_check fake_diff failing_gh)"
assert_eq "a failed gh call warns that the check was SKIPPED" "yes" \
  "$(printf '%s' "$OUT" | grep -q 'skipped, not passed' && echo yes || echo no)"
assert_eq "a failed gh call never prints the all-clear" "no" \
  "$(printf '%s' "$OUT" | grep -q 'No open PR touches' && echo yes || echo no)"

# Non-interactive must not hang on `read` — the defect that aborted a live
# pickup through issue-overlap.sh's prompt (#1549, #1099).
OUT="$(run_check fake_diff fake_prs </dev/null)"
assert_eq "non-interactive continues instead of reading stdin" "yes" \
  "$(printf '%s' "$OUT" | grep -q 'non-interactive: continuing' && echo yes || echo no)"

assert_eq "my own branch: overlap with itself is not reported" "no" \
  "$(run_check fake_diff fake_prs task/infra-propagate-freeze | grep -q 'PR #1528' && echo yes || echo no)"

echo ""
if [ "$FAIL" -gt 0 ]; then
  echo "── pr-path-overlap: $PASS passed, $FAIL failed"
  for c in "${FAILED_CASES[@]}"; do echo "    ✗ $c"; done
  exit 1
fi
echo "── pr-path-overlap: $PASS passed, 0 failed"
