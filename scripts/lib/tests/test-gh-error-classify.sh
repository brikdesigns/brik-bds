#!/usr/bin/env bash
# Test gh-error-classify.sh. brik-llm#1590.
#
# Every stderr fixture below was CAPTURED from a real `gh` failure on brik-mini
# 2026-07-30, not written from memory — the point of the helper is that it keys
# on what gh actually emits:
#
#   auth       GH_TOKEN=ghp_invalid... gh repo view --json nameWithOwner
#   not_found  gh repo view brikdesigns/zz-does-not-exist-9f2 --json nameWithOwner
#   network    HTTPS_PROXY=http://127.0.0.1:9 gh repo view --json nameWithOwner
#
# The rate-limit case cannot be produced on demand without draining the bucket
# the whole fleet shares, so it is driven through the documented signal instead:
# `x-ratelimit-remaining: 0` surfaced by `gh api rate_limit`, stubbed here via
# GH_CLASSIFY_RATE_LIMIT_JSON. Zero network, zero quota.

set -u

LIB="$(cd "$(dirname "$0")/.." && pwd)/gh-error-classify.sh"
[ -f "$LIB" ] || { echo "FAIL: helper not found: $LIB"; exit 1; }
# shellcheck source=/dev/null
source "$LIB"

PASS=0
FAIL=0
FAILED_CASES=()

# Healthy buckets by default, so a classification must come from the stderr text
# rather than from a probe that happens to report exhaustion.
HEALTHY='{"resources":{"core":{"limit":5000,"remaining":4933,"reset":9999999999,"used":67},"graphql":{"limit":5000,"remaining":4749,"reset":9999999999,"used":251}}}'
EXHAUSTED_GQL='{"resources":{"core":{"limit":5000,"remaining":743,"reset":9999999999,"used":4257},"graphql":{"limit":5000,"remaining":0,"reset":9999999999,"used":5000}}}'
EXHAUSTED_CORE='{"resources":{"core":{"limit":5000,"remaining":0,"reset":9999999999,"used":5000},"graphql":{"limit":5000,"remaining":4749,"reset":9999999999,"used":251}}}'

check() {
  local label="$1" expected="$2" got="$3"
  if [ "$got" = "$expected" ]; then
    PASS=$((PASS+1)); echo "  ✓ $label"
  else
    FAIL=$((FAIL+1)); FAILED_CASES+=("$label — expected '$expected', got '$got'")
    echo "  ✗ $label (expected '$expected', got '$got')"
  fi
}

assert_class() {
  local label="$1" expected="$2" err="$3" ratelimit="${4:-$HEALTHY}"
  check "$label" "$expected" \
    "$(GH_CLASSIFY_RATE_LIMIT_JSON="$ratelimit" gh_classify "$err")"
}

echo "── gh-error-classify.sh ──"

# ── Captured auth failures ──
assert_class "401 on graphql (captured)" auth \
  'HTTP 401: Bad credentials (https://api.github.com/graphql)
Try authenticating with:  gh auth login'
assert_class "401 on rest (captured)" auth 'gh: Bad credentials (HTTP 401)'

# ── Captured not-found ──
assert_class "could not resolve repo (captured)" not_found \
  "GraphQL: Could not resolve to a Repository with the name 'brikdesigns/zz-does-not-exist-9f2'. (repository)"

# ── Captured transport failures ──
assert_class "proxy refused, rest (captured)" network \
  'Get "https://api.github.com/rate_limit": proxyconnect tcp: dial tcp 127.0.0.1:9: connect: connection refused'
assert_class "proxy refused, graphql (captured)" network \
  'Post "https://api.github.com/graphql": proxyconnect tcp: dial tcp 127.0.0.1:9: connect: connection refused'
assert_class "dns failure" network \
  'Get "https://api.github.com/zen": dial tcp: lookup api.github.com: no such host'

# ── Rate limit via the documented signal, not a guessed message ──
assert_class "graphql bucket at 0" rate_limit '' "$EXHAUSTED_GQL"
assert_class "core bucket at 0" rate_limit '' "$EXHAUSTED_CORE"
# THE BUG (#1590): during exhaustion gh emits an empty result and a 403; the old
# code read that as auth. An empty bucket must win over a 403 that says nothing.
assert_class "403 + empty bucket → quota, NOT auth" rate_limit \
  'HTTP 403: Forbidden (https://api.github.com/graphql)' "$EXHAUSTED_GQL"
# Secondary rate limit: GitHub documents that a message exists but not its exact
# text, so body matching is the fallback signal only.
assert_class "secondary limit by body text" rate_limit \
  'You have exceeded a secondary rate limit. Please wait a few minutes before you try again.'
assert_class "HTTP 429" rate_limit 'gh: Too Many Requests (HTTP 429)'

# ── Precedence: an unreachable API must not be read as quota or auth ──
# The rate-limit probe itself is unreliable when the network is down, so the
# transport signal has to be checked first.
assert_class "network wins over an exhausted probe" network \
  'Post "https://api.github.com/graphql": dial tcp: lookup api.github.com: no such host' \
  "$EXHAUSTED_GQL"

