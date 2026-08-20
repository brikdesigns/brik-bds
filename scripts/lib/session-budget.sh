#!/usr/bin/env bash
# session-budget.sh — hold a session to the contracted size budget.
#
# Sourced by new-task.sh after the ticket-overlap gate, and callable standalone
# to read the running total. Closes brik-llm#2045.
#
# Why this exists: `.claude/references/session-contract.md` fixes a budget per
# session (1 L, or 2-3 M, or ~5 S/XS) because model quality degrades as context
# grows even inside the window. Until this file, that budget was prose. The
# ticket gate (#1485) already refuses a worktree with no ticket, so a session
# could open three L worktrees, pass every gate, and be four times over
# contract with nothing objecting.
#
# The ledger keys on CLAUDE_CODE_SESSION_ID — the only identifier that is
# stable across the several new-task.sh invocations one session makes and
# distinct between the 4-8 sessions brik-mini runs at once. A per-worktree or
# per-tty key would merge concurrent sessions into one budget and deny work
# that was never over contract.
#
# Costs one REST point per gated pickup (`repos/{o}/{r}/issues/{n}`), not
# GraphQL. It is a deliberate second read rather than an extra field on
# issue-overlap.sh's fetch: that file is a hand-kept copy in three repos
# (brik-bds, brik-client-portal), and widening its contract means three
# synchronised edits for one label. rag:github-api-quota-is-shared-across-the-fleet.
#
# Usage (sourced):
#   source scripts/lib/session-budget.sh
#   check_session_budget "2045" 0       # 0 = enforce, 1 = --over-budget override
#
# Usage (standalone):
#   scripts/lib/session-budget.sh --status
#
# Exit / return codes:
#   0  within budget, recorded — or unenforceable and skipped loudly
#   1  over budget, refused

_SB_YELLOW='\033[1;33m'
_SB_GREEN='\033[0;32m'
_SB_RED='\033[0;31m'
_SB_NC='\033[0m'

# Points, not hours. Hours cannot reproduce the canon table: 3 x M is inside
# contract at 7-21h each, so an hour ceiling that admits 3 M also admits 1 L.
# These weights reproduce session-contract.md exactly against a 15-point cap —
# 1 L, 3 M, and 5 S/XS each land on 15, a 4th M and a 2nd L each land over.
_SB_BUDGET_POINTS=15

_sb_points_for_size() {
  case "$1" in
    xs) echo 3 ;;
    s)  echo 3 ;;
    m)  echo 5 ;;
    l)  echo 15 ;;
    *)  echo 0 ;;
  esac
}

# An unsized ticket is not free. Counting it 0 would make `needs:size` the
# cheapest way through this gate, which inverts the incentive the gate exists
# to create. M is the median rung and the loud line below says so.
_SB_UNSIZED_POINTS=5

_sb_ledger_dir() {
  printf '%s\n' "${BRIK_SESSION_BUDGET_DIR:-${XDG_CACHE_HOME:-$HOME/.cache}/brik/session-budget}"
}

# Empty when no session identifier is available — the caller degrades loudly
# rather than silently sharing one ledger across every session on the host.
_sb_session_key() {
  local key="${CLAUDE_CODE_SESSION_ID:-${CLAUDE_PID:-}}"
  # Path component, so constrain it rather than trusting the environment.
  printf '%s\n' "$(printf '%s' "$key" | tr -c 'A-Za-z0-9_.-' '-')"
}

_sb_ledger_path() {
  local key
  key="$(_sb_session_key)"
  [ -z "$key" ] && return 1
  printf '%s/%s.tsv\n' "$(_sb_ledger_dir)" "$key"
}

# Ledgers outlive their sessions; nothing else reaps them. Cheap enough to run
# on the pickup path and it keeps the directory from growing without bound.
_sb_prune_stale() {
  local dir
  dir="$(_sb_ledger_dir)"
  [ -d "$dir" ] || return 0
  find "$dir" -maxdepth 1 -name '*.tsv' -type f -mtime +7 -delete 2>/dev/null || true
}

