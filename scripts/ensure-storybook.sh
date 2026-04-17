#!/usr/bin/env bash
# ensure-storybook.sh — shared helper for BDS-consumer session guards.
#
# Each consumer's scripts/session-guard.sh (portal, renew-pms, brikdesigns)
# pipes its Claude Code hook `tool_input` JSON into this script on stdin.
# If the edit targets a UI file and Storybook isn't already running on
# port 6006, this helper launches `npm run storybook` in the BDS repo in
# the background so the storybook-mcp server becomes reachable.
#
# Input  : JSON on stdin (Claude Code PreToolUse hook payload).
# Env    : SESSION_GUARD_PARENT_PID — set by the calling session-guard so
#          all repo hooks share a single "already-fired this session" marker.
# Side   : Writes /tmp/.brik-storybook-autostart-${PID} to key the once-
#          per-session behavior. Launches a detached `npm run storybook`
#          if the port is free.
# Exit   : 0 always — the helper never blocks the calling hook.
#
# Behavior is silent on success. Prints a single info line when it
# actually starts the dev server.

set -euo pipefail

# Compute the marker key. Prefer the caller's parent PID so multiple repos
# sharing a single Claude Code session don't each re-spawn Storybook.
if [[ -n "${SESSION_GUARD_PARENT_PID:-}" ]]; then
  MARKER_KEY="$SESSION_GUARD_PARENT_PID"
else
  MARKER_KEY=$(ps -o ppid= -p $$ 2>/dev/null | tr -d ' ')
  MARKER_KEY="${MARKER_KEY:-unknown}"
fi
MARKER="/tmp/.brik-storybook-autostart-${MARKER_KEY}"

# Already fired this session? Nothing to do.
[[ -f "$MARKER" ]] && exit 0

# Pull the target file path out of the hook payload.
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.notebook_path // empty' 2>/dev/null || echo "")
[[ -z "$FILE_PATH" ]] && exit 0

# Only act on UI-relevant extensions.
case "$FILE_PATH" in
  *.tsx|*.jsx|*.css|*.scss|*.stories.ts|*.stories.tsx|*.stories.js|*.stories.jsx) ;;
  *) exit 0 ;;
esac

touch "$MARKER"

# Storybook already up? Done.
if curl -s -o /dev/null --max-time 1 http://localhost:6006/ 2>/dev/null; then
  exit 0
fi

# BDS repo missing? Nothing to start. (Consumers with an npm-only install
# won't have this path — silently skip.)
BDS_DIR="$HOME/Documents/GitHub/brik/brik-bds"
[[ -d "$BDS_DIR" && -f "$BDS_DIR/package.json" ]] || exit 0

echo ""
echo "🔧  Storybook not running on :6006 — starting in background for the BDS MCP."
echo "    Logs: /tmp/brik-storybook.log"
echo ""

(
  cd "$BDS_DIR"
  nohup npm run storybook > /tmp/brik-storybook.log 2>&1 &
  disown
) >/dev/null 2>&1 || true

exit 0
