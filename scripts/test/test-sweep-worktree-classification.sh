#!/usr/bin/env bash
# test-sweep-worktree-classification.sh — pass-1 verdict contract for the worktree sweeper.
#
# sweep-merged-worktrees.sh decided "landed" partly from
# `git merge-base --is-ancestor "$tip" origin/main`. That test is REFLEXIVE, so a
# task branch fresh out of new-task.sh — nothing committed on it yet — reported as
# "merged into main" and was swept, taking the worktree and (with
# --delete-branches) the branch. It destroyed task/anti-slop-scanner-signal twice
# in one session on 2026-07-27 (brik-llm#1616).
#
# Two plausible fixes are both wrong, and the ff-merged + not-started cases below
# fail on either one:
#   - "commits ahead of origin/main" — after a non-squash merge a landed branch is
#     also 0 ahead, so it stops recognising the merges the ancestor check is for.
#   - "tip == origin/main" — once main advances past a fresh branch's base the
#     fresh branch stops matching, while a branch whose merge was the newest
#     commit starts matching. Both directions invert.
# The branch reflog is the signal that survives both, and these cases lock it in
# both directions so neither regresses.
#
# Dry-run only — the sweeper is never invoked with --apply here, so nothing is
# removed even if a fixture is wrong.
#
# Usage:
#   ./scripts/test/test-sweep-worktree-classification.sh
#   ./scripts/test/test-sweep-worktree-classification.sh -v     # show sweeper output

set -uo pipefail

# Hermetic against an inherited git environment (#1672): a git hook exports
# GIT_DIR, and GIT_DIR beats directory discovery — every `git -C "$FIXTURE"`
# call would then operate on the caller's real repository.
unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE GIT_COMMON_DIR GIT_NAMESPACE \
      GIT_OBJECT_DIRECTORY GIT_ALTERNATE_OBJECT_DIRECTORIES

VERBOSE=false
[ "${1:-}" = "-v" ] && VERBOSE=true

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# SWEEPER_PATH lets a reviewer point these cases at another revision of the
# script — e.g. `SWEEPER_PATH=/tmp/old.sh` to confirm the suite actually fails on
# the pre-#1616 logic rather than passing for unrelated reasons.
SWEEPER="${SWEEPER_PATH:-$(cd "$SCRIPT_DIR/.." && pwd)/sweep-merged-worktrees.sh}"
[ -x "$SWEEPER" ] || { echo -e "${RED}sweeper not executable at $SWEEPER${NC}" >&2; exit 2; }
# shellcheck source=/dev/null
source "$(cd "$SCRIPT_DIR/.." && pwd)/lib/identity-guard.sh"

TMPROOT="$(mktemp -d "${TMPDIR:-/tmp}/guardtest-sweep.XXXXXX")"
# Invoked indirectly via the trap below. Two rule IDs because the ubuntu-latest
# apt shellcheck flags this as SC2317 while 0.11 flags it as SC2329 — CI installs
# the former, dev machines have the latter, so both are needed to stay clean.
# shellcheck disable=SC2329,SC2317
cleanup() { [ -n "${TMPROOT:-}" ] && [ -d "$TMPROOT" ] && rm -rf "$TMPROOT"; }
trap cleanup EXIT

