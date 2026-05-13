#!/usr/bin/env bash
# ingest-storybook-story-shape-standard.sh — push the story-shape standard into brik-rag.
#
# Source of truth: .claude/standards/storybook-story-shape.md
# Destination: brik-rag memory corpus (type=reference, project=brik-bds)
#
# Re-runnable: each invocation re-ingests the latest content. Run after editing
# the standard markdown so the brik-rag copy stays current.

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
STANDARD_FILE="$REPO_ROOT/.claude/standards/storybook-story-shape.md"

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

echo "▸ Ingesting storybook-story-shape-standard ($(echo "$BODY" | wc -l | tr -d ' ') lines)..."

brik-rag remember \
  --name "storybook-story-shape-standard" \
  --description "Canonical BDS story-shape standard for *.stories.tsx — two-shape model (Playground + per-state), ADR-010 story-vs-control matrix (Q1–Q5: toolbar global / argTypes / dedicated / irreducible / play-only), banned exports (Variants/Tones/Patterns/Examples), MCP discipline (@summary + surface tag), sidebar taxonomy, Storybook 9 imports, mocking, play-function patterns. Source: brik-bds/.claude/standards/storybook-story-shape.md" \
  --type reference \
  --project brik-bds \
  --human \
  - <<< "$BODY"

echo "✓ Ingested. Verify with: brik-rag query \"storybook story shape standard\" --top-k 3 --human"
