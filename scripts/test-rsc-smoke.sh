#!/usr/bin/env bash
# test-rsc-smoke.sh — prove the published package is readable from a Next.js
# App Router SERVER component (brik-bds#1721).
#
# Packs BDS exactly as `npm publish` would, installs that tarball into the
# minimal Next app in tests/rsc/fixture, and runs `next build`. The fixture's
# server component asserts its own invariants and throws, so a regression fails
# the build — there is no stdout to grep.
#
# Why a whole Next app is the only gate that works here: BDS never builds itself
# as an RSC consumer, so `tsc`, vitest, and plain Node-ESM all see the real
# values. Only an RSC bundle substitutes client references for the exports of a
# 'use client' module, which is how v0.151.0 shipped a `SOCIAL_ICON_PLATFORMS`
# that was `typeof 'function'` in brik-client-portal and threw on `.includes()`
# while passing every gate in this repo.
#
# The static counterpart is `npm run check:esm`, which pins the banner to
# scripts/server-safe-modules.mjs. That catches a config regression; only this
# proves the runtime contract.
#
# The fixture is COPIED to a temp dir before installing, so the checked-in tree
# never gains a node_modules/, a lockfile, or a tarball reference in its
# package.json — the committed fixture stays a readable four-file app.
#
# Usage:
#   npm run test:rsc              # pack + install + build
#   npm run test:rsc -- --keep    # print the temp dir and leave it for inspection

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FIXTURE="$REPO_ROOT/tests/rsc/fixture"
KEEP=0
for arg in "$@"; do
  [[ "$arg" == "--keep" ]] && KEEP=1
done

if [[ ! -d "$FIXTURE" ]]; then
  echo -e "${RED}✖ fixture missing: $FIXTURE${NC}" >&2
  exit 1
fi

# The fixture consumes dist/, so it must exist and be current. Build it unless
# the caller already did (CI builds once and reuses).
if [[ ! -f "$REPO_ROOT/dist/lib-entry.mjs" ]]; then
  echo -e "${YELLOW}▸ dist/ missing — running build:lib${NC}"
  (cd "$REPO_ROOT" && npm run build:lib)
fi

WORK="$(mktemp -d)"
cleanup() {
  if [[ "$KEEP" -eq 1 ]]; then
    echo -e "${YELLOW}▸ --keep: fixture left at $WORK/app${NC}"
  else
    rm -rf "$WORK"
  fi
}
trap cleanup EXIT

echo -e "${YELLOW}▸ Packing @brikdesigns/bds${NC}"
TARBALL="$(cd "$REPO_ROOT" && npm pack --silent --pack-destination "$WORK")"

echo -e "${YELLOW}▸ Staging fixture + installing the packed tarball${NC}"
cp -R "$FIXTURE" "$WORK/app"
cd "$WORK/app"
# Add the tarball to the staged copy's manifest, not the committed one — a real
# `npm install` of a real tarball, matching what a consumer resolves.
npm pkg set "dependencies.@brikdesigns/bds=file:$WORK/$TARBALL"
npm install --no-audit --no-fund --silent

echo -e "${YELLOW}▸ next build (server component asserts on prerender)${NC}"
if npx next build; then
  echo -e "${GREEN}✅ RSC smoke passed — root data exports are server-readable and components render.${NC}"
else
  echo -e "${RED}✖ RSC smoke FAILED — see the prerender error above.${NC}" >&2
  echo -e "${RED}  A data export reaching the server as a client reference means its module${NC}" >&2
  echo -e "${RED}  carries the 'use client' banner; a \"createContext is not a function\" error${NC}" >&2
  echo -e "${RED}  means a module LOST a banner it needed. Both are set in${NC}" >&2
  echo -e "${RED}  scripts/server-safe-modules.mjs (brik-bds#1721).${NC}" >&2
  exit 1
fi
