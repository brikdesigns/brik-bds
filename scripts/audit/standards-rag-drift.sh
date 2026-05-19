#!/usr/bin/env bash
# standards-rag-drift.sh — Block commits/PRs that edit .claude/standards/*.md
# without updating the paired brik-rag corpus.
#
# Adapted from brik-llm's scripts/audit/coding-standards-rag-drift.sh — same
# hash-file pattern, generalised to the multi-file standards set.
#
# Local: pre-commit hook runs `scripts/run-standards-ingest.sh` on the staged
# set, which auto-updates `scripts/.standards-hashes`. This drift check
# verifies the hash file in the PR matches the standards content — catches
# web-UI edits, --no-verify bypasses, and forks where the local hook never
# ran.
#
# Modes:
#   --check                 Read-only: compare working-tree standards against
#                           the recorded hash file. Exit 1 on any drift.
#   --staged                Pre-commit defensive check: if a standard is
#                           staged but the hash file is not (or the staged
#                           hash file doesn't match staged standards), fail.
#                           Belt-and-suspenders alongside run-standards-ingest.
#   --ci --base <sha> --head <sha>
#                           PR-gate mode. If any .claude/standards/*.md
#                           changed in <base>..<head>, fail unless the hash
#                           file in <head> matches the standards in <head>.

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
STANDARDS_DIR="$REPO_ROOT/.claude/standards"
HASH_FILE_REL="scripts/.standards-hashes"
HASH_FILE="$REPO_ROOT/$HASH_FILE_REL"

MODE="check"
BASE=""
HEAD=""

while [ $# -gt 0 ]; do
  case "$1" in
    --check)   MODE="check";  shift ;;
    --staged)  MODE="staged"; shift ;;
    --ci)      MODE="ci";     shift ;;
    --base)    BASE="$2";     shift 2 ;;
    --head)    HEAD="$2";     shift 2 ;;
    -h|--help) sed -n '2,24p' "$0"; exit 0 ;;
    *)         echo "standards-rag-drift: unknown arg: $1" >&2; exit 2 ;;
  esac
done

# Compute the canonical hash-line for one standard.
compute_line() {
  local path="$1"
  local rel="${path#$REPO_ROOT/}"
  local h
  h="$(shasum -a 256 "$path" | awk '{print $1}')"
  printf '%s  %s\n' "$h" "$rel"
}

