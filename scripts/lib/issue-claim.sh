#!/usr/bin/env bash
# issue-claim.sh — refuse a pickup when another session already claimed the ticket.
#
# Sourced by new-task.sh after the overlap gate, and callable standalone by
# /resume. Closes brik-bds#1541 (the claim slice of brik-llm#1485).
#
# Why a marker comment and not the assignee: every session on this fleet
# authenticates as the SAME login (`gh api user -q .login` → nstaner on both),
# so `--add-assignee @me` is byte-identical for two colliding sessions and
# cannot discriminate. The claim therefore carries host + branch + timestamp.
# The assignee is still set by new-task.sh, but only for board visibility.
#
# Why staleness instead of an explicit release: nothing reliably runs a release
# step — a session dies, a worktree is abandoned, a laptop sleeps. A claim that
# needed releasing would wedge the ticket permanently. Ageing out is the failure
# mode that self-heals.
#
# But a timer is not the only alternative to an explicit release (brik-llm#2204).
# Two signals are authoritative for "that work is over" and neither needs the
# dead session's cooperation: the ISSUE is closed, and every branch the claim
# names has a PR that is MERGED or CLOSED. They are consulted only when the gate
# is about to refuse — see _ic_claim_release_reason — so the common path (no
# claim, my own claim, an already-timed-out claim) still costs exactly the one
# comments read it always did. The 12h timer stays as the fallback for the case
# it is genuinely good at: a session that died leaving no PR.
#
# A third signal costs nothing at all (brik-llm#4414): a `<!-- brik-handoff`
# comment on the same issue, posted AFTER the claim's Since. A hand-off is
# session close (rag:handoff-discipline), so its claim is over. It is read from
# the comments the gate already fetched, and it is the rule
# resume-supersede-check.sh:250-256 already applied — before it, that gate said
# "handed off from — proceed" and this one refused the same pickup over the same
# marker. The write half is release_issue_claim, which /hand-off runs through
# `claim-write.sh --release`; this rule is the backstop for a session that
# handed off without it.
#
# BRANCH-GONE IS DELIBERATELY NOT A SIGNAL ON ITS OWN, and #2204 asked for it.
# `git ls-remote` cannot tell "merged and reaped" from "created by new-task.sh
# and never pushed" — and the never-pushed window is the entire reason this gate
# exists. CLAUDE.md: the claim is "the ONLY gate that sees a session which has
# not pushed", because the overlap gate keys on the issue number in a branch name
# and new-task.sh names branches task/<slug> without it (#2514). On 2026-08-27
# #2645 was built twice inside exactly that window — the winner's branch was not
# pushed until its PR opened, 11 minutes after the loser's branch existed.
# Releasing on an absent remote branch would have un-gated that collision.
# The PR lookup covers every case #2204 actually evidenced: its brik-bds example
# had the branch deleted AND PR #1784 merged. Branch gone with no PR at all reads
# as UNKNOWN and keeps blocking, with the timer as the ceiling.
#
# Why this matters more than the lost time: `NEW_TASK_STEAL_CLAIM=1` is the
# override for "the other session is genuinely gone", and a gate that cries wolf
# teaches the reflex. One brik-bds session used it three times in an hour, every
# refusal naming work that was already merged. A safety gate an agent learns to
# bypass by reflex is worse than no gate.
#
# WHAT IDENTIFIES A CLAIMANT (the decision brik-llm#2792 asked to be recorded):
# host + SESSION ID + a SET of branches, in that precedence.
#
#   1. Same session id → same session, whatever repo or branch it is standing in.
#      Both ids known and DIFFERENT → foreign, whatever host or branch (#4260).
#   2. Else (an id missing on either side) same host AND the branch is in the
#      claim's branch set → my own claim.
#   3. Else foreign.
#
# Rule 1's second half closes the case rule 2 could not see: on 2026-09-22 two
# sessions on brik-mini both wrote to task/hybrid-rpc-query-len-cap
# (brik-client-portal#4164) — same host, a branch in the claim's set, so the
# second read the first's claim as its own. It also stops two sessions' pickups
# matching each other through claim-write.sh's shared placeholder branch.
#
# Host+branch alone was wrong for a case that is routine, not exotic: this lib
# and issue-overlap.sh are canon in brik-llm and twin-synced to consumers, so ONE
# session working ONE ticket legitimately needs TWO branches in TWO repos, and
# the gate read the second as a rival. The only exit was STEAL_CLAIM, which is
# semantically wrong twice — nothing is being stolen, and the steal REWRITES the
# marker onto the consumer branch, silently dropping the canon branch's claim
# while it is still mid-build. Rule 1 removes that path entirely; the claim now
# accumulates branches instead of replacing them.
#
# Session id is CLAUDE_CODE_SESSION_ID, the same variable session-cost.py keys
# the spend ledger on (scripts/claude-tools/session-cost.py:115). It is absent
# for a hand-run `new-task.sh` and in CI, so rule 1 is skipped when either side
# is empty and the gate falls back to rule 2 — the pre-#2792 behaviour. Two
# genuinely distinct sessions on one host carry distinct ids, so this never
# widens into "same host always allowed".
#
# The pure decision functions live at the top so a test can exercise them
# without touching the network. new-task.sh refuses to run outside the primary
# worktree, so anything inline there is untestable — the same reason
# overlap-filters.sh exists.
#
# It also carries the COMMENT DIGEST (brik-llm#2755), because the two read the
# same endpoint. Nothing in the pickup path read a queued issue's own comments:
# /resume reads handoff comments on the UMBRELLA, and new-task.sh --issue read
# the issue's state and size:* label and never its comments. So a session built
# against the body — the brief as FILED — while the comments held what had
# happened since. On 2026-08-27 that cost a full duplicate build of #2645, whose
# 18-hour-old comment already held three completed AC runs and an explicit
# refutation of the issue's own prediction. The claim gate closes the race; this
# closes the half that made the duplication certain regardless of who won it.
#
# Usage (sourced):
#   source scripts/lib/issue-claim.sh
#   check_issue_claim "1541" "task/tooling-issue-claim-gate"   # refuses or claims
#   check_issue_claim "1541" "$branch" --fail-closed           # same, but refuses
#                                                              # when it cannot read
#   report_issue_comments "1541"                               # digest + prompt
#   report_issue_comments "1541" --report                      # digest, no prompt
#   release_issue_claim "brikdesigns/brik-llm#1541"            # drop MY claim
#
# Call check_issue_claim FIRST when you want both: it primes the comment cache,
# so the digest costs zero additional API calls.
#
# Exit / return codes (sourced mode):
#   0  clear to proceed (no claim, my own claim, or a stale one)
#   1  a live claim from another session — caller should abort
#   2  --fail-closed only: the claim could NOT be read — caller should abort
#
# FAIL-OPEN IS THE DEFAULT, AND IT IS DELIBERATE (brik-llm#4306). A pickup that
# cannot read the claim — gh missing, a bad ref, a failed comments read — warns
# and proceeds, because a flaky network must not block work. An ENFORCING caller
# (a prod apply, a promotion lane) needs the opposite: an unreadable claim is not
# a clear one. `--fail-closed` gives it that without a wrapper of its own — before
# it, brik-client-portal#4630 had to re-read the comments itself to get there.

