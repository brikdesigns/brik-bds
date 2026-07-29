#!/bin/bash
# Sync canonical devbar widgets from BDS to all known consumers.
#
# Source of truth: components/ui/BrikDevBar/widgets/
# Run after editing any vanilla widget in BDS.
#
# Destinations (per #466 sync map):
#   - brik-client-portal/public/                  (browser-served)
#   - brik-client-portal/scripts/mockup-shared/   (mockup pipeline)
#   - brikdesigns/public/                          (browser-served, staging dev-tools)
#   - brik-bds/.storybook/public/                  (Storybook iframe)
#   - brik-llm/scripts/brik-dev-tool/widgets/     (Astro mockup pipeline cache)
#
# Divergence guard (#1538): this sync used to `cp` unconditionally, which assumes
# every consumer is a pure mirror. When one is not, the copy is a silent feature
# deletion — brik-client-portal carried `dom_path` support in its inspect widget
# that BDS lacked, and only the portal's own pre-commit tests caught the loss.
#
# So the sync now runs in two phases. Phase 1 hashes every destination and
# compares it to the canonical content last written there (recorded in
# scripts/devbar-sync-state.txt); phase 2 copies only if nothing diverged. A
# divergent consumer fails the whole run by name and copies nothing, so
# divergence surfaces as a decision instead of a loss.
#
# Usage:
#   ./scripts/sync-devbar-widgets.sh            # guarded sync
#   ./scripts/sync-devbar-widgets.sh --force    # overwrite divergent copies, reseed state

set -e

FORCE=0
for arg in "$@"; do
  case "$arg" in
    --force) FORCE=1 ;;
    # Print the header comment and stop at the first non-comment line, so the
    # range cannot drift out of date when the header grows (#1561).
    -h|--help) sed -n '2,${/^#/!q;p;}' "$0"; exit 0 ;;
    *) echo "sync-devbar-widgets: unknown arg: $arg" >&2; exit 2 ;;
  esac
done

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Resolve the BDS primary checkout regardless of whether we run from primary
# or a worktree. --git-common-dir returns the primary's .git directory.
# --path-format=absolute is required: the bare form returns a path relative to
# the -C dir, which a later `cd` would resolve against the caller's CWD instead
# of SCRIPT_DIR — that silently no-op'd the whole sync when run from any other
# repo's root (e.g. brik-llm's sync-downstream.sh wrapper).
COMMON_DIR="$(git -C "$SCRIPT_DIR" rev-parse --path-format=absolute --git-common-dir 2>/dev/null)"
if [[ -z "$COMMON_DIR" || ! -d "$COMMON_DIR" ]]; then
  echo "Error: could not resolve the brik-bds git dir from $SCRIPT_DIR" >&2
  echo "       (run from inside brik-bds or a brik-bds worktree)" >&2
  exit 1
fi
BDS_PRIMARY="$(dirname "$COMMON_DIR")"

# WIDGETS reads from the *current* worktree (so edits in this worktree
# propagate without committing first). Falls back to BDS primary.
WORKTREE_ROOT="$(git -C "$SCRIPT_DIR" rev-parse --show-toplevel)"
WIDGETS="$WORKTREE_ROOT/components/ui/BrikDevBar/widgets"
[[ -d "$WIDGETS" ]] || WIDGETS="$BDS_PRIMARY/components/ui/BrikDevBar/widgets"

GH_ROOT="$(cd "$BDS_PRIMARY/../.." && pwd)"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'

STATE_FILE="$WORKTREE_ROOT/scripts/devbar-sync-state.txt"
STATE_REL="scripts/devbar-sync-state.txt"

# shasum on macOS, sha256sum on the CI images that lack it.
sha_of() {
  if command -v shasum >/dev/null 2>&1; then
    shasum -a 256 "$1" | awk '{print $1}'
  else
    sha256sum "$1" | awk '{print $1}'
  fi
}

