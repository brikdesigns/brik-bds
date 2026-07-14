# ADR-019 — Responsive primitives collapse on their own width, not the viewport

**Status:** Accepted (2026-07-14)
**Date:** 2026-07-14
**Supersedes:** —
**Superseded by:** —
**Owner:** Nick Stanerson
**Related:** #641 (FilterBar responsive collapse — first application), ADR-010 (Storybook axes — the viewport toolbar global these stories exercise), ADR-004 (component-bloat guardrails — this is a behavior on an existing component, not a new one)

## Context

`FilterBar` (and future list/table-header primitives) render a horizontal row of controls. At narrow widths the controls wrap awkwardly or overflow. #641 asked for a responsive collapse into a "Filters" popover.

The obvious lever is a **viewport media query** (`@media (max-width: 768px)`). But BDS primitives are placed in wildly different containers — full-bleed page bodies, cards, sidebars, table toolbars. A viewport query collapses a bar that is 400px wide inside a 1440px viewport *only when the whole window shrinks*, which is wrong: the bar should collapse based on the space **it** has, regardless of window size.

Two mechanisms respond to a component's own width:

1. **CSS container queries** (`container-type: inline-size` + `@container`). Elegant and JS-free, but they can only toggle *visibility/layout* of elements already in the DOM. Collapsing filter controls into a popover means the controls must live in a different DOM location (the popover panel) when collapsed. A pure container-query approach forces rendering the controls **twice** — once inline, once in the panel — toggled by `display`. For BDS's **controlled, interactive** filter controls (`FilterButton`/`FilterToggle`), that means duplicate interactive elements, duplicate a11y labels, and two focus targets for one logical control.

2. **`ResizeObserver` measuring the element's own inline width**, driving a conditional render. The controls exist in exactly one place at a time. Single instance, clean a11y.

BDS uses zero container queries today, so either path is a first-of-kind pattern worth recording.

## Decision

**Responsive BDS primitives collapse on their own width, measured with `ResizeObserver`, not on the viewport.** The shared hook `components/ui/shared/useElementWidth.ts` is the canonical mechanism:

- It returns `[ref, width]`; `width` is `null` until the first observation (SSR-safe and available-guarded), so components render their **expanded/default** layout on first paint and collapse only once a real measurement lands — no hydration mismatch, no collapse flash toward the wrong state.
- Collapse thresholds are **own-width px constants co-located with the component** (e.g. `FilterBar`'s `COLLAPSE_BELOW_PX = 600`), commented with their rationale — not viewport breakpoints. They are the width at which *that component's* content stops fitting, which is a component concern, not a global one.
- When the collapsed and expanded layouts place children in different DOM locations (inline row vs. popover panel), the children are authored **once** as a fragment and rendered into exactly one branch — never duplicated across both and toggled by CSS.

**Why not CSS container queries:** the duplicate-interactive-control problem above. Container queries remain the right tool for *pure visibility/layout* responses where no element moves in the tree; this ADR does not forbid them for that case. It only settles that **own-width, not viewport, is the axis**, and that **ResizeObserver + single-instance conditional render is the pattern when elements relocate on collapse.**

## Consequences

- **Correct in any container.** A `FilterBar` collapses the same in a 420px sidebar as in a shrunk window — behavior tracks the box it is given.
- **One reusable hook.** `useElementWidth` is internal (not part of the public package surface; exported only from the `shared` barrel) and reused by every future own-width-responsive primitive. No per-component ResizeObserver boilerplate.
- **A small JS cost.** One observer per responsive instance. Acceptable for the a11y and single-instance correctness it buys.
- **First paint is the expanded layout.** Components that are *always* narrow briefly show the expanded layout before the first measurement collapses them. Mitigated by the observer firing on mount; if a future component needs zero-flash it can accept an initial `collapsed` hint prop, but the default is expanded-then-measure.

## First application

`FilterBar` (#641): below 600px of its own width the title + counter stay inline and the filter controls (+ clear) move into a `Filters (N)` popover. `activeFilterCount` surfaces the active count on the collapsed trigger. Verified in Storybook via a width-constrained `Collapsed` story.
