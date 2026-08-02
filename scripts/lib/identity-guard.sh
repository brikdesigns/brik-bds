#!/usr/bin/env bash
# identity-guard.sh — keep test-fixture git identity out of the live repo (#1634).
#
# `git -C "" config user.name Test` is a silent no-op on the path argument, so it
# writes to whatever repo is current. Worktrees share the primary's .git/config,
# so one such call pollutes every checkout at once — and nothing notices until a
# commit reaches main with the wrong author. `68ab0ac` on main is one.
#
# Two halves, because the leak has two ends:
#   - check_commit_identity  — pre-commit: refuse to author as a fixture.
#   - assert_throwaway_repo  — test fixtures: refuse to `git -C` a live repo.
#
# Sibling class: #1539 (a test inheriting GIT_DIR rewrote refs in the live repo).
#
# Sourced, not executed. No side effects at source time.

# RFC 2606 reserves these for documentation and examples — no real committer
# uses one, which is exactly why fixtures reach for them.
_IG_RESERVED_DOMAINS='example\.(com|org|net)$'
# Bare fixture names. Deliberately exact-match: "Testa Nguyen" is a person.
_IG_FIXTURE_NAMES='^(test|testing|fixture|ci|dummy|foo)$'

_ig_physical() { (cd "${1:-/nonexistent}" 2>/dev/null && pwd -P) || printf ''; }

# True when the repo containing $PWD is a throwaway under $TMPDIR. macOS hands
# back /var/folders/… from mktemp while git resolves /private/var, so compare
# physical paths on both sides.
_ig_in_tmpdir() {
  local top tmp
  top="$(git rev-parse --show-toplevel 2>/dev/null)" || return 1
  [ -n "$top" ] || return 1
  top="$(_ig_physical "$top")"
  tmp="$(_ig_physical "${TMPDIR:-/tmp}")"
  [ -n "$top" ] && [ -n "$tmp" ] || return 1
  case "$top" in "$tmp"/*|"$tmp") return 0 ;; *) return 1 ;; esac
}

# check_commit_identity — 0 when the effective identity is a real one.
#
# Reads the EFFECTIVE identity (`git config user.email`), not the local layer, so
# it fires however the pollution got there. Quiet inside a throwaway repo: the
# fixtures below are supposed to set a fake identity on themselves.
#
# Escape hatch: BDS_ALLOW_TEST_IDENTITY=1.
check_commit_identity() {
  [ "${BDS_ALLOW_TEST_IDENTITY:-}" = "1" ] && return 0
  _ig_in_tmpdir && return 0

  local name email bad=""
  name="$(git config user.name 2>/dev/null || true)"
  email="$(git config user.email 2>/dev/null || true)"

  if printf '%s' "$email" | grep -qEi "@${_IG_RESERVED_DOMAINS}"; then
    bad="email '${email}' is in an RFC 2606 reserved domain"
  elif printf '%s' "$name" | grep -qEi "$_IG_FIXTURE_NAMES"; then
    bad="name '${name}' is a test-fixture placeholder"
  fi

  [ -z "$bad" ] && return 0

  echo "" >&2
  echo "✗ Refusing to commit as a test identity — ${bad}." >&2
  echo "" >&2
  echo "  A test fixture leaked its identity into this repo's config. Worktrees" >&2
  echo "  share the primary's .git/config, so every checkout inherits it — that" >&2
  echo "  is how 68ab0ac reached main authored by Test <t@example.com> (#1634)." >&2
  echo "" >&2
  echo "  Fix:" >&2
  echo "    git config --local --unset user.email" >&2
  echo "    git config --local --unset user.name" >&2
  echo "" >&2
  echo "  Then confirm your real identity resolves:" >&2
  echo "    git config user.name && git config user.email" >&2
  echo "" >&2
  echo "  Genuinely committing as a fixture? Re-run with BDS_ALLOW_TEST_IDENTITY=1." >&2
  return 1
}

# assert_throwaway_repo <path> [label] — abort unless <path> resolves to a git
# repo whose git-dir lives under $TMPDIR.
#
# Call this in a test fixture BEFORE any `git -C "$path"` write. It closes two
# escapes at once:
#
#   - Empty path. `git -C ""` is a no-op on the path argument, so the write lands
#     in whatever repo is current — the #1634 leak.
#   - Leaked git env. GIT_DIR surviving the fixture's `unset` makes a correct
#     `-C` argument resolve somewhere else entirely — the #1539 leak. Checking
#     the RESOLVED git-dir rather than the path is what catches that one, so do
#     not simplify this to a path prefix test.
#
# Physical paths on both sides: macOS `mktemp -d` hands back /var/folders/… while
# `--absolute-git-dir` resolves the /var → /private/var symlink, and a literal
# prefix match would report an escape that never happened.
assert_throwaway_repo() {
  local path="${1:-}" label="${2:-fixture repo}"

  if [ -z "$path" ]; then
    echo "✗ ${label}: refusing to run — path is empty." >&2
    echo "  \`git -C ''\` is a no-op on the path and would write to the live repo." >&2
    exit 1
  fi

  if [ ! -d "$path" ]; then
    echo "✗ ${label}: refusing to run — '${path}' does not exist." >&2
    exit 1
  fi

  local gitdir tmp
  gitdir="$(cd "$path" && git rev-parse --absolute-git-dir 2>/dev/null)" || gitdir=""
  tmp="$(_ig_physical "${TMPDIR:-/tmp}")"

  if [ -z "$gitdir" ]; then
    echo "✗ ${label}: refusing to run — '${path}' is not a git repository." >&2
    exit 1
  fi

  case "$gitdir" in
    "$tmp"/*) : ;;
    *)
      echo "✗ ${label}: refusing to run — git-dir escaped the sandbox." >&2
      echo "  expected under: ${tmp}" >&2
      echo "  actually:       ${gitdir}" >&2
      echo "  A fixture must never write git config or refs outside its sandbox." >&2
      exit 1
      ;;
  esac
}
