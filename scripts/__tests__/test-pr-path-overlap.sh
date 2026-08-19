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

echo "── ticket_paths_from_text: the false-positive bar (brik-llm#2313) ──"

# A realistic tracked-file list. `config.json` lives in two directories and
# nowhere at root, which is what makes the uniqueness rule load-bearing rather
# than decorative. `README.md` is deliberately BOTH a root path and a duplicated
# basename — the two rules have to be tested apart.
TRACKED='scripts/new-task.sh
scripts/pr-task.sh
scripts/lib/pr-path-overlap.sh
scripts/lib/issue-overlap.sh
scripts/test/test-pr-path-overlap.sh
web/alpha/config.json
web/beta/config.json
README.md
operations/mcp/README.md'

assert_eq "a full path written in the body is found" "scripts/lib/pr-path-overlap.sh" \
  "$(ticket_paths_from_text 'see `scripts/lib/pr-path-overlap.sh` for the predicate' "$TRACKED")"

# The reason bare basenames are resolved at all: brik-llm#2313's own body writes
# new-task.sh five times and never once writes scripts/new-task.sh.
assert_eq "an unambiguous bare basename resolves to its tracked path" "scripts/new-task.sh" \
  "$(ticket_paths_from_text 'new-task.sh is where the question is cheap to answer' "$TRACKED")"

# The near-miss the whole gate lives or dies on (brik-llm#2101 — a gate that cries wolf
# gets disabled). Two tracked files carry config.json, so it resolves to neither
# rather than to an arbitrary one.
assert_eq "an AMBIGUOUS bare basename resolves to nothing" "" \
  "$(ticket_paths_from_text 'bump the version in config.json while you are there' "$TRACKED")"

# The paired rule, and the reason the two cases need separate fixtures: a
# duplicated basename that is ALSO a tracked path in its own right is an exact
# match, not an ambiguous one. `README.md` is a real repo-relative path.
assert_eq "a duplicated basename that IS a root path still matches exactly" "README.md" \
  "$(ticket_paths_from_text 'update the README.md while you are in there' "$TRACKED")"

assert_eq "a path-shaped string that is not a tracked file is dropped" "" \
  "$(ticket_paths_from_text 'filed against brikdesigns/brik-llm as a sub-issue' "$TRACKED")"
assert_eq "a URL is dropped" "" \
  "$(ticket_paths_from_text 'see https://research.trychroma.com/context-rot for why' "$TRACKED")"
assert_eq "prose with no paths at all yields nothing" "" \
  "$(ticket_paths_from_text 'Turn the advisory guidance into enforced gates.' "$TRACKED")"
assert_eq "a bare word with no dot never resolves" "" \
  "$(ticket_paths_from_text 'the operations directory and the scripts directory' "$TRACKED")"

# file:line references are how this repo cites code, so the suffix must not
# defeat the match.
assert_eq "a file:line citation still matches the file" "scripts/new-task.sh" \
  "$(ticket_paths_from_text 'beside the existing source at scripts/new-task.sh:44-45' "$TRACKED")"
assert_eq "a trailing sentence period is stripped" "scripts/pr-task.sh" \
  "$(ticket_paths_from_text 'It is only wired into scripts/pr-task.sh.' "$TRACKED")"
assert_eq "a markdown-link target matches" "scripts/pr-task.sh" \
  "$(ticket_paths_from_text 'see [the script](scripts/pr-task.sh) for detail' "$TRACKED")"

assert_eq "the same path named twice is returned once" "scripts/new-task.sh" \
  "$(ticket_paths_from_text 'new-task.sh … and scripts/new-task.sh again' "$TRACKED")"

# The live under-report, pinned so it is a known cost rather than a surprise:
# brik-llm tracks two new-task.sh, so brik-llm#2313's own bare mentions resolve to
# nothing and only its fully-qualified paths are seen. Emitting both candidates
# would warn about scripts/shared/ for a ticket that meant scripts/ (brik-llm#2101).
DUP_TRACKED='scripts/new-task.sh
scripts/shared/new-task.sh
scripts/lib/pr-path-overlap.sh'
assert_eq "a bare basename tracked twice yields nothing — under-report, not a wrong report" "" \
  "$(ticket_paths_from_text 'wire the check into new-task.sh' "$DUP_TRACKED")"
