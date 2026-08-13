# ADR-029 — Single-attribute tokens; compose multi-property styles in code

**Status:** Proposed
**Date:** 2026-08-13
**Supersedes:** —
**Superseded by:** —
**Related:** [#1719](https://github.com/brikdesigns/brik-bds/issues/1719) (foundations.json ↔ Figma reconcile, where this surfaced), [#1717](https://github.com/brikdesigns/brik-bds/pull/1717) (the `--font-weight-heading` semantic + shared presets that raised the question), [ADR-011](./ADR-011-service-line-token-value-model.md) (Figma-is-SoT value model), [ADR-013](./ADR-013-token-last-mile-enforce-contract-complete-emission.md) (token last mile; mode emission)
**Owner:** Nick Stanerson

## Context

Reconciling `design-tokens/foundations.json` against the live Figma Foundations variables (#1719) tripped the #1798 prune-guard on `font-weight/heading`: the token exists in the committed source (`design-tokens/foundations.json:3832`, added in #1717) and in `dist/tokens.css` (`--font-weight-heading: var(--font-weight-semibold)`), but is absent from the live Figma pull. The sync treats Figma as authoritative and wanted to prune it.

Investigating "should this token exist" surfaced a deeper, unstated question: **does BDS want composite tokens?** — a single token whose value bundles several sub-properties into one design decision (a *type style*: family + weight + size + line-height; a *shadow style*: x + y + blur + spread + color). This is the W3C DTCG "composite type" (spec §9; stable 2025.10).

What BDS actually has today, verified against a live variables pull (channel `t1gqnjud`, file *❖ Brik Foundations*) and a fresh `dist/tokens.css` build:

- **Every Figma Variable is single-attribute.** The pull returns only scalar resolved types (COLOR / FLOAT / STRING / BOOLEAN). Each collection's "composite" tokens are single-attribute **semantic aliases** onto primitives, mode-switched — e.g. `color/text-primary → grayscale/*` (light/dark), `spacing/gap-huge → space/*` (density), `typography/heading-lg → font-size/*` (density). No variable bundles multiple named properties.
- **`heading/*` typography tokens carry font-*size* only.** `--heading-lg: var(--font-size-600)` — weight, family and line-height are **not** in the token. The five "modes" (`default/compact/comfortable/spacious/expressive`) are density variants of the size, not attributes.
- **`elevation/*` is decomposed, not bundled.** It emits separate FLOAT primitives (`blur-radius/*`) → `--shadow-blur-*`; there is no single `--elevation-dramatic: {x y blur spread color}` token.
- **The multi-property "style" is assembled in code** — component CSS plus the `text` / `weight` presets in `tokens/index.ts`. That is where family + weight + size + line-height actually come together.

So a "heading style" or "shadow style" as *one packaged token* does not exist in the BDS pipeline. #1717's `--font-weight-heading` was a half-step toward one: a shared heading weight with no composite structure to hang it on, which is why it reads as an orphan Figma never models.

Research (deep-research, 2026-08-13; adversarially verified, high confidence) confirmed the two premises that decide this:

1. **Figma Variables cannot store composites.** A variable resolves to exactly one atomic type (BOOLEAN / FLOAT / STRING / COLOR, plus prototyping-only EASING / TIMING in the Plugin API); its per-mode value is a single scalar, one RGBA, or an alias/expression — never a bundled object. Multi-property styles live in Figma's **separate Styles API** (text styles, effect styles), which `scripts/pull-variables.js` does not read. (Figma REST `api_types.ts`; Plugin `VariableResolvedDataType`.)
2. **Style Dictionary v4 *can* emit composites, but only if you author them.** It recognizes DTCG composite types (`DTCGTypesMap`) and ships opt-in `typography/shadow/border/css/shorthand` transforms (expansion off by default). Established Figma→SD composite sync exists **only** through Tokens Studio's plugin-layer composites (`@tokens-studio/sd-transforms`) — **not** raw Figma Variables, which is what BDS uses.

The two facts compose to a dead end: to adopt composite tokens, BDS would have to **hand-author composite JSON outside Figma**, because Figma cannot store them — abandoning the Figma-is-source-of-truth model (ADR-011) for exactly the tokens most prone to drift.

## Decision

**BDS tokens are single-attribute. Multi-property styles are composed in code, never as composite tokens.**

1. **No DTCG composite tokens in the pipeline.** Figma Variables stay the single source of truth (ADR-011). Every token is one attribute — color, size, weight, family, line-height, blur, radius — optionally mode-switched. We do not adopt SD's composite transforms, because Figma cannot store the composite upstream and hand-authored composite JSON would fork the source of truth.
2. **"Styles" live in the code composition layer.** A type style / elevation style / motion style is assembled from atomic tokens in component CSS and the `tokens/index.ts` presets (`text`, `weight`, …). That layer — not a token — is the canonical "heading style."
3. **A shared cross-cutting attribute may be a single-attribute *semantic* token.** When multiple presets must share one value (e.g. "the weight every heading uses"), express it as a single-attribute semantic alias onto a primitive — the same shape as `text/primary → grayscale/darkest`. It must exist **in Figma** as a real semantic variable so the sync round-trips it, not code-only.
4. **Resolve #1717 accordingly.** Keep `--font-weight-heading` (it is a valid single-attribute semantic and the single source for heading weight). **Add it to Figma** as a semantic weight variable aliasing `font-weight/semibold`, re-pull, so the sync stops flagging it as a prune. Do **not** delete it and hardcode `--font-weight-semibold` across presets — that removes the shared retheme point for no gain. This unblocks #1719's reconcile.

## Consequences

- **#1719 reconcile** proceeds: `font-weight/heading` is classified *code-ahead-of-Figma* (write it into Figma), not *stale-in-Figma* (prune). The remaining foundations drift is triaged per-token by the same code-vs-Figma direction test.
- **Contributors** get one rule: tokens are atomic; if you need a "style," compose it in CSS/preset from atomic tokens. No token bundles properties.
- **No new tooling.** SD composite transforms, expansion config, and `sd-transforms` composite handling stay off. The pipeline (`pull-variables` → `sync-figma-mcp` → Style Dictionary → `build-dist-tokens`) is unchanged.
- **Code-only tokens are a smell.** Any token in `dist/tokens.css` absent from Figma (like `font-weight/heading` was) should be pushed into Figma or justified explicitly — the guard that caught #1717 stays.
- **If a future need for true composites appears** (e.g. exporting to a platform that consumes DTCG typography objects), it reopens this ADR *and* the Figma-SoT model together — it cannot be adopted piecemeal on the variables pipeline.

## Alternatives considered

- **Adopt DTCG composite tokens (SD shorthand transforms).** Rejected: Figma Variables cannot store them, so the composites would be hand-authored JSON outside Figma — forking the source of truth (ADR-011) for the highest-drift tokens. CSS cannot `var()` a bundle anyway; it re-expands to per-property values at the component, so the composition lands in code regardless.
- **Sync Figma text/effect *styles* (Styles API) into composite tokens.** Rejected: the Styles API is a separate surface the whole variables pipeline does not read; wiring it is a second sync path and a second source of truth. Not worth it for values already reachable as atomic variables.
- **Delete `--font-weight-heading`, hardcode `--font-weight-semibold` in every heading preset.** Rejected: removes the single heading-weight retheme point and a public-API token, breaking downstream consumers, to "fix" a token that is legitimately correct — the drift is Figma missing it, not the token being wrong.
- **Move to Tokens Studio for composite support.** Rejected here as out of scope: it replaces the Figma-Variables-native pipeline wholesale; not justified by one orphan weight token.
