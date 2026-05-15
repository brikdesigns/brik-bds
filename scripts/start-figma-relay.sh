#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# start-figma-relay.sh — Idempotent start for the Figma plugin
# WebSocket relay on port 3055.
#
# - Exits 0 immediately if the relay is already listening.
# - Otherwise starts it in the background (detached) and returns
#   once the relay confirms `/status` is reachable.
#
# The relay survives the foreground process exiting — Ctrl-C on
# `npm run dev` will not kill it. That's deliberate so consecutive
# dev sessions don't need to re-pay the relay startup cost.
#
# Stop the relay manually with:
#   kill $(lsof -ti :3055 -sTCP:LISTEN)
#
# Usage:
#   ./scripts/start-figma-relay.sh
# ──────────────────────────────────────────────────────────────

set -euo pipefail

PORT="${FIGMA_RELAY_PORT:-3055}"

# ── Resolve relay source dir ────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BDS_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

if [[ -n "${BRIK_TOOLS_DIR:-}" ]]; then
  TOOLS_DIR="$BRIK_TOOLS_DIR"
elif [[ -d "$BDS_ROOT/../_vendor/claude-talk-to-figma-mcp" ]]; then
  TOOLS_DIR="$(cd "$BDS_ROOT/../_vendor/claude-talk-to-figma-mcp" && pwd)"
elif [[ -d "$BDS_ROOT/../../_vendor/claude-talk-to-figma-mcp" ]]; then
  TOOLS_DIR="$(cd "$BDS_ROOT/../../_vendor/claude-talk-to-figma-mcp" && pwd)"
else
  echo "[figma-relay] WARN: cannot locate _vendor/claude-talk-to-figma-mcp from $BDS_ROOT" >&2
  echo "[figma-relay]       set BRIK_TOOLS_DIR or skip this preflight" >&2
  exit 0  # Soft-fail — don't block `npm run dev` if the relay tool isn't installed
fi

RELAY_SCRIPT="$TOOLS_DIR/src/socket.ts"

# ── Short-circuit if already running ─────────────────────────
if lsof -i ":$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "[figma-relay] already running on :$PORT"
  exit 0
fi

# ── Check bun ───────────────────────────────────────────────
if ! command -v bun >/dev/null 2>&1; then
  echo "[figma-relay] WARN: bun not installed — skipping relay autostart" >&2
  exit 0
fi

# ── Start detached ───────────────────────────────────────────
echo "[figma-relay] starting on :$PORT..."
(cd "$TOOLS_DIR" && nohup bun run "$RELAY_SCRIPT" >/dev/null 2>&1 &)

# ── Wait up to 5s for /status to respond ────────────────────
for i in {1..10}; do
  if curl -s "http://localhost:$PORT/status" >/dev/null 2>&1; then
    echo "[figma-relay] ✓ ready on :$PORT"
    exit 0
  fi
  sleep 0.5
done

echo "[figma-relay] WARN: started but /status not reachable after 5s" >&2
exit 0  # Soft-fail — let the foreground process try anyway
