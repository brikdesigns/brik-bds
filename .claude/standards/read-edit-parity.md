---
name: Read/edit parity standard (BDS)
description: Canonical rules for keeping a read (view) surface and its edit surface in sync for the same entity — field order, component mapping, color semantics, no redundant capture.
type: reference
scope: brik-bds
applies-to: consumer-repo read/edit page pairs (e.g. brik-client-portal settings-*-read-page.tsx / settings-*-edit-page.tsx) — advisory today, no BDS-side lint
retrieved-via: brik-rag query "read edit parity standard"
last-verified: 2026-08-12
---

# Read/edit parity standard (BDS)

Rules for keeping a **read (view) surface** and its **edit surface** in sync when both render the same entity. Source of truth lives in this file (git-tracked); agents retrieve via `brik-rag query "read edit parity standard"`.

**Scope / enforcement:** this file is the ruleset only. It ships **advisory** — there is no BDS lint and no auto-fire skill trigger yet. Both the skill trigger (on portal read/edit page paths) and the parity lint gate are tracked separately in [brik-client-portal#3084](https://github.com/brikdesigns/brik-client-portal/issues/3084) (Batch 4). Do not claim CI enforcement for this rule set until that lands.

**Worked example:** [brik-client-portal#3085](https://github.com/brikdesigns/brik-client-portal/pull/3085) (merged) — `src/components/settings-service-line-read-page.tsx`, `settings-service-line-edit-page.tsx`, `src/components/sheets/settings-service-line-sheet.tsx`.

## 1. Order + grouping parity

The read view presents the same fields, in the same sections, in the same order as the edit view. A field grouped under an edit `Section` appears under the matching read `DataSection`, not scattered into an unrelated group.

**Why:** a reader who edits a field expects to find it in the same place when they go back to look at it — a field that moves sections between modes reads as a different field.

```tsx
// ✅ #3085 — edit page groups the taxonomy field under "Color & Tag"
<Section title="Color & Tag">
  <FormField label="Service tag category">
    <ServiceTagPicker value={...} onChange={...} />
  </FormField>
</Section>

// ✅ #3085 — read page adds a matching "Color & Tag" DataSection in the same position
<DataSection title="Color & Tag">
  <Field label="Service tag category">
    <ServiceTag category={line.service_tag_category} variant="text" size="sm" />
  </Field>
</DataSection>

// ❌ before #3085 — the field was buried inside "Identity", a different
// section, in a different order than the edit page's "Color & Tag"
```

## 2. Component-mapping parity

A value rendered with a semantic/colored component in edit renders with the **same component family** in read. A value chosen via a colored `ServiceTagPicker` displays as a colored `ServiceTag` in read — never downgraded to a neutral `Tag`.

**Why:** downgrading the component silently drops the signal (color, icon, semantics) the edit surface already committed to — the read view under-informs relative to what was actually saved.

```tsx
// ❌ before #3085 — read view downgrades to a neutral Tag
<Tag size="sm">{line.service_tag_category}</Tag>

// ✅ #3085 — read view matches the edit picker's component family
<ServiceTag category={line.service_tag_category} variant="text" size="sm" />
```

## 3. Color semantics — data color vs status

A color that encodes **taxonomy/identity data** (e.g. a service-line palette) renders as a labelled swatch/chip tied to that taxonomy. `Dot` is a **status** indicator — never repurpose it to render taxonomy data.

**Why:** `Dot` carries an implicit "system state" meaning (online/offline, healthy/degraded); readers pattern-match on it. Feeding it taxonomy data instead produces a false status read, and a fallback-on-stale-value bug becomes a silently wrong status rather than an obviously blank field.

```tsx
// ❌ before #3085 — a status Dot fed by serviceColor(color_token), which
// silently fell back to 'back-office' (orange) for stale values — an
// orange dot mislabelled "Yellow"
<Dot style={{ backgroundColor: serviceColor(line.color_token).bg }} />

// ✅ #3085 — removed; the taxonomy value renders via its own labelled
// component (ServiceTag), not a repurposed status Dot
```

## 4. No redundant capture

One field per taxonomy. Do not collect the same vocabulary through two different inputs/columns — if two fields resolve to the same allowed-value set, that is duplication and drift waiting to happen.

**Why:** two fields for one vocabulary means two write paths that can disagree, and a picker with no visible effect (the #3085 `color_token` field colored nothing) because a second field already owns the real behavior.

```
❌ before #3085 — service_lines.color_token and service_tag_category both
   held the same 5-value SERVICE_LINES taxonomy; color_token colored
   nothing.

✅ #3085 — color_token dropped (migration 00316), collapsing to the
   single service_tag_category field that actually drives ServiceTag color.
```

## When this standard updates

1. Edit this file (the source of truth)
2. Bump `last-verified` in frontmatter
3. Stage + commit — the pre-commit hook auto-ingests changed standards into brik-rag and updates `scripts/.standards-hashes` (brik-bds#744). CI verifies the hash matches on every PR.
4. Note the change in the PR description

No BDS skill auto-retrieves this file yet — the portal-side trigger is [brik-client-portal#3084](https://github.com/brikdesigns/brik-client-portal/issues/3084).
