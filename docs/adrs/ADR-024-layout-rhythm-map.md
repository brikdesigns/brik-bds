# ADR-024 — Layout rhythm map (component-level vertical spacing)

## Status

Accepted — map locked; primitive-default realignment deferred (see Consequences). Tracked by #1625 / #1627.

## Context

ADR-023 locked the rhythm map for **content** relationships (title→subtitle `--gap-sm`, heading→body `--gap-md`, p→p `--gap-lg`, block→block `--gap-xl`) and shipped `ContentBlock`/`Prose` plus the `lint-content-rhythm` gate. The layer above has no equivalent: vertical spacing **between components** — rows in a menu, fields in a form, cards in a grid — is chosen per-component, and the divergence is measurable:

- The layout primitives all default differently for no stated reason: `Grid`=`lg` (`Grid.tsx:63`), `Stack`=`md` (`Stack.tsx:62`), `Cluster`=`sm` (`Cluster.tsx:47`), `FieldGrid`=`xl` (`FieldGrid.tsx:29`), `CardList`=`md` (`CardList.tsx:26`).
- The same field↔field relationship is `--gap-lg` via `Form`'s default but `--gap-xl` via `FieldGrid`'s.
- Six vertical declarations used `--gap-xs`/`--gap-tiny` (Menu header, FilterButton "All" separator, Meter label above/below, BulletList compact/comfortable densities) — both tokens resolve to **0px in every non-default spacing mode** (`tokens/modes-spacing.css`), so those components collapse in compact/comfortable/spacious. The P1 sweep (#1626) removed the same class of bug from text slots; these are its component-level siblings.

## Decision

1. **Component-relationship map — same discipline as ADR-023 §3, one layer up.** Mode-tied `--gap-*` only, monotonic in every spacing mode:

   | Relationship | Token | default px |
   |---|---|---|
   | label ↔ control it names (meter label→bar, stacked field label→value) | `--gap-sm` | 6 |
   | row ↔ row in a dense repeated container (menu options, list items, bullet items) | `--gap-sm` (a comfortable-density variant steps to `--gap-md`) | 6 |
   | control ↔ control in a cluster (footer actions, filter chips row) | `--gap-md` | 8 |
   | field ↔ field in a form | `--gap-lg` | 16 |
   | card ↔ card in a grid or list | `--gap-lg` | 16 |
   | container ↔ container / block ↔ block (unchanged, ADR-023) | `--gap-xl` | 24 |

2. **`--gap-xs` / `--gap-tiny` are banned from unambiguously vertical properties** (`row-gap`, `margin`, `margin-top/-bottom/-block*`) across all of `components/ui` — extending ADR-023's text-slot exclusion to every vertical rhythm position. Enforced in `scripts/lint-content-rhythm.mjs` (same gate, second rule; reasoned `bds-lint-ignore` remains the escape hatch). The `gap` shorthand is exempt from the *scanner* — its axis depends on flex-direction, and horizontal icon↔label gaps legitimately use `--gap-xs` — but vertical flex columns are still bound by this rule at review time.

3. **Layout primitives keep generic per-primitive defaults; the map governs what builders pass.** `Stack`/`Grid`/`Cluster` cannot know which relationship they're laying out, so the map is expressed as "which `gap` value to choose", documented in build-standards. Defaults that already match their dominant relationship stay (`Grid`=`lg` = card↔card).

4. **Two default divergences were flagged, not changed here:** `FieldGrid` default `xl` (vs field↔field `--gap-lg`) and `CardList` default `md` (vs card↔card `--gap-lg`). Both are consumer-visible visual changes that needed a visual diff to gate. **Resolved in #1630** — both now default `lg`, gated by the self-hosted visual regression suite (ADR-026) that replaced the quota-exhausted Chromatic gate.

## Consequences

- Six vertical declarations fixed in this change (Menu, FilterButton, Meter ×2, BulletList ×2); BulletList's density ladder shifts one step (compact `--gap-sm`, comfortable `--gap-md`) to stay distinct and mode-safe.
- Primitive-default realignment (FieldGrid `xl`→`lg`, CardList `md`→`lg`) shipped in #1630, gated by the self-hosted visual regression suite (ADR-026).
- The page-grid standard (#1628) builds on this map: gutters are the horizontal siblings of these vertical relationships.
- Horizontal rhythm (icon↔label, chip clusters) remains ungoverned by this ADR — file against #1625 if drift appears there.
