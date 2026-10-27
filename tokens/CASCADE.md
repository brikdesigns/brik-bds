# Token CSS Cascade

Canonical reference for what each file in `tokens/` does, where it loads,
and how to decide where a change belongs.

## Vocabulary

This doc uses the locked BDS token vocabulary (see [Token Anatomy](../docs-site/content/docs/foundation/token-anatomy.mdx) for the full disambiguation map):

- **Library** — the logical source of token definitions (Foundations Library / [Client] Brand Kit Library). Today: Figma files managed via Tokens Studio. Exactly two Figma libraries feed this pipeline — see below.
- **Layer** — a CSS `@layer` in the cascade (`bds-tokens` / `bds-components` / `client-theme` / `client-overrides`). Where a token's *value* lands at runtime.
- **Tier** — a token's abstraction level (Raw / Primitive / Semantic / Component). Independent from Layer.
- **Mode** — an orthogonal axis varying token values (color light/dark, borderwidth thin/default/thick, etc.).
- **Theming Dimension** — composable subsystem of the Theming Tenet (Tokens / Atmospheres / Layout / Blueprints).
- **Tenet** — system pillar (Foundation / Theming / Motion / Content).

**Older docs called the BDS-bundle vs client-theme split "Tier 1 / Tier 2".** That nomenclature is retired — "Tier" now refers exclusively to token abstraction (Raw/Primitive/Semantic/Component). The runtime cascade is described as CSS Layers.

### Which Figma libraries feed Style Dictionary (#2603)

Brik's Figma workspace subscribes to four team libraries. **Only two of them are token sources.** The other two are design surfaces that *consume* tokens; they have no repo mirror, no sync route, and are not missing one.

| Figma library | Repo target | Status |
|---|---|---|
| ❖ Brik Foundations | `design-tokens/foundations.json` | **Source of truth** for Style Dictionary consumption |
| ❖ Brik Brand Kit | `design-tokens/brand-kits/*.json` | **In scope** — carries client-specific decisions |
| ❖ Modern Theme Web Toolkit | none | **Out of scope** — templates effort, paused / deprioritized |
| ❖ Expressive Theme Web Toolkit | none | **Out of scope** — same |

> OPERATOR SAID 2026-09-26 (chat): "expressive and modern toolkits tie into our templates, which is currently a paused effort (deprioritized), so let's ensure we don't have agents getting hung up on these figma libraries. Foundations is our source of truth for style dictionary consumption and our brand kits, which include client-specific decisions."

`scripts/sync-figma-mcp.js` accepting only `--library=foundations` and `--library=brand-kit[s]/<slug>` is therefore **correct as built**. The absence of a toolkit mirror is the intended state — do not file it as a gap, and do not add a toolkit target without a fresh operator decision that unpauses the templates effort.

## What ships to consumers

`dist/tokens.css` is the bundle shipped to downstream consumers (portal,
brikdesigns) via `@brikdesigns/bds/tokens.css`. Built by
`scripts/build-dist-tokens.js`, which concatenates — in this order:

