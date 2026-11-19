# ADR-050 — The data-visualization layer: one chart colour set, one BDS-owned SVG renderer, one Chart family, and a Dashboard archetype

**Status:** **Accepted** 2026-11-16 (AGENT DECIDED, revisable — § Decision; enforcement lands with [#3181](https://github.com/brikdesigns/brik-bds/issues/3181) and [#3182](https://github.com/brikdesigns/brik-bds/issues/3182), § Enforcement)
**Date:** 2026-11-16
**Supersedes:** —
**Superseded by:** —
**Owner:** Nick Stanerson
**Related:** [#3180](https://github.com/brikdesigns/brik-bds/issues/3180) (this ADR is its whole scope), [#3176](https://github.com/brikdesigns/brik-bds/issues/3176) (umbrella), [#3181](https://github.com/brikdesigns/brik-bds/issues/3181) (chart tokens), [#3182](https://github.com/brikdesigns/brik-bds/issues/3182) (Chart family), [#3178](https://github.com/brikdesigns/brik-bds/issues/3178) (Stat single-stat anatomy), [#404](https://github.com/brikdesigns/brik-bds/issues/404) (the DataView shells), [ADR-019](./ADR-019-own-width-responsive-primitives.md), [ADR-033](./ADR-033-naming-canon-one-word-per-concept.md), [ADR-043](./ADR-043-system-id-token-prefix.md), [Card usage audit § 3.4, § 6](../reports/card-usage-audit-2026-11-15.html)

## Where the decisions come from

The token names, the Chart family and the chart-type rule are the acceptance criteria of [#3180](https://github.com/brikdesigns/brik-bds/issues/3180), [#3181](https://github.com/brikdesigns/brik-bds/issues/3181) and [#3182](https://github.com/brikdesigns/brik-bds/issues/3182). Those issues are filed, so their scope is approved. This ADR does not rename anything in them.

Everything else is `AGENT DECIDED (revisable)`: the renderer choice, the grammar slot, the contrast rows and the Dashboard archetype. Each is revisable by changing the one section that holds it.

## Context

BDS can show one number (`Stat`), one fraction (`Meter`) and a status set (`StatusList`). It cannot show a series. Nothing in `components/ui/` draws one (`ls components/ui | grep -iE 'chart|spark'` → empty on `b6eec610`, per [#3182](https://github.com/brikdesigns/brik-bds/issues/3182)), and no chart colour exists (`grep -c -- '--chart-' dist/tokens.css` → 0, per [#3181](https://github.com/brikdesigns/brik-bds/issues/3181)).

So three questions have no BDS answer: *how did it change*, *how do categories compare*, and *what share of the whole*. The [card usage audit § 3.4](../reports/card-usage-audit-2026-11-15.html) found the gap. Its § 6 collected the vendor rules this ADR adopts, fetched 2026-11-15:

| Vendor | Rule adopted here |
|---|---|
| GitLab (single stat, charts) | Column chart is the default and beats pie. Line for continuous data. Area only for cumulative totals. Sparkline for a trend. A legend only with more than one series. A lone series cannot be toggled off. |
| Atlassian (chart colour) | One brand colour, one neutral, a categorical set capped at 5–6 in use, a status set. Each fill clears 3:1 against its surface. A separator between adjacent fills. No text on chart colour. Never colour alone. Dark mode by token. |
| Carbon (dashboards) | The most important data gets the highest contrast and the largest area. F-shaped reading order. One colour per data set across every chart. Shared layout, spacing and legend position. |

## Decision

### 1. The chart colour set

Twelve semantic colour tokens, in both themes. The names are #3181's, with the System ID prefix ADR-043 puts on every token:

| Token | Use |
|---|---|
| `--bds-chart-brand` | The one highlighted series, or a single-series chart. |
| `--bds-chart-neutral` | Context: the comparison period, "other", a target line. |
| `--bds-chart-categorical-1` … `-6` | Peer series, in this fixed order. |
| `--bds-chart-positive` · `-warning` · `-negative` · `-info` | A series that *is* a status (paid / overdue / failed). Same valence words as `Badge` `tone`. |

**AGENT DECIDED (revisable): `chart` is a new colour purpose** in `tokens/naming-grammar.json` `slots`, beside `page`, `surface`, `background`, `text` and `border`. Evidence: one chart value paints a mark's fill, a line's stroke and a legend swatch, so no existing purpose fits. `background` is a fill only and `border` is a stroke only. The grammar edit ships in #3181. Revert: drop the slot and alias each `--bds-chart-*` to an existing `background-*` token.

> **Amended 2026-11-19 — the purpose is reverted.** OPERATOR SAID 2026-11-18 (chat): "yes borders need a chart set since tokens are a langauge for specifity as to what's being styled." `chart` is a **role** under the existing purposes, not a purpose: fills are `background/chart/{name}` → `--bds-background-chart-*`, strokes are `border/chart/{name}` → `--bds-border-chart-*`, same twelve names, same values per theme. The Figma Foundations `color` collection carries both sets (the former `chart` collection and the chart primitives are deleted). `Chart.css` binds `currentColor` to the fill set; a per-mark stroke binding is open. Every `--bds-chart-*` below reads as `--bds-background-chart-*`.

The categorical number is a series **index**, not a size step. It orders series; it does not grade them. ADR-033 § 3 (numeric steps for Primitive, t-shirt for Semantic) governs magnitude steps, so it does not reach this index. `lint-naming-canon.mjs` exempts colour tokens from its step rule (`isColorToken`, [lint-naming-canon.mjs:342](../../scripts/lint-naming-canon.mjs#L342)), and the `chart` slot makes these colour tokens. #3181's `pr-checklist.sh` run is the check.

**Values come from Figma.** #3181 adds a `chart` collection to the Foundations library with light and dark modes. This ADR fixes names and rules, not hex values.

**Contrast rule.** Every `--bds-chart-*` token clears **3:1** (WCAG 1.4.11, non-text contrast) against `--bds-page-primary` and `--bds-surface-primary`, in both themes. Each pair is a `tokens/contrast-pairings.json` row with `"thresholdType": "AA-large"` (the file's 3:1 threshold), so `npm run contrast-gate` fails any value that drifts.

**Use rules:**

- **No text on chart colour.** Value labels sit outside the mark in `--bds-text-primary` or `--bds-text-secondary`.
- **Never colour alone.** Every series has a text label (legend, direct label or axis), and every chart has a data-table alternative (§ 3).
- **Separate adjacent fills.** Touching segments (donut slices, stacked bars) are split by a stroke in the colour of the surface the chart sits on.
- **Use at most 6 categories.** More than six peer series is a table, not a chart.
- **Gridlines and axes are not chart colour.** They use `--bds-border-muted` and `--bds-border-secondary`.

### 2. Build vs library: BDS owns an SVG renderer on `d3-scale` + `d3-shape`

**AGENT DECIDED (revisable).** BDS renders chart SVG itself. It computes geometry with two d3 modules: `d3-scale` (scales, ticks) and `d3-shape` (line, arc, pie). Revert: replace the renderer inside `ChartFrame`; the public props from § 3 do not change.

**The one fact that decided it:** all three SVG chart libraries weighed compute their geometry with these same two modules. What they add on top is styling, tooltips and animation, and BDS already owns that layer through tokens and Radix Popover.

- `recharts` depends on `victory-vendor`, which depends on `d3-scale` and `d3-shape`.
- `@visx/xychart` depends on `@visx/vendor`, which depends on `d3-scale` and `d3-shape`.
- `@nivo/bar` depends on `d3-scale` and `d3-shape` directly.

All dependency lists are from `npm view <pkg> dependencies`, run 2026-11-16.

| Option | Version (npm, 2026-11-16) | Unpacked | Why not |
|---|---|---|---|
| `recharts` | 3.10.1 | 7.45 MB | Pulls a state stack (`@reduxjs/toolkit`, `react-redux`, `immer`, `reselect`) for marks that need none. BDS ships 7 runtime dependencies today (`package.json`). |
| `@visx/xychart` | 4.0.0 | 431 KB | 16 dependencies, one of them a `react-spring` bridge (`@visx/react-spring`). Vendors 11 d3 modules to reach the same two. |
| `@nivo/bar` | 0.99.0 | 343 KB | Brings its own theming system (`@nivo/theming`, `@nivo/colors`), a second source of colour beside tokens. Also needs `@react-spring/web` and `lodash`. |
| `chart.js` | 4.6.1 | 6.2 MB | Draws on `<canvas>`, so marks are not DOM. CSS cannot colour them, and a screen reader cannot reach them. |
| `echarts` | 6.1.0 | 60 MB | Size alone rules it out for a component library. |
| `@observablehq/plot` | 0.6.19 | 1.7 MB | Depends on all of `d3`, and renders imperatively outside React. |
| Hand-roll everything | — | 0 | Nice tick steps, time scales and arc paths are the parts most often wrong. The two d3 modules are what every option above trusts for them. |
| **`d3-scale` + `d3-shape`, BDS SVG** | 4.0.3 / 3.2.1 | 95 KB / 178 KB | **Chosen.** Both are ISC-licensed. `d3-scale` brings `d3-array`, `d3-format`, `d3-interpolate`, `d3-time` and `d3-time-format`. `d3-shape` brings `d3-path`. |

**Consequence for the build (#3182 must verify):** `d3-scale` and `d3-shape` are ESM-only. `npm view d3-scale type exports` gives `"module"` and no `require` condition. BDS treats every bare import as external ([vite.config.lib.ts:83](../../vite.config.lib.ts#L83)) and also ships CJS (`dist/lib-entry.cjs`). #3182 must prove the CJS output loads. If it does not, inline the two modules, as a documented exception to that rule.

### 3. The Chart family

One frame and four charts, built in `components/ui/Chart/` (#3182). Every chart renders inside `ChartFrame`.

| Component | Draws | Notes |
|---|---|---|
| **`ChartFrame`** | Title, legend, axes, tooltip, states, data-table alternative | Owns everything that is not the marks. The tooltip is Radix Popover, already a dependency. Loading, empty and error come from the DataView shells (#404): error → loading → empty → content. Width is measured on the frame itself (ADR-019), so the chart is a client module. |
| **`BarChart`** | Column by default; `orientation="horizontal"` for bar | Use horizontal when category labels are long. |
| **`LineChart`** | One or more continuous series | A line with more than one series labels each line at its end. |
| **`DonutChart`** | Share of a whole | 5 categories or fewer. |
| **`Sparkline`** | A trend with no axes, legend or tooltip | Lives in `Stat`'s `supplementary` slot ([Stat.tsx:45](../../components/ui/Stat/Stat.tsx#L45)). The Stat's value and trend are its text. |

**The chart-type rule.** Pick by the question asked:

| Question | Chart |
|---|---|
| How do categories compare? | **Column**, the default. Use horizontal bar for long labels. |
| How did it change over continuous time? | **Line.** |
| What share of the whole? | **Donut, only at 5 categories or fewer.** With 6 or more, use column. |
| Which way is it trending, next to a number? | **Sparkline** inside `Stat`. |
| Running total over time? | **Area** is the vendor answer, and it is not in v1. Render it as a line until a consumer needs area. |

**Rules the family enforces:**

- **Show a legend only with more than one series.** A single series is named by the chart title.
- **The last visible series cannot be hidden.** A toggle that would leave zero series is disabled. #3182 unit-tests this.
- **Every chart offers a data table.** It is a real `Table`, reachable by keyboard. This is the "never colour alone" answer for screen readers.
- **Colour comes only from `--bds-chart-*`.** No hex in `components/ui/Chart/*.css`. #3182 greps for it.

### 4. The Dashboard page archetype

**AGENT DECIDED (revisable):** Dashboard is the sixth product page archetype, beside record read, record edit, collection, profile and section hub. It answers "how is it going" across several measures at once.

Its doc page is built under `docs-site/content/docs/build-standards/page-archetypes/` when the first portal dashboard consumes the family. #3182 keeps that out of its own scope. This ADR records the shape now so the doc has a source.

**Composition, top to bottom:**

1. **`PageHeader`.** Puts the time-range control in its actions. One range governs every chart on the page.
2. **KPI row.** 2–4 `Card` metrics rendering `Stat` (#3178), each with an optional `Sparkline`. The most important figure goes top-left.
3. **Primary chart.** The widest chart on the page, answering the page's main question.
4. **Secondary charts.** Sit in a `Grid` below it. Use fewer charts, not smaller ones.
5. **Detail.** A `TableView` of the rows behind the charts, when the reader needs to act on records.

**The hierarchy rule (Carbon):**

- The most important data gets the highest contrast (`--bds-chart-brand`) and the largest area.
- The page reads in an F shape: top row left to right, then down the left edge.
- One data set keeps one colour on every chart on the page. A series maps to a categorical index by data set, not by its position in one chart.
- Every chart shares the same frame, spacing and legend position, because `ChartFrame` owns them.

**State shell:** each `ChartFrame` owns its own loading, empty and error states. A slow query blanks one chart, never the page.

**Heading ramp:** the page title is `<h1>`. Chart titles are block titles (`--heading-sm` … `--heading-md`) and render `<h2>`, because a screen-reader user navigates by them.

## Alternatives considered

- **A third-party chart library:** see § 2. Every SVG option wraps the same two d3 modules, and every canvas option loses CSS colour and screen-reader access.
- **Reuse `--bds-background-*` for chart fills:** rejected because a line is a stroke, and `background` names a fill. A chart reading `--bds-background-accent-*` would also move whenever a background hue is re-tuned for a different job.
- **Six categorical tokens plus status, with no `brand` or `neutral`:** rejected. Carbon's hierarchy rule needs one emphasis colour and one context colour that are not a peer series.
- **Pie as well as donut:** rejected. One share-of-whole chart is enough, and the donut's centre can hold the total.

## Consequences

- **#3181** adds the `chart` purpose to `naming-grammar.json`, the Figma `chart` collection, 12 tokens per theme, and the 3:1 rows.
- **#3182** builds `ChartFrame` and the four charts, adds `d3-scale` and `d3-shape` as runtime dependencies (7 → 9), and proves the CJS build loads them.
- Consumers get the chart-type rule in each chart's MDX page and the Dashboard archetype when its doc lands.
- Area, scatter, heatmap and stacked charts are out of v1. Each needs its own issue naming the consumer and the question it answers.

## Enforcement

| Rule | Gate | Lands in |
|---|---|---|
| Every `--bds-chart-*` clears 3:1 on page and surface, both themes | `tokens/contrast-pairings.json` rows, `npm run contrast-gate` | #3181 |
| `chart` is a legal colour purpose; the index does not trip the step rule | `naming-grammar.json` slot, `lint-naming-canon.mjs` via `pr-checklist.sh` | #3181 |
| No hex in chart CSS | `grep -E '#[0-9a-fA-F]{3,6}' components/ui/Chart/*.css` → 0 | #3182 |
| Legend only with more than one series; last series cannot be hidden | Unit test | #3182 |
| Data-table alternative, keyboard-reachable; 0 axe violations | Story axe run | #3182 |
| Both themes render | `visual` required check | #3182 |

This ADR is Accepted ahead of those artifacts, following ADR-049's pattern: the decision governs the two slices now, and each slice ships its own gate.
