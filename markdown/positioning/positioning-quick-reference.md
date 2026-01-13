# Positioning & Display Quick Reference
**One-page cheat sheet for daily use**

---

## 🎯 When to Use What

### Display Types

```
Need to layout children?
├─ YES
│   ├─ One direction (row OR column)? → FLEXBOX
│   ├─ Two directions (rows AND columns)? → GRID
│   └─ Content determines size? → FLEXBOX
└─ NO
    ├─ Full-width? → BLOCK
    └─ Inline with text? → INLINE or INLINE-BLOCK
```

### Positioning Types

```
Need special positioning?
├─ NO → Keep default (STATIC)
├─ Need context for absolute children? → RELATIVE
├─ Overlay/positioned element? → ABSOLUTE
├─ Stick on scroll? → STICKY
└─ Always visible? → FIXED
```

---

## 🔧 Common Patterns

### Pattern 1: Overlay/Badge
```css
.card {
  position: relative;        /* Creates context */
}
.card .badge {
  position: absolute;        /* Positioned within card */
  top: 8px;
  right: 8px;
  z-index: var(--z-elevated);
}
```

**Use for:** Badges, "New" labels, close buttons

---

### Pattern 2: Centered Content
```css
.hero {
  display: flex;
  justify-content: center;   /* Horizontal */
  align-items: center;       /* Vertical */
  min-height: 100vh;
}
```

**Use for:** Hero sections, splash screens, modals

---

### Pattern 3: Dropdown Menu
```css
.menu-item {
  position: relative;        /* Context for dropdown */
}
.dropdown {
  position: absolute;        /* Below menu item */
  top: 100%;
  left: 0;
  z-index: var(--z-elevated);
}
```

**Use for:** Dropdown menus, tooltips, popovers

---

### Pattern 4: Card Grid
```css
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
```

**Use for:** Card grids, image galleries, pricing tables

---

### Pattern 5: Sticky Header
```css
.header {
  position: sticky;
  top: 0;
  z-index: var(--z-navigation);
}
```

**Use for:** Navigation headers, table headers

---

### Pattern 6: Card Flip
```css
.card-container {
  position: relative;
  perspective: 1000px;
}
.card-front,
.card-back {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  backface-visibility: hidden;
}
.card-back {
  transform: rotateY(180deg);
}
```

**Use for:** Flip cards, before/after reveals

---

## 📐 Z-index Scale

```css
:root {
  --z-base: 0;              /* Default layer */
  --z-elevated: 10;         /* Dropdowns, tooltips */
  --z-overlay: 100;         /* Modals, dialogs */
  --z-navigation: 1000;     /* Sticky/fixed nav */
  --z-critical: 9999;       /* Cookie banners (rare) */
}
```

**Rule:** Always use variables, never arbitrary numbers

---

## ✅ Do's and ❌ Don'ts

### Display

✅ **DO:**
- Use `flexbox` for most layouts
- Use `grid` for equal-width columns
- Use `gap` property for spacing
- Use `flex-direction: column` for vertical stacking

❌ **DON'T:**
- Use `float` for layout (legacy)
- Mix `flexbox` and `inline-block` in same container
- Forget to set `display` on custom containers
- Use tables for layout

---

### Position

✅ **DO:**
- Keep most elements `static` (default)
- Use `relative` when you need positioning context
- Use `absolute` for overlays and positioned elements
- Always define `top`, `right`, `bottom`, `left` with `absolute`

