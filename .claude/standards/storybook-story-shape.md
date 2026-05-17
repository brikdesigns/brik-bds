---
name: Storybook story-shape standard (BDS)
description: Canonical rules for *.stories.tsx files. Two-shape model, banned exports, MCP discipline, surface tags, @summary, Storybook 9 imports, mocking, play-function patterns.
type: reference
scope: brik-bds
applies-to: "**/components/ui/**/*.stories.tsx, **/content-system/blueprints/**/*.stories.tsx, **/stories/**/*.stories.tsx"
retrieved-via: brik-rag query "storybook story shape standard"
last-verified: 2026-05-17
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
| 3 | Value an agent would reach for as a starting template (`variant: 'destructive'`, `tone: 'warning'`) | **Dedicated args-driven story** |
| 4 | Composition or hook-driven state machine args can't express | **Irreducible render-mode story** |
| 5 | Interaction assertion (`play` function) | **`play`-only `InteractionTest…` story, tagged `['!manifest']`** |

Full rationale, the Button before/after table, and the composite-component slot pattern live in [ADR-010](../../docs/adrs/ADR-010-storybook-axes-of-information.md). When applying the matrix produces a different answer than a sibling file's existing shape, **the matrix wins** — sibling files are grandfathered and not retroactively swept.

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

## The narrow axis-only-gallery exception

A comparison gallery earns **one** dedicated story when **and only when** all three apply:

1. Side-by-side comparison is the entire point (e.g., `Sizes` showing `xs/sm/md/lg/xl`).
2. The autodocs page can't make the same comparison clear — sidebar order isn't enough.
3. It's one axis, not a mix — `Sizes` is fine; `Sizes-and-tones` is not.

Story is named after the axis (`Sizes`, `Densities`, `Placements`) — **never** `Variants` / `Patterns` / `Examples`.

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
| `surface-web` | Marketing / site surfaces — `brikdesigns.com`, Webflow client sites (`Footer`, `NavBar`, `PricingCard`, `CardTestimonial`, `ServiceBadge`) |
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

### Single concept per story

Never combine two prop axes in one story. Write `Sizes` and `Variants` as separate stories — never `SizesAndVariants`. If a story name needs "and" to describe it, split it.

## Sidebar taxonomy

