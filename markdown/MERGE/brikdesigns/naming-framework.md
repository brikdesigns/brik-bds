# Brik Designs Naming Framework
**Version 2.0** | Updated: November 2025

A comprehensive guide to CSS class naming and HTML structure for consistent, maintainable, and scalable websites.

---

## 📋 Table of Contents
1. [Core Principles](#core-principles)
2. [Naming Convention Rules](#naming-convention-rules)
3. [Element Hierarchy](#element-hierarchy)
4. [Naming Patterns by Element Type](#naming-patterns-by-element-type)
5. [Multi-Word Naming](#multi-word-naming)
6. [Semantic HTML Requirements](#semantic-html-requirements)
7. [CMS & Dynamic Content](#cms--dynamic-content)
8. [Special Cases](#special-cases)
9. [Decision Tree](#decision-tree)
10. [Examples](#examples)

---

## 🎯 Core Principles

### The Three CSS Layers
1. **Size** (Exterior) - Controls width, height, max-width
2. **Space** (Interior) - Controls padding, margin, gap
3. **Style** (Cosmetic) - Controls colors, fonts, backgrounds, borders

### Separation of Concerns
- Structure (HTML + layout classes)
- Spacing (wrapper classes)
- Content (typography classes)
- Behavior (JavaScript classes)

---

## 🔤 Naming Convention Rules

### Custom vs. Standard Naming

**Custom Elements** (Unique, project-specific):
- Use **underscore** (`_`) to separate category from name
- Pattern: `category_name`
- Examples: `section_hero`, `container_navbar`, `layout-item_testimonial`

**Standard Elements** (Generic, reusable):
- Use **hyphens** (`-`) throughout
- Pattern: `category-descriptor`
- Examples: `layout-2-col`, `content-wrapper`, `button-wrapper`

### Multi-Word Names

When names contain multiple words:
1. Use **ONE underscore** for custom separator
2. Use **hyphens** for all subsequent words
3. Pattern: `category_word-word-word`

**Examples:**
```html
✅ section_hero-interior
✅ section_service-infrared
✅ layout-item_contact-us
✅ container_what-to-expect

❌ section-hero-interior    (wrong: should use underscore first)
❌ section_hero_interior    (wrong: too many underscores)
❌ sectionHeroInterior      (wrong: no camelCase)
```

---

## 🏗️ Element Hierarchy

```
<section class="section_[name]">           ← 01 SECTION (Exterior)
  <div class="container_[name]">           ← 02 CONTAINER (Child)
    <div class="layout-[type]">            ← 03 LAYOUT (Interior Structure)
      <div class="layout-item_[name]">    ← 04 LAYOUT ITEM (Grid/Flex Child)
        <div class="[type]-wrapper">       ← 05 WRAPPER (Content Container)
          <h1 class="text_[style]">        ← 06 CONTENT (Actual Content)
          <p class="text_[style]">
        </div>
      </div>
    </div>
  </div>
</section>
```

### Hierarchy Rules
1. **Section** sets the page context (full-width, exterior space)
2. **Container** controls maximum width and centers content
3. **Layout** provides structure (grid/flexbox)
4. **Layout Item** is a direct child of a layout (grid cell/flex item)
5. **Wrapper** groups related content with consistent spacing
6. **Content** is the actual text, images, or interactive elements

---

## 📐 Naming Patterns by Element Type

### 01. Sections (Exterior)

**Pattern:** `section_[name]`

**Semantic HTML:** MUST use `<section>` element

**Controls:**
- ✅ Size (height, width, full viewport)
- ✅ Space (exterior padding)
- ✅ Style (background colors, decorative elements)

**Examples:**
```html
<section class="section_hero">
<section class="section_services">
<section class="section_testimonials">
<section class="section_hero-interior">
<section class="section_service-infrared">
```

**Special Section Types:**
```html
<section class="section_spacer">              <!-- Vertical spacing only -->
<section class="section_spacer-home">         <!-- Named spacer for specific page -->
```

---

### 02. Containers (Child)

**Pattern:** `container_[name]`

**Semantic HTML:** Use `<div>` element

**Controls:**
- ✅ Size (max-width, width)
- ⚠️ Space (horizontal padding ONLY if needed)
- ✅ Style (background, borders)

**Examples:**
```html
<div class="container_hero">
<div class="container_navbar">
<div class="container_md">           <!-- Standard size containers -->
<div class="container_lg">
<div class="container_xl">
```

---

### 03. Layouts (Interior Structure)

**Pattern:** 
- Standard: `layout-[type]` (all hyphens)
- Custom: `layout_[name]` (underscore for custom)

**Semantic HTML:** Use `<div>` element

**Controls:**
- ⚠️ Size (ONLY if grid template columns/rows need width)
- ✅ Space (gap, padding - INTERIOR spacing only)
- ❌ Style (NO colors, backgrounds, borders)

**Standard Types:**
```html
<div class="layout-1-col">
<div class="layout-2-col">
<div class="layout-3-col">
<div class="layout-4-col">
```

**Custom Named Layouts:**
```html
<div class="layout_nav">
<div class="layout_footer">
<div class="layout_services">
<div class="layout_testimonials">
<div class="layout_what-to-expect">
```

---

### 04. Layout Items (Grid/Flex Children)

**Pattern:** `layout-item_[name]` (ALWAYS named, never generic)

**Semantic HTML:** Use `<div>` element

**Controls:**
- ✅ Size (width, height, flex properties)
- ✅ Space (padding, margin)
- ✅ Style (background, borders, shadows)

**Required Rule:** NEVER use generic `layout-item` without a descriptive name!

**Examples:**
```html
✅ <div class="layout-item_hero-content">
✅ <div class="layout-item_image">
✅ <div class="layout-item_testimonial">
✅ <div class="layout-item_service-info">
✅ <div class="layout-item_footer">
✅ <div class="layout-item_contact-us">

❌ <div class="layout-item">                    <!-- Too generic! -->
❌ <div class="layout-item comfortable">        <!-- Too generic! -->
```

---

### 05. Wrappers (Content Containers)

**Pattern:** `[type]-wrapper` (standard, all hyphens)

**Semantic HTML:** Use `<div>` element

**Controls:**
- ⚠️ Size (ONLY if limiting content width)
- ✅ Space (padding, margin, gap for children)
- ❌ Style (minimal - only if absolutely needed)

**Common Types:**
```html
<div class="content-wrapper">
<div class="button-wrapper">
<div class="header-wrapper">
<div class="list-wrapper">
<div class="img-wrapper">
<div class="subtitle-wrapper">
<div class="breadcrumb-wrapper">
```

**Custom Named Wrappers:**
```html
<div class="list-wrapper_contact">
<div class="list-wrapper_contact-footer">
```

---

### 06. Content (Typography & Elements)

**Pattern:** `text_[style]-[size]`

**Semantic HTML:** Use appropriate semantic tags (`<h1>`, `<p>`, `<a>`, etc.)

**Controls:**
- ❌ Size (NO - semantic HTML controls this)
- ❌ Space (NO - wrapper controls this)
- ✅ Style (font, color, decoration ONLY)

**Typography Classes:**
```html
<h1 class="text_display-sm">
<h1 class="text_display-lg">
<h2 class="text_heading-xl">
<h2 class="text_heading-lg">
<h2 class="text_heading-md">
<h3 class="text_heading-sm">
<h6 class="text_subheading">
<p class="text_body-xl">
<p class="text_body-lg">
<p class="text_body-md">
<p class="text_body-sm">
<p class="text_body-tiny">
<div class="text_label-lg">
<div class="text_label-md">
<div class="text_label-sm">
<p class="text_quote-md">
```

**Modifier Classes:**
```html
<p class="text_body-md inverse">       <!-- Light text on dark background -->
<p class="text_body-md muted">         <!-- Reduced opacity -->
<p class="text_body-md brand">         <!-- Brand color -->
```

---

## 🎨 Multi-Word Naming

### The Rule
1. **Category separator:** ONE underscore
2. **Word separators:** Hyphens

### Pattern
```
category_first-word-second-word
```

### Examples by Category

**Sections:**
```html
section_hero-interior
section_service-infrared
section_other-services
section_related-stylists
section_what-to-expect
section_who-its-for
section_why-clients-love-us
```

**Containers:**
```html
container_hero-interior
container_what-to-expect
container_who-its-for
container_why-clients-love-us
```

**Layout Items:**
```html
layout-item_hero-content
layout-item_service-info
layout-item_contact-us
layout-item_what-to-expect
layout-item_related-stylist
```

**Custom Layouts:**
```html
layout_what-to-expect
layout_other-services
layout_related-stylists
```

---

## 🏷️ Semantic HTML Requirements

### Sections MUST Use `<section>`

**Rule:** If a class name is `section_[name]`, it MUST be wrapped in a `<section>` element.

**Correct:**
```html
✅ <section class="section_hero">
✅ <section class="section_services">
✅ <section class="section_testimonials">
```

**Incorrect:**
```html
❌ <div class="section_hero">        <!-- Wrong element type -->
❌ <div class="section_services">    <!-- Should be <section> -->
```

### When to Use `<section>` vs `<div>`

| Element | HTML Tag | Purpose |
|---------|----------|---------|
| `section_[name]` | `<section>` | Major page sections, thematic content |
| `container_[name]` | `<div>` | Width constraint, centering |
| `layout-[type]` | `<div>` | Grid/flexbox structure |
| `layout-item_[name]` | `<div>` | Grid/flex children |
| `[type]-wrapper` | `<div>` | Content grouping |

### Semantic Content Elements

Always use appropriate semantic HTML:
```html
<h1> - Page title (ONE per page)
<h2> - Section headings
<h3> - Subsection headings
<h4-h6> - Further nested headings
<p> - Paragraphs
<a> - Links
<button> - Interactive buttons
<nav> - Navigation areas
<article> - Self-contained content
<aside> - Tangential content
<footer> - Footer content
```

---

## 💾 CMS & Dynamic Content

### CMS Wrapper

**Pattern:** `cms-wrapper` (standard)

```html
<div class="cms-wrapper w-dyn-list">
  <div role="list" class="layout_3-col w-dyn-items">
    <!-- CMS items populate here -->
  </div>
</div>
```

### CMS Items

**Pattern:** `item_[collection-name]` (custom)

**Examples:**
```html
<div class="item_service">
<div class="item_stylist">
<div class="item_testimonial">
<div class="item_customer">
<div class="item_offering">
```

**Legacy Webflow Classes** (acceptable but migrate when possible):
```html
<div class="cms-list-item">          <!-- Generic CMS item -->
<div class="cms-list-item-service">  <!-- Service-specific -->
<div class="cms-item_services">      <!-- Custom variant -->
```

### CMS + Custom Naming

When combining CMS with custom names:
```html
<div class="item_service featured">           <!-- CMS item with modifier -->
<div class="layout-item_service w-dyn-item">  <!-- Layout item that's also CMS -->
```

---

## 🎯 Special Cases

### Navigation

**Global Navigation:**
```html
<nav class="navigation w-nav">                  <!-- Global nav (OK as-is) -->
  <div class="container_navbar">
    <div class="layout_nav">
      <div class="nav_menu-wrapper">
        <div class="nav-menu-item">
```

**Sub Navigation:**
```html
<section class="section_sub-navigation">       <!-- Use section_ prefix -->
  <div class="container_subnav">
```

**Footer Navigation:**
```html
<footer class="nav_footer">                    <!-- Custom footer nav -->
  <div class="container_xl">
    <div class="layout_footer">
```

### Spacers

Spacers are structural elements for vertical spacing only:

```html
<section class="section_spacer"></section>
<section class="section_spacer-home"></section>
<section class="section_spacer-services"></section>
```

**Rules:**
- MUST use `<section>` element
- MUST have `section_spacer` base class
- Can add page-specific suffix with hyphen
- NO content inside (empty section)

### Badges & Tags

```html
<div class="badge_information">
<div class="badge_travel">
<div class="tag">                    <!-- Generic tag (standard) -->
<div class="tag-wrapper">            <!-- Tag container -->
```

### Image Frames

```html
<div class="img-frame">              <!-- Generic frame -->
<div class="img-frame-square">       <!-- Square aspect ratio -->
<div class="img-frame-portrait">     <!-- Portrait orientation -->
<div class="img-frame-landscape">    <!-- Landscape orientation -->
<div class="img-frame-wide">         <!-- Wide format -->
```

### Buttons

```html
<a class="button_primary">
<a class="button_primary sm">        <!-- Size modifier -->
<a class="button_outline">
<a class="button_outline sm">
<div class="button-wrapper">         <!-- Button container -->
<div class="button_wrapper">         <!-- Legacy - acceptable -->
```

### Icons

```html
<div class="icon_sm">
<div class="icon_md">
<div class="icon_lg">
<div class="icon_tiny">
```

### Utility Classes

**Spacing Modifiers:**
```html
comfortable     <!-- Generous spacing -->
tight           <!-- Reduced spacing -->
stacked         <!-- Vertical stacking with gap -->
```

**Alignment:**
```html
center          <!-- Center alignment -->
right           <!-- Right alignment -->
stretch         <!-- Stretch to fill -->
```

**Display:**
```html
inverse         <!-- Light content on dark background -->
muted           <!-- Reduced opacity -->
brand           <!-- Brand color applied -->
featured        <!-- Featured/highlighted state -->
```

---

## 🌲 Decision Tree

### "What should I name this element?"

```
START HERE
    ↓
Is this a major page section?
    YES → Use `section_[name]` with <section>
    NO → Continue
    ↓
Does it constrain width/center content?
    YES → Use `container_[name]` with <div>
    NO → Continue
    ↓
Does it create a grid/flex layout?
    YES → Is it a standard column layout?
        YES → Use `layout-[type]` (e.g., layout-2-col)
        NO → Use `layout_[name]` (e.g., layout_services)
    NO → Continue
    ↓
Is it a direct child of a layout?
    YES → Use `layout-item_[name]` with <div>
          NEVER use generic "layout-item"!
    NO → Continue
    ↓
Does it wrap/group content with spacing?
    YES → Use `[type]-wrapper` (e.g., content-wrapper)
    NO → Continue
    ↓
Is it actual content (text, images)?
    YES → Use semantic HTML + content class
          Text: `text_[style]-[size]`
          Images: `img` + wrapper
          Buttons: `button_[type]`
    NO → Continue
    ↓
Is it CMS/dynamic content?
    YES → Use `item_[collection]` or `cms-wrapper`
    NO → Continue
    ↓
Is it decorative or special purpose?
    YES → Check Special Cases section
```

---

## 📚 Complete Examples

### Example 1: Hero Section

```html
<section class="section_hero">                      <!-- 01 Section -->
  <div class="container_hero-interior">             <!-- 02 Container -->
    <div class="layout-1-col">                      <!-- 03 Layout -->
      <div class="layout-item_hero-content">        <!-- 04 Layout Item -->
        <div class="content-wrapper">               <!-- 05 Wrapper -->
          <h1 class="text_display-sm">              <!-- 06 Content -->
            Feel More Beautiful
          </h1>
          <p class="text_body-xl">
            From bold new looks to relaxing spa treatments
          </p>
        </div>
        <div class="button-wrapper">
          <a href="/services" class="button_primary">
            View Services
          </a>
        </div>
      </div>
    </div>
  </div>
</section>
```

### Example 2: Services Grid

```html
<section class="section_services">
  <div class="container_sm">
    <div class="layout_1-col stacked center comfortable">
      <div class="layout-item_services-header">
        <div class="content-wrapper center">
          <h2 class="text_heading-lg center">Our Services</h2>
          <p class="text_body-md center">
            Everything you need to look and feel great
          </p>
        </div>
      </div>
      <div class="cms-wrapper">
        <div class="layout_3-col">
          <div class="item_service">
            <div class="layout-item_image">
              <div class="img-frame-square">
                <img src="..." alt="" class="img">
              </div>
            </div>
            <div class="layout-item_service-info">
              <div class="content-wrapper">
                <h3 class="text_heading-sm">Haircuts</h3>
                <p class="text_body-md">Expert cuts for every style</p>
              </div>
              <div class="button-wrapper">
                <a href="#" class="button_primary sm">Learn More</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
```

### Example 3: Two-Column Layout

```html
<section class="section_about">
  <div class="container_md">
    <div class="layout-2-col">
      <div class="layout-item_image">
        <div class="img-frame-portrait">
          <img src="..." alt="" class="img">
        </div>
      </div>
      <div class="layout-item_content comfortable">
        <div class="content-wrapper">
          <h6 class="text_subheading brand">About</h6>
          <h2 class="text_heading-md">Our Story</h2>
          <p class="text_body-md">
            We've been serving our community for over 20 years...
          </p>
        </div>
        <div class="button-wrapper">
          <a href="/about" class="button_primary">Learn More</a>
        </div>
      </div>
    </div>
  </div>
</section>
```

---

## ✅ Quick Reference Checklist

Before deploying:
- [ ] All `section_[name]` classes use `<section>` elements
- [ ] No generic `layout-item` without descriptive names
- [ ] Custom naming uses underscore (`_`), standard uses hyphens (`-`)
- [ ] Multi-word names follow pattern: `category_word-word-word`
- [ ] Semantic HTML used for all content (`<h1>`, `<p>`, `<nav>`, etc.)
- [ ] Proper heading hierarchy (one `<h1>`, nested `<h2>`-`<h6>`)
- [ ] CMS items use `item_[collection]` pattern
- [ ] All images have alt text
- [ ] Buttons use semantic `<button>` or `<a>` tags appropriately

---

## 🔄 Migration Guide

### From Old Pattern → New Pattern

```html
<!-- Sections -->
<div class="section_hero"> → <section class="section_hero">
<div class="section-service-hair"> → <section class="section_service-hair">

<!-- Layout Items -->
<div class="layout-item"> → <div class="layout-item_[descriptive-name]">
<div class="layout-item comfortable"> → <div class="layout-item_content comfortable">

<!-- Layouts -->
<div class="layout_1-col"> → <div class="layout-1-col">  (remove underscore)
<div class="layout_2-col"> → <div class="layout-2-col">  (remove underscore)

<!-- CMS Items -->
<div class="cms-list-item"> → <div class="item_[collection-name]">
```

---

**Last Updated:** November 6, 2025  
**Version:** 2.0  
**Maintained by:** Brik Designs

