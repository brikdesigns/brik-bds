# ADR-032 — SectionHeader and content measure

## Status

Accepted.

## Context

ADR-023/024 locked vertical rhythm — the tight-to-medium gap scale between `ContentBlock` slots and between components. ADR-025 locked the page grid — the width-container band (`--content-width-*`) plus its edge inset (`--gutter-page`). Both are horizontal or vertical relationships already governed. The axis with no standard is the **inner measure** — the max-width of a centered text column *within* a band — and the primitive that groups a section intro around it.

`--content-width-*` sizes the band (e.g. `xl` = 1280px); it says nothing about the readable column inside it. A section intro (eyebrow/title/description centered above a card grid, a CTA band, a hero) needs a narrower cap than its band — full-width text at 1280px is unreadable — and needs to be centered, not just capped. ContentBlock deliberately owns no width (ADR-023 §5: "Blocks are layout-agnostic"), so there was no home for this concern, and no token existed for it either (`grep -i measure dist/tokens.css` → empty before this change).

The measured cost: brikdesigns hand-rolls the same section-header element with **five different measures**, via **four different grouping patterns**, each repeating `text-align: center` inline:

- `.section-header` (homepage) — `max-width: 600px`
- `.page-hero__description` — `max-width: 700px`
- `--content-width-narrow` reused on blog/marketing prose — `640px`
- `.section-header-narrow` — `width: 70%`
- `.bds-card-grid__header` — `max-width: none` (uncapped)

Five measures for what is conceptually one relationship, repeated centering logic, and no shared name — the same invention pressure that forced `--gutter-page` (ADR-025) and `--border-width-thin/standard/bold` (gap-fills.css) into existence before this ADR.

## Decision

1. **Mint `--measure-sm/md/lg`** (44ch / 60ch / 72ch) in `tokens/gap-fills.css` — the hand-authored semantic layer that already hosts `--content-width-*` and `--gutter-page`; nothing in Style-Dictionary output is hand-edited. `ch`, not `px`: a measure tracks the type size the text is set in, not a fixed pixel cap. Static across spacing modes — a measure is a readability constant, not a density knob, unlike `--gap-*`/`--padding-*`. TS mirror: `measures` export in `tokens/index.ts`.

2. **Measure ≠ band.** `--content-width-*` (ADR-025) constrains the outer container; `--measure-*` constrains a centered text column inside it. A hero band is `content-width-xl` (1280px) with its intro capped at `measure-md` (60ch) — two different numbers serving two different jobs, not one token doing double duty.

3. **New `SectionHeader` component composes `ContentBlock`** and owns only measure + alignment — a `<div className="bds-section-header bds-section-header--{align} bds-section-header--measure-{measure}">` wrapping a `ContentBlock`. It does not reimplement the title/subtitle/description/actions rhythm; that stays owned by `ContentBlock` (ADR-023). This keeps `ContentBlock` layout-agnostic per ADR-023 §5 and avoids the two-ways-to-render-a-title parallel-taxonomy failure the RelationshipField ADR flagged for the Addable\* family (#512/#553) — one component owns slot rhythm, one component owns the horizontal frame around it. Defaults: `align="center"`, `measure="md"`, `titleAs="h2"` (a section header is an outline node, one level under the page `<h1>`), `size="lg"` (the canonical section-heading title scale).

4. **Consumers stop hand-rolling.** brikdesigns' `.section-header` / `.section-header-narrow` / the 600–700px description caps, and the `.bds-card-grid__header { max-width: none }` override, all collapse to `<SectionHeader>` on its next `@brikdesigns/bds` bump — a follow-up in that repo, not this change.

## Consequences

- Retuning the measure scale is one token edit in `tokens/gap-fills.css`, not a search-and-replace across five call sites.
- The CardGrid blueprint's header can adopt `--measure-*` so its default stops fighting consumer overrides (`max-width: none`) — a follow-up, not required by this change.
- Whether a lint gate (mirroring `lint-page-grid`/`lint-content-rhythm`) is warranted for measure usage is an open question — a candidate follow-up, not invented here since no repeat-offense pattern exists yet inside BDS itself.
- Cross-links from `build-standards/content-rhythm.mdx` and `build-standards/page-grid.mdx` to the new measure standard land in the docs-site pass, not this change.
