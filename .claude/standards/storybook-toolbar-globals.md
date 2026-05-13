---
name: Storybook toolbar globals (BDS)
description: Canonical list of orthogonal environmental axes wired as Storybook toolbar globals. Theme, base font, animations, dev widgets are live; viewport is the Phase 1 addition. Density and locale are future.
type: reference
scope: brik-bds
applies-to: "**/.storybook/preview.tsx, **/.storybook/main.ts"
retrieved-via: brik-rag query "storybook toolbar globals"
last-verified: 2026-05-13
---

# Storybook toolbar globals (BDS)

The canonical list of orthogonal environmental axes wired as Storybook toolbar `globalTypes`. Source of truth lives in this file; agents retrieve via `brik-rag query "storybook toolbar globals"`.

**Out of scope:** story file shape (see [storybook-story-shape](./storybook-story-shape.md)); MDX recipe (see [storybook-mdx-recipe](./storybook-mdx-recipe.md)).

**Authoritative ADR:** [ADR-010 Q1](../../docs/adrs/ADR-010-storybook-axes-of-information.md) — "Is this an orthogonal environmental axis that should reframe **every** story?" If yes, the axis is a toolbar global, never a story export.

## The rule

> A prop is a toolbar global when changing it should reframe **every** story in the build — not just one component's stories. Theme is the canonical example: every story renders differently under `brik` vs. `brik-dark` vs. `client-sim`. Viewport is the same shape: every story has a different mobile / tablet / desktop manifestation.

A future viewport / density / locale / motion story export is **always wrong** — those are toolbar globals by Q1 of the matrix. If you find yourself reaching for a per-component `Dark`, `Mobile`, or `Spacious` story, stop and use the toolbar instead.

## Wired today

| Axis | Global | Values | Default | Wired in |
|---|---|---|---|---|
| **Theme** | `themeNumber` | `brik` (Brik Brand) · `brik-dark` (Brik Brand Dark) · `client-sim` (Font Audit) | `brik` | `.storybook/preview.tsx` |
| **Base font** | `baseFont` | `14` · `16` · `18` · `20` (px) | `16` | `.storybook/preview.tsx` |
| **Animations** | `animations` | `on` · `off` | `on` | `.storybook/preview.tsx` |
| **Dev widgets** | `devWidgets` | `on` · `off` | `off` | `.storybook/preview.tsx` |

### Theme — bundled color + typography + spacing

Three values are wired:

- **`brik`** — light theme. Default.
- **`brik-dark`** — dark theme.
- **`client-sim`** — Font Audit theme. Assigns deliberately different typefaces per family (Georgia for heading, Verdana for body, Courier New for label) so font-family mismatches surface immediately. **Always validate component CSS under Client Sim before merging** — the production themes default to Poppins for all three families, which makes mismatches invisible during BDS development.

The decorator is `withTheme` in [`.storybook/preview.tsx`](../../.storybook/preview.tsx). It applies theme classes to `<body>` and forces dark overrides on emotion-styled elements (Canvas preview, Source blocks, ArgTypes, ActionBar).

### Base font — root font-size scaling

Storybook's preview iframe `<html>` font-size is set from this global; all `rem`-based tokens scale accordingly. Use it to test that token-driven spacing survives a non-default base-font setting.

This is a **partial density proxy** — scaling the root font scales every rem-based spacing token, which approximates a density tier. It is not a true density axis (no separate density-token tier). When the density tokens land, `baseFont` may be folded into a `density` global; until then, this is what we have.

### Animations — motion axis

`on` / `off` toggle. Implements the motion / reduce-motion axis. Used to validate that components remain functional with all CSS animations and transitions disabled.

### Dev widgets — dev tool surface, not an environmental axis

`devWidgets: 'on'` injects the Brik DevBar + FeedbackWidget into every story. This is a development convenience, not an axis a story reads from. Stories should never branch on `context.globals.devWidgets`.

## Phase 1 — adding viewport

[`#587` Phase 1](https://github.com/brikdesigns/brik-bds/issues/587) adds the viewport global. Plan:

| Axis | Global | Values | Implementation |
|---|---|---|---|
| **Viewport** | `viewport` | `mobile` (375 × 667) · `tablet` (768 × 1024) · `desktop` (1280 × 800) | `@storybook/addon-viewport` registered in `.storybook/main.ts`; viewport global wired in `.storybook/preview.tsx` |

Why these three breakpoints: they match the existing responsive tokens (`--breakpoint-sm`, `--breakpoint-md`, `--breakpoint-lg` in [`dist/tokens.css`](../../dist/tokens.css)) and Carbon's `@storybook/addon-viewport` defaults. Adding more breakpoints later is cheap; landing the addon-viewport plumbing is the gate.

PR-B of #587 Phase 1 wires this. PR-A (this PR) ships the standard naming the axis; PR-B follows with the actual addon registration.

## Future — density, locale (deferred)

| Axis | Status | Reason for deferral |
|---|---|---|
| **Density** | Future | Token-side density tier not yet shipped. When density tokens land, the `baseFont` global may be folded in or replaced with a true `density` global driving the new token tier |
| **Locale** | Future | Pseudo-locale (length simulation for layout-bug discovery) is cheaper than real i18n infra and gives 80% of the value. Decision deferred to whichever PR wires the addon. Real i18n requires component-side message keys |

**A story export named `Dense`, `Compact`, `Spanish`, or `English` is wrong** even when these axes aren't wired yet — they are toolbar globals when they exist. Don't author per-component stories for axes that *will be* globals; the matrix's Q1 still applies forward.

## Authoring rules — what a story can and can't do

**What a story can read:**

```tsx
export const Example: Story = {
  render: (args, context) => {
    const themeNumber = context.globals.themeNumber;
    return <Component {...args} themeAware={themeNumber === 'brik-dark'} />;
  },
};
```

Stories MAY read `context.globals.*` if they need to adapt their render to the current global (rare — almost always the component itself should respond to theme via CSS variables, not the story).

**What a story can't do:**

- Export a story whose only differentiator is a global axis (`Dark`, `Mobile`, `Reduced`). That's a toolbar usage, not a story.
- Force a global value with `parameters.globals = { themeNumber: 'brik-dark' }`. The user controls the toolbar; the story doesn't override it.
- Branch component behavior on a global Storybook detects only — the same code runs in consumer apps that have no Storybook globals.

## When a new toolbar global is added

1. Add the entry to `globalTypes` in `.storybook/preview.tsx`
2. If a wrapper addon is needed (`@storybook/addon-viewport`, etc.), register it in `.storybook/main.ts`
3. Add a row to the "Wired today" table in this file
4. Bump `last-verified` in frontmatter
5. Re-run `scripts/ingest-storybook-toolbar-globals-standard.sh`
6. Update ADR-010 only if the rule itself changes — adding a wired axis doesn't require an ADR amendment

## When this standard updates

1. Edit this file (the source of truth)
2. Re-run `scripts/ingest-storybook-toolbar-globals-standard.sh` to push to brik-rag
3. Bump `last-verified` in frontmatter
4. Note the change in the PR description

The skill auto-retrieves on `.storybook/preview.tsx` and `.storybook/main.ts` edits — no other propagation needed.
