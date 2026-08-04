#!/usr/bin/env bash
# slug-claim.sh — give `--no-issue` a claim to write, so ticketless work collides.
#
# Sourced by new-task.sh on the --no-issue path. Closes the AC-2 hole in
# brik-bds#1663.
#
# Why this exists: `check_issue_claim` keys on an issue number and writes its
# marker as a comment on that issue. `--no-issue` has no issue, so it claimed
# nothing — it printed a warning and proceeded. A second session running
# `--no-issue` on the same problem therefore got no signal at all, which is how
# PR #1660 (a --no-issue pickup) duplicated #1661.
#
# The claim goes on a dedicated board issue instead, keyed by branch slug. Why
# an issue and not a local file: the two operator machines (brik-mini,
# nicks-macbook-pro-m1) share no filesystem, and the whole point is that a
# second session sees the first. A file would have made the gate machine-local
# and silently useless for the cross-machine case.
#
# Why the board is never closed: closing it would void every live claim at once.
# It carries the <!-- claim-board --> marker in its body so its purpose survives
# someone finding it on the board and wondering what it is.
#
# Why "same host + same branch" reading as re-entry is not a hole here, even
# though for a slug claim the slug IS the branch and two sessions therefore have
# identical identity: git already refuses the second one. Verified 2026-08-04 —
# `git worktree add -b task/dup-probe` a second time exits
# `fatal: a branch named 'task/dup-probe' already exists`. So the same-machine
# collision is blocked upstream of this gate, and what the board adds is the
# CROSS-machine case, where two checkouts can each create the branch locally and
# only the differing host distinguishes them.
#
# What an exact-slug claim does NOT catch: two sessions picking DIFFERENT slugs
# for the same problem. Nothing keyed on the slug can. check_phrase_overlap
# scores the slug against open issue titles (the #1660/#1661 shape) and
# pr-path-overlap.sh catches it once a PR exists (#1545) — between those two
# there is still a window, and it is the same window the issue-keyed gate has.
#
# Staleness, skew tolerance, and the steal override are NOT reimplemented here —
# this lib sources issue-claim.sh and reuses claim_is_stale / claim_is_foreign /
# claim_stamp_to_epoch / claim_age_human, so the two gates cannot drift on the
# question of what "still live" means.
#
# Usage (sourced):
#   source scripts/lib/slug-claim.sh
#   check_slug_claim "tooling-slug-claim-board" "task/tooling-slug-claim-board"
#
# Exit / return codes (sourced mode):
#   0  clear to proceed (no claim, my own claim, or a stale one)
#   1  a live claim from another session — caller should abort

# shellcheck disable=SC2148  # sourced

_SC_LIB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/lib/issue-claim.sh
source "${_SC_LIB_DIR}/issue-claim.sh"

# The board. Hardcoded rather than looked up by label or title because a lookup
# is an extra API call on new-task.sh's hot path, and a title search would
# happily match a future issue that merely mentions claims.
# https://github.com/brikdesigns/brik-bds/issues/1699
SLUG_CLAIM_BOARD="${SLUG_CLAIM_BOARD:-1699}"

_SC_YELLOW='\033[1;33m'
_SC_GREEN='\033[0;32m'
_SC_RED='\033[0;31m'
_SC_NC='\033[0m'

# ── Pure helpers ───────────────────────────────────────────────────

# Per-slug marker. The board carries one comment per live ticketless branch, so
# the marker has to discriminate slugs — a single shared CLAIM_MARKER would make
# every claim overwrite the previous one and the board would gate exactly one
# branch at a time.
slug_claim_marker() {
  printf '<!-- claim:slug=%s -->' "${1:?}"
}

