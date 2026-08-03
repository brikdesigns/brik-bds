# ADR-027 — Table-cell layer ownership: a cell earns a component when it renders the table element and owns a cell-level concern

**Status:** Accepted (2026-08-03)
**Date:** 2026-08-03
**Supersedes:** —
**Superseded by:** —
**Related:** [ADR-004](./ADR-004-component-bloat-guardrails.md) (component-bloat guardrails — the purpose test this rule specializes), [ADR-018](./ADR-018-card-preset-boundary.md) (the sibling boundary rule for Card presets), [ADR-017](./ADR-017-slot-pattern-gate-supersedes-closed-allowlist.md) (new `bds-*` slot names need no canon edit), [#1491](https://github.com/brikdesigns/brik-bds/issues/1491) (this work), [#1438](https://github.com/brikdesigns/brik-bds/issues/1438) (umbrella), [#1282](https://github.com/brikdesigns/brik-bds/issues/1282) (sticky end column), [#1280](https://github.com/brikdesigns/brik-bds/issues/1280) (cell-link action pattern)
**Owner:** Nick Stanerson

## Context

`Table` shipped six dedicated cell components alongside the structural primitives, all exported from `components/ui/Table/index.ts`: `TableActionsCell`, `TableAvatarCell`, `TableImageCell`, `TableLogoCell`, `TableServiceTagCell`, `TableSkeletonRow`.

At the same time, `Table.stories.tsx` hand-rolled two more cell compositions as story-local helpers that were never published:

- `IconLeftCell` — a 24px icon box plus label (`Table.stories.tsx:45` at `840ab607`)
- a two-line primary/secondary text stack — inline `<div>`s styled by the local `twoLinePrimary` / `twoLineSecondary` `CSSProperties` consts (`Table.stories.tsx:31-42`)

So the cell catalog was split across two layers with **no stated rule for which layer a new cell goes to**. Two concrete costs:

1. **A copy-paste drift path.** A consumer needing an icon-left or two-line cell had to copy markup out of a story file — the same drift that produced the hand-rolled-markup findings in #1438's parent review.
2. **The copied markup was wrong.** The story-local secondary line used `--text-muted`, which `Table.css` already documents as failing WCAG AA at that size, with `--text-secondary` as the contract (`Table.css:252`, #526). The published `TableAvatarCell` had the correct ramp; the unpublished twin did not. An unpublished cell cannot be gated, so it silently diverged.

ADR-004 gives the general purpose test (*would a designer reach for this by name?*). That test does not discriminate here — a designer would plausibly reach for "the two-line name cell" by name, and equally plausibly treat it as "just some text in a cell." The family needed a rule with a **structural** discriminator, not an intuition.

## Decision

**A table-cell composition earns a component when it renders the table element itself (`<td>` / `<tr>`) *and* owns at least one cell-level concern a consumer cannot get by nesting primitives inside `TableCell`.**

The qualifying cell-level concerns are:

| Concern | Example |
|---|---|
| Intrinsic width / alignment behavior | `TableActionsCell` — `width: 1%`, `align` |
| An `aria` contract | `TableActionsCell` — `aria-label="Actions"` |
| A row-density-coupled internal layout | every media cell — `data-size` padding, `data-flush` edges |

**Content arranged *inside* a `TableCell` is not a cell.** It is either an existing primitive used directly (`Badge`, `Tag`, `TextLink`, `TextInput`) or, if it is a genuine multi-component arrangement, an MDX `## Patterns` entry.

The discriminator is deliberately **element identity first**. It is statically checkable by reading one line of the render, it does not require a judgment call about designer intent, and it lands the same way for every reviewer. The concerns list is the second gate, and it is what stops the rule from licensing a `<td>` wrapper for every content shape.

### Corollary — a cell that qualifies must be published

If a composition passes both gates, it is a component and it ships from `components/ui/Table/index.ts`. It may **not** live as a story-local helper. This is the half of the rule that closes the drift path: an unpublished cell has no props table, no MDX entry, no lint coverage, and — as #526's contrast contract showed — no way to stay correct.

## Applied to all eight compositions

| Composition | Element | Cell-level concern | Verdict |
|---|---|---|---|
| `TableSkeletonRow` | `<tr>` | Composes `TableRow`/`TableCell`, inherits row height | Component (unchanged) |
| `TableActionsCell` | `<td>` | `width: 1%`, `align`, `aria-label` | Component (unchanged) |
| `TableAvatarCell` | `<td>` | Density padding, flush edges, truncating text stack | Component (unchanged) |
| `TableImageCell` | `<td>` | `width: 1%`, density padding, 1:1 media box | Component (unchanged) |
| `TableLogoCell` | `<td>` | Same square-media chrome, name-referenced | Component (unchanged) |
| `TableServiceTagCell` | `<td>` | Density padding, wrap + gap | Component (unchanged) |
| two-line text stack | was `<div>` in a cell | Truncating text stack + the #526 type ramp | **Promoted → `TableTextCell`** |
| `IconLeftCell` | was `<span>` in a cell | Fixed icon-box footprint for column alignment | **Promoted → `TableIconCell`** |

Both promotions were **whole-cell layouts in practice** — each occupied its `TableCell` entirely and carried token-bearing internals. Promoting them rather than documenting them as Patterns is what removes the raw `var()` styling instead of relocating it into consumer code, where the no-raw-`var()`-in-TSX rule would be violated at every call site.

`TableTextCell` and `TableAvatarCell` are the same cell with and without the avatar, so they **share one type ramp** in `Table.css` (one rule, two selectors) rather than duplicating it. That also means `TableTextCell` inherits the #526 contrast contract by construction — the divergence that motivated this ADR cannot recur between them.

### What this rule does *not* license

- A `<td>` wrapper whose only job is to hold one primitive. `<TableCell><Badge …/></TableCell>` stays as it is — `Badge` needs no cell-level concern.
- A content-typed cell (`TableServiceCell`, `TableInvoiceCell`). That is ADR-018's boundary restated at the cell layer: content-typed shapes are the consumer's composition, not BDS surface.

## Consequences

**Positive**

- The catalog is one layer. Eight exported cells, zero story-local cells; `Table.stories.tsx` no longer carries `CSSProperties` consts.
- New-cell review is a two-line check (element? concern?) instead of an intuition argument.
- #1282 (sticky end column) and #1280 (cell-link action pattern) inherit the rule rather than re-litigating it. A sticky column is intrinsic-width + a scroll contract → a component. A cell-link is `TextLink` inside `TableCell` → not a cell.
- One WCAG AA contrast divergence removed from the repo (`--text-muted` → `--text-secondary` on the two-line secondary).

**Negative**

- Two more exports on a family ADR-004-era review already called bloat-prone. Accepted: both replace markup consumers were copying anyway, so the surface moved rather than grew, and the element-identity gate is what stops the next four.
- The last-body-row divider rule in `Table.css` enumerates every cell class, so each new cell must be added there. Pre-existing (a `:not()` refactor is out of scope here); noted so it is not rediscovered as a bug.

## Alternatives considered

**Demote both to MDX `## Patterns`.** Same rule, opposite outcome. Rejected: the styling has to land somewhere, and the only two options were exposing internal `bds-*` classes for consumers to reference directly, or shipping copyable TSX that re-violates the no-raw-`var()` rule at the consumer layer. Neither closes the drift path — the copy-paste is the problem, and a Pattern is a documented copy-paste.

**Promote the text cell, keep the icon cell a Pattern** (icon+text is generic, not table-specific). Rejected as the strictest but least useful reading: the fixed 24px icon box exists so labels align down a *table column*, which is a table concern, and leaving it unpublished keeps one copy-paste path open for no gain.

**Extend `TableAvatarCell` with an avatar-less mode.** Rejected: decision question 3 in the component-build standard routes >70% CSS overlap to "extend the primitive," but a cell named `AvatarCell` rendering no avatar is a worse API than two named cells sharing a CSS rule. The overlap is resolved in CSS, which is where it actually lived.

## Verification

- `npm run lint-tokens` — no raw `var()` in TSX, no new token names
- `npm run lint-story-shape` — `CellTypes` still a legitimate irreducible `render`
- `npm run lint-component-props` — both new cells' props documented
- `npm run typecheck` + `npm test`
- Visual gate (`visual.yml`) — `CellTypes` baseline changes by design: the two-line secondary shifts from `--text-muted` to `--text-secondary` and from `--body-sm` to `--body-xs`, matching `TableAvatarCell`
