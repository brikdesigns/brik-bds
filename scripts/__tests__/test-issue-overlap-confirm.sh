#!/usr/bin/env bash
# Locks the one thing that must never regress in lib/issue-overlap.sh: finding an
# overlap must WARN, not kill the pickup.
#
# brik-bds#1549. The gate prompted with a bare `read -r`, which returns 1 on EOF.
# new-task.sh calls check_issue_overlap unguarded under `set -euo pipefail`
# (scripts/new-task.sh:190), so with stdin closed — every agent session — a
# single hit aborted the script before the worktree existed. It fired twice on
# 2026-07-29 while building #1545/#1546, both times on a false-positive org-wide
# search hit (a PR in another repo whose title carried `(#1545)`).
#
# Driven end-to-end through a FAKE `gh` on PATH rather than by calling the pure
# helpers: the defect was in the control flow between the real functions and
# `set -e`, which a unit test of a helper cannot see. No network, no repo — the
# subshell runs in a temp directory so the branch scan finds nothing.
#
# The unset below is per brik-bds#1539: a test invoked from a git hook inherits
# GIT_DIR, and that is how the sibling overlap-filters test rewrote refs in the
# live repo.
#
# Run: bash scripts/__tests__/test-issue-overlap-confirm.sh

set -u
unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE GIT_COMMON_DIR GIT_NAMESPACE \
      GIT_OBJECT_DIRECTORY GIT_ALTERNATE_OBJECT_DIRECTORIES

LIB="$(cd "$(dirname "$0")/.." && pwd)/lib/issue-overlap.sh"
[ -f "$LIB" ] || { echo "lib not found at $LIB"; exit 1; }

PASS=0; FAIL=0; FAILED_CASES=()

assert_eq() {
  local label="$1" want="$2" got="$3"
  if [ "$want" = "$got" ]; then PASS=$((PASS+1)); echo "  ✓ $label";
  else FAIL=$((FAIL+1)); FAILED_CASES+=("$label"); echo "  ✗ $label"; echo "      want: [$want]"; echo "      got:  [$got]"; fi
}
has() { printf '%s' "$1" | grep -q "$2" && echo yes || echo no; }

TMPROOT="$(mktemp -d "${TMPDIR:-/tmp}/brik-overlap-confirm-XXXXXXXX")"
trap 'rm -rf "$TMPROOT"' EXIT
case "$TMPROOT" in
  /*/brik-overlap-confirm-*) : ;;
  *) echo "refusing to run: TMPROOT looks wrong ($TMPROOT)"; exit 1 ;;
esac

# ── Fake gh ────────────────────────────────────────────────────────
# Answers the four reads check_issue_overlap makes. GH_FAKE_FINDINGS=1 reports a
# linked PR, which is what puts the function on the path to the prompt.
mkdir -p "$TMPROOT/bin"
cat > "$TMPROOT/bin/gh" <<'FAKE'
#!/usr/bin/env bash
case "$1" in
  repo) printf 'brikdesigns/brik-bds\n' ;;
  api)
    case "$2" in
      graphql)
        [ "${GH_FAKE_FINDINGS:-0}" = "1" ] && \
          printf 'brikdesigns/brik-bds#1482 [OPEN] parallel consolidation\n'
        ;;
      -X) : ;;                       # search/issues — nothing
      *)  printf 'open\tFake overlap ticket\n' ;;   # repos/o/r/issues/N
    esac
    ;;
  *) : ;;
esac
exit 0
FAKE
chmod +x "$TMPROOT/bin/gh"

# The exact caller shape from new-task.sh:190 — sourced, `set -euo pipefail`,
# unguarded call, stdin closed. REACHED-END only prints if nothing aborted.
run_caller() {
  local findings="$1" mode="${2:-}" yes="${3:-0}"
  ( cd "$TMPROOT" && PATH="$TMPROOT/bin:$PATH" GH_FAKE_FINDINGS="$findings" \
      NEW_TASK_YES="$yes" bash -c "
        set -euo pipefail
        source '$LIB'
        check_issue_overlap 1525 $mode
        echo REACHED-END
      " </dev/null 2>&1 )
}

echo "── the #1549 abort ──"

OUT="$(run_caller 1)"; RC=$?
assert_eq "an overlap hit does NOT abort the caller under set -e" "yes" "$(has "$OUT" REACHED-END)"
assert_eq "the caller exits 0" "0" "$RC"
assert_eq "the hit is still reported (warning preserved, not swallowed)" "yes" \
  "$(has "$OUT" '#1482')"
assert_eq "it says out loud that it proceeded without asking" "yes" \
  "$(has "$OUT" 'non-interactive: proceeding')"
assert_eq "it does NOT print the interactive prompt into a closed stdin" "no" \
  "$(has "$OUT" 'Press Enter')"

echo "── unchanged behaviour ──"

OUT="$(run_caller 0)"
assert_eq "no findings → the all-clear, and the caller continues" "yes" \
  "$(has "$OUT" 'No parallel branch or PR found')"
assert_eq "no findings → still reaches the end" "yes" "$(has "$OUT" REACHED-END)"
assert_eq "no findings → no confirmation line at all" "no" \
  "$(has "$OUT" 'non-interactive: proceeding')"

OUT="$(run_caller 1 --report)"
assert_eq "--report returns before the prompt (the /resume entry point)" "no" \
  "$(has "$OUT" 'non-interactive: proceeding')"
assert_eq "--report still reports the hit and continues" "yes" \
  "$(has "$OUT" '#1482')"
assert_eq "--report reaches the end" "yes" "$(has "$OUT" REACHED-END)"

echo "── NEW_TASK_YES ──"
OUT="$(run_caller 1 '' 1)"
assert_eq "NEW_TASK_YES=1 proceeds — one env var covers both prompts" "yes" \
  "$(has "$OUT" 'non-interactive: proceeding')"
assert_eq "NEW_TASK_YES=1 reaches the end" "yes" "$(has "$OUT" REACHED-END)"

echo "── _io_confirm in isolation ──"
# shellcheck source=/dev/null
source "$LIB"
assert_eq "returns 0 with stdin closed" "0" "$(_io_confirm </dev/null 2>/dev/null; echo $?)"
assert_eq "returns 0 with NEW_TASK_YES=1" "0" \
  "$(NEW_TASK_YES=1 _io_confirm </dev/null 2>/dev/null; echo $?)"

echo ""
if [ "$FAIL" -gt 0 ]; then
  echo "── issue-overlap-confirm: $PASS passed, $FAIL failed"
  for c in "${FAILED_CASES[@]}"; do echo "    ✗ $c"; done
  exit 1
fi
echo "── issue-overlap-confirm: $PASS passed, 0 failed"
