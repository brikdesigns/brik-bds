# Token CSS Cascade

Canonical reference for what each file in `tokens/` does, where it loads,
and how to decide where a change belongs.

## Vocabulary

This doc uses the locked BDS token vocabulary (see [Token Anatomy](../docs-site/content/docs/foundation/token-anatomy.mdx) for the full disambiguation map):

- **Library** — the logical source of token definitions (Foundations Library / [Client] Brand Kit Library). Today: Figma files managed via Tokens Studio.
- **Layer** — a CSS `@layer` in the cascade (`bds-tokens` / `bds-components` / `client-theme` / `client-overrides`). Where a token's *value* lands at runtime.
- **Tier** — a token's abstraction level (Raw / Primitive / Semantic / Component). Independent from Layer.
- **Mode** — an orthogonal axis varying token values (color light/dark, borderwidth thin/standard/bold, etc.).
- **Theming Dimension** — composable subsystem of the Theming Tenet (Tokens / Atmospheres / Layout / Blueprints).
- **Tenet** — system pillar (Foundation / Theming / Motion / Content).

**Older docs called the BDS-bundle vs client-theme split "Tier 1 / Tier 2".** That nomenclature is retired — "Tier" now refers exclusively to token abstraction (Raw/Primitive/Semantic/Component). The runtime cascade is described as CSS Layers.

## What ships to consumers

`dist/tokens.css` is the bundle shipped to downstream consumers (portal,
renew-pms, brikdesigns) via `@brikdesigns/bds/tokens.css`. Built by
`scripts/build-dist-tokens.js`, which concatenates — in this order:

1. `figma-tokens.css` — auto-generated light-mode tokens (`:root`)
2. `figma-tokens-dark.css` — auto-generated dark-mode tokens (`:root[data-theme="dark"]`)
3. `theme-brand-brik.css` — Brik brand overrides (scoped to `.theme-brand-brik` class)
4. `modes-borderwidth.css` — borderWidth mode overrides (`[data-mode-borderwidth="thin|bold"]`)
5. `modes-spacing.css` — spacing density mode overrides (`[data-mode-spacing="compact|comfortable|spacious"]`) — auto-generated from `design-tokens/tokens-studio.json` via `npm run build:modes`
6. `modes-typography.css` — typography heading-scale-variant overrides (`[data-mode-typography="compact|comfortable|spacious|expressive"]`) — auto-generated from `design-tokens/tokens-studio.json` via `npm run build:modes`
7. `modes-borderradius.css` — corner-radius mode overrides (`[data-mode-radius="sharp|round|pill"]`) — auto-generated via `npm run build:modes`. Note the attribute is `data-mode-radius` while the source collection is `border-radius`; overrides the semantic `--border-radius-{none,sm,md,lg}` (defined in figma-tokens.css above, so it lands with the other mode files).
8. `gap-fills.css` — manual tokens not yet in Figma
9. `modes-elevation.css` — elevation depth mode overrides (`[data-mode-elevation="flat"]`) — auto-generated via `npm run build:modes`. **Concatenated after gap-fills.css, not with the other mode files**, because it overrides the `:root`-scoped `--shadow-*` tokens defined *in* gap-fills; its bare `[data-mode-elevation]` selector ties `:root` on specificity and must win by source order. Ships `flat` only — Figma source has no distinct `lifted`/`dramatic` values (see the mode-contracts table).
10. `ratios.css` — `--aspect-*` tokens (dimensionless `<ratio>`, can't be a Figma Variable; BDS #486)
11. `fluid-type.css` — `--display-fluid-*` clamp() tier (viewport-fluid marketing display type; can't be a Figma Variable; brik-bds#959)
12. `animations.css` — shared keyframe library (`bds-spin`, `bds-pulse`, `bds-pop`, etc.) — required by any component CSS that references these names

**Not bundled:** `bridge.css` (opt-in via separate export), `font-audit.css`
(Storybook-only), `motion-classes.css` (opt-in utility classes — consumers import
directly if they want them), `storybook-themes.ts`, `index.ts`.

## Dark-mode selector contract

**Single switch across the ecosystem: `[data-theme="dark"]` attribute on `<html>`.**

- Figma-generated tokens: `:root[data-theme="dark"]`
- Brand overrides: `.theme-brand-brik[data-theme="dark"]`
- Storybook sets the attribute via the theme toolbar (`preview.tsx`)
- React consumers use `ThemeProvider` (which sets it automatically when `applyToBody` is true)
- Astro/Webflow/static consumers set it manually on `<html>`

No consumer should toggle a `.dark` class — the attribute is the only switch.

## Non-color mode contracts

**One switch per orthogonal axis: `data-mode-{collection}` attribute on `<html>`** (or any subtree). Modes compose freely with `data-theme` and with each other; each block targets a distinct attribute, so applying multiple at once layers cleanly.

| Collection | Attribute | Default (no attr) | Other values | Wired? |
|---|---|---|---|---|
| `borderwidth` | `data-mode-borderwidth` | `default` | `thin`, `bold` | ✅ `modes-borderwidth.css` |
| `spacing` | `data-mode-spacing` | `default` | `compact`, `comfortable`, `spacious` | ✅ `modes-spacing.css` |
| `border-radius` | `data-mode-radius` | `soft` | `sharp`, `round`, `pill` | ✅ `modes-borderradius.css` (attr `data-mode-radius`; source collection `border-radius`) |
| `typography` | `data-mode-typography` | `default` | `compact`, `comfortable`, `spacious`, `expressive` | ✅ `modes-typography.css` (heading-* only; display-* mode-invariant) |
| `elevation` | `data-mode-elevation` | `subtle` | `flat`, `lifted`, `dramatic` | ✅ `modes-elevation.css` — `flat`→`--shadow-*: 0px 0px 0px 0px transparent` (a zeroed shorthand, not `none`: overriding a box-shadow token with the `none` keyword gives one name two value types, which ADR-033 § 5 rejects). `lifted`/`dramatic` compose the full `0px y blur spread rgba(0,0,0,α)` from the elevation collection's y-offset + blur-radius + spread + opacity sub-tokens (#2243; x is invariantly 0, color always black). `subtle` is the default — uses the hand-authored `--shadow-*` in gap-fills.css |
| `breakpoint` | `data-mode-breakpoint` | `default` | `compact`, `comfortable` | ⏳ pending #340 |
| `icon` | `data-mode-icon` | `solid` | `outline` | ⏳ pending #340 |

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
| Wire a non-color mode pick (Thin/Bold/Compact/Round/etc.) into CSS overrides | `modes-{category}.css` (borderwidth, spacing, and typography modes are wired today — see the build order above; add `modes-radius.css`, etc. as each new mode is wired) |
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
