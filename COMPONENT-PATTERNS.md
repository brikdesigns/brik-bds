# BDS Component Patterns

How we build components. Every new and migrated component follows these rules.


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

The `.mdx` page references stories and adds brief prose context:

```mdx
<Canvas of={Stories.Playground} />
<Canvas of={Stories.Variants} />
<Canvas of={Stories.Patterns} />
```


## Migration checklist

When updating an existing component:

- [ ] Move styles to `.css` — remove all `CSSProperties` objects and `as unknown as number` casts
- [ ] Use `bdsClass` for class composition — pass through `className` and `style`
- [ ] Verify all tokens are semantic — run `npm run lint-tokens`
- [ ] Add danger variants if the component triggers destructive actions
- [ ] Split into sub-components if it renders different HTML elements
- [ ] Standardize stories — Playground, Variants, Patterns
- [ ] Update `.mdx` docs to reference new story exports
