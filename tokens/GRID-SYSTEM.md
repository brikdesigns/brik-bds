# BDS Grid System Standards

## Overview

The Brik Design System (BDS) implements a **4-point mathematical grid** as the foundation for all spacing, sizing, and layout decisions. This document establishes our grid principles, current implementation, and migration path.

**Current Status:** PX-based system with 4-point adherence ✓  
**Future Migration:** REM-based system while maintaining 4-point grid

---

## Why a Mathematical Grid?

A mathematical grid system ensures:

- **Consistency**: Every spacing value aligns to a predictable scale
- **Scalability**: Works across all device sizes (mobile → desktop)
- **Harmony**: Creates visual rhythm and balance in layouts
- **Collaboration**: Designers and developers share a common language
- **Maintainability**: Fewer unique values = easier to update globally
- **Accessibility**: Consistent spacing improves cognitive load

### Common Grid Systems

| System | Base Unit | Scale | Use Case |
|--------|-----------|-------|----------|
| **4-point** | 4px | 4, 8, 12, 16, 20, 24, .. | High precision, small devices |
| **8-point** | 8px | 8, 16, 24, 32, 40, 48, .. | Standard, most modern systems |

**BDS Decision:** We use a **4-point base** for maximum precision while building toward REM.

---

## BDS Spacing Scale (Current)

All spacing values must be **multiples of 4** (in pixels):

```
--space--0:    0px      (0 × 4)
--space--25:   1px      (¼ × 4) — rare, micro adjustments
--space--50:   2px      (½ × 4) — rare, micro adjustments
--space--100:  4px      (1 × 4)   ← minimum useful spacing
--space--150:  6px      (1.5 × 4) ⚠ NOT 4-point aligned
--space--200:  8px      (2 × 4)
--space--250:  10px     (2.5 × 4) ⚠ NOT 4-point aligned
--space--300:  12px     (3 × 4)
--space--350:  14px     (3.5 × 4) ⚠ NOT 4-point aligned
--space--400:  16px     (4 × 4)
--space--450:  18px     (4.5 × 4) ⚠ NOT 4-point aligned
--space--500:  20px     (5 × 4)
--space--700:  28px     (7 × 4)
--space--800:  32px     (8 × 4)
--space--900:  36px     (9 × 4)
--space--1000: 40px     (10 × 4)
--space--1100: 44px     (11 × 4)
--space--1200: 48px     (12 × 4)
--space--1300: 52px     (13 × 4)
--space--1400: 56px     (14 × 4)
--space--1500: 60px     (15 × 4)
--space--1600: 64px     (16 × 4)
--space--1700: 72px     (18 × 4)
--space--1800: 80px     (20 × 4)
--space--1900: 84px     (21 × 4)
--space--2000: 88px     (22 × 4)
--space--2100: 96px     (24 × 4)
--space--2200: 104px    (26 × 4)
--space--2300: 112px    (28 × 4)
--space--2400: 128px    (32 × 4)
--space--2500: 136px    (34 × 4)
```

**⚠️ Anomalies:** Values marked above do NOT follow 4-point alignment. These should be reviewed during token cleanup.

---

## Practical Applications

### Buttons & Interactive Elements
```tsx
padding: var(--_space---md)      // 8px vertical × 16px horizontal
gap: var(--_space---sm)          // 4px between icon + text
```

### Cards & Containers
```tsx
padding: var(--_space---lg)      // Internal breathing room
gap: var(--_space---xl)          // Space between cards (16px)
borderRadius: 8px (--border-radius--200)
```

### Typography & Line Spacing
```tsx
marginBottom: var(--_space---md)  // 8px below headings
lineHeight: 1.5                   // Proportional line height
```

### Layout Sections
```tsx
margin: var(--_space---xxl)       // Top-level section spacing (32px)
gap: var(--_space---lg)           // Grid gaps
```

---

## Semantic vs Primitive

### ✓ Correct: Use Semantic Tokens
```tsx
<div style={{ padding: 'var(--_space---md)' }}>
  {/* Uses semantic token (via CSS variable) */}
</div>
```

