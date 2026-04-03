#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# BDS Token PR Checklist
#
# Run before raising any PR that touches a token file, theme file,
# component CSS, or consuming project stylesheet.
#
# Usage (from any BDS-consuming project root, or from brik-bds/ itself):
#   ./brik-bds/scripts/pr-checklist.sh          # consuming project
#   ./scripts/pr-checklist.sh                    # from brik-bds root
#
# Exit codes:
#   0 = all automated checks passed (manual steps printed for review)
#   1 = one or more automated checks failed
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

# ── Resolve BDS root ──────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BDS_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PROJECT_ROOT="$(pwd)"

# ── Colours ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
DIM='\033[2m'
RESET='\033[0m'

PASS="${GREEN}✓${RESET}"
FAIL="${RED}✗${RESET}"
WARN="${YELLOW}!${RESET}"

ERRORS=0

echo ""
echo -e "${BOLD}BDS Token PR Checklist${RESET}"
echo -e "${DIM}────────────────────────────────────────────────────────${RESET}"
echo ""

# ─────────────────────────────────────────────────────────────────────────────
# SECTION 1 — Automated checks
# ─────────────────────────────────────────────────────────────────────────────

echo -e "${BOLD}Automated checks${RESET}"
echo ""

# 1a. BDS token lint (component CSS — runs from brik-bds root)
printf "  Checking BDS component CSS (lint-tokens)... "
if node "$BDS_ROOT/scripts/lint-tokens.js" --errors-only > /tmp/bds-lint-out.txt 2>&1; then
  echo -e "$PASS"
else
  echo -e "$FAIL"
  echo ""
  cat /tmp/bds-lint-out.txt | sed 's/^/    /'
  echo ""
  ERRORS=$((ERRORS + 1))
fi

# 1b. Consuming project token audit (if token-audit.sh exists at project root)
if [ -f "$PROJECT_ROOT/scripts/token-audit.sh" ] && [ "$PROJECT_ROOT" != "$BDS_ROOT" ]; then
  printf "  Checking consuming project tokens (token-audit)... "
  if bash "$PROJECT_ROOT/scripts/token-audit.sh" > /tmp/project-audit-out.txt 2>&1; then
    echo -e "$PASS"
  else
    echo -e "$FAIL"
    echo ""
    cat /tmp/project-audit-out.txt | sed 's/^/    /'
    echo ""
    ERRORS=$((ERRORS + 1))
  fi
fi

# 1c. Check theme files for raw hex in Tier 2 (semantic) section
THEME_FILES=()
while IFS= read -r -d '' f; do
  THEME_FILES+=("$f")
done < <(find "$PROJECT_ROOT/src" -name "theme-*.css" -print0 2>/dev/null || true)

if [ ${#THEME_FILES[@]} -gt 0 ]; then
  printf "  Checking theme files for raw hex in semantic section... "
  HEX_VIOLATIONS=0
  for theme in "${THEME_FILES[@]}"; do
    # Look for hex values that appear after the TIER 2 comment marker
    if awk '/TIER 2/,EOF' "$theme" 2>/dev/null | grep -qE ':\s*#[0-9a-fA-F]{3,8}\s*;'; then
      HEX_VIOLATIONS=$((HEX_VIOLATIONS + 1))
      OFFENDERS=$(awk '/TIER 2/,EOF' "$theme" | grep -nE ':\s*#[0-9a-fA-F]{3,8}\s*;' | sed 's/^/    /')
      echo -e "$FAIL"
      echo ""
      echo -e "    ${RED}Raw hex in Tier 2 of $theme:${RESET}"
      echo "$OFFENDERS"
      echo ""
    fi
  done
  if [ "$HEX_VIOLATIONS" -eq 0 ]; then
    echo -e "$PASS"
  else
    ERRORS=$((ERRORS + 1))
  fi
fi

# ── Automated result ──────────────────────────────────────────────────────────
echo ""
if [ "$ERRORS" -gt 0 ]; then
  echo -e "  ${RED}${BOLD}$ERRORS automated check(s) failed. Fix before continuing.${RESET}"
  echo ""
  exit 1
else
  echo -e "  ${GREEN}All automated checks passed.${RESET}"
fi

# ─────────────────────────────────────────────────────────────────────────────
# SECTION 2 — Manual checks (printed for reviewer)
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo -e "${DIM}────────────────────────────────────────────────────────${RESET}"
echo -e "${BOLD}Manual checks — complete before marking PR ready${RESET}"
echo ""
echo -e "${BOLD}  Author${RESET}"
echo -e "  ${DIM}[ ]${RESET} PR diff is one concern (theme file, component, submodule sync — not all three)"
echo -e "  ${DIM}[ ]${RESET} Every semantic token references a primitive via var() — no raw hex in Tier 2"
echo -e "  ${DIM}[ ]${RESET} Token used in correct category:"
echo -e "       ${DIM}page-*${RESET} → page backgrounds only"
echo -e "       ${DIM}background-*${RESET} → UI element fills"
echo -e "       ${DIM}color-system-*${RESET} → status/error/success only"
echo -e "       ${DIM}color-department-*${RESET} → department chips only"
echo ""
echo -e "${BOLD}  Reviewer${RESET}"
echo -e "  ${DIM}[ ]${RESET} DevTools → Computed Styles → no raw hex on:"
echo -e "       ${DIM}primary button background${RESET}"
echo -e "       ${DIM}page background${RESET}"
echo -e "       ${DIM}body text color${RESET}"
echo -e "  ${DIM}[ ]${RESET} If font families changed: open ★ Font Audit theme in Storybook — heading/body/label visually distinct"
echo -e "  ${DIM}[ ]${RESET} If spacing changed: eyeball padding/gap on affected components"
echo -e "  ${DIM}[ ]${RESET} If BDS submodule synced: spot-check one component that uses changed tokens"
echo ""
echo -e "${DIM}Reference: brik-bds/docs/TOKEN-PR-CHECKLIST.md${RESET}"
echo ""
