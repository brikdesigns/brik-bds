#!/usr/bin/env bash
# ingest-standard.sh — shared body for scripts/ingest-<name>-standard.sh.
#
# Source it, then call:
#   ingest_standard <standard-path> <chunk-name> <description>
#
# Why this exists: `brik-rag remember` hard-caps a lesson at 32,000 chars.
# storybook-story-shape.md reached 31,949 (#1645), so the next sentence anyone
# added failed .husky/pre-commit — the gate rejecting content on length rather
# than correctness. This splits an oversized standard across several brik-rag
# chunks instead of failing.
#
# Chunk naming: part 1 keeps the plain <chunk-name>, so every existing chunk id
# and doc reference (`memory/brik-bds/<name>`) stays valid. Continuations are
# <chunk-name>-part-2, -part-3, … Splits fall on `## ` headings so a retrieved
# chunk is a whole section, never a sentence fragment.

set -euo pipefail

# Cap is 32,000 in brik-rag. Stop short of it: the CLI wraps the body, and a
# chunk that fits locally but not server-side fails at commit time, which is
# exactly the failure this is here to prevent.
STANDARD_CHUNK_CAP="${STANDARD_CHUNK_CAP:-30000}"

# Stale-part sweep. A standard that shrinks from 3 parts to 2 must not leave
# -part-3 answering queries with content no longer in the file. Sweep upward
# from the last emitted part and stop after this many consecutive misses, so a
# large shrink (10 parts → 1) can't strand the tail.
STANDARD_STALE_MISSES="${STANDARD_STALE_MISSES:-3}"
# Hard stop, so a malformed response can't spin the loop.
STANDARD_STALE_CEILING="${STANDARD_STALE_CEILING:-60}"

# Strip YAML frontmatter — everything after the second `---` line.
_standard_body() {
  awk 'BEGIN{c=0} /^---$/{c++; next} c>=2' "$1"
}

# Pack `## ` sections into files of at most $STANDARD_CHUNK_CAP chars.
# Writes part files to $1 (a directory) as part-1, part-2, … and echoes the count.
_split_into_parts() {
  local outdir="$1" cap="$2"
  awk -v outdir="$outdir" -v cap="$cap" '
    function flush() {
      if (buf == "") return
      part++
      printf "%s", buf > (outdir "/part-" part)
      close(outdir "/part-" part)
      buf = ""
    }
    BEGIN { part = 0; buf = "" }
    # A `## ` heading is a legal split point. Start a new part when appending
    # this section would breach the cap and we already have something buffered.
    /^## / {
      if (buf != "" && length(buf) + length(section) > cap) flush()
      buf = buf section
      section = ""
    }
    { section = section $0 "\n" }
    END {
      if (buf != "" && length(buf) + length(section) > cap) flush()
      buf = buf section
      flush()
      print part
    }
  ' /dev/stdin
}

ingest_standard() {
  local standard_file="$1" chunk_name="$2" description="$3"

  if [[ ! -f "$standard_file" ]]; then
    echo "error: standard markdown not found at $standard_file" >&2
    return 1
  fi

  if ! command -v brik-rag >/dev/null 2>&1; then
    echo "error: brik-rag CLI not on PATH. Expected at ~/.local/bin/claude-tools/brik-rag" >&2
    return 1
  fi

  local body
  body="$(_standard_body "$standard_file")"

  if [[ -z "$body" ]]; then
    echo "error: standard body is empty after frontmatter strip" >&2
    return 1
  fi

  local lines
  lines="$(printf '%s\n' "$body" | wc -l | tr -d ' ')"
  echo "▸ Ingesting ${chunk_name} (${lines} lines)..."

  local tmpdir
  tmpdir="$(mktemp -d)"
  # shellcheck disable=SC2064 — expand tmpdir now, not at trap time.
  trap "rm -rf '$tmpdir'" RETURN

  local total
  total="$(printf '%s\n' "$body" | _split_into_parts "$tmpdir" "$STANDARD_CHUNK_CAP")"

  if [[ "$total" -lt 1 ]]; then
    echo "error: splitter produced no parts for $standard_file" >&2
    return 1
  fi

  # A single `## ` section larger than the cap can't be split on a heading.
  # Fail loudly rather than truncate — the fix is to break up that section.
  local p
  for ((p = 1; p <= total; p++)); do
    local size
    size="$(wc -c <"$tmpdir/part-$p" | tr -d ' ')"
    if [[ "$size" -gt "$STANDARD_CHUNK_CAP" ]]; then
      echo "error: part $p is ${size} chars, over the ${STANDARD_CHUNK_CAP} cap, and holds a single '## ' section that cannot be split further." >&2
      echo "  Break that section into smaller '## ' sections in ${standard_file#"$(git rev-parse --show-toplevel)/"}." >&2
      return 1
    fi
  done

  for ((p = 1; p <= total; p++)); do
    local name="$chunk_name" desc="$description" header=""
    if [[ "$p" -gt 1 ]]; then
      name="${chunk_name}-part-${p}"
      # Later parts open mid-document; name the source so a hit is readable
      # on its own.
      header="# ${chunk_name} (part ${p} of ${total})"$'\n\n'
    fi
    if [[ "$total" -gt 1 ]]; then
      desc="${description} (part ${p} of ${total})"
    fi

    brik-rag remember \
      --name "$name" \
      --description "$desc" \
      --type reference \
      --project brik-bds \
      --human \
      - <<<"${header}$(cat "$tmpdir/part-$p")"
  done

  # Prune parts left over from a longer previous version. `forget` answers
  # {"status":"not-found"} for a chunk that was never written, which is the
  # signal that we have run off the end of the previous version.
  local stale misses=0 removed=0 out
  for ((stale = total + 1; stale <= total + STANDARD_STALE_CEILING; stale++)); do
    out="$(brik-rag forget --project brik-bds --name "${chunk_name}-part-${stale}" 2>/dev/null || true)"
    if [[ "$out" == *'"status": "forgotten"'* ]]; then
      misses=0
      removed=$((removed + 1))
    else
      misses=$((misses + 1))
      [[ "$misses" -ge "$STANDARD_STALE_MISSES" ]] && break
    fi
  done
  if [[ "$removed" -gt 0 ]]; then
    echo "  Pruned ${removed} stale part chunk(s) from a previous, longer version."
  fi

  if [[ "$total" -gt 1 ]]; then
    echo "✓ Ingested as ${total} chunks (${chunk_name}, ${chunk_name}-part-2…${total})."
  else
    echo "✓ Ingested."
  fi
  echo "  Verify with: brik-rag query \"${chunk_name//-/ }\" --top-k 3 --human"
}
