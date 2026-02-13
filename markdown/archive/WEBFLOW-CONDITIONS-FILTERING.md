# Webflow Conditions & Filtering/Sorting Guide

This guide explains how to handle Webflow conditions and add filtering/sorting capabilities to CMS containers when testing locally.

## Overview

When you export your Webflow site for local testing, two things need special handling:

1. **Webflow Conditions** - Elements that show/hide based on CMS field values
2. **Filtering & Sorting** - Interactive controls for CMS collections (not automatically available in static exports)

The `local-cms.js` file can include utility systems to handle both of these scenarios.

---

## Webflow Conditions

### How Webflow Conditions Work

In Webflow Designer, you can set conditional visibility rules like:
- Show element if `field = "value"`
- Hide element if `field = "value"`
- Show element if `field > 100`

When exported, these conditions are represented as:
- CSS class: `.w-condition-invisible` (hides elements)
- Data attributes: `data-w-condition` (stores condition logic)

### Using the Conditions Handler

#### Method 1: Auto-Process (Default)

The system automatically processes elements with `data-w-condition` attributes:

```html
<!-- In your HTML -->
<div class="w-dyn-item" data-service-line="brand-design">
  <div data-w-condition="service-line:brand-design">
    This only shows for brand-design services
  </div>
  <div data-w-condition="service-line:!product-design">
    This shows for all services EXCEPT product-design
  </div>
</div>
```

#### Method 2: Manual Application

Apply conditions programmatically:

```javascript
// In local-cms.js
WebflowConditions.applyConditions($('.w-dyn-list'), {
  'service-line': {
    operator: 'equals',
    visible: ['brand-design', 'marketing-design']
  },
  'featured': {
    operator: 'equals',
    visible: ['true', 'yes']
  }
});
```

---

## Filtering System

### Basic Setup

Add filtering to any CMS container:

```javascript
// In local-cms.js, in your page initialization function
WebflowFilters.init({
  container: '.cms-list-wrapper', // Your CMS list container
  itemSelector: '.w-dyn-item',    // Individual items
  filters: [
    {
      field: 'service-line',       // CMS field to filter by
      selector: '.filter-checkbox', // Filter UI element
      type: 'checkbox'              // Filter type: checkbox, select, radio, search
    }
  ],
  onFilter: function(visibleCount, totalCount) {
    console.log(`${visibleCount} of ${totalCount} items visible`);
  }
});
```

### Filter Types

#### 1. Checkbox Filters (Multiple Selection)

```html
<!-- HTML -->
<div class="filter-list">
  <label>
    <input type="checkbox" class="filter-checkbox" 
           data-value="brand-design" fs-list-value="brand-design">
    Brand Design
  </label>
  <label>
    <input type="checkbox" class="filter-checkbox" 
           data-value="marketing-design" fs-list-value="marketing-design">
    Marketing Design
  </label>
</div>

<div class="cms-list-wrapper w-dyn-list">
  <div class="w-dyn-items">
    <div class="w-dyn-item" data-service-line="brand-design">...</div>
    <div class="w-dyn-item" data-service-line="marketing-design">...</div>
  </div>
</div>
```

```javascript
WebflowFilters.init({
  container: '.cms-list-wrapper',
  filters: [{
    field: 'service-line',
    selector: '.filter-checkbox',
    type: 'checkbox'
  }]
});
```

#### 2. Select Dropdown (Single Selection)

```html
<select class="filter-select">
  <option value="">All Services</option>
  <option value="brand-design">Brand Design</option>
  <option value="marketing-design">Marketing Design</option>
</select>
```

```javascript
WebflowFilters.init({
  container: '.cms-list-wrapper',
  filters: [{
    field: 'service-line',
    selector: '.filter-select',
    type: 'select'
  }]
});
```

#### 3. Search Filter

```html
<input type="text" class="filter-search" placeholder="Search services...">
```

```javascript
WebflowFilters.init({
  container: '.cms-list-wrapper',
  filters: [{
    field: 'name', // Searches in the name field
    selector: '.filter-search',
    type: 'search'
  }]
});
```

### Multiple Filters

Combine multiple filters:

```javascript
WebflowFilters.init({
  container: '.cms-list-wrapper',
  filters: [
    {
      field: 'service-line',
      selector: '.filter-service-line',
      type: 'checkbox'
    },
    {
      field: 'industry',
      selector: '.filter-industry',
      type: 'select'
    },
    {
      field: 'name',
      selector: '.filter-search',
      type: 'search'
    }
  ]
});
```

### Reset Filters

```javascript
// Reset all filters on a container
WebflowFilters.reset('.cms-list-wrapper');
```

---

## Sorting System

### Basic Setup

Add sorting to a CMS container:

```javascript
WebflowSort.init({
  container: '.cms-list-wrapper',
  itemSelector: '.w-dyn-item',
  sortOptions: [
    {
      field: 'name',
      label: 'Name (A-Z)',
      type: 'text',
      order: 'asc'
    },
    {
      field: 'name',
      label: 'Name (Z-A)',
      type: 'text',
      order: 'desc'
    },
    {
      field: 'date',
      label: 'Date (Newest)',
      type: 'date',
      order: 'desc'
    },
    {
      field: 'price',
      label: 'Price (Low to High)',
      type: 'number',
      order: 'asc'
    }
  ],
  sortSelector: 'select.sort-control',
  defaultSort: 'name', // Optional: apply default sort on load
  onSort: function(sortOption) {
    console.log('Sorted by:', sortOption.field);
  }
});
```

