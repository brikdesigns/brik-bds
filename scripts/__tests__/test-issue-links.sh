#!/usr/bin/env bash
# Contract gate for the PR issue-link resolver (lib/issue-links.sh).
#
# brik-bds#1882. The failure this reproduces is the one that hit 16 of the last
# 21 merged feat/fix PRs: `(#N)` in the commit SUBJECT and nowhere in the body,
# so GitHub's `closingIssuesReferences` came back empty on merge and the linkage
# was restored by hand afterwards.
#
# The load-bearing assertions here are the two the resolver is easiest to get
# subtly wrong on, both of which produce a WRONG close rather than a missing one:
#
#   1. A subject ref must become `Refs #N`, never `Closes #N`. Promoting it
#      auto-closes umbrellas and half-done issues on merge — exactly what
#      bump-pr-closing-keyword-guard.yml rules 3 and 4 exist to catch after the
#      fact.
#   2. `Renames prefixes #12` must resolve NOTHING. `fixes` lives inside
#      `prefixes`, so an unbounded keyword pattern closes #12 off a line that
#      never mentioned it. pr-issue-link-gate.yml rejects that line via `\b`;
#      the two halves disagreeing means the script opens a PR its own CI check
#      then fails.
#
# No network. A throwaway repo for the git-reading half only; every other case
# drives the pure helpers directly. The unset below is per brik-bds#1539: a test
# invoked from a git hook inherits GIT_DIR, which is how the sibling
# overlap-filters test rewrote refs in the live repo.
#
# Run: bash scripts/__tests__/test-issue-links.sh

set -u
unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE GIT_COMMON_DIR GIT_NAMESPACE \
      GIT_OBJECT_DIRECTORY GIT_ALTERNATE_OBJECT_DIRECTORIES

LIB="$(cd "$(dirname "$0")/.." && pwd)/lib/issue-links.sh"
[ -f "$LIB" ] || { echo "lib not found at $LIB"; exit 1; }
# shellcheck source=/dev/null
source "$LIB"
# shellcheck source=/dev/null
source "$(cd "$(dirname "$0")/.." && pwd)/lib/identity-guard.sh"

PASS=0; FAIL=0; FAILED_CASES=()

assert_eq() {
  local label="$1" want="$2" got="$3"
  if [ "$want" = "$got" ]; then PASS=$((PASS+1)); echo "  ✓ $label";
  else FAIL=$((FAIL+1)); FAILED_CASES+=("$label"); echo "  ✗ $label"; echo "      want: [$want]"; echo "      got:  [$got]"; fi
}
assert_ok()  { local label="$1"; shift; if "$@"; then PASS=$((PASS+1)); echo "  ✓ $label"; else FAIL=$((FAIL+1)); FAILED_CASES+=("$label"); echo "  ✗ $label (expected success)"; fi; }
assert_not() { local label="$1"; shift; if "$@"; then FAIL=$((FAIL+1)); FAILED_CASES+=("$label"); echo "  ✗ $label (expected failure)"; else PASS=$((PASS+1)); echo "  ✓ $label"; fi; }

flat() { paste -sd, -; }

echo "── issue_refs_in_subjects ──"
assert_eq "a trailing (#N) is the linked issue" "1845" \
  "$(issue_refs_in_subjects 'feat(tokens): mint --letter-spacing-wide (#1845)' | flat)"
assert_eq "several subjects yield several refs" "1719,1808" \
  "$(issue_refs_in_subjects 'feat(tokens): reconcile foundations (#1719)
