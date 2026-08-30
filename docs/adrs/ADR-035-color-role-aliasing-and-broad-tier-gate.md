# ADR-035 — Color role-aliasing is the one sanctioned Semantic→Semantic reference; the tier gate broadens to enforce it

**Status:** Proposed
**Date:** 2026-08-30
**Supersedes:** —
**Superseded by:** —
**Owner:** Nick Stanerson
**Related:** [#2187](https://github.com/brikdesigns/brik-bds/issues/2187) (this ADR's issue — the broad tier-direction gate), [#2186](https://github.com/brikdesigns/brik-bds/issues/2186) (the pre-existing t3→t3 refs this rule resolves), [ADR-025](./ADR-025-page-grid-standard.md) (`--page-inset`, the `--gutter-page` bug that motivated the narrow gate), [token-anatomy.mdx](../../docs-site/content/docs/primitives/token-anatomy.mdx) (the Tier canon this amends), `scripts/lint-token-tiers.mjs` (the gate)

## Context

The narrow `lint-token-tiers` gate (ADR-025) flags a Semantic-**named** token referencing another Semantic (t3→t3). It has a KNOWN LIMITATION: a Primitive-**named** token pointing UP at a Semantic (t2→t3) is not flagged — which is exactly how `--gutter-page: var(--padding-lg)` shipped, since `--gutter-page` matches no Semantic prefix.

Broadening to the literal full rule — "only a Component `--bds-*` may reference a Semantic" — surfaces ~50 references, because BDS has an established, **theme-correct role-aliasing convention** the literal rule over-bans:

- `--border-focus: var(--border-brand-primary)` — the focus ring IS the brand border.
- `--tooltip-text: var(--text-inverse)` — tooltip text IS the inverse text color.
- `--text-link: var(--text-text-link)` — the link color role.

Each of these aliases a Semantic that is **redefined per theme**. `--border-brand-primary` is `--color-poppy-500` under `theme-brand-brik`, `--color-poppy-light` under dark. Because `--border-focus` aliases it, the focus ring theme-tracks from **one line**. Banning the alias would force `--border-focus` to be re-declared in every theme block (4+ today, +1 per future client-sim brand) and would structurally decouple "focus = brand" — a regression, not a purity win.

But `--gutter-page: var(--padding-lg)` — a page inset borrowing padding's density ladder — **is** the anti-pattern the gate exists to catch. The t3→t3 shape alone does not distinguish the two.

## Decision

**A Semantic may alias another Semantic if and only if the target resolves — transitively, through the reference graph — to a `--color-*` Primitive.** Color is the theme-varying axis: a color role legitimately *is* another color role, and aliasing it is how per-theme tracking works. Every non-color Semantic (spacing, size, type-scale, radius, width) carries a **mode or scale ladder** that must resolve to a Primitive directly and must never be parasitized by an alias.

This is the principled version of "same category": it keeps the theme-tracking color aliases (the feature) and bans the scale-borrowing aliases (the bug), and it is self-maintaining — "resolves to color" is computed from the actual graph, not a hand-kept prefix list.

Applied to the live registry, exactly the right things happen:

| Reference | Resolves to | Verdict |
|---|---|---|
| `--border-focus: var(--border-brand-primary)` | `--color-poppy-*` | **allowed** (color role-alias) |
| `--tooltip-text: var(--text-inverse)` | `--color-*` | **allowed** |
| `--text-link: var(--text-text-link)` | `--color-poppy-light` | **allowed** (clears a #2186 marker) |
| `--display-fluid-{sm,md,lg,xl}: … var(--display-*)` | `--font-size-*` | **flagged** → retier the clamp max bound to the `--font-size-*` Primitive (clears 4 #2186 markers) |
| `--gutter-page: var(--padding-lg)` | `--space-*` | **flagged** (already removed, ADR-025 step 3) |

### The gate

`scripts/lint-token-tiers.mjs` now flags **any** non-Component token (t2 or t3) that references a Semantic whose value does not resolve to `--color-*`. Tier is classified by name prefix; "resolves to color" walks the reference graph with a cycle guard. The narrow-gate KNOWN LIMITATION is closed.

### bridge.css

`tokens/bridge.css` (the Webflow double-dash → SD-name compat aliases) is an **alias layer by definition** and never concatenates into `dist/tokens.css` — the tier rule does not apply to it. It is **relocated to `tokens/compat/bridge.css`**, held out of the non-recursive `tokens/*.css` scan structurally rather than via an in-code carve-out. Its published output path (`dist/bridge.css`) and its self-reference-gate coverage (#1919) are preserved.

## Consequences

- token-anatomy's Tier rule gains the color role-alias exception.
- #2186 is resolved: its color refs are now sanctioned, its 4 `--display-fluid` refs retiered to Primitives. #2186 closes as folded-in.
- New non-color Semantic aliases are caught at source, including the Primitive-named t2→t3 shape the original `--gutter-page` bug slipped through.
- A deliberate, temporary exception still takes a reasoned `bds-lint-ignore — <why>`.
