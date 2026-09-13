# ADR-039 — Blueprint parameterization: four customization axes + anti-hand-roll guardrails

**Status:** Accepted (2026-09-12)
**Date:** 2026-09-12
**Supersedes:** [ADR-008](./ADR-008-naming-canon-closed-allowlist.md) §3 in part — the clause banning *alignment* from blueprint modifiers/props is narrowed (see § Decision 1). ADR-008 §3's ban on *appearance* and *theme* words (`--dark`, `--branded`, `--inverse`) stands unchanged.
**Superseded by:** —
**Owner:** Nick Stanerson
**Related:** [ADR-037](./ADR-037-astro-is-the-canonical-blueprint-rail.md) (Astro is the canonical blueprint rail; the two-rail delivery model), [ADR-008](./ADR-008-naming-canon-closed-allowlist.md) (naming canon, closed allowlist), [brik-llm ADR-011](https://github.com/brikdesigns/brik-llm) (blueprintKey dispatcher home), [#2309](https://github.com/brikdesigns/brik-bds/issues/2309) (blueprint-rail umbrella), [prop-axes.mdx](../../docs-site/content/docs/build-standards/prop-axes.mdx), [client-themes.mdx](../../docs-site/content/docs/theming/client-themes.mdx) (the four Theming Dimensions), [composition-layers.mdx](../../docs-site/content/docs/build-standards/composition-layers.mdx)

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
| **Style** | color, type, surface, background, spacing, elevation, ambient decoration | the four **Theming Dimensions** — client tokens (`theme-{client}.css`) + atmosphere pick + per-block `--bds-{block}-*` hooks | `client-themes.mdx` (unchanged) | ✅ built |
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