# ── Safety wrapper ───────────────────────────────────────────────────────────
# brik-llm#1619 disclosed the failure this prevents: a fixture helper returned an
# empty path, every `git -C "$EMPTY" …` silently retargeted the LIVE repo, and the
# test created branches and moved a real worktree. Refuse any git call whose -C
# path is empty or outside $TMPROOT. Structural, not a promise.
g() {
  if [ "${1:-}" != "-C" ]; then
    echo -e "${RED}FATAL: g() requires -C <path> as the first argument${NC}" >&2; exit 3
  fi
  local path="${2:-}"
  case "$path" in
    "") echo -e "${RED}FATAL: g() called with an empty -C path${NC}" >&2; exit 3 ;;
    "$TMPROOT"|"$TMPROOT"/*) : ;;
    *) echo -e "${RED}FATAL: g() path outside TMPROOT: $path${NC}" >&2; exit 3 ;;
  esac
  git "$@"
}

PASS=0; FAIL=0
check() {  # $1=label  $2=expected substring  $3=actual haystack
  if grep -qF -- "$2" <<<"$3"; then
    echo -e "  ${GREEN}PASS${NC}  $1"; PASS=$((PASS+1))
  else
    echo -e "  ${RED}FAIL${NC}  $1"
    echo -e "        expected to find: $2"; FAIL=$((FAIL+1))
  fi
}

# ── Fixture: bare remote + primary + worktree root ───────────────────────────
REMOTE="$TMPROOT/remote.git"
PRIMARY="$TMPROOT/primary"
WT_ROOT="$TMPROOT/primary-worktrees"

git init -q --bare "$REMOTE"
git init -q -b main "$PRIMARY"
# g() below already refuses an empty or non-$TMPROOT path (#1619), but by LITERAL
# prefix. This checks the RESOLVED git-dir, so it also holds if a git env var
# survives the unset above and retargets a correct-looking path (#1841).
assert_throwaway_repo "$PRIMARY" "sweep fixture primary"
g -C "$PRIMARY" config user.email "guardtest@example.com"
g -C "$PRIMARY" config user.name "guardtest"
g -C "$PRIMARY" config commit.gpgsign false
echo "seed" > "$PRIMARY/README.md"
g -C "$PRIMARY" add README.md
g -C "$PRIMARY" commit -q -m "seed"
g -C "$PRIMARY" remote add origin "$REMOTE"
g -C "$PRIMARY" push -q -u origin main
mkdir -p "$WT_ROOT"

commit_on() {  # $1=worktree path  $2=filename
  echo "$2" > "$1/$2"
  g -C "$1" add "$2"
  g -C "$1" commit -q -m "add $2"
}

# 1. NOT STARTED — tip == origin/main, nothing committed. The #1616 case.
g -C "$PRIMARY" worktree add -q -b task/not-started "$WT_ROOT/not-started" main

# 2. NON-SQUASH MERGED — own commits, fast-forwarded into main, tip != base.
g -C "$PRIMARY" worktree add -q -b task/ff-merged "$WT_ROOT/ff-merged" main
commit_on "$WT_ROOT/ff-merged" "ff.txt"
g -C "$PRIMARY" push -q origin task/ff-merged:main       # advance main to the branch tip
g -C "$PRIMARY" fetch -q origin main

# 3. UNMERGED with commits, no PR.
g -C "$PRIMARY" worktree add -q -b task/unmerged "$WT_ROOT/unmerged" main
commit_on "$WT_ROOT/unmerged" "wip.txt"

# 4. DIRTY — uncommitted changes must always win.
g -C "$PRIMARY" worktree add -q -b task/dirty "$WT_ROOT/dirty" main
echo "scratch" > "$WT_ROOT/dirty/scratch.txt"

# 5/6. Squash-merged + open-PR need PR state, which comes from `gh`. Stub it.
g -C "$PRIMARY" worktree add -q -b task/squashed "$WT_ROOT/squashed" main
commit_on "$WT_ROOT/squashed" "squash.txt"
g -C "$PRIMARY" worktree add -q -b task/open-pr "$WT_ROOT/open-pr" main
commit_on "$WT_ROOT/open-pr" "openpr.txt"

# 6b. REUSED NAME (#2676/#4352) — an older MERGED PR and a newer OPEN PR share one
# headRefName, the shape a slug reused by a later new-task.sh ticket produces.
# The sort must not let the merged PR's state outrank the open one's.
g -C "$PRIMARY" worktree add -q -b task/reused-name "$WT_ROOT/reused-name" main
commit_on "$WT_ROOT/reused-name" "reused.txt"

STUB_BIN="$TMPROOT/bin"
mkdir -p "$STUB_BIN"
cat > "$STUB_BIN/gh" <<'STUB'
#!/usr/bin/env bash
# Minimal `gh pr list --json …` stub: only the fields the sweeper reads.
if [ "${1:-}" = "pr" ] && [ "${2:-}" = "list" ]; then
  cat <<JSON
[{"number":901,"headRefName":"task/squashed","state":"MERGED","mergedAt":"2026-07-27T00:00:00Z"},
 {"number":902,"headRefName":"task/open-pr","state":"OPEN","mergedAt":null},
 {"number":903,"headRefName":"task/wtless-merged","state":"MERGED","mergedAt":"2026-08-15T00:00:00Z"},
 {"number":904,"headRefName":"task/wtless-open","state":"OPEN","mergedAt":null},
 {"number":905,"headRefName":"task/pushed-merged","state":"MERGED","mergedAt":"2026-08-16T00:00:00Z"},
 {"number":906,"headRefName":"task/pushed-open","state":"OPEN","mergedAt":null},
 {"number":2622,"headRefName":"task/reused-name","state":"MERGED","mergedAt":"2026-09-01T00:00:00Z"},
 {"number":2674,"headRefName":"task/reused-name","state":"OPEN","mergedAt":null},
 {"number":907,"headRefName":"task/closed-old","state":"CLOSED","mergedAt":null,"closedAt":"2026-01-01T00:00:00Z","headRefOid":"$STUB_OID_closed_old"},
 {"number":908,"headRefName":"task/closed-new","state":"CLOSED","mergedAt":null,"closedAt":"$STUB_RECENT","headRefOid":"$STUB_OID_closed_new"},
 {"number":909,"headRefName":"task/closed-moved","state":"CLOSED","mergedAt":null,"closedAt":"2026-01-01T00:00:00Z","headRefOid":"0000000000000000000000000000000000000001"},
 {"number":910,"headRefName":"task/wtless-closed","state":"CLOSED","mergedAt":null,"closedAt":"2026-01-01T00:00:00Z","headRefOid":"$STUB_OID_wtless_closed"},
 {"number":911,"headRefName":"task/wtless-closed-moved","state":"CLOSED","mergedAt":null,"closedAt":"2026-01-01T00:00:00Z","headRefOid":"0000000000000000000000000000000000000001"}]
JSON
  exit 0
fi
exit 1
STUB
chmod +x "$STUB_BIN/gh"

# 7/8/9. WORKTREE-LESS branches — pass 3 (#2240). Both earlier passes start from a
# worktree, so once one is removed (which this very script does) its branch goes
# invisible and survives forever: 25 had piled up in brik-llm by 2026-08-16 while
# --delete-branches reported a clean sweep. Built the way the real ones arise —
# create the worktree, then remove it, leaving the branch behind.
#   wtless-merged  → remote gone + PR MERGED  → the only deletable shape
#   wtless-open    → PR still OPEN            → KEEP
#   wtless-nopr    → no PR at all             → KEEP (could be unpushed work)
for slug in wtless-merged wtless-open wtless-nopr; do
  g -C "$PRIMARY" worktree add -q -b "task/$slug" "$WT_ROOT/$slug" main
  commit_on "$WT_ROOT/$slug" "$slug.txt"
  g -C "$PRIMARY" worktree remove --force "$WT_ROOT/$slug"
done
# None was ever pushed, so all three are already absent from the remote — the
# condition pass 3 requires. Asserted rather than assumed: if a future fixture
# change pushes one, the DELETE verdict below would flip for a reason unrelated
# to the logic under test.
for slug in wtless-merged wtless-open wtless-nopr; do
  if g -C "$PRIMARY" ls-remote --exit-code --heads origin "task/$slug" >/dev/null 2>&1; then
    echo -e "  ${RED}FAIL${NC}  fixture: task/$slug unexpectedly exists on the remote"; FAIL=$((FAIL+1))
  fi
done

# 10/11. DETACHED worktrees — pass 1 (#2277). `git worktree list --porcelain`
# emits `worktree` / `HEAD` / `detached` and NO `branch` line for these, and the
# pass-1 reader only printed a row from inside its `/^branch /` action. So the row
# was dropped, no later pass covered it (pass 2 walks UNTRACKED dirs and these are
# tracked; passes 3-4 iterate refs), and the sweeper reported `Nothing to remove`
# with the worktree sitting right there.
#
# The bug was ABSENCE, so both cases assert the row is PRESENT. This suite had 36
# cases and not one created a detached worktree — that gap is what let the shape
# through the #2251 union unnoticed.
#   detached-clean → REVIEW, never REMOVE (no branch ref proves it landed)
#   detached-dirty → KEEP, whatever the verdict rule (the dirty guard, AC3)
g -C "$PRIMARY" worktree add -q --detach "$WT_ROOT/detached-clean" main
g -C "$PRIMARY" worktree add -q --detach "$WT_ROOT/detached-dirty" main
echo "scratch" > "$WT_ROOT/detached-dirty/scratch.txt"

# 12-16. CLOSED-unmerged age-out + stale REVIEW flag (#3997). The PR heads and
# closedAt dates reach the gh stub through the environment, because the tip SHAs
# only exist once the fixtures do.
#   closed-old       CLOSED 2026-01-01, tip == PR head      → REMOVE
#   closed-new       CLOSED just now,   tip == PR head      → REVIEW (inside the window)
#   closed-moved     CLOSED long ago, PR head != local tip  → REVIEW (unpushed commits)
#   stale-nopr       no PR, tip committed 30 days ago       → REVIEW + STALE flag, never REMOVE
#   wtless-closed    worktree-less, CLOSED old, tip == head → DELETE
#   wtless-closed-moved                       head != tip   → KEEP
STUB_RECENT="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
export STUB_RECENT
for slug in closed-old closed-new closed-moved; do
  g -C "$PRIMARY" worktree add -q -b "task/$slug" "$WT_ROOT/$slug" main
  commit_on "$WT_ROOT/$slug" "$slug.txt"
done
g -C "$PRIMARY" worktree add -q -b task/stale-nopr "$WT_ROOT/stale-nopr" main
echo stale > "$WT_ROOT/stale-nopr/stale.txt"
g -C "$WT_ROOT/stale-nopr" add stale.txt
GIT_COMMITTER_DATE="$(date -u -v-30d +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -d '30 days ago' +%Y-%m-%dT%H:%M:%SZ)" \
  g -C "$WT_ROOT/stale-nopr" commit -q -m "old work"
for slug in wtless-closed wtless-closed-moved; do
  g -C "$PRIMARY" worktree add -q -b "task/$slug" "$WT_ROOT/$slug" main
  commit_on "$WT_ROOT/$slug" "$slug.txt"
  g -C "$PRIMARY" worktree remove --force "$WT_ROOT/$slug"
done
for slug in closed-old closed-new wtless-closed; do
  oid="$(g -C "$PRIMARY" rev-parse "task/$slug")"
  export "STUB_OID_${slug//-/_}=$oid"
done

# ── Run the sweeper (dry-run) against the fixture ────────────────────────────
echo -e "${YELLOW}▸ sweeper dry-run over 8 fixture worktrees${NC}"
OUT="$(cd "$PRIMARY" && PATH="$STUB_BIN:$PATH" BRIK_WORKTREE_ROOT="$WT_ROOT" "$SWEEPER" 2>&1)"
$VERBOSE && { echo "$OUT"; echo; }

line_for() { grep -E "^task/$1[[:space:]]" <<<"$OUT"; }

echo -e "${YELLOW}▸ verdicts${NC}"
check "not-started → REVIEW, never REMOVE (#1616)" "REVIEW — no commits yet" "$(line_for not-started)"
if grep -qE "^task/not-started[[:space:]].*REMOVE" <<<"$OUT"; then
  echo -e "  ${RED}FAIL${NC}  not-started must never read REMOVE"; FAIL=$((FAIL+1))
else
  echo -e "  ${GREEN}PASS${NC}  not-started must never read REMOVE"; PASS=$((PASS+1))
fi

check "non-squash merged → REMOVE"          "REMOVE — merged into main" "$(line_for ff-merged)"
check "squash-merged PR → REMOVE"           "REMOVE — PR #901 merged"    "$(line_for squashed)"
check "open PR → KEEP"                      "KEEP — PR #902 open"        "$(line_for open-pr)"
check "reused name, newer PR open → KEEP (#2676)" "KEEP — PR #2674 open" "$(line_for reused-name)"
if grep -qE "^task/reused-name[[:space:]].*REMOVE" <<<"$OUT"; then
  echo -e "  ${RED}FAIL${NC}  reused-name must never read REMOVE while its newer PR is open"; FAIL=$((FAIL+1))
else
  echo -e "  ${GREEN}PASS${NC}  reused-name must never read REMOVE while its newer PR is open"; PASS=$((PASS+1))
fi
check "dirty → KEEP"                        "KEEP — 1 uncommitted"      "$(line_for dirty)"
check "unmerged w/ commits → REVIEW"        "REVIEW — clean, unlanded"  "$(line_for unmerged)"

# ── Detached worktrees (#2277) ───────────────────────────────────────────────
# PRESENCE first, on its own. The defect was a missing row, and every verdict
# assertion below would pass vacuously against it — `check` greps a substring out
# of an empty haystack and simply reports FAIL with no hint that the row itself is
# what vanished. Asserting the row exists names the actual regression.
echo
echo -e "${YELLOW}▸ detached worktrees (#2277)${NC}"
detached_line_for() { grep -F "$1 (detached)" <<<"$OUT"; }
for slug in detached-clean detached-dirty; do
  if [ -n "$(detached_line_for "$slug")" ]; then
    echo -e "  ${GREEN}PASS${NC}  $slug appears in the pass-1 table at all"; PASS=$((PASS+1))
  else
    echo -e "  ${RED}FAIL${NC}  $slug is ABSENT from the pass-1 table — the #2277 shape"; FAIL=$((FAIL+1))
  fi
done
check "clean detached → REVIEW"  "REVIEW — detached HEAD"        "$(detached_line_for detached-clean)"
check "dirty detached → KEEP"    "KEEP — 1 uncommitted change(s), detached HEAD" "$(detached_line_for detached-dirty)"
# Never REMOVE, either of them: a detached worktree can hold commits whose only
# reference is its own HEAD, and removing it makes them unrecoverable.
for slug in detached-clean detached-dirty; do
  if grep -F "$slug (detached)" <<<"$OUT" | grep -q 'REMOVE'; then
    echo -e "  ${RED}FAIL${NC}  $slug read REMOVE — unreferenced commits would be destroyed"; FAIL=$((FAIL+1))
  else
    echo -e "  ${GREEN}PASS${NC}  $slug never reads REMOVE"; PASS=$((PASS+1))
  fi
done

# ── CLOSED-unmerged age-out + stale flag (#3997) ─────────────────────────────
echo
echo -e "${YELLOW}▸ closed-unmerged age-out + stale REVIEW flag (#3997)${NC}"
check "CLOSED >=14d, tip == PR head → REMOVE"      "REMOVE — PR #907 closed unmerged" "$(line_for closed-old)"
check "CLOSED inside the window → REVIEW"          "REVIEW — PR #908 closed unmerged" "$(line_for closed-new)"
check "CLOSED but tip past PR head → REVIEW"       "local tip is past the PR head"    "$(line_for closed-moved)"
check "no PR, 30d-old tip → loud STALE flag"       "STALE"                            "$(line_for stale-nopr)"
check "fresh no-PR worktree carries no STALE flag" "REVIEW — clean, unlanded, no merged PR" "$(line_for unmerged)"
check "worktree-less CLOSED, tip == head → DELETE" "DELETE — PR #910 closed unmerged" "$(line_for wtless-closed)"
check "worktree-less CLOSED, tip != head → KEEP"   "KEEP — no merged PR"              "$(line_for wtless-closed-moved)"
for slug in closed-new closed-moved stale-nopr; do
  if grep -qE "^task/${slug}[[:space:]].*REMOVE" <<<"$OUT"; then
    echo -e "  ${RED}FAIL${NC}  task/$slug must never read REMOVE"; FAIL=$((FAIL+1))
  else
    echo -e "  ${GREEN}PASS${NC}  task/$slug must never read REMOVE"; PASS=$((PASS+1))
  fi
done
if grep -qE "^task/unmerged[[:space:]].*STALE" <<<"$OUT"; then
  echo -e "  ${RED}FAIL${NC}  a fresh worktree was flagged STALE"; FAIL=$((FAIL+1))
else
  echo -e "  ${GREEN}PASS${NC}  a fresh worktree is not flagged STALE"; PASS=$((PASS+1))
fi

echo
echo -e "${YELLOW}▸ summary line${NC}"
# ff-merged + squashed + closed-old (#3997). If the fresh worktree ever leaks back in this reads 4.
check "removable count is 3 (ff-merged + squashed + closed-old)" "3 worktree(s) removable" "$OUT"

# ── Pass 3: worktree-less branches (#2240) ───────────────────────────────────
# Against the pre-#2240 sweeper these three lines do not exist at all, so every
# check below fails — which is the point: the bug was silence, not a wrong verdict.
echo
echo -e "${YELLOW}▸ worktree-less branch verdicts${NC}"
check "merged PR + remote gone → DELETE"  "DELETE — PR #903 merged" "$(line_for wtless-merged)"
check "open PR → KEEP"                    "KEEP — PR #904 open"     "$(line_for wtless-open)"
check "no PR at all → KEEP"               "KEEP — no merged PR"     "$(line_for wtless-nopr)"
for slug in wtless-open wtless-nopr; do
  if grep -qE "^task/${slug}[[:space:]].*DELETE" <<<"$OUT"; then
    echo -e "  ${RED}FAIL${NC}  task/$slug must never read DELETE"; FAIL=$((FAIL+1))
  else
    echo -e "  ${GREEN}PASS${NC}  task/$slug must never read DELETE"; PASS=$((PASS+1))
  fi
done
check "deletable count is 2 (wtless-merged + wtless-closed)" "2 worktree-less branch(es) deletable" "$OUT"

# ── --keep (#1634, adopted from brik-bds/portal) ─────────────────────────────
# One --keep must spare the worktree, its directory AND its branch. Sparing only
# one of the three lets a later pass reap what an earlier pass was told to leave —
# the whole point of the flag is that the operator named work they still want.
echo
echo -e "${YELLOW}▸ --keep${NC}"
KEEP_OUT="$(cd "$PRIMARY" && PATH="$STUB_BIN:$PATH" BRIK_WORKTREE_ROOT="$WT_ROOT" \
  "$SWEEPER" --keep squashed --keep wtless-merged 2>&1)"
$VERBOSE && { echo "$KEEP_OUT"; echo; }
check "a kept worktree is spared"            "KEEP — --keep" "$(grep -E '^task/squashed[[:space:]]' <<<"$KEEP_OUT")"
# An ABSENCE, asserted explicitly: `check` greps for a substring, and an empty
# needle matches everything — a vacuous green tick is worse than no case at all.
if grep -qE '^task/wtless-merged[[:space:]].*DELETE' <<<"$KEEP_OUT"; then
  echo -e "  ${RED}FAIL${NC}  a kept worktree-less branch still read DELETE"; FAIL=$((FAIL+1))
else
  echo -e "  ${GREEN}PASS${NC}  a kept worktree-less branch is spared"; PASS=$((PASS+1))
fi
check "sparing drops the removable count"    "2 worktree(s) removable"              "$KEEP_OUT"
check "sparing drops the deletable count"    "1 worktree-less branch(es) deletable" "$KEEP_OUT"

# ── gh installed but unusable (#2277) ────────────────────────────────────────
# Bad token scope or an exhausted GraphQL bucket leaves PR_JSON empty, every branch
# classifies as "no PR" → KEEP, and the run is fail-safe but was INDISTINGUISHABLE
# from a genuinely clean sweep. The stub above fails only on non-`pr list` calls,
# so it cannot exercise this; this one fails on everything, the way a scope error
# does.
echo
echo -e "${YELLOW}▸ gh installed but failing${NC}"
FAIL_BIN="$TMPROOT/failbin"
mkdir -p "$FAIL_BIN"
cat > "$FAIL_BIN/gh" <<'STUB'
#!/usr/bin/env bash
echo "gh: Resource protected by organization SAML enforcement" >&2
exit 1
STUB
chmod +x "$FAIL_BIN/gh"
GH_FAIL_OUT="$(cd "$PRIMARY" && PATH="$FAIL_BIN:$PATH" BRIK_WORKTREE_ROOT="$WT_ROOT" "$SWEEPER" 2>&1)"
$VERBOSE && { echo "$GH_FAIL_OUT"; echo; }
check "a failing gh is reported, not swallowed" "'gh pr list' failed" "$GH_FAIL_OUT"
check "gh's own error text is passed through"   "SAML enforcement"    "$GH_FAIL_OUT"

# #3603 — the degraded run's VERDICTS must not read as absence claims. Reaping was
# always right here (nothing is removed); the wording lied. On 2026-09-21 three
# branches whose PRs were merged (#3579, #3597, #3601) each printed "no merged PR",
# and the warning two lines above had scrolled off. These cases assert the absence
# wording is GONE from a degraded run — an absence, so they also assert the rows
# are present, or a sweeper that printed nothing at all would pass vacuously.
if grep -qE '^task/(squashed|open-pr)[[:space:]]' <<<"$GH_FAIL_OUT"; then
  echo -e "  ${GREEN}PASS${NC}  degraded run still prints its rows (not vacuous)"; PASS=$((PASS+1))
else
  echo -e "  ${RED}FAIL${NC}  degraded run printed no worktree rows to check"; FAIL=$((FAIL+1))
fi
check "degraded verdict says the PR state is UNREADABLE" "PR state UNREADABLE" "$GH_FAIL_OUT"
check "…and the summary repeats it where the counts are" "could not read PR state" "$GH_FAIL_OUT"
if grep -q 'no merged PR' <<<"$GH_FAIL_OUT"; then
  echo -e "  ${RED}FAIL${NC}  a degraded run still claims 'no merged PR' (#3603)"; FAIL=$((FAIL+1))
else
  echo -e "  ${GREEN}PASS${NC}  no 'no merged PR' absence claim in a degraded run"; PASS=$((PASS+1))
fi

# ── Pass 4: orphan remote refs (#1634) ───────────────────────────────────────
# origin/task/* that no local worktree holds. task/pushed-merged is pushed to the
# remote and has a MERGED PR in the stub; task/pushed-open has an OPEN one.
echo
echo -e "${YELLOW}▸ orphan remote refs${NC}"
for slug in pushed-merged pushed-open; do
  g -C "$PRIMARY" worktree add -q -b "task/$slug" "$WT_ROOT/$slug" main
  commit_on "$WT_ROOT/$slug" "$slug.txt"
  g -C "$PRIMARY" push -q origin "task/$slug"
  g -C "$PRIMARY" worktree remove --force "$WT_ROOT/$slug"
  g -C "$PRIMARY" branch -D "task/$slug" >/dev/null 2>&1   # local side gone; only the remote ref remains
done
g -C "$PRIMARY" fetch -q origin

# Opt-in, so the DEFAULT run must not even mention them. Three of the four repos
# adopting this script have never deleted a remote ref, and acquiring that silently
# on adoption is the regression this asserts against.
DEFAULT_OUT="$(cd "$PRIMARY" && PATH="$STUB_BIN:$PATH" BRIK_WORKTREE_ROOT="$WT_ROOT" "$SWEEPER" 2>&1)"
if grep -q 'ORPHAN REMOTE REF' <<<"$DEFAULT_OUT"; then
  echo -e "  ${RED}FAIL${NC}  remote-ref pass ran without --sweep-remote-refs"; FAIL=$((FAIL+1))
else
  echo -e "  ${GREEN}PASS${NC}  remote-ref pass is opt-in"; PASS=$((PASS+1))
fi

REF_OUT="$(cd "$PRIMARY" && PATH="$STUB_BIN:$PATH" BRIK_WORKTREE_ROOT="$WT_ROOT" \
  "$SWEEPER" --sweep-remote-refs 2>&1)"
$VERBOSE && { echo "$REF_OUT"; echo; }
check "merged remote ref → DELETE" "DELETE — PR #905 merged" "$(grep -E '^origin/task/pushed-merged[[:space:]]' <<<"$REF_OUT")"
check "open-PR remote ref → KEEP"  "KEEP — PR #906 open"     "$(grep -E '^origin/task/pushed-open[[:space:]]' <<<"$REF_OUT")"
check "remote deletable count is 1" "1 remote ref(s) deletable" "$REF_OUT"

# A ref whose worktree is still checked out belongs to pass 1, which has the dirty
# and not-started guards this pass does not; deleting its remote from under it would
# strand a live session.
if grep -qE '^origin/task/open-pr[[:space:]]' <<<"$REF_OUT"; then
  echo -e "  ${RED}FAIL${NC}  pass 4 classified a branch a worktree still holds"; FAIL=$((FAIL+1))
else
  echo -e "  ${GREEN}PASS${NC}  pass 4 skips branches held by a worktree"; PASS=$((PASS+1))
fi

REF_KEEP_OUT="$(cd "$PRIMARY" && PATH="$STUB_BIN:$PATH" BRIK_WORKTREE_ROOT="$WT_ROOT" \
  "$SWEEPER" --sweep-remote-refs --keep pushed-merged 2>&1)"
check "--keep spares a remote ref too" "0 remote ref(s) deletable" "$REF_KEEP_OUT"
# A dry-run WITHOUT --delete-branches still classifies, but must say the branches
# are advisory — otherwise DELETE lines imply --apply alone would act on them.
check "dry-run names the flag it needs"   "need --delete-branches too"           "$OUT"

# ── --apply over a worktree containing a populated submodule ─────────────────
# `git worktree remove` refuses outright on a worktree containing submodules, so
# in this repo (foundations/brik-bds) EVERY worktree whose submodule got checked
# out was unreapable and the sweeper silently no-op'd on it — 3 of 7 on
# 2026-07-29, reported as "locked or untracked junk?" which sent the operator
# looking for junk that did not exist. This is the only case that needs --apply:
# the classification is unaffected, the removal is what failed.
echo
echo -e "${YELLOW}▸ --apply over a submodule-bearing worktree${NC}"

# Case 2 above pushed task/ff-merged straight to remote main, so PRIMARY's local
# main still sits at the seed commit. Anything committed on top of it would be a
# non-descendant of remote main and the push below would be rejected — which
# would leave the fixture half-built and the assertions passing vacuously.
g -C "$PRIMARY" reset -q --hard origin/main

SUBREMOTE="$TMPROOT/submodule.git"
# -b main is required, not cosmetic: a bare repo's HEAD follows the local
# init.defaultBranch, which is `master` on the CI runner and `main` here. With a
# mismatched HEAD, `submodule add` clones successfully and then dies with
# "fatal: You are on a branch yet to be born" — so this passed locally and
# failed on CI (git 2.54.0) until the default was pinned.
git init -q --bare -b main "$SUBREMOTE"
SUBSEED="$TMPROOT/subseed"
git init -q -b main "$SUBSEED"
assert_throwaway_repo "$SUBSEED" "sweep fixture submodule seed"
g -C "$SUBSEED" config user.email "guardtest@example.com"
g -C "$SUBSEED" config user.name "guardtest"
g -C "$SUBSEED" config commit.gpgsign false
echo "sub" > "$SUBSEED/sub.txt"
g -C "$SUBSEED" add sub.txt
g -C "$SUBSEED" commit -q -m "sub seed"
g -C "$SUBSEED" push -q "$SUBREMOTE" main

# protocol.file.allow: git ≥2.38 refuses file:// submodules by default
# (CVE-2022-39253). Errors are CAPTURED, not discarded — the first version of
# this fixture hid them, and when it failed to populate on CI's git the report
# said only "case under test is not reproduced" with no reason to act on.
SUB_ADD_ERR="$(g -C "$PRIMARY" -c protocol.file.allow=always \
  submodule add "$SUBREMOTE" foundations/sub 2>&1)" || true
g -C "$PRIMARY" commit -q -m "add submodule" >/dev/null 2>&1 || true
g -C "$PRIMARY" push -q origin main

# A landed worktree whose submodule is checked out — the unreapable shape.
g -C "$PRIMARY" worktree add -q -b task/submod "$WT_ROOT/submod" main
SUB_UPD_ERR="$(g -C "$WT_ROOT/submod" -c protocol.file.allow=always \
  submodule update --init --recursive 2>&1)" || true
commit_on "$WT_ROOT/submod" "submod.txt"
g -C "$PRIMARY" push -q origin task/submod:main
g -C "$PRIMARY" fetch -q origin main

# find, not `ls | wc -l`: this workflow runs shellcheck at default severity, so
# SC2012 (info) is a hard failure here even though -S warning hides it locally.
SUBMOD_ENTRIES="$(find "$WT_ROOT/submod/foundations/sub" -mindepth 1 -maxdepth 1 2>/dev/null | wc -l | tr -d ' ')"
if [ "$SUBMOD_ENTRIES" -gt 0 ]; then
  echo -e "  ${GREEN}PASS${NC}  fixture: submodule is populated (precondition)"; PASS=$((PASS+1))
else
  echo -e "  ${RED}FAIL${NC}  fixture: submodule never populated — the case under test is not reproduced"
  echo -e "        git $(git --version | awk '{print $3}')"
  echo -e "        submodule add: ${SUB_ADD_ERR:-<no output>}" | sed 's/$//'
  echo -e "        submodule update: ${SUB_UPD_ERR:-<no output>}"
  FAIL=$((FAIL+1))
fi

# Confirm plain `git worktree remove` really does refuse, so this test fails
# loudly if a future git drops the restriction and the fallback becomes dead code.
RAW_ERR="$(g -C "$PRIMARY" worktree remove "$WT_ROOT/submod" 2>&1 || true)"
if grep -q 'containing submodules' <<<"$RAW_ERR"; then
  echo -e "  ${GREEN}PASS${NC}  git still refuses to remove a submodule-bearing worktree"; PASS=$((PASS+1))
else
  echo -e "  ${RED}FAIL${NC}  git no longer refuses — revisit the fallback, it may be dead code"
  echo -e "        got: ${RAW_ERR:-<empty, removal succeeded>}"; FAIL=$((FAIL+1))
fi

APPLY_OUT="$(cd "$PRIMARY" && PATH="$STUB_BIN:$PATH" BRIK_WORKTREE_ROOT="$WT_ROOT" "$SWEEPER" --apply 2>&1)"
$VERBOSE && { echo "$APPLY_OUT"; echo; }
$VERBOSE && { echo "$APPLY_OUT"; echo; }

if [ -d "$WT_ROOT/submod" ]; then
  echo -e "  ${RED}FAIL${NC}  submodule-bearing worktree still on disk after --apply"; FAIL=$((FAIL+1))
else
  echo -e "  ${GREEN}PASS${NC}  submodule-bearing worktree removed by --apply"; PASS=$((PASS+1))
fi

check "fallback is reported, not silent" "submodule fallback" "$APPLY_OUT"

# The misleading guess must be gone: a real failure now prints git's own words.
if grep -q 'locked or untracked junk' <<<"$APPLY_OUT"; then
  echo -e "  ${RED}FAIL${NC}  the guessed 'locked or untracked junk?' message is still emitted"; FAIL=$((FAIL+1))
else
  echo -e "  ${GREEN}PASS${NC}  no guessed 'locked or untracked junk?' message"; PASS=$((PASS+1))
fi

# git must agree the worktree is gone, not just the directory.
#
# Matched on the PHYSICAL path: `git worktree list` resolves symlinks, and on
# macOS $WT_ROOT is /var/… while git reports /private/var/…. Grepping the
# unresolved path never matched, so this assertion passed even against the
# pre-fix sweeper that removed nothing — a green tick proving nothing.
WT_ROOT_PHYS="$(cd "$WT_ROOT" 2>/dev/null && pwd -P || echo "$WT_ROOT")"
if g -C "$PRIMARY" worktree list --porcelain | grep -qF "$WT_ROOT_PHYS/submod"; then
  echo -e "  ${RED}FAIL${NC}  git still tracks the removed worktree (prune did not run)"; FAIL=$((FAIL+1))
else
  echo -e "  ${GREEN}PASS${NC}  git no longer tracks it (prune ran)"; PASS=$((PASS+1))
fi

# The branch must survive — removal is not a ref deletion.
if g -C "$PRIMARY" rev-parse --verify -q task/submod >/dev/null; then
  echo -e "  ${GREEN}PASS${NC}  branch survives the fallback removal"; PASS=$((PASS+1))
else
  echo -e "  ${RED}FAIL${NC}  branch was destroyed by the fallback"; FAIL=$((FAIL+1))
fi

# That run was --apply WITHOUT --delete-branches, so pass 3 must have touched
# nothing: --apply alone has never deleted a ref and must not start now.
if g -C "$PRIMARY" rev-parse --verify -q task/wtless-merged >/dev/null; then
  echo -e "  ${GREEN}PASS${NC}  --apply alone leaves worktree-less branches"; PASS=$((PASS+1))
else
  echo -e "  ${RED}FAIL${NC}  --apply alone deleted a branch without --delete-branches"; FAIL=$((FAIL+1))
fi

# ── --apply --delete-branches: pass 3 actually reaps ─────────────────────────
echo
echo -e "${YELLOW}▸ --apply --delete-branches over worktree-less branches${NC}"
DEL_OUT="$(cd "$PRIMARY" && PATH="$STUB_BIN:$PATH" BRIK_WORKTREE_ROOT="$WT_ROOT" \
  "$SWEEPER" --apply --delete-branches 2>&1)"
$VERBOSE && { echo "$DEL_OUT"; echo; }

# Per-branch outcomes, not counts: the first --apply removed the ff-merged and
# squashed WORKTREES, so those branches are worktree-less by now too and legitimately
# enter pass 3. Asserting a total here would encode fixture history, not behaviour.
if g -C "$PRIMARY" rev-parse --verify -q task/wtless-merged >/dev/null; then
  echo -e "  ${RED}FAIL${NC}  landed worktree-less branch survived --delete-branches"; FAIL=$((FAIL+1))
else
  echo -e "  ${GREEN}PASS${NC}  landed worktree-less branch deleted"; PASS=$((PASS+1))
fi
for slug in wtless-open wtless-nopr; do
  if g -C "$PRIMARY" rev-parse --verify -q "task/$slug" >/dev/null; then
    echo -e "  ${GREEN}PASS${NC}  task/$slug survives (not landed)"; PASS=$((PASS+1))
  else
    echo -e "  ${RED}FAIL${NC}  task/$slug was deleted — unlanded work destroyed"; FAIL=$((FAIL+1))
  fi
done

# ── --json is machine-readable, and refuses to reap (#2609) ──
# The flag used to only SUPPRESS the tables while the colored summary still went to
# stdout, so a piping caller got ANSI prose. These two assertions are the gate.
echo
echo -e "${YELLOW}▸ --json contract${NC}"

json_out="$(cd "$PRIMARY" && "$SWEEPER" --json --delete-branches 2>/dev/null)"
if printf '%s' "$json_out" | python3 -c 'import json,sys; json.load(sys.stdin)' 2>/dev/null; then
  echo -e "  ${GREEN}PASS${NC}  --json stdout parses as JSON"; PASS=$((PASS+1))
else
  echo -e "  ${RED}FAIL${NC}  --json stdout is not parseable JSON"; FAIL=$((FAIL+1))
fi

# The verdict REASON must survive into the payload, not just the decision word —
# "KEEP" alone cannot tell a dirty worktree from one with an open PR.
if grep -q '"verdict"' <<<"$json_out" && grep -q '"decision"' <<<"$json_out"; then
  echo -e "  ${GREEN}PASS${NC}  payload carries verdict + decision"; PASS=$((PASS+1))
else
  echo -e "  ${RED}FAIL${NC}  payload dropped the verdict reason"; FAIL=$((FAIL+1))
fi

# Silently downgrading a reap to a dry-run would be worse than the bug being fixed.
if (cd "$PRIMARY" && "$SWEEPER" --json --apply >/dev/null 2>&1); then
  echo -e "  ${RED}FAIL${NC}  --json --apply was accepted; it must refuse"; FAIL=$((FAIL+1))
else
  echo -e "  ${GREEN}PASS${NC}  --json --apply refuses rather than silently not reaping"; PASS=$((PASS+1))
fi

# ── Pass 4: the remote-ref sweep (#2333) ─────────────────────────────────────
#
# The one pass that mutates state other machines can see, and the only one these
# cases run with --apply. Contained the same way everything above is: a second
# bare repo under $TMPROOT, reached only through g().
#
# Three defects, all in the same run:
#   * the initial fetch never pruned, so a remote-tracking ref for an
#     already-deleted branch was offered for deletion;
#   * the delete was one batch, so that one stale ref took every live orphan ref
#     with it — and the only prune sat inside the SUCCESS branch, the one path
#     where it was no longer needed, so the next run failed identically;
#   * it exited 0 while printing "nothing removed", which is why a scheduled
#     caller never noticed.
echo
echo -e "${YELLOW}▸ pass 4 — remote-ref sweep (#2333)${NC}"

REMOTE2="$TMPROOT/remote2.git"
PRIMARY2="$TMPROOT/primary2"
git init -q --bare "$REMOTE2"
git init -q -b main "$PRIMARY2"
assert_throwaway_repo "$PRIMARY2" "sweep fixture primary2"
g -C "$PRIMARY2" config user.email "guardtest@example.com"
g -C "$PRIMARY2" config user.name "guardtest"
g -C "$PRIMARY2" config commit.gpgsign false
echo seed > "$PRIMARY2/README.md"
g -C "$PRIMARY2" add README.md
g -C "$PRIMARY2" commit -q -m seed
g -C "$PRIMARY2" remote add origin "$REMOTE2"
g -C "$PRIMARY2" push -q -u origin main

# Two orphan remote refs: no local worktree holds either, so pass 4 owns both.
for slug in refstale reflive refrace; do
  g -C "$PRIMARY2" branch "task/$slug" main
  g -C "$PRIMARY2" push -q origin "task/$slug"
  g -C "$PRIMARY2" branch -D "task/$slug" >/dev/null
done
g -C "$PRIMARY2" fetch -q origin

STUB2="$TMPROOT/bin2"
mkdir -p "$STUB2"
cat > "$STUB2/gh" <<'STUB'
#!/usr/bin/env bash
if [ "${1:-}" = "pr" ] && [ "${2:-}" = "list" ]; then
  # The sweeper reads this between its prune and its push, which makes it the
  # seam that reproduces the RACE the batch delete has to tolerate: a concurrent
  # sweep on the other machine removing a ref after this one pruned. Guarded by
  # an env var so it only fires for the case that asks for it.
  if [ -n "${RACE_DELETE_REF:-}" ] && [ -n "${RACE_REMOTE:-}" ]; then
    git -C "$RACE_REMOTE" update-ref -d "refs/heads/$RACE_DELETE_REF" 2>/dev/null || true
  fi
  cat <<'JSON'
[{"number":910,"headRefName":"task/refstale","state":"MERGED","mergedAt":"2026-08-19T00:00:00Z"},
 {"number":911,"headRefName":"task/reflive","state":"MERGED","mergedAt":"2026-08-19T00:00:00Z"},
 {"number":912,"headRefName":"task/refrace","state":"MERGED","mergedAt":"2026-08-19T00:00:00Z"}]
JSON
  exit 0
fi
exit 1
STUB
chmod +x "$STUB2/gh"

# Make task/refstale stale exactly the way GitHub's delete-branch-on-merge does:
# gone on the remote, its local remote-tracking ref left behind. Deleted straight
# out of the bare repo, because `git push --delete` would take the local ref too
# and there would be nothing stale to test.
g -C "$REMOTE2" update-ref -d refs/heads/task/refstale
if g -C "$PRIMARY2" show-ref --verify --quiet refs/remotes/origin/task/refstale; then
  echo -e "  ${GREEN}PASS${NC}  fixture: a stale origin/task/refstale ref is present locally"; PASS=$((PASS+1))
else
  echo -e "  ${RED}FAIL${NC}  fixture: the stale ref was not created"; FAIL=$((FAIL+1))
fi

# AC1/AC2 — the initial fetch prunes, so the stale ref is never offered.
OUT4="$(cd "$PRIMARY2" && PATH="$STUB2:$PATH" BRIK_WORKTREE_ROOT="$TMPROOT/p2-worktrees" \
        "$SWEEPER" --sweep-remote-refs 2>&1)"
$VERBOSE && { echo "$OUT4"; echo; }
if grep -q 'refstale' <<<"$OUT4"; then
  echo -e "  ${RED}FAIL${NC}  an already-deleted remote branch is still offered for deletion"; FAIL=$((FAIL+1))
else
  echo -e "  ${GREEN}PASS${NC}  the initial fetch prunes, so a stale ref is never offered"; PASS=$((PASS+1))
fi
check "a genuinely live orphan ref is still found" "origin/task/reflive" "$OUT4"

# AC3 — one already-gone ref must not block the live orphan beside it. The stub
# deletes task/refrace after the prune, so the batch push fails on it exactly as a
# concurrent sweep would, and the individual retry has to carry task/reflive.
set +e
OUT5="$(cd "$PRIMARY2" && PATH="$STUB2:$PATH" BRIK_WORKTREE_ROOT="$TMPROOT/p2-worktrees" \
        RACE_REMOTE="$REMOTE2" RACE_DELETE_REF="task/refrace" \
        "$SWEEPER" --apply --sweep-remote-refs 2>&1)"
RC5=$?
set -e
$VERBOSE && { echo "$OUT5"; echo; }
check "the batch failure is named, not swallowed" "retrying each ref individually" "$OUT5"
check "an already-gone ref counts as done, not as a failure" "already gone on the remote" "$OUT5"
check "…and the live orphan beside it is still deleted" "origin/task/reflive" "$OUT5"
if g -C "$REMOTE2" show-ref --verify --quiet refs/heads/task/reflive; then
  echo -e "  ${RED}FAIL${NC}  task/reflive survived on the remote — the batch was still all-or-nothing"; FAIL=$((FAIL+1))
else
  echo -e "  ${GREEN}PASS${NC}  task/reflive is gone from the remote despite the stale ref beside it"; PASS=$((PASS+1))
fi
if [ "$RC5" -eq 0 ]; then
  echo -e "  ${GREEN}PASS${NC}  an already-gone ref alone does not fail the run"; PASS=$((PASS+1))
else
  echo -e "  ${RED}FAIL${NC}  already-gone was treated as an error (exit $RC5)"; FAIL=$((FAIL+1))
fi

# AC5 — a pass that was asked to run and genuinely could not must exit non-zero.
# Unreachable remote, so the prune no-ops and every delete fails for a reason that
# is NOT "already gone".
g -C "$PRIMARY2" branch task/refdead main
g -C "$PRIMARY2" push -q origin task/refdead
g -C "$PRIMARY2" branch -D task/refdead >/dev/null
g -C "$PRIMARY2" fetch -q origin
g -C "$PRIMARY2" remote set-url origin "$TMPROOT/no-such-remote.git"
cat > "$STUB2/gh" <<'STUB'
#!/usr/bin/env bash
if [ "${1:-}" = "pr" ] && [ "${2:-}" = "list" ]; then
  echo '[{"number":913,"headRefName":"task/refdead","state":"MERGED","mergedAt":"2026-08-19T00:00:00Z"}]'
  exit 0
fi
exit 1
STUB
chmod +x "$STUB2/gh"
set +e
OUT6="$(cd "$PRIMARY2" && PATH="$STUB2:$PATH" BRIK_WORKTREE_ROOT="$TMPROOT/p2-worktrees" \
        "$SWEEPER" --apply --sweep-remote-refs 2>&1)"
RC6=$?
set -e
$VERBOSE && { echo "$OUT6"; echo; }
if [ "$RC6" -ne 0 ]; then
  echo -e "  ${GREEN}PASS${NC}  a remote-ref pass that could not do its work exits non-zero"; PASS=$((PASS+1))
else
  echo -e "  ${RED}FAIL${NC}  the sweeper still exits 0 after failing to delete a ref"; FAIL=$((FAIL+1))
fi
check "…and says so, rather than only printing 'nothing removed'" "could not be deleted" "$OUT6"

# ── Pass 2: orphan-directory classification under a symlinked root (#2293) ────
#
# Pass 2 skips a dir git still tracks by comparing `cd && pwd` (logical) against
# `git worktree list` (physical). A lexical `grep -qxF` never matched across the
# /var → /private/var boundary macOS adds, nor across a `GitHub`/`Github` case
# mismatch on APFS (brikdesigns#1431), so EVERY tracked worktree fell through into
# the orphan pass — and a dir whose name happened to match a merged `task/<slug>`
# PR was one `rm -rf` away. The fix compares device+inode (`-ef`).
#
# Exercised through an explicit SYMLINK to the real root, not by relying on the
# macOS $TMPDIR quirk: that makes the axis reproduce on a case-sensitive Linux CI
# runner too, so this is not a vacuous green tick there. `cd $link/sub && pwd`
# keeps the symlink spelling while git records the resolved one — the exact
# mismatch, on any platform.
echo
echo -e "${YELLOW}▸ pass 2 — orphan classification under a symlinked root (#2293)${NC}"

REMOTE3="$TMPROOT/remote3.git"
PRIMARY3="$TMPROOT/primary3"
WT3_REAL="$TMPROOT/p3-worktrees-real"
WT3_LINK="$TMPROOT/p3-worktrees-link"
git init -q --bare "$REMOTE3"
git init -q -b main "$PRIMARY3"
assert_throwaway_repo "$PRIMARY3" "sweep fixture primary3"
g -C "$PRIMARY3" config user.email "guardtest@example.com"
g -C "$PRIMARY3" config user.name "guardtest"
g -C "$PRIMARY3" config commit.gpgsign false
echo seed > "$PRIMARY3/README.md"
g -C "$PRIMARY3" add README.md
g -C "$PRIMARY3" commit -q -m seed
g -C "$PRIMARY3" remote add origin "$REMOTE3"
g -C "$PRIMARY3" push -q -u origin main
mkdir -p "$WT3_REAL"
ln -s "$WT3_REAL" "$WT3_LINK"

STUB3="$TMPROOT/bin3"
mkdir -p "$STUB3"
cat > "$STUB3/gh" <<'STUB'
#!/usr/bin/env bash
if [ "${1:-}" = "pr" ] && [ "${2:-}" = "list" ]; then
  # task/collision is MERGED so that WITHOUT the .git guard the collision dir
  # below would REAP on a pure name coincidence — the guard is what stops it.
  cat <<'JSON'
[{"number":920,"headRefName":"task/orphan-merged","state":"MERGED","mergedAt":"2026-09-01T00:00:00Z"},
 {"number":921,"headRefName":"task/collision","state":"MERGED","mergedAt":"2026-09-01T00:00:00Z"}]
JSON
  exit 0
fi
exit 1
STUB
chmod +x "$STUB3/gh"

# A) TRACKED worktree — created under the real root, so git records the resolved
#    path; pass 2 reaches it through the symlink. Must be SKIPPED by pass 2.
g -C "$PRIMARY3" worktree add -q -b task/tracked-wt "$WT3_REAL/tracked-wt" main

# B) GENUINE ORPHAN — a real worktree whose admin linkage was stripped (the shape
#    `git worktree prune` leaves once a branch is deleted): dir + dangling .git
#    remain, git no longer lists it, branch gone locally, never pushed → merged PR
#    makes it REAP-eligible.
g -C "$PRIMARY3" worktree add -q -b task/orphan-merged "$WT3_REAL/orphan-merged" main
commit_on "$WT3_REAL/orphan-merged" "o.txt"
rm -rf "$PRIMARY3/.git/worktrees/orphan-merged"          # strip linkage, keep the dir
g -C "$PRIMARY3" branch -D task/orphan-merged >/dev/null 2>&1
if [ -e "$WT3_REAL/orphan-merged/.git" ]; then
  echo -e "  ${GREEN}PASS${NC}  fixture: orphan dir keeps a dangling .git gitlink"; PASS=$((PASS+1))
else
  echo -e "  ${RED}FAIL${NC}  fixture: orphan dir lost its .git — precondition unmet"; FAIL=$((FAIL+1))
fi

# C) NON-WORKTREE dir named to collide with a merged task/<slug> PR. No .git, so
#    it was never a worktree; must FLAG "no branch to resolve", never REAP.
mkdir -p "$WT3_LINK/collision"

P2_OUT="$(cd "$PRIMARY3" && PATH="$STUB3:$PATH" BRIK_WORKTREE_ROOT="$WT3_LINK" "$SWEEPER" 2>&1)"
$VERBOSE && { echo "$P2_OUT"; echo; }

# The pass-2 orphan rows print the bare slug; pass-1 rows print `task/<slug>`. So a
# leading-anchored bare-slug match isolates the orphan table from pass 1.
orphan_line() { grep -E "^$1[[:space:]]" <<<"$P2_OUT"; }

# A tracked worktree must NOT be re-classified as an orphan. Assert the pass-1 row
# is present (not vacuous) AND the pass-2 orphan row is absent.
if grep -qE "^task/tracked-wt[[:space:]]" <<<"$P2_OUT"; then
  echo -e "  ${GREEN}PASS${NC}  tracked worktree still appears in pass 1"; PASS=$((PASS+1))
else
  echo -e "  ${RED}FAIL${NC}  tracked worktree vanished from pass 1 entirely"; FAIL=$((FAIL+1))
fi
if [ -z "$(orphan_line tracked-wt)" ]; then
  echo -e "  ${GREEN}PASS${NC}  tracked worktree is skipped by pass 2 (device+inode match)"; PASS=$((PASS+1))
else
  echo -e "  ${RED}FAIL${NC}  tracked worktree mis-classified as an orphan — the #2293 bug"; FAIL=$((FAIL+1))
fi

check "genuine orphan with merged PR → REAP" "REAP — PR #920 merged" "$(orphan_line orphan-merged)"

# The name-collision guard: a non-worktree dir must never reap on a guessed branch,
# even when that guess has a merged PR.
check "non-worktree dir → FLAG, no branch guessed" "not a worktree" "$(orphan_line collision)"
if grep -qE "^collision[[:space:]].*REAP" <<<"$P2_OUT"; then
  echo -e "  ${RED}FAIL${NC}  a non-worktree dir reaped on a guessed branch name (#2293)"; FAIL=$((FAIL+1))
else
  echo -e "  ${GREEN}PASS${NC}  a non-worktree dir never reaps on a name coincidence"; PASS=$((PASS+1))
fi

# ── Dirt that is not work, junk that is not dirt, and the orphan/branch race ──
#
# Four defects that all pinned merged worktrees in place, each proved on its own
# fixture worktree so a regression names which one came back:
#
#   #2782  mode-only and ignored-symlink porcelain lines counted as "uncommitted
#          work", so a merged worktree could never be swept. Three on brik-mini
#          dated to 2026-05-29 and were removed by hand.
#   NEW-D  `git worktree remove` fails "Directory not empty" on IGNORED build
#          output, and only the `containing submodules` wording reached the rm
#          fallback — so the run printed "skipped" and left 1.9 GB behind.
#   #2719  on that fallback path `rm -rf` does not deregister the worktree, so
#          `git branch -D` refuses and the `&&` swallowed it.
#   NEW-E  pass 2 flags an orphan whose local branch still exists, while pass 3 —
#          classified twenty lines later — is about to delete that very branch on
#          a stricter predicate. One orphan cost three --apply runs.
echo
echo -e "${YELLOW}▸ dirt-vs-work, ignored junk, and the pass-2/pass-3 race${NC}"

REMOTE4="$TMPROOT/remote4.git"
PRIMARY4="$TMPROOT/primary4"
WT4="$TMPROOT/p4-worktrees"
git init -q --bare "$REMOTE4"
git init -q -b main "$PRIMARY4"
assert_throwaway_repo "$PRIMARY4" "sweep fixture primary4"
g -C "$PRIMARY4" config user.email "guardtest@example.com"
g -C "$PRIMARY4" config user.name "guardtest"
g -C "$PRIMARY4" config commit.gpgsign false
# Explicit: the mode-only case is vacuous on a checkout that does not track the
# executable bit, and CI runners do not all agree on the default.
g -C "$PRIMARY4" config core.fileMode true
printf 'node_modules/\n.next/\n' > "$PRIMARY4/.gitignore"
echo seed > "$PRIMARY4/README.md"
g -C "$PRIMARY4" add .gitignore README.md
g -C "$PRIMARY4" commit -q -m seed
g -C "$PRIMARY4" remote add origin "$REMOTE4"
g -C "$PRIMARY4" push -q -u origin main
mkdir -p "$WT4"

STUB4="$TMPROOT/bin4"
mkdir -p "$STUB4"
cat > "$STUB4/gh" <<'STUB'
#!/usr/bin/env bash
if [ "${1:-}" = "pr" ] && [ "${2:-}" = "list" ]; then
  cat <<'JSON'
[{"number":940,"headRefName":"task/mode-only","state":"MERGED","mergedAt":"2026-09-01T00:00:00Z"},
 {"number":941,"headRefName":"task/symlink-nm","state":"MERGED","mergedAt":"2026-09-01T00:00:00Z"},
 {"number":942,"headRefName":"task/real-dirt","state":"MERGED","mergedAt":"2026-09-01T00:00:00Z"},
 {"number":943,"headRefName":"task/ignored-junk","state":"MERGED","mergedAt":"2026-09-01T00:00:00Z"},
 {"number":944,"headRefName":"task/orphan-livebranch","state":"MERGED","mergedAt":"2026-09-01T00:00:00Z"}]
JSON
  exit 0
fi
exit 1
STUB
chmod +x "$STUB4/gh"

# A passthrough `git` that fails ONE call the way the live run failed it.
#
# NEW-D's trigger cannot be built as a static fixture. `git worktree remove` ends
# in a recursive teardown that reports the errno of the operation that failed, and
# ENOTEMPTY only surfaces when rmdir(2) meets entries the walk never enumerated —
# i.e. a writer racing the delete, which is what a `next dev` watcher was doing to
# `.next` in the live case. Nine static shapes were probed on 2026-09-29 (plain
# ignored dir; ignored dir holding a `.git` dir, a `.git` gitlink file, a real
# nested repo, or a fifo; an unwritable subdir; an unwritable ignored dir; a
# `uchg` file; a `uchg` dir) — every one either removed cleanly or reported
# `Permission denied` / `Operation not permitted`, never `Directory not empty`.
#
# So the shape is injected rather than staged. This is not a weaker assertion: the
# sweeper runs its real code path end to end, on a real worktree, and the checks
# below still demand that the directory and its branch are actually gone. Only the
# one syscall outcome the fixture cannot stage is supplied. The message is the
# live one, quoted verbatim in the sweeper's own comment.
GIT_REAL="$(command -v git)"
cat > "$STUB4/git" <<STUB
#!/usr/bin/env bash
if [ "\${1:-}" = "worktree" ] && [ "\${2:-}" = "remove" ] \\
   && [ "\$(basename "\${3:-}")" = "ignored-junk" ] && [ -d "\${3:-}" ]; then
  echo "error: failed to delete '\${3}': Directory not empty" >&2
  exit 1
fi
exec "$GIT_REAL" "\$@"
STUB
chmod +x "$STUB4/git"

# A) MODE-ONLY — `git diff --numstat` is 0/0 and --summary says `mode change`.
g -C "$PRIMARY4" worktree add -q -b task/mode-only "$WT4/mode-only" main
printf '#!/bin/sh\n' > "$WT4/mode-only/s.sh"
chmod +x "$WT4/mode-only/s.sh"
g -C "$WT4/mode-only" add s.sh
g -C "$WT4/mode-only" commit -q -m "add s.sh"
chmod -x "$WT4/mode-only/s.sh"

# B) IGNORED SYMLINK — `.gitignore`'s `node_modules/` has a trailing slash, which
#    matches a directory but never a symlink, so porcelain reports `?? node_modules`.
mkdir -p "$TMPROOT/nm-store"
g -C "$PRIMARY4" worktree add -q -b task/symlink-nm "$WT4/symlink-nm" main
commit_on "$WT4/symlink-nm" "b.txt"
ln -s "$TMPROOT/nm-store" "$WT4/symlink-nm/node_modules"

# C) REAL DIRT — the guard must still hold, and must now say WHAT the dirt is.
g -C "$PRIMARY4" worktree add -q -b task/real-dirt "$WT4/real-dirt" main
commit_on "$WT4/real-dirt" "c.txt"
echo "unsaved work" >> "$WT4/real-dirt/c.txt"

# D) IGNORED BUILD OUTPUT — clean to git, and the one worktree whose removal the
#    stub above fails with the live `Directory not empty`. Real ignored output, so
#    the classification half (REMOVE, not KEEP) is genuinely exercised.
g -C "$PRIMARY4" worktree add -q -b task/ignored-junk "$WT4/ignored-junk" main
commit_on "$WT4/ignored-junk" "d.txt"
mkdir -p "$WT4/ignored-junk/.next"
echo build-output > "$WT4/ignored-junk/.next/chunk.js"

# E) ORPHAN whose LOCAL branch is still alive, remote absent, PR merged — the
#    exact shape that needed three runs. Linkage stripped, directory and branch kept.
g -C "$PRIMARY4" worktree add -q -b task/orphan-livebranch "$WT4/orphan-livebranch" main
commit_on "$WT4/orphan-livebranch" "e.txt"
rm -rf "$PRIMARY4/.git/worktrees/orphan-livebranch"
g -C "$PRIMARY4" worktree prune

sweep4() { (cd "$PRIMARY4" && PATH="$STUB4:$PATH" BRIK_WORKTREE_ROOT="$WT4" "$SWEEPER" "$@" 2>&1); }

# Preconditions. Both dirt shapes must actually reach porcelain, or A and B below
# would pass on a fixture that never reproduced the bug.
check "fixture: mode-only change reaches porcelain" " M s.sh" \
  "$(g -C "$WT4/mode-only" status --porcelain)"
check "fixture: symlinked node_modules reaches porcelain" "?? node_modules" \
  "$(g -C "$WT4/symlink-nm" status --porcelain)"

D4="$(sweep4)"
$VERBOSE && { echo "$D4"; echo; }
row4() { grep -E "^task/$1[[:space:]]" <<<"$D4"; }

check "mode-only dirt does not pin a merged worktree (#2782)" "REMOVE — PR #940 merged" "$(row4 mode-only)"
check "symlinked node_modules does not pin one either (#2782)" "REMOVE — PR #941 merged" "$(row4 symlink-nm)"
check "real uncommitted content still KEEPs" "KEEP — 1 uncommitted change(s)" "$(row4 real-dirt)"
check "…and the verdict names the dirt, so no hand git status" "c.txt" "$(row4 real-dirt)"
check "ignored build output leaves the worktree removable" "REMOVE — PR #943 merged" "$(row4 ignored-junk)"

# NEW-E, both directions. Without --delete-branches the live local branch is still
# the last handle on that work, so FLAG is correct and must not regress to REAP.
check "orphan with a live local branch FLAGs without --delete-branches" \
  "FLAG — local branch task/orphan-livebranch still exists" \
  "$(grep -E '^orphan-livebranch[[:space:]]' <<<"$D4")"

D4B="$(sweep4 --delete-branches)"
$VERBOSE && { echo "$D4B"; echo; }
check "…and REAPs in the SAME run once pass 3 will take that branch" \
  "REAP — PR #944 merged, branch deleted by pass 3 this run" \
  "$(grep -E '^orphan-livebranch[[:space:]]' <<<"$D4B")"

# Non-vacuity for the injected shape: the stub must actually refuse this one path,
# or the fallback assertion below would be green on a removal that never failed.
if REM_ERR="$(PATH="$STUB4:$PATH" git worktree remove "$WT4/ignored-junk" 2>&1)"; then
  echo -e "  ${RED}FAIL${NC}  stub: the remove succeeded; NEW-D's fallback is untested"; FAIL=$((FAIL+1))
else
  check "stub: the remove fails with 'Directory not empty'" "Directory not empty" "$REM_ERR"
fi
# …and it is surgical — every other worktree still goes through real git.
if PATH="$STUB4:$PATH" git -C "$PRIMARY4" worktree list >/dev/null 2>&1; then
  echo -e "  ${GREEN}PASS${NC}  stub passes every other git call through"; PASS=$((PASS+1))
else
  echo -e "  ${RED}FAIL${NC}  stub broke passthrough; the rest of this block is invalid"; FAIL=$((FAIL+1))
fi

# ── --apply: the fallback fires, and takes the branch with it ────────────────
A4="$(sweep4 --apply --delete-branches)"
$VERBOSE && { echo "$A4"; echo; }

check "the 'Directory not empty' shape reaches the rm fallback (NEW-D)" \
  "submodule fallback: rm + prune" "$A4"
if [ -d "$WT4/ignored-junk" ]; then
  echo -e "  ${RED}FAIL${NC}  the junk-bearing worktree survived --apply (NEW-D)"; FAIL=$((FAIL+1))
else
  echo -e "  ${GREEN}PASS${NC}  the junk-bearing worktree is gone after one --apply"; PASS=$((PASS+1))
fi

# #2719's core assertion: the branch, not just the directory. An ABSENCE bug, so
# assert the branch is GONE rather than that a success line was printed.
if g -C "$PRIMARY4" show-ref --verify --quiet refs/heads/task/ignored-junk; then
  echo -e "  ${RED}FAIL${NC}  branch survived the fallback path — the #2719 bug"; FAIL=$((FAIL+1))
else
  echo -e "  ${GREEN}PASS${NC}  branch deleted on the fallback path too (#2719)"; PASS=$((PASS+1))
fi
if grep -q 'branch NOT deleted' <<<"$A4"; then
  echo -e "  ${RED}FAIL${NC}  a branch delete failed and the run reported it (unexpected here)"; FAIL=$((FAIL+1))
else
  echo -e "  ${GREEN}PASS${NC}  no silent branch-delete failures in the run"; PASS=$((PASS+1))
fi

# #2719 secondary: the summary counter disagreed with the item list — "deleted
# 0/0 branch(es)" in the same run that printed "↳ branch deleted" twice.
if grep -qE 'landed branch\(es\)' <<<"$A4" && ! grep -qE '\+ 0 landed branch' <<<"$A4"; then
  echo -e "  ${GREEN}PASS${NC}  summary counts pass-1 landed branches (#2719)"; PASS=$((PASS+1))
else
  echo -e "  ${RED}FAIL${NC}  summary still omits pass-1 branch deletions (#2719)"; FAIL=$((FAIL+1))
fi

# NEW-E end to end: one --apply, not three. The orphan dir is gone AND so is its
# branch, from the same run.
if [ -d "$WT4/orphan-livebranch" ]; then
  echo -e "  ${RED}FAIL${NC}  orphan dir still needs a second --apply (NEW-E)"; FAIL=$((FAIL+1))
else
  echo -e "  ${GREEN}PASS${NC}  orphan reaped in ONE --apply, not three (NEW-E)"; PASS=$((PASS+1))
fi
if g -C "$PRIMARY4" show-ref --verify --quiet refs/heads/task/orphan-livebranch; then
  echo -e "  ${RED}FAIL${NC}  orphan's landed branch survived the same run (NEW-E)"; FAIL=$((FAIL+1))
else
  echo -e "  ${GREEN}PASS${NC}  …and its landed branch went with it"; PASS=$((PASS+1))
fi

# The guard is NARROWED, not weakened: real uncommitted work survives --apply.
if [ -d "$WT4/real-dirt" ]; then
  echo -e "  ${GREEN}PASS${NC}  a genuinely dirty worktree survives --apply"; PASS=$((PASS+1))
else
  echo -e "  ${RED}FAIL${NC}  --apply removed a worktree holding real uncommitted work"; FAIL=$((FAIL+1))
fi

# ── Pass 5: submodule gitlink drift vs. real work inside a submodule (#4919) ──
#
# bds-propagate advances foundations/brik-bds in the base branch; a worktree merges
# that in and its submodule checkout stays put, so ` M foundations/brik-bds` appears
# that nobody authored. `dirty_count` scored it real=1 → KEEP, and three worktrees
# were pinned that way, two with PRs merged ~23 days earlier. The removal fallback
# for "containing submodules" could never fire, because classification filtered the
# worktree out long before the removal loop.
#
# The carve-out is deliberately narrow, and the two negative controls below are the
# reason. THREE submodule states reach porcelain as the identical ` M <path>` line
# and only the first has nothing to lose (probed 2026-10-17):
#
#   pointer drift          :160000 160000 <src> 0000000 M      no work inside
#   content edited inside  :160000 160000 <src> <src>   M      REAL work
#   untracked file inside  (no --raw line at all)              REAL work
#
# A carve-out keyed on "the path is a gitlink" would delete B and C's work.
echo
echo -e "${YELLOW}▸ submodule gitlink drift vs. real work inside a submodule (#4919)${NC}"

SUBREMOTE="$TMPROOT/subsrc"
REMOTE5="$TMPROOT/remote5.git"
PRIMARY5="$TMPROOT/primary5"
WT5="$TMPROOT/p5-worktrees"

# The submodule source: two commits, so a checkout can sit at the older one.
git init -q -b main "$SUBREMOTE"
g -C "$SUBREMOTE" config user.email "guardtest@example.com"
g -C "$SUBREMOTE" config user.name "guardtest"
g -C "$SUBREMOTE" config commit.gpgsign false
echo v1 > "$SUBREMOTE/lib.txt"
g -C "$SUBREMOTE" add lib.txt
g -C "$SUBREMOTE" commit -q -m v1
SUB_OLD="$(g -C "$SUBREMOTE" rev-parse HEAD)"
echo v2 > "$SUBREMOTE/lib.txt"
g -C "$SUBREMOTE" commit -q -am v2

git init -q --bare "$REMOTE5"
git init -q -b main "$PRIMARY5"
assert_throwaway_repo "$PRIMARY5" "sweep fixture primary5"
g -C "$PRIMARY5" config user.email "guardtest@example.com"
g -C "$PRIMARY5" config user.name "guardtest"
g -C "$PRIMARY5" config commit.gpgsign false
# git >=2.38 refuses file:// submodules unless this is set (CVE-2022-39253).
g -C "$PRIMARY5" config protocol.file.allow always
echo seed > "$PRIMARY5/README.md"
g -C "$PRIMARY5" add README.md
g -C "$PRIMARY5" commit -q -m seed
g -C "$PRIMARY5" -c protocol.file.allow=always submodule add -q "$SUBREMOTE" vendor/sub
g -C "$PRIMARY5" commit -q -m "add submodule"
g -C "$PRIMARY5" remote add origin "$REMOTE5"
g -C "$PRIMARY5" push -q -u origin main
mkdir -p "$WT5"

STUB5="$TMPROOT/bin5"
mkdir -p "$STUB5"
cat > "$STUB5/gh" <<'STUB'
#!/usr/bin/env bash
if [ "${1:-}" = "pr" ] && [ "${2:-}" = "list" ]; then
  cat <<'JSON'
[{"number":950,"headRefName":"task/gitlink-drift","state":"MERGED","mergedAt":"2026-09-01T00:00:00Z"},
 {"number":951,"headRefName":"task/sub-content-dirt","state":"MERGED","mergedAt":"2026-09-01T00:00:00Z"},
 {"number":952,"headRefName":"task/sub-untracked","state":"MERGED","mergedAt":"2026-09-01T00:00:00Z"}]
JSON
  exit 0
fi
exit 1
STUB
chmod +x "$STUB5/gh"

# A) POINTER DRIFT — submodule populated, checkout rolled back to the older commit,
#    nothing edited inside. The live shape. Must not pin a merged worktree.
g -C "$PRIMARY5" worktree add -q -b task/gitlink-drift "$WT5/gitlink-drift" main
g -C "$WT5/gitlink-drift" -c protocol.file.allow=always submodule update -q --init vendor/sub
g -C "$WT5/gitlink-drift/vendor/sub" checkout -q "$SUB_OLD"

# B) CONTENT EDITED INSIDE the submodule — pointer matches, an uncommitted edit sits
#    in the submodule's own tree. Real work; must still KEEP.
g -C "$PRIMARY5" worktree add -q -b task/sub-content-dirt "$WT5/sub-content-dirt" main
g -C "$WT5/sub-content-dirt" -c protocol.file.allow=always submodule update -q --init vendor/sub
echo "unsaved work" >> "$WT5/sub-content-dirt/vendor/sub/lib.txt"

# C) UNTRACKED FILE INSIDE the submodule — reaches porcelain with NO --raw line at
#    all, so a carve-out reading only --raw would skip it silently. Must still KEEP.
g -C "$PRIMARY5" worktree add -q -b task/sub-untracked "$WT5/sub-untracked" main
g -C "$WT5/sub-untracked" -c protocol.file.allow=always submodule update -q --init vendor/sub
echo scratch > "$WT5/sub-untracked/vendor/sub/untracked.txt"

# Preconditions. All three must reach porcelain as the SAME line, or the three
# checks below would pass on a fixture that never reproduced the ambiguity.
check "fixture: pointer drift reaches porcelain" " M vendor/sub" \
  "$(g -C "$WT5/gitlink-drift" status --porcelain)"
check "fixture: submodule content edit reaches porcelain identically" " M vendor/sub" \
  "$(g -C "$WT5/sub-content-dirt" status --porcelain)"
check "fixture: untracked-in-submodule reaches porcelain identically" " M vendor/sub" \
  "$(g -C "$WT5/sub-untracked" status --porcelain)"
# And the discriminator itself must hold, or the carve-out is keying on nothing.
check "fixture: drift's raw diff carries an all-zero dst sha" "160000 160000" \
  "$(g -C "$WT5/gitlink-drift" diff --raw HEAD -- vendor/sub)"

D5="$( (cd "$PRIMARY5" && PATH="$STUB5:$PATH" BRIK_WORKTREE_ROOT="$WT5" "$SWEEPER" 2>&1) )"
$VERBOSE && { echo "$D5"; echo; }
row5() { grep -E "^task/$1[[:space:]]" <<<"$D5"; }

check "gitlink pointer drift does not pin a merged worktree (#4919)" \
  "REMOVE — PR #950 merged" "$(row5 gitlink-drift)"
check "an uncommitted edit INSIDE the submodule still KEEPs" \
  "KEEP — 1 uncommitted change(s)" "$(row5 sub-content-dirt)"
check "an untracked file INSIDE the submodule still KEEPs" \
  "KEEP — 1 uncommitted change(s)" "$(row5 sub-untracked)"

# ── Pass 6: a zero-commit worktree asks its ticket's claim (#4376) ───────────
#
# A worktree with no commits read `REVIEW — no commits yet (session may be
# mid-setup)` forever, a session five minutes old and one dead for weeks alike.
# The verdict now comes from the claim on the ticket new-task.sh recorded on the
# branch (`branch.<b>.brikTaskIssue`). Every marker below is written by
# issue-claim.sh's own claim_marker_body, so a change to the canonical marker
# shape breaks this suite rather than silently blinding the reaper.
#
# Branches are cut with an OLD committer date (the reflog's creation stamp) except
# zc-fresh-stale, which is the fail-open window: new-task.sh proceeds unclaimed when
# its claim write fails, so a stale claim on a minutes-old branch must not REMOVE.
echo
echo -e "${YELLOW}▸ zero-commit worktrees ask the ticket's claim (#4376)${NC}"

REMOTE6="$TMPROOT/remote6.git"
PRIMARY6="$TMPROOT/primary6"
WT6="$TMPROOT/p6-worktrees"
git init -q --bare "$REMOTE6"
git init -q -b main "$PRIMARY6"
assert_throwaway_repo "$PRIMARY6" "sweep fixture primary6"
g -C "$PRIMARY6" config user.email "guardtest@example.com"
g -C "$PRIMARY6" config user.name "guardtest"
g -C "$PRIMARY6" config commit.gpgsign false
echo seed > "$PRIMARY6/README.md"
g -C "$PRIMARY6" add README.md
g -C "$PRIMARY6" commit -q -m seed
g -C "$PRIMARY6" remote add origin "$REMOTE6"
g -C "$PRIMARY6" push -q -u origin main
mkdir -p "$WT6"

OLD_DATE="2026-01-01T00:00:00Z"
NOW_STAMP="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
HOUR_AGO="$(python3 -c 'import datetime as d; print((d.datetime.now(d.timezone.utc)-d.timedelta(hours=1)).strftime("%Y-%m-%dT%H:%M:%SZ"))')"
FUTURE="2099-01-01T00:00:00Z"

CLAIMS6="$TMPROOT/claims6"
mkdir -p "$CLAIMS6"
# One file per issue, holding what `gh api … --jq '… | .body | @json'` prints: one
# JSON string per marker comment. An empty file is a ticket with no marker.
claim_file() {  # $1=issue  $2=host  $3=branch cell  $4=Since
  # shellcheck source=/dev/null
  ( source "$(cd "$SCRIPT_DIR/.." && pwd)/lib/issue-claim.sh" \
      && claim_marker_body "$2" "$3" "$4" "sess-$1" ) \
    | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))' > "$CLAIMS6/$1"
}
claim_file 4601 claim-host "brikdesigns/brik-llm:task/zc-live" "$HOUR_AGO"
claim_file 4602 claim-host "brikdesigns/brik-llm:task/zc-stale" "$OLD_DATE"
: > "$CLAIMS6/4603"
claim_file 4604 claim-host "brikdesigns/brik-llm:task/somewhere-else" "$HOUR_AGO"
claim_file 4605 claim-host "brikdesigns/brik-llm:task/zc-fresh-stale" "$OLD_DATE"
claim_file 4607 claim-host "brikdesigns/brik-llm:(pending — not yet branched), brikdesigns/brik-llm:task/zc-qualified" "$NOW_STAMP"
claim_file 4608 claim-host "brikdesigns/brik-llm:task/zc-future" "$FUTURE"
export CLAIMS6

STUB6="$TMPROOT/bin6"
mkdir -p "$STUB6"
cat > "$STUB6/gh" <<'STUB'
#!/usr/bin/env bash
if [ "${1:-}" = "pr" ] && [ "${2:-}" = "list" ]; then
  [ "${STUB6_PR_FAIL:-0}" = "1" ] && { echo "gh: API rate limit exceeded" >&2; exit 1; }
  echo '[]'; exit 0
fi
if [ "${1:-}" = "api" ]; then
  path="${2:-}"
  num="$(printf '%s' "$path" | sed -n 's#^repos/.*/issues/\([0-9][0-9]*\)/comments$#\1#p')"
  # A bare ref must arrive as gh's own placeholder, a qualified one as itself.
  case "$num:$path" in
    4607:repos/brikdesigns/brik-llm/*) : ;;
    4607:*) echo "stub: 4607 expected the qualified path, got $path" >&2; exit 1 ;;
    *:'repos/{owner}/{repo}/'*) : ;;
    *) echo "stub: unexpected path $path" >&2; exit 1 ;;
  esac
  [ "$num" = "4606" ] && { echo "gh: HTTP 502: Bad Gateway" >&2; exit 1; }
  [ -r "$CLAIMS6/$num" ] && { cat "$CLAIMS6/$num"; exit 0; }
  echo "gh: Not Found (HTTP 404)" >&2; exit 1
fi
exit 1
STUB
chmod +x "$STUB6/gh"

zc_worktree() {  # $1=slug  $2=issue ref or ""  $3=branch-creation date or ""
  if [ -n "$3" ]; then
    GIT_COMMITTER_DATE="$3" g -C "$PRIMARY6" worktree add -q -b "task/$1" "$WT6/$1" main
  else
    g -C "$PRIMARY6" worktree add -q -b "task/$1" "$WT6/$1" main
  fi
  [ -n "$2" ] && g -C "$PRIMARY6" config "branch.task/$1.brikTaskIssue" "$2"
  return 0
}
zc_worktree zc-live        4601                       "$OLD_DATE"
zc_worktree zc-stale       4602                       "$OLD_DATE"
zc_worktree zc-absent      4603                       "$OLD_DATE"
zc_worktree zc-other       4604                       "$OLD_DATE"
zc_worktree zc-fresh-stale 4605                       ""
zc_worktree zc-unreadable  4606                       "$OLD_DATE"
zc_worktree zc-noref       ""                         "$OLD_DATE"
zc_worktree zc-qualified   "brikdesigns/brik-llm#4607" "$OLD_DATE"
zc_worktree zc-future      4608                       "$OLD_DATE"

# Preconditions: the old-branch fixtures must really read old, and none may carry a
# commit, or every verdict below would be testing some other band.
check "fixture: an old branch's reflog carries its 2026-01-01 creation" "@{1767225600}" \
  "$(g -C "$WT6/zc-stale" reflog show --date=unix --format='%gd' refs/heads/task/zc-stale)"
check "fixture: zero-commit branch reflog is creation-only" "branch: Created from" \
  "$(g -C "$WT6/zc-stale" reflog show --format='%gs' refs/heads/task/zc-stale)"

D6="$( (cd "$PRIMARY6" && PATH="$STUB6:$PATH" BRIK_WORKTREE_ROOT="$WT6" "$SWEEPER" 2>&1) )"
$VERBOSE && { echo "$D6"; echo; }
row6() { grep -E "^task/$1[[:space:]]" <<<"$D6"; }

check "live claim → KEEP, naming the holding host (AC2)" \
  "KEEP — claimed by claim-host 1h" "$(row6 zc-live)"
# No minute digit asserted: the claim is 1h old to the second, so a fast run reads
# `1h ago` and a slower one `1h0m ago`.
check "…and the claim's age and ticket" " ago on #4601, no commits yet" "$(row6 zc-live)"
check "claim older than CLAIM_STALE_SECONDS → REMOVE, naming its age (AC1)" \
  "REMOVE — no commits, claim stale (" "$(row6 zc-stale)"
check "…and the stale verdict states the window it was judged by" "> 12h)" "$(row6 zc-stale)"
check "no claim marker at all → REMOVE" \
  "REMOVE — no commits, claim absent on #4603 (no claim marker on the ticket)" "$(row6 zc-absent)"
check "a live claim naming ANOTHER branch is not this worktree's claim → REMOVE" \
  "claim absent on #4604 (the claim names other branches, not this one)" "$(row6 zc-other)"
check "stale claim on a minutes-old branch → REVIEW (the fail-open claim write)" \
  "but branch is only" "$(row6 zc-fresh-stale)"
check "unreadable claim → REVIEW, saying so" \
  "REVIEW — no commits yet, claim UNREADABLE on #4606: comments read failed: gh: HTTP 502" "$(row6 zc-unreadable)"
check "no ticket on the branch → REVIEW, keeping the old wording's prefix" \
  "REVIEW — no commits yet, no ticket recorded on the branch" "$(row6 zc-noref)"
check "owner/repo#N ticket record reads its own repo's claim → KEEP" \
  "KEEP — claimed by claim-host" "$(row6 zc-qualified)"
check "a far-future Since is UNREADABLE, not stale" \
  "claim UNREADABLE on #4608: claim Since $FUTURE is in the future" "$(row6 zc-future)"

# Positive control (AC3): the same instrument that REMOVEs zc-stale must say KEEP for
# the freshly-claimed zc-live, and never REMOVE any of the doubtful shapes.
for slug in zc-live zc-qualified zc-fresh-stale zc-unreadable zc-noref zc-future; do
  if grep -qE "^task/${slug}[[:space:]].*REMOVE" <<<"$D6"; then
    echo -e "  ${RED}FAIL${NC}  task/$slug must never read REMOVE"; FAIL=$((FAIL+1))
  else
    echo -e "  ${GREEN}PASS${NC}  task/$slug must never read REMOVE"; PASS=$((PASS+1))
  fi
done
check "removable count is 3 (zc-stale + zc-absent + zc-other)" "3 worktree(s) removable" "$D6"

# A window override moves the line: at 30 days the 2026-01-01 claim is still stale,
# and at 100 years it is live — proof the verdict reads CLAIM_STALE_SECONDS.
D6W="$( (cd "$PRIMARY6" && PATH="$STUB6:$PATH" BRIK_WORKTREE_ROOT="$WT6" \
  CLAIM_STALE_SECONDS=3153600000 "$SWEEPER" 2>&1) )"
check "CLAIM_STALE_SECONDS is honoured: a 100-year window makes the old claim live" \
  "KEEP — claimed by claim-host" "$(grep -E '^task/zc-stale[[:space:]]' <<<"$D6W")"

# gh pr list failing must not let a stale claim REMOVE: no PR is an absence the
# degraded run never established (#3603).
D6P="$( (cd "$PRIMARY6" && PATH="$STUB6:$PATH" BRIK_WORKTREE_ROOT="$WT6" STUB6_PR_FAIL=1 "$SWEEPER" 2>&1) )"
check "stale claim + unreadable PR state → REVIEW, not REMOVE" \
  "but PR state UNREADABLE" "$(grep -E '^task/zc-stale[[:space:]]' <<<"$D6P")"
check "…and nothing is removable in that degraded run" "0 worktree(s) removable" "$D6P"

# --apply actually removes the stale one and leaves the live one standing.
A6="$( (cd "$PRIMARY6" && PATH="$STUB6:$PATH" BRIK_WORKTREE_ROOT="$WT6" "$SWEEPER" --apply 2>&1) )"
$VERBOSE && { echo "$A6"; echo; }
if [ ! -d "$WT6/zc-stale" ] && [ -d "$WT6/zc-live" ] && [ -d "$WT6/zc-fresh-stale" ]; then
  echo -e "  ${GREEN}PASS${NC}  --apply removed the stale-claim worktree and kept the live and fresh ones"; PASS=$((PASS+1))
else
  echo -e "  ${RED}FAIL${NC}  --apply: zc-stale present=$([ -d "$WT6/zc-stale" ] && echo y || echo n) zc-live present=$([ -d "$WT6/zc-live" ] && echo y || echo n) zc-fresh-stale present=$([ -d "$WT6/zc-fresh-stale" ] && echo y || echo n)"
  FAIL=$((FAIL+1))
fi

# ── Harness worktrees and build-output orphans (#4258, #4199) ────────────────
# #4258: a merged worktree under <primary>/.claude/worktrees is outside the root the
# removal pass is guarded to, so it was counted removable and then refused. It must
# read REVIEW and stay out of the removable count; a merged worktree under the real
# root is the control that the REMOVE path still works in the same run.
# #4199: a no-.git dir holding only build output is reapable; one stray source file,
# or a file under supabase/, keeps it FLAG-only.
echo
echo -e "${YELLOW}▸ harness worktrees + build-output orphans (#4258, #4199)${NC}"

REMOTE7="$TMPROOT/remote7.git"
PRIMARY7="$TMPROOT/primary7"
WT7="$TMPROOT/primary7-worktrees"
git init -q --bare "$REMOTE7"
git init -q -b main "$PRIMARY7"
assert_throwaway_repo "$PRIMARY7" "sweep fixture primary7"
g -C "$PRIMARY7" config user.email "guardtest@example.com"
g -C "$PRIMARY7" config user.name "guardtest"
g -C "$PRIMARY7" config commit.gpgsign false
echo seed > "$PRIMARY7/README.md"
g -C "$PRIMARY7" add README.md
g -C "$PRIMARY7" commit -q -m seed
g -C "$PRIMARY7" remote add origin "$REMOTE7"
g -C "$PRIMARY7" push -q -u origin main
mkdir -p "$WT7" "$PRIMARY7/.claude/worktrees"

# Each is merged by fast-forward, so only the PATH separates the two verdicts.
for spec in "agent-merged:$PRIMARY7/.claude/worktrees/agent-merged" "normal-merged:$WT7/normal-merged"; do
  slug="${spec%%:*}"; dest="${spec#*:}"
  g -C "$PRIMARY7" fetch -q origin main
  g -C "$PRIMARY7" worktree add -q -b "task/$slug" "$dest" origin/main
  commit_on "$dest" "$slug.txt"
  g -C "$PRIMARY7" push -q origin "task/$slug:main"
done
g -C "$PRIMARY7" fetch -q origin main

mk_orphan() {  # $1=slug  $2..=paths to create (trailing / = directory)
  local slug="$1"; shift
  mkdir -p "$WT7/$slug"
  for rel in "$@"; do
    case "$rel" in
      */) mkdir -p "$WT7/$slug/$rel" ;;
      *)  mkdir -p "$WT7/$slug/$(dirname "$rel")"; echo x > "$WT7/$slug/$rel" ;;
    esac
  done
}
mk_orphan orph-build   .next/cache/a.js .source/b.json node_modules/m/index.js supabase/migrations/
mk_orphan orph-src     .next/cache/a.js src/app.ts
mk_orphan orph-supa    .next/cache/a.js supabase/seed.sql
mk_orphan orph-other   node_modules/m/index.js .env

