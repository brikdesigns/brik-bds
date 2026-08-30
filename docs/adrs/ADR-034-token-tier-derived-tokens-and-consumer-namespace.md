# ADR-034 — No consumer-authored token namespace: BDS internals override via `--bds-*` hooks; consumer-own styling is local CSS

**Status:** Proposed
**Date:** 2026-08-30
**Supersedes:** —
**Superseded by:** —
**Owner:** Nick Stanerson
**Related:** [#2173](https://github.com/brikdesigns/brik-bds/issues/2173) (this ADR's issue — the "consumer-local component-token namespace" scope-add), [ADR-014](./ADR-014-component-token-hook-namespace.md) (`--bds-{component}-{property}` Tier 4 hooks — the mechanism this ADR points overrides at), [ADR-011](./ADR-011-service-line-token-value-model.md) (service-line scoped intent — the surface these overrides skin), [token-anatomy.mdx](../../docs-site/content/docs/foundation/token-anatomy.mdx) (the Tier canon)

## Context

Auditing brikdesigns on 2026-08-30 surfaced six consumer-declared custom properties and asked: what tier are they, and do consumer-authored component tokens need their own namespace (`--bds-*` vs a distinct `--brik-*`)?

Grouping the six by **what element they actually style** answers it — and the answer is that the question was mis-framed. There is no class of token that needs a consumer-authored namespace. Every one is either a **BDS-component override** (which belongs in a BDS-defined hook) or **consumer-own element styling** (which is local CSS, not part of the token system at all).

| Consumer token | Selector it styles | Element |
|---|---|---|
| `--service-cta-fill-dark`, `--service-cta-ink-dark` | `.service-themed .bds-button--primary` ([globals.css:541,546](https://github.com/brikdesigns/brikdesigns/blob/main/src/app/globals.css)) | **BDS component** (Button) |
| `--service-price-ink` | `.service-surface .bds-pricing-card__price` ([shared-sections.css:720](https://github.com/brikdesigns/brikdesigns/blob/main/src/app/(marketing)/shared-sections.css)) | **BDS component** (PricingCard) |
| `--related-band-light`, `--related-band-dark` | `.page-section.related-services-band` ([shared-sections.css:744,747](https://github.com/brikdesigns/brikdesigns/blob/main/src/app/(marketing)/shared-sections.css)) | consumer-own element |
| `--support-cta-image-size` | `.service-detail-support-cta__media` ([services.css:242](https://github.com/brikdesigns/brikdesigns/blob/main/src/app/(marketing)/services/services.css)) | consumer-own element |

Three reach *into* BDS component internals (`.bds-button--primary`, `.bds-pricing-card__price`) with a bespoke consumer class plus a bespoke custom property. Two style the consumer's own markup (`.related-services-band`, `.service-detail-support-cta`).

## Decision

**There is no consumer-authored token namespace. BDS does not bless one — not `--brik-*`, and not a consumer arm of `--bds-*`.** A consumer-declared custom property falls into exactly one of two dispositions:

**1. It overrides a BDS component → use a BDS-defined `--bds-{component}-{property}` hook, or a BDS variant.**
A consumer reaching into `.bds-button--primary` / `.bds-pricing-card__price` with its own class + var is patching a **BDS gap**, not exercising a legitimate consumer token. BDS owns its components' internals. The sanctioned override surface already exists — ADR-014's `--bds-*` hook (override knob or runtime binding): BDS *defines* the hook name and its Semantic default; the consumer only *sets* it. The consumer never authors a component-tier token name. Where the need is a recurring, identity-level restyle (a service-themed CTA), the right answer is a BDS **variant**, not a hook at all.

**2. It styles the consumer's own element → it is local CSS, outside the BDS token system.**
`--related-band-*` and `--support-cta-image-size` style consumer markup BDS never renders. Whether the consumer expresses `180px` as a literal or a `--var` (for a light/dark swap or a TSX handoff) is a **consumer-local style choice with no BDS dimension**. It is not a "design token" in the BDS sense — it answers none of the six Anatomy questions ([token-anatomy.mdx](../../docs-site/content/docs/foundation/token-anatomy.mdx)), carries no BDS ownership, and no BDS lint should claim or bless it. Calling it a design token was the category error that made a namespace look necessary.

**Corollary — the drift table's remedy does not apply to consumer-owned tokens.** [token-anatomy.mdx](../../docs-site/content/docs/foundation/token-anatomy.mdx) flags bare `--{component}-{prop}` → "migrate to `--bds-*`". That remedy is for **BDS-authored** knobs that shipped without the prefix. A consumer token that turns out to override a BDS component migrates by moving the override into a BDS-defined hook/variant (disposition 1) — not by prefixing the consumer's own invented name with `--bds-`, which would falsely claim BDS ownership.

## Consequences

- **token-anatomy.mdx** Tier-4 section states the ruling: `--bds-*` is BDS-authored-and-read; a consumer override of a BDS component uses a BDS-defined hook/variant (never a consumer-invented name), and consumer-own element styling is local CSS outside the token system.
- **BDS gap filed** (disposition 1): expose the sanctioned override path for the three component-override tokens — a service-themed CTA path on Button (`--service-cta-fill-dark`/`-ink-dark`) and a price-ink hook/service-surface awareness on PricingCard (`--service-price-ink`). Tracked as [#2181](https://github.com/brikdesigns/brik-bds/issues/2181); brikdesigns migrates onto it once it lands.
- **No consumer lint rule, no `--brik-*` migration.** The two consumer-own tokens (`--related-band-*`, `--support-cta-image-size`) stay as the consumer's local CSS; BDS asserts nothing about them.
- **No token values change anywhere.**

## Alternatives considered

- **Distinct consumer prefix (`--brik-*`) reserving `--bds-*` for BDS hooks.** Rejected: it institutionalizes a consumer-authored token tier — a sanctioned door for exactly the parallel-taxonomy drift the single-allowlist system (`dist/tokens.css`) exists to prevent. And it is unnecessary: every real case resolves to a BDS hook or plain local CSS, neither of which needs a new namespace.
- **Reuse `--bds-*` for consumer-authored tokens.** Rejected: erodes ADR-014's invariant that `--bds-` means *BDS authors and reads it*, and risks a future BDS token colliding with a consumer-minted `--bds-*` of the same name.
- **Bless the six as-is under some naming rule.** Rejected: three are BDS-gap patches that should push the capability into BDS (system-thinking, not a local shortcut); two aren't BDS's concern at all. Neither warrants canon.

## Not in this ADR

Classifying `--gutter-page` in the tier model — its tier and whether "gutter" is the right name — is [#2173](https://github.com/brikdesigns/brik-bds/issues/2173)'s original scope and is **deferred to a focused pass**; the naming question (a gutter is conventionally between columns; this token is the page-edge inset) deserves its own decision and, if it renames, a shipped-token migration (it is Accepted in ADR-025, gated by `lint-page-grid`, and consumed downstream).
