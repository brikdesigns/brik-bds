#!/usr/bin/env bash
# Locks scripts/lib/issue-path-overlap.sh — brik-llm#2314.
#
# The defect this pins is a CORPUS that excludes open issues. Every gate in the
# #1485 family reads published git state — branches, PRs, worktrees — so on
# 2026-08-18 two commits landed on `monitor/backup_health.py` while an open issue
# described a defect in that same file, with `issue-overlap.sh` and
# `pr-path-overlap.sh` both correctly clean.
#
# So the assertions below are about WHAT IS IN THE CORPUS (title AND body),
# WHAT MUST STAY OUT (the near-miss, and this session's own ticket), and whether
# a cross-repo hit is a real shared file or a shared filename. Those are the
# classes this family's history says actually happen — cf. #2765, where a unit
# test of a scorer stayed green through a dispatch that never called it.
#
# No network, no repo reads: every source is stubbed.
#
# Run: bash scripts/test/test-issue-path-overlap.sh

set -u
unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE GIT_COMMON_DIR GIT_NAMESPACE \
      GIT_OBJECT_DIRECTORY GIT_ALTERNATE_OBJECT_DIRECTORIES

LIB="$(cd "$(dirname "$0")/.." && pwd)/lib/issue-path-overlap.sh"
[ -f "$LIB" ] || { echo "lib not found at $LIB"; exit 1; }

PASS=0; FAIL=0; FAILED_CASES=()
assert_eq() {
  local label="$1" want="$2" got="$3"
  if [ "$want" = "$got" ]; then PASS=$((PASS+1)); echo "  ✓ $label";
  else FAIL=$((FAIL+1)); FAILED_CASES+=("$label"); echo "  ✗ $label"; echo "      want: [$want]"; echo "      got:  [$got]"; fi
}
saw() { case "$1" in *"$2"*) echo yes ;; *) echo no ;; esac; }

# Tracked files of the repo under test. The anchoring rule is #2313's — a token
# only resolves if it is a file that EXISTS — so this list is what makes the
# near-miss case a near-miss rather than an arbitrary string comparison.
TRACKED='scripts/lib/issue-overlap.sh
scripts/lib/pr-path-overlap.sh
scripts/new-task.sh
monitor/backup_health.py
monitor/backup_report.py'

# The corpus. Three shapes on purpose:
#   9    — names the file in the BODY only  (the live #2314 case)
#   77   — names the file in the TITLE only
#   88   — the near-miss: path-shaped tokens that resolve to nothing, plus a
#          DIFFERENT tracked file in the same directory
#   2314 — this session's own ticket, which names its own files by construction
ROWS="$(printf '%s\n' \
  $'9\tbackup_health short-circuits on newest_mtime\t9 backup_health short-circuits on newest_mtime The guard in monitor/backup_health.py returns early so a stale snapshot reads as fresh.' \
  $'77\tRewrite monitor/backup_health.py around RELOADABLE\t77 Rewrite monitor/backup_health.py around RELOADABLE No body.' \
  $'88\tPoint brikdesigns/brik-llm at e.g. the new https://example.com/context-rot doc\t88 Point brikdesigns/brik-llm at e.g. the new https://example.com/context-rot doc Also touches monitor/backup_report.py which is a different file.' \
  $'2314\tWarn when an open issue names a file you are about to edit\t2314 Warn when an open issue names a file you are about to edit Reuses monitor/backup_health.py as its example.')"

# The ticket being started: names one file, in its body.
TICKET_TEXT=$'Rewrite the reload guard\nThe change lands in monitor/backup_health.py and nowhere else.'

run() {
  local rows="${1:-$ROWS}" fleet="${2:-}" ticket="${3:-$TICKET_TEXT}"
  (
    # shellcheck source=/dev/null
    source "$LIB"
    # Stubs defined AFTER the source: sourcing re-defines the real functions on
    # top of anything injected earlier (test-overlap-standalone-dispatch.sh).
    eval "_stub_rows() { case \"\$1\" in
            brikdesigns/brik-llm) printf '%s' '$rows' ;;
            *) printf '%s' '${fleet}' ;;
          esac; }"
    eval "_stub_text() { printf '%s' '$ticket'; }"
    eval "_stub_tracked() { printf '%s' '$TRACKED'; }"
    IPO_ROWS_CMD=_stub_rows
    PTO_TEXT_CMD=_stub_text
    IPO_TRACKED_CMD=_stub_tracked
    IPO_TRACKED_IN_CMD=_stub_tracked_in
    IPO_FLEET_CMD="${FLEET_CMD:-_stub_fleet_none}"
    _stub_fleet_none() { :; }
    _stub_tracked_in() { printf '%s' "$TRACKED"; }
    export TRACKED
    check_issue_path_overlap "brikdesigns/brik-llm#2314"
  ) 2>&1
}

echo "── the corpus is open ISSUES, title AND body (AC1) ──"

OUT="$(run)"
assert_eq "a path named only in the BODY fires"  "yes" "$(saw "$OUT" "#9 —")"
assert_eq "a path named only in the TITLE fires" "yes" "$(saw "$OUT" "#77 —")"
assert_eq "the matching path is named back"      "yes" "$(saw "$OUT" "monitor/backup_health.py")"

