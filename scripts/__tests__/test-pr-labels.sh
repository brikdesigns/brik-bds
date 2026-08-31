#!/usr/bin/env bash
# Contract gate for the PR label resolver (lib/pr-labels.sh).
#
# brik-bds#1979. The failure this reproduces is the one that hit #1969, #1974
# and #1978 in a row: pr-task.sh opened each PR with zero labels, so the work
# fell off the project board until someone ran `gh pr edit` by hand.
#
# The load-bearing assertions are the ones that fail SILENTLY and cost more than
# the label they were about:
#
#   1. Every label must be existence-checked before it reaches `gh pr edit`.
#      One unknown name aborts the WHOLE call, so an unchecked `bug` (which
#      brik-bds does not have) would also drop the inherited area:* the
#      pr-label-gate requires — turning a cosmetic miss into a red PR. This
#      exact bug was written and caught during #1979 itself.
#   2. `priority:*` and `meta:*` must NOT be inherited. A PR has no priority of
#      its own, and `meta:agent-discovered` describes how the ISSUE was found.
#      Inheriting them looks harmless and quietly corrupts board filters.
#   3. Refs come off the rendered `Closes #N` / `Refs #N` block, not a second
#      regex over the commit range. Two patterns drift, and the drift shows up
#      as labels inherited from an issue the PR does not reference.
#
# No network, no git, no `gh` — every case drives the pure helpers directly.
# The unset below is per brik-bds#1539: a test invoked from a git hook inherits
# GIT_DIR, which is how a sibling test once rewrote refs in the live repo.
#
# Run: bash scripts/__tests__/test-pr-labels.sh

set -u
unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE GIT_COMMON_DIR GIT_NAMESPACE \
      GIT_OBJECT_DIRECTORY GIT_ALTERNATE_OBJECT_DIRECTORIES

SCRIPTS_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LIB="${SCRIPTS_DIR}/lib/pr-labels.sh"
[ -f "$LIB" ] || { echo "lib not found at $LIB"; exit 1; }
# shellcheck source=/dev/null
source "$LIB"

PASS=0; FAIL=0; FAILED_CASES=()

assert_eq() {
  local label="$1" want="$2" got="$3"
  if [ "$want" = "$got" ]; then PASS=$((PASS+1)); echo "  ✓ $label";
  else FAIL=$((FAIL+1)); FAILED_CASES+=("$label"); echo "  ✗ $label"; echo "      want: [$want]"; echo "      got:  [$got]"; fi
}

assert_true() {
  local label="$1"; shift
  if "$@"; then PASS=$((PASS+1)); echo "  ✓ $label";
  else FAIL=$((FAIL+1)); FAILED_CASES+=("$label"); echo "  ✗ $label (expected true)"; fi
}

assert_false() {
  local label="$1"; shift
  if "$@"; then FAIL=$((FAIL+1)); FAILED_CASES+=("$label"); echo "  ✗ $label (expected false)";
  else PASS=$((PASS+1)); echo "  ✓ $label"; fi
}

# The label set brik-bds actually has, as of #1979. Deliberately EXCLUDES
# `enhancement` and `bug` — that absence is what assertion 1 above turns on.
BDS_LABELS=$'priority:p0-now\npriority:p1-week\npriority:p2-month\npriority:p3-someday\narea:components\narea:storybook\narea:tokens\narea:content-system\narea:tooling\nsize:xs\nsize:s\nsize:m\nsize:l\ntheme:documentation\ntheme:agent-ops\ntheme:tech-debt\nmeta:project\nmeta:agent-discovered\nissue:none'

echo "── type_label_for_title"
assert_eq "feat maps to enhancement" "enhancement" "$(type_label_for_title 'feat(tokens): add x')"
assert_eq "fix maps to bug"          "bug"         "$(type_label_for_title 'fix(tooling): y')"
assert_eq "feat! (breaking) still maps" "enhancement" "$(type_label_for_title 'feat!: z')"
assert_eq "docs maps to nothing"     ""            "$(type_label_for_title 'docs(build-standards): w')"
assert_eq "chore maps to nothing"    ""            "$(type_label_for_title 'chore(deps): bump')"
assert_eq "refactor maps to nothing" ""            "$(type_label_for_title 'refactor(components): v')"
assert_eq "empty title maps to nothing" ""         "$(type_label_for_title '')"

echo ""
echo "── label_known — the existence check that keeps one bad name from"
echo "   dropping every good one (assertion 1)"
assert_true  "area:tooling is real in brik-bds"  label_known "area:tooling" "$BDS_LABELS"
assert_false "bug is NOT real in brik-bds"       label_known "bug"          "$BDS_LABELS"
assert_false "enhancement is NOT real in brik-bds" label_known "enhancement" "$BDS_LABELS"
assert_false "a typo'd area is not real"         label_known "area:toolin"  "$BDS_LABELS"
assert_false "a prefix is not a whole label"     label_known "area:"        "$BDS_LABELS"
assert_false "a substring is not a whole label"  label_known "tooling"      "$BDS_LABELS"

echo ""
echo "── inheritable_labels — the axis policy (assertion 2)"
ISSUE_1979=$'priority:p2-month\narea:tooling\nsize:s\nmeta:agent-discovered\ntheme:agent-ops'
assert_eq "inherits area, size and theme only" \
  $'area:tooling\nsize:s\ntheme:agent-ops' \
  "$(inheritable_labels "$ISSUE_1979")"