❌ **DON'T:**
- Use `position: relative` without a reason
- Forget positioning context for `absolute` children
- Use `position: fixed` unless truly necessary
- Declare `position: static` explicitly (it's default)

---

### Z-index

✅ **DO:**
- Use CSS variables for z-index values
- Follow the established scale
- Document why high z-index is needed
- Keep z-index on positioned elements only

❌ **DON'T:**
- Use arbitrary values (z-index: 9999, z-index: 1001, etc.)
- Increment by 1 (z-index: 101, 102, 103...)
- Apply z-index to static elements (won't work)
- Create z-index battles

---

## 🎨 Layout Decision Matrix

| Layout Goal | Best Tool | Example |
|-------------|-----------|---------|
| Center element | Flexbox | `display: flex; justify-content: center; align-items: center;` |
| Horizontal row | Flexbox | `display: flex; flex-direction: row; gap: 16px;` |
| Vertical stack | Flexbox | `display: flex; flex-direction: column; gap: 16px;` |
| Equal columns | Grid | `display: grid; grid-template-columns: repeat(3, 1fr);` |
| Responsive wrapping | Flexbox | `display: flex; flex-wrap: wrap;` |
| Complex grid | Grid | `display: grid; grid-template: '...' / ...;` |

---

## 🚨 Common Mistakes

### Mistake 1: No Positioning Context
```css
/* ❌ BAD */
.badge {
  position: absolute;
  top: 0;
  right: 0;
  /* Positioned relative to <body>! */
}

/* ✅ GOOD */
.card {
  position: relative;  /* Creates context */
}
.card .badge {
  position: absolute;  /* Positioned relative to .card */
  top: 0;
  right: 0;
}
```

---

### Mistake 2: Using Absolute for Layout
```css
/* ❌ BAD - Using absolute for all children */
.container {
  position: relative;
}
.child-1 { position: absolute; top: 0; }
.child-2 { position: absolute; top: 50px; }
.child-3 { position: absolute; top: 100px; }

/* ✅ GOOD - Use flexbox */
.container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.child-1, .child-2, .child-3 {
  /* No positioning needed */
}
```

---

### Mistake 3: Random Z-index Values
```css
/* ❌ BAD */
.nav { z-index: 9999; }
.dropdown { z-index: 10000; }  /* Higher than nav! */
.modal { z-index: 999999; }    /* Even higher! */

/* ✅ GOOD */
.nav { z-index: var(--z-navigation); }     /* 1000 */
.dropdown { z-index: var(--z-elevated); }  /* 10 */
.modal { z-index: var(--z-overlay); }      /* 100 */
```

---

## 📏 Your Site's Hierarchy

```
┌─────────────────────────────────────────┐
│ Section (Relative if needed)            │
│  └─ Container (Absolute if overlay)     │  ← POSITIONING
│     └─ Layout (Flexbox/Grid)            │  ← DISPLAY
│        └─ Layout Item (Flex child)      │
│           └─ Wrapper (Flex for content) │
│              └─ Content (Block/Inline)  │
└─────────────────────────────────────────┘

POSITIONING: Section/Container level
DISPLAY: Layout level and below
```

---

## 🔍 Quick Debugging

### Element not positioning correctly?

1. **Check if element is positioned:** Inspect and verify `position` property
2. **Check for positioning context:** Find nearest ancestor with `position: relative/absolute/fixed`
3. **Check z-index:** Ensure element has appropriate z-index
4. **Check stacking context:** New stacking context can trap z-index

### Layout not working?

1. **Check display type:** Is parent `flex` or `grid`?
2. **Check flex/grid properties:** `flex-direction`, `grid-template-columns`, etc.
3. **Check for overriding styles:** Use DevTools to see computed styles
4. **Check parent dimensions:** Parent needs height/width for children to size

---

## 💾 Code Snippets to Copy

### Centered Section
```css
.section {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 40px 20px;
}
```

### 3-Column Grid
```css
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--_layout---gap--md);
}

/* Responsive */
@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
```

### Sticky Navigation
```css
.navigation {
  position: sticky;
  top: 0;
  z-index: var(--z-navigation);
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
```

### Overlay Card
```css
.section {
  position: relative;
  height: 600px;
}

.overlay-card {
  position: absolute;
  bottom: 24px;
  left: 24px;
  z-index: var(--z-elevated);
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
```

---

## 🎓 Remember

1. **Most elements should be `static`** (default positioning)
2. **Use `flexbox` for most layouts** (it's your friend)
3. **Use `grid` for structured layouts** (columns/rows)
4. **Create positioning contexts deliberately** (relative parent for absolute children)
5. **Manage z-index with variables** (no random numbers)
6. **Mobile-first responsive design** (override up, not down)

---

## 📞 When in Doubt

- **Need to center?** → Flexbox
- **Need columns?** → Grid
- **Need overlay?** → Relative parent + Absolute child
- **Need sticky nav?** → position: sticky
- **Need modal?** → position: fixed

---

**Quick Reference Version 1.0**  
**Created:** November 8, 2025  
**For:** Daily development reference

