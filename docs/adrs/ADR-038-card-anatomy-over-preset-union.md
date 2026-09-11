# ADR-038 — Card is one anatomy component with a `layout` axis, not a five-member preset union

**Status:** Proposed (2026-09-11)
**Date:** 2026-09-11
**Supersedes:** [ADR-018](./ADR-018-card-preset-boundary.md) — its keep-the-presets path is replaced by flattening the union into a `layout` axis
**Refines:** [ADR-004](./ADR-004-component-bloat-guardrails.md) (preset-over-component principle — this adds the *anatomy-over-preset-union* rule on the other side)
**Related:** [ADR-006](./ADR-006-storybook-taxonomy-and-story-shape.md) (sidebar taxonomy), [ADR-010](./ADR-010-storybook-axes-of-information.md) (story-vs-control matrix), the 2026-05-17 Card-family review (preset consolidation), memory `project-card-family-architecture-2026-05`
**Owner:** Nick Stanerson

## Context

The 2026-05-17 Card-family review applied ADR-004 correctly for `CardControl`/`CardSummary` → `Card preset="control"`/`preset="summary"`, then over-applied it by folding two grid-cell shapes (`display`, `display-row`) into the same component. `Card` became a **five-member discriminated union** (`Card.tsx:400-405`): `CardDefaultProps | CardControlPresetProps | CardSummaryPresetProps | CardDisplayPresetProps | CardDisplayRowPresetProps`.

ADR-018 (2026-07-05, never Accepted) recognised `display`/`display-row` were mis-classified but chose **keep-and-clarify** over extraction, on migration cost. That left the union — and its consequences — in place. A 2026-09-11 Storybook-quality review surfaced those consequences as concrete defects.

### Evidence (reproduced 2026-09-11)

1. **The union defeats prop inference.** `react-docgen-typescript` with the repo's own `.storybook/main.ts:27` config flattens all five shapes into **27 co-mingled props on one surface**. A `summary` card's Controls panel lists `imageWidth`, `connectionStatus`, `mediaTreatment`, `image` — all inert for that preset. Storybook cannot express "which props belong to which preset," because the discriminant is a runtime `if` chain (`Card.tsx:496-508`), not a type Storybook can branch on.

2. **The union has no valid default, so the docs surface renders empty.** Rendering `<Card />` with no args (what the autodocs preview / a reset Controls panel produces) falls through every preset guard to `renderDefault({ children: undefined })` (`Card.tsx:508`) and emits `<div class="bds-card bds-card--outlined bds-card--padding-md"></div>` — an **empty outlined box**. This is the reported "presets show empty results" symptom. The stories themselves render correctly (`<DisplayRow/>` → root `bds-card--preset-display-row`, title "Web Design Retainer"); the empty box is Card rendered *without* story args.

3. **`variant` means two different things.** Default shape: `outlined | brand | elevated | raised | borderless` (`Card.tsx:153`). `display` preset redefines it as `borderless | elevated | raised` (`Card.tsx:270`). Same prop name, different option set per branch.

4. **The CSS fights itself.** `.bds-card--preset-display.bds-card--borderless` and its siblings (`Card.css:388-414`) exist only to undo the fill/border the preset re-declared after the base variant in source order — specificity hacks that a single surface-prop set removes.

5. **`ProductSummaryCard` is a bare `div` re-implementing summary anatomy** (leading service glyph + label→value→price stack) without reusing `Card`, re-declaring the service tint the display presets already own.

### The anatomy insight

`display` is not a *kind of card* — it is the default card with media on top, an overline, a title, body copy, and a bottom-anchored action. `display-row` is the same anatomy laid out horizontally. `summary` is the same anatomy where the "title" is a large value and the "overline" is its label. `control` is a horizontal row with a status slot. **They differ by arrangement of the same slots, not by content type.** That is a `layout` axis (ADR-010 Q3 Layout-variant), not a prop union.

## Decision

### 1. Card is one flat interface — a slot set, a `layout` axis, and one shared surface set

```ts
type CardLayout = 'stack' | 'row' | 'metric';   // default 'stack'

interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  layout?: CardLayout;

  // Anatomy slots (all optional; a Card renders whatever it is given)
  media?: ReactNode;      // avatar / image / logo / framed media
  overline?: ReactNode;   // eyebrow — tag, category, label, service mark
  title?: ReactNode;      // heading OR (metric) the large value
  titleAs?: 'h2' | 'h3' | 'h4';
  children?: ReactNode;   // body / summary content under the title
  action?: ReactNode;     // bottom-anchored action
  badge?: ReactNode;      // overlay badge (media corner)

  // One shared surface set — applies to every layout
  variant?: CardVariant;  // one option set, no per-layout redefinition
  tint?: CardTint;
  padding?: CardPadding;
  interactive?: boolean;
  href?: string;
}
```

