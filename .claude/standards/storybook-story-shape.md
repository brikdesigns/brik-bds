---
name: Storybook story-shape standard (BDS)
description: Canonical rules for *.stories.tsx files. Two-shape model, banned exports, MCP discipline, surface tags, @summary, Storybook 10 imports, mocking, play-function patterns.
type: reference
scope: brik-bds
applies-to: "**/components/ui/**/*.stories.tsx, **/content-system/blueprints/**/*.stories.tsx, **/stories/**/*.stories.tsx"
retrieved-via: brik-rag query "storybook story shape standard"
last-verified: 2026-08-03
last-updated: 2026-08-03
---

# Storybook story-shape standard (BDS)

Rules for `*.stories.tsx` files in this repo. Source of truth lives in this file (git-tracked); agents retrieve via `brik-rag query "storybook story shape standard"`.

**Out of scope:** component build rules (see [component-build](./component-build.md)); MDX page recipe (see [storybook-mdx-recipe](./storybook-mdx-recipe.md)); toolbar global axes (see [storybook-toolbar-globals](./storybook-toolbar-globals.md)).

**Authoritative ADRs:**

- **[ADR-006](../../docs/adrs/ADR-006-storybook-taxonomy-and-story-shape.md)** — taxonomy (where stories live in the sidebar) + the two-shape rule.
- **[ADR-010](../../docs/adrs/ADR-010-storybook-axes-of-information.md)** — the story-vs-control matrix (which prop becomes a story, a control, a toolbar global).

ADR-006 is *what* a file looks like; ADR-010 is *what populates it*. This standard is the operational expression of both.

## The two story shapes — load-bearing (ADR-006 Part B)

Every BDS component story file ships exactly two kinds of stories:

1. **`Default`** — args-driven sandbox. Controls work. One canonical instance.
2. **One story per meaningful state** — args-driven, named by the state.

"Meaningful state" passes ADR-010 Q3: a value an agent would reach for as a *starting template*. Boolean toggles (`disabled`, `loading`, `fullWidth`) and icon-slot variations are Controls on every variant story, not standalone stories.

```tsx
// ✅ ADR-006 + ADR-010 conformant
export const Default: Story = { args: { tone: 'information', ... } };
export const Information: Story = { args: { tone: 'information', ... } };
export const Warning: Story = { args: { tone: 'warning', ... } };
export const Error: Story = { args: { tone: 'error', ... } };
export const WithAction: Story = { args: { action: { label: 'Retry', onClick: fn() }, ... } };
```

Story names use the state directly (`Warning`, not `Variants > Warning`). The Storybook sidebar + autodocs page **is** the gallery. Don't build a second gallery inside `render`.

## The story-vs-control matrix — load-bearing (ADR-010)

For every prop, state, or scenario, ask in order. First yes wins:

| Q | Question | Outcome |
|---|---|---|
| 1 | Orthogonal environmental axis (theme/density/viewport/locale/motion) | **Toolbar global** — never a story |
| 2 | State prop that's not a semantic starting point (`disabled`, `loading`, icon slot, boolean toggle) | **`argTypes` only** — no story |
| 3 | Value an agent would reach for as a starting template (`variant: 'destructive'`, `tone: 'warning'`) | **Dedicated args-driven story** — but an *axis* comparison is a Control + an MDX demo, never a story (rule 5) |
| 4 | Composition or hook-driven state machine args can't express | **Irreducible render-mode story** |
| 5 | Interaction assertion (`play` function) | **`play`-only `InteractionTest…` story, tagged `['!manifest', 'interaction-test']`** — out of MCP discovery *and* out of the sidebar |

Full rationale, the Button before/after table, and the composite-component slot pattern live in [ADR-010](../../docs/adrs/ADR-010-storybook-axes-of-information.md). When applying the matrix produces a different answer than a sibling file's existing shape, **the matrix wins** — sibling files are grandfathered and not retroactively swept.

## Consolidation rules — the recurring slop patterns

The matrix says which prop *becomes* a story. These four rules say when an existing story *shouldn't exist* — the patterns that keep re-appearing in review (#1359 cleanup sweep). Each names the real file that motivated it. **A story carrying a distinguishing `play` or `render` is exempt from rules 1–2** (the behavior/composition is the point) — which is exactly why the `duplicate-args` / `boolean-toggle-story` lint inspects *declarative* stories only.

