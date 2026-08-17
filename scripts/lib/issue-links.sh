#!/usr/bin/env bash
# issue-links.sh — resolve the `Closes #N` / `Refs #N` lines for a PR body.
#
# Sourced by pr-task.sh before the base-sync and the push. Closes brik-bds#1882.
#
# Why this exists: GitHub parses closing keywords from the PR BODY only — never
# from the title, never from commit messages. 16 of the last 21 merged feat/fix
# PRs in this repo carried no body reference, five of them putting `(#N)` in the
# title and nowhere else. `closingIssuesReferences` came back empty every time,
# so `merge-reconcile.yml` flagged the fallout after merge and the linkage was
# restored by hand. The detector existed; the preventer did not.
#
# Two polarities, because the two sources mean different things:
#   - a commit body's closing keyword is an explicit "this completes #N"  → Closes
#   - a bare #N in a commit subject is only "this is the work for #N"     → Refs
# Promoting a subject ref to `Closes` would auto-close umbrellas and half-done
# issues as a side effect — the failure bump-pr-closing-keyword-guard.yml rules
# 3 and 4 exist for. `Refs #N` still satisfies pr-issue-link-gate.yml and still
# shows on the issue's timeline; upgrade it by hand when the PR really does
# finish the issue.
#
# The pure decision logic lives at the top so a test can exercise it without a
# network or a repo — same reason lib/pr-path-overlap.sh and lib/base-freshness.sh
# are shaped this way. pr-task.sh refuses to run from a clean main, so anything
# inline there is untestable.
#
# Usage (sourced):
#   source scripts/lib/issue-links.sh
#   ISSUE_LINKS=$(resolve_issue_links "origin/main..HEAD" "$REASON")
#   issue_link_required "$PR_TITLE" && [ -z "$ISSUE_LINKS" ] && exit 1
#
# Run standalone against the current branch:
#   bash scripts/lib/issue-links.sh origin/main..HEAD

# shellcheck disable=SC2148  # sourced

# Minimum characters for an `Issue-exempt:` reason. Must match MIN_REASON_CHARS
# in .github/workflows/pr-issue-link-gate.yml — a shorter reason opens a PR the
# gate then rejects.
ISSUE_LINK_MIN_REASON_CHARS=20

# ── Pure helpers (no network, no git) ──────────────────────────────

# GitHub's closing-keyword grammar, spelled as
# .github/workflows/pr-issue-link-gate.yml spells it (its `CLOSING`) and as
# bump-pr-closing-keyword-guard.yml spells it (its `KEYWORD`). All three read
# the same text and must not drift apart about what a live reference is.
_IL_CLOSING='close[sd]?|fix(e[sd])?|resolve[sd]?'

# `(^|[^[:alnum:]_])` is a portable word boundary. `\b` is a GNU extension that
# BSD grep (macOS, where this script is authored) leaves undefined, and without
# one "Renames prefixes #12" matches the `fixes` inside `prefixes` and silently
# resolves #12. The gate's regex uses `\b` and rejects that line, so an
# unbounded pattern here would have the script resolve a reference its own CI
# check does not recognise. Only the digits are kept, so the boundary character
# the group captures is discarded.
#
# `:? *#` (not ` +#`): `closes#123` with no space is a live reference to
# pr-issue-link-gate.yml and to bump-pr-closing-keyword-guard.yml alike. A
# resolver that skipped it would refuse to open a PR whose body the gate would
# have passed.
_IL_CLOSING_RE="(^|[^[:alnum:]_])(${_IL_CLOSING}):? *#[0-9]+"

# issue_refs_in_subjects <text> — every bare #N, one per line, unsorted.
# A conventional-commit subject carries the issue it is the work FOR.
issue_refs_in_subjects() {
  printf '%s\n' "${1:-}" | grep -oE '#[0-9]+' | tr -d '#' || true
}

# issue_refs_closed_in_bodies <text> — every #N under a closing keyword.
# Keyword-gated on purpose: scanning whole bodies for a bare #N would pick up
# issues merely mentioned in prose ("recurring: #1434, #1437") and close them.
issue_refs_closed_in_bodies() {
  printf '%s\n' "${1:-}" \
    | grep -oiE "$_IL_CLOSING_RE" \
    | grep -oE '[0-9]+' || true
}

# build_issue_links <subjects> <bodies> [exempt-reason] — the body block.
# Emits `Closes #N` for every ref a commit body closes, then `Refs #N` for every
# other ref the subjects mention, then the `Issue-exempt:` line if a reason was
# given. A ref appearing in both places is a Closes and never also a Refs.
build_issue_links() {
  local subjects="${1:-}" bodies="${2:-}" reason="${3:-}"
  local closing mention out=""

  closing=$(issue_refs_closed_in_bodies "$bodies" | sort -un || true)
  mention=$(comm -23 \
    <({ issue_refs_in_subjects "$subjects"; issue_refs_closed_in_bodies "$bodies"; } \
        | grep -E '^[0-9]+$' | sort -un || true) \
    <(printf '%s\n' "$closing" | grep -E '^[0-9]+$' | sort -un || true) || true)

  local ref
  for ref in $closing; do out="${out}Closes #${ref}"$'\n'; done
  for ref in $mention; do out="${out}Refs #${ref}"$'\n'; done
  [ -n "$reason" ] && out="${out}Issue-exempt: ${reason}"$'\n'
  printf '%s' "$out"
}

# issue_link_required <pr-title> — true when pr-issue-link-gate.yml is in scope.
# Mirrors the gate's IN_SCOPE_TITLE: `feat` and `fix` ship tracked work and must
# link; every other conventional type, and any non-conventional title, does not.
# `fixup:` and `feature:` are NOT in scope — same as the gate.
issue_link_required() {
  printf '%s' "${1:-}" | grep -qiE '^(feat|fix)(\([^)]*\))?!?: '
}

# issue_exempt_reason_ok <reason> — the hatch's reason half.
issue_exempt_reason_ok() {
  [ "${#1}" -ge "$ISSUE_LINK_MIN_REASON_CHARS" ]
}

# ── Git-reading wrapper ────────────────────────────────────────────

# resolve_issue_links <range> [exempt-reason] — build_issue_links over a commit
# range. --no-merges so a base-sync merge commit contributes nothing, consistent
# with every other range in pr-task.sh (#1001).
resolve_issue_links() {
  local range="$1" reason="${2:-}"
  build_issue_links \
    "$(git log --no-merges --format='%s' "$range")" \
    "$(git log --no-merges --format='%b' "$range")" \
    "$reason"
}

# ── CLI (never runs when sourced) ──────────────────────────────────
if [ "${BASH_SOURCE[0]:-}" = "${0:-}" ]; then
  resolve_issue_links "${1:-origin/main..HEAD}" "${2:-}"
fi
