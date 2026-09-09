#!/usr/bin/env bash
# Locks the exact-pin contract on propagate.sh's npm track (#2335).
#
# The bug: `npm install --save <pkg>@<v>` writes `^<v>`. brikdesigns'
# `lint:bds-pin` fails the build on a range spec, so the propagator opened a PR
# its own consumer's CI rejected — every bump. brikdesigns#1286 and #1302 each
# needed the byte-identical manual follow-up commit, and in both the lockfile
# had already resolved the exact version; only the manifest disagreed.
#
# What this proves: every `npm install` in propagate.sh that WRITES a consumer
# manifest carries `--save-exact`. Not just the one line known to be wrong today
# — a second install site added later without the flag reintroduces the bug at a
# new address, and a grep for one hard-coded line would not see it.
#
# What this does NOT prove: that npm honours the flag. That is npm's contract,
# needs the registry, and is not this repo's to test.
#
# Hermetic: reads the script as text. No npm, no network, no consumer repo.
#
# Run: bash scripts/lib/tests/test-propagate-save-exact.sh

set -u
SCRIPT="$(cd "$(dirname "$0")/../../" && pwd)/propagate.sh"
[ -f "$SCRIPT" ] || { echo "propagate.sh not found at $SCRIPT"; exit 1; }

PASS=0; FAIL=0; FAILED_CASES=()
check() {
  local label="$1" want="$2" got="$3"
  if [ "$want" = "$got" ]; then PASS=$((PASS+1)); echo "  ✓ $label";
  else FAIL=$((FAIL+1)); FAILED_CASES+=("$label"); echo "  ✗ $label"; echo "      want: [$want]"; echo "      got:  [$got]"; fi
}

# The predicate under test: print every manifest-writing npm install line that
# is MISSING --save-exact. Empty output = contract holds.
#
# `--save` / `-S` is what makes an install write package.json; a bare
# `npm install` (no args) or `npm ci` restores from the lock and is not a
# manifest write, so neither is flagged.
unpinned_install_lines() {
  grep -nE 'npm install[^|]*(--save\b|[[:space:]]-S\b)' "$1" \
    | grep -vE '\-\-save-exact\b' \
    || true
}

echo "── the real propagate.sh pins exact on every manifest-writing install ──"

OFFENDERS="$(unpinned_install_lines "$SCRIPT")"
check "no npm install --save without --save-exact" "" "$OFFENDERS"

# The flag has to be on the npm track specifically — the line that bumps a
# consumer's package.json. If the grep above passes because the install line was
# deleted or renamed, this catches it.
NPM_TRACK="$(grep -cE 'npm install --save --save-exact "\$BDS_PACKAGE_NAME@\$BDS_VERSION"' "$SCRIPT")"
check "npm track installs BDS with --save-exact" "1" "$NPM_TRACK"

echo "── negative control: the checker must SEE the bug it exists to catch ──"

# A permissive checker passes everything, including the pre-fix script. Prove it
# fails on the exact line that shipped the two manual follow-up commits.
FIXTURE="$(mktemp)"
trap 'rm -f "$FIXTURE"' EXIT
cat > "$FIXTURE" <<'PREFIX'
  info "Running npm install $BDS_PACKAGE_NAME@$BDS_VERSION..."
  if ! npm install --save "$BDS_PACKAGE_NAME@$BDS_VERSION" --silent 2>&1 | tail -5; then
PREFIX

PRE_FIX="$(unpinned_install_lines "$FIXTURE")"
if [ -n "$PRE_FIX" ]; then
  PASS=$((PASS+1)); echo "  ✓ pre-fix line is flagged (checker is not vacuous)"
else
  FAIL=$((FAIL+1)); FAILED_CASES+=("pre-fix line is flagged")
  echo "  ✗ pre-fix line is flagged — the checker cannot see the original bug"
fi

# A restore-only install must NOT be flagged, or the gate reds on every
# unrelated `npm ci` and gets switched off.
cat > "$FIXTURE" <<'RESTORE'
  npm ci --silent
  npm install --silent
RESTORE
NOISE="$(unpinned_install_lines "$FIXTURE")"
check "restore-only installs are not flagged" "" "$NOISE"

echo ""
echo "  propagate-save-exact: ${PASS} passed, ${FAIL} failed"
if [ "$FAIL" -gt 0 ]; then
  printf '\n  ✗ %s\n' "${FAILED_CASES[@]}"
  exit 1
fi
