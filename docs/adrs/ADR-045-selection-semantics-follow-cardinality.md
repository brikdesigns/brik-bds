# ADR-045 — Selection semantics follow cardinality: a toggle is `aria-pressed`, a group is radio or checkbox

**Status:** **Accepted** 2026-10-29 (§ Ruling)
**Date:** 2026-10-29
**Supersedes:** — (amends in part: the "carried in the DOM by `aria-pressed`" wording of [Interaction States § Selectable](../../docs-site/content/docs/foundation/interaction-states.mdx), amended in the same PR)
**Superseded by:** —
**Owner:** Nick Stanerson
**Related:** [#1456](https://github.com/brikdesigns/brik-bds/issues/1456) (this ADR is its AC1), [#2698](https://github.com/brikdesigns/brik-bds/issues/2698) (parent), [#2385](https://github.com/brikdesigns/brik-bds/issues/2385) (Selectable canon, ratified), [#2427](https://github.com/brikdesigns/brik-bds/issues/2427) (Picker rename), [ADR-004](./ADR-004-component-bloat-guardrails.md) (bloat guardrails)

## The operator's words

OPERATOR SAID 2026-09-10 (chat, quoted on [#2385](https://github.com/brikdesigns/brik-bds/issues/2385)): "Is 'Select' more of an interaction type that can be applied to various components... you're conflating 2 layout types - list (vertical) vs grid."

OPERATOR SAID 2026-09-11 (chat, quoted on [#2385](https://github.com/brikdesigns/brik-bds/issues/2385)): "ratify 1–3, split 4"

Flag 1, ratified by that reply: "Selectable = one interaction, one source. Document the `aria-pressed` toggle pattern once + a shared CSS layer or hook; components consume, not re-copy."

This ADR keeps flag 1's decision (one interaction, one source) and changes the ARIA it names for one case: grouped selection. The operator ruled on that change in § Ruling.

## Context

Issue #1456 asks two questions:

1. Should one shared source own `selected`, instead of four hand-rolled copies?
2. Should grouped selection use Checkbox / Radio semantics, keeping `aria-pressed` for single toggle buttons?

Question 1 is already settled by flag 1. Question 2 is still open, and the live code answers it in three different ways.

### What the components do today (`brik-bds@f95ea3c2`)

| Component | Semantics | Source |
|---|---|---|
| `InteractiveListItem` | `<button aria-pressed>` when `selected` is defined | [InteractiveListItem.tsx:170](../../components/ui/InteractiveListItem/InteractiveListItem.tsx#L170) |
| `SelectableMediaTile` | `<button aria-pressed>` | [SelectableMediaTile.tsx:87](../../components/ui/SelectableMediaTile/SelectableMediaTile.tsx#L87) |
| `FilterToggle` | `<button aria-pressed>` with a fixed `label` | [FilterToggle.tsx:65](../../components/ui/FilterToggle/FilterToggle.tsx#L65) |
| `CompletionToggle` | `<button aria-pressed>`, but its `aria-label` changes with state | [CompletionToggle.tsx:70-71](../../components/ui/CompletionToggle/CompletionToggle.tsx#L70) |
| `Button` | `selected` adds a class only, with no ARIA | [Button.tsx:195](../../components/ui/Button/Button.tsx#L195) |
| `SegmentedControl` | `role="radiogroup"` + `<button role="radio" aria-checked>`, with hand-written roving focus | [SegmentedControl.tsx:132-151](../../components/ui/SegmentedControl/SegmentedControl.tsx#L132) |
| `ServiceTagSelect` | `role="radiogroup"` around visually hidden native `<input type="radio">` | [ServiceTagSelect.tsx:64-83](../../components/ui/ServiceTagSelect/ServiceTagSelect.tsx#L64) |
| `RadioGroup` / `CheckboxGroup` | native `<fieldset>` + `<legend>` + native inputs, controlled `value` / `onChange` | [RadioGroup.tsx:89-110](../../components/ui/RadioGroup/RadioGroup.tsx#L89), [CheckboxGroup.tsx:15-60](../../components/ui/CheckboxGroup/CheckboxGroup.tsx#L15) |

Issue #1456's premise is partly stale. `SegmentedControl` has no `selected` prop and already uses radio semantics. `Button`'s `selected` sets no ARIA at all.

### What consumers build with it (`brik-client-portal@7888da96`, `staging`)

A grep for `selected=` within 12 lines of an `InteractiveListItem`, `SelectableMediaTile` or `Button` opening tag found 6 call sites. All 6 are groups:

| Call site | Component | What the reader does | Correct semantics |
|---|---|---|---|
| `meeting-notes-picker.tsx:104` | `InteractiveListItem` | picks one meeting (`selectedId === meeting.id`) | radio |
| `new-proposal-form.tsx:556` | `InteractiveListItem` | picks any number of services (`selectedServiceIds.has`) | checkbox |
| `design/photo-slot-pinner.tsx:237` | `SelectableMediaTile` | pins one photo per section, or clears it (`:239`) | radio + a "None" option |
| `review/VariantSelectGrid.tsx:233` | `Button` + hand-added `aria-pressed` (`:236`) | picks one direction | radio |
| `review/IllustrationReviewGrid.tsx:172`, `:184` | `Button` × 2 + hand-added `aria-pressed` (`:173`, `:185`) | approves or declines one illustration | radio, 2 options |

None of these is a stand-alone toggle. Each one is a pick-one or pick-many group, so `aria-pressed` reads to a screen reader as N separate toggles. Three call sites also change the label with the state ("Approve" → "Approved", "Choose this direction" → "Selected direction", "Pin …" → "Unpin …"). The APG says that is the case where `aria-pressed` must not be used (below). The grep window is 12 lines, so a `selected=` prop further from its tag would be missed. Treat these numbers as 6 found, not a complete census.

### What the vendor pattern says (WAI-ARIA APG, fetched 2026-10-29)

- **Toggle button** — <https://www.w3.org/WAI/ARIA/apg/patterns/button/>: "To tell assistive technologies that a button is a toggle button, specify a value for the attribute aria-pressed." Also: "it is critical the label on a toggle does not change when its state changes". If the label changes, "the aria-pressed attribute would not be needed".
- **Radio group** — <https://www.w3.org/WAI/ARIA/apg/patterns/radio/>: "no more than one of the buttons can be checked at a time". It uses `radiogroup` with `radio` children and `aria-checked`. Focus enters the group with one Tab stop, and the arrow keys move both focus and the checked option.
- **Checkbox** — <https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/>: a checkbox is two-state. Space toggles it. A set of checkboxes sits in "an element with role group" labelled by `aria-labelledby`.

## Decision

### 1. Cardinality decides the semantics, not the component

| What the reader does | Semantics | Rendered as |
|---|---|---|
| Turns **one** stand-alone thing on or off | toggle button | `<button aria-pressed>`, label fixed across states |
| Picks **one** of N | radio group | native `<input type="radio">` sharing a `name`, inside `<fieldset>` + `<legend>` |
| Picks **any number** of N | checkbox group | native `<input type="checkbox">`, inside `<fieldset>` + `<legend>` |

The selected visual (brand tint plus ring, row inset vs tile `box-shadow`) is unchanged and stays one interaction, as flag 1 and the list-vs-grid rule require. Only the ARIA underneath depends on cardinality.

### 2. The shared source is the existing groups, not a new component

`RadioGroup` and `CheckboxGroup` already own everything a group needs: `name`, controlled `value` / `onChange`, `<fieldset>` / `<legend>`, and `disabled`. Each one gains a group context. An `InteractiveListItem` or `SelectableMediaTile` rendered as a child of a group reads that context through one shared hook. It then renders as a `<label>` wrapping a visually hidden native input plus its existing slots, as `ServiceTagSelect` already does. Outside a group, the item stays the `<button aria-pressed>` toggle it is today, so no existing call site breaks.

ADR-004 rules this way:

- Its "extend an existing primitive" path applies: the groups exist and the items exist, so no new component name is needed.
- The three-uses test is met: 4 of the 5 portal surfaces above are single-select groups.
- One hook replaces the `aria-pressed` wiring that is now copied across two items.

### 3. Native inputs, not Radix and not hand-written roving focus

Native radios sharing a `name` give the APG keyboard model (one Tab stop, arrow keys move and check) with no JavaScript. Native checkboxes give Space-to-toggle. `@radix-ui/react-radio-group` is not a dependency today (`package.json` lists only `react-collapsible` and `react-popover`), and adding it would buy nothing the browser does not already do.

### 4. Per-component disposition

| Component | Disposition |
|---|---|
| `InteractiveListItem`, `SelectableMediaTile` | Migrate: group-aware through the shared hook. They stay toggles when used alone. |
| `Button` | `selected` stays a visual state. When `selected` is defined, Button also sets `aria-pressed`. The default changes from `false` to `undefined`, so an ordinary button never announces itself as a toggle. The three hand-added `aria-pressed` props in the portal then become redundant. |
| `FilterToggle` | Stays bespoke: it is a genuine stand-alone toggle with a fixed label. Already correct. |
| `CompletionToggle` | Stays a toggle, but its state-dependent `aria-label` is fixed to one label, per the APG. |
| `SegmentedControl` | Stays bespoke: already a correct APG radio group, and its pill anatomy is not a list row or tile. Moving to native inputs would be a refactor with no a11y gain. |
| `ServiceTagSelect` | No change. It is the reference implementation of § 2's rendering. |

### 5. Pick-one with "clear" uses a "None" option

A radio cannot be unchecked by clicking it again (APG: Space "checks the focused radio button if it is not already checked"). A pick-one group that also allows "nothing selected", like `photo-slot-pinner`, adds an explicit "None" option or a separate clear `Button`. It does not fall back to `aria-pressed`.

## Ruling

Flag 1 of #2385, ratified on 2026-09-11, names "the `aria-pressed` toggle pattern" as the one Selectable pattern. § 1 keeps `aria-pressed` for stand-alone toggles and moves grouped selection to radio / checkbox semantics. That changes the wording the operator ratified, while keeping the decision ("one interaction, one source").

The question put to the operator: "the canon you approved on 2026-09-11 (#2385 flag 1) says every selection uses `aria-pressed`. This ADR would change that wording for groups. Approve the change, or keep `aria-pressed` everywhere?"

OPERATOR SAID 2026-10-29 (chat, session `526da05e-4ad0-4826-83eb-40053d6e6bd0.jsonl`:407): "approved"

The same PR amends Interaction States § Selectable to the cardinality rule.

## Alternatives considered

- **Status quo: `aria-pressed` everywhere.** Rejected. All 6 portal call sites found are groups, and the APG gives a toggle button no group or single-select semantics. A pick-one tile grid reads as N independent toggles.
- **A new `SelectionGroup` / `Selectable` wrapper component.** Rejected under ADR-004. `RadioGroup` and `CheckboxGroup` already own group state, and a third group container would be the fork ADR-004 exists to stop.
- **`role="radio"` on `<button>`, as `SegmentedControl` does.** Rejected for new work. It works, but every component then has to rewrite roving `tabIndex` and arrow-key handling (`SegmentedControl.tsx:94-121`). Native inputs do the same work for free.
- **Radix `RadioGroup` / `Checkbox`.** Rejected. That would add a dependency for behaviour the native inputs already provide. The CLAUDE.md Radix rule covers a11y behaviour BDS would otherwise hand-write, and native inputs mean nothing is hand-written.

## Consequences

### Positive

- Pick-one and pick-many groups expose a labelled group and a radio-vs-checkbox role, which `aria-pressed` cannot.
- Keyboard behaviour in a group comes from the browser: one Tab stop for radios, arrow keys to move.
- `Button`'s `selected` gains the ARIA consumers were adding by hand.

### Negative

- An item's root element changes from `<button>` to `<label>` inside a group. A consumer that styles or queries `button.bds-interactive-list-item` inside a group would break. The item's `ref` type widens.
- A pick-one-with-clear consumer has to add a "None" option, which is a visible change on that surface.
- The portal call sites have to move into a `RadioGroup` / `CheckboxGroup` to get the new semantics. Each one is a separate consumer change.

### Neutral

- The selected visual tokens and the row-vs-tile CSS are unchanged.

## Migration (AC2 of #1456, if accepted)

1. Add a group context and a shared hook to `RadioGroup` / `CheckboxGroup`, and make `InteractiveListItem` and `SelectableMediaTile` group-aware. Reference story: a pick-one `SelectableMediaTile` gallery inside `RadioGroup`, with a `play` test covering Tab entry, arrow keys and `aria-checked`.
2. `Button`: `selected` defaults to `undefined` and sets `aria-pressed` when defined. `CompletionToggle`: fixed `aria-label`.
3. Portal: move the 6 call sites listed above into the groups, and drop the hand-added `aria-pressed` and the state-dependent labels.
