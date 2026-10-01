# ADR-042 — A layout tier varies by device; every other spacing token stays viewport-invariant

**Status:** Accepted (2026-10-01)
**Date:** 2026-10-01
**Supersedes:** [ADR-021](./ADR-021-blueprint-section-shell.md) — the **7vw** section rhythm clamp only (the shell classes, layer and override hook stand); [ADR-025](./ADR-025-page-grid-standard.md) — `--page-inset`'s fixed value and its `[data-mode-spacing]` ladder only (the width-container recipe stands)
**Superseded by:** —
**Owner:** Nick Stanerson
**Related:** [#2643](https://github.com/brikdesigns/brik-bds/issues/2643) (this decision), [#2595](https://github.com/brikdesigns/brik-bds/issues/2595) (parent; constraint amended here), [#2641](https://github.com/brikdesigns/brik-bds/issues/2641) (the audit), [brikdesigns#1890](https://github.com/brikdesigns/brikdesigns/issues/1890) (the consumer this unblocks), [ADR-041](./ADR-041-one-content-width-ladder.md) (the width ladder this tier pads)

Evidence: [`docs/reports/2026-09-30-foundations-modes-viewport-audit.html`](../reports/2026-09-30-foundations-modes-viewport-audit.html) (#2641, PR #2642) and [`docs/reports/2026-10-01-spacing-confidence-round.html`](../reports/2026-10-01-spacing-confidence-round.html) (PR #2657).

## Context

The operator asked for spacing that tracks the device:

> OPERATOR SAID 2026-09-30 (Claude Code session): "that spacing scales smoothly between breakpoints - we need to determine clamp vs mode."
>
> OPERATOR SAID 2026-09-30 (Claude Code session): "Spacing would be its own token collection for controlling padding and gap spacing throughout a brand - this would leverage modes to control fluctuating padding and gaps by breakpoint similar to typography."

The #2641 audit found that no BDS token varies by device today:

| Surface | Today | Where |
|---|---|---|
| Spacing modes | density only: compact / default / comfortable / spacious | `tokens/modes-spacing.css` |
| `--page-inset` | fixed 24px, plus a density ladder that no consumer sets | `tokens/gap-fills.css:334`, `:514-516` |
| Section block padding | a hand-written `clamp(var(--padding-xl), 7vw, var(--padding-huge))` | `content-system/blueprints/section-shell.css:58` (ADR-021) |
| Breakpoint collection | 5 rungs, 3 identical modes, pinned single-valued | `scripts/flatten-tokens-studio.js:38-50` (#2591) |

The constraint on #2595 (body line 42) read *"Tokens stay viewport-invariant … no cross-product of spacing × breakpoint modes"*. It carried no operator quote. The constraint below it is quoted and allows a semantic alias to vary *"per client and per breakpoint"*. The two disagreed.

## Decision

The operator ratified the confidence-round decisions (report §6) on 2026-10-01:

> OPERATOR SAID 2026-10-01 (Claude Code session): "104 vertical / 96 side margin - ratified - write the ADR (#2643), build the BDS change, and resume brikdesigns#1890."

### D1 — One axis per token

Component spacing stays viewport-invariant. A **layout tier** varies by device. No token takes both axes, so density modes and device modes never multiply.

The #2595 line-42 constraint is amended to this wording. The ruling is the ratified D2 wording below ("Tokens stay invariant except the layout tier").

### D2 — Only the layout tier varies by device

Every spacing token except the layout tier keeps one value at every viewport. A component that needs a different step at a breakpoint picks **another fixed token** inside an `@media` that uses a `--breakpoint-*` rung. This is IBM Carbon's published rule: *"the tokens themselves do not change values based on the screen size. However, it is acceptable at page breakpoints to jump a step(s)"*.

The breakpoint collection stays:

> OPERATOR SAID 2026-09-30 (Claude Code session): "we still think there's value in a breakpoint collection as these tokens can be referenced in our code vs a hard-coded valuel."

### D3 — Figma modes hold the endpoints; the build emits a piecewise clamp

Figma variables hold static numbers only. The device values therefore live as three **modes** on a Figma collection, and the build turns them into one fluid value:

```css
calc(clamp(v0, b1 + m1·vw, v1) + clamp(0, b2 + m2·vw, v2 − v1))
```

| Rule | Why |
|---|---|
| Three endpoints, two segments, **no `@media`** | One clamp from mobile to desktop misses tablet by 14.7%. A media query can't read `var()`, so a breakpoint written in `@media` would be a literal anyway. |
| Endpoints sit at `--breakpoint-mobile` 320, `--breakpoint-tablet` 768, `--breakpoint-wider` 1440 | 1440 is the width of the Figma frames the desktop value was measured on. The rung px are read from `breakpoint/default` at build time. |
| Bounds and intercepts in `rem`, slope in `vw` | At a 32px root, rem bounds rise to 32px; px bounds stay at 27.5px. |
| `vw`, never `cqi` | The tier is page-level and full-bleed. A `cqi` margin inside a 400px container drops to 16.3px. |
| The fluid value lives **only** on the BDS token | A site never re-declares its own clamp. brikdesigns' `--site-gutter` clamp (commit `dd518e12`) misaligned the nav because two tokens disagreed, not because it was a clamp. |
| Flat above 1440 | Segment 2 clamps at `v2 − v1`. |

### D4 — Endpoint values

| Token | Mobile 320 | Tablet 768 | Desktop 1440 | Primitives |
|---|---|---|---|---|
| `--page-inset` (inline page margin) | 16 | 32 | **96** | `--space-400` / `-800` / `-2100` |
| `--section-padding-block` (section block padding) | 64 | 80 | **104** | `--space-1600` / `-1800` / `-2200` |
| Grid gutter | fixed — not in the tier | | | |

- **Desktop** values come from the Figma frames `section-intro` (26225:5613) and `section-stages` (26358:6946): 104 vertical / 96 inline. The operator chose them over `section-full-stack` (88 / 64).
- **Page margin, mobile and tablet:** the industry median, 16 at 390 and 32 at 768. Carbon's grid source gives the same values.
- **Section padding, mobile and tablet:** desktop × the measured ratios, 0.62 and 0.80. Two independent methods agree on these ratios.
- **Grid gutter:** stays fixed. Carbon (32) and Bootstrap (24) both fix it.

Generated values. At a 16px root these evaluate to the endpoint at 320, 768 and 1440, within 0.001px of 4-decimal rounding:

```css
--page-inset:            calc(clamp(1rem, 0.2857rem + 3.5714vw, 2rem) + clamp(0rem, -4.5714rem + 9.5238vw, 4rem));
--section-padding-block: calc(clamp(4rem, 3.2857rem + 3.5714vw, 5rem) + clamp(0rem, -1.7143rem + 3.5714vw, 1.5rem));
```

### `--page-inset` joins the tier and loses its density ladder

`--page-inset` keeps its name, so the ADR-025 recipe and `lint-page-grid` are unchanged. Its density ladder (`gap-fills.css:514-516`) is deleted: one token must not take both axes (D1). No consumer sets `data-mode-spacing` (09-30 report §5), so deleting it changes no rendered page.

The `gap-fills.css` comment *"NOT a fluid clamp"* is corrected to the cause above.

### Token names

| Name | Status | Check |
|---|---|---|
| `--page-inset` | exists (`tokens/gap-fills.css:334`) | registered `--page-` prefix, `lint-token-tiers.mjs:84` |
| `--section-padding-block` | new | Not a restricted prefix in `validate-token-names` (`--text-` / `--surface-` / `--background-` / `--border-` / `--color-`). No `--section-*` token exists in `dist/tokens.css`. The suffix mirrors the CSS property it fills (`padding-block`). |

### Where the modes live in Figma

The modes go on a **new `layout` collection** in the Foundations library, not on the breakpoint collection.

- Modes are `desktop` (first, so it is Figma's default), `tablet` and `mobile`.
- Variables are `page-inset` and `section-padding-block`. Each aliases the spacing primitives above.

The breakpoint collection was considered and rejected. It is deliberately pinned to one value set with no runtime mode layer (`flatten-tokens-studio.js:38-50`, #2591). Device-varying values on it would break that pin and the `lint-mode-emission-coverage` exclusion (`:51`).

The amended #2595 row 1 drops *"No new Figma collection"*. That clause carried no operator quote, and the operator's 2026-09-30 direction above asks for a spacing collection driven by breakpoint modes.

### Generator

| Part | Spec |
|---|---|
| Inputs | `design-tokens/tokens-studio.json` sets `layout/{mobile,tablet,desktop}` (merged from `design-tokens/foundations.json`), plus rung px from `breakpoint/default` (`mobile`, `tablet`, `wider`) |
| Script | `scripts/generate-modes-css.mjs`: a third branch beside `emitElevation` / `emitCollection` (`:345-347`) for a collection flagged `fluid` |
| Output | `tokens/layout-fluid.css`: one `:root` block, one declaration per variable, named `--<variable>` |
| Build step | `npm run build:modes` (already part of `build:all-tokens`). `scripts/build-dist-tokens.js` concatenates `layout-fluid.css` after `gap-fills.css`, beside `fluid-type.css`. |
| Flatten | `layout` is excluded from `flatten-tokens-studio.js`, so Style Dictionary never emits a static `--layout-*` copy |
| Refusal | The build fails if endpoints are not monotonic (`v0 ≤ v1 ≤ v2`) or a rung is missing. A silent wrong clamp is worse than a red build. |

### WCAG checks the generated values must pass

| Criterion | Check |
|---|---|
| 1.4.10 Reflow (320 CSS px) | At 320 the inset floors at 16px per side, leaving a 288px content box. The generator test asserts that floor (`--page-inset` = 16px at 320), and that no endpoint exceeds its mobile value below 320. brik-bds has no browser reflow test: a repo-wide `rg -il reflow` over `*.{ts,tsx,mjs,js}` matches only `components/ui/Grid`. This ADR adds none. |
| 1.4.4 Resize text (200%) | Text-only per W3C's Understanding doc. The tier uses `rem` bounds, so at a 32px root the floor rises to 32px instead of staying fixed. Nothing in the tier sets `font-size`. |

### Gate budget

There is **no new workflow, job or required check** (net-zero under the Path A freeze).

- The endpoint assertion (each token evaluates to v0/v1/v2 at 320/768/1440) is one vitest file. It runs in `tokens-gate.yml`'s existing *Gate self-tests* step and adds about 1s.
- The change also **removes** one manual-sync obligation: the *"Keep in lockstep with modes-spacing.css"* density ladder.

## Consequences

- **Visual change for every consumer on its next BDS bump.**
  - `--page-inset` goes from 24px everywhere to 16 → 96px.
  - Blueprint section padding goes from 32–48px (7vw) to 64 → 104px.
  - Consumers: brikdesigns (19 `var(--page-inset)` uses) and the BDS-dependent Astro sites (birdwell-mutlak, tncld, vale-partners).
  - Ship it as a minor release with release notes.
- `section-shell.css:58` reads `var(--section-padding-block)`. Its ADR-021 7vw clamp is retired.
- brikdesigns#1890 consumes the tier instead of switching density by viewport. Its AC1 (*compact on mobile, comfortable on tablet, spacious on desktop*) is replaced.
- Designers bind frame padding to `layout/*` and switch the frame's mode to mock mobile and tablet. Figma Sites breakpoints swap component variants, not variable values, so mode-switching stays manual in Figma.
