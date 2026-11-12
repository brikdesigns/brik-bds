#!/usr/bin/env bash
# Contract gate for lib/self-update.sh (brik-bds#2736).
#
# The unattended bds-propagate LaunchAgent runs propagate.sh from the primary
# checkout. If that checkout is behind origin/main it must run the NEWER script
# (case 1), and a checkout it cannot safely update must exit non-zero rather
# than run stale (cases 3-5).
#
# Load-bearing assertion: case 1 prints VERSION=new from a clone whose own
# working copy still holds VERSION=old. A run that merely "succeeded" would not
# prove the update engaged — only the new output does. Case 2 (up to date) must
# print VERSION=old, so the stub cannot be passing by always printing "new".
#
# No network: a local bare repo is the remote. Unset per brik-bds#1539.
#
# Run: bash scripts/test/test-propagate-self-update.sh

set -u
unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE GIT_COMMON_DIR GIT_NAMESPACE \
      GIT_OBJECT_DIRECTORY GIT_ALTERNATE_OBJECT_DIRECTORIES

LIBDIR="$(cd "$(dirname "$0")/.." && pwd)/lib"
[ -f "$LIBDIR/self-update.sh" ] || { echo "lib not found at $LIBDIR"; exit 1; }

PASS=0; FAIL=0
check() { # label want got
  if [ "$2" = "$3" ]; then PASS=$((PASS+1)); echo "  ✓ $1"
  else FAIL=$((FAIL+1)); echo "  ✗ $1"; echo "      want: [$2]"; echo "      got:  [$3]"; fi
}

TMPROOT="$(mktemp -d "${TMPDIR:-/tmp}/brik-selfupdate-test-XXXXXXXX")"
trap 'rm -rf "$TMPROOT"' EXIT

G() { git -c user.email=t@t -c user.name=t -c commit.gpgsign=false "$@"; }

# A stub propagate.sh that wires the real lib the way propagate.sh does.
stub() { # version
  cat <<STUB
#!/bin/bash
set -euo pipefail
source "$LIBDIR/self-update.sh"
DIR="\$(cd "\$(dirname "\$0")/.." && pwd)"
ORIG=("\$@")
propagate_self_update "\$DIR" origin main "\$0" "\${ORIG[@]}" || exit 1
echo VERSION=$1
STUB
}

fixture() { # name → sets REPO (clone, at v-old) and ORIGIN_WT (a writer clone)
  local n="$1"
  git init -q --bare -b main "$TMPROOT/$n.git"
  git clone -q "$TMPROOT/$n.git" "$TMPROOT/$n-writer" 2>/dev/null
  mkdir -p "$TMPROOT/$n-writer/scripts"
  stub old > "$TMPROOT/$n-writer/scripts/propagate.sh"
  ( cd "$TMPROOT/$n-writer" && G add -A && G commit -qm old && G push -q origin HEAD:main )
  git clone -q "$TMPROOT/$n.git" "$TMPROOT/$n-primary" 2>/dev/null
  REPO="$TMPROOT/$n-primary"; WRITER="$TMPROOT/$n-writer"
}
publish_new() { ( cd "$WRITER" && stub new > scripts/propagate.sh && G commit -qam new && G push -q origin HEAD:main ); }
run() { ( cd "$REPO" && bash scripts/propagate.sh --auto 2>&1 ); echo "rc=$?"; }

echo "1. behind + clean → runs the NEW script"
fixture behind; publish_new
out="$(run)"
check "prints VERSION=new" "1" "$(printf '%s\n' "$out" | grep -c '^VERSION=new$')"
check "exit 0" "1" "$(printf '%s\n' "$out" | grep -c '^rc=0$')"
check "checkout fast-forwarded" "$(git -C "$WRITER" rev-parse HEAD)" "$(git -C "$REPO" rev-parse HEAD)"

echo "2. up to date → runs as-is (VERSION=old, no ff)"
fixture current
out="$(run)"
check "prints VERSION=old" "1" "$(printf '%s\n' "$out" | grep -c '^VERSION=old$')"

echo "3. behind + dirty → non-zero, does NOT run stale"
fixture dirty; publish_new
echo x >> "$REPO/scripts/propagate.sh"
out="$(run)"
check "no VERSION line" "0" "$(printf '%s\n' "$out" | grep -c '^VERSION=')"
check "non-zero exit" "0" "$(printf '%s\n' "$out" | grep -c '^rc=0$')"

echo "4. diverged → non-zero"
fixture div; publish_new
( cd "$REPO" && echo y > local.txt && G add -A && G commit -qm local )
out="$(run)"
check "no VERSION line" "0" "$(printf '%s\n' "$out" | grep -c '^VERSION=')"
check "non-zero exit" "0" "$(printf '%s\n' "$out" | grep -c '^rc=0$')"

echo "5. behind + off main → non-zero"
fixture off; publish_new
( cd "$REPO" && git checkout -q -b side )
out="$(run)"
check "no VERSION line" "0" "$(printf '%s\n' "$out" | grep -c '^VERSION=')"
check "non-zero exit" "0" "$(printf '%s\n' "$out" | grep -c '^rc=0$')"

echo "6. fetch fails → non-zero"
fixture nofetch
git -C "$REPO" remote set-url origin "$TMPROOT/does-not-exist.git"
out="$(run)"
check "non-zero exit" "0" "$(printf '%s\n' "$out" | grep -c '^rc=0$')"

echo; echo "$PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ]
