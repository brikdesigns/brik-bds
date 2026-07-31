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

## Consequences

- **Phased rollout:** (1) build `ContentBlock` + `Prose` + `Blocks/` stories + build-standards doc updates in brik-bds → publish (#1584); (2) consume in the brikdesigns events page (brikdesigns#790) as the validation case; (3) propagate to portal + client sites (#1585).
- The default spacing mode has a compressed tight-vs-medium step (6→8px); if the Storybook visual review finds it too flat, the fix is a **token request to BDS**, not an invented token.
- The events-cleanup item 4 (remove form top-accent) is decoupled and ships independently — it has no Block-layer dependency.
- `Split`/`Row` and atomic text components remain open follow-ups, explicitly out of this scope.
