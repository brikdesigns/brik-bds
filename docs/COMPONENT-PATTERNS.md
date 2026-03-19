# BDS Component Patterns

How we build components. Every new and migrated component follows these rules.


## Pre-implementation: Design in Paper

For new or composite components, use Paper (Claude Code's HTML canvas) to iterate visually before writing `.tsx` and `.css` files. Paper renders real HTML/CSS instantly — you get a live design review loop without committing to code.

**When to use Paper first:**
- New composite components (data tables, date pickers, kanban boards, calendar views)
- Complex interaction states (multi-step forms, nested menus, drag-and-drop)
- First-time patterns with no existing BDS analog
- Any component where the right visual solution isn't obvious from a Figma spec alone

**When to skip Paper:**
- Simple variants of existing components (adding `xl` size to Button)
- Straightforward icon additions or copy changes
- Components with a clear, unambiguous Figma spec

**The discipline:** Paper must use BDS token CSS variable names exclusively — never raw hex values or hardcoded sizes. Every `color`, `padding`, `font-size`, and `border` in Paper HTML maps to a `var(--token-name)` from `tokens/figma-tokens.css`. This keeps Paper designs in sync with the token system and makes the HTML → CSS translation direct.

```html
<!-- Correct — tokens only -->
<div style="padding: var(--padding-lg); color: var(--text-primary); border: var(--border-width-md) solid var(--border-secondary);">

<!-- Wrong — hardcoded -->
<div style="padding: 24px; color: #1a1a1a; border: 1px solid #e0e0e0;">
```

**The exit:** Once the Paper design is approved internally, export the token usage as a reference and implement directly in `.tsx` + `.css`. The component CSS should map almost 1:1 with what Paper used.

**Token reference:** `tokens/TOKEN-REFERENCE.md` — validate every token before using it in Paper or CSS.


## File structure

```
components/ui/ComponentName/
├── ComponentName.tsx           ← Logic + class composition
├── ComponentName.css           ← All visual styles
├── ComponentName.stories.tsx   ← Storybook stories
├── ComponentName.mdx           ← Documentation page
├── index.ts                    ← Public exports
└── VariantName.tsx             ← Semantic variant (rare)
```


## Styles live in CSS

The `.tsx` file handles logic. The `.css` file handles appearance. No inline style objects in components.

```css
/* Badge.css */
.bds-badge { ... }
.bds-badge--sm { ... }
.bds-badge--positive { ... }
.bds-badge:hover:not(:disabled) { ... }
```

```tsx
/* Badge.tsx */
import './Badge.css';

return (
  <span className={bdsClass('bds-badge', `bds-badge--${size}`, `bds-badge--${status}`, className)}
        style={style} {...props}>
    {children}
  </span>
);
```

Inline `style` is only acceptable for:
- Passing through the user-provided `style` prop
- Runtime-calculated values (percentages, positions)
- Story layout helpers (`.stories.tsx` only)


## Class naming

```
.bds-{component}                    base
.bds-{component}--{variant}         variant or size
.bds-{component}--{state}           state (loading, active, disabled)
.bds-{component}__{child}           child element
.bds-{component}__{child}--{mod}    child modifier
```


## Tokens only

All values come from semantic tokens. No hardcoded values, no primitives.

```css
/* Correct — semantic tokens */
.bds-card {
  padding: var(--padding-lg);
  border: var(--border-width-md) solid var(--border-secondary);
  font-size: var(--body-md);
}

/* Wrong — hardcoded */
.bds-card {
  padding: 24px;
  border: 1px solid #e0e0e0;
  font-size: 16px;
}

/* Wrong — primitives */
.bds-card {
  padding: var(--space--700);
  font-size: var(--font-size--400);
}
```

Validate every token reference against `tokens/` before using it.


## Props

Every component follows these conventions:

```
variant     union type for visual style
size        'sm' | 'md' | 'lg' (some add 'xs' or 'xl')
className   composed via bdsClass(), user classes go last
style       passed through for overrides
...props    spread remaining HTML attributes
```

Extend from the appropriate HTML attributes interface:

```tsx
interface BadgeProps extends HTMLAttributes<HTMLSpanElement> { ... }
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { ... }
```


## Class composition

```tsx
import { bdsClass } from '../../utils';

const classes = bdsClass(
  'bds-component',                          // base
  `bds-component--${variant}`,              // variant
  `bds-component--${size}`,                 // size
  loading && 'bds-component--loading',      // conditional
  className                                 // user classes (last)
);
```

Falsy values are filtered automatically.


## Interactive states

For any component with hover, focus, or active behavior:

```css
.bds-component { }
.bds-component:hover:not(:disabled):not(.bds-component--loading) { }
.bds-component:active:not(:disabled) { }
.bds-component:focus-visible { }
.bds-component:disabled { }
```


## Semantic splitting

If a component renders different HTML elements depending on props, split it.

```
Button      → <button>     in-page actions
LinkButton  → <a>          navigation styled as button
IconButton  → <button>     icon-only with aria-label
```

Split when different elements, required props, or accessibility contracts. Don't split for visual variants — that's what the `variant` prop is for.


## Danger variants

Interactive components that trigger destructive actions get danger variants:

```
danger           filled red
danger-outline   red border
danger-ghost     red text only
```

Not every component needs all three. Only add what makes sense.


## Accessibility

```
Icon-only buttons     → aria-label required (via label prop)
Loading state         → aria-busy="true"
Disabled state        → native disabled attribute
Focus                 → focus-visible outline, never removed
Links as buttons      → role="button" on <a>
Danger actions        → color + text/icon (never color alone)
```


## Storybook stories

Three required stories per component. Zero redundancy.

```
Playground    args-based, Controls panel exploration
Variants      render function, ALL permutations in one grid
Patterns      render function, real-world compositions
```

Optional stories only when a feature warrants dedicated focus (Icons, States, Loading). Maximum 8 stories — if you need more, the component may need splitting.

```tsx
const meta: Meta<typeof Component> = {
  title: 'Components/[Category]/[name]',
  component: Component,
  parameters: { layout: 'centered' },
  argTypes: { ... },
};

export const Playground: Story = { args: { ... } };

export const Variants: Story = {
  render: () => <Stack>{/* sizes × variants × states */}</Stack>,
};

export const Patterns: Story = {
  name: 'Patterns',
  render: () => <Stack>{/* real-world scenarios */}</Stack>,
};
```

Layout helpers (`SectionLabel`, `Row`, `Stack`) are defined per story file for consistent visual grouping.

## MDX documentation

Every component has a `.mdx` file. Follow these rules for readable, professional docs.

**Structure:**

```mdx
import { Meta, Canvas, ArgTypes } from '@storybook/addon-docs/blocks';
import * as Stories from './Component.stories';

<Meta of={Stories} />

# Component

One-line description of what the component does.

---

## Playground

<Canvas of={Stories.Playground} />

## Variants

<Canvas of={Stories.Variants} />

## Patterns

<Canvas of={Stories.Patterns} />

---

## Props

<ArgTypes of={Stories} />

---

## Usage

(code block with import + common patterns)

---

## Tokens

(bulleted list of tokens used)
```

**Formatting rules:**

- **No markdown tables** for component composition, token lists, or variant descriptions. Use bulleted lists with **bold** labels instead. Tables render as unreadable text in Storybook.
- **`<ArgTypes>`** for the primary component's props — auto-generated from TypeScript, always up to date.
- **Bulleted definition lists** for sub-component props that don't have their own story meta:
  ```mdx
  - **`title`** `string` — Column heading text.
  - **`count`** `number` — Item count beside the title.
  ```
- **Horizontal rules** (`---`) between major sections for visual breathing room.
- **Inline code** for prop names, token names, and component references.
- **One sentence** of context before each `<Canvas>` block — what the reader is looking at and why.
- **No variant tables** — if variants need explanation, use a bulleted list after the Canvas.

**Golden reference:** `Board/Board.mdx`


## Migration checklist

When updating an existing component:

- [ ] Move styles to `.css` — remove all `CSSProperties` objects and `as unknown as number` casts
- [ ] Use `bdsClass` for class composition — pass through `className` and `style`
- [ ] Verify all tokens are semantic — run `npm run lint-tokens`
- [ ] Add danger variants if the component triggers destructive actions
- [ ] Split into sub-components if it renders different HTML elements
- [ ] Standardize stories — Playground, Variants, Patterns
- [ ] Update `.mdx` docs to reference new story exports
