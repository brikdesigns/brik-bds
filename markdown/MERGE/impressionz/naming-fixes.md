# Naming Fixes - Find & Replace Guide
**Systematic corrections for framework consistency**

---

## 🎯 How to Use This Guide

1. **Manual Review First**: Understand the pattern
2. **Test on One Page**: Try fixes on `about.html` first
3. **Use Find & Replace**: VS Code or your editor's find/replace
4. **Verify After Each**: Check the page still works
5. **One Pattern at a Time**: Don't fix everything at once

---

## 🔧 Priority 1: Fix Semantic HTML

### Issue: Sections Using `<div>` Instead of `<section>`

**Find:**
```html
<div class="section_
```

**Replace:**
```html
<section class="section_
```

**AND**

**Find:**
```html
</div>
  </div>
  <section class="section_
```

**Replace:**
```html
</section>
  </div>
  <section class="section_
```

**Files to check:** All HTML files

**Estimated:** ~15 instances across all pages

---

## 🔧 Priority 2: Fix Hyphen-Only Section Names

### Issue: `section-*` Should Be `section_*`

**Pattern 1: Hero Interior**
```html
<!-- FIND -->
<div class="section-hero-interior">

<!-- REPLACE -->
<section class="section_hero-interior">
```

**Pattern 2: Service Sections**
```html
<!-- FIND -->
<div class="section-service-

<!-- REPLACE -->
<section class="section_service-
```

**Known instances:**
- `section-hero-interior` → `section_hero-interior`
- Any other `section-*` patterns

---

## 🔧 Priority 3: Fix Container Names

### Issue: Container Names Using Hyphens

**Pattern 1: Hero Interior**
```html
<!-- FIND -->
<div class="w-layout-blockcontainer container-hero-interior w-container">

<!-- REPLACE -->
<div class="w-layout-blockcontainer container_hero-interior w-container">
```

**Known instances:**
- `container-hero-interior` → `container_hero-interior`

**Note:** Container size names (`container_md`, `container_lg`) are already correct!

---

## 🔧 Priority 4: Fix Layout Names

### Issue: Standard Layouts Using Underscore

**Find & Replace:**

```html
<!-- FIND -->
class="layout_2-col"

<!-- REPLACE -->
class="layout-2-col"
```

```html
<!-- FIND -->
class="layout_3-col"

<!-- REPLACE -->
class="layout-3-col"
```

```html
<!-- FIND -->
class="w-layout-grid layout_2-col

<!-- REPLACE -->
class="w-layout-grid layout-2-col
```

**Rule:** Standard column layouts use hyphens: `layout-2-col`, `layout-3-col`

**Custom layouts keep underscore:** `layout_nav`, `layout_footer` ✅

---

## 🔧 Priority 5: Fix Generic Layout Items

### Issue: `layout-item` Without Descriptive Names

**⚠️ WARNING: This CANNOT be automated - requires manual review!**

Each instance needs a descriptive name based on its content.

### Common Patterns:

**Pattern 1: Hero Content**
```html
<!-- BEFORE -->
<div class="w-layout-vflex layout-item comfortable">
  <div class="content-wrapper">
    <h1 class="text_display-sm">

<!-- AFTER -->
<div class="w-layout-vflex layout-item_hero-content comfortable">
  <div class="content-wrapper">
    <h1 class="text_display-sm">
```

**Pattern 2: Image Layout Items**
```html
<!-- BEFORE -->
<div class="w-layout-vflex layout-item">
  <div class="img-frame-square">

<!-- AFTER -->
<div class="w-layout-vflex layout-item_image">
  <div class="img-frame-square">
```

**Pattern 3: Content Layout Items**
```html
<!-- BEFORE -->
<div class="w-layout-vflex layout-item comfortable center">
  <div class="content-wrapper">
    <h2>

<!-- AFTER -->
<div class="w-layout-vflex layout-item_content comfortable center">
  <div class="content-wrapper">
    <h2>
```

**Pattern 4: Specific Content**
```html
<!-- BEFORE -->
<div class="layout-item_about">

<!-- AFTER -->
<div class="layout-item_about-content">  <!-- More descriptive -->
```

### Suggested Names by Context:

| Content Type | Suggested Name |
|--------------|----------------|
| Hero text content | `layout-item_hero-content` |
| Service info | `layout-item_service-info` |
| Image only | `layout-item_image` |
| Testimonial | `layout-item_testimonial` |
| Call to action | `layout-item_cta` |
| About content | `layout-item_about-content` |
| Contact info | `layout-item_contact-info` |
| Header content | `layout-item_header` |
| Footer content | `layout-item_footer-content` |

---

## 🔧 Priority 6: Fix Layout Block

### Issue: Generic `layout-block`

**Find:**
```html
class="layout-block w-dyn-items"
```

**Decision needed:** Is this:
1. A standard 1-column layout? → `class="layout-1-col w-dyn-items"`
2. A custom CMS layout? → `class="layout_cms-items w-dyn-items"`
3. A specific layout? → `class="layout_[descriptive-name] w-dyn-items"`

**Recommendation:** Since it's used with CMS items, use `layout-1-col` for single column:
```html
class="layout-1-col w-dyn-items"
```

---

## 🔧 Priority 7: Standardize Wrapper Names

### Issue: Mixed `button-wrapper` and `button_wrapper`

**Current state: BOTH patterns exist**

**Decision:**
- Standard wrappers use hyphens: `content-wrapper`, `button-wrapper` ✅
- Custom wrappers use underscore: `list-wrapper_contact` ✅

