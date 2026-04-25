# ADR-003 — Addable* List Family Consolidation

**Status:** Proposed
**Date:** 2026-04-24
**Supersedes:** —
**Superseded by:** —
**Owner:** Nick Stanerson

## Context

BDS ships three "addable list" components in `Components/Form`:

| Component | Value shape | Suggestion source | Read mode |
|---|---|---|---|
| `AddableTextList` | 1 string | none | tags |
| `AddableComboList` | 1 string | filtered list (optional `strict`) | tags |
| `AddableEntryList` | 2 strings (`primary` + `secondary`) | optional + 2 internal sub-modes | typography cards |

All three reimplement: reveal-form pattern, `atLimit`, `allowDuplicates`, label / helper / empty / addLabel / removeLabel, three-row size matrix, focus management, and keyboard handling. `AddableEntryList` alone packs **3 internal modes** (plain inline-edit, suggestion mode, read mode) into 642 lines. `AddableComboList` and the suggestion-mode of `AddableEntryList` both consume `useSuggestionFilter` — proof the shared logic is already extracted but the components are not.

Surveyed during the 2026-04-24 Storybook taxonomy audit. Estimated overlap: ~80% by line count, ~95% by prop surface.

## Decision

Collapse the family from three components to **two**, split on the only axis that drives genuinely different rendering:

1. **`AddableTagList`** — 1-field value (`string[]`), tag-style render, **optional `suggestions?: string[]`** prop. Replaces both `AddableTextList` and `AddableComboList`.
2. **`AddableEntryList`** — 2-field value (`{ primary, secondary }[]`), card-style render, optional `primarySuggestions?: string[]` prop. Keeps existing name and shape; internal cleanup only.

Both components share an internal `useAddableList` hook for the reveal/commit/cancel/dedupe logic that today is copy-pasted across all three. Both share a `useSuggestionFilter` hook (already exists).

`AddableEntryList`'s read-mode branch (rendered when `disabled`) is removed — consumers in read mode should compose `<Field>` + `<BulletList>` or equivalent display primitives. A 2-field read-only display is not the same component as a 2-field editor and should not share a name.

## Rationale

- **Tag-list with optional suggestions is one shape, not two.** Adding a `suggestions?` prop to `AddableTagList` covers both prior components with a single prop, no rendering branch. The `strict` prop migrates as-is.
- **2-field shape genuinely differs.** `{ primary, secondary }` requires a separate render path (paired inputs, secondary textarea). Folding it into a generic `AddableList<T>` would require shape-conditional branches that re-introduce the complexity we're trying to remove.
- **Read mode is a display concern, not an "addable" concern.** `<AddableEntryList disabled>` exists today because no `EntryDisplay` primitive does. Building one is cheaper than maintaining a component that flips between editor and read renderer based on a boolean.
- **Three components for two shapes is a smell.** The existence of two 1-field variants (`AddableTextList`, `AddableComboList`) was a fork that should have been a prop.

## Alternatives considered

- **Single component `AddableList<T>` with shape generic.** Rejected — generic shape parameter pushes complexity into the prop API (different placeholder, label, validation, render slots per shape). Two concrete components are clearer.
- **Status quo.** Rejected — the maintenance cost of keeping three components in sync (and the precedent it sets for future fork-instead-of-prop decisions) is the bloat we're trying to eliminate.
- **Add a fourth component for read-mode entry display.** Rejected — scope creep. If consumers need it, build it as `EntryDisplay` in a follow-up; for now, `<Field>` + body text covers the existing portal use case.

## Migration

Portal currently imports `AddableTextList`, `AddableComboList`, `AddableEntryList` by name. Migration steps (separate task / PR):

1. Land new `AddableTagList` alongside the existing three components (no breaking changes yet).
2. Migrate portal imports: `AddableTextList` → `<AddableTagList />`, `AddableComboList` → `<AddableTagList suggestions={...} />`.
3. Land internal `useAddableList` hook; refactor `AddableEntryList` to consume it; delete inline duplicates.
4. Migrate `AddableEntryList` consumers using `disabled` to `<Field>` + display primitives; delete the read-mode branch.
5. Delete `AddableTextList` and `AddableComboList`. Bump major version (public API change). Update CHANGELOG and consumer migration notes.

Estimated effort: 1 BDS PR + 1 portal PR. Both gated by Chromatic visual review.

## Consequences

### Positive

- Net **−1 component** (3 → 2), **−~600 LOC** of duplicated reveal/commit/dedupe logic
- One mental model for tag-list addition (with or without suggestions)
- Editor and display concerns separated — no boolean-flip rendering
- Sets precedent for the broader bloat audit: forks become props, not new components

### Negative

- Major version bump on `@brikdesigns/bds` (public API rename + deletions)
- Portal PR required in lockstep — coordination cost
- Loses the discoverability of "AddableComboList" as a named primitive (consumers must know to pass `suggestions` to `AddableTagList`); mitigated by MDX docs

### Neutral

- The `AddableEntryList` shape stays the same. Existing portal consumers in plain or suggestion mode keep working post-migration.

## Enforcement

- ADR linked from BDS CLAUDE.md and the component-bloat audit project memory
- Implementation tracked as a separate task (`task/bds-addable-consolidation`) to keep this scope clean
- Chromatic regression gate on the implementation PR