# ── Unknown stays unknown ──
assert_class "unrecognised failure" unknown 'gh: something nobody has seen before'
assert_class "empty stderr, healthy buckets" unknown ''

# ── Probe failure is inconclusive, not "healthy" ──
check "probe returns nothing → falls through to stderr" auth \
  "$(GH_CLASSIFY_RATE_LIMIT_JSON=' ' gh_classify 'gh: Bad credentials (HTTP 401)')"
check "malformed probe JSON does not crash" unknown \
  "$(GH_CLASSIFY_RATE_LIMIT_JSON='not json at all' gh_classify 'mystery')"

# ── Zero-API slug resolution ──
slug_from() {
  # Deliberately NOT named `url`: bash is dynamically scoped, so gh_repo_slug's
  # own `local url` would shadow this one by the time the stub runs.
  local _stub_url="$1"
  # Stub git so the function under test reads our URL, not this worktree's.
  git() { [ "$1" = "remote" ] && printf '%s\n' "$_stub_url"; }
  gh_repo_slug
  unset -f git
}
check "https remote"        "brikdesigns/brik-llm" "$(slug_from 'https://github.com/brikdesigns/brik-llm.git')"
check "https remote, no .git" "brikdesigns/brik-llm" "$(slug_from 'https://github.com/brikdesigns/brik-llm')"
check "ssh scp-style remote" "brikdesigns/brik-bds" "$(slug_from 'git@github.com:brikdesigns/brik-bds.git')"
check "ssh:// remote"        "brikdesigns/brik-bds" "$(slug_from 'ssh://git@github.com/brikdesigns/brik-bds.git')"
# A non-GitHub remote must refuse rather than emit a bogus slug — the caller
# would otherwise pass a URL to `gh --repo`.
check "non-github remote refuses" "" "$(slug_from 'https://gitlab.com/some/group/repo.git')"
check "empty remote refuses"      "" "$(slug_from '')"

# The slug path must not call gh at all — that is the AC ("costs no GraphQL").
gh() { echo "FAIL: gh was called during slug resolution" >&2; return 1; }
if out="$(slug_from 'https://github.com/brikdesigns/brik-llm.git' 2>&1)" \
   && [ "$out" = "brikdesigns/brik-llm" ]; then
  PASS=$((PASS+1)); echo "  ✓ slug resolution never invokes gh"
else
  FAIL=$((FAIL+1)); FAILED_CASES+=("slug resolution invoked gh or failed: $out")
  echo "  ✗ slug resolution never invokes gh"
fi
unset -f gh

# ── Operator message names quota, never auth, on an exhausted bucket ──
MSG="$(GH_CLASSIFY_RATE_LIMIT_JSON="$EXHAUSTED_GQL" \
  gh_explain_failure 'HTTP 403: Forbidden' 2>&1 >/dev/null)"
if printf '%s' "$MSG" | grep -q 'quota EXHAUSTED' \
   && printf '%s' "$MSG" | grep -qi 'not an auth problem' \
   && ! printf '%s' "$MSG" | grep -q 'gh auth login'; then
  PASS=$((PASS+1)); echo "  ✓ explain: quota message names quota and not auth"
else
  FAIL=$((FAIL+1)); FAILED_CASES+=("explain: quota message wrong: $MSG")
  echo "  ✗ explain: quota message names quota and not auth"
fi

# The unknown branch must still hand over the raw stderr. Swallowing it is the
# original sin (#1590).
MSG="$(GH_CLASSIFY_RATE_LIMIT_JSON="$HEALTHY" \
  gh_explain_failure 'gh: a brand new failure mode' 2>&1 >/dev/null)"
if printf '%s' "$MSG" | grep -q 'a brand new failure mode'; then
  PASS=$((PASS+1)); echo "  ✓ explain: unknown branch prints raw stderr"
else
  FAIL=$((FAIL+1)); FAILED_CASES+=("explain: unknown branch swallowed stderr: $MSG")
  echo "  ✗ explain: unknown branch prints raw stderr"
fi

# Reset rendering must work on BSD date (macOS) and GNU date (CI).
if GH_CLASSIFY_RATE_LIMIT_JSON="$EXHAUSTED_GQL" gh_format_reset 9999999999 \
   | grep -Eq '^[0-9]{2}:[0-9]{2} UTC \(in ~[0-9]+m\)$'; then
  PASS=$((PASS+1)); echo "  ✓ reset time renders on this date(1)"
else
  FAIL=$((FAIL+1)); FAILED_CASES+=("gh_format_reset output malformed: $(gh_format_reset 9999999999)")
  echo "  ✗ reset time renders on this date(1)"
fi

echo ""
if [ "$FAIL" -gt 0 ]; then
  echo "FAILED ($FAIL):"
  for c in "${FAILED_CASES[@]}"; do echo "  - $c"; done
  echo "$PASS passed, $FAIL failed"
  exit 1
fi
echo "$PASS passed, 0 failed"
