#!/usr/bin/env bash
# md-creation-gate.sh — the commit-time half of the markdown-creation net.
#
# Blocks a .md file ARRIVING at a path — added or renamed there — when it carries
# a retired prefix or lands outside a sanctioned documentation home. Operational
# know-how goes to brik-rag; Nick-specific preferences to
# ~/.claude/projects/.../memory/.
#
# Two rules, reported separately so the remediation matches the cause:
#
#   prefix     feedback_*.md / lessons-*.md anywhere in the tree (#427)
#   placement  any other new .md outside ALLOWED_DIRS / ALLOWED_NAMES (#3270)
#
# Why both live in one script: they are one decision at one moment — "may this
# file exist here" — and splitting them costs a second pre-commit step and a
# second CI job in every repo that adopts the net (brik-llm#3271). The file was
# `feedback-md-block.sh` while it carried only the prefix rule.
#
# THIS IS A TWIN. brik-llm holds the canonical copy; consumers carry it under
# `shared+deltas` with their own ALLOWED_DIRS. Fix it here and re-sync — a local
# edit in a consumer reads as drift to overlap-twin-drift, not as an improvement.
# The ONLY authorised per-repo difference is the ALLOWED_DIRS block, and each
# one must be declared in that gate's TWINS registry.
#
# Contract:
#   - Blocks files ARRIVING at a path (diff-filter=AR) — an addition, or a
#     rename's destination. Modifying an existing file in place is never
#     blocked, so a repo's standing markdown is grandfathered by construction
#     and adopting this gate cannot fail on a repo's history.
#   - R is not optional garnish. `git mv notes.md docs/notes.md` reports as R,
#     never A, so an A-only filter let any file walk into an unsanctioned home
#     one rename at a time — the accumulation vector this gate exists to close.
#     A rename INTO a sanctioned home still passes; only the destination is
#     judged, never the origin.
#   - Two modes:
#       (default)  Check `git diff --cached` — pre-commit / Husky hook mode
#       --ci --base <sha> --head <sha>   Check `git diff $base..$head` —
#       CI / PR-gate mode (mirrors claude-md-shape-lint.py)
#   - `--json` replaces the prose with `{rule: [paths]}` on stdout, for a caller
#     that wants the two rules apart. Exit codes are identical either way.
#
# Read-only: inspects the index or a commit range and writes nothing, so there is
# no --dry-run to have (writer-standards-gate scores it as a tool, not a writer).
#
# Exit: 0 nothing to block · 1 a new file violates a rule · 2 bad usage.

set -euo pipefail

# ── Per-repo allowlist. THE ONLY BLOCK A CONSUMER MAY DIVERGE ON. ─────────────
# Repo-relative dir prefixes where a new .md is sanctioned. THIS REPO'S LIST —
# the declared delta from brik-llm's canonical copy (brik-llm#3271). It is the
# rows RATIFIED_HOMES (scripts/audit/markdown-census.py, in brik-llm) ratifies
# for brik-bds — `docs/runbooks`, `software/docs/adr`, `docs/adrs` — plus the
# always-sanctioned agent-canon and GitHub-template trees.
#
# It is NOT a longer list of this repo's established doc dirs, and that is
# deliberate. md-routing-guard.sh — the write-time half — is a single global
# Claude hook with ONE allowlist applied to every Brik repo (its is_brik_repo
# test), so a row here that the hook lacks is unreachable: the agent's Write is
# denied before a commit ever happens. Widening this list alone would only
# license a hand-editor, while telling every reader the home is sanctioned.
#
# brik-llm's `operations/*` rows are absent because brik-bds has no such tree.
# Ratifying a genuinely new home is one PR touching all three: RATIFIED_HOMES,
# md-routing-guard.sh's ALLOWED_DIRS, and this list (brik-llm#3269/#3270).
ALLOWED_DIRS=(
  ".claude/"
  ".github/"
  "software/docs/"
  "docs/runbooks/"
  "docs/adrs/"
)

# Basenames sanctioned at any path (repo canon + package conventions).
ALLOWED_NAMES=(
  "CLAUDE.md" "CLAUDE-CROSS-REPO.md" "README.md" "CODING-STANDARDS.md"
  "CHANGELOG.md" "BDS-CONSUMER.md"
)
# ── End per-repo block. ───────────────────────────────────────────────────────

MODE="staged"
BASE=""
HEAD=""
JSON=0

while [ $# -gt 0 ]; do
  case "$1" in
    --ci)    MODE="ci"; shift ;;
    --base)  BASE="$2"; shift 2 ;;
    --head)  HEAD="$2"; shift 2 ;;
    --json)  JSON=1; shift ;;
    -h|--help)
      sed -n '2,43p' "$0"
      exit 0 ;;
    *)
      echo "md-creation-gate: unknown arg: $1" >&2
      exit 2 ;;
  esac
done

PREFIX_PATTERN='(^|/)(feedback_|lessons-).+\.md$'