### ✗ Incorrect: Hardcoded Pixels
```tsx
<div style={{ padding: '8px', margin: '12px' }}>
  {/* Hard to maintain, breaks grid, hard to audit */}
</div>
```

### ✗ Incorrect: Primitive Tokens in Components
```tsx
<div style={{ padding: 'var(--space--200)' }}>
  {/* Breaks abstraction layer; use semantic --_space---* instead */}
</div>
```

---

## CSS Naming Convention

All spacing tokens follow this pattern:

```
--_space---[semantic-type]--[variant]
```

**Examples:**
- `--_space---md` — medium spacing (generic)
- `--_space---gap--lg` — large gap (layout)
- `--_space---button` — button-specific spacing
- `--_space---input` — input-specific spacing

---

## Best Practices

### 1. Always Use Tokens
Never hardcode pixel values. If a token doesn't exist, create it.

### 2. Follow the Scale
When adding new values, ensure they're **multiples of 4**.

**Good:**
- 4px, 8px, 12px, 16px, 20px, 24px, 28px, 32px...

**Bad:**
- 5px, 7px, 11px, 15px, 18px, 23px...

### 3. Density Modes
BDS supports spacing density modes (compact, comfortable, spacious):
```css
:root { --_space---lg: var(--space--400); }      /* Compact: 16px */
.body { --_space---lg: var(--space--400); }      /* Comfortable: 16px (default) */
.body.spacious { --_space---lg: var(--space--1300); } /* Spacious: 52px */
```

### 4. Migration to REM
Plan for REM conversion (1rem = 16px at root):
- `4px` → `0.25rem`
- `8px` → `0.5rem`
- `16px` → `1rem`
- `32px` → `2rem`

The 4-point alignment will remain intact at any root font size.

---

## Validation Rules

Run `npm run lint-tokens` to validate:

1. **Grid Adherence**: Spacing values are multiples of 4
2. **Token Coverage**: All hardcoded pixels use semantic tokens
3. **Type Correctness**: Margins/paddings use space tokens, not size tokens
4. **Semantic Layer**: Components use `--_space---*`, not primitives

---

## Adding New Spacing Values

Before adding a new token:

1. **Check if it's needed** — Can an existing token be used?
2. **Ensure 4-point alignment** — Must be divisible by 4
3. **Document the use case** — Why does this value exist?
4. **Update this file** — Add it to the scale above
5. **Rebuild tokens** — Run `npm run build:sd-figma`

**Example: Adding 44px spacing**
```
--space--1100: 44px (11 × 4) ✓ Valid
```

---

## Future: REM Conversion Timeline

### Phase 1 (Current): Foundation
- ✓ 4-point grid is standard
- ✓ Linting validates adherence
- All values in PX

### Phase 2: Preparation
- Define REM conversion table
- Add REM-based tokens alongside PX
- Update documentation with REM examples

### Phase 3: Migration
- Build CSS variable system with fallbacks
- Update components to use REM tokens
- Test across devices and breakpoints

### Phase 4: Deprecation
- PX tokens marked as legacy
- Full REM-based system active
- Remove PX tokens in v1.0

---

## References

- **4-Point Grid Article**: [Medium - Designing with Spacing: The Power of a 4-Point System](https://medium.com/@linz07m/designing-with-spacing-the-power-of-a-4-point-system-949771d8dbf4)
- **8-Point Grid Article**: [UX Planet - Everything You Should Know About 8-Point Grid System](https://uxplanet.org/everything-you-should-know-about-8-point-grid-system-in-ux-design-b69cb945b18d)
- **Token Reference**: [tokens/TOKEN-REFERENCE.md](./TOKEN-REFERENCE.md)
- **Theme System**: [tokens/themes.css](./themes.css)

---

## Questions?

If a spacing value seems off, check:
1. Is it a multiple of 4?
2. Is it defined in `figma-tokens.css`?
3. Did the design system scan catch it in `lint-tokens`?

For REM planning or grid questions, raise an issue in the repo.
