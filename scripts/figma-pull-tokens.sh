#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# figma-pull-tokens.sh — One-command Figma → BDS token sync
#
# Connects to the claude-talk-to-figma WebSocket relay, pulls
# all variables from the open Figma file, and runs the full
# sync + build pipeline.
#
# Usage:
#   ./scripts/figma-pull-tokens.sh [channel-id]
#
# If channel-id is omitted, reads from FIGMA_CHANNEL env var
# or ~/.figma-channel (persisted from last session).
#
# Prerequisites:
#   1. Figma Desktop is open with the target file
#   2. The Claude MCP plugin is running in Figma
#   3. bun is installed
#
# The script will auto-start the WebSocket relay if needed.
# ──────────────────────────────────────────────────────────────

set -euo pipefail

# ── Paths ────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BDS_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TOOLS_DIR="/Users/nickstanerson/Documents/GitHub/brik/_tools/claude-talk-to-figma-mcp"
PULL_SCRIPT="$TOOLS_DIR/scripts/pull-variables.js"
SYNC_SCRIPT="$BDS_ROOT/scripts/sync-figma-mcp.js"
RELAY_SCRIPT="$TOOLS_DIR/src/socket.ts"
CHANNEL_FILE="$HOME/.figma-channel"
OUTPUT_FILE="/tmp/figma-vars-$(date +%Y%m%d-%H%M%S).json"

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

# ── 1. Resolve channel ID ───────────────────────────────────
CHANNEL="${1:-${FIGMA_CHANNEL:-}}"

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

# Persist for next time
echo "$CHANNEL" > "$CHANNEL_FILE"
ok "Channel: $CHANNEL (saved to ~/.figma-channel)"

# ── 2. Check bun ─────────────────────────────────────────────
command -v bun >/dev/null 2>&1 || fail "bun is required. Install: curl -fsSL https://bun.sh/install | bash"

# ── 3. Ensure WebSocket relay is running ─────────────────────
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

# ── 4. Pull variables from Figma ─────────────────────────────
log "Pulling variables from Figma..."

ATTEMPT=0
MAX_RETRIES=2

while [[ $ATTEMPT -lt $MAX_RETRIES ]]; do
  ATTEMPT=$((ATTEMPT + 1))

  if bun "$PULL_SCRIPT" "$CHANNEL" > "$OUTPUT_FILE" 2>/tmp/figma-pull-err.log; then
    # Validate output is real JSON with variables
    VAR_COUNT=$(node -e "const d=require('$OUTPUT_FILE'); console.log(d.totalVariables || d.variables?.length || 0)" 2>/dev/null || echo "0")
    if [[ "$VAR_COUNT" -gt 0 ]]; then
      ok "Pulled $VAR_COUNT variables → $OUTPUT_FILE"
      break
    else
      warn "Got response but 0 variables (attempt $ATTEMPT/$MAX_RETRIES)"
    fi
  else
    ERR=$(cat /tmp/figma-pull-err.log 2>/dev/null || echo "unknown error")
    warn "Pull failed (attempt $ATTEMPT/$MAX_RETRIES): $ERR"
  fi

  if [[ $ATTEMPT -lt $MAX_RETRIES ]]; then
    log "Retrying in 3s..."
    sleep 3
  else
    echo ""
    echo -e "${RED}Failed after $MAX_RETRIES attempts.${NC}"
    echo ""
    echo "  Troubleshooting:"
    echo "  1. Is Figma Desktop open with the correct file?"
    echo "  2. Is the Claude MCP plugin running? (Plugins → Claude MCP)"
    echo "  3. Does the channel ID match? (shown in plugin UI)"
    echo "  4. Relay status: curl http://localhost:$PORT/status"
    echo ""
    exit 1
  fi
done

# ── 5. Transform to sync-figma-mcp format ────────────────────
# The pull-variables.js output has { variables: [...] } with valuesByMode
# The sync-figma-mcp.js expects flat { "path/key": "value" } format
# Transform here.

log "Transforming to token format..."

FLAT_FILE="/tmp/figma-vars-flat-$(date +%Y%m%d-%H%M%S).json"

node -e "
const data = require('$OUTPUT_FILE');
const flat = {};

for (const v of (data.variables || [])) {
  // Use the variable name path (e.g., 'color/system/green-light')
  const key = v.name.replace(/\\//g, '/');

  // Use first mode value (usually 'Value' for primitives, 'Light' for semantics)
  const modes = v.valuesByMode || {};
  const modeNames = Object.keys(modes);
  const val = modes[modeNames[0]];

  if (val !== undefined && val !== null) {
    flat[key] = typeof val === 'object' ? JSON.stringify(val) : String(val);
  }
}

require('fs').writeFileSync('$FLAT_FILE', JSON.stringify(flat, null, 2));
console.log(Object.keys(flat).length + ' tokens flattened');
" || fail "Transform failed"

ok "Flattened → $FLAT_FILE"

# ── 6. Sync to tokens-studio.json + rebuild ───────────────────
log "Syncing to tokens-studio.json and rebuilding..."

cd "$BDS_ROOT"

if node "$SYNC_SCRIPT" "$FLAT_FILE" --build 2>&1; then
  ok "Token sync + build complete"
else
  warn "Sync completed with warnings (check output above)"
fi

# ── 7. Summary ────────────────────────────────────────────────
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Figma → BDS token sync complete${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
echo ""
echo "  Raw pull:    $OUTPUT_FILE"
echo "  Flat tokens: $FLAT_FILE"
echo "  Updated:     design-tokens/tokens-studio.json"
echo "  Generated:   tokens/figma-tokens.css"
echo ""
echo "  Next steps:"
echo "    1. Review changes: git diff tokens/figma-tokens.css"
echo "    2. Update submodules in consuming projects"
echo ""