1. `figma-tokens.css` — auto-generated light-mode tokens (`:root`)
2. `figma-tokens-dark.css` — auto-generated dark-mode tokens (`:root[data-theme="dark"]`)
3. `theme-brand-brik.css` — Brik brand overrides (scoped to `.theme-brand-brik` class)
4. `modes-borderwidth.css` — borderWidth mode overrides (`[data-mode-borderwidth="thin|thick"]`; `bold` is a one-release alias of `thick`) — auto-generated via `npm run build:modes`
5. `modes-spacing.css` — spacing density mode overrides (`[data-mode-spacing="compact|comfortable|spacious"]`) — auto-generated from `design-tokens/tokens-studio.json` via `npm run build:modes`
6. `modes-typography.css` — typography heading-scale-variant overrides (`[data-mode-typography="compact|comfortable|spacious|expressive"]`) — auto-generated from `design-tokens/tokens-studio.json` via `npm run build:modes`
7. `modes-borderradius.css` — corner-radius mode overrides (`[data-mode-radius="sharp|round|pill"]`) — auto-generated via `npm run build:modes`. Note the attribute is `data-mode-radius` while the source collection is `border-radius`; overrides the semantic `--border-radius-{none,sm,md,lg}` (defined in figma-tokens.css above, so it lands with the other mode files).
8. `gap-fills.css` — manual tokens not yet in Figma
9. `modes-elevation.css` — elevation depth mode overrides (`[data-mode-elevation="flat"]`) — auto-generated via `npm run build:modes`. **Concatenated after gap-fills.css, not with the other mode files**, because it overrides the `:root`-scoped `--shadow-*` tokens defined *in* gap-fills; its bare `[data-mode-elevation]` selector ties `:root` on specificity and must win by source order. Ships `flat`, `lifted`, and `dramatic` (#2243; `subtle` is the default and needs no attribute — see the mode-contracts table).
10. `layout-fluid.css` — the **layout tier**: device-fluid `--bds-page-inset` / `--bds-section-padding-block`, one piecewise `calc(clamp(…) + clamp(…))` per token threading the mobile/tablet/desktop endpoints (ADR-042) — auto-generated via `npm run build:modes` (`emitFluid` in `generate-modes-css.mjs`). Carries a plain `:root` block, no `[data-mode-*]` selector (there's no runtime mode to flip — see § Non-color mode contracts below), so it's concatenated beside `ratios.css`/`fluid-type.css`, not with the mode files above.
11. `ratios.css` — `--aspect-*` tokens (dimensionless `<ratio>`, can't be a Figma Variable; BDS #486)
12. `fluid-type.css` — `--display-fluid-*` clamp() tier (viewport-fluid marketing display type; can't be a Figma Variable; brik-bds#959)
13. `animations.css` — shared keyframe library (`bds-spin`, `bds-pulse`, `bds-pop`, etc.) — required by any component CSS that references these names

**Not bundled:** `bridge.css` (opt-in via separate export), `font-audit.css`
(Storybook-only), `motion-classes.css` (opt-in utility classes — consumers import
directly if they want them), `storybook-themes.ts`, `index.ts`.

## Color-mode contract

Theme and color mode are two separate axes. Never mix them.

| Axis | Answers | Switch | Values |
|---|---|---|---|
| **Theme** | Whose brand? | a class (`.theme-brand-brik`) or `@layer client-theme` | one per brand |
| **Color mode** | Which way does that brand render? | `data-theme` on `<html>` | `light` (default, no attribute needed), `dark` |

The attribute is called `data-theme` for historical reasons. It carries the color mode, not the theme. Say "color mode" in prose. Don't rename the attribute, because every dark selector in this repo depends on it.

Spacing, radius and the other non-color modes have their own switches. See [§ Non-color mode contracts](#non-color-mode-contracts).

### The one switch

**`[data-theme="dark"]` on `<html>` is the only dark switch in the ecosystem.**

- Figma-generated tokens: `:root[data-theme="dark"]`
- Brand overrides: `.theme-brand-brik[data-theme="dark"]`
- Storybook sets the attribute via the theme toolbar (`preview.tsx`)
- React consumers use `ThemeProvider` (which sets it automatically when `applyToBody` is true)
- Astro/Webflow/static consumers set it manually on `<html>`

No consumer should toggle a `.dark` class — the attribute is the only switch.

### Client themes ship one color mode

- `company_profiles.theme_mode` is the client's **default** color mode. It is not a list of supported modes.
- The portal theme generator writes one set of semantic tokens. It writes no `[data-theme="dark"]` block and no `prefers-color-scheme` block, so visitors can't switch modes.
- Build a second color mode (a visitor toggle) only when a client asks for one.

> OPERATOR SAID 2026-10-21 (chat, adc82c92-ee87-47ea-86bb-882e70222963.jsonl:1831): "let's have the logic for modes be only when a client asks for now until we iron out the above logic. Let's address the above loose ends and any remaining work on this topic. Also, what is the "CASCADE.md" file? Is this aligned with our LLM/RAG? Is this following our writing standards? Are we properly tracking this markdown file?"

### Contrast is its own switch (reserved, not built)

- More contrast is not a third color mode. It layers on top of light or dark.
- Reserved switch: `data-contrast="more"` on `<html>`, matching the OS `prefers-contrast: more` query.
- Nothing ships it yet. No selector in `tokens/` or `components/` reads it. Build it when a client needs it.
- It's a separate switch because a contrast block only overrides the tokens that fail, such as borders and secondary text. That way it works with any theme and either color mode, and no palette needs a second copy.

AGENT DECIDED (revisable): contrast is a separate `data-contrast` switch, not a `data-theme` value. Evidence: no contrast selector exists today, and folding it into `data-theme` would need four palettes (light, dark, and a high-contrast version of each). Revert: delete this subsection. Revisit it if Figma models contrast as extra modes of the color collection.

## Non-color mode contracts

**One switch per orthogonal axis: `data-mode-{collection}` attribute on `<html>`** (or any subtree). Modes compose freely with `data-theme` and with each other; each block targets a distinct attribute, so applying multiple at once layers cleanly.

| Collection | Attribute | Default (no attr) | Other values | Wired? |
|---|---|---|---|---|
| `borderwidth` | `data-mode-borderwidth` | `default` | `thin`, `thick` | ✅ `modes-borderwidth.css` (`bold` → `thick` alias, one release) |
| `spacing` | `data-mode-spacing` | `default` | `compact`, `comfortable`, `spacious` | ✅ `modes-spacing.css` |
| `border-radius` | `data-mode-radius` | `soft` | `sharp`, `round`, `pill` | ✅ `modes-borderradius.css` (attr `data-mode-radius`; source collection `border-radius`) |
| `typography` | `data-mode-typography` | `default` | `compact`, `comfortable`, `spacious`, `expressive` | ✅ `modes-typography.css` (heading-* only; display-* mode-invariant) |
| `elevation` | `data-mode-elevation` | `subtle` | `flat`, `lifted`, `dramatic` | ✅ `modes-elevation.css` — `flat`→`--shadow-*: 0px 0px 0px 0px transparent` (a zeroed shorthand, not `none`: overriding a box-shadow token with the `none` keyword gives one name two value types, which ADR-033 § 5 rejects). `lifted`/`dramatic` compose the full `0px y blur spread rgba(0,0,0,α)` from the elevation collection's y-offset + blur-radius + spread + opacity sub-tokens (#2243; x is invariantly 0, color always black). `subtle` is the default — uses the hand-authored `--shadow-*` in gap-fills.css |
| `breakpoint` | `data-mode-breakpoint` | `default` | `compact`, `comfortable` | 🚫 excluded (#931) — no `[data-mode-*]` block; `var()` can't parametrize `@media`/`@container` conditions. Not unwired: it ships as **build-time** tokens instead (see § Breakpoint is intentionally excluded) |
| `icon` | `data-mode-icon` | `solid` | `outline` | ⏳ pending #340 |

### Breakpoint is intentionally excluded (#931)

`breakpoint` (`default` / `compact` / `comfortable`) is the one multi-modal Figma collection that is **deliberately not wired** to `[data-mode-*]`, and never will be. The other axes work because a CSS custom property can be *consumed* anywhere a value is legal — but a responsive breakpoint's whole job is to drive a **condition** (`@media (min-width: …)` / `@container (…)`), and `var()` is **invalid inside a media/container query condition** (custom properties resolve only in declaration values). An emitted `[data-mode-breakpoint]` block of vars would therefore be inert for the responsive switching the collection is named for — a decorative "looks-wired-isn't" collection, exactly the gap #340 exists to close.

Where breakpoint values *would* be usable — computed gutters, JS-driven layout reading `getComputedStyle`, `@container` **style** queries — is not what a breakpoint mode means, so the collection routes to none of them. Responsive behavior in BDS stays in authored `@media`/container rules and component logic, not a mode block.

The exclusion is enforced: `breakpoint` is named in the `EXCLUDED` map in `scripts/lint-mode-emission-coverage.mjs` (the #932 source↔emitted guard), so it is neither flagged as dormant nor allowed to silently acquire an emission.

#### Excluded from mode emission ≠ unwired (#2591)

The paragraphs above are about the **runtime** `[data-mode-*]` layer, and they still hold. They are not a statement that the collection has no consumer. Since #2591 `breakpoint` is wired as **build-time** tokens on two surfaces:

| Surface | What it carries | Generated from |
|---|---|---|
| `--breakpoint-*` in `tokens/figma-tokens.css` | the six rungs as px, reference-only (ADR-025 §4) | Style Dictionary, via `npm run build:all-tokens` |
| `breakpoints` + `mediaQueries` in `tokens/index.ts` | the five mode-invariant rungs as TS literals + ready-made `up`/`down` conditions | hand-mirrored, pinned to the CSS by `lint-tokens.js` § 4b |
| `@custom-media --bds-up-*` / `--bds-down-*` in `tokens/custom-media.css` | the same conditions for component CSS (`@media (--bds-down-tablet)`); resolved to px by `postcss-custom-media` (fed by `@csstools/postcss-global-data` in `postcss.config.mjs`), so none reaches `dist/styles.css` | hand-authored, pinned to the CSS rungs by `lint-tokens.js` § 4b-2; literal px in a `components/**/*.css` `@media` is an error (ADR-044) |

A media query is resolved when the stylesheet is authored, not when an attribute is set, so the build-time surface is where a breakpoint can do work at all. `scripts/flatten-tokens-studio.js` pins `breakpoint: 'default'` for the same reason — see the comment on `DEFAULT_MODES`.

**No rung varies by mode.** A sixth rung, `web` (1200 / 800 / 1400), used to — it was a legacy layout-width value rather than a screen breakpoint, bound to no Figma node and called by no consumer, and #2604 retired it from the Foundations library. The collection is still *detected* as multi-modal, because `multiModalCollections` counts mode **groups** (`breakpoint/default|compact|comfortable`), not value variation — so the `EXCLUDED` entry stays load-bearing, and `flatten-tokens-studio.js`'s `breakpoint: 'default'` pin stays value-neutral but keeps the emitted sheet single-valued if a mode-varying rung ever returns.

### Setting a mode

```html
<!-- Static / Astro / Webflow -->
<html data-mode-spacing="comfortable">

<!-- React -->
<html lang="en" data-mode-spacing={density}>

<!-- Per-subtree (rare; see scope-binding pattern) -->
<section data-mode-spacing="compact">…</section>
```

### Adding a new wired collection

1. Update `scripts/generate-modes-css.mjs` `COLLECTIONS` registry with the collection's groups + token-name format.
2. Run `npm run build:modes` — emits `tokens/modes-{collection}.css`.
3. Add the new file to `MODE_FILES` in `scripts/build-dist-tokens.js`.
4. Update this table.
5. Add a Storybook density story showing the mode in action.

`npm run lint-mode-emission-coverage` (in the `tokens-gate` CI job, #932) fails the build if a multi-modal Figma collection has no emitted `[data-mode-*]` block — so a new dormant collection, or a dropped emission, can't slip through. Intentionally-unwired collections (e.g. `breakpoint`) must be named in that script's `EXCLUDED` map with a reason.

## Decision tree — where to put a change

| You want to… | File |
|---|---|
| Fix a value that came out of Figma wrong | Fix it in Figma and re-pull (`bun scripts/pull-variables.js … && node scripts/sync-figma-mcp.js …`). Add a manual `figma-corrections.css` only as a last resort when the Figma source genuinely can't be edited — and bundle it in `scripts/build-dist-tokens.js` after `figma-tokens-dark.css`. |
| Add a semantic token Figma doesn't export | `gap-fills.css` |
| Adjust Brik's brand colors / fonts | `theme-brand-brik.css` — consumers get these automatically when they apply `.theme-brand-brik` to `<body>` |
| Wire a non-color mode pick (Thin/Bold/Compact/Round/etc.) into CSS overrides | `modes-{category}.css` (see § Non-color mode contracts for which modes are wired today) |
| Add a Webflow-facing alias | `bridge.css` (deprecated layer) |
| Touch an auto-generated file | Don't. Fix in Figma and re-pull, or add an override in a manual file. |

## Auto-generated — do not edit

- `figma-tokens.css` — regenerated by `scripts/figma-pull-tokens.sh` and Style Dictionary
- `figma-tokens-dark.css` — same pipeline, dark-mode source

Any manual edit to these is overwritten on the next Figma sync. The correct
place for a correction is a manual file bundled AFTER the auto-generated ones.

## Manual (safe to edit)

- `theme-brand-brik.css` — Brik brand overrides (class-scoped, bundled into dist)
- `modes-borderwidth.css` — borderWidth mode overrides (`[data-mode-borderwidth]`-scoped, bundled into dist)
- `gap-fills.css` — tokens Figma doesn't export yet
- `bridge.css` — legacy Webflow aliases (deprecated, opt-in only)
- `font-audit.css`, `animations.css`, `motion-classes.css` — Storybook/component-level

## Adding a new file to the bundle

1. Add the file to `tokens/`
2. Wire it into `scripts/build-dist-tokens.js` at the correct position (manual files after `figma-tokens-dark.css`, before `gap-fills.css` unless the semantic intent is different)
3. Run `npm run build:dist-tokens` and verify `dist/tokens.css` contains the expected declarations
4. Document here