# Stable key for a destination, independent of where this checkout lives: BDS's
# own paths key off the repo root (so a worktree and the primary agree), every
# other consumer keys off the GitHub root.
state_key() {
  local dest="$1"
  case "$dest" in
    "$WORKTREE_ROOT"/*) printf 'brik-bds/%s' "${dest#"$WORKTREE_ROOT"/}" ;;
    "$GH_ROOT"/*)       printf '%s' "${dest#"$GH_ROOT"/}" ;;
    *)                  printf '%s' "$dest" ;;
  esac
}

# The canonical hash last written to this destination, or empty if unrecorded.
recorded_sha() {
  [[ -f "$STATE_FILE" ]] || return 0
  awk -v k="$1" '$2 == k { print $1; exit }' "$STATE_FILE"
}

# Registered (src, dest, label) triples. Parallel indexed arrays rather than an
# associative array: /bin/bash on macOS is 3.2, which has no `declare -A`.
SRCS=(); DESTS=(); LABELS=()
register() {
  SRCS+=("$1"); DESTS+=("$2"); LABELS+=("$3")
}

echo "Syncing canonical devbar widgets from $WIDGETS"
echo ""

# brik-client-portal mirror (mockup pipeline)
PORTAL_MIRROR="$GH_ROOT/product/brik-client-portal/scripts/mockup-shared"
register "$WIDGETS/devbar.js"          "$PORTAL_MIRROR/devbar.js"          "portal mirror     devbar.js"
register "$WIDGETS/feedback-widget.js" "$PORTAL_MIRROR/feedback-widget.js" "portal mirror     feedback-widget.js"
register "$WIDGETS/inspect-widget.js"  "$PORTAL_MIRROR/inspect-widget.js"  "portal mirror     inspect-widget.js"
register "$WIDGETS/events-widget.js"   "$PORTAL_MIRROR/events-widget.js"   "portal mirror     events-widget.js"

# brik-client-portal public/ (browser-served)
PORTAL_PUBLIC="$GH_ROOT/product/brik-client-portal/public"
register "$WIDGETS/devbar.js"         "$PORTAL_PUBLIC/brik-devbar.js"        "portal public/    brik-devbar.js"
register "$WIDGETS/inspect-widget.js" "$PORTAL_PUBLIC/brik-inspect.js"       "portal public/    brik-inspect.js"
register "$WIDGETS/events-widget.js"  "$PORTAL_PUBLIC/brik-events-widget.js" "portal public/    brik-events-widget.js"

# brikdesigns public/ (browser-served, staging dev-tools)
# brikdesigns is Brik's own Next.js marketing-site repo under brik/, NOT web/
# (web/brikdesigns was a stale build husk — no repo, no public/). #1047
# No feedback-widget.js here: brikdesigns DevTools uses the React
# DevFeedbackWidget from BDS, not the vanilla widget (brikdesigns#479 / #644).
BRIKDESIGNS_PUBLIC="$GH_ROOT/brik/brikdesigns/public"
register "$WIDGETS/devbar.js"          "$BRIKDESIGNS_PUBLIC/brik-devbar.js"           "brikdesigns public/ brik-devbar.js"
register "$WIDGETS/inspect-widget.js"  "$BRIKDESIGNS_PUBLIC/brik-inspect.js"          "brikdesigns public/ brik-inspect.js"

# BDS Storybook preview iframe — write to the *current* checkout (worktree or
# primary) so commits from a task worktree capture these files. Previously this
# wrote to BDS_PRIMARY, which left the worktree's tree clean and caused
# brik-bds#473 to miss tracking three of the four widget files.
BDS_STORYBOOK_PUBLIC="$WORKTREE_ROOT/.storybook/public"
register "$WIDGETS/devbar.js"         "$BDS_STORYBOOK_PUBLIC/brik-devbar.js"        "bds storybook     brik-devbar.js"
register "$WIDGETS/inspect-widget.js" "$BDS_STORYBOOK_PUBLIC/brik-inspect.js"       "bds storybook     brik-inspect.js"
register "$WIDGETS/feedback-widget.js" "$BDS_STORYBOOK_PUBLIC/brik-feedback-widget.js" "bds storybook     brik-feedback-widget.js"
register "$WIDGETS/events-widget.js"  "$BDS_STORYBOOK_PUBLIC/brik-events-widget.js" "bds storybook     brik-events-widget.js"

# brik-llm cache (Astro mockup pipeline reads from here via inject-widgets.sh)
LLM_WIDGETS="$GH_ROOT/brik/brik-llm/scripts/brik-dev-tool/widgets"
register "$WIDGETS/devbar.js"          "$LLM_WIDGETS/devbar.js"          "brik-llm cache    devbar.js"
register "$WIDGETS/inspect-widget.js"  "$LLM_WIDGETS/inspect-widget.js"  "brik-llm cache    inspect-widget.js"
register "$WIDGETS/feedback-widget.js" "$LLM_WIDGETS/feedback-widget.js" "brik-llm cache    feedback-widget.js"
register "$WIDGETS/events-widget.js"   "$LLM_WIDGETS/events-widget.js"   "brik-llm cache    events-widget.js"

# ── Phase 1: refuse to clobber a diverged consumer ──────────────────────────
#
# A destination is safe to overwrite when it still holds the canonical content
# we last wrote there (or already holds the new canonical). Anything else means
# someone edited the consumer copy directly, and copying over it would delete
# that work — so name the file and stop before writing anything.
DIVERGED=()
UNRECORDED=()
for i in "${!DESTS[@]}"; do
  dest="${DESTS[$i]}"
  [[ -d "$(dirname "$dest")" ]] || continue   # consumer not checked out — phase 2 skips it
  [[ -f "$dest" ]] || continue                # new file at a known consumer — nothing to lose

  key="$(state_key "$dest")"
  actual="$(sha_of "$dest")"
  recorded="$(recorded_sha "$key")"
  src_sha="$(sha_of "${SRCS[$i]}")"

  if [[ -z "$recorded" ]]; then
    [[ "$actual" == "$src_sha" ]] && continue  # already identical — nothing to record or lose
    UNRECORDED+=("${LABELS[$i]}  →  $key")
  elif [[ "$actual" != "$recorded" && "$actual" != "$src_sha" ]]; then
    DIVERGED+=("${LABELS[$i]}  →  $key")
  fi
done

if (( FORCE == 0 )) && (( ${#DIVERGED[@]} + ${#UNRECORDED[@]} > 0 )); then
  echo -e "${RED}✗ Refusing to sync — nothing was copied.${NC}" >&2
  echo "" >&2
  if (( ${#DIVERGED[@]} > 0 )); then
    echo -e "${RED}  Diverged from the last-synced canonical:${NC}" >&2
    for d in "${DIVERGED[@]}"; do echo "    $d" >&2; done
    echo "" >&2
    echo "  These consumer copies carry edits BDS does not have. Copying over them" >&2
    echo "  would delete that work (#1538). Upstream the change into" >&2
    echo "  components/ui/BrikDevBar/widgets/ first, then re-run this sync." >&2
  fi
  if (( ${#UNRECORDED[@]} > 0 )); then
    (( ${#DIVERGED[@]} > 0 )) && echo "" >&2
    echo -e "${YELLOW}  No last-synced baseline recorded:${NC}" >&2
    for u in "${UNRECORDED[@]}"; do echo "    $u" >&2; done
    echo "" >&2
    echo "  $STATE_REL has no entry for these, so divergence cannot be" >&2
    echo "  distinguished from staleness. Diff each against the canonical, then" >&2
    echo "  re-run with --force to overwrite and seed the baseline." >&2
  fi
  echo "" >&2
  echo "  Deliberate overwrite: ./scripts/sync-devbar-widgets.sh --force" >&2
  exit 1
fi

(( FORCE == 1 )) && echo -e "  ${YELLOW}!${NC} --force: divergence checks bypassed"

# ── Phase 2: copy, then record what we wrote ────────────────────────────────
: > "$STATE_FILE.tmp"
for i in "${!DESTS[@]}"; do
  src="${SRCS[$i]}"; dest="${DESTS[$i]}"
  if [[ -d "$(dirname "$dest")" ]]; then
    cp "$src" "$dest"
    printf '%s  %s\n' "$(sha_of "$dest")" "$(state_key "$dest")" >> "$STATE_FILE.tmp"
    echo -e "  ${GREEN}✓${NC} ${LABELS[$i]}"
  else
    echo -e "  ${YELLOW}-${NC} ${LABELS[$i]}  (skipped — destination dir missing)"
    # Carry the existing entry forward so a consumer that is merely not checked
    # out here does not lose its recorded baseline.
    key="$(state_key "$dest")"
    prev="$(recorded_sha "$key")"
    [[ -n "$prev" ]] && printf '%s  %s\n' "$prev" "$key" >> "$STATE_FILE.tmp"
  fi
done
sort -o "$STATE_FILE" "$STATE_FILE.tmp" && rm -f "$STATE_FILE.tmp"

# BDS inspector manifest — built by scripts/build-inspector-manifest.mjs.
# The inspect widget reads it for component status + token enrichment.
# Unguarded: this is a generated build artifact, not hand-editable widget
# source, so a consumer copy differing from it is staleness, never lost work.
BDS_MANIFEST="$BDS_PRIMARY/dist/bds-manifest.json"
if [[ -f "$BDS_MANIFEST" ]]; then
  echo ""
  for dest in "$PORTAL_PUBLIC/bds-manifest.json" "$BRIKDESIGNS_PUBLIC/bds-manifest.json" "$BDS_STORYBOOK_PUBLIC/bds-manifest.json"; do
    if [[ -d "$(dirname "$dest")" ]]; then
      cp "$BDS_MANIFEST" "$dest"
      echo -e "  ${GREEN}✓${NC} $(state_key "$dest")"
    else
      echo -e "  ${YELLOW}-${NC} $(state_key "$dest")  (skipped — destination dir missing)"
    fi
  done
else
  echo ""
  echo -e "  ${YELLOW}-${NC} bds-manifest.json  (not built — run 'npm run build:inspector-manifest' first)"
fi

echo ""
echo "Done. Commit the sync in each affected repo (including $STATE_REL)."
