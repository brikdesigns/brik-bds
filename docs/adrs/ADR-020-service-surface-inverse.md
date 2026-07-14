# ADR-020 — Service-line surface `-inverse`: a neutral-light / service-deep theme-flip surface

**Status:** Accepted (shipped in v0.107.0)
**Date:** 2026-06-28
**Supersedes:** Partially reverses [ADR-011](./ADR-011-service-line-token-value-model.md) §Decision pt-3 ("No per-service `-inverse`") — for the **surface** purpose only.
**Superseded by:** —
**Related:** [ADR-011](./ADR-011-service-line-token-value-model.md) (service-line value-model), [#809](https://github.com/brikdesigns/brik-bds/pull/809) (token-anatomy: `-inverse` = sharp theme-flip), [#810](https://github.com/brikdesigns/brik-bds/pull/810) (ADR-011 doc)
**Owner:** Nick Stanerson

## Context

ADR-011 removed the per-service `-inverse` family on the rationale that *theme-inversion is a brand/theme concern owned by the neutral `--surface-inverse` / `--background-inverse` / `--text-inverse`; service lines adapt to a known backdrop via `-on-light` / `-on-dark`* (§Decision pt-3). That holds when the inverted surface is meant to be **neutral**.

A new consumer need breaks that assumption: **service-identified cards in interior heroes** must read as plain neutral chrome in light mode but carry the **service's deep tint** in dark mode. Concretely — white in light, `{hue}-darkest` in dark. ADR-011's value-model offers no token for this:

| Candidate | Light | Dark | Why it fails |
|---|---|---|---|
| `--surface-inverse` (neutral, theme-level) | white | near-black **neutral** | Loses the service tint in dark — the card stops carrying its line identity. |
| `--surface-service-{line}-dark` (tone, mode-invariant) | `{hue}-darkest` | `{hue}-darkest` | Never white in light — it is a pinned deep tint in both themes. |

The flip target here is **intentionally service-tinted, not neutral** — exactly the case ADR-011's pt-3 did not anticipate. This is a genuine gap, not a relitigation of the canon.

## Decision

Re-introduce a single per-service surface token for all five service lines:

```
--surface-service-{line}-inverse
```

`{line}` ∈ `marketing | brand | information | product | back-office` (→ `green | yellow | blue | purple | orange`).

**Value model — mode-aware sharp theme-flip** (`-inverse` per the [#809] definition):

| Mode | Resolves to |
|---|---|
| Light (`figma-tokens.css` `:root`) | `var(--color-grayscale-white)` |
| Dark (`figma-tokens-dark.css`) | `var(--color-{hue}-darkest)` |

**Scope is the `surface` purpose only.** This ADR does **not** re-introduce `-inverse` on `background`, `text`, or `border` — those remain governed by ADR-011 (neutral inverse + `-on-light` / `-on-dark` context). This is deliberately narrower than the `-inverse` family ADR-011 removed: one purpose, one well-defined effect.

The Brand Kit Figma remains the source of truth (ADR-011). These five variables are authored in the Brand Kit color collection (Light + Dark modes), then pulled → `sync-figma-mcp.js` → Style Dictionary → `figma-tokens.css` + `figma-tokens-dark.css` → dist. No hand-authoring of emitted CSS.

## Rationale

- **Light = white** keeps the card reading as neutral chrome alongside `--surface-primary` (also `--color-grayscale-white`) in light mode — no premature tint where the page is already light.
- **Dark = `{hue}-darkest`** lets the card hold the service identity against the dark page in dark mode, which is where a flat neutral surface would otherwise disappear or read as off-brand.
- Naming reuses the established `-inverse` construct (sharp theme-flip, #809) rather than inventing a new modifier axis — the only departure from ADR-011 is *that the flip target is service-tinted*, which is the whole point of scoping this to one purpose.

## Alternatives considered

- **Neutral `--surface-inverse`.** Rejected — drops the service tint in dark, defeating the use case.
- **`--surface-service-{line}-dark`.** Rejected — mode-invariant; never white in light.
- **Per-consumer dark-mode override in CSS** (`[data-theme="dark"] .card { background: var(--surface-service-X-dark) }`). Rejected — re-creates the per-consumer service-token drift (#512/#553) that ADR-011 exists to eliminate. The flip belongs in the token, emitted once.
- **Re-introduce the full `-inverse` family (bg/text/border too).** Rejected — only the surface need is real; ADR-011's neutral-inverse + context model still covers the rest.

## Relationship to ADR-011

ADR-011 stands in full **except** the blanket "no per-service `-inverse`" in §Decision pt-3, which this ADR narrows: per-service `-inverse` is re-admitted for the **surface purpose only**, with the white→`{hue}-darkest` model above. All other ADR-011 decisions (no-suffix = base hue mode-invariant; tone/context model; the #865 dark-step pin; neutral inverse for bg/text/border) are unaffected.

## Consequences

- **Additive, non-breaking.** Five new variables; no existing token changes value. No consumer breaks on adoption.
- **Brand Kit:** 5 new `surface/service-{line}-inverse` variables (Light + Dark modes).
- **Docs:** the brikdesigns `service-token-decision-tree.md` currently lists "no `-inverse` on surface" as an anti-pattern — that guidance must be updated to admit this single surface variant. token-anatomy's `-inverse` row already covers the construct.
- **First consumer:** interior-hero service cards in brikdesigns (follow-up PR, not part of the token landing).

## Enforcement

`scripts/lint-tokens.js` validates emitted names against the source model; the 5 new tokens must appear in both `figma-tokens.css` and `figma-tokens-dark.css` after the SD build. Bump this ADR Proposed → Accepted once the tokens ship in dist.
