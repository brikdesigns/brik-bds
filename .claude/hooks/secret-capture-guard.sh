#!/usr/bin/env bash
# secret-capture-guard.sh — PreToolUse hook for Bash
#
# Blocks commands that dump environment variables or stored secrets to stdout,
# where they'd be captured into Claude Code's session transcript (.jsonl).
#
# Rationale: on 2026-04-24 a session-history scrub surfaced three transcripts
# containing full ANTHROPIC_API_KEY / SENTRY_AUTH_TOKEN / CLICKUP_API_TOKEN /
# FIGMA_ACCESS_TOKEN values captured from a past `netlify env:list` invocation.
# This hook prevents the same class of leak recurring.
#
# Protocol: reads PreToolUse JSON on stdin, extracts .tool_input.command,
# and emits a deny decision when a block pattern matches. Exits 0 in all
# cases — the decision is signaled via hookSpecificOutput JSON.

set -euo pipefail

cmd=$(jq -r '.tool_input.command // ""' 2>/dev/null || echo "")

reason=""

# --- 1. Netlify env dumps ------------------------------------------------
if echo "$cmd" | grep -qE '\bnetlify[[:space:]]+env:list\b'; then
  reason="'netlify env:list' prints every env var to stdout. Write to a file: 'netlify env:list > /tmp/env.txt' then read the file."
elif echo "$cmd" | grep -qE '\bnetlify[[:space:]]+env:get\b' \
  && ! echo "$cmd" | grep -qE '>[[:space:]]*[^&]'; then
  reason="'netlify env:get' without a redirect sends the value to stdout and into the transcript. Redirect to a file: 'netlify env:get FOO > /tmp/foo.txt'."
# --- 2. Bare printenv / env -------------------------------------------------
elif echo "$cmd" | grep -qE '(^|[;&|])[[:space:]]*printenv[[:space:]]*($|[;|&])'; then
  reason="bare 'printenv' dumps every env var. Use 'printenv VAR_NAME' for a specific variable."
elif echo "$cmd" | grep -qE '(^|[;&|])[[:space:]]*env[[:space:]]*(\||$|[;&])'; then
  reason="bare 'env' (or 'env | ...') dumps every env var into the pipeline. Use 'printenv VAR_NAME' for a specific variable."
# --- 3. 1Password reveal without redirect ----------------------------------
elif echo "$cmd" | grep -qE '\bop[[:space:]]+(item[[:space:]]+get|read)\b.*--reveal' \
  && ! echo "$cmd" | grep -qE '>[[:space:]]*[^&]'; then
  reason="'op ... --reveal' prints the secret to stdout. Redirect to a file ('... --reveal > /tmp/s.txt') or use 'op read' with sed prefix-only masking."
fi

if [ -n "$reason" ]; then
  msg="Blocked — would capture secrets into the session transcript. $reason"
  jq -n --arg r "$msg" '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: $r
    }
  }'
fi
exit 0
