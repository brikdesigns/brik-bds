#!/usr/bin/env bash
# ingest-read-edit-parity-standard.sh — push the read/edit parity standard into brik-rag.
#
# Source of truth: .claude/standards/read-edit-parity.md
# Destination: brik-rag memory corpus (type=reference, project=brik-bds)
#
# Re-runnable: each invocation re-ingests the latest content. Run after editing
# the standard markdown so the brik-rag copy stays current.

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
STANDARD_FILE="$REPO_ROOT/.claude/standards/read-edit-parity.md"

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

# Strip YAML frontmatter (everything from first --- to second ---).
BODY="$(awk 'BEGIN{c=0} /^---$/{c++; next} c>=2' "$STANDARD_FILE")"

if [[ -z "$BODY" ]]; then
  echo "error: standard body is empty after frontmatter strip" >&2
  exit 1
fi

echo "▸ Ingesting read-edit-parity-standard ($(echo "$BODY" | wc -l | tr -d ' ') lines)..."

rag_ingest_standard \
  "read-edit-parity-standard" \
  "Canonical BDS read/edit parity standard — a read (view) surface and its edit surface for the same entity must mirror: order + grouping parity (matching Section/DataSection position), component-mapping parity (same component family, e.g. ServiceTagPicker -> ServiceTag, never downgraded to a neutral Tag), color semantics (Dot reserved for status, never repurposed for taxonomy/identity data), no redundant capture (one field per taxonomy). Worked example: brik-client-portal#3085 service-line color_token drop. Advisory — skill trigger + lint gate tracked in brik-client-portal#3084. Source: brik-bds/.claude/standards/read-edit-parity.md" \
  reference \
  brik-bds \
  "$BODY"

echo "✓ Ingested. Verify with: brik-rag query \"read edit parity standard\" --top-k 3 --human"
