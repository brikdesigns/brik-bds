#!/usr/bin/env bash
# install-hooks.sh — DEPRECATED 2026-05-24.
#
# This script predates the Husky migration. Husky now manages all git hooks
# in this repo (see `.husky/pre-commit`) and is auto-installed by
# `npm install` via the `prepare` script in package.json. Running this
# script would clobber Husky's hook with a gitleaks-only one, losing any
# additional checks Husky coordinates.
#
# If you reached this script via the README: the README has been updated
# (PR landing 2026-05-24). Pull main and the install-hooks.sh step is gone.
#
# Canonical setup is now just:
#   git clone ...
#   cd brik-bds
#   npm install      # Husky auto-installs .husky/pre-commit (gitleaks runs on commit)

set -euo pipefail

echo "✗ scripts/install-hooks.sh is DEPRECATED." >&2
echo "  Husky (.husky/pre-commit) now manages git hooks; auto-installed via 'npm install'." >&2
echo "  Running this script would overwrite Husky's hook with a gitleaks-only one." >&2
echo "  No action needed — Husky is already wired up if you've run 'npm install'." >&2
exit 1

# Legacy implementation retained below for reference; unreachable after the exit 1 above.
REPO_ROOT="$(git rev-parse --show-toplevel)"
HOOK_TARGET="../../scripts/git-hooks/pre-commit-gitleaks.sh"
HOOK_LINK="$REPO_ROOT/.git/hooks/pre-commit"

if ! command -v gitleaks >/dev/null 2>&1; then
  echo "✗ gitleaks not on PATH — install first:" >&2
  echo "    brew install gitleaks" >&2
  exit 1
fi

force=0
if [ "${1:-}" = "--force" ]; then
  force=1
fi

if [ -e "$HOOK_LINK" ] && [ "$force" -ne 1 ]; then
  current=$(readlink "$HOOK_LINK" 2>/dev/null || echo "<regular file>")
  if [ "$current" = "$HOOK_TARGET" ]; then
    echo "✓ pre-commit hook already wired to gitleaks (no change)."
    exit 0
  fi
  echo "✗ $HOOK_LINK already exists (points to: $current)" >&2
  echo "  Re-run with --force to replace, or remove it first." >&2
  exit 1
fi

ln -sf "$HOOK_TARGET" "$HOOK_LINK"
echo "✓ Installed gitleaks pre-commit hook → $HOOK_LINK"
echo "  To bypass on a single commit (sparingly): git commit --no-verify"
