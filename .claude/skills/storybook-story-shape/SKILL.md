---
name: storybook-story-shape
description: Retrieve the canonical BDS storybook-story-shape standard from brik-rag before authoring or editing *.stories.tsx files. Covers the two-shape model (Playground + one-per-state), the ADR-010 story-vs-control matrix (Q1–Q5: toolbar global / argTypes-only / dedicated story / irreducible render / play-only), banned story exports (`Variants` / `Tones` / `Patterns` / `Examples`), MCP discipline (@summary JSDoc + exactly one surface tag), the four-top-level sidebar taxonomy, axis-only-gallery exception, Storybook 9 imports (`@storybook/react-vite`, `storybook/test`), mocking, and play-function discipline. Source of truth at brik-bds/.claude/standards/storybook-story-shape.md.
triggers:
  - About to create or modify any `*.stories.tsx` file under `components/ui/`, `stories/`, or `content-system/blueprints/`
  - About to scaffold a new component story file
  - About to add a story export (`export const Foo: Story = ...`) to an existing file
  - About to add a `render` function to a story (load this first to verify the case is irreducible per ADR-010 Q4)
  - User asks about story shape, story file layout, `Variants` vs `Patterns` vs `Tones`, sidebar taxonomy, or story naming
  - User asks how to add a new variant / state / tone to a component
  - User mentions ADR-006, ADR-007, ADR-010, Storybook MCP, `@summary`, surface tags, or `!manifest`
  - User asks "where should this component live in the sidebar"
last-verified: 2026-05-13
---

# storybook-story-shape — Retrieve the BDS story-shape standard via brik-rag

The canonical rules for `*.stories.tsx` files in this repo live in `brik-bds/.claude/standards/storybook-story-shape.md` and are ingested into brik-rag. Auto-retrieve before authoring or editing story files so the standard loads into context at edit time.

## When to invoke

Auto-invoke (don't wait for the user) when any of:

- A `*.stories.tsx` file under `components/ui/`, `stories/`, or `content-system/blueprints/` is in the edit path
- A new component story file is being scaffolded
- A user prompt mentions story shape, sidebar taxonomy, MCP discipline, surface tags, ADR-006, ADR-007, or ADR-010

Skip when:

- The edit is a pure label / arg-value tweak that doesn't change file structure
- You already retrieved on this topic in this session and the chunks are still in context
- The work is in a `*.mdx` docs page (use `storybook-mdx-recipe` instead)
- The work is in `.storybook/preview.tsx` / `main.ts` (use `storybook-toolbar-globals` instead)

## How to invoke

```bash
brik-rag query "storybook story shape standard" \
  --workflow-type storybook-story-shape \
  --top-k 5
```

Optional follow-ups (use only if the top result didn't answer):

```bash
brik-rag query "ADR-010 story-vs-control matrix Q1 Q2 Q3" --workflow-type storybook-story-shape --top-k 3
brik-rag query "MCP discipline @summary surface tag" --workflow-type storybook-story-shape --top-k 3
brik-rag query "sidebar taxonomy components subcategory" --workflow-type storybook-story-shape --top-k 3
brik-rag query "storybook 9 imports framework package" --workflow-type storybook-story-shape --top-k 3
```

Parse the JSON output, apply the relevant rules to the edit. If the query returns no results, the standard has not been ingested — run `brik-bds/scripts/ingest-storybook-story-shape-standard.sh` once, then retry.

## If you get a conflict between the standard and existing content

The standard is canon. Existing `*.stories.tsx` files that violate it are legacy (73 grandfathered by [ADR-006 §Migration](../../docs/adrs/ADR-006-storybook-taxonomy-and-story-shape.md)) — flag the inconsistency in your PR description but do not refactor unrelated files in the same PR. Opportunistic migration of a file you're already touching is fine.

## How to update the standard itself

Edit `brik-bds/.claude/standards/storybook-story-shape.md`, bump `last-verified`, re-run `scripts/ingest-storybook-story-shape-standard.sh`. The skill picks up the new content on the next retrieval — no skill file change needed.
