#!/usr/bin/env bash
# ingest-storybook-story-shape-standard.sh — push the story-shape standard into brik-rag.
#
# Source of truth: .claude/standards/storybook-story-shape.md
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
  "$REPO_ROOT/.claude/standards/storybook-story-shape.md" \
  "storybook-story-shape-standard" \
  "Canonical BDS story-shape standard for *.stories.tsx — two-shape model (Playground + per-state), ADR-010 story-vs-control matrix (Q1–Q5: toolbar global / argTypes / dedicated / irreducible / play-only), banned exports (Variants/Tones/Patterns/Examples), MCP discipline (@summary + surface tag), sidebar taxonomy, Storybook 9 imports, mocking, play-function patterns. Source: brik-bds/.claude/standards/storybook-story-shape.md"
