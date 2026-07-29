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
# The pure decision functions live at the top so a test can exercise them
# without touching the network. new-task.sh refuses to run outside the primary
# worktree, so anything inline there is untestable — the same reason
# overlap-filters.sh exists.
#
# Usage (sourced):
#   source scripts/lib/issue-claim.sh
#   check_issue_claim "1541" "task/tooling-issue-claim-gate"   # refuses or claims
#
# Exit / return codes (sourced mode):
#   0  clear to proceed (no claim, my own claim, or a stale one)
#   1  a live claim from another session — caller should abort

# shellcheck disable=SC2148  # sourced

CLAIM_MARKER='<!-- claim -->'
# 12h: longer than any real task sitting idle mid-session, short enough that an
# abandoned worktree does not wedge the ticket until someone notices.
CLAIM_STALE_SECONDS="${CLAIM_STALE_SECONDS:-43200}"

# ── Pure helpers (no network, no git) ──────────────────────────────

# This session's identity. Host discriminates the two machines; branch
# discriminates two sessions on the same machine, which is the case that
# actually collided (both worktrees on brik-mini).
claim_identity() {
  printf '%s\t%s' "$(hostname -s 2>/dev/null || echo unknown-host)" "${1:-unknown-branch}"
}

claim_marker_body() {
  local host="${1:?}" branch="${2:?}" stamp="${3:?}"
  cat <<EOF
${CLAIM_MARKER}
🤖 **Claimed** — a session is working this ticket.

| | |
| --- | --- |
| Host | \`${host}\` |
| Branch | \`${branch}\` |
| Since | ${stamp} |

Another session's \`new-task.sh\` will refuse this ticket until the claim goes stale (${CLAIM_STALE_SECONDS}s) or the issue closes. Rewritten in place on each pickup — never a second comment.

Stale because that session is gone? \`NEW_TASK_STEAL_CLAIM=1\` overrides, loudly.
EOF
}

# Echo "host<TAB>branch<TAB>stamp" from a marker comment body. Silent + non-zero
# when the body is not a claim, so a caller can test the return.
parse_claim() {
  local body="${1:-}" host branch stamp
  case "$body" in
    *"$CLAIM_MARKER"*) : ;;
    *) return 1 ;;
  esac
  # Pull the table cells. Anchored on the row label so column order changes in
  # the rendered table cannot silently shift what is parsed.
  host="$(printf '%s\n' "$body"   | sed -n 's/^| Host | `\(.*\)` |$/\1/p'   | head -1)"
  branch="$(printf '%s\n' "$body" | sed -n 's/^| Branch | `\(.*\)` |$/\1/p' | head -1)"
  stamp="$(printf '%s\n' "$body"  | sed -n 's/^| Since | \(.*\) |$/\1/p'    | head -1)"
  [ -n "$host" ] && [ -n "$branch" ] && [ -n "$stamp" ] || return 1
  printf '%s\t%s\t%s' "$host" "$branch" "$stamp"
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
  local stamp="${1:-}" now="${2:?}" window="${3:?}" then age
  then="$(claim_stamp_to_epoch "$stamp")" || return 0
  age=$(( now - then ))
  # Wildly future → unusable stamp → stale.
  [ "$age" -lt $(( -1 * CLAIM_SKEW_SECONDS )) ] && return 0
  # Within skew tolerance (age between -SKEW and 0) → fresh, so it still blocks.
  [ "$age" -lt 0 ] && return 1
  [ "$age" -ge "$window" ]
}

# 0 = this claim belongs to another session and should block.
claim_is_foreign() {
  local their_host="${1:-}" their_branch="${2:-}" my_host="${3:-}" my_branch="${4:-}"
  [ "$their_host" = "$my_host" ] && [ "$their_branch" = "$my_branch" ] && return 1
  return 0
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

# "1541" or "owner/repo#1541" → OWNER REPO NUMBER. Self-contained rather than
# reusing issue-overlap.sh's resolver, so /resume can source this lib alone.
_ic_resolve_ref() {
  local ref="$1" owner repo num nwo
  if [[ "$ref" =~ ^([A-Za-z0-9._-]+)/([A-Za-z0-9._-]+)#?([0-9]+)$ ]]; then
    owner="${BASH_REMATCH[1]}"; repo="${BASH_REMATCH[2]}"; num="${BASH_REMATCH[3]}"
  elif [[ "$ref" =~ ^#?([0-9]+)$ ]]; then
    num="${BASH_REMATCH[1]}"
    nwo="$(gh repo view --json nameWithOwner --jq .nameWithOwner 2>/dev/null || true)"
    [ -z "$nwo" ] && return 2
    owner="${nwo%%/*}"; repo="${nwo##*/}"
  else
    return 2
  fi
  printf '%s %s %s' "$owner" "$repo" "$num"
}

# Echo "id<TAB>body" for the existing marker comment. One API call.
_ic_find_claim() {
  local owner="$1" repo="$2" num="$3"
  gh api "repos/$owner/$repo/issues/$num/comments" --paginate \
    --jq "[.[] | select(.body | contains(\"$CLAIM_MARKER\"))] | last | select(.) | \"\(.id)\t\(.body)\"" \
    2>/dev/null || true
}

# check_issue_claim <issue-ref> <branch> [--report]
# --report prints and always returns 0 (for /resume, which must not abort).
check_issue_claim() {
  local ref="${1:-}" branch="${2:-}" mode="${3:-enforce}"
  [ -z "$ref" ] && return 0

  if ! command -v gh >/dev/null 2>&1; then
    echo -e "${_IC_YELLOW}⚠  gh not on PATH — skipping the claim check.${_IC_NC}" >&2
    return 0
  fi

  local resolved owner repo num
  resolved="$(_ic_resolve_ref "$ref")" || {
    echo -e "${_IC_YELLOW}⚠  Could not parse issue reference '${ref}' — skipping the claim check.${_IC_NC}" >&2
    return 0
  }
  read -r owner repo num <<<"$resolved"

  local ident my_host my_branch
  ident="$(claim_identity "$branch")"
  my_host="${ident%%$'\t'*}"; my_branch="${ident#*$'\t'}"

  local found id body parsed their_host their_branch stamp now age
  found="$(_ic_find_claim "$owner" "$repo" "$num")"
  id="${found%%$'\t'*}"
  body="${found#*$'\t'}"

  if [ -n "$found" ] && parsed="$(parse_claim "$body")"; then
    their_host="$(printf '%s' "$parsed" | cut -f1)"
    their_branch="$(printf '%s' "$parsed" | cut -f2)"
    stamp="$(printf '%s' "$parsed" | cut -f3)"
    now="$(date -u +%s)"

    if claim_is_foreign "$their_host" "$their_branch" "$my_host" "$my_branch" \
       && ! claim_is_stale "$stamp" "$now" "$CLAIM_STALE_SECONDS"; then
      age=$(( now - $(claim_stamp_to_epoch "$stamp") ))
      echo ""
      echo -e "${_IC_RED}✗ ${owner}/${repo}#${num} is already claimed by another session.${_IC_NC}"
      echo ""
      echo "    Host:   ${their_host}"
      echo "    Branch: ${their_branch}"
      echo "    Age:    $(claim_age_human "$age")"
      echo ""
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
      else
        return 1
      fi
    fi
  fi

  [ "$mode" = "--report" ] && return 0

  # Claim it. Rewrite the existing marker in place so a ticket never accretes
  # one comment per pickup.
  local new_body
  new_body="$(claim_marker_body "$my_host" "$my_branch" "$(date -u +%Y-%m-%dT%H:%M:%SZ)")"
  if [ -n "$id" ] && [ "$id" != "$found" ]; then
    gh api -X PATCH "repos/$owner/$repo/issues/comments/$id" -f body="$new_body" >/dev/null 2>&1 \
      && echo -e "${_IC_GREEN}✓ Claim refreshed on ${owner}/${repo}#${num} (${my_host} / ${my_branch}).${_IC_NC}" \
      || echo -e "${_IC_YELLOW}⚠  Could not refresh the claim comment — proceeding unclaimed.${_IC_NC}" >&2
  else
    gh api -X POST "repos/$owner/$repo/issues/$num/comments" -f body="$new_body" >/dev/null 2>&1 \
      && echo -e "${_IC_GREEN}✓ Claimed ${owner}/${repo}#${num} (${my_host} / ${my_branch}).${_IC_NC}" \
      || echo -e "${_IC_YELLOW}⚠  Could not post the claim comment — proceeding unclaimed.${_IC_NC}" >&2
  fi

  # Assignee is board visibility only — it cannot discriminate sessions.
  gh issue edit "$num" --repo "$owner/$repo" --add-assignee @me >/dev/null 2>&1 || true
  return 0
}
