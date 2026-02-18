# BDS Token Reference

Complete reference of all design tokens available from the Webflow CSS.

## Token Naming Convention

All semantic tokens follow this pattern:
```
--_[category]---[type]--[variant]
```

Example: `--_color---background--brand-primary`

---

## Spacing Tokens

**Important:** The BDS has 4 spacing modes (Base, Compact, Comfortable, Spacious).
The values below are for **Base mode**, which is the default in Storybook.
The Webflow CSS `.body` class applies Spacious mode by default, but we override
this in `storybook-overrides.css` to use Base mode.

### Spacing Modes Reference (Padding)

| Token | Base | Compact | Comfortable | Spacious |
|-------|------|---------|-------------|----------|
| tiny  | 8px  | 2px     | 4px         | 24px     |
| xs    | 10px | 4px     | 6px         | 24px     |
| sm    | 12px | 4px     | 8px         | 24px     |
| md    | 16px | 8px     | 12px        | 32px     |
| lg    | 24px | 12px    | 20px        | 40px     |
| xl    | 32px | 16px    | 32px        | 48px     |
| huge  | 48px | 24px    | 48px        | 88px     |

**Note:** `xxl` is deprecated — use `xl` instead (same value: 32px in Base mode).

### Semantic Spacing — Padding (Base Mode)

| Token | Primitive | Value |
|-------|-----------|-------|
| `--_space---none` | `--space--0` | 0px |
| `--_space---tiny` | `--space--200` | 8px |
| `--_space---xs` | `--space--250` | 10px |
| `--_space---sm` | `--space--300` | 12px |
| `--_space---md` | `--space--400` | 16px |
| `--_space---lg` | `--space--600` | 24px |
| `--_space---xl` | `--space--800` | 32px |
| `--_space---xxl` | `--space--800` | 32px (deprecated, alias for xl) |
| `--_space---huge` | `--space--1200` | 48px |

### Component-Specific Spacing
| Token | Value | Usage |
|-------|-------|-------|
| `--_space---button` | 8px | Button padding |
| `--_space---input` | 8px | Input padding |

### Gap Tokens (Base Mode)

| Token | Primitive | Value |
|-------|-----------|-------|
| `--_space---gap--none` | `--space--0` | 0px |
| `--_space---gap--tiny` | `--space--50` | 2px |
| `--_space---gap--xs` | `--space--100` | 4px |
| `--_space---gap--sm` | `--space--150` | 6px |
| `--_space---gap--md` | `--space--200` | 8px |
| `--_space---gap--lg` | `--space--400` | 16px |
| `--_space---gap--xl` | `--space--600` | 24px |
| `--_space---gap--xxl` | `--space--600` | 24px (deprecated, alias for gap--xl) |
| `--_space---gap--huge` | `--space--800` | 32px |

---

## Border Radius Tokens

### Semantic Border Radius
| Token | Primitive | Value |
|-------|-----------|-------|
| `--_border-radius---none` | `--border-radius--0` | 0px |
| `--_border-radius---sm` | `--border-radius--50` | 2px |
| `--_border-radius---md` | `--border-radius--100` | 4px |
| `--_border-radius---lg` | `--border-radius--200` | 8px |

### Component-Specific Border Radius
| Token | Value | Usage |
|-------|-------|-------|
| `--_border-radius---button` | 2px | Button corners |
| `--_border-radius---input` | 2px | Input corners |

### Special Values
| Token | Value |
|-------|-------|
| `--border-radius--pill` | 999px |
| `--border-radius--circle` | 9999px |

---

## Border Width Tokens

| Token | Usage |
|-------|-------|
| `--_border-width---none` | No border |
| `--_border-width---sm` | Thin border |
| `--_border-width---md` | Medium border |
| `--_border-width---lg` | Thick border |

---

## Box Shadow Tokens

| Token | Usage |
|-------|-------|
| `--_box-shadow---none` | No shadow |
| `--_box-shadow---sm` | Subtle shadow |
| `--_box-shadow---md` | Medium shadow |
| `--_box-shadow---lg` | Prominent shadow |

---

## Color Tokens

### Background Colors
| Token | Usage |
|-------|-------|
| `--_color---background--primary` | Primary background |
| `--_color---background--secondary` | Secondary/muted background |
| `--_color---background--brand-primary` | Brand color background |
| `--_color---background--brand-secondary` | Secondary brand background |
| `--_color---background--inverse` | Inverse background |
| `--_color---background--input` | Form input background |
| `--_color---background--image` | Image placeholder |
| `--_color---background--image-brand` | Brand image placeholder |

### Surface Colors
| Token | Usage |
|-------|-------|
| `--_color---surface--primary` | Primary surface (cards, panels) |
| `--_color---surface--secondary` | Secondary surface |
| `--_color---surface--brand-primary` | Brand surface |
| `--_color---surface--brand-secondary` | Secondary brand surface |
| `--_color---surface--nav` | Navigation surface |

### Text Colors
| Token | Usage |
|-------|-------|
| `--_color---text--primary` | Primary text |
| `--_color---text--secondary` | Secondary/muted text |
| `--_color---text--muted` | Subdued text |
| `--_color---text--brand` | Brand-colored text |
| `--_color---text--inverse` | Text on dark backgrounds |

