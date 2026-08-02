#!/usr/bin/env bash
# ingest-fumadocs-content-standard.sh — push the Fumadocs writing standard into brik-rag.
#
# Source of truth: .claude/standards/fumadocs-content.md
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
  "$REPO_ROOT/.claude/standards/fumadocs-content.md" \
  "fumadocs-writing-standard" \
  "Canonical Fumadocs MDX writing standard for brik-bds docs-site — frontmatter shape, IA decision tree (page/section/callout/cross-link), heading depth cap, voice pointer, anti-patterns. Source: brik-bds/.claude/standards/fumadocs-content.md"
