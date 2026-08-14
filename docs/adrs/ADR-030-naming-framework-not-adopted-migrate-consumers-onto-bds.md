# ADR-030 — The Brik Naming Framework is not adopted into BDS; consumers migrate onto BDS canon instead

**Status:** Accepted (2026-08-14)
**Date:** 2026-08-14
**Supersedes:** the archived `naming-framework.md` (Brik Designs Naming Framework v2.0, Nov 2025) — retired as a source of structural naming; BDS canon (below) is the single source of truth.
**Superseded by:** —
**Owner:** Nick Stanerson
**Related:** [#1818](https://github.com/brikdesigns/brik-bds/issues/1818) (this umbrella), [ADR-008](./ADR-008-naming-canon-closed-allowlist.md) (naming canon), [ADR-017](./ADR-017-slot-pattern-gate-supersedes-closed-allowlist.md) (slot pattern gate), [ADR-023](./ADR-023-content-blocks-and-prose-rhythm.md) / [ADR-024](./ADR-024-layout-rhythm-map.md) / [ADR-025](./ADR-025-page-grid-standard.md) (rhythm + page grid), [composition-layers.mdx](../../docs-site/content/docs/build-standards/composition-layers.mdx) (5-layer model), #545 (cross-repo BDS adoption), #565 (composition + scoped-token program), #1583 (Content blocks)

## Context

Brik is moving off Webflow. The marketing site (brikdesigns.com) still carries a partially-adopted Webflow class taxonomy: an audit found **101 `Webflow:` provenance markers and ~60 distinct ported classes** with no consistent layer applied site-wide. Umbrella #1818 proposed adopting the **Brik Designs Naming Framework v2.0** — a 6-layer Client-First-style taxonomy documented in the Webflow era (archived at `archive/brikdesigns-legacy/_reference/webflow-export/markdown/naming/naming-framework.md`) — as the canonical BDS structural naming system, on the premise that a documented framework already exists and maps onto BDS page-anatomy.

The reconciliation required by #1818's AC #2 (framework layers vs. BDS anatomy + the Blocks-layer work in #1583) found the opposite of an adoptable fit. The framework is a **hand-authored CSS-class system**; BDS is a **React primitive + BEM-slot component system**, and the two disagree on every structural axis BDS has already ruled on and now enforces in CI.

### The framework conflicts head-on with accepted, CI-enforced BDS canon

| Framework signature | BDS canon | Enforcement |
|---|---|---|
| No namespace (`section_hero`, `container_hero`) | ADR-008 §1 — every class carries the `bds-` prefix | `slot-pattern-check.mjs` (only judges `bds-*`) |
| Single underscore separator (`container_what-to-expect`, `text_display-sm`, `layout-item_hero-content`) | ADR-008 §4 / ADR-017 — kebab-case with `__`/`--` only; **single `_` is a violation** | `scripts/slot-pattern-check.mjs` (pre-commit + CI) |
| Appearance/theme utility classes (`inverse`, `muted`, `brand`, `center`, `comfortable`, `tight`) | ADR-008 §3 — appearance/theme modifiers are **banned**; structural-only | `scripts/lint-blueprint-naming.mjs` |
| Layout position baked into the name (`layout-item_hero-content`, `container_what-to-expect`) | ADR-008 §3 — slot classes drop the layout segment; names must not describe layout or theme | ADR-008 §3, `lint-blueprint-naming.mjs` |
| `content-wrapper` + `comfortable`/`tight`/`stacked` ad-hoc spacing | ADR-023 (`ContentBlock`/`Prose` + locked `--gap-*` scale), ADR-024 (component rhythm map), ADR-025 (`--gutter-page`) | `scripts/lint-content-rhythm.mjs`, `scripts/lint-page-grid.mjs` |

The single-underscore conflict is not theoretical. Probed against the live gate on 2026-08-14, a namespaced framework class fails immediately:

```
$ node scripts/slot-pattern-check.mjs <probe with className="bds-hero_split">
{ "violations": [ { "class": "bds-hero_split",
    "reason": "single underscore (use `__` for slots)" } ] }
```

Un-namespaced (`section_hero`) the framework classes fall outside the `bds-` gate entirely — which is itself the ADR-008 §1 violation: they are not part of the design system's single namespace.

### The framework's layer intent is already implemented — as primitives, not classes

The framework's 6 layers (Section / Container / Layout / Layout-item / Wrapper / Content) restate the BDS 5-layer composition model ([composition-layers.mdx](../../docs-site/content/docs/build-standards/composition-layers.mdx): Section → Layout → Container → Block → Component). BDS already ships that model as **React primitives** — `Page`, `Grid`, `Stack`, `Cluster`, `ContentBlock`, `Prose` — with the vertical rhythm, page gutter, and content grouping the framework expressed through `content-wrapper` + utility modifiers instead governed by ADR-023/024/025 and their lint gates. Adopting the framework would introduce a **second, parallel way to express the same structure** — the exact parallel-taxonomy failure mode that caused the token rollbacks (#512/#553) and that ADR-023 §1 explicitly refused for text atoms.

## Decision

**The Brik Naming Framework v2.0 is rejected as canonical BDS structural naming.** BDS structural naming remains governed by ADR-008 §1/§3/§4 (single `bds-` namespace, structural-only modifiers, BEM `__`/`--` grammar) as enforced by ADR-017's pattern gate, and BDS composition remains governed by the 5-layer model + ADR-023/024/025. No part of the framework's class vocabulary, underscore grammar, or utility-modifier system enters BDS.

1. **The archived `naming-framework.md` is retired as a source of structural naming.** It is superseded by existing BDS canon — [composition-layers.mdx](../../docs-site/content/docs/build-standards/composition-layers.mdx), [page-structure.mdx](../../docs-site/content/docs/build-standards/page-structure.mdx), the naming-conventions doc, and ADR-008/017/023/024/025. The archived file stays in the archive as Webflow-era history; it is not migrated into a live repo and is not the single source of truth for anything going forward. This satisfies #1818's AC #3 by pointing to the canon that already exists rather than publishing a new parallel reference.

2. **The real defect is redirected, not the naming system.** The legitimate problem behind #1818 — brikdesigns.com's Webflow class residue — is resolved by migrating that consumer **off** the Webflow taxonomy and **onto** BDS primitives + the `bds-` grammar, not by pulling the Webflow taxonomy into BDS. This inverts the umbrella's original "adopt into BDS" framing to "migrate consumers onto existing BDS canon," consistent with the cross-repo adoption program (#545).

3. **Consumer-migration guidance (AC #4) is the brikdesigns.com residue migration itself.** The guidance is not a new document restating BDS canon; it is the worked migration of the first consumer, using the layer-mapping table below to move each ported Webflow class to its BDS equivalent. Sub-issues are filed per work package on #1818 (AC #5).

### Layer mapping used for consumer migration (framework → BDS)

| Framework class | BDS equivalent |
|---|---|
| `section_[name]` (`<section>`) | Blueprint section shell (ADR-021) / `bds-<block>` section |
| `container_[name]` | `Page` / width-container recipe (ADR-025, `--gutter-page`) |
| `layout-[type]` / `layout_[name]` | `Grid` / `Stack` / `Cluster` primitives |
| `layout-item_[name]` | grid/flex child of the primitive — no bespoke class |
| `[type]-wrapper` (`content-wrapper`) | `ContentBlock` / `Prose` (ADR-023) |
| `text_[style]-[size]` + `inverse`/`muted`/`brand` | typography tokens + BDS component slots; no appearance utilities |

## Consequences

- **#1818 is retitled** from "Adopt the Brik Naming Framework into BDS" to reflect the reject-and-migrate outcome; its scope becomes the brikdesigns.com Webflow-residue migration onto BDS canon.
- **No new lint, token, or component ships from this ADR** — the enforcing gates (`slot-pattern-check`, `lint-blueprint-naming`, `lint-content-rhythm`, `lint-page-grid`) already cover the canon this ADR affirms. This is a decision record, not an implementation.
- **The migration is a Project, phased by consumer surface** (nav, footer, hero family, marketing sections, CMS content). Each phase is a sub-issue filed before execution; brikdesigns.com is the first and only consumer in scope for #1818.
- **Follow-up risk flagged, not fixed:** any other consumer that hand-rolled Webflow-style classes (audited only on brikdesigns.com so far) inherits the same migration; file against #545 if a second consumer surfaces.
- If a genuinely BDS-shaped gap appears during migration (a layer with no primitive to move onto), the fix is a **token/primitive request to BDS**, not a revival of the framework's class for that slot.
