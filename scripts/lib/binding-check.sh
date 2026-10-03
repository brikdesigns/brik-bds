#!/usr/bin/env bash
# binding-check.sh — run the BDS old-name override check against a consumer
# before propagate opens its bump (brik-bds#2720).
#
# Why this exists: from 0.195.0 BDS components read only `--bds-*` names, and an
# override of a pre-ADR-043 name is a silent no-op. The bump PR body asked only
# for "typecheck + build pass", and both pass, so on 2026-10-02 propagate opened
# 0.195.0 bumps that merged before any consumer had rebound. tncld staging's
# primary buttons went Poppy (fixed by tncld#190).
#
# The rule itself lives in scripts/check-bds-binding.mjs, which ships as the
# `bds-check-binding` bin. This file only decides WHICH copy of it runs:
#   - a real run uses the copy npm just installed in the consumer worktree, so
#     the bridge it reads is exactly the release being proposed;
#   - a dry-run packs that release into a temp dir (no worktree, no install) and
#     checks the consumer's origin/<base> sources extracted beside it.
# A release that predates the bin returns 2 (not run), never a false "clean".

# binding_check <consumer_root> <bds_pkg_dir>
#
# Runs the bin from <consumer_root> against its default path (src/, else .).
# Echoes one violation per line, colour stripped and without the `✗` bullet.
# Returns 0 clean · 1 old-name overrides found · 2 not run (no bin in that
# package, or the check itself errored — its message is echoed instead).
binding_check() {
  local consumer_root="$1" pkg_dir="$2"
  local bin="$pkg_dir/scripts/check-bds-binding.mjs"
  if [ ! -f "$bin" ]; then
    echo "no check-bds-binding.mjs in $pkg_dir (the release predates brik-bds#2720)"
    return 2
  fi

  local out rc=0
  out=$(cd "$consumer_root" && node "$bin" 2>&1) || rc=$?
  # Colour codes would land verbatim in a PR body.
  out=$(printf '%s\n' "$out" | sed $'s/\x1b\\[[0-9;]*m//g')
  case "$rc" in
    0) return 0 ;;
    1) printf '%s\n' "$out" | sed -n 's/^  ✗ //p'; return 1 ;;
    *) printf '%s\n' "$out"; return 2 ;;
  esac
}

# materialize_consumer_sources <repo> <ref> <dest>
#
# Extracts what binding_check scans — <ref>:src, or the whole tree when there
# is no src/ — into <dest>. Read-only on <repo>: no worktree, no checkout.
materialize_consumer_sources() {
  local repo="$1" ref="$2" dest="$3"
  mkdir -p "$dest"
  if git -C "$repo" cat-file -e "$ref:src" 2>/dev/null; then
    git -C "$repo" archive "$ref" src | tar -x -C "$dest"
  else
    git -C "$repo" archive "$ref" | tar -x -C "$dest"
  fi
}

# binding_check_pr_note <status> <violations>
#
# The PR-body section for a binding_check result. Lists at most 40 violations so
# a site that has not started its rebind does not produce an unreadable body.
binding_check_pr_note() {
  local status="$1" violations="$2" count
  case "$status" in
    0)
      echo "**Binding check passed:** no pre-ADR-043 token overrides (\`bds-check-binding\`, brik-bds#2720)."
      ;;
    1)
      count=$(printf '%s\n' "$violations" | grep -c .)
      echo "**Opened as a draft — $count old-name override(s).** From 0.195.0 BDS components read only \`--bds-*\` names, so each override below is a silent no-op: typecheck and build pass while themed pages render Brik defaults. Rebind each one to the \`--bds-\` name it names before marking this ready (ADR-043 § 6, brik-bds#2720)."
      echo ""
      echo '```'
      printf '%s\n' "$violations" | head -n 40
      [ "$count" -gt 40 ] && echo "… and $((count - 40)) more — run \`npx bds-check-binding\` for the full list"
      echo '```'
      ;;
    *)
      echo "**Binding check not run:** $violations"
      ;;
  esac
}