# shellcheck disable=SC2148  # sourced

CLAIM_MARKER='<!-- claim -->'
# 12h: longer than any real task sitting idle mid-session, short enough that an
# abandoned worktree does not wedge the ticket until someone notices.
CLAIM_STALE_SECONDS="${CLAIM_STALE_SECONDS:-43200}"
# The branch cell claim-write.sh writes before new-task.sh has cut a branch. It
# lives here, not in claim-write.sh, because the PR lookup below must recognise
# it: interpolated raw into a gh api path, its spaces hang gh forever, and every
# later read of that issue hung with it (brik-llm#4194).
CLAIM_PENDING_BRANCH='(pending — not yet branched)'

# ── Pure helpers (no network, no git) ──────────────────────────────

# This session's identity. Host discriminates the two machines; branch
# discriminates two sessions on the same machine, which is the case that
# actually collided (both worktrees on brik-mini).
claim_identity() {
  printf '%s\t%s' "$(hostname -s 2>/dev/null || echo unknown-host)" "${1:-unknown-branch}"
}

# The running session's id, or empty. CLAIM_SESSION_ID exists so the contract
# test can drive both sides without a real Claude session in the environment.
claim_session_id() {
  printf '%s' "${CLAIM_SESSION_ID:-${CLAUDE_CODE_SESSION_ID:-}}"
}

# Strip leading and trailing spaces. Parameter expansion only — `read -a` and
# `[[ =~ ]]` both behave differently under zsh, which is $SHELL on both machines
# and the shell /resume sources this lib from (brik-llm#2798).
_ic_trim() {
  local s="${1:-}"
  while [ "${s# }" != "$s" ]; do s="${s# }"; done
  while [ "${s% }" != "$s" ]; do s="${s% }"; done
  printf '%s' "$s"
}

# A branch entry is `owner/repo:branch`, or a bare `branch` for a marker written
# before brik-llm#2792. Git refnames cannot contain a colon, so the split is
# unambiguous. The repo qualifier is what lets the lifetime checks look the
# branch up at all when the claimant was standing in a different repo.
_ic_entry_branch() { printf '%s' "${1#*:}"; }
_ic_entry_repo()   { case "${1:-}" in *:*) printf '%s' "${1%%:*}" ;; *) printf '' ;; esac; }

claim_marker_body() {
  local host="${1:?}" branches="${2:?}" stamp="${3:?}" session="${4:-}"
  local BT='`' cell="" rest="$branches" entry session_row=""
  while [ -n "$rest" ]; do
    case "$rest" in
      *,*) entry="${rest%%,*}"; rest="${rest#*,}" ;;
      *)   entry="$rest";       rest="" ;;
    esac
    entry="$(_ic_trim "$entry")"
    [ -n "$entry" ] || continue
    cell="${cell:+$cell, }${BT}${entry}${BT}"
  done
  # Omitted rather than rendered empty when there is no session id, so a
  # hand-run pickup writes exactly the marker it wrote before brik-llm#2792.
  [ -n "$session" ] && session_row="| Session | ${BT}${session}${BT} |"
  cat <<EOF
${CLAIM_MARKER}
🤖 **Claimed** — a session is working this ticket.

| | |
| --- | --- |
| Host | \`${host}\` |
| Branch | ${cell} |
${session_row:+${session_row}
}| Since | ${stamp} |

Another session's \`new-task.sh\` will refuse this ticket until this issue closes, every branch above is gone, their PRs are merged or closed, or the claim ages out (${CLAIM_STALE_SECONDS}s). Rewritten in place on each pickup — never a second comment.

One session working two repos (a canon lib plus its twin) adds its second branch to the row above; it is not a second claimant.

Still refused by a session that is genuinely gone? \`NEW_TASK_STEAL_CLAIM=1\` overrides, loudly, and names the branches it displaces.
EOF
}

# Echo "host<TAB>branch-cell<TAB>stamp" from a marker comment body. Silent +
# non-zero when the body is not a claim, so a caller can test the return.
#
# The branch cell may hold several comma-separated entries since brik-llm#2792;
# backticks are stripped here so callers never have to know how it is rendered.
parse_claim() {
  local body="${1:-}" host branch stamp
  case "$body" in
    *"$CLAIM_MARKER"*) : ;;
    *) return 1 ;;
  esac
  # Pull the table cells. Anchored on the row label so column order changes in
  # the rendered table cannot silently shift what is parsed.
  host="$(printf '%s\n' "$body"   | sed -n 's/^| Host | `\(.*\)` |$/\1/p'   | head -1)"
  branch="$(printf '%s\n' "$body" | sed -n 's/^| Branch | \(.*\) |$/\1/p'   | head -1 | tr -d '`')"
  stamp="$(printf '%s\n' "$body"  | sed -n 's/^| Since | \(.*\) |$/\1/p'    | head -1)"
  [ -n "$host" ] && [ -n "$branch" ] && [ -n "$stamp" ] || return 1
  printf '%s\t%s\t%s' "$host" "$branch" "$stamp"
}

# The claimant's session id, or empty for a pre-#2792 marker. Separate from
# parse_claim so the three-field contract every caller already peels stays put.
parse_claim_session() {
  local body="${1:-}"
  case "$body" in
    *"$CLAIM_MARKER"*) : ;;
    *) return 1 ;;
  esac
  printf '%s\n' "$body" | sed -n 's/^| Session | `\(.*\)` |$/\1/p' | head -1
}

# ISO-8601 Zulu → epoch seconds. BSD date (macOS, both operator machines) and
# GNU date (ubuntu CI) take incompatible flags, so try BSD then fall back.
# Echoes nothing and returns non-zero on an unparseable stamp — a claim we
# cannot date is treated as stale by the caller rather than blocking forever.
claim_stamp_to_epoch() {
  local stamp="${1:-}" out
  [ -n "$stamp" ] || return 1
  out="$(date -u -j -f '%Y-%m-%dT%H:%M:%SZ' "$stamp" +%s 2>/dev/null)" \
    || out="$(date -u -d "$stamp" +%s 2>/dev/null)" \
    || return 1
  [ -n "$out" ] || return 1
  printf '%s' "$out"
}

# Clock-skew tolerance. A claim stamped slightly AHEAD of the reader's clock is
# still live — the two machines are not NTP-locked to the second, and treating
# any future stamp as stale meant a 1-second drift silently voided a live claim,
# i.e. the gate stopped gating. Caught in testing on 2026-07-29: age was -1.
# Beyond this, a future stamp is bogus data rather than skew, and a claim we
# cannot date must never wedge a ticket.
CLAIM_SKEW_SECONDS="${CLAIM_SKEW_SECONDS:-300}"