echo "── the near-miss must NOT fire (AC3 — #2101's bar) ──"

assert_eq "path-shaped prose that resolves to no tracked file stays out" \
  "no" "$(saw "$OUT" "#88 —")"

echo "── this session's own ticket stays out ──"

assert_eq "the ticket being started is not reported back at itself" \
  "no" "$(saw "$OUT" "#2314 —")"

echo "── silence is not an option, but a clean read is quiet ──"

CLEAN="$(run "$(printf '%s' $'88\tUnrelated\t88 Unrelated nothing here')")"
assert_eq "a clean read says so explicitly, never nothing" \
  "yes" "$(saw "$CLEAN" "No open issue names a path")"
assert_eq "a clean read prints no warning block" \
  "no" "$(saw "$CLEAN" "Open issue(s) naming")"

NOPATHS="$(run "$ROWS" "" "A ticket about no files at all, only prose.")"
assert_eq "a ticket naming no repo path says SKIPPED, not passed" \
  "yes" "$(saw "$NOPATHS" "skipped, not passed")"

echo "── the cross-repo half keys on the FILE, not the filename ──"

# Same fixture rows served for the sibling repo, so the only thing that can
# change the verdict is the blob-identity predicate.
FOREIGN=$'40\tbackup_health guard is wrong in bds too\t40 backup_health guard is wrong in bds too See monitor/backup_health.py'

run_fleet() {
  local identical="$1"
  (
    # shellcheck source=/dev/null
    source "$LIB"
    eval "_stub_rows() { case \"\$1\" in
            brikdesigns/brik-llm) printf '%s' '$ROWS' ;;
            *) printf '%s' '$FOREIGN' ;;
          esac; }"
    eval "_stub_text() { printf '%s' '$TICKET_TEXT'; }"
    eval "_stub_tracked() { printf '%s' '$TRACKED'; }"
    eval "_stub_fleet() { printf '%s\t%s\n' '/nonexistent/brik-bds' 'brik-bds'; }"
    # The predicate under test, stubbed at the blob-comparison boundary: with a
    # real checkout this is `git rev-parse HEAD:<path>` on both sides.
    eval "_ipo_identical_paths() { printf '%s' '$identical'; }"
    # The lib reads these by INDIRECTION — `${IPO_ROWS_CMD:-_ipo_open_issue_rows}`
    # — which shellcheck cannot follow, so it reports every seam as unused.
    # shellcheck disable=SC2034
    {
      IPO_ROWS_CMD=_stub_rows
      PTO_TEXT_CMD=_stub_text
      IPO_TRACKED_CMD=_stub_tracked
      IPO_TRACKED_IN_CMD=_stub_tracked
      IPO_FLEET_CMD=_stub_fleet
    }
    check_issue_path_overlap "brikdesigns/brik-llm#2314"
  ) 2>&1
}

SHARED="$(run_fleet 'monitor/backup_health.py')"
assert_eq "a byte-identical file in a sibling repo IS reported" \
  "yes" "$(saw "$SHARED" "brik-bds#40")"
assert_eq "and is marked as such, so it reads as a twin not a local hit" \
  "yes" "$(saw "$SHARED" "byte-identical here")"

SAMENAME="$(run_fleet '')"
assert_eq "a shared FILENAME with a different blob is NOT reported" \
  "no" "$(saw "$SAMENAME" "brik-bds#40")"
assert_eq "and the local hits still stand on their own" \
  "yes" "$(saw "$SAMENAME" "#9 —")"

echo "── the advisory contract (never blocks, never aborts) ──"

run >/dev/null 2>&1
assert_eq "rc 0 when it printed hits" "0" "$?"
run "$(printf '%s' $'88\tUnrelated\t88 Unrelated nothing here')" >/dev/null 2>&1
assert_eq "rc 0 on a clean read" "0" "$?"

# The #2423 discipline: this lib is sourced by new-task.sh under `set -euo
# pipefail`, where a grep that filters everything exits 1 and takes the caller
# down before it can print. A unit call in a permissive shell cannot see that.
# Positional args are read into globals FIRST: inside a function body `$2` is
# that function's argument, not the script's, so a stub written that way returns
# empty and the case passes for the wrong reason.
strict_run() {
  T_ROWS="$1" T_TRACKED="$2" T_TEXT="$3" LIB="$LIB" bash -c '
    set -euo pipefail
    source "$LIB"
    _stub_rows()    { printf "%s" "$T_ROWS"; }
    _stub_text()    { printf "%s" "$T_TEXT"; }
    _stub_tracked() { printf "%s" "$T_TRACKED"; }
    _stub_fleet()   { :; }
    IPO_ROWS_CMD=_stub_rows PTO_TEXT_CMD=_stub_text \
    IPO_TRACKED_CMD=_stub_tracked IPO_FLEET_CMD=_stub_fleet \
      check_issue_path_overlap "brikdesigns/brik-llm#2314"
    echo SURVIVED
  ' 2>&1
}

