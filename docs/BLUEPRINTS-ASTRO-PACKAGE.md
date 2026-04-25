# `@brikdesigns/bds/blueprints-astro` — Package Spec

**Status:** Phase C spec (Phase A schema + bridges landed, Phase B library data shipped, Phase C executes the Astro render surface) · **Owner:** BDS · **Last reviewed:** 2026-04-22 · **Target v0.1:** TBD · **Revision:** rev-C (architect cold-review + Nick's answers folded 2026-04-22)

This spec defines the Astro render surface the BDS Theming tenet has always pointed at but never shipped. It also defines the supporting vocabularies and portal task needed to run it end-to-end for a first client (Vale Partners) and scale to hundreds.

Reviewers: challenge any decision that leaks per-client code into client repos, adds a new DB table, extends a locked vocabulary with unvalidated values, or permits two architectures to coexist indefinitely.

---

## 1. Context

### 1.1 The BDS tenet + layer model (existing — not changing)

BDS is four tenets: **Foundation · Theming · Motion · Content**. Theming composes four orthogonal layers a client can override independently ([stories/theming/Overview.mdx](../stories/theming/Overview.mdx)):

| Layer | Decides | Lives in | Status |
|---|---|---|---|
| 1. Tokens | Color, type, spacing values | `theme-{client}.css` in the client Astro repo | Shipped |
| 2. Atmosphere | Ambient mood — grain, glow, vignettes | `@brikdesigns/bds/atmospheres/{slug}.css` | Shipped (7 variants) |
| 3. Navigation Archetype | Site-header shape + scroll + drawer | Planned: `<SiteHeader>` in `@brikdesigns/bds/blueprints-astro` | **Vocabulary shipped, render surface missing** |
| 4. Blueprint | Section composition | Planned: per-blueprint components in same package | **Library shipped (25 keys), render surface missing** |

Content (BCS) supplies the defaults: industry packs declare `navigationIA`, a default atmosphere, and blueprint affinity tags. `company_profiles` overrides any layer per client.

### 1.2 The four gaps this spec closes

1. **Layers 3 + 4 have no Astro render surface.** Storybook documents `<SiteHeader archetype={…}>` as forthcoming from `@brikdesigns/bds/blueprints-astro` ([stories/theming/NavigationArchetypes.mdx:24](../stories/theming/NavigationArchetypes.mdx)). Every new client hand-rolls its header until the package ships.
2. **No footer archetype vocabulary.** Intel entry #30 from Birdwell's post-mortem identifies 6 candidate variants. We will ship **3 locked values** (validated against a live client each), not 6.
3. **IndustryPack declares page archetypes but not compositions.** Packs say "a small-business site has a services-overview page" but do not declare which section blueprints compose it. That sequencing lives in designers' heads today.
4. **No portal task generates the client Astro repo.** The current Development phase of the pipeline is manual end-to-end. `project_live_site_push_gap.md` has flagged this gap for weeks.

### 1.3 Two architectures policy (explicit — do not skip)

Pre-spec client sites (Birdwell) are **self-contained** — `package.json` has only `astro` + `@astrojs/sitemap`, zero BDS dependency, and all styles/sections are hand-rolled in the client repo ([web/birdwell-mutlak/package.json](../../../web/birdwell-mutlak/package.json); [web/birdwell-mutlak/src/layouts/BaseLayout.astro:5-14](../../../web/birdwell-mutlak/src/layouts/BaseLayout.astro)). The spec introduces a second, BDS-dependent architecture for new clients. Both will coexist.

**Policy for coexistence:**

- **New client sites MUST adopt the BDS-dependent architecture** from day one (starting with Vale).
- **Pre-spec sites stay on the self-contained architecture** until they trigger a major redesign or an urgent bug fix that would be cheaper to resolve via BDS upgrade than per-repo patching. Opportunistic migration only — no mass retrofit.
- **BDS bug fixes propagate to new-architecture clients via `npm update`.** They do NOT reach pre-spec sites automatically — those still require per-repo patches. This is an acknowledged cost.
- **The "hundreds of client sites" scale target applies to the new architecture only.** Birdwell-class self-contained sites will always require bespoke work; we do not plan for N self-contained sites to scale.

Revisit this policy when N pre-spec sites > 5 OR when we hit a BDS bug that would have been free to propagate but cost M hours across pre-spec repos — whichever fires first.

### 1.4 Scale + performance constraints (non-negotiable)

- **Client site repos contain zero hand-rolled sections, pages, or patterns.** Every structural piece comes from `@brikdesigns/bds/blueprints-astro`. A new-architecture client repo holds only: portal-synced data, client-specific tokens, thin page wrappers, and a narrowly-scoped `client-overrides.css` escape hatch.
- **Bug fix to any blueprint = one PR in BDS + `npm update @brikdesigns/bds` in every new-architecture client.**
- **Vocabulary is extend-only after a value ships with a live client.** A blueprint key, nav archetype, footer archetype, or atmosphere slug that reaches production can never be renamed, only deprecated-then-removed across two minor versions with an alias.
- **Ship values only with proof.** Do not lock 6 footer variants on day 1 because designers dreamed them up. Ship 3 — one per real client or one per reference-design pattern with a named source — and extend as demand validates new values.
- **Zero client-side JS unless a blueprint is interactive.** Astro islands explicit. Performance budgets in §2.6 are measured, not asserted.

---

## 2. The package: `@brikdesigns/bds/blueprints-astro`

### 2.1 v0.1 scope — one complete page archetype, end-to-end

A small-business home page composed of 6 section blueprints, plus 2 generally-reusable interior blueprints, plus nav dispatcher. Chosen so Vale's first slice renders without any `<BlueprintFallback>` in output.

| Export | Count | Purpose |
|---|---|---|
| `<SiteHeader archetype={…}>` | 1 | Nav archetype dispatcher (5 archetypes, single component) |
| `<BlueprintDispatcher sections={…}>` | 1 | Section dispatcher |
| `<BlueprintFallback>` | 1 | Unknown-key renderer, emits `<!-- bp-unknown: {key} -->` for CI grep |
| Per-blueprint Astro components | **8** | `HeroSplit6040`, `StatsDarkBar`, `ServicesDetailTwoColumn`, `AboutStorySplit`, `TestimonialsFeaturedLarge`, `CtaSplitContact`, `CtaDarkCentered`, `HeroInteriorMinimal` |
| Type exports | 5 | `BlueprintKey`, `BlueprintSection`, `ClientFacts`, `ResolvedTheme`, `KnownBlueprintKey` |

**Why these 8 blueprints:** they cover Vale's home composition completely (hero → stats → services → about → testimonials → CTA) using moods that match Vale's resolved brand (professional, trustworthy, luxury where relevant). `HeroInteriorMinimal` + `CtaDarkCentered` cover every other page Vale needs in the first shippable slice (services, services detail, about, contact).

**Success criterion for v0.1:** Vale's site renders with zero `<BlueprintFallback>` activations and zero `<!-- bp-unknown:` comments in `dist/`. If v0.1 ships and Vale's first render shows fallbacks, v0.1 is incomplete.

**`<SiteFooter>` + 3 footer archetype components ship in v0.2.** Vale v0.1 uses a hand-rolled footer placeholder — one file, replaced with a single import swap at v0.2 cost.

The remaining 17 blueprints in `blueprint-library.json` land incrementally — driven by real client need, not speculative coverage. Each gets a Storybook preview (§2.9) and a Paper artboard link.

### 2.2 Consumption shape

Every new-architecture client page looks like this:

```astro
---
// web/{client}/src/pages/services.astro
import BaseLayout from '../layouts/BaseLayout.astro';
import { SiteHeader, BlueprintDispatcher } from '@brikdesigns/bds/blueprints-astro';
import { getPageComposition } from '../data/compositions';  // portal-synced (§4)
import { getClientFacts } from '../data/client';             // portal-synced
import { getResolvedTheme } from '../data/theme';            // portal-synced
const page = getPageComposition('services');
const clientFacts = getClientFacts();
const theme = getResolvedTheme();
---
<BaseLayout title={page.title}>
  <SiteHeader archetype={theme.navigationArchetype} clientFacts={clientFacts} />
  <main id="main-content">
    <BlueprintDispatcher sections={page.sections} clientFacts={clientFacts} theme={theme} />
  </main>
  <!-- v0.1: hand-rolled footer placeholder. v0.2: <SiteFooter archetype={theme.footerArchetype} ...> -->
</BaseLayout>
```

`getPageComposition('services')` returns `page.sections: BlueprintSection[]` — an array of sections already resolved to blueprint keys by the portal's scaffold task (§5). The client repo does not import specific blueprints, does not assign blueprint keys, does not compose sections.

### 2.3 Component contract (applies to every blueprint — no exceptions)

All 25 blueprints conform to one prop shape. Dispatcher is trivial and stable.

```ts
export interface BlueprintProps {
  /** Typed section — content fields + visualNotes already resolved by the scaffold task. */
  section: BlueprintSection;
  /** Per-client facts: brand name, contact, assets, hours, services, etc. */
  clientFacts: ClientFacts;
  /** Resolved theming decisions: theme_mode, atmosphere, archetypes, tokens metadata. */
  theme: ResolvedTheme;
}
```

Dispatcher:

```astro
---
import type { BlueprintSection, ClientFacts, ResolvedTheme } from './types';
import HeroSplit6040 from './blueprints/HeroSplit6040.astro';
// ... 7 more imports ...
import BlueprintFallback from './blueprints/BlueprintFallback.astro';
const BLUEPRINT_REGISTRY = {
  hero_split_60_40: HeroSplit6040,
  stats_dark_bar: StatsDarkBar,
  services_detail_two_column: ServicesDetailTwoColumn,
  about_story_split: AboutStorySplit,
  testimonials_featured_large: TestimonialsFeaturedLarge,
  cta_split_contact: CtaSplitContact,
  cta_dark_centered: CtaDarkCentered,
  hero_interior_minimal: HeroInteriorMinimal,
} as const;
export type KnownBlueprintKey = keyof typeof BLUEPRINT_REGISTRY;
interface Props { sections: BlueprintSection[]; clientFacts: ClientFacts; theme: ResolvedTheme; }
const { sections, clientFacts, theme } = Astro.props;
---
{sections.map((section) => {
  const key = section.visualNotes?.blueprintKey;
  const Component = (key && key in BLUEPRINT_REGISTRY)
    ? BLUEPRINT_REGISTRY[key as KnownBlueprintKey]
    : BlueprintFallback;
  return <Component section={section} clientFacts={clientFacts} theme={theme} />;
})}
```

### 2.4 Non-hallucinatable content — preflight is primary, CI grep is defense-in-depth

Birdwell intel entry #18 documented automated content gen inventing plausible-but-wrong client facts (membership pricing, hours, doctor names). Rule: **per-client facts are non-hallucinatable.** The preflight below replaces the CI-grep-as-primary-gate approach that would cascade red builds across 100 clients every time a portal admin transiently cleared a field.

**Mechanism:** each blueprint declares its required client facts in `blueprint-library.json`:

```jsonc
{
  "key": "hero_split_60_40",
  "section_type": "hero",
  "required_facts": ["hero_image_url", "primary_cta_label", "primary_cta_url"],
  // ... existing fields (moods, industries, layout_spec, css_hints) ...
}
```

The portal's `dev_scaffold_site` task preflights the content bundle against this registry **before** generating the client repo. If `clientFacts.hero_image_url` is missing for a page that uses `hero_split_60_40`, the task fails with a structured error naming the missing field + linking to the portal edit URL. The client repo is never generated in a broken state.

**Defense-in-depth:** every blueprint ALSO renders a `data-content-needed="{field}"` stub if a required fact somehow arrives null at render time. CI greps built `dist/` for `data-content-needed=` and blocks publish. This is a belt + suspenders — preflight should catch everything, grep catches regressions.

### 2.5 Accessibility contract

- Every blueprint meets WCAG 2.1 AA. Portal's compliance profile sets this floor (ADA Title III applies to the portal itself; healthcare clients bring additional HIPAA/§1557 obligations — those affect content rules, not blueprint variants).
- `axe-core` runs in CI on both BDS Storybook (per-blueprint isolation) and every client repo's built `dist/`. Blocks merge on any AA violation.
- Heading hierarchy: one `<h1>` per page, owned by the hero blueprint. Other blueprints start at `<h2>`.
- `:focus-visible` + gap-fill token `--color-focus-ring`. No `outline: none` without replacement.
- `prefers-reduced-motion: reduce` honored — every animated blueprint has a static fallback.
- **Skip-link ownership: the site layout `BaseLayout.astro` owns the skip-link**, not `<SiteHeader>`. This avoids the double-rendered skip-link Birdwell has today. `<SiteHeader>` only handles the nav. The scaffold task templates `BaseLayout.astro` with the skip-link built in.

### 2.6 Performance contract — measured budgets, not asserted

- **CSS budget target:** ≤ 65KB gzipped before atmosphere; atmosphere adds ≤ 5KB. Measured at CI time via `scripts/css-budget.mjs` in the client repo. Budget grows ≤ 3KB per minor BDS version without a spec update.
- **JS budget target:** 0KB on pages with no interactive blueprints. ≤ 8KB gzipped per interactive blueprint (accordion, carousel, form validator). Measured the same way.
- **Astro islands policy:**
  - Static content: pure SSR, no hydration.
  - Interactive-on-scroll (`faq_accordion_grouped`, `testimonials_featured_large` carousel): `client:visible`.
  - Interactive above the fold (`nav_sticky_blur` scroll listener, mobile nav toggle): `client:load`.
  - Never `client:only`.
- **Images:** `<Image>` from `astro:assets` for local; client-supplied hero uses `loading="eager"` + explicit width/height; interior uses `loading="lazy"`. Zero CLS tolerance.
- **Fonts:** clients bring their own (Google Fonts or self-hosted WOFF2) via `theme-{client}.css` `@import`. BDS atmospheres load no fonts.

Target Lighthouse: performance ≥ 90 on every shipped page at mobile + desktop. A blueprint that drops a client's page below 90 blocks the v0.x release.

### 2.7 `package.json` exports — verified resolution

Current package.json shape ([package.json:8-32](../package.json)):

```jsonc
{
  "types": "./dist/lib-entry.d.ts",
  "files": ["dist", "blueprints/blueprint-library.json", "content-system/compliance/*.md", "content-system/atmospheres/*.css"],
  "exports": {
    ".": { "types": "./dist/lib-entry.d.ts", "import": "./dist/index.esm.js", "require": "./dist/index.cjs.js" },
    "./content-system": { "types": "./dist/content-system/index.d.ts", "import": "./dist/content-system/index.js" },
    // ... per-atmosphere CSS entries ...
  }
}
```

**Proposed additions for blueprints-astro:**

```jsonc
{
  "files": [
    "dist",
    "blueprints/blueprint-library.json",
    "content-system/compliance/*.md",
    "content-system/atmospheres/*.css",
    "content-system/blueprints/astro/**/*.astro",    // NEW
    "content-system/blueprints/astro/**/*.ts",       // NEW (re-export barrel)
    "content-system/blueprints/astro/**/*.d.ts"      // NEW (types for barrel)
  ],
  "exports": {
    // ... existing ...
    "./blueprints-astro": {
      "types": "./content-system/blueprints/astro/index.d.ts",
      "import": "./content-system/blueprints/astro/index.ts",
      "default": "./content-system/blueprints/astro/index.ts"
    },
    "./blueprints-astro/*": "./content-system/blueprints/astro/*"
  }
}
```

Uses standard `import` + `default` conditions only. No custom `"astro"` condition (prior draft's approach was non-standard — Astro does not set a custom condition; it resolves via `import`). The subpath pattern `"./blueprints-astro/*"` gives explicit fallback access to any file under the folder if consumers need it.

The barrel `content-system/blueprints/astro/index.ts`:

```ts
// index.ts (plain TS — Astro consumers resolve via import condition)
export { default as SiteHeader }            from './SiteHeader.astro';
export { default as BlueprintDispatcher }   from './BlueprintDispatcher.astro';
export { default as BlueprintFallback }     from './BlueprintFallback.astro';
export { default as HeroSplit6040 }         from './blueprints/HeroSplit6040.astro';
// ... 7 more ...
export type { BlueprintProps, BlueprintSection, ClientFacts, ResolvedTheme, KnownBlueprintKey } from './types';
```

**Verification is prerequisite to first implementation PR:** a 10-line scratch Astro project `install`s `@brikdesigns/bds@task/blueprints-astro-spec` from the BDS worktree and imports `SiteHeader`. If resolution fails, fix the exports before shipping even one blueprint component.

### 2.8 Versioning + maintenance at scale

- **Semver.** Adding a blueprint/archetype/vocabulary = minor. Changing a blueprint's props shape = MAJOR. Changing a CSS custom property name a client can override = MAJOR.
- **Deprecation cycle.** Blueprint key marked `is_active: false` continues rendering for one minor version, warns in dev for one more, removed in next major.
- **`peerDependencies.astro: ">=5"`.** Blueprints use Astro 5 features (astro:assets image types). Client repos on Astro 4 must either upgrade or pin an older BDS.
- **Dependabot at 100 clients is unworkable if left to default per-repo.** Policy:
  - Client repos pin `@brikdesigns/bds` to exact version.
  - Dependabot is **disabled** on BDS version updates in client repos (other deps still auto-PR).
  - Quarterly centralized upgrade: portal admin runs `scripts/bulk-bds-upgrade.mts` (new, portal-side) which iterates all new-architecture client repos, updates the pinned version, runs each repo's CI locally, opens one PR per client, batches merges after visual regression pass.
  - Out-of-band urgent upgrades (security, breaking bug) use the same script with `--urgent` flag.
- **Rollback:** every `dev_scaffold_site` run records the BDS version it pinned in `tasks.metadata.bds_version`. Rollback = re-run `dev_scaffold_site` with `--bds-version={prior}`. Portal's state ledger (PR #426) tracks this as a first-class operation.

### 2.9 Storybook coverage — Astro in a React host

Storybook natively renders React. `.astro` files don't render in-host. Options considered:

- `@storybook/addon-astro` — exists, alpha-ish, adds compile step; **deferred** until stable.
- **Chosen for v0.1:** each blueprint ships a `.stories.tsx` that renders an `<iframe>` pointing at a dev-built HTML preview of the blueprint. The preview is generated by `scripts/build-blueprint-previews.mjs` (new) which runs on Storybook build and emits `dist-previews/{blueprint-key}/index.html` — one per blueprint, rendered against fixture `clientFacts` + `theme`.
- This mirrors the `<AtmospherePreview cssHref={…}>` pattern already in use at [stories/theming/Atmospheres.mdx](../stories/theming/Atmospheres.mdx) — per-atmosphere iframed CSS preview.
- Every blueprint story also shows: the layout spec, css hints, required facts, moods, industries, and a link to the Paper artboard (§Appendix A — provenance rule).

When `@storybook/addon-astro` stabilizes, graduate to in-host rendering. Until then, iframed preview is acceptable and consistent with existing patterns.

---

## 3. Footer archetype vocabulary (v0.2)

Mirrors nav archetype exactly. **Ships vocabulary with v0.1** (so industry packs can declare `footerArchetype` immediately even though the render surface arrives in v0.2).

**Location:** `content-system/vocabularies/footer-archetype.ts`

**Locked values for v0.1 vocabulary (3, not 6):**

```ts
export const FOOTER_ARCHETYPE_VALUES = [
  'four_col_directory',       // informative — brand · directory · secondary · visit
  'cta_focused',              // closing CTA + minimal nav
  'legal_heavy',              // regulated (healthcare/legal) — prominent HIPAA/privacy stack
] as const;
export type FooterArchetype = (typeof FOOTER_ARCHETYPE_VALUES)[number];
```

The 3 unshipped variants from intel #30 (`minimal_centered`, `newsletter_lead`, `local_biz_hours_forward`) land when a real client validates each. Shipping 6 on day 1 would lock taxonomy to designer imagination — that's the scale trap the review flagged.

**IndustryPack extension:** optional `footerArchetype: FooterArchetype` field, parallel to `navigationIA`.

**Resolver precedence (same as nav):** client override > pack default > `'four_col_directory'`.

**`company_profiles` schema:** one new nullable text column `footer_archetype text` validated against `FOOTER_ARCHETYPE_VALUES` in PATCH zod. Symmetric with `theme_mode`, `atmosphere`, and `nav_archetype` (which this spec also adds — see §8).

---

## 4. `pageCompositions` on IndustryPack

### 4.1 Source-of-truth decision (explicit — the prior draft was ambiguous)

**The industry pack owns composition. The content generator owns content.** One source of truth for "which blueprint goes in which slot on which page type."

Specifically:

- `pack.pageCompositions[pageType].sections: BlueprintKey[]` = the sequence of blueprints that MAKE UP a page of that type. Stable, pack-level decision.
- Content generation emits per-page content keyed by slot index (matches the pack's sequence), not by blueprint key.
- `visualNotes.blueprintKey` emitted by content workers is retained as a **drift-detection hint**: if the content generator thinks the blueprint should differ from what the pack declares, the scaffold task logs the divergence for review. The pack's decision wins at render time.

**Why pack wins:**

- Composition is an industry-level decision ("dental services-overview pages have hero + services grid + faq + cta, in that order"). Letting content gen reshuffle per run means every client drift is silent and unreviewable.
- Scale: at 100 clients, content-driven composition = 100 × content_run drift surfaces. Pack-driven = one decision per vertical.
- Debuggability: "why does Vale's services page look different from Acme's services page?" is answerable via pack override vs. pack default. Under content-driven composition it's answerable only via diff of generated content.

**Rejected alternative:** content generator assigns `visualNotes.blueprintKey` per section, scaffold honors content's choice, pack is advisory. Rejected because it trades a stable architectural decision for a volatile content-gen output. If designers want to evolve compositions, they edit the pack — that's a reviewable, version-controlled change.

### 4.2 Schema

```ts
export interface PageComposition {
  /** Page archetype slug — must match an entry in pageArchetypes. */
  pageArchetype: string;
  /** Ordered list of section blueprint keys. Every key must exist in blueprint-library.json. */
  sections: BlueprintKey[];
  /** Optional per-page overrides (rare — e.g., landing page uses different nav). */
  navArchetype?: NavArchetype;
  footerArchetype?: FooterArchetype;
}

export interface IndustryPack {
  // ... existing fields ...
  pageCompositions?: Record<string, PageComposition>;   // keyed by page type slug
}
```

### 4.3 Example — small-business pack (used by Vale)

```ts
// content-system/industries/small-business.ts (excerpt)
export const smallBusiness: IndustryPack = {
  // ... existing fields ...
  pageCompositions: {
    home: {
      pageArchetype: 'home',
      sections: [
        'hero_split_60_40',
        'stats_dark_bar',
        'services_detail_two_column',
        'about_story_split',
        'testimonials_featured_large',
        'cta_split_contact',
      ],
    },
    services_overview: {
      pageArchetype: 'services',
      sections: ['hero_interior_minimal', 'services_detail_two_column', 'cta_dark_centered'],
    },
    service_detail: {
      pageArchetype: 'service-detail',
      sections: ['hero_interior_minimal', 'about_story_split', 'cta_dark_centered'],
    },
    about: {
      pageArchetype: 'about',
      sections: ['hero_interior_minimal', 'about_story_split', 'stats_dark_bar', 'cta_dark_centered'],
    },
    contact: {
      pageArchetype: 'contact',
      sections: ['hero_interior_minimal', 'cta_split_contact'],
    },
  },
};
```

Every blueprint key above is in v0.1's 8-component set. Vale's five-page first slice renders zero fallbacks.

### 4.4 Client override (JSONB, not a new table)

For rare clients whose composition must diverge from pack default:

```sql
ALTER TABLE company_profiles
  ADD COLUMN page_compositions jsonb NULL;
-- Shape: { "home": { "sections": ["hero_split_60_40", "..."] }, ... }
-- Zod-validated at PATCH time against BlueprintKey + NavArchetype + FooterArchetype enums.
```

**Resolver precedence per page:** client override > pack default > no-op (page renders content with whatever blueprintKey hints it carries; expected to be uncommon).

**Schema drift guard:** the same `profile-columns-sync.test.ts` drift guardrail that exists today covers this column. PATCH zod validation against BDS-exported enums prevents silent drift into freeform strings.

### 4.5 Drift detection

`dev_scaffold_site` compares:
- `pack.pageCompositions[pageType].sections[i]` (the authoritative key)
- vs. `content[pageType].sections[i].visualNotes.blueprintKey` (the content gen's hint)

For any mismatch, it writes a row to `enrichment_log` with `source='composition_drift'` so the team can see when content gen's picks diverge from pack. Drift is information, not a failure — but it surfaces trends ("the content generator keeps suggesting `features_3col_icon_grid` where the pack declares `services_detail_two_column`") that inform pack edits.

---

## 5. `dev_scaffold_site` portal task

### 5.1 Inputs

| Input | Source | Required |
|---|---|---|
| `company_id` | task param | Yes |
| Theme artifact URL | `tasks.metadata.theme_artifact_url` on completed `design_token_extraction` | Yes |
| Content bundle | Completed content sync — per-page sections with content per slot | Yes |
| Industry pack | `company_profiles.industry_slug` → `@brikdesigns/bds/content-system` getter | Yes |
| Archetype + composition overrides | `company_profiles.{atmosphere, theme_mode, nav_archetype, footer_archetype, page_compositions}` | Optional |
| Target repo | `company_profiles.github_repo` or create new `web/{client}` | Yes |
| BDS pin version | Latest stable published `@brikdesigns/bds` at task run time, overridable via param | Yes |

### 5.2 Preflight (runs before any file generation)

1. Resolve each page's composition (client override > pack default).
2. For every blueprint in every composition, look up `required_facts` in `blueprint-library.json`.
3. Validate `clientFacts` contains every required field non-null.
4. Any failure → task status `failed`, metadata contains `{ errors: [{ page, blueprint, missing_facts, portal_edit_url }] }`. No repo generated.

This is the primary gate. CI grep on `data-content-needed=` remains as defense-in-depth.

### 5.3 Outputs

New (or re-generated) Git repo at `web/{client}`:

- `package.json` pinning `@brikdesigns/bds` to the task's pin version. Only other deps: `astro`, `@astrojs/sitemap`, dev deps for CI.
- `src/data/compositions.ts` — resolved per-page compositions with full sections arrays.
- `src/data/client.ts` — client facts projected from `company_profile` columns.
- `src/data/theme.ts` — resolved theming decisions (archetype slugs, atmosphere slug, theme mode).
- `src/styles/theme-{client}.css` — fetched from Supabase Storage URL.
- `src/styles/client-overrides.css` — empty scaffold; per-client CSS escape hatch (§6).
- `src/layouts/BaseLayout.astro` — imports atmosphere CSS, declares skip-link + `<main id="main-content">`, wraps `<SiteHeader>` + slot + footer placeholder.
- `src/pages/**/*.astro` — one thin file per composed page. Body is `<BlueprintDispatcher sections={...}>` only.
- `.github/workflows/ci.yml` — typecheck + build + axe-core + blueprint-coverage + css-budget checks.
- `netlify.toml` — deploy hook.
- `.nvmrc`, `.editorconfig`, `.gitignore` — standard.

### 5.4 Idempotency

Re-running `dev_scaffold_site` produces a clean diff against regenerable files only. Opens a PR. Never force-pushes. `src/styles/client-overrides.css` is explicitly preserved (task never touches it). `src/data/*` files are regenerated from latest portal state.

### 5.5 Sequencing against existing Phase 04

Phase 04 currently has multiple manual tasks covering project setup, brand application, component check, nav wiring, homepage + interior page builds, legal pages, forms, SEO, analytics, review. Exact count + names to be audited during implementation PR (prior spec draft's "12 tasks" was wrong — actual shape is task-config's full registry, which doesn't use a `dev_` prefix convention uniformly).

**Shipping order:**

1. PR adds `dev_scaffold_site` as a **new** task. Existing manual tasks stay; admin UI can still create them for debugging.
2. First use: Vale. Prove end-to-end.
3. Follow-up PR marks the subsumed manual tasks `deprecated: true` (doesn't delete, admins can still create if needed).
4. Delete deprecated tasks after a second end-to-end proof run (Vale's second iteration or a second new-architecture client).

---

## 6. Override & customization model

### 6.1 What varies per client (surface)

- **Tokens** — `theme-{client}.css` (layer 1, required per client)
- **Atmosphere slug** — one of 7; pack default or override
- **Nav archetype slug** — one of 5
- **Footer archetype slug** — one of 3 (v0.1 vocabulary)
- **Composition** — pack default or JSONB override
- **Content + client facts** — portal-synced
- **Assets** — Supabase Storage

### 6.2 What does not vary per client (structure)

Blueprint components. Layout primitives. Nav markup. Footer markup. Animation patterns. Accessibility implementations. Scoped blueprint CSS. **No client repo reimplements any of these.**

### 6.3 `client-overrides.css` escape hatch — CI-gated, not review-gated

If a client genuinely needs a visual tweak that tokens + atmosphere cannot express, `src/styles/client-overrides.css` is the ONE file for it. Every rule MUST:

1. Reference a CSS custom property exposed by a blueprint (e.g., `--bp-hero-split-eyebrow-color`). Blueprints expose a documented, versioned set of these variables in their Storybook story.
2. Carry a comment on the preceding line: `/* BDS-ISSUE: <github-issue-url> */`.
3. CI grep check in each client repo: any rule in `client-overrides.css` without a preceding BDS-ISSUE comment fails the build.

This is the fix for the "monthly review" hand-wave in prior draft. At 100 clients nobody does monthly reviews. CI-gating makes the cost of a client override proportional: it must have a live GitHub issue tracking its graduation to a BDS-level fix.

**Deprecates `manual-overrides.css`** (Birdwell intel entry #17). Birdwell stays on its file until a future migration; new clients never generate `manual-overrides.css`.

---

## 7. Vale proof plan

### 7.1 Architectural resolution

Vale's live `company_profile` (staging, 2026-04-22) resolves to:

| Decision | Value | Source |
|---|---|---|
| Industry pack | `small-business` | `industry_slug`; no CRE pack yet |
| Theme mode | `dark` | `style_preferences: ['Dark', ...]` |
| Atmosphere | `editorial-luxury` | Dark + luxury auto-pair; overridable |
| Nav archetype | `editorial-transparent` | `small-business.navigationIA` default |
| Footer archetype | `four_col_directory` | Default; v0.2 ships render surface |
| Voice | `Direct` | `voice_tone` |

Vale does not need its own pack yet. Graduate to a `commercial-real-estate` pack when 2+ additional CRE clients land AND their page types diverge.

### 7.2 Shipped slice

| Surface | Scope |
|---|---|
| `@brikdesigns/bds/blueprints-astro` | v0.1 — `<SiteHeader>`, `<BlueprintDispatcher>`, `<BlueprintFallback>`, 8 blueprints |
| Vale company_profile | 1 override: `atmosphere = 'editorial-luxury'` |
| `small-business.pageCompositions` | Seeded for `home`, `services_overview`, `service_detail`, `about`, `contact` |
| Vale's Astro repo | New at `web/vale` (Webflow export archived to `web/vale-webflow-archive/`). Generated end-to-end by `dev_scaffold_site` |

### 7.3 Success criteria

- `dev_scaffold_site` preflight passes (all required facts present).
- Vale's CI pipeline passes: typecheck + build + axe-core (0 AA violations) + blueprint-coverage check (0 `<!-- bp-unknown:` in `dist/`) + css-budget check.
- `grep data-content-needed= dist/` returns 0.
- Lighthouse performance ≥ 90 on home, services, contact (mobile + desktop).
- Re-running `dev_scaffold_site` produces a no-op PR.
- `client-overrides.css` either empty or every rule has a linked BDS-ISSUE comment.
- Observability: BDS version pinned in Vale's `package.json` AND recorded in `tasks.metadata.bds_version` AND surfaced in the portal admin view for Vale.

### 7.4 Out of scope for v0.1

- Pages beyond home/services/services-detail/about/contact.
- `<SiteFooter>` render (v0.2).
- Paper → BDS bridge task (see Appendix A).
- Birdwell migration (see §1.3).

---

## 8. Data model decisions

### 8.1 Columns added (no new tables)

| Column | Table | Type | Validated against | Notes |
|---|---|---|---|---|
| `nav_archetype` | `company_profiles` | text nullable | `NAV_ARCHETYPE_VALUES` via PATCH zod | Optional override of pack default |
| `footer_archetype` | `company_profiles` | text nullable | `FOOTER_ARCHETYPE_VALUES` via PATCH zod | Optional override of pack default |
| `page_compositions` | `company_profiles` | jsonb nullable | Zod shape against BlueprintKey enum at write | Rare per-client composition override |

All three mirror the existing `atmosphere` + `theme_mode` pattern. Zero new tables.

### 8.2 What stays in BDS code (never DB)

IndustryPack (`pageCompositions`, `navigationIA`, `footerArchetype`, `pageArchetypes`). Blueprint library. Atmosphere CSS files. Every vocabulary (locked enums).

The portal's `design_blueprints` Supabase table remains a downstream cache seeded from BDS (migration 00114 pattern). Cache, not source of truth.

---

## 9. Deployment topology at scale

This section addresses concerns that matter only once the fleet exceeds single-digit clients.

### 9.1 Rollback

- Every `dev_scaffold_site` run records `{ bds_version, pack_version, scaffold_timestamp }` in `tasks.metadata.bds_version_snapshot`.
- Client repo's `package.json` pin is deterministic — no `^` or `~`.
- Rollback procedure: portal admin runs `dev_scaffold_site --bds-version=<prior>`. Task opens a PR reverting the pin. Visual regression check on Netlify preview. Merge if clean.
- If the broken BDS version has already propagated to N client sites, the bulk upgrade script (§2.8) runs with `--rollback-to=<version>` instead of the usual upgrade.

### 9.2 Observability — "is blueprint X broken on client Y?"

- Every client repo's CI writes a `dist/bds-manifest.json` file listing which blueprint keys the site uses + pinned BDS version. Netlify deploys publish this file at `/bds-manifest.json`.
- A new portal admin view (`/admin/infrastructure/client-sites`) queries each live site's manifest on a daily cron, surfaces: which clients use which blueprints, which pin which BDS version, last successful Netlify deploy timestamp.
- When BDS ships a bug fix for blueprint X, the admin view filters to "clients using X" and the bulk-upgrade script targets that set.

### 9.3 Dependabot posture + Netlify Pro capacity

**Dependabot:**

- **Client repos disable Dependabot on `@brikdesigns/bds`.** Other deps (astro, security patches) auto-PR as normal.
- BDS updates go through the centralized quarterly (or urgent) bulk upgrade described in §2.8.
- This decision revisits when N > 20 new-architecture clients OR when a BDS release cadence changes — whichever fires first.

**Netlify Pro capacity posture:**

The Pro plan caps at 500 sites / 3,000 build credits/month / 1TB bandwidth/site (site-level, not fleet-level). Current usage: 8/500 sites, 0/3000 credits (2026-04-16 audit per memory). The immediate risk is **build credits**, not the 500-site cap — a fleet of 100 clients pushing content-change rebuilds twice a week averages ~800 builds/month, eating a third of the credit budget before the quarterly bulk upgrade from §2.8 pushes ~100 more PRs in a short window.

Policy:

1. **Immediate:** no action — runway is measured in years at current pace.
2. **Instrument build credits per client.** Portal admin view (§9.2) adds a "builds this month / credits consumed" row per site. Any client burning >30 credits/month gets a review.
3. **Smart-skip rules in every generated client repo's `netlify.toml`:** path-based build filters (`[context.production.environment]` ignores doc-only changes), cached dependency install (Netlify default), `[skip ci]` honored on commit messages produced by portal sync workers.
4. **Active alternative evaluation at N=50 sites OR 2,000 credits/month sustained.** Options in the memo: Vercel Pro (unlimited sites, $20/seat), Cloudflare Pages (bigger free tier), AWS Amplify (pay-per-use, heavier ops). Don't wait for the cap to bind.
5. **Separate concern: DNS.** DNS lives at client registrars, scales independently of hosting. Switching hosting platforms does not require DNS migration for the client-facing domain — only the Netlify-owned preview domain is platform-locked.

### 9.4 Astro version floor

`peerDependencies.astro: ">=5"` declared in BDS. Client repos on Astro 4 cannot install this version of BDS. Upgrade-first policy: any client repo that needs a BDS update must upgrade Astro to 5 first. Scaffold task always pins Astro 5 in new client repos.

### 9.5 Two-architecture policy reminder

See §1.3. Pre-spec sites (Birdwell) are NOT part of this scale topology. They remain self-contained; BDS updates do not reach them automatically. Budget accordingly.

### 9.6 Compliance cascade

Blueprint components are **industry-neutral** — they don't carry healthcare-specific or legal-specific variants. Compliance applies via:

- **Content rules:** HIPAA-sensitive clients get additional `anti_messages` + `required_facts` per blueprint (e.g., legal footer archetype requires HIPAA Notice + Privacy Officer contact).
- **Pack-level choices:** a healthcare client's pack uses `footerArchetype: 'legal_heavy'`; the same blueprint component rendered with the legal-heavy variant handles the compliance rendering.
- **axe-core + contrast:** enforced regardless of compliance profile. Healthcare's higher bar (AAA where feasible) is a tightening, not a variant.

No separate "legal blueprint" or "healthcare blueprint" variants. Keeps the registry flat; reduces blast radius of changes.

### 9.7 Documentation publishing pathways

Three doc surfaces today, each backed by a distinct local source, publishing to a distinct URL:

| Local source | Publishes to | Audience | What belongs there |
|---|---|---|---|
| `brik-bds/stories/**/*.mdx` | `storybook.brikdesigns.com` | Designers + admins | Designer-facing reference — tokens, atmospheres, archetypes, blueprint catalog, components |
| `brik-client-portal/content/user-guide/*.mdx` | `[staging.]portal.brikdesigns.com/user-guide` | Clients | How clients use the portal (dashboard, services, profile, payments) |
| `brik-client-portal/content/admin-guide/*.mdx` | `[staging.]portal.brikdesigns.com/admin-guide` | Brik team (internal) | How Brik admins run the portal |
| `brik-client-portal/content/docs/*.mdx` | `[staging.]portal.brikdesigns.com/docs` | Portal engineering | Schema, API routes, integrations, migrations |

**Where this spec lives:** `brik-bds/docs/BLUEPRINTS-ASTRO-PACKAGE.md` — **repo-internal only**, not auto-published. Architecture contracts live on GitHub + the filesystem, referenced by human PRs, not browseable via a deployed doc site. This is intentional: specs describe intent and tradeoffs; published docs describe finished surfaces.

**What SHOULD publish once the package ships:**

1. **Consumer-facing blueprint catalog** → new Storybook story at [stories/theming/BlueprintsAstroPackage.mdx](../stories/theming/BlueprintsAstroPackage.mdx) → publishes to `storybook.brikdesigns.com/?path=/docs/theming-layers-blueprints--docs`. Lists exported components, their props, iframed previews per blueprint, Paper artboard links.
2. **Portal engineering reference for `dev_scaffold_site`** → new portal doc at [content/docs/site-scaffold-task.mdx](../../../product/brik-client-portal/content/docs/site-scaffold-task.mdx) → publishes to `staging.portal.brikdesigns.com/docs/site-scaffold-task`. Admin-facing: inputs, failure modes, how to re-run.
3. **This spec is referenced from Storybook, not duplicated.** [stories/theming/Overview.mdx](../stories/theming/Overview.mdx) gets a "Deep dive: Astro render surface" link pointing to the GitHub URL of this file. Low cost, high signal.

**Rule of thumb for future architectural docs:**

- Contract/spec/tradeoffs → BDS `docs/` (repo-only).
- Designer/admin/consumer reference → Storybook or portal `/docs` (published).
- Client-facing → portal `/user-guide` (published).

---

## 10. Review cadence & deprecation

Drift is the silent enemy of a shared design system at scale. Release reviews catch shipping bugs. A quarterly cadence catches what release reviews don't — and gives the fleet's immune system a regular, structured maintenance window.

### 10.1 What gets reviewed

| Artifact | Current count | `lastReviewed` field? |
|---|---|---|
| Blueprints | 25 | Yes, per-blueprint + library envelope |
| Atmospheres | 7 | Library envelope (add per-entry in this revision) |
| Nav archetypes | 5 | Pack-level `lastReviewed` via industry pack |
| Footer archetypes | 3 (v0.1 vocab) | Pack-level, same |
| Industry packs | 3 (dental, real-estate-rv-mhc, small-business) | Yes, `lastReviewed` + `reviewCadence: 'quarterly'` |
| Locked vocabularies | All (BlueprintKey, NavArchetype, FooterArchetype, Atmosphere, ThemeMode, etc.) | Not today — add to envelope |

### 10.2 Per-artifact review checklist (blueprints)

Each blueprint gets five checks:

| Check | What | Tool | Fails what |
|---|---|---|---|
| **1. Usage** | Who uses this blueprint? | `scripts/blueprint-usage-audit.mjs` (new) queries each live site's `/bds-manifest.json` | Zero usage for 2 consecutive quarters → start deprecation cycle |
| **2. Spec drift** | `layout_spec` + `css_hints` in JSON vs. shipped Astro component | Snapshot diff at review time | Drift → fix spec or component before merge |
| **3. Required-facts drift** | Fields in `required_facts` vs. real-incident log | Diff + review of any incidents that surfaced "missing X" or "over-required Y" | Under-required (incident caused) → add; over-required (never violated, noisy) → remove |
| **4. Paper artboard provenance** | Paper artboard visual vs. Storybook iframe preview | Human eye, `mcp__paper__get_screenshot` | Drift → Paper stays source of truth; update shipped code to match, OR migrate artboard to match and document why |
| **5. Quality regression** | axe-core + Lighthouse + CSS-budget vs. release baseline | CI artifact diff | AA violation → hotfix PR; perf drop >10% → optimization PR |

### 10.3 Deprecation cycle

Matches §2.8 versioning policy:

1. Blueprint with zero usage across 2 quarters marked `is_active: false` in next minor release. Continues rendering.
2. Next minor: dev-mode console warning when rendered.
3. Next MAJOR: component removed from package; key removed from registry.

Short circuit available: a blueprint discovered to be broken (a11y violation, fundamental design flaw) skips straight to step 2 with a `deprecated_reason` field.

### 10.4 Cadence matrix

| Artifact | Review cadence | Reviewer |
|---|---|---|
| Blueprints | Quarterly | BDS maintainer |
| Atmospheres | Quarterly | BDS maintainer |
| Nav + footer archetypes | Quarterly (folded into pack review) | BDS maintainer |
| Industry packs | Quarterly (existing convention) | BDS maintainer + content owner |
| Locked vocabularies | On every extend/remove PR (not calendar-driven) | BDS maintainer |

One calendar quarter = one BDS PR per artifact family, closing in ~one day of focused work, with a summary comment on the PR: "N artifacts reviewed, M passed, K drifted, L deprecated." Skipping the quarterly review triggers an amber warning in the weekly fragility audit.

### 10.5 What the checklist looks like in practice

New file alongside this spec: `docs/BLUEPRINT-REVIEW-CHECKLIST.md` — a Markdown checklist template. First instance runs when the first blueprint release ships (not in this spec's PR). Same pattern for atmosphere/archetype/pack reviews.

---

## Appendix A — Known unknowns (to resolve during review)

1. **Vale Astro repo placement.** Confirm: new repo at `web/vale` with current Webflow export moved to `web/vale-webflow-archive/`. OR different placement.
2. **BDS version for v0.1 release.** Proposal: `v0.32.0` (minor, additive — new exports, new vocabulary, no breaking changes to existing exports). v1.0 stabilization waits for full 25-blueprint coverage + `<SiteFooter>`.
3. **Netlify site count budget.** Pro plan caps at 500 sites. 2026-04-16 memory shows 8/500 used. At hundreds of clients we outgrow Pro. Budget check before Vale's second scaffold run.
4. **Paper artboard provenance rule.** Propose: every new blueprint added from v0.1 onward MUST have a `paperArtboardId` in `blueprint-library.json`. Backfill for existing 25 blueprints is optional. Confirm.
5. **Blueprint library review cadence.** Current `last_reviewed: 2026-04-18`. Cadence not set. Propose: quarterly, same as industry packs.
6. **Admin UI for new columns.** `nav_archetype`, `footer_archetype`, `page_compositions` — do they get admin editing surfaces in v0.1, or read-only (pack defaults only) until v0.2? Proposal: read-only for v0.1 (Vale uses pack defaults + atmosphere override), admin UI ships with v0.2.

---

## Appendix B — Executor checklist (first implementation PR)

- [ ] **`dist/` cleanup PR landed FIRST** (blocker, not loose end) — `git rm --cached -r dist/` + commit so BDS primary main stops polluting worktrees. See [memory: feedback_bds_worktree_mandatory.md].
- [ ] `package.json` exports + files glob updated per §2.7 exact spec.
- [ ] Exports **verified via test install** in a scratch Astro 5 project BEFORE writing any blueprint component.
- [ ] `content-system/vocabularies/footer-archetype.ts` ships with 3 values per §3.
- [ ] `PageComposition` + `pageCompositions` added to IndustryPack interface per §4.2.
- [ ] `blueprint-library.json` schema extended with `required_facts: string[]` per §2.4.
- [ ] 8 `.astro` blueprint components written, each with tokens-only CSS, `data-content-needed` stubs, a11y contract.
- [ ] Each blueprint's Storybook story (iframed preview per §2.9) — with Paper artboard link.
- [ ] `axe-core` wired in BDS CI and client repo CI templates.
- [ ] Portal task `dev_scaffold_site` registered in `task-config.ts` with Zod output schema in `task-output-schemas.ts`.
- [ ] Portal migration adds `nav_archetype`, `footer_archetype`, `page_compositions` columns with PATCH zod.
- [ ] `client-overrides.css` CI grep + BDS-ISSUE comment rule live in client repo template.
- [ ] BDS version pinning + manifest emission live in client repo template.
- [ ] `docs/BLUEPRINT-REVIEW-CHECKLIST.md` authored and committed alongside first blueprint release (not this PR).
- [ ] `scripts/blueprint-usage-audit.mjs` stubbed with the query shape against `/bds-manifest.json` even if the fleet is N=1 on day 1 — ensures the quarterly review has tooling the moment it's due.

---

## Appendix C — Followup tracking (not part of this spec; each gets its own issue)

Moved out of the spec body per architect review — these are loose ends worth tracking but pollute the contract.

- BDS `dist/` untracking (elevated to blocker above).
- `competitor_candidates` interface drift → separate fragility audit.
- `confirmed_customer_facing_channels` audit log → separate issue.
- `paper_design_worker` intentional `in_progress` pattern → document in portal docs.
- Webflow reference audit across portal scripts (Nick 2026-04-22 directive).
- Birdwell migration (Phase D, deferred per §1.3).

---

*This spec is a pre-implementation design contract. Edits to it require a BDS PR review. Once executed, future changes go through the same review gate to prevent drift between the spec and the shipped package.*
