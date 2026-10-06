#!/usr/bin/env bash
# Locks the claim gate's decision logic — brik-llm#2676, porting brik-bds#1541
# (the claim slice of brik-llm#1485). brik-llm is canon for the lib; this suite is
# the same one that shipped with it, at brik-llm's `scripts/test/` path.
#
# Only the pure half is exercised: parse / staleness / identity. That is where
# the gate can be wrong in a way nobody notices, and new-task.sh refuses to run
# outside the primary worktree so anything inline there is untestable.
#
# No network, no git. The unset below is belt-and-braces per brik-bds#1539: a
# test invoked from a git hook inherits GIT_DIR, and that is how the sibling
# overlap-filters test rewrote refs in a live repo.
#
# Run: bash scripts/test/test-issue-claim.sh

set -u
unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE GIT_COMMON_DIR GIT_NAMESPACE \
      GIT_OBJECT_DIRECTORY GIT_ALTERNATE_OBJECT_DIRECTORIES

LIB="$(cd "$(dirname "$0")/.." && pwd)/lib/issue-claim.sh"
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

NOW=1900000000   # fixed clock: a real `date` call would make staleness untestable

echo "── parse_claim ──"
BODY="$(claim_marker_body brik-mini task/foo-1 2026-07-29T18:00:00Z)"
assert_eq "round-trips host/branch/stamp through the rendered marker" \
  "brik-mini	task/foo-1	2026-07-29T18:00:00Z" "$(parse_claim "$BODY")"
assert_not "rejects a body that is not a claim" parse_claim "just a normal comment"
assert_not "rejects a marker with the rows stripped" parse_claim "$CLAIM_MARKER only"
assert_eq "a branch containing a slash survives" \
  "task/scope-name-1541" "$(parse_claim "$(claim_marker_body h task/scope-name-1541 2026-01-01T00:00:00Z)" | cut -f2)"

echo "── claim_stamp_to_epoch (BSD + GNU date) ──"
assert_eq "parses an ISO-8601 Zulu stamp" "1769904000" "$(claim_stamp_to_epoch 2026-02-01T00:00:00Z)"
assert_not "rejects garbage" claim_stamp_to_epoch "not-a-date"
assert_not "rejects empty" claim_stamp_to_epoch ""

echo "── claim_is_stale ──"
FRESH="$(date -u -j -f %s "$(( NOW - 600 ))" +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -d "@$(( NOW - 600 ))" +%Y-%m-%dT%H:%M:%SZ)"
OLD="$(date -u -j -f %s "$(( NOW - 90000 ))" +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -d "@$(( NOW - 90000 ))" +%Y-%m-%dT%H:%M:%SZ)"
FUTURE="$(date -u -j -f %s "$(( NOW + 90000 ))" +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -d "@$(( NOW + 90000 ))" +%Y-%m-%dT%H:%M:%SZ)"
assert_not "a 10-minute-old claim is NOT stale (it blocks)" claim_is_stale "$FRESH" "$NOW" 43200
assert_ok  "a 25-hour-old claim IS stale" claim_is_stale "$OLD" "$NOW" 43200
assert_ok  "an unparseable stamp reads as stale — a malformed claim must never wedge a ticket" \
  claim_is_stale "garbage" "$NOW" 43200
SKEWED="$(date -u -j -f %s "$(( NOW + 2 ))" +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -d "@$(( NOW + 2 ))" +%Y-%m-%dT%H:%M:%SZ)"
assert_not "a stamp 2s AHEAD of the clock is still LIVE — the machines are not NTP-locked, and treating any future stamp as stale meant 1s of drift silently voided a live claim (age was -1 in testing)" \
  claim_is_stale "$SKEWED" "$NOW" 43200
assert_ok  "a stamp 25h in the future is bogus data, not skew → stale" \
  claim_is_stale "$FUTURE" "$NOW" 43200
assert_ok  "exactly at the window is stale" claim_is_stale "$OLD" "$NOW" 90000

echo "── claim_is_foreign ──"
assert_not "same host AND branch is my own claim — silent re-entry" \
  claim_is_foreign brik-mini task/a brik-mini task/a
assert_ok "same host, different branch is a second session on this machine" \
  claim_is_foreign brik-mini task/a brik-mini task/b
assert_ok "different host is a second machine" \
  claim_is_foreign nicks-macbook-pro-m1 task/a brik-mini task/a

