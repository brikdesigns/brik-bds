# ADR-037 — Astro is the canonical blueprint rail; the shipping blueprints are un-deprecated

**Status:** Accepted (2026-09-08)
**Date:** 2026-09-08
**Supersedes:** the unrecorded React-consolidation decision carried by [#580](https://github.com/brikdesigns/brik-bds/issues/580) / [#582](https://github.com/brikdesigns/brik-bds/issues/582) / [#583](https://github.com/brikdesigns/brik-bds/issues/583) / [#1197](https://github.com/brikdesigns/brik-bds/issues/1197) / [#1198](https://github.com/brikdesigns/brik-bds/issues/1198), to the extent that it deprecated blueprints with live consumers. Those issues' consolidation of the React blueprint families stands; their `@deprecated` marking of the Astro-shipping set does not.
**Superseded by:** —
**Owner:** Nick Stanerson
**Related:** [#2299](https://github.com/brikdesigns/brik-bds/issues/2299) (this ADR), [#2300](https://github.com/brikdesigns/brik-bds/issues/2300) (Welcome.mdx), [#2301](https://github.com/brikdesigns/brik-bds/issues/2301) (un-deprecation sweep), [#2302](https://github.com/brikdesigns/brik-bds/issues/2302) (Astro parity), [#2303](https://github.com/brikdesigns/brik-bds/issues/2303) (context-free keys + the gate), [#2304](https://github.com/brikdesigns/brik-bds/issues/2304) (parity lint), [#2305](https://github.com/brikdesigns/brik-bds/issues/2305) (`SupportPlan` → `CalloutPanel`), [#2306](https://github.com/brikdesigns/brik-bds/issues/2306) (ADR-006 `Blocks/` sweep), [ADR-006](./ADR-006-storybook-taxonomy-and-story-shape.md) (`Deprecated/` + `!manifest` semantics; the eight sanctioned top-levels), [ADR-021](./ADR-021-blueprint-section-shell.md) (blueprint section shell), [ADR-030](./ADR-030-naming-framework-not-adopted-migrate-consumers-onto-bds.md) §36-38 (the 5-layer composition model as accepted canon), [ADR-033](./ADR-033-naming-canon-one-word-per-concept.md) (one word per concept), [composition-layers.mdx](../../docs-site/content/docs/build-standards/composition-layers.mdx) (the 5-layer model)
**Pre-existing backlog this ADR governs** (found by a cross-repo duplicate scan, 2026-09-08 — not re-filed): [#2010](https://github.com/brikdesigns/brik-bds/issues/2010) (the Astro↔React parity restoration whose gate this ADR extends), [#2012](https://github.com/brikdesigns/brik-bds/issues/2012) (`stats_dark_bar` de-wired — §Enforcement's on-disk axis is its general case), [#2037](https://github.com/brikdesigns/brik-bds/issues/2037) (build `Split`/`Row`/`Stat`/`MediaBlock` — operator decided 2026-08-25 to make `composition-layers.mdx` true by building them, so §5's layer vocabulary is not to be edited to match what exists), [#872](https://github.com/brikdesigns/brik-bds/issues/872) (collection-index/article/FAQ Astro blueprints — net-new on the canonical rail, sequenced behind #2302), [#1583](https://github.com/brikdesigns/brik-bds/issues/1583) (Blocks-layer `ContentBlock`/`Prose`), [#974](https://github.com/brikdesigns/brik-bds/issues/974) (Astro sites off `bridge.css`), [brikdesigns#802](https://github.com/brikdesigns/brikdesigns/issues/802) (premise re-triaged by §2 — `HeroSplitImageCardOverlay` is no longer deprecated), [brik-client-portal#3063](https://github.com/brikdesigns/brik-client-portal/issues/3063) (Astro site-token bridge ownership), [brik-client-portal#2982](https://github.com/brikdesigns/brik-client-portal/issues/2982) (sibling gate: fail CI when a block type has no renderer arm)

## Context

BDS ships blueprints on two rails — `content-system/blueprints/react/` and `content-system/blueprints/astro/`. A consolidation program declared a set of React primitives canonical (`Hero`, `Cta`, `Features`, `About`, `HeroMediaCard`, `CardGrid`, `SupportPlan`) and marked the prior generation `@deprecated`, moving its Storybook stories to `Deprecated/` with `tags: ['!manifest']`.

That program ran on issues alone. `rg -l -e "580|582|583|1197|1198" docs/adrs/` returns no ADR establishing it — only ADR-023, ADR-030, ADR-033 and the index, none of which decide blueprint canonicity. No consumer check ran, and the parity gate that does exist cannot see the divergence it created (§ below).

### The deprecated rail is the rail carrying production

Measured 2026-09-08 with `rg` over `~/Documents/Github/web`, excluding `node_modules`, `dist`, `.git`:

| Client site | Stack | References to the ten `Deprecated/` blueprints |
|---|---|---|
| `birdwell-mutlak` | Astro | **49** |
| `vale-partners` | Astro | **31** |
| `treehouse-pediatric-dentistry` | Astro | **8** |
| `seniorhomeessentials` | Astro | 0 |
| `memphis-dental` | Astro | 0 |

Keys in live use: `cta_dark_centered`, `hero_split_60_40`, `about_story_split`, `services_detail_two_column`, `hero_interior_minimal`, `cta_split_contact`. `vale-partners` additionally imports `ServicesDetailTwoColumn`, `HeroInteriorMinimal` and `CtaSplitContact` as components directly.

Three of these are published. `scripts/brand-guide-drift-check.ts:49,59,67` registers `vale-partners`, `birdwell-mutlak-dentistry` and `treehouse-pediatric-dentistry`, each `stack: 'astro'`.

The portal's scaffold generator emits these keys too: `src/lib/tasks/scaffold-templates.ts` contains `'services_3col_card_grid'`, and `src/__tests__/tasks/vale-scaffold-e2e.test.ts` asserts against real built HTML for `data-blueprint-key="hero_interior_minimal"`, `"services_detail_two_column"`, `"cta_dark_centered"`, `"about_story_split"` and `"card_grid"`.

### The `!manifest` tag hides the production vocabulary from agents

All ten story files carry `tags: ['!manifest']`. [ADR-006](./ADR-006-storybook-taxonomy-and-story-shape.md) §53 defines that category as "retained only for migration reference… Tagged `['!manifest']` so MCP discovery skips them."

So `bds-find` and the component manifest cannot see the blueprints that build every client site. An agent asked to build a client page queries BDS, finds only the React generics — which have **no Astro implementation** — and hand-rolls markup and CSS.

That cost is measurable in the Next.js consumer, where the same discovery failure applies: `brikdesigns` carries 2,915 lines of per-page bespoke CSS across `src/app/(marketing)/*/`, plus a 1,432-line `homepage.css`, and 12 of its last 25 merged PRs touched `.css` or `styles.ts`. Its homepage was built one section per PR across roughly ten PRs.

### The two rails have diverged, and the existing gate cannot see it

`comm` over the two blueprint directories:

- **React only:** `About`, `Cta`, `Features`, `Hero`, `HeroMediaCard`, `HeroMediaCardImage`, `HeroMediaCardPrice` — precisely the "canonical" generation.
- **Astro only:** `SiteHeader`, `StatsDarkBar`.

A parity gate does exist, and it is green. [`scripts/validate-blueprints.mjs`](../../scripts/validate-blueprints.mjs) runs in the `validate` chain and asserts three declaration sets against each other — the Astro dispatcher's `BLUEPRINT_REGISTRY` (`:206-237`), `WIRED_BLUEPRINT_KEYS` in `astro/types.ts`, and the `is_active: true` keys in `blueprint-library.json` — plus `validateRuntimeParity()` (`:251`) comparing the Astro and React dispatcher registries. It passed in this ADR's own PR run.

Its blind spot is the whole of this ADR's evidence: **it compares declarations to declarations, and never reads the filesystem or Storybook.** So a blueprint can sit on disk, be exported from `index.ts`, be `is_active: true`, and dispatch through neither runtime — and the gate stays green. [#2012](https://github.com/brikdesigns/brik-bds/issues/2012) is exactly that state for `stats_dark_bar`, filed `p3-someday`. Neither validator calls `readdir`, and no gate asserts that a wired blueprint has a story at all.

Which is why four *file-and-story* inventories can disagree while the declaration gate reports clean:

| Inventory | Count |
|---|---|
| React components | 22 |
| Astro components | 17 |
| Storybook `Blueprints/*` stories | 9 |
| Storybook `Deprecated/*` stories | 10 |
| `blueprints/blueprint-library.json` keys | 32 |

The manifest is the widest and the least true: **21 of its 32 keys have no React component** (`team_cards_centered`, `gallery_masonry_3col`, `faq_accordion_grouped`, `contact_form_split`, `nav_sticky_blur`, `process_grid_4step_numbered`, and 15 more). It carries `review_cadence: "quarterly"` and `last_reviewed: "2026-04-18"` — roughly five months overdue. It is also load-bearing: the portal seeds `design_blueprints` from it (`scripts/generate-blueprint-seed.mts:49` resolves `@brikdesigns/bds/blueprints`; read at `src/lib/data/content.ts:619`).

The Astro rail additionally has **zero** Storybook coverage — every `Blueprints/*` story file is `content-system/blueprints/react/*.stories.tsx`.

### Two vocabularies, both legitimate, and nowhere recorded as distinct

"Block" names two different things in BDS, and nothing says they are different axes:

- A **composition layer** — `composition-layers.mdx` §17, accepted canon per ADR-030 §36-38: Section → Layout → Container → Block → Component. Here a Block is a composed content unit inside a container.
- A **Storybook bucket** — which ADR-006 **retired on 2026-07-29**, re-titling its members into `Components/`.

`stories/Welcome.mdx:19` teaches the retired bucket as live and omits `Blueprints/` entirely, so the first page an agent reads points away from the page-section layer. Five stories also remain in the retired bucket, one of them (`bullet-list`) named in the amendment that retired it.

Separately, `brikdesigns`' own `BlockRenderer.tsx:44-89` uses "block" for page sections — a third sense, in a consumer.

### What is *not* wrong

Two things worth recording, because the fix would otherwise be aimed at them:

- **The blueprint code is token-clean.** A grep for hex colours and `px` literals across all 22 React blueprints returns no violations.
- **The genericization has already happened in React.** Each of the ten adapters carries `@deprecated` and a header naming its replacement — `Services3ColCardGrid.tsx:4` → `<CardGrid>`, `HeroSplit6040.tsx:4` → `<Hero>`, `CtaDarkCentered.tsx:4` → `<Cta>`, `Features3ColBrandedDark.tsx:4` → `<Features>`, `AboutStorySplit.tsx:4` → `<About>`, `SupportPlanCalloutSplit.tsx:4` → `<SupportPlan>`. The generic primitives exist. They were never brought to the rail that ships.

## Decision

**Astro is the canonical blueprint rail.**

OPERATOR SAID 2026-09-08 (session chat): "astro wins"

### 1. Rail canonicity and the site-class model

The two-rail split already codified at `brik-client-portal/scripts/brand-guide-transfer.ts:435` (`export type SiteStack = 'astro' | 'next'`) is ratified as the delivery model:

| Site class | Stack | Content source | Composition |
|---|---|---|---|
| Standard client site | **Astro** | in-repo content | `blueprints-astro` + `BlueprintDispatcher.astro` |
| Client site with a CMS or database; `brikdesigns.com` | Next.js | portal Supabase | `blueprints-react` + `BlueprintDispatcher.tsx` |

Astro is canonical because it carries every published client site. Next.js is a supported rail, not a lesser one — but where the two disagree, Astro's implementation is the reference and React is brought to it.

### 2. The ten shipping blueprints are un-deprecated

`HeroSplit6040`, `HeroInteriorMinimal`, `HeroSplitImageCardOverlay`, `CtaDarkCentered`, `CtaSplitContact`, `Features3ColBrandedDark`, `AboutStorySplit`, `Services3ColCardGrid`, `ServicesDetailTwoColumn`, `SupportPlanCalloutSplit` return to `Blueprints/*`, lose `tags: ['!manifest']`, and lose their `@deprecated` markers. Executed in #2301.

The seven React-only generics are reclassified as the **unshipped** generation: real components, not yet on the canonical rail. They are not deprecated — #2302 brings them to Astro, after which both generations coexist as layout choices.

### 3. `Deprecated/` + `!manifest` requires a proven-empty consumer set

A blueprint may be moved to `Deprecated/` or tagged `!manifest` only when a recorded search over every consumer repo returns no references. The search and its result go in the PR body.

This is the rule whose absence caused this ADR. Marking a component deprecated is a claim about consumers, and a claim about consumers needs the search that came back empty.

### 4. Blueprint names and keys carry layout, never content domain

OPERATOR SAID 2026-09-08 (session chat): "Rather than services-3col-card-grid it should be more like 3-col-card-grid since it can be used for an layout - team, services, blogs, etc. We need our blueprints to be brand-agnostic and easily customizable when applied to client websites."

A blueprint name or manifest key describes **layout shape only**. Content domain, industry, brand and atmosphere are expressed as:

- manifest metadata — the `industries` and `moods` fields the library already carries;
- site content — the data passed to the blueprint;
- tokens and atmospheres — never a name.

So `services_3col_card_grid` → `card_grid` (column count is a prop), `cta_dark_centered` → `cta_centered` (dark is an atmosphere), `hero_split_60_40` → `hero_split` (ratio is a prop). The rename set and its codemod are #2303.

Corollary: a *layout* word in a name is correct (`split`, `grid`, `centered`, `two_column`); a *domain* word is not (`services`, `support_plan`, `about`, `team`). `about_story_split` → `story_split` for this reason. `SupportPlan` → `CalloutPanel` (#2305) closes the last domain-coupled name in the active set.

### 5. The two vocabularies are named as separate axes

BDS has two legitimate structural vocabularies and they are not interchangeable:

| Axis | Question it answers | Vocabulary | Authority |
|---|---|---|---|
| **Composition layer** | How do I reason about this piece of structure? | Blueprint → Layout → Container → Block → Component | `composition-layers.mdx`, per ADR-030 §36-38 |
| **Storybook taxonomy** | Where does this story file? | Components / Cards / Forms / Containers / Layouts / Navigation / Blueprints / Tools | ADR-006 Part A, as amended |

`Block` is a composition layer and **not** a Storybook bucket — ADR-006 retired that bucket on 2026-07-29. `Cards` is a Storybook bucket and **not** a composition layer — a Card is a Container; the bucket exists on ADR-006's 2026-07-22 name-family precedent and is not to be folded into `Containers/`.

The layer formerly called "Section" in `composition-layers.mdx` §14 is renamed **Blueprint**, so the layer name and the bucket name are one word. This is ADR-033's "one word per concept" applied to the structural vocabulary rather than to props and tokens.

The one-sentence form, for agent prompts and for `Welcome.mdx` (#2300): *Blueprints compose the page. Containers hold collections. Blocks fill containers. Layouts arrange. Components are atoms.*

## Enforcement

Two gates, both extending scripts that already run:

1. **Context-word rule** in [`scripts/lint-blueprint-naming.mjs`](../../scripts/lint-blueprint-naming.mjs) — rejects a domain word in a blueprint name, manifest key, or slot. Ships in #2303. **Budget:** a new rule inside an existing pre-commit + CI script; no new workflow, no new trigger, no added CI job. Per the ADR-006 §157 precedent it ships with its violation set already emptied and no allowlist.
2. **Two new axes inside the existing [`validate-blueprints.mjs`](../../scripts/validate-blueprints.mjs)** — not a new script. That validator already asserts registry ≡ `WIRED_BLUEPRINT_KEYS` ≡ `is_active`, plus Astro↔React runtime parity; it is green today. The axes it lacks, and that this ADR's evidence needed, are:
   - **on-disk ≡ declared** — enumerate `content-system/blueprints/{react,astro}/` and fail on a component that no registry dispatches (the [#2012](https://github.com/brikdesigns/brik-bds/issues/2012) `stats_dark_bar` state);
   - **story coverage** — fail on a wired blueprint with no `Blueprints/*` story, which is what let the Astro rail reach zero coverage and let ten production blueprints sit `!manifest`.

   Ships in #2304. **Budget:** two rules added to a script already in pre-commit + `validate`; no new workflow, no new CI job, no new npm script.

`lint-naming-canon.mjs` (ADR-033), `slot-pattern-check.mjs` (ADR-017) and `verify-blueprints-astro-exports.mjs` are unchanged; they judge prop/token words, slot shape, and package export surface respectively — none of which this ADR touches.

## Consequences

- Three published client sites keep building. No migration is forced on live client work.
- Agent discovery returns the production blueprint vocabulary for the first time.
- The React generation owes Astro implementations (#2302) before it can be used on a client site. Until then, `brikdesigns.com` is the only consumer able to use it.
- The manifest becomes the binding inventory, so its 21 phantom keys must be built or moved to a roadmap file. Until that lands, an agent reading the manifest will still over-report what exists.
- Key renames (#2303) touch 88 references across three site repos plus a portal re-seed. This is the largest single cost of the decision and it buys the brand-agnostic library.
- `brikdesigns`' `BlockRenderer` is misnamed under §5 — it renders blueprints. Renaming it is consumer work, tracked in that repo, not here.

## What this ADR refuses

- **Deleting the ten blueprints.** Considered and rejected on evidence: 88 live references across three published sites. The operator's approval was explicitly conditional — "delete if we're confident there's no breakage on any of our sites" — and the condition failed.
- **Migrating the three live sites onto the React generics.** That would put regression risk on published client work to preserve a canonicity that never had an ADR.
- **A third blueprint rail**, or a shared abstraction above Astro and React. Two renderers over one section array is the model; a unifying layer is the parallel-taxonomy failure ADR-030 §38 already refused.
- **Folding `Cards/` into `Containers/`.** ADR-006's 2026-07-22 amendment decided this on a stated rationale; this ADR does not reopen it.
- **Backward-compatible key aliases by default.** #2303 either ships them with a removal issue or refuses them in its PR body. A silent alias layer is how two spellings of one concept survive.

## Alternatives considered

**React wins; Astro is migrated onto the generics.** Rejected — see § What this ADR refuses. It also inverts the volume: Astro carries five client sites, React carries one marketing site.

**Leave both rails canonical and let each consumer choose.** Rejected. That is the current state, and it produced four disagreeing inventories, a production vocabulary hidden from agent discovery, and a rail with zero Storybook coverage — all while `validate-blueprints.mjs` reported clean. A gate that judges only what the code declares about itself cannot arbitrate between two rails; something has to be canonical for "divergence" to have a direction.

**Write no ADR and just remove the `@deprecated` markers.** Rejected. The markers are a symptom; the cause is that a canonicity decision was made without an ADR, a consumer check, or a gate. Removing the markers without §3 and §Enforcement leaves the same failure available.