# Sum the points column. Empty ledger, missing file, and malformed line all
# read as 0 rather than as an error — a broken ledger must not block a pickup.
_sb_total_points() {
  local path="$1"
  [ -r "$path" ] || { echo 0; return 0; }
  awk -F'\t' '$2 ~ /^[0-9]+$/ { n += $2 } END { print n + 0 }' "$path"
}

_sb_already_recorded() {
  local path="$1" ref="$2"
  [ -r "$path" ] || return 1
  awk -F'\t' -v ref="$ref" '$1 == ref { found = 1 } END { exit found ? 0 : 1 }' "$path"
}

# owner/repo#num for a bare number or an already-qualified ref. Reuses
# issue-overlap.sh's resolver when it is loaded; both are sourced by new-task.sh.
_sb_resolve_ref() {
  local ref="$1"
  if declare -F _io_resolve_ref >/dev/null 2>&1; then
    local resolved owner repo num
    resolved="$(_io_resolve_ref "$ref")" || return 1
    read -r owner repo num <<<"$resolved"
    printf '%s/%s#%s\n' "$owner" "$repo" "$num"
    return 0
  fi
  case "$ref" in
    */*\#[0-9]*) printf '%s\n' "$ref" ;;
    [0-9]*)
      local slug
      slug="$(gh repo view --json nameWithOwner --jq .nameWithOwner 2>/dev/null)" || return 1
      [ -z "$slug" ] && return 1
      printf '%s#%s\n' "$slug" "$ref"
      ;;
    *) return 1 ;;
  esac
}

# The size:* label, lowercased and bare (xs|s|m|l). Empty when the ticket is
# unlabelled, unreadable, or gh is unavailable — all three are the same
# decision for the caller.
_sb_size_label() {
  local qualified="$1" owner_repo num
  owner_repo="${qualified%%#*}"
  num="${qualified##*#}"
  command -v gh >/dev/null 2>&1 || return 0
  gh api "repos/${owner_repo}/issues/${num}" \
    --jq '[.labels[].name] | map(select(startswith("size:"))) | first // ""' \
    2>/dev/null | sed 's/^size://' | tr 'A-Z' 'a-z'
}

_sb_render_ledger() {
  local path="$1"
  [ -r "$path" ] || return 0
  awk -F'\t' '$1 != "" { printf "    %-34s %s (%s pts)\n", $1, toupper($3), $2 }' "$path"
}

# check_session_budget <issue-ref> [allow_over]
# allow_over=1 records the ticket and warns instead of refusing (--over-budget).
check_session_budget() {
  local ref="${1:-}" allow_over="${2:-0}"
  [ -z "$ref" ] && return 0

  local path
  if ! path="$(_sb_ledger_path)"; then
    echo "" >&2
    echo -e "${_SB_YELLOW}⚠  No CLAUDE_CODE_SESSION_ID — session size-budget gate skipped.${_SB_NC}" >&2
    echo -e "${_SB_YELLOW}   Nothing is tracking this session's contracted size. Hold the${_SB_NC}" >&2
    echo -e "${_SB_YELLOW}   budget by hand: .claude/references/session-contract.md § Entry.${_SB_NC}" >&2
    return 0
  fi

  local qualified
  if ! qualified="$(_sb_resolve_ref "$ref")" || [ -z "$qualified" ]; then
    echo -e "${_SB_YELLOW}⚠  Could not resolve '${ref}' — size-budget gate skipped.${_SB_NC}" >&2
    return 0
  fi

  _sb_prune_stale
  mkdir -p "$(_sb_ledger_dir)"

  local spent
  spent="$(_sb_total_points "$path")"

  # Re-picking up a ticket already in this session's contract is not new scope.
  # Without this, a worktree recreated after a sweep would double-charge it.
  if _sb_already_recorded "$path" "$qualified"; then
    echo "" >&2
    echo -e "${_SB_YELLOW}▸ Session budget — ${spent}/${_SB_BUDGET_POINTS} pts (${qualified} already contracted)${_SB_NC}" >&2
    _sb_render_ledger "$path" >&2
    return 0
  fi

  local size points sized_note=""
  size="$(_sb_size_label "$qualified")"
  if [ -z "$size" ] || [ "$(_sb_points_for_size "$size")" = "0" ]; then
    points="$_SB_UNSIZED_POINTS"
    size="unsized"
    sized_note="counted as M — label the ticket size:* to correct"
  else
    points="$(_sb_points_for_size "$size")"
  fi

  local projected=$((spent + points))

  echo "" >&2
  echo -e "${_SB_YELLOW}▸ Session budget — ${qualified} is ${size} (${points} pts)${_SB_NC}" >&2
  [ -n "$sized_note" ] && echo -e "${_SB_YELLOW}    ${sized_note}${_SB_NC}" >&2
  _sb_render_ledger "$path" >&2
  echo "    ${spent} spent + ${points} = ${projected}/${_SB_BUDGET_POINTS} pts" >&2

  if [ "$projected" -gt "$_SB_BUDGET_POINTS" ]; then
    if [ "$allow_over" = "1" ]; then
      echo "" >&2
      echo -e "${_SB_RED}⚠  --over-budget: taking this ticket puts the session at ${projected}/${_SB_BUDGET_POINTS} pts.${_SB_NC}" >&2
      echo -e "${_SB_RED}   The contract is being broken deliberately. Context rot is not${_SB_NC}" >&2
      echo -e "${_SB_RED}   advisory — quality degrades inside the window, not at its edge.${_SB_NC}" >&2
      echo -e "${_SB_RED}   .claude/references/session-contract.md § Entry${_SB_NC}" >&2
    else
      echo "" >&2
      echo -e "${_SB_RED}✗ Refusing: ${projected}/${_SB_BUDGET_POINTS} pts exceeds the session budget.${_SB_NC}" >&2
      echo "" >&2
      echo -e "${_SB_RED}  Budget per session (.claude/references/session-contract.md § Entry):${_SB_NC}" >&2
      echo -e "${_SB_RED}    1 x L,  or 2-3 x M,  or ~5 x S/XS,  or 1 M + 2-3 S${_SB_NC}" >&2
      echo "" >&2
      echo -e "${_SB_YELLOW}  The contract can only grow by explicit operator approval, and only${_SB_NC}" >&2
      echo -e "${_SB_YELLOW}  within the same budget shape — a 4th M is a new session, not a${_SB_NC}" >&2
      echo -e "${_SB_YELLOW}  bigger contract.${_SB_NC}" >&2
      echo "" >&2
      echo -e "${_SB_YELLOW}  Fix one of these ways:${_SB_NC}" >&2
      echo -e "${_SB_YELLOW}    finish and hand off this session, then pick the ticket up fresh${_SB_NC}" >&2
      echo -e "${_SB_YELLOW}    new-task.sh --issue ${qualified##*#} --over-budget {slug}   # operator-approved${_SB_NC}" >&2
      return 1
    fi
  fi

  printf '%s\t%s\t%s\n' "$qualified" "$points" "$size" >>"$path"

  if [ "$projected" -le "$_SB_BUDGET_POINTS" ]; then
    echo -e "${_SB_GREEN}    within contract.${_SB_NC}" >&2
  fi
  return 0
}

# Standalone: report the running total without recording anything.
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
  case "${1:-}" in
    --status)
      _sb_path="$(_sb_ledger_path)" || {
        echo "No CLAUDE_CODE_SESSION_ID — no session ledger." >&2
        exit 0
      }
      echo "Session ledger: ${_sb_path}"
      echo "Spent: $(_sb_total_points "$_sb_path")/${_SB_BUDGET_POINTS} pts"
      _sb_render_ledger "$_sb_path"
      ;;
    *)
      echo "Usage: $0 --status" >&2
      exit 2
      ;;
  esac
fi
