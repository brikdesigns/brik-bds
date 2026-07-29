#!/usr/bin/env bash
# prepush-guards.sh — pure decision logic for .husky/pre-push.
#
# Sourced by the hook. brik-bds#1547.
#
# Why a lib: a hook cannot be exercised without pushing, so anything inline there
# is untested — the same reason lib/overlap-filters.sh exists, and the mtime
# staleness check that fired three times in one session on 2026-07-29 sat inline
# for months with nothing able to catch it.
#
# Companion: scripts/check-install-freshness.mjs holds the lock-vs-installed
# predicate (JSON, so it lives in node and has its own vitest test).

# shellcheck disable=SC2148  # sourced

# Is this push carrying ONLY tags?
#
# Reads pre-push's stdin, whose contract is one line per pushed ref:
#
#   <local ref> <local sha> <remote ref> <remote sha>
#
# Verified empirically on 2026-07-29 with a fixture repo — annotated tag,
# lightweight tag, and a mixed `git push origin main v9.9.7`:
#
#   refs/heads/main    d9344cde… refs/heads/main    cbf61f79…
#   refs/tags/v9.9.7   fae49d9e… refs/tags/v9.9.7   0000000…
#
# A tags-only push publishes no new commits — the commits it points at were
# gated when they were pushed, and CI ran on them. `git tag v0.X.Y && git push
# origin v0.X.Y` (docs/RELEASE.md) is the release path, and blocking it on a
# stale node_modules is what "killed a propagation tag push" means in #1547.
#
# A MIXED push is not tags-only: it carries commits, so the gates must run.
# Empty stdin (a `git push` with nothing to send, or a caller that provides no
# refs) is not tags-only either — never skip a gate on absence of information.
#
# Returns 0 when every line's REMOTE ref is under refs/tags/.
push_is_tags_only() {
  local local_ref local_sha remote_ref rest seen=0
  while read -r local_ref local_sha remote_ref rest; do
    [ -n "$local_ref" ] || continue
    seen=1
    case "$remote_ref" in
      refs/tags/*) : ;;
      *) return 1 ;;
    esac
  done
  [ "$seen" -eq 1 ]
}