**Rule 1 — `Default` is a neutral canonical instance; it must not duplicate a named story.** If `Default`'s discriminator value (`variant` / `tone` / `status`) equals a dedicated story's, one of them is dead weight.

```tsx
// ❌ TabBar — Default and Tab are both variant:'tab'; Badge — Default and Info are both status:'info'
export const Default: Story = { args: { variant: 'tab', items: [...] } };
export const Tab: Story = { args: { variant: 'tab', items: [...] } };
// ✅ Default shows the representative instance; per-variant stories cover the *distinct* values
export const Default: Story = { args: { variant: 'text', items: [...] } }; // or the most common variant, once
export const Tab: Story = { args: { variant: 'tab', items: [...] } };
```

Linted as `duplicate-args` only for the exact-args subset; the "same discriminator, different other args" case (TabBar) stays PR-review/skill enforced.

**Rule 2 — a story that differs from another only by a boolean prop is a Control, not a story** (matrix Q2, restated). `SubNavigation` `Default` vs `NoBorder` differ only by `bordered` (a `control:'boolean'` argType) → fold `NoBorder` away; the toggle lives in Controls on `Default`. Linted as `boolean-toggle-story` (hard-gated under `--enforce` since #1308 Step 7).

**Rule 3 — a story that differs only by a *non-visual* prop is not a story.** A prop that changes wiring but not pixels (`linkComponent`, analytics id, `as`) renders identically to `Default`. Make it a `play`-only `InteractionTest…` that asserts the wiring, tagged `['!manifest', 'interaction-test']`, or document it in MDX — never a standalone visual story.

```tsx
// ❌ SidebarNavigation — WithLinkComponent renders the same as Default; only injects a router Link
export const WithLinkComponent: Story = { args: { linkComponent: MockLink, ... } };
// ✅ assert the injection instead of snapshotting an identical frame
export const InteractionTestLinkComponent: Story = {
  tags: ['!manifest'],
  args: { linkComponent: MockLink, ... },
  play: async ({ canvas }) => { await expect(canvas.getByRole('link')).toHaveAttribute('data-link-component'); },
};
```

Not statically decidable ("visual" is semantic) — skill/PR-review enforced.

**Rule 4 — cross-component & app-shell compositions live in `Blueprints/` or the MDX `## Patterns` section, not a leaf component's story file.** Q4 (irreducible render) is for a component's *own* hook/composition state — not a multi-component layout. `SubNavigation` `TwoColumnShell` (sidebar + sub-nav + main) is a page shell → `Blueprints/`. `Badge` `Badge + Tag alignment` is a cross-component comparison → the Badge MDX `## Patterns`. Neither exercises *that* component's API. Skill/PR-review enforced.

**Rule 4 governs the story's *subject*, not a wrapper's *fixture*.** (Scoped by [#1492](https://github.com/brikdesigns/brik-bds/issues/1492).) The rule asks what a story *documents*. A **state shell** — a wrapper that renders loading / empty / error *in place of* `children` — has no content of its own, so it cannot be exercised without content standing in. That content is a fixture, not the subject, and rule 4 does not reach it.

The test: **remove the composed content — is there still a story?** If yes, the composition was the subject and rule 4 applies (`SubNavigation` still renders without the page shell around it). If no, it was a fixture (`DataView`'s four views render nothing at all — `children` is the only thing they have to replace).

```tsx
// ✅ DataView — the fixture is what the shell replaces; the subject is state precedence
export const Board: Story = {
  args: { loading: false, empty: false, error: '' },   // the subject, as Controls
  render: (args) => <BoardView {...args}><DemoBoard /></BoardView>,  // the fixture
};
// ❌ still a rule-4 violation — the composition IS the subject, wrapper or not
export const BoardInsideAPage: Story = {
  render: () => <Page><SidebarNavigation … /><BoardView><DemoBoard /></BoardView></Page>,
};
```

Two constraints keep this from becoming an escape hatch:

1. **Fixtures stay minimum-legible.** A fixture exists so the shell's states read correctly against real content — a `BoardView` skeleton is only legible beside something board-shaped. Build the thinnest thing that still reads as the right shape, and no thinner. Extra rows, columns, or props are not fixture, they are a gallery.
2. **The fixture is never the documented artifact.** If the composition is worth showing *as* a composition, that copy belongs in `Blueprints/` or MDX `## Patterns` — same as always.

This scopes rule 4; it does not weaken it. The rule still catches every case where a leaf story file grows a page shell or a cross-component comparison, because in each of those the composition survives the removal test.

**Independent of the family exception.** `DataView` also carries a documented four-views-one-meta exception (four sibling views sharing one `DataViewProps` surface, one stories file, one `meta`). That exception is about **file and meta count**; this scoping is about **what the render wraps**. They are orthogonal — a single-component state shell gets the fixture scoping without the family exception, and a family sharing one meta gets no fixture licence unless its members are actually shells. Do not cite one to justify the other.

## `argTypes` is load-bearing — not decoration

Every prop on a component gets an `argTypes` entry. The same declaration feeds three consumers:

- The MCP `get-documentation` payload (consumer-repo agents)
- The `<ArgTypes>` table on the docs page
- The Controls panel in the dev UI

Description is required when the prop name doesn't already say it. Explicit `options:` is required when TypeScript can't infer the union (string aliases, inline union members in IconButton). No over-elaboration — argTypes are not the place to teach.

## Banned story exports (zero exceptions in new files)

| Export name | Why banned |
|---|---|
| `export const Variants` | Duplicates the sidebar; stacked render forfeits per-state Chromatic, MCP discovery, Controls, A11y, permalinks |
| `export const Tones` | A tone *is* a state — name the story `Warning`, not `Tones > Warning` |
| `export const Patterns` | If a pattern is real-world composition, give it a state-named story (`OnboardingChecklist`) |
| `export const Examples` | Same failure mode as `Variants` |
| `export const SizesAndVariants` | "And" in a story name means two axes — split |

**ADR-007 H2 sections are different.** `## Variants` and `## Patterns` are required as **MDX H2 headings** on the docs page (per [storybook-mdx-recipe](./storybook-mdx-recipe.md) + ADR-007). They are NOT story export names. Same words, different layers.

```tsx
// In Component.stories.tsx — story exports use state names
export const Default: Story = ...
export const Warning: Story = ...
export const OnboardingChecklist: Story = ...
```

```mdx
{/* In Component.mdx — MDX H2 sections per ADR-007 */}
## Variants
### Warning
<Canvas of={Stories.Warning} />

## Patterns
<Canvas of={Stories.OnboardingChecklist} />
```

## Axis comparisons are an MDX concern, never a story export

**Rule 5.** An axis — `size`, `density`, `appearance` / `style`, `gap` / `spacing`, `placement`, `direction`, `align` — is a **Control on `Default`**. The side-by-side comparison lives in the component's **MDX page as a docs-local demo**, never as a story export.

```tsx
// ❌ a story whose only job is showing one axis side-by-side
export const Sizes: Story = {
  render: () => (<Row><Tag size="xs" /><Tag size="sm">Small</Tag>…</Row>),
};
```

```mdx
{/* ✅ in Tag.mdx — docs-local, not exported from the stories file */}
export const SizeScale = () => (
  <div style={{ display: 'flex', gap: 'var(--gap-md)', alignItems: 'center' }}>
    <Tag size="xs" icon={<Icon icon="ph:tag" />} />
    <Tag size="sm">Small</Tag>
    <Tag size="md">Medium</Tag>
    <Tag size="lg">Large</Tag>
  </div>
);

### Sizes

<Canvas>
  <SizeScale />
</Canvas>
```

Why the MDX layer rather than deleting the comparison: side-by-side genuinely reads better than toggling a Control for these axes, and the docs page is where a reader is already comparing. What it must not do is consume a story slot — each one costs a Chromatic snapshot, an MCP manifest entry, and a sidebar row for something that is not a distinct component state.

**Two exemptions**, both because the story is doing something a Control can't:

| Exempt when | Example |
| --- | --- |
| It carries a distinguishing `play` — the assertion is the point | `Board` `Density` guards the density typography contract by computed style (#412) |
| It is hook-driven Q4 — a state machine args can't express | `Menu` `Placement` — the upward flip only shows against a real trigger |

**Enforcement is two-tier**, because precision differs:

- **`axis-gallery-story` (HARD, gates under `--enforce`)** — an export *named* after an axis and in render mode, minus the two exemptions above. Unambiguous.
- **`axis-gallery-shape` (NOTICE, never gates)** — a render that *looks* like a gallery (maps a value array, or repeats the component 3+ times) but isn't axis-named. Reported for review only: roughly a third are legitimate Q4 compositions (`Badge` `ContentStatusSolid`, `Checkbox` `Vertical`, `Field` `CompactTier`), and "is this a gallery" is the same not-statically-decidable judgment rules 3–4 leave to review.

**Marking a notice reviewed (#1502).** A Q4 story clears its notice with a `bds-lint-ignore` line in its JSDoc stating why — bare is a hard violation (#1469). It must sit *before* `@summary`, which otherwise swallows it. The count should reach 0: a survivor is unreviewed, or a blocked move naming its ticket (#1643).

**History.** This section previously granted a *narrow axis-only-gallery exception* — one dedicated story per axis, when side-by-side was the whole point and autodocs couldn't show it. The BDS-27 Storybook review reversed that, and #1489 applied the reversal across 16 stories. [ADR-010](../../docs/adrs/ADR-010-storybook-axes-of-information.md) records the decision.

## Multi-preset Container pattern

A Container built with a `preset` discriminator (a string union that selects between locked-down layouts) gets **one story per preset value** in the **base component's stories file**. Each preset is a Q3 story — a semantic starting template agents and developers reach for directly.

**Where stories live:** all preset stories live in `ComponentA.stories.tsx`. If a preset was originally shipped as a standalone component (e.g. `CardControl` → `Card preset="control"`), its story consolidates into the base component's file when the standalone is deprecated.

**Diagnostic:** if a standalone component is fully expressible as `<ComponentA preset="b" ... />` with no behavioral difference, its story belongs in `ComponentA.stories.tsx`. A separate `ComponentB.stories.tsx` for a preset is legacy — consolidate when touching that file.

**Surface-tag conflict:** if a preset component has a narrower surface tag than the base (e.g. a `surface-web`-only component inside a `surface-shared` base), use story-level `tags` to scope that story:

```tsx
export const Pricing: Story = {
  tags: ['surface-web'],  // narrower than meta.tags — web-only
  ...
};
```

**Card as the canonical reference** (all stories in `Card.stories.tsx`):

| Story | What it shows | Source |
| --- | --- | --- |
| `Default` | Flexible `children` slot, variant + padding Controls | `Card` (no preset) |
| `Control` | Settings row: badge + title + description + action | `Card preset="control"` |
| `Summary` | Compact metric/stat card | `Card preset="summary"` |
| `Display` | Content card for `bds-card-grid` | `Card preset="display"` |
| `Pricing` | Web-only pricing tier with feature list | `PricingCard` (story consolidated; component file stays for `surface-web` CSS isolation) |

**Wrong-layer check:** before classifying a component as `Containers/`, ask: does it carry its own visual surface (`border` / `background` / `padding` / `elevation`)? If not, it is a **`Layouts/`** component (pure arrangement, no surface) — a bare `<ul>` spacing wrapper belongs in `Layouts/`, not `Containers/`. **Card-family exception:** the `Cards/` bucket groups every card-named primitive by family, so `card-list` sits in `Cards/` alongside `card` even though it is arrangement-only — name-family wins over layer for the card set (ADR-006 amendment 2026-07-22).

**Name-layer check:** "Card" in a component name implies Container-layer ancestry. If the component is actually an interaction primitive (`Collapsible` — renamed from `CollapsibleCard`, #701) or a semantic quotation block (`Testimonial` — renamed from `CardTestimonial`, #702), the "Card" prefix is wrong. Do not propagate the misnomer in new story files.

## `render` is for irreducible cases only

Args first. `render` only when args genuinely can't express the case:

- Multi-component composition with no natural single-component equivalent
- Hook usage required by the demo (a controlled toggle pattern that's the only way to show the interaction)

`render` used to lay out a documentation gallery (with `<SectionLabel>` rows or `<Stack>` helpers) is **not** irreducible. Strip the helpers; split into args-driven stories.

## Don't contrive Q4 stories to satisfy lint

Q4 stories are **conditionally optional**. The matrix is the source of truth for what populates a file; the [MDX recipe](./storybook-mdx-recipe.md) must adapt to the matrix, not the reverse.

If a component has no irreducible composition or hook-driven state that args genuinely can't express, **do not invent one** to satisfy a `## Patterns` recipe-lint requirement. Drop the Patterns section and accept any informational lint violation; the recipe is the layer to fix.

| Tempting | Right |
| --- | --- |
| Add a dismiss-toggle story so `## Patterns` has content | Drop the story; dismissibility is Q2 (one `onDismiss` callback) and lives in Controls |
| Wrap a single args-driven case in `render` to make it "feel like a pattern" | Use args; helpers are not Q4 |
| Keep a legacy `Variants` render-mode gallery because removing it would empty `## Patterns` | Split into Q3 per-state stories; recipe issue is a separate fix |

Reference: [#605](https://github.com/brikdesigns/brik-bds/issues/605) (Banner gold-standard surfaced this anti-pattern) → [#608](https://github.com/brikdesigns/brik-bds/issues/608) (recipe amendment to make `## Patterns` conditional).

## MCP discipline — mandatory

The Storybook MCP server (`get-documentation`) is what agents in consumer repos (`brik-client-portal`, `renew-pms`, `freedom-client-portal`) hit to pick BDS primitives. Without `@summary` on every export and exactly one surface tag on every meta, agents get every component back as noise with no signal about applicability.

### `@summary` on every export

```tsx
/**
 * Banner conveys page-level status. Use sparingly — one banner per region.
 * @summary Page-level status banner with tone variants
 */
export const Banner = ...

export const Critical: Story = {
  /** Failed-submit error after server validation rejection.
   *  @summary Server-side validation failure */
  args: { tone: 'critical', ... }
};
```

Under 60 characters per `@summary` — MCP truncates after that.

### Exactly one surface tag in `meta.tags`

| Tag | Use when |
|---|---|
| `surface-web` | Marketing / site surfaces — `brikdesigns.com`, Webflow client sites (`Footer`, `NavBar`, `PricingCard`, `Testimonial`, `ServiceBadge`) |
| `surface-product` | Product app surfaces — portal / renew-pms / freedom (`AddableEntryList`, `FieldGrid`, `FilterBar`, `Sheet`, `SidebarNavigation`) |
| `surface-shared` | Used in both contexts — **default for primitives** (`Button`, `Badge`, `Field`, `Modal`, `Toast`) |

```tsx
const meta: Meta<typeof Button> = {
  title: 'Components/Action/button',
  component: Button,
  tags: ['surface-shared'],
};
```

**New components default to `surface-shared`** unless the component's *API* assumes one surface (a marketing-only prop, a product-only context provider). Surface is about API affordance, not adoption count. Reclassification requires API justification, not usage counts.

### Deprecated stories must hide from agents

Component deprecated (`@deprecated` JSDoc)? Same PR adds `tags: ['!manifest']` to the meta so MCP `list-all-documentation` skips it:

```tsx
const meta = {
  component: AlertBanner,
  tags: ['!manifest'],  // deprecated — hide from MCP discovery
} satisfies Meta<typeof AlertBanner>;
```

Same tag applies to `InteractionTest…` stories (Q5 from the matrix) so they don't pollute discovery.

### Interaction tests hide from the sidebar too

A Q5 story carries **two** tags: `['!manifest', 'interaction-test']`. `!manifest` keeps it out of MCP discovery, `interaction-test` out of the sidebar via `excludeFromSidebar` in [`.storybook/main.ts`](../../.storybook/main.ts) — the assertion already runs in the vitest suite, so it is not a story to browse ([ADR-026](../../docs/adrs/ADR-026-regression-test-home-and-visual-gate.md) Arm A). Never key that on the built-in `play-fn` tag: it also covers 30 canonical stories. Linted `interaction-test-tag` (hard).

### Single concept per story

Never combine two prop axes in one story. Write `Sizes` and `Variants` as separate stories — never `SizesAndVariants`. If a story name needs "and" to describe it, split it.

## Sidebar taxonomy

**[ADR-006](../../docs/adrs/ADR-006-storybook-taxonomy-and-story-shape.md) (last amended 2026-07-29) defines the flat sidebar taxonomy.** Current component top-levels: `Components/`, `Cards/`, `Forms/`, `Containers/`, `Layouts/`, `Navigation/`, `Blueprints/`, `Tools/` — plus the structural top-levels below. `Blocks/` was dissolved into `Components/` on 2026-07-29; its former members (`field`, `field-grid`, `bullet-list`, `checklist`, `interactive-list-item`, `selectable-media-tile`) now sit under `Components/`. `Forms/` was added on 2026-07-29 (#1565); the form family (`form`, `contact-form`, `feedback-form`, `login-form`, `sign-up-form`, `search-form`) moved there out of `Containers/`. [`.storybook/preview.tsx`](../../.storybook/preview.tsx) `storySort.order` is the live source of truth and matches this table.

**Migration window rule:** existing stories keep their current `title:` strings until the rename sweep touches their file. New stories use the flat bucket path from 2026-05-16 forward.

**Target storySort order** (post-rename sweeps):

```text
Overview → Foundation → Theming → Motion → Content System →
Components → Containers → Cards → Forms → Layouts → Navigation → Blueprints → Tools → * (catch-all) → Deprecated
```

**No subcategory layer.** Stories sit at `<Bucket>/<component>` — not `<Bucket>/<Subcategory>/<component>`.

**Bucket definitions:**

| Bucket | Role | Example members |
| --- | --- | --- |
| `Components/` | Atomic UI control — including composite input controls operated as one form field (`select`, `date-picker`) and slot-shaped fillers filled with atoms (`field`, `checklist`) | button, badge, checkbox, text-input, select, date-picker, progress-stepper, field, field-grid, bullet-list, checklist, interactive-list-item, selectable-media-tile |
| `Cards/` | Card-family holder — bounded surface with the "card" affordance | card, card-list, pricing-card, product-summary-card |
| `Forms/` | Form-family holder — the base form container + composed form demos | form, contact-form, feedback-form, login-form, sign-up-form, search-form |
| `Containers/` | Bounded holder with own border/padding/elevation (non-card, non-form) | accordion, sheet, table, data-view |
| `Layouts/` | Pure arrangement — no styling beyond structure | stack, cluster, grid, frame, page |
| `Navigation/` | Navigation + page-level chrome region | nav-bar, breadcrumb, sidebar-navigation, sub-navigation, tab-bar, page-header |
| `Blueprints/` | Full-page composed section template | hero, cta, features, footer |
| `Tools/` | Dev/internal utilities | brik-dev-bar |

**Unchanged top-levels:** `Overview/`, `Foundation/` (icon-family + logo + avatar + image live under `Foundation/Assets/`), `Motion/`, `Content System/`, `Deprecated/`.

**Canonical prefixes:**

| Folder / file | Title prefix |
| --- | --- |
| `components/ui/<Component>` (atomic primitive) | `Components/<component>` (e.g. `Components/button`) |
| `components/ui/<Component>` (card-family holder) | `Cards/<component>` (e.g. `Cards/card`) |
| `components/ui/Form` + `stories/patterns/forms/<Form>` (form-family holder) | `Forms/<component>` (e.g. `Forms/form`, `Forms/login-form`) |
| `components/ui/<Component>` (bounded holder, non-card, non-form) | `Containers/<component>` (e.g. `Containers/table`) |
| `components/ui/<Component>` (slot + atoms) | `Components/<component>` (e.g. `Components/field`) |
| `components/ui/<Component>` (arrangement only) | `Layouts/<component>` (e.g. `Layouts/stack`) |
| `components/ui/<Component>` (navigation / page chrome) | `Navigation/<component>` (e.g. `Navigation/nav-bar`) |
| `components/ui/{Icon,Icons,AnimatedIcon,Logo,Avatar,Image}` | `Foundation/Assets/<component>` (e.g. `Foundation/Assets/icon`) |
| `stories/dev-tools/<Tool>` | `Tools/<tool>` |
| `content-system/blueprints/react/<Blueprint>` | `Blueprints/<blueprint_key>` |

```tsx
/* Right — flat bucket path, no subcategory layer */
title: 'Components/button'
title: 'Cards/card'
title: 'Components/field'
title: 'Navigation/nav-bar'
title: 'Blueprints/hero_split_image_card_overlay'
title: 'Foundation/Assets/icon'

/* Wrong — old subcategory / superseded top-levels (Sections, Displays, Blocks, Theming/Blueprints) */
title: 'Components/Action/button'
title: 'Displays/Sheet/field'
title: 'Blocks/field'
title: 'Sections/nav-bar'
```

**Do not freelance a new top-level.** Adding one requires updating `storySort.order` in `preview.tsx` and amending [ADR-006](../../docs/adrs/ADR-006-storybook-taxonomy-and-story-shape.md) — not just a `title:` string.

**Before writing `title:` in a new story**, check the bucket table above. If the component's bucket is ambiguous, open the question in [#629](https://github.com/brikdesigns/brik-bds/issues/629) before committing.

## Args composition — blueprints + page stories

Page-level and blueprint stories compose from leaf-component stories' args rather than re-author data:

```tsx
export const LandingPage: Story = {
  args: {
    hero: Hero.Default.args,
    pricing: PricingTable.ThreeTier.args,
    cta: CTABand.Primary.args,
  },
};
```

Keeps blueprint stories from drifting from leaf truth. Slot props on composite components are typed as the leaf component's `args` shape — see [ADR-010 §Composite components](../../docs/adrs/ADR-010-storybook-axes-of-information.md).

## Storybook 10 imports — framework package, `storybook/test`

```tsx
// ✅ Right
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn, expect, userEvent, within } from 'storybook/test';

// ❌ Wrong — pre-Storybook-9 imports
import { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
```

Other Storybook 10 changes:

- `globals` annotation is now `initialGlobals` in `.storybook/preview.ts`
- Autodocs config moves from `parameters.docs.autodocs` to `tags: ['autodocs']`
- Node 20+, TypeScript 4.9+

## Mocking — register in `preview.ts`, override per story

To mock external dependencies in stories, register the module mock in `.storybook/preview.ts`:

```tsx
import { sb } from 'storybook/test';

// Spy mocks (keeps functions, allows override + spying)
sb.mock(import('some-library'), { spy: true });
sb.mock(import('./relative/module.ts'), { spy: true });  // use file extensions for relative
```

Override values per story via `beforeEach`:

```tsx
import { expect, mocked, fn } from 'storybook/test';
import { library } from 'some-library';

const meta = {
  component: AuthButton,
  beforeEach: async () => {
    mocked(library).mockResolvedValue({ user: 'data' });
  },
};

export const LoggedIn: Story = {
  play: async ({ canvas }) => {
    await expect(library).toHaveBeenCalled();
  },
};
```

**Always mock external dependencies** that stories depend on — stories should render consistently regardless of network / time / browser state.

## Play function parameters — use `canvas` directly

```tsx
// ✅ Right — canvas already has the query methods
play: async ({ canvas }) => {
  await canvas.getByLabelText('Submit').click();
};

// Also acceptable — wrap canvasElement
import { within } from 'storybook/test';

play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await canvas.getByLabelText('Submit').click();
};

// ❌ Wrong — within(canvas) errors because canvas isn't a DOM element
play: async ({ canvas }) => {
  const screen = within(canvas);  // Error
};
```

Assertions in `play` functions:

- Assert the visible outcome (text, aria state, enabled/disabled, class/state changes, emitted events)
- Prefer role / label-based queries
- When passing `fn()` as an `args` callback, write a `play` that exercises the path *and* asserts the callback fired

## Story-shape lint posture

The story-shape lint ([`scripts/lint-story-shape.js`](../../scripts/lint-story-shape.js), shipped by [#569](https://github.com/brikdesigns/brik-bds/issues/569)/[#1289](https://github.com/brikdesigns/brik-bds/pull/1289), gated on pre-commit + CI) hard-fails under `--enforce` on:

- **Banned exports** — `Variants` / `Tones` / `Patterns` / `Examples` and `*And*` axis-merge compounds (#569)
- **`Playground` exports** — the canonical sandbox story is `Default` (#694; swept + gated by [#1321](https://github.com/brikdesigns/brik-bds/issues/1321))
- **`@summary` discipline** — every story export carries an `@summary` JSDoc of ≤ 60 chars (MCP truncates past that) (#1321)
- **Surface tag** — exactly one of `surface-web` / `surface-product` / `surface-shared` in `meta.tags` (#1321)
- **Deprecated ⇒ hidden** — a component-level `@deprecated` (or a `Deprecated/` title) requires `!manifest` in `meta.tags` (#1321)
- **InteractionTest tagging** — an `InteractionTest…` export requires story-level `tags: ['!manifest', 'interaction-test']` and no `name:` display override (#1321, #1638)
- **Consolidation rules 1–2** — `duplicate-args` (two declarative exports with structurally identical args — rule 1's exact-args subset) and `boolean-toggle-story` (a declarative story differing from `Default` only by boolean args — rule 2, matrix Q2). Graduated from advisory to hard by [#1308](https://github.com/brikdesigns/brik-bds/issues/1308) Step 7.

There is no grandfather allowlist for any hard rule — each shipped in the same PR as the sweep that emptied its violation set.

The matrix's broader Q2 rule (`Disabled` / `Loading` / icon-slot stories become Controls) stays PR-review-enforced where not statically decidable. The lint catches named + structural-metadata violations; the matrix catches semantic ones.

**Consolidation tier (#1359 → graduated #1308 Step 7).** The two statically-decidable consolidation findings above — `duplicate-args` and `boolean-toggle-story` — shipped ADVISORY (print-only) in #1359 while the audit sweep ran, so CI and pre-commit stayed green on files that predated the rules. #1308 Step 7 cleared the repo, so they now **gate under `--enforce`** alongside the banned-export and structural tiers. (The `--matrix-strict` staging flag that used to gate them is retired.) Both rules inspect *declarative* stories only — a story carrying a distinguishing `play` or `render` is exempt, since the behavior/composition is the point. Consolidation rules 3–4 (non-visual-prop-only stories; cross-component/shell relocation) are not statically decidable and stay skill/PR-review enforced.

## Existing files are grandfathered

73 component story files were swept through ADR-007's page-recipe migration (PRs #428–#445, all merged). Many still export `Variants` / `Patterns` story names that this standard bans for new files. **ADR-006 §Migration explicitly waives retroactive cleanup of these.**

Rules:

- **New component story files** — conform to the two-shape model + matrix from day one.
- **Existing files** — keep whatever shape ADR-007's pass left them in. **Do not retroactively rewrite** to match this standard.
- **Opportunistic migration** — if you're already touching an existing file for a real reason (prop addition, refactor, bug fix), migrating to the matrix in the same PR is fine.

If you find yourself wanting to "clean up" an existing file's `export const Variants` because it bothers you, **stop**. That's out-of-scope sweep work and was deliberately shelved on `task/storybook-shape-migration-wip` (commit `8daccd0`).

## Pre-commit agent checklist

0. **Check for preset consolidation.** If the component being storied is marked `@deprecated` and superseded by a `preset` on another component, its story belongs in the parent component's stories file — not a new `Component.stories.tsx`. See `## Multi-preset Container pattern`.
1. **Read three sibling story files** in the same `components/ui/<Subcategory>/` folder. Match their `title:` prefix, surface tag, and overall shape.
2. **Verify the two-shape model** — file exports `Default` plus one story per meaningful state. No `Variants` / `Tones` / `Patterns` story exports (in new files).
3. **Apply the matrix** — boolean / icon-slot states are Controls, not stories. Toolbar-global axes (theme/density/viewport/locale/motion) are never stories.
3a. **Apply the consolidation rules** — `Default` doesn't duplicate a named story (1); no story differs from another only by a boolean (2) or a non-visual prop (3); cross-component / app-shell demos go to `Blueprints/` or MDX `## Patterns`, not a leaf story file (4) — unless the composition is a state shell's fixture, which rule 4 does not reach (apply the removal test). Run `node scripts/lint-story-shape.js <file>` — `--enforce` hard-gates rules 1–2 (rules 3–4 stay PR-review/skill enforced).
4. **Verify every export has an `@summary` JSDoc** under 60 characters.
5. **Verify `meta.tags` has exactly one of** `surface-web` / `surface-product` / `surface-shared`.
6. **If the component is deprecated**, verify `meta.tags` also includes `!manifest`.
7. **Verify `title:` prefix matches existing sidebar** — if you're inventing a new top-level group, that needs an ADR amendment, not a freelance addition.
8. **Verify Storybook 10 imports** — `from '@storybook/react-vite'` (not `@storybook/react`), `from 'storybook/test'` (not `@storybook/test`).
9. **If you used `render`**, verify the case is irreducible. Documentation galleries via `render` are out.
10. **For `play` functions** — use `canvas` directly, not `within(canvas)`. Assert callbacks fired when `fn()` is passed as an arg.

## When this standard updates

1. Edit this file (the source of truth)
2. Bump `last-verified` in frontmatter
3. Stage + commit — the pre-commit hook auto-ingests changed standards into brik-rag and updates `scripts/.standards-hashes` (brik-bds#744). CI verifies the hash matches on every PR.
4. Note the change in the PR description

The skill auto-retrieves on `*.stories.tsx` edits — no other propagation needed.
