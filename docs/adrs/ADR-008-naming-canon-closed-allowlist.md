# ADR-008 — Naming canon: closed allowlist, single namespace, structural-only modifiers

**Status:** Accepted (2026-05-11)
**Date:** 2026-05-11
**Supersedes:** parts of [naming-conventions.mdx](../../docs-site/content/docs/primitives/naming-conventions.mdx) before this date
**Superseded by:** —
**Owner:** Nick Stanerson
**Related:** ADR-004 (component bloat), PR #550 (canon doc patches), PR #552 (blueprint BEM rename), PR #554 (Chip appearance removal)

## Context

The naming-conventions doc has been an *open banlist*: it enumerates terms agents must not use (`__eyebrow`, `__heading`, `__headline`, `__body`). Anything not on the banlist passes through. Result, observed repeatedly in 2026-04/05:

- Agents invent new slot names that don't appear on the banlist (`__lead`, `__quote-text`, `__cta-arrow`, `__plan-name`, `__statistic`, `__hamburger-bar`, …). The lint can't catch what canon never named.
- Blueprints use a separate `bp-*` namespace that creates an arbitrary distinction between "primitive component" and "page layout" — the distinction adds no value but ships its own parallel vocabulary that drifts.
- Class names bake in *layout-specific* and *visual-specific* descriptors (`bp-cta-dark-centered__title`, `bp-hero-img-card__lead`). These names lie when a layout is themed differently or restructured.
- Identifier strings (`id="cta-dark-centered-default-title"`) bake the layout name into a11y plumbing; same problem.

A read-only inventory on 2026-05-11 found **675 BEM slot occurrences across 473 unique slot names** in the BDS repo. Of those, **75 are singletons** (used exactly once — high drift signal) and **45 exist only on blueprints** (not on any primitive — pure inventions). The system has been accepting drift faster than the lint catches it.

The pattern is structural, not behavioral. Open canon + open vocabulary = drift forever.

## Decision

Four interlocking changes to the canon. Each was decided with explicit user direction on 2026-05-11.

### 1. Single namespace — `bds-` everywhere

- Every class in the design system uses the `bds-` prefix, including blueprints.
- The `bp-` prefix is **deprecated**. No new `bp-*` classes ship after this ADR.
- Blueprints become high-level components in the same vocabulary as primitives. The "primitive vs layout" distinction is real but is *not* a naming concern — it's a directory concern (`components/ui/*` vs `content-system/blueprints/*`).

**Rationale:** the namespace split added no value but cost two parallel vocabularies that drifted. Single namespace = single source of truth for what a class name means.

### 2. Closed allowlist for slot names

- Canon enumerates **every** allowed slot name (the BEM `__suffix`). Anything not on the allowlist fails the lint.
- The allowlist lives in `docs/SLOT-ALLOWLIST.md` — single file, machine-readable, the lint's source of truth.
- New slot names require a PR that updates the allowlist. The PR forces a deliberate decision before a new word enters the system.

**Rationale:** open banlists fail by design — agents invent words faster than humans add bans. A closed allowlist inverts the burden: the default is *reject*, and new vocabulary requires explicit approval.

### 3. Structural-only modifiers, no layout name in slot class

- A blueprint *family* gets one block name (`bds-hero`, `bds-cta`, `bds-services`, `bds-features`, `bds-about`, `bds-support-plan`).
- Variations within a family use BEM **modifiers**: `bds-hero--split-image`, `bds-hero--interior-minimal`. The modifier names the **structural** difference, never the visual / theme / alignment.
- Slot classes drop the layout segment entirely: `bds-hero__title`, not `bds-hero-split-image__title`.
- Banned modifier patterns: anything that describes appearance (`--dark`, `--centered`, `--branded`, `--minimal-aesthetic`) or theme (`--inverse`, `--light`, `--dark-mode`). These all lie when the layout is themed differently.
- Acceptable modifier patterns: structural (`--split-image`, `--two-column`, `--with-pricing-card`), positional (`--narrow`, `--full-width`), variant-by-purpose (`--testimonial`, `--feature-grid`).

