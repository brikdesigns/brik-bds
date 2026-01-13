# CMS Update Workflow - Automated Procedure

This document provides a standardized, repeatable workflow for updating CMS bindings across all pages in a Webflow project. Use this as a checklist when the user requests "update cms" or similar commands.

---

## Overview

When you receive an "update cms" request, follow this systematic approach to bind CMS data to all relevant pages in the project.

---

## Step 1: Identify All Page Types

First, scan the project to identify which pages need CMS binding:

### Command to Run:
```bash
ls -1 *.html | grep -E "^(index|detail_|services|stylists|about|contact)" | sort
```

### Standard Webflow Page Types:

| Page Type | File Pattern | CMS Binding Needed? |
|-----------|-------------|---------------------|
| Homepage | `index.html` | Navigation only |
| Collection List | `services.html`, `stylists.html`, etc. | ✅ Yes - List binding |
| Collection Item (Detail) | `detail_*.html` | ✅ Yes - Detail binding |
| Static Pages | `about.html`, `contact.html`, etc. | Navigation only |
| Utility Pages | `privacy-policy.html`, `terms.html` | Navigation only |

---

## Step 2: Check for Existing CMS Data

### Export CMS Data (if available):
1. Check the `/cms` folder for existing CSV exports
2. If empty, ask user to export from Webflow or provide data structure

### Command to Check:
```bash
ls -la cms/
```

### Expected CSV Files:
- `[Project] - [Collection Name].csv`
- Example: `Impressionz Salon & Spa - Services.csv`

---

## Step 3: Analyze HTML Structure

For each page requiring CMS binding, examine the HTML to identify:

### A. Navigation Components
Look for:
- `.dropdown-menu-services` - Services dropdown
- `.dropdown-menu-stylists` - Stylists dropdown
- `.w-dropdown-list` - Any other dropdowns

### B. CMS Collection Lists
Look for:
- `.w-dyn-list` - Webflow dynamic list wrapper
- `.w-dyn-items` - Container for dynamic items
- `.w-dyn-item` - Individual item template
- `.w-dyn-empty` - Empty state message
- `.w-dyn-bind-empty` - Unbound CMS fields

### C. CMS Item Detail Pages
Look for:
- URL parameter indicators (for routing)
- Multiple content sections that need population
- Conditional sections (show/hide based on data)

### Commands to Use:
```bash
# Check all HTML files for CMS indicators
grep -l "w-dyn-list" *.html

# Check for empty state elements
grep -l "w-dyn-empty" *.html

# Check for specific section classes
grep "section_" detail_services.html | grep "class=" | head -20
```

---

## Step 4: Create/Update local-cms.js

Follow this systematic approach:

### A. Global Navigation (runs on all pages)

**Pattern:**
```javascript
// ===== GLOBAL NAVIGATION BINDING =====
if (typeof $ === 'undefined') {
  window.addEventListener('load', initNavigationBinding);
} else {
  $(document).ready(initNavigationBinding);
}

function initNavigationBinding() {
  console.log('Local CMS: Initializing navigation binding...');
  
  // Define navigation data
  const navServicesData = [/* services */];
  const navStylistsData = [/* stylists */];
  
  // Populate dropdowns
  // ... binding logic
  
  console.log('Navigation binding complete');
}
```

### B. Collection List Pages

**Pages:** `services.html`, `stylists.html`, etc.

**Pattern:**
```javascript
// ===== CMS DATA BINDING FOR [PAGE_NAME].HTML =====
if (window.location.pathname.includes('[page-name].html')) {
  console.log('Detected [page-name].html page');
  
  if (typeof $ === 'undefined') {
    window.addEventListener('load', init[PageName]Binding);
  } else {
    $(document).ready(init[PageName]Binding);
  }
  
  function init[PageName]Binding() {
    console.log('Local CMS: Initializing [page-name].html binding...');
    
    // 1. Define collection data
    const collectionData = [/* items */];
    
    // 2. Hide empty states
    $('.w-dyn-empty').hide();
    
    // 3. Bind to sections
    // Find featured items
    // Bind to category sections
    // Generate cards/items
    
    console.log('CMS data bound successfully for [page-name].html');
  }
}
```

### C. Collection Item (Detail) Pages

**Pages:** `detail_services.html`, `detail_stylists.html`, etc.