assert_eq "drops priority:*" "" "$(inheritable_labels 'priority:p1-week')"
assert_eq "drops meta:*"     "" "$(inheritable_labels 'meta:agent-discovered')"
assert_eq "drops an unaxed label" "" "$(inheritable_labels 'dependencies')"
assert_eq "empty in, empty out"   "" "$(inheritable_labels '')"
# Anchored, so a label merely CONTAINING an axis name is not inherited.
assert_eq "does not match an axis name mid-string" "" "$(inheritable_labels 'not-area:tooling')"

echo ""
echo "── refs_from_issue_links — read the rendered block, not the commits"
echo "   (assertion 3)"
assert_eq "one Closes ref" "#1979" "$(refs_from_issue_links $'Closes #1979\n')"
# Whole refs, not bare numbers (brik-llm#2450) — and the sort is lexical, which
# is what the caller's split consumes; display order is issue-links.sh's job.
assert_eq "Closes and Refs both counted, sorted, deduped" \
  $'#1979\n#42\nbrikdesigns/brik-llm#2442' \
  "$(refs_from_issue_links $'Closes #1979\nRefs #42\nRefs #1979\nRefs brikdesigns/brik-llm#2442\n')"
assert_eq "the Issue-exempt line contributes no ref" "" \
  "$(refs_from_issue_links $'Issue-exempt: one-off script fix, nothing tracks it\n')"
assert_eq "empty block yields nothing" "" "$(refs_from_issue_links '')"

echo ""
echo "── has_area_label — the gate pr-label-gate.yml enforces"
assert_true  "a set with area:* passes"       has_area_label $'bug\narea:tooling\nsize:s'
assert_false "a set with no area:* fails"     has_area_label $'size:s\ntheme:agent-ops'
assert_false "an empty set fails"             has_area_label ''
assert_false "a mid-string area does not pass" has_area_label 'not-area:tooling'

echo ""
echo "── dedupe_labels — the shape gh pr edit wants"
assert_eq "sorts, dedupes and drops blanks" \
  $'area:tooling\nsize:s' \
  "$(dedupe_labels $'size:s\narea:tooling\n\nsize:s\n')"
assert_eq "empty in, empty out" "" "$(dedupe_labels '')"

echo ""
echo "── end-to-end: what #1979's own PR should resolve to"
# The full pipeline the pr-task.sh block runs, with the network calls replaced
# by fixtures. `bug` must be filtered out by label_known — if it survives,
# `gh pr edit` aborts and the PR lands with NO labels at all.
resolved=()
tl=$(type_label_for_title 'fix(tooling): apply label parity in pr-task.sh (#1979)')
if [ -n "$tl" ] && label_known "$tl" "$BDS_LABELS"; then resolved+=("$tl"); fi
for ref in $(refs_from_issue_links $'Closes #1979\n'); do
  [ "$(issue_ref_number "$ref")" = "1979" ] || continue
  [ -z "$(issue_ref_repo "$ref")" ] || continue
  for l in $(inheritable_labels "$ISSUE_1979"); do
    if label_known "$l" "$BDS_LABELS"; then resolved+=("$l"); fi
  done
done
assert_eq "resolves area+size+theme and drops the absent Type label" \
  $'area:tooling\nsize:s\ntheme:agent-ops' \
  "$(dedupe_labels "$(printf '%s\n' "${resolved[@]+"${resolved[@]}"}")")"
assert_true "the resolved set satisfies the area gate" \
  has_area_label "$(printf '%s\n' "${resolved[@]+"${resolved[@]}"}")"

echo ""
echo "── contract: pr-task.sh and the gate agree"
PR_TASK="${SCRIPTS_DIR}/pr-task.sh"
GATE="$(cd "$(dirname "$0")/../.." && pwd)/.github/workflows/pr-label-gate.yml"
assert_true "pr-task.sh sources this lib" \
  grep -q 'lib/pr-labels.sh' "$PR_TASK"
assert_true "pr-task.sh gates on has_area_label before pushing" \
  grep -q 'has_area_label' "$PR_TASK"
assert_true "the gate workflow exists" test -f "$GATE"
# Both halves must key on the same prefix. If one ever moved to `area/` or
# `scope:`, the script would open PRs the gate immediately fails.
assert_true "the gate requires the same '^area:' prefix the script resolves" \
  grep -q "grep -q '\^area:'" "$GATE"
# The dependabot stamp must be a label this repo actually has, or the auto-label
# step is a silent no-op and every dependency PR stalls the gate.
DEPENDABOT_LABEL=$(grep -oE '\-\-add-label area:[a-z-]+' "$GATE" | head -1 | awk '{print $2}')
assert_true "the gate's dependabot stamp ('${DEPENDABOT_LABEL}') is a real brik-bds label" \
  label_known "$DEPENDABOT_LABEL" "$BDS_LABELS"

echo ""
if [ "$FAIL" -gt 0 ]; then
  echo "── pr-labels: $PASS passed, $FAIL failed"
  for c in "${FAILED_CASES[@]}"; do echo "    ✗ $c"; done
  exit 1
fi
echo "── pr-labels: $PASS passed, 0 failed"