### Sort Types

- **`text`** - Alphabetical sorting
- **`number`** - Numerical sorting
- **`date`** - Date-based sorting

### HTML Example

```html
<select class="sort-control">
  <option value="name-asc">Name (A-Z)</option>
  <option value="name-desc">Name (Z-A)</option>
  <option value="date-desc">Date (Newest First)</option>
</select>

<div class="cms-list-wrapper w-dyn-list">
  <div class="w-dyn-items">
    <div class="w-dyn-item" data-name="Service A" data-date="2025-01-15">...</div>
    <div class="w-dyn-item" data-name="Service B" data-date="2025-02-20">...</div>
  </div>
</div>
```

---

## Complete Example

Here's a complete example for a services page with filtering and sorting:

```javascript
// In local-cms.js

// ===== SERVICES PAGE =====
if (window.location.pathname.includes('services.html')) {
  $(document).ready(function() {
    // ... your existing CMS binding code ...
    
    // After binding CMS data, initialize filters and sorting
    initServicesFiltersAndSort();
  });
  
  function initServicesFiltersAndSort() {
    // Setup filtering
    WebflowFilters.init({
      container: '.section_services .cms-list-wrapper',
      itemSelector: '.cms-item-services',
      filters: [
        {
          field: 'service-line',
          selector: '.filter-list input[type="checkbox"]',
          type: 'checkbox'
        },
        {
          field: 'name',
          selector: '.search-input',
          type: 'search'
        }
      ],
      onFilter: function(visible, total) {
        $('.results-count').text(`${visible} of ${total} services`);
      }
    });
    
    // Setup sorting
    WebflowSort.init({
      container: '.section_services .cms-list-wrapper',
      itemSelector: '.cms-item-services',
      sortOptions: [
        { field: 'name', label: 'Name (A-Z)', type: 'text', order: 'asc' },
        { field: 'name', label: 'Name (Z-A)', type: 'text', order: 'desc' }
      ],
      sortSelector: '.sort-select',
      defaultSort: 'name'
    });
    
    // Apply conditions
    WebflowConditions.processConditionalElements('.section_services');
  }
}
```

---

## Data Attributes for Items

For filtering and sorting to work, your CMS items should have data attributes:

```html
<div class="w-dyn-item" 
     data-service-line="brand-design"
     data-industry="small-business"
     data-name="Logo Design"
     data-date="2025-01-15"
     data-price="500">
  <!-- Item content -->
</div>
```

These can be set when binding CMS data in `local-cms.js`:

```javascript
servicesData.forEach(function(service) {
  const $item = $('<div>')
    .addClass('w-dyn-item')
    .attr('data-service-line', service.serviceLine)
    .attr('data-name', service.name)
    .attr('data-price', service.price);
  
  // ... populate item content ...
});
```

---

## Integration with Existing Code

The utilities are available globally after `local-cms.js` loads. You can use them in:

- Your existing CMS binding functions
- Page-specific initialization code
- Custom JavaScript in your HTML files

They work alongside your existing `local-cms.js` binding code.

---

## Quick Start Reference

### Conditions
- Elements with `data-w-condition` are automatically processed
- Or use `WebflowConditions.applyConditions()` for custom logic

### Filtering
- Use `WebflowFilters.init()` with filter configurations
- Requires data attributes on items (e.g., `data-service-line`)
- Supports checkbox, select, radio, and search filter types

### Sorting
- Use `WebflowSort.init()` with sort options
- Requires data attributes on items (e.g., `data-name`, `data-date`)
- Supports text, number, and date sort types

### Data Attributes
- Store filterable/sortable values as `data-*` attributes on items
- Field names in config must match data attribute names (without `data-` prefix)

---

## Tips & Best Practices

1. **Initialize after CMS binding** - Set up filters/sorting after your CMS data is bound to the page
2. **Use data attributes** - Store filterable/sortable values as data attributes on items
3. **Handle empty states** - The system automatically shows/hides `.w-dyn-empty` elements
4. **Combine with conditions** - Use conditions to show/hide elements, filters to show/hide items
5. **Test locally first** - These utilities are for local testing only, not for Webflow production

---

## Troubleshooting

### Filters not working
- Check that data attributes match the filter field names
- Verify filter selectors match your HTML elements
- Check browser console for error messages

### Sorting not working
- Ensure sort field names match data attributes
- Verify sort type matches your data (text/number/date)
- Check that items have the required data attributes

### Conditions not applying
- Verify `data-w-condition` attributes are in the HTML
- Check that field values in data attributes match condition values
- Use browser inspector to see which elements have `.w-condition-invisible` class

---

## Summary

- **Conditions**: Automatically processed, or use `WebflowConditions.applyConditions()`
- **Filtering**: Use `WebflowFilters.init()` with filter configurations
- **Sorting**: Use `WebflowSort.init()` with sort options
- **Data Attributes**: Store filterable/sortable values as `data-*` attributes on items

These utilities make it easy to test Webflow CMS features locally before publishing!

---

**Last Updated:** 2025-01-27  
**Source:** Consolidated from brikdesigns MERGE folder  
**Status:** Universal standard for all Webflow projects  
**Related:** See `QUICK-START.md` for quick reference

