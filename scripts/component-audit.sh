#!/usr/bin/env bash
set -euo pipefail

# BDS Component Audit
# Scans all components and reports completeness against conventions.
# Informational only — does not block commits or builds.
#
# Usage:
#   ./scripts/component-audit.sh              # Full report
#   ./scripts/component-audit.sh --summary    # Counts only
#   ./scripts/component-audit.sh TextInput    # Audit one component

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BDS_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
COMP_DIR="$BDS_ROOT/components/ui"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
DIM='\033[2m'
NC='\033[0m'

SUMMARY_ONLY=false
FILTER=""

for arg in "$@"; do
  case "$arg" in
    --summary) SUMMARY_ONLY=true ;;
    --help|-h)
      echo "Usage: ./scripts/component-audit.sh [--summary] [ComponentName]"
      echo ""
      echo "  (default)    Full audit of all components"
      echo "  --summary    Show pass/warn/fail counts only"
      echo "  [name]       Audit a single component (e.g. TextInput)"
      exit 0
      ;;
    -*) echo "Unknown option: $arg"; exit 1 ;;
    *)  FILTER="$arg" ;;
  esac
done

# ── Component classification ──
# Input: user-editable form fields (need full interactive state coverage)
# Interactive: clickable/toggleable (need hover/focus/active/disabled)
# Display: visual-only (need story, lower bar for states)

INPUT_COMPONENTS="TextInput TextArea Select SearchInput AddressInput"
INTERACTIVE_COMPONENTS="Button FilterButton Switch Checkbox Radio Accordion TabBar Pagination"
# Everything else is Display

classify() {
  local name="$1"
  for c in $INPUT_COMPONENTS; do [[ "$c" = "$name" ]] && echo "input" && return; done
  for c in $INTERACTIVE_COMPONENTS; do [[ "$c" = "$name" ]] && echo "interactive" && return; done
  echo "display"
}

# ── State checks ──

has_css_file() {
  ls "$COMP_DIR/$1/"*.css 2>/dev/null | head -1 > /dev/null 2>&1
}

has_stories() {
  ls "$COMP_DIR/$1/"*.stories.tsx 2>/dev/null | head -1 > /dev/null 2>&1
}

css_has_state() {
  local comp="$1" state="$2"
  grep -q ":${state}" "$COMP_DIR/$comp/"*.css 2>/dev/null
}

tsx_has_state() {
  local comp="$1" state="$2"
  grep -qi "$state" "$COMP_DIR/$comp/$comp.tsx" 2>/dev/null
}

# ── Audit a single component ──

P=0 W=0 F=0  # pass/warn/fail counters

audit_component() {
  local name="$1"
  local type
  type=$(classify "$name")
  local issues=()
  local warnings=()

  # Every component needs a story
  if ! has_stories "$name"; then
    issues+=("Missing Storybook story")
  fi

  if [[ "$type" = "input" ]]; then
    # Input components: need CSS file with full state coverage
    if ! has_css_file "$name"; then
      issues+=("Missing CSS file (no interactive states)")
    else
      css_has_state "$name" "hover"       || issues+=("CSS missing :hover state")
      css_has_state "$name" "focus"        || css_has_state "$name" "focus-visible" || issues+=("CSS missing :focus state")
      css_has_state "$name" "disabled"     || issues+=("CSS missing :disabled state")
      css_has_state "$name" "placeholder"  || warnings+=("CSS missing ::placeholder styling")
    fi
    # Check for error prop support in TSX
    grep -q 'error' "$COMP_DIR/$name/$name.tsx" 2>/dev/null || warnings+=("No error prop support")

  elif [[ "$type" = "interactive" ]]; then
    # Interactive: need hover + focus + disabled (in CSS or TSX)
    local has_hover=false has_focus=false has_disabled=false
    if has_css_file "$name"; then
      css_has_state "$name" "hover" && has_hover=true
      (css_has_state "$name" "focus" || css_has_state "$name" "focus-visible") && has_focus=true
      css_has_state "$name" "disabled" && has_disabled=true
    fi
    # Also check TSX for JS-based state handling
    tsx_has_state "$name" "hover"    && has_hover=true
    tsx_has_state "$name" "focus"    && has_focus=true
    tsx_has_state "$name" "disabled" && has_disabled=true

    $has_hover    || warnings+=("No :hover state (CSS or JS)")
    $has_focus    || warnings+=("No :focus state (CSS or JS)")
    $has_disabled || warnings+=("No :disabled state (CSS or JS)")
  fi
  # Display components: story check only (already done above)

  # ── Output ──
  local total_issues=$(( ${#issues[@]} + ${#warnings[@]} ))

  if [[ $total_issues -eq 0 ]]; then
    ((P++))
    if [[ "$SUMMARY_ONLY" = false ]]; then
      echo -e "  ${GREEN}PASS${NC}  ${name} ${DIM}(${type})${NC}"
    fi
  elif [[ ${#issues[@]} -gt 0 ]]; then
    ((F++))
    if [[ "$SUMMARY_ONLY" = false ]]; then
      echo -e "  ${RED}FAIL${NC}  ${name} ${DIM}(${type})${NC}"
      for issue in "${issues[@]}"; do
        echo -e "        ${RED}!${NC} $issue"
      done
      for w in "${warnings[@]}"; do
        echo -e "        ${YELLOW}~${NC} $w"
      done
    fi
  else
    ((W++))
    if [[ "$SUMMARY_ONLY" = false ]]; then
      echo -e "  ${YELLOW}WARN${NC}  ${name} ${DIM}(${type})${NC}"
      for w in "${warnings[@]}"; do
        echo -e "        ${YELLOW}~${NC} $w"
      done
    fi
  fi
}

# ── Main ──

echo ""
echo "========================================="
echo "  BDS Component Audit"
echo "  $(date '+%Y-%m-%d %H:%M')"
echo "========================================="
echo ""

if [[ -n "$FILTER" ]]; then
  if [[ ! -d "$COMP_DIR/$FILTER" ]]; then
    echo -e "  ${RED}Component not found: $FILTER${NC}"
    exit 1
  fi
  audit_component "$FILTER"
else
  # Audit all, grouped by type (failures first)
  if [[ "$SUMMARY_ONLY" = false ]]; then
    echo -e "  ${CYAN}── Input Components ──${NC}"
  fi
  for name in $INPUT_COMPONENTS; do
    [[ -d "$COMP_DIR/$name" ]] && audit_component "$name"
  done

  if [[ "$SUMMARY_ONLY" = false ]]; then
    echo ""
    echo -e "  ${CYAN}── Interactive Components ──${NC}"
  fi
  for name in $INTERACTIVE_COMPONENTS; do
    [[ -d "$COMP_DIR/$name" ]] && audit_component "$name"
  done

  if [[ "$SUMMARY_ONLY" = false ]]; then
    echo ""
    echo -e "  ${CYAN}── Display Components ──${NC}"
  fi
  for dir in "$COMP_DIR"/*/; do
    name=$(basename "$dir")
    type=$(classify "$name")
    [[ "$type" = "display" ]] && audit_component "$name"
  done
fi

echo ""
echo "-----------------------------------------"
echo -e "  ${GREEN}$P pass${NC}  ${YELLOW}$W warn${NC}  ${RED}$F fail${NC}  ($(( P + W + F )) total)"
echo "-----------------------------------------"
echo ""

if [[ $F -gt 0 ]]; then
  echo -e "  ${DIM}Fix FAILs first — these are missing critical interactive states.${NC}"
  echo -e "  ${DIM}WARNs are nice-to-haves that improve polish.${NC}"
  echo ""
fi
