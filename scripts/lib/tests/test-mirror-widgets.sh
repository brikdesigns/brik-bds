#!/usr/bin/env bash
# Locks sync_mirrored_widgets (#1587) — the step that keeps a propagate bump PR
# green instead of red.
#
# brik-client-portal's #1583 parity gate asserts its scripts/mockup-shared/ copy
# is byte-identical to the INSTALLED package, so a bump touching a widget
# invalidates the mirror. propagate.sh committed only package.json + the
# lockfile, so it opened a failing PR and waited for a human
# (brikdesigns/brik-client-portal#2585 was fixed by hand).
#
# What this does NOT prove: that a real release produces a green PR end to end.
# That needs a published version, a real npm install and the consumer's CI —
# none of it hermetic. This covers the copy decision, which is the part that
# was missing.
#
# Hermetic: fixture directories, a stub list command, no npm, no network.
#
# Run: bash scripts/lib/tests/test-mirror-widgets.sh

set -u
LIB="$(cd "$(dirname "$0")/.." && pwd)/mirror-widgets.sh"
[ -f "$LIB" ] || { echo "mirror-widgets.sh not found at $LIB"; exit 1; }
# shellcheck source=scripts/lib/mirror-widgets.sh
source "$LIB"

PASS=0; FAIL=0; FAILED_CASES=()
check() {
  local label="$1" want="$2" got="$3"
  if [ "$want" = "$got" ]; then PASS=$((PASS+1)); echo "  ✓ $label";
  else FAIL=$((FAIL+1)); FAILED_CASES+=("$label"); echo "  ✗ $label"; echo "      want: [$want]"; echo "      got:  [$got]"; fi
}

TMPROOT="$(mktemp -d "${TMPDIR:-/tmp}/brik-mirror-widgets-XXXXXXXX")"
trap 'rm -rf "$TMPROOT"' EXIT
case "$TMPROOT" in
  /*/brik-mirror-widgets-*) : ;;
  *) echo "refusing to run: TMPROOT looks wrong ($TMPROOT)"; exit 1 ;;
esac

PKG="@brikdesigns/bds"
WIDGET_SUBPATH="components/ui/BrikDevBar/widgets"

# The list command propagate passes in — stubbed to the real script's output shape.
list_stub() { printf 'devbar.js\nfeedback-widget.js\ninspect-widget.js\nevents-widget.js\n'; }
export -f list_stub 2>/dev/null || true

build_consumer() {
  local root="$1" mirror_content="$2" installed_content="$3"
  rm -rf "$root"; mkdir -p "$root/scripts/mockup-shared" "$root/node_modules/$PKG/$WIDGET_SUBPATH"
  printf '%s' "$mirror_content"    > "$root/scripts/mockup-shared/feedback-widget.js"
  printf '%s' "$installed_content" > "$root/node_modules/$PKG/$WIDGET_SUBPATH/feedback-widget.js"
}

echo "── a drifted mirror is re-synced and reported ──"
C="$TMPROOT/drifted"
build_consumer "$C" 'OLD widget' 'NEW widget'
OUT="$(sync_mirrored_widgets "$C" "$PKG" bash -c 'list_stub' 2>/dev/null)"
check "reports the path it changed" "scripts/mockup-shared/feedback-widget.js" "$OUT"
check "the mirror now matches the installed copy" "NEW widget" \
  "$(cat "$C/scripts/mockup-shared/feedback-widget.js")"

echo "── an already-identical mirror is left alone ──"
C="$TMPROOT/same"
build_consumer "$C" 'SAME widget' 'SAME widget'
OUT="$(sync_mirrored_widgets "$C" "$PKG" bash -c 'list_stub' 2>/dev/null)"
check "reports nothing (no empty commit)" "" "$OUT"

echo "── a consumer with no mirror is unaffected ──"
C="$TMPROOT/nomirror"
rm -rf "$C"; mkdir -p "$C/node_modules/$PKG/$WIDGET_SUBPATH"
printf 'NEW' > "$C/node_modules/$PKG/$WIDGET_SUBPATH/feedback-widget.js"
OUT="$(sync_mirrored_widgets "$C" "$PKG" bash -c 'list_stub' 2>/dev/null)"; RC=$?
check "reports nothing" "" "$OUT"
check "and succeeds" "0" "$RC"
check "no mirror directory invented" "no" \
  "$([ -d "$C/scripts/mockup-shared" ] && echo yes || echo no)"

echo "── a widget the consumer does NOT already mirror is not introduced ──"
C="$TMPROOT/partial"
build_consumer "$C" 'OLD' 'NEW'
# Installed carries a widget the mirror has never held.
printf 'BRAND NEW' > "$C/node_modules/$PKG/$WIDGET_SUBPATH/events-widget.js"
sync_mirrored_widgets "$C" "$PKG" bash -c 'list_stub' >/dev/null 2>&1
check "events-widget.js not added to the mirror" "no" \
  "$([ -f "$C/scripts/mockup-shared/events-widget.js" ] && echo yes || echo no)"

echo "── missing node_modules is a warning, not a crash ──"
C="$TMPROOT/noinstall"
rm -rf "$C"; mkdir -p "$C/scripts/mockup-shared"
printf 'OLD' > "$C/scripts/mockup-shared/feedback-widget.js"
ERROUT="$(sync_mirrored_widgets "$C" "$PKG" bash -c 'list_stub' 2>&1 >/dev/null)"; RC=$?
check "succeeds" "0" "$RC"
check "says why it skipped" "yes" \
  "$(printf '%s' "$ERROUT" | grep -q 'no installed widgets' && echo yes || echo no)"
check "leaves the stale mirror untouched" "OLD" \
  "$(cat "$C/scripts/mockup-shared/feedback-widget.js")"

echo ""
echo "  $PASS passed, $FAIL failed"
if [ "$FAIL" -gt 0 ]; then
  printf '  failed: %s\n' "${FAILED_CASES[@]}"
  exit 1
fi
