#!/usr/bin/env bash
# ingest-fumadocs-standard.sh — push the Fumadocs writing standard into brik-rag.
#
# Source of truth: .claude/standards/fumadocs-content-standard.md
# Destination: brik-rag memory corpus (type=reference, project=brik-bds)
#
# Re-runnable: each invocation re-ingests the latest content. Run after editing
# the standard markdown so the brik-rag copy stays current.
#
# Why memory corpus (not a dedicated canon source_type): holding pattern for
# brik-llm#436 PR A. If usage warrants, promote to a first-class canon source
# via a new module in brik-llm/scripts/rag/corpora/ in a follow-up.

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
STANDARD_FILE="$REPO_ROOT/.claude/standards/fumadocs-content-standard.md"

if [[ ! -f "$STANDARD_FILE" ]]; then
  echo "error: standard markdown not found at $STANDARD_FILE" >&2
  exit 1
fi

if ! command -v brik-rag >/dev/null 2>&1; then
  echo "error: brik-rag CLI not on PATH. Expected at ~/.local/bin/claude-tools/brik-rag" >&2
  exit 1
fi

# Strip YAML frontmatter (everything from first --- to second ---).
BODY="$(awk 'BEGIN{c=0} /^---$/{c++; next} c>=2' "$STANDARD_FILE")"

if [[ -z "$BODY" ]]; then
  echo "error: standard body is empty after frontmatter strip" >&2
  exit 1
fi

echo "▸ Ingesting fumadocs-writing-standard ($(echo "$BODY" | wc -l | tr -d ' ') lines)..."

brik-rag remember \
  --name "fumadocs-writing-standard" \
  --description "Canonical Fumadocs MDX writing standard for brik-bds docs-site — frontmatter shape, IA decision tree (page/section/callout/cross-link), heading depth cap, voice pointer, anti-patterns. Source: brik-bds/.claude/standards/fumadocs-content-standard.md" \
  --type reference \
  --project brik-bds \
  --human \
  - <<< "$BODY"

echo "✓ Ingested. Verify with: brik-rag query \"fumadocs writing standard\" --top-k 3 --human"
