---
name: Storybook MDX recipe (BDS)
description: Canonical recipe for components/ui/<Component>/<Component>.mdx pages. Six-section shape, banned sections, callouts, code-block language tags, ADR-006/007 same-words-different-layers reconciliation.
type: reference
scope: brik-bds
applies-to: "**/components/ui/**/*.mdx, **/stories/**/*.mdx, **/content-system/**/*.mdx"
retrieved-via: brik-rag query "storybook mdx recipe standard"
last-verified: 2026-05-13
---

# Storybook MDX recipe (BDS)

Rules for `components/ui/**/*.mdx` and other Storybook documentation MDX in this repo. Source of truth lives in this file; agents retrieve via `brik-rag query "storybook mdx recipe standard"`.

**Out of scope:** story file shape (see [storybook-story-shape](./storybook-story-shape.md)); component build rules (see [component-build](./component-build.md)).

**Authoritative ADR:** [ADR-007](../../docs/adrs/ADR-007-storybook-page-recipe.md) is the governing decision; the recipe + acceptance criteria below are the operational expression. The lint script `scripts/lint-storybook-recipe.js` enforces conformance on pre-commit + CI.

## The recipe — required structure for every `components/ui/{Component}/{Component}.mdx`

```mdx
import { Meta, Canvas, ArgTypes } from '@storybook/addon-docs/blocks';
import { ComponentLinks } from '../../../.storybook/blocks/ComponentLinks';
import * as Stories from './{Component}.stories';

<Meta of={Stories} />

# {Component name}

<ComponentLinks slug="{component-slug}" />

One- or two-sentence description. What it does, not when to use it.

## Playground

<Canvas of={Stories.Playground} />

## Variants

{Optional 1–3 sentences framing what varies.}

<Canvas of={Stories.Variants} />

{/* `## Patterns` — conditionally required, see below */}

## Props

<ArgTypes of={Stories} />
```

That's the **canonical shape**: Title → Links → Description → Playground → Variants → (Patterns) → Props. Three sections can sit between Props and end-of-file, each fixed in position when present:

- `## Patterns` — **conditionally required**. Include IFF the matching `*.stories.tsx` ships any Q4 (irreducible composition) or Q5 (`play`-only interaction) story per ADR-010. If the component has only Q3 semantic-variant stories, omit the section entirely. When present, it sits between `## Variants` and `## Props` and must contain at least one `<Canvas>`. **Never invent a Q4 story to make this section non-empty** — see [story-shape standard §Don't contrive Q4 stories to satisfy lint](./storybook-story-shape.md).
- `## CSS Override API` — table of component-scoped CSS variables, with one example. Required if the component exposes any.
- `## Notes` — short call-outs (deprecations, browser caveats, peer-component pointers). Three or fewer items per page.

Nothing else. No `## Usage`, no `## When to use`, no `## Tokens`, no `## Source attribution`.

### When `## Patterns` belongs in the file

```mdx
## Variants
### Warning
<Canvas of={Stories.Warning} />

## Patterns
<Canvas of={Stories.OnboardingChecklist} />   {/* Q4 — args can't express */}

## Props
```

### When it doesn't

```mdx
## Variants
### Announcement
<Canvas of={Stories.Announcement} />
### Information
<Canvas of={Stories.Information} />

{/* No ## Patterns — Banner has no Q4/Q5 stories; dismissibility is Q2 via onDismiss Control */}

## Props
```

