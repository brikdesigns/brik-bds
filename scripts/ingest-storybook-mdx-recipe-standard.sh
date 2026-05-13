#!/usr/bin/env bash
# ingest-storybook-mdx-recipe-standard.sh — push the MDX recipe standard into brik-rag.
#
# Source of truth: .claude/standards/storybook-mdx-recipe.md
# Destination: brik-rag memory corpus (type=reference, project=brik-bds)
#
# Re-runnable: each invocation re-ingests the latest content. Run after editing
# the standard markdown so the brik-rag copy stays current.

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
STANDARD_FILE="$REPO_ROOT/.claude/standards/storybook-mdx-recipe.md"

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

echo "▸ Ingesting storybook-mdx-recipe-standard ($(echo "$BODY" | wc -l | tr -d ' ') lines)..."

brik-rag remember \
  --name "storybook-mdx-recipe-standard" \
  --description "Canonical BDS MDX recipe for components/ui/**/*.mdx — six-section shape (Title → ComponentLinks → Description → Playground → Variants → Patterns → Props), optional CSS Override API + Notes, banned sections (## Usage, ## When to use, --- dividers, emoji headings), callout vocabulary, ADR-006/007 same-words-different-layers reconciliation, foundation + dashboard page templates, stub pattern, 9-criterion acceptance enforced by scripts/lint-storybook-recipe.js. Source: brik-bds/.claude/standards/storybook-mdx-recipe.md" \
  --type reference \
  --project brik-bds \
  --human \
  - <<< "$BODY"

echo "✓ Ingested. Verify with: brik-rag query \"storybook mdx recipe standard\" --top-k 3 --human"
