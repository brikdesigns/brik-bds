#!/usr/bin/env bash
# self-update.sh — make an unattended propagate run execute the origin/main
# copy of propagate.sh, not whatever the primary checkout happens to hold.
#
# Why (brik-bds#2736): the com.brikdesigns.bds-propagate LaunchAgent runs
# scripts/propagate.sh straight from the primary checkout. The script reads
# release data from origin/main but never updated itself, so a checkout that
# fell behind ran an OLD copy of its own logic — on 2026-09-29, 10 commits
# behind, #2634 (merged at c0912d84) would have stayed dormant until someone
# pulled by hand.
#
# propagate_self_update <repo_dir> <remote> <branch> <script> [args...]
#   - up to date, or ahead of <remote>/<branch>  → returns 0, run as-is
#   - behind, on <branch>, clean tree            → fast-forwards, then execs
#                                                  the updated <script> once
#   - behind but dirty, off-branch or diverged   → returns 1 (caller exits
#                                                  non-zero so launchd flags it)
#   - fetch fails                                → returns 1 (freshness unknown)
# A second pass sees PROPAGATE_SELF_UPDATED=1 and returns 0, so a bad ff can
# never loop.

propagate_self_update() {
  local repo="$1" remote="$2" branch="$3" script="$4"
  shift 4

  [ "${PROPAGATE_SELF_UPDATED:-}" = "1" ] && return 0

  if ! git -C "$repo" fetch --quiet "$remote" "$branch"; then
    echo "self-update: cannot fetch $remote/$branch — not running a copy of unknown age" >&2
    return 1
  fi

  local ref="$remote/$branch"
  # Up to date or ahead: origin's tip is already contained in HEAD.
  git -C "$repo" merge-base --is-ancestor "$ref" HEAD && return 0

  if ! git -C "$repo" merge-base --is-ancestor HEAD "$ref"; then
    echo "self-update: $repo has diverged from $ref — refusing to run a stale or forked copy" >&2
    return 1
  fi

  local cur
  cur="$(git -C "$repo" symbolic-ref --quiet --short HEAD || true)"
  if [ "$cur" != "$branch" ]; then
    echo "self-update: $repo is behind $ref but on '${cur:-detached HEAD}', not '$branch' — refusing to run stale" >&2
    return 1
  fi
  if [ -n "$(git -C "$repo" status --porcelain)" ]; then
    echo "self-update: $repo is behind $ref and has local changes — refusing to run stale" >&2
    return 1
  fi

  if ! git -C "$repo" merge --ff-only --quiet "$ref"; then
    echo "self-update: fast-forward to $ref failed" >&2
    return 1
  fi
  echo "self-update: fast-forwarded $repo to $(git -C "$repo" rev-parse --short HEAD); re-executing" >&2
  PROPAGATE_SELF_UPDATED=1 exec bash "$script" "$@"
}