STUB7="$TMPROOT/bin7"
mkdir -p "$STUB7"
# shellcheck disable=SC2016  # the stub's ${1:-} must stay literal
printf '%s\n' '#!/usr/bin/env bash' \
  'if [ "${1:-}" = "pr" ] && [ "${2:-}" = "list" ]; then echo "[]"; exit 0; fi' 'exit 0' > "$STUB7/gh"
chmod +x "$STUB7/gh"

D7="$( (cd "$PRIMARY7" && PATH="$STUB7:$PATH" BRIK_WORKTREE_ROOT="$WT7" "$SWEEPER" 2>&1) )"
$VERBOSE && { echo "$D7"; echo; }
check "harness worktree → REVIEW, outside reaper scope (#4258)" "REVIEW — harness-managed" "$(grep -E '^task/agent-merged[[:space:]]' <<<"$D7")"
check "control — a merged worktree under the real root still REMOVEs" "REMOVE — merged into main" "$(grep -E '^task/normal-merged[[:space:]]' <<<"$D7")"
check "only the real-root worktree is counted removable" "1 worktree(s) removable" "$D7"
check "build-output-only orphan → REAP (#4199)" "REAP — no .git, holds only build output" "$(grep -E '^orph-build[[:space:]]' <<<"$D7")"
check "orphan with a source file → still FLAG" "FLAG — not a worktree (no .git)" "$(grep -E '^orph-src[[:space:]]' <<<"$D7")"
check "orphan with a file under supabase/ → still FLAG" "FLAG — not a worktree (no .git)" "$(grep -E '^orph-supa[[:space:]]' <<<"$D7")"
check "orphan with an unlisted top-level file → still FLAG" "FLAG — not a worktree (no .git)" "$(grep -E '^orph-other[[:space:]]' <<<"$D7")"
check "exactly one orphan is reapable" "1 orphan(s) reapable" "$D7"

