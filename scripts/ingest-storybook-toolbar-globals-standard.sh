#!/usr/bin/env bash
# ingest-storybook-toolbar-globals-standard.sh — push the toolbar-globals standard into brik-rag.
#
# Source of truth: .claude/standards/storybook-toolbar-globals.md
# Destination: brik-rag memory corpus (type=reference, project=brik-bds)
#
# Re-runnable: each invocation re-ingests the latest content. Run after editing
# the standard markdown so the brik-rag copy stays current.

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
STANDARD_FILE="$REPO_ROOT/.claude/standards/storybook-toolbar-globals.md"

if [[ ! -f "$STANDARD_FILE" ]]; then
  echo "error: standard markdown not found at $STANDARD_FILE" >&2
  exit 1
fi

if ! command -v brik-rag >/dev/null 2>&1; then
  echo "error: brik-rag CLI not on PATH. Expected at ~/.local/bin/claude-tools/brik-rag" >&2
  exit 1
fi

# Chunked ingest — a standard over brik-rag's 32k lesson cap is split at H2
# boundaries instead of failing the commit (brik-bds#1648).
# shellcheck source=scripts/lib/rag-ingest.sh
source "$REPO_ROOT/scripts/lib/rag-ingest.sh"

BODY="$(awk 'BEGIN{c=0} /^---$/{c++; next} c>=2' "$STANDARD_FILE")"

if [[ -z "$BODY" ]]; then
  echo "error: standard body is empty after frontmatter strip" >&2
  exit 1
fi

echo "▸ Ingesting storybook-toolbar-globals-standard ($(echo "$BODY" | wc -l | tr -d ' ') lines)..."

rag_ingest_standard \
  "storybook-toolbar-globals-standard" \
  "Canonical list of orthogonal environmental axes wired as Storybook toolbar globalTypes in BDS. Theme (brik/brik-dark/client-sim), baseFont (14/16/18/20), animations (on/off), devWidgets — all wired. Viewport addition planned for #587 PR-B (mobile/tablet/desktop). Density + locale future. ADR-010 Q1 rule: a prop that reframes every story is always a toolbar global, never a story export. Source: brik-bds/.claude/standards/storybook-toolbar-globals.md" \
  reference \
  brik-bds \
  "$BODY"

echo "✓ Ingested. Verify with: brik-rag query \"storybook toolbar globals\" --top-k 3 --human"
