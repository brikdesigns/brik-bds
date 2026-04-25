# 2026-Q2 Portal Addable-Pattern Survey

**Date:** 2026-04-25
**Surveyor:** Nick Stanerson + Claude
**Scope:** PR 2 of the addable-cleanup sequence — research only, no code. Reads all six onboarding sheets in `brik-client-portal/src/components/sheets/` plus the Brand Identity flow, inventories every "add/remove items" pattern, and produces a punch-list to inform PR 3 (consolidation decision).
**Predecessor:** [PR #250](https://github.com/brikdesigns/brik-bds/pull/250) — composition + remove-pattern fix in BDS.

## Headline

The portal has **5 distinct shapes** for "user manages a list of items" — three are BDS-correct (using `MultiSelect`, `AddableTextList`, `AddableComboList`, `AddableEntryList`, `CatalogPicker`), and **three are hand-rolled local clones** that reimplement the pattern with no BDS-level abstraction.

The hand-rolled clones share a structural shape (multi-field row with a remove affordance) that no BDS component covers today. **PR 3 should decide whether to introduce a BDS primitive for that shape OR force migration to existing primitives.**

## Inventory — patterns by sheet

### Sheets using BDS components correctly

| Sheet | Pattern(s) | BDS components used |
|---|---|---|
| `onboarding-billing-sheet.tsx` | CTAs, services, payment types, payment-policy notes, pricing tiers | `CatalogPicker` ×2, `AddableComboList`, `MultiSelect` |
| `onboarding-visual-sheet.tsx` | Reference sites, image moods, vibe descriptors | `AddableEntryList` ×2, `MultiSelect` |
| `onboarding-industry-details-sheet.tsx` | Services offered, locations, certifications, compliance | `AddableComboList` ×4 |
| `onboarding-brand-sheet.tsx` | Approved/rejected CTAs, personality, voice | `CatalogPicker` ×2, `MultiSelect` |
| `onboarding-competitors-sheet.tsx` (competitor list) | Competitor URLs + notes | `AddableEntryList` ×2 (read + edit modes) |

These six BDS-correct usages span 4 of the 5 BDS-shipped Addable/Multi components — `MultiSelect`, `AddableComboList`, `AddableEntryList`, `CatalogPicker`. (The 5th, `AddableTextList`, doesn't appear in onboarding sheets — checked.)

### Sheets with hand-rolled local clones

These are the divergence cases. Each reimplements the add/remove flow with custom JSX rather than using a BDS component.

#### Pattern A — Multi-field row + trash IconButton

Two sheets. Same structural shape. Different hand-roll.

**`onboarding-software-sheet.tsx`** — [lines 170-227](https://github.com/brikdesigns/brik-client-portal/blob/main/src/components/sheets/onboarding-software-sheet.tsx#L170-L227)
- Per item: `TextInput` (Name) + `TextInput` (Purpose) + `Select` (Category) + `IconButton` (`ph:trash-fill`, `variant="secondary"`)
- Inline `<div>` with `gridTemplateColumns: '1fr 1fr 160px auto'`
- "Add X" Button below rows
- Used for: Phone System, Other Tools (sectioned by category)

**`onboarding-listing-sheet.tsx`** — [lines ~370-400](https://github.com/brikdesigns/brik-client-portal/blob/main/src/components/sheets/onboarding-listing-sheet.tsx#L370-L400)
- Per item: holiday-name `TextInput` + open-time `TextInput` + close-time `TextInput` + closed `Checkbox` + `IconButton` (`ph:trash-fill`, `variant="secondary"`)
- Inline grid layout (different column template)
- "Add Holiday" Button below
- Used for: holiday hours

**Same shape, different JSX, different field sets, no shared abstraction.**

#### Pattern B — Frame/card with text "Remove" Button

One sheet.

**`onboarding-competitors-sheet.tsx`** — [lines 150-200](https://github.com/brikdesigns/brik-client-portal/blob/main/src/components/sheets/onboarding-competitors-sheet.tsx#L150-L200)
- Per item: header row (`#1` index + text "Remove" Button) + `TextInput` (Competitor) + `TextArea` (Gap) + `TextArea` (Copy implication)
- Inline-styled `<div>` with `padding`, `border`, `borderRadius` from `@/lib/tokens` — local CSS-in-JS
- "+ Add frame" Button at top
- Used for: Competitive Positioning "frames"

**Note**: This sheet ALSO uses BDS `AddableEntryList` correctly elsewhere ([line 104, 232](https://github.com/brikdesigns/brik-client-portal/blob/main/src/components/sheets/onboarding-competitors-sheet.tsx#L104)) for the actual competitor list. The hand-roll is for a separate "frames" data shape (Competitor + Gap + Copy implication = three fields per item).

## Comparison table — five distinct shapes

| Shape | Field count | Field types | Add affordance | Remove affordance | Wrapping container | BDS abstraction? |
|---|---|---|---|---|---|---|
| **MultiSelect + Tag** | 1 (locked enum) | dropdown pick | dropdown selection | Tag `onRemove ×` | inline | ✅ `MultiSelect` |
| **Free-form tag list** | 1 (free string) | TextInput in reveal-form | "Add new" Button | Tag `onRemove ×` | inline | ✅ `AddableTextList` |
| **Suggestion-driven tag list** | 1 (string + suggestions) | TextInput combobox + dropdown | combobox commit | Tag `onRemove ×` | inline | ✅ `AddableComboList` |
| **Title + description card** | 2 (primary + secondary) | TextInput + TextArea | row append OR reveal-form | text "Remove" Button OR IconButton `ph:x` (after PR #250) | bordered card | ✅ `AddableEntryList` (and `CatalogPicker` for the suggestion case) |
| **Multi-field row** (3+ fields) | 3+ | TextInput / Select / Checkbox / TimePicker / etc. | "Add X" Button below rows | IconButton `ph:trash-fill` (or text "Remove" in one case) | inline grid | ❌ **none — hand-rolled in 3 sheets** |

The fifth shape — the multi-field row — has no BDS abstraction. Three sheets reinvent it.

## Punch-list (input for PR 3)

Ordered by impact × design-clarity:

### 1. Decide on the multi-field-row shape

**Question:** Should BDS introduce a primitive for the multi-field row pattern, or should the three offending sheets converge on something existing?

Three options:

**Option A — Introduce `AddableFieldRowList` in BDS.** Generic primitive for "user manages a list of N-field rows." Props sketch: `rows`, `onChange`, `fields: Array<{ key, label, render: (value, onChange) => ReactNode }>`, `addLabel`, `removeLabel`. Renders rows + add button + IconButton trash per row. Net: −300 LOC across the three sheets, +~150 LOC in BDS.

**Option B — `AddableEntryList` grows multi-field support.** Extend `AddableEntry` shape from `{ primary, secondary }` to `Record<string, string>` with field config. Net: stretches a 2-field shape into N-field territory; risks forks-as-component-with-discriminated-union complexity.

**Option C — Defer.** Mark the three sheets as "tolerated divergence" and move on. Punt the abstraction until a 4th instance shows up.

**Honest take**: 3 instances meets ADR-004's "three uses test" — Option A is justified. The shape is genuinely useful (Phone System, Holiday Hours, Competitive Frames are all reasonable use cases). But the API design is non-trivial (how to declare fields? type-safe values? validation?) and warrants its own focused design pass.

### 2. Settle the × vs trash semantic question

| Affordance | Where used today | Semantic |
|---|---|---|
| Tag `onRemove ×` (`ph:x`) | MultiSelect, AddableTextList, AddableComboList, AddableEntryList (post-PR #250) | "remove from this list" — non-destructive |
| `IconButton ph:trash-fill` | onboarding-software-sheet, onboarding-listing-sheet | "delete this row" — destructive intent |
| Text `<Button>Remove</Button>` | onboarding-competitors-sheet local clone (not BDS) | inconsistent with both above |

Two patterns are arguably semantically distinct: removing a *tag* (light) vs deleting a *row of structured data* (heavier, signals data loss). But there's no documented rule, and PR #250 just unified everything in BDS to `ph:x`.

**Question:** Does `ph:trash-fill` belong on multi-field rows because they're "more destructive"? Or should the new `AddableFieldRowList` (if Option A wins) also use `ph:x`?

**Honest take**: lean toward `ph:x` everywhere for visual consistency. Trash-as-icon is a strong destructive cue that may overstate the gravity of removing one row from a list — and tags vs rows isn't a meaningful semantic distinction at the user level. But the user (operator) should make this call; there's no objectively right answer.

### 3. Settle the competitors-sheet "frames" shape

The frames shape (Competitor + Gap + Copy implication) is technically a 3-field card, not a tag list. It's currently hand-rolled in `onboarding-competitors-sheet.tsx`. Options:

- **A.** It becomes the canonical example of `AddableFieldRowList` (if introduced).
- **B.** It collapses into `AddableEntryList` plain mode if the third field (Copy implication) gets dropped or merged into the secondary.
- **C.** It stays hand-rolled.

Same axis as #1 — depends on whether BDS gains the multi-field primitive.

### 4. Migration scope summary (post PR 3 decisions)

If BDS introduces `AddableFieldRowList` (Option A on #1):
- Migrate `onboarding-software-sheet.tsx` Phone System / Other Tools (1 sheet)
- Migrate `onboarding-listing-sheet.tsx` holiday hours (1 sheet)
- Possibly migrate `onboarding-competitors-sheet.tsx` competitive frames (1 sheet) — depends on #3

If BDS doesn't introduce the primitive:
- No migrations. Tolerated divergence; document as known.

## Out of scope (already addressed)

- Composition fixes for AddableComboList + AddableEntryList — landed in PR #250
- Remove-pattern unification across BDS Addables — landed in PR #250
- Storybook taxonomy moves — landed in PR #250
- Dialog / AlertBanner / CardSummary / CardControl deprecations — separate audit punch-list (already shipped via PRs #236, #237, #244, #246)

## Recommendation for PR 3

**Don't decide #1 in a vacuum.** The right format is a short ADR proposing `AddableFieldRowList` (or rejecting it) with concrete API sketch + migration estimate. That ADR becomes PR 3.

If the ADR accepts the new primitive, BDS implementation + portal migration follow as separate PRs (same additive-deprecate-migrate-delete pattern as Modal/Dialog, Banner/AlertBanner, Card/CardSummary).

If the ADR rejects (defers), document the rationale in the audit doc's "Rejected recommendations" section like #5 Snackbar and #6 Menu/Popover were.

Either way, PR 3 starts with the ADR — not code.

## Decisions logged 2026-04-25

User resolved the four open questions:

1. **Multi-field-row primitive — yes** (Option A). New BDS component `AddableFieldRowList`. Tracked in [ADR-005](../adrs/ADR-005-addable-field-row-list.md).
2. **Remove icon — `ph:dash-circle`** (not `ph:x`). Semantic distinction: `ph:dash-circle` reads as "remove from list" (subtract), `ph:x` reads as "dismiss selection" (close). `Tag.onRemove` keeps `ph:x` since it's a dismiss-selection use case. PR #250's per-row `ph:x` choice for the existing Addable family per-row remove will be re-standardized to `ph:dash-circle` as a follow-up to ADR-005.
3. **Competitors-sheet "frames" — collapse** into the new primitive. No special-case carve-out.
4. **Migration scope** — three sheets: software-sheet (Phone System / Other Tools), listing-sheet (holiday hours), competitors-sheet (frames).

These decisions feed directly into ADR-005's API sketch + migration plan.
