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

# diff_pins_package <package> <version>
#
# Reads a unified diff on stdin. Returns 0 when an added line pins <package> to
# <version> (exact, `^` or `~`) — i.e. the PR bumps the dependency to the very
# release propagate is about to open. This catches the bump an agent opened by
# hand on a `task/*` branch, which existing_bump_pr's branch-name match cannot
# see: brikdesigns#1734 (agent) and #1738 (propagate) were the same 0.192.0
# bump (#2633).
diff_pins_package() {
  local package="$1" version="$2"
  [ -n "$package" ] && [ -n "$version" ] || return 1
  grep -Eq "^\+[[:space:]]*\"${package}\":[[:space:]]*\"[~^]?${version//./\\.}\"[[:space:]]*,?[[:space:]]*$"
}

# superseded_bump_prs <version> <pr_list_cmd...>
#
# <pr_list_cmd> prints `<headRefName><TAB><url>` per OPEN PR, as for
# existing_bump_pr. Echoes the URL of every open npm-track propagate PR
# (bds-update/*-v<x.y.z>) whose version is OLDER than <version>. Once a newer
# bump is open, an older one is an obsolete diff against the same lockfile
# lines; left open it reads as a conflict (#2633). Never echoes <version>
# itself or a newer one. A failing query echoes nothing.
superseded_bump_prs() {
  local version="$1"
  shift
  [ -n "$version" ] || return 0
  local head url old
  while IFS=$'\t' read -r head url; do
    case "$head" in
      bds-update/*-v*)
        old="${head##*-v}"
        [[ "$old" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || continue
        [ "$old" = "$version" ] && continue
        if [ "$(printf '%s\n%s\n' "$old" "$version" | sort -V | tail -n1)" = "$version" ]; then
          echo "$url"
        fi
        ;;
    esac
  done < <("$@" 2>/dev/null)
  return 0
}

# is_patch_bump <from> <to>
#
# Returns 0 when <to> is a newer patch of the same major.minor as <from>
# (0.192.1 → 0.192.2). Minor, major, downgrade, equal, and any prerelease or
# malformed version return 1. propagate uses it to decide whether a consumer's
# version-freeze label may be applied without a human (#2633, option a).
is_patch_bump() {
  local from="$1" to="$2" fmaj fmin fpat
  [[ "$from" =~ ^([0-9]+)\.([0-9]+)\.([0-9]+)$ ]] || return 1
  fmaj="${BASH_REMATCH[1]}"; fmin="${BASH_REMATCH[2]}"; fpat="${BASH_REMATCH[3]}"
  [[ "$to" =~ ^([0-9]+)\.([0-9]+)\.([0-9]+)$ ]] || return 1
  [ "${BASH_REMATCH[1]}" = "$fmaj" ] && [ "${BASH_REMATCH[2]}" = "$fmin" ] \
    && [ "$((10#${BASH_REMATCH[3]}))" -gt "$((10#$fpat))" ]
}
