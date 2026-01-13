# Framework: Documentation vs Reality
**Side-by-side comparison of what the framework says vs what's actually implemented**

---

## 📐 Level 1: Section (Exterior)

### What Your Framework Says:
```html
<section class="section_[name]">
```

### What You Actually Have:

| Pattern | Example | Correct? | Count |
|---------|---------|----------|-------|
| `<section class="section_hero">` | Hero section | ✅ YES | ~8 |
| `<div class="section_book-today">` | Book today | ❌ NO - wrong tag | ~4 |
| `<div class="section-hero-interior">` | Hero interior | ❌ NO - wrong tag + hyphen | ~2 |

**Consistency Score: 6/10**

---

## 📐 Level 2: Container (Width Control)

### What Your Framework Says:
```html
<div class="container_[name]">
```

### What You Actually Have:

| Pattern | Example | Correct? | Count |
|---------|---------|----------|-------|
| `container_navbar` | Navbar container | ✅ YES | 1 |
| `container_md` | Medium container | ✅ YES | ~8 |
| `container_lg` | Large container | ✅ YES | ~4 |
| `container-hero-interior` | Hero container | ❌ NO - hyphen | ~2 |
| `container_testimonials` | Testimonials | ⚠️ OK but too specific | ~2 |

**Consistency Score: 7/10**

---

## 📐 Level 3: Layout (Grid/Flex Structure)

### What Your Framework Says:
```html
<!-- Standard layouts: all hyphens -->
<div class="layout-2-col">

<!-- Custom layouts: underscore -->
<div class="layout_nav">
```

### What You Actually Have:

| Pattern | Example | Correct? | Count |
|---------|---------|----------|-------|
| `layout-2-col` | 2-column grid | ✅ YES | ~5 |
| `layout_2-col` | 2-column grid | ❌ NO - mixed | ~8 |
| `layout-block` | Block layout | ⚠️ Unclear | ~6 |
| `layout_nav` | Navigation layout | ✅ YES | 1 |
| `layout-flex-2-col` | Flex 2-column | ✅ YES | ~3 |

**Consistency Score: 5/10** ⚠️ Most problematic area!

---

## 📐 Level 4: Layout Item (Grid/Flex Child)

### What Your Framework Says:
```html
<div class="layout-item_[descriptive-name]">
```

**Critical rule:** NEVER use generic `layout-item`

### What You Actually Have:

| Pattern | Example | Correct? | Count |
|---------|---------|----------|-------|
| `layout-item` | Generic | ❌ NO - not descriptive | ~15 |
| `layout-item comfortable` | Generic with modifier | ❌ NO - still generic | ~12 |
| `layout-item_about` | About item | ⚠️ OK but could be more specific | ~3 |
| `layout-item_footer` | Footer item | ✅ YES | ~4 |
| `layout-item_testimonial` | Testimonial | ✅ YES | ~2 |

**Consistency Score: 4/10** ⚠️ Most violations of framework!

---

## 📐 Level 5: Wrapper (Content Container)

### What Your Framework Says:
```html
<div class="[type]-wrapper">
```

### What You Actually Have:

| Pattern | Example | Correct? | Count |
|---------|---------|----------|-------|
| `content-wrapper` | Content wrapper | ✅ YES | ~30 |
| `button-wrapper` | Button wrapper | ✅ YES | ~15 |
| `button_wrapper` | Button wrapper | ⚠️ Legacy but acceptable | ~3 |
| `list-wrapper` | List wrapper | ✅ YES | ~8 |
| `img-wrapper` | Image wrapper | ✅ YES | ~5 |

**Consistency Score: 9/10** ✅ Best consistency!

---

## 📐 Level 6: Content (Typography & Elements)

### What Your Framework Says:
```html
<h1 class="text_[style]-[size]">
```

### What You Actually Have:

| Pattern | Example | Correct? | Count |
|---------|---------|----------|-------|
| `text_display-sm` | Display small | ✅ YES | ~4 |
| `text_heading-lg` | Heading large | ✅ YES | ~12 |
| `text_body-md` | Body medium | ✅ YES | ~50+ |
| `text_label-sm` | Label small | ✅ YES | ~15 |
| `text_subheading` | Subheading | ✅ YES | ~10 |

**Consistency Score: 10/10** ✅ Perfect! Use as model!

---