**Pattern:**
```javascript
// ===== CMS DATA BINDING FOR DETAIL_[COLLECTION].HTML =====
if (window.location.pathname.includes('detail_[collection].html')) {
  console.log('Detected detail_[collection].html page');
  
  if (typeof $ === 'undefined') {
    window.addEventListener('load', initDetail[Collection]Binding);
  } else {
    $(document).ready(initDetail[Collection]Binding);
  }
  
  function initDetail[Collection]Binding() {
    console.log('Local CMS: Initializing detail_[collection].html binding...');
    
    // 1. Define data
    const collectionData = [/* items */];
    const relatedData = [/* related items */];
    
    // 2. Get URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const itemSlug = urlParams.get('[param]');
    
    // 3. Early exit checks
    if (!itemSlug) {
      console.log('No [param] parameter found in URL');
      return;
    }
    
    // 4. Find current item
    const currentItem = collectionData.find(i => i.slug === itemSlug);
    
    if (!currentItem) {
      console.log('Item not found:', itemSlug);
      return;
    }
    
    // 5. Update page metadata
    document.title = `${currentItem.name} | [Site Name]`;
    $('meta[name="description"]').attr('content', currentItem.summary);
    
    // 6. Bind to all sections
    // Hero section
    // Content sections
    // Related items
    // Conditional sections (show/hide)
    
    console.log('CMS data bound successfully for:', currentItem.name);
  }
}
```

---

## Step 5: Systematic Page-by-Page Binding

Follow this checklist for each page:

### ✅ For Collection List Pages

1. **Read the HTML file** to identify:
   - [ ] Section class names (`.section_*`)
   - [ ] CMS list containers (`.w-dyn-list`)
   - [ ] Item structure (`.w-dyn-item`)
   - [ ] Empty state elements (`.w-dyn-empty`)
   - [ ] Fields to populate (`.w-dyn-bind-empty`)

2. **Define the data structure:**
   - [ ] Create array with all collection items
   - [ ] Include all fields needed for display
   - [ ] Match field names to HTML element classes
   - [ ] Include any category/filter fields

3. **Implement binding logic:**
   - [ ] Hide all empty state messages
   - [ ] Populate featured/highlighted sections
   - [ ] Populate category-specific sections
   - [ ] Generate cards for grid layouts
   - [ ] Remove `.w-dyn-bind-empty` classes
   - [ ] Set proper href links with URL parameters

4. **Test:**
   - [ ] Verify all sections show correct data
   - [ ] Check links work correctly
   - [ ] Confirm empty states are hidden
   - [ ] Validate images load properly

### ✅ For Collection Detail Pages

1. **Read the HTML file** to identify:
   - [ ] URL parameter name needed
   - [ ] All content sections present
   - [ ] Conditional sections (show/hide logic)
   - [ ] Related items sections
   - [ ] Breadcrumb elements

2. **Define the data structure:**
   - [ ] Main collection items array
   - [ ] Related collections (if needed)
   - [ ] All fields for all sections
   - [ ] Rich text fields (HTML content)

3. **Implement binding logic:**
   - [ ] Parse URL parameter
   - [ ] Early return if parameter missing
   - [ ] Find current item from data
   - [ ] Early return if item not found
   - [ ] Update page title and meta tags
   - [ ] Update breadcrumb
   - [ ] Bind hero section
   - [ ] Bind all content sections
   - [ ] Handle conditional sections (show/hide)
   - [ ] Populate related items
   - [ ] Set up navigation to other items

4. **Test:**
   - [ ] Navigate from list page to detail
   - [ ] Verify URL parameter works
   - [ ] Check all sections populate
   - [ ] Confirm conditional sections show/hide correctly
   - [ ] Test related items links

### ✅ For Navigation (Global)

1. **Identify dropdowns:**
   - [ ] Services dropdown
   - [ ] Stylists dropdown
   - [ ] Any other navigation dropdowns

2. **Implement binding:**
   - [ ] Define minimal data (name, slug only)
   - [ ] Clear placeholder items
   - [ ] Generate menu items
   - [ ] Add "New" badges if applicable
   - [ ] Hide empty states
   - [ ] Set proper href links

3. **Test on multiple pages:**
   - [ ] Homepage
   - [ ] List pages
   - [ ] Detail pages
   - [ ] Static pages

---

## Step 6: Data Structure Standards

### Understanding Cross-Collection References

**⚠️ IMPORTANT:** CMS data may reference data in other CMS databases/collections. Understanding these relationships is crucial when binding data.

