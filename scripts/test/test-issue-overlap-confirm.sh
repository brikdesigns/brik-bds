#!/usr/bin/env bash
# Locks the one thing that must never regress in lib/issue-overlap.sh: finding an
# overlap must WARN, not kill the pickup.
#
# brik-llm#1692 (ported from brik-bds#1549). The gate prompted with a bare `read -r`, which returns 1 on EOF.
# new-task.sh calls check_issue_overlap unguarded under `set -euo pipefail`
# (scripts/new-task.sh:236), so with stdin closed — every agent session — a
# single hit aborted the script before the worktree existed. It fired twice on
# 2026-07-29 while building #1545/#1546 in brik-bds, both times on a false-positive org-wide
# search hit (a PR in another repo whose title carried `(#1545)`).
#
# Driven end-to-end through a FAKE `gh` on PATH rather than by calling the pure
# helpers: the defect was in the control flow between the real functions and
# `set -e`, which a unit test of a helper cannot see. No network, no repo — the
# subshell runs in a temp directory so the branch scan finds nothing.
#
# The unset below is per brik-bds#1539 / brik-llm#1672: a test invoked from a git hook inherits
# GIT_DIR, and that is how the sibling overlap-filters test rewrote refs in the
# live repo.
#
# Run: bash scripts/test/test-issue-overlap-confirm.sh

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
  repo) printf 'brikdesigns/brik-llm\n' ;;
  api)
    case "$2" in
      graphql)
        # #2298: this leg must not even be reached once the issue read fails.
        [ -n "${GH_FAKE_READ_FAIL:-}" ] && { echo "GRAPHQL-RAN" >&2; exit 0; }
        # #2448: the real shape when the number is a PR, not an issue — a body on
        # STDOUT, the diagnostic on stderr, and a NON-ZERO status. Measured
        # 2026-08-29. `2>/dev/null || true` turned all three into "a finding".
        if [ -n "${GH_FAKE_GRAPHQL_FAIL:-}" ]; then
          printf '{"data":{"repository":{"issue":null}},"errors":[{"type":"NOT_FOUND","path":["repository","issue"],"message":"Could not resolve to an Issue with the number of 1525."}]}\n'
          echo 'gh: Could not resolve to an Issue with the number of 1525.' >&2
          exit 1
        fi
        [ "${GH_FAKE_FINDINGS:-0}" = "1" ] && \
          printf 'brikdesigns/brik-llm#1482 [OPEN] parallel consolidation\n'
        ;;
      -X)                            # search/issues
        # Same leak, second function (#2448 AC 3). 403 is the live shape here:
        # the search endpoint has its own secondary rate limit.
        if [ -n "${GH_FAKE_SEARCH_FAIL:-}" ]; then
          printf '{"message":"You have exceeded a secondary rate limit","documentation_url":"https://docs.github.com/rest","status":"403"}\n'
          echo 'gh: You have exceeded a secondary rate limit (HTTP 403)' >&2
          exit 1
        fi
        ;;
      *)
        # repos/o/r/issues/N. GH_FAKE_READ_FAIL reproduces the three real
        # failure shapes measured from gh 2.x — see _io_issue_state's table.
        # Each writes what the real gh writes, INCLUDING the payload on stdout,
        # which is the detail that made a 404 look like a finding (#2298).
        case "${GH_FAKE_READ_FAIL:-}" in
          transport)
            echo 'Get "https://api.github.com/repos/o/r/issues/1525": proxyconnect tcp: dial tcp 127.0.0.1:1: connect: connection refused' >&2
            exit 1 ;;
          notfound)
            printf '{"message":"Not Found","documentation_url":"https://docs.github.com/rest","status":"404"}\n'
            echo 'gh: Not Found (HTTP 404)' >&2
            exit 1 ;;
          badcreds)
            printf '{"message":"Bad credentials","documentation_url":"https://docs.github.com/rest","status":"401"}\n'
            echo 'gh: Bad credentials (HTTP 401)' >&2
            exit 1 ;;
        esac
        # Third field is the PR/issue discriminator #2448 added, off the
        # `pull_request` key the same endpoint already returns.
        printf 'open\tFake overlap ticket\t%s\n' "${GH_FAKE_KIND:-issue}" ;;
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

