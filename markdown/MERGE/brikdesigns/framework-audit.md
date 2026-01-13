# Impressionz Page Structure Framework Audit
## Date: November 8, 2025

---

## Framework Overview (Based on Your Guide)

Your 6-level hierarchical system:

### EXTERIOR (Size/Context)
1. **Section** (`section_[name]`) - Sets context and height
2. **Container** (`container_[name]`) - Controls width

### INTERIOR (Space/Structure)
3. **Layout** (`layout_[type]`) - Flex/grid structure
4. **Layout Item** (`layout-item_[name]`) - Flex/grid children

### CONTENT (Style/Presentation)
5. **Wrapper** (`[type]-wrapper`) - Groups content, sets gaps
6. **Content** (`text_[size]`, `img`, etc.) - Actual content

---

## Audit Findings

### ✅ Strengths - What's Working Well

1. **Clear Hierarchical Structure**
   - Most sections follow the logical nesting pattern
   - Proper separation between exterior → interior → content layers

2. **Consistent Content-Level Naming**
   - `text_body-md`, `text_heading-lg`, `text_display-sm` - ✅ Excellent
   - `text_label-sm`, `text_subheading` - ✅ Consistent pattern
   - Typography naming is systematic and clear

3. **Container Width Standards**
   - Multiple container sizes: `container_sm`, `container_md`, `container_xl`
   - Clear width hierarchy established

4. **Layout Type Clarity**
   - Layout types are descriptive: `layout_2-col`, `layout_3-col`, `layout-flex-2-col`
   - Grid vs flex patterns are identifiable

---

## ⚠️ Inconsistencies Found

### 1. **CRITICAL: Naming Convention (Underscore vs Hyphen)**

**Issue:** Mixed use of underscores and hyphens within the same level

**Examples Found:**
```html
<!-- LEVEL 1: Section (INCONSISTENT) -->
<section class="section_hero">          ✅ underscore
<div class="section-hero-interior">     ❌ hyphen
<div class="section_book-today">        ❌ mixed (underscore + hyphen)

<!-- LEVEL 2: Container (INCONSISTENT) -->
<div class="container_navbar">          ✅ underscore
<div class="container-hero-interior">   ❌ hyphen
<div class="container_md">              ✅ underscore

<!-- LEVEL 3: Layout (INCONSISTENT) -->
<div class="layout_2-col">              ❌ mixed (underscore + hyphen)
<div class="layout-block">              ❌ hyphen
<div class="layout-flex-2-col">         ❌ hyphen

<!-- LEVEL 4: Layout Item (MOSTLY CONSISTENT) -->
<div class="layout-item">               ✅ hyphen (but inconsistent with framework)
<div class="layout-item_about">         ❌ mixed
<div class="layout-item_testimonial">   ❌ mixed

<!-- LEVEL 5: Wrapper (CONSISTENT) -->
<div class="content-wrapper">           ✅ hyphen
<div class="button-wrapper">            ✅ hyphen
<div class="list-wrapper">              ✅ hyphen
```

**Your Framework Says:**
- Section: `section_[name]` (underscore)
- Container: `container_[name]` (underscore)
- Layout: `layout_[type]` (underscore)
- Layout Item: `layout-item_[name]` (hyphen + underscore)

**Current Reality:**
- Underscore and hyphen usage is mixed throughout
- No clear pattern being followed consistently

### 2. **HTML Element Choice (Section Level)**

**Issue:** Inconsistent use of `<section>` vs `<div>` for Level 1

**Examples:**
```html
<!-- Using <section> tag (SEMANTIC) -->
<section class="section_hero">          ✅ Semantic HTML
<section class="section_testimonials">  ✅ Good for accessibility

<!-- Using <div> tag (NON-SEMANTIC) -->
<div class="section_book-today">        ❌ Should be <section>
<div class="section_infrared">          ❌ Should be <section>
```

**Recommendation:** Always use `<section>` for Level 1 (01 Section) to maintain semantic HTML.

### 3. **Container Naming Specificity**

**Issue:** Some containers are too specific, others are generic

