# Naming Framework Quick Reference
**One-page cheat sheet** • [Full Guide](./naming-framework.md) • [QA Checklist](./qa-checklist.md)

---

## 🎯 Core Rule

**Custom Elements:** Use underscore `_` → `section_hero`, `container_navbar`  
**Standard Elements:** Use hyphens `-` → `layout-2-col`, `content-wrapper`  
**Multi-Word:** One underscore, then hyphens → `section_hero-interior`, `layout-item_contact-us`

---

## 📐 Element Hierarchy

```
<section class="section_[name]">              ← 01 SECTION (Exterior)
  <div class="container_[name]">              ← 02 CONTAINER (Child)
    <div class="layout-[type]">               ← 03 LAYOUT (Structure)
      <div class="layout-item_[name]">        ← 04 LAYOUT ITEM (Grid/Flex Child)
        <div class="[type]-wrapper">          ← 05 WRAPPER (Content Container)
          <h1 class="text_[style]">           ← 06 CONTENT (Text/Images)
```

---

## 🏷️ Naming Patterns

| Element | Pattern | HTML Tag | Example |
|---------|---------|----------|---------|
| **Section** | `section_[name]` | `<section>` | `section_hero`, `section_services` |
| **Container** | `container_[name]` | `<div>` | `container_hero`, `container_lg` |
| **Layout (Standard)** | `layout-[type]` | `<div>` | `layout-1-col`, `layout-2-col` |
| **Layout (Custom)** | `layout_[name]` | `<div>` | `layout_nav`, `layout_footer` |
| **Layout Item** | `layout-item_[name]` | `<div>` | `layout-item_hero-content` |
| **Wrapper** | `[type]-wrapper` | `<div>` | `content-wrapper`, `button-wrapper` |
| **Content** | `text_[style]-[size]` | Semantic | `text_heading-lg`, `text_body-md` |
| **CMS Item** | `item_[collection]` | `<div>` | `item_service`, `item_stylist` |

---

## ✅ Good Examples

```html
✅ <section class="section_hero">
✅ <section class="section_hero-interior">
✅ <section class="section_service-infrared">
✅ <div class="container_navbar">
✅ <div class="layout-2-col">
✅ <div class="layout_services">
✅ <div class="layout-item_hero-content">
✅ <div class="layout-item_contact-us">
✅ <div class="content-wrapper">
✅ <h1 class="text_heading-lg">
✅ <div class="item_service">
```

---

## ❌ Common Mistakes

```html
❌ <div class="section_hero">               → Use <section>!
❌ <section class="section-hero">           → Use underscore!
❌ <section class="section_hero_interior">  → Too many underscores!
❌ <div class="layout_1-col">               → Standard = hyphens!
❌ <div class="layout-item">                → Must be descriptive!
❌ <div class="layout-item comfortable">    → Still not descriptive!
❌ <section class="section-service-hair">   → Use underscore first!
```

---

## 🎨 Typography Classes

```html
<h1 class="text_display-lg">        <!-- Hero headlines -->
<h1 class="text_display-sm">
<h2 class="text_heading-xl">        <!-- Section headings -->
<h2 class="text_heading-lg">
<h2 class="text_heading-md">
<h3 class="text_heading-sm">
<h6 class="text_subheading">        <!-- Eyebrows/labels -->
<p class="text_body-xl">            <!-- Body text -->
<p class="text_body-lg">
<p class="text_body-md">            <!-- Default body -->
<p class="text_body-sm">
<div class="text_label-lg">         <!-- UI labels -->
<div class="text_label-md">
<div class="text_label-sm">
```

**Modifiers:** `inverse` (light on dark), `muted` (reduced opacity), `brand` (brand color)

---

## 🎯 Quick Decision Tree

```
Is it a major page section?
  YES → section_[name] with <section>
  
Does it constrain width?
  YES → container_[name] with <div>
  
Does it create grid/flex structure?
  YES → Standard: layout-[type]
        Custom: layout_[name]
  
Is it a grid/flex child?
  YES → layout-item_[descriptive-name]
        NEVER just "layout-item"!
  
Does it wrap content?
  YES → [type]-wrapper
  
Is it actual content?
  YES → Semantic HTML + text_[style]
```

---

## 💾 CMS Patterns

```html
<div class="cms-wrapper">              <!-- CMS container -->
  <div class="layout_3-col">           <!-- Layout for items -->
    <div class="item_service">         <!-- Individual CMS item -->
      <div class="layout-item_image">
        ...
      </div>
      <div class="layout-item_service-info">
        ...
      </div>
    </div>
  </div>
</div>
```

---

## 🚨 Critical Rules

1. ✅ **Section = `<section>`** → If class is `section_*`, HTML must be `<section>`
2. ✅ **Name Layout Items** → Never use generic `layout-item`
3. ✅ **One Underscore** → Custom naming gets ONE underscore: `category_name`
4. ✅ **Multi-Word** → One underscore, then hyphens: `section_hero-interior`
5. ✅ **Semantic HTML** → Use `<h1>`, `<p>`, `<nav>`, `<button>`, etc.
6. ✅ **One H1** → Every page gets exactly ONE `<h1>`

---

## 🧪 Self-Test

### Test 1: What's wrong here?
```html
<div class="section_services">
```
**Answer:** Should use `<section>` not `<div>`

### Test 2: What's wrong here?
```html
<div class="layout-item comfortable">
```
**Answer:** Missing descriptive name, should be `layout-item_[name]`

### Test 3: What's wrong here?
```html
<section class="section-hero-interior">
```
**Answer:** Should use underscore: `section_hero-interior`

### Test 4: What's wrong here?
```html
<div class="layout_2-col">
```
**Answer:** Actually correct! Standard layouts use hyphens ✅

---

## 📚 Resources

- **Full Guide:** [naming-framework.md](./naming-framework.md)
- **QA Checklist:** [qa-checklist.md](./qa-checklist.md)
- **Live Example:** See `index.html`, `services.html`, or any page

---

## 🎓 Remember

> **Custom = Underscore** (unique to project)  
> **Standard = Hyphens** (reusable patterns)  
> **Always Be Descriptive** (no generic names)

---

**Print this page for quick reference!**

---

Last Updated: November 6, 2025 • Version 2.0 • Brik Designs

