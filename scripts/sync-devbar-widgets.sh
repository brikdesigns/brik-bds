#!/bin/bash
# Sync canonical devbar widgets from BDS to all known consumers.
#
# Source of truth: components/ui/BrikDevBar/widgets/
# Run after editing any vanilla widget in BDS.
#
# Destinations (per #466 sync map):
#   - brik-client-portal/public/                  (browser-served)
#   - brik-client-portal/scripts/mockup-shared/   (mockup pipeline)
#   - renew-pms/public/                            (browser-served)
#   - brikdesigns/public/                          (browser-served, staging dev-tools)
#   - brik-bds/.storybook/public/                  (Storybook iframe)
#   - brik-llm/scripts/brik-dev-tool/widgets/     (Astro mockup pipeline cache)

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Resolve the BDS primary checkout regardless of whether we run from primary
# or a worktree. --git-common-dir returns the primary's .git directory.
COMMON_DIR="$(git -C "$SCRIPT_DIR" rev-parse --git-common-dir 2>/dev/null)"
if [[ -z "$COMMON_DIR" ]]; then
  echo "Error: not a git repo (run from inside brik-bds or a brik-bds worktree)" >&2
  exit 1
fi
COMMON_DIR="$(cd "$COMMON_DIR" && pwd)"
BDS_PRIMARY="$(dirname "$COMMON_DIR")"

# WIDGETS reads from the *current* worktree (so edits in this worktree
# propagate without committing first). Falls back to BDS primary.
WORKTREE_ROOT="$(git -C "$SCRIPT_DIR" rev-parse --show-toplevel)"
WIDGETS="$WORKTREE_ROOT/components/ui/BrikDevBar/widgets"
[[ -d "$WIDGETS" ]] || WIDGETS="$BDS_PRIMARY/components/ui/BrikDevBar/widgets"

GH_ROOT="$(cd "$BDS_PRIMARY/../.." && pwd)"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'

sync_one() {
  local src="$1" dest="$2" label="$3"
  if [[ -d "$(dirname "$dest")" ]]; then
    cp "$src" "$dest"
    echo -e "  ${GREEN}✓${NC} $label"
  else
    echo -e "  ${YELLOW}-${NC} $label  (skipped — destination dir missing)"
  fi
}

echo "Syncing canonical devbar widgets from $WIDGETS"
echo ""

# brik-client-portal mirror (mockup pipeline)
PORTAL_MIRROR="$GH_ROOT/product/brik-client-portal/scripts/mockup-shared"
sync_one "$WIDGETS/devbar.js"          "$PORTAL_MIRROR/devbar.js"          "portal mirror     devbar.js"
sync_one "$WIDGETS/feedback-widget.js" "$PORTAL_MIRROR/feedback-widget.js" "portal mirror     feedback-widget.js"
sync_one "$WIDGETS/inspect-widget.js"  "$PORTAL_MIRROR/inspect-widget.js"  "portal mirror     inspect-widget.js"
sync_one "$WIDGETS/events-widget.js"   "$PORTAL_MIRROR/events-widget.js"   "portal mirror     events-widget.js"

# brik-client-portal public/ (browser-served)
PORTAL_PUBLIC="$GH_ROOT/product/brik-client-portal/public"
sync_one "$WIDGETS/devbar.js"         "$PORTAL_PUBLIC/brik-devbar.js"        "portal public/    brik-devbar.js"
sync_one "$WIDGETS/inspect-widget.js" "$PORTAL_PUBLIC/brik-inspect.js"       "portal public/    brik-inspect.js"
sync_one "$WIDGETS/events-widget.js"  "$PORTAL_PUBLIC/brik-events-widget.js" "portal public/    brik-events-widget.js"

# renew-pms public/ (browser-served)
RENEW_PUBLIC="$GH_ROOT/product/renew-pms/public"
sync_one "$WIDGETS/devbar.js"         "$RENEW_PUBLIC/brik-devbar.js"        "renew-pms public/ brik-devbar.js"
sync_one "$WIDGETS/inspect-widget.js" "$RENEW_PUBLIC/brik-inspect.js"       "renew-pms public/ brik-inspect.js"
sync_one "$WIDGETS/events-widget.js"  "$RENEW_PUBLIC/brik-events-widget.js" "renew-pms public/ brik-events-widget.js"