Banner is the gold-standard reference for the omit case (see [#605](https://github.com/brikdesigns/brik-bds/issues/605)).

## Why this shape — `<ComponentLinks>` as the connector

Storybook owns live demos + the prop API. The docs site at [design.brikdesigns.com](https://design.brikdesigns.com) owns when-to-use, anatomy, design rationale, accessibility narrative. `<ComponentLinks slug="..." />` renders the triple-link header (`Source code | Usage guidelines | Accessibility`) on every page so a reader hitting the Storybook page always knows where the deeper guidance is.

The split:

| Surface | Owns |
|---|---|
| Storybook | Live demos, prop API, copy-pasteable code, accessibility test stories, visual regression |
| docs-site | When-to-use, anatomy, design rationale, comparisons, accessibility narrative, theming guidance |

Carbon does the same split — `react.carbondesignsystem.com` (Storybook) vs `carbondesignsystem.com/components/{name}` (design docs). The triple-link header is the load-bearing connector that keeps both surfaces consistent.

## Banned patterns — rejected by lint or PR review

| Pattern | Why banned |
|---|---|
| `---` dividers | H2 spacing already provides section boundaries (`margin-top: 48px` in `storybook-overrides.css`); dividers are chrome the typography contract already handles |
| `## Usage` code-only section | Duplicates what `<Canvas>` shows in source view; the chosen import path drifts (`@brik/bds` vs `@brikdesigns/bds`) |
| `## When to use` / `## When NOT to use` | Belongs on docs-site (`/docs/components/{slug}`), not Storybook |
| `## Source attribution`, deep design narrative | Same — docs-site |
| `## Tokens` listing | Storybook is for demos, not token enumeration. Link to `/docs/primitives/color` if needed |
| Emoji in headings | Already in legacy CONTENT-GUIDE; reaffirmed |
| Skipped heading levels (`# → ###`) | H1 → H2 → H3, never jump. H1 is the page title only; nothing else uses H1 |
| Inline `<table>` HTML | Use markdown tables in MDX; use `docTable/docTh/docTd` helpers from `stories/foundation/_components/docTableStyles.ts` for TSX dashboards |
| Bare triple-backtick code blocks | Always tag the language: `tsx`, `ts`, `js`, `bash`, `css`, `json`, `yaml`, `mdx`, `tree` |

## H2 section names vs story export names — same words, different layers

This is the highest-friction collision in the system. ADR-006 bans `Variants` / `Tones` / `Patterns` as **story export names**. ADR-007 (this recipe) **requires** `## Variants` as an **MDX H2 section** and treats `## Patterns` as **conditionally required** (present only when the component has Q4/Q5 stories).

| Layer | This recipe (`*.mdx`) | [story-shape standard](./storybook-story-shape.md) (`*.stories.tsx`) |
|---|---|---|
| `## Variants` H2 | **Required** section heading | n/a |
| `## Patterns` H2 | **Conditional** — include only when Q4/Q5 stories exist | n/a |
| `export const Variants` | n/a | **Banned** |
| `export const Tones` | n/a | **Banned** |
| `export const Patterns` | n/a | **Banned** |
| `export const Playground` | Referenced via `<Canvas of={Stories.Playground} />` | **Required** |
| `export const Warning`, `Error`, etc. | Referenced via `<Canvas of={Stories.Warning} />` under `## Variants` | **Required** (one per meaningful state) |

A new component written under both standards looks like this:

```tsx
// {Component}.stories.tsx
export const Playground = ...      // sandbox
export const Warning = ...         // per-state, named after the state
export const Error = ...
export const OnboardingChecklist = ...   // irreducible composition
```

```mdx
{/* {Component}.mdx */}
## Variants
### Warning
<Canvas of={Stories.Warning} />
### Error
<Canvas of={Stories.Error} />

## Patterns
<Canvas of={Stories.OnboardingChecklist} />
```

Both standards satisfied. Recipe lint passes. Story-shape rule passes.

## Callouts — minimal vocabulary

Carbon uses italicized `_Note: …_` and nothing else. Brik adopts the same minimal vocabulary plus the structural `blockquote` primitive:

```mdx
> **Note** — One short sentence about a non-obvious behavior.

> **Warning** — One short sentence about a footgun.
```

Both render through the `blockquote` chrome, styled per the visual contract in ADR-007. **No admonition components, no toast components, no tip/info/danger/success matrix.** If you need more, write a docs-site page and link it from the description.

## Visual contract — what the rendering layer guarantees

The recipe is content-shape; the rendering layer is ADR-007's visual contract — what `h1` / `h2` / `pre` / `<Canvas>` / `<ArgTypes>` are *supposed* to look like in light + dark + Client Sim themes. Authors don't need to think about it as long as they stay inside the recipe. If a page looks broken in one theme but not another, that's a contract bug — file it against ADR-007's visual-contract table, not the page itself.

The one rule that affects authoring: **never override visual treatment from inside MDX.** No inline `style=`, no per-page CSS classes that bypass the contract. The contract is the contract.

## Foundation pages — token category template

Token / foundation pages (Color, Typography, Spacing, etc.) follow a tighter shape because they're not component pages:

```mdx
# {Token category name}

What this token category controls and how it fits the system.

## Semantic tokens

{Content — tables, React components, or grids}

### {Subcategory if needed}

{Content}

## Primitives

{Scale tables or visualizations}
```

No `<ComponentLinks>` block (no component to link to). No `## Variants` / `## Patterns` (no stories to demo). The rest of the rules (heading hierarchy, banned patterns, callouts) apply.

## Dashboard pages — interactive dev tools

TSX story pages that render dashboards (`HealthDashboard`, `TokenCoverage`, `ContrastCompliance`, `ThemeSwitcher`):

- Use `docTable` / `docTh` / `docTd` from [`stories/foundation/_components/docTableStyles.ts`](../../stories/foundation/_components/docTableStyles.ts) for all tables
- Section headings rendered as styled `<h2>` elements (not markdown)
- Metric cards use consistent padding / radius tokens
- Tagged `['!manifest']` if they're tools rather than docs

These pages are exempt from the six-section recipe — they're dev tools, not component documentation. The visual contract still applies.

## Stub pattern — content that has moved to docs-site

When narrative content moves to docs-site, leave a one-page MDX with:

```mdx
import { Meta } from '@storybook/addon-docs/blocks';

<Meta title="Content-System/Industries/dental" />

# Dental

This page has moved. Read the canonical version at [design.brikdesigns.com/docs/content-system/industries/dental](https://design.brikdesigns.com/docs/content-system/industries/dental).
```

Why: search engines, agent MCP queries, and old Notion / chat links continue to resolve. The stub is one paragraph and one outbound link — never the original content kept "for archive."

## Acceptance criteria — lint-enforced

A page conforms when:

1. Imports `Meta`, `Canvas`, `ArgTypes` from `@storybook/addon-docs/blocks`, imports `* as Stories`, imports `ComponentLinks`, contains `<Meta of={Stories} />`.
2. The first heading is one `# {Component name}`. Nothing above it except the imports and `<Meta>`.
3. Immediately after H1: `<ComponentLinks slug="..." />` then a 1–2 sentence description paragraph.
4. Required sections appear in this order, no omissions, no deviations from spelling: `## Playground` → `## Variants` → `## Props`. `## Patterns` is conditional — when present it sits between `## Variants` and `## Props` and must contain a `<Canvas>`. `## CSS Override API` and `## Notes` are optional and follow `## Props` in that order.
5. No `---` dividers anywhere in the file.
6. No `## Usage`, `## When to use`, `## When NOT to use`, `## Source attribution`, `## Tokens`, or other narrative-bearing section.
7. Every `<Canvas>` references a story exported from the matching `*.stories.tsx`.
8. The page renders cleanly in **all three Storybook themes** (Brik Brand, Brik Brand Dark, Client Sim Font Audit) with no theme-specific visual breakage.
9. `npm run lint-storybook-recipe` reports zero violations.

[`scripts/lint-storybook-recipe.js --enforce`](../../scripts/lint-storybook-recipe.js) runs as part of `.husky/pre-commit` and `.github/workflows/storybook-recipe-check.yml`. A failing lint blocks merge.

## Migration disposition for non-component MDX

Files outside `components/ui/` that exist as MDX in Storybook today are classified by ADR-007 into three buckets:

- **Keep** — `stories/Welcome.mdx` (already a docs-site router), dashboard tools (`HealthDashboard`, etc.), interactive playgrounds (`Atmospheres`, `NavigationArchetypes`)
- **Stub** — `content-system/Overview.mdx`, all `content-system/industries/*.mdx`, `content-system/voices/Overview.mdx` (one-line redirects to docs-site)
- **Defer** — `content-system/brand/Brik.mdx`, `content-system/compliance/Healthcare-ADA.mdx`, `content-system/vocabularies/ImageMood.mdx` (await docs-site equivalents; tracked in GitHub issues)

See [ADR-007 §Narrative MDX migration disposition](../../docs/adrs/ADR-007-storybook-page-recipe.md) for the full per-file table.

## When this standard updates

1. Edit this file (the source of truth)
2. Re-run `scripts/ingest-storybook-mdx-recipe-standard.sh` to push to brik-rag
3. Bump `last-verified` in frontmatter
4. **If the change is material** (new required section, change in section order, change to acceptance criteria): also amend [ADR-007](../../docs/adrs/ADR-007-storybook-page-recipe.md) and update `scripts/lint-storybook-recipe.js`
5. **If the change is minor wording**: just this file + ingestion script

The skill auto-retrieves on `*.mdx` edits — no other propagation needed.
