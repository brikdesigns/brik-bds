#!/usr/bin/env bash
# base-freshness.sh — refuse a PR whose diff is already present on its base.
#
# Closes brik-bds#1546 (the merge-time slice of brik-llm#1485).
#
# Why: an automation-opened dependency bump can go redundant between opening and
# merging. `scripts/propagate.sh` reads the consumer's version from origin/<base>
# when it opens the PR, and nothing re-reads at merge time. On 2026-07-29
# brik-client-portal#2538 (^0.136.0 → ^0.137.0) was verified and merged twelve
# minutes after #2539 had already moved the same pin, and squashed to an EMPTY
# commit — `gh api repos/…/commits/f10a22f6 --jq '.files|length'` → 0. A full
# pre-merge verification pass spent on a no-op, plus an empty commit on staging.
#
# ── The predicate, and why the obvious one is wrong ────────────────
#
# A squash-merge applies the PR's THREE-DOT diff (merge-base…head) onto the base
# tip. It produces an empty commit when every path in that diff already holds the
# head's content on base. So:
#
#   redundant  ⟺  (paths changed vs merge-base)  ∩  (paths differing vs base tip)  =  ∅
#
# The three-dot diff ALONE cannot see this. For #2538 it reports both files as
# changed, because they are changed relative to the fork point:
#
#   $ gh api repos/…/compare/15a58eb1...6cf29044 --jq '{ahead:.ahead_by,behind:.behind_by,files:[.files[].filename]}'
#   {"ahead":1,"behind":1,"files":["package-lock.json","package.json"]}
#
# while the blobs at base tip and at head were byte-identical:
#
#   package.json       26853f54… @ base   26853f54… @ head
#   package-lock.json  7e5c95d2… @ base   7e5c95d2… @ head
#
# That is why `gh pr diff` / the compare API read healthy for a PR that merges to
# nothing, and why this file exists rather than a one-line `--stat` check.
#
# ── Two modes ──────────────────────────────────────────────────────
#
#   --local <base-ref> [head-ref]   pure git, no API calls, any diff size.
#                                   Used by the CI gate.
#   <N> | <owner/repo#N>            resolves the PR through gh; works against a
#                                   consumer repo from here, which is the case
#                                   #2538 needed. Costs 2 API calls per changed
#                                   path, so it is capped (see MAX_FILES).
#
# Pure decision logic sits at the top so a test can exercise it without a repo or
# a network — same rationale as lib/overlap-filters.sh and lib/issue-claim.sh.
#
# Exit codes (CLI):
#   0  FRESH — the diff still applies, or the state could not be read (never
#      block or auto-close on an unreadable API)
#   1  REDUNDANT — merging this PR would change nothing on its base
#   2  bad usage / unresolvable reference

# No `set -e`/`set -u` here: this file is sourced, and shell options set in a
# sourced file leak into the caller's shell. The sibling libs (issue-claim.sh,
# issue-overlap.sh, overlap-filters.sh) set none for the same reason.

_BF_YELLOW='\033[1;33m'
_BF_GREEN='\033[0;32m'
_BF_RED='\033[0;31m'
_BF_NC='\033[0m'

# gh_repo_slug / gh_explain_failure (brik-llm#1590). Guarded because a twin repo
# may not carry the file yet — _bf_repo_slug degrades to the old API call then.
_BF_LIB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -r "${_BF_LIB_DIR}/gh-error-classify.sh" ]; then
  # shellcheck source=scripts/lib/gh-error-classify.sh
  source "${_BF_LIB_DIR}/gh-error-classify.sh"
fi

# Above this many changed paths, remote mode stops rather than spending 2 API
# calls per path — the fleet shares one hourly bucket
# (rag:github-api-quota-is-shared-across-the-fleet). An empty-merge bump is a
# 1-3 file phenomenon; a 40-file PR has a human reading it. Skipping is said out
# loud, never silently.
BF_MAX_FILES="${BF_MAX_FILES:-40}"

# ── Pure helpers (no network, no git) ──────────────────────────────

# The three-dot paths that still differ from the base tip — i.e. what a
# squash-merge would actually write. Empty means the merge is a no-op.
#
# Args: THREE_DOT (newline list), TWO_DOT (newline list).
paths_needing_apply() {
  local three_dot="${1:-}" two_dot="${2:-}"
  [ -n "$three_dot" ] || return 0
  [ -n "$two_dot" ] || return 0
  awk '
    NR == FNR { if ($0 != "") differing[$0] = 1; next }
    { if ($0 != "" && ($0 in differing) && !seen[$0]++) print }
  ' <(printf '%s\n' "$two_dot") <(printf '%s\n' "$three_dot")
}

