---
name: storybook-toolbar-globals
description: Retrieve the canonical BDS storybook-toolbar-globals standard from brik-rag before editing .storybook/preview.tsx or .storybook/main.ts, or before authoring a story that reads context.globals. Covers wired globals today (theme `brik`/`brik-dark`/`client-sim` via themeNumber, baseFont `14`/`16`/`18`/`20`, animations on/off, devWidgets), the Phase 1 viewport addition (`@storybook/addon-viewport` per #587 PR-B), future axes (density, locale), and the ADR-010 Q1 rule that a prop reframing every story is always a toolbar global, never a story export. Source of truth at brik-bds/.claude/standards/storybook-toolbar-globals.md.
triggers:
  - About to edit `.storybook/preview.tsx` or `.storybook/main.ts`
  - About to add a new `globalTypes` entry or register a new Storybook addon
  - About to write a story that reads `context.globals.*`
  - User asks about toolbar globals, theme switching, viewport addon, density / locale / motion axes, or "where should this per-component `Dark` / `Mobile` story go"
  - User mentions ADR-010 Q1, `globalTypes`, `addon-viewport`, or `withTheme` decorator
last-verified: 2026-05-13
---

# storybook-toolbar-globals — Retrieve the BDS toolbar-globals standard via brik-rag

The canonical list of orthogonal environmental axes wired as Storybook toolbar `globalTypes` lives in `brik-bds/.claude/standards/storybook-toolbar-globals.md` and is ingested into brik-rag. Auto-retrieve before editing Storybook preview / main configuration or adding a global axis so the standard loads into context at edit time.

## When to invoke

Auto-invoke (don't wait for the user) when any of:

- `.storybook/preview.tsx` or `.storybook/main.ts` is in the edit path
- A new `globalTypes` entry or addon registration is being added
- A story is being written that branches on `context.globals.*`
- A user prompt mentions toolbar globals, viewport addon, theme switching, density / locale / motion, or ADR-010 Q1

Skip when:

- The edit is a comment / formatting tweak in `.storybook/` with no behavior change
- You already retrieved on this topic in this session and the chunks are still in context
- The work is in a `*.stories.tsx` file that doesn't read `context.globals` (use `storybook-story-shape` instead)

## How to invoke

```bash
brik-rag query "storybook toolbar globals" \
  --workflow-type storybook-toolbar-globals \
  --top-k 5
```

Optional follow-ups (use only if the top result didn't answer):

```bash
brik-rag query "wired globals themeNumber baseFont animations devWidgets" --workflow-type storybook-toolbar-globals --top-k 3
brik-rag query "viewport addon Phase 1 mobile tablet desktop" --workflow-type storybook-toolbar-globals --top-k 3
brik-rag query "client-sim font audit theme decorator" --workflow-type storybook-toolbar-globals --top-k 3
brik-rag query "ADR-010 Q1 toolbar global never story export" --workflow-type storybook-toolbar-globals --top-k 3
```

Parse the JSON output, apply the relevant rules to the edit. If the query returns no results, the standard has not been ingested — run `brik-bds/scripts/ingest-storybook-toolbar-globals-standard.sh` once, then retry.

## The first-yes rule

If you find yourself about to add `export const Dark`, `Mobile`, `Spacious`, or `Spanish` to a `*.stories.tsx` file, stop. Per [ADR-010 Q1](../../docs/adrs/ADR-010-storybook-axes-of-information.md), those are toolbar-global axes by construction — even if they aren't wired yet. Use the toolbar (existing or future); don't create per-component stories for global axes.

## If you get a conflict between the standard and existing content

The standard is canon. If the wired globals in `.storybook/preview.tsx` and the standard disagree, update the standard to reflect the new reality and re-ingest. If a per-component story exists that should have been a toolbar usage, that's grandfathered — don't refactor it in the same PR (surgical-changes rule).

## How to update the standard itself

Edit `brik-bds/.claude/standards/storybook-toolbar-globals.md`, bump `last-verified`, re-run `scripts/ingest-storybook-toolbar-globals-standard.sh`. Add a row to the "Wired today" table when a new axis lands. **Update ADR-010 only if the rule itself changes** — adding a wired axis doesn't require an ADR amendment.