No discriminated union. `layout` selects arrangement; the slots are the same across all three. Storybook infers one flat, honest prop set; the argless-empty path is gone (an argless Card is a valid empty `stack`, and Controls now expose the real slots so an author fills them).

### 2. Old preset → new shape

| Old | New | Notes |
|---|---|---|
| default | `layout="stack"` + `children` | unchanged mental model |
| `preset="display"` (grid cell) | `layout="stack"` + `media` + `overline` + `title` + `children` + `action` | it *is* a stack card; composed inside `CardGrid` |
| `preset="display-row"` | `layout="row"` | media left, body right |
| `preset="summary"` | `layout="metric"` | `overline`=label, `title`=value; context-neutral (not finance-scoped) |
| `preset="control"` | `layout="row"` + a `status` slot | the connection-status dot is a slot, not a baked preset |
| `ProductSummaryCard` | `layout="metric"` + `overline`=`<ServiceTag>` | component deprecated; see §4 |

### 3. `CardGrid` is unchanged — and there is no overlap

`CardGrid` is the Section wrapper (header + slot); it never owned the card. Its cell was `Card preset="display"` (`Services3ColCardGrid.tsx:56`) and becomes `<Card layout="stack">`. CardGrid keeps section + columns; Card owns cell anatomy. **No `CardGridCell` component is introduced** — the `layout` axis on the one Card is the cell. This closes ADR-018's "held in reserve" extraction alternative without paying its cost: nothing extracts, the union collapses instead.

### 4. `ProductSummaryCard` is deprecated into `layout="metric"`

Same playbook as `CardControl`→`preset="control"`: `@deprecated` JSDoc, `!manifest` on the meta, story consolidated into `Card.stories.tsx`, standalone sidebar entry removed. The service-line glyph moves to the `overline` slot (`<ServiceTag>`); the service tint uses Card's existing `tint`. `service` is dropped from the tint options on migration (Card's `tint` already excludes it, `Card.tsx:21`).

### 5. Guardrail (refines ADR-004)

Added to the component-build standard: **when two or more `preset` values on a Container share the same bounded surface and differ only in arrangement of the same slots, they are a `layout` axis on one flat interface — not a discriminated-union preset.** ADR-004 routes *new shape → component or preset*; ADR-018 routed *preset → keep or demote*; this routes *preset-union → flatten to anatomy + layout* when the members are arrangement-variants of one slot set.

## Consequences

**Positive**
- Storybook infers one honest prop set; Controls stop offering inert props; the argless-empty render disappears.
- One `variant` option set; the `.bds-card--preset-*` specificity hacks (`Card.css:388-414`) are deletable.
- `summary`/`metric` is context-neutral, absorbing `ProductSummaryCard`.
- `layout` is an ADR-010 Q3 Layout axis → one story per layout, clean sidebar.

**Negative / accepted**
- Consumer-facing API change: `preset="…"` → `layout="…"`. Mitigated by a re-export/prop bridge (below) over a deprecation window.
- `control`'s status slot needs a small dedicated sub-shape; not every slot is meaningful in every layout (documented per layout, not type-enforced) — accepted as the cost of a flat interface.

## Migration plan (phased — separate sized tickets)

1. **Add the flat API alongside the union.** Introduce `layout` + slots; internally map `preset="display"`→`layout="stack"` etc. so both work. No consumer churn yet.
2. **Deprecate the `preset` prop** (`@deprecated`), point docs/JSDoc at `layout`.
3. **Migrate consumers** — `web/brikdesigns` (~15 `preset="display"` sites, ADR-018 usage survey), `CardGrid`/`Services3ColCardGrid`, portal.
4. **Fold `ProductSummaryCard`** into `layout="metric"`; deprecate the component.
5. **Remove the `preset` prop + preset CSS + specificity hacks** once consumers are off it.

## Considered alternatives

**A. Keep presets, only fix typing + prune Controls (ADR-018 keep-and-clarify).** *Rejected:* the union is the root cause of both the inert-props and empty-render defects; per-story `argTypes` scrubbing treats symptoms and must be re-applied for every future preset.

**B. Extract `display`/`display-row` into a dedicated grid-cell component** (ADR-018 Alternative A). *Rejected:* pays ~15 rewrites for a taxonomy gain the `layout` axis delivers by collapsing, not extracting — and leaves the union (control/summary/default) intact.

**C. Reverse ADR-004 and re-split `control`/`summary` into components.** *Rejected, same as ADR-018 §C:* they are generic same-surface layouts; the fix is a flat `layout` axis, not more components.