# 0 = stale (does not block).
claim_is_stale() {
  # `then_epoch`, not `then`: shellcheck reads `then=` as the shell keyword and
  # raises SC1010, and brik-llm's pre-commit runs at --severity=warning. Renamed
  # here (canon) and re-synced to brik-bds in the same change — brik-llm#2676.
  local stamp="${1:-}" now="${2:?}" window="${3:?}" then_epoch age
  then_epoch="$(claim_stamp_to_epoch "$stamp")" || return 0
  age=$(( now - then_epoch ))
  # Wildly future → unusable stamp → stale.
  [ "$age" -lt $(( -1 * CLAIM_SKEW_SECONDS )) ] && return 0
  # Within skew tolerance (age between -SKEW and 0) → fresh, so it still blocks.
  [ "$age" -lt 0 ] && return 1
  [ "$age" -ge "$window" ]
}

# 0 = this claim belongs to another session and should block.
#
# $2 is the claim's whole branch CELL — one entry, or several comma-separated
# ones, each optionally `owner/repo:`-qualified (brik-llm#2792). Matching is on
# the bare branch name, so a marker rewritten with repo qualifiers still reads as
# my own claim on re-entry.
#
# The session-id arms are last-two so every existing four-argument call keeps its
# exact pre-#2792 meaning. An empty id on either side skips rule 1 entirely — CI
# and a hand-run pickup have none, and "" = "" must never mean "same session".
claim_is_foreign() {
  local their_host="${1:-}" their_branches="${2:-}" my_host="${3:-}" my_branch="${4:-}" \
        their_session="${5:-}" my_session="${6:-}"

  # 1. Same session, whatever repo or branch it is standing in.
  # 1b. Two known ids that differ are two sessions, whatever host or branch
  #     (brik-llm#4260). Without this, a second session continuing a branch the
  #     claim names read as "mine" under rule 2 and the gate went silent.
  if [ -n "$their_session" ] && [ -n "$my_session" ]; then
    [ "$their_session" = "$my_session" ] && return 1
    return 0
  fi

  # 2. Same host and my branch is in the claim's set.
  [ "$their_host" = "$my_host" ] || return 0
  local rest="$their_branches" entry
  while [ -n "$rest" ]; do
    case "$rest" in
      *,*) entry="${rest%%,*}"; rest="${rest#*,}" ;;
      *)   entry="$rest";       rest="" ;;
    esac
    entry="$(_ic_trim "$entry")"
    [ -n "$entry" ] || continue
    [ "$(_ic_entry_branch "$entry")" = "$my_branch" ] && return 1
  done
  return 0
}

# Add my branch entry to a claim's branch cell, replacing any entry for the same
# bare branch so a re-entry upgrades `task/x` to `owner/repo:task/x` in place
# rather than listing it twice. Echoes the new cell.
#
# This is what makes the twin-sync case additive: the second repo's branch joins
# the claim instead of overwriting it, which is the silent side effect
# NEW_TASK_STEAL_CLAIM had (brik-llm#2792).
claim_branch_union() {
  local existing="${1:-}" mine="${2:-}" out="" rest="${1:-}" entry seen=0 mine_bare
  [ -n "$mine" ] || { printf '%s' "$existing"; return 0; }
  mine_bare="$(_ic_entry_branch "$mine")"
  while [ -n "$rest" ]; do
    case "$rest" in
      *,*) entry="${rest%%,*}"; rest="${rest#*,}" ;;
      *)   entry="$rest";       rest="" ;;
    esac
    entry="$(_ic_trim "$entry")"
    [ -n "$entry" ] || continue
    if [ "$(_ic_entry_branch "$entry")" = "$mine_bare" ]; then entry="$mine"; seen=1; fi
    out="${out:+$out, }$entry"
  done
  [ "$seen" -eq 1 ] || out="${out:+$out, }$mine"
  printf '%s' "$out"
}

# 0 = the claimant's work is demonstrably over, so the claim must not block
# (brik-llm#2204). Pure: the signals are passed in as strings so the network half
# can short-circuit, and so an UNKNOWN one can be stated rather than guessed.
#
#   issue_state : OPEN | CLOSED | unknown
#   pr_state    : OPEN | MERGED | CLOSED | none | unknown
#
# Fail-CLOSED on every unknown. A probe that could not answer must leave the
# claim standing — the expensive mistake is letting two sessions build one
# ticket, not making one session wait out a timer.
#
# `none` (no PR for that branch) is deliberately not a release. It is the state
# of every session between `new-task.sh` and `pr-task.sh` — the window #2645 was
# lost in — and it is also what a deleted-but-never-pushed branch looks like. See
# the header on why branch absence is not a signal in its own right.
claim_is_released() {
  local issue_state="${1:-unknown}" pr_state="${2:-unknown}"
  [ "$issue_state" = "CLOSED" ] && return 0
  case "$pr_state" in MERGED|CLOSED) return 0 ;; esac
  return 1
}