# brikdesigns public/ (browser-served, staging dev-tools)
BRIKDESIGNS_PUBLIC="$GH_ROOT/web/brikdesigns/public"
sync_one "$WIDGETS/devbar.js"          "$BRIKDESIGNS_PUBLIC/brik-devbar.js"           "brikdesigns public/ brik-devbar.js"
sync_one "$WIDGETS/inspect-widget.js"  "$BRIKDESIGNS_PUBLIC/brik-inspect.js"          "brikdesigns public/ brik-inspect.js"
sync_one "$WIDGETS/feedback-widget.js" "$BRIKDESIGNS_PUBLIC/brik-feedback-widget.js"  "brikdesigns public/ brik-feedback-widget.js"

# BDS Storybook preview iframe — write to the *current* checkout (worktree or
# primary) so commits from a task worktree capture these files. Previously this
# wrote to BDS_PRIMARY, which left the worktree's tree clean and caused
# brik-bds#473 to miss tracking three of the four widget files.
BDS_STORYBOOK_PUBLIC="$WORKTREE_ROOT/.storybook/public"
sync_one "$WIDGETS/devbar.js"         "$BDS_STORYBOOK_PUBLIC/brik-devbar.js"        "bds storybook     brik-devbar.js"
sync_one "$WIDGETS/inspect-widget.js" "$BDS_STORYBOOK_PUBLIC/brik-inspect.js"       "bds storybook     brik-inspect.js"
sync_one "$WIDGETS/feedback-widget.js" "$BDS_STORYBOOK_PUBLIC/brik-feedback-widget.js" "bds storybook     brik-feedback-widget.js"
sync_one "$WIDGETS/events-widget.js"  "$BDS_STORYBOOK_PUBLIC/brik-events-widget.js" "bds storybook     brik-events-widget.js"

# brik-llm cache (Astro mockup pipeline reads from here via inject-widgets.sh)
LLM_WIDGETS="$GH_ROOT/brik/brik-llm/scripts/brik-dev-tool/widgets"
sync_one "$WIDGETS/devbar.js"          "$LLM_WIDGETS/devbar.js"          "brik-llm cache    devbar.js"
sync_one "$WIDGETS/inspect-widget.js"  "$LLM_WIDGETS/inspect-widget.js"  "brik-llm cache    inspect-widget.js"
sync_one "$WIDGETS/feedback-widget.js" "$LLM_WIDGETS/feedback-widget.js" "brik-llm cache    feedback-widget.js"
sync_one "$WIDGETS/events-widget.js"   "$LLM_WIDGETS/events-widget.js"   "brik-llm cache    events-widget.js"

# BDS inspector manifest — built by scripts/build-inspector-manifest.mjs.
# The inspect widget reads it for component status + token enrichment.
BDS_MANIFEST="$BDS_PRIMARY/dist/bds-manifest.json"
if [[ -f "$BDS_MANIFEST" ]]; then
  echo ""
  sync_one "$BDS_MANIFEST" "$PORTAL_PUBLIC/bds-manifest.json"        "portal public/      bds-manifest.json"
  sync_one "$BDS_MANIFEST" "$RENEW_PUBLIC/bds-manifest.json"         "renew-pms public/   bds-manifest.json"
  sync_one "$BDS_MANIFEST" "$BRIKDESIGNS_PUBLIC/bds-manifest.json"   "brikdesigns public/ bds-manifest.json"
  sync_one "$BDS_MANIFEST" "$BDS_STORYBOOK_PUBLIC/bds-manifest.json" "bds storybook       bds-manifest.json"
else
  echo ""
  echo -e "  ${YELLOW}-${NC} bds-manifest.json  (not built — run 'npm run build:inspector-manifest' first)"
fi

echo ""
echo "Done. Commit the sync in each affected repo."
