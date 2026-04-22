# Layout Contexts

Typography and layout conventions per surface type. Consumers stop inventing per-sheet hierarchy; every page, sheet, form, and card reads the same.

Companion to [`COMPONENT-PATTERNS.md`](./COMPONENT-PATTERNS.md) and [`TOKEN-REFERENCE.md`](./TOKEN-REFERENCE.md). Every token referenced here is defined in [`tokens/figma-tokens.css`](../tokens/figma-tokens.css).

---

## Why this doc exists

BDS ships `<Sheet>`, `<SheetSection>`, `<Form>`, `<TextInput>`, and `<Select>`. It does not ship primitives for **field label**, **section heading**, or **field value** inside a sheet or form. Consumers wire their own — and every consumer picks a different size.

Result in the portal today (audit 2026-04-22):

- 21 of 31 sheets follow the onboarding-shared pattern; 9 are ad-hoc.
- At least one sheet renders field labels **larger** than the section heading — label-tier > heading-tier is an inversion that never reads as intended.
- Dividers between sheet sections compete with BDS's tight vertical rhythm.
- "Subtitle" styling gets applied to field-grouping labels like "Messaging" over CTA approved/rejected — blocks the grouping the heading tier is supposed to provide.

This doc defines four contexts, locks a typography tier to each, and names the primitives BDS will ship to enforce them.

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

**SheetSection today uses `--label-sm` uppercase.** That treatment conflicts with the rule above — it's a label tier masquerading as a heading. Section headings become `--heading-sm` (heading family, not uppercase) in the new primitives. The uppercase label-tier treatment survives only as an explicit "eyebrow" pattern, not as a section heading.

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
| Card eyebrow | `--label-xs` | label | semibold + uppercase | Optional — category, status label |
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

## Primitives BDS will ship to enforce this

These land in a follow-up PR (Stream D2/D3 of the intel-architecture plan). Listed here so consumers know what's coming and don't build duplicates.

### Sheet context

```
<SheetSectionTitle>     → enforces --heading-sm, heading family, semibold
<SheetFieldLabel>       → enforces --label-sm, label family, semibold
<SheetFieldValue>       → enforces --body-md, body family, regular
<SheetHelperText>       → enforces --label-xs, label family, regular
```

### Form context

```
<FormField>             → wraps label + input + helper with locked tiers
<FormFieldsetHeading>   → enforces --label-lg, label family, semibold
```

### Page context

```
<PageTitle>             → enforces --heading-xl
<PageSectionTitle>      → enforces --heading-md
<PageSubsectionTitle>   → enforces --heading-sm
<PageFieldLabel>        → enforces --label-md
<PageFieldValue>        → enforces --body-md
```

### Card context

Existing `<Card>` primitive extends with:

```
<CardTitle>             → enforces --heading-tiny
<CardEyebrow>           → enforces --label-xs + uppercase
<CardMetadata>          → paired label + value, locked tiers
```

Consumers that need custom typography fall back to passing a `className` with tokens — but the default of every primitive produces correct hierarchy without any consumer choice.

---

## Migration path for consumers

Once primitives ship:

1. **New sheets** use the primitives. No exceptions.
2. **Existing sheets** migrate in a planned pass (portal has 31 sheets — tracked as Stream D4 of the intel-architecture plan).
3. **Interim sheets** (those that need to ship before primitives land) follow the tier rules in this doc with inline token application. Consumer-side inline styling is a short-lived bridge.

Specifically for the portal `detail.*` style presets in `src/lib/styles.ts`:

- `detail.sectionHeading` → replaced by `<SheetSectionTitle>` or `<PageSectionTitle>`
- `detail.fieldHeading` → replaced by `<SheetFieldLabel>` or `<PageFieldLabel>`
- `detail.value` → replaced by `<SheetFieldValue>` or `<PageFieldValue>`

Portal's `styles.ts` presets stay functional during migration but don't get new consumers.

---

## Anti-patterns (observed in the wild)

Call these out explicitly — every one has been seen in a portal sheet review and each is a direct consequence of the doc not existing.

**Field label larger than section heading**
The inversion bug. Swap the tier assignments.

**Divider between sheet sections**
Remove. `--padding-xl` between sections does the job.

**"Messaging" subtitle wrapping CTA Approved + Rejected**
Remove the subtitle. Use `<SheetSectionTitle>CTA Language</SheetSectionTitle>` with Approved and Rejected as two field blocks underneath.

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