# Echo the newest hand-off stamp that postdates <since>, and return 0; rc 1 when
# none does. Reads the comments NDJSON on stdin (brik-llm#4414).
#
# ISO-8601 Zulu stamps compare correctly as strings, which is how
# resume-supersede-check.sh compares the same two values. Only the HTML marker
# counts — the legacy `## Handoff` heading predates claims, and a heading match
# would read any comment quoting one.
claim_handoff_after() {
  local since="${1:-}" at
  [ -n "$since" ] || return 1
  command -v jq >/dev/null 2>&1 || return 1
  at="$(jq -rs --arg s "$since" '
      [ .[] | select((.body // "") | test("<!--\\s*brik-handoff"; "i"))
            | .created_at // empty | select(. > $s) ] | max // empty' 2>/dev/null)" || return 1
  [ -n "$at" ] || return 1
  printf '%s' "$at"
}

# ── Comment digest, pure half (brik-llm#2755) ──────────────────────
#
# First meaningful line of a comment body, for a one-line digest. Skips HTML
# markers and blank lines, strips leading markdown punctuation, collapses runs of
# whitespace, truncates.
#
# sed-only on purpose. The obvious `grep -v '^[[:space:]]*$' | head -1` returns 1
# on an all-blank body, and this lib is sourced into new-task.sh under
# `set -euo pipefail`, so pipefail would turn a whitespace-only comment into an
# aborted pickup — the #2423 class.
COMMENT_HEADLINE_MAX="${COMMENT_HEADLINE_MAX:-88}"

comment_headline() {
  local body="${1:-}" line
  line="$(printf '%s\n' "$body" \
    | sed -e 's/<!--[^>]*-->//g' \
    | sed -n '/[^[:space:]]/{
        s/^[[:space:]]*[#>*_[:space:]-]*//
        s/[[:space:]][[:space:]]*/ /g
        s/[[:space:]]*$//
        p
        q
      }')"
  if [ "${#line}" -gt "$COMMENT_HEADLINE_MAX" ]; then
    printf '%s…' "${line:0:$COMMENT_HEADLINE_MAX}"
  else
    printf '%s' "$line"
  fi
}

# Reduce a comment stream to the one thing a builder has to know.
#
# Reads NDJSON on stdin — one {id, login, created_at, body} object per line, as
# _ic_fetch_comments produces — and emits, on success:
#
#   <count><TAB><login><TAB><created_at><TAB><body-of-newest>
#
# The BODY is last because it carries newlines; the caller peels the first three
# fields with parameter expansion rather than cut, same as parse_claim's caller.
#
# Claim markers are excluded from both the count and the "newest" pick. They are
# this lib's own machine noise, and counting them would mean an issue is never
# silent once claimed — every re-pickup would report "1 comment" about itself,
# and AC "zero comments is silent" would be dead on arrival.
#
# rc 1 with no output when there is nothing a builder needs to read.
comment_digest() {
  local out
  out="$(jq -rs --arg m "$CLAIM_MARKER" '
    [ .[] | select(((.body // "") | contains($m)) | not) ] as $c
    | if ($c | length) == 0 then empty
      else ($c | last) as $n
        | "\($c | length)\t\($n.login // "unknown")\t\($n.created_at // "")\t\($n.body // "")"
      end' 2>/dev/null)" || out=""
  [ -n "$out" ] || return 1
  printf '%s' "$out"
}

# Human-readable age for the refusal message.
claim_age_human() {
  local secs="${1:-0}"
  if [ "$secs" -lt 3600 ]; then printf '%dm' $(( secs / 60 ));
  else printf '%dh%dm' $(( secs / 3600 )) $(( (secs % 3600) / 60 )); fi
}

# ── Network-touching orchestration ─────────────────────────────────

_IC_YELLOW='\033[1;33m'
_IC_GREEN='\033[0;32m'
_IC_RED='\033[0;31m'
_IC_NC='\033[0m'

# gh_repo_slug / gh_explain_failure (brik-llm#1590). Guarded because a twin repo
# may not carry the file yet — _ic_repo_slug degrades to the old API call then.
_IC_LIB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -r "${_IC_LIB_DIR}/gh-error-classify.sh" ]; then
  # shellcheck source=scripts/lib/gh-error-classify.sh
  source "${_IC_LIB_DIR}/gh-error-classify.sh"
fi

# _ic_warn_if_bot_identity — name the active gh account when a claim write fails
# and that account is an App (brik-llm#4063).
#
# `recover-git-auth.sh` logs gh in as brik-ci-bot[bot] with a contents:read
# installation token, and that becomes the ACTIVE account. Reads keep working,
# so the gate looks healthy right up to the comment POST, which 403s. On
# brik-mini on 2026-10-02 the warning below was the only trace: "Could not post
# the claim comment — proceeding unclaimed", with nothing to separate a wrong
# identity from a quota blip or a network stumble. The claim gate had silently
# degraded to no gate at all, which is the brik-llm#1485 duplicate-work class.
#
# Only on the failure path, and `gh auth status` is a local read with no API
# cost. It masks tokens, so no credential value is read here or printed.
_ic_warn_if_bot_identity() {
  local active
  active="$(gh auth status --hostname github.com 2>&1 \
    | awk '/Logged in to|Failed to log in to/{a=$0} /Active account: true/{print a; exit}' \
    | sed -E 's/.*account ([^ ]+).*/\1/')" || return 0
  case "$active" in
    *'[bot]')
      echo -e "${_IC_YELLOW}   Active gh account is ${active} — an App token cannot write issue comments.${_IC_NC}" >&2
      echo -e "${_IC_YELLOW}   Switch back: gh auth switch --hostname github.com --user <your-account>${_IC_NC}" >&2
      ;;
  esac
  return 0
}

# owner/name for the current repo, for zero GraphQL points (brik-llm#1754).
#
# `gh repo view --json nameWithOwner` costs 1 point and this lib is on the
# /resume path. Worse, an exhausted bucket makes it echo nothing, so the caller
# returned 2 ("unresolvable reference") for what is a quota problem.
# `gh_repo_slug` reads `origin` locally and costs nothing; the API is the
# fallback for a checkout with no usable remote, and its failure is named by
# class instead of swallowed.
_ic_repo_slug() {
  local slug err
  if declare -F gh_repo_slug >/dev/null 2>&1 && slug="$(gh_repo_slug)"; then
    printf '%s\n' "$slug"
    return 0
  fi
  err="$(mktemp "${TMPDIR:-/tmp}/ic-slug-err.XXXXXXXX")"
  if slug="$(gh repo view --json nameWithOwner --jq .nameWithOwner 2>"$err")" \
    && [ -n "$slug" ]; then
    rm -f "$err"
    printf '%s\n' "$slug"
    return 0
  fi
  if declare -F gh_explain_failure >/dev/null 2>&1; then
    gh_explain_failure "$(cat "$err" 2>/dev/null)" >/dev/null
  fi
  rm -f "$err"
  return 1
}

# "1541" or "owner/repo#1541" → OWNER REPO NUMBER. Reference parsing stays
# self-contained (issue-overlap.sh's resolver is not reused) so /resume can
# source this lib alone; only the slug lookup is shared, via the leaf
# gh-error-classify.sh sourced above.
#
# Matched with `case` + parameter expansion, NOT `[[ =~ ]]`: /resume step 4.2
# tells the operator to `source` this lib, $SHELL is /bin/zsh on both machines,
# and zsh fills $match rather than $BASH_REMATCH. The regex form therefore
# assigned three empty strings and returned 0, so the caller guard below could
# not fire, `gh api repos///issues//comments` failed into `|| true`, and
# check_issue_claim reported a claimed ticket as clean (brik-llm#2798).
#
# `owner/repo#N` now REQUIRES the `#`. The old regex let `[0-9]+` backtrack into
# the repo segment, so `a/b12` resolved as repo `b1` issue `2` — a silent
# misroute to a ticket nobody asked about. Every caller passes the `#` form.
_ic_is_digits() { case "${1-}" in ''|*[!0-9]*) return 1 ;; *) return 0 ;; esac; }
_ic_is_slug()   { case "${1-}" in ''|*[!A-Za-z0-9._-]*) return 1 ;; *) return 0 ;; esac; }

_ic_resolve_ref() {
  local ref="${1-}" owner repo num nwo left
  case "$ref" in
    *'#'*)
      left="${ref%%'#'*}"
      num="${ref#*'#'}"
      _ic_is_digits "$num" || return 2
      case "$left" in
        */*)
          owner="${left%%/*}"
          repo="${left#*/}"
          _ic_is_slug "$owner" || return 2
          _ic_is_slug "$repo"  || return 2
          ;;
        '')
          nwo="$(_ic_repo_slug)" || return 2
          [ -z "$nwo" ] && return 2
          owner="${nwo%%/*}"; repo="${nwo##*/}"
          ;;
        *) return 2 ;;
      esac
      ;;
    *)
      _ic_is_digits "$ref" || return 2
      num="$ref"
      nwo="$(_ic_repo_slug)" || return 2
      [ -z "$nwo" ] && return 2
      owner="${nwo%%/*}"; repo="${nwo##*/}"
      ;;
  esac
  # Belt-and-braces: never emit a partial triple with rc 0. That combination is
  # what made the zsh failure silent instead of loud.
  [ -n "$owner" ] && [ -n "$repo" ] && [ -n "$num" ] || return 2
  printf '%s %s %s' "$owner" "$repo" "$num"
}