# ── Claim IDENTITY: one session, two branches, two repos (brik-llm#2792) ──────
#
# The twin-sync case is routine, not exotic: issue-claim.sh and issue-overlap.sh
# are canon in brik-llm and `overlap-twin-drift` fails on an unsynced consumer
# copy, so ONE session working ONE ticket needs TWO branches in TWO repos. Under
# host+branch alone the second was a rival, and the only exit — STEAL_CLAIM —
# rewrote the marker onto the consumer branch, dropping the canon branch's claim
# while it was still mid-build.
#
# The widening these lock against is the dangerous half: "same host is always
# mine" would switch the gate off for the collision it was built for (two
# worktrees on brik-mini, #2645).
echo "── claim_is_foreign — session identity (#2792) ──"
assert_not "same session id is one session, even on a different branch in a different repo" \
  claim_is_foreign brik-mini brikdesigns/brik-llm:task/a brik-mini task/twin sess-1 sess-1
assert_ok "same host, DIFFERENT session id is still a rival — this must not widen to 'same host is mine'" \
  claim_is_foreign brik-mini task/a brik-mini task/b sess-1 sess-2
assert_ok "two empty session ids are not 'the same session' — CI and a hand-run pickup both have none" \
  claim_is_foreign brik-mini task/a brik-mini task/b "" ""
assert_ok "an empty id on one side alone falls back to host+branch" \
  claim_is_foreign brik-mini task/a brik-mini task/b sess-1 ""
assert_not "with no session ids at all, host+branch still reads as my own claim" \
  claim_is_foreign brik-mini task/a brik-mini task/a "" ""
assert_ok "same host, SAME branch, different session id is a rival — a second session continuing the branch (#4260)" \
  claim_is_foreign brik-mini o/r:task/a brik-mini task/a sess-1 sess-2
assert_ok "two sessions' pickups on one host do not match through claim-write's shared placeholder (#4260)" \
  claim_is_foreign brik-mini "$CLAIM_PENDING_BRANCH" brik-mini "$CLAIM_PENDING_BRANCH" sess-1 sess-2
assert_not "an id missing on one side still falls back to host+branch, so a hand-run re-entry stays mine" \
  claim_is_foreign brik-mini task/a brik-mini task/a sess-1 ""

echo "── claim_is_foreign — branch SETS ──"
assert_not "my branch anywhere in the claim's set is my own claim" \
  claim_is_foreign brik-mini "a/b:task/x, c/d:task/y" brik-mini task/y
assert_ok "a branch absent from the set is a rival" \
  claim_is_foreign brik-mini "a/b:task/x, c/d:task/y" brik-mini task/z
assert_not "a repo-qualified entry matches the bare branch it names — a rewritten marker still reads as mine on re-entry" \
  claim_is_foreign brik-mini brikdesigns/brik-llm:task/x brik-mini task/x

echo "── claim_branch_union ──"
assert_eq "a second repo's branch JOINS the claim instead of replacing it (#2792's silent side effect)" \
  "brikdesigns/brik-llm:task/x, brikdesigns/brik-bds:task/y" \
  "$(claim_branch_union "brikdesigns/brik-llm:task/x" "brikdesigns/brik-bds:task/y")"
assert_eq "re-entry on the same branch does not list it twice" \
  "a/b:task/x" "$(claim_branch_union "a/b:task/x" "a/b:task/x")"
assert_eq "a legacy bare entry is upgraded in place, not duplicated" \
  "a/b:task/x" "$(claim_branch_union "task/x" "a/b:task/x")"
assert_eq "an empty existing cell yields just my entry" \
  "a/b:task/x" "$(claim_branch_union "" "a/b:task/x")"
assert_eq "the union survives a round-trip through the rendered marker" \
  "a/b:task/x, c/d:task/y" \
  "$(parse_claim "$(claim_marker_body h "$(claim_branch_union 'a/b:task/x' 'c/d:task/y')" 2026-01-01T00:00:00Z s1)" | cut -f2)"

echo "── parse_claim_session ──"
assert_eq "reads the session row back" "sess-1" \
  "$(parse_claim_session "$(claim_marker_body h task/x 2026-01-01T00:00:00Z sess-1)")"
assert_eq "a marker written with no session id has no Session row and reads empty" "" \
  "$(parse_claim_session "$(claim_marker_body h task/x 2026-01-01T00:00:00Z)")"
assert_not "rejects a body that is not a claim" parse_claim_session "just a normal comment"