if [ "$MODE" = "ci" ]; then
  if [ -z "$BASE" ] || [ -z "$HEAD" ]; then
    echo "md-creation-gate: --ci requires --base <sha> --head <sha>" >&2
    exit 2
  fi
  NEW_FILES=$(git diff --name-only --diff-filter=AR "$BASE".."$HEAD" | grep -E '\.md$' || true)
else
  NEW_FILES=$(git diff --cached --name-only --diff-filter=AR | grep -E '\.md$' || true)
fi

# No early exit on an empty set: --json must still emit its empty arrays, or a
# caller cannot tell "checked, nothing found" from "did not run". The loop below
# skips the single blank line a here-string makes of an empty variable.

# Astro / content-collection markdown is site content, not documentation. Kept
# identical to md-routing-guard.sh's exemption so a file the write-time hook
# allowed cannot be rejected at commit.
is_site_content() {
  case "$1" in
    *src/content/*) return 0 ;;
  esac
  return 1
}

is_placed_ok() {
  local rel="$1" base name prefix
  base=$(basename "$rel")
  for name in "${ALLOWED_NAMES[@]}"; do
    [ "$base" = "$name" ] && return 0
  done
  for prefix in "${ALLOWED_DIRS[@]}"; do
    case "$rel" in
      "$prefix"*) return 0 ;;
    esac
  done
  is_site_content "$rel" && return 0
  return 1
}

BAD_PREFIX=""
BAD_PLACEMENT=""
while IFS= read -r f; do
  [ -z "$f" ] && continue
  if printf '%s' "$f" | grep -qE "$PREFIX_PATTERN"; then
    BAD_PREFIX="${BAD_PREFIX}${f}"$'\n'
  elif ! is_placed_ok "$f"; then
    BAD_PLACEMENT="${BAD_PLACEMENT}${f}"$'\n'
  fi
done <<< "$NEW_FILES"

if [ "$JSON" -eq 1 ]; then
  # Emitted on every run, clean or not — a caller polling this needs the empty
  # arrays to mean "checked, nothing found", never "did not run".
  json_arr() {
    printf '['
    local first=1 f
    while IFS= read -r f; do
      [ -z "$f" ] && continue
      [ "$first" -eq 1 ] || printf ','
      first=0
      printf '"%s"' "$(printf '%s' "$f" | sed 's/\\/\\\\/g; s/"/\\"/g')"
    done
    printf ']'
  }
  printf '{"prefix":'
  printf '%s' "$BAD_PREFIX" | json_arr
  printf ',"placement":'
  printf '%s' "$BAD_PLACEMENT" | json_arr
  printf '}\n'
  [ -z "$BAD_PREFIX" ] && [ -z "$BAD_PLACEMENT" ] && exit 0
  exit 1
fi

[ -z "$BAD_PREFIX" ] && [ -z "$BAD_PLACEMENT" ] && exit 0

echo "" >&2
echo "ERROR: md-creation-gate — new markdown rejected." >&2

if [ -n "$BAD_PREFIX" ]; then
  echo "" >&2
  echo "  Retired prefix (feedback_*.md / lessons-*.md):" >&2
  printf '%s' "$BAD_PREFIX" | while IFS= read -r f; do
    [ -n "$f" ] && echo "    - $f" >&2
  done
fi

if [ -n "$BAD_PLACEMENT" ]; then
  echo "" >&2
  echo "  Outside a sanctioned documentation home:" >&2
  printf '%s' "$BAD_PLACEMENT" | while IFS= read -r f; do
    [ -n "$f" ] && echo "    - $f" >&2
  done
  echo "" >&2
  echo "  Sanctioned in this repo:" >&2
  printf '    %s\n' "${ALLOWED_DIRS[@]}" >&2
  echo "    (plus these basenames anywhere: ${ALLOWED_NAMES[*]})" >&2
fi

echo "" >&2
echo "Where this content belongs (documentation-standards skill § Decision Tree):" >&2
echo "" >&2
echo "  Operational know-how, lessons, runbook narrative:" >&2
echo "    brik-rag remember --workflow-type <topic>" >&2
echo "" >&2
echo "  Nick-specific preferences / cross-session feedback:" >&2
echo "    ~/.claude/projects/.../memory/  (Tier 4, indexed in MEMORY.md)" >&2
echo "" >&2
echo "  Executable runbook:            {repo}/docs/runbooks/" >&2
echo "  Task-local notes or scratch:   the session scratchpad, never the repo" >&2
echo "" >&2
echo "  A genuinely new home is a one-line PR to ALLOWED_DIRS here AND in" >&2
echo "  operations/hooks/md-routing-guard.sh, plus RATIFIED_HOMES in" >&2
echo "  scripts/audit/markdown-census.py (brik-llm#3269/#3270)." >&2
echo "" >&2

if [ "$MODE" = "ci" ]; then
  echo "::error::md-creation-gate: new markdown rejected — retired prefix or unsanctioned placement (see PR diff)"
fi

exit 1