# ── The one comments read, shared by both gates (brik-llm#2755) ────
#
# The claim lookup and the comment digest want the same endpoint, so they make
# ONE call between them. The fleet shares an hourly GitHub bucket
# (rag:github-api-quota-is-shared-across-the-fleet) and this lib is on the hot
# path — new-task.sh sources it on every task branch, /resume on every pickup.
# #1754 went to the trouble of removing a single point from this path; adding one
# straight back for a second read of the same comments would undo it.
#
# Cached in globals keyed by the resolved ref, so a second caller in the same
# process is free. MUST be invoked OUTSIDE a command substitution to prime it —
# a subshell's assignment is lost, which is the trap already documented at
# _io_issue_state's $4 and cost that fix its first cut.
_IC_COMMENTS_KEY=""
_IC_COMMENTS_NDJSON=""
# The key whose last read FAILED (brik-llm#4306). A failed read still caches an
# empty stream — the default mode reads that as "no claim", unchanged — and this
# is how --fail-closed tells the two apart. Keyed rather than a bare flag because
# callers prime the cache themselves (resume-supersede-check.sh, the portal's
# db-migrate-api.sh) and set only the two globals above.
_IC_COMMENTS_FAILED_KEY=""

# One JSON object per line. NDJSON rather than a single array because
# `gh api --paginate` concatenates one array PER PAGE, which is not valid JSON as
# a whole — the field selection also keeps a 200-comment thread out of memory.
#
# Needs the external `jq`, because `gh api --jq` takes one program per call and
# both consumers want a different slice of the same payload. Eleven other libs in
# scripts/lib already depend on it; this gate family did not, so a machine without
# it must lose only the NEW surface — see _ic_find_claim's fallback. A missing jq
# silently un-gating the claim check would be the #2422 fail-open all over again.
_ic_fetch_comments() {
  local owner="$1" repo="$2" num="$3"
  # A second `local`, not a fourth assignment above: SC2318, and brik-llm's
  # pre-commit lints shell at --severity=warning.
  local key="$owner/$repo#$num"
  [ "$_IC_COMMENTS_KEY" = "$key" ] && return 0
  command -v jq >/dev/null 2>&1 || { _IC_COMMENTS_KEY=""; return 1; }
  local rc=0
  _IC_COMMENTS_NDJSON="$(gh api "repos/$owner/$repo/issues/$num/comments" --paginate \
    --jq '.[] | {id, login: .user.login, created_at, body} | @json' 2>/dev/null)" || rc=$?
  _IC_COMMENTS_KEY="$key"
  if [ "$rc" -ne 0 ]; then _IC_COMMENTS_FAILED_KEY="$key"; else _IC_COMMENTS_FAILED_KEY=""; fi
  return 0
}

# Echo "id<TAB>body" for the existing marker comment.
#
# Reads the shared cache; primes it first when it is cold, so a standalone caller
# still works and a primed caller pays nothing. Safe inside a command
# substitution either way — only the priming is subshell-sensitive.
#
# With no jq, falls back to the pre-#2755 form: same endpoint, same one call,
# gh's internal jq. The claim gate keeps working exactly as it shipped; only the
# comment digest goes quiet.
#
# A 4th arg of `strict` (brik-llm#4306, --fail-closed only) returns 2 when the
# comments could not be read, on either branch. Without it the rc is always 0,
# because three callers run this bare under `set -e` and must not change.
_ic_find_claim() {
  local owner="$1" repo="$2" num="$3" strict="${4:-}"
  if ! _ic_fetch_comments "$owner" "$repo" "$num"; then
    if [ "$strict" = "strict" ]; then
      gh api "repos/$owner/$repo/issues/$num/comments" --paginate \
        --jq "[.[] | select(.body | contains(\"$CLAIM_MARKER\"))] | last | select(.) | \"\(.id)\t\(.body)\"" \
        2>/dev/null || return 2
      return 0
    fi
    gh api "repos/$owner/$repo/issues/$num/comments" --paginate \
      --jq "[.[] | select(.body | contains(\"$CLAIM_MARKER\"))] | last | select(.) | \"\(.id)\t\(.body)\"" \
      2>/dev/null || true
    return 0
  fi
  if [ "$strict" = "strict" ] && [ "$_IC_COMMENTS_FAILED_KEY" = "$owner/$repo#$num" ]; then
    return 2
  fi
  [ -n "$_IC_COMMENTS_NDJSON" ] || return 0
  printf '%s\n' "$_IC_COMMENTS_NDJSON" \
    | jq -rs --arg m "$CLAIM_MARKER" \
        '[ .[] | select((.body // "") | contains($m)) ] | last | select(.) | "\(.id)\t\(.body)"' \
        2>/dev/null || true
}

# ── Lifetime probes (brik-llm#2204) ────────────────────────────────
#
# Every one of these runs ONLY on the refusal path — a foreign claim that the 12h
# timer has not yet expired. The common path is untouched, so #1754's work to get
# this lib off GraphQL and down to a single comments read still holds.
#
# REST throughout, never GraphQL: the fleet shares one hourly GraphQL bucket
# (rag:github-api-quota-is-shared-across-the-fleet) and `gh pr list` spends from
# it. `gh api repos/.../pulls` does not.

# OPEN | CLOSED, or rc 1 when it could not be read.
_ic_issue_state() {
  local owner="${1:?}" repo="${2:?}" num="${3:?}" st
  st="$(gh api "repos/${owner}/${repo}/issues/${num}" --jq '.state' 2>/dev/null)" || return 1
  [ -n "$st" ] || return 1
  printf '%s' "$st" | tr '[:lower:]' '[:upper:]'
}

# OPEN | MERGED | CLOSED | none, or rc 1 when it could not be read.
#
# The `?head=` query string is QUOTED and must stay that way: zsh glob-expands a
# bare `?` in a gh api path, `no matches found` kills the first stage of a
# pipeline, and the failure then looks like a valid empty answer.
#
# The branch is URL-encoded before it reaches that string. A space in a gh api
# path does not error — gh never returns — so a raw `(pending — not yet
# branched)` cell wedged every pickup of the issue it sat on (brik-llm#4194).
# The placeholder itself skips the call: no branch means no PR, and `none`
# keeps the claim standing, which is right for a session that has not branched
# yet. Without jq, a name outside the plain ref charset is answered the same
# way rather than sent unencoded.
_ic_pr_state() {
  local repo="${1:?}" br="${2:?}" out
  # A second `local`, not a fourth assignment above: SC2318, same as
  # _ic_fetch_comments' key.
  local owner="${repo%%/*}"
  local enc
  if [ "$br" = "$CLAIM_PENDING_BRANCH" ]; then
    printf 'none'
    return 0
  fi
  if command -v jq >/dev/null 2>&1; then
    enc="$(jq -rn --arg s "$br" '$s | @uri')" || return 1
  else
    case "$br" in
      *[!A-Za-z0-9._/-]*) printf 'none'; return 0 ;;
    esac
    enc="$br"
  fi
  out="$(gh api "repos/${repo}/pulls?head=${owner}:${enc}&state=all" \
    --jq '[.[] | if .merged_at then "MERGED" else (.state | ascii_upcase) end] | join(" ")' \
    2>/dev/null)" || return 1
  case " $out " in
    *" OPEN "*)   printf 'OPEN' ;;
    *" MERGED "*) printf 'MERGED' ;;
    *" CLOSED "*) printf 'CLOSED' ;;
    *)            printf 'none' ;;
  esac
}

