#!/usr/bin/env bash
# ingest-storybook-mdx-recipe-standard.sh — push the MDX recipe standard into brik-rag.
#
# Source of truth: .claude/standards/storybook-mdx-recipe.md
# Destination: brik-rag memory corpus (type=reference, project=brik-bds)
#
# Re-runnable: each invocation re-ingests the latest content. Run after editing
# the standard markdown so the brik-rag copy stays current. A standard past the
# brik-rag 32,000-char lesson cap is split across <name>, <name>-part-2, … on
# `## ` boundaries — see scripts/lib/ingest-standard.sh (#1645).

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
# shellcheck source=lib/ingest-standard.sh
source "$REPO_ROOT/scripts/lib/ingest-standard.sh"

ingest_standard \
  "$REPO_ROOT/.claude/standards/storybook-mdx-recipe.md" \
  "storybook-mdx-recipe-standard" \
  "Canonical BDS MDX recipe for components/ui/**/*.mdx — six-section shape (Title → ComponentLinks → Description → Playground → Variants → Patterns → Props), optional CSS Override API + Notes, banned sections (## Usage, ## When to use, --- dividers, emoji headings), callout vocabulary, ADR-006/007 same-words-different-layers reconciliation, foundation + dashboard page templates, stub pattern, 9-criterion acceptance enforced by scripts/lint-storybook-recipe.js. Source: brik-bds/.claude/standards/storybook-mdx-recipe.md"
