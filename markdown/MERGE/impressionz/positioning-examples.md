c# Positioning Examples from Your Site
**Real-world code examples from impressionz.webflow**

This document connects your positioning theory to actual implementation in your codebase.

---

## 📚 Table of Contents

1. [Section Anatomy Examples](#section-anatomy-examples)
2. [Positioning Type Examples](#positioning-type-examples)
3. [Display Type Examples](#display-type-examples)
4. [Complex Pattern Examples](#complex-pattern-examples)

---

## Section Anatomy Examples

Based on your visual documentation showing Section → Container → Layout → Layout Item → Wrapper → Content hierarchy:

### Example 1: Standard Hero Section

**HTML Structure:**
```html
<section class="section_hero">                    <!-- Level 1: Section -->
  <div class="container_lg">                      <!-- Level 2: Container -->
    <div class="layout_2-col">                    <!-- Level 3: Layout -->
      <div class="layout-item_hero-content">      <!-- Level 4: Layout Item -->
        <div class="content-wrapper">             <!-- Level 5: Wrapper -->
          <h1 class="text_heading-lg">Title</h1>  <!-- Level 6: Content -->
          <p class="text_body-md">Body text</p>
        </div>
      </div>
    </div>
  </div>
</section>
```

**CSS:**
```css
/* Level 1: Section - Sets overall positioning context */
.section_hero {
  position: relative;              /* Creates context for absolute children */
  display: flex;                   /* Layout method */
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: var(--_layout---space--huge) var(--_layout---space--lg);
}

/* Level 2: Container - Constrains width */
.container_lg {
  /* position: static (default) */
  max-width: 1200px;
  width: 100%;
}

/* Level 3: Layout - Organizes columns/rows */
.layout_2-col {
  /* position: static (default) */
  display: flex;
  flex-direction: row;
  gap: var(--_layout---gap--md);
}

/* Level 4: Layout Item - Individual column/cell */
.layout-item_hero-content {
  /* position: static (default) */
  display: flex;
  flex-direction: column;
}

/* Level 5: Wrapper - Groups content */
.content-wrapper {
  /* position: static (default) */
  display: flex;
  flex-direction: column;
  gap: var(--_layout---gap--md);
}

/* Level 6: Content - Typography/images */
.text_heading-lg,
.text_body-md {
  /* position: static (default) */
  /* display: block (default for text) */
}
```

**Positioning Breakdown:**
- **Section:** `position: relative` (needs to position children)
- **Container → Content:** All `position: static` (default)
- **Display:** Flexbox at multiple levels for layout control

---

### Example 2: Career Section with Overlay Card

**HTML Structure:**
```html
<section class="section_career">                  <!-- Relative positioning -->
  <div class="container_career">                  <!-- Absolute positioning -->
    <h2>Join Our Team</h2>
    <a href="#" class="button">Apply Now</a>
  </div>
</section>
```

**CSS:**
```css
.section_career {
  position: relative;              /* ✅ Creates positioning context */
  display: flex;
  background-image: url('../images/img-8041.webp');
  background-size: cover;
  height: 800px;
}

.container_career {
  position: absolute;              /* ✅ Positioned within section */
  bottom: 24px;                    /* ✅ 24px from bottom */
  left: 24px;                      /* ✅ 24px from left */
  z-index: 2;                      /* ✅ Above background */
  
  display: flex;
  flex-direction: column;
  max-width: 400px;
  padding: 24px;
  background-color: white;
  border-radius: 8px;
}
```

**Why This Works:**
1. **Section** is `relative` → creates positioning context
2. **Container** is `absolute` → positioned within section
3. **Bottom/left values** → precise placement
4. **Z-index** → ensures card appears above background

**Visual Pattern:**
```
┌──────────────────────────────────────┐
│ Section (Relative)                   │
│   Background Image                   │
│                                      │
│                                      │
│   ┌────────────────┐                │
│   │ Container      │                │
│   │ (Absolute)     │                │
│   │ Bottom: 24px   │                │
│   │ Left: 24px     │                │
│   └────────────────┘                │
└──────────────────────────────────────┘
```

---

## Positioning Type Examples

### Static (Default) - 90% of Your Elements

**What it is:** Normal document flow

**From your code:**
```css
.layout_2-col {
  /* position: static (default, not declared) */
  display: flex;
  flex-direction: row;
  gap: var(--_layout---gap--md);
}

.text_heading-lg {
  /* position: static (default) */
  font-size: var(--_typography---heading--lg);
  line-height: 1.2;
}
```

**When you use it:** Almost always! It's the default.

**Your site's usage:** ✅ Excellent - you don't override static unnecessarily

---

### Relative - Creating Positioning Contexts

**What it is:** Offset from normal position OR creates positioning context

**From your code:**

#### Use Case 1: Positioning Context
```css
.section_hero {
  position: relative;              /* Creates context */
  display: flex;
  justify-content: center;
  align-items: center;
}
```

#### Use Case 2: Card Flip Container
```css
.card_stylist {
  position: relative;              /* Context for card faces */
  perspective: 1200px;
  min-height: 520px;
  transform-style: preserve-3d;
}
```

#### Use Case 3: Navigation Dropdown Parent
```css
.nav-menu-item {
  position: relative;              /* Context for dropdown */
  display: flex;
}
```

**When you use it:**
- Need absolute children positioned within element
- Creating 3D transform context
- Creating stacking context for z-index

**Your site's usage:** ✅ Excellent - always has a purpose

---

### Absolute - Overlays and Positioned Elements

**What it is:** Removed from flow, positioned relative to nearest positioned ancestor

**From your code:**

#### Use Case 1: Overlay Card
```css
.container_career {
  position: absolute;              /* Overlays section */
  bottom: 24px;
  left: 24px;
  z-index: 2;
  display: flex;
}
```

#### Use Case 2: Card Back (Flip Effect)
```css
.card_stylist .card-flip-back {
  position: absolute;              /* Overlays card front */
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;                       /* Takes full parent size */
  transform: rotateY(180deg);
  z-index: 1;
}
```

#### Use Case 3: Dropdown Menu
```css
.dropdown-menu-services {
  position: absolute;              /* Below menu item */
  top: 100%;                       /* Start where parent ends */
  left: 0;
  z-index: 9999;
  min-width: 280px;
}
```

**When you use it:**
- Overlays on sections
- Dropdown menus
- Tooltips, badges
- Card flip effects
- Layered elements

**Your site's usage:** ✅ Excellent - appropriate use cases

---

### Sticky - Scroll-Aware Positioning

**What it is:** Toggle between relative and fixed based on scroll position

**From your code:**
```css
.navigation {
  position: sticky;                /* Sticks to top on scroll */
  top: 0;
  z-index: var(--z-navigation);
  background: white;
}
```

**When you use it:**
- Navigation headers
- Table headers
- Section headers that stick until next section

**Your site's usage:** ✅ Good - used for navigation

**Note:** You also have a `position: fixed` variant. Consider standardizing.

---

### Fixed - Viewport Positioning

**What it is:** Positioned relative to viewport, stays in place on scroll

**From your code:**
```css
.navigation {
  position: fixed;                 /* Always at top of viewport */
  inset: 0 auto auto 0;           /* Top-left corner */
}
```

**When you use it:**
- Modals that cover screen
- Cookie banners
- Chat widgets
- Always-visible navigation (if not using sticky)

**Your site's usage:** ✅ Minimal - good! Use sparingly.

---

## Display Type Examples

### Flexbox - Your Primary Layout Tool

**One-Dimensional Layouts:**

#### Horizontal Row
```css
.layout_2-col {
  display: flex;
  flex-direction: row;             /* Side-by-side */
  gap: var(--_layout---gap--md);
  align-items: stretch;
}
```

#### Vertical Column
```css
.content-wrapper {
  display: flex;
  flex-direction: column;          /* Stacked */
  gap: var(--_layout---gap--md);
}
```

#### Centered Content
```css
.section_hero {
  display: flex;
  justify-content: center;         /* Horizontal centering */
  align-items: center;             /* Vertical centering */
  min-height: 100vh;
}
```

**Your site's usage:** ✅ Perfect - flexbox is your primary tool

---

### Grid - Structured Multi-Column Layouts

**From your code:**

#### 3-Column Pricing Grid
```css
.layout_4-col_pricing {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;  /* 3 equal columns */
  grid-column-gap: var(--_layout---gap--md);
  grid-row-gap: var(--_layout---gap--md);
}
```

#### Navigation Layout
```css
.layout_nav {
  display: grid;
  grid-auto-columns: 1fr;
  grid-column-gap: 16px;
  grid-row-gap: 16px;
}
```

**Your site's usage:** ✅ Good - used where grid makes sense

---

### Block - Full-Width Elements

**From your code:**
```css
.img-profile {
  display: block;                  /* Full width of container */
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

**Your site's usage:** ✅ Appropriate - used for images and block-level content

---

## Complex Pattern Examples

### Pattern 1: Card Flip Effect

**The Setup:**
```
Card Container (Relative)
├── Card Front (Absolute, rotateY(0deg))
└── Card Back (Absolute, rotateY(180deg))
```

**The Code:**
```css
/* Container: Creates positioning context + 3D space */
.card_stylist {
  position: relative;
  perspective: 1200px;             /* 3D depth */
  min-height: 520px;
  transform-style: preserve-3d;
}

/* Front: Default visible state */
.card_stylist .card-flip-front {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  backface-visibility: hidden;     /* Hide when rotated away */
  transform: rotateY(0deg);        /* Facing forward */
  z-index: 2;
}

/* Back: Pre-rotated, hidden */
.card_stylist .card-flip-back {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  backface-visibility: hidden;
  transform: rotateY(180deg);      /* Facing backward */
  z-index: 1;
}

/* Flipped state */
.card_stylist.flipped .card-flip-front {
  transform: rotateY(-180deg);     /* Rotate away */
  z-index: 1;
}

.card_stylist.flipped .card-flip-back {
  transform: rotateY(0deg);        /* Rotate to front */
  z-index: 2;
}
```

**Why This Works:**
1. **Container** is `relative` with `perspective` → creates 3D space
2. **Both faces** are `absolute` → overlaid on same space
3. **Both faces** have `backface-visibility: hidden` → invisible when rotated away
4. **Transform** rotates faces to show/hide
5. **Z-index** ensures correct face is on top

---

### Pattern 2: Dropdown Menu System

**The Setup:**
```
Menu Item (Relative)
└── Dropdown (Absolute, top: 100%)
    └── CMS List (Block/Flex)
        └── Menu Items (Flex)
```

**The Code:**
```css
/* Parent: Creates positioning context */
.nav-menu-item.w-dropdown {
  position: relative;
  display: flex;
}

/* Dropdown: Positioned below parent */
.dropdown-menu-services {
  position: absolute;
  top: 100%;                       /* Start where parent ends */
  left: 0;
  margin-top: 0;
  padding-top: 8px;
  min-width: 280px;
  z-index: 9999;
}

/* Dropdown content container */
.dropdown-menu-services .cms-list-wrapper {
  background-color: #fff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  padding: 8px 0;
}

/* Individual menu items */
.dropdown-menu-services .menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
}
```

**Mobile Adaptation:**
```css
@media screen and (max-width: 991px) {
  .dropdown-menu-services {
    position: static;              /* Back to normal flow */
    width: 100%;
  }
}
```

**Why This Works:**
1. **Menu item** is `relative` → dropdown positions relative to it
2. **Dropdown** is `absolute` with `top: 100%` → appears below menu
3. **Z-index** ensures dropdown appears above other content
4. **Mobile:** Switches to `static` for mobile menu

---

### Pattern 3: Hero Section with Background Video

**The Setup:**
```
Section (Relative, Display: Flex)
├── Background Video (Absolute, z-index: 0)
└── Content Container (Relative, z-index: 1)
    └── Content (Flex)
```

**The Code:**
```css
/* Section: Positioning context + centering */
.section_hero {
  position: relative;              /* Context for video */
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  overflow: hidden;
}

/* Video: Background layer */
.background-video {
  position: absolute;              /* Positioned within section */
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;                      /* Behind content */
  object-fit: cover;
}

/* Content: Foreground layer */
.container_hero-content {
  position: relative;              /* Creates stacking context */
  z-index: 1;                      /* Above video */
  display: flex;
  flex-direction: column;
  text-align: center;
}
```

**Why This Works:**
1. **Section** is `relative` → video positions within it
2. **Video** is `absolute` with full dimensions → fills section
3. **Video z-index: 0** → background layer
4. **Content** is `relative` with `z-index: 1` → foreground layer
5. **Flexbox** on section centers content

---

### Pattern 4: Responsive Column Layout

**The Setup:**
```
Desktop: Flexbox Row (side-by-side)
Mobile:  Flexbox Column (stacked)
```

**The Code:**
```css
/* Desktop: Two columns side-by-side */
.layout_2-col {
  display: flex;
  flex-direction: column;          /* Mobile-first: stacked */
  gap: var(--_layout---gap--md);
}

/* Desktop: Switch to row */
@media screen and (min-width: 1280px) {
  .layout_2-col {
    flex-direction: row;           /* Side-by-side */
  }
}
```

**Why This Works:**
1. **Mobile-first approach** → start with column
2. **Single property change** → `flex-direction: row` on desktop
3. **Gap** works in both directions
4. **No positioning needed** → flexbox handles layout

---

## 🎯 Your Site's Best Patterns

### ✅ Pattern You Nail: Positioning Contexts

Every time you use `position: absolute`, there's a `position: relative` parent:

```css
/* ✅ ALWAYS PAIRED */
.section_career { position: relative; }
.container_career { position: absolute; }

.card_stylist { position: relative; }
.card-flip-back { position: absolute; }

.nav-menu-item { position: relative; }
.dropdown-menu { position: absolute; }
```

**Why it matters:** Ensures predictable, controlled positioning.

---

### ✅ Pattern You Nail: Flexbox Everything

You use flexbox as your primary layout tool:

```css
/* Sections */
.section_hero { display: flex; }

/* Containers */
.container_lg { display: flex; }

/* Layouts */
.layout_2-col { display: flex; }

/* Wrappers */
.content-wrapper { display: flex; }
```

**Why it matters:** Modern, flexible, responsive layouts with minimal code.

---

### ✅ Pattern You Nail: Grid for Structure

When you need structured columns, you use grid:

```css
.layout_4-col_pricing {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
}
```

**Why it matters:** Right tool for the job - grid for grids, flex for flexibility.

---

## 📋 Quick Pattern Checklist

When implementing a new section:

- [ ] Does it need to position children? → `position: relative`
- [ ] Is it an overlay? → `position: absolute` (with relative parent)
- [ ] Should it stick on scroll? → `position: sticky`
- [ ] Need to center content? → `display: flex` + justify/align
- [ ] Need multiple columns? → `display: grid` or flex with wrapping
- [ ] Layered elements? → Use z-index with positioned elements

---

## 🎓 Learn from Your Own Code

**Your codebase demonstrates:**

1. ✅ Consistent positioning patterns
2. ✅ Appropriate use of flexbox (primary tool)
3. ✅ Smart use of grid (when needed)
4. ✅ Proper positioning context hierarchy
5. ✅ Good responsive adaptations

**Keep doing what you're doing!** Your patterns are solid and modern.

---

**Examples Document**  
**Created:** November 8, 2025  
**Source:** Impressionz.webflow codebase  
**Purpose:** Connect theory to practice

