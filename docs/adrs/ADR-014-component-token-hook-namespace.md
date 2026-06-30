# ADR-014 — Tier 4 component-token hook namespace: `--bds-{component}-{property}`

**Status:** Proposed
**Date:** 2026-06-29
**Supersedes:** —
**Superseded by:** —
**Related:** [#1043](https://github.com/brikdesigns/brik-bds/issues/1043) (this ADR's issue), [#565](https://github.com/brikdesigns/brik-bds/issues/565) (Composition + scoped-token program — owns the formula), [#41](https://github.com/brikdesigns/brik-bds/issues/41) (introduced the `--{component}-*` override surface), [token-anatomy.mdx](../../docs-site/content/docs/primitives/token-anatomy.mdx) (the Tier 4 canon this ADR fills in), [ADR-008](./ADR-008-naming-canon-closed-allowlist.md) (closed-allowlist precedent — stop drift at the source), [portal #512](https://github.com/brikdesigns/brik-client-portal/pull/512) / [#553](https://github.com/brikdesigns/brik-client-portal/pull/553) (parallel-taxonomy rollback this guards against)
**Owner:** Nick Stanerson

## Context

The token-anatomy canon defines a four-tier stack in which **Tier 4 (Component) was "deliberately unspecified"** — the doc named a *proposed* shape (`--bds-{component}-{property}`) but explicitly said "Do not invent Component-tier tokens until the canonical pattern lands." In practice three component-scoped namespaces shipped ahead of that decision:

1. **`--bp-{blueprint}-{slot}-{prop}`** — blueprint override hooks (`--bp-hero-img-card-bg`, `--bp-hero-interior-headline-color`). 67 definitions / 90 references across `content-system/blueprints/` (17 files: `.astro`, `.css`, `.tsx`).
2. **`--{component}-{prop}`** — component override hooks introduced by [#41](https://github.com/brikdesigns/brik-bds/issues/41): `--toast-shadow`, `--slider-thumb-shadow`, `--select-chevron-color`, `--select-icon-color`.
3. **`--bds-{component}-{property}`** — the canon's own proposed shape, already used for runtime bindings (`--bds-slider-percent`) and already special-cased by `scripts/lint-tokens.js`.

This is the parallel-taxonomy failure mode the token-discipline non-negotiable warns about — the one that rolled back [portal #512](https://github.com/brikdesigns/brik-client-portal/pull/512) / [#553](https://github.com/brikdesigns/brik-client-portal/pull/553). It is invisible to `lint-tokens`: these are *undefined custom-property references*, not real tokens, so the linter sees the canonical `var()` fallback and passes. The values rendered today are correct; the risk is namespace drift that compounds with each new blueprint family and has **no gate**.

A second, related leak rides along: **raw literals inside `var()` fallbacks** on tokenized properties — `box-shadow: var(--shadow-md, 0 4px 12px rgba(0, 0, 0, 0.08))`, `width: var(--bp-hero-img-card-icon-size, 2.5rem)`. If the token fails to resolve, an off-token Tier-1 value ships silently and lint can't see the literal. This is exactly what #41 set out to remove.

## Decision

**1. `--bds-{component}-{property}` is the sole sanctioned Tier 4 namespace.** `{component}` is the component or blueprint identifier; `{property}` is the styled aspect. It covers both override knobs (`--bds-toast-shadow`) and runtime bindings (`--bds-slider-percent`).

Why `--bds-*` over the alternatives:

- **The tooling already privileges it.** `scripts/lint-tokens.js` already treats `--bds-*` as a recognized component-local custom property and skips it; `--bp-*` and bare `--{component}-*` pass only through the lint blind spot described above. Choosing `--bds-*` aligns the canon with the gate that already exists.
- **It carries the design-system prefix**, disambiguating component knobs from arbitrary global custom properties (the collision risk of bare `--toast-shadow`).
- **It matches the shape the canon already proposed**, so no third name is introduced.

**2. A Tier 4 knob must resolve to a Semantic token, never a raw literal.** `var(--bds-toast-shadow, var(--shadow-md))` is correct; `var(--bds-toast-shadow, 0 4px 12px …)` is Tier-1 leakage. Tier 4 never terminates at a raw value.

**3. The two retired namespaces migrate to `--bds-*`** (`--bp-* → --bds-*`, bare `--{component}-* → --bds-{component}-*`), deduplicating redundant slot segments on the way (`--bp-hero-img-card-card-bg → --bds-hero-img-card-bg`). This is a pure prefix/rename pass — resolved values are unchanged, so no visual delta.

**4. `lint-tokens` gains two mechanisms, shipped in the same change as the migration:**
   - **Namespace recognition** — `--bds-{component}-*` passes *by rule* (the blessed Tier 4 shape), so the knob pattern is intentional rather than a blind spot. `--bp-*` and bare component knobs are no longer silently accepted.
   - **Fallback-literal rule** — flags a raw literal inside a `var(--token, <literal>)` fallback on a tokenized property. A nested token fallback (`var(--x, var(--y))`) stays legal. Ships with a vitest fixture proving it fails.

`BlueprintFallback.*` is exempt from the fallback-literal rule: it is a deliberate loud-stub renderer whose HEX defaults are intentional (mirrors the existing `scripts/lint-blueprint-naming.mjs` exemption).

## Consequences

- **token-anatomy.mdx** — the Tier 4 placeholder is replaced with the formula, the two-role model (knob / runtime binding), and the fallback-must-be-a-token rule; `--bp-*`, bare `--{component}-*`, and fallback-literals are added to the Drift-patterns table.
- **Blueprints + #41 components** — 17 blueprint files and four component knobs migrate to `--bds-*`; in-scope fallback literals are remediated to resolve to Semantic tokens.
- **CI** — `lint-tokens` extends its scan to `content-system/blueprints` (`.css` + `.astro`) and is wired into the `validate` chain, so future `--bp-*`/bare-knob/fallback-literal regressions fail a PR instead of accreting silently. This is the ADR-008 move — stop drift at the source — applied to Component-tier names.
- **Consumers** — none affected: consumers read compiled blueprint CSS, and resolved values are unchanged. (Discovered while auditing `.bp-hero-img-card__media-card` in the brikdesigns Netlify rebuild; that repo needs no change.)

## Alternatives considered

- **Keep `--bp-*` for blueprints, `--bds-*` for components.** Rejected: two Tier 4 namespaces is the drift this ADR exists to stop. Blueprints *are* components in the composition model; one namespace, one rule.
- **Bare `--{component}-*` (drop the prefix).** Rejected: collides with arbitrary global custom properties, and the linter can't distinguish a sanctioned knob from an unknown token without the `--bds-` signal.
- **Allow raw-literal fallbacks as "safe defaults."** Rejected: a literal that only renders when the token fails is precisely the silent off-token value #41 removed and #512/#553 rolled back. The fallback's job is to name a Semantic token, not to hardcode one.
- **Document only, no gate.** Rejected: the canon already *proposed* `--bds-*` and three parallel namespaces shipped anyway. Documentation without enforcement is the status quo that produced this issue (the ADR-013 lesson).
