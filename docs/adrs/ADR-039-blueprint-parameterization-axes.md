# ADR-039 — Blueprint parameterization: four customization axes + anti-hand-roll guardrails

**Status:** Accepted (2026-09-12); amended 2026-10-12 (§ Amendment — the Style axis names its values)
**Date:** 2026-09-12
**Supersedes:** [ADR-008](./ADR-008-naming-canon-closed-allowlist.md) §3 in part — the clause banning *alignment* from blueprint modifiers/props is narrowed (see § Decision 1). ADR-008 §3's ban on *appearance* and *theme* words (`--dark`, `--branded`, `--inverse`) stands unchanged.
**Superseded by:** —
**Owner:** Nick Stanerson
**Related:** [ADR-037](./ADR-037-astro-is-the-canonical-blueprint-rail.md) (Astro is the canonical blueprint rail; the two-rail delivery model), [ADR-008](./ADR-008-naming-canon-closed-allowlist.md) (naming canon, closed allowlist), [brik-llm ADR-011](https://github.com/brikdesigns/brik-llm) (blueprintKey dispatcher home), [#2309](https://github.com/brikdesigns/brik-bds/issues/2309) (blueprint-rail umbrella), [#2774](https://github.com/brikdesigns/brik-bds/issues/2774) (the 2026-10-12 amendment below), [prop-axes.mdx](../../docs-site/content/docs/build-standards/prop-axes.mdx), [client-themes.mdx](../../docs-site/content/docs/theming/client-themes.mdx) (the four Theming Dimensions), [composition-layers.mdx](../../docs-site/content/docs/build-standards/composition-layers.mdx)

## Context

ADR-037 ratified blueprints as Brik's site-delivery model: the portal generates content + IA, tags each section with a `blueprintKey`, and an Astro `<BlueprintDispatcher>` renders it — key → component, no UI reasoning at render time. The strategic goal that model serves, stated by the operator this session:

> OPERATOR SAID 2026-09-12 (session chat): "We want to eventually build sites entirely in our portal vs having to open up claude sessions for UI fixes."

A session assessment (2026-09-12, four subagent audits) established the ground truth behind that goal:

- **Blueprint-key dispatch is the only agent-free render path.** A dispatcher is lookup + slot-fill; composing primitives (tokens + `Button` + `Card` + `Stack`) requires a reasoner — that reasoner *is* the Claude session the operator wants to eliminate. Every section a blueprint does not cover forces a hand-rolled `.astro` + bespoke `<style>` (measured: `birdwell-mutlak`/`vale-partners` hand-roll 100% of section CSS; `ServicesBento.astro`, `BeforeAfterGallery.astro`, `AudiencePathwaysHScroll.astro` are hand-built because no blueprint covers them).

- **The current blueprints vary style richly but structure barely.** Per-client visual difference today comes almost entirely from the four **Theming Dimensions** (Tokens / Atmospheres / Layout Archetypes / Blueprints; `client-themes.mdx`): a ~10-line `theme-{client}.css` plus one of eight atmospheres recolors and re-textures a *fixed geometry* with no code edit. What it cannot change is placement, column count, ratio, media type, or motion — those are hardcoded CSS. One `Hero` yields unbounded *recolor* of ~3 fixed *shapes* (`HeroLayout = 'split' | 'interior-minimal' | 'with-pricing-card'`, the only structural knob), never "centered for client A, left-aligned for client B".

- **ADR-008 §3 is why.** It deliberately banned alignment from blueprint modifiers — `bds-hero--centered` is disallowed because "these all lie when the layout is themed differently" (ADR-008 §3, line 50). That reasoning is correct for *appearance* words (`--dark`, `--branded`) that a re-theme falsifies. It over-reaches for *placement*: content alignment is a deliberate per-client composition choice, not a value a re-theme changes.

- **The operator's ambition requires structural variance without hand-rolling.**

  > OPERATOR SAID 2026-09-12 (session chat): "We need a highly dynamic and flexible blueprint library to avoid cookie cutter decisions and avoiding client sites looking similar." … "blueprints to be modular and customizable - content placement for instance, may be centered for client a or left-aligned for client b." … "we can't afford to have agents hand-rolling components."

- **The naive fixes both fail.** More blueprints → a larger catalog that still looks the same per shape, and more surface to maintain. Free-form config props → "config-driven hand-rolling": the reasoning burden moves from CSS to props, and the reasoner (Claude session) returns. The audit confirmed no current blueprint is over-parameterized (richest is `Hero` at ~9 props, almost all content slots) — the deficit is on the structure axis, not the prop count.

- **Motion is unaddressed and half-built.** The operator asked:

  > OPERATOR SAID 2026-09-12 (session chat): "do we need an axis for animation to support motion and animation decisions (scroll effects, motion, animated svgs)?"

  The foundation exists — 22 motion tokens (`--duration-*`, `--ease-spring*`; `dist/tokens.css`), motion primitives (`AmbientField`, `Marquee`, `AnimatedIcon`, `SyncedMediaSteps`), and a shared `usePrefersReducedMotion` hook — but section-level motion is *advisory free text*: `visualNotes.animationSuggestion: string | null` (`astro/types.ts:298`) holds prose like `'count-up on scroll into view'` that **nothing renders**. An agent cannot reliably drive a string.

## Decision

**A blueprint is parameterized along four customization axes. Three carry style; structure, media, and motion are curated closed enums an agent selects, never free config and never hand-written CSS.**

> OPERATOR SAID 2026-09-12 (session chat), on adopting curated structural-variant props that revise ADR-008 §3: "yes - making progress. Let's proceed."

### The four axes

| Axis | Varies | Mechanism | Vocabulary home | State |
|---|---|---|---|---|
| **Style** | color, type, surface, background, spacing, elevation, ambient decoration | the four **Theming Dimensions** — client tokens (`theme-{client}.css`) + atmosphere pick + per-block `--bds-{block}-*` hooks | `client-themes.mdx` + `content-system/vocabularies/*-mode.ts` (named by § Amendment 2026-10-12) | ✅ built |
| **Structure / placement** | `layout`, `align`, `columns`, `ratio` | curated closed-union **prop axes** on the blueprint | `prop-axes.mdx` (extended) | build |
| **Media** | `media: image \| video \| bg-video \| none` (+ `Frame` ratio) | curated closed-union **prop axis** | `prop-axes.mdx` (extended) | build |
| **Motion** | `reveal: none \| fade \| rise \| stagger`; `content: count-up \| marquee \| animated-svg` | curated closed-union **prop axis**, backed by `--duration-*`/`--ease-*`, reduced-motion-gated by construction | `prop-axes.mdx` (extended) | wire (foundation exists) |

Style is the existing Theming-Dimensions machinery and is not re-opened. Structure, Media, and Motion are **new prop axes on blueprints**, added to the coverage matrix in `prop-axes.mdx` and enforced the same way component axes already are: TypeScript union is the authoritative gate, values are validated at content-generation time.

### 1. Alignment and placement are curated prop axes, not banned modifiers (narrows ADR-008 §3)

A blueprint may expose placement as a **closed-enum prop** — `align: 'center' | 'left'`, `columns: 2 | 3 | 4`, `ratio: '50-50' | '60-40'`. The rendered modifier class is structural and enum-bound (`bds-hero--align-center`), written by the component, never by a consumer. This does **not** reopen ADR-008 §3's ban on *appearance* (`--dark`, `--branded`) or *theme* (`--inverse`, `--light`) — those remain banned, because a re-theme still falsifies them. Placement is exempted because it is a composition decision the client makes, not a value the theme controls.

The distinction ADR-039 draws that ADR-008 §3 collapsed: **appearance is what a re-theme changes; placement is what a re-theme preserves.** Alignment is placement.

### 2. Motion becomes a rendered enum; `animationSuggestion` is retired

`visualNotes.animationSuggestion: string` is replaced by enum fields on the section contract (`reveal`, `contentMotion`) that the dispatcher renders through shared motion primitives. Prose suggestions are not a contract; an enum is.

### 3. Curation is the anti-cookie-cutter mechanism

Non-cookie-cutter output comes from the **product** of the axes, not from catalog size. One `Hero` at `{3 layout × 2 align × 3 media × 4 reveal}` = 72 structural shapes, each × unbounded Style = a visual space no two clients need share — while every value stays agent-selectable and on-brand. Growing the *catalog* (new section archetypes: pricing, logo-wall, FAQ, comparison, gallery, video-hero — measured against real reference demand) is a separate, additive lever tracked under #2309, not this ADR.

### 4. The axes are agent-selectable by construction

Every axis value is a member of a closed TypeScript union, surfaced in `manifest/component-axes.json` (ADR-009) and validated at generate-time against the same enum gate the portal already applies to `blueprintKey` (`brik-client-portal/src/lib/blueprints/known-keys.ts`). An agent picks a value from a finite set; it never writes a CSS rule, a keyframe, or a raw token value.

## Amendment — 2026-10-12 (the Style axis names its values; "BDS CSS selector values win")

**Trigger:** [#2774](https://github.com/brikdesigns/brik-bds/issues/2774). The table above routed the Style axis to `client-themes.mdx (unchanged)` and left its values unwritten, because Style was the already-built axis. Four portal-side copies filled the gap and drifted from the CSS that renders — measured 2026-10-11 against `rg -o '\[data-mode-[a-z]+="[a-z-]+"\]' tokens/modes-*.css`: the portal's `EXPRESSION_MODE_VALUES` carried `base`, `soft`, `rounded`, `subtle`, `elevated`, `floating`; `visual_identity_spec` carried `tight`, `generous`, `cinematic`, `stillness`, `present`. Not one of those strings matches a selector — a client who picked `rounded` or `elevated` picked something no CSS rule answers — and in the other direction the shipped `lifted` and `dramatic` were absent from every portal list, so they could not be picked at all. BDS itself had a copy too: `tokens/index.ts` declared `BorderMode = 'sharp' | 'rounded' | 'pill'` where the CSS switches on `round`.

> OPERATOR SAID 2026-10-11 (Claude Code session, `e54586cf-bb0a-49f7-8d53-18d40b7596ee.jsonl:451`): "Yes to A + B - above (both); we can file the above effort and hand off to begin phase 0. Let's ensure phase 2 can reach a high confidence assessment before we start. We should be able to learn more in phases 0 + 1. Thoughts? Let's also ensure we're 100% aligned on adopting existing logic and not introducing any risk of drift or tech debt."

— where **A** = "BDS owns every design vocabulary; the portal imports, never copies" and **B** = "design-decision inputs move from the design phase to engagement setup".

### A1. The five Style-axis value lists

Published from `content-system/vocabularies/{spacing,typography,radius,elevation,borderwidth}-mode.ts`, one closed `as const` list + `is*` guard per axis, same shape as `animation-tier.ts`:

| Axis | Attribute | Values | Default |
|---|---|---|---|
| spacing | `data-mode-spacing` | `compact` · `comfortable` · `spacious` | `default` |
| typography | `data-mode-typography` | `compact` · `comfortable` · `spacious` · `expressive` | `default` |
| radius | `data-mode-radius` | `sharp` · `round` · `pill` | `soft` |
| elevation | `data-mode-elevation` | `flat` · `lifted` · `dramatic` | `subtle` |
| borderwidth | `data-mode-borderwidth` | `thin` · `bold` | `standard` |

**Each default is the attribute-ABSENT state and is therefore not a vocabulary member.** No `[data-mode-radius="soft"]` selector exists; omitting the attribute is how you get `soft`. A pick-list that offers the default as a value offers a string the CSS will ignore — which is half of how the portal's copies drifted (`base`, `soft`, `subtle`, `none` are all defaults promoted to members).

The typography axis is heading-scale-variant selection, not strictly density ([ADR-013](./ADR-013-token-last-mile-enforce-contract-complete-emission.md) § Amendment 2026-06-21) — `expressive` is a steeper modular ratio, not a fourth density step. It shares three value *names* with spacing and is a different axis; the two lists are separate modules on purpose.

### A2. BDS CSS selector values win

**`tokens/modes-*.css` is the authority for every Style-axis value. Nothing may declare a member the selectors do not carry, and no consumer may define its own list.** The TypeScript vocabulary is a projection of the CSS, not a parallel source — a drift between them is a defect in the TypeScript by definition.

This is the same gate discipline ADR-039 § Decision-4 already applies to the other three axes, pointed at the one axis that was exempt. Enforcement, no new workflow:

1. `content-system/vocabularies/expression-modes.test.ts` parses `tokens/modes-*.css` and asserts set equality per axis, that no axis claims its attribute-absent default, and that the glob reads exactly one file per declared axis — a sixth mode file shipping without a vocabulary fails there. It parses the CSS rather than the `COLLECTIONS` registry in `scripts/generate-modes-css.mjs` because `modes-borderwidth.css` is hand-authored and pre-dates that registry: the registry covers four of five axes, the CSS covers all five and is what ships.
2. `manifest/component-axes.json` surfaces the five lists under the reserved `@modes` key (ADR-009), read from the vocabulary modules by `scripts/generate-component-axes.mjs` and gated by the existing `npm run typegen:axes:check`. `@` cannot begin a TS export name, so the key can never collide with a component.
3. `tokens/index.ts` aliases its `SpacingMode` / `BorderMode` to the vocabularies instead of re-declaring them, retiring the `rounded` drift.

The portal imports from `@brikdesigns/bds/content-system` and deletes its copies ([brik-client-portal#4382](https://github.com/brikdesigns/brik-client-portal/issues/4382), [#4973](https://github.com/brikdesigns/brik-client-portal/issues/4973)) — out of scope here, but the reason the lists are published rather than internal.

### A3. Motion maps onto the animation tier; there is no `data-mode-motion`

**No motion mode axis exists and none is added.** `rg 'data-(motion|animation)' tokens/*.css` returns nothing (#2774 measured the built `dist/tokens.css` the same way). Motion is class-based via `tokens/animations.css` + `tokens/motion-classes.css` and is selected through the existing `AnimationTier` vocabulary (`content-system/vocabularies/animation-tier.ts`) — `subtle` · `moderate` · `expressive`, the same three names § Decision-2's `reveal`/`contentMotion` enums render through.

| Expression `motion` pick | Resolves to |
|---|---|
| `subtle` / `moderate` / `expressive` | the `AnimationTier` member of that name |
| `none` | **no motion classes emitted** — the absence of a tier, not a fourth tier |

`none` is deliberately not an `AnimationTier` member, for the same reason the mode defaults are not vocabulary members: it names the absence of the thing. A caller holding `none` emits nothing; a caller holding a tier emits that tier's classes, reduced-motion-gated by construction (§ Enforcement 4).

### A4. Blueprints may declare Style affinity

`Blueprint` gains three **optional** affinity arrays — `atmospheres`, `animation_tiers`, `spacing_modes` — validated against the vocabularies by `validateBlueprint`, and scored by `resolveBlueprintShortlist` with the weights published as `SHORTLIST_WEIGHTS` and documented in `prop-axes.mdx` § Blueprint shortlist weights. Three properties make this safe to add before the portal's decision set exists:

- **Affinity, not requirement.** Every term is additive and none filters, so a blueprint declaring no affinity scores exactly what it scored before, and a profile that has not reached the design-decision step scores exactly as it did before.
- **Omit, don't empty.** An empty array is a schema error — it declares nothing while looking like a declaration.
- **Unpopulated as of #2774.** All 13 library entries pass the schema with the fields absent. Deriving an affinity from an authored mood would be inventing a client-visible ranking input; the arrays get authored once the portal's decision set is real ([brik-client-portal#4973](https://github.com/brikdesigns/brik-client-portal/issues/4973)).

**What this amendment does not change.** Style remains the built axis — no new mode axis, no new token, no change to a selector or an emitted value. It writes down the values that already render and names where they live.

## Enforcement — the anti-hand-roll guardrails

The operator's constraint — "we can't afford to have agents hand-rolling components" — is enforced by four gates, each extending machinery that already runs. Hand-rolling is defined as: a generated site section containing a bespoke `<style>` block, `@keyframes`, an inline transition, a raw hex/px/duration literal, or a class/prop value outside the declared enums.

1. **Enum validation at generate-time.** Extend the `blueprintKey` enum gate (`known-keys.ts`) to `align` / `media` / `reveal` / `contentMotion`. An out-of-enum value fails the content generation, not the browser. **Budget:** new members in an existing schema; no new script.
2. **No-hand-roll lint.** Extend the existing token-guard / naming lints to fail any *generated* site section that carries a `<style>` block, `@keyframes`, an inline `transition:`/`animation:`, or a non-token hex/px/duration. **Budget:** rules added to lints already in pre-commit + CI; no new workflow.
3. **Coverage gate.** `BlueprintFallback` already emits a CI-greppable `data-blueprint-unknown-key`; promote it from a warning to a build failure so a missing blueprint blocks a deploy rather than silently degrading it. **Budget:** flip an existing grep from warn to fail.
4. **Reduced-motion by construction.** Every motion preset bakes the `prefers-reduced-motion` gate (via the existing `usePrefersReducedMotion` hook / CSS media query). An agent selecting a motion value cannot ship un-gated motion. **Budget:** internal to the motion primitives; no consumer surface.

Each gate names its budget per the session-contract rule; none adds a CI job.

## Consequences

- **`prop-axes.mdx` gains a blueprint-axis section** — `layout` / `align` / `media` / `motion` join `size` / `status` / `variant` / `appearance` as system axes, with a blueprint coverage matrix. This is the doc-update the operator flagged and is tracked as its own issue under #2309.
- **The section contract changes** (`astro/types.ts`): new enum fields, `animationSuggestion` removed. Both rails and the portal generator schema move together (ADR-037's one-block-two-rails discipline).
- **The portal generator learns the new axes** — its per-section pick widens from `blueprintKey` alone to `blueprintKey` + placement/media/motion enums. This is the assembly half ADR-037 left open and is what lets a generated page stand on its own instead of fail-closing to a hand-built mockup (`brik-client-portal` `dev-scaffold-site-worker.ts` reproduce-mode gate).
- **ADR-008 §3 is amended, not overturned** — the appearance/theme ban is its load-bearing half and stands; only the alignment clause is narrowed.
- **#2352 is unaffected in intent** — the React-rail adapter cleanup remains a naming-canon chore; whether the React rail survives at all is the separate ADR-037-revisit question, out of scope here.

## What this ADR refuses

- **Free-form style/config props.** No `className` pass-through on blueprints, no arbitrary `style` object, no open `layoutConfig`. Openness is hand-rolling wearing a prop's clothes.
- **A prop per pixel.** Axes are curated to the smallest set that spans real client demand; a value earns its place by appearing in a shipped or referenced site, not by being conceivable.
- **Motion as free text.** `animationSuggestion`-style prose is not a contract and is removed, not extended.
- **Catalog growth as the flexibility answer.** More blueprints is an additive lever (#2309), not a substitute for parameterizing the ones that exist.

## Alternatives considered

- **Keep ADR-008 §3 intact; deliver variance through tokens only.** Rejected: tokens recolor a fixed shape. It cannot produce "centered for A, left for B", which the operator named as a requirement.
- **Open config props (`align`, `columns` as free values, `className` escape hatch).** Rejected: reintroduces the reasoner. The whole point is an agent picking from a finite set, not composing.
- **More blueprints instead of more axes.** Rejected: N rigid blueprints look like N rigid blueprints; the combinatorial product of a few curated axes is what defeats cookie-cutter, at a fraction of the maintenance.