A7="$( (cd "$PRIMARY7" && PATH="$STUB7:$PATH" BRIK_WORKTREE_ROOT="$WT7" "$SWEEPER" --apply 2>&1) )"
$VERBOSE && { echo "$A7"; echo; }
if [ ! -d "$WT7/orph-build" ] && [ ! -d "$WT7/normal-merged" ] \
   && [ -d "$WT7/orph-src" ] && [ -d "$WT7/orph-supa" ] && [ -d "$WT7/orph-other" ] \
   && [ -d "$PRIMARY7/.claude/worktrees/agent-merged" ]; then
  echo -e "  ${GREEN}PASS${NC}  --apply reaped the build-output orphan and the real-root worktree, kept the rest"; PASS=$((PASS+1))
else
  echo -e "  ${RED}FAIL${NC}  --apply: orph-build=$([ -d "$WT7/orph-build" ] && echo kept || echo gone) normal-merged=$([ -d "$WT7/normal-merged" ] && echo kept || echo gone) orph-src=$([ -d "$WT7/orph-src" ] && echo kept || echo gone) agent-merged=$([ -d "$PRIMARY7/.claude/worktrees/agent-merged" ] && echo kept || echo gone)"
  FAIL=$((FAIL+1))
fi
A7B="$( (cd "$PRIMARY7" && PATH="$STUB7:$PATH" BRIK_WORKTREE_ROOT="$WT7" "$SWEEPER" --apply 2>&1) )"
check "a second --apply converges: nothing removable" "0 worktree(s) removable" "$A7B"
check "…and no orphan reapable" "0 orphan(s) reapable" "$A7B"