### Border Colors
| Token | Usage |
|-------|-------|
| `--_color---border--primary` | Primary borders |
| `--_color---border--secondary` | Subtle borders |
| `--_color---border--brand` | Brand-colored borders |
| `--_color---border--inverse` | Borders on dark backgrounds |
| `--_color---border--input` | Form input borders |

### Page Colors
| Token | Usage |
|-------|-------|
| `--_color---page--primary` | Main page background |
| `--_color---page--secondary` | Alternate sections |
| `--_color---page--brand` | Brand sections |

### Theme Accent Colors
| Token | Usage |
|-------|-------|
| `--_color---theme--primary` | Primary theme color |
| `--_color---theme--secondary` | Secondary theme color |
| `--_color---theme--tertiary` | Tertiary theme color |
| `--_color---theme--fourth` | Fourth theme color |
| `--_color---theme--accent` | Accent color |

### System Colors (non-themed)
| Token | Value | Usage |
|-------|-------|-------|
| `--system--red` | #eb5757 | Error states |
| `--system--green` | #27ae60 | Success states |
| `--system--yellow` | #f2c94c | Warning states |
| `--system--blue` | #2f80ed | Info states |
| `--system--orange` | #f2994a | Caution states |
| `--system--purple` | #9b51e0 | Special states |

### Grayscale (non-themed)
| Token | Value |
|-------|-------|
| `--grayscale--white` | white |
| `--grayscale--lightest` | #f2f2f2 |
| `--grayscale--lighter` | #e0e0e0 |
| `--grayscale--light` | #bdbdbd |
| `--grayscale--dark` | #828282 |
| `--grayscale--darker` | #4f4f4f |
| `--grayscale--darkest` | #333 |
| `--grayscale--black` | black |

---

## Typography Tokens

### Font Families
| Token | Usage |
|-------|-------|
| `--_typography---font-family--body` | Body text |
| `--_typography---font-family--heading` | Headings |
| `--_typography---font-family--display` | Display/hero text |
| `--_typography---font-family--label` | Labels, buttons |
| `--_typography---font-family--icon` | Icon font |

### Body Font Sizes
| Token | Usage |
|-------|-------|
| `--_typography---body--tiny` | Tiny body text |
| `--_typography---body--xs` | Extra small body |
| `--_typography---body--sm` | Small body |
| `--_typography---body--md-base` | Base body size |
| `--_typography---body--lg` | Large body |

### Heading Font Sizes
| Token | Usage |
|-------|-------|
| `--_typography---heading--tiny` | Tiny heading |
| `--_typography---heading--small` | Small heading |
| `--_typography---heading--medium` | Medium heading |
| `--_typography---heading--large` | Large heading |
| `--_typography---heading--x-large` | Extra large heading |
| `--_typography---heading--xx-large` | XX large heading |
| `--_typography---heading--xxx-large` | XXX large heading |

### Display Font Sizes
| Token | Usage |
|-------|-------|
| `--_typography---display--small` | Small display |
| `--_typography---display--medium` | Medium display |
| `--_typography---display--large` | Large display |

### Label Font Sizes
| Token | Usage |
|-------|-------|
| `--_typography---label--sm` | Small label |
| `--_typography---label--md-base` | Base label size |

### Icon Sizes
| Token | Usage |
|-------|-------|
| `--_typography---icon--small` | Small icon |
| `--_typography---icon--medium-base` | Base icon size |
| `--_typography---icon--large` | Large icon |

---

## Size Tokens

### General Sizes
| Token | Usage |
|-------|-------|
| `--_size---none` | 0 |
| `--_size---tiny` | Tiny size |
| `--_size---sm` | Small |
| `--_size---md` | Medium |
| `--_size---lg` | Large |
| `--_size---xl` | Extra large |
| `--_size---xxl` | XX large |
| `--_size---huge` | Huge |

### Container Sizes
| Token | Usage |
|-------|-------|
| `--_size---container-size--full-width` | 100% width |
| `--_size---container-size--three-quarter-width` | 75% width |
| `--_size---container-size--two-third-width` | 66% width |
| `--_size---container-size--half-width` | 50% width |
| `--_size---container-size--one-third-width` | 33% width |
| `--_size---container-size--quarter-width` | 25% width |

### Screen Sizes (Breakpoints)
| Token | Value |
|-------|-------|
| `--_size---screen-size--mobile` | Mobile breakpoint |
| `--_size---screen-size--tablet` | Tablet breakpoint |
| `--_size---screen-size--desktop` | Desktop breakpoint |
| `--_size---screen-size--wide` | Wide desktop |
| `--_size---screen-size--wider` | Ultra-wide |

---

## Usage in Components

### Button Example
```tsx
const buttonStyles = {
  padding: 'var(--_space---button)',
  borderRadius: 'var(--_border-radius---button)',
  fontFamily: 'var(--_typography---font-family--label)',
  fontSize: 'var(--_typography---label--md-base)',
  backgroundColor: 'var(--_color---background--brand-primary)',
  color: 'var(--_color---text--inverse)',
  border: 'var(--_border-width---sm) solid var(--_color---border--brand)',
};
```

### Card Example
```tsx
const cardStyles = {
  padding: 'var(--_space---lg)',
  borderRadius: 'var(--_border-radius---md)',
  backgroundColor: 'var(--_color---surface--primary)',
  border: 'var(--_border-width---sm) solid var(--_color---border--secondary)',
  boxShadow: 'var(--_box-shadow---sm)',
};
```
