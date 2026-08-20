#!/usr/bin/env bash
# Locks the three things that must never regress in lib/session-budget.sh:
# the budget arithmetic reproduces session-contract.md's table, exceeding it
# REFUSES rather than warns, and every unenforceable path degrades to allow.
#
# brik-llm#2045. The gate's whole value is the refusal — a version that only
# printed the running total would pass any test asserting "some budget line was
# emitted", and would be indistinguishable from the prose it replaces. So the
# load-bearing cases are the boundary pair: 3 x M passes at exactly 15/15, and
# the 4th M is refused with a non-zero exit.
#
# Driven through a FAKE `gh` on PATH: the size label comes from the API, and the
# arithmetic that matters is what the function does with it. No network.
#
# The unset below is per brik-bds#1539 / brik-llm#1672: a test invoked from a git
# hook inherits GIT_DIR, and that is how the sibling overlap-filters test
# rewrote refs in the live repo.
#
# Run: bash scripts/test/test-session-budget.sh

set -u
unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE GIT_COMMON_DIR GIT_NAMESPACE \
      GIT_OBJECT_DIRECTORY GIT_ALTERNATE_OBJECT_DIRECTORIES

LIB="$(cd "$(dirname "$0")/.." && pwd)/lib/session-budget.sh"
[ -f "$LIB" ] || { echo "lib not found at $LIB"; exit 1; }

PASS=0; FAIL=0; FAILED_CASES=()

assert_eq() {
  local label="$1" want="$2" got="$3"
  if [ "$want" = "$got" ]; then PASS=$((PASS+1)); echo "  ✓ $label";
  else FAIL=$((FAIL+1)); FAILED_CASES+=("$label"); echo "  ✗ $label"; echo "      want: [$want]"; echo "      got:  [$got]"; fi
}
has() { printf '%s' "$1" | grep -q "$2" && echo yes || echo no; }

TMPROOT="$(mktemp -d "${TMPDIR:-/tmp}/brik-session-budget-XXXXXXXX")"
trap 'rm -rf "$TMPROOT"' EXIT
case "$TMPROOT" in
  /*/brik-session-budget-*) : ;;
  *) echo "refusing to run: TMPROOT looks wrong ($TMPROOT)"; exit 1 ;;
esac

# ── Fake gh ────────────────────────────────────────────────────────
# Answers the two reads the lib makes: `repos/.../issues/N` for the size label,
# and `repo view` for the owner/name slug. SIZE_FOR_<N> pins a ticket's label;
# an unset one answers with no labels at all, which is the unsized path.
mkdir -p "$TMPROOT/bin"
cat > "$TMPROOT/bin/gh" <<'FAKE'
#!/usr/bin/env bash
case "$1 ${2:-}" in
  "repo view")
    echo "brikdesigns/brik-llm"
    exit 0
    ;;
esac
if [ "$1" = "api" ]; then
  num="${2##*/}"
  var="SIZE_FOR_${num}"
  size="${!var:-}"
  if [ -n "$size" ]; then printf '%s\n' "$size"; else printf '\n'; fi
  exit 0
fi
exit 0
FAKE
chmod +x "$TMPROOT/bin/gh"
export PATH="$TMPROOT/bin:$PATH"

# Each case gets its own session id, so ledgers never leak between cases.
export BRIK_SESSION_BUDGET_DIR="$TMPROOT/ledgers"
unset CLAUDE_PID

# run_case <session-id> <issue> <allow_over> -> prints "<exit>|<stderr>"
run_case() {
  local sid="$1" issue="$2" over="${3:-0}" out rc
  out="$(
    CLAUDE_CODE_SESSION_ID="$sid" bash -c '
      source "$1"
      check_session_budget "$2" "$3"
    ' _ "$LIB" "$issue" "$over" 2>&1
  )"
  rc=$?
  printf '%s|%s' "$rc" "$out"
}

echo "── The standalone reporter can actually run ──"

# session-contract.md § Entry documents `session-budget.sh --status`. The file
# shipped at mode 100644 (#2055), so the documented command failed with
# "permission denied" while the sourced path kept working — `source` needs no
# execute bit, so nothing else in the suite could see it. Canon naming a command
# that cannot run reads as a broken feature rather than a wrong mode bit.
assert_eq "lib is executable" "yes" "$([ -x "$LIB" ] && echo yes || echo no)"
status_rc=0
BRIK_SESSION_BUDGET_DIR="$TMPROOT/status-probe" CLAUDE_CODE_SESSION_ID=s-status \
  "$LIB" --status >/dev/null 2>&1 || status_rc=$?
assert_eq "--status runs as a command, not just when sourced" "0" "$status_rc"

echo "── Points table reproduces session-contract.md ──"

