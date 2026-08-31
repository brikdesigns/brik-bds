# ADR-036 — Non-CSS-expressible theming axes resolve via React context, not `[data-mode-*]`: icon weight is the first

**Status:** Proposed
**Date:** 2026-08-31
**Supersedes:** —
**Superseded by:** —
**Owner:** Nick Stanerson
**Related:** [#1050](https://github.com/brikdesigns/brik-bds/issues/1050) (this ADR's issue — wire icon style into per-client theming), [#340](https://github.com/brikdesigns/brik-bds/issues/340) (data-mode overrides for non-color tokens — the paradigm this axis was expected to join), [brik-client-portal#1606](https://github.com/brikdesigns/brik-client-portal/issues/1606) (portal fill→outline migration — the brand-default anchor), [token-anatomy.mdx](../../docs-site/content/docs/foundation/token-anatomy.mdx) (Mode / Tier canon)

## Context

[#340](https://github.com/brikdesigns/brik-bds/issues/340) wires per-client, non-color theming axes as `[data-mode-*]` CSS blocks: set an attribute on `:root` (e.g. `[data-mode-spacing="compact"]`) and every downstream `var(--padding-*)` re-resolves through the cascade for free. Spacing (#483), typography (#920), border-radius (#929), and elevation (#930) all shipped this way through the `COLLECTIONS` registry in `scripts/generate-modes-css.mjs`.

[#1050](https://github.com/brikdesigns/brik-bds/issues/1050) was filed to add **icon style (weight: outline vs fill)** as the next such collection — emit `modes-icon.css` keyed to `[data-mode-icon]`, define an `--icon-weight` token. The premise was that icon weight is "the same gap #340 closes for other non-color collections."

**It is not, and the mechanism proves it.** Phosphor encodes weight in the icon *name* — `ph:eye` (regular) vs `ph:eye-fill` — and [Icon.tsx](../../components/ui/Icon/Icon.tsx) applies weight by rewriting that name string in JavaScript (`applyWeight`), which selects a **different SVG asset**. A CSS custom property cannot carry that: no `var(--icon-weight)` can change which glyph Iconify loads. Every other #340 axis is a CSS value the cascade resolves at paint; icon weight is an asset chosen in JS before paint. Confirmed against the source: `Object.keys(tokens-studio.json)` filtered for `icon` returns `[]` — there is no `icon/{mode}` Figma collection, and `lint-mode-emission-coverage.mjs` (#932) does not list one, so no coverage guard forces the CSS path.

## Decision

**A theming axis that is not expressible as a CSS value resolves via React context, not a `[data-mode-*]` CSS token. Icon weight is the first such axis.**

1. **The default weight travels on `IconWeightContext`** ([components/ui/Icon/icon-weight.ts](../../components/ui/Icon/icon-weight.ts)), a standalone module both `<Icon>` and `ThemeProvider` import — no Icon↔ThemeProvider cycle. `ThemeProvider` gains a `defaultIconWeight` prop that seeds the context; a whole app or one client theme flips outline↔fill with no call-site change.

2. **Resolution precedence is prop → context → `'bold'`.** `<Icon>`'s `weight` prop, when given, wins per-icon; otherwise the ambient provider default applies; with no provider mounted it falls back to `DEFAULT_ICON_WEIGHT` (`'bold'`) — the pre-provider behaviour, unchanged. The context read is **non-throwing** (unlike `useTheme`), because `<Icon>` renders in trees with no provider above it.

3. **No `[data-mode-icon]`, no `modes-icon.css`, no Figma `icon` collection, no `--icon-weight` CSS token.** Icon weight is out of the #340 CSS-emission paradigm entirely. It needs no `EXCLUDED` entry in `lint-mode-emission-coverage.mjs` because it is not a multi-modal Figma collection in the first place.

## Consequences

- **#1050's acceptance criteria are rewritten** off the CSS-collection framing onto the provider framing, and it stays a #340 child (it still serves #340's intent — make a non-color aspect client-themeable — by a different means). A note on #340 records that icon resolves via context so no one expects an emitted block or an `EXCLUDED` row.
- **Precedent for future axes.** Any later theming axis that selects an asset or a JS-decided value rather than a CSS value (icon corner/stroke family, a font *file* swap as opposed to `font-family`, an illustration set) follows this ADR — context, not `[data-mode-*]`. An axis that *is* a CSS value still joins the #340 `COLLECTIONS` registry. The dividing test: **can the cascade carry the value?**
- **Offline-subset gap surfaced (not closed here).** The bundled Phosphor subset carries fill variants only where BDS source already uses them (today just `star-fill`). A consumer that sets `defaultIconWeight="fill"` must bring the fill glyphs offline via `addBrikIcons()` or their own `gen:icons`, else those icons fall through to the Iconify CDN. Filed as a follow-up rather than fixed in this change.
- **A future reader** comparing the axes will see spacing/type/radius/elevation as `[data-mode-*]` CSS and icon weight as a React context, and this ADR is why: same theming goal, different substrate.
