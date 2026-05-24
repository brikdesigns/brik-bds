#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# figma-pull-tokens.sh — One-command Figma → BDS token sync
#
# Connects to the claude-talk-to-figma WebSocket relay, pulls
# variables from one or both Library Figma files, and runs the
# full sync + build pipeline.
#
# Multi-library usage (recommended):
#   ./scripts/figma-pull-tokens.sh \
#     --foundations=<channel-id> \
#     --brand-kit=<channel-id>
#
# Single-library usage (pull only one Library this session):
#   ./scripts/figma-pull-tokens.sh --foundations=<channel-id>
#   ./scripts/figma-pull-tokens.sh --brand-kit=<channel-id>
#
# Legacy usage (pulls a single channel, writes tokens-studio.json directly):
#   ./scripts/figma-pull-tokens.sh [channel-id]
#
# Channel IDs are persisted to ~/.figma-channels (JSON) for future sessions.
# Legacy single-channel is also persisted to ~/.figma-channel for back-compat.
#
# Prerequisites:
#   1. Figma Desktop is open with the target Library file(s)
#   2. The Claude MCP plugin is running in each open Figma file
#   3. bun is installed
#
# The script will auto-start the WebSocket relay if needed.
# ──────────────────────────────────────────────────────────────

set -euo pipefail

# ── Paths ────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BDS_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
# _vendor/ lives at the brik/ root: parent of brik-bds (primary) or grandparent of
# brik-bds-worktrees/{slug} (task worktree). Resolve both cases. Override with
# BRIK_TOOLS_DIR if running from a non-standard layout.
if [[ -n "${BRIK_TOOLS_DIR:-}" ]]; then
  TOOLS_DIR="$BRIK_TOOLS_DIR"
elif [[ -d "$BDS_ROOT/../_vendor/claude-talk-to-figma-mcp" ]]; then
  TOOLS_DIR="$(cd "$BDS_ROOT/../_vendor/claude-talk-to-figma-mcp" && pwd)"
elif [[ -d "$BDS_ROOT/../../_vendor/claude-talk-to-figma-mcp" ]]; then
  TOOLS_DIR="$(cd "$BDS_ROOT/../../_vendor/claude-talk-to-figma-mcp" && pwd)"
else
  echo "ERROR: cannot locate _vendor/claude-talk-to-figma-mcp from $BDS_ROOT" >&2
  echo "       set BRIK_TOOLS_DIR to the absolute path explicitly" >&2
  exit 1
fi
PULL_SCRIPT="$BDS_ROOT/scripts/pull-variables.js"
SYNC_SCRIPT="$BDS_ROOT/scripts/sync-figma-mcp.js"
MERGE_SCRIPT="$BDS_ROOT/scripts/merge-tokens-studio.js"
RELAY_SCRIPT="$TOOLS_DIR/src/socket.ts"
CHANNELS_FILE="$HOME/.figma-channels"   # JSON: { "foundations": "...", "brand-kits/brik": "..." }
CHANNEL_FILE="$HOME/.figma-channel"     # Legacy single-channel back-compat

PORT="${FIGMA_RELAY_PORT:-3055}"

# ── Colors ───────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()   { echo -e "${BLUE}[figma-sync]${NC} $*"; }
ok()    { echo -e "${GREEN}  ✓${NC} $*"; }
warn()  { echo -e "${YELLOW}  ⚠${NC} $*"; }
fail()  { echo -e "${RED}  ✗${NC} $*"; exit 1; }

# ── 1. Parse arguments ───────────────────────────────────────
CHANNEL_FOUNDATIONS=""
CHANNEL_BRAND_KIT=""
LEGACY_CHANNEL=""

for arg in "$@"; do
  case "$arg" in
    --foundations=*) CHANNEL_FOUNDATIONS="${arg#--foundations=}" ;;
    --brand-kit=*)   CHANNEL_BRAND_KIT="${arg#--brand-kit=}" ;;
    --*)             ;;  # ignore unknown flags
    *)               LEGACY_CHANNEL="$arg" ;;
  esac
done

# ── 2. Determine mode ────────────────────────────────────────
# multi-library mode: at least one of --foundations / --brand-kit provided
# legacy mode: positional channel arg (or no args → prompt)
MULTI_LIBRARY=false
if [[ -n "$CHANNEL_FOUNDATIONS" || -n "$CHANNEL_BRAND_KIT" ]]; then
  MULTI_LIBRARY=true
fi

# ── 3. Load persisted channels ───────────────────────────────
# ~/.figma-channels is a JSON file: { "foundations": "xxx", "brand-kits/brik": "yyy" }
read_channel_from_json() {
  local key="$1"
  if [[ -f "$CHANNELS_FILE" ]]; then
    node -e "
      try {
        const d = JSON.parse(require('fs').readFileSync('$CHANNELS_FILE', 'utf8'));
        process.stdout.write(d['$key'] || '');
      } catch(e) { process.stdout.write(''); }
    " 2>/dev/null || true
  fi
}

