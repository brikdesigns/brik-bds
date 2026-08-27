#!/usr/bin/env bash
# Contract gate for pr-task.sh --dry-run (#2076).
#
# The flag exists because this script's gates could not be exercised without
# doing the thing they gate: the story gate only fires on a components/** diff
# and, once satisfied, the script ran straight through to `git push` +
# `gh pr create`. Probing its wording therefore opened a real PR — #2074, titled
# `tmp: probe`, recovered with a revert commit because force-push and
# branch-delete are both disallowed.
#
# The load-bearing assertion is NOT "the flag is accepted". A flag that parses
# and is then ignored reproduces the exact bug while reporting success. So the
# assertions here are about what did NOT happen:
#
#   1. No `git push` reached the remote — checked by reading the bare remote's
#      refs, not by trusting stdout. A stub could lie; the remote cannot.
#   2. No `gh pr create` was invoked — checked against a call log written by the
#      `gh` stub, so an added code path that creates a PR before the dry-run
#      guard fails here.
#   3. Local HEAD is unmoved. The base-sync merge runs after the guard; if it
#      ever moves above it, a "dry" run silently rewrites the operator's branch.
#   4. The dry run still PRINTS the resolved title, labels and body. A no-op that
#      reports nothing is not a probe, and the whole point is previewing what a
#      real run would open.
#   5. The story gate's two non-interactive branches are still reachable under
#      the flag — that gate's message is what #1967, #1110 and #1058 each edited
#      blind.
#
# No network: a throwaway repo with a bare origin, fake `gh` on PATH. The unset
# below is per #1539 — a test invoked from a git hook inherits GIT_DIR, which is
# how the sibling overlap-filters test once rewrote refs in the live repo.
#
# Run: bash scripts/__tests__/test-pr-task-dry-run.sh

set -u
unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE GIT_COMMON_DIR GIT_NAMESPACE \
      GIT_OBJECT_DIRECTORY GIT_ALTERNATE_OBJECT_DIRECTORIES

SCRIPTS="$(cd "$(dirname "$0")/.." && pwd)"
[ -f "$SCRIPTS/pr-task.sh" ] || { echo "pr-task.sh not found under $SCRIPTS"; exit 1; }

PASS=0; FAIL=0; FAILED_CASES=()
assert_eq() {
  local label="$1" want="$2" got="$3"
  if [ "$want" = "$got" ]; then PASS=$((PASS+1)); echo "  ✓ $label";
  else FAIL=$((FAIL+1)); FAILED_CASES+=("$label"); echo "  ✗ $label"; echo "      want: [$want]"; echo "      got:  [$got]"; fi
}