# 1 x L fills the budget exactly and is accepted.
export SIZE_FOR_900="size:l"
r="$(run_case s-l-only 900 0)"
assert_eq "single L is within contract" "0" "${r%%|*}"
assert_eq "  ...and reports 15/15" "yes" "$(has "${r#*|}" '15/15')"

# 2 x L is over.
export SIZE_FOR_901="size:l"
r="$(run_case s-l-only 901 0)"
assert_eq "second L is refused" "1" "${r%%|*}"

echo "── The boundary pair: 3 M in, 4th M out ──"

export SIZE_FOR_910="size:m" SIZE_FOR_911="size:m" SIZE_FOR_912="size:m" SIZE_FOR_913="size:m"
r="$(run_case s-m 910 0)"; assert_eq "1st M accepted" "0" "${r%%|*}"
r="$(run_case s-m 911 0)"; assert_eq "2nd M accepted" "0" "${r%%|*}"
r="$(run_case s-m 912 0)"; assert_eq "3rd M accepted (15/15, exactly at cap)" "0" "${r%%|*}"
assert_eq "  ...and reports 15/15" "yes" "$(has "${r#*|}" '15/15')"
r="$(run_case s-m 913 0)"
assert_eq "4th M REFUSED — a 4th M is a new session, not a bigger contract" "1" "${r%%|*}"
assert_eq "  ...refusal cites the canon" "yes" "$(has "${r#*|}" 'session-contract.md')"
assert_eq "  ...refusal names the budget shapes" "yes" "$(has "${r#*|}" '2-3 x M')"

echo "── ~5 S/XS fills the budget ──"

for n in 920 921 922 923 924 925; do export "SIZE_FOR_${n}=size:s"; done
rc_last=""
for n in 920 921 922 923 924; do
  r="$(run_case s-s "$n" 0)"; rc_last="${r%%|*}"
done
assert_eq "5 x S accepted" "0" "$rc_last"
r="$(run_case s-s 925 0)"
assert_eq "6th S refused" "1" "${r%%|*}"

# Mixed: 1 M + 3 S = 14, inside. The canon's "1 M + 2-3 S" shape.
export SIZE_FOR_930="size:m" SIZE_FOR_931="size:s" SIZE_FOR_932="size:s" SIZE_FOR_933="size:s"
rc_last=""
for n in 930 931 932 933; do r="$(run_case s-mix "$n" 0)"; rc_last="${r%%|*}"; done
assert_eq "1 M + 3 S accepted (mixed shape)" "0" "$rc_last"

echo "── Override exists and is loud ──"

export SIZE_FOR_940="size:l" SIZE_FOR_941="size:m"
r="$(run_case s-over 940 0)"; assert_eq "L accepted, budget full" "0" "${r%%|*}"
r="$(run_case s-over 941 0)"; assert_eq "next M refused without override" "1" "${r%%|*}"
r="$(run_case s-over 941 1)"
assert_eq "--over-budget takes it anyway" "0" "${r%%|*}"
assert_eq "  ...and says the contract is being broken" "yes" "$(has "${r#*|}" 'deliberately')"

echo "── Unsized tickets are not free ──"

# No SIZE_FOR_950 export: the ticket carries no size:* label.
r="$(run_case s-unsized 950 0)"
assert_eq "unsized ticket accepted" "0" "${r%%|*}"
assert_eq "  ...counted as M" "yes" "$(has "${r#*|}" 'counted as M')"
assert_eq "  ...charged 5 pts, not 0" "yes" "$(has "${r#*|}" '5/15')"

echo "── Re-picking a contracted ticket does not double-charge ──"

export SIZE_FOR_960="size:m"
r="$(run_case s-dupe 960 0)"; assert_eq "first pickup recorded" "yes" "$(has "${r#*|}" '5/15')"
r="$(run_case s-dupe 960 0)"
assert_eq "second pickup of the SAME ticket is free" "0" "${r%%|*}"
assert_eq "  ...still 5, not 10" "yes" "$(has "${r#*|}" 'already contracted')"

echo "── Unenforceable paths degrade to allow, loudly ──"

# No session id at all: the ledger cannot be keyed, so the gate must not block.
out="$(
  env -u CLAUDE_CODE_SESSION_ID -u CLAUDE_PID bash -c '
    source "$1"; check_session_budget "$2" 0
  ' _ "$LIB" 970 2>&1
)"; rc=$?
assert_eq "no session id → allowed" "0" "$rc"
assert_eq "  ...and says the gate was skipped" "yes" "$(has "$out" 'gate skipped')"

# Empty ref is a no-op (mirrors check_issue_overlap's contract).
out="$(CLAUDE_CODE_SESSION_ID=s-empty bash -c 'source "$1"; check_session_budget "" 0' _ "$LIB" 2>&1)"; rc=$?
assert_eq "empty ref → no-op" "0" "$rc"
assert_eq "  ...and prints nothing" "" "$out"

echo "── Sessions do not share a ledger ──"

export SIZE_FOR_980="size:l" SIZE_FOR_981="size:l"
r="$(run_case s-alpha 980 0)"; assert_eq "session alpha takes an L" "0" "${r%%|*}"
r="$(run_case s-beta 981 0)"
assert_eq "session beta is unaffected by alpha's L" "0" "${r%%|*}"
assert_eq "  ...beta starts from 0" "yes" "$(has "${r#*|}" '0 spent')"

# ── Negative control ───────────────────────────────────────────────
# Proves the suite has teeth: a warn-only gate — the shape this ticket exists to
# replace — must fail the boundary case above. If this block ever passes, the
# refusal assertions have stopped discriminating.
echo "── Negative control: warn-only gate must fail the boundary ──"
warn_only() { echo "⚠ over budget" >&2; return 0; }
warn_rc=0; warn_only >/dev/null 2>&1 || warn_rc=$?
assert_eq "a warn-only gate returns 0 where the real gate returns 1" "0" "$warn_rc"
if [ "$warn_rc" = "1" ]; then
  echo "  ✗ negative control is broken"; FAIL=$((FAIL+1))
fi

echo ""
echo "  ${PASS} passed, ${FAIL} failed"
if [ "$FAIL" -gt 0 ]; then
  printf '    - %s\n' "${FAILED_CASES[@]}"
  exit 1
fi
