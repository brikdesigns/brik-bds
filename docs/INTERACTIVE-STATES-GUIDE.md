# Interactive States in BDS Components

Guide for implementing hover, focus, active, and other interactive states in Storybook.

## Architecture

BDS uses **inline CSSProperties** for styling, which means:
- ✅ Direct token access via CSS variables
- ✅ Runtime theme switching without CSS rebuilds
- ❌ Cannot use `:hover`, `:focus`, `:active` pseudo-selectors inline

**Solution:** Hybrid approach combining inline styles + CSS classes for pseudo-states.

---

## Pattern 1: CSS Classes for Pseudo-States

Create a companion CSS file for each component that needs interactive states.

### Example: Button with Hover

**File: `components/ui/Button/Button.module.css`**
```css
/* Base button with no additional styling - inline styles handle all base states */
.button {
  /* Hover states using tokens */
  &:hover:not(:disabled) {
    filter: brightness(0.9);
  }

  &:active:not(:disabled) {
    filter: brightness(0.85);
  }

  &:focus-visible {
    outline: 2px solid var(--_color---border--brand);
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

/* Variant-specific hovers if needed */
.button-primary:hover:not(:disabled) {
  background-color: var(--_color---background--brand-primary);
  filter: brightness(0.9);
}

.button-outline:hover:not(:disabled) {
  background-color: var(--_color---background--brand-primary);
  color: var(--_color---text--inverse);
}
```

**Usage in component:**
```tsx
import styles from './Button.module.css';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`${styles.button} ${styles[`button-${variant}`]}`}
        style={combinedStyles}
        {...props}
      />
    );
  }
);
```

---

## Pattern 2: React State for Toggle/Open/Closed

For components with state (dropdowns, modals, switches), use React state.

### Example: Dropdown Menu

```tsx
export function Dropdown({ items }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const buttonStyles: CSSProperties = {
    backgroundColor: isOpen
      ? 'var(--_color---background--brand-primary)'
      : 'var(--_color---surface--primary)',
    // ... other styles
  };

  const menuStyles: CSSProperties = {
    display: isOpen ? 'block' : 'none',
    // ... other styles
  };

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)} style={buttonStyles}>
        Menu {isOpen ? '▲' : '▼'}
      </button>
      <div style={menuStyles}>
        {items.map((item) => (
          <MenuItem key={item.id} {...item} />
        ))}
      </div>
    </>
  );
}
```

---

## Pattern 3: Storybook State Controls

Use Storybook's built-in state management for interactive demos.

### Example: Show All Button States

```tsx
export const InteractiveStates: Story = {
  render: () => {
    const [count, setCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h3>Interactive Button</h3>
        <Button onClick={() => setCount(count + 1)}>
          Clicked {count} times
        </Button>

        <h3>Loading State</h3>
        <Button
          onClick={() => {
            setIsLoading(true);
            setTimeout(() => setIsLoading(false), 2000);
          }}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Click me'}
        </Button>

        <h3>Hover Instructions</h3>
        <p style={{ fontSize: 14, color: 'var(--_color---text--muted)' }}>
          Hover over buttons to see interactive states
        </p>
      </div>
    );
  },
};
```

---

## Pattern 4: State Comparison Stories

Show all states side-by-side for design review.

```tsx
export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
      {/* Normal */}
      <div>
        <p style={{ fontSize: 12, marginBottom: 8 }}>Normal</p>
        <Button variant="primary">Button</Button>
      </div>

      {/* Hover hint */}
      <div>
        <p style={{ fontSize: 12, marginBottom: 8 }}>Hover (try it)</p>
        <Button variant="primary">Button</Button>
      </div>

      {/* Disabled */}
      <div>
        <p style={{ fontSize: 12, marginBottom: 8 }}>Disabled</p>
        <Button variant="primary" disabled>Button</Button>
      </div>

      {/* Loading */}
      <div>
        <p style={{ fontSize: 12, marginBottom: 8 }}>Loading</p>
        <Button variant="primary" disabled>Loading...</Button>
      </div>
    </div>
  ),
};
```

---

## Token Strategy for Interactive States

### Option A: Filter-Based (Quick, No New Tokens)

```css
.button:hover {
  filter: brightness(0.9); /* 10% darker */
}

.button:active {
  filter: brightness(0.85); /* 15% darker */
}
```

**Pros:** Works with any color, no new tokens needed
**Cons:** Can't control exact shade

### Option B: Opacity Overlay (Quick, No New Tokens)

```css
.button {
  position: relative;
}

.button::before {
  content: '';
  position: absolute;
  inset: 0;
  background: black;
  opacity: 0;
  transition: opacity 0.2s;
  border-radius: inherit;
}

.button:hover::before {
  opacity: 0.1; /* 10% black overlay */
}
```

**Pros:** Predictable darkening
**Cons:** More complex, needs ::before element

### Option C: Dedicated Hover Tokens (Best Long-Term)

Add to Webflow and regenerate tokens:

```css
:root {
  --_color---background--brand-primary: #e35335;
  --_color---background--brand-primary--hover: #c7462c; /* ~10% darker */
  --_color---background--brand-primary--active: #ab3a23; /* ~20% darker */
}
```

Then use in CSS:

```css
.button-primary:hover {
  background-color: var(--_color---background--brand-primary--hover);
}
```

---

## Recommended Approach for BDS

1. **Add CSS Module files** for components with interactive states
2. **Use filter: brightness()** for quick hover effects (no new tokens needed)
3. **Use React state** for togglable components (Switch, Dropdown, Modal)
4. **Document in Storybook** with interactive stories and state comparison stories

---

## Quick Start: Add Hover to Button

1. Create `Button.module.css`:
```css
.button {
  &:hover:not(:disabled) { filter: brightness(0.9); }
  &:active:not(:disabled) { filter: brightness(0.85); }
  &:focus-visible { outline: 2px solid var(--_color---border--brand); outline-offset: 2px; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
}
```

2. Update `Button.tsx`:
```tsx
import styles from './Button.module.css';

// In component:
<button className={styles.button} style={combinedStyles} {...props} />
```

3. Restart Storybook to see hover states work immediately!

---

## Storybook Actions Panel

Log interactions for debugging:

```tsx
import { action } from '@storybook/addon-actions';

export const Interactive: Story = {
  args: {
    onClick: action('button-clicked'),
    onMouseEnter: action('button-hover-start'),
    onMouseLeave: action('button-hover-end'),
  },
};
```

---

## Figma Integration

When building from Figma specs:
1. Check Figma for hover state frames (they may exist as separate components)
2. Use Figma's "Inspect" to see exact colors for hover states
3. If Figma uses opacity, match it in CSS
4. If Figma uses specific colors, suggest adding them as tokens

---

## Next Steps

1. Add hover states to Button, Link, and navigation components
2. Implement toggle states for Switch, Checkbox, Radio
3. Add focus states for all interactive elements (accessibility)
4. Create Storybook story showing all interactive states for each component