slug_claim_body() {
  local slug="${1:?}" host="${2:?}" branch="${3:?}" stamp="${4:?}"
  cat <<EOF
$(slug_claim_marker "$slug")
🤖 **Claimed (ticketless)** — a session is working this slug with \`--no-issue\`.

| | |
| --- | --- |
| Slug | \`${slug}\` |
| Host | \`${host}\` |
| Branch | \`${branch}\` |
| Since | ${stamp} |

Another session's \`new-task.sh --no-issue\` will refuse this slug until the claim
goes stale (${CLAIM_STALE_SECONDS}s). Rewritten in place on each pickup — never a
second comment per slug.

Stale because that session is gone? \`NEW_TASK_STEAL_CLAIM=1\` overrides, loudly.
EOF
}

# Echo "host<TAB>branch<TAB>stamp" from a slug-claim body. Silent + non-zero when
# the body is not a claim for THIS slug, so a caller can test the return.
#
# Deliberately not parse_claim: that one anchors on CLAIM_MARKER, which a
# slug claim does not carry, and it has no slug row to check. Matching the slug
# here is what stops a claim on `tokens-foo` being read as a claim on
# `tokens-foo-bar`.
parse_slug_claim() {
  local body="${1:-}" slug="${2:?}" host branch stamp found_slug
  case "$body" in
    *"$(slug_claim_marker "$slug")"*) : ;;
    *) return 1 ;;
  esac
  found_slug="$(printf '%s\n' "$body" | sed -n 's/^| Slug | `\(.*\)` |$/\1/p'   | head -1)"
  host="$(printf '%s\n' "$body"       | sed -n 's/^| Host | `\(.*\)` |$/\1/p'   | head -1)"
  branch="$(printf '%s\n' "$body"     | sed -n 's/^| Branch | `\(.*\)` |$/\1/p' | head -1)"
  stamp="$(printf '%s\n' "$body"      | sed -n 's/^| Since | \(.*\) |$/\1/p'    | head -1)"
  [ "$found_slug" = "$slug" ] || return 1
  [ -n "$host" ] && [ -n "$branch" ] && [ -n "$stamp" ] || return 1
  printf '%s\t%s\t%s' "$host" "$branch" "$stamp"
}

# A slug reads as a sentence for the title-similarity check: the IDF scorer in
# issue-overlap.sh tokenises on whitespace and hyphens, but it also drops tokens
# under 4 chars, so leaving the scope prefix ("bds", "docs") in costs nothing and
# removing it would be a second place to maintain the scope list.
slug_to_phrase() {
  printf '%s' "${1:?}" | tr '-' ' '
}

# ── Network-touching orchestration ─────────────────────────────────

# Echo "id<TAB>body" for this slug's marker comment on the board. One API call.
_sc_find_claim() {
  local owner="$1" repo="$2" board="$3" marker="$4"
  gh api "repos/$owner/$repo/issues/$board/comments" --paginate \
    --jq "[.[] | select(.body | contains(\"$marker\"))] | last | select(.) | \"\(.id)\t\(.body)\"" \
    2>/dev/null || true
}

# check_slug_claim <slug> <branch> [--report]
# --report prints and always returns 0 (for a read-only caller).
check_slug_claim() {
  local slug="${1:-}" branch="${2:-}" mode="${3:-enforce}"
  [ -z "$slug" ] && return 0

  if ! command -v gh >/dev/null 2>&1; then
    echo -e "${_SC_YELLOW}⚠  gh not on PATH — skipping the ticketless claim check.${_SC_NC}" >&2
    return 0
  fi

  local nwo owner repo
  nwo="$(_ic_repo_slug)" || {
    echo -e "${_SC_YELLOW}⚠  Could not resolve this repo — skipping the ticketless claim check.${_SC_NC}" >&2
    return 0
  }
  [ -z "$nwo" ] && return 0
  owner="${nwo%%/*}"; repo="${nwo##*/}"

  local ident my_host my_branch marker
  ident="$(claim_identity "$branch")"
  my_host="${ident%%$'\t'*}"; my_branch="${ident#*$'\t'}"
  marker="$(slug_claim_marker "$slug")"

  local found id body parsed their_host their_branch stamp now age
  found="$(_sc_find_claim "$owner" "$repo" "$SLUG_CLAIM_BOARD" "$marker")"
  id="${found%%$'\t'*}"
  body="${found#*$'\t'}"

  if [ -n "$found" ] && parsed="$(parse_slug_claim "$body" "$slug")"; then
    their_host="$(printf '%s' "$parsed" | cut -f1)"
    their_branch="$(printf '%s' "$parsed" | cut -f2)"
    stamp="$(printf '%s' "$parsed" | cut -f3)"
    now="$(date -u +%s)"

    if claim_is_foreign "$their_host" "$their_branch" "$my_host" "$my_branch" \
       && ! claim_is_stale "$stamp" "$now" "$CLAIM_STALE_SECONDS"; then
      age=$(( now - $(claim_stamp_to_epoch "$stamp") ))
      echo ""
      echo -e "${_SC_RED}✗ Ticketless slug '${slug}' is already claimed by another session.${_SC_NC}"
      echo ""
      echo "    Host:   ${their_host}"
      echo "    Branch: ${their_branch}"
      echo "    Age:    $(claim_age_human "$age")"
      echo "    Board:  https://github.com/${owner}/${repo}/issues/${SLUG_CLAIM_BOARD}"
      echo ""
      echo -e "${_SC_RED}  --no-issue used to claim nothing, so a second session got no signal${_SC_NC}"
      echo -e "${_SC_RED}  at all — PR #1660 duplicated #1661 exactly this way (#1663).${_SC_NC}"
      echo ""
      echo "  Check that session first. If it is genuinely gone:"
      echo "    NEW_TASK_STEAL_CLAIM=1 <your command>"
      [ "$mode" = "--report" ] && return 0
      if [ "${NEW_TASK_STEAL_CLAIM:-0}" = "1" ]; then
        echo ""
        echo -e "${_SC_YELLOW}⚠  NEW_TASK_STEAL_CLAIM=1 — taking the slug anyway.${_SC_NC}"
      else
        return 1
      fi
    fi
  fi

  [ "$mode" = "--report" ] && return 0

  local new_body
  new_body="$(slug_claim_body "$slug" "$my_host" "$my_branch" "$(date -u +%Y-%m-%dT%H:%M:%SZ)")"
  if [ -n "$id" ] && [ "$id" != "$found" ]; then
    gh api -X PATCH "repos/$owner/$repo/issues/comments/$id" -f body="$new_body" >/dev/null 2>&1 \
      && echo -e "${_SC_GREEN}✓ Ticketless claim refreshed for '${slug}' (${my_host} / ${my_branch}).${_SC_NC}" \
      || echo -e "${_SC_YELLOW}⚠  Could not refresh the ticketless claim — proceeding unclaimed.${_SC_NC}" >&2
  else
    gh api -X POST "repos/$owner/$repo/issues/$SLUG_CLAIM_BOARD/comments" -f body="$new_body" >/dev/null 2>&1 \
      && echo -e "${_SC_GREEN}✓ Claimed ticketless slug '${slug}' on the board (${my_host} / ${my_branch}).${_SC_NC}" \
      || echo -e "${_SC_YELLOW}⚠  Could not post the ticketless claim — proceeding unclaimed.${_SC_NC}" >&2
  fi
  return 0
}
