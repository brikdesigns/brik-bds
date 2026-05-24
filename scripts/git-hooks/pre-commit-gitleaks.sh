#!/usr/bin/env bash
# Pre-commit hook: scan staged content for leaked secrets via gitleaks.
#
# DEPRECATED 2026-05-24 — gitleaks now runs via Husky's .husky/pre-commit
# (auto-installed by `npm install` via the package.json `prepare` script).
# This standalone script is kept only for environments without Husky or
# legacy clones that already symlinked it.
#
# Do NOT run scripts/install-hooks.sh — it would overwrite Husky's hook
# and lose any non-gitleaks checks Husky also runs.
#
# Bypass (use sparingly, with intent):
#   git commit --no-verify
#
# Bypassing is itself a signal — log it. Pre-commit is one of three layers
# (pre-commit + GitHub push protection + secret scanning). All three matter.

set -euo pipefail

# Emit deprecation notice on stderr so legacy symlink users see it on every commit.
echo "note: scripts/git-hooks/pre-commit-gitleaks.sh is deprecated. Husky (.husky/pre-commit) is now canonical; runs gitleaks the same way." >&2

if ! command -v gitleaks >/dev/null 2>&1; then
  echo "pre-commit: gitleaks not installed — run: brew install gitleaks" >&2
  exit 1
fi

# --staged scans the staged diff against the Brik-extended ruleset.
# --no-banner keeps the hook output tight.
# --redact ensures any finding is shown without echoing the matched secret.
# Resolve repo root so the hook works from any working directory.
repo_root=$(git rev-parse --show-toplevel)
config_arg=""
if [ -f "$repo_root/.gitleaks.toml" ]; then
  config_arg="--config $repo_root/.gitleaks.toml"
fi
gitleaks protect --staged --redact --no-banner --verbose $config_arg
