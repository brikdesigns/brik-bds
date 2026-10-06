#!/usr/bin/env bash
# Contract gate for scripts/lib/identity-guard.sh (#1841).
#
# `git -C "" config user.name Test` is a silent no-op on the path argument — it
# writes to whatever repo is current. Worktrees share the primary's .git/config,
# so one such call pollutes every checkout at once, and nothing notices until a
# commit reaches a base branch with the wrong author. Probed 2026-08-02: exit 0,
# and the fixture's name came back from `git config --local user.name`. The same
# probe showed `git -C "" init` REINITIALISES the live repo at exit 0, while the
# path form `git init ""` fails 128 — which is why the fixtures were switched.
#
# Two halves under test, because the leak has two ends:
#   - check_commit_identity  — the pre-commit backstop. Would have caught
#     `68ab0ac` on brik-bds' main (brikdesigns/brik-bds#1634).
#   - assert_throwaway_repo  — the fixture-side refusal that stops the write.
#
# The load-bearing case is the LIVE-REPO one: assert_throwaway_repo must refuse a
# path that resolves outside $TMPDIR, and must refuse an empty path outright. A
# test that only proved "it accepts a sandbox" would pass against the bug.
#
# Hermetic: throwaway repos only. The unset below is per #1672 / brik-bds#1539 —
# a test invoked from a git hook inherits GIT_DIR, and GIT_DIR beats directory
# discovery, so every fixture `git` call would drive the caller's repository.
#
# Run: bash scripts/test/test-identity-guard.sh

set -u
unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE GIT_COMMON_DIR GIT_NAMESPACE \
      GIT_OBJECT_DIRECTORY GIT_ALTERNATE_OBJECT_DIRECTORIES
# The effective-layer case below injects config through GIT_CONFIG_*, so a value
# inherited from the caller would silently join every other case's identity.
unset GIT_CONFIG_COUNT GIT_CONFIG_GLOBAL GIT_CONFIG_SYSTEM GIT_CONFIG_NOSYSTEM

LIB="$(cd "$(dirname "$0")/.." && pwd)/lib/identity-guard.sh"
[ -f "$LIB" ] || { echo "lib not found at $LIB"; exit 1; }
# shellcheck source=/dev/null
source "$LIB"

PASS=0; FAIL=0; FAILED_CASES=()
assert_eq() {
  local label="$1" want="$2" got="$3"
  if [ "$want" = "$got" ]; then PASS=$((PASS+1)); echo "  ✓ $label";
  else FAIL=$((FAIL+1)); FAILED_CASES+=("$label"); echo "  ✗ $label"; echo "      want: [$want]"; echo "      got:  [$got]"; fi
}