# ── Claim LIFETIME: three signals that outrank the timer (brik-llm#2204) ──────
#
# The timer alone refused work that was already merged — three times in one
# brik-bds session, each refusal answered with NEW_TASK_STEAL_CLAIM=1. The
# damage is not the lost minutes: STEAL_CLAIM is the override for "that session
# is genuinely gone", and a gate that cries wolf teaches the reflex that will
# also be applied to the next refusal that is real.
#
# Fail-CLOSED on unknown is the half worth locking hardest. A probe that could
# not answer must leave the claim standing — un-gating on an unreadable signal
# is the #2422 fail-open shape, and it costs a duplicate build.
echo "── claim_is_released (#2204) ──"
assert_ok  "a CLOSED issue releases the claim — the marker has always printed that promise" \
  claim_is_released CLOSED unknown
assert_ok  "a MERGED PR releases the claim" \
  claim_is_released OPEN MERGED
assert_ok  "a CLOSED PR releases it too — closed-not-merged still means that work ended" \
  claim_is_released OPEN CLOSED
assert_not "an open issue with an OPEN PR is a real session — it must still block" \
  claim_is_released OPEN OPEN
assert_not "both unknown leaves the 12h timer as the only judge" \
  claim_is_released unknown unknown
assert_not "an unreadable issue state does not un-gate on its own" \
  claim_is_released unknown OPEN
assert_not "an unreadable PR probe does not un-gate on its own" \
  claim_is_released OPEN unknown
assert_not "a lowercase state is not silently accepted — _ic_issue_state upcases, and a bypass here would fail open" \
  claim_is_released closed unknown

# The fail-open this fix deliberately does NOT take, and the reason #2204's
# literal AC ("a claim whose branch has been deleted does not block") is not met
# as written. An absent remote branch is indistinguishable from a branch
# new-task.sh created and has not pushed — and that window is the ONLY thing
# this gate can see that the overlap gate cannot. #2645 was built twice inside
# it on 2026-08-27: the winner's branch was never pushed until its PR opened, 11
# minutes after the loser's branch existed. `none` therefore blocks.
assert_not "NO PR for the branch reads as unknown and keeps blocking — a deleted branch and an unpushed one look identical, and un-gating there re-opens #2645" \
  claim_is_released OPEN none

echo "── _ic_entry_repo / _ic_entry_branch ──"
assert_eq "splits a repo-qualified entry" "brikdesigns/brik-llm" "$(_ic_entry_repo brikdesigns/brik-llm:task/x)"
assert_eq "…and its branch, slashes intact" "task/x" "$(_ic_entry_branch brikdesigns/brik-llm:task/x)"
assert_eq "a legacy bare entry has no repo, so the branch probe stays UNKNOWN rather than guessing" \
  "" "$(_ic_entry_repo task/x)"
assert_eq "a legacy bare entry is all branch" "task/x" "$(_ic_entry_branch task/x)"

echo "── claim_age_human ──"
assert_eq "under an hour renders minutes" "42m" "$(claim_age_human 2520)"
assert_eq "over an hour renders hours + minutes" "3h30m" "$(claim_age_human 12600)"

# ── _ic_resolve_ref, in EVERY shell that sources this lib (brik-llm#2798) ─────
#
# /resume step 4.2 tells the operator to `source scripts/lib/issue-claim.sh` and
# $SHELL is /bin/zsh on both machines, so the resolver runs under zsh on the
# gate's primary call path. It used to read captures from $BASH_REMATCH, which
# zsh does not populate — three empty strings, rc 0 — and check_issue_claim then
# reported a claimed ticket as clean. Asserting under bash alone cannot see that,
# so each case runs once per shell.
#
# _ic_repo_slug is stubbed: the bare-number forms would otherwise call
# `gh repo view`, and this suite is contractually network-free (see header).
echo "── _ic_resolve_ref (cross-shell) ──"
RESOLVE_CASES='
a/b#12|0|a b 12
#12|0|stub-owner stub-repo 12
12|0|stub-owner stub-repo 12
a.b/c-d#7|0|a.b c-d 7
a/b|2|
a/b/12|2|
a/b#|2|
a/b#12x|2|
b#12|2|
|2|
a/b12|2|
'

resolve_in_shell() {   # <shell> <ref> → "<rc>|<stdout>"
  "$1" -c '
    source "'"$LIB"'"
    _ic_repo_slug() { printf "stub-owner/stub-repo\n"; }
    out="$(_ic_resolve_ref "$1" 2>/dev/null)"; rc=$?
    printf "%s|%s" "$rc" "$out"
  ' "$1" "$2"
}

