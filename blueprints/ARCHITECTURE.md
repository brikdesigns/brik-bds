# Blueprint Library — Architecture

**Status:** Phase A (schema + bridges landed) · **Owner:** BDS · **Last reviewed:** 2026-04-18

The blueprint library is the single source of truth for named layout and interaction patterns used by the Brik mockup generation pipeline. BDS owns the canonical data; the portal `design_blueprints` Supabase table is a downstream cache seeded from this repo.

This document explains the *shape* of the library. The JSON data itself lands in Phase B.

---

## Why two taxonomies

The portal captures brand identity on three axes the client picks themselves:

- `Personality` (13) — what the brand *is*
- `Voice` (8) — how the brand *speaks*
- `VisualStyle` (11) — the aesthetic direction

Blueprints, by contrast, are tagged for *matching* — answering the question "which layouts fit this brand?" Historically that surface used two different tags:

- `moods` (11) — brand-feel tags (bold, trustworthy, energetic, …)
- `industries` (15) — vertical-fit tags (healthcare, real_estate, legal, …)

These are not synonyms. `Personality` is a *client pick*; `moods` is a *layout property*. Collapsing them into one vocabulary would either lose nuance (merging Personality + VisualStyle into `moods`) or force blueprint authors to hand-maintain redundant fields.

### The model

**Authors hand-write match tags (`moods`, `industries`). The library derives client-axis projections at load time.**

```
Authored:                       Derived (at load):
  moods: ['bold', 'luxury']  →  personality:  ['Bold', 'Luxury', 'Refined']
                             →  visual_style: ['Luxurious']

  industries: ['dental',     →  industry_slugs: ['dental']
               'universal']  →  is_universal:   true
```

Consumers query either axis. The projections are always kept consistent with the bridges because they are generated, not stored.

---

## The bridges

Defined in [`content-system/blueprints/bridges.ts`](../content-system/blueprints/bridges.ts).

### Mood → Personality

| Mood | Personality |
|---|---|
| `bold` | `Bold` |
| `minimal` | `Minimal` |
| `warm` | `Warm` |
| `corporate` | `Corporate` |
| `playful` | `Playful` |
| `luxury` | `Luxury`, `Refined` |
| `trustworthy` | `Trustworthy` |
| `energetic` | `Energetic` |
| `professional` | `Professional` |
| `modern` | `Modern` |
| `approachable` | `Approachable` |

`Trustworthy` and `Energetic` were added to `PERSONALITY_VALUES` on 2026-04-18 so every mood has a clean Personality target. They also unblock the client-picks axis for medical/legal/financial brands (Trustworthy) and active-lifestyle / youth-forward brands (Energetic).

### Mood → VisualStyle

| Mood | VisualStyle |
|---|---|
| `bold` | *(none)* |
| `minimal` | `Minimal` |
| `warm` | *(none)* |
| `corporate` | `Classic` |
| `playful` | `Playful` |
| `luxury` | `Luxurious` |
| `trustworthy` | *(none)* |
| `energetic` | `Colorful` |
| `professional` | *(none)* |
| `modern` | `Modern` |
| `approachable` | *(none)* |

Empty arrays are intentional — not every brand-feel has a visual correlate. The resolver should treat "no projected visual style" as "no visual-style constraint from this blueprint," not "visual-style mismatch."

### Industry tag → Industry pack slug

15 match tags collapse to 3 pack slugs per the small-business promotion policy in [`content-system/vocabularies/industry.ts`](../content-system/vocabularies/industry.ts):

- `dental` → `dental`
- `real_estate` → `real-estate-rv-mhc`
- all other tags → `small-business` (default)
- `universal` → sentinel (never triggers a pack lookup; see `is_universal`)

When Brik promotes a new industry pack (3+ active clients, or meaningful seasonality/regulation divergence), the mapping updates and a version bump ships.

---

## Schema at a glance

```typescript
interface Blueprint {
  // identity
  key: string;                      // "hero_split_60_40"
  name: string;                     // "Split Hero 60/40"
  section_type: SectionType;        // hero | nav | services | …

  // authored match fields
  moods: Mood[];
  industries: IndustryTag[];

  // v1 layout archetype
  layout_spec: string;
  css_hints?: string;
  html_snippet?: string;
  css_snippet?: string;

  // v2 interaction pattern (optional)
  pattern_type?: PatternType;       // carousel | scroll-reveal | …
  pattern_spec?: string;
  js_snippet?: string;

  // metadata
  source?: string;
  tier: 'internal' | 'template';
  is_active: boolean;
  version: string;                  // semver
  last_reviewed: string;            // YYYY-MM-DD
}
```

