# ADR-007 — Storybook component page recipe

**Status:** Accepted (2026-05-04)
**Date:** 2026-05-04
**Supersedes:** —
**Superseded by:** —
**Owner:** Nick Stanerson
**Related:** [ADR-006](./ADR-006-storybook-taxonomy-and-story-shape.md) (sidebar taxonomy + per-file story shape — the story-shape peer to this page-recipe ADR); [`docs/STORYBOOK-WRITING-GUIDE.md`](../STORYBOOK-WRITING-GUIDE.md); [`.storybook/CONTENT-GUIDE.md`](../../.storybook/CONTENT-GUIDE.md)

## Context

The user reported the Storybook experience is "subpar, broken" — chrome themes don't track the canvas, code blocks look wrong, and pages don't read consistently. Carbon Design System's React Storybook ([react.carbondesignsystem.com](https://react.carbondesignsystem.com)) is the named reference for what "trusted, well-designed" looks like.

Two layers underneath that complaint:

1. **Manager chrome theming.** Addressed structurally by [PR #425](https://github.com/brikdesigns/brik-bds/pull/425); residual visual fragmentation is a separate selector-audit task and is **out of scope for this ADR**.
2. **Page formatting.** No normative recipe for what every component page must contain, in what order, with what visuals. Authors copy from whichever component they last saw. Result: `Button.mdx` has eight H2 sections and three `---` dividers; `Tooltip.mdx` has four H2s and two dividers; `CONTENT-GUIDE.md` says "No dividers" but every component MDX uses them. The implicit recipe and the documented recipe disagree.

Two existing files already define partial standards. **Both undercount:**

- [`.storybook/CONTENT-GUIDE.md`](../../.storybook/CONTENT-GUIDE.md) — formatting rules (one H1, no dividers, no skipped headings). Read by humans, not enforced. Contradicted by every component MDX in `components/ui/` (all use `---` dividers).
- [`docs/STORYBOOK-WRITING-GUIDE.md`](../STORYBOOK-WRITING-GUIDE.md) — *how* to write stories (cover variants, JSDoc summaries, `@summary` for MCP). Doesn't address page structure.

Neither defines the canonical page recipe — section names, section order, required-vs-optional sections, the visual contract for prose and code blocks.

### Storybook ⇄ docs-site split

The docs site at [design.brikdesigns.com](https://design.brikdesigns.com) (source: `docs-site/content/docs/` in this repo) is the canonical home for narrative documentation. Today it covers 80 components, all primitives, motion, theming, content-system industries, and getting-started/contribution guides. [`stories/Welcome.mdx`](../../stories/Welcome.mdx) already redirects readers there for "guidance, not playground."

The split:

| Surface | Owns |
|---|---|
| Storybook | Live demos, prop API, copy-pasteable code, accessibility test stories, visual regression |
| docs-site (design.brikdesigns.com) | When-to-use, anatomy, design rationale, comparisons, accessibility narrative, theming guidance |

Carbon does the same split — `react.carbondesignsystem.com` (Storybook) vs `carbondesignsystem.com/components/{name}` (design docs). Carbon's load-bearing connector is the **triple-link header** at the top of every Storybook page: `Source code | Usage guidelines | Accessibility`. Brik has no such connector today, so a reader hitting the Storybook Button page has no obvious path to the docs-site Button page.

### Carbon's normative shape (sources: `Accordion.mdx`, `Button.mdx`, `DataTable.mdx`, `TextInput.mdx`, `Tabs.mdx`, `Tooltip.mdx`)

```
# {ComponentName}

[Source code] | [Usage guidelines] | [Accessibility]

## Table of Contents      (auto-generated; doctoc-managed)

## Overview               (prose → default <Canvas>)

## {Variant}              (one H2 or H3 per visual/behavioral variant)
  → optional 1–4 sentence framing
  → <Canvas of={Stories.X} additionalActions={[Stackblitz]} />

## Component API          (<ArgTypes />, optionally augmented with per-prop H3s)

## Feedback               (single-paragraph boilerplate)
```

**Inconsistencies in Carbon** (each requires a normative call from us):
- "Overview" heading present on Accordion/Button/Tooltip; absent on TextInput/Tabs (variants are H3s directly under the TOC); replaced with "Getting started" on DataTable.
- Per-prop H3 expansion under Component API: Accordion/Button do; Tooltip/TextInput/Tabs don't.
- In-page accessibility section: only DataTable has one — the other five rely entirely on the top-of-page link.
- "Component API" (5 of 6) vs "Props" (DataTable) heading label.

Carbon explicitly does **not** duplicate usage-guideline or accessibility content in Storybook. Both live on `carbondesignsystem.com` and are linked from the triple-link header. This is the load-bearing pattern Brik should adopt; it's also what makes it cheap to keep both surfaces consistent.

## Decision

Define a normative **component page recipe** and codify it as ADR-007. New component pages MUST conform; existing pages will be migrated in batches per the Implementation Plan below.

### Recipe — required structure for every `components/ui/{Component}/{Component}.mdx`

```mdx
import { Meta, Canvas, ArgTypes } from '@storybook/addon-docs/blocks';
import { ComponentLinks } from '../../../.storybook/blocks/ComponentLinks';
import * as Stories from './{Component}.stories';

<Meta of={Stories} />

# {Component name}

<ComponentLinks slug="{component-slug}" />

One- or two-sentence description. What it does, not when to use it.

## Playground

<Canvas of={Stories.Playground} />

## Variants

{Optional 1–3 sentences framing what varies.}

<Canvas of={Stories.Variants} />

## Patterns

{Optional 1–3 sentences framing the real-world compositions.}

<Canvas of={Stories.Patterns} />

## Props

<ArgTypes of={Stories} />
```

That's the **canonical six-section shape**: Title → Links → Description → Playground → Variants → Patterns → Props. Optional eighth and ninth sections may follow `Props` in this fixed order:

- `## CSS Override API` — table of component-scoped CSS variables, with one example. Required if the component exposes any.
- `## Notes` — short call-outs (deprecations, browser caveats, peer-component pointers). Three or fewer items per page.

### Brik's adaptations of Carbon's shape

| Carbon | Brik | Why |
|---|---|---|
| Triple-link header (`Source \| Usage \| Accessibility`) | `<ComponentLinks slug="..." />` block rendering the same three links, generated from one prop | One-line authoring; one place to change the URL pattern when docs-site routing changes |
| `## Table of Contents` (doctoc-managed) | Storybook 10's auto-TOC (already enabled in [`preview.tsx:394-397`](../../.storybook/preview.tsx)) | TOC is page chrome, not content. doctoc adds a commit-time dependency we don't need |
| `## Overview` (prose + first Canvas) | Description (free text after `<ComponentLinks>`) → `## Playground` | "Playground" is the term Brik already uses; "Overview" duplicates the page title |
| Variant H3s with optional prose, no second-level grouping | Two H2s — `## Variants` (visual/state variants) + `## Patterns` (real-world compositions) | Brik's existing implicit shape, kept. Carbon flattens to one tier; Brik's two-tier helps a reader skim "show me all states" vs "show me how this is actually used" |
| `## Component API` | `## Props` | Shorter, matches what authors already write |
| Per-prop H3 expansion under Component API (inconsistent in Carbon) | Not in the recipe. If specific props need narrative, write the narrative on docs-site, link from `## Notes` | Avoids the prop-page becoming a second usage doc |
| `## Accessibility Considerations` (DataTable only in Carbon) | Not in the recipe. Accessibility lives on docs-site, linked from `<ComponentLinks>` | One canonical home; matches Carbon's main pattern |
| `## Feedback` boilerplate | Not in the recipe. The DevFeedbackWidget already covers this | Avoids 80 identical paragraphs |
| Stackblitz `additionalActions` per Canvas | Not in the recipe (deferred) | Worthwhile but separate work — see Out of Scope |

### Banned patterns

These will be removed from existing pages and rejected in new pages:

1. **No `---` dividers.** They're chrome that the typography contract should provide. Existing pages use them as fake section boundaries; H2 spacing (already `margin-top: 48px` per `storybook-overrides.css:548`) does this job.
2. **No `## Usage` code-only section.** Today every page has one. It duplicates what `<Canvas>` already shows in source view, and the chosen import path drifts (`@brik/bds` vs `@brikdesigns/bds` is split roughly 60/40 across existing MDX). Keep one canonical import line in the description if needed; otherwise remove.
3. **No `## When to use` / `## When NOT to use`.** Migrate to docs-site. CatalogPicker is the only current offender — it gets a stub-and-link.
4. **No "Source attribution" or other deep-design narrative.** Same — docs-site.
5. **No emoji in headings.** Already in CONTENT-GUIDE.md; reaffirmed.
6. **No skipped heading levels.** H1 → H2 → H3, never H1 → H3. Already in CONTENT-GUIDE.md; reaffirmed.

### Visual contract

The recipe is content-shape; this is the **rendering contract** the authoring shape relies on. This ADR specifies the contract; implementation lands as a separate PR.

| Element | Contract |
|---|---|
| `h1` | `--font-family-heading`, `--text-primary`, no underline, `margin-top: 0` |
| `h2` | `--font-family-heading`, `--text-primary`, generous top margin (≥40px), no underline |
| `h3` | `--font-family-heading`, `--text-primary`, smaller top margin (≥24px) |
| `p`, `li` | `--font-family-body`, `--text-secondary`, line-height ≥1.6 |
| `a` (in prose) | `--text-brand-primary`, underline-on-hover only, no color flash on theme switch |
| `code` (inline) | `--surface-secondary` background, monospace family, ≤0.875em sizing |
| `pre` (block) | **Must look polished in BOTH light and dark themes.** Today every code block is hardcoded `#1e1e1e` regardless of theme ([`storybook-overrides.css:25-88`](../../.storybook/storybook-overrides.css)) — that's the "broken" the user sees. Replace with token-driven background that adapts: `--surface-code-block` (new gap-fill token, dark in both modes if the syntax-highlighting palette stays VS Code Dark+, or paired light/dark palettes if we go bichromatic). Implementation choice deferred to the follow-up PR; the *contract* is "code blocks render polished in every theme without theme-specific overrides." |
| Code block copy/show-source buttons | Subtle, dark-on-dark, `--text-muted` resting + `--text-brand-primary` hover. Already mostly correct; verify under client-sim theme |
| `<Canvas>` preview surface | `--surface-primary` background, `--border-secondary` border, generous internal padding. Matches today |
| `<ArgTypes>` table | Token-driven (already correct) |
| Tables (markdown) | Same border-radius and color treatment as ArgTypes for visual consistency |

The contract is paired with **`--font-audit` smoke test discipline** (existing — toggle to Client Sim theme; if anything still uses Poppins, the contract is broken).

### Callouts (MDX)

Carbon uses italicized `_Note: …_` and nothing else. Brik adopts the same minimal vocabulary plus one structural primitive:

```mdx
> **Note** — One short sentence about a non-obvious behavior.

> **Warning** — One short sentence about a footgun.
```

Both render through the `blockquote` chrome, styled per the Visual Contract. No admonition components, no toast components, no tip/info/danger/success matrix. If you need more, write a docs-site page.

## Audit — current state of six representative Brik component pages

Six pages chosen for variety: foundational simple (Button), composite complex (CatalogPicker), variant-heavy (TabBar), the screenshot-broken one (Tooltip), form input with prop controls (TextInput), state-machine (Accordion).

| Page | Sections present | Recipe deviations |
|---|---|---|
| [`Button.mdx`](../../components/ui/Button/Button.mdx) | Title, desc, ---, Playground, Variants (with bullet list), Icons, Interactive states, Loading, LinkButton, IconButton, Patterns, ---, Props (with sub-sections per sibling component), ---, Usage, ---, CSS Override API | Three `---` dividers; eight H2 sections instead of three (`Icons`, `Interactive states`, `Loading`, `LinkButton`, `IconButton` should be Variants stories or split to sibling MDX); has `## Usage` (banned); per-component sub-Props is unique to this file |
| [`CatalogPicker.mdx`](../../components/ui/CatalogPicker/CatalogPicker.mdx) | Title, desc, ---, Playground, Empty state, Mixed sources, Strict, Different industry, Variants, Disabled, Patterns, ---, Props, ---, Usage, ---, Source attribution, ---, When to use, When NOT to use, ---, Tokens | Five `---` dividers; nine variant H2s instead of one `## Variants` Canvas; has `Source attribution`, `When to use`, `When NOT to use`, `Tokens` (all four migrate to docs-site); `## Usage` (banned) |
| [`TabBar.mdx`](../../components/ui/TabBar/TabBar.mdx) | Title, desc, ---, Playground, Variants (with bullet list), Patterns, ---, Props, ---, Usage | Two `---` dividers; conforms to recipe except for dividers and `## Usage` |
| [`Tooltip.mdx`](../../components/ui/Tooltip/Tooltip.mdx) | Title, desc, ---, Playground, Variants, Patterns, ---, Props, ---, Usage | Two `---` dividers; otherwise close to recipe |
| [`TextInput.mdx`](../../components/ui/TextInput/TextInput.mdx) | Title, desc, ---, Playground, Variants (with bullet list), Patterns, ---, Props, ---, CSS Override API, ---, Usage, "Email, search, URL" prose section | Three `---` dividers; `## Usage` mid-page is mis-ordered (should be after Props); long prose narrative about deprecated EmailInput/SearchInput should move to docs-site or `## Notes` |
| [`Accordion.mdx`](../../components/ui/Accordion/Accordion.mdx) | Title, desc, ---, Playground, Variants (with bullet list), Patterns, ---, Props, ---, Usage | Two `---` dividers; otherwise close to recipe |

**Pattern across audit:**
- 100% of pages use `---` dividers — bans them.
- 100% of pages have `## Usage` — bans it.
- 60% of pages have only the recipe-required sections beyond the violations above (Tooltip, TabBar, Accordion).
- 40% of pages (Button, CatalogPicker, TextInput) have non-recipe sections that need either splitting (Button → IconButton/LinkButton get their own MDX), demoting to a story (Button's Icons/States/Loading become sub-stories under Variants), or migrating to docs-site (CatalogPicker's narrative blocks).

## Narrative MDX migration disposition

Files outside `components/ui/` that exist as MDX in Storybook today:

| File | Equivalent on docs-site? | Disposition |
|---|---|---|
| `stories/Welcome.mdx` | n/a — this is the pointer | **Keep** (already a docs-site router) |
| `content-system/Overview.mdx` | `docs-site/content/docs/content-system/index.mdx` | **Stub** — replace with one-line redirect to docs-site |
| `content-system/industries/dental.mdx` | `docs-site/content/docs/content-system/industries/dental.mdx` | **Stub** |
| `content-system/industries/real-estate-commercial.mdx` | yes | **Stub** |
| `content-system/industries/real-estate-rv-mhc.mdx` | yes | **Stub** |
| `content-system/industries/small-business.mdx` | yes | **Stub** |
| `content-system/voices/Overview.mdx` | `docs-site/content/docs/content-system/voices/index.mdx` | **Stub** |
| `content-system/brand/Brik.mdx` | not yet visible on docs-site | **Defer** — migrate in a follow-up |
| `content-system/compliance/Healthcare-ADA.mdx` | not yet visible on docs-site | **Defer** |
| `content-system/vocabularies/ImageMood.mdx` | not yet visible on docs-site | **Defer** |
| `stories/foundation/_components/*.tsx` (Color, Typography, Motion, etc.) | docs-site has equivalents under `primitives/` and `motion/` | **Keep as playgrounds** — these are interactive token explorers, not narrative; complement docs-site |
| `stories/theming/Atmospheres.stories.tsx`, `NavigationArchetypes.stories.tsx` | docs-site has `theming/` content | **Keep as playgrounds** if interactive; **stub** if narrative-only |
| `stories/HealthDashboard.stories.tsx`, `ContrastCompliance.stories.tsx`, `TokenCoverage.stories.tsx`, `ThemeSwitcher.stories.tsx` | n/a — these are dev tools | **Keep** — interactive dev tools, not docs |

**"Stub"** = a one-page MDX with the title, the `<ComponentLinks>` (or equivalent narrative-page linker), and one paragraph: "This page has moved. Read the canonical version at [design.brikdesigns.com/...]". Search engines, agent MCP queries, and old links continue to resolve.

**"Defer"** = leave as-is for now; open a GitHub issue per file to track migration to docs-site. Out of scope for this ADR's implementation PR.

## Implementation plan — phased, one PR per phase

This ADR was one PR. The actual rollout was sequenced:

**Phase 1 — `<ComponentLinks>` block + visual contract.** New `.storybook/blocks/ComponentLinks.tsx` rendering the triple-link header. Reduce `storybook-overrides.css` `!important`-soup where the visual contract conflicts. Replace hardcoded `#1e1e1e` code-block background with a token-driven approach. Verify against Client Sim theme. Single PR; no MDX touched yet.

**Phase 2 — gold-standard reference component.** Migrate **Tooltip** to the full recipe end-to-end. Tooltip is chosen because it's the screenshot the user flagged as broken. PR includes the migrated MDX + verification screenshots in light + dark + Client Sim. This becomes the template for Phase 3.

**Phase 3 — batch migration.** Convert remaining `components/ui/*/*.mdx` to the recipe. Batches of 9–12 components per PR, ordered by complexity (mechanical strips → narrative-cycle pages → authoring track).

**Phase 4 — close-out + lint enforcement.** Delete non-recipe-shape MDX (reference catalogs, components-not-yet-ready), wire the lint to `--enforce` in pre-commit + CI.

**Phase 5 (deferred).** Stackblitz `additionalActions`, doctoc-style table-of-contents anchors, per-prop H3 expansion. None are load-bearing for the recipe; defer.

## Implementation reality

What shipped, in order, against the plan above:

| PR | Phase | What |
|---|---|---|
| [#428](https://github.com/brikdesigns/brik-bds/pull/428) | 1 | ComponentLinks block, tokenized code-block colors, recipe lint script (informational) |
| [#429](https://github.com/brikdesigns/brik-bds/pull/429) | 2 | Tooltip — gold standard |
| [#430](https://github.com/brikdesigns/brik-bds/pull/430) | 3 batch 1 | 12 simplest pages (Accordion, AddressInput, AlertBanner, Avatar, Breadcrumb, ButtonGroup, CardTestimonial, Checkbox, CollapsibleCard, Counter, Divider, Dot) |
| [#432](https://github.com/brikdesigns/brik-bds/pull/432) | 3 batch 2 | 12 more (Dialog, EmptyState, FileUploader, FilterButton, Footer, Form, Menu, MultiSelect, PageHeader, Pagination, PasswordInput, Popover) |
| [#433](https://github.com/brikdesigns/brik-bds/pull/433) | 3 batch 3 | 12 (NavBar, PricingCard, Radio, SidebarNavigation, Skeleton, Spinner, Stepper, Switch, TabBar, TextArea, Toast, Select) |
| [#434](https://github.com/brikdesigns/brik-bds/pull/434) | 3 batch 4 | 9 with broader banned-section strip (Slider, ChecklistItem, CompletionToggle, InteractiveListItem, SegmentedControl, TextInput, Tag, Chip, Badge) |
| [#435](https://github.com/brikdesigns/brik-bds/pull/435) | 3 batch 5 | 6 narrative-cycle (Card, CardControl, DataSection, Field, Modal, SheetSection — H3 demotion) |
| [#436](https://github.com/brikdesigns/brik-bds/pull/436) | 3 batch 6 | 4 deeper-narrative (ProgressBar, CatalogPicker, Sheet, Table) |
| [#437](https://github.com/brikdesigns/brik-bds/pull/437) | 3 batch 7 | 6 needing rename + H3 demotion (Banner, BulletList, Button, FieldGrid, ProgressCircle, TagGroup) |
| [#438](https://github.com/brikdesigns/brik-bds/pull/438) | 3 batch 8 | 3 via story-export rename (Board, FilterBar, TextLink) |
| [#440](https://github.com/brikdesigns/brik-bds/pull/440) | 3 batch 9 | 4 with new Patterns stories authored (AddableEntryList, ProgressStepper, BadgeGroup, CardList) |
| [#441](https://github.com/brikdesigns/brik-bds/pull/441) | 3 batch 10 | 4 with full restructure (AddableTextList, AddableComboList, Meter, AddableFieldRowList) |
| [#444](https://github.com/brikdesigns/brik-bds/pull/444) | 4 close-out | Delete Icons.mdx, SheetTypography.mdx, Calendar.mdx (canonical content on docs-site or component not ready). Tracking issues [#442](https://github.com/brikdesigns/brik-bds/issues/442) (Calendar) + [#443](https://github.com/brikdesigns/brik-bds/issues/443) (Icons + SheetTypography parity audit). 100% recipe conformance reached. |
| [#445](https://github.com/brikdesigns/brik-bds/pull/445) | 4 lint | `lint-storybook-recipe.js --enforce` wired into `.husky/pre-commit` + `.github/workflows/storybook-recipe-check.yml` |

Final state: 73 of 76 component dirs carry recipe-conformant MDX (the other 3 either don't need an MDX page in Storybook or gate on component readiness — see #442 / #443). Lint runs on every PR and on every commit that stages a `components/ui/**/*.mdx` file.

## Reconciliation with ADR-006

ADR-006 (sidebar taxonomy + story shape, accepted 2026-04-26) was authored on a parallel timeline and addresses a different layer of the same surface. **Both ADRs apply.** The two-sentence summary of how they fit together:

- **ADR-006** governs `*.stories.tsx` — what stories a component file exports and where it sits in the sidebar.
- **ADR-007** governs `*.mdx` — the section structure of the docs page that renders alongside the stories.

The collision risk reads from the section names. ADR-006 explicitly bans these as **story export names**: `Variants`, `Tones`, `Patterns`. ADR-007 requires `## Variants` and `## Patterns` as **MDX H2 sections**. Same words, different layers. Read carefully:

| Layer | ADR-007 (MDX) | ADR-006 (stories.tsx) |
|---|---|---|
| `## Variants` H2 | **Required** section heading | n/a |
| `## Patterns` H2 | **Required** section heading | n/a |
| `export const Variants` | n/a | **Banned** |
| `export const Tones` | n/a | **Banned** |
| `export const Patterns` | n/a | **Banned** |
| `export const Playground` | Referenced via `<Canvas of={Stories.Playground} />` | **Required** |
| `export const Warning`, `Error`, etc. | Referenced via `<Canvas of={Stories.Warning} />` under `## Variants` H3 sub-section | **Required** (one per meaningful state) |

A new component written under both ADRs looks like this:

```tsx
// {Component}.stories.tsx — ADR-006-conformant
export const Playground = ...        // args-driven sandbox
export const Warning = ...           // per-state, named after the state
export const Error = ...
export const Success = ...
export const OnboardingChecklist = ...   // composition (irreducible — args can't express)
```

```mdx
{/* {Component}.mdx — ADR-007-conformant */}
## Variants
### Warning
<Canvas of={Stories.Warning} />
### Error
<Canvas of={Stories.Error} />
### Success
<Canvas of={Stories.Success} />

## Patterns
<Canvas of={Stories.OnboardingChecklist} />
```

Both ADRs satisfied. The recipe lint passes. The story-shape rule passes.

**Existing files (the 73 migrated in Phase 3) are grandfathered.** They carry `Stories.Variants` / `Stories.Patterns` exports that ADR-006 bans for new files. ADR-006 §Migration explicitly waives retroactive cleanup of these — the truce is documented there. New components must not create new violations; existing components keep what Phase 3 produced until / unless someone opens a separate sweep.

**Lint coverage.** ADR-007's recipe lint enforces the MDX side. ADR-006's story-shape lint (banning `Variants` / `Tones` / `Patterns` story exports in *new* files) is a candidate follow-up not yet wired up — see [ADR-006 §Enforcement](./ADR-006-storybook-taxonomy-and-story-shape.md#enforcement). If you write a new story file with a banned export name today, no script will stop you; PR review is the gate.

## Out of scope

Captured here so they don't drift back in:

- **Manager chrome theming.** [PR #425](https://github.com/brikdesigns/brik-bds/pull/425) addressed the `setConfig` race; residual sidebar-doesn't-update-on-toggle is a selector audit task with its own PR.
- **Stackblitz integration on Canvas.** Real value but separate work — needs a Stackblitz prefill helper, build-time story serialization, and the `additionalActions` plumbing in every Canvas. Phase 5.
- **Full deprecated-page migration** (`brand/Brik.mdx`, `compliance/Healthcare-ADA.mdx`, `vocabularies/ImageMood.mdx`). Three docs-site PRs after this ADR lands.
- **Per-prop narrative** (Carbon's Accordion/Button pattern). Brik's split puts that on docs-site; in-Storybook prop docs are the ArgTypes table, full stop.
- **Storybook search re-ranking, sidebar groupings, sidebar icon decisions.** These belong with ADR-006 (story taxonomy / shape).

## Acceptance criteria

A page **conforms to ADR-007** when:

1. Top of file imports `Meta`, `Canvas`, `ArgTypes` from `@storybook/addon-docs/blocks`, imports `* as Stories`, imports `ComponentLinks`, contains `<Meta of={Stories} />`.
2. The first heading is one `# {Component name}`. Nothing above it except the imports and `<Meta>`.
3. Immediately after H1: `<ComponentLinks slug="..." />` then a 1–2 sentence description paragraph.
4. Sections appear in this order, no omissions of required, no deviations from spelling: `## Playground`, `## Variants`, `## Patterns`, `## Props`. `## CSS Override API` and `## Notes` are optional and follow `## Props` in that order.
5. No `---` dividers anywhere in the file.
6. No `## Usage`, `## When to use`, `## When NOT to use`, `## Source attribution`, `## Tokens`, or other narrative-bearing section. (Stubs MAY appear in the description: "See usage at [design.brikdesigns.com/docs/components/{slug}](...).")
7. Every `<Canvas>` references a story exported from the file's matching `*.stories.tsx`.
8. The page renders cleanly in **all three Storybook themes** (Brik Brand, Brik Brand Dark, Client Sim Font Audit) with no theme-specific visual breakage.
9. The page passes a static lint check: `scripts/lint-storybook-recipe.js` (added in Phase 1) reports zero violations.

A page violates ADR-007 if any of the above fails. Phase 3 closes when 100% of `components/ui/*/*.mdx` files conform.

---

*Update cadence: this ADR is amended when the recipe materially changes (new required section, change in section order, change to the visual contract). Minor wording tweaks happen in `.storybook/CONTENT-GUIDE.md`, which becomes the human-readable mirror of this ADR. The lint script is the enforcement layer.*