**Rationale:** the today-state has every blueprint living as its own block. That forces every CSS rule to repeat the layout name and prevents shared styling. Consolidation to one block per family with modifiers (a) shrinks the library (b) makes the rules portable (c) survives theme + layout changes.

This decision implies that blueprint *components* also consolidate — 4 hero blueprints become one parameterized `Hero` React component with a `layout` prop. That work happens in Phase D (see Migration below); ADR-008 establishes the rule, not the implementation.

### 4. BEM `__` separator for elements

- `bds-{block}__{slot}` for elements.
- `bds-{block}--{modifier}` for modifiers.
- `bds-{block}__{slot}--{modifier}` when an element has its own modifier.
- No single underscores. No other separators. No layout name in `__slot`.

**Rationale:** BEM is industry standard, well-documented, and ~500 existing classes already use it. Changing the separator would ripple through every primitive + every consumer. The cost of switching outweighs the readability benefit.

## Consequences

### What ships immediately (this ADR + companion PR)

1. ADR-008 (this file).
2. `docs/SLOT-ALLOWLIST.md` — initial allowlist derived from the 2026-05-11 inventory, intersected with the rules above.
3. Updates to [`naming-conventions.mdx`](../../docs-site/content/docs/primitives/naming-conventions.mdx):
   - Replace the open banlist framing with the closed allowlist + link to `SLOT-ALLOWLIST.md`
   - Document the single-namespace rule
   - Document the structural-only modifier rule
   - Document the id-generation rule (already specified for React in PR #552; add Astro-specific guidance)

### What does NOT ship immediately

- The lint is **not** flipped to allowlist mode in this PR. That's Phase C — a separate PR that updates `scripts/lint-blueprint-naming.mjs` to read the allowlist file and fail on any `bds-*__*` whose slot isn't in the list.
- No blueprint code is renamed in this PR. That's Phase D — multi-PR consolidation, one family at a time (hero first, then cta, services, features, about, support-plan).
- No consumer-repo migration yet. That's Phase E, coordinated with Phase D rollout.

### Migration plan

| Phase | Output | Status |
|---|---|---|
| A | ADR-008 + canon update + allowlist file | **this PR** |
| B | Inventory of consumer-repo slot usage (BDS already inventoried) | next session |
| C | Lint flipped to allowlist mode | follows B |
| D | Blueprint family consolidation, one family per PR (hero → cta → services → features → about → support-plan). Each PR: collapse N blueprints into 1 parameterized, rename classes to allowlist vocabulary, drop `bp-` prefix. | multi-session |
| E | Consumer-repo CSS rename (any `bp-*` or non-allowlist slot used in consumer code) | coordinated with D |
| F | Deprecation cleanup — drop the `bp-` prefix support after all consumers migrated | last |

Phases C–F are post-ADR; they each get their own ADR if scope is non-trivial.

### Breaking-change semantics

This ADR doesn't break anything by itself — it's pure documentation. Phase D + E ship breaking class renames. BDS is pre-1.0 (`0.65.0`), so each blueprint-family PR bumps minor; the full migration warrants a major bump after Phase F.

### What this ADR refuses

- It refuses to enumerate per-component variant unions (Button, ServiceTag, etc.) here. Those live in each component's `.tsx` type union and that component's MDX. ADR-008 is about the *shared vocabulary* — slot names that span the system. Per-component variant unions are tracked by the typegen ADR (future).
- It refuses to specify *exactly* which blueprints survive after Phase D consolidation. The structural-vs-visual modifier rule is the test; each family's consolidation PR makes the call with the rule applied.

## Open questions tracked separately

- **Consumer-repo extension policy.** Can a consumer repo invent a slot name not on the allowlist? Initial answer: no — they import the lint guard from BDS. Final answer pending consumer-repo inventory (Phase B).
- **Component vs blueprint allowlist split.** Today's allowlist proposal is one list shared by both. We may discover slots that belong only on blueprints (`__media-column`, `__hero-image`) — those will get a separate "blueprint slots" section in the allowlist file rather than mixing with primitive vocabulary.
- **Singleton review.** The 75 singletons from the inventory need a per-block decision: keep + add to allowlist, or rename to an existing allowlist term, or delete. Tracked as a pre-Phase-C cleanup.
