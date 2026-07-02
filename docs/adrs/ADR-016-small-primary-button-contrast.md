# ADR-016 — White labels on the vibrant Poppy fill fail AA at every button size: choosing the small-primary-button remedy

**Status:** Proposed (2026-07-02) — **decision pending owner ratification.** This ADR frames the options; the choice in § Decision is deliberately unmade.
**Date:** 2026-07-02
**Related:** [#479](https://github.com/brikdesigns/brik-bds/issues/479) (this decision) · sub-issue of [#526](https://github.com/brikdesigns/brik-bds/issues/526) (WCAG AA contrast contract) · [ADR-015](./ADR-015-brand-primary-aa-large-contrast-policy.md) (brand-primary holds vibrant Poppy, fills gated AA-large — the decision this extends) · [#1064](https://github.com/brikdesigns/brik-bds/issues/1064) / BDS-18 (safe-pairing docs + brand-text usage lint) · [#1065](https://github.com/brikdesigns/brik-bds/issues/1065) / BDS-20 (11-step scale — supplies the token Option C needs) · [ADR-011](./ADR-011-service-line-token-value-model.md) (Figma Brand Kit is SoT) · `tokens/contrast-pairings.json` (rule in force) · brikdesigns#75 (axe baseline)
**Owner:** Nick Stanerson

## Context

ADR-015 restored the vibrant brand color — `--background-brand-primary` = Poppy `--color-poppy-light` (`#e35335`) at rest — and reclassified the white-CTA-label-on-brand-fill pairing from AA to **AA-large (3:1)**, on the stated basis of "UI-component fills with a **large/bold** CTA label." That closed the *fill* question. It explicitly deferred the small-button case: its § Alternatives notes "add a large-only vibrant text variant … deferred to BDS-18 … the 11-step scale (BDS-20) may make an AA-passing near-Poppy step available, reopening this."

**The deferred case is real, and broader than "small buttons."** White on `#e35335` is **3.78:1** — below AA-normal (4.5:1). It clears AA-large (3:1) *only if the label qualifies as WCAG large-scale text*: **≥24px at any weight, or ≥18.66px bold (≥700)**. Verified against the live component this session:

| Button size | Label token | Rendered px | Weight | WCAG large-text? | White-on-Poppy verdict |
|---|---|---|---|---|---|
| `tiny` | `--label-xs` | 11.54px | 600 | ✗ | fails AA (needs 4.5:1) |
| `sm` | `--label-sm` | 14px | 600 | ✗ | fails AA |
| `md` | `--label-md` | 16px | 600 | ✗ | fails AA |
| `lg` | `--label-lg` | 18px | 600 | ✗ (18 < 18.66, and 600 < 700) | fails AA |
| `xl` | `--label-xl` | 20px | 600 | ✗ (20 < 24, and 600 < 700) | fails AA |

Source: [`Button.css`](../../components/ui/Button/Button.css) L23–24 (`font-weight: var(--font-weight-semibold)` = 600), L45–85 (per-size `font-size`); `--label-*` → `--font-size-*` px values in the token source.

**Consequence:** *no* primary-button size renders a label that qualifies as WCAG large-scale text — every BDS button label is semibold (600), and the largest is 20px. So the AA-large classification for "On-color label on brand fill" ([`contrast-pairings.json`](../../tokens/contrast-pairings.json) L16) rests entirely on the **1.4.11 non-text UI-component** reading (3:1 for the component boundary/graphical object) — which does **not** exempt the white *label text* from **1.4.3** (4.5:1 normal text). This is a genuine ADA Title III exposure on every consumer that renders a primary button (brikdesigns.com, brik-client-portal, emails).

The gate does not catch this: `scripts/validate-themes.js` scores token *pairings* against a `thresholdType`, not their rendered font size or weight — so a pairing marked AA-large passes at 3.78:1 regardless of the 14px/600 label that actually ships. That rendered-size blind spot is BDS-18's (#1064) brand-text-usage-lint scope; this ADR decides the *token/product* remedy the lint would then enforce.

## Decision

**PENDING — owner ratification required.** One of Options A–D below (or a combination). Because Option C reopens ADR-015's vibrant-at-rest decision and Options A/B change button typography contracts, this is a brand-vs-accessibility policy call, not an implementation detail — candidate for an `azimuth` pre-commitment pass before ratifying.

## Options

### Option A — Bold + large: make primary labels qualify as WCAG large text
Bump primary-button labels to **≥700 weight and ≥18.66px** (i.e. `lg`/`xl` become bold ≥18.66px; `tiny`/`sm`/`md` primary can no longer carry the vibrant fill and fall back to a darker fill or a different variant).
- **Pro:** keeps vibrant Poppy on the sizes where it legitimately clears AA-large; honest under 1.4.3-large.
- **Con:** changes button typography across the system (weight 600→700 is a visible design change); does **not** solve tiny/sm/md — they still need a non-vibrant fill, so the primary variant fragments by size. Touches every consumer's primary buttons.

### Option B — Size floor: vibrant Poppy only above a min button size
Restrict the vibrant-Poppy primary fill to buttons at/above a chosen size; smaller primaries use the darker `--color-poppy-dark` (`#b0351b`, ~6.2:1 white) fill.
- **Pro:** no token change; contained to Button CSS + a documented usage rule.
- **Con:** two visually different "primary" fills by size is a UX inconsistency; still leans on the shaky large-text basis for the surviving vibrant sizes unless combined with A; product-side rule the lint (#1064) must encode.

### Option C — Mint an AA-passing near-Poppy step (durable, token-layer)
Via BDS-20's 11-step ramp (#1065), generate an intermediate Poppy step that clears **true AA (≥4.5:1)** against white, and point small-button (or all-button) on-color label fills at it. Today there is *no* step between `poppy-light` (3.78:1) and `poppy-dark` (~6.2:1) to land on — this option is **blocked on #1065**.
- **Pro:** small buttons clear real AA at any size/weight; no typography change; keeps a Poppy-family fill.
- **Con:** hard-depends on #1065 (promotes #1065 to a blocker of the p1 chain if chosen); the new step is perceptibly less vibrant than `poppy-light`, partially reopening the ADR-015 vibrancy decision for buttons; adds a token + a naming decision.

### Option D — Formalize AA-large + add the missing floor (accept, with guardrail)
Keep the ADR-015 AA-large classification, but add the guardrail it lacks: declare a **minimum label size/weight below which the vibrant brand fill is disallowed** (so `tiny`/`sm` cannot ship an illegible small white label), and document the posture as an explicit, owner-accepted 1.4.11-basis risk.
- **Pro:** smallest change; preserves brand vibrancy on larger buttons; makes the current implicit posture explicit and bounded.
- **Con:** the surviving pairing still relies on the contestable 1.4.11-for-label-text reading — an accepted risk, not a WCAG-1.4.3-clean result; weakest defensibility if challenged under ADA Title III.

## Options at a glance

| | A Bold+large | B Size floor | C Near-Poppy step | D Formalize+floor |
|---|---|---|---|---|
| Clears AA-normal (4.5:1) | large sizes only | dark-fill sizes only | ✓ (all) | ✗ (AA-large basis) |
| Token change | no | no | **yes (#1065)** | no |
| Typography change | **yes (600→700)** | no | no | no |
| Keeps vibrant Poppy | large only | large only | family, less vibrant | ✓ larger sizes |
| Blocked on other work | no | no | **#1065** | no |
| ADA defensibility | high | mixed | highest | lowest |

## Consequences (shared, whichever is chosen)

- **`contrast-pairings.json`** — the "On-color label on brand fill" entry (L16) and its `policy` string are updated to match the chosen remedy; the gate stays exit-0.
- **Button system** enforces the chosen constraint (per #479 AC: "BDS button system enforces the constraint").
- **#1064 (BDS-18)** brand-text-usage lint encodes the rendered-size rule this decision implies — the enforcement half the gate can't do today.
- **brikdesigns#75 axe baseline** — the poppy-button entries are removed as the fix lands (resolved at the token/component layer, not silenced), closing part of #526's AC.
- **Cross-repo:** any consumer that locally re-darkens or hardcodes brand-primary button fills reconciles to the chosen model (blast-radius audit at implementation time, per ADR-015's pattern).

## Alternatives considered (and why not the whole answer)

- **Re-darken `--background-brand-primary` to `poppy-dark` globally.** Rejected — that is exactly the divergence ADR-015 reversed; contradicts the Brand Kit SoT (ADR-011).
- **Do nothing / keep advisory-only.** Rejected — #479 is a filed p2 with an ADA-exposure premise verified this session; leaving it advisory ships a known 1.4.3 violation on every primary button.