assert_eq "…and the fully-qualified sibling in the same body still matches" "scripts/new-task.sh" \
  "$(ticket_paths_from_text 'wire it into new-task.sh, at scripts/new-task.sh:44-45' "$DUP_TRACKED")"
assert_eq "empty text → nothing" "" "$(ticket_paths_from_text '' "$TRACKED")"
assert_eq "empty tracked list → nothing (never guess without the repo)" "" \
  "$(ticket_paths_from_text 'scripts/new-task.sh' '')"

echo "── _pto_partition_records ──"

# 2313's own PR, plus two unrelated tickets — one of which shares a file.
TRECORDS="$(printf '%s\n' \
  '2400	task/path-overlap-at-task-start	feat(new-task): path overlap at task-start (#2313)	scripts/new-task.sh' \
  '2401	task/budget-note	docs(budget): note the ledger key (#2404)	scripts/new-task.sh,docs/x.md' \
  '2402	task/unrelated	chore: bump submodule (#2405)	package.json')"

assert_eq "the ticket's own PR is partitioned out by title reference" "2400" \
  "$(printf '%s\n' "$TRECORDS" | _pto_partition_records 2313 mine | cut -f1 | paste -sd'|' -)"
assert_eq "every other PR stays in the comparison set" "2401|2402" \
  "$(printf '%s\n' "$TRECORDS" | _pto_partition_records 2313 others | cut -f1 | paste -sd'|' -)"
# Prefix safety: the token 2313 must not claim #23130's PR, nor #231's.
assert_eq "a longer number is not this ticket" "" \
  "$(printf '%s\n' '2500	task/x	feat: thing (#23130)	a.sh' | _pto_partition_records 2313 mine | cut -f1)"

echo "── _pto_issue_api_path ──"
assert_eq "a bare number uses gh's owner/repo placeholders" \
  "repos/{owner}/{repo}/issues/2313" "$(_pto_issue_api_path 2313)"
assert_eq "a #-prefixed number is accepted" \
  "repos/{owner}/{repo}/issues/2313" "$(_pto_issue_api_path '#2313')"
assert_eq "a cross-repo ref resolves to that repo" \
  "repos/brikdesigns/brik-bds/issues/1545" "$(_pto_issue_api_path 'brikdesigns/brik-bds#1545')"
assert_eq "garbage is refused rather than guessed at" "1" \
  "$(_pto_issue_api_path 'not-a-ticket' >/dev/null 2>&1; echo $?)"

echo "── check_ticket_path_overlap: full orchestration (all three reads injected) ──"

fake_tracked() { printf '%s\n' "$TRACKED"; }
fake_text()    { printf 'Run the path-overlap check at task-start\nWire it into new-task.sh before the worktree exists.\n'; }
empty_text()   { printf 'Decide the claim mechanism and record it.\n'; }
t_prs()        { printf '%s\n' "$TRECORDS"; }
t_unrelated()  { printf '%s\n' '2402	task/unrelated	chore: bump submodule (#2405)	package.json'; }

run_tcheck() {
  PTO_TEXT_CMD=fake_text PTO_TRACKED_CMD=fake_tracked GH_OPEN_PR_CMD="$1" \
    check_ticket_path_overlap "${2:-2313}" 2>&1
}

OUT="$(run_tcheck t_prs)"
assert_eq "the colliding PR on a DIFFERENT ticket is named" "yes" \
  "$(printf '%s' "$OUT" | grep -q 'PR #2401' && echo yes || echo no)"
assert_eq "the shared path is printed" "yes" \
  "$(printf '%s' "$OUT" | grep -q 'scripts/new-task.sh' && echo yes || echo no)"
# The duplicate-warning noise this must not produce: brik-llm#1533 already named #2400.
assert_eq "the ticket's OWN open PR is not re-reported as a collision" "no" \
  "$(printf '%s' "$OUT" | grep -q 'PR #2400' && echo yes || echo no)"