## 📊 Overall Consistency by Level

```
Level 1: Section        ▓▓▓▓▓▓░░░░  6/10  Semantic HTML issues
Level 2: Container      ▓▓▓▓▓▓▓░░░  7/10  Some hyphen issues
Level 3: Layout         ▓▓▓▓▓░░░░░  5/10  Most inconsistent!
Level 4: Layout Item    ▓▓▓▓░░░░░░  4/10  Too many generic names
Level 5: Wrapper        ▓▓▓▓▓▓▓▓▓░  9/10  Nearly perfect
Level 6: Content        ▓▓▓▓▓▓▓▓▓▓ 10/10  Perfect!

Average:                ▓▓▓▓▓▓▓░░░  7/10
```

---

## 🎯 The Pattern

**Notice the trend:**
- **Content level (Level 6):** Perfect consistency ✅
- **Wrapper level (Level 5):** Nearly perfect ✅
- **Structural levels (1-4):** Inconsistent ❌

**Why?** Likely because:
1. Typography was defined early and strictly followed
2. Structural classes evolved organically in Webflow
3. No enforcement of naming during development
4. Multiple people working with different interpretations

---

## 📸 Real Examples from Your Code

### ✅ GOOD Example (About Page - Section 2)
```html
<section data-figma-id="24965:11520" class="section_about-2">
  <div class="w-layout-blockcontainer container_about-intro w-container">
    <div class="w-layout-grid layout-block">
      <div class="w-layout-vflex layout-item comfortable center">
        <div class="content-wrapper comfortable center">
          <h2 class="text_heading-lg">Small Town, Big Personality</h2>
          <p class="text_body-lg">Here's the thing about us...</p>
        </div>
        <div class="button-wrapper center">
          <a href="our-team.html" class="button_primary w-button">Meet Our Stylists</a>
        </div>
      </div>
    </div>
  </div>
</section>
```

**What's good:**
- ✅ Uses `<section>` tag
- ✅ Section name has underscore: `section_about-2`
- ✅ Container has underscore: `container_about-intro`
- ✅ Wrapper is hyphenated: `content-wrapper`, `button-wrapper`
- ✅ Typography perfect: `text_heading-lg`, `text_body-lg`

**What needs fixing:**
- ❌ `layout-block` should be `layout-1-col` or similar
- ❌ `layout-item comfortable center` is too generic

**Fixed version:**
```html
<section data-figma-id="24965:11520" class="section_about-2">
  <div class="w-layout-blockcontainer container_about-intro w-container">
    <div class="w-layout-grid layout-1-col">
      <div class="w-layout-vflex layout-item_content comfortable center">
        <div class="content-wrapper comfortable center">
          <h2 class="text_heading-lg">Small Town, Big Personality</h2>
          <p class="text_body-lg">Here's the thing about us...</p>
        </div>
        <div class="button-wrapper center">
          <a href="our-team.html" class="button_primary w-button">Meet Our Stylists</a>
        </div>
      </div>
    </div>
  </div>
</section>
```

---

### ❌ PROBLEMATIC Example (Index Page - Hero)
```html
<section class="section_hero">
  <div class="w-layout-blockcontainer container-hero-interior w-container">
    <div class="w-layout-grid layout-block">
      <div class="w-layout-vflex layout-item comfortable">
        <div class="content-wrapper">
          <h1 class="text_display-sm">Feel More Beautiful</h1>
          <p class="text_body-xl">From bold new looks...</p>
        </div>
        <div class="w-layout-vflex button-wrapper">
          <a href="services.html" class="button_primary w-button">View services</a>
        </div>
      </div>
    </div>
  </div>
</section>
```

**Problems:**
- ❌ `container-hero-interior` uses hyphen (should be underscore)
- ❌ `layout-block` is unclear (should be `layout-1-col`)
- ❌ `layout-item comfortable` has no descriptive name

**Fixed version:**
```html
<section class="section_hero">
  <div class="w-layout-blockcontainer container_hero-interior w-container">
    <div class="w-layout-grid layout-1-col">
      <div class="w-layout-vflex layout-item_hero-content comfortable">
        <div class="content-wrapper">
          <h1 class="text_display-sm">Feel More Beautiful</h1>
          <p class="text_body-xl">From bold new looks...</p>
        </div>
        <div class="w-layout-vflex button-wrapper">
          <a href="services.html" class="button_primary w-button">View services</a>
        </div>
      </div>
    </div>
  </div>
</section>
```