# A missing zsh is a loud SKIP, not a failure. This suite is also executed by
# generic runners that own no shell dependency — repro-before-fix runs whatever
# a PR names as its Repro command — and making them all install zsh to stay green
# is a wider tax than the arm is worth. issue-claim-gate-contract.yml installs
# zsh explicitly, so CI never actually skips it; the capture-array assertion at
# the end of this section is shell-independent and always runs either way.
SHELLS=(bash)
if command -v zsh >/dev/null 2>&1; then
  SHELLS+=(zsh)
else
  echo "  ⚠ SKIP: zsh not on PATH — the cross-shell arm did NOT run (brik-llm#2798)."
  echo "         issue-claim-gate-contract.yml installs zsh; if you are seeing this"
  echo "         line in THAT workflow's log, the install step regressed."
fi

for _sh in "${SHELLS[@]}"; do
  while IFS='|' read -r _ref _want_rc _want_out; do
    [ -n "${_ref}${_want_rc}" ] || continue
    assert_eq "[$_sh] '$_ref' → rc $_want_rc, '$_want_out'" \
      "${_want_rc}|${_want_out}" "$(resolve_in_shell "$_sh" "$_ref")"
  done <<<"$(printf '%s\n' "$RESOLVE_CASES" | sed '/^[[:space:]]*$/d')"
done

# The guard that made the zsh failure loud instead of silent. A resolver that
# emits a partial triple must return non-zero, or check_issue_claim's caller
# guard cannot fire and `gh api repos///issues//comments` gets made.
assert_not "a lone owner with no repo is rc 2, never rc 0 with a partial triple" \
  bash -c "source '$LIB'; _ic_resolve_ref 'a/#12'"
assert_eq "and it prints nothing when it fails" "" \
  "$(bash -c "source '$LIB'; _ic_resolve_ref 'a/#12'" 2>/dev/null || true)"

# Locks the fix's mechanism, not just its output: a reintroduced capture-array
# read would pass every case above under bash and silently break zsh again.
# Matches the USE form only — the prose above the resolver names the array as the
# thing it avoids, and a comment must not fail this.
assert_eq "the lib reads no bash capture array" "0" \
  "$(grep -c '\${BASH_REMATCH\[' "$LIB" || true)"

# The branch-set walkers run on the same zsh call path as the resolver, and the
# obvious ways to split a list are both shell-dependent: zsh does not word-split
# an unquoted expansion in `for x in $list`, and its `read -a` is not bash's. Either
# would pass every bash case above and silently treat a two-branch claim as one
# opaque string under zsh — a rival's branch would then never match, and the gate
# would refuse its own session exactly as #2792 describes.
echo "── branch-set walkers (cross-shell) ──"
for _sh in "${SHELLS[@]}"; do
  assert_eq "[$_sh] claim_is_foreign finds my branch as the SECOND entry in the set" "1" \
    "$("$_sh" -c 'source "$1"; claim_is_foreign brik-mini "a/b:task/x, c/d:task/y" brik-mini task/y; echo $?' _ "$LIB")"
  assert_eq "[$_sh] claim_branch_union appends rather than collapsing the list" \
    "a/b:task/x, c/d:task/y" \
    "$("$_sh" -c 'source "$1"; claim_branch_union "a/b:task/x" "c/d:task/y"' _ "$LIB")"
done

# ── Comment digest (brik-llm#2755) ────────────────────────────────────────────
#
# The digest is the half that would have prevented #2645's duplicate build. Its
# two failure modes are silent, which is why they are locked here:
#
#   - reporting nothing when a comment exists  → the #2645 case, unchanged
#   - reporting something when only a claim exists → fires on every pickup, and a
#     gate that always fires is one nobody reads (the #1485 lesson about the
#     merged-branch warning that was 100% false positives)
#
# comment_digest takes NDJSON on stdin, so these run with no network: the fixture
# IS the payload _ic_fetch_comments produces.
echo "── comment_headline ──"
assert_eq "takes the first meaningful line and strips markdown heading marks" \
  "Context this body predates" \
  "$(comment_headline '## Context this body predates

Rest of the comment.')"
assert_eq "skips a leading HTML marker and the blank line after it" \
  "Handoff — the claim gate is live" \
  "$(comment_headline '<!-- brik-handoff:v1 -->
