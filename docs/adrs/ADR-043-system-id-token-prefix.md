# ADR-043 — System ID: every token tier leads with the ID of the system that owns it

**Status:** Accepted 2026-10-01 — ratified (§ Ratification), and the grammar file shipped in #2673 (§ Enforcement)
**Date:** 2026-10-01
**Supersedes:** — (supersedes *in part*: the "same names, brand values" theming contract, listed under § Consequences)
**Superseded by:** —
**Owner:** Nick Stanerson
**Related:** [#2668](https://github.com/brikdesigns/brik-bds/issues/2668) (this ADR's Project), [#2669](https://github.com/brikdesigns/brik-bds/issues/2669) (grammar file — the enforcement artifact), [#2670](https://github.com/brikdesigns/brik-bds/issues/2670) (BDS rename + bridge), [#2666](https://github.com/brikdesigns/brik-bds/issues/2666) (three `--color-*` grammars), [#2645](https://github.com/brikdesigns/brik-bds/issues/2645) (ADR-034 ambiguity on tenant prefixes), [#1949](https://github.com/brikdesigns/brik-bds/issues/1949) (colour-ramp step vocabulary), [ADR-014](./ADR-014-component-token-hook-namespace.md), [ADR-033](./ADR-033-naming-canon-one-word-per-concept.md), [ADR-034](./ADR-034-token-tier-derived-tokens-and-consumer-namespace.md), brik-llm [ADR-025](https://github.com/brikdesigns/brik-llm/blob/main/software/docs/adr/ADR-025-client-token-ownership.md), [token-anatomy.mdx](../../docs-site/content/docs/foundation/token-anatomy.mdx)

## The operator's words

This ADR records a direction the operator set. It is drafted by an agent, so the direction is quoted and the mechanics are proposed.

OPERATOR SAID 2026-10-01 (chat, #2655 session): "We're needing to add a new layer for "ID" to identify the system for clearer naming. This "ID" would be at the start of the design token (i.e. bds-;vale-;birdwell-)."

OPERATOR SAID 2026-10-01 (chat, #2655 session): "A. prefix needed, we can't shoehorn this decision - we need to disasemble and rewire."

OPERATOR SAID 2026-10-01 (chat, #2655 session): "B. Yes - we were under the impression this was already addressed and signed off on? Going from a color naming system of lightest to darkest to a numeric system to compliment our color rail system we trigger in brik-llm for branding work."

OPERATOR SAID 2026-10-01 (chat, #2655 session): "C. [...] It stands for system identifier to help us understand what system (repo) the design decision is tied to. Our tiers currently show tier 4 as including id (i.e. bds-), but tier 3 - semantic tokens - would also require as would tier 2 - primitives since these are all decisions tied to a brand system that belongs to a repo. [...] (i.e. bds-background-brand-primary, vale-partners-background-brand-primary, etc."

## Ratification

The operator answered in a structured prompt (chat, `/resume 2668 brikdesigns/brik-bds` session). Each answer below is the option they selected, quoted verbatim:

- OPERATOR SAID 2026-10-01 (chat, /resume 2668 session), on "Ratify ADR-043 (PR #2671) as written?": "Ratify as written (Recommended)"
- OPERATOR SAID 2026-10-01 (chat, /resume 2668 session), on open question 1, tenant handles: "vale-partners, birdwell (Recommended)"
- OPERATOR SAID 2026-10-01 (chat, /resume 2668 session), on open question 2, Brik's own brand: "bds (Recommended)"

Both open questions are resolved in § Resolved questions. Per § Enforcement, the ADR became **Accepted** when #2669 shipped (#2673) with `lint-naming-canon` reading the grammar file.

## Context

**Three agents produced three formulas for the same token.** One of them, `--color-{tenant}-{family}-{step}`, appears in no doc. The agents were not ignoring the canon. The canon disagrees with itself:

| Where | Formula it states |
|---|---|
| [token-anatomy.mdx:14](../../docs-site/content/docs/foundation/token-anatomy.mdx) | `--{purpose}-{role}[-{state}]` |
| token-anatomy.mdx:66 | Primitive `--color-{family}-{step}`; Semantic "client themes override **values** with same **names**" |
| token-anatomy.mdx:124-145 | a colour segment table that never defines `{family}` |

**Ownership is invisible in the name.** Today a tenant's brand value and BDS's default share one name. The tenant's `@layer client-theme` file wins the cascade. Nothing in `--background-brand-primary` says which system decided it.

Five docs pages teach that contract as a rule:

- token-anatomy.mdx:66
- [theming/index.mdx:34](../../docs-site/content/docs/theming/index.mdx)
- [figma-library-architecture.mdx:22](../../docs-site/content/docs/getting-started/figma-library-architecture.mdx)
- [framework-guides.mdx:60](../../docs-site/content/docs/getting-started/framework-guides.mdx)
- brik-llm ADR-025 § 2 ("redefines **the same canonical names** with brand values")

**Tenants already mint their own prefixes, outside any grammar.** Counted in #2645:

- `--tncld-*`: 14 names
- `--vale-*`: 3
- `--portal-*`: 16

The portal generator also writes tenant colours into the BDS Primitive namespace with no tenant segment (brik-client-portal#4413).

**Two step vocabularies share every colour ramp.** In `dist/tokens.css`:

- 99 numeric primitives: 9 families × `50`–`950`
- 54 word-step primitives: 9 families × `lightest…darkest`, at `:340-393`

ADR-033 § 3 set numeric steps for Primitives and explicitly left the colour ramps undispositioned. That gap became #1949. The operator believed this was settled (quote B). It was decided only in issue comments, never in an ADR, so no gate could enforce it. The full drift trail is in `docs/reports/2026-10-01-token-naming-systems-audit.html`.

**Only Tier 4 carries an ID today.** ADR-014 made `--bds-{component}-{property}` the Component namespace. 54 distinct `--bds-*` names appear in `components/`. Only 3 are declared in `dist/tokens.css`.

## Decision

### 1. ID is the seventh concept

token-anatomy's "Six concepts, six words" table gains a row:

| Concept | Term | Question it answers | Values |
|---|---|---|---|
| System identifier | **ID** | Which *system* owns this decision? | a handle from the ID registry: `bds` · `vale-partners` · … |

The term is **ID**, not "Layer". **Layer** already names the CSS `@layer` that carries a value (`bds-tokens` · `bds-components` · `client-theme` · `client-overrides`). Two meanings for one word is the drift ADR-033 exists to stop.

### 2. The ID leads the name at every tier

```text
--{id}-{body}
```

The ID is always the first segment. The body is what the tier already defines, unchanged in shape:

| Tier | Body | Example |
|---|---|---|
| Raw | — (a literal, never a name) | `#e35335` |
| Primitive | `color-{family}-{step}` · `{scale}-{step}` | `--bds-color-poppy-500`, `--vale-partners-color-{family}-500`, `--bds-space-400` |
| Semantic | `{purpose}-{role}[-{state}]` | `--bds-background-brand-primary`, `--vale-partners-background-brand-primary` |
| Component | `{component}-{property}` | `--bds-button-padding` |

**The Component tier's ID is always `bds`.** ADR-034 still holds there: only BDS authors components, so only BDS authors Component tokens. A tenant sets a BDS hook; it never mints one.

**A tenant declares only what its Brand Kit Library owns.** That means colour ramps, brand Semantic roles and font families. Foundations scales (`space`, `size`, `border-width`, …) are `bds` only.

### 3. IDs come from a registry, and an agent may not mint one

The ID is a **registered handle** mapped to the repo that owns the system. It is not derived from the repo slug. The operator's own example `bds` is not the slug `brik-bds`, and a mechanical slug rule would yield `--brik-client-portal-*`.

The registry lives in the grammar file (#2669). Its initial entries (`vale-partners` and `birdwell` ratified, § Resolved questions):

| ID | System (repo) | Library |
|---|---|---|
| `bds` | `brik-bds` | Foundations + the default (Brik) Brand Kit that ships in `dist/tokens.css` |
| `vale-partners` | `web/vale-partners` | Vale Partners Brand Kit |
| `tncld` | `web/tncld` | TNCLD Brand Kit |
| `birdwell` | `web/birdwell-mutlak` | Birdwell Brand Kit |
| `portal` | `product/brik-client-portal` | portal product theme |

Rules:

- An ID is lowercase kebab-case.
- An ID never equals a reserved word (§ 5).
- An ID never prefixes another registered ID.

This extends brik-llm ADR-025 § 3: **an agent may propose token values, never token names and never IDs.** A new ID is a `brik-bds` PR to the registry, reviewed by a human.

### 4. Colour Primitive steps are numeric, `50`–`950`

A colour Primitive step is one of `50 · 100 · 200 · 300 · 400 · 500 · 600 · 700 · 800 · 900 · 950`. It is the numeric system the operator ties to the brik-llm colour rail (quote B). This ADR does not restate that rail's output; #2669 records it in the grammar file after reading its source.

The word steps (`lightest · lighter · light · dark · darker · darkest · base`) retire from every tier and every system. This dispositions #1949 and closes the gap ADR-033 § Enforcement named.

### 5. The first body segment names the tier, so component stems may not reuse it

The ID makes every token start with the same handle. Since Semantic and Component tokens now share that prefix, the segment after the ID is what tells the tiers apart:

- `color` or a scale word → **Primitive**
- a purpose word (`text` · `surface` · `background` · `border` · `page` · …) → **Semantic**
- anything else → a **Component** stem

So a component stem may not begin with a purpose, scale or `color` word. Measured on 2026-10-01, two live knobs break this and get renamed in #2670:

- `--bds-text-area-min-width` reads as Semantic `text`
- `--bds-page-padding-inline` reads as Semantic `page`

The closed word lists are data in the grammar file. They are not prose here.

### 6. A tenant binds BDS names explicitly instead of silently redefining them

Components read only `--bds-*` names. A tenant theme declares its own values under its own ID. It then binds each BDS Semantic name it changes, in `@layer client-theme`:

```css
@layer client-theme {
  .theme-vale-partners {
    --vale-partners-color-{family}-500: /* brand value */;
    --vale-partners-background-brand-primary: var(--vale-partners-color-{family}-500);
    --bds-background-brand-primary: var(--vale-partners-background-brand-primary);
  }
}
```

The cascade mechanism is unchanged: `@layer client-theme` still wins over `@layer bds-tokens`. What changes is that the override is a visible, greppable binding from one system's name to another's. It is no longer an anonymous re-declaration.

## Consequences

**Superseded in part.** Each of these passages is rewritten to § 6:

- token-anatomy.mdx:66 ("client themes override **values** with same **names**")
- theming/index.mdx:34
- figma-library-architecture.mdx:22
- framework-guides.mdx:60
- brik-llm ADR-025 § 2. Its § 1 ("BDS owns token names") stands: BDS owns the grammar, the registry and every body.

**Amended:**

- ADR-014 generalises from "Tier 4 is `--bds-`" to "every tier leads with an ID; Tier 4's ID is `bds`".
- ADR-034's "no consumer-authored namespace" stands for the Component tier. For Primitive and Semantic it is replaced by § 3: a tenant prefix is legitimate if, and only if, it is a registered ID followed by a grammar body. This resolves #2645.

**Gates that must learn the ID** (each tracked under #2668):

| Gate | Today | Change |
|---|---|---|
| `lint-naming-canon.mjs:124-297`, `lint-token-purpose-slots.mjs` | hardcoded vocabularies | read the grammar file (#2669) |
| `lint-tokens.js:649,1044` | skips `--bds-*` | validate `--bds-*` against the grammar (#2651) |
| `canonical-check.mjs:56` | 5 un-prefixed families | registered ID + body |
| portal `assertCanonicalThemeCss` | four un-prefixed semantic prefixes | accept registered tenant ID + body (brik-client-portal#4413) |
| brik-llm `token-name-guard.sh:28` | 5 prefix families | read the packaged grammar file |

**Migration.**

- Every BDS Primitive and Semantic name moves to `--bds-{body}` behind a generated bridge, so the six consumers keep resolving (#2670).
- The 54 word-step primitives leave `dist/tokens.css` in the same pass. #1740, which migrates consumers off 6-step names, is its consumer half.
- Tenants move their existing `--tncld-*`, `--vale-*` and `--portal-*` names onto registry IDs.

**Retrieval.** The RAG memory chunk `memory.feedback.bds-token-anatomy` still teaches `--color-poppy-dark`. It must be rewritten when token-anatomy.mdx changes. Otherwise agents keep reading the old formula after the docs move.

**No token values change.** This is naming and binding only.

## Enforcement

This ADR moves to **Accepted** when both are true. Both were met on 2026-10-01:

- the operator ratifies it (§ Ratification)
- the grammar file (#2669) ships with `lint-naming-canon` reading it (#2673, `scripts/lint-naming-canon.mjs:121-125`)

Budget: no new workflow. #2669 extends the existing required `naming-canon-check.yml` job.

## Alternatives considered

- **Put the ID inside the colour family (`--color-vale-partners-{family}-500`), with no ID on Semantic tokens.** This was the agent's first recommendation. It touches the fewest names. Rejected by the operator (quotes A and C): it shoehorns ownership into one segment of one tier, and it keeps Semantic ownership invisible.
- **ID on the Component tier only (ADR-014 as it stands).** Rejected by quote C: Primitive and Semantic tokens are decisions owned by a brand system too.
- **Keep the same-name override, and add the ID only where a tenant mints a new name.** Rejected: an override would still not say who decided it, which is the problem the ID exists to solve.
- **Derive the ID from the repo slug.** Rejected: it contradicts the operator's own `bds` example, and gives `--brik-client-portal-*`.

## Resolved questions

1. **Tenant handles.** Resolved 2026-10-01: `vale-partners` (not `vale`) and `birdwell` (not `birdwell-mutlak`), as registered in § 3. Operator quote in § Ratification.
2. **Brik's own brand.** Resolved 2026-10-01: Brik's Brand Kit ships as BDS's default under `bds`. There is no separate `brik` ID. Operator quote in § Ratification.
