# ADR-025 — Page-grid standard (gutter + width-container)

## Status

Accepted. Tracked by #1625 / #1628.

## Context

ADR-023 locked content rhythm, ADR-024 locked component rhythm — both vertical. The horizontal frame around them had no standard: BDS ships `--content-width-*` and `--breakpoint-*` tokens (`tokens/gap-fills.css`) but no gutter token (`grep -i gutter dist/tokens.css` → empty before this change), and the width-container slot that USWDS fills with `grid-container` and GOV.UK with `govuk-width-container` was empty. The costs were measurable:

- **Consumers mint the missing name.** brikdesigns declared its own `--site-gutter: var(--padding-lg)` (`src/app/globals.css`) — the same invention pressure that forced the `--border-width-thin/standard/bold` aliases (gap-fills.css, brik-bds#302).
- **The de-facto gutter was an overloaded token.** The page-edge inset was `--padding-lg` in the section shell, Footer's four `--constrain-*` variants, and the page-structure doc — indistinguishable from `--padding-lg`'s many box-inset uses (buttons, cards), so the page gutter could not be retuned without retuning every large inset.
- **The two documented container defaults disagreed.** `page-structure.mdx` showed `max-width: var(--content-width-default)` (800px) as the container example while the section shell defaults `--content-width-xl` (1280px, ADR-021) — the value every real band uses (`SiteHeader.astro`, `StatsDarkBar.astro`, brikdesigns nav/footer).

## Decision

1. **"Gutter" is two different relationships; only one gets a token.**

   | Sense | Relationship | Mechanism | Governed by |
   |---|---|---|---|
   | Column gutter | sibling ↔ sibling in a `Grid`/`Cluster` row | the primitive's `gap`, `--gap-*` | ADR-024 rhythm map (card↔card `--gap-lg`, etc.) |
   | Page gutter | viewport edge ↔ content band | `padding-inline` on the container | `--gutter-page` (this ADR) |

   This follows the gap-vs-padding rule already locked in the content-rhythm doc: gap is between siblings, padding is the edge. USWDS's `grid-gap` maps to the first sense and needs no new token.

2. **Mint `--gutter-page: var(--padding-lg)`** in `tokens/gap-fills.css` (the hand-authored semantic layer that already hosts `--content-width-*`; nothing is hand-edited in Style-Dictionary output). It is a **fixed alias, not a fluid clamp**: brikdesigns tried a `clamp(1rem, 5vw, 2rem)` gutter and abandoned it because a fluid gutter misaligns consumer containers (nav) from BDS section content at intermediate widths (`globals.css` `--site-gutter` comment). Spacing-mode modulation comes free through `--padding-lg`. TS mirror: `pageGutter` export in `tokens/index.ts`.

3. **The width-container recipe is locked as three declarations** — the shape the section shell (ADR-021), Footer, and brikdesigns' `.container-lg` already share:

   ```css
   max-width: var(--content-width-*);   /* the band */
   margin-inline: auto;                  /* centred */
   padding-inline: var(--gutter-page);   /* the page gutter */
   ```

   The default band is **`--content-width-xl`** (1280px). `page-structure.mdx`'s `--content-width-default` example is corrected to match. Width roles: `narrow` 640 prose/reading columns · `default` 800 standard body sections · `wide` 1024 feature grids, CTA bands · `xl` 1280 page band, hero, header, footer · `full` full-bleed. Marketing sections consume the recipe via `.bds-blueprint-section__container` and override via the ADR-014 hooks — never by hand-rolling; product apps consume it via `Page` (`padding="lg"` is the page-gutter setting). The shell's `padding-inline` fallback and Footer's `--constrain-*` variants now consume `--gutter-page` — value-identical, zero visual change (relevant because Chromatic quota is exhausted, #771).

4. **Breakpoints stay out of CSS custom properties.** Media queries use the `breakpoints` TS export (`tokens/index.ts`); the `--breakpoint-*` CSS vars remain reference-only (custom properties cannot appear in `@media` conditions), and `--content-width-*` values are content constraints, not breakpoints, even where the pixel values coincide. No responsive-spacing axis: density modes remain the only spacing-modulation axis (program scope lock, #1625).

5. **The page grid composes with ADR-021, which is unchanged.** A page is a stack of full-bleed sections; each section's vertical band is the ADR-021 `7vw` clamp, its horizontal band is this recipe. Nothing about the clamp moves.

6. **A gate ships with the standard.** `scripts/lint-page-grid.mjs` fails any component/blueprint CSS rule that declares a page container (`max-width: var(--content-width-*)` + `margin-inline: auto`, or a Footer-style `max(..., calc((100% - var(--content-width-*)) / 2))` inset) with a `padding-inline` that bypasses `--gutter-page`. Same escape hatch as the sibling gates: a reasoned `bds-lint-ignore — <why>`. Wired into pre-commit and CI alongside `lint-content-rhythm`.

## Consequences

- Two files consume the new token in-repo (section shell, Footer) — both value-identical swaps; brikdesigns can delete `--site-gutter` for `--gutter-page` on its next `npm update @brikdesigns/bds` (follow-up in that repo, not this change).
- Retuning the page gutter is now one token edit, decoupled from `--padding-lg`'s box-inset uses.
- `Page`'s `padding` prop scale (`none/sm/md/lg`) is untouched — product shells legitimately run tighter than the marketing gutter; `lg` is the one that equals `--gutter-page`.
- A future fluid gutter (if the no-responsive-axis scope lock is ever lifted) is a one-line change to `--gutter-page`'s value — the consuming recipe doesn't move.
- Docs: `build-standards/page-grid.mdx` (new) owns the standard; `page-structure.mdx` container section corrected and now defers to it.

## Amendment — 2026-08-30 (#2173): renamed to `--page-inset` + tier fix

Two problems with Decision 2 surfaced when #2173 revisited the token's tier classification:

1. **Name.** "Gutter" conventionally means the space *between* columns (Decision 1's own first row), but every consumer applies this token to `padding-inline` — the page-*edge* inset, never a grid gap (verified: zero `--gap-*`-for-`padding-inline` uses across BDS + brikdesigns). The name contradicted the decision that minted it.

2. **Tier.** `--gutter-page: var(--padding-lg)` is a Semantic token referencing another Semantic token (t3→t3). The tier model is "higher tiers reference lower tiers" (token-anatomy § Tier); a Semantic must resolve to a Primitive. Decision 2's "mode modulation comes free through `--padding-lg`" bought that convenience with an off-model reference that no gate caught.

**Resolution:**

- **Renamed `--gutter-page` → `--page-inset`.** The old name is retained as a `@deprecated` alias (`--gutter-page: var(--page-inset)`) until downstream consumers (brikdesigns) migrate, then removed. TS mirror renamed `pageGutter` → `pageInset` (old export kept, `@deprecated`).
- **Made it tier-clean.** `--page-inset: var(--space-600)` at base, with its own `[data-mode-spacing]` ladder referencing Primitives directly (`--space-400`/`--space-800`/`--space-1200` for compact/comfortable/spacious) — mirroring `--padding-lg`'s density steps without aliasing it. `gap-fills.css` loads after `modes-spacing.css`, so the ladder wins by source order. This replaces "modulation comes free through `--padding-lg`" (Decision 2) — the modulation is now the token's own, over Primitives.
- **`lint-page-grid` accepts `--page-inset`** (and the deprecated `--gutter-page` alias during migration).
- **New gate: `lint-token-tiers`** (`scripts/lint-token-tiers.mjs`, wired into `validate` + `tokens-gate.yml`) fails a Semantic-named token referencing another Semantic (t3→t3) — the class of defect this token was, and enough to keep `--page-inset` (Semantic-named) from regressing. Five pre-existing t3→t3 hits it surfaced are tracked in #2186. The broader rule ("only a Component `--bds-*` may reference a Semantic") collides with BDS's sanctioned role-aliasing (`bridge.css`, `--border-focus`, `--tooltip-text`); designing that enforcement is deferred to #2187.

Decision 2's fluid-clamp rejection still stands: `--page-inset` remains a stepped token, not a `clamp()`.
