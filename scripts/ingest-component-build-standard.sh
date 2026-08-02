#!/usr/bin/env bash
# ingest-component-build-standard.sh — push the component-build standard into brik-rag.
#
# Source of truth: .claude/standards/component-build.md
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
  "$REPO_ROOT/.claude/standards/component-build.md" \
  "component-build-standard" \
  "Canonical BDS component build standard — file layout, CSS-over-inline, BEM under bds- namespace with closed slot allowlist (ADR-008), semantic tokens only (@/lib/tokens in TS), Radix-primitives composition, prop conventions, bdsClass, interactive states, semantic splitting, danger variants, accessibility minimums, 4-point sizing grid, table-cell patterns, anti-patterns. Source: brik-bds/.claude/standards/component-build.md"