save_channel_to_json() {
  local key="$1"
  local value="$2"
  node -e "
    const fs = require('fs');
    let d = {};
    try { d = JSON.parse(fs.readFileSync('$CHANNELS_FILE', 'utf8')); } catch(e) {}
    d['$key'] = '$value';
    fs.writeFileSync('$CHANNELS_FILE', JSON.stringify(d, null, 2) + '\n', 'utf8');
  " 2>/dev/null
}

if [[ "$MULTI_LIBRARY" == "true" ]]; then
  # Fill in any missing channels from persistence
  if [[ -z "$CHANNEL_FOUNDATIONS" ]]; then
    CHANNEL_FOUNDATIONS="$(read_channel_from_json foundations)"
  fi
  if [[ -z "$CHANNEL_BRAND_KIT" ]]; then
    CHANNEL_BRAND_KIT="$(read_channel_from_json "brand-kits/brik")"
  fi

  # Prompt for any still-missing channels
  if [[ -z "$CHANNEL_FOUNDATIONS" && -z "$CHANNEL_BRAND_KIT" ]]; then
    echo ""
    echo -e "${YELLOW}No channel IDs found.${NC}"
    echo "  Open each Figma Library file → Plugins → Claude MCP → copy the channel ID."
    echo ""
    echo -n "  Foundations channel ID (leave blank to skip): "
    read -r CHANNEL_FOUNDATIONS
    echo -n "  Brand Kit channel ID   (leave blank to skip): "
    read -r CHANNEL_BRAND_KIT
    [[ -z "$CHANNEL_FOUNDATIONS" && -z "$CHANNEL_BRAND_KIT" ]] && fail "No channels provided."
  elif [[ -z "$CHANNEL_FOUNDATIONS" ]]; then
    warn "No Foundations channel — skipping Foundations pull."
  elif [[ -z "$CHANNEL_BRAND_KIT" ]]; then
    warn "No Brand Kit channel — skipping Brand Kit pull."
  fi

  # Persist provided channels
  [[ -n "$CHANNEL_FOUNDATIONS" ]] && save_channel_to_json "foundations" "$CHANNEL_FOUNDATIONS"
  [[ -n "$CHANNEL_BRAND_KIT"  ]] && save_channel_to_json "brand-kits/brik" "$CHANNEL_BRAND_KIT"

  [[ -n "$CHANNEL_FOUNDATIONS" ]] && ok "Foundations channel: $CHANNEL_FOUNDATIONS"
  [[ -n "$CHANNEL_BRAND_KIT"  ]] && ok "Brand Kit channel:   $CHANNEL_BRAND_KIT"

else
  # ── Legacy single-channel mode ───────────────────────────
  CHANNEL="${LEGACY_CHANNEL:-${FIGMA_CHANNEL:-}}"

  if [[ -z "$CHANNEL" && -f "$CHANNEL_FILE" ]]; then
    CHANNEL="$(cat "$CHANNEL_FILE" | tr -d '[:space:]')"
    log "Using saved channel: $CHANNEL"
  fi

  if [[ -z "$CHANNEL" ]]; then
    echo ""
    echo -e "${YELLOW}No channel ID provided.${NC}"
    echo ""
    echo "  Open Figma → Plugins → Claude MCP → copy the channel ID"
    echo ""
    echo -n "  Channel ID: "
    read -r CHANNEL
    [[ -z "$CHANNEL" ]] && fail "No channel ID. Exiting."
  fi

  echo "$CHANNEL" > "$CHANNEL_FILE"
  ok "Channel: $CHANNEL (saved to ~/.figma-channel)"
fi

# ── 4. Check bun ─────────────────────────────────────────────
command -v bun >/dev/null 2>&1 || fail "bun is required. Install: curl -fsSL https://bun.sh/install | bash"

# ── 5. Ensure WebSocket relay is running ─────────────────────
log "Checking WebSocket relay on port $PORT..."

if lsof -i ":$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  ok "Relay already running on port $PORT"
else
  warn "Relay not running — starting..."
  cd "$TOOLS_DIR"
  bun run "$RELAY_SCRIPT" &
  RELAY_PID=$!
  disown "$RELAY_PID" 2>/dev/null

  # Wait for relay to be ready (up to 5s)
  for i in {1..10}; do
    if curl -s "http://localhost:$PORT/status" >/dev/null 2>&1; then
      ok "Relay started (PID $RELAY_PID)"
      break
    fi
    sleep 0.5
  done

  curl -s "http://localhost:$PORT/status" >/dev/null 2>&1 || fail "Relay failed to start on port $PORT"
  cd "$BDS_ROOT"
fi