After `normalizeBlueprint()`, consumers see the same shape plus derived fields: `personality`, `visual_style`, `industry_slugs`, `is_universal`.

The full schema + dependency-free validator lives in [`content-system/blueprints/schema.ts`](../content-system/blueprints/schema.ts).

---

## v1 / v2 coexistence

The [Notion Blueprints and Templates doc](https://www.notion.so/Blueprints-and-Templates-33897d34ed2880b6a68bc794cc306e73) declares a pivot: blueprints are evolving from layout archetypes → reusable interaction patterns as the Paper-first workflow makes prose `layout_spec` redundant for new work.

The schema supports both states without a breakage:

- **v1 entries** carry `layout_spec` (required when no `pattern_spec` is present).
- **v2 entries** carry `pattern_spec` + `pattern_type` + `js_snippet`. The `layout_spec` is optional when the Paper artboard supplies the layout.
- Blueprints may carry both. A hero blueprint with a custom carousel interaction would populate `layout_spec` *and* `pattern_spec`, `pattern_type: 'carousel'`, `js_snippet: '…'`.

The validator rejects blueprints with neither `layout_spec` nor `pattern_spec` — an entry that describes nothing is a mistake.

---

## Data flow

```
                 ┌──────────────────────────────────┐
                 │  brik-bds/blueprints/            │
                 │    blueprint-library.json        │  ← authored (BDS owns)
                 │    ARCHITECTURE.md               │
                 └──────────────┬───────────────────┘
                                │
                   @brikdesigns/bds/blueprints
                                │
        ┌───────────────────────┴───────────────────────┐
        ▼                                               ▼
┌──────────────────────────┐              ┌──────────────────────────┐
│  portal Supabase         │              │  direct TS consumers     │
│  design_blueprints table │              │  (brik-bds/brikdesigns,  │
│  (seeded from JSON via   │              │   mockup workers, etc.)  │
│   new migration)         │              │                          │
└──────────────────────────┘              └──────────────────────────┘
```

- **BDS is upstream.** The JSON is authored here, reviewed here, versioned here.
- **Portal seeds from JSON.** A migration (Phase B) replaces the existing 00080/00081 seed logic with a data load from `@brikdesigns/bds/blueprints`.
- **No reverse syncs.** Blueprint edits in the portal admin (if they stay) must be treated as drafts; landed changes flow back through a BDS PR.

---

## Phase plan

| Phase | Scope | Status |
|---|---|---|
| A | Schema + bridges + vocabularies + ARCHITECTURE.md | ✓ Landed 2026-04-18 |
| B | Port 25 blueprints from `design_blueprints` migrations → `blueprint-library.json`; validator CLI wired into `npm run validate`; `./blueprints` subpath export + publish `@brikdesigns/bds@0.9.0`; portal migration that seeds from BDS JSON; sync consumers | ✓ Landed 2026-04-18 |
| C | Add `resolveBlueprintShortlist(profile)` helper; update 3 Notion docs to declare BDS canonical | Pending |
| D (future) | Begin populating v2 interaction-pattern fields as Paper-first builds capture reusable effects | Ongoing |

---

## Rules

1. **Never hand-author projection fields.** `personality`, `visual_style`, `industry_slugs`, `is_universal` are derived. The validator fails the library if these appear in source JSON.
2. **Bridge edits are a minor version bump.** Changing `MOOD_TO_PERSONALITY` silently reshuffles every client's shortlist — treat it like a public API change.
3. **Authored blueprints use lowercase taxonomies** (`moods`, `industries`). Client-axis values are Title Case (`Personality`, `VisualStyle`). Do not mix.
4. **`universal` is a sentinel, not a pack.** It should always pass through the shortlist regardless of the client's `industry_slug` — enforced via `is_universal` on normalized entries.
5. **Quarterly review cadence.** Bump `last_reviewed` on each confirmed-still-accurate pass; bump `version` when blueprints are added, removed, or materially edited.
6. **One concern per PR.** Bridge edits, schema evolutions, and data additions are separate PRs so rollbacks stay surgical.
