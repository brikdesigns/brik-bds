# Local CMS Binding for Webflow Projects

This guide documents the process for implementing local CMS data binding to test Webflow CMS-based websites locally before deploying to production.

## Overview

When working with Webflow CMS collections, you can't test dynamic content locally without creating a separate data binding layer. The `local-cms.js` file simulates Webflow's CMS by injecting data into the exported HTML pages.

## Why This Approach?

- **Test CMS layouts locally** before publishing to Webflow
- **Iterate faster** without waiting for Webflow publishes
- **Validate data structure** before creating CMS collections
- **Version control** CMS content during development
- **Keep custom code separate** from what goes to Webflow

---

## Quick Start

### 1. Create the local-cms.js File

Create a `local-cms.js` file in your project root (same level as `index.html`):

```javascript
// ===== LOCAL CMS DATA BINDING =====
// This file is for local testing only and simulates CMS data from Webflow
// DO NOT transfer this to Webflow - it's only for local development

console.log('Local CMS script loaded!');
console.log('Current pathname:', window.location.pathname);
```

### 2. Reference the Script in HTML

Add the script reference at the **bottom** of your HTML file, after jQuery and other dependencies:

```html
<script src="https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js" type="text/javascript"></script>
<script src="js/webflow.js" type="text/javascript"></script>
<script src="footer.js" type="text/javascript"></script>
<script src="local-cms.js" type="text/javascript"></script>
```

### 3. Set Up Page Detection

Detect which page is loading to bind the correct data:

```javascript
// Detect the current page
if (window.location.pathname.includes('services.html')) {
  console.log('Detected services.html page');
  // Initialize binding for this page
}

if (window.location.pathname.includes('detail_services.html')) {
  console.log('Detected detail_services.html page');
  // Initialize binding for this page
}
```

---

## Critical Pattern: Function Wrapping

**⚠️ IMPORTANT:** Always wrap your binding logic in a function to avoid syntax errors.

### ❌ INCORRECT - Will Cause "Illegal return statement" Error

```javascript
if (window.location.pathname.includes('detail_services.html')) {
  const data = [...];
  
  if (!someCondition) {
    return; // ❌ ERROR: return outside function
  }
  
  // More code...
}
```

### ✅ CORRECT - Wrapped in Function

```javascript
if (window.location.pathname.includes('detail_services.html')) {
  console.log('Detected detail_services.html page');
  
  // Wait for jQuery to be ready
  if (typeof $ === 'undefined') {
    console.error('jQuery not loaded! Waiting for it...');
    window.addEventListener('load', function() {
      if (typeof $ === 'undefined') {
        console.error('jQuery still not loaded after page load!');
        return; // ✅ OK: inside function
      }
      initDetailServicesBinding();
    });
  } else {
    $(document).ready(initDetailServicesBinding);
  }
  
  function initDetailServicesBinding() {
    console.log('Local CMS: Initializing detail_services.html binding...');
    
    const data = [...];
    
    if (!someCondition) {
      return; // ✅ OK: inside function
    }
    
    // More binding logic...
  }
}
```

---

## Complete Implementation Pattern

### Full Template for a CMS Collection Page

```javascript
// ===== CMS DATA BINDING FOR [PAGE_NAME].HTML =====
if (window.location.pathname.includes('page-name.html')) {
  console.log('Detected page-name.html page');
  
  // Wait for both DOM and jQuery to be ready
  if (typeof $ === 'undefined') {
    console.error('jQuery not loaded! Waiting for it...');
    window.addEventListener('load', function() {
      if (typeof $ === 'undefined') {
        console.error('jQuery still not loaded after page load!');
        return;
      }
      initPageBinding();
    });
  } else {
    $(document).ready(initPageBinding);
  }
  
  function initPageBinding() {
    console.log('Local CMS: Initializing page-name.html binding...');
    
    // 1. Define your CMS data
    const cmsData = [
      {
        name: "Item 1",
        slug: "item-1",
        description: "Description here",
        image: "https://example.com/image.jpg"
      },
      {
        name: "Item 2",
        slug: "item-2",
        description: "Description here",
        image: "https://example.com/image2.jpg"
      }
    ];
    
    // 2. Get URL parameters (for detail pages)
    const urlParams = new URLSearchParams(window.location.search);
    const currentSlug = urlParams.get('item');
    
    // 3. Early exit if required parameter missing
    if (!currentSlug) {
      console.log('No item parameter found in URL');
      return;
    }
    
    // 4. Find the current item
    const currentItem = cmsData.find(item => item.slug === currentSlug);
    
    if (!currentItem) {
      console.log('Item not found:', currentSlug);
      return;
    }
    
    // 5. Update page content
    $('.text_heading').text(currentItem.name);
    $('.text_body').text(currentItem.description);
    $('.img').attr('src', currentItem.image).attr('alt', currentItem.name);
    
    // 6. Update meta tags for SEO
    document.title = `${currentItem.name} | Your Site Name`;
    $('meta[name="description"]').attr('content', currentItem.description);
    $('meta[property="og:title"]').attr('content', currentItem.name);
    
    console.log('CMS data bound successfully for:', currentItem.name);
  }
}
```

