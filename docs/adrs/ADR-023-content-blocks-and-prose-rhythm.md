# ADR-023 — Content blocks and prose rhythm

## Status

Accepted — taxonomy locked; implementation phased (see Consequences). Tracked by #1583.

## Context

BDS's five-layer composition model ([composition-layers.mdx](../../docs-site/content/docs/build-standards/composition-layers.mdx)) names a **Block** layer with `ContentBlock`, `MediaBlock`, `Stat` as examples — but none of those exist in code. Text is rendered as raw `<h2>`/`<p>` behind blueprint slot classes ([page-structure.mdx](../../docs-site/content/docs/build-standards/page-structure.mdx)), and there is no shared standard for the vertical spacing **between** those text slots. Consumers (the brikdesigns events landing page; forthcoming portal and client-site content surfaces) each re-derive prose spacing ad hoc — e.g. brikdesigns' `.rich-content > * + * { margin-top: var(--gap-md) }` applies one flat gap to every child regardless of role.

The trigger was an events-landing cleanup (BRIK-WEB-68): a single CMS prose blob rendered as 20 undifferentiated `<p>`s with uniform spacing, no title/subtitle/paragraph hierarchy. Rather than patch one page, we standardize the Block layer so portal, web, and client sites inherit one spacing system. This ADR extends the composition program (#565); #564 documented the Block layer, this work implements it.

## Decision

1. **No text atoms yet (slots, not `Heading`/`Paragraph` components).** Extend the existing slot model instead of introducing atomic text components that would compete with blueprint slot classes — two ways to render a title is the parallel-taxonomy failure mode behind the token rollbacks (#512/#553). Atomic `Heading`/`Paragraph` are deferred until a standalone-atom need appears.

2. **Two Block components, one shared token scale:**
   - **`ContentBlock`** — a fixed-slot unit (`title` / `subtitle` / `description` / `actions`) that owns the vertical rhythm **between its slots**, mirroring how `SheetSection` owns section-gap rhythm.
   - **`Prose`** — the free-form CMS-HTML case (formalizes today's `.rich-content`), owning element-adjacency rhythm (`h2+p`, `p+p`) for open-ended rich text.

   Fixed slots and free prose need different spacing mechanisms (named-slot adjacency vs. element adjacency); one component with a `mode` prop would hide two behaviors behind one name.

3. **Semantic spacing map — mode-tied `--gap-*`, monotonic in every spacing mode:**

   | Relationship | Token | default | compact | comfortable | spacious |
   |---|---|---|---|---|---|
   | title → subtitle (tight) | `--gap-sm` | 6 | 2 | 8 | 16 |
   | title/subtitle/description → paragraph or actions (medium) | `--gap-md` | 8 | 4 | 32 | 48 |
   | paragraph → paragraph (wide) | `--gap-lg` | 16 | 8 | 40 | 56 |
   | block → block (unchanged) | `--gap-xl` | 24 | 16 | 48 | 104 |

   `--gap-xs` and `--gap-tiny` are **excluded**: both resolve to `0px` in compact/comfortable/spacious modes (verified in `dist/tokens.css`), which would collapse the tight gap outside default mode. `sm/md/lg` are the tightest tokens that stay non-zero and monotonic across all four modes and nest under the existing `--gap-xl` section gap without collision.

4. **`Blocks/` Storybook category.** Adds the missing layer→category mapping (`Layouts/` and `Containers/` already mirror their layers; the Block layer had no category and `Field` was misfiled under `Components/`). Houses `ContentBlock` + `Prose` now; `MediaBlock`/`Stat`/`Field` migrate later. Rejected `Text/` — the Block layer also holds non-text units (`MediaBlock`, `Stat`), so a text-scoped category would fracture one layer across two.

5. **Blocks are layout-agnostic.** `ContentBlock`/`Prose` never own column layout; 2-col/3-col arrangement comes from Layout primitives (`Grid`, `Stack`) per the "orientation comes from the layout primitive, not a variant" rule. The `Split`/`Row` Layout primitives (named in docs, not yet built) are a **deferred, separate Layout-layer effort** — this Block-layer work depends only on the shipped `Stack`/`Grid`.

## Amendment 2026-08-16 — surface adaptation is a variant prop on the Block (#1859)

Blocks are layout-agnostic (pt-5) but they are **not** surface-agnostic. `ContentBlock` pinned its slots to `--text-primary` / `--text-secondary`, so a block on a filled brand band had no supported route — and `SectionHeader` (ADR-032), which composes it, forwarded no colour concern either. The only way in was a per-instance `style={{ color }}` pushed from the consumer into a slot the Block owns, which is the pattern brikdesigns/brikdesigns#930 and #932 spent two slices removing.

**Decision: a Block owns its own inverse story, expressed as a boolean variant prop that recolours only its own slots.** `ContentBlock` gains `onColor?: boolean` → `.bds-content-block--on-color`, setting `title`/`subtitle`/`description` to `--text-on-color-dark`. `SectionHeader` accepts and forwards it, adding no CSS of its own — it still owns only measure + alignment.

This is the shape the system had already settled on in four places before this ADR: `TabBar` `onColor` → `--on-color` (`TabBar.tsx:45`, `TabBar.css:197,235,255`), `Footer --inverse` (`Footer.css:256-259`), `CardTestimonial --brand` (`CardTestimonial.css:38,51,73,86`), `Banner --tone-announcement` (`Banner.css:67-69`). `onColor` reuses TabBar's existing prop name rather than minting a parallel `tone="inverse"` axis. Per `component-build.md`, an on-dark visual contract is **Variant** tier, so it earns a dedicated story on both components.

**Rejected: a surface-context class the band sets, which slots inherit from.** brikdesigns#937 proposed this and guessed it fit the cascade contract better. It doesn't:

- No precedent exists — `rg -n "surface-context|data-surface|bds-on-|--on-surface" components tokens docs docs-site/content` returns empty. It would be a new cascade concept invented for one call site.
- It inverts slot ownership: an ancestor a component does not control would restyle that component's slots at a distance, which is what the ADR-017 grammar and the slot-ownership model exist to prevent. A Block that cannot be read in isolation to know its own colours is the parallel-taxonomy failure of pt-1, one layer up.
- It does not compose — two nested bands, or a neutral card inside a brand band, would need an un-set escape hatch the class model has no room for.

**Contrast is recorded, not raised.** `--text-on-color-dark` on `--surface-brand-primary` is **3.78:1 in both modes** (`--surface-brand-primary` is `--color-poppy-500` under `.theme-brand-brik` in light *and* dark), verified by `npm run contrast-gate`. That clears AA-large (3:1) and fails AA (4.5:1), which is the locked policy for brand-primary fills (`tokens/contrast-pairings.json` policy line, BDS-22 / ADR-015) and what `Banner --tone-announcement` already ships. The pairing is added to the dataset with the honest AA-large threshold and a note that this block, unlike a control label, carries body copy. Raising it means darkening the brand fill — a brand decision under #526, not a component one. Consumers keep band descriptions short.

## Consequences

- **Phased rollout:** (1) build `ContentBlock` + `Prose` + `Blocks/` stories + build-standards doc updates in brik-bds → publish (#1584); (2) consume in the brikdesigns events page (brikdesigns#790) as the validation case; (3) propagate to portal + client sites (#1585).
- The default spacing mode has a compressed tight-vs-medium step (6→8px); if the Storybook visual review finds it too flat, the fix is a **token request to BDS**, not an invented token.
- The events-cleanup item 4 (remove form top-accent) is decoupled and ships independently — it has no Block-layer dependency.
- `Split`/`Row` and atomic text components remain open follow-ups, explicitly out of this scope.
- Per the 2026-08-16 amendment: any future Block needing an inverse story follows `onColor`, not a context class. `Prose` has no `onColor` yet — it is unblocked but unbuilt, and gets one when a consumer needs CMS prose on a filled band.
