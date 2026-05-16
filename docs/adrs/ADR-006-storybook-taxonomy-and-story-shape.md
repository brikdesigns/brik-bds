# ADR-006 — Storybook Taxonomy + Story Shape

**Status:** Accepted (2026-04-26); Part A amended 2026-05-16 (6-bucket flat taxonomy — see Amendments)
**Date:** 2026-04-26
**Supersedes:** —
**Superseded by:** —
**Related:** [ADR-004](./ADR-004-component-bloat-guardrails.md) (component bloat guardrails); [ADR-007](./ADR-007-storybook-page-recipe.md) (component page recipe — the page-formatting peer to this story-shape ADR)
**Owner:** Nick Stanerson

## Context

Two parallel cleanups landed on the same set of files at the same time:

1. **Taxonomy migration (Phase 1, merged):** PRs [#257](https://github.com/brikdesigns/brik-bds/pull/257), [#258](https://github.com/brikdesigns/brik-bds/pull/258), [#259](https://github.com/brikdesigns/brik-bds/pull/259) moved Form / Field / FieldGrid / Addable* under `Components/Form/*` and `Components/Addables/*`. The current Storybook sidebar mixes three top-level buckets — `Components/` (most primitives), `Displays/` (Card, Sheet, Modal, Table, Calendar, Accordion, Timeline, etc.), `Foundations/` (Avatar, Icons), plus `Theming/` and `Overview/` from the `stories/` dir.
2. **Story-shape audit (this ADR):** A 2026-04-26 review of `Banner.stories.tsx` and `EmptyState.stories.tsx` surfaced a copy-pasted file shape that defeats Storybook's primitives:

   ```text
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

> **Amended 2026-05-16.** The subcategory layer inside `Components/` is abolished and replaced by six flat top-level buckets defined by composition role. See the 2026-05-16 amendment entry and [#629](https://github.com/brikdesigns/brik-bds/issues/629). The `preview.tsx` `storySort.order` is updated in the rename sweep PRs (gated on #618 wrap), not in this amendment.

The Storybook sidebar uses **six flat component top-levels** plus the unchanged structural ones. No subcategory layer inside any bucket.

| Bucket | Role | Members |
| --- | --- | --- |
| **`Components/`** | Single atomic primitive | button, button-group, filter-button, filter-toggle, filter-bar, text-link, address-input, password-input, text-input, text-area, select, multi-select, checkbox, radio, completion-toggle, switch, segmented-control, stepper, file-uploader, pagination, badge, badge-group, chip, tag, tag-group, dot, counter, spinner, progress-bar, progress-circle, avatar, banner, empty-state, toast, tooltip, icons, marketing-illustration, divider, meter, service-tag, skeleton, modal, popover |
| **`Containers/`** | Styled holder composing blocks into a bounded unit (own border/padding/elevation/radius) | card, collapsible-card, pricing-card, card-summary, card-testimonial, card-list, form, accordion, sheet, sheet-section, table, menu, notification-list, data-section, activity-timeline, calendar, task-console, board, addable-combo-list, addable-entry-list, addable-field-row-list, addable-text-list, catalog-picker |
| **`Blocks/`** | Fixed slot shape filled with atoms — used standalone and inside Containers | field, field-grid, date-picker, time-picker, bullet-list, checklist, interactive-list-item |
| **`Layouts/`** | Pure composition primitive — arrangement only, no styling beyond structure | stack, cluster, grid, frame, row, split |
| **`Sections/`** | Full-page composed region | nav-bar, footer, sidebar-navigation, breadcrumb, progress-stepper, page-header, tab-bar |
| **`Tools/`** | Dev/internal utilities | brik-dev-bar, dev-feedback-widget |

**Unchanged top-levels:**

- **`Foundation/`** — design tokens, color, typography, icons, avatars.
- **`Patterns/`** — composite recipes that use multiple components together. Sub-bucket `Patterns/Forms/*` for form compositions; `Patterns/Pages/*` reserved for full-page blueprints.
- **`Theming/`** — theme switcher, atmosphere layers, navigation archetypes.
- **`Overview/`** — design-system metadata: Welcome, Health Dashboard, Token Coverage, Contrast Compliance.
- **`Deprecated/`** — retained only for migration reference. Sorted last. Tagged `['!manifest']` so MCP discovery skips them.

**Eliminated groups (as of the rename sweeps):**

- **`Components/<subcategory>/`** — the subcategory layer (`Action`, `Form`, `Input`, `Control`, etc.) is removed; atoms go directly to `Components/<component>`.
- **`Navigation/`** — `nav-bar`, `footer`, `sidebar-navigation`, `breadcrumb`, `progress-stepper` → `Sections/`.
- **`Displays/`** — bounded holders → `Containers/`; slot-shaped blocks → `Blocks/`; remaining atoms → `Components/`.

### Part B — Story shape: what's inside the file

The story-shape decision lives here at the high level; the operational rules + the story-vs-control matrix are codified separately:

- **Two story shapes per file** — `Playground` (args-driven sandbox) + one story per meaningful state, named directly (`Warning`, not `Variants > Warning`).
- **No `Variants` / `Tones` / `Patterns` gallery buckets** inside a component file. They duplicate the sidebar, break Controls, and merge axes that should split.
- **Narrow exception:** single-axis comparison galleries (`Sizes`, `Densities`, `Placements`) earn one dedicated story when side-by-side comparison is the entire point AND the autodocs page can't make the same comparison clear AND it's one axis, not a mix.
- **`render` is for irreducible cases only** — multi-component composition or hook-driven state machines args can't express. Not for documentation galleries.

**For the full operational rules — including the story-vs-control matrix (Q1–Q5: toolbar global / argTypes-only / dedicated story / irreducible render / play-only), MCP discipline, surface-tag rules, banned-export list, Storybook 9 imports, and the pre-commit checklist — see:**

- **[ADR-010 — Storybook axes of information](./ADR-010-storybook-axes-of-information.md)** — the story-vs-control matrix
- **[`.claude/standards/storybook-story-shape.md`](../../.claude/standards/storybook-story-shape.md)** — the canonical ruleset (retrieved via brik-rag at edit time by the `storybook-story-shape` skill)

The decisions above govern; the standard is the operational expression. When the standard and this Part B disagree, the standard is the live truth — open a PR amending this ADR (or ADR-010) when a *decision* changes.

## Migration

**Forward-only.** This ADR codifies the decisions; the file-level refactor of existing stories is **shelved**, not landed.

### Why shelved (and not retroactively applied)

A 142-file refactor sweep was prepared in 2026-04-26 (batches 0–11 covering deprecated cleanup, Feedback, Indicator, Action, Control, Form, Container, Card, Navigation, Overlay). It typechecked clean and was preserved on branch `task/storybook-shape-migration-wip` (commit `8daccd0`).

Between then and merge, [ADR-007](./ADR-007-storybook-page-recipe.md) shipped its Phase 3 page-recipe migration on `main` ([#433](https://github.com/brikdesigns/brik-bds/pull/433)–[#444](https://github.com/brikdesigns/brik-bds/pull/444)) — Carbon-style triple-link header, normative section order, H3 demotion, ComponentLinks block on every component MDX. ADR-007's work overlaps **137 of the 142 files** this branch touched. A merge or rebase would either re-introduce `Variants`/`Patterns` galleries (undoing ADR-007) or strip the page recipe (also undoing ADR-007).

Decision: ADR-007 wins on file content because it's already merged and lint-enforced. ADR-006's decisions stand as the rulebook; the existing-stories sweep is abandoned. The shelved branch stays as a reference if Phase 4 ever wants to revisit specific story bodies.

### Forward rule

**New component story files** — written after this ADR is accepted — use the amended taxonomy + two-shape model from day one:

- Title goes under `<Bucket>/<component>` using the flat bucket table in Part A (e.g. `Components/button`, `Containers/card`, `Blocks/field`).
- No subcategory layer (`Components/Action/button` is the old style — superseded).
- File contains `Playground` (args + controls) plus one args-driven story per meaningful state.
- No `Variants` / `Tones` / `Patterns` gallery buckets.
- Deprecated components move to `Deprecated/<component>` with `tags: ['!manifest']`.
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

- Operational ruleset lives in [`.claude/standards/storybook-story-shape.md`](../../.claude/standards/storybook-story-shape.md) and is auto-retrieved by the [`storybook-story-shape`](../../.claude/skills/storybook-story-shape/SKILL.md) skill on every `*.stories.tsx` edit.
- [ADR-010](./ADR-010-storybook-axes-of-information.md) carries the story-vs-control matrix referenced by Part B above.
- BDS `CLAUDE.md` "Storybook" section carries a one-line pointer to this ADR and to ADR-010.
- New component story files reviewed against the two-shape model + matrix in PR review.
- **Lint enforcement is page-recipe-scoped today** ([`scripts/lint-storybook-recipe.js`](../../scripts/lint-storybook-recipe.js), gated on pre-commit + CI per ADR-007). A complementary lint for the story-shape rule (no `Variants`/`Tones`/`Patterns` gallery exports) is tracked in [#569](https://github.com/brikdesigns/brik-bds/issues/569) and not yet wired.
- Existing files are not retroactively swept. See Migration above for why.

## Amendments

### 2026-05-05 — Taxonomy table top-up

The Components table in Part A is amended:

- **`catalog-picker`** moved from `Form` → `Addables`. The intent of `Addables` is "lists the user builds entry-by-entry" — `catalog-picker` matches that intent (catalog-driven entry selection). Keeping it in `Form` was an artifact of the original `Form/Input` consolidation in Phase 1.
- **`checklist`** added to `List` (was `ChecklistItem` under `Form`). Component renamed from `ChecklistItem` → `Checklist` in the same change to match the table convention; `bds-checklist-item` CSS classes renamed to `bds-checklist`. Breaking change for any consumer importing `ChecklistItem` from `@brikdesigns/bds`.
- **`interactive-list-item`** added to `List` (was `InteractiveListItem` under the now-removed `Components/Display/*` bucket). No rename; only the Storybook title moves.
- **`completion-toggle`** added to `Form` (was missing from the original table). Stays in `Form` as the atomic primitive paired with `checklist` as the labeled-row composition, mirroring the `Checkbox` / `Radio` pattern of atomic primitives staying in `Form`.

These are table top-ups, not structural changes — no new subcategories, just member reassignment. Lands alongside the Storybook title moves in a follow-on PR.

### 2026-05-16 — Part A: 6-bucket flat taxonomy (#629)

The `Components/<subcategory>/` layer, `Navigation/`, and `Displays/` top-levels are abolished. All component stories move to one of six flat top-level buckets defined by composition role.

**Decision driver:** subcategories under `Components/` (Action, Form, Indicator, Navigation, etc.) added depth without clarity — the split was inherited, not designed. `Displays/` vs `Components/` implied a behavioral category that wasn't real. Carbon, Material, and Chakra all use flat-ish top-level taxonomies for the same reason.

**Open member questions resolved (2026-05-15 mapping session):**

| Question | Resolution | Reasoning |
| --- | --- | --- |
| `Form` — Container or Component? | **Container** | Styled holder composing Field blocks — own border/padding/elevation |
| `Field` / `FieldGrid` — Block or Container? | **Block** | Fixed slot shape filled with atoms |
| `Addable*` family — Container or Block? | **Container** | Own border + padding + elevation around a composed list |
| `FilterBar` — Block or Container? | **Component** (sub-judgment) | Composed row, no own bounded surface today |
| `ButtonGroup` — Block or Container? | **Component** | Compound primitive, not a slot-shape Block |
| `NavBar`, `Footer`, `SidebarNavigation` — Section or Component? | **Section** | Page-level composed regions with surrounding structure |
| Sub-categories within top-levels | **Flat** | Reduces clicks; defer sub-folders unless a bucket exceeds ~30 items |
| `Theming/` (Blueprints) | **Parallel top-level** — unchanged | Foundation work, not component |
| `Foundations/` | **Unchanged** | Same reasoning |

**`preview.tsx` update:** `storySort.order` is updated in the rename sweep PRs (one per bucket, tracked in [#629](https://github.com/brikdesigns/brik-bds/issues/629)) after [#618](https://github.com/brikdesigns/brik-bds/issues/618) wraps. Existing `meta.title:` strings keep their current values during the migration window; new stories use the flat bucket path from this date forward.
