---
name: storybook-writing
description: "Brik's Storybook story-writing standard for brik-bds (*.stories.tsx files) — ADR-006's two-story-shape rule (Playground + one-story-per-meaningful-state), the banned story exports (`Variants`, `Tones`, `Patterns` as story names — they duplicate the sidebar, break Controls, and forfeit per-story Chromatic/MCP/a11y coverage), MCP discipline (every story needs `@summary` JSDoc + one surface tag), the four-top-level sidebar taxonomy (Foundations / Components / Patterns / Theming), and the narrow axis-only-gallery exception. Use ALWAYS BEFORE creating a new component .stories.tsx or adding a story to an existing file. The detailed per-component conventions (component subcategory table, ADR-007 MDX page recipe, story-shape examples) live in brik-rag — this skill points you to the right query. Trigger keywords: stories.tsx, story file, new story, add story, add variant, Variants story, Tones story, Patterns story, Playground story, args-driven, story shape, story export, render function, SectionLabel, Stack helper, Storybook sidebar, story title, component subcategory, surface tag, surface-shared, surface-web, surface-product, MCP discovery, ADR-006, ADR-007, storybook-writing-guide, story taxonomy, deprecated story, manifest tag."
triggers:
  - About to create or modify any `*.stories.tsx` file under `components/ui/`, `stories/`, or `content-system/blueprints/`
  - About to scaffold a new component story file
  - About to add a story export (`export const Foo: Story = ...`) to an existing file
  - About to add a `render` function to a story (load this first to verify the case is irreducible)
  - User asks about story shape, story file layout, `Variants` vs `Patterns` vs `Tones`, sidebar taxonomy, or story naming
  - User asks how to add a new variant / state / tone to a component
  - User mentions ADR-006, ADR-007, Storybook MCP, `@summary`, surface tags, or `!manifest`
  - User asks "where should this component live in the sidebar"
last-verified: 2026-05-12
---

# Storybook Writing Standard (BDS)

Imperative rules for any `*.stories.tsx` file in this repo. Load this once per task; query brik-rag for the per-component detail.

Authoritative ADRs:

- **[ADR-006](../../docs/adrs/ADR-006-storybook-taxonomy-and-story-shape.md)** — what stories a file exports + where the title sits in the sidebar. **Governs `*.stories.tsx`.** Not lint-enforced; PR-review is the gate. **This skill exists because of that gap.**
- **[ADR-007](../../docs/adrs/ADR-007-storybook-page-recipe.md)** — the MDX page recipe (`*.mdx`). Lint-enforced via `scripts/lint-storybook-recipe.js`. Out of scope for this skill.

---

## The Two Story Shapes (load-bearing — ADR-006 Part B)

Every BDS component story file ships exactly two kinds of stories:

1. **`Playground`** — args-driven sandbox. Controls work. One canonical instance.
2. **One story per meaningful state** — args-driven, named by the state.

"Meaningful state" — pick what changes behavior or appearance enough to matter:

- A value on a primary axis: `Information`, `Warning`, `Error`, `Announcement` (tone)
- A behavior toggle: `Dismissible`, `WithAction`, `TitleOnly`
- A composition that's irreducible: `WithIcon`, `WithCustomContent`

Story names use the state directly (`Warning`, not `Variants > Warning`). The Storybook sidebar + autodocs page **is** the gallery. Don't build a second gallery inside `render`.

```tsx
// ✅ ADR-006-conformant
export const Playground: Story = { args: { tone: 'information', ... } };
export const Information: Story = { args: { tone: 'information', ... } };
export const Warning: Story = { args: { tone: 'warning', ... } };
export const Error: Story = { args: { tone: 'error', ... } };
export const Dismissible: Story = { args: { dismissible: true, ... } };
```

---

## Banned story exports (zero exceptions for new files)

| Export name | Banned because |
|---|---|
| `export const Variants` | Duplicates the sidebar. Stacked render forfeits per-state Chromatic snapshots, MCP discovery, Controls, A11y addon coverage, permalinks. |
| `export const Tones` | Same. A "tone" *is* a state — name the story `Warning`, not `Tones > Warning`. |
| `export const Patterns` | Same. If a pattern is real-world composition, give it a state-named story (`OnboardingChecklist`). |
| `export const SizesAndVariants` | "And" in a story name means two axes in one — split into `Sizes` + state stories. |

**ADR-007 H2 sections are different.** `## Variants` and `## Patterns` are required as **MDX H2 headings** in the docs page (ADR-007). They are NOT story export names. Same words, different layers:

