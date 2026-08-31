#!/usr/bin/env bash
# Locks release_tag_target_advances (brik-llm#2948) — the check that stops
# propagate.sh minting a release tag that does not advance past the newest one.
#
# The 2026-08-31 run tagged `bds-2026-08-31` at f491e78d, which was an ANCESTOR
# of `bds-2026-08-30.1` and the exact commit already carrying `bds-2026-08-30`.
# Cause: `git tag -a "$TAG"` with no commit-ish tagged the stale local HEAD,
# while every other step of the run reads origin/<branch>. Nothing else in the
# script would have caught it — the collision loop only checks whether the NAME
# is free, and a tag on an old commit pushes and resolves perfectly well. Only
# the missing `workflows` App permission stopped it landing.
#
# The ancestor case is the regression; the equal case is the same bug when the
# checkout is exactly one release behind, and the descendant + no-tags cases are
# here so a guard that simply always refuses cannot pass this file.
#
# What this does NOT prove: that propagate passes $LOCAL_HEAD rather than HEAD.
# That is a one-line call-site read (`git_signed tag -a "$TAG" "$LOCAL_HEAD"`),
# not something a hermetic test can assert without running the whole agent.
#
# Hermetic: a throwaway git repo under $TMPDIR. No network, no gh.
#
# Run: bash scripts/lib/tests/test-release-tag-guard.sh

set -u

# A git hook exports GIT_DIR, and GIT_DIR beats directory discovery — without
# this every git call below would operate on the caller's real repository
# (brik-bds#1672 / brik-llm#1619).
unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE GIT_COMMON_DIR GIT_NAMESPACE \
      GIT_OBJECT_DIRECTORY GIT_ALTERNATE_OBJECT_DIRECTORIES

LIB="$(cd "$(dirname "$0")/.." && pwd)/release-tag-guard.sh"
[ -f "$LIB" ] || { echo "release-tag-guard.sh not found at $LIB"; exit 1; }
# shellcheck source=scripts/lib/release-tag-guard.sh
source "$LIB"

FIXTURE="$(mktemp -d "${TMPDIR:-/tmp}/release-tag-guard.XXXXXX")"
# shellcheck disable=SC2329,SC2317  # invoked via trap; SC2317 on apt shellcheck, SC2329 on 0.11
cleanup() { [ -n "${FIXTURE:-}" ] && [ -d "$FIXTURE" ] && rm -rf "$FIXTURE"; }
trap cleanup EXIT

PASS=0; FAIL=0; FAILED_CASES=()
check() {
  local label="$1" want="$2" got="$3"
  if [ "$want" = "$got" ]; then PASS=$((PASS+1)); echo "  ✓ $label";
  else FAIL=$((FAIL+1)); FAILED_CASES+=("$label"); echo "  ✗ $label"; echo "      want: [$want]"; echo "      got:  [$got]"; fi
}

# ── Fixture: three commits, tags added per case ──────────────────────────────
cd "$FIXTURE" || exit 1
git init --quiet -b main .
git config user.email test@brik.local
git config user.name  "Guard Test"
git config commit.gpgsign false
git config tag.gpgsign false
git config tag.forceSignAnnotated false

commit() { git commit --quiet --allow-empty -m "$1"; git rev-parse HEAD; }
C1="$(commit one)"
C2="$(commit two)"
C3="$(commit three)"

echo "release_tag_target_advances — no release tags yet"
check "first release has nothing to advance past" "advances" \
  "$(release_tag_target_advances "$C1" && echo advances || echo refuses)"

# Annotated, like propagate's own tags — ^{commit} in the guard has to deref it.
git tag -a bds-2026-08-30 -m "release" "$C2"

echo "release_tag_target_advances — one release tag at C2"
check "ancestor of the newest tag is refused (the #2948 regression)" "refuses" \
  "$(release_tag_target_advances "$C1" && echo advances || echo refuses)"
check "the newest tag's own commit is refused (nothing new released)" "refuses" \
  "$(release_tag_target_advances "$C2" && echo advances || echo refuses)"
check "a commit past the newest tag advances" "advances" \
  "$(release_tag_target_advances "$C3" && echo advances || echo refuses)"

# The suffixed name the collision loop mints sorts BEFORE the unsuffixed one
# lexically while being the newer release — so newest_release_tag must order by
# creatordate, not by name.
sleep 1
git tag -a bds-2026-08-30.1 -m "release" "$C3"

echo "newest_release_tag — suffixed same-day tag"
check "picks the newer .1 tag, not the lexically-later bare name" "bds-2026-08-30.1" \
  "$(newest_release_tag)"
check "C2 is now behind the newest tag and is refused" "refuses" \
  "$(release_tag_target_advances "$C2" && echo advances || echo refuses)"

echo ""
if [ "$FAIL" -gt 0 ]; then
  echo "FAIL — $PASS passed, $FAIL failed"
  for c in "${FAILED_CASES[@]}"; do echo "  - $c"; done
  exit 1
fi
echo "PASS — $PASS assertions"
