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
assert_eq "a trailing (#N) is the linked issue" "#1845" \
  "$(issue_refs_in_subjects 'feat(tokens): mint --letter-spacing-wide (#1845)' | flat)"
assert_eq "several subjects yield several refs" "#1719,#1808" \
  "$(issue_refs_in_subjects 'feat(tokens): reconcile foundations (#1719)
feat(tokens): fail the build on shadowed declarations (#1808)' | flat)"
assert_eq "a subject with no ref yields nothing" "" \
  "$(issue_refs_in_subjects 'fix(content-block): scope --on-color to own slots' | flat)"
assert_eq "empty input yields nothing" "" "$(issue_refs_in_subjects '' | flat)"
assert_eq "a bare # with no digits is not a ref" "" \
  "$(issue_refs_in_subjects 'docs: explain the #hashtag convention' | flat)"

echo "── issue_refs_closed_in_bodies ──"
assert_eq "a closing keyword resolves" "#1836" \
  "$(issue_refs_closed_in_bodies 'Closes #1836' | flat)"
assert_eq "every conjugation resolves" "#1,#2,#3,#4,#5,#6,#7,#8,#9" \
  "$(issue_refs_closed_in_bodies 'close #1 closes #2 closed #3 fix #4 fixes #5 fixed #6 resolve #7 resolves #8 resolved #9' | flat)"
assert_eq "the colon form resolves" "#123" "$(issue_refs_closed_in_bodies 'Closes: #123' | flat)"
assert_eq "no space after the keyword still resolves" "#123" \
  "$(issue_refs_closed_in_bodies 'closes#123' | flat)"
assert_eq "case is not an escape" "#123" "$(issue_refs_closed_in_bodies 'CLOSES #123' | flat)"
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

echo "── the grammars agree on a shared corpus (brik-llm#2450) ──"
# THIS IS THE ACTUAL FIX; the grammar is the symptom.
#
# The defect was never one missing keyword. It was that two regexes read the
# same PR bodies with nobody asserting they agreed, so the local resolver could
# be STRICTER than the CI gate it exists to pre-empt — and the way that surfaced
# was pr-task.sh refusing to open PRs the gate would have passed
# (`Part of brikdesigns/brik-llm#2442`, hit three times landing #2442).
#
# One direction only, deliberately. The gate answers "is this PR linked at all";
# the resolver additionally decides Closes vs Refs, and it is allowed to be
# CONSERVATIVE about that — a body the gate accepts must resolve to SOMETHING,
# but the resolver may still route it to `Refs` where the gate is indifferent.
# The failing direction is the one asserted: gate accepts, resolver resolves
# nothing → a PR that cannot be opened by the sanctioned path.
#
# The gate's regex is EXTRACTED from the workflow, never restated here. A
# restated copy is a third spelling of the same grammar, which is the drift this
# test exists to prevent.
# ── Layer 1: the grammars are the SAME GRAMMAR, asserted without an interpreter.
#
# The contracts-gate job that runs this suite is deliberately "a fast bash suite
# plus shellcheck" with no `setup-node` step (contracts-gate.yml § ONE work job),
# so the corpus layer below must be allowed to skip. This layer never skips: it
# extracts the gate's three literals and normalises JS regex spelling to ERE,
# then asserts the result IS what the lib holds. If the gate grows a keyword,
# this fails and prints the new spelling.
#
# The translation is mechanical and total for the constructs these three
# literals use — no other JS regex feature appears in them, and a new one would
# surface here as a mismatch rather than as a silent pass.
js_to_ere() {
  sed -e 's/(?:/(/g' \
      -e 's/\[\\w\.-\]/[A-Za-z0-9._-]/g' \
      -e 's|\\/|/|g' \
      -e 's/\\d/[0-9]/g' \
      -e 's/\\s/[[:space:]]/g'
}
grab_literal() {
  grep -oE "const $1 = String\.raw\`[^\`]*\`" "$GATE" \
    | sed -e "s/^const $1 = String\.raw\`//" -e 's/`$//'
}
assert_eq "the gate's CLOSING is this lib's _IL_CLOSING" \
  "$_IL_CLOSING" "$(grab_literal CLOSING | js_to_ere)"
assert_eq "the gate's LINKING is this lib's _IL_LINKING" \
  "$_IL_LINKING" "$(grab_literal LINKING | js_to_ere)"
assert_eq "the gate's REF is this lib's _IL_REF" \
  "$_IL_REF" "$(grab_literal REF | js_to_ere)"

# ── Layer 2: the two really do agree on real bodies. Skipped without node.
if command -v node >/dev/null 2>&1 && [ -f "$GATE" ]; then
  # A body the gate ACCEPTS. Each must resolve to at least one link line.
  GATE_ACCEPTS=(
    'Closes #1836'
    'closes#123'
    'Closes: #123'
    'CLOSES #123'
    'Fixes #7'
    'resolved #9'
    'Part of brikdesigns/brik-llm#2442'
    'Closes brikdesigns/brik-llm#2442'
    'Refs brikdesigns/brik-bds#1921'
    'Refs #99'
    'Related to #77'
    'Partial for #55'
    'Closes GH-2442'
    'Part of GH-2442'
    '#123 stays open'
  )
  # A body the gate REJECTS. Each must resolve to nothing, or the script opens a
  # PR its own CI check then fails.
  GATE_REJECTS=(
    'Renames prefixes #12'
    'Recurring pattern, see also #1434 and #1437.'
    'The suffixed #12 form'
    'See #123'
    'No reference at all'
  )

  gate_accepts() {
    # shellcheck disable=SC2016  # the JS must reach node unexpanded by bash
    GATE_FILE="$GATE" BODY="$1" node -e '
      const fs = require("fs");
      const src = fs.readFileSync(process.env.GATE_FILE, "utf8");
      // Pull the three String.raw literals the gate builds ISSUE_LINK from.
      const grab = (name) => {
        const m = src.match(new RegExp("const\\s+" + name + "\\s*=\\s*String\\.raw`([^`]*)`"));
        if (!m) { console.error("could not extract " + name + " from the gate"); process.exit(2); }
        return m[1];
      };
      const CLOSING = grab("CLOSING"), LINKING = grab("LINKING"), REF = grab("REF");
      const ISSUE_LINK = new RegExp(
        String.raw`\b(?:${CLOSING}|${LINKING})\b:?\s*(?:${REF})`, "i");
      const STAYS_OPEN = /#\d+\s+stays\s+open\b/i;
      const body = process.env.BODY;
      process.stdout.write((ISSUE_LINK.test(body) || STAYS_OPEN.test(body)) ? "yes" : "no");
    '
  }

  for body in "${GATE_ACCEPTS[@]}"; do
    verdict=$(gate_accepts "$body") || verdict="EXTRACT-FAILED"
    resolved=$(build_issue_links '' "$body")
    if [ "$verdict" != "yes" ]; then
      assert_eq "corpus is honest — the gate really accepts [$body]" "yes" "$verdict"
    else
      assert_ok "gate accepts, resolver resolves: [$body]" test -n "$resolved"
    fi
  done

  for body in "${GATE_REJECTS[@]}"; do
    verdict=$(gate_accepts "$body") || verdict="EXTRACT-FAILED"
    resolved=$(build_issue_links '' "$body")
    if [ "$verdict" != "no" ]; then
      assert_eq "corpus is honest — the gate really rejects [$body]" "no" "$verdict"
    else
      assert_eq "gate rejects, resolver resolves nothing: [$body]" "" "$resolved"
    fi
  done
else
  # Not a failure: layer 1 above already pinned the grammar with no interpreter,
  # and reddening a deliberately node-free job over a missing node would be the
  # cry-wolf failure the gates in this repo keep having to un-learn.
  echo "  ~ node unavailable — corpus layer skipped; layer 1 still asserted the grammar" >&2
fi

echo "── cross-repo refs keep their prefix (brik-llm#2450) ──"
# Stripping the prefix emits a link to THIS repo's issue of that number — a
# different issue, and the mistake stays invisible until the numbering reaches
# it. `fix(x): thing (brikdesigns/brik-llm#2442)` used to render `Refs #2442`.
assert_eq "a cross-repo subject ref is not collapsed to a local one" \
  "Refs brikdesigns/brik-llm#2442" \
  "$(build_issue_links 'fix(x): thing (brikdesigns/brik-llm#2442)' '' | tr -d '\n')"
assert_eq "a cross-repo closing ref keeps its prefix" \
  "Closes brikdesigns/brik-llm#2442" \
  "$(build_issue_links 'fix(x): thing' 'Closes brikdesigns/brik-llm#2442' | tr -d '\n')"
assert_eq "a non-closing form never becomes Closes" \
  "Refs brikdesigns/brik-llm#2442" \
  "$(build_issue_links 'fix(x): thing' 'Part of brikdesigns/brik-llm#2442' | tr -d '\n')"
assert_eq "the GH-N form resolves" "Closes GH-2442" \
  "$(build_issue_links 'fix(x): thing' 'Closes GH-2442' | tr -d '\n')"

echo "── a QUOTED linking keyword is not a directive (brik-llm#2450) ──"
# The commit that added the linking forms tripped this on itself: its body
# quotes the form it fixes as an example, and an unanchored scan emitted a link
# to an issue the PR had nothing to do with. Any commit writing ABOUT issue
# linking — a postmortem, a doc fix, this lib's own changes — hits it.
# shellcheck disable=SC2016  # backticks are the fixture, not a substitution
assert_eq "a linking keyword quoted mid-prose resolves nothing" "" \
  "$(build_issue_links 'fix: x' '`Part of brikdesigns/brik-llm#2442` is the canonical form.' | flat)"
assert_eq "prose mentioning the form inline resolves nothing" "" \
  "$(build_issue_links 'fix: x' 'Two PRs used Part of #2442 and took the hatch.' | flat)"
assert_eq "a real trailer on its own line still resolves" \
  "Refs brikdesigns/brik-llm#2442" \
  "$(build_issue_links 'fix: x' 'Part of brikdesigns/brik-llm#2442' | flat)"
assert_eq "an indented trailer still resolves" "Refs #42" \
  "$(build_issue_links 'fix: x' '    Refs #42' | flat)"
assert_eq "a trailer after prose lines still resolves" "Refs #42" \
  "$(build_issue_links 'fix: x' 'Some explanation first.

Refs #42' | flat)"

echo "── the label block can split what the resolver emits ──"
# pr-task.sh feeds these refs to `gh issue view`, which takes a NUMBER plus
# `--repo` — never `owner/repo#N`. A split that mishandles a shape inherits no
# labels, and the area gate then blames the issue for a label it does carry.
# shellcheck source=/dev/null
source "$(cd "$(dirname "$0")/.." && pwd)/lib/pr-labels.sh"
assert_eq "refs_from_issue_links keeps whole refs" \
  "#7,GH-9,brikdesigns/brik-llm#2442" \
  "$(refs_from_issue_links "$(printf 'Closes brikdesigns/brik-llm#2442\nRefs #7\nRefs GH-9\n')" | flat)"
assert_eq "number splits out of a cross-repo ref" "2442" "$(issue_ref_number 'brikdesigns/brik-llm#2442')"
assert_eq "number splits out of a local ref"      "7"    "$(issue_ref_number '#7')"
assert_eq "number splits out of the GH-N form"    "9"    "$(issue_ref_number 'GH-9')"
assert_eq "repo splits out of a cross-repo ref" "brikdesigns/brik-llm" "$(issue_ref_repo 'brikdesigns/brik-llm#2442')"
assert_eq "a local ref has no repo"    "" "$(issue_ref_repo '#7')"
assert_eq "the GH-N form has no repo"  "" "$(issue_ref_repo 'GH-9')"

echo ""
if [ "$FAIL" -gt 0 ]; then
  echo "── issue-links: $PASS passed, $FAIL failed"
  for c in "${FAILED_CASES[@]}"; do echo "    ✗ $c"; done
  exit 1
fi
echo "── issue-links: $PASS passed, 0 failed"