**Examples:**
```html
<!-- Generic (GOOD - Reusable) -->
<div class="container_md">              ✅ Size-based, reusable
<div class="container_sm">              ✅ Clear width constraint

<!-- Overly Specific (LESS FLEXIBLE) -->
<div class="container_navbar">          ⚠️ Context-specific
<div class="container_testimonials">    ⚠️ Context-specific
<div class="container_about">           ⚠️ Context-specific
```

**Your Framework Principle:** Level 2 (Container) should control **width**, not **context**.
Context belongs at Level 1 (Section).

### 4. **Missing Wrapper Level**

**Issue:** Some sections skip the wrapper level (05 Wrapper) and jump directly to content

**Example:**
```html
<!-- GOOD: Complete hierarchy -->
<section class="section_hero">          ← Level 1: Section
  <div class="container_md">            ← Level 2: Container
    <div class="layout_2-col">          ← Level 3: Layout
      <div class="layout-item">         ← Level 4: Layout Item
        <div class="content-wrapper">   ← Level 5: Wrapper ✅
          <h1 class="text_heading-lg">  ← Level 6: Content
          </h1>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- PROBLEMATIC: Skipped wrapper -->
<section class="section_products">
  <div class="container_sm">
    <div class="layout-block">
      <div class="layout-item">
        <h2 class="text_heading-md">   ← Content directly in layout-item ❌
        </h2>
      </div>
    </div>
  </div>
</section>
```

**Impact:** Without wrappers, you lose the ability to control gaps and content grouping separately from layout structure.

### 5. **Webflow-Specific Classes Mixing with Custom**

**Issue:** Webflow's generated classes (like `w-layout-vflex`, `w-layout-grid`) are appearing alongside custom framework classes

**Example:**
```html
<div class="w-layout-vflex layout-item comfortable">
     ^^^^^^^^^^^^^^^^^^^^^ Webflow class
                           ^^^^^^^^^^^ Framework class
                                       ^^^^^^^^^^^^ Modifier
```

**This is actually FINE** - Webflow requires these classes for its visual editor to work.

**Recommendation:** Accept this as a Webflow constraint, but ensure your custom framework classes are always present.

---

## Framework Adherence Score by Page

### index.html: **7/10**
- ✅ Good: Consistent content-level naming
- ✅ Good: Clear container hierarchy
- ❌ Issue: Mixed underscore/hyphen usage
- ❌ Issue: Some `<div>` instead of `<section>`

### about.html: **7/10**
- ✅ Good: Layout patterns clear
- ✅ Good: Wrapper usage consistent
- ❌ Issue: Same naming inconsistencies
- ❌ Issue: Overly specific container names

### services.html: **6.5/10**
- ✅ Good: Content-level excellent
- ❌ Issue: More naming inconsistencies
- ❌ Issue: Some missing wrapper levels
- ❌ Issue: Layout naming mixed

---

## Recommendations for Improvement

### Priority 1: STANDARDIZE NAMING CONVENTION

**Pick ONE convention and stick to it across all levels:**

**Option A: Underscore Convention (Recommended)**
```
section_hero
container_md
layout_2-col
layout-item_hero-content
content-wrapper
text_body-md
```

**Option B: Hyphen Convention**
```
section-hero
container-md
layout-2-col
layout-item-hero-content
content-wrapper
text-body-md
```

**My Recommendation: Option A** (matches your framework guide better)

### Priority 2: UPDATE YOUR GUIDE

Your framework guide shows:
- `layout-item_[name]` (mixed hyphen + underscore)

**This is confusing!** Choose:
- Either: `layout-item_[name]` (if you want parent-child relationship)
- Or: `layout_item-[name]` (if you want consistent underscore)

I recommend: `layout_item-[name]` for consistency.

### Priority 3: SEMANTIC HTML