**Common Relationship Types:**
- **One-to-Many:** Service → Service Offerings (one service has many offerings)
- **Many-to-Many:** Services ↔ Stylists (services can have multiple stylists, stylists can have multiple services)
- **Reference Fields:** Items that link to other collection items via slug

**Example:** A Service item might reference:
- Multiple Stylists from the Stylist collection
- Multiple Service Offerings from the Offerings collection
- A Category from the Category collection

When binding data, you must:
1. Identify all collections that are referenced
2. Define all collections needed for the page
3. Look up related items when binding data
4. Resolve relationships before rendering

### Consistent Field Names

Use these standard fields across all collections:

```javascript
{
  // Required for all items
  name: "Display Name",
  slug: "url-slug",
  
  // Common optional fields
  summary: "Short description",
  description: "Full description (can be long)",
  thumbnail: "https://cdn.../image.jpg",
  image: "https://cdn.../image.jpg", // or 'thumbnail'
  
  // Relationships - CMS data may reference data in other CMS collections
  // Use slug arrays to reference items in other collections
  category: "category-slug", // Reference to Category collection
  tags: ["tag-1", "tag-2"],
  relatedItems: ["item-slug-1", "item-slug-2"], // References to items in other collections
  
  // Example: Cross-collection references
  stylists: ["stylist-1", "stylist-2"], // References Stylist collection
  serviceOfferings: ["offering-1", "offering-2"], // References Offerings collection
  
  // Rich text fields (HTML allowed)
  content: "<p>HTML content here</p>",
  whyItMatters: "<p>Section content</p>",
  
  // Boolean flags
  featured: true,
  isNew: true,
  archived: false,
  
  // Metadata
  sortOrder: 1,
  createdDate: "2025-01-01"
}
```

---

## Step 7: Testing Checklist

After completing all bindings, test systematically:

### ✅ Script Reference Testing
- [ ] `local-cms.js` included in ALL HTML pages
- [ ] Script loads after jQuery
- [ ] No 404 errors for local-cms.js in console
- [ ] Console shows "Local CMS script loaded!" on every page

### ✅ Navigation Testing
- [ ] All dropdown menus populate on every page (including static pages)
- [ ] All links work correctly
- [ ] "New" badges appear where expected
- [ ] No empty state messages visible

### ✅ List Page Testing
- [ ] All collection items display
- [ ] Featured items show in correct sections
- [ ] Category sections populate correctly
- [ ] Grid layouts render properly
- [ ] All images load
- [ ] All links navigate correctly

### ✅ Detail Page Testing
- [ ] Can navigate from list to detail
- [ ] URL parameters work correctly
- [ ] All sections populate with correct data
- [ ] Conditional sections show/hide properly
- [ ] Related items section works
- [ ] Breadcrumbs show correct path
- [ ] Page title and meta tags update
- [ ] Back/forward navigation works

### ✅ Browser Console Testing
- [ ] No JavaScript errors
- [ ] All "CMS data bound" messages appear
- [ ] No "element not found" warnings
- [ ] jQuery loaded successfully

### ✅ Cross-Page Testing
- [ ] Navigation consistent across all pages
- [ ] Can navigate full user journey
- [ ] Links between pages work bidirectionally
- [ ] No 404 or broken links

---

## Step 8: Documentation Update

After completing CMS binding, update documentation:

### Update Project README
Add a section documenting:
```markdown
## CMS Collections

This project includes the following CMS collections:

- **Services** - 6 items (Hair, Infrared Sauna, Nails, Skin & Beauty, Tanning, Weddings)
- **Stylists** - 6 items (Alyssa, Joelle, Kelly, Maddie, Nikki, Shelby)

### Pages with CMS Binding:
- `services.html` - Services list
- `detail_services.html` - Individual service detail
- `stylists.html` - Stylists list  
- `detail_stylists.html` - Individual stylist detail
- Navigation dropdowns - All pages

### CMS Data Location:
- Local testing: `local-cms.js`
- Production: Webflow CMS
- Exports: `cms/` folder
```

### Create/Update Change Log
Document what was added:
```markdown
## [Date] - CMS Binding Update
- Added navigation binding for all pages
- Implemented services list binding
- Implemented service detail binding
- Implemented stylists list binding
- Implemented stylist detail binding
- All CMS empty states resolved
```

---

## Quick Command Reference

### Initial Analysis
```bash
# List all HTML pages
ls -1 *.html

# Find CMS-bound pages
grep -l "w-dyn-list" *.html

# Check for detail pages
ls -1 detail_*.html

# Check CMS data exports
ls -la cms/
```

