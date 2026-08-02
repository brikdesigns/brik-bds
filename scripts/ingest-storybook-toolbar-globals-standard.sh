#!/usr/bin/env bash
# ingest-storybook-toolbar-globals-standard.sh — push the toolbar-globals standard into brik-rag.
#
# Source of truth: .claude/standards/storybook-toolbar-globals.md
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
  "$REPO_ROOT/.claude/standards/storybook-toolbar-globals.md" \
  "storybook-toolbar-globals-standard" \
  "Canonical list of orthogonal environmental axes wired as Storybook toolbar globalTypes in BDS. Theme (brik/brik-dark/client-sim), baseFont (14/16/18/20), animations (on/off), devWidgets — all wired. Viewport addition planned for #587 PR-B (mobile/tablet/desktop). Density + locale future. ADR-010 Q1 rule: a prop that reframes every story is always a toolbar global, never a story export. Source: brik-bds/.claude/standards/storybook-toolbar-globals.md"