# REDUNDANT | FRESH. Both empty-input cases are redundant for the same reason:
# there is nothing left for the merge to write.
freshness_verdict() {
  local three_dot="${1:-}" needing="${2:-}"
  if [ -z "$three_dot" ] || [ -z "$needing" ]; then
    printf 'REDUNDANT'
  else
    printf 'FRESH'
  fi
}

# Do two blob SHAs represent the same content at a path? Absent on both sides
# (a path deleted by the PR and already gone from base) counts as the same —
# both are "nothing to write".
blob_pair_same() {
  [ "${1:-}" = "${2:-}" ]
}

# ── git reads (local mode) ─────────────────────────────────────────

# BF_GIT_THREE_DOT / BF_GIT_TWO_DOT are test injection points.
_bf_three_dot() { git diff --name-only "${1}...${2}"; }
_bf_two_dot()   { git diff --name-only "${1}..${2}"; }

# check_base_freshness_local <base-ref> [head-ref]
#
# Echoes the verdict on line 1, then one path per line for the paths a merge
# would still have to write. One stream and one evaluation, so the CLI reporter
# below does not have to run the whole check twice to get both halves.
check_base_freshness_local() {
  local base="${1:?check_base_freshness_local needs a base ref}" head="${2:-HEAD}"
  local three_dot two_dot needing
  three_dot="$(${BF_GIT_THREE_DOT:-_bf_three_dot} "$base" "$head")" || return 2
  two_dot="$(${BF_GIT_TWO_DOT:-_bf_two_dot} "$base" "$head")" || return 2
  needing="$(paths_needing_apply "$three_dot" "$two_dot")"
  printf '%s\n' "$(freshness_verdict "$three_dot" "$needing")"
  [ -n "$needing" ] && printf '%s\n' "$needing"
  return 0
}

# ── gh reads (remote mode) ─────────────────────────────────────────

