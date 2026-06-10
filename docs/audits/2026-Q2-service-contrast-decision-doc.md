# Service-line contrast — decision doc (2026-Q2)

**Status:** Open — awaiting design sign-off on three questions (see §4)
**Owner:** Nick Stanerson
**Consolidates:** [#836](https://github.com/brikdesigns/brik-bds/issues/836) (pairing matrix), [#850](https://github.com/brikdesigns/brik-bds/issues/850) (four-way audit + root cause), [#823](https://github.com/brikdesigns/brik-bds/issues/823) (dark-mode systemic gap), [#827](https://github.com/brikdesigns/brik-bds/issues/827) (live p1 WCAG fail), [ADR-011](../adrs/ADR-011-service-line-token-value-model.md) (value model)

## 1. Why this doc exists

The service-line contrast triad (#836 / #827 / #839) is **blocked on decisions, not code.** The measured data is durable and complete across four issues; what's missing is design sign-off on three questions that no amount of measurement resolves. This doc puts the data, the constraints, and a recommendation for each question in one place so the design session can answer them in one sitting — after which the Figma primitive work becomes well-defined.

**It changes nothing on its own.** No tokens move, no CSS changes. The output is three locked answers that then drive an ADR-011 amendment (or a new ADR) plus the Figma Brand-Kit primitive edits.

## 2. What is already locked (do not re-litigate)

ADR-011 (Accepted 2026-06-02) fixed the **value model**. These are immutable inputs to this doc, not open questions:

- **No-suffix `--{purpose}-service-{line}` is a mode-invariant base hue** — a swatch, not a re-pointable text surface. *This obsoleted the original "re-point the base surface to `-lightest`" plan and superseded/closed sub-issue #838.*
- **Context + tone variants are mode-aware** — they soften one tier toward mid-scale in dark (`darkest→darker`, `lightest→lighter`). This softening is the direct cause of the dark-mode failures below.
- **Figma Brand Kit is the source of truth** — any primitive-value fix changes the Figma source → Style Dictionary emit, never a hand-edit of `figma-tokens.css`. Values flow via the dev plugin + WebSocket relay on `:3055` (the Variables REST API is Enterprise-only/forbidden).

Also locked, from #836 (2026-06-07), for the **light theme**:
- Text-bearing service regions target the **pale `-lightest`** surface step.
- Body/small text targets same-hue **`-darkest`**; AAA is the target where free.

## 3. The data (consolidated)

### 3.1 Four-way audit — `surface × text-on-light`, both themes (#850)

Thresholds: AAA ≥7 · AA ≥4.5 (normal) · LG ≥3 (large/bold ≥18.66px) · else FAIL.

| Service line | Light base×on-light | Light pale×on-light | Dark base×on-light | Dark pale×on-light |
|---|---|---|---|---|
| brand (yellow) | AA (5.87) | AAA (8.40) | FAIL (2.98) | LG (3.70) |
| marketing (green) | AAA (7.20) | AAA (8.31) | FAIL (2.43) | FAIL (2.60) |
| information (blue) | AA (4.59) | AAA (9.29) | FAIL (2.64) | LG (3.97) |
| **product (purple)** | **FAIL (4.26)** | AAA (11.43) | FAIL (2.64) | LG (4.10) |
| **back-office (orange)** | **FAIL (4.32)** | AAA (12.52) | FAIL (2.78) | AA (5.26) |

Reading it:
- **Light + pale surface** → AAA on all five. This is why #836 locked `-lightest` for text-bearing regions.
- **Light + base (mid-tone `-light`) surface** → product and back-office already FAIL AA. This is the live #827 p1 (purple 4.26, orange 4.32), suppressed only by the brikdesigns `baseline.json`.
- **Dark theme** → FAILS for 4 of 5 lines on *both* surface tiers, because ADR-011's one-tier softening pulls the text toward mid-scale while the surface stays light. No CSS-only pairing fixes this.

### 3.2 Root cause (#850)

Two distinct problems:

1. **Light-mode primitive values too dark.** `color-purple-light` (`#9e8bc2`) and `color-orange-light` (`#e76134`) sit too close in luminance to their `-darkest` text partners — sub-AA even on the mid-tone surface. Min targets to clear `{hue}-light × {hue}-darkest ≥ 4.5:1`:

   | Token | Current hex | Current ratio | Target | Implied |
   |---|---|---|---|---|
   | `color-purple-light` | `#9e8bc2` | 4.26:1 vs `#362d48` | ≥ 4.5:1 | ~6% luminance ↑ |
   | `color-orange-light` | `#e76134` | 4.32:1 vs `#4e1400` | ≥ 4.5:1 | ~5% luminance ↑ |

2. **Dark-mode softening cancels the pale-surface gain.** `{hue}-lighter × {hue}-darker` reaches only 2.60–5.26:1. Closing this without per-component overrides needs either loosening the one-tier softening rule or widening the Brand-Kit scale-step spacing — that is question 4.3.

## 4. The three open questions

Each needs a design call. Data + a recommendation is given; the recommendation is mine, not a decision.

### 4.1 Hero/band surface intent — pale or mid-tone?

**Question:** Do text-bearing service heroes/bands retint to pale `-lightest` (AAA body, less saturation), or stay mid-tone `-light` as decorative surfaces that carry no small body copy (only large/near-black labels)?

**At stake:** brikdesigns service heroes use `-light` today. Retinting to `-lightest` is a deliberate, site-wide brand shift (vivid → pale) across all hero/band regions — high visual change, must be previewed before rollout. Keeping `-light` means heroes can't host small body copy at AA.

**Data:** §3.1 — pale clears AAA on all five in light theme; mid-tone fails AA on two and is AA-large at best on the rest.

**Recommendation:** **Pale `-lightest` for any region that carries readable body/link text; reserve mid-tone `-light` for purely decorative fills (no small text).** This is the only option that meets the locked AAA-body target without per-line exceptions. Preview on brikdesigns #408 before broad rollout.

### 4.2 AAA scope — everywhere, or AAA-body + AA-large?

**Question:** Is the target AAA for all service text, or AAA for body/small + AA for large/heading?

**At stake:** AAA-everywhere is the simpler rule (one threshold), and §3.1 shows the pale pairing already clears it in light theme for free — so in light theme there's no cost. The cost only bites in dark theme and on mid-tone surfaces, which 4.1/4.3 already constrain.

**Recommendation:** **AAA for body/small, AA for large/heading.** It matches WCAG's own large-text allowance, keeps the lint gate (#839) honest about what it enforces, and avoids over-constraining large display text where AA is the recognized bar. Since pale+light already hits AAA, this only relaxes the *dark-mode large-text* case — exactly where the primitives are tightest.

### 4.3 Dark-mode gap — how to close it?

**Question:** Close the dark-mode failures by (a) loosening ADR-011's one-tier softening for service context tokens, (b) widening Brand-Kit scale-step spacing so `lighter × darker` clears AA, or (c) accept the documented gap (status quo, #823 2026-06-04 call) until a larger ADR-011 revision?

**At stake:** This is the hardest one — it touches the ADR-011 value model. #823 already accepted a documented sub-AA dark-mode gap (~2.5:1, "legible, a large improvement over prior invisible light-on-light"). Options 1–3 in #823 (mode-invariant darkest service-text token; mode-aware dark service surfaces; neutral dark text) are all larger revisions.

**Data:** §3.1 dark columns — even pale surface only reaches AA for back-office (5.26); the rest are LG or FAIL.

**Recommendation:** **Defer to a scoped ADR-011 amendment, but pick the direction now:** raise the two primitive light values (4.3 #1 — cheap, unblocks light-mode #827 immediately) and adopt #823 option 1 (**a mode-invariant `-darkest` service-text token that does not soften in dark**) as the dark-mode fix. That keeps the surface mode-invariant (per ADR-011) and stops the text from drifting to mid-scale — the cleanest fix that doesn't make surfaces mode-aware (the bigger revision). Until that amendment ships, the #823 documented gap stays.

## 5. What unblocks once 4.1–4.3 are answered

1. **Figma primitive edits** (relay on `:3055` up — Figma Desktop + dev plugin): raise `color-purple-light` / `color-orange-light` luminance to clear `{hue}-light × {hue}-darkest ≥ 4.5:1`. Closes the light-mode half of #827.
2. **Token re-targeting** per the locked light-theme pairing, via the Figma → SD pipeline (never hand-edit `figma-tokens.css`).
3. **#839** — the contrast lint gate, **re-grounded** to gate the *canonical* pairings (not the obsolete base-swatch × on-light AC that predates ADR-011). Independent of the relay; can be built once the canonical pairing set from 4.1 is fixed.
4. **brikdesigns #408** — adopt pale service surfaces on heroes; **visual preview before merge** (deliberate vivid→pale shift). Consumes the BDS release carrying the primitive change.

## 6. Issue / token map

| Issue | Role | State |
|---|---|---|
| [#836](https://github.com/brikdesigns/brik-bds/issues/836) | Pairing matrix + this triad's umbrella | open |
| [#827](https://github.com/brikdesigns/brik-bds/issues/827) | Live p1 WCAG fail (product 4.26, back-office 4.32) | open, baseline-suppressed |
| [#823](https://github.com/brikdesigns/brik-bds/issues/823) | Dark-mode systemic gap | open, documented-gap accepted |
| #838 | Original re-point-base-surface change | **closed — superseded by ADR-011** |
| [#839](https://github.com/brikdesigns/brik-bds/issues/839) | Contrast lint gate | open — AC needs re-grounding to canonical pairings |
| #408 (brikdesigns) | Consumer adopts pale heroes | open — follows BDS release |

Token references throughout: ADR-011 §Decision table is authoritative for what each `--{purpose}-service-{line}[-suffix]` resolves to per mode.
