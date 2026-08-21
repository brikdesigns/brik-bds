# Layout Contexts

Typography and layout conventions per surface type. Consumers stop inventing per-sheet hierarchy; every page, sheet, form, and card reads the same.

Companion to [`.claude/standards/component-build.md`](../.claude/standards/component-build.md) and the canonical [Primitives](https://design.brikdesigns.com/docs/primitives) registry. Every token referenced here is defined in [`tokens/figma-tokens.css`](../tokens/figma-tokens.css).

---

## Why this doc exists

BDS ships `<Sheet>`, `<SheetSection>`, `<DataSection>`, `<FieldGrid>`, `<Field>`, `<Form>`, `<TextInput>`, and `<Select>` — every tier below is enforced by one of them. This doc exists because the *assignment* still has to be chosen: which tier belongs to which surface is a judgment call the components cannot make for you, and getting it wrong produced the inversions catalogued here.

The audit that prompted it (portal, 2026-04-22 — predates the primitives below):

- 21 of 31 sheets follow the onboarding-shared pattern; 9 are ad-hoc.
- At least one sheet renders field labels **larger** than the section heading — label-tier > heading-tier is an inversion that never reads as intended.
- Dividers between sheet sections compete with BDS's tight vertical rhythm.
- "Subtitle" styling gets applied to field-grouping labels like "Messaging" over CTA approved/rejected — blocks the grouping the heading tier is supposed to provide.

This doc defines four contexts, locks a typography tier to each, and names the shipped primitive that enforces each one.

---

## The four contexts

| Context | Where it appears | Example |
|---------|------------------|---------|
| **Page** | Full-route admin surface | `/admin/companies/[slug]` |
| **Sheet** | Side-panel overlay, read + edit | Company intel sheet, task action sheet |
| **Form** | Edit-primary flow (standalone or nested in a sheet/dialog) | Onboarding form, create-company form |
| **Card** | Compact summary inside a grid or list | Engagement card, company card |

Each context answers a different question: *how much horizontal space is there*, *is reading or editing primary*, *is this one entity or a grid of them*. Typography tier follows that answer.

---

## Typography tier per context

All sizes are semantic tokens — never raw values. All families are the canonical token families from [`tokens/figma-tokens.css`](../tokens/figma-tokens.css). Weights follow the existing `--font-weight-*` scale.

### Page

Full horizontal space, reading and editing both common, may contain multiple sheets/cards within it.

| Tier | Token | Family | Weight | When |
|------|-------|--------|--------|------|
| Page title | `--heading-xl` | heading | semibold | Top of route; one per page |
| Section title | `--heading-md` | heading | semibold | Major section anchor inside the page |
| Subsection title | `--heading-sm` | heading | semibold | Nested grouping below a section |
| Field label | `--label-md` | label | semibold | Above a value or input |
| Field value | `--body-md` | body | regular | Read-mode display |
| Helper / caption | `--label-sm` | label | regular | Secondary context under a field |
| Body paragraph | `--body-md` | body | regular | Prose blocks (rare on admin pages) |

**Two rows in this table are aspirational, not shipped.** `PageHeader` renders its `<h1>` at `--heading-lg` bold, not `--heading-xl` (`PageHeader.css:69-72`), and `DataSection` renders its title at `--heading-sm`, not `--heading-md` (`DataSection.css:46-49`). The component is the authority — build against what it renders. Reconciling the two is tracked in [#1971](https://github.com/brikdesigns/brik-bds/issues/1971); do not hand-restyle either to match this table.

### Sheet

Narrower than a page, denser, title + sections + fields. `<Sheet>` owns the title.

| Tier | Token | Family | Weight | When |
|------|-------|--------|--------|------|
| Sheet title | `--heading-md` | heading | semibold | **Rendered by `<Sheet>` — do not restyle** |
| Section heading | `--heading-sm` | heading | semibold | Top of each `<SheetSection>` |
| Field label | `--label-sm` | label | semibold | Above a value or input (always **smaller** than section heading) |
| Field value | `--body-md` | body | regular | Read-mode display |
| Helper / caption | `--label-xs` | label | regular | Secondary context, error text, hint |

**Key inversion to kill:** section heading uses `--heading-sm` (heading family); field label uses `--label-sm` (label family). Different families, different sizes — field label is always **smaller** than section heading. If a sheet's labels look bigger than its section headings, the label-tier / heading-tier assignment is swapped. Fix the assignment, not the size.

**`SheetSection` used to render `--label-sm` uppercase** — a label tier masquerading as a heading, which conflicts with the rule above. It is now `--heading-sm`, heading family, semibold, not uppercase (`SheetSection.css:20-27`). The uppercase label-tier treatment survives only as a context-specific styling of the `__subtitle` slot, never as a section heading. (BEM role is `__subtitle` per the [Naming Conventions canon](https://design.brikdesigns.com/docs/primitives/naming-conventions#subtitle) — "eyebrow" is a banned synonym.)

### Form

Edit-primary. Inputs dominate. Label weight carries more semantic load than in a read-only sheet.

| Tier | Token | Family | Weight | When |
|------|-------|--------|--------|------|
| Form title | `--heading-sm` | heading | semibold | **Rendered by `<Form>` — do not restyle** |
| Form description | `--body-sm` | body | regular | Rendered by `<Form>` |
| Fieldset heading | `--label-lg` | label | semibold | Grouping of related inputs (rare) |
| Field label | `--label-md` | label | semibold | Above an input (rendered by input component, don't duplicate) |
| Helper / error | `--label-sm` | label | regular | Under an input |

Field labels inside `<TextInput>` / `<Select>` / `<Checkbox>` are already the canonical form-field label — don't wrap them in additional label spans. If a field grouping needs a heading, use the fieldset tier (`--label-lg`), not a subtitle.

### Card

Compact summary of one entity, repeated in a grid. No section hierarchy — title, a couple of metadata fields, at most one action.

| Tier | Token | Family | Weight | When |
|------|-------|--------|--------|------|
| Card title | `--heading-tiny` | heading | semibold | Entity name or primary identifier |
| Card subtitle | `--label-xs` | label | semibold + uppercase | Optional — category, status label. BEM role: `__subtitle` ([canon](https://design.brikdesigns.com/docs/primitives/naming-conventions#subtitle)). The uppercase label-tier styling is a Card-context choice; the BEM name is the same `__subtitle` as PageHeader/Sheet/DataSection. |
| Metadata label | `--label-sm` | label | regular | "Created" / "Owner" / etc. |
| Metadata value | `--body-sm` | body | regular | Value beside a metadata label |
| Supporting text | `--body-sm` | body | regular | One-line description |

Cards don't use section headings. If a card needs sections, it's outgrown the context — promote to a sheet or page.

---

## Rules

These apply across all four contexts.

### 1. Label tier is always smaller than heading tier

Within a given context, a `--label-*` token must render smaller than the `--heading-*` token sitting above it. If the label looks bigger than the heading, the tiers are swapped — fix the assignment, not the size.

### 2. Heading family for headings; body family for labels and values

`--font-family-heading` applies only to `--heading-*` and `--display-*` tokens. `--font-family-label` applies to `--label-*`. `--font-family-body` applies to `--body-*`. **Never pair the heading family with a body-tier size** — this is already flagged as a BDS violation.

### 3. No dividers between sheet sections

Vertical spacing between sections does the work. `<SheetSection>` handles `--padding-xl` top + `--padding-lg` bottom — that's enough visual separation. A `<hr>` or `border-top` between sections is noise.

Dividers are still acceptable in two places:

- Between a sheet body and its footer (rendered by `<Sheet>` itself)
- Between major zones of a page that are conceptually distinct surfaces

### 4. Inputs stack single-column by default

Sheets: always single-column. The narrow width means paired inputs wrap poorly and the eye loses the label-to-input relationship.

Forms: two-column permitted only when fields pair semantically — first name + last name, start date + end date, city + state. Unrelated inputs never share a row.

Pages: two-column acceptable inside section grids where fields are independent.

### 5. No "subtitle" for field grouping

The `--font-family-subtitle` token exists for page-level subheads (below a page title). It is not a field-grouping mechanism. If fields like CTA Approved and CTA Rejected need a shared heading, use `--heading-sm` ("CTA Language"), not a subtitle. Subtitle styling applied to inline field groups is the pattern the CleanUp note flagged as breaking the Language / Approved / Rejected sandwich.

### 6. Section headings don't need a description line

If a section needs explanation, that's a sign the section name is too abstract. Rename the section. Description lines inside sheets compete with field labels for the reader's eye and almost always lose.

### 7. Title case for all headings, labels, and buttons

Per ecosystem rule. Never sentence case for UI text.

---

## Primitives that enforce this

The tiers above are enforced by **container-context primitives** — a small set of components that derive the tier from where they are rendered — not by a per-tier wrapper component. An earlier revision of this doc promised one wrapper per container × tier; that shape was **rejected** by [ADR-004](./adrs/ADR-004-component-bloat-guardrails.md)'s first guardrail, "Container-coupled typography is forbidden", because N containers × M tiers is N×M components. Container-context typography lands in tokens, props, and docs instead.

### What to reach for

| Need | Primitive | Tier it enforces |
|---|---|---|
| Page title | `PageHeader` | `--heading-lg` bold, via its own `<h1>` (`PageHeader.css:69-72`) |
| Page section heading + edit affordance | `DataSection` (`title`) | `--heading-sm` semibold (`DataSection.css:46-49`) |
| Sheet section heading | `SheetSection` (`heading`) | its own heading tier, `h3` by default |
| Field label + value, read mode | `Field` inside `FieldGrid` | `--label-md` on a page, `--label-sm` inside a `Sheet` body — derived from the container, no prop |
| Form title + description | `Form` | rendered by `Form`, do not restyle |
| Input label + helper + error | `TextInput` / `Select` / `Checkbox` | the input owns its own label; never wrap it |
| Card title, subtitle, metadata | `Card` with a `preset` (`control`, `summary`, `display`, `display-row`) | the preset locks the tiers |

`Field`'s label tier is the pattern to copy: the same component reads `--label-md` on a page and `--label-sm` in a sheet body, driven by the container, with no prop passed. Pass `tier` only to pin against the container.

### The collection surface

A filter bar, tab bar, or pagination row is a **Control**, not a heading tier — see [Composition Layers](https://design.brikdesigns.com/docs/build-standards/composition-layers) for the Control layer and the rule for choosing between a control bar and a section header.

---

## Migration path for consumers

The primitives are shipped, so there is no interim period. New surfaces use them directly.

1. **New sheets and pages** compose `PageHeader` / `DataSection` / `SheetSection` / `FieldGrid` / `Field`. No inline tier application.
2. **Existing surfaces** migrate as they are touched. Nothing is blocked waiting on BDS.

For the portal `detail.*` style presets in `src/lib/styles.ts`:

- `detail.sectionHeading` → `DataSection`'s `title` (page) or `SheetSection`'s `heading` (sheet)
- `detail.fieldHeading` → `Field`'s `label`
- `detail.value` → `Field`'s children

A `detail.*` preset still in use is a surface that has not been migrated, not a supported path. Don't add consumers.

---

## Anti-patterns (observed in the wild)

Call these out explicitly — every one has been seen in a portal sheet review and each is a direct consequence of the doc not existing.

**Field label larger than section heading**
The inversion bug. Swap the tier assignments.

**Divider between sheet sections**
Remove. `--padding-xl` between sections does the job.

**"Messaging" subtitle wrapping CTA Approved + Rejected**
Remove the subtitle. Use `<SheetSection heading="CTA Language">` with Approved and Rejected as two `<Field>`s underneath.

**Two-column input grid in a narrow sheet**
Collapse to single column. The sheet width doesn't support it.

**Heading family applied to a body-tier size**
Already a BDS violation. The lint catches it for CSS — watch inline React styles too.

**Bulleted list for naming conventions**
A naming-convention entry has a label and a description — that's a two-line stacked block, not a bullet. Stack the label over the description, spaced by `--gap-sm`.

---

## Appendix — current tokens referenced

From [`tokens/figma-tokens.css`](../tokens/figma-tokens.css):

**Heading**: `--heading-tiny`, `--heading-sm`, `--heading-md`, `--heading-lg`, `--heading-xl`, `--heading-xxl`, `--heading-huge`

**Display**: `--display-sm`, `--display-md`, `--display-lg`, `--display-xl`

**Label**: `--label-tiny`, `--label-xs`, `--label-sm`, `--label-md`, `--label-lg`, `--label-xl`

**Body**: `--body-tiny`, `--body-xs`, `--body-sm`, `--body-md`, `--body-lg`, `--body-xl`, `--body-huge`

**Family**: `--font-family-display`, `--font-family-heading`, `--font-family-label`, `--font-family-body`, `--font-family-subtitle`

**Weight**: `--font-weight-thin` (300) → `--font-weight-black` (900). Default `--font-weight-regular` (400); headings/labels default `--font-weight-semi-bold` (600).

**Padding / gap**: `--padding-tiny`, `--padding-xs`, `--padding-sm`, `--padding-md`, `--padding-lg`, `--padding-xl`, `--padding-huge`; `--gap-sm`, `--gap-md`, `--gap-lg`, `--gap-xl`.
