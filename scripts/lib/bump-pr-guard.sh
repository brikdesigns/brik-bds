#!/usr/bin/env bash
# bump-pr-guard.sh — refuse to open a second propagate PR for a bump that is
# already waiting on review in the consumer.
#
# Why this exists (#1918): propagate decides a consumer needs a PR by comparing
# the version pinned on origin/<base> against the release (propagate.sh's
# "$name already at $BDS_VERSION" check). An unmerged PR does not move
# origin/<base>, so the check still says "behind" the next morning — and the
# branch name is date-stamped (bds-update/<date>-v<version>), so nothing
# collides and a second identical PR opens. brikdesigns #981/#982 (v0.165.0)
# and #475/#476 (v0.93.2) are the two that landed; whichever went green first
# merged, and the other sat open with an obsolete diff reading like a conflict.
#
# Matching is on the branch-name SUFFIX — the version for the npm track, the
# BDS short SHA for the submodule track — because the date prefix is exactly
# what differs between the duplicate and the original.
#
# The PR query is injected as a command so the contract is testable without gh
# or network; propagate passes a real `gh pr list` invocation.

# existing_bump_pr <suffix> <pr_list_cmd...>
#
# <pr_list_cmd> must print one `<headRefName><TAB><url>` line per OPEN PR in the
# consumer. Echoes the URL of the first open PR whose head branch is a
# bds-update/* branch ending in <suffix>, and returns 0. Prints nothing and
# returns 1 when there is no such PR.
#
# A failing or unreachable query prints nothing and returns 1 — propagate then
# opens the PR as it always did. A duplicate PR is a triage cost; a bump that
# silently never opens because GitHub blipped is a missed release.
existing_bump_pr() {
  local suffix="$1"
  shift

  # An empty suffix would match every bds-update branch and block every bump.
  [ -n "$suffix" ] || return 1

  local head url
  while IFS=$'\t' read -r head url; do
    [ -n "$head" ] || continue
    case "$head" in
      bds-update/*"$suffix")
        echo "$url"
        return 0
        ;;
    esac
  done < <("$@" 2>/dev/null)

  return 1
}
