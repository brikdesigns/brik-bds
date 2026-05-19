---
name: storybook-mdx-recipe
description: Retrieve the canonical BDS storybook-mdx-recipe standard from brik-rag before authoring or editing components/ui/**/*.mdx pages. Covers the six-section recipe (Title → ComponentLinks → Description → Playground → Variants → Patterns → Props, optionally CSS Override API + Notes), banned sections (`## Usage`, `## When to use`, `---` dividers, emoji headings), callout vocabulary (`> **Note** —`, `> **Warning** —`), the same-words-different-layers reconciliation with story exports (ADR-006 bans `Variants`/`Tones`/`Patterns` as story names; ADR-007 requires them as MDX H2s), foundation-page template, dashboard-page exemption, stub-pattern for moved content, and the 9-criterion acceptance check enforced by `scripts/lint-storybook-recipe.js`. Source of truth at brik-bds/.claude/standards/storybook-mdx-recipe.md.
triggers:
  - About to create or modify any `*.mdx` file under `components/ui/`, `stories/`, or `content-system/`
  - About to scaffold a new component documentation page
  - About to add an H2 section to an existing component MDX
  - About to add a callout or code block to a component MDX
  - User asks about MDX page structure, `<ComponentLinks>`, `## Variants` vs `export const Variants`, the recipe lint, or what sections are banned
  - User mentions ADR-007, component MDX, page recipe, `lint-storybook-recipe.js`, or the Storybook ↔ docs-site split
last-verified: 2026-05-13
---

# storybook-mdx-recipe — Retrieve the BDS MDX recipe standard via brik-rag

The canonical rules for `components/ui/**/*.mdx` (and other Storybook MDX) in this repo live in `brik-bds/.claude/standards/storybook-mdx-recipe.md` and are ingested into brik-rag. Auto-retrieve before authoring or editing MDX pages so the standard loads into context at edit time.

## When to invoke

Auto-invoke (don't wait for the user) when any of:

- A `*.mdx` file under `components/ui/`, `stories/`, or `content-system/` is in the edit path
- A new component documentation page is being scaffolded
- A user prompt mentions ADR-007, the recipe, `<ComponentLinks>`, banned MDX sections, or callout vocabulary

Skip when:

- The edit is a typo fix or one-word wording tweak in body prose
- You already retrieved on this topic in this session and the chunks are still in context
- The work is in a `*.stories.tsx` (use `storybook-story-shape` instead) or a `docs-site/content/docs/**/*.mdx` (use `fumadocs-content-standard` instead)

## How to invoke

```bash
brik-rag query "storybook mdx recipe standard" \
  --workflow-type storybook-mdx-recipe \
  --top-k 5
```

Optional follow-ups (use only if the top result didn't answer):

```bash
brik-rag query "MDX recipe six section ComponentLinks Playground Variants Patterns" --workflow-type storybook-mdx-recipe --top-k 3
brik-rag query "MDX banned sections Usage When to use --- dividers" --workflow-type storybook-mdx-recipe --top-k 3
brik-rag query "ADR-006 ADR-007 same words different layers" --workflow-type storybook-mdx-recipe --top-k 3
brik-rag query "MDX acceptance criteria lint storybook recipe" --workflow-type storybook-mdx-recipe --top-k 3
```

Parse the JSON output, apply the relevant rules to the edit. If the query returns no results, the standard has not been ingested — run `brik-bds/scripts/run-standards-ingest.sh --all` once to bootstrap, then retry.

## Lint is the gate

`scripts/lint-storybook-recipe.js --enforce` runs on `.husky/pre-commit` and `.github/workflows/storybook-recipe-check.yml`. A page that violates the recipe fails the lint and blocks merge. The skill is an *author-time* aid — it surfaces the rule before the lint catches it.

## If you get a conflict between the standard and existing content

The standard + the lint are canon. Existing MDX pages that violate them are legacy — flag the inconsistency in your PR description but do not refactor unrelated files in the same PR (surgical-changes rule). Phase 3 of ADR-007 already migrated 73 of 76 component MDX files; the remainder is tracked in issues [#442](https://github.com/brikdesigns/brik-bds/issues/442) and [#443](https://github.com/brikdesigns/brik-bds/issues/443).

## How to update the standard itself

Edit `brik-bds/.claude/standards/storybook-mdx-recipe.md`, bump `last-verified`, then commit — the pre-commit hook auto-ingests changed standards into brik-rag (brik-bds#744). The skill picks up the new content on the next retrieval; no skill file change needed. **If the change is material** (new required section, change in section order, change to acceptance criteria), also amend ADR-007 and update `scripts/lint-storybook-recipe.js`.
