---
name: fumadocs-content-standard
description: Retrieve the canonical Fumadocs writing standard from brik-rag before authoring or editing MDX in docs-site/content/docs. Covers frontmatter shape, IA decision tree (page vs section vs callout vs cross-link), heading depth, voice pointer, and anti-patterns. Source of truth lives at brik-bds/.claude/standards/fumadocs-content.md; this skill fetches the ingested copy from brik-rag so guidance loads at edit time without re-reading the markdown.
triggers:
  - About to create a new .mdx file under docs-site/content/docs/
  - About to edit an existing .mdx file under docs-site/content/docs/
  - User asks "how should this docs page be structured" / "fumadocs frontmatter" / "docs IA"
  - About to add a new Fumadocs component (Callout, Cards, etc.) to an MDX page
  - About to introduce a new top-level dir under content/docs/ (also needs meta.json update)
last-verified: 2026-05-11
---

# fumadocs-content-standard — Retrieve the docs-site writing standard via brik-rag

The canonical rules for `docs-site/content/docs/**/*.mdx` live in `brik-bds/.claude/standards/fumadocs-content.md` and are ingested into brik-rag. Auto-retrieve before authoring or editing MDX so the standard loads into context at edit time.

## When to invoke

Auto-invoke (don't wait for the user) when any of:

- A `.mdx` file under `docs-site/content/docs/` is in the edit path
- A new MDX page is being scaffolded
- A user prompt mentions Fumadocs structure, MDX frontmatter, docs IA, callout/card usage, or `meta.json` nav

Skip when:

- The edit is a pure typo fix or punctuation tweak (the standard does not bear on it)
- You already retrieved on this topic in this session and the chunks are still in context
- The work is in `docs-site/app/`, `docs-site/components/`, or other non-content paths (this skill is content-only)

## How to invoke

```bash
brik-rag query "fumadocs writing standard" \
  --workflow-type fumadocs-standard \
  --top-k 5
```

Optional follow-ups (use only if the top result didn't answer):

```bash
brik-rag query "fumadocs frontmatter fields" --workflow-type fumadocs-standard --top-k 3
brik-rag query "fumadocs IA decision tree page section callout" --workflow-type fumadocs-standard --top-k 3
brik-rag query "fumadocs anti-patterns" --workflow-type fumadocs-standard --top-k 3
```

Parse the JSON output, apply the relevant rules to the MDX edit. If the query returns no results, the standard has not been ingested — run `brik-bds/scripts/run-standards-ingest.sh --all` once to bootstrap, then retry.

## If you get a conflict between the standard and existing content

The standard is canon. Existing MDX that violates it is legacy — flag the inconsistency in your PR description but do not refactor unrelated files in the same PR (surgical-changes rule).

## How to update the standard itself

Edit `brik-bds/.claude/standards/fumadocs-content.md`, bump `last-verified`, then commit — the pre-commit hook auto-ingests changed standards into brik-rag (brik-bds#744). The skill picks up the new content on the next retrieval; no skill file change needed.
