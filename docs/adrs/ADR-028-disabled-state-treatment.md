# ADR-028 — Disabled treatment is chosen by whether the control paints its own fill

**Status:** Proposed (2026-08-04) — **decision pending owner ratification.** What the owner ratifies is the *boundary rule* and its consequence that `Button` / `FilterButton` / `FilterToggle` keep today's grey-pill look. The narrower question #1667 posed — "should the 3 adopt the fade?" — is answered **no** by measurement, not by taste (§ Decision pt-1).
**Date:** 2026-08-04
**Supersedes:** —
**Superseded by:** —
**Owner:** Nick Stanerson
**Related:** [#1667](https://github.com/brikdesigns/brik-bds/issues/1667) (this decision); [#1682](https://github.com/brikdesigns/brik-bds/issues/1682) (umbrella); [#1571](https://github.com/brikdesigns/brik-bds/issues/1571) (the invisible disabled Button that started this — added the pairing that gates the token swap); [#1503](https://github.com/brikdesigns/brik-bds/issues/1503) (FilterButton); [#1666](https://github.com/brikdesigns/brik-bds/issues/1666) (FilterToggle coverage); [ADR-015](./ADR-015-brand-primary-aa-large-contrast-policy.md) (brand-primary gated AA-large — the 3.78:1 that leaves the fade no headroom); [ADR-016](./ADR-016-small-primary-button-contrast.md) (the same headroom problem for enabled labels); [Color Pairings](../../docs-site/content/docs/primitives/color-pairings.mdx); `tokens/contrast-pairings.json` (the gate this ADR shows has a blind spot)

## Context

BDS disables a control one of three ways. The inventory below is measured, not remembered — a selector-scoped scan of every `components/ui/**/*.css` rule whose selector survives stripping `:not(…)` groups (so `:hover:not(:disabled)` does not count as a disabled rule):

| Mechanism | Components | What it does |
|---|---|---|
| **Token swap** | **3** — `Button`, `FilterButton`, `FilterToggle` | Repaints the control: `background-color: var(--background-disabled)`, `color: var(--text-disabled)` (Button also `border-color: var(--border-disabled)`) |
| **Opacity fade** | **26** — `AddressInput`, `Checkbox`, `Checklist`, `Chip`, `CloseButton`, `CompletionToggle`, `DatePicker`, `FileCard`, `FileUploader`, `InteractiveListItem`, `Menu`, `NumberInput`, `Pagination`, `Radio`, `SegmentedControl`, `Select`, `SelectableMediaTile`, `ServiceTagPicker`, `Slider`, `Stepper`, `TabBar`, `Tag`, `TextArea`, `TextInput`, `TimePicker`, `ToggleSwitch` | Keeps the enabled colours, fades the whole control |
| **Muted-text swap** | **3** — `NavItem`, `DatePicker` (day), `Stepper` | `color: var(--text-muted)`, no fill change. `DatePicker`/`Stepper` also fade; `NavItem` ([`NavItem.css:36`](../../components/ui/NavItem/NavItem.css)) does not |

#1667 framed this as two mechanisms and proposed the fade as the safe one, on the grounds that *"the contrast ratio degrades predictably and can never collapse to 1:1, because foreground and background fade together."*

**That premise is true and irrelevant.** Never reaching exactly 1:1 is not the bar; `tokens/contrast-pairings.json` gates the disabled pairing at **AA-large (3:1)** — deliberately, because WCAG 1.4.3 exempts inactive components, so the target is legibility rather than conformance. The fade blows through 3:1 in most cases.

### Measured — what a fade actually produces

`opacity` composites **both** the fill and the label toward whatever is behind the control. If the label was white on a coloured fill and the page behind is white, the label stays white while the fill pales toward white. The ratio does not degrade gracefully; it falls off a cliff.

Reproduce with [`scripts/measure-disabled-contrast.mjs`](../../scripts/measure-disabled-contrast.mjs) (added by this ADR; it assembles the same light/dark cascade `contrast-gate` does, from the same four token files, so its ratios are directly comparable):

```bash
node scripts/measure-disabled-contrast.mjs            # 0.4 and 0.5
node scripts/measure-disabled-contrast.mjs --sweep    # 0.40 → 0.80
```

At `opacity: 0.4` (the value `--state-disabled-opacity` holds), against the AA-large 3:1 floor:

| Control | enabled | faded (light) | faded (dark) |
|---|---|---|---|
| Button primary | 3.78:1 | ✗ **1.68:1** | ✗ 2.19:1 |
| Button secondary | 15.39:1 | ✗ **2.39:1** | ✗ 2.01:1 |
| Button destructive | 3.48:1 | ✗ **1.63:1** | ✗ 2.10:1 |
| FilterButton / FilterToggle active | 3.78:1 | ✗ **1.68:1** | ✗ 2.19:1 |
| Button outline / ghost label (no fill) | 17.22:1 | ✗ 2.49:1 | ✓ 3.39:1 |
| **Token swap — what ships today** | — | **✓ 5.22:1** | **✓ 3.29:1** |

Three things follow:

1. **The fade is worse than the token swap for these three components at every alpha the sweep covers (0.40 → 0.80), and in light mode it never clears 3:1 at all** — `Button primary` peaks at **2.93:1** at 0.80, against 5.22:1 for the swap. A 15.39:1 enabled pair (`Button secondary`) lands at 2.39:1. `Button primary` starts at only 3.78:1 (ADR-015's AA-large brand policy), so there is no headroom to spend. Dark mode does cross 3:1 — but not until **0.65**, where it reads 3.07:1 against the swap's 3.29:1, and where a 65%-opaque control barely registers as faded.
2. **The failure is about fill, not about hierarchy.** Fill-less controls carrying `--text-primary` survive the fade — dark mode from 0.4, light mode from 0.5 up — because their "fill" already *is* the page, so only the label moves. Fill-less controls carrying `--text-muted` do not: they need 0.65 in light and **never clear 3:1 in dark within the sweep** (2.30:1 at 0.80), because `--text-muted` on the dark page is only 3.04:1 to begin with. Alpha cannot rescue that case; it needs a different token.
3. **The token swap is the treatment that was measured, and the fade is the one that never was.** `contrast-pairings.json` scores pairings by token name; it has no `alpha` field, so it cannot see a composited pair. The 26 fading components are unmeasured by construction — which is why the fade *looked* like the safe convention.

### Measured — the fade's own cohort is not passing either

The same script scores the existing fades. `Chip` is the closest precedent to a filled control that fades, and it is the one component already reading the token ([`Chip.css:86`](../../components/ui/Chip/Chip.css)):

| Control | enabled | faded @0.4 light | faded @0.4 dark |
|---|---|---|---|
| Chip primary | 17.22:1 | ✗ 2.49:1 | ✗ **1.00:1** |
| Chip secondary | 15.39:1 | ✗ 2.39:1 | ✗ 2.01:1 |
| TextInput placeholder | 6.90:1 | ✗ 1.88:1 | ✗ 1.35:1 |

So adopting "the majority convention" would have moved three measured-passing components into an unmeasured, mostly-failing cohort.

The `Chip primary` **dark 1.00:1** is a *separate, live* defect this measurement surfaced: `--text-inverse` and `--background-inverse` both resolve to `--color-grayscale-black` in the dark brand block ([`theme-brand-brik.css:92`](../../tokens/theme-brand-brik.css) and [`:125`](../../tokens/theme-brand-brik.css), same `:root[data-theme="dark"] .theme-brand-brik` rule opened at `:83`). It affects `Chip --primary` and `Button --inverse` **enabled**, not only disabled, and it is invisible to the gate because that pairing is absent from `contrast-pairings.json`. Filed separately — it is the #1571 shape in a different pair, and not this ADR's decision.

### Measured — the consumer contract is a re-theme, not a usage

#1667 weighed the change as "visible across 6 consumer repos" and flagged that `--background-disabled` / `--text-disabled` / `--border-disabled` "would have no remaining consumer in BDS, though external consumers may reference them."

A sweep of every repo on this machine — `brikdesigns`, `brik-events`, `brik-templates`, `brik-website-themes`, `product/*`, `web/*`, excluding `node_modules`/`dist`/`.next` — separates two kinds of reference:

- **Consumption** (`var(--background-disabled)` in consumer CSS/TSX): **zero hits.** No consumer paints with these tokens directly; only the three BDS components do.
- **Definition** (`--background-disabled:` in a consumer theme): **`brik-client-portal` overrides all three.** `src/styles/theme-brik-portal.css:249,251,252` re-pins the dark trio, and `public/themes/theme-renew.css:194,206,328,404` does the same for the Renew theme (mirrored in the retired `renew-pms`).

So the tokens **do** carry an external contract, the opposite of #1667's guess about which direction the coupling runs: consumers do not *use* them, they *retune* them. Retiring the names would silently strand those overrides — a portal theme would keep declaring a token nothing reads, and its disabled Buttons would revert to BDS defaults with no error anywhere.

The portal also documents the token swap as its own standard: `CODING-STANDARDS.md:196` lists `opacity: 0.5` for disabled states in the **wrong** column, with "Use `--background-disabled`, `--text-disabled` tokens" as the right answer. Adopting the fade in BDS would put the design system in direct conflict with a consumer's written rule.

Independently, the portal's dark override measures **1.83:1** (`--text-disabled` `#5a5a5a` on `--background-disabled` `#333333`) — the #1571 defect reproduced at the consumer layer, on values BDS does not own and its gate cannot see. Filed separately; it is evidence that pt-1's pairing entry needs a consumer-side equivalent, not a reason to change the mechanism.

None of this forces the grey pill. It is why this remains a decision: the mechanism measures well and is contractually load-bearing, so the only live argument for changing it is design taste.

## Decision

**The disabled treatment is chosen by one structural property: does the control paint its own fill?**

1. **A control that paints its own fill keeps the token swap.** `Button`, `FilterButton`, `FilterToggle` do **not** adopt the fade. Their `--background-disabled` / `--text-disabled` / `--border-disabled` treatment stands, and the `contrast-pairings.json` entry added by #1571 is what keeps it honest — **it must never be removed.** Fading a filled control composites its label and its fill toward the same backdrop; the measurement above shows that ends below the 3:1 floor in every case, including one that started at 15:1.

2. **A control with no fill of its own uses the fade**, standardised on `var(--state-disabled-opacity)` rather than a hardcoded literal. "No fill of its own" means the page or an ancestor surface shows through — inputs, checkboxes, radios, switches, icon buttons, ghost/outline labels.

3. **The two mechanisms are not ranked.** Neither is "the convention"; each is correct for one shape. A new component picks by asking whether it has a fill, not by counting precedents. This ADR is the answer to "which one do I use" — do not re-derive it from `rg -c`.

4. **The muted-text swap is not a third mechanism.** `color: var(--text-muted)` without a fill change is the fade's failure mode written by hand: it darkens the label toward the backdrop while the backdrop stays put. `NavItem`, `DatePicker` (day), and `Stepper` are drift, to be reconciled into pt-2 (follow-up below).

5. **`--background-disabled` / `--text-disabled` / `--border-disabled` stay in the registry.** They have three in-repo consumers under pt-1, they are a published part of `dist/tokens.css`, and `brik-client-portal` overrides all three in two of its theme files — so they are a consumer-theming surface, not a BDS implementation detail.

### The consolidation in pt-2 is not visually neutral — and is deliberately not in this ADR

#1667 notes that consolidating on `--state-disabled-opacity` "is worth doing either way." It is, but it is not free. Across the 26 fading components there are **28 disabled-scoped `opacity` rules**, and exactly **one** reads the token ([`Chip.css:86`](../../components/ui/Chip/Chip.css)). The other 27 hardcode a literal:

| Value | Rules |
|---|---|
| `0.5` | 18 |
| `0.4` | 7 |
| `0.6` | 2 |
| `var(--state-disabled-opacity, 0.4)` | 1 |

The token holds **0.4** ([`gap-fills.css:262`](../../tokens/gap-fills.css)) while the plurality of rules is **0.5**. Consolidating therefore either fades 18 rules' worth of controls further to 0.4 or retunes the token to 0.5 and lightens 7 — and the measurement says neither value clears the floor for every case.

Worse, **no single alpha fixes the cohort.** `--text-muted` fill-less controls never reach 3:1 in dark mode at any alpha the sweep covers (2.30:1 at 0.80), because `--text-muted` is only 3.04:1 against the dark page *enabled*. Those cases need the fade **plus** a foreground that is not `--text-muted`, or they need pt-1's token swap.

Picking that number and that token is a visible change to 26 components with its own baseline churn, so it is scoped out of this ADR rather than smuggled in. This ADR fixes the *rule*; the follow-up fixes the *values*.

## Alternatives considered

**A — The three adopt the fade (what #1667 proposed).** Rejected on measurement, not preference: 1.63–2.39:1 in light mode against a 3:1 floor, worse than the 5.22:1 they ship today, and it would have moved the two components that already caused #1571/#1503 back below the threshold those issues established. It also requires an exception list on day one — [`Button.css:270-276`](../../components/ui/Button/Button.css) already carves ghost/danger-ghost out of the *fill* because "a disabled fill turns them into a solid gray block," which is pt-1/pt-2's boundary discovered the hard way and hardcoded per-variant.

**B — Keep both, no rule.** Status quo. Rejected: it is what produced #1503 and #1571. With no stated boundary, "what do the other components do" is the only available heuristic, and it points at the majority — which is the wrong answer for a filled control.

**C — Per-variant disabled fill tokens** (`--background-disabled-brand`, `-negative`, …), so each filled variant desaturates its own hue instead of collapsing to grey. Rejected on cost and on ADR-015's headroom: a branded disabled fill has to stay ≥3:1 against its own label in both modes, which is the same constraint that already forces `Button primary` to AA-large when *enabled*. Revisit only if the grey pill is rejected on design grounds — it is the design-led answer, and it is a token-registry project, not a component PR.

**D — Fade, but composite against a known surface** (wrap the control so the backdrop is fixed). Rejected: it makes every disabled control's contrast a function of its container, which is exactly the property that makes the fade unmeasurable by a token-pair gate.

## Consequences

1. **`Button`, `FilterButton`, `FilterToggle` are unchanged.** No visual diff, no baseline regeneration, no consumer sync. #1667's "6 consumer repos" risk does not materialise.

2. **The fade cohort is knowingly unmeasured, and this ADR is where that stops being invisible.** Gating it needs an `alpha` field on `contrast-pairings.json` pairings plus compositing in `scripts/validate-themes.js`, and turning that gate on will fail immediately on the numbers in § Context. So the gate and the retune land together, as one follow-up — filed against #1682, carrying the measured floors: **0.5** clears `--text-primary` fill-less controls in both modes, and no alpha clears the `--text-muted` ones in dark, so those need a different foreground or pt-1's swap. Until then `measure-disabled-contrast.mjs` is the only instrument, and it reports rather than gates.

3. **Three components are out of compliance with pt-2 the moment this is ratified** — `NavItem`, `DatePicker` (day), `Stepper` (muted-text swap), plus the **27** rules hardcoding an opacity literal instead of the token. Reconciled by the same follow-up; not fixed here, because the correct literal is the thing the follow-up decides.

4. **`--background-disabled` / `--text-disabled` / `--border-disabled` are now known to be a consumer-theming surface, not BDS-internal.** Any future change to them is a consumer-sync change, because `brik-client-portal` overrides all three in two theme files. That is a new fact about the tokens, established here so the next session does not re-derive it from a `var()` grep — which returns zero and reads as "unused."

5. **Two defects surfaced by this measurement are filed separately, because neither is a disabled-state decision:**
   - `--text-inverse` and `--background-inverse` both resolve to `--color-grayscale-black` in the dark brand block → `Chip --primary` and `Button --inverse` render **1.00:1 enabled**. The second instance of the #1571 shape; the pairing is absent from `contrast-pairings.json`, which is why it was never caught.
   - The portal's own dark `--text-disabled` / `--background-disabled` override measures **1.83:1** — #1571 reproduced at the consumer layer, outside this repo's gate.

6. **`docs-site` interaction-states documentation is now incomplete, not wrong.** [`interaction-states.mdx:58`](../../docs-site/content/docs/primitives/interaction-states.mdx) shows `opacity: var(--state-disabled-opacity)` as *the* disabled pattern with no fill caveat. It gains pt-1's exception in the follow-up that settles the value, so the page changes once rather than twice.

7. **The `three-uses` instinct does not apply to token treatments.** ADR-004 counts usages to decide whether an abstraction is earned. This ADR is the counter-case: the majority treatment was the wrong one, and the count was the reason nobody checked. When a convention is a *rendering* choice, measure it; do not poll it.
