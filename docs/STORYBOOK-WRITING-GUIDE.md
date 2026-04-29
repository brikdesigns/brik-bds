# Storybook Story-Writing Guide (Storybook 9)

This is a cached copy of the `get-storybook-story-instructions` output from
the `storybook-mcp` server. **Read this if the MCP is unreachable** (e.g.,
the Storybook dev server isn't running on `:6006`).

Keep it current: if you call the MCP and the returned content differs from
what's here, update this file in the same PR that touches Storybook.

---

# Writing User Interfaces

When writing UI, prefer breaking larger components up into smaller parts.

**ALWAYS write a Storybook story for any component written.** If editing a
component, ensure appropriate changes have been made to stories for that
component.

## How to write good stories

**Goal:** Cover every distinct piece of business logic and state the component
can reach (happy paths, error/edge states, loading, permissions/roles, empty
states, variations from props/context). Avoid redundant stories that show the
same logic.

**Interactivity:** If the component is interactive, add Interaction tests using
play functions that drive the UI with `storybook/test` utilities (e.g., `fn`,
`userEvent`, `expect`). Simulate key user flows: clicking buttons/links,
typing, focus/blur, keyboard nav, form submit, async responses, toggle/
selection changes, pagination/filters, etc. When passing `fn` functions as
`args` for callback functions, make sure to add a play function which
interacts with the component and assert whether the callback function was
actually called.

**Data/setup:** Provide realistic props, state, and mocked data. Include
meaningful labels/text to make behaviors observable. Stub network/services
with deterministic fixtures; keep stories reliable.

**Assertions:** In play functions, assert the visible outcome of the
interaction (text, aria state, enabled/disabled, class/state changes, emitted
events). Prefer role/label-based queries.

**Variants to consider** (pick only those that change behavior): default vs.
alternate themes; loading vs. loaded vs. empty vs. error; validated vs.
invalid input; permissions/roles/capabilities; feature flags; size/density/
layout variants that alter logic.

**Accessibility:** Use semantic roles/labels; ensure focusable/keyboard
interactions are test-covered where relevant.

**Naming/structure:** Use clear story names that describe the scenario
("Error state after failed submit"). Group related variants logically; don't
duplicate.

**Imports/format:** Import `Meta`/`StoryObj` from the framework package;
import test helpers from `storybook/test` (not `@storybook/test`). Keep
stories minimal — only what's needed to demonstrate behavior.

## Story shape + sidebar taxonomy (BDS — see ADR-006)

[ADR-006](./adrs/ADR-006-storybook-taxonomy-and-story-shape.md) is the
load-bearing document for *what* a BDS story file looks like and *where*
it lives in the sidebar. The summary:

**Two story shapes per file. That's it.**

1. **`Playground`** — args-driven sandbox. Controls work. One canonical instance.
2. **One story per meaningful state** — args-driven, named by the state
   (`Information`, `Warning`, `Error`, `Disabled`, `WithIcon`, etc.).

Story names use the state directly (`Warning`, not `Variants > Warning`).
The Storybook sidebar + autodocs page **is** the gallery — don't build a
second gallery inside `render`.

**Don't ship:**

- `Variants` / `Tones` / `Patterns` gallery buckets inside a component file.
- `render`-mode stories that stack multiple instances behind `<SectionLabel>`
  rows for documentation purposes.
- "And" in story names (`SizesAndVariants` splits).

**Narrow exception:** axis-only galleries (`Sizes`, `Densities`, `Placements`)
earn one story when comparison is the entire point, the autodocs page can't
show it as clearly, AND it's a single axis (not a mix of axes). Never named
`Variants` / `Patterns` / `Examples`.

**Sidebar taxonomy:** four content top-levels — `Foundations`, `Components`,
`Patterns`, `Theming` — plus `Overview` (design-system metadata) and
`Deprecated` (sorts last, tagged `!manifest`). `Components/` uses one
alphabetical subcategory layer: `Action`, `Addables`, `Card`, `Container`,
`Control`, `Feedback`, `Form`, `Indicator`, `List`, `Navigation`, `Overlay`,
`Structure`. See ADR-006 for the full member list per subcategory.

**Reference examples:**

- [`Banner.stories.tsx`](../components/ui/Banner/Banner.stories.tsx) — tone +
  content-shape variants, args-only, no render galleries.
- [`EmptyState.stories.tsx`](../components/ui/EmptyState/EmptyState.stories.tsx) —
  content-shape variants, args-only.
- [`Tooltip.stories.tsx`](../components/ui/Tooltip/Tooltip.stories.tsx) — uses
  the axis-only gallery exception for `Placements`.

## MCP Discipline (mandatory for BDS)

The MCP `get-documentation` tool returns "the summary, if present, or the
first 60 characters of the description." Every component and every story
exposed via MCP needs a JSDoc `@summary` so agents in consumer repos
(portal, renew-pms, brikdesigns) get high-signal answers.

### Component + story summaries

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

Required on every component export and every story export. The summary
should answer "what scenario does this represent" in under 60 characters.

### Single concept per story

Never combine two prop axes in one story. Write `Sizes` and `Variants` as
separate stories — never `SizesAndVariants`. If a story name needs "and"
to describe it, split it.

### Deprecated stories must hide from agents

When a component is deprecated (`@deprecated` JSDoc), the same PR adds
`tags: ['!manifest']` to the meta. Otherwise agents in consumer repos
keep recommending it via `list-all-documentation`.

```tsx
const meta = {
  component: AlertBanner,
  tags: ['!manifest'],  // deprecated — hide from MCP discovery
} satisfies Meta<typeof AlertBanner>;
```

### Args over render — strict priority

`args` first. Use `render` only when args can't express the case
(multi-component composition, hook usage). Hooks in stories are an
advanced fallback per Storybook's own docs — not a default tool.

### Args composition for blueprints + page stories

Page-level and blueprint stories compose from leaf-component stories'
args, never re-author data:

```tsx
export const LandingPage: Story = {
  args: {
    hero: Hero.Default.args,
    pricing: PricingTable.ThreeTier.args,
    cta: CTABand.Primary.args,
  },
};
```

Keeps blueprint stories from drifting from leaf truth.

## Storybook 9 Essential Changes for Story Writing

### Package Consolidation

#### `Meta` and `StoryObj` imports

Update story imports to use the framework package:

```diff
- import { Meta, StoryObj } from '@storybook/react';
+ import { Meta, StoryObj } from '@storybook/react-vite';
```

#### Test utility imports

Update test imports to use `storybook/test` instead of `@storybook/test`:

```diff
- import { fn } from '@storybook/test';
+ import { fn } from 'storybook/test';
```

### Global State Changes

The `globals` annotation has been renamed to `initialGlobals`:

```diff
// .storybook/preview.js
export default {
-  globals: { theme: 'light' }
+  initialGlobals: { theme: 'light' }
};
```

### Autodocs Configuration

Instead of `parameters.docs.autodocs` in `main.js`, use tags:

```js
// .storybook/preview.js or in individual stories
export default {
  tags: ['autodocs'], // generates autodocs for all stories
};
```

### Mocking imports in Storybook

To mock imports in Storybook, use Storybook's mocking features. **ALWAYS mock
external dependencies** to ensure stories render consistently.

1. **Register the mock in Storybook's preview file.** You MUST register a
   module mock in `.storybook/preview.ts` (or equivalent):

    ```js
    import { sb } from 'storybook/test';

    // Prefer spy mocks (keeps functions, but allows override and spying)
    sb.mock(import('some-library'), { spy: true });
    ```

   **Important: Use file extensions when referring to relative files!**

    ```js
    sb.mock(import('./relative/module.ts'), { spy: true });
    ```

2. **Specify mock values in stories.** Override per-story using `beforeEach`
   and the `mocked()` type function:

    ```js
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

   Before doing this, ensure you have mocked the import in the preview file.

### Play Function Parameters

- The play function has a `canvas` parameter that can be used directly with
  testing-library-like query methods.
- It also has a `canvasElement` which is the actual DOM element.
- The `within` function imported from `storybook/test` transforms a DOM
  element into an object with query methods, similar to `canvas`.

**DO NOT** use `within(canvas)` — it is redundant because `canvas` already
has the query methods; `canvas` is not a DOM element.

```ts
// ✅ Correct: Use canvas directly
play: async ({ canvas }) => {
  await canvas.getByLabelText('Submit').click();
};

// ⚠️ Also acceptable: Use `canvasElement` with `within`
import { within } from 'storybook/test';

play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await canvas.getByLabelText('Submit').click();
};

// ❌ Wrong: Do NOT use within(canvas)
play: async ({ canvas }) => {
  const screen = within(canvas); // Error!
};
```

### Key Requirements

- **Node.js 20+**, **TypeScript 4.9+**
- React Native uses `.rnstorybook` directory

## Story Linking Agent Behavior

- **ALWAYS provide story links after any changes to stories files**, including
  changes to existing stories.
- After changing any UI components, ALWAYS search for related stories that
  might cover the changes you've made. If you find any, provide the story
  links to the user. **This is very important** — it allows the user to
  visually inspect the changes. Even later in a session when changing UI
  components or stories that have already been linked to previously, you MUST
  provide the links again.
- Use the `preview-stories` MCP tool to get the correct URLs for links to
  stories.