## Handoff — the claim gate is live')"
assert_eq "collapses internal whitespace runs" "a b c" "$(comment_headline 'a    b  c')"
assert_eq "an all-whitespace body yields empty, and does NOT abort under pipefail" \
  "" "$(comment_headline '

   ')"
assert_eq "truncates with an ellipsis at the cap" "aaaa…" \
  "$(COMMENT_HEADLINE_MAX=4 comment_headline 'aaaaaaaaaa')"

echo "── comment_digest ──"
# A body newer than the issue body — the case AC 2 is about. Every comment
# postdates the brief as FILED, so any non-claim comment qualifies.
NEWER='{"id":1,"login":"nstaner","created_at":"2026-08-26T20:38:46Z","body":"First."}
{"id":2,"login":"someone","created_at":"2026-08-27T16:59:38Z","body":"## Newest\nbody text"}'
# `cut -f1-3` would be wrong here and is the reason report_issue_comments does not
# use it either: cut is line-oriented, so a multi-line body leaks its second line
# into the result. Peel with parameter expansion, exactly as the lib does.
digest_meta() {
  local d count rest login stamp
  d="$(comment_digest)" || return 1
  count="${d%%$'\t'*}"; rest="${d#*$'\t'}"
  login="${rest%%$'\t'*}"; rest="${rest#*$'\t'}"
  stamp="${rest%%$'\t'*}"
  printf '%s\t%s\t%s' "$count" "$login" "$stamp"
}
assert_eq "counts every non-claim comment and picks the NEWEST as the one to read" \
  "2	someone	2026-08-27T16:59:38Z" \
  "$(printf '%s\n' "$NEWER" | digest_meta)"
# Peel the body the way report_issue_comments does — parameter expansion, not
# cut, because the body field carries newlines.
digest_body() {
  local d rest
  d="$(comment_digest)" || return 1
  rest="${d#*$'\t'}"; rest="${rest#*$'\t'}"
  printf '%s' "${rest#*$'\t'}"
}
assert_eq "carries the newest body through with its newlines intact" \
  "Newest" \
  "$(comment_headline "$(printf '%s\n' "$NEWER" | digest_body)")"

# Zero comments — AC 4. Silence is the contract, and rc 1 is how the caller knows
# to stay silent rather than print an empty warning block.
assert_not "an empty comment stream returns non-zero" \
  bash -c "source '$LIB'; printf '' | comment_digest"
assert_eq "an empty comment stream prints nothing at all" "" \
  "$(printf '' | comment_digest || true)"

# A ticket carrying ONLY this lib's own claim marker must read as zero. Otherwise
# every re-pickup reports one comment about itself and the silent case never fires.
CLAIM_ONLY='{"id":3,"login":"nstaner","created_at":"2026-08-27T10:00:00Z","body":"<!-- claim -->\nClaimed"}'
assert_not "a lone claim marker is not a comment a builder needs to read" \
  bash -c "source '$LIB'; printf '%s\n' '$CLAIM_ONLY' | comment_digest"
assert_eq "a claim marker is excluded from the count alongside a real comment" \
  "1	someone	2026-08-27T16:59:38Z" \
  "$(printf '%s\n%s\n' "$CLAIM_ONLY" '{"id":4,"login":"someone","created_at":"2026-08-27T16:59:38Z","body":"real"}' \
     | digest_meta)"
assert_eq "the fixture's marker matches the lib's own constant — a renamed marker must fail here, not silently stop excluding claims" \
  "<!-- claim -->" "$CLAIM_MARKER"

# ── PR lookup never sends a raw branch name (brik-llm#4194) ───────────────────
#
# A space in a `gh api` path does not error — gh never returns. claim-write.sh's
# `(pending — not yet branched)` cell reached that path raw, so every later read
# of the issue hung: promote.sh --prepare for 23 minutes, a manual prod apply
# (brik-client-portal#4619), new-task.sh and claim-probe.sh. The fake gh below
# hangs the same way on any argument carrying a space, and every call runs under
# a kill timer, so a regression FAILS here instead of wedging the suite.
echo "── _ic_pr_state / check_issue_claim — pending-branch claim (#4194) ──"
FAKE="$(mktemp -d "${TMPDIR:-/tmp}/ic-fakegh.XXXXXXXX")"
GH_LOG="$FAKE/calls.log"; : >"$GH_LOG"
cat >"$FAKE/gh" <<'EOF'
#!/usr/bin/env bash
printf '%s\n' "$*" >>"$GH_LOG"
# The PATH argument only: a --jq program legitimately carries spaces.
case "${2:-}" in *" "*) sleep 30; exit 1 ;; esac
case "$1 $2" in
  "api repos/o/r/issues/7/comments") cat "$GH_COMMENTS" ;;
  "api repos/o/r/issues/7")          echo open ;;
  "api repos/o/r/pulls"*)            : ;;
  "repo view")                       echo o/r ;;
