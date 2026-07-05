# ADR-018 — Card preset boundary: presets are generic card-shaped layouts; content-typed / parent-arranged shapes are Blocks or Sections

**Status:** Proposed (2026-07-05)
**Date:** 2026-07-05
**Supersedes:** — (refines [ADR-004](./ADR-004-component-bloat-guardrails.md) — see § Relationship to ADR-004)
**Superseded by:** —
**Related:** [ADR-004](./ADR-004-component-bloat-guardrails.md) (component-bloat guardrails — the preset-over-component principle), [ADR-006](./ADR-006-storybook-taxonomy-and-story-shape.md) (sidebar taxonomy: Components / Containers / Blocks / Layouts / Sections), [ADR-010](./ADR-010-storybook-axes-of-information.md) (story-vs-control matrix), the 2026-05-17 Card-family review (preset consolidation, `CardControl`/`CardSummary` deprecation, `CardTestimonial`→`Testimonial`)
**Owner:** Nick Stanerson

## Context

ADR-004 established the anti-bloat principle: reach for a **`preset` discriminator on an existing component** before minting a new component. The 2026-05-17 Card-family review applied it — `CardControl` and `CardSummary` were dissolved into `Card preset="control"` / `preset="summary"`, and `Card` became the canonical Container carrying four presets: `control`, `summary`, `display`, `display-row`.

That was the right call for `control` and `summary`. It **over-applied** to `display` / `display-row`, and the symptom surfaced in review:

- `preset="display"` is documented in its own type as *"generic content card for any item rendered in a card grid… used by the `bds-card-grid` blueprint."* It hardcodes `<h3>` for the title, takes `image` / `tag` / `badge` / `action`, and anchors the action with `margin-top: auto` **so cells align across a grid**. Its shape is owned by its parent layout.
- `preset="display-row"` is documented as *"for single-card sections… collapses to a vertical stack at ≤640px"* — a responsive section row.

Neither is a flexible content-grouping container; both are **content-typed compositions arranged by a parent**. Presenting them as `Card` presets (and as standalone Storybook stories `DisplayBorderless` / `DisplayElevated` / `DisplayRow`) reads as "these are kinds of card," which they are not.

ADR-004 gave the rule for *component vs preset*. It did not give the rule for *preset vs Block/Section* — the boundary on the **other** side of a preset. This ADR supplies it.

### Usage data (2026-07-05)

Surveyed all consumers for `preset="display"` / `preset="display-row"`:

| Repo | Usages |
|---|---|
| brik-client-portal | 0 |
| renew-pms | 0 |
| freedom-client-portal | 0 |
| web/brikdesigns | ~15 call sites (services, customers, blog, plans, about, homepage, `CrossReferenceBlock`) — documented as the canonical "image card" |
| brik-bds | the `CardGrid` blueprint (React + Astro) is built on `Card preset="display"` as its cell |

Two facts drive the decision:

1. **The multi-column grid already lives outside Card.** `CardGrid` (a Section-layer blueprint) owns the arrangement; `Card preset="display"` is only the cell it repeats. The canonical composition is `<CardGrid>` + `<Card preset="display">`. The "3-column display" is a Section concern and is already located there.
2. **Migration cost is concentrated in one repo.** The product apps use `display` zero times; extraction would buy them nothing. The entire cost of extracting `display`/`display-row` into a separate component (~15 rewrites) would land on the marketing site, for a gain that is largely taxonomic.

## Decision

### 1. The preset boundary rule

> A **`preset`** on a Container is justified only when it renders the **same bounded surface in a different _generic_ arrangement** — flexible-in, card-shaped, content-agnostic.
>
> The moment a candidate "preset" does any of the following, it is a **Block** (fixed slot shape filled with atoms), a **Section/Layout element** (arranged by a parent), or a **standalone Component** — never a Container preset:
> - prescribes a **content-typed** layout (a "service card," a "pricing tier," a "testimonial");
> - exists to be **arranged by a parent layout** (a grid cell, a carousel slide);
> - hardcodes structure that **blocks composition** (a fixed heading level, no `children` slot, an embedded responsive breakpoint).

This is the missing companion to ADR-004: ADR-004 routes *new shape → component or preset*; this rule routes *preset candidate → keep as preset, or demote to Block/Section*.

