# ADR-034 — Token tier: mode-aware derived tokens and the consumer-local component namespace

**Status:** Proposed — Decision 1 (derived-token reference rule) ready to ratify; Decision 2 (consumer namespace) **pending owner ratification** (two options framed below).
**Date:** 2026-08-30
**Supersedes:** —
**Superseded by:** —
**Owner:** Nick Stanerson
**Related:** [#2173](https://github.com/brikdesigns/brik-bds/issues/2173) (this ADR's issue), [ADR-014](./ADR-014-component-token-hook-namespace.md) (`--bds-` Tier 4 namespace — the canon this ADR extends sideways to consumer-owned tokens), [ADR-025](./ADR-025-page-grid-standard.md) (minted `--gutter-page`), [ADR-032](./ADR-032-section-header-and-content-measure.md) (minted `--measure-*`), [ADR-011](./ADR-011-service-line-token-value-model.md) (service-line scoped intent — the surface the 6 brikdesigns tokens skin), [token-anatomy.mdx](../../docs-site/content/docs/primitives/token-anatomy.mdx) (the Tier canon this ADR amends)

## Context

Two tier questions surfaced together while auditing brikdesigns tokens on 2026-08-30. Both are gaps in the four-tier canon ([token-anatomy.mdx](../../docs-site/content/docs/primitives/token-anatomy.mdx)), and both are about a token that sits at a tier the canon's *reference rule* doesn't quite allow. They belong in one ADR because they share a root: the tier model describes the common case (Semantic references Primitive; Component is BDS-authored) and has no ruling for the two legitimate tokens that fall outside it.

### 1. A Semantic token that references another Semantic token

`--gutter-page` is authored at the Semantic tier — the anatomy's own roles table lists `--gutter-*` there ([token-anatomy.mdx:106](../../docs-site/content/docs/primitives/token-anatomy.mdx)). But its value is another Semantic token, not a Primitive:

```
--gutter-page  →  --padding-lg  →  --space-600  →  24px
tokens/gap-fills.css:286      tokens/figma-tokens.css:404
```

The tier canon states **"Higher tiers reference lower tiers via `var()`"** ([token-anatomy.mdx:193](../../docs-site/content/docs/primitives/token-anatomy.mdx)) and illustrates the Semantic tier resolving to a Primitive (`--{purpose}-{role}: var(--color-{family}-{step})`, [token-anatomy.mdx:204-208](../../docs-site/content/docs/primitives/token-anatomy.mdx)). A Semantic→Semantic reference reads as a violation of that rule.

**The reference is load-bearing, not a mistake.** Spacing-density modulation lives at the Semantic tier: `[data-mode-spacing]` overrides `--padding-lg` (16 / 32 / 48px at [tokens/modes-spacing.css:21,41,60](../../tokens/modes-spacing.css)) and **never** overrides `--space-600`. Rewriting `--gutter-page` to reference the Primitive `--space-600` to satisfy the "reference a lower tier" rule would silently kill density modulation — the gutter would freeze at 24px in every mode. So "Semantic must reference a Primitive" is *incompatible* with any token whose job is to inherit another Semantic token's mode modulation.

Same shape, same tier, same rationale: `--measure-*` ([tokens/gap-fills.css:297-299](../../tokens/gap-fills.css), ADR-032) and `--content-width-*` ([tokens/gap-fills.css:265-269](../../tokens/gap-fills.css), ADR-025) — layout/derived Semantic tokens the canon lists ([token-anatomy.mdx:111](../../docs-site/content/docs/primitives/token-anatomy.mdx)) but gives no reference rule for. (`--measure-*`/`--content-width-*` are static px/ch and reference no token today; the rule matters the moment one is aliased to a mode-modulated Semantic token, as `--gutter-page` is.)

### 2. Consumer-local component tokens have no ruled namespace

ADR-014 blessed `--bds-{component}-{property}` as the sole Tier 4 namespace ([ADR-014 §Decision pt-1](./ADR-014-component-token-hook-namespace.md)), and `scripts/lint-tokens.js` blesses `--bds-*` by rule ([ADR-014:28](./ADR-014-component-token-hook-namespace.md)). But ADR-014 scoped Tier 4 to **BDS-authored** hooks — `{component}` is a BDS component or blueprint identifier, and its Consequences state consumers are "none affected" ([ADR-014:56](./ADR-014-component-token-hook-namespace.md)). It never considered a distinct, legitimate class: **component-tier tokens a consumer authors and consumes, that BDS never reads.**

brikdesigns ships six of them — runtime handoff vars set in consumer TSX/CSS and read only by consumer CSS ([brikdesigns `src/app/globals.css`](https://github.com/brikdesigns/brikdesigns/blob/main/src/app/globals.css)):

| Token | globals.css | Consumed by |
|---|---|---|
| `--service-cta-fill-dark` | :361 | `.service-themed .bds-button--primary` (#648) |
| `--service-cta-ink-dark` | :362 | ″ |
| `--service-price-ink` | :368 | service price (#726) |
| `--related-band-light` | :374 | related-band surface (#671) |
| `--related-band-dark` | :375 | ″ |
| `--support-cta-image-size` | :354 | support CTA image geometry |

These are bare `--{component}-{prop}` — the exact shape the anatomy's drift table flags "migrate to `--bds-*`" ([token-anatomy.mdx:291](../../docs-site/content/docs/primitives/token-anatomy.mdx)). But `--bds-` **signals BDS ownership** (BDS authors it, BDS reads it, BDS's lint blesses it). A consumer-local token BDS never reads is a different contract, so the drift table's remedy is wrong for it — and no *right* remedy exists in canon. That is the gap.

## Decision

### Decision 1 — `--gutter-page` and its class are Semantic-tier *derived* tokens; a same-tier reference is legitimate when it must inherit mode modulation

`--gutter-page` (and any layout/derived Semantic token of its shape) is a **Semantic-tier derived token**: a Semantic token whose value is *another* Semantic token, adopted deliberately so it inherits that token's mode modulation.

Amend the tier reference rule from **"higher tiers reference lower tiers"** to:

> A token references a **lower tier** by default. A **derived** token may reference **another token at its own tier** when the reference is the mechanism by which it inherits that token's Mode modulation — and only then. `--gutter-page: var(--padding-lg)` is legitimate because `[data-mode-spacing]` modulates `--padding-lg`, not `--space-600`; dropping to the Primitive would kill the modulation the token exists to carry.

The test for a legitimate same-tier reference is narrow: (a) the referenced token is mode-modulated at that tier, and (b) referencing the lower tier instead would *lose* that modulation. A same-tier reference that fails both is drift (a redundant alias) and stays disallowed.

### Decision 2 — consumer-local component tokens get their own namespace *(pending owner ratification)*

A component-tier token that a **consumer** authors and reads, and **BDS never reads**, is a legitimate Tier 4 citizen that ADR-014 did not name. It needs a namespace distinct from BDS's own hooks. Two options:

**Option A — distinct consumer prefix (`--brik-*`), reserving `--bds-*` for BDS-read hooks.** *(recommended)*
`--bds-` continues to mean exactly what ADR-014 made it mean: BDS authors it, BDS reads it, BDS's `lint-tokens` blesses and constrains it. Consumer-owned tokens carry `--brik-*` — read as "Brik consumer-owned, BDS never reads." Ownership is legible from the prefix, and a future BDS `--bds-service-*` token can never collide with a consumer-minted one.
- **Pro:** prefix = ownership, no ambiguity; keeps ADR-014's "`--bds-` resolves to a Semantic token" invariant clean (consumer runtime bindings like `--service-cta-fill-dark`, a per-CTA computed color, don't have to satisfy a BDS rule they were never meant to).
- **Con:** migrates the 6 brikdesigns tokens + adds a consumer `lint-tokens` rule enforcing `--brik-*` on consumer-owned component tokens.
- **Prefix pick:** `--brik-*` over `--bd-*` — one character off `--bds-` is a typo-and-misread trap the naming canon (ADR-033) exists to prevent.

**Option B — reuse `--bds-*`, ownership implicit.**
Consumer-local tokens take `--bds-*` too; who authors/reads is a convention, not encoded. Migration only normalizes the 6 bare tokens to `--bds-*`.
- **Pro:** one namespace, simplest migration.
- **Con:** erodes ADR-014's signal that `--bds-` means *BDS reads it*; a reader can no longer tell a BDS hook from a consumer-owned var by name alone; risks a future collision between a BDS token and a consumer-minted `--bds-*` of the same name.

**Recommendation: Option A (`--brik-*`).** It preserves the ADR-014 invariant that made `--bds-` enforceable and keeps ownership legible — the same reasoning that chose a distinct `--bds-` prefix over bare `--{component}-*` in the first place ([ADR-014 §Alternatives](./ADR-014-component-token-hook-namespace.md)). Owner rules at review.

## Consequences

- **token-anatomy.mdx** gains the Decision-1 same-tier-reference rule (under the Tier section) and a Tier-4 note that consumer-owned component tokens are a distinct class governed by this ADR (Decision 2 marked pending until ratified — the doc must not assert an unratified namespace as canon).
- **`--gutter-page` / `--measure-*` source comments** name their tier per the new rule ([tokens/gap-fills.css](../../tokens/gap-fills.css)).
- **Deferred to a follow-on, blocked on Decision 2's ratification** (filed against brikdesigns once ruled, per #2173's handoff): migrate the 6 consumer-local tokens to the blessed prefix and add a brikdesigns `lint-tokens` rule enforcing it. Not shipped here — a gate enforcing an unratified rule is exactly the ADR-013 mistake this system exists to stop.
- **No token values change.** Decision 1 is a classification + doc rule; the 6-token migration (Decision 2) is a pure rename with unchanged resolved values.

## Alternatives considered

- **Rewrite `--gutter-page` to reference `--space-600`** so it obeys the literal "reference a lower tier" rule. Rejected: silently kills `[data-mode-spacing]` modulation ([tokens/modes-spacing.css:21,41,60](../../tokens/modes-spacing.css) modulate `--padding-lg`, never `--space-600`). The rule is what's wrong, not the token.
- **Introduce a fifth "derived/layout" tier** for `--gutter-page` and friends. Rejected: they *are* Semantic (per-intent, brand-overridable, consumed by components) — a new tier for one reference pattern is bloat. A refined reference rule is the minimal fix.
- **Apply the drift table's `--{component}-* → --bds-*` remedy to the 6 consumer tokens.** Rejected: that remedy assumes BDS ownership; wearing `--bds-` would falsely claim BDS reads them and subject them to a BDS lint rule they can't satisfy. This ADR exists because that remedy is wrong for consumer-owned tokens.
