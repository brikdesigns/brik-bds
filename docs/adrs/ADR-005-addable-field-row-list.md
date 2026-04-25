# ADR-005 — AddableFieldRowList primitive

**Status:** Proposed
**Date:** 2026-04-25
**Supersedes:** —
**Superseded by:** —
**Owner:** Nick Stanerson

## Context

The 2026-Q2 portal addable-pattern survey ([audit doc](../audits/2026-Q2-portal-addable-survey.md), PR #251) catalogued five distinct shapes for "user manages a list of items" across `brik-client-portal`. Four shapes are covered by existing BDS components (MultiSelect, AddableTextList, AddableComboList, AddableEntryList). The fifth shape — **multi-field row** — has no BDS abstraction and is hand-rolled in three onboarding sheets:

1. `onboarding-software-sheet.tsx` — Phone System / Other Tools rows (Name TextInput + Purpose TextInput + Category Select + remove)
2. `onboarding-listing-sheet.tsx` — holiday hours rows (open + close + closed Checkbox + remove, with cross-field disabling)
3. `onboarding-competitors-sheet.tsx` — Competitive Positioning frames (Competitor TextInput + Gap TextArea + Copy implication TextArea + remove)

Each instance reimplements: add-row button, remove-row affordance, row container styling, row indexing, optional empty state. Two of three use `ph:trash-fill` IconButton; one uses a text "Remove" Button. This is the divergence ADR-004's "three-uses test" was written for.

User decisions (2026-04-25, confirming the audit doc's open punch-list):
- **Option A** — introduce a new BDS primitive
- **`ph:dash-circle`** — for the in-list per-row remove affordance, distinct from `ph:x` (which carries "dismiss selection" semantics on Tag's onRemove)
- **Collapse the competitors-sheet "frames" pattern** into the new primitive — no special-case carve-out

## Decision

Introduce **`AddableFieldRowList`** as a new BDS primitive in `Displays/Form` with a render-prop API:

```tsx
<AddableFieldRowList<Tool>
  values={tools}
  onChange={setTools}
  newRow={() => ({ name: '', purpose: '', category: 'other' })}
  addLabel="Add Phone System"
  removeLabel="Remove tool"
  emptyLabel="No tools added yet."
  columns="1fr 1fr 160px"
  // Optional: heading per "section" if rows are grouped (e.g. PHONE SYSTEM / OTHER TOOLS)
>
  {({ row, update }) => (
    <>
      <TextInput value={row.name} onChange={(e) => update({ name: e.target.value })} placeholder="e.g. HubSpot" />
      <TextInput value={row.purpose} onChange={(e) => update({ purpose: e.target.value })} placeholder="What this tool is used for" />
      <Select value={row.category} options={CATEGORY_OPTIONS} onChange={(e) => update({ category: e.target.value })} />
    </>
  )}
</AddableFieldRowList>
```

Per-row remove is rendered by the primitive: `<IconButton variant="ghost" icon={<Icon icon="ph:dash-circle" />} label={removeLabel} />`. Add button is rendered by the primitive at the bottom: `<Button variant="secondary" size="sm">{addLabel}</Button>`. Layout is a CSS grid with consumer-supplied `columns` plus an `auto` track for the remove button.

### API rationale

Considered three approaches:

| Approach | Pro | Con | Decision |
|---|---|---|---|
| Declarative field schema (`fields={[{type: 'text', key, ...}, ...]}`) | Compact, easy reading | Field-type-specific props get messy; hard to express cross-field interactions (e.g. listing sheet's `closed` disabling open/close); type-safety on row data weakens | Rejected |
| Pure render-prop / children-as-function | Flexible, type-safe, handles cross-field interactions | More boilerplate at call sites | **Selected** |
| Children with positional `<Field>` slot components | React-y composition feel | Hard to type-check row data through positional children | Rejected |

The render-prop pattern matches `react-hook-form`'s `useFieldArray` and MUI DataGrid's column-render approach — established convention for the use case. Generic `<T>` parameter ensures `row` and `update` are typed against the consumer's data shape.

### Cross-field interactions

The listing-sheet holiday pattern needs `closed` checkbox to disable `open`/`close` time inputs. The render-prop API supports this naturally — the consumer reads `row.closed` and conditionally sets `disabled` on the relevant inputs. No special primitive support needed.

### Remove icon (`ph:dash-circle`)

The user's distinction is semantic, not just visual:

- `ph:x` (close) — appears on `Tag.onRemove`. Reads as "dismiss this selected tag." Used when the item is a presentation of an existing selection.
- `ph:dash-circle` (subtract) — appears on per-row remove inside an editable list. Reads as "remove this row from the collection." Used when the user is composing/managing the list.
- `ph:trash-fill` (delete) — destructive, permanent. Used for hard-delete actions (e.g. "delete this record").

PR #250 standardized the entire Addable family on `ph:x`. **This ADR re-standardizes per-row remove on `ph:dash-circle`** to honor the semantic distinction. `Tag.onRemove` keeps `ph:x` (it's a "dismiss selection," not a "remove from list" — Tags appear *after* selection has happened). Follow-up scope at the bottom.

## Migration

Three sheets to migrate after the primitive ships:

| Sheet | Pattern | Migration effort |
|---|---|---|
| `onboarding-software-sheet.tsx` | Phone System / Other Tools | ~30 LOC delta — replace the inline grid + add/remove handlers with `<AddableFieldRowList>` + render-prop |
| `onboarding-listing-sheet.tsx` | Holiday hours | ~40 LOC delta — same pattern + cross-field disabling stays in the render-prop |
| `onboarding-competitors-sheet.tsx` | Competitive Positioning frames | ~30 LOC delta — three-field render-prop replaces the frame card layout |

Each migration is its own follow-up portal PR. None block this ADR or the primitive's introduction.

## Alternatives considered

- **Option B — Extend `AddableEntryList` to N fields.** Rejected: AddableEntryList's value shape is fixed (`{ primary, secondary }`). Generalizing it to arbitrary field counts would re-introduce the conditional-render complexity that the audit (PR #233) flagged. Also breaks the "one shape per component" discipline ADR-004 §3 names.
- **Option C — Defer / tolerate the divergence.** Rejected by user decision; three real uses meets ADR-004's three-uses test.
- **Field-schema API (Approach 1 above).** Rejected — see API rationale table.

## Consequences

### Positive

- Eliminates 3 hand-rolled implementations across the portal (~100 LOC total)
- One discoverable BDS pattern for "multi-field row collection" — future sheets pick it up instead of reinventing
- Render-prop API supports the diverse field types and cross-field interactions found in the survey without rewriting per-shape
- Settles the × vs trash semantic question across the family with a documented rule
- Generic `<T>` parameter gives consumers type-safe row data

### Negative

- New public component to maintain. Mitigated by: the implementation is a thin wrapper around grid + add/remove handlers + IconButton; complexity is in the render-prop, which lives at consumer sites.
- Render-prop API is slightly more verbose than a declarative field-schema. Tradeoff accepted in exchange for type safety + flexibility.
- PR #250's `ph:x` choice for the existing Addable family per-row remove is now wrong — re-standardization on `ph:dash-circle` is a follow-up. Tracked in scope below.

### Neutral

- Doesn't touch MultiSelect, AddableTextList, AddableComboList, AddableEntryList, or CatalogPicker. Those components stay as-is until/unless the consolidation question is reopened (which is now post-ADR-005).

## Forward scope (separate PRs)

After this ADR is accepted:

1. **PR — `AddableFieldRowList` implementation + Storybook stories + MDX**: introduce the component in `components/ui/AddableFieldRowList/` with `Displays/Form/addable-field-row-list` story title. Includes the three story patterns (3-text, holiday-with-checkbox, frames-with-textareas) as case studies.
2. **PR — Per-row remove icon re-standardization**: change `AddableEntryList` per-row IconButton from `ph:x` → `ph:dash-circle` (revising PR #250 for the per-row case; Tag.onRemove unchanged). Update audit doc.
3. **3 portal migration PRs**: software-sheet, listing-sheet, competitors-sheet. Independent, can land in any order.
4. **BDS release** bundling the above (`v0.40.0` minor bump per current version discipline — additive new component + remove-icon swap is non-breaking visually but is a public-facing change).

## Enforcement

- ADR linked from BDS CLAUDE.md (Component Bloat Guardrails section)
- ADR-004's audit-gate questions apply to the implementation PR — the PR description must enumerate the three uses (already documented here) and the API rationale (already documented here)
- Periodic audit (per ADR-004 §"Periodic audit") will revisit whether `AddableFieldRowList` continues to earn its keep