**[ADR-006](../../docs/adrs/ADR-006-storybook-taxonomy-and-story-shape.md) (amended 2026-05-16, [#629](https://github.com/brikdesigns/brik-bds/issues/629)) defines a 6-bucket flat taxonomy.** The rename sweep PRs that make `preview.tsx` match are gated on [#618](https://github.com/brikdesigns/brik-bds/issues/618) wrapping.

**Migration window rule:** existing stories keep their current `title:` strings until the rename sweep touches their file. New stories use the flat bucket path from 2026-05-16 forward.

**Target storySort order** (post-rename sweeps):

```text
Overview → Foundation → Theming → Motion → Content System →
Components → Containers → Blocks → Layouts → Sections → Tools → * (catch-all) → Deprecated
```

**No subcategory layer.** Stories sit at `<Bucket>/<component>` — not `<Bucket>/<Subcategory>/<component>`.

**Bucket definitions:**

| Bucket | Role | Example members |
| --- | --- | --- |
| `Components/` | Single atomic primitive | button, badge, checkbox, banner, text-input |
| `Containers/` | Bounded holder with own border/padding/elevation | card, form, accordion, sheet, table |
| `Blocks/` | Fixed slot shape filled with atoms | field, field-grid, date-picker |
| `Layouts/` | Pure arrangement — no styling beyond structure | stack, cluster, grid, frame, row, split |
| `Sections/` | Full-page composed region | nav-bar, footer, sidebar-navigation |
| `Tools/` | Dev/internal utilities | brik-dev-bar |

**Unchanged top-levels:** `Overview/`, `Foundation/`, `Theming/`, `Motion/`, `Content System/`, `Patterns/`, `Deprecated/`.

**Canonical prefixes:**

| Folder / file | Title prefix |
| --- | --- |
| `components/ui/<Component>` (atomic primitive) | `Components/<component>` (e.g. `Components/button`) |
| `components/ui/<Component>` (bounded holder) | `Containers/<component>` (e.g. `Containers/card`) |
| `components/ui/<Component>` (slot + atoms) | `Blocks/<component>` (e.g. `Blocks/field`) |
| `components/ui/<Component>` (arrangement only) | `Layouts/<component>` (e.g. `Layouts/stack`) |
| `components/ui/<Component>` (page-level region) | `Sections/<component>` (e.g. `Sections/nav-bar`) |
| `stories/dev-tools/<Tool>` | `Tools/<tool>` |
| `content-system/blueprints/react/<Blueprint>` | `Theming/Blueprints/<blueprint_key>` |
| `stories/patterns/<Pattern>` | `Patterns/<Pattern>` |

```tsx
/* Right — flat bucket path, no subcategory layer */
title: 'Components/button'
title: 'Containers/card'
title: 'Blocks/field'
title: 'Sections/nav-bar'
title: 'Theming/Blueprints/hero_split_image_card_overlay'

/* Wrong — old subcategory style (superseded by ADR-006 amendment 2026-05-16) */
title: 'Components/Action/button'
title: 'Displays/Sheet/field'
title: 'Navigation/Primary/nav-bar'
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

## Storybook 9 imports — framework package, `storybook/test`

```tsx
// ✅ Right
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn, expect, userEvent, within } from 'storybook/test';

// ❌ Wrong — pre-Storybook-9 imports
import { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
```

Other Storybook 9 changes:

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

The story-shape lint that bans `Variants` / `Tones` / `Patterns` / `Examples` exports in new files is tracked by [#569](https://github.com/brikdesigns/brik-bds/issues/569). Until it ships, this standard + the [storybook-story-shape skill](../../.claude/skills/storybook-story-shape/SKILL.md) are the gate, and PR review is the enforcement layer.

The matrix's broader rule (Q2 collapses — `Disabled` / `Loading` / icon-slot stories become Controls) stays PR-review-enforced even after #569 ships. The lint catches named violations; the matrix catches structural ones.

## Existing files are grandfathered

73 component story files were swept through ADR-007's page-recipe migration (PRs #428–#445, all merged). Many still export `Variants` / `Patterns` story names that this standard bans for new files. **ADR-006 §Migration explicitly waives retroactive cleanup of these.**

Rules:

- **New component story files** — conform to the two-shape model + matrix from day one.
- **Existing files** — keep whatever shape ADR-007's pass left them in. **Do not retroactively rewrite** to match this standard.
- **Opportunistic migration** — if you're already touching an existing file for a real reason (prop addition, refactor, bug fix), migrating to the matrix in the same PR is fine.

If you find yourself wanting to "clean up" an existing file's `export const Variants` because it bothers you, **stop**. That's out-of-scope sweep work and was deliberately shelved on `task/storybook-shape-migration-wip` (commit `8daccd0`).

## Pre-commit agent checklist

1. **Read three sibling story files** in the same `components/ui/<Subcategory>/` folder. Match their `title:` prefix, surface tag, and overall shape.
2. **Verify the two-shape model** — file exports `Default` plus one story per meaningful state. No `Variants` / `Tones` / `Patterns` story exports (in new files).
3. **Apply the matrix** — boolean / icon-slot states are Controls, not stories. Toolbar-global axes (theme/density/viewport/locale/motion) are never stories.
4. **Verify every export has an `@summary` JSDoc** under 60 characters.
5. **Verify `meta.tags` has exactly one of** `surface-web` / `surface-product` / `surface-shared`.
6. **If the component is deprecated**, verify `meta.tags` also includes `!manifest`.
7. **Verify `title:` prefix matches existing sidebar** — if you're inventing a new top-level group, that needs an ADR amendment, not a freelance addition.
8. **Verify Storybook 9 imports** — `from '@storybook/react-vite'` (not `@storybook/react`), `from 'storybook/test'` (not `@storybook/test`).
9. **If you used `render`**, verify the case is irreducible. Documentation galleries via `render` are out.
10. **For `play` functions** — use `canvas` directly, not `within(canvas)`. Assert callbacks fired when `fn()` is passed as an arg.

## When this standard updates

1. Edit this file (the source of truth)
2. Re-run `scripts/ingest-storybook-story-shape-standard.sh` to push to brik-rag
3. Bump `last-verified` in frontmatter
4. Note the change in the PR description

The skill auto-retrieves on `*.stories.tsx` edits — no other propagation needed.
