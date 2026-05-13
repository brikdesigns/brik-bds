#!/usr/bin/env bash
# ingest-component-build-standard.sh — push the component-build standard into brik-rag.
#
# Source of truth: .claude/standards/component-build.md
# Destination: brik-rag memory corpus (type=reference, project=brik-bds)
#
# Re-runnable: each invocation re-ingests the latest content. Run after editing
# the standard markdown so the brik-rag copy stays current.

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
STANDARD_FILE="$REPO_ROOT/.claude/standards/component-build.md"

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

echo "▸ Ingesting component-build-standard ($(echo "$BODY" | wc -l | tr -d ' ') lines)..."

brik-rag remember \
  --name "component-build-standard" \
  --description "Canonical BDS component build standard — file layout, CSS-over-inline, BEM under bds- namespace with closed slot allowlist (ADR-008), semantic tokens only (@/lib/tokens in TS), Radix-primitives composition, prop conventions, bdsClass, interactive states, semantic splitting, danger variants, accessibility minimums, 4-point sizing grid, table-cell patterns, anti-patterns. Source: brik-bds/.claude/standards/component-build.md" \
  --type reference \
  --project brik-bds \
  --human \
  - <<< "$BODY"

echo "✓ Ingested. Verify with: brik-rag query \"component build standard\" --top-k 3 --human"
