# ADR-041 — One `--content-width-*` ladder: role in the name, not in a second family

**Status:** Accepted (2026-09-28)
**Date:** 2026-09-28
**Supersedes:** [ADR-032](./ADR-032-section-header-and-content-measure.md) §1 and §2 (the token half only — §3 `SectionHeader` and §4 consumer migration stand)
**Superseded by:** —
**Owner:** Nick Stanerson
**Related:** [ADR-025](./ADR-025-page-grid-standard.md) (the band ladder and `--page-inset`), [ADR-033](./ADR-033-naming-canon-one-word-per-concept.md) (one word per concept — the canon this restores), [ADR-023](./ADR-023-content-blocks-and-prose-rhythm.md) (the slot rhythm `SectionHeader` composes), [#2615](https://github.com/brikdesigns/brik-bds/issues/2615) (this decision), [brikdesigns#1827](https://github.com/brikdesigns/brikdesigns/issues/1827) (the layout defect that exposed it)

## Context

BDS shipped two width ladders:

| Ladder | Unit | Job per the docs | Defined |
|---|---|---|---|
| `--content-width-sm…full` | px | the band / container | `tokens/gap-fills.css` (ADR-025) |
| `--measure-sm/md/lg` | ch | the text column inside it | `tokens/gap-fills.css` (ADR-032 §1) |

The distinction in ADR-032 §2 — *a band is not a text column* — is real. The **second token family** was not the way to express it, and it produced three defects.

**1. The role sat on two tokens at once.** `page-grid.mdx:43` and `size.mdx:20` both label `--content-width-sm` (640px) *"Prose, reading columns, focused forms"*. Eighty lines later the same page warns *"A measure is not a band. Never cap a section intro with a `--content-width-*` token"* ([`page-grid.mdx:89`](../../docs-site/content/docs/build-standards/page-grid.mdx#L89)). Two rules, one doc, opposite instructions.

**2. An agent read the wrong one correctly.** brikdesigns#1827 landed `max-width: var(--content-width-sm)` on a prose block with the comment *"readable measure; `--content-width-sm` (640px, a prose/reading-column token)"* ([`blocks.css:128`](https://github.com/brikdesigns/brikdesigns/blob/staging/src/components/blocks/blocks.css#L128)) — a near-verbatim quote of the role table. It is the only `--content-width-sm` use in that repo's `src/`. The docs caused the bug; the agent followed them.

**3. `ch` bought nothing and cost alignment.** ADR-032 §1 justified `ch` because *"a measure tracks the type size."* Nothing in BDS scales body type: `--body-md` is a fixed 16px, only the four `--display-fluid-*` heading tokens clamp, and `[data-mode-spacing]` never touches `font-size`. So the tracking never happens — while two siblings sharing one `ch` cap but set at different type sizes resolve to two different pixel widths. That is the two-left-edges symptom brikdesigns#1827 shipped.

The ladders also interleave non-monotonically (`--measure-lg` ≈ 723px sits *between* `--content-width-sm` 640px and `--content-width-md` 800px), so neither ladder can be read as a scale on its own.

## Decision

**One ladder. Every horizontal cap on a page is a `--content-width-*` rung, in px, and each rung carries exactly one role — stated in its name.**

```text
--content-width-text-xs:   448px   text — short intro: eyebrow + one-line title
--content-width-text-sm:   600px   text — section intro: title + description (the default)
--content-width-text-md:   720px   text — long-form prose, rich-text body
--content-width-sm:        640px   band — narrow band, focused forms
--content-width-md:        800px   band — standard text-led body section
--content-width-lg:       1024px   band — feature grids, CTA bands
--content-width-xl:       1280px   band — the page band: hero, header, footer
--content-width-full:      100%    band — full-bleed
```

A `-text-` rung caps a **text column**; a bare rung sizes a **band**. Band-vs-measure survives as a *role*, legible where the author is already looking — the token name — instead of as a parallel family they have to know exists.

`--measure-sm/md/lg` are **retired**: a reading column having one name is the whole point. They ship for **one minor as deprecated aliases** onto the `-text-` rungs, then drop — the standard BDS deprecation window, and the one `lint-deleted-token-consumers` sanctions. A bare deletion was the first draft of this ADR and the gate rejected it, correctly: brikdesigns has five live `var(--measure-*)` call sites, and a `var()` at a deleted name invalidates the whole declaration, so each `max-width` would have become `none` rather than falling back. The aliases sit in the existing DEPRECATED block in [`tokens/gap-fills.css`](../../tokens/gap-fills.css) beside `--content-width-narrow/default/wide`, and drop in the same change that removes those.

### The column rule (the rule that was actually missing)

> **A column has one content width and one left edge.** The element that OWNS the column sets the width; blocks nested inside it never re-cap themselves. Two caps in one column is the defect, not the fix.

brikdesigns#1827 is a *structural* failure, not only a token-picking one: applying the "right" token to the inner block would have produced the same misalignment. The defect is two `max-width` declarations in one column. This rule is recorded in [`tokens/gap-fills.css`](../../tokens/gap-fills.css) beside the ladder and in `build-standards/page-grid.mdx`.

### Values: today's rendered widths, not a retune

Each retired `ch` rung maps to the px width it already resolved to at the 16px body size, rounded to the 4-point grid:

| Retired | Rendered | New | Movement |
|---|---|---|---|
| `--measure-sm` 44ch | ~449px | `--content-width-text-xs` 448px | −1px |
| `--measure-md` 60ch | ~602px | `--content-width-text-sm` 600px | −2px |
| `--measure-lg` 72ch | ~723px | `--content-width-text-md` 720px | −3px |

This is deliberate. `--measure-*` has 12 hand-authored consumers across `content-system/blueprints/{astro,react}/` and `components/ui/SectionHeader/`; folding them onto the *existing* band rungs (640/800) would have widened every blueprint prose column by 38–77px — a design change this ADR has no mandate to make. The text rungs therefore interleave numerically with the band rungs (600 < 640 < 720 < 800). That is expected: a rung is picked by its role, which the name states, never by sorting the ladder.

### What ADR-032 keeps

§3 (`SectionHeader` composes `ContentBlock` and owns measure + alignment) and §4 (consumers stop hand-rolling section headers) are **unaffected**. The `measure` prop keeps its `sm`/`md`/`lg` vocabulary — it is a named role over the text rungs, which is exactly what a component prop should be. Only its CSS target moves:

```css
.bds-section-header--measure-sm { max-width: var(--content-width-text-xs); }
.bds-section-header--measure-md { max-width: var(--content-width-text-sm); }
.bds-section-header--measure-lg { max-width: var(--content-width-text-md); }
```

## Consequences

- **Rendering moves slightly, and the baselines move with it.** The cap change is ≤3px on three rungs, all still on the 4-point grid — but a 2–3px narrower measure can cross a wrap boundary, and a re-wrap moves everything below it by a line height. Measured on the `visual` gate at `ac13fd4a`: **19 of 399 tests across 7 of 8 shards** (shard 1 clean), every one a `--measure-*` or `SectionHeader` consumer. Two shapes, both benign: re-centred text at the same height (`SectionHeader › Default`, ratio 0.01), and a one-line re-wrap that shifts the block under it (`TestimonialsFeaturedLarge › With Video`, ratio 0.14 — the ~20px is one line of the story's own placeholder quote, not shipped copy). Baselines are regenerated through `update-visual-baselines.yml` (ADR-026 — the only sanctioned source), and the regen commit is the review surface. The first draft of this ADR asserted rendering was unchanged; that was written before the gate ran and the gate refuted it.
- **One ladder to learn.** An author capping anything horizontal reaches for `--content-width-*` and picks the rung whose name says their role. There is no second family to discover, and no rung answers to two roles.
- **`lint-token-tiers`** drops `--measure-` from `SD_SEMANTIC_PREFIXES` ([`scripts/lint-token-tiers.mjs:86`](../../scripts/lint-token-tiers.mjs#L86)). `tokens/naming-canon-baseline.json` is **unchanged**: its three `--measure-*` rows are Rule-4 *BEM modifier* entries for `.bds-section-header--measure-{sm,md,lg}` (#1927), not token names, and that class survives with ADR-032 §3. They burn down when #1927 renames the modifier, not here.
- **Docs carry the fix, not just the tokens.** `page-grid.mdx` § Content measure is rewritten around the one ladder plus the column rule; `size.mdx` folds its `ch` rationale; both gain the cross-links their Related sections were missing (`size.mdx` → page-grid, `spacing.mdx` → content-rhythm). The role collision that caused brikdesigns#1827 is removed at the source, so the next agent reading the table reads one answer.
- **No new gate.** Path A (brik-client-portal#3537) forbids net-new governance surface; the existing `lint-deleted-token-consumers`, `lint-naming-canon` and `lint-token-tiers` already cover this change. Whether the column rule deserves its own lint stays open until a second offense exists.
- **brikdesigns has 5 live consumers and migrates on its next BDS bump**, not here: `value.css:299,347,412,427` and `industry-detail.css:283` (plus comment references at `contact.css:77` and `industry-detail.css:275`). They keep rendering through the deprecation window because the aliases still resolve; the migration rides the version bump, and the alias block drops after it lands.
- **Two stale allowlists are knowingly left.** `.storybook/public/brik-inspect.js:94` and `components/ui/BrikDevBar/widgets/inspect-widget.js:94` still list `'--measure-'` as an inspect prefix — cosmetic only (it matches nothing now), and both files are being edited concurrently in another worktree. They clear on that branch's next pass.

> OPERATOR SAID 2026-09-28 (chat): "go" — ratifying *"one ladder. Retire `--measure-*` into `--content-width-*` (px), give each token exactly one role, and add the missing structural rule — a column has one width and one left edge; blocks inside never set their own."*
