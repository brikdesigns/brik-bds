# ADR-031 — RelationshipField: ordered catalog relationships + icon-text read-mode convention

**Status:** Accepted (2026-08-14)
**Date:** 2026-08-14
**Supersedes:** —
**Superseded by:** —
**Owner:** Nick Stanerson
**Related:** [brik-bds#1825](https://github.com/brikdesigns/brik-bds/issues/1825) (this component), brik-client-portal#3168 (locked the `RelationshipField` name at the umbrella level), [ADR-008](./ADR-008-naming-canon-closed-allowlist.md) (naming canon), [ADR-009](./ADR-009-typegen-component-axes.md) (typegen), [read-edit-parity standard](../../.claude/standards/read-edit-parity.md), `product/brik-client-portal/src/components/settings-plan-edit-page.tsx` (prior art — hand-rolled Supported Services list)

## Context

The addable/select/tag family (`AddableComboList`, `AddableEntryList`, `AddableFieldRowList`, `AddableTagList`, `AddableTextList`, `CatalogPicker`, `MultiSelect`, `ServiceTagPicker`, `Tag`, `TagGroup`) has no member that supports **reordering**. Verified: `grep -rliE 'reorder|moveUp|moveDown|onMove|onReorder|swap|dnd|draggable|sortable' components/ui/Addable* components/ui/CatalogPicker components/ui/ServiceTagPicker components/ui/MultiSelect` returns only a `.mdx` doc, zero behavior. Every member of the family treats the picked value as a **set** — array order is either alphabetical, insertion-order-as-implementation-detail, or irrelevant to the persisted shape.

Some relationships are not sets — they are **sequences**, where the array position *is* the persisted value. The consumer's plan-editing page (`settings-plan-edit-page.tsx:648-738`) hand-rolls exactly this: a "Supported Services" list with per-row ↑/↓/× buttons, backed by a `sort_order`-style column, wired up manually with `Cluster`/`Button`/`Select` because no BDS primitive covers add + remove + reorder together.

The portal umbrella (#3168) locked the edit-mode control's name as `RelationshipField` and specified the read-mode convention: a read-mode service reference renders as an icon-text `ServiceTag` (color + glyph), not a neutral `Tag`.

## Decision

### 1. Ship `RelationshipField` — no naming-canon conflict found

`RelationshipField` is accepted as the component name, matching #3168 with **no divergence**. Checked against both candidate constraints named in the ticket:

- **ADR-008** governs the `bds-` **class/slot** namespace (§1, §4) and structural-only BEM modifiers (§3) — it says nothing about top-level component identifiers. `RelationshipField`'s root class is `bds-relationship-field`, which is namespace- and grammar-conformant; no ADR-008 rule reaches component *names*.
- **The Addable\* family convention** is not a closed rule — `CatalogPicker`, `MultiSelect`, `ServiceTagPicker`, `Select`, `Tag`, `TagGroup` all coexist in the same family directory without the `Addable` prefix, so there is no precedent forcing every list-shaped control into that name. `RelationshipField` sits alongside them as a sibling, not a violation.

No reconciliation was required; the name ships as locked.

### 2. `RelationshipField` generalizes the prior-art interaction model, mirroring the established family API shapes

Per the component-build standard's "compose, don't reinvent" rule and the instruction to mirror `CatalogPicker` / `AddableEntryList` / `MultiSelect`'s established prop shapes:

- **Controlled API**: `value: RelationshipItem[]` (order-bearing) + `onChange(next)` — same controlled-array contract as `AddableEntryList.entries` / `CatalogPicker.value` / `MultiSelect.value`.
- **Catalog input**: `options: readonly RelationshipOption[]` — the full catalog. The component computes "available" (`options` minus `value`, matched by `id`) internally, the same responsibility `CatalogPicker` and `AddableEntryList`'s suggestion mode already own — the consumer never hand-filters "already added" like the pre-BDS `settings-plan-edit-page.tsx` did.
- **Item shape**: `{ id, label, category? }` — generic enough for any catalog relationship (`id` for matching/dedup, `label` for display), with an **optional** `category?: ServiceLine` for the one Brik-specific concern the read mode needs (icon + color resolution). Non-service relationships (team roles, linked resources) simply omit `category` and read mode falls back to a neutral `Tag` — the item shape doesn't force every consumer through service vocabulary.
- **Reorder**: array-swap `move(index, delta)` on ↑/↓ `Button` (`variant="ghost"`, `ArrowUp`/`ArrowDown` icons) — the same buttons-not-drag-and-drop v1 bar the prior art already validated in production. Drag-and-drop is out of scope for v1 per the ticket; nothing in this ADR blocks adding it later as an additive interaction on the same `value`/`onChange` contract.
- **Add row**: `Select` (options = available catalog) + primary `Button`, disabled when nothing pending — directly generalizes the prior art's "Add service" `Select` + "Add" `Button` pair, replacing the consumer's manual `pendingServiceId` state + `availableServices` filter with component-owned logic.

### 3. Read mode reuses `ServiceTag` + `TagGroup` — no new tag primitive

Per the read/edit parity standard's component-mapping-parity rule ("a value chosen via a colored picker displays as a colored tag in read — never downgraded to a neutral Tag"), `RelationshipField`'s own `disabled` prop renders read mode **in the same component** (matching `AddableEntryList`'s `disabled` pattern), not a separate exported component:

- Item carries `category` → `<ServiceTag category={item.category} variant="icon-text" serviceName={item.label} label={item.label} />` (color + glyph, per #3168's locked convention).
- Item has no `category` → `<Tag>{item.label}</Tag>` (neutral fallback for non-service relationships).
- Both wrapped in `<TagGroup gap="xs">`, order preserved from `value`.

No new tag primitive was built. `read + edit share one component family` is satisfied by `RelationshipField` itself carrying both modes, exactly as `AddableEntryList` already does — not by a paired sibling component.

### 4. When to use `RelationshipField` vs. `MultiSelect` / `CatalogPicker`

The deciding factor is **whether array order is part of the persisted value**:

| Component | Order persisted? | Free-text additions? |
| --- | --- | --- |
| `RelationshipField` | **Yes** — position is the saved `sort_order`-equivalent | No — catalog-only |
| `MultiSelect` | No — selection is a set | No — catalog-only |
| `CatalogPicker` | No — selection is a set | Yes — catalog pick or free-text, with `source` attribution |

If reordering the selected items would change what gets persisted or rendered downstream (a `sort_order` column, a rendered sequence a client sees), use `RelationshipField`. If the set of selections is all that matters, reach for `MultiSelect` (fixed vocabulary) or `CatalogPicker` (vocabulary + free-text escape) instead — adding reorder machinery to a set-shaped relationship is unnecessary surface area.

## Consequences

- `components/ui/RelationshipField/` ships as a new `Containers/` bucket member (bounded row borders, same bucket as `AddableEntryList`/`CatalogPicker`), exported from `components/ui/index.ts`.
- `RelationshipItem`/`RelationshipOption` are new exported types; no existing component's public API changes.
- `ServiceLine`/`ServiceTagSize` are consumed, not redefined — no parallel category taxonomy introduced.
- Drag-and-drop reorder, if requested later, is additive to the existing `value`/`onChange` contract and does not require a breaking API change.
- No lint/lint-manifest changes required — `RelationshipFieldSize` is a plain `'sm' | 'md' | 'lg'` string-literal union export, so `npm run typegen:axes` picks it up automatically into `manifest/component-axes.json` on the next run.