---

## Common Patterns

### 1. Binding to a List Page

For collection list pages (like `services.html`):

```javascript
function initServicesListBinding() {
  const servicesData = [
    { name: "Service 1", slug: "service-1", image: "...", description: "..." },
    { name: "Service 2", slug: "service-2", image: "...", description: "..." }
  ];
  
  // Hide "No items found" message
  $('.w-dyn-empty').hide();
  
  // Bind each service to its section
  const featuredService = servicesData.find(s => s.featured);
  if (featuredService) {
    $('.section-featured .text_heading').text(featuredService.name);
    $('.section-featured .text_body').text(featuredService.description);
    $('.section-featured .img').attr('src', featuredService.image);
    $('.section-featured .button_primary').attr('href', `detail.html?service=${featuredService.slug}`);
  }
}
```

### 2. Binding to a Detail Page

For detail pages with URL parameters:

```javascript
function initServiceDetailBinding() {
  const urlParams = new URLSearchParams(window.location.search);
  const serviceSlug = urlParams.get('service');
  
  if (!serviceSlug) {
    console.log('No service parameter found');
    return;
  }
  
  const service = servicesData.find(s => s.slug === serviceSlug);
  
  if (!service) {
    console.log('Service not found:', serviceSlug);
    return;
  }
  
  // Update all page sections
  $('.section_hero .text_display').text(service.name);
  $('.section_hero .text_body').text(service.description);
  
  // Show/hide conditional sections
  if (service.hasSpecialFeature) {
    $('.section_special').show();
  } else {
    $('.section_special').hide();
  }
}
```

### 3. Removing Empty State Classes

Webflow adds `w-dyn-bind-empty` classes to CMS-bound elements. Remove these when populating with local data:

```javascript
$('.text_heading.w-dyn-bind-empty')
  .removeClass('w-dyn-bind-empty')
  .text(item.name);

$('.img.w-dyn-bind-empty')
  .removeClass('w-dyn-bind-empty')
  .attr('src', item.image)
  .attr('alt', item.name);
```

### 4. Dynamically Creating List Items

For repeating items (like service offerings):

```javascript
const container = $('.offerings-container');
container.empty(); // Clear existing items

service.offerings.forEach(offering => {
  const offeringHtml = `
    <div class="offering-item">
      <h3 class="text_heading-md">${offering.name}</h3>
      <p class="text_body-md">${offering.description}</p>
    </div>
  `;
  container.append(offeringHtml);
});
```

---

## Data Structure Best Practices

### Organize Data by Type

Keep your data organized in separate arrays:

```javascript
// Services
const servicesData = [
  { name: "Service 1", slug: "service-1", ... }
];

// Service Offerings
const offeringsData = [
  { name: "Offering 1", slug: "offering-1", serviceLine: "service-1", ... }
];

// Team Members
const teamData = [
  { name: "Team Member 1", slug: "member-1", ... }
];
```

### Use Consistent Slugs for Relationships

Link related items using slugs:

```javascript
{
  name: "Hair Services",
  slug: "hair-services",
  serviceOfferings: ["haircuts", "color", "styling"], // Array of slugs
  stylists: ["stylist-1", "stylist-2"] // Array of slugs
}
```

Then look them up:

```javascript
service.serviceOfferings.forEach(offeringSlug => {
  const offering = offeringsData.find(o => o.slug === offeringSlug);
  if (offering) {
    // Render offering
  }
});
```

---

## Debugging Tips

### 1. Add Console Logs

```javascript
console.log('Local CMS script loaded!');
console.log('Current pathname:', window.location.pathname);
console.log('URL params:', Object.fromEntries(urlParams));
console.log('Found item:', currentItem);
console.log('CMS data bound successfully for:', currentItem.name);
```

### 2. Check jQuery Loading

```javascript
if (typeof $ === 'undefined') {
  console.error('jQuery not loaded!');
} else {
  console.log('jQuery loaded successfully');
}
```

### 3. Verify DOM Elements Exist

```javascript
if ($('.text_heading').length === 0) {
  console.warn('Target element .text_heading not found in DOM');
}
```

### 4. Check for Syntax Errors

- Ensure all `return` statements are inside functions
- Check for matching braces `{}`
- Verify array/object syntax with proper commas
- Look for unclosed strings or template literals

---

## Common Errors & Solutions

### Error: "Uncaught SyntaxError: Illegal return statement"