esac
EOF
chmod +x "$FAKE/gh"
export GH_LOG

# Kill-timer, not `timeout`: macOS ships none. 10s is ~20x the fake's real cost.
capped() {
  perl -e 'my $t=shift; my $pid=fork; if(!$pid){exec @ARGV} my $end=time+$t;
    while(time<$end){ if(waitpid($pid,1)==$pid){exit($?>>8)} select(undef,undef,undef,0.1) }
    kill "KILL",$pid; exit 124' 10 "$@"
}

assert_eq "the placeholder is the lib's constant — claim-write.sh writes it, the lookup recognises it" \
  "(pending — not yet branched)" "$CLAIM_PENDING_BRANCH"
assert_eq "the placeholder answers none without a network call — no branch means no PR, and none keeps the claim standing" \
  "none" "$(PATH="$FAKE:$PATH" capped bash -c "source '$LIB'; _ic_pr_state o/r \"\$CLAIM_PENDING_BRANCH\"")"
assert_eq "…and gh was never asked" "" "$(cat "$GH_LOG")"

: >"$GH_LOG"
assert_eq "a branch with a space is answered, not hung" \
  "none" "$(PATH="$FAKE:$PATH" capped bash -c "source '$LIB'; _ic_pr_state o/r 'a b'")"
assert_eq "…because it reached gh URL-encoded" \
  "api repos/o/r/pulls?head=o:a%20b&state=all" "$(cut -d' ' -f1-2 "$GH_LOG")"

: >"$GH_LOG"
GH_COMMENTS="$FAKE/comments.ndjson"; export GH_COMMENTS
FRESH_STAMP="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
jq -cn --arg b "$(claim_marker_body rival-host "$CLAIM_PENDING_BRANCH" "$FRESH_STAMP" rival-session)" \
  '{id: 41, login: "nstaner", created_at: "2026-10-05T15:23:37Z", body: $b}' >"$GH_COMMENTS"
( cd "$FAKE" && PATH="$FAKE:$PATH" CLAIM_SESSION_ID=me capped bash -c \
    "source '$LIB'; check_issue_claim o/r#7 task/mine" >/dev/null 2>&1 )
RC=$?
assert_eq "a fresh pending-branch claim by another session REFUSES (rc 1) — it neither hangs (124) nor reads as released (0)" \
  "1" "$RC"
assert_not "…and no gh call carried a raw space" grep -q ' — not' "$GH_LOG"
rm -rf "$FAKE"

# ── a second session continuing a claimed branch (brik-llm#4260) ──────────────
#
# Same host, my branch in the claim's set: rule 2 alone read that as my own
# claim, so /resume step 4.2 stayed silent while two sessions wrote to one
# branch (brik-client-portal#4164). --report must warn and still return 0 —
# stacked or follow-up work on the branch is legitimate.
echo "── check_issue_claim --report — same-branch resume by another session (#4260) ──"
FAKE="$(mktemp -d "${TMPDIR:-/tmp}/ic-resume.XXXXXXXX")"
GH_LOG="$FAKE/calls.log"; : >"$GH_LOG"
GH_COMMENTS="$FAKE/comments.ndjson"
cat >"$FAKE/gh" <<'EOF'
#!/usr/bin/env bash
printf '%s\n' "$*" >>"$GH_LOG"
case "$1 $2" in
  "api repos/o/r/issues/7/comments") cat "$GH_COMMENTS" ;;
  "api repos/o/r/issues/7")          echo open ;;
  "repo view")                       echo o/r ;;
esac
EOF
chmod +x "$FAKE/gh"
export GH_LOG GH_COMMENTS
MY_HOST="$(hostname -s 2>/dev/null || echo unknown-host)"
jq -cn --arg b "$(claim_marker_body "$MY_HOST" "o/r:task/shared" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" first-session)" \
  '{id: 42, login: "nstaner", created_at: "2026-10-05T15:23:37Z", body: $b}' >"$GH_COMMENTS"

