#!/usr/bin/env bash
# release-tag-guard.sh — refuse a release tag that does not advance past the
# newest one.
#
# Why this exists (brik-llm#2948): propagate's tag step called
# `git tag -a "$TAG"` with no commit-ish, so it tagged the LOCAL checkout's HEAD.
# Every other part of the run deliberately reads origin/<branch> instead —
# the agent never pulls brik-bds first, which is why the preflight sources the
# version and the propagated commit from $BDS_REMOTE/$BDS_BRANCH. The tag step
# was the one place that still trusted the working copy.
#
# On 2026-08-31 the checkout was two days stale, so `bds-2026-08-31` named
# f491e78d — an ANCESTOR of the previous tag `bds-2026-08-30.1`, and the exact
# commit already carrying `bds-2026-08-30`. A duplicate release tag under a new
# name. It only failed to land because the App token was missing the `workflows`
# permission; with that fixed, nothing else would have caught it.
#
# Passing the commit explicitly is the fix. This guard is the backstop, because
# "the tag went backwards" is silent at every other layer: the collision loop
# only checks whether the NAME is taken, and a tag on an old commit pushes and
# resolves perfectly well.
#
# Both functions read the repository in the current working directory, so a test
# only needs to build a fixture repo and cd into it — no network, no gh.

# newest_release_tag
#
# Echoes the most recently CREATED bds-* tag, or nothing when there are none.
#
# Sorted by creatordate, not by name: the suffixed form (bds-2026-08-30.1) is
# what the collision loop produces on a second run in one day, and it sorts
# before the unsuffixed name lexically while being the newer release.
#
# for-each-ref --count, not `git tag -l | head -1`: propagate runs under
# `set -o pipefail`, where head closing the pipe can SIGPIPE git and abort the
# run on an exit code that means nothing.
newest_release_tag() {
  git for-each-ref --count=1 --sort=-creatordate \
      --format='%(refname:short)' 'refs/tags/bds-*'
}

# release_tag_target_advances <commit-ish>
#
# Returns 0 when <commit-ish> is new ground — it is not the newest bds-* tag's
# commit and not behind it — and the caller may tag it.
# Returns 1 when it is AT or BEHIND the newest bds-* tag, i.e. tagging it would
# mint a duplicate or a backwards release.
#
# No tags yet returns 0: the first release has nothing to advance past.
#
# `--is-ancestor` is reflexive, and here that is wanted rather than the trap it
# was in brik-llm#1616 — a target EQUAL to the newest tag's commit means nothing
# new was released, which is exactly the duplicate this refuses.
release_tag_target_advances() {
  local target="$1" newest
  newest="$(newest_release_tag)"
  [ -z "$newest" ] && return 0
  # ^{commit} so an annotated tag compares as its commit, not its tag object.
  if git merge-base --is-ancestor "$target" "${newest}^{commit}" 2>/dev/null; then
    return 1
  fi
  return 0
}
