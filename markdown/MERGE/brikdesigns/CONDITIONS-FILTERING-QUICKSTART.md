# Quick Start: Webflow Conditions & Filtering/Sorting

## Overview

When you export your Webflow site for local testing, two features need special handling:

1. **Webflow Conditions** - Elements that show/hide based on CMS field values
2. **Filtering & Sorting** - Interactive controls for CMS collections

I've added utility systems to `local-cms.js` to handle both automatically!

---

## How It Works

### Webflow Conditions

**The Problem:** Webflow conditions (like "show if field = value") don't work in static HTML exports.

**The Solution:** The system automatically processes conditional elements when the page loads.

**How to Use:**
- Elements with `data-w-condition` attributes are automatically processed
- Or manually call `WebflowConditions.applyConditions()` for custom logic

**Example:**
```html
<div class="w-dyn-item" data-service-line="brand-design">
  <div data-w-condition="service-line:brand-design">
    This only shows for brand-design
  </div>
</div>
```

---

### Filtering & Sorting

**The Problem:** Webflow's CMS filtering/sorting UI isn't available in static exports.

**The Solution:** Add filtering/sorting controls using the utility functions.

**Quick Example for Services Page:**

```javascript
// In local-cms.js, after your CMS data binding

// 1. Add filtering
WebflowFilters.init({
  container: '.section_services .cms-list-wrapper',
  itemSelector: '.cms-item-services',
  filters: [{
    field: 'service-line',  // Matches data-service-line attribute
    selector: '.filter-checkboxes input', // Your filter UI
    type: 'checkbox'        // checkbox, select, radio, or search
  }]
});

// 2. Add sorting (optional)
WebflowSort.init({
  container: '.section_services .cms-list-wrapper',
  itemSelector: '.cms-item-services',
  sortOptions: [
    { field: 'name', label: 'Name (A-Z)', type: 'text', order: 'asc' }
  ],
  sortSelector: 'select.sort-dropdown'
});
```

**HTML Setup:**
```html
<!-- Filter Controls -->
<div class="filter-checkboxes">
  <label><input type="checkbox" data-value="brand-design"> Brand Design</label>
  <label><input type="checkbox" data-value="marketing-design"> Marketing Design</label>
</div>

<!-- Sort Control -->
<select class="sort-dropdown">
  <option value="name-asc">Name (A-Z)</option>
  <option value="name-desc">Name (Z-A)</option>
</select>

<!-- CMS Container (with data attributes on items) -->
<div class="cms-list-wrapper w-dyn-list">
  <div class="w-dyn-items">
    <div class="cms-item-services w-dyn-item" 
         data-service-line="brand-design" 
         data-name="Logo Design">
      <!-- Item content -->
    </div>
  </div>
</div>
```

---

## Key Points

### 1. Data Attributes Are Required

For filtering/sorting to work, your CMS items need data attributes:

```javascript
// When creating items in local-cms.js
const $item = $('<div>')
  .addClass('w-dyn-item')
  .attr('data-service-line', service.serviceLine)  // For filtering
  .attr('data-name', service.name)                  // For sorting
  .attr('data-price', service.price);               // For sorting
```

### 2. Filter Field Names Must Match

The `field` in your filter config must match the data attribute name (without `data-`):

```javascript
// Filter config
filters: [{
  field: 'service-line'  // Matches data-service-line attribute
}]
```

### 3. Conditions Are Automatic

Elements with `data-w-condition` are automatically processed on page load.

---

## Common Use Cases

### Filter by Service Line (Checkboxes)

```javascript
WebflowFilters.init({
  container: '.services-list',
  filters: [{
    field: 'service-line',
    selector: '.filter-service-line input[type="checkbox"]',
    type: 'checkbox'
  }]
});
```

### Search by Name

```javascript
WebflowFilters.init({
  container: '.services-list',
  filters: [{
    field: 'name',
    selector: '.search-input',
    type: 'search'
  }]
});
```

### Sort by Date

```javascript
WebflowSort.init({
  container: '.services-list',
  sortOptions: [{
    field: 'date',
    label: 'Date (Newest)',
    type: 'date',
    order: 'desc'
  }],
  sortSelector: '.sort-select'
});
```

---

## Integration with Existing Code

The utilities work with your existing `local-cms.js` binding code. Just add them after you bind your CMS data:

```javascript
// Your existing CMS binding
function bindServices() {
  // ... bind CMS data to items ...
  
  // Add data attributes for filtering/sorting
  $items.each(function() {
    $(this).attr('data-service-line', service.serviceLine);
    $(this).attr('data-name', service.name);
  });
}

// Initialize filters/sorting after binding
$(document).ready(function() {
  bindServices();
  
  // Now add filtering/sorting
  WebflowFilters.init({ /* ... */ });
  WebflowSort.init({ /* ... */ });
});
```

---

## Full Documentation

See `markdown/webflow-conditions-and-filtering.md` for complete documentation with all options and examples.

---

## Available Utilities

- **`WebflowConditions`** - Handle conditional visibility
- **`WebflowFilters`** - Add filtering to CMS containers
- **`WebflowSort`** - Add sorting to CMS containers

All utilities are loaded automatically when `local-cms.js` loads!