assert_eq "it returns 0 — this warns, it never blocks worktree creation" "0" \
  "$(run_tcheck t_prs >/dev/null 2>&1; echo $?)"
assert_eq "non-interactive continues instead of reading stdin" "yes" \
  "$(run_tcheck t_prs </dev/null | grep -q 'non-interactive: continuing' && echo yes || echo no)"

OUT="$(run_tcheck t_unrelated)"
assert_eq "no overlap says so once, and names no PR" "yes" \
  "$(printf '%s' "$OUT" | grep -q 'No open PR touches a path named in #2313' && echo yes || echo no)"
assert_eq "no overlap prints no PR number" "no" \
  "$(printf '%s' "$OUT" | grep -q 'PR #' && echo yes || echo no)"

# AC: paths not knowable up front → no-op WITH A NOTE, never a failure and never
# a silence that reads as an all-clear.
OUT="$(PTO_TEXT_CMD=empty_text PTO_TRACKED_CMD=fake_tracked GH_OPEN_PR_CMD=t_unrelated \
       check_ticket_path_overlap 2315 2>&1)"
assert_eq "a ticket naming no paths says SKIPPED, not passed" "yes" \
  "$(printf '%s' "$OUT" | grep -q 'No repo paths named in #2315 — same-path check skipped, not passed' && echo yes || echo no)"
assert_eq "a ticket naming no paths never prints the all-clear" "no" \
  "$(printf '%s' "$OUT" | grep -q 'No open PR touches' && echo yes || echo no)"
assert_eq "a ticket naming no paths still returns 0" "0" \
  "$(PTO_TEXT_CMD=empty_text PTO_TRACKED_CMD=fake_tracked GH_OPEN_PR_CMD=t_unrelated \
     check_ticket_path_overlap 2315 >/dev/null 2>&1; echo $?)"

OUT="$(run_tcheck failing_gh)"
assert_eq "a failed gh call warns that the check was SKIPPED" "yes" \
  "$(printf '%s' "$OUT" | grep -q 'ticket path-overlap skipped, not passed' && echo yes || echo no)"
assert_eq "a failed gh call never prints the all-clear" "no" \
  "$(printf '%s' "$OUT" | grep -q 'No open PR touches' && echo yes || echo no)"

# The blind spot brik-llm#2313 exists to close, end to end: two sessions, two tickets,
# one file. The number-keyed gate reports clean on this input.
assert_eq "the same-file-different-ticket case is caught before any file is written" "yes" \
  "$(run_tcheck t_prs </dev/null | grep -q 'DIFFERENT tickets' && echo yes || echo no)"

echo "── new-task.sh wiring (brik-llm#2313) ──"

# The gate is only a gate if it is CALLED. Everything above passes with the call
# site deleted — which is precisely how both of new-task.sh's overlap gates
# failed silently in production for months (lib/overlap-filters.sh:8-10). This
# reads the script as text; no git, no network, consistent with the rest.
NEW_TASK="$(cd "$(dirname "$0")/.." && pwd)/new-task.sh"
assert_eq "new-task.sh sources the same-path lib" "yes" \
  "$(grep -q 'lib/pr-path-overlap.sh' "$NEW_TASK" && echo yes || echo no)"
assert_eq "new-task.sh actually calls the task-start check" "yes" \
  "$(grep -qE '^[[:space:]]*check_ticket_path_overlap[[:space:]]' "$NEW_TASK" && echo yes || echo no)"
# Ordering: before the worktree exists is the entire premise of brik-llm#2313.
assert_eq "the check runs BEFORE git worktree add" "yes" \
  "$(awk '/^[[:space:]]*check_ticket_path_overlap[[:space:]]/ {c=NR}
          /git worktree add/ {w=NR}
          END { print (c > 0 && w > 0 && c < w) ? "yes" : "no" }' "$NEW_TASK")"

echo ""
if [ "$FAIL" -gt 0 ]; then
  echo "── pr-path-overlap: $PASS passed, $FAIL failed"
  for c in "${FAILED_CASES[@]}"; do echo "    ✗ $c"; done
  exit 1
fi
echo "── pr-path-overlap: $PASS passed, 0 failed"