**Cause:** `return` statement used outside of a function

**Solution:** Wrap your code in a function (see "Critical Pattern" above)

### Error: "$ is not defined"

**Cause:** jQuery not loaded before local-cms.js runs

**Solution:** Add jQuery loading check:

```javascript
if (typeof $ === 'undefined') {
  window.addEventListener('load', function() {
    initBinding();
  });
} else {
  $(document).ready(initBinding);
}
```

### Error: "Cannot read property 'text' of undefined"

**Cause:** DOM element not found with jQuery selector

**Solution:** Verify the element exists and selector is correct:

```javascript
const $element = $('.text_heading');
if ($element.length > 0) {
  $element.text(item.name);
} else {
  console.warn('Element not found: .text_heading');
}
```

---

## Workflow Integration

### 1. Local Development

1. Export site from Webflow
2. Add `local-cms.js` to root directory
3. Reference script in HTML files
4. Test CMS bindings locally
5. Iterate on structure and styling

### 2. Preparing for Webflow

1. **DO NOT** copy `local-cms.js` to Webflow
2. Copy only `header.css` to Webflow Custom Code (Head)
3. Copy only `footer.js` to Webflow Custom Code (Footer)
4. Create actual CMS collections in Webflow matching your data structure
5. Publish and verify live data displays correctly

### 3. File Purpose Reference

| File | Purpose | Transfer to Webflow? |
|------|---------|---------------------|
| `local-cms.js` | Simulate CMS data locally | ❌ NO - Local only |
| `header.css` | Custom styles for head | ✅ YES - Copy to Head Code |
| `footer.js` | Custom JavaScript | ✅ YES - Copy to Footer Code |

---

## Project Structure

```
project-root/
├── index.html
├── services.html
├── detail_services.html
├── local-cms.js          ← Local CMS bindings
├── header.css             ← Custom styles (→ Webflow)
├── footer.js              ← Custom JS (→ Webflow)
├── css/
│   └── [webflow exports]
├── js/
│   └── webflow.js
├── cms/                   ← CSV exports from Webflow
│   ├── Services.csv
│   └── Stylists.csv
└── markdown/              ← Documentation
    └── local-cms-binding.md
```

---

## Export Data from Webflow CMS

If you need to reference existing CMS data:

1. In Webflow Designer, go to CMS Collections
2. Select your collection
3. Click "Export Items" 
4. Save CSV to `cms/` folder
5. Reference the CSV structure when building your `local-cms.js` data

---

## Advanced: Multiple Page Types

Structure your `local-cms.js` for multiple pages:

```javascript
// ===== LOCAL CMS DATA BINDING =====
console.log('Local CMS script loaded!');

// ===== SERVICES LIST PAGE =====
if (window.location.pathname.includes('services.html')) {
  if (typeof $ === 'undefined') {
    window.addEventListener('load', initServicesBinding);
  } else {
    $(document).ready(initServicesBinding);
  }
  
  function initServicesBinding() {
    // Services list binding logic
  }
}

// ===== SERVICE DETAIL PAGE =====
if (window.location.pathname.includes('detail_services.html')) {
  if (typeof $ === 'undefined') {
    window.addEventListener('load', initServiceDetailBinding);
  } else {
    $(document).ready(initServiceDetailBinding);
  }
  
  function initServiceDetailBinding() {
    // Service detail binding logic
  }
}

// ===== STYLISTS PAGE =====
if (window.location.pathname.includes('stylists.html')) {
  if (typeof $ === 'undefined') {
    window.addEventListener('load', initStylistsBinding);
  } else {
    $(document).ready(initStylistsBinding);
  }
  
  function initStylistsBinding() {
    // Stylists binding logic
  }
}
```

---

## Checklist for New CMS Binding

- [ ] Create or update `local-cms.js` file
- [ ] Add script reference to HTML file (after jQuery)
- [ ] Detect page using `window.location.pathname`
- [ ] Wrap binding logic in initialization function
- [ ] Check for jQuery availability before running
- [ ] Define CMS data arrays with consistent structure
- [ ] Parse URL parameters for detail pages
- [ ] Add early returns for missing data
- [ ] Remove `w-dyn-bind-empty` classes when binding
- [ ] Hide empty state messages (`.w-dyn-empty`)
- [ ] Add console logs for debugging
- [ ] Test all page states (list, detail, empty)
- [ ] Verify meta tags update correctly
- [ ] Document any custom patterns used

---

## Questions or Issues?

- Check browser console for errors
- Verify jQuery is loaded before `local-cms.js`
- Ensure all functions are properly closed with `}`
- Confirm URL parameters match expected format
- Reference this guide for common patterns and solutions

**Remember:** `local-cms.js` is for local development only. Never transfer this file to Webflow.