# Echo why the claim is over and return 0; silent rc 1 when it still stands.
#
# A hand-off after the claim's <since> goes first because it is free: it reads
# the comments check_issue_claim already cached, and only when that cache holds
# this issue (brik-llm#4414).
#
# Issue state next: it is one call regardless of how many branches the claim
# names, and it is the only signal that covers a ticket closed as `not planned`,
# closed by a PR that closed rather than merged, or closed by hand.
_ic_claim_release_reason() {
  local owner="${1:?}" repo="${2:?}" num="${3:?}" branches="${4:-}" since="${5:-}"
  local handoff_at=""
  if [ -n "$since" ] && [ "$_IC_COMMENTS_KEY" = "$owner/$repo#$num" ] \
     && handoff_at="$(printf '%s\n' "$_IC_COMMENTS_NDJSON" | claim_handoff_after "$since")"; then
    printf 'that session handed off at %s, after claiming' "$handoff_at"
    return 0
  fi

  local state=""
  state="$(_ic_issue_state "$owner" "$repo" "$num")" || state="unknown"
  if claim_is_released "$state" unknown; then
    printf 'the issue is closed'
    return 0
  fi

  # Then the PR behind every branch the claim names. ALL of them must be over —
  # one live branch in a two-repo claim means that session is still building.
  #
  # Peeled with parameter expansion, not `for entry in $branches`: zsh does not
  # word-split an unquoted expansion, so that form would treat a two-branch cell
  # as one opaque entry. Same class as #2798, different construct.
  local rest="$branches" entry brepo br pr n=0
  while [ -n "$rest" ]; do
    case "$rest" in
      *,*) entry="${rest%%,*}"; rest="${rest#*,}" ;;
      *)   entry="$rest";       rest="" ;;
    esac
    entry="$(_ic_trim "$entry")"
    [ -n "$entry" ] || continue
    brepo="$(_ic_entry_repo "$entry")"
    br="$(_ic_entry_branch "$entry")"
    # A pre-#2792 marker names no repo. Fall back to the issue's own repo, which
    # is safe in this direction only: guessing wrong yields `none`, and `none`
    # keeps the claim standing.
    [ -n "$brepo" ] || brepo="${owner}/${repo}"
    pr="$(_ic_pr_state "$brepo" "$br")" || return 1
    claim_is_released unknown "$pr" || return 1
    n=$(( n + 1 ))
  done
  [ "$n" -gt 0 ] || return 1

  printf 'its PR is merged or closed'
  return 0
}

# --fail-closed's refusal, one wording for every unread path (brik-llm#4306).
_ic_refuse_unread() {
  echo -e "${_IC_RED}✗ $1 — the claim was NOT read. Refusing (--fail-closed).${_IC_NC}" >&2
  echo -e "${_IC_RED}  An unreadable claim is not a clear one. Check \`gh auth status\`, then re-run.${_IC_NC}" >&2
}

