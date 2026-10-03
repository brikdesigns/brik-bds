#!/usr/bin/env bash
# Locks binding-check.sh (#2720) — the check propagate.sh runs before it opens a
# BDS bump, so a consumer that still overrides a pre-ADR-043 name gets a draft
# PR that names each override instead of a ready one that merges green.
#
# The rule itself is covered by scripts/check-bds-binding.test.mjs. This covers
# the seam: which copy of the bin runs, how its exit code maps to clean /
# overrides / not run, and what lands in the PR body.
#
# Hermetic: a fake package dir holding the real bin and a generated bridge, fake
# consumers, a throwaway git repo. No npm, no gh, no network.
#
# Run: bash scripts/lib/tests/test-binding-check.sh

set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
LIB="$HERE/../binding-check.sh"
BIN="$HERE/../../check-bds-binding.mjs"
PROPAGATE="$HERE/../../propagate.sh"
[ -f "$LIB" ] || { echo "binding-check.sh not found at $LIB"; exit 1; }
# shellcheck source=scripts/lib/binding-check.sh
source "$LIB"

PASS=0; FAIL=0; FAILED_CASES=()
check() {
  local label="$1" want="$2" got="$3"
  if [ "$want" = "$got" ]; then PASS=$((PASS+1)); echo "  ✓ $label";
  else FAIL=$((FAIL+1)); FAILED_CASES+=("$label"); echo "  ✗ $label"; echo "      want: [$want]"; echo "      got:  [$got]"; fi
}

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

# A package dir shaped like node_modules/@brikdesigns/bds: the real bin under
# scripts/, a bridge over the bin's 500-name floor under dist/.
PKG="$TMP/pkg"
mkdir -p "$PKG/scripts" "$PKG/dist"
cp "$BIN" "$PKG/scripts/"
{
  echo ':root {'
  echo '  --text-primary: var(--bds-text-primary);'
  for i in $(seq 1 500); do echo "  --filler-$i: var(--bds-filler-$i);"; done
  echo '}'
} > "$PKG/dist/prefix-bridge.css"
echo ':root { --bds-text-primary: #000; }' > "$PKG/dist/tokens.css"
: > "$PKG/dist/styles.css"

consumer() {
  local dir="$TMP/$1"; mkdir -p "$dir/src"
  printf '%s\n' "$2" > "$dir/src/theme.css"
  echo "$dir"
}

# ─── binding_check ──────────────────────────────────────────────────────────
CLEAN=$(consumer clean '.a { --bds-text-primary: #123; color: var(--text-primary); }')
out=$(binding_check "$CLEAN" "$PKG"); rc=$?
check "clean consumer returns 0" "0" "$rc"
check "clean consumer echoes nothing" "" "$out"

DIRTY=$(consumer dirty $'.a {\n  --text-primary: #123;\n}')
out=$(binding_check "$DIRTY" "$PKG"); rc=$?
check "override returns 1" "1" "$rc"
check "override is one bare line, no colour or bullet" \
  "src/theme.css:2: --text-primary: #123 — set --bds-text-primary instead (old-name-override)" "$out"

OLD="$TMP/old-release"; mkdir -p "$OLD"
out=$(binding_check "$CLEAN" "$OLD"); rc=$?
check "release without the bin returns 2, never clean" "2" "$rc"
check "missing bin names the issue" "1" "$(printf '%s' "$out" | grep -c 'predates brik-bds#2720')"

BROKEN="$TMP/broken"; mkdir -p "$BROKEN/scripts" "$BROKEN/dist"
cp "$BIN" "$BROKEN/scripts/"
echo ':root { --text-primary: var(--bds-text-primary); }' > "$BROKEN/dist/prefix-bridge.css"
out=$(binding_check "$CLEAN" "$BROKEN"); rc=$?
check "an errored check returns 2" "2" "$rc"
check "an errored check echoes its reason" "1" "$(printf '%s' "$out" | grep -c 'bridged names')"

# ─── materialize_consumer_sources ───────────────────────────────────────────
REPO="$TMP/repo"
git init -q "$REPO"
mkdir -p "$REPO/src" "$REPO/docs"
echo '.a { --text-primary: #123; }' > "$REPO/src/theme.css"
echo 'not scanned' > "$REPO/docs/readme.md"
git -C "$REPO" add -A
git -C "$REPO" -c user.name=t -c user.email=t@t -c commit.gpgsign=false commit -qm init
materialize_consumer_sources "$REPO" HEAD "$TMP/mat"
check "extracts src/ from the ref" "1" "$([ -f "$TMP/mat/src/theme.css" ] && echo 1 || echo 0)"
check "extracts only src/ when it exists" "0" "$([ -e "$TMP/mat/docs" ] && echo 1 || echo 0)"
check "the extracted tree is checkable" "1" "$(binding_check "$TMP/mat" "$PKG" >/dev/null; echo $?)"

NOSRC="$TMP/nosrc"
git init -q "$NOSRC"
echo '.a {}' > "$NOSRC/site.css"
git -C "$NOSRC" add -A
git -C "$NOSRC" -c user.name=t -c user.email=t@t -c commit.gpgsign=false commit -qm init
materialize_consumer_sources "$NOSRC" HEAD "$TMP/mat2"
check "no src/ extracts the whole tree" "1" "$([ -f "$TMP/mat2/site.css" ] && echo 1 || echo 0)"

# ─── binding_check_pr_note ──────────────────────────────────────────────────
note=$(binding_check_pr_note 0 "")
check "clean note says passed" "1" "$(printf '%s' "$note" | grep -c '^\*\*Binding check passed')"

note=$(binding_check_pr_note 1 $'a.css:1: x\nb.css:2: y')
check "override note says draft with the count" "1" "$(printf '%s' "$note" | grep -c 'Opened as a draft — 2 old-name')"
check "override note lists each violation" "2" "$(printf '%s' "$note" | grep -c '\.css:[0-9]')"

many=$(for i in $(seq 1 45); do echo "f.css:$i: --x"; done)
note=$(binding_check_pr_note 1 "$many")
check "override note caps the list at 40" "40" "$(printf '%s' "$note" | grep -c '^f\.css:')"
check "override note counts what it cut" "1" "$(printf '%s' "$note" | grep -c 'and 5 more')"

note=$(binding_check_pr_note 2 "no bin")
check "not-run note carries the reason" "**Binding check not run:** no bin" "$note"

# ─── propagate.sh still wires it ────────────────────────────────────────────
# A green test proves nothing if propagate stops calling the lib.
check "propagate sources binding-check.sh" "1" "$(grep -c 'lib/binding-check.sh"' "$PROPAGATE")"
check "real run checks the installed release" "1" \
  "$(grep -c 'binding_check "\$worktree_path" "\$worktree_path/node_modules/\$BDS_PACKAGE_NAME"' "$PROPAGATE")"
check "overrides open the PR as a draft" "1" "$(grep -c 'draft=(--draft)' "$PROPAGATE")"
check "the note lands in the PR body" "1" "$(grep -c 'binding_check_pr_note "\$binding_status"' "$PROPAGATE")"
check "dry-run runs the check too" "1" "$(grep -c '^    dry_run_binding_check ' "$PROPAGATE")"

echo ""
echo "  $PASS passed, $FAIL failed"
if [ "$FAIL" -gt 0 ]; then
  printf '  failed: %s\n' "${FAILED_CASES[@]}"
  exit 1
fi