feat(tokens): fail the build on shadowed declarations (#1808)' | flat)"
assert_eq "a subject with no ref yields nothing" "" \
  "$(issue_refs_in_subjects 'fix(content-block): scope --on-color to own slots' | flat)"
assert_eq "empty input yields nothing" "" "$(issue_refs_in_subjects '' | flat)"
assert_eq "a bare # with no digits is not a ref" "" \
  "$(issue_refs_in_subjects 'docs: explain the #hashtag convention' | flat)"

echo "── issue_refs_closed_in_bodies ──"
assert_eq "a closing keyword resolves" "1836" \
  "$(issue_refs_closed_in_bodies 'Closes #1836' | flat)"
assert_eq "every conjugation resolves" "1,2,3,4,5,6,7,8,9" \
  "$(issue_refs_closed_in_bodies 'close #1 closes #2 closed #3 fix #4 fixes #5 fixed #6 resolve #7 resolves #8 resolved #9' | flat)"
assert_eq "the colon form resolves" "123" "$(issue_refs_closed_in_bodies 'Closes: #123' | flat)"
assert_eq "no space after the keyword still resolves" "123" \
  "$(issue_refs_closed_in_bodies 'closes#123' | flat)"
assert_eq "case is not an escape" "123" "$(issue_refs_closed_in_bodies 'CLOSES #123' | flat)"
# THE ASSERTION THAT MATTERS (2): an unbounded pattern matches `fixes` inside
# `prefixes` and closes an issue the line never referred to.
assert_eq "'prefixes #12' resolves NOTHING — the keyword is inside a word" "" \
  "$(issue_refs_closed_in_bodies 'Renames prefixes #12' | flat)"
assert_eq "'suffixed #12' resolves NOTHING either" "" \
  "$(issue_refs_closed_in_bodies 'The suffixed #12 form' | flat)"
assert_eq "a bare prose mention is NOT a close" "" \
  "$(issue_refs_closed_in_bodies 'Recurring pattern, see also #1434 and #1437.' | flat)"
assert_eq "'See #123' is not a closing keyword" "" \
  "$(issue_refs_closed_in_bodies 'See #123' | flat)"

echo "── build_issue_links: the two polarities ──"
assert_eq "a body closing keyword becomes Closes" "Closes #1836" \
  "$(build_issue_links 'fix(page-header): default content gap to --gap-lg' 'Closes #1836' | flat)"
# THE ASSERTION THAT MATTERS (1): promoting this to Closes auto-closes umbrellas.
assert_eq "a SUBJECT ref becomes Refs, never Closes" "Refs #1845" \
  "$(build_issue_links 'feat(tokens): mint --letter-spacing-wide (#1845)' '' | flat)"
assert_eq "the same #N in both places is Closes ONCE, never also Refs" "Closes #1808" \
  "$(build_issue_links 'fix(tokens): fail the build on shadowed declarations (#1808)' 'Closes #1808' | flat)"
assert_eq "Closes lines precede Refs lines" "Closes #1854,Refs #1719" \
  "$(build_issue_links 'feat(tokens): reconcile foundations (#1719)
feat(tokens): typed fallback-literal exemptions' 'Closes #1854' | flat)"
assert_eq "duplicate refs collapse" "Refs #1719" \
  "$(build_issue_links 'feat: a (#1719)
feat: b (#1719)' '' | flat)"
assert_eq "refs sort numerically, not lexically" "Refs #9,Refs #10,Refs #100" \
  "$(build_issue_links 'a (#100) b (#9) c (#10)' '' | flat)"
assert_eq "nothing to resolve yields an empty block" "" \
  "$(build_issue_links 'fix(content-block): scope --on-color to own slots' '' | flat)"
assert_eq "prose-only body plus refless subject yields an empty block" "" \
  "$(build_issue_links 'fix(build): unrelated' 'Recurring, see also #1434 and #1437.' | flat)"

echo "── build_issue_links: the --no-issue hatch ──"
assert_eq "a reason appends the Issue-exempt line" \
  "Issue-exempt: one-off CI credential rotation, no tracked issue" \
  "$(build_issue_links 'fix(ci): rotate' '' 'one-off CI credential rotation, no tracked issue' | flat)"
assert_eq "a reason does not suppress resolved refs" \
  "Closes #1836,Issue-exempt: one-off CI credential rotation, no tracked issue" \
  "$(build_issue_links 'fix: x' 'Closes #1836' 'one-off CI credential rotation, no tracked issue' | flat)"

echo "── issue_exempt_reason_ok ──"
assert_ok  "a 20-char reason is exactly long enough" issue_exempt_reason_ok "12345678901234567890"
assert_not "a 19-char reason is not" issue_exempt_reason_ok "1234567890123456789"
assert_not "an empty reason is not" issue_exempt_reason_ok ""

echo "── issue_link_required: scope must match the gate's IN_SCOPE_TITLE ──"
assert_ok  "feat is in scope"            issue_link_required 'feat(tokens): mint the motion scale'
assert_ok  "fix is in scope"             issue_link_required 'fix(page-header): default gap'
assert_ok  "a breaking bang is in scope" issue_link_required 'feat!: drop the legacy surface tokens'
assert_ok  "scope plus bang is in scope" issue_link_required 'fix(tokens)!: rename the ramp'
assert_ok  "uppercase is not an escape"  issue_link_required 'FIX: casing is not an escape'
assert_not "chore is out of scope"       issue_link_required 'chore(deps): bump vite from 7.1.2 to 7.1.3'
assert_not "docs is out of scope"        issue_link_required 'docs(primitives): document the motion token scale'
assert_not "refactor is out of scope"    issue_link_required 'refactor(lib): extract a token helper'
assert_not "ci is out of scope"          issue_link_required 'ci: pin the playwright image'
assert_not "test is out of scope"        issue_link_required 'test(visual): add a case'
assert_not "build is out of scope"       issue_link_required 'build: bump the target'
assert_not "perf is out of scope"        issue_link_required 'perf(tokens): trim the css'
assert_not "style is out of scope"       issue_link_required 'style: reformat'
assert_not "revert is out of scope"      issue_link_required 'revert: undo the ramp rename'
assert_not "a non-conventional title is out of scope" issue_link_required 'Update the thing'
assert_not "fixup is not fix"            issue_link_required 'fixup: squash me'
assert_not "feature is not feat"         issue_link_required 'feature: not the canonical type'
assert_not "no space after the colon is not conventional" issue_link_required 'fix:no-space'
assert_not "an empty title is out of scope" issue_link_required ''

echo "── resolve_issue_links: over a real commit range ──"

TMPROOT="$(mktemp -d "${TMPDIR:-/tmp}/brik-issue-links-test-XXXXXXXX")"
trap 'rm -rf "$TMPROOT"' EXIT
case "$TMPROOT" in
  /*/brik-issue-links-test-*) : ;;
  *) echo "refusing to run: TMPROOT looks wrong ($TMPROOT)"; exit 1 ;;
esac

REPO="$TMPROOT/r"
git init -q -b main "$REPO"
# Prove the fixture is what the git calls resolve to before any of them mutate
# anything — belt to the unset above's braces (#1539, #1634).
assert_throwaway_repo "$REPO" "issue-links fixture"
git -C "$REPO" config user.email t@example.com
git -C "$REPO" config user.name Test

echo base > "$REPO/a.txt"
git -C "$REPO" add -A && git -C "$REPO" commit -qm "chore: base"

git -C "$REPO" checkout -q -b task/fixture
echo one > "$REPO/b.txt"
git -C "$REPO" add -A && git -C "$REPO" commit -qm "feat(tokens): reconcile foundations (#1719)"
echo two > "$REPO/c.txt"
git -C "$REPO" add -A && git -C "$REPO" commit -q -F - <<'MSG'
feat(tokens): typed fallback-literal exemptions

Closes #1854
MSG

assert_eq "the range resolves both polarities in one pass" "Closes #1854,Refs #1719" \
  "$(cd "$REPO" && resolve_issue_links main..HEAD | flat)"
assert_eq "an empty range resolves nothing" "" \
  "$(cd "$REPO" && resolve_issue_links main..main | flat)"

# A base-sync merge commit must contribute nothing. Its subject is
# `Merge branch 'other' into task/fixture` — no ref — but a future edit that
# drops --no-merges would also start reading the merged-in commits' messages,
# which belong to the BASE, not to this PR.
git -C "$REPO" checkout -q main
echo other > "$REPO/d.txt"
git -C "$REPO" add -A && git -C "$REPO" commit -q -F - <<'MSG'
fix(other): a change that landed on the base

Closes #9999
MSG
git -C "$REPO" checkout -q task/fixture
git -C "$REPO" merge -q --no-edit main

assert_eq "a merged-in BASE commit's Closes is not claimed by this PR" "Closes #1854,Refs #1719" \
  "$(cd "$REPO" && resolve_issue_links main..HEAD | flat)"

echo "── sourcing safety ──"
# Callers are pr-task.sh (set -euo pipefail) and this test. Sourcing must be
# inert: no CLI run, no options leaked, no abort under set -u.
assert_eq "sourcing under set -u does not abort" "sourced-ok" \
  "$(bash -c "set -euo pipefail; source '$LIB'; echo sourced-ok" 2>&1)"
assert_eq "sourcing does not turn on errexit in the caller" "no-errexit" \
  "$(bash -c "source '$LIB'; case \$- in *e*) echo LEAKED-errexit ;; *) echo no-errexit ;; esac" 2>&1)"
assert_eq "sourcing does not turn on nounset in the caller" "no-nounset" \
  "$(bash -c "source '$LIB'; case \$- in *u*) echo LEAKED-nounset ;; *) echo no-nounset ;; esac" 2>&1)"
assert_eq "sourcing runs no CLI block and prints nothing" "" \
  "$(cd "$REPO" && bash -c "source '$LIB'" 2>&1)"

echo "── parity with the CI gate's threshold ──"
# The script must not open a PR whose Issue-exempt reason the gate then rejects.
GATE="$(cd "$(dirname "$0")/../.." && pwd)/.github/workflows/pr-issue-link-gate.yml"
assert_eq "MIN_REASON_CHARS in the gate matches ISSUE_LINK_MIN_REASON_CHARS here" \
  "$ISSUE_LINK_MIN_REASON_CHARS" \
  "$(grep -oE 'MIN_REASON_CHARS = [0-9]+' "$GATE" | grep -oE '[0-9]+' | head -1)"

echo ""
if [ "$FAIL" -gt 0 ]; then
  echo "── issue-links: $PASS passed, $FAIL failed"
  for c in "${FAILED_CASES[@]}"; do echo "    ✗ $c"; done
  exit 1
fi
echo "── issue-links: $PASS passed, 0 failed"