STRICT="$(strict_run "$ROWS" "$TRACKED" "A ticket about no files at all.")"
assert_eq "survives set -euo pipefail on the no-paths branch" \
  "yes" "$(saw "$STRICT" "SURVIVED")"

STRICT_HITS="$(strict_run "$ROWS" "$TRACKED" "$TICKET_TEXT")"
assert_eq "survives set -euo pipefail on the branch that PRINTS hits" \
  "yes" "$(saw "$STRICT_HITS" "SURVIVED")"
assert_eq "and the hits are still there under strict mode" \
  "yes" "$(saw "$STRICT_HITS" "#9 —")"

echo "── the REAL blob predicate, under strict mode, on real repos ──"

# The cases above stub `_ipo_identical_paths`, and that is exactly how the live
# break got through: with the stub gone, a path list whose LAST entry does not
# match made the loop return 1 and `set -e` killed the gate mid-output. A run of
# #2314 printed nothing at all. So this case uses no stub — two throwaway git
# repos, one shared file and one that differs, driven under `set -euo pipefail`.
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
for r in a b; do
  mkdir -p "$TMP/$r"
  git -C "$TMP/$r" init -q
  git -C "$TMP/$r" config user.email t@t; git -C "$TMP/$r" config user.name t
  printf 'shared\n' > "$TMP/$r/same.sh"
  printf 'differs in %s\n' "$r" > "$TMP/$r/diff.sh"
  git -C "$TMP/$r" add -A >/dev/null
  git -C "$TMP/$r" commit -qm init
done

# Ordered so the NON-matching path is last — the arrangement that broke live.
REAL="$(
  cd "$TMP/a" && LIB="$LIB" OTHER="$TMP/b" bash -c '
    set -euo pipefail
    source "$LIB"
    _ipo_identical_paths "$(printf "same.sh\ndiff.sh\n")" "$OTHER"
    echo SURVIVED
  ' 2>&1
)"
assert_eq "the shared blob is returned"          "yes" "$(saw "$REAL" "same.sh")"
assert_eq "the differing blob is not"            "no"  "$(saw "$REAL" "diff.sh")"
assert_eq "and a trailing NON-match does not return 1 into set -e" \
  "yes" "$(saw "$REAL" "SURVIVED")"

# The registry walk, unstubbed. BRIK_GITHUB_ROOT is the seam so this does not
# depend on the machine's checkouts; the assertion is that it survives, since
# the same trailing-status trap lives in its loop.
FLEETOUT="$(
  LIB="$LIB" ROOT="$TMP" bash -c '
    set -euo pipefail
    source "$LIB"
    BRIK_GITHUB_ROOT="$ROOT" _ipo_fleet_checkouts >/dev/null
    echo SURVIVED
  ' 2>&1
)"
assert_eq "the fleet walk survives set -euo pipefail with no checkouts present" \
  "yes" "$(saw "$FLEETOUT" "SURVIVED")"

echo "── new-task.sh must actually CALL it (the #2765 shape) ──"

# The failure this locks is a gate that is defined, correct, and called by
# nothing — `check_title_overlap` sat uncalled in brik-llm for 7 days and two
# duplicate tickets were filed under `--report` printing "No parallel branch or
# PR found." A unit test of the predicate stays green through all of it.
#
# Comments are STRIPPED before the match. A `git grep` for a caller is satisfied
# by a mention in a comment — verified by mutation on 2026-08-29, when deleting
# the call from gh-issue-create.sh left the grep-based case green and turned only
# the end-to-end case red (#2881). This file is described in prose in three
# comment blocks in new-task.sh, so an unstripped grep here would be pure noise.
NEW_TASK="$(cd "$(dirname "$0")/.." && pwd)/new-task.sh"
CODE="$(sed 's/[[:space:]]*#.*$//' "$NEW_TASK" | awk 'NF')"

assert_eq "the lib is sourced in executable position" "yes" \
  "$(saw "$CODE" 'source "${SCRIPT_DIR}/lib/issue-path-overlap.sh"')"
assert_eq "and the gate is CALLED, not merely described" "yes" \
  "$(saw "$CODE" 'check_issue_path_overlap "$ISSUE_REF"')"

# Position matters as much as presence: called from the --no-issue branch it
# would have no ref to read and would be silently dead. Assert it sits in the
# same block as the sibling gate it complements.
TICKET_BLOCK="$(printf '%s\n' "$CODE" | awk '
  /^if \[ -n "\$ISSUE_REF" \]; then/ { inblk = 1 }
  inblk { print }
  /^elif \[ "\$NO_ISSUE" = "1" \]; then/ { inblk = 0 }')"
assert_eq "the call sits in the ticketed branch, beside check_ticket_path_overlap" \
  "yes" "$(saw "$TICKET_BLOCK" 'check_issue_path_overlap "$ISSUE_REF"')"

echo ""
echo "── issue-path-overlap: ${PASS} passed, ${FAIL} failed"
if [ "$FAIL" -gt 0 ]; then
  printf '   failed: %s\n' "${FAILED_CASES[@]}"
  exit 1
fi