# #4258 AC: the rm guard is unchanged for a path outside BOTH roots. A submodule-bearing
# merged worktree is the only shape that reaches the guarded fallback (plain
# `git worktree remove` refuses it), so put one outside both and require the refusal.
g -C "$PRIMARY7" reset -q --hard origin/main
g -C "$PRIMARY7" -c protocol.file.allow=always submodule add -q "$SUBREMOTE" foundations/sub >/dev/null 2>&1 || true
g -C "$PRIMARY7" commit -q -m "add submodule" >/dev/null 2>&1 || true
g -C "$PRIMARY7" push -q origin main
g -C "$PRIMARY7" fetch -q origin main
OUTSIDE7="$TMPROOT/outside7-elsewhere"
g -C "$PRIMARY7" worktree add -q -b task/outside-merged "$OUTSIDE7" origin/main
g -C "$OUTSIDE7" -c protocol.file.allow=always submodule update --init --recursive >/dev/null 2>&1 || true
commit_on "$OUTSIDE7" "outside.txt"
g -C "$PRIMARY7" push -q origin task/outside-merged:main
g -C "$PRIMARY7" fetch -q origin main
if [ -z "$(find "$OUTSIDE7/foundations/sub" -mindepth 1 -maxdepth 1 2>/dev/null)" ]; then
  echo -e "  ${RED}FAIL${NC}  fixture: outside-both-roots submodule never populated — guard case not reproduced"; FAIL=$((FAIL+1))
fi
O7="$( (cd "$PRIMARY7" && PATH="$STUB7:$PATH" BRIK_WORKTREE_ROOT="$WT7" "$SWEEPER" --apply 2>&1) )"
$VERBOSE && { echo "$O7"; echo; }
check "rm guard still refuses a path outside both roots" "refusing to rm outside" "$O7"
if [ -d "$OUTSIDE7" ] && [ -d "$PRIMARY7/.claude/worktrees/agent-merged" ]; then
  echo -e "  ${GREEN}PASS${NC}  …and nothing outside \$WORKTREE_ROOT was removed"; PASS=$((PASS+1))
else
  echo -e "  ${RED}FAIL${NC}  a path outside \$WORKTREE_ROOT was removed"; FAIL=$((FAIL+1))
fi

echo
if [ "$FAIL" -eq 0 ]; then
  echo -e "${GREEN}✓ ${PASS} passed${NC}"
  exit 0
fi
echo -e "${RED}✗ ${FAIL} failed, ${PASS} passed${NC}"
exit 1