# Same caller, but with the issue read failing. Returns the rc so the "could not
# tell" codes can be told apart from "found nothing" (#2422/#2298). Guarded
# rather than unguarded, because the point here is the CODE, not the abort.
run_read_fail() {
  local failmode="$1" mode="${2:-}"
  ( cd "$TMPROOT" && PATH="$TMPROOT/bin:$PATH" GH_FAKE_READ_FAIL="$failmode" \
      bash -c "
        set -uo pipefail
        source '$LIB'
        rc=0; check_issue_overlap 1525 $mode || rc=\$?
        echo \"RC=\$rc\"
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

echo "── an unanswered read is not an all-clear (#2422 / #2298) ──"

# A retry is built in, so each of these runs gh twice — the sleep makes the
# section ~2s slower. That is the cost of the retry being real.
OUT="$(run_read_fail transport)"
assert_eq "transport failure returns 5, not 0" "yes" "$(has "$OUT" 'RC=5')"
assert_eq "transport failure says the check did NOT run" "yes" \
  "$(has "$OUT" 'did NOT run')"
assert_eq "transport failure denies being an all-clear" "yes" \
  "$(has "$OUT" "NOT a 'no parallel work' result")"
assert_eq "transport failure never claims no parallel work" "no" \
  "$(has "$OUT" 'No parallel branch or PR found')"
assert_eq "transport failure surfaces gh's stderr instead of discarding it" "yes" \
  "$(has "$OUT" 'connection refused')"

OUT="$(run_read_fail notfound)"
assert_eq "a 404 returns 4, distinct from a transport failure" "yes" "$(has "$OUT" 'RC=4')"
assert_eq "a 404 names the cross-repo form as the likely fix" "yes" \
  "$(has "$OUT" "owner/repo#1525")"
assert_eq "a 404 does NOT wear the findings banner" "no" \
  "$(has "$OUT" 'PRs already linked')"
assert_eq "a 404 does NOT echo the API payload as data" "no" \
  "$(has "$OUT" 'documentation_url')"
assert_eq "a 404 skips the GraphQL leg entirely (one less quota point)" "no" \
  "$(has "$OUT" 'GRAPHQL-RAN')"

OUT="$(run_read_fail badcreds)"
assert_eq "a 401 is a read failure, not a finding" "yes" "$(has "$OUT" 'RC=5')"
assert_eq "a 401 does NOT echo Bad credentials as the issue title" "no" \
  "$(has "$OUT" 'PRs already linked')"

# --report is the /resume entry point. It must still refuse to call an unanswered
# lookup an all-clear — the pickup is exactly where that gets believed.
OUT="$(run_read_fail transport --report)"
assert_eq "--report also returns non-zero on an unreadable issue" "yes" \
  "$(has "$OUT" 'RC=5')"
assert_eq "--report does not print the all-clear on a failed read" "no" \
  "$(has "$OUT" 'No parallel branch or PR found')"

echo "── a gh body on stdout is never a finding (#2448) ──"

# Same shape as the read-failure runs above, but the failure is in the SECOND
# leg. The issue read succeeds, so the gate proceeds — and then the GraphQL call
# exits 1 with a JSON body on stdout. `2>/dev/null || true` made that body the
# function's return value, and the caller printed it under the ⚠ banner.
# $1 is a full VAR=VALUE assignment, not a bare name: the PR case below needs
# GH_FAKE_KIND=pr, not =1.
run_leg_fail() {
  local var="$1" mode="${2:-}"
  ( cd "$TMPROOT" && PATH="$TMPROOT/bin:$PATH" env "$var" \
      bash -c "
        set -uo pipefail
        source '$LIB'
        rc=0; check_issue_overlap 1525 $mode || rc=\$?
        echo \"RC=\$rc\"
      " </dev/null 2>&1 )
}

OUT="$(run_leg_fail GH_FAKE_GRAPHQL_FAIL=1)"
assert_eq "a failed timeline read never prints the response body" "no" \
  "$(has "$OUT" 'NOT_FOUND')"
assert_eq "…nor the raw data envelope" "no" "$(has "$OUT" '"data"')"
assert_eq "it is reported as unreadable, not as linked PRs" "yes" \
  "$(has "$OUT" 'Could NOT read the linked-PR timeline')"
assert_eq "it denies being 'no linked PRs'" "yes" \
  "$(has "$OUT" "not 'no linked PRs'")"
assert_eq "gh's diagnostic is surfaced, not discarded to /dev/null" "yes" \
  "$(has "$OUT" 'Could not resolve to an Issue')"
assert_eq "an unreadable leg is NEVER an all-clear" "no" \
  "$(has "$OUT" 'No parallel branch or PR found')"

# AC 3: the org-wide search leg carried the identical idiom and gets the identical
# verdict. Asserted separately because it fails through a different endpoint.
OUT="$(run_leg_fail GH_FAKE_SEARCH_FAIL=1)"
assert_eq "a failed org-wide search never prints the response body" "no" \
  "$(has "$OUT" 'secondary rate limit"')"
assert_eq "it is reported as unreadable, not as nothing found" "yes" \
  "$(has "$OUT" 'Could NOT run the org-wide PR search')"
assert_eq "a failed search is NEVER an all-clear" "no" \
  "$(has "$OUT" 'No parallel branch or PR found')"

echo "── a PR number is not an issue (#2448 AC 2) ──"

# `GET repos/{o}/{r}/issues/{n}` answers for a PR too, so the gate used to sail
# past and only trip in the GraphQL leg — into the `|| true`. One line instead.
OUT="$(run_leg_fail GH_FAKE_KIND=pr)"
assert_eq "a PR number returns 6, distinct from 4 (absent) and 5 (unreadable)" "yes" \
  "$(has "$OUT" 'RC=6')"
assert_eq "it says PULL REQUEST in as many words" "yes" "$(has "$OUT" 'PULL REQUEST')"
assert_eq "it does not run the linked-PR leg at all" "no" \
  "$(has "$OUT" 'PRs already linked')"
assert_eq "it is not reported as an all-clear" "no" \
  "$(has "$OUT" 'No parallel branch or PR found')"
assert_eq "new-task.sh has a remedy for rc 6" "yes" \
  "$(has "$(cat "$(cd "$(dirname "$0")/.." && pwd)/new-task.sh")" 'PULL REQUEST, not an issue')"

echo "── the title keeps its own field (#2448 regression) ──"
# The kind marker is field 3. `${state_line#*\t}` — the old parse — would have
# carried "<TAB>issue" into the title and printed it, and fed it to the
# similarity scorer as a token.
OUT="$(run_caller 0)"
assert_eq "the printed title does not carry the kind marker" "no" \
  "$(has "$OUT" 'Fake overlap ticket	issue')"
assert_eq "the printed title is intact" "yes" "$(has "$OUT" 'Fake overlap ticket')"

echo "── new-task.sh refuses rather than proceeding ──"
# Asserted lexically: driving new-task.sh end-to-end needs a real repo plus a
# network fetch, and the behavioural half is already pinned above. What matters
# here is that the caller GUARDS the call — an unguarded one aborts under `set
# -e` before any remedy is printed, which is the #2045 shape.
NEWTASK="$(cd "$(dirname "$0")/.." && pwd)/new-task.sh"
assert_eq "new-task.sh guards check_issue_overlap" "yes" \
  "$(has "$(grep -A1 'check_issue_overlap "\$ISSUE_REF"' "$NEWTASK")" 'overlap_rc')"
assert_eq "new-task.sh refuses when the gate could not run" "yes" \
  "$(has "$(cat "$NEWTASK")" 'the overlap gate could not run')"
assert_eq "the refusal names --no-issue as the deliberate override" "yes" \
  "$(has "$(cat "$NEWTASK")" 'no-issue')"

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