**Find & Replace (if needed):**
```html
<!-- IF you find this pattern -->
class="button_wrapper"

<!-- Replace with -->
class="button-wrapper"
```

**Current usage is mostly correct!** Just verify consistency.

---

## 📊 File-by-File Checklist

### index.html
- [ ] Fix `<div class="section_` → `<section class="section_`
- [ ] Fix `section-` → `section_` (if any)
- [ ] Fix `container-hero-interior` → `container_hero-interior`
- [ ] Fix `layout_2-col` → `layout-2-col`
- [ ] Review all `layout-item` instances (14 found)
- [ ] Test page loads correctly
- [ ] Test animations still work

### about.html
- [ ] Same section fixes
- [ ] Same container fixes
- [ ] Same layout fixes
- [ ] Review all `layout-item` instances (12 found)
- [ ] Test page loads correctly

### services.html
- [ ] Same section fixes
- [ ] Same container fixes
- [ ] Same layout fixes
- [ ] Review all `layout-item` instances (15 found)
- [ ] Check CMS bindings still work
- [ ] Test page loads correctly

### contact.html
- [ ] Same section fixes
- [ ] Same container fixes
- [ ] Same layout fixes
- [ ] Review all `layout-item` instances (8 found)
- [ ] Test form still works

### stylists.html
- [ ] Same section fixes
- [ ] Fix card naming if needed
- [ ] Review all `layout-item` instances
- [ ] Test CMS bindings
- [ ] Test card flip animations

### Detail Pages
- [ ] detail_services.html
- [ ] detail_stylists.html
- [ ] detail_offerings.html
- [ ] detail_client-needs.html
- [ ] detail_customers.html

---

## 🧪 Testing After Changes

### Visual Testing
- [ ] All pages load without errors
- [ ] No broken layouts
- [ ] Animations still work (card flips, fades)
- [ ] Mobile responsive still works

### Functional Testing
- [ ] Navigation dropdowns populate
- [ ] CMS items display correctly
- [ ] Forms submit properly
- [ ] Links work correctly

### Browser Testing
- [ ] Chrome
- [ ] Safari
- [ ] Firefox
- [ ] Mobile Safari
- [ ] Mobile Chrome

---

## 💾 Backup Before Changes

**CRITICAL: Always backup before mass find-and-replace!**

```bash
# Create backup folder
mkdir -p backups/pre-naming-fixes-$(date +%Y%m%d)

# Copy all HTML files
cp *.html backups/pre-naming-fixes-$(date +%Y%m%d)/

# Verify backup
ls -la backups/pre-naming-fixes-$(date +%Y%m%d)/
```

---

## 🎯 Recommended Order

1. **Start with one page**: `about.html` (simpler structure)
2. **Make all Priority 1-4 fixes**: Automated find/replace
3. **Test thoroughly**: Verify nothing broke
4. **Fix Priority 5 manually**: layout-item names (30 mins)
5. **Test again**: Full page check
6. **Move to next page**: Repeat process

---

## 📝 Example: Complete Fix for About Page

### Step 1: Backup
```bash
cp about.html about.html.backup
```

### Step 2: Fix sections (automated)
```
Find: <div class="section-
Replace: <section class="section_
```

### Step 3: Fix containers (automated)
```
Find: container-hero-interior
Replace: container_hero-interior
```

### Step 4: Fix layouts (automated)
```
Find: class="layout_2-col"
Replace: class="layout-2-col"
```

### Step 5: Fix layout-items (manual)
- Open file in editor
- Search for: `class="layout-item`
- For each instance, add descriptive name
- Save

### Step 6: Test
- Open in browser
- Check layout
- Check animations
- Check responsive

### Step 7: Commit
```bash
git add about.html
git commit -m "Fix naming consistency on about page"
```

---

## 🚨 Common Pitfalls

### 1. Breaking Webflow Classes
**DON'T change:**
- `w-layout-vflex` ✅ Keep
- `w-layout-grid` ✅ Keep
- `w-container` ✅ Keep
- `w-dyn-items` ✅ Keep

**ONLY change your custom classes!**

### 2. Breaking CSS Selectors
After changing class names, check if `header.css` targets them:
```css
/* If your CSS has this: */
.section-hero-interior { }

/* You need to update it to: */
.section_hero-interior { }
```

### 3. Breaking JavaScript
Check `footer.js` and `local-cms.js` for any selectors:
```javascript
// If your JS has this:
document.querySelector('.section-hero-interior')

// Update it to:
document.querySelector('.section_hero-interior')
```

### 4. Breaking CMS Bindings
After changing layout names, verify CMS items still populate correctly.

---

## ✅ Success Checklist

After completing all fixes:

- [ ] All pages load without errors
- [ ] All `section_*` use `<section>` tags
- [ ] No hyphen-only section/container names
- [ ] Standard layouts use hyphens (`layout-2-col`)
- [ ] All `layout-item` have descriptive names
- [ ] Custom CSS updated to match
- [ ] JavaScript updated to match
- [ ] CMS bindings work correctly
- [ ] Mobile responsive works
- [ ] Animations work
- [ ] All changes committed to git
- [ ] Updated Webflow with new classes
- [ ] Full site tested

---

## 📞 Need Help?

If you get stuck:
1. Check the [framework guide](./naming-framework.md) for the correct pattern
2. Look at the [audit](./framework-audit.md) for examples
3. Compare with a working section
4. Ask yourself: "Is this custom or standard?"
   - Custom → underscore first: `section_`, `container_`, `layout_`
   - Standard → all hyphens: `layout-2-col`, `content-wrapper`

---

**Ready to start?** Begin with `about.html` and work through Priority 1-5 systematically.