### During Development
```bash
# Open local-cms.js for editing
# (edit with search_replace or write tools)

# Check for syntax errors
# (use read_lints tool)

# View specific HTML sections
grep -A 20 "class=\"section_hero" detail_services.html
```

### Testing
```bash
# Open pages in browser
open index.html
open services.html
open "detail_services.html?service=hair-services"
```

---

## Standard Response Template

When user says "update cms", respond with:

```
I'll update the CMS bindings for this project. Let me:

1. ✅ Identify all pages needing CMS binding
2. ✅ Analyze HTML structure for each page
3. ✅ Update local-cms.js with proper bindings
4. ✅ Test all navigation and page bindings
5. ✅ Verify no syntax errors
6. ✅ Update documentation

Starting now...
```

Then systematically work through Steps 1-8 above.

---

## Project-Specific Notes

### IMPRESSIONZ Project

**Collections:**
- Services (6 items)
- Service Offerings (18 items) - related to Services
- Stylists (6 items)

**Pages:**
- `services.html` - List of all service categories
- `detail_services.html?service={slug}` - Detail page for each service
- `stylists.html` - List of all stylists (if exists)
- `detail_stylists.html?stylist={slug}` - Detail page for each stylist

**Key Sections to Bind:**
- Navigation dropdowns (global)
- Hero sections
- Offerings sections (uses related data)
- Related stylists sections
- Other services sections
- Conditional sections (pricing, FAQ for Infrared Sauna)

**Data Relationships:**
- Services → Service Offerings (one-to-many)
  - Service items reference multiple Service Offerings by slug
  - When binding, look up offerings from offeringsData collection
- Services → Stylists (many-to-many)
  - Service items reference multiple Stylists by slug
  - Stylist items may also reference Services
  - When binding, look up stylists from stylistsData collection

**Important:** When binding Service detail pages, you must:
1. Load the Service item from servicesData
2. Look up related Service Offerings from offeringsData using the slugs
3. Look up related Stylists from stylistsData using the slugs
4. Render all related items in their respective sections

This cross-collection reference pattern is common in Webflow CMS - always check if CMS data references data in other CMS databases/collections.

---

## Troubleshooting Quick Reference

| Issue | Solution |
|-------|----------|
| **Navigation dropdowns empty** | **Add `local-cms.js` to ALL pages, not just CMS pages** |
| "Illegal return statement" | Wrap code in function (see local-cms-binding.md) |
| "$ is not defined" | Add jQuery check before init function |
| Elements not populating | Check selectors match HTML classes exactly |
| Empty states still showing | Add `.hide()` after binding |
| Links not working | Verify URL parameter format matches |
| Images not loading | Check image URLs are complete with https:// |
| Multiple pages same binding | Ensure pathname.includes() is specific enough |
| Data not matching sections | Read HTML to find actual class names used |
| Script loads but nav doesn't populate | Check selector targets `.w-dyn-items` not `.layout_1-col` |

---

## Efficiency Tips

1. **Read once, bind consistently** - Understand HTML structure before writing JS
2. **Copy patterns** - Reuse the same binding pattern for similar page types
3. **Test incrementally** - Test each section as you bind it
4. **Console log everything** - Makes debugging much faster
5. **Use find() not filter()** - When you need just one item
6. **Empty before append** - Always clear containers before adding items
7. **Check for element existence** - Use `.length > 0` before binding
8. **Early returns** - Exit functions early when data is missing

---

## Success Criteria

CMS binding is complete when:

- ✅ All navigation dropdowns populate on every page
- ✅ All collection list pages show data correctly
- ✅ All detail pages populate via URL parameters
- ✅ No "No items found" messages visible (when data exists)
- ✅ No `.w-dyn-bind-empty` classes remain on populated elements
- ✅ All console.log messages confirm successful binding
- ✅ No JavaScript errors in browser console
- ✅ All links navigate correctly between pages
- ✅ Page titles and meta tags update on detail pages
- ✅ No linter errors in local-cms.js
- ✅ Documentation updated with CMS structure

---

## Future Projects

This workflow applies to any Webflow project with CMS. Standard page types:

- Blog posts (list + detail)
- Portfolio items (list + detail)
- Products (list + detail)
- Team members (list + detail)
- Locations (list + detail)
- Events (list + detail)
- FAQs (list or accordion)
- Testimonials (slider or grid)

Simply adapt the data structure and section names for the specific project.