TMPROOT="$(mktemp -d "${TMPDIR:-/tmp}/brik-identity-guard-XXXXXXXX")"
case "$TMPROOT" in
  /*/brik-identity-guard-*) : ;;
  *) echo "refusing to run: TMPROOT looks wrong ($TMPROOT)"; exit 1 ;;
esac

# A repo outside $TMPDIR, standing in for the live checkout. $HOME is not under
# $TMPDIR on any machine this runs on, so it exercises the escape branch without
# needing the real repo.
OUTSIDE="$HOME/.brik-identity-guard-outside-$$"
rm -rf "$OUTSIDE"; mkdir -p "$OUTSIDE"
# shellcheck disable=SC2329,SC2317  # invoked via the trap; see the sweep suite
cleanup() { rm -rf "$TMPROOT" "$OUTSIDE"; }
trap cleanup EXIT
git init -q -b main "$OUTSIDE"

SANDBOX="$TMPROOT/sandbox"
git init -q -b main "$SANDBOX"

# ── check_commit_identity ────────────────────────────────────────────
# Run it inside a repo OUTSIDE $TMPDIR: the guard deliberately stays quiet in a
# throwaway repo, so a sandbox fixture would report a false pass on every case.
identity_verdict() {
  local name="$1" email="$2"
  ( cd "$OUTSIDE" || exit 9
    git config --local user.name "$name"
    git config --local user.email "$email"
    if check_commit_identity 2>/dev/null; then echo allowed; else echo refused; fi )
}

echo "── check_commit_identity: fixture identities are refused ──"
assert_eq "t@example.com (the brik-bds 68ab0ac author)" "refused" \
  "$(identity_verdict "Test" "t@example.com")"
assert_eq "reserved domain, real-looking name" "refused" \
  "$(identity_verdict "Ada Lovelace" "ada@example.org")"
assert_eq "bare fixture name, real domain" "refused" \
  "$(identity_verdict "Test" "nick@brikdesigns.com")"
# This repo's own sweep fixture uses guardtest@example.com — caught by domain,
# not by name, since the exact-match name list deliberately excludes "guardtest".
assert_eq "guardtest@example.com (the sweep fixture identity)" "refused" \
  "$(identity_verdict "guardtest" "guardtest@example.com")"

echo "── check_commit_identity: real identities pass ──"
assert_eq "a real committer" "allowed" \
  "$(identity_verdict "Nick Stanerson" "nick@brikdesigns.com")"
assert_eq "GitHub noreply address" "allowed" \
  "$(identity_verdict "Nick Stanerson" "149011263+nstaner@users.noreply.github.com")"
# The fixture-name match is exact so it cannot swallow real people.
assert_eq "a person whose name starts with Test" "allowed" \
  "$(identity_verdict "Testa Nguyen" "testa@brikdesigns.com")"

echo "── check_commit_identity: reads the EFFECTIVE identity, not one layer ──"
# The point of `git config user.email` over `git config --local user.email`: the
# guard has to fire however the pollution arrived. GIT_CONFIG_* is a layer that
# is neither --local nor --global, and the local layer is explicitly emptied
# first, so a guard that read only --local would report allowed here.
assert_eq "polluted from a non-local layer, local layer clean" "refused" \
  "$( cd "$OUTSIDE" || exit 9
      git config --local --unset user.name 2>/dev/null || true
      git config --local --unset user.email 2>/dev/null || true
      export GIT_CONFIG_COUNT=2 \
             GIT_CONFIG_KEY_0=user.name  GIT_CONFIG_VALUE_0=Test \
             GIT_CONFIG_KEY_1=user.email GIT_CONFIG_VALUE_1=t@example.com
      if check_commit_identity 2>/dev/null; then echo allowed; else echo refused; fi )"

echo "── check_commit_identity: escape hatches ──"
assert_eq "BRIK_ALLOW_TEST_IDENTITY=1 overrides" "allowed" \
  "$( cd "$OUTSIDE" || exit 9
      git config --local user.name Test; git config --local user.email t@example.com
      if BRIK_ALLOW_TEST_IDENTITY=1 check_commit_identity 2>/dev/null; then echo allowed; else echo refused; fi )"
assert_eq "quiet inside a throwaway repo" "allowed" \
  "$( cd "$SANDBOX" || exit 9
      git config --local user.name Test; git config --local user.email t@example.com
      if check_commit_identity 2>/dev/null; then echo allowed; else echo refused; fi )"

# ── assert_throwaway_repo ────────────────────────────────────────────
# It exits on refusal, so run each case in a subshell and read the status.
throwaway_verdict() {
  ( assert_throwaway_repo "$1" "probe" >/dev/null 2>&1 ) && echo accepted || echo refused
}

echo "── assert_throwaway_repo: the live-repo escapes ──"
assert_eq "empty path (the \`git -C ''\` bug)" "refused" "$(throwaway_verdict "")"
assert_eq "a repo outside \$TMPDIR" "refused" "$(throwaway_verdict "$OUTSIDE")"
assert_eq "a path that does not exist" "refused" "$(throwaway_verdict "$TMPROOT/nope")"
assert_eq "a directory that is not a repo" "refused" \
  "$(mkdir -p "$TMPROOT/plain"; throwaway_verdict "$TMPROOT/plain")"

echo "── assert_throwaway_repo: real sandboxes are accepted ──"
assert_eq "a git repo under \$TMPDIR" "accepted" "$(throwaway_verdict "$SANDBOX")"
# test-new-task-flag-order.sh guards a BARE fixture origin, and a bare repo has no
# work tree — a guard written against `--show-toplevel` would reject it.
assert_eq "a bare git repo under \$TMPDIR" "accepted" \
  "$(git init -q --bare "$TMPROOT/bare.git"; throwaway_verdict "$TMPROOT/bare.git")"

echo "── the two init forms differ, which is why the fixtures use the path form ──"
# The fixtures were switched from `git -C "$X" init` to `git init "$X"`. That is
# only worth doing if the -C form really is the silent one; assert both halves so
# a future "simplification" back to -C fails here.
assert_eq "\`git init ''\` fails outright" "failed" \
  "$( cd "$SANDBOX" || exit 9
      if git init -q "" >/dev/null 2>&1; then echo ok; else echo failed; fi )"
assert_eq "\`git -C '' init\` silently succeeds against the current repo" "ok" \
  "$( cd "$SANDBOX" || exit 9
      if git -C "" init -q >/dev/null 2>&1; then echo ok; else echo failed; fi )"

echo "── the guard never writes to the repo it is inspecting ──"
# check_commit_identity is read-only; prove it, because a guard that mutates the
# config it is policing would be its own leak.
BEFORE="$(git -C "$OUTSIDE" config --local --list | sort)"
( cd "$OUTSIDE" && check_commit_identity >/dev/null 2>&1 || true )
AFTER="$(git -C "$OUTSIDE" config --local --list | sort)"
assert_eq "local config is unchanged after a check" "same" \
  "$([ "$BEFORE" = "$AFTER" ] && echo same || echo changed)"

echo "── negative control: a permissive guard must FAIL the cases above ──"
# Rebuild the pre-guard world — the refusal returns 0 — and require the fixture
# identity to come back allowed. Without this, a guard stubbed to `return 0`
# would pass every assertion above and the suite would report green.
PERMISSIVE="$TMPROOT/identity-guard-permissive.sh"
sed 's/^  return 1$/  return 0/' "$LIB" > "$PERMISSIVE"
if ! grep -qE '^  return 0$' "$PERMISSIVE" || [ "$(grep -cE '^  return 1$' "$PERMISSIVE")" != "0" ]; then
  echo "  ✗ could not rebuild the permissive guard — the refusal moved;"
  echo "    update this test's sed before trusting the cases above."
  FAIL=$((FAIL+1)); FAILED_CASES+=("negative control could not be built")
else
  assert_eq "permissive guard: t@example.com slips through" "allowed" \
    "$( cd "$OUTSIDE" || exit 9
        git config --local user.name Test; git config --local user.email t@example.com
        # shellcheck source=/dev/null
        source "$PERMISSIVE"
        if check_commit_identity 2>/dev/null; then echo allowed; else echo refused; fi )"
fi

echo ""
echo "  identity-guard: $PASS passed, $FAIL failed"
if [ "$FAIL" -gt 0 ]; then
  printf '  failed: %s\n' "${FAILED_CASES[@]}"
  exit 1
fi