resume_as() {
  ( cd "$FAKE" && PATH="$FAKE:$PATH" CLAIM_SESSION_ID="$1" capped bash -c \
      "source '$LIB'; check_issue_claim o/r#7 task/shared --report" >"$FAKE/out" 2>&1 )
  echo $?
}

assert_eq "different-session resume of a claimed branch returns 0 — warn, not block" \
  "0" "$(resume_as second-session)"
assert_ok "…and warns that the ticket is claimed" grep -q 'already claimed by another session' "$FAKE/out"
assert_ok "…naming the claimant's session" grep -q 'Session: first-session' "$FAKE/out"
assert_ok "…and saying my branch is one the claim names" grep -q 'a branch this claim names' "$FAKE/out"

assert_eq "same-session resume returns 0" "0" "$(resume_as first-session)"
assert_not "…and prints no warning" grep -q 'already claimed' "$FAKE/out"
rm -rf "$FAKE"

# ── --fail-closed: an unread claim is not a clear one (brik-llm#4306) ─────────
#
# Every path that cannot read the claim returns 0 by default — right for a
# pickup, wrong for a prod apply, which is why brik-client-portal#4630 had to
# wrap the lib itself. Each path runs in BOTH modes: the default must stay 0
# (pickups fail open, unchanged) and --fail-closed must be 2 — distinct from 1,
# which still means "claimed by a rival".
echo "── check_issue_claim --fail-closed — every unread path, both modes (#4306) ──"
FAKE="$(mktemp -d "${TMPDIR:-/tmp}/ic-failclosed.XXXXXXXX")"
GH_LOG="$FAKE/calls.log"; : >"$GH_LOG"
GH_COMMENTS="$FAKE/comments.ndjson"; : >"$GH_COMMENTS"   # a clear ticket
mkdir -p "$FAKE/bin" "$FAKE/empty"
cat >"$FAKE/bin/gh" <<'EOF'
#!/usr/bin/env bash
printf '%s\n' "$*" >>"$GH_LOG"
case "$1 $2" in
  "api repos/o/r/issues/7/comments")
    [ "${GH_COMMENTS_FAIL:-0}" = "1" ] && exit 1
    cat "$GH_COMMENTS" ;;
  "api repos/o/r/issues/7")          echo open ;;
  "repo view")                       echo o/r ;;
esac
EOF
chmod +x "$FAKE/bin/gh"
export GH_LOG GH_COMMENTS

# <PATH> <prelude> <ref> <mode> → rc; stderr kept in $FAKE/stderr. The prelude
# runs after the lib is sourced, so it can stub a function or empty PATH.
claim_rc() {
  ( cd "$FAKE" && PATH="$1" CLAIM_SESSION_ID=me capped "$BASH" -c \
      'source "$1"; eval "$2"; check_issue_claim "$3" task/mine "$4"' _ "$LIB" "$2" "$3" "$4" \
      >/dev/null 2>"$FAKE/stderr" )
  echo $?
}
said_unread() { grep -q 'the claim was NOT read' "$FAKE/stderr"; }
GHP="$FAKE/bin:$PATH"

# Path 0 — no reference at all. Not one of the issue's four, but the same hole:
# a fail-closed mode that passed an empty ref would fail open on a caller bug.
assert_eq "empty ref, default → 0 (unchanged)" "0" "$(claim_rc "$GHP" ':' '' '')"
assert_eq "empty ref, --fail-closed → 2" "2" "$(claim_rc "$GHP" ':' '' --fail-closed)"
assert_ok "…and says the claim was not read" said_unread

# Path 1 — gh not on PATH (issue-claim.sh, the `command -v gh` guard).
assert_eq "gh missing, default → 0 (unchanged)" "0" \
  "$(claim_rc "$GHP" "PATH='$FAKE/empty'" o/r#7 '')"
assert_eq "gh missing, --fail-closed → 2" "2" \
  "$(claim_rc "$GHP" "PATH='$FAKE/empty'" o/r#7 --fail-closed)"
assert_ok "…and says the claim was not read" said_unread

# Path 2 — the ref does not parse.
: >"$GH_LOG"
assert_eq "unparseable ref, default → 0 (unchanged)" "0" "$(claim_rc "$GHP" ':' 'a/b#12x' '')"
assert_eq "unparseable ref, --fail-closed → 2" "2" "$(claim_rc "$GHP" ':' 'a/b#12x' --fail-closed)"
assert_ok "…and says the claim was not read" said_unread
assert_eq "…and no comments read was attempted for it" "" "$(grep 'comments' "$GH_LOG" || true)"

