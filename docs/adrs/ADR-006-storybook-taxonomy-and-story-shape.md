# ADR-006 — Storybook Taxonomy + Story Shape

**Status:** Accepted (2026-04-26)
**Date:** 2026-04-26
**Supersedes:** —
**Superseded by:** —
**Related:** [ADR-004](./ADR-004-component-bloat-guardrails.md) (component bloat guardrails); [ADR-007](./ADR-007-storybook-page-recipe.md) (component page recipe — the page-formatting peer to this story-shape ADR)
**Owner:** Nick Stanerson

## Context

Two parallel cleanups landed on the same set of files at the same time:

1. **Taxonomy migration (Phase 1, merged):** PRs [#257](https://github.com/brikdesigns/brik-bds/pull/257), [#258](https://github.com/brikdesigns/brik-bds/pull/258), [#259](https://github.com/brikdesigns/brik-bds/pull/259) moved Form / Field / FieldGrid / Addable* under `Components/Form/*` and `Components/Addables/*`. The current Storybook sidebar mixes three top-level buckets — `Components/` (most primitives), `Displays/` (Card, Sheet, Modal, Table, Calendar, Accordion, Timeline, etc.), `Foundations/` (Avatar, Icons), plus `Theming/` and `Overview/` from the `stories/` dir.
2. **Story-shape audit (this ADR):** A 2026-04-26 review of `Banner.stories.tsx` and `EmptyState.stories.tsx` surfaced a copy-pasted file shape that defeats Storybook's primitives:

   ```
   Playground       — args + controls
   Variants         — render() stacking 3-5 examples
   Tones            — render() stacking the tone axis
   Patterns         — render() stacking "use case" scenarios
   ```

   The `Variants` / `Tones` / `Patterns` buckets overlap by construction (a tone *is* a variant; a pattern *uses* variants), and the stacked-render approach forfeits per-story Chromatic snapshots, MCP discovery, working Controls, A11y addon coverage, and permalinks.

Both cleanups touch the same `*.stories.tsx` files. Doing them as separate passes means every file gets edited twice. This ADR merges them so the audit-pass touches each file once.

## Decision

Two parallel rules. Story files must satisfy both at merge time.

### Part A — Taxonomy: where stories live in the sidebar

The Storybook sidebar collapses to **four content top-levels** (`Foundations`, `Components`, `Patterns`, `Theming`) plus `Overview` (kept separate) and `Deprecated` (sorts last). `Components/` uses a single, alphabetical subcategory layer:

| `Components/` subcategory | Members |
| --- | --- |
| **Action** | button, button-group, filter-bar, filter-button, filter-toggle, text-link |
| **Addables** | addable-combo-list, addable-entry-list, addable-field-row-list, addable-text-list |
| **Card** | card, card-control, card-list, card-testimonial, collapsible-card, pricing-card |
| **Container** | accordion, board, calendar, data-section, sheet, sheet-section, table |
| **Control** | file-uploader, pagination, segmented-control, slider, stepper, switch |
| **Feedback** | banner, empty-state, progress-bar, task-console, toast, tooltip |
| **Form** | address-input, catalog-picker, checkbox, date-picker, field, field-grid, form, multi-select, password-input, radio, select, text-area, text-input, time-picker |
| **Indicator** | badge, badge-group, chip, counter, dot, meter, service-tag, skeleton, spinner, tag, tag-group |
| **List** | activity-timeline, bullet-list, notification-list |
| **Navigation** | breadcrumb, footer, menu, nav-bar, page-header, progress-stepper, sidebar-navigation, tab-bar |
| **Overlay** | modal, popover |
| **Structure** | divider |

**Other top-levels:**

- **`Foundations/`** — design tokens, color, typography, icons, avatars (`Foundations/Assets/*`).
- **`Patterns/`** — composite recipes that use multiple components together. Forward-looking; populated as recipes are documented. Sub-bucket `Patterns/Pages/*` reserved for full-page `ship-*` blueprints.
- **`Theming/`** — theme switcher, atmosphere layers, navigation archetypes.
- **`Overview/`** — design-system metadata: Welcome, Health Dashboard, Token Coverage, Contrast Compliance. Kept separate (not folded into Foundations).
- **`Deprecated/`** — components or component-states retained only for migration reference. Sorted last via `storySort` config. Tagged `['!manifest']` so MCP discovery skips them.

**Removed from the sidebar:**

- **`Displays/`** — dropped. Card, Sheet, Modal, Popover, Table, Calendar, Accordion, Board, Timeline, Charts (Meter), Notifications, Data — all relocated to subcategories under `Components/`. The `Displays`/`Components` split implied a behavioral category that didn't exist.
- **`Components/Input/`** — folded into `Components/Form/`. The two-component bucket (AddressInput, PasswordInput) didn't justify its own subcategory.
- **`Navigation/Primary`, `Navigation/Secondary`, `Navigation/Stepper`, `Navigation/Menu`** — collapsed into a flat `Components/Navigation/*`. The sub-buckets weren't load-bearing.
- **`ship-*` blueprints** — when introduced, they go under `Patterns/Pages/<name>`, not `Components/`.

**SheetTypography exception:** stays at `Displays/Sheet/sheet-typography` until [ADR-004](./ADR-004-component-bloat-guardrails.md) §1 lands the Field-tier consolidation. That work touches portal sheets, not just BDS, so this audit deliberately skipped it.

### Part B — Story shape: what's inside the file

Every BDS component story file ships exactly two kinds of stories:

1. **`Playground`** — args-driven sandbox. Controls work. One canonical instance.
2. **One story per meaningful state** — args-driven. Named by the state.

"Meaningful state" — pick what changes behavior or appearance enough to matter:

- A value on a primary axis: `Information`, `Warning`, `Error`, `Announcement` (tone)
- A behavior toggle: `Dismissible`, `WithAction`, `TitleOnly`
- A composition: `WithIcon`, `WithCustomContent`

Story names use the state directly (`Warning`, not `Variants > Warning`). The Storybook sidebar + autodocs page **is** the gallery. We don't build a second gallery inside `render`.

### What not to ship

1. **No `Variants` / `Tones` / `Patterns` gallery buckets inside a component file.** They duplicate the sidebar, break Controls, and merge axes that should split. (Note: `Patterns/` as a *top-level sidebar bucket* per Part A is different — that's for composite recipes across components, not a per-component gallery.)
2. **No `render`-mode stories that stack multiple instances** behind `<SectionLabel>` rows for documentation purposes.
3. **No "and" in story names** (already in the writing guide; restated). `SizesAndVariants` splits.

### When a stacked-gallery story IS allowed (the exception)

Comparison-only galleries earn a single dedicated story when **and only when** all three apply:

1. **Side-by-side comparison is the entire point** (e.g., `Sizes` showing `xs/sm/md/lg/xl` of one component in one column).
2. **The autodocs page can't make the same comparison clear** — sidebar order isn't enough.
3. **It's one axis, not a mix** — a `Sizes` gallery is fine; a `Variants` gallery that combines size, tone, and content shape is not.

Story is named after the axis (`Sizes`, `Densities`) — never `Variants` / `Patterns` / `Examples`.

### `render` is for irreducible cases

Per the existing writing guide, `render` is reserved for cases args can't express:

- Multi-component composition with no natural single-component equivalent
- Hook usage required by the demo (a controlled toggle pattern that's the only way to demonstrate the interaction)

`render` used purely to lay out a documentation gallery is not an irreducible case.

## Migration

**Forward-only.** This ADR codifies the decisions; the file-level refactor of existing stories is **shelved**, not landed.

### Why shelved (and not retroactively applied)

A 142-file refactor sweep was prepared in 2026-04-26 (batches 0–11 covering deprecated cleanup, Feedback, Indicator, Action, Control, Form, Container, Card, Navigation, Overlay). It typechecked clean and was preserved on branch `task/storybook-shape-migration-wip` (commit `8daccd0`).

Between then and merge, [ADR-007](./ADR-007-storybook-page-recipe.md) shipped its Phase 3 page-recipe migration on `main` ([#433](https://github.com/brikdesigns/brik-bds/pull/433)–[#444](https://github.com/brikdesigns/brik-bds/pull/444)) — Carbon-style triple-link header, normative section order, H3 demotion, ComponentLinks block on every component MDX. ADR-007's work overlaps **137 of the 142 files** this branch touched. A merge or rebase would either re-introduce `Variants`/`Patterns` galleries (undoing ADR-007) or strip the page recipe (also undoing ADR-007).

Decision: ADR-007 wins on file content because it's already merged and lint-enforced. ADR-006's decisions stand as the rulebook; the existing-stories sweep is abandoned. The shelved branch stays as a reference if Phase 4 ever wants to revisit specific story bodies.

### Forward rule

**New component story files** — written after this ADR is accepted — use the new taxonomy + two-shape model from day one:

- Title goes under `Components/<subcategory>/*` per the table in Part A.
- File contains `Playground` (args + controls) plus one args-driven story per meaningful state.
- No `Variants` / `Tones` / `Patterns` gallery buckets.
- Deprecated components move to `Deprecated/<subcategory>/*` with `tags: ['!manifest']`.
- Axis-only galleries (`Sizes`, `Placements`) only when the narrow exception applies.

### Existing files

Pre-existing `*.stories.tsx` files keep whatever shape ADR-007's page-recipe pass left them in. **Do not retroactively rewrite** them to match this ADR — the conflict is documented above. If a specific component file is being touched anyway (a real refactor, prop addition, etc.), opportunistically migrate it to the two-shape model in the same PR.

### Out of scope (still applies)

- **SheetTypography (4 components) + `SheetSection.heading` vs `SheetSectionTitle`** — stays at `Displays/Sheet/*` until [ADR-004](./ADR-004-component-bloat-guardrails.md) §1 lands the Field-tier consolidation. That work touches portal sheets, not just BDS.
- **`Patterns/` top-level population** — empty for now. Will be seeded as recipes are documented.
- **`Avatar` story-shape refactor** — Foundations/Assets is its own taxonomy concern; revisit if/when Foundations gets its own pass.

## Rationale

- **One pass per file.** Taxonomy and story-shape touch the same lines (title strings + `export const` blocks). Doing them together avoids two rounds of merge churn.
- **Storybook is the gallery.** The sidebar, the autodocs page, and per-story permalinks are the gallery surface. A second gallery built inside `render` duplicates the surface Storybook already provides.
- **Each Storybook capability (Chromatic, MCP, Controls, A11y, deep-links) is per-story.** A story bundling N states forfeits N-1 capabilities for each one.
- **The `Variants`/`Tones`/`Patterns` buckets aren't crisp.** Across the audit, they consistently overlap and consistently mix axes. Sign the categories aren't real, not that they need refinement.
- **`Displays/` doesn't carry weight.** Card, Sheet, Modal, Table — they're all components with content slots. The Displays/Components split was inherited, not designed.
- **Simplicity scales.** Two story shapes + four sidebar buckets is a rule a contributor applies without consulting docs.
- **Complements [ADR-004](./ADR-004-component-bloat-guardrails.md).** ADR-004: don't add a new component when a prop will do. This ADR: don't add a new story bucket when args will do. Same shape of decision at a different layer.

## Alternatives considered

- **Keep the three intra-file buckets, write better separation rules.** Rejected — buckets overlap by construction. No rule keeps them disjoint without lawyering.
- **Keep `Displays/` as a top-level.** Rejected — the split implied a behavioral category that isn't real, and the contents are heterogeneous (Modal is interactive, Calendar is data, Card is layout).
- **Split the two cleanups into separate ADRs and PRs.** Rejected — they touch the same files. Doing them together is one audit pass instead of two.
- **Soft guidance only.** Rejected — the writing guide already says "single concept per story" and "args over render." Soft guidance hasn't held.

## Consequences

### Positive

- Chromatic catches per-state regressions instead of masking them in stacks
- MCP discovery returns the actual states agents need to recommend in portal/renew-pms
- Controls work on every story, not just `Playground`
- Each state has a permalink and an a11y check
- Sidebar collapses from 3-5 inconsistent top-levels to 4 disciplined ones
- Story files get shorter (`<Stack>` / `<SectionLabel>` helpers and `render` blocks drop out)
- New contributor's mental model is "two shapes, four buckets" — not three overlapping intra-file categories and an undocumented sidebar

### Negative

- One-time migration cost across `components/ui/`. Mitigated by single-pass audit.
- Loses the at-a-glance "all variants in one screen" view inside a single story. Mitigated by autodocs page (renders all stories together) and the rare `Sizes`-style axis gallery.

### Neutral

- Story file count goes up; line count per file goes down. Net repo size roughly flat.
- Some sidebar deep-links in external docs / Notion will break when titles move. Acceptable; tracked separately if it becomes friction.

## Enforcement

- ADR linked from [`docs/STORYBOOK-WRITING-GUIDE.md`](../STORYBOOK-WRITING-GUIDE.md) "Story shape + sidebar taxonomy" section.
- BDS `CLAUDE.md` "Storybook" section carries a one-line pointer to this ADR.
- New component story files reviewed against the two-shape model in PR review.
- **Lint enforcement is page-recipe-scoped today** ([`scripts/lint-storybook-recipe.js`](../../scripts/lint-storybook-recipe.js), gated on pre-commit + CI per ADR-007). A complementary lint for the story-shape rule (no `Variants`/`Tones`/`Patterns` gallery exports) is a candidate follow-up but is **not** wired up by this ADR.
- Existing files are not retroactively swept. See Migration above for why.
