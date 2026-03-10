#!/bin/bash
# Auto-stage files after Claude Code Edit/Write tool calls.
# Receives JSON on stdin with { tool_input: { file_path: "..." } }

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Skip if no file path extracted
[ -z "$FILE_PATH" ] && exit 0

# Skip if file doesn't exist (deleted, temp, etc.)
[ ! -f "$FILE_PATH" ] && exit 0

# Skip files outside this repo (submodules, other projects)
REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null)
case "$FILE_PATH" in
  "$REPO_ROOT"/*) ;;
  *) exit 0 ;;
esac

# Stage the file
git add "$FILE_PATH" 2>/dev/null

exit 0