# owner/name for the current repo, for zero GraphQL points (brik-llm#1748).
#
# `gh repo view --json nameWithOwner` costs 1 point and runs per PR in the
# base-freshness-contract workflow. An exhausted bucket made it echo nothing, so
# the caller returned 2 ("unresolvable reference") for what is a quota problem.
# `gh_repo_slug` reads `origin` locally and costs nothing; the API is the
# fallback for a checkout with no usable remote, and its failure is named by
# class instead of swallowed.
_bf_repo_slug() {
  local slug err
  if declare -F gh_repo_slug >/dev/null 2>&1 && slug="$(gh_repo_slug)"; then
    printf '%s\n' "$slug"
    return 0
  fi
  err="$(mktemp "${TMPDIR:-/tmp}/bf-slug-err.XXXXXXXX")"
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

# "1546" or "owner/repo#1546" → OWNER REPO NUMBER. Reference parsing stays
# self-contained (issue-overlap.sh's resolver is not reused); only the slug
# lookup is shared, via the leaf gh-error-classify.sh sourced above.
_bf_resolve_ref() {
  local ref="$1" owner repo num nwo
  if [[ "$ref" =~ ^([A-Za-z0-9._-]+)/([A-Za-z0-9._-]+)#?([0-9]+)$ ]]; then
    owner="${BASH_REMATCH[1]}"; repo="${BASH_REMATCH[2]}"; num="${BASH_REMATCH[3]}"
  elif [[ "$ref" =~ ^#?([0-9]+)$ ]]; then
    num="${BASH_REMATCH[1]}"
    nwo="$(_bf_repo_slug)" || return 2
    [ -z "$nwo" ] && return 2
    owner="${nwo%%/*}"; repo="${nwo##*/}"
  else
    return 2
  fi
  printf '%s %s %s' "$owner" "$repo" "$num"
}

# Blob SHA for a path at a ref, or empty when the path does not exist there.
# BF_BLOB_CMD is the test injection point.
_bf_blob() {
  local nwo="$1" path="$2" ref="$3"
  gh api "repos/${nwo}/contents/${path}?ref=${ref}" --jq '.sha' 2>/dev/null || true
}

# Compare each changed path at base tip vs head; echo those that still differ.
# Two API calls per path — bounded by BF_MAX_FILES at the caller.
_bf_remote_needing() {
  local nwo="$1" base_sha="$2" head_sha="$3" files="$4" path a b
  while IFS= read -r path; do
    [ -n "$path" ] || continue
    a="$(${BF_BLOB_CMD:-_bf_blob} "$nwo" "$path" "$base_sha")"
    b="$(${BF_BLOB_CMD:-_bf_blob} "$nwo" "$path" "$head_sha")"
    blob_pair_same "$a" "$b" || printf '%s\n' "$path"
  done <<<"$files"
}

# ── CLI ────────────────────────────────────────────────────────────

_bf_report_local() {
  local base="$1" head="${2:-HEAD}" out verdict needing rc=0
  out="$(check_base_freshness_local "$base" "$head" 2>/dev/null)" || rc=$?
  if [ "$rc" -ne 0 ]; then
    echo -e "${_BF_YELLOW}⚠  Could not read the diff against ${base} — reporting UNKNOWN, not FRESH.${_BF_NC}" >&2
    return 0
  fi
  verdict="$(printf '%s\n' "$out" | head -1)"
  needing="$(printf '%s\n' "$out" | tail -n +2)"
  case "$verdict" in
    REDUNDANT)
      echo -e "${_BF_RED}✗ REDUNDANT — every changed path already holds this content on ${base}.${_BF_NC}"
      echo ""
      echo "  Merging this would produce an empty commit, which is how"
      echo "  brik-client-portal#2538 merged after #2539 had moved the same pin"
      echo "  (merge f10a22f6, 0 files). brik-llm#1485."
      echo ""
      echo "  Close it instead:  gh pr close <N> --comment '<superseded by …>'"
      return 1
      ;;
    FRESH)
      echo -e "${_BF_GREEN}✓ FRESH — $(printf '%s\n' "$needing" | grep -c . ) path(s) still differ from ${base}.${_BF_NC}"
      printf '%s\n' "$needing" | sed 's/^/    /'
      return 0
      ;;
    *)
      echo -e "${_BF_YELLOW}⚠  Could not read the diff against ${base} — reporting UNKNOWN, not FRESH.${_BF_NC}" >&2
      return 0
      ;;
  esac
}

_bf_report_remote() {
  local ref="$1" do_close="${2:-0}"

  if ! command -v gh >/dev/null 2>&1; then
    echo -e "${_BF_YELLOW}⚠  gh not on PATH — skipping the base-freshness check.${_BF_NC}" >&2
    return 0
  fi

  local resolved owner repo num nwo
  resolved="$(_bf_resolve_ref "$ref")" || {
    echo -e "${_BF_RED}Error: could not parse PR reference '${ref}'.${_BF_NC}" >&2
    echo "  Expected: 2538  or  owner/repo#2538" >&2
    return 2
  }
  read -r owner repo num <<<"$resolved"
  nwo="${owner}/${repo}"

  local meta state base_ref head_sha base_sha
  meta="$(gh api "repos/${nwo}/pulls/${num}" \
            --jq '"\(.state)\t\(.base.ref)\t\(.head.sha)\t\(.base.sha)"' 2>/dev/null || true)"
  if [ -z "$meta" ]; then
    echo -e "${_BF_YELLOW}⚠  Could not read ${nwo}#${num} — reporting UNKNOWN, not FRESH.${_BF_NC}" >&2
    return 0
  fi
  IFS=$'\t' read -r state base_ref head_sha base_sha <<<"$meta"

  # .base.sha is the fork point recorded when the PR was opened, NOT the current
  # base tip — using it would compare against exactly the stale state this check
  # exists to detect. Re-read the branch.
  local live_base
  live_base="$(gh api "repos/${nwo}/git/ref/heads/${base_ref}" --jq '.object.sha' 2>/dev/null || true)"
  [ -n "$live_base" ] && base_sha="$live_base"

  local files count
  files="$(gh api "repos/${nwo}/pulls/${num}/files" --paginate --jq '.[].filename' 2>/dev/null || true)"
  count="$(printf '%s\n' "$files" | grep -c . || true)"

  echo ""
  echo -e "${_BF_YELLOW}▸ Base-freshness — ${nwo}#${num} [${state}] → ${base_ref} @ ${base_sha:0:8}${_BF_NC}"

  if [ "$count" -eq 0 ]; then
    echo -e "${_BF_RED}✗ REDUNDANT — the PR changes no files at all.${_BF_NC}"
    _bf_maybe_close "$nwo" "$num" "$do_close" "changes no files"
    return 1
  fi
  if [ "$count" -gt "$BF_MAX_FILES" ]; then
    echo -e "${_BF_YELLOW}⚠  ${count} changed paths exceeds BF_MAX_FILES=${BF_MAX_FILES} — SKIPPED, not passed.${_BF_NC}"
    echo -e "${_BF_YELLOW}   (2 API calls per path; the fleet shares one hourly bucket.)${_BF_NC}"
    echo -e "${_BF_YELLOW}   For a diff this size use local mode in a checkout:${_BF_NC}"
    echo "     scripts/lib/base-freshness.sh --local origin/${base_ref} <head>"
    return 0
  fi

  local needing verdict
  needing="$(_bf_remote_needing "$nwo" "$base_sha" "$head_sha" "$files")"
  verdict="$(freshness_verdict "$files" "$needing")"

  if [ "$verdict" = "FRESH" ]; then
    echo -e "${_BF_GREEN}✓ FRESH — $(printf '%s\n' "$needing" | grep -c .) of ${count} path(s) still differ from the base tip.${_BF_NC}"
    printf '%s\n' "$needing" | sed 's/^/    /'
    return 0
  fi

  echo -e "${_BF_RED}✗ REDUNDANT — all ${count} changed path(s) already hold this content on ${base_ref}.${_BF_NC}"
  echo ""
  echo "  A squash-merge would produce an EMPTY commit. This is exactly"
  echo "  brik-client-portal#2538: verified and merged 12 minutes after #2539"
  echo "  moved the same pin, squashed to f10a22f6 with 0 files. brik-llm#1485."
  _bf_maybe_close "$nwo" "$num" "$do_close" "all ${count} changed path(s) already hold this content on \`${base_ref}\`"
  return 1
}

# Writes only with an explicit --close. An unreachable API returns UNKNOWN above,
# so nothing here ever runs on a guess.
_bf_maybe_close() {
  local nwo="$1" num="$2" do_close="$3" reason="$4"
  if [ "$do_close" != "1" ]; then
    echo ""
    echo "  Close it:  scripts/lib/base-freshness.sh --close ${nwo}#${num}"
    return 0
  fi
  local body
  body="$(cat <<EOF
Closing as redundant: ${reason}, so merging this would produce an empty commit.

Detected by \`scripts/lib/base-freshness.sh\` (brikdesigns/brik-bds#1546, the merge-time slice of brikdesigns/brik-llm#1485). Reopen if this reads wrong — the check compares the blob of each changed path at the base tip against the same path at the PR head.
EOF
)"
  if gh pr close "$num" --repo "$nwo" --comment "$body" >/dev/null 2>&1; then
    echo -e "${_BF_GREEN}✓ Closed ${nwo}#${num} with the reason above.${_BF_NC}"
  else
    echo -e "${_BF_YELLOW}⚠  Could not close ${nwo}#${num} — close it by hand.${_BF_NC}" >&2
  fi
}

_bf_usage() {
  cat >&2 <<'EOF'
Usage:
  scripts/lib/base-freshness.sh [--close] <N | owner/repo#N>
  scripts/lib/base-freshness.sh --local <base-ref> [head-ref]

Exit 1 = REDUNDANT (merging changes nothing). Exit 0 = FRESH or UNKNOWN.
EOF
}

# `:-` on both sides: under `set -u` this array read aborted at source time in
# testing (`BASH_SOURCE[0]: parameter not set`), which kills the sourcing caller
# rather than just skipping the CLI block.
if [ "${BASH_SOURCE[0]:-}" = "${0:-}" ]; then
  DO_CLOSE=0
  MODE=remote
  ARGS=()
  while [ $# -gt 0 ]; do
    case "$1" in
      --close) DO_CLOSE=1; shift ;;
      --local) MODE=local; shift ;;
      -h|--help) _bf_usage; exit 2 ;;
      -*) echo "Unknown flag: $1" >&2; _bf_usage; exit 2 ;;
      *) ARGS+=("$1"); shift ;;
    esac
  done
  if [ "${#ARGS[@]}" -eq 0 ]; then _bf_usage; exit 2; fi
  if [ "$MODE" = "local" ]; then
    _bf_report_local "${ARGS[0]}" "${ARGS[1]:-HEAD}"
  else
    _bf_report_remote "${ARGS[0]}" "$DO_CLOSE"
  fi
  exit $?
fi
