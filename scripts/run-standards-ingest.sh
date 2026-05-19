#!/usr/bin/env bash
# run-standards-ingest.sh — auto-ingest paired BDS standards into brik-rag.
#
# Pairing rule (glob-driven, not table-driven):
#   .claude/standards/<name>.md  ↔  scripts/ingest-<name>-standard.sh
#
# Missing pair = hard fail. A future standard added without a paired script
# fails this gate at commit time, so brik-rag never falls behind a committed
# edit (the failure mode brik-bds#744 was filed to close).
#
# Usage:
#   run-standards-ingest.sh <standard-path> [<standard-path>...]
#                            Ingest only the listed standards.
#                            Called by .husky/pre-commit with the staged set.
#   run-standards-ingest.sh --all
#                            Ingest every .claude/standards/*.md. Bootstrap
#                            + manual full refresh.
#   run-standards-ingest.sh --check
#                            Verify every standard has a paired script; do
#                            not run ingest. CI-side pairing audit.
#
# After successful ingest, writes scripts/.standards-hashes (one line per
# standard, sorted). Pre-commit auto-stages it so the hash always travels
# with the standard. CI uses scripts/audit/standards-rag-drift.sh against
# this same file to catch web-UI / --no-verify edits.

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
STANDARDS_DIR="$REPO_ROOT/.claude/standards"
INGEST_DIR="$REPO_ROOT/scripts"
HASH_FILE="$REPO_ROOT/scripts/.standards-hashes"

MODE="run"
case "${1:-}" in
  --check) MODE="check"; shift ;;
  --all)   MODE="all";   shift ;;
  -h|--help) sed -n '2,28p' "$0"; exit 0 ;;
esac

TARGETS=()
if [ "$MODE" = "all" ] || [ "$MODE" = "check" ]; then
  for f in "$STANDARDS_DIR"/*.md; do
    [ -f "$f" ] && TARGETS+=("$f")
  done
else
  if [ $# -eq 0 ]; then
    echo "run-standards-ingest: no targets and not --all/--check" >&2
    echo "  Pass one or more .claude/standards/*.md paths, or use --all." >&2
    exit 2
  fi
  for arg in "$@"; do
    case "$arg" in
      /*) f="$arg" ;;
      *)  f="$REPO_ROOT/$arg" ;;
    esac
    TARGETS+=("$f")
  done
fi

# brik-rag CLI is required for --run / --all (the actual ingest). --check
# only verifies pairing on disk, so it skips this requirement.
if [ "$MODE" != "check" ]; then
  if ! command -v brik-rag >/dev/null 2>&1; then
    echo "" >&2
    echo "ERROR: brik-rag CLI not on PATH." >&2
    echo "  Expected: ~/.local/bin/claude-tools/brik-rag" >&2
    echo "  Install (one-time):" >&2
    echo "    ln -s \"\$HOME/Documents/Github/brik/brik-llm/scripts/rag/brik-rag\" \\" >&2
    echo "          \"\$HOME/.local/bin/claude-tools/brik-rag\"" >&2
    echo "" >&2
    echo "  Credentials live in ~/.secrets/brik-rag.env (the CLI sources them)." >&2
    exit 1
  fi
fi

FAILED=0
for STANDARD in "${TARGETS[@]}"; do
  if [ ! -f "$STANDARD" ]; then
    echo "run-standards-ingest: standard not found: $STANDARD" >&2
    FAILED=1
    continue
  fi

  BASENAME="$(basename "$STANDARD" .md)"
  PAIRED_SCRIPT="$INGEST_DIR/ingest-${BASENAME}-standard.sh"

  if [ ! -x "$PAIRED_SCRIPT" ]; then
    echo "" >&2
    echo "ERROR: unpaired standard: ${STANDARD#$REPO_ROOT/}" >&2
    echo "  Expected paired script: ${PAIRED_SCRIPT#$REPO_ROOT/}" >&2
    echo "  Convention: .claude/standards/<name>.md ↔ scripts/ingest-<name>-standard.sh" >&2
    echo "  Add the paired ingest script before committing this standard." >&2
    echo "" >&2
    FAILED=1
    continue
  fi

  if [ "$MODE" = "check" ]; then
    continue
  fi

  echo "▸ Ingesting ${STANDARD#$REPO_ROOT/} → ${PAIRED_SCRIPT#$REPO_ROOT/}"
  if ! "$PAIRED_SCRIPT"; then
    echo "" >&2
    echo "ERROR: ingest failed: ${PAIRED_SCRIPT#$REPO_ROOT/}" >&2
    FAILED=1
    continue
  fi
done

if [ "$FAILED" = "1" ]; then
  exit 1
fi

if [ "$MODE" = "check" ]; then
  exit 0
fi

# Recompute and write all hashes so the file always reflects full state,
# never a partial mid-run. Sorted for stable diffs.
TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT
for f in "$STANDARDS_DIR"/*.md; do
  [ -f "$f" ] || continue
  H="$(shasum -a 256 "$f" | awk '{print $1}')"
  REL="${f#$REPO_ROOT/}"
  printf '%s  %s\n' "$H" "$REL" >> "$TMP"
done
sort "$TMP" > "$HASH_FILE"
echo "✓ Updated ${HASH_FILE#$REPO_ROOT/}"

exit 0