# check_issue_claim <issue-ref> <branch> [--report|--fail-closed]
# --report prints and always returns 0 (for /resume, which must not abort).
# --fail-closed enforces as the default does, and returns 2 instead of 0 on every
# path that could not read the claim (brik-llm#4306 — header § FAIL-OPEN).
check_issue_claim() {
  local ref="${1:-}" branch="${2:-}" mode="${3:-enforce}"
  if [ -z "$ref" ]; then
    [ "$mode" = "--fail-closed" ] && { _ic_refuse_unread "No issue reference given"; return 2; }
    return 0
  fi

  if ! command -v gh >/dev/null 2>&1; then
    [ "$mode" = "--fail-closed" ] && { _ic_refuse_unread "gh not on PATH"; return 2; }
    echo -e "${_IC_YELLOW}⚠  gh not on PATH — skipping the claim check.${_IC_NC}" >&2
    return 0
  fi

  local resolved owner repo num
  resolved="$(_ic_resolve_ref "$ref")" || {
    [ "$mode" = "--fail-closed" ] && { _ic_refuse_unread "Could not parse issue reference '${ref}'"; return 2; }
    echo -e "${_IC_YELLOW}⚠  Could not parse issue reference '${ref}' — skipping the claim check.${_IC_NC}" >&2
    return 0
  }
  read -r owner repo num <<<"$resolved"
  # A resolver that emits fewer than three fields must never reach the API call:
  # `gh api repos///issues//comments` fails into _ic_find_claim's `|| true`, and
  # the gate then reports clean on a claimed ticket (brik-llm#2798).
  if [ -z "$owner" ] || [ -z "$repo" ] || [ -z "$num" ]; then
    [ "$mode" = "--fail-closed" ] && { _ic_refuse_unread "Could not resolve '${ref}' to owner/repo/number"; return 2; }
    echo -e "${_IC_YELLOW}⚠  Could not resolve '${ref}' to owner/repo/number — claim check NOT run.${_IC_NC}" >&2
    return 0
  fi

  local ident my_host my_branch my_session my_repo my_entry
  ident="$(claim_identity "$branch")"
  my_host="${ident%%$'\t'*}"; my_branch="${ident#*$'\t'}"
  my_session="$(claim_session_id)"
  # Free — reads `origin` locally (#1754). Empty for a checkout with no usable
  # remote, which just means my entry stays unqualified, exactly as before.
  my_repo="$(_ic_repo_slug 2>/dev/null || true)"
  my_entry="${my_repo:+${my_repo}:}${my_branch}"

  local found id body parsed their_host their_branch their_session stamp now age
  local mine=0 release_reason=""
  # Primed HERE, not inside the substitution below: a subshell's assignment to
  # _IC_COMMENTS_NDJSON is lost, and then report_issue_comments would pay for a
  # second read of the same endpoint. `|| true` because a missing jq is handled
  # by _ic_find_claim's fallback, not by aborting the claim check.
  _ic_fetch_comments "$owner" "$repo" "$num" || true
  if [ "$mode" = "--fail-closed" ]; then
    # A failed read caches an empty stream, which reads as "no claim" — the
    # fail-open half of #4306. Strict mode asks the cache which one it was.
    found="$(_ic_find_claim "$owner" "$repo" "$num" strict)" || {
      _ic_refuse_unread "Could not read the comments on ${owner}/${repo}#${num}"
      return 2
    }
  else
    found="$(_ic_find_claim "$owner" "$repo" "$num")"
  fi
  id="${found%%$'\t'*}"
  body="${found#*$'\t'}"

  if [ -n "$found" ] && parsed="$(parse_claim "$body")"; then
    their_host="$(printf '%s' "$parsed" | cut -f1)"
    their_branch="$(printf '%s' "$parsed" | cut -f2)"
    stamp="$(printf '%s' "$parsed" | cut -f3)"
    their_session="$(parse_claim_session "$body")"
    now="$(date -u +%s)"

    if claim_is_foreign "$their_host" "$their_branch" "$my_host" "$my_branch" \
         "$their_session" "$my_session"; then
      : # a rival until proven otherwise
    else
      mine=1
    fi

    if [ "$mine" -eq 0 ] && ! claim_is_stale "$stamp" "$now" "$CLAIM_STALE_SECONDS"; then
      # Within the timer, so ask the three authoritative signals whether that
      # work is actually still in flight (brik-llm#2204). Only reached here —
      # a clear ticket, my own claim, or an already-expired one costs nothing.
      if release_reason="$(_ic_claim_release_reason "$owner" "$repo" "$num" \
                            "$their_branch" "$stamp")"; then
        echo -e "${_IC_YELLOW}⚠  A claim by ${their_host} / ${their_branch} is no longer live — ${release_reason}.${_IC_NC}" >&2
        echo -e "${_IC_YELLOW}   Taking the ticket; no NEW_TASK_STEAL_CLAIM needed.${_IC_NC}" >&2
      else
        age=$(( now - $(claim_stamp_to_epoch "$stamp") ))
        echo ""
        echo -e "${_IC_RED}✗ ${owner}/${repo}#${num} is already claimed by another session.${_IC_NC}"
        echo ""
        echo "    Host:   ${their_host}"
        echo "    Branch: ${their_branch}"
        [ -n "$their_session" ] && echo "    Session: ${their_session}"
        echo "    Age:    $(claim_age_human "$age")"
        echo ""
        # Same host and my branch in their set: rule 2 alone would have called
        # this mine. It is another session CONTINUING that branch (#4260).
        if [ "$their_host" = "$my_host" ] \
           && ! claim_is_foreign "$their_host" "$their_branch" "$my_host" "$my_branch"; then
          echo -e "${_IC_YELLOW}  You are on ${my_branch}, a branch this claim names — that session may${_IC_NC}"
          echo -e "${_IC_YELLOW}  still be writing to it. Stacked or follow-up work is fine; check first.${_IC_NC}"
          echo ""
        fi
        echo -e "${_IC_RED}  This issue is open and its work is not merged — checked, not assumed.${_IC_NC}"
        echo -e "${_IC_RED}  Two sessions on one ticket is the failure this exists to stop —${_IC_NC}"
        echo -e "${_IC_RED}  brik-llm#1485 is four collisions in 95 minutes, including two with${_IC_NC}"
        echo -e "${_IC_RED}  no branch or PR for the overlap gate to catch.${_IC_NC}"
        echo ""
        echo "  Check that session first. If it is genuinely gone:"
        echo "    NEW_TASK_STEAL_CLAIM=1 <your command>"
        [ "$mode" = "--report" ] && return 0
        if [ "${NEW_TASK_STEAL_CLAIM:-0}" = "1" ]; then
          echo ""
          echo -e "${_IC_YELLOW}⚠  NEW_TASK_STEAL_CLAIM=1 — taking the ticket anyway.${_IC_NC}"
          # Never silently: the steal replaces the branch set, and a displaced
          # branch that is still mid-build is exactly what brik-llm#2792 lost.
          echo -e "${_IC_YELLOW}   Displacing this claim's branches: ${their_branch}${_IC_NC}"
        else
          return 1
        fi
      fi
    fi
  fi

  [ "$mode" = "--report" ] && return 0

  # Claim it. Rewrite the existing marker in place so a ticket never accretes
  # one comment per pickup.
  #
  # My own claim ADDS this branch to the set rather than replacing it, so one
  # session working a canon lib and its twin holds one claim over two branches
  # (brik-llm#2792). A steal or a released claim replaces, which is what those
  # two mean.
  local new_body new_branches="$my_entry"
  if [ "$mine" -eq 1 ] && [ -n "${their_branch:-}" ]; then
    new_branches="$(claim_branch_union "$their_branch" "$my_entry")"
  fi
  new_body="$(claim_marker_body "$my_host" "$new_branches" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$my_session")"
  if [ -n "$id" ] && [ "$id" != "$found" ]; then
    gh api -X PATCH "repos/$owner/$repo/issues/comments/$id" -f body="$new_body" >/dev/null 2>&1 \
      && echo -e "${_IC_GREEN}✓ Claim refreshed on ${owner}/${repo}#${num} (${my_host} / ${new_branches}).${_IC_NC}" \
      || { echo -e "${_IC_YELLOW}⚠  Could not refresh the claim comment — proceeding unclaimed.${_IC_NC}" >&2
           _ic_warn_if_bot_identity; }
  else
    gh api -X POST "repos/$owner/$repo/issues/$num/comments" -f body="$new_body" >/dev/null 2>&1 \
      && echo -e "${_IC_GREEN}✓ Claimed ${owner}/${repo}#${num} (${my_host} / ${new_branches}).${_IC_NC}" \
      || { echo -e "${_IC_YELLOW}⚠  Could not post the claim comment — proceeding unclaimed.${_IC_NC}" >&2
           _ic_warn_if_bot_identity; }
  fi

  # Assignee is board visibility only — it cannot discriminate sessions.
  gh issue edit "$num" --repo "$owner/$repo" --add-assignee @me >/dev/null 2>&1 || true
  return 0
}

