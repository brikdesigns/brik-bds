---
name: component-build
description: Retrieve the canonical BDS component-build standard from brik-rag before authoring or editing components/ui/**/*.{tsx,css}. Covers file structure, CSS-over-inline discipline, BEM under `bds-` namespace (closed allowlist via ADR-008), token-only rule (Semantic-tier tokens per the four-tier anatomy, `@/lib/tokens` for TS), Radix-primitives-first composition, prop conventions (variant/size/className/style), bdsClass composition, interactive-state CSS pattern, semantic splitting, danger variants, accessibility minimums, the 4-point Button/IconButton sizing grid, table-cell patterns, and the anti-patterns checklist (font-family-by-role, raw var() strings, hand-editing auto-generated token files). Token vocabulary reference: design.brikdesigns.com/docs/primitives/token-anatomy. Source of truth at brik-bds/.claude/standards/component-build.md.
triggers:
  - About to create or modify any `*.tsx` or `*.css` file under `components/ui/`
  - About to scaffold a new component (touching `components/ui/<Name>/<Name>.tsx`)
  - About to add a new `--variant` / `--size` / `--state` class in component CSS
  - About to compose a blueprint or page using BDS primitives (touching `content-system/blueprints/`)
  - User asks about component structure, file layout, class composition, danger variants, sizing rules, table-cell patterns, or accessibility minimums
  - User mentions BEM, `bdsClass`, slot allowlist, ADR-008, semantic splitting (Button vs LinkButton vs IconButton), or the 4-point grid
last-verified: 2026-05-13
---

# component-build — Retrieve the BDS component-build standard via brik-rag

The canonical rules for `components/ui/**/*.{tsx,css}` in this repo live in `brik-bds/.claude/standards/component-build.md` and are ingested into brik-rag. Auto-retrieve before authoring or editing component code so the standard loads into context at edit time.

## When to invoke

Auto-invoke (don't wait for the user) when any of:

- A `*.tsx` or `*.css` file under `components/ui/` is in the edit path
- A new component is being scaffolded
- A blueprint under `content-system/blueprints/` composes BDS primitives
- A user prompt mentions component structure, BEM naming, `bdsClass`, sizing rules, or danger variants

Skip when:

- The edit is a pure copy / label tweak that doesn't touch structure, classes, or tokens
- You already retrieved on this topic in this session and the chunks are still in context
- The work is in a `*.stories.tsx` (use `storybook-story-shape` instead) or `*.mdx` (use `storybook-mdx-recipe` instead)

## How to invoke

```bash
brik-rag query "component build standard" \
  --workflow-type component-build \
  --top-k 5
```

Optional follow-ups (use only if the top result didn't answer):

```bash
brik-rag query "BEM slot allowlist closed bds-" --workflow-type component-build --top-k 3
brik-rag query "tokens only semantic dist tokens.css" --workflow-type component-build --top-k 3
brik-rag query "compose primitives Radix never reimplement" --workflow-type component-build --top-k 3
brik-rag query "Button IconButton sizing 4 point grid table cell" --workflow-type component-build --top-k 3
brik-rag query "anti-patterns font-family role var() raw" --workflow-type component-build --top-k 3
```

Parse the JSON output, apply the relevant rules to the edit. If the query returns no results, the standard has not been ingested — run `brik-bds/scripts/run-standards-ingest.sh --all` once to bootstrap, then retry.

## If you get a conflict between the standard and existing content

The standard is canon, and the canon-CSS sources it references ([SLOT-ALLOWLIST.md](../../docs/SLOT-ALLOWLIST.md), [naming-conventions.mdx](../../docs-site/content/docs/primitives/naming-conventions.mdx), `dist/tokens.css`) are *meta-canon* — the standard defers to them when they disagree. Open a PR to align this file when needed.

## How to update the standard itself

Edit `brik-bds/.claude/standards/component-build.md`, bump `last-verified`, then commit — the pre-commit hook auto-ingests changed standards into brik-rag (brik-bds#744). The skill picks up the new content on the next retrieval; no skill file change needed.
