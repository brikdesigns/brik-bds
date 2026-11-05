# ADR-048 — A named look is a Visual Style: the theming taxonomy, one name per concept

**Status:** **Accepted** 2026-11-05. Retiring "bundle" for named looks is the operator's call (§ 1). The exact name and §§ 2–7 are AGENT DECIDED (revisable). Each one's revert is in § Decision.
**Date:** 2026-11-05
**Supersedes:** —
**Superseded by:** —
**Owner:** Nick Stanerson
**Related:** [brik-bds#2851](https://github.com/brikdesigns/brik-bds/issues/2851) (theming plan; step 5 builds what § 7 homes), [ADR-033](./ADR-033-naming-canon-one-word-per-concept.md) (one word per concept), [ADR-039](./ADR-039-blueprint-parameterization-axes.md) (the Style axis), brik-llm ADR-050 (the DesignDecisionSet and its `PICK_TABLE`), [Glossary](../../docs-site/content/docs/getting-started/glossary.mdx) (the reader-facing copy of these definitions)

## Context

The website builder is meant to turn a client's picks into an accurate mockup. Picks include a look such as Dark, Modern or Playful, plus inspiration sites and brand guidelines. The operator calls those named looks "bundles". They want a set of them that grows with the client base, the way Framer's template marketplace has a Style filter beside an industry category grid. They asked whether industry packs and bundles are the same thing.

Earlier attempts drifted because the words overlap. Each collision below was read on 2026-11-05:

| Word | Meanings in use today | Evidence |
|---|---|---|
| bundle | 1. `dist/tokens.css`, "the BDS bundle". 2. A service offering, such as "Brand Identity Bundle". 3. The operator's named look | [cascade.mdx](../../docs-site/content/docs/getting-started/cascade.mdx) § What's in the BDS bundle; portal `src/lib/data/__tests__/company-service-detail.test.ts:232`, `src/components/service-badge.tsx:61` |
| theme | 1. A client theme, `theme-{client}.css`, generated from the client profile. 2. The built-in themes Brik, Brik Dark and Client Sim. 3. Theme Mode, light or dark. 4. The numbered themes `theme-1`…`theme-8`. 5. The Theming Tenet | [client-themes.mdx:130](../../docs-site/content/docs/theming/client-themes.mdx); [theming/index.mdx:65-75](../../docs-site/content/docs/theming/index.mdx) |
| style | 1. ADR-039's Style axis, the customization axis that carries colour, type, surface and spacing. 2. The Visual Style vocabulary. 3. `dist/styles.css`. 4. The portal's "Style Preferences" label on the `style_preferences` column | [ADR-039:46](./ADR-039-blueprint-parameterization-axes.md); `content-system/vocabularies/visual-style.ts:16-30`; portal `src/components/sheets/onboarding-brand-sheet.tsx:166` |
| industry | 1. Parent industry, 4 values; the portal's "Industry" dropdown and `companies.industry`. 2. Industry pack slug, 4 values. 3. Blueprint industry tag, 15 values | `content-system/vocabularies/industry.ts:20-25`, `:39-53`; `content-system/blueprints/vocabularies.ts:49-65` |
| Bold, Minimal, Modern, Playful | Members of both Personality and Visual Style. The blueprint Mood vocabulary projects onto both | `personality.ts:19-33`; `visual-style.ts:16-30`; `blueprints/bridges.ts:48-60` |
| template | 1. A docs page shape. 2. Blueprint `tier: 'template'`, "eligible for the brik-templates catalog". That repo's README marks it ARCHIVED, a frozen Webflow export | [page-templates.mdx](../../docs-site/content/docs/getting-started/page-templates.mdx); `content-system/blueprints/vocabularies.ts:118-125` |

The vocabulary for named looks already exists. `VISUAL_STYLE_VALUES` has 13 members, and clients pick up to 3. Mood-board examples already model a look as one primary style plus ordered modifiers (`VisualStyleExample`, `visual-style.ts:57-74`). The portal picker is labelled "Visual Style" (`onboarding-brand-sheet.tsx:477`).

What is missing is the behaviour. In the portal's `PICK_TABLE`, a Visual Style decides only Theme Mode, and only for `Dark` and `Light` (portal `src/lib/design/decision-set.ts`, `buildPickTable` step 2). The other 11 decide nothing.

## Decision

### 1. The named look is a Visual Style

> OPERATOR SAID 2026-11-05 (Claude Code chat, brik-client-portal session 74a9da17): "Let's rename to Style if highly confident; Go-ahead for the doc decision and fable review; Let's also ensure we have the above terms and definitions documented: <https://design.brikdesigns.com/docs/getting-started>"

AGENT DECIDED (revisable): the concept's one name is **Visual Style**. A picker or filter may use the short label **Style** when no other "Style" is on screen, as Framer's filter does. Evidence: the vocabulary file, the portal picker label and the `PICK_TABLE` column all say Visual Style today. Bare "Style" already names ADR-039's axis, `dist/styles.css` and the portal's "Style Preferences" label. Revert: amend this section to the bare name and rename `visual-style.ts` in the same PR.

Confidence is high that these are not "bundles" and not "themes", for the reasons in the table above. Confidence that the docs name should be "Style" alone is not high, so the operator's condition was not met for the bare name. The short UI label covers what Framer shows.

A Visual Style is a **named preset over the Theming Dimensions**. It is not a sixth Dimension. Its full row, the target of bds#2851 step 5, proposes values for:

- Theme Mode
- Atmosphere
- the Expression Modes (spacing, typography, radius, elevation, borderwidth)
- Animation tier

Image mood and a blueprint affinity are planned later columns. `PickRow` has neither today (`decision-set.ts`, `PickRow`).

`Dark` and `Light` are the one exception: their whole preset is a single Theme Mode value. They stay members because the client sees one list.

A Visual Style never sets a token value. Colours, fonts and logos come only from the client theme. A colour-character style such as Colorful or Monochrome decides how much of the client's palette a page uses, never which colours.

"Bundle" is retired for this concept and keeps its one BDS meaning, `dist/tokens.css`.

### 2. An industry pack and a Visual Style are different things

An **industry pack** decides what a site says:

- services
- vocabulary
- calls to action
- compliance
- page archetypes (`pageArchetypes`)
- the site header and footer shape (`navigationIA`, `footerArchetype`)

A **Visual Style** decides how the site looks. A pack never contains a Visual Style. It points at the styles that suit its industry through `affinities.visualStyle` (`content-system/schema/industry-pack.ts:53`). A pack carries no atmosphere: `grep -c atmosphere content-system/schema/industry-pack.ts` returns 0, and the portal treats atmosphere as an explicit pick, default unset (`decision-set.ts`, header, #5512).

Revert: none needed. This records what the schema already does.

### 3. Industry has three named axes, and "category" is a label, not a fourth

| Name | Values | What it does |
|---|---|---|
| **Parent industry** | `medical`, `real-estate`, `small-business`, `other` | The top-level grouping. The portal's "Industry" dropdown, and what Framer's grid calls a category |
| **Industry pack** | a pack slug: `dental`, `real-estate-rv-mhc`, … | The sub-industry. Selects the pack that supplies content defaults |
| **Blueprint industry tag** | 15 match labels, including `universal` | Says which industries a blueprint layout fits |

Docs and code say Parent industry, matching `parentIndustry` in the pack schema. A browse UI may label it "Category". Bare "industry" is ambiguous and is not used as a term. Revert: rename in the glossary.

### 4. Personality and Visual Style stay separate vocabularies

**Personality** is the brand's character, which drives voice and tone. **Visual Style** is how the brand renders. A Playful personality can be expressed in a Minimal style; `visual-style.ts` says so in its own header.

The four shared words are distinct members of two vocabularies, and the `PICK_TABLE` merges a free pick of one into both. The blueprint **Mood** is the author's tag on a blueprint, projected onto both by `bridges.ts`. It is never a client pick.

No vocabulary changes. Revert: none needed.

### 5. A Template is a catalog entry, not a new axis

A **Template** is:

- a look: one primary Visual Style plus up to two modifiers, the `VisualStyleExample` shape, so "Modern × Dark" is one look
- one industry pack for sample content
- a set of blueprints
- a sample client theme to preview it

It is the unit a Framer-like catalog would list. It stores the selection and no values of its own: every value it shows comes from the Visual Style rows, the pack, the blueprints and the sample theme.

No Template exists yet. Blueprint `tier: 'template'` stays the flag that clears a blueprint for that catalog. Revert: drop this section; nothing reads it.

### 6. Framer's Style filter maps onto separate axes

Framer lists one flat Style filter. BDS keeps each term on its own axis. A Visual Style is the curated preset that can present a flat list to a client while every value underneath stays typed. Framer terms are from the operator's screenshots of 2026-11-05.

| Framer term | BDS home |
|---|---|
| Dark, Light | Theme Mode, through the `Dark` and `Light` Visual Styles |
| Animated | Animation tier |
| Large Type, Typographic | Typography mode `expressive`; Visual Style `Editorial` |
| Colorful, Monochromatic, Black & White | Visual Style `Colorful` / `Monochrome`; values from the client theme |
| Pastel, Gradient | No member. Palette character comes from the client theme |
| Illustrative | No member. Image mood `abstract` is the nearest |
| Minimal | Visual Style `Minimal` |
| Professional | No member. Personality `Professional` is the nearest, and it is character, not a look |
| Retro | No member. Visual Style `Classic` is the nearest |
| 3D, Grid | No member. Composition belongs to blueprints |

A "No member" row is not filed as a gap. It becomes one when a client needs it, through § 7.

### 7. Where a Visual Style's preset lives, and how the set grows

AGENT DECIDED (revisable): each Visual Style's preset is authored in BDS, as a `VISUAL_STYLE_PRESETS` record beside `VISUAL_STYLE_VALUES` in `content-system/vocabularies/visual-style.ts`. The portal's `buildPickTable` reads it and adds no values of its own. Evidence: ADR-050 decision A, "BDS owns every design vocabulary. The portal imports, never copies". Today the rows are built by looping over `VISUAL_STYLE_VALUES` in the portal, so a portal-side preset would be a copy. Revert: amend this section and move the preset to the portal under a new ADR-050 amendment.

A new Visual Style ships in one BDS PR, followed by the portal's normal version bump. The BDS PR adds:

- a member of `VISUAL_STYLE_VALUES`
- its `VISUAL_STYLE_PRESETS` entry, deciding at least one axis
- a mood-board entry in `VISUAL_STYLE_EXAMPLES`

A member that decides nothing is the drift this ADR records. Adding one changes the client picker, so it is the operator's call. Proposal evidence is reference-site tags that cluster on a look no existing style covers (portal `docs/reports/theming-loop-scope-2026-11-03.html` § 2b, `visualStyles`).

## Consequences

- bds#2851 step 5 is the build: author `VISUAL_STYLE_PRESETS` and have `buildPickTable` read it. That step has no tracking issue yet.
- Nothing client-visible changes in this ADR. The portal's "Style Preferences" read label is a second name for the same picks; renaming it is client-visible copy, so it is an open call for the operator.
- The Glossary page under Getting Started carries these definitions for readers. This ADR carries the reasons.
- Out of scope, recorded only:
  - `scripts/token-cascade-vocab-check.mjs` and ADR-039 still say "four Theming Dimensions"; the docs page says five and excludes blueprints ([theming/index.mdx:27](../../docs-site/content/docs/theming/index.mdx)).
  - [content-system/index.mdx:140](../../docs-site/content/docs/content-system/index.mdx) and the Theming page's Atmospheres row say packs carry a default atmosphere; the schema does not (§ 2).
  - Comments in `blueprints/bridges.ts` and `blueprints/vocabularies.ts` count 3 pack slugs; there are 4.

## Alternatives considered

| Option | Why not |
|---|---|
| Keep "bundle" | It is already the word for `dist/tokens.css` and for service offerings |
| "Theme" | Five meanings already. A sixth would make "client theme" ambiguous, and the client theme is the one that sets colour |
| Bare "Style" everywhere | It collides with ADR-039's Style axis, `dist/styles.css` and "Style Preferences", and needs a vocabulary rename with no behaviour gain |
| Visual Style as a sixth Theming Dimension | A Dimension owns a decision. A Visual Style only proposes values in Dimensions that already own them |
| "Industry category" as the docs name | It would be a second name for `parentIndustry`, which ADR-033 rules out |
| One Visual Style per Template | Dark and Light are styles, so a single-style Template could never be a dark Modern |
| Author presets in the portal's `PICK_TABLE` | ADR-050 decision A puts design vocabularies in BDS |