# release_issue_claim <issue-ref> — delete THIS session's claim marker
# (brik-llm#4414). /hand-off runs it through `claim-write.sh --release`.
#
# The header's "why staleness instead of an explicit release" still holds: a
# session that dies runs nothing, so the timer and the release signals stay. A
# hand-off is the one moment a session reliably closes ON PURPOSE, and its
# claims outlived it by the full 12h — 1546fc53's claims on #4359 and
# brik-client-portal#4788 were still refusing pickups five hours after it handed
# off on #4303.
#
# Session id ONLY, never host+branch: at hand-off the branch is usually merged
# and reaped, and two sessions on one host share it through claim-write.sh's
# placeholder branch. No session id means no way to tell mine from a rival's,
# so nothing is released.
#
# The marker is re-read by id just before the delete. Between the comments read
# and the delete a rival pickup may legitimately rewrite it — the hand-off it
# reads releases mine — and deleting that would drop a live claim.
#
# Returns: 0 released · 3 nothing of mine here (no marker, or another
# session's, left in place) · 1 could not read or delete · 2 bad ref or no
# session id.
release_issue_claim() {
  local ref="${1:-}" my_session resolved owner repo num
  my_session="$(claim_session_id)"
  if [ -z "$my_session" ]; then
    echo -e "${_IC_YELLOW}⚠  No session id (CLAUDE_CODE_SESSION_ID) — cannot tell this session's claim from a rival's. Releasing nothing.${_IC_NC}" >&2
    return 2
  fi
  command -v gh >/dev/null 2>&1 || { echo -e "${_IC_YELLOW}⚠  gh not on PATH — no claim released.${_IC_NC}" >&2; return 1; }
  resolved="$(_ic_resolve_ref "$ref")" || { echo "  · '${ref}' is not an issue reference — skipped" >&2; return 2; }
  read -r owner repo num <<<"$resolved"
  { [ -n "$owner" ] && [ -n "$repo" ] && [ -n "$num" ]; } || return 2

  local found id body their_session current
  found="$(_ic_find_claim "$owner" "$repo" "$num" strict)" || {
    echo -e "${_IC_YELLOW}⚠  ${owner}/${repo}#${num}: could not read the comments — claim NOT released.${_IC_NC}" >&2
    return 1
  }
  [ -n "$found" ] || return 3
  id="${found%%$'\t'*}"
  body="${found#*$'\t'}"
  their_session="$(parse_claim_session "$body")"
  if [ "$their_session" != "$my_session" ]; then
    echo "  · ${owner}/${repo}#${num}: claimed by session ${their_session:-unknown} — left in place"
    return 3
  fi

  current="$(gh api "repos/$owner/$repo/issues/comments/$id" --jq '.body' 2>/dev/null)" || {
    echo -e "${_IC_YELLOW}⚠  ${owner}/${repo}#${num}: could not re-read the claim — NOT released.${_IC_NC}" >&2
    return 1
  }
  if [ "$(parse_claim_session "$current")" != "$my_session" ]; then
    echo "  · ${owner}/${repo}#${num}: re-claimed by another session since the read — left in place"
    return 3
  fi
  gh api -X DELETE "repos/$owner/$repo/issues/comments/$id" >/dev/null 2>&1 || {
    echo -e "${_IC_YELLOW}⚠  ${owner}/${repo}#${num}: could not delete the claim — NOT released.${_IC_NC}" >&2
    return 1
  }
  echo -e "${_IC_GREEN}✓ Released the claim on ${owner}/${repo}#${num}.${_IC_NC}"
  return 0
}

# ── Comment digest, network half (brik-llm#2755) ───────────────────

# Acknowledgement without ever aborting the caller. Same contract as
# issue-overlap.sh's _io_confirm, and duplicated rather than reused for the same
# reason _ic_resolve_ref is: /resume sources this lib ALONE, so a cross-lib call
# would be an undefined function on that path.
#
# A bare `read -r` here would be the #1692 regression: read returns 1 on EOF,
# new-task.sh calls into this under `set -euo pipefail`, and a closed stdin would
# take the script down before the worktree was created.
_ic_confirm() {
  if [ "${NEW_TASK_YES:-0}" = "1" ] || [ ! -t 0 ]; then
    echo -e "${_IC_YELLOW}   → non-interactive: proceeding automatically.${_IC_NC}" >&2
    return 0
  fi
  echo -e "${_IC_YELLOW}   Press Enter to continue anyway, Ctrl+C to abort.${_IC_NC}" >&2
  read -r || true
}

# report_issue_comments <issue-ref> [--report]
#
# Surfaces what the issue BODY does not say. The body is the brief as filed; a
# comment is what has happened since, and nothing in the pickup path read one
# until this existed (brik-llm#2755).
#
# Zero comments is silent — no line, no prompt. That is deliberate: 60 of the 100
# newest open brik-llm issues had no comments when this shipped (measured
# 2026-08-27), so a gate that announced itself on every pickup would spend its
# credibility on the majority case where it has nothing to say.
#
# --report prints and returns 0 without prompting, for /resume — the same posture
# as check_issue_claim's --report, so a pickup does not grow a second
# differently-shaped warning block.
#
# Always returns 0. This is an advisory read, never a gate that can refuse: an
# unreadable comment list means no advice, and the claim gate above is what
# actually stops a second session.
report_issue_comments() {
  local ref="${1:-}" mode="${2:-prompt}"
  [ -z "$ref" ] && return 0
  command -v gh >/dev/null 2>&1 || return 0

  local resolved owner repo num
  resolved="$(_ic_resolve_ref "$ref")" || return 0
  read -r owner repo num <<<"$resolved"
  # Same partial-triple guard as check_issue_claim (brik-llm#2798). Silent here —
  # this half is advisory, and its own contract is never to abort a pickup.
  { [ -n "$owner" ] && [ -n "$repo" ] && [ -n "$num" ]; } || return 0

  if ! _ic_fetch_comments "$owner" "$repo" "$num"; then
    echo -e "${_IC_YELLOW}⚠  jq not on PATH — skipping the comment digest for ${owner}/${repo}#${num}.${_IC_NC}" >&2
    return 0
  fi

  local digest rest count login stamp body head now then_epoch age_str
  digest="$(printf '%s\n' "$_IC_COMMENTS_NDJSON" | comment_digest)" || return 0

  # Peel the three metadata fields; the body is last because it carries newlines,
  # so cut cannot be used on it.
  count="${digest%%$'\t'*}"; rest="${digest#*$'\t'}"
  login="${rest%%$'\t'*}";   rest="${rest#*$'\t'}"
  stamp="${rest%%$'\t'*}";   body="${rest#*$'\t'}"
  head="$(comment_headline "$body")"

  age_str=""
  now="$(date -u +%s)"
  if then_epoch="$(claim_stamp_to_epoch "$stamp")"; then
    age_str=" ($(claim_age_human "$(( now - then_epoch ))") ago)"
  fi

  echo "" >&2
  if [ "$count" -eq 1 ]; then
    echo -e "${_IC_YELLOW}⚠  ${owner}/${repo}#${num} has 1 comment the body does not include:${_IC_NC}" >&2
  else
    echo -e "${_IC_YELLOW}⚠  ${owner}/${repo}#${num} has ${count} comments the body does not include:${_IC_NC}" >&2
  fi
  echo "    newest — ${login}, ${stamp}${age_str}" >&2
  echo "    \"${head}\"" >&2
  echo "" >&2
  echo -e "${_IC_YELLOW}   A comment postdates the brief, so treat it as SUPERSEDING the body.${_IC_NC}" >&2
  echo -e "${_IC_YELLOW}   #2645 was built twice because an 18-hour-old comment holding three${_IC_NC}" >&2
  echo -e "${_IC_YELLOW}   finished acceptance runs went unread (brik-llm#2755).${_IC_NC}" >&2
  echo "     gh issue view ${num} --repo ${owner}/${repo} --comments" >&2

  [ "$mode" = "--report" ] && return 0
  _ic_confirm
  return 0
}
