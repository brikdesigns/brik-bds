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
# Two polarities, because the sources mean different things:
#   - a commit body's closing keyword is an explicit "this completes #N"  → Closes
#   - a bare #N in a commit subject is only "this is the work for #N"     → Refs
#   - a body's NON-closing keyword (`Part of`, `Refs`, `Related to`,
#     `Partial for`, `#N stays open`) says which issue without completing it → Refs
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
# THE INVARIANT (brik-llm#2450): this resolver must never be STRICTER than
# .github/workflows/pr-issue-link-gate.yml. It exists to pre-empt that gate, so
# a body the gate would accept and this resolves to nothing is a PR the
# sanctioned path cannot open at all — which is what happened three times
# landing brikdesigns/brik-llm#2442, whose consumer PRs carried
# `Part of brikdesigns/brik-llm#2442` and had to take the `--no-issue` hatch.
# The pressure that creates is the real cost: the cheap way out is retitling a
# `fix` as a `chore` to drop out of the gate's scope entirely.
#
# scripts/__tests__/test-issue-links.sh § "the grammars agree on a shared
# corpus" pins the invariant by EXTRACTING the gate's own regex from the
# workflow and running both over one corpus. Being conservative in the other
# direction is fine and deliberate — the gate only asks "is this linked", while
# this additionally decides Closes vs Refs.
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

# The REFERENCE grammar, spelled as .github/workflows/pr-issue-link-gate.yml
# spells it (its `REF`). Three shapes, and the prefix is the load-bearing one:
#
#   #123                      same-repo
#   brikdesigns/brik-llm#123  cross-repo — the canonical form for work tracked
#                             on another repo's umbrella
#   GH-123                    same-repo, the alternate form GitHub also parses
#
# `[A-Za-z0-9._-]` is JS `[\w.-]` written for ERE; `\w` is a GNU extension BSD
# grep (macOS, where this is authored) leaves undefined.
#
# THE PREFIX IS CARRIED, NEVER STRIPPED (brik-llm#2450). Collapsing
# `brikdesigns/brik-llm#2442` to `#2442` emits a link to brik-bds#2442 — a
# different issue, or none yet, and the mistake is invisible until this repo's
# numbering reaches it. Before this, `issue_refs_in_subjects` did exactly that:
# a subject carrying `(brikdesigns/brik-llm#2442)` rendered `Refs #2442`.
_IL_REF='([A-Za-z0-9._-]+/[A-Za-z0-9._-]+)?#[0-9]+|GH-[0-9]+'

# GitHub's closing-keyword grammar, spelled as pr-issue-link-gate.yml spells it
# (its `CLOSING`) and as bump-pr-closing-keyword-guard.yml spells it (its
# `KEYWORD`). All three read the same text and must not drift apart about what a
# live reference is.
_IL_CLOSING='close[sd]?|fix(e[sd])?|resolve[sd]?'

# The canonical NON-closing link forms, spelled as pr-issue-link-gate.yml spells
# them (its `LINKING`), per issue-style.md § "To disclaim completion". These
# record which issue a PR is for WITHOUT auto-closing it, and they are the form
# cross-repo umbrella work uses — `Part of brikdesigns/brik-llm#2442`.
#
# They resolve to a mention, never to a closing ref, no matter which keyword
# spelled them. That asymmetry is the whole point: the gate only asks "is this
# PR linked", while GitHub acts on `Closes`, and a partial PR must not close the
# umbrella it is one slice of (cross-repo CLAUDE.md § closing keywords).
_IL_LINKING='part[[:space:]]+of|refs?|related[[:space:]]+to|partial[[:space:]]+for'

# BOTH SCANS ARE LINE-ANCHORED (#2240). A keyword matched anywhere in a line
# cannot tell a DIRECTIVE from a QUOTATION, and the two are indistinguishable in
# review. Any commit that writes ABOUT issue linking — a postmortem, a doc fix,
# a change to this lib — trips it:
#
#   1. brik-client-portal#3550's body said "This does **not** close #2942".
#      GitHub parsed the `close #2942`, ignored the negation, and closed the
#      issue on merge. `staging` is that repo's default branch, so it was live.
#   2. #3556 — the PR that DOCUMENTED failure 1 — quoted the same phrase, and
#      the resolver emitted `Closes #2942` while demoting the issue the PR
#      actually completed to a `Refs`. Exactly backwards.
#   3. brikdesigns/brik-bds#2238, which added the linking forms below, quoted
#      "`Part of brikdesigns/brik-llm#2442`" as its own example and resolved the
#      quotation. It anchored the linking half and filed this one (#2240).
#
# Failure 2 is the structural one: the class of commit most likely to quote a
# keyword is the class fixing keyword handling.
#
# `^[[:space:]]*` — a trailer may be indented (git log's %b preserves it) but
# must still OPEN its line. `Closes #N` and `Part of #N` canonically ARE
# trailers on their own line (issue-style.md § `Closes #N`), so the anchor costs
# nothing real. Same rule brik-client-portal/scripts/lib/issue-refs.sh adopted.
#
# DELIBERATELY NOT MATCHED, and the direction of that choice matters:
#   - `- Closes #N` (markdown bullet)  — a list marker is not a trailer
#   - `See also: closes #N` (mid-line) — the failure class above
# Both UNDER-close rather than over-close. Under-closing is a one-click fix on
# the issue; over-closing silently shut #2942 and nobody noticed for hours.
# Widen it THEN, with the evidence — not pre-emptively.
#
# This makes the resolver more CONSERVATIVE than pr-issue-link-gate.yml, which
# matches a keyword anywhere in the body. That is the sanctioned direction (see
# THE INVARIANT above): the gate must never accept a body this refuses to open a
# PR for, and it does not — an anchored `Closes #N` still satisfies the gate's
# unanchored pattern. The reverse would be the #2450 defect.
#
# `:? *` (not ` +`): `closes#123` with no space is a live reference to
# pr-issue-link-gate.yml and to bump-pr-closing-keyword-guard.yml alike. A
# resolver that skipped it would refuse to open a PR whose body the gate would
# have passed.
_IL_CLOSING_RE="^[[:space:]]*(${_IL_CLOSING}):? *(${_IL_REF})"
_IL_LINKING_RE="^[[:space:]]*(${_IL_LINKING}):? *(${_IL_REF})"