---

### 🆚 WORST Example (About Page - Hero Section)
```html
<div class="section-hero-interior">
  <div class="w-layout-blockcontainer container-hero-interior w-container">
    <div class="w-layout-grid layout-block comfortable">
      <div class="w-layout-vflex layout-item comfortable">
        <div class="content-wrapper">
          <a href="#" class="text_subheading brand">About</a>
        </div>
      </div>
    </div>
  </div>
</div>
```

**Problems:**
- ❌ Uses `<div>` instead of `<section>`
- ❌ `section-hero-interior` uses hyphens (should be `section_hero-interior`)
- ❌ `container-hero-interior` uses hyphens (should be `container_hero-interior`)
- ❌ `layout-block` unclear
- ❌ `layout-item comfortable` not descriptive

**Fixed version:**
```html
<section class="section_hero-interior">
  <div class="w-layout-blockcontainer container_hero-interior w-container">
    <div class="w-layout-grid layout-1-col comfortable">
      <div class="w-layout-vflex layout-item_hero-content comfortable">
        <div class="content-wrapper">
          <a href="#" class="text_subheading brand">About</a>
        </div>
      </div>
    </div>
  </div>
</section>
```

---

## 🎓 Key Insights

### What Works (Keep Doing This!)
1. **Typography naming** - Absolutely consistent
2. **Wrapper naming** - Nearly perfect
3. **Semantic content elements** - Good use of `<h1>`, `<p>`, etc.
4. **Modifier classes** - Clear use of `comfortable`, `center`, `inverse`

### What Doesn't Work (Fix This!)
1. **Section semantic HTML** - Mix of `<section>` and `<div>`
2. **Structure naming** - Inconsistent underscore/hyphen usage
3. **Layout item names** - Too many generic instances
4. **Layout naming** - Mixed patterns for standard layouts

### Why Typography Works But Structure Doesn't
**Typography was likely:**
- Defined early in design system
- Applied through Webflow's text style system
- Consistently enforced by single source of truth
- Easy to apply (just pick from dropdown)

**Structure classes were likely:**
- Created ad-hoc during development
- Hand-typed in Webflow's class field
- No single source of enforcement
- Multiple people with different interpretations

---

## 💡 How to Prevent This in Future

### 1. Webflow Components
Create reusable components with correct naming:
- Hero section component
- 2-column layout component
- 3-column grid component

### 2. Style Guide in Webflow
Document naming in Webflow style guide:
- Add description to each class
- Use naming convention in class descriptions
- Create "template" pages showing correct patterns

### 3. Code Review
Before syncing Webflow exports:
- Quick scan for common mistakes
- Check sections use `<section>` tags
- Verify no generic `layout-item` classes

### 4. Checklist Integration
Add framework checks to your QA process:
- [ ] Sections use `<section>` tag
- [ ] Section/container names use underscore
- [ ] Layout-items have descriptive names
- [ ] Standard layouts use hyphens

---

## 📈 Progress Tracking

Use this to track your refactoring progress:

```
Pages Refactored:
[ ] about.html
[ ] services.html
[ ] index.html
[ ] contact.html
[ ] stylists.html
[ ] careers.html
[ ] our-team.html
[ ] modules.html
[ ] detail_services.html
[ ] detail_stylists.html
[ ] detail_offerings.html
[ ] detail_client-needs.html
[ ] detail_customers.html

Framework Compliance:
Starting:  7/10 ▓▓▓▓▓▓▓░░░
Target:    9/10 ▓▓▓▓▓▓▓▓▓░
Perfect:  10/10 ▓▓▓▓▓▓▓▓▓▓
```

---

## 🎯 Success Metrics

You'll know you're done when:

1. **Semantic HTML:** Every `section_*` uses `<section>` tag
2. **Naming:** All custom classes use underscore first
3. **Descriptive:** No generic `layout-item` without names
4. **Standard layouts:** All use hyphens (`layout-2-col`)
5. **Consistency:** Same patterns across all pages

**Target:** 9/10 framework compliance (10/10 is aspirational)

---

**Next Steps:** 
1. Review [audit summary](./audit-summary.md)
2. Start with [naming fixes guide](./naming-fixes.md)
3. Begin refactoring one page at a time