Create a rule: **Level 1 ALWAYS uses `<section>` tag** (unless it's truly not a section).

```html
<!-- YES -->
<section class="section_hero">

<!-- NO -->
<div class="section_hero">
```

### Priority 4: CONTAINER NAMING

**Rule:** Containers should describe **size**, not **purpose**.

```html
<!-- GOOD -->
<div class="container_lg">    ← Size-based
<div class="container_md">    ← Size-based

<!-- AVOID -->
<div class="container_testimonials">  ← Purpose-based
<div class="container_infrared">      ← Purpose-based
```

**Exception:** Navigation and footer containers can be specific:
- `container_navbar` ✅
- `container_footer` ✅

### Priority 5: ENFORCE WRAPPER LEVEL

**Rule:** Every layout-item that contains content MUST have a wrapper.

```html
<!-- CORRECT PATTERN -->
<div class="layout-item">
  <div class="content-wrapper">    ← Wrapper controls gaps
    <h2 class="text_heading-lg">   ← Content stays clean
    </h2>
    <p class="text_body-md">
    </p>
  </div>
</div>
```

**Why?** This gives you control over:
- Gap between content elements
- Content grouping
- Padding without affecting layout

---

## Refactoring Strategy

### Phase 1: Document Standards (Week 1)
1. ✅ Update `/markdown/naming-framework.md` with standardized convention
2. ✅ Create a "migration guide" showing old → new patterns
3. ✅ Add "common mistakes" section to Quick Reference

### Phase 2: Fix New Development (Week 2)
1. Apply standards to all NEW sections going forward
2. Don't touch existing sections yet
3. Build muscle memory with new convention

### Phase 3: Systematic Refactor (Weeks 3-4)
1. Refactor one page type at a time:
   - Start with simplest pages (about, contact)
   - Then complex pages (services, index)
2. Test thoroughly after each page
3. Update Webflow Designer classes to match

### Phase 4: Update Webflow (Week 5)
1. Transfer updated classes back to Webflow
2. Regenerate exports
3. Verify everything still works

---

## Pattern Library Examples

### Perfect Section Structure

```html
<section class="section_hero">
  <div class="container_lg">
    <div class="layout_2-col">
      <div class="layout_item-left">
        <div class="content-wrapper">
          <h1 class="text_display-lg">Heading</h1>
          <p class="text_body-md">Body text</p>
        </div>
        <div class="button-wrapper">
          <a href="#" class="button_primary">CTA</a>
        </div>
      </div>
      <div class="layout_item-right">
        <div class="img-wrapper">
          <img src="hero.jpg" class="img" alt="">
        </div>
      </div>
    </div>
  </div>
</section>
```

### Perfect Service Card

```html
<div class="card_service">
  <div class="img-wrapper">
    <img src="service.jpg" class="img" alt="">
  </div>
  <div class="content-wrapper">
    <h3 class="text_heading-sm">Service Name</h3>
    <p class="text_body-sm">Description</p>
  </div>
  <div class="button-wrapper">
    <a href="#" class="button_secondary">Learn More</a>
  </div>
</div>
```

---

## QA Checklist for New Sections

Before pushing any section to production, verify:

- [ ] Level 1: Uses `<section>` tag
- [ ] Level 1: Class follows `section_[name]` pattern
- [ ] Level 2: Class follows `container_[size]` pattern
- [ ] Level 3: Class follows `layout_[type]` pattern
- [ ] Level 4: Class follows `layout_item-[name]` pattern
- [ ] Level 5: Wrapper present between layout-item and content
- [ ] Level 6: Content uses semantic classes (`text_`, `img`, etc.)
- [ ] Naming: Consistent underscore/hyphen usage throughout
- [ ] Accessibility: Proper heading hierarchy (h1 → h2 → h3)
- [ ] Responsive: Layout adapts properly on mobile

---

## Next Steps

1. **Review this audit** - Discuss which recommendations to implement
2. **Update framework docs** - Standardize naming in `/markdown/naming-framework.md`
3. **Create refactor plan** - Prioritize which pages to fix first
4. **Establish new standards** - Apply to all new development going forward

---

## Questions for Discussion

1. **Naming Convention:** Prefer underscores or hyphens for primary separator?
2. **Container Specificity:** Keep specific names (`container_navbar`) or go fully generic?
3. **Refactor Timeline:** When should we systematically fix existing pages?
4. **Webflow Integration:** How to ensure standards persist through Webflow exports?


