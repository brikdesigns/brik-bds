#!/usr/bin/env bash
# pr-labels.sh — resolve the project-tracking labels a PR should carry.
#
# GitHub does NOT copy a linked issue's labels onto its PR, so PRs opened by
# pr-task.sh were born label-less and needed a manual `gh pr edit` to reach
# parity — #1969, #1974 and #1978 each did, before #1979 filed it.
#
# Pure functions only: no `gh`, no git, no network. The caller fetches the repo
# label list and each issue's labels and hands them in, which is what makes
# scripts/__tests__/test-pr-labels.sh able to drive every branch offline.
#
# Sourced by scripts/pr-task.sh. Ported from the equivalent inline block in
# brik-client-portal/scripts/pr-task.sh, keeping its four hard-won fixes:
#
#   1. Existence-check EVERY label before handing it to `gh pr edit` — one
#      unknown name aborts the whole call, taking every other label with it.
#      Not hypothetical here: brik-bds has neither `enhancement` nor `bug`, so
#      an unchecked Type label would drop the inherited area:*/size:* too.
#   2. Never `gh … | grep -q`. Under `set -o pipefail`, `grep -q` exits on
#      first match and closes the pipe, `gh` dies with SIGPIPE (141), pipefail
#      propagates it, and a `!` flips a real match into a false rejection —
#      timing-dependent, so it failed intermittently (portal #1442). Capture
#      the list into a variable, then grep the variable.
#   3. Resolve the repo label list BEFORE any branch that needs it, or `set -u`
#      aborts on the unset variable when a flag was not passed.
#   4. A closing keyword is not the only way a PR references an issue, so read
#      refs off the rendered `Closes #N` / `Refs #N` block rather than
#      re-walking commits with a second, divergent pattern.

# ── Which label axes a PR inherits from its issue ────────────────────
# area: board tracking (pr-label-gate requires it). size: velocity reporting.
# theme: cross-cutting programme. NOT priority: — a PR has no priority of its
# own; it either lands or it doesn't. NOT meta: — `meta:agent-discovered`
# describes how the ISSUE was found, which says nothing about the PR.
PR_LABEL_INHERIT_RE='^(area|size|theme):'

# type_label_for_title <pr-title> — the Type label a conventional-commit prefix
# implies, or empty. Only feat/fix carry one; every other type (docs, chore,
# refactor, ci, test) has no Type label in any Brik repo's taxonomy.
type_label_for_title() {
  case "${1:-}" in
    feat*) printf 'enhancement' ;;
    fix*)  printf 'bug' ;;
    *)     printf '' ;;
  esac
}

# refs_from_issue_links <issue-links-block> — every issue REFERENCE in the block
# built by lib/issue-links.sh, one per line, sorted and deduped.
#
# Reads the RENDERED block on purpose. The block is what GitHub will parse out
# of the PR body, so inheriting off it means the labels and the linkage can
# never disagree — a second regex over the commit range would eventually drift
# from build_issue_links and inherit from an issue the PR does not reference.
#
# Emits the WHOLE reference — `#123`, `owner/repo#123`, `GH-123` — not the bare
# number (brik-llm#2450). Stripping the `owner/repo` prefix here made the caller
# read a cross-repo ref as local and inherit labels from whatever issue happens
# to carry that number in THIS repo. Callers split it with
# `issue_ref_number` / `issue_ref_repo`.
refs_from_issue_links() {
  printf '%s\n' "${1:-}" \
    | grep -oE '([A-Za-z0-9._-]+/[A-Za-z0-9._-]+)?#[0-9]+|GH-[0-9]+' \
    | sort -u || true
}

# issue_ref_number <ref> — the number, for any of the three reference shapes.
# `GH-123` carries no `#`, so a bare `${ref##*#}` returns it whole and
# `gh issue view GH-123` then fails.
issue_ref_number() {
  local ref="${1:-}"
  ref="${ref##*#}"
  printf '%s' "${ref#GH-}"
}

# issue_ref_repo <ref> — the `owner/repo` prefix, or empty for a same-repo ref.
# Empty is the signal to omit `--repo` and let `gh` use the cwd's repo.
issue_ref_repo() {
  local ref="${1:-}"
  case "$ref" in
    */*\#*) printf '%s' "${ref%\#*}" ;;
    *)      printf '' ;;
  esac
}

# label_known <label> <repo-labels> — is this label real in this repo?
label_known() {
  grep -qxF "${1:-}" <<< "${2:-}"
}

# inheritable_labels <issue-labels> — the subset of one issue's labels a PR
# inherits. Applies the axis policy only; the caller then existence-checks each
# survivor with label_known, because a label the issue has and this repo does
# not must be dropped rather than passed to `gh pr edit`. brik-llm uses `bug`
# where the portal uses `type:bug`, so a cross-repo taxonomy mismatch is the
# normal case, not an edge.
inheritable_labels() {
  printf '%s\n' "${1:-}" | grep -E "$PR_LABEL_INHERIT_RE" || true
}

# has_area_label <labels> — does this set satisfy pr-label-gate?
has_area_label() {
  printf '%s\n' "${1:-}" | grep -q '^area:'
}

# dedupe_labels <labels> — sorted, deduped, blank lines dropped. The shape
# `gh pr edit --add-label` wants, one per line.
dedupe_labels() {
  printf '%s\n' "${1:-}" | grep -v '^[[:space:]]*$' | sort -u || true
}

# ── CLI (never runs when sourced) ──────────────────────────────────
if [ "${BASH_SOURCE[0]:-}" = "${0:-}" ]; then
  type_label_for_title "${1:-}"
fi
