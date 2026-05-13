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

BODY="$(awk 'BEGIN{c=0} /^---$/{c++; next} c>=2' "$STANDARD_FILE")"

if [[ -z "$BODY" ]]; then
  echo "error: standard body is empty after frontmatter strip" >&2
  exit 1
fi

echo "▸ Ingesting storybook-toolbar-globals-standard ($(echo "$BODY" | wc -l | tr -d ' ') lines)..."

brik-rag remember \
  --name "storybook-toolbar-globals-standard" \
  --description "Canonical list of orthogonal environmental axes wired as Storybook toolbar globalTypes in BDS. Theme (brik/brik-dark/client-sim), baseFont (14/16/18/20), animations (on/off), devWidgets — all wired. Viewport addition planned for #587 PR-B (mobile/tablet/desktop). Density + locale future. ADR-010 Q1 rule: a prop that reframes every story is always a toolbar global, never a story export. Source: brik-bds/.claude/standards/storybook-toolbar-globals.md" \
  --type reference \
  --project brik-bds \
  --human \
  - <<< "$BODY"

echo "✓ Ingested. Verify with: brik-rag query \"storybook toolbar globals\" --top-k 3 --human"