# The one canonical form where the keyword TRAILS the number, spelled as
# pr-issue-link-gate.yml spells it (its `STAYS_OPEN`). It is a link the gate
# accepts, so a resolver blind to it refuses a PR the gate would have passed —
# the same false-refusal class as brik-llm#2450. It resolves to a mention, which
# is what "stays open" means. Line-anchored for the reason above.
_IL_STAYS_OPEN_RE="^[[:space:]]*#[0-9]+[[:space:]]+stays[[:space:]]+open"

# _il_refs_only <text> — keep just the reference tokens from a keyword match.
# Two passes rather than a capture group: BSD grep has no `-P` and no way to
# print a single group, so the keyword is matched first and the ref extracted
# from what survived.
_il_refs_only() {
  grep -oE "$_IL_REF" || true
}

# _il_sort_refs — dedupe and order a ref list: by `owner/repo` prefix, then
# NUMERICALLY within it. Plain `sort -u` orders #10 before #9, and plain
# `sort -un` cannot see a number at all once a ref carries a prefix — it read
# every `owner/repo#N` as 0 and collapsed them to one line. Splitting on `#`
# gives the prefix as field 1 and the number as field 2.
_il_sort_refs() {
  sort -u -t'#' -k1,1 -k2,2n || true
}

# issue_refs_in_subjects <text> — every reference, one per line, unsorted.
# A conventional-commit subject carries the issue it is the work FOR.
issue_refs_in_subjects() {
  printf '%s\n' "${1:-}" | _il_refs_only
}

# issue_refs_closed_in_bodies <text> — every ref under a CLOSING keyword.
# Keyword-gated on purpose: scanning whole bodies for a bare #N would pick up
# issues merely mentioned in prose ("recurring: #1434, #1437") and close them.
issue_refs_closed_in_bodies() {
  printf '%s\n' "${1:-}" | grep -oiE "$_IL_CLOSING_RE" | _il_refs_only
}

# issue_refs_linked_in_bodies <text> — every ref under a NON-closing keyword,
# plus the trailing-keyword `#N stays open` form.
# Same keyword gating, opposite polarity: these become `Refs`, never `Closes`.
issue_refs_linked_in_bodies() {
  local text="${1:-}"
  { printf '%s\n' "$text" | grep -oiE "$_IL_LINKING_RE" || true
    printf '%s\n' "$text" | grep -oiE "$_IL_STAYS_OPEN_RE" || true
  } | _il_refs_only
}

# build_issue_links <subjects> <bodies> [exempt-reason] — the body block.
# Emits `Closes <ref>` for every ref a commit body closes, then `Refs <ref>` for
# every other ref a subject mentions or a body links, then the `Issue-exempt:`
# line if a reason was given. A ref appearing in both places is a Closes and
# never also a Refs.
#
# `<ref>` already carries its own `#` and any `owner/repo` prefix, so it is
# interpolated whole — see _IL_REF on why re-adding a bare `#` is a bug.
build_issue_links() {
  local subjects="${1:-}" bodies="${2:-}" reason="${3:-}"
  local closing mention out=""

  # TWO sorts, deliberately. `comm` requires LEXICALLY sorted input and silently
  # mis-computes the difference otherwise, so the set arithmetic runs on
  # `sort -u`; the emitted order is applied afterwards by _il_sort_refs. Using
  # the display order for `comm` too would order #10 before #9 correctly and
  # then drop refs whose prefix made the two sides disagree.
  local closing_lex
  closing_lex=$(issue_refs_closed_in_bodies "$bodies" \
    | grep -E "^(${_IL_REF})\$" | sort -u || true)
  closing=$(printf '%s\n' "$closing_lex" | grep -E "^(${_IL_REF})\$" | _il_sort_refs)
  mention=$(comm -23 \
    <({ issue_refs_in_subjects "$subjects"
        issue_refs_linked_in_bodies "$bodies"
        issue_refs_closed_in_bodies "$bodies"; } \
        | grep -E "^(${_IL_REF})\$" | sort -u || true) \
    <(printf '%s\n' "$closing_lex" | grep -E "^(${_IL_REF})\$" | sort -u || true) \
    | grep -E "^(${_IL_REF})\$" | _il_sort_refs)

  local ref
  for ref in $closing; do out="${out}Closes ${ref}"$'\n'; done
  for ref in $mention; do out="${out}Refs ${ref}"$'\n'; done
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