# Compute expected hash file body for working tree.
compute_expected() {
  for f in "$STANDARDS_DIR"/*.md; do
    [ -f "$f" ] || continue
    compute_line "$f"
  done | sort
}

if [ "$MODE" = "check" ]; then
  if [ ! -f "$HASH_FILE" ]; then
    echo "ERROR: standards-rag-drift — hash file missing: $HASH_FILE_REL" >&2
    echo "  Bootstrap: scripts/run-standards-ingest.sh --all && git add $HASH_FILE_REL" >&2
    exit 1
  fi

  EXPECTED="$(compute_expected)"
  RECORDED="$(cat "$HASH_FILE")"

  if [ "$EXPECTED" = "$RECORDED" ]; then
    echo "standards-rag-drift: OK ($(echo "$EXPECTED" | wc -l | tr -d ' ') standards)" >&2
    exit 0
  fi

  echo "" >&2
  echo "ERROR: standards-rag-drift — recorded hashes do not match working tree." >&2
  echo "" >&2
  diff <(echo "$RECORDED") <(echo "$EXPECTED") >&2 || true
  echo "" >&2
  echo "Fix: scripts/run-standards-ingest.sh --all && git add $HASH_FILE_REL" >&2
  exit 1
fi

if [ "$MODE" = "staged" ]; then
  STAGED="$(git diff --cached --name-only --diff-filter=ACMR || true)"

  STANDARDS_STAGED=0
  HASH_STAGED=0
  echo "$STAGED" | grep -qE '^\.claude/standards/.*\.md$' && STANDARDS_STAGED=1
  echo "$STAGED" | grep -qx "$HASH_FILE_REL" && HASH_STAGED=1

  if [ "$STANDARDS_STAGED" = "0" ]; then
    exit 0
  fi

  if [ "$HASH_STAGED" = "0" ]; then
    echo "" >&2
    echo "ERROR: standards-rag-drift — .claude/standards/*.md is staged but $HASH_FILE_REL is not." >&2
    echo "" >&2
    echo "The pre-commit hook normally auto-stages the hash file after running" >&2
    echo "the paired ingest. If you arrived here, the runner did not complete." >&2
    echo "Re-run manually:" >&2
    echo "  scripts/run-standards-ingest.sh \$(git diff --cached --name-only --diff-filter=ACM -- '.claude/standards/*.md')" >&2
    echo "  git add $HASH_FILE_REL" >&2
    exit 1
  fi

  # Both staged — verify the staged hash file matches the staged standards.
  TMP="$(mktemp)"
  trap 'rm -f "$TMP"' EXIT
  for f in "$STANDARDS_DIR"/*.md; do
    [ -f "$f" ] || continue
    REL="${f#$REPO_ROOT/}"
    # Prefer staged blob if the standard itself was staged; fall back to working tree.
    if git ls-files --cached --error-unmatch "$REL" >/dev/null 2>&1; then
      H="$(git show ":$REL" 2>/dev/null | shasum -a 256 | awk '{print $1}')"
    else
      H="$(shasum -a 256 "$f" | awk '{print $1}')"
    fi
    printf '%s  %s\n' "$H" "$REL" >> "$TMP"
  done
  STAGED_EXPECTED="$(sort < "$TMP")"
  STAGED_RECORDED="$(git show ":$HASH_FILE_REL" 2>/dev/null || true)"

  if [ "$STAGED_EXPECTED" != "$STAGED_RECORDED" ]; then
    echo "" >&2
    echo "ERROR: standards-rag-drift — staged hash file does not match staged standards." >&2
    echo "" >&2
    diff <(echo "$STAGED_RECORDED") <(echo "$STAGED_EXPECTED") >&2 || true
    echo "" >&2
    echo "Re-run: scripts/run-standards-ingest.sh \$(git diff --cached --name-only --diff-filter=ACM -- '.claude/standards/*.md')" >&2
    echo "        git add $HASH_FILE_REL" >&2
    exit 1
  fi
  exit 0
fi

if [ "$MODE" = "ci" ]; then
  if [ -z "$BASE" ] || [ -z "$HEAD" ]; then
    echo "standards-rag-drift: --ci requires --base <sha> --head <sha>" >&2
    exit 2
  fi

  CHANGED_FILES="$(git diff --name-only "$BASE".."$HEAD" || true)"
  STANDARDS_CHANGED=0
  echo "$CHANGED_FILES" | grep -qE '^\.claude/standards/.*\.md$' && STANDARDS_CHANGED=1

  if [ "$STANDARDS_CHANGED" = "0" ]; then
    echo "standards-rag-drift: no standards changes in $BASE..$HEAD" >&2
    exit 0
  fi

  # Build expected hash body from HEAD blobs.
  TMP="$(mktemp)"
  trap 'rm -f "$TMP"' EXIT
  while IFS= read -r REL; do
    case "$REL" in
      .claude/standards/*.md) ;;
      *) continue ;;
    esac
    H="$(git show "$HEAD:$REL" 2>/dev/null | shasum -a 256 | awk '{print $1}')"
    printf '%s  %s\n' "$H" "$REL" >> "$TMP"
  done < <(git ls-tree -r --name-only "$HEAD" -- .claude/standards | grep -E '\.md$')
  HEAD_EXPECTED="$(sort < "$TMP")"
  HEAD_RECORDED="$(git show "$HEAD:$HASH_FILE_REL" 2>/dev/null || true)"

  if [ "$HEAD_EXPECTED" = "$HEAD_RECORDED" ]; then
    echo "standards-rag-drift: OK ($(echo "$HEAD_EXPECTED" | wc -l | tr -d ' ') standards)" >&2
    exit 0
  fi

  echo "" >&2
  echo "ERROR: standards-rag-drift — hash file in $HEAD does not match standards in $HEAD." >&2
  echo "" >&2
  diff <(echo "$HEAD_RECORDED") <(echo "$HEAD_EXPECTED") >&2 || true
  echo "" >&2
  echo "Likely cause: a .claude/standards/*.md was edited via the GitHub web UI" >&2
  echo "or with --no-verify, bypassing the local auto-ingest hook." >&2
  echo "" >&2
  echo "Fix locally then push:" >&2
  echo "  git pull --ff-only" >&2
  echo "  scripts/run-standards-ingest.sh --all" >&2
  echo "  git add $HASH_FILE_REL && git commit -m 'chore(standards): refresh ingest hashes'" >&2
  echo "  git push" >&2
  echo "::error::standards-rag-drift: hash file out of sync with standards"
  exit 1
fi

echo "standards-rag-drift: no mode specified (try --check / --staged / --ci)" >&2
exit 2