# ── 6. Pull helper ───────────────────────────────────────────
# pull_library <channel-id> <output-file>
# Returns 0 on success, 1 on failure.
pull_library() {
  local channel="$1"
  local output_file="$2"
  local attempt=0
  local max_retries=2

  while [[ $attempt -lt $max_retries ]]; do
    attempt=$((attempt + 1))

    if bun "$PULL_SCRIPT" "$channel" > "$output_file" 2>/tmp/figma-pull-err.log; then
      local var_count
      var_count=$(node -e "
        const d = require('$output_file');
        const flat = d.totalVariables || d.variables?.length;
        const nested = d.collections?.reduce((sum, c) => sum + (c.variables?.length || 0), 0);
        console.log(flat || nested || 0);
      " 2>/dev/null || echo "0")
      if [[ "$var_count" -gt 0 ]]; then
        ok "Pulled $var_count variables → $output_file"
        return 0
      else
        warn "Got response but 0 variables (attempt $attempt/$max_retries)"
      fi
    else
      local err
      err=$(cat /tmp/figma-pull-err.log 2>/dev/null || echo "unknown error")
      warn "Pull failed (attempt $attempt/$max_retries): $err"
    fi

    if [[ $attempt -lt $max_retries ]]; then
      log "Retrying in 3s..."
      sleep 3
    fi
  done

  echo ""
  echo -e "${RED}Failed after $max_retries attempts.${NC}"
  echo ""
  echo "  Troubleshooting:"
  echo "  1. Is Figma Desktop open with the correct Library file?"
  echo "  2. Is the Claude MCP plugin running? (Plugins → Claude MCP)"
  echo "  3. Does the channel ID match? (shown in plugin UI)"
  echo "  4. Relay status: curl http://localhost:$PORT/status"
  echo ""
  return 1
}

cd "$BDS_ROOT"

# ── 7. Execute pulls ─────────────────────────────────────────
if [[ "$MULTI_LIBRARY" == "true" ]]; then

  # Multi-library: pull each Library into its source file, then merge.
  OUTPUT_FOUNDATIONS="/tmp/figma-foundations-$(date +%Y%m%d-%H%M%S).json"
  OUTPUT_BRAND_KIT="/tmp/figma-brand-kit-$(date +%Y%m%d-%H%M%S).json"

  if [[ -n "$CHANNEL_FOUNDATIONS" ]]; then
    log "Pulling Foundations Library..."
    pull_library "$CHANNEL_FOUNDATIONS" "$OUTPUT_FOUNDATIONS" || fail "Foundations pull failed."
    log "Syncing Foundations → design-tokens/foundations.json..."
    node "$SYNC_SCRIPT" "$OUTPUT_FOUNDATIONS" --library=foundations --no-merge || warn "Foundations sync had warnings."
  fi

  if [[ -n "$CHANNEL_BRAND_KIT" ]]; then
    log "Pulling Brand Kit Library (brik)..."
    pull_library "$CHANNEL_BRAND_KIT" "$OUTPUT_BRAND_KIT" || fail "Brand Kit pull failed."
    log "Syncing Brand Kit → design-tokens/brand-kits/brik.json..."
    node "$SYNC_SCRIPT" "$OUTPUT_BRAND_KIT" --library=brand-kit --no-merge || warn "Brand Kit sync had warnings."
  fi

  log "Merging Libraries → design-tokens/tokens-studio.json..."
  node "$MERGE_SCRIPT"

  log "Running npm run build:all-tokens..."
  npm run build:all-tokens

  echo ""
  echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
  echo -e "${GREEN}  Figma → BDS token sync complete (multi-library)${NC}"
  echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
  echo ""
  [[ -n "$CHANNEL_FOUNDATIONS" ]] && echo "  Foundations raw: $OUTPUT_FOUNDATIONS"
  [[ -n "$CHANNEL_BRAND_KIT"  ]] && echo "  Brand Kit raw:   $OUTPUT_BRAND_KIT"
  echo "  Library files:   design-tokens/foundations.json"
  echo "                   design-tokens/brand-kits/brik.json"
  echo "  Composed:        design-tokens/tokens-studio.json"
  echo "  Generated:       tokens/figma-tokens.css"
  echo ""
  echo "  Next steps:"
  echo "    1. Review changes: git diff tokens/figma-tokens.css"
  echo "    2. Update submodules in consuming projects"
  echo ""

else
  # ── Legacy single-channel path (unchanged behavior) ──────
  OUTPUT_FILE="/tmp/figma-vars-$(date +%Y%m%d-%H%M%S).json"

  log "Pulling variables from Figma..."
  pull_library "$CHANNEL" "$OUTPUT_FILE" || exit 1

  log "Syncing to tokens-studio.json and rebuilding..."
  if node "$SYNC_SCRIPT" "$OUTPUT_FILE" --build 2>&1; then
    ok "Token sync + build complete"
  else
    warn "Sync completed with warnings (check output above)"
  fi

  echo ""
  echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
  echo -e "${GREEN}  Figma → BDS token sync complete${NC}"
  echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
  echo ""
  echo "  Raw pull:    $OUTPUT_FILE"
  echo "  Updated:     design-tokens/tokens-studio.json"
  echo "  Generated:   tokens/figma-tokens.css"
  echo ""
  echo "  Next steps:"
  echo "    1. Review changes: git diff tokens/figma-tokens.css"
  echo "    2. Update submodules in consuming projects"
  echo ""
fi
