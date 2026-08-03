#!/usr/bin/env bash
# rag-ingest.sh — shared brik-rag ingest for the paired BDS standards.
#
# Why this exists: `brik-rag remember` hard-caps a lesson at 32,000 chars, and
# each ingest-*-standard.sh used to send its whole standard as ONE lesson. That
# works right up until a standard crosses the cap, at which point EVERY commit
# touching it is refused by the pre-commit hook and the only remedy on offer is
# to shorten the canon to fit the tool — backwards (brik-bds#1648).
#
# `storybook-story-shape.md` crossed it: 32,243 chars on main at the time of
# writing, so the ingest was already failing for any edit to that file.
#
# This splits an oversized body at H2 (`## `) boundaries and ingests one lesson
# per chunk. Chunking is also better for retrieval than one 32k blob — a query
# matches the relevant section instead of the whole standard.
#
# Chunk naming: the FIRST chunk keeps the caller's base name, so the existing
# chunk_id (`memory/{project}/{name}`) stays valid and nothing that references
# it dangles. Continuation chunks are `{name}-part-2`, `{name}-part-3`, … — the
# hyphen before the index matters: brik-rag slugifies the name it stores, so
# `-part2` comes back as `-part-2` and a `forget` keyed on `-part2` silently
# matches nothing, stranding the chunk it was meant to reap.
#
# Usage (sourced):
#   source "$(dirname "${BASH_SOURCE[0]}")/lib/rag-ingest.sh"
#   rag_ingest_standard <name> <description> <type> <project> <body>

set -euo pipefail

# Stay under brik-rag's hard 32,000 cap. The margin absorbs the per-chunk
# header this script prepends plus any transport overhead, so a body that
# measures just under 32,000 locally still lands.
RAG_CHUNK_LIMIT="${RAG_CHUNK_LIMIT:-28000}"

# How far past the last emitted part the reaper probes for stale chunks (#1652).
# Deliberately a small fixed window, not an until-exhausted sweep: `forget` costs
# ~1.3s per call, so every extra step is 1.3s on a pre-commit hook. 5 covers a
# shrink from 6 parts to 1, and the largest standard today splits into 2.
RAG_INGEST_STALE_WINDOW="${RAG_INGEST_STALE_WINDOW:-5}"

# Longest run of sections that fits in RAG_CHUNK_LIMIT, emitted to stdout as
# NUL-delimited chunks. Splits only at `## ` (H2) so a rule is never cut in
# half; a single H2 section larger than the limit is emitted whole and the
# caller lets brik-rag reject it, because silently truncating canon is worse
# than a loud failure.
_rag_split_h2() {
  local body="$1" limit="$2"
  awk -v limit="$limit" '
    function flush_chunk() {
      if (length(buf) > 0) { printf "%s%c", buf, 0 }
      buf = ""
    }
    BEGIN { buf = "" }
    /^## / {
      # Starting a new section: close the current chunk if adding this section
      # would overflow it. `buf` holds the preamble on the first pass.
      if (length(buf) > 0 && length(buf) + length(section) > limit) {
        flush_chunk()
      }
      buf = buf section
      section = ""
    }
    { section = section $0 "\n" }
    END {
      if (length(buf) > 0 && length(buf) + length(section) > limit) flush_chunk()
      buf = buf section
      flush_chunk()
    }
  ' <<< "$body"
}

# Delete continuation chunks left behind by a longer previous version of this
# standard. Stranded parts keep matching queries with content no longer in the
# file — a silent wrong answer, the worst failure mode for retrieval, because
# nothing errors and the reader cannot tell.
#
# Probes a fixed RAG_INGEST_STALE_WINDOW past the last emitted part. A
# stop-after-N-consecutive-misses sweep was tried and rejected: brik-rag dedupes
# structurally identical chunks, so a part sequence can have HOLES — an ingest of
# 8 chunks stored parts 2 and 8 and deduped 3-7 — and any miss-run heuristic
# terminates inside the hole and strands the tail it was built to catch. A fixed
# window has the same blind spot past its edge but is at least predictable, and
# at ~1.3s per `forget` an until-exhausted sweep is too slow for a hook.
#
# `brik-rag forget` answers {"status":"forgotten"} on a hit and
# {"status":"not-found"} on a miss, exiting 0 either way — so the count keys on
# the payload, never the exit status.
_rag_reap_stale_parts() {
  local project="$1" name="$2" total="$3"
  local stale=$((total + 1)) removed=0 out

  while [ "$stale" -le $((total + RAG_INGEST_STALE_WINDOW)) ]; do
    out="$(brik-rag forget --project "$project" --name "${name}-part-${stale}" 2>/dev/null || true)"
    case "$out" in
      *'"status": "forgotten"'*) removed=$((removed + 1)) ;;
    esac
    stale=$((stale + 1))
  done

  if [ "$removed" -gt 0 ]; then
    echo "  Reaped ${removed} stale part chunk(s) from a previous, longer version."
  fi
}

# Ingest one standard, chunking only when the body exceeds the limit.
# A single-chunk ingest sends the same payload as before, and now also reaps.
rag_ingest_standard() {
  local name="$1" description="$2" type="$3" project="$4" body="$5"

  if [ "${#body}" -le "$RAG_CHUNK_LIMIT" ]; then
    brik-rag remember \
      --name "$name" --description "$description" \
      --type "$type" --project "$project" --human - <<< "$body"
    # Reap on this path too: a standard that shrinks back under the limit emits
    # one chunk, and every continuation from when it was oversized is still in
    # the corpus answering queries. The old early `return` skipped the reaper
    # entirely, which made shrink-to-fit the worst case rather than the safe
    # one (#1652).
    _rag_reap_stale_parts "$project" "$name" 1
    return
  fi

  local -a chunks=()
  local chunk
  while IFS= read -r -d '' chunk; do
    chunks+=("$chunk")
  done < <(_rag_split_h2 "$body" "$RAG_CHUNK_LIMIT")

  local total="${#chunks[@]}"
  echo "▸ ${#body} chars exceeds ${RAG_CHUNK_LIMIT} — splitting into ${total} chunk(s) at H2 boundaries"

  local i=0 chunk_name
  for chunk in "${chunks[@]}"; do
    i=$((i + 1))
    if [ "$i" -eq 1 ]; then chunk_name="$name"; else chunk_name="${name}-part-${i}"; fi
    # The header keeps each chunk self-identifying: retrieval can surface part 3
    # alone, and the reader still knows which standard it belongs to.
    brik-rag remember \
      --name "$chunk_name" \
      --description "${description} (part ${i} of ${total})" \
      --type "$type" --project "$project" --human - \
      <<< "[${name} — part ${i} of ${total}]

${chunk}"
  done

  _rag_reap_stale_parts "$project" "$name" "$total"
}