```tsx
// In Component.stories.tsx — ADR-006
export const Playground: Story = ...
export const Warning: Story = ...          // ← state-named story
export const OnboardingChecklist: Story = ...
```

```mdx
{/* In Component.mdx — ADR-007 */}
## Variants                                 ← MDX H2 (required)
### Warning
<Canvas of={Stories.Warning} />             ← references the state-named story

## Patterns                                 ← MDX H2 (required)
<Canvas of={Stories.OnboardingChecklist} />
```

---

## `render` is for irreducible cases only

Args first. Use `render` only when args can't express the case:

- Multi-component composition with no natural single-component equivalent
- Hook usage required by the demo (a controlled toggle pattern that's the only way to demonstrate the interaction)

`render` used purely to lay out a documentation gallery (with `<SectionLabel>` rows, `<Stack>` helpers) is **not** an irreducible case. Strip the helpers; split into args-driven stories.

---

## The narrow axis-only-gallery exception

A comparison gallery earns **one** dedicated story when **and only when** all three apply:

1. Side-by-side comparison is the entire point (e.g., `Sizes` showing `xs/sm/md/lg/xl` of one component in one column).
2. The autodocs page can't make the same comparison clear — sidebar order isn't enough.
3. It's one axis, not a mix — a `Sizes` gallery is fine; a gallery that combines size, tone, and content shape is not.

Story is named after the axis (`Sizes`, `Densities`, `Placements`) — **never** `Variants` / `Patterns` / `Examples`.

---

## MCP Discipline (mandatory)

The Storybook MCP server (`get-documentation`) is what agents in consumer repos (`brik-client-portal`, `renew-pms`, `freedom-client-portal`) hit to pick BDS primitives. **Every story export needs an `@summary` JSDoc** and **every component meta needs exactly one surface tag**. Without these, agents get every BDS component back as noise with no signal about applicability.

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

Under 60 characters per `@summary` (MCP truncates after that).

### Exactly one surface tag in `meta.tags`

| Tag | Use when |
|---|---|
| `surface-web` | Marketing / site surfaces — `brikdesigns.com`, Webflow client sites (`Footer`, `NavBar`, `PricingCard`, `CardTestimonial`, `ServiceBadge`) |
| `surface-product` | Product app surfaces — `brik-client-portal`, `renew-pms`, `freedom-client-portal` (`AddableEntryList`, `FieldGrid`, `FilterBar`, `Sheet`, `SidebarNavigation`) |
| `surface-shared` | Used in both contexts — the **default for primitives** (`Button`, `Badge`, `Field`, `Modal`, `Toast`) |

```tsx
const meta: Meta<typeof Button> = {
  title: 'Components/Action/button',
  component: Button,
  tags: ['surface-shared'],
  // …
};
```

New components default to `surface-shared` unless the component's *API* assumes one surface (a marketing-only prop, a product-only context provider). Surface is about API affordance, not adoption count.

### Deprecated stories must hide from agents

Component deprecated (`@deprecated` JSDoc)? Same PR adds `tags: ['!manifest']` to the meta, so MCP `list-all-documentation` skips it:

```tsx
const meta = {
  component: AlertBanner,
  tags: ['!manifest'],  // deprecated — hide from MCP discovery
} satisfies Meta<typeof AlertBanner>;
```

---

## Sidebar taxonomy — four content top-levels

`Foundations` / `Components` / `Patterns` / `Theming`, plus `Overview` (kept separate) and `Deprecated` (sorts last, tagged `!manifest`). `Components/` uses a single alphabetical subcategory layer:

```
Action  Addables  Card  Container  Control  Feedback
Form  Indicator  List  Navigation  Overlay  Structure
```

**Before writing `title:` in a story meta, read the sibling stories' titles in the same folder.** The sidebar tree is shared across all of Storybook — introducing a parallel top-level group (`Blueprints/...` instead of `Theming/Blueprints/...`) fragments it.

Full member list per subcategory and the canonical title-prefix table lives in ADR-006 Part A. Query brik-rag (below) or open `docs/adrs/ADR-006-storybook-taxonomy-and-story-shape.md`.

---

## Existing files are grandfathered

73 component story files were swept through ADR-007's page-recipe migration (PRs #428–#445, all merged). Many of them still export `Variants` / `Patterns` story names that this skill bans for new files. **ADR-006 §Migration explicitly waives retroactive cleanup of these.**

Rules:

- **New component story files** — must conform to the two-shape model from day one.
- **Existing files** — keep whatever shape ADR-007's pass left them in. **Do not retroactively rewrite** to match ADR-006.
- **Opportunistic migration** — if you're already touching an existing file for a real reason (prop addition, refactor, bug fix), migrating to the two-shape model in the same PR is fine.

If you find yourself wanting to "clean up" an existing file's `export const Variants` because it bothers you, **stop**. That's out-of-scope sweep work and was deliberately shelved.

---

## Per-component detail (load on demand)

Don't restate the per-component prose in this skill. Query the canonical corpus at the moment of authoring:

```bash
brik-rag query "storybook writing guide ADR-006 story shape"
brik-rag query "storybook sidebar taxonomy components subcategory"
brik-rag query "storybook MCP discipline summary surface tag"
brik-rag query "storybook 9 imports framework package"
```

Each query returns chunks from `canon-coding-standards/brik-bds-storybook-writing-guide` (the cached MCP output + ADR-006 reconciliation) and `canon-coding-standards/brik-bds-component-patterns/storybook-stories`. **Quote the retrieved pattern in your edit; don't paraphrase.**

In-repo source if brik-rag is unavailable:

- `docs/STORYBOOK-WRITING-GUIDE.md` — cached MCP output + ADR-006 summary
- `docs/adrs/ADR-006-storybook-taxonomy-and-story-shape.md` — the rulebook for `.stories.tsx`
- `docs/adrs/ADR-007-storybook-page-recipe.md` — the MDX page recipe (for context only; out of scope for this skill)

---

## Agent Checklist (before committing any story-file edit)

1. **Read three sibling story files** in the same `components/ui/<Subcategory>/` folder. Match their `title:` prefix, surface tag, and overall shape.
2. **Verify the two-shape model** — file exports `Playground` plus one story per meaningful state. No `Variants` / `Tones` / `Patterns` story exports (in new files).
3. **Verify every export has an `@summary` JSDoc** under 60 characters.
4. **Verify `meta.tags` has exactly one of** `surface-web` / `surface-product` / `surface-shared`.
5. **If the component is deprecated**, verify `meta.tags` also includes `!manifest`.
6. **Verify `title:` prefix matches existing sidebar** — if you're inventing a new top-level group, that needs an ADR amendment, not a freelance addition.
7. **Verify Storybook 9 imports** — `from '@storybook/react-vite'` (not `@storybook/react`), `from 'storybook/test'` (not `@storybook/test`).
8. **If you used `render`**, verify the case is irreducible (multi-component composition, hook usage). Documentation galleries via `render` are out.

---

## When NOT to use this skill

- Editing `*.mdx` docs pages (`components/ui/<Component>/<Component>.mdx`) — that's ADR-007's recipe, enforced by `scripts/lint-storybook-recipe.js`. Different skill (or no skill — lint catches it).
- Tweaking an existing line in a story file without changing structure (a label string, an arg value). The principles still hold but the checklist is overkill.
- Stories under `stories/` that aren't component stories — design-system metadata (`HealthDashboard`, `TokenCoverage`, `ContrastCompliance`) and theming dev tools have their own shape.
- Stories in `node_modules/`, `vendor/`, or any auto-generated location.

---

## Pointers

- **ADR-006** (`docs/adrs/ADR-006-storybook-taxonomy-and-story-shape.md`) — story-shape + sidebar taxonomy. Not lint-enforced.
- **ADR-007** (`docs/adrs/ADR-007-storybook-page-recipe.md`) — MDX page recipe. Lint-enforced via `scripts/lint-storybook-recipe.js`.
- **STORYBOOK-WRITING-GUIDE.md** (`docs/STORYBOOK-WRITING-GUIDE.md`) — cached MCP output + ADR-006 summary. Re-ingest after editing.
- **Corpus source** — chunks live under `canon-coding-standards/brik-bds-storybook-writing-guide` and `canon-coding-standards/brik-bds-component-patterns` in brik-rag.
- **Lint gap** — story-shape lint (rejecting `Variants` / `Tones` / `Patterns` story exports in new files) is a candidate follow-up not yet wired. Tracked as [brik-bds#569](https://github.com/brikdesigns/brik-bds/issues/569) (sub-issue of brik-llm#438).
- **Shelved sweep** — `task/storybook-shape-migration-wip` (commit `8daccd0`) preserved the abandoned 142-file refactor. Reference only; do not resurrect.