# Path 3 — a resolver that returns rc 0 with a partial triple. The real resolver
# refuses to (locked above, #2798), so it is stubbed: this guard is the second
# line of defence and has to hold on its own.
PARTIAL="_ic_resolve_ref() { printf ' r 7'; }"
assert_eq "partial triple, default → 0 (unchanged)" "0" "$(claim_rc "$GHP" "$PARTIAL" o/r#7 '')"
assert_eq "partial triple, --fail-closed → 2" "2" "$(claim_rc "$GHP" "$PARTIAL" o/r#7 --fail-closed)"
assert_ok "…and says the claim was not read" said_unread

# Path 4 — the comments read fails. A failed read caches an empty stream, which
# the default reads as "no claim" and then claims over.
export GH_COMMENTS_FAIL=1
: >"$GH_LOG"
assert_eq "comments read fails, default → 0 (unchanged)" "0" "$(claim_rc "$GHP" ':' o/r#7 '')"
assert_ok "…and the default still goes on to claim, as it always did" grep -q -- '-X POST' "$GH_LOG"
: >"$GH_LOG"
assert_eq "comments read fails, --fail-closed → 2" "2" "$(claim_rc "$GHP" ':' o/r#7 --fail-closed)"
assert_ok "…and says the claim was not read" said_unread
assert_not "…and posts no claim over a ticket it could not read" grep -q -- '-X POST' "$GH_LOG"

# Path 4, no-jq arm — _ic_find_claim's fallback read swallows a failure the same
# way. A farm of every system binary EXCEPT jq and gh stands in for a machine
# without jq; the fake gh goes first.
NOJQ="$FAKE/nojq"; mkdir -p "$NOJQ"
for _f in /usr/bin/* /bin/*; do
  case "${_f##*/}" in jq|gh) continue ;; esac
  ln -sf "$_f" "$NOJQ/${_f##*/}" 2>/dev/null || true
done
NOJQP="$FAKE/bin:$NOJQ"
assert_not "precondition: the no-jq farm really has no jq" \
  env PATH="$NOJQP" "$BASH" -c 'command -v jq'
assert_eq "no jq + comments read fails, default → 0 (unchanged)" "0" "$(claim_rc "$NOJQP" ':' o/r#7 '')"
assert_eq "no jq + comments read fails, --fail-closed → 2" "2" "$(claim_rc "$NOJQP" ':' o/r#7 --fail-closed)"
assert_ok "…and says the claim was not read" said_unread
unset GH_COMMENTS_FAIL
assert_eq "no jq + a clear read, --fail-closed → 0 — the fallback does not over-refuse" "0" \
  "$(claim_rc "$NOJQP" ':' o/r#7 --fail-closed)"

# Controls: --fail-closed refuses ONLY what it could not read.
: >"$GH_LOG"
assert_eq "a clear, readable ticket under --fail-closed → 0" "0" "$(claim_rc "$GHP" ':' o/r#7 --fail-closed)"
assert_ok "…and it claims the ticket, as the default mode does" grep -q -- '-X POST' "$GH_LOG"
assert_eq "a cache the CALLER primed (db-migrate-api.sh's pattern) is read, not refused → 0" "0" \
  "$(GH_COMMENTS_FAIL=1 claim_rc "$GHP" "_IC_COMMENTS_KEY='o/r#7'; _IC_COMMENTS_NDJSON=''" o/r#7 --fail-closed)"
jq -cn --arg b "$(claim_marker_body rival-host task/theirs "$(date -u +%Y-%m-%dT%H:%M:%SZ)" rival-session)" \
  '{id: 42, login: "nstaner", created_at: "2026-10-05T15:23:37Z", body: $b}' >"$GH_COMMENTS"
assert_eq "a live rival claim under --fail-closed is still rc 1, not 2 — claimed and unread stay distinct" "1" \
  "$(claim_rc "$GHP" ':' o/r#7 --fail-closed)"
rm -rf "$FAKE"

echo ""
if [ "$FAIL" -gt 0 ]; then
  echo "── issue-claim: $PASS passed, $FAIL failed"
  for c in "${FAILED_CASES[@]}"; do echo "    ✗ $c"; done
  exit 1
fi
echo "── issue-claim: $PASS passed, 0 failed"