### 2. Classification of the current Card surface

| Surface | Classification | Rationale |
|---|---|---|
| `Card` (Default) | **Container** — the component | flexible `children`, content-agnostic |
| `preset="control"` | **Container preset** (keep) | small, generic, bounded settings/integration row |
| `preset="summary"` | **Container preset** (keep) | small, generic, bounded metric |
| `preset="display"` | **Container used as a `CardGrid` cell** (keep, re-scoped) | card-shaped surface, but content-typed + grid-arranged — legitimate *only* as the documented cell of the `CardGrid` Section |
| `preset="display-row"` | **Container used as a section row** (keep, re-scoped) | same as `display`, horizontal |
| `PricingCard` | **standalone Component** (unchanged) | content-typed, `surface-web`-scoped |
| `Testimonial` | **standalone Component** (unchanged) | already correctly split (2026-05-17) |

### 3. Chosen path — keep-and-clarify (not extract)

`display` / `display-row` **remain `Card` presets**, but are formally **scoped as `CardGrid` cells** rather than standalone cards. Extraction to a separate grid-cell component is the *considered alternative* below; it is rejected on cost — zero benefit to the product apps, ~15 rewrites on the marketing site, for a taxonomic gain the `CardGrid` boundary already largely delivers.

Concretely, this ADR commits to:

1. **Documentation** — `display` / `display-row` are documented (component JSDoc + MDX) as **`CardGrid` cells**, not as standalone card types. The mental model is stated: "a display card only exists inside a `CardGrid`."
2. **Composition rigidity fix** — remove the hardcodes that make the cell a poor citizen: the fixed `<h3>` title gains a heading-level hook (or accepts composed `children`), and the surface gains the tint/`variant` hook it currently lacks. (Tracks the existing display-preset-constraints finding.)
3. **Storybook hygiene** — `DisplayBorderless` / `DisplayElevated` fold into variant Controls on a single `Display` story; `DisplayRow` stays as the one layout-sibling story. This stops the sidebar from presenting surface variants as distinct card types (same treatment applied to `control` in the preceding stories cleanup).
4. **Guardrail** — the § 1 rule is added to the component-build standard so the next "just add a preset" reflex is checked against it.

No consumer-facing API change. `preset="display"` / `display-row` keep working unchanged.

## Consequences

**Positive**

- The preset boundary is now a written rule, not tribal knowledge — the next content-typed "preset" gets caught at review.
- Zero consumer churn; the marketing site and product apps are untouched.
- The display cell becomes more composable (heading-level + tint hooks), closing a real flexibility gap.
- Storybook stops mis-signaling `display` variants as standalone card types.

**Negative / accepted**

- `display` / `display-row` remain *nominally* Card presets while being *conceptually* Blocks — the taxonomy purity gap is documented rather than removed. Accepted: the `CardGrid` pairing already carries the Section-layer meaning, and the cost of full extraction is disproportionate.
- If the marketing site later churns these components heavily for other reasons, revisit extraction opportunistically (the re-export-bridge playbook from the `Collapsible` / `Testimonial` renames applies).

## Considered alternatives

**A. Extract `display` / `display-row` into a dedicated grid-cell Block** (e.g. `DisplayCard`, owned alongside `CardGrid`), with a `Card preset="display"` → new-component re-export bridge and a phased rewrite of web/brikdesigns's ~15 sites over a deprecation window.
*Rejected:* purest taxonomy, but the cost lands entirely on one repo for a gain the `CardGrid` boundary already mostly provides. Held in reserve if marketing-site churn makes it cheap to fold in.

**B. Do nothing.** *Rejected:* leaves the boundary rule unwritten (the root cause) and the `<h3>`/tint rigidity unfixed.

**C. Reverse ADR-004 and re-split `control` / `summary` into components too.** *Rejected:* those *are* generic card-shaped layouts — ADR-004 was right for them. This ADR narrows ADR-004, it does not reverse it.

## Relationship to ADR-004

ADR-004 remains in force: **prefer a preset over a new component for generic, same-surface layout variants.** ADR-018 adds the far boundary: **a preset that becomes content-typed or parent-arranged has left "generic same-surface" and belongs to the Block / Section / Component layer.** Together they bracket the legitimate range of a `preset`.