TMPROOT="$(mktemp -d "${TMPDIR:-/tmp}/brik-pr-task-dry-XXXXXXXX")"
trap 'rm -rf "$TMPROOT"' EXIT
case "$TMPROOT" in
  /*/brik-pr-task-dry-*) : ;;
  *) echo "refusing to run: TMPROOT looks wrong ($TMPROOT)"; exit 1 ;;
esac

GH_LOG="$TMPROOT/gh-calls.log"
: > "$GH_LOG"

# ── Stubs: no network. `gh` logs every call, then answers the few reads
#    pr-task.sh makes before the dry-run guard. `pr create` is logged and
#    deliberately still "succeeds" — a stub that failed would mask the bug by
#    aborting the run, and this test asserts the call never happens at all.
mkdir -p "$TMPROOT/bin"
cat > "$TMPROOT/bin/gh" <<FAKE
#!/usr/bin/env bash
echo "\$*" >> "$GH_LOG"
case "\$1 \${2:-}" in
  "label list")  printf 'area:tooling\nsize:s\ntheme:tech-debt\nbug\n' ;;
  "issue view")  printf 'area:tooling\nsize:s\n' ;;
  "pr list")     printf '' ;;
  "pr view")     printf '' ;;
  "api graphql") printf '{}' ;;
  "pr create")   printf 'https://github.com/x/y/pull/999\n' ;;
esac
exit 0
FAKE
printf '#!/usr/bin/env bash\nexit 0\n' > "$TMPROOT/bin/npm"
chmod +x "$TMPROOT/bin"/*

# ── Fixture: a task branch, one commit ahead, with a bare origin ──
# COMPONENT decides whether the branch carries a components/** diff, i.e.
# whether the story gate fires at all.
build_repo() {
  local root="$1" component="$2"
  local remote="$root/remote.git" primary="$root/brik-bds"
  rm -rf "$root"; mkdir -p "$root"
  git init -q --bare "$remote"
  git -C "$remote" symbolic-ref HEAD refs/heads/main
  git init -q -b main "$primary"
  (
    cd "$primary" || exit 1
    git config user.email t@example.com; git config user.name Test
    git config commit.gpgsign false
    mkdir -p scripts/lib components/ui/Badge
    cp "$SCRIPTS/pr-task.sh" scripts/
    cp "$SCRIPTS"/lib/*.sh scripts/lib/ 2>/dev/null || true
    chmod +x scripts/pr-task.sh
    echo '{}' > package.json
    echo 'export const Badge = () => null' > components/ui/Badge/Badge.tsx
    git add -A; git commit -qm init
    git remote add origin "$remote"
    git push -q origin main
    git checkout -q -b task/dry-run-probe
    if [ "$component" = "component" ]; then
      echo '// touched' >> components/ui/Badge/Badge.tsx
    else
      echo 'docs' > NOTES.md
    fi
    git add -A
    git commit -qm "fix(tooling): probe the dry run (#2076)"
    git fetch -q origin
  ) >/dev/null 2>&1
  echo "$primary"
}

# Runs pr-task.sh with NO gate flags set, whatever the caller's environment.
#
# `env -u` is the whole point (#2083). Case 3 asserts the story gate blocks when
# STORY_VERIFIED is absent, but it can only assert that if it controls the
# variable. Inheriting it from the caller made this suite fail for the one
# workflow the flag exists to serve: an agent pushing a component diff has to
# export STORY_VERIFIED=1 to clear pr-task.sh:160, and that export then flipped
# Case 3's branch and failed the pre-push suite pr-task.sh itself runs. Neither
# setting nor unsetting the flag could get a component diff pushed.
#
# CI never exports these, so the leak was invisible there — it only bit the
# agent path. SKIP_STORY_CHECK and PR_TASK_DRY_RUN are cleared for the same
# reason: each one leaking would silently rewrite the branch under test in
# exactly the same way. The cases that WANT a flag set it inline on their own
# invocation rather than going through this helper.
run_dry() {
  local primary="$1"; shift
  ( cd "$primary" && PATH="$TMPROOT/bin:$PATH" \
      env -u STORY_VERIFIED -u SKIP_STORY_CHECK -u PR_TASK_DRY_RUN \
      ./scripts/pr-task.sh "$@" 2>&1 </dev/null )
}

remote_has_branch() {
  local primary="$1"
  if git -C "$primary/../remote.git" show-ref --quiet refs/heads/task/dry-run-probe; then
    echo yes
  else
    echo no
  fi
}

gh_called() { grep -q "^pr create" "$GH_LOG" && echo yes || echo no; }

# ══ Case 1 — non-component diff: the dry run stops before every mutation ══
echo "── --dry-run on a non-component diff ──"
: > "$GH_LOG"
PRIMARY="$(build_repo "$TMPROOT/plain" plain)"
HEAD_BEFORE="$(git -C "$PRIMARY" rev-parse HEAD)"
OUT="$(run_dry "$PRIMARY" --dry-run)"
RC=$?

assert_eq "exits 0"                       "0"    "$RC"
assert_eq "nothing pushed to origin"      "no"   "$(remote_has_branch "$PRIMARY")"
assert_eq "gh pr create never invoked"    "no"   "$(gh_called)"
assert_eq "local HEAD unmoved"            "$HEAD_BEFORE" "$(git -C "$PRIMARY" rev-parse HEAD)"

case "$OUT" in *"Dry run"*) B=yes ;; *) B=no ;; esac
assert_eq "prints the dry-run banner"     "yes"  "$B"
case "$OUT" in *"fix(tooling): probe the dry run"*) T=yes ;; *) T=no ;; esac
assert_eq "prints the resolved title"     "yes"  "$T"
case "$OUT" in *"area:tooling"*) L=yes ;; *) L=no ;; esac
assert_eq "prints the resolved labels"    "yes"  "$L"
case "$OUT" in *"## Summary"*) BD=yes ;; *) BD=no ;; esac
assert_eq "prints the resolved body"      "yes"  "$BD"
# The body must carry the real issue linkage, not a placeholder — that line is
# what pr-issue-link-gate reads, so previewing it is half the point.
case "$OUT" in *"#2076"*) IL=yes ;; *) IL=no ;; esac
assert_eq "body carries the issue link"   "yes"  "$IL"

# ══ Case 2 — the env form is honoured identically ══
echo "── PR_TASK_DRY_RUN=1 (env form, for callers that cannot edit argv) ──"
: > "$GH_LOG"
PRIMARY="$(build_repo "$TMPROOT/env" plain)"
OUT="$( cd "$PRIMARY" && PATH="$TMPROOT/bin:$PATH" PR_TASK_DRY_RUN=1 \
          ./scripts/pr-task.sh 2>&1 </dev/null )"
assert_eq "exits 0"                       "0"    "$?"
assert_eq "nothing pushed to origin"      "no"   "$(remote_has_branch "$PRIMARY")"
assert_eq "gh pr create never invoked"    "no"   "$(gh_called)"
case "$OUT" in *"Dry run"*) B=yes ;; *) B=no ;; esac
assert_eq "prints the dry-run banner"     "yes"  "$B"

# ══ Case 3 — the story gate still gates. This is the branch #1967/#1110/#1058
#    each edited without being able to run it. ══
echo "── the story gate is reachable under --dry-run (component diff) ──"
: > "$GH_LOG"
PRIMARY="$(build_repo "$TMPROOT/gate" component)"
OUT="$(run_dry "$PRIMARY" --dry-run)"
RC=$?
assert_eq "blocks with no STORY_VERIFIED" "1"    "$RC"
case "$OUT" in *"the Storybook gate can't be answered here"*) G=yes ;; *) G=no ;; esac
assert_eq "prints the gate message"       "yes"  "$G"
# The gate must not name Chromatic — #1967 removed that, and a revert would be
# invisible without an assertion.
case "$OUT" in *"npm run chromatic"*) C=yes ;; *) C=no ;; esac
assert_eq "gate does NOT name chromatic"  "no"   "$C"
assert_eq "still nothing pushed"          "no"   "$(remote_has_branch "$PRIMARY")"

# ══ Case 3b — the suite is insulated from the caller's own gate flags (#2083).
#    Case 3 above passes trivially when nothing is exported, which is why the
#    leak survived: CI never sets these. This repeats it with the flag set the
#    way an agent pushing a component diff must set it, and asserts the SAME
#    block. Without this, `env -u` can be dropped from run_dry and every run
#    still looks green until an agent tries to push. ══
echo "── the story gate blocks even when the CALLER exported STORY_VERIFIED ──"
: > "$GH_LOG"
PRIMARY="$(build_repo "$TMPROOT/gateleak" component)"
OUT="$( STORY_VERIFIED=1 SKIP_STORY_CHECK=1 run_dry "$PRIMARY" --dry-run )"
RC=$?
assert_eq "still blocks with a leaked flag" "1"  "$RC"
case "$OUT" in *"the Storybook gate can't be answered here"*) L=yes ;; *) L=no ;; esac
assert_eq "still prints the gate message"   "yes" "$L"

echo "── STORY_VERIFIED=1 clears the gate, dry run still pushes nothing ──"
: > "$GH_LOG"
PRIMARY="$(build_repo "$TMPROOT/gatepass" component)"
OUT="$( cd "$PRIMARY" && PATH="$TMPROOT/bin:$PATH" STORY_VERIFIED=1 \
          ./scripts/pr-task.sh --dry-run 2>&1 </dev/null )"
assert_eq "exits 0"                       "0"    "$?"
case "$OUT" in *"STORY_VERIFIED=1 — proceeding"*) P=yes ;; *) P=no ;; esac
assert_eq "gate reports proceeding"       "yes"  "$P"
assert_eq "nothing pushed to origin"      "no"   "$(remote_has_branch "$PRIMARY")"
assert_eq "gh pr create never invoked"    "no"   "$(gh_called)"

# ══ Case 4 — the guard sits ABOVE the push, not merely before `gh pr create`.
#    Reading the script text is the only way to assert ordering without doing a
#    real push; a reordering that puts `git push` first would pass every
#    behavioural assertion above only while the stub happened to short-circuit. ══
echo "── the dry-run guard precedes the push in source order ──"
# Comment lines are stripped first. Without that, the first `gh pr create` hit is
# this script's own usage header describing the bug — so the ordering assertion
# passed against prose rather than against the invocation. Caught by this test
# failing on its first run.
code_line() {
  grep -vn '^[[:space:]]*#' "$SCRIPTS/pr-task.sh" | grep "$1" | head -1 | cut -d: -f1
}
GUARD_LINE=$(code_line 'if \[ "\$DRY_RUN" = "1" \]; then')
PUSH_LINE=$(code_line 'git push -u origin')
CREATE_LINE=$(code_line 'gh pr create')
MERGE_LINE=$(code_line 'git merge --no-edit')
assert_eq "guard exists"                  "yes"  "$([ -n "$GUARD_LINE" ] && echo yes || echo no)"
assert_eq "guard before git push"         "yes"  "$([ -n "$GUARD_LINE" ] && [ -n "$PUSH_LINE" ] && [ "$GUARD_LINE" -lt "$PUSH_LINE" ] && echo yes || echo no)"
assert_eq "guard before gh pr create"     "yes"  "$([ -n "$GUARD_LINE" ] && [ -n "$CREATE_LINE" ] && [ "$GUARD_LINE" -lt "$CREATE_LINE" ] && echo yes || echo no)"
assert_eq "guard before base-sync merge"  "yes"  "$([ -n "$GUARD_LINE" ] && [ -n "$MERGE_LINE" ] && [ "$GUARD_LINE" -lt "$MERGE_LINE" ] && echo yes || echo no)"

echo ""
echo "──────────────────────────────────────────"
echo "  $PASS passed, $FAIL failed"
if [ "$FAIL" -gt 0 ]; then
  printf '    ✗ %s\n' "${FAILED_CASES[@]}"
  exit 1
fi
exit 0
