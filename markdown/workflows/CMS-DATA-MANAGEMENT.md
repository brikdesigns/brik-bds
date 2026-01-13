# CMS Data Management Guide

## Overview

This guide explains how to update and manage CMS data for Webflow projects. All CMS data is stored in CSV files in the `/cms` folder and bound to the website through JavaScript in `local-cms.js` (and optionally `footer.js` for Webflow-specific implementations).

---

## CMS Data Structure

### Standard Collections

Most Webflow projects include these common collection types:

- **Services** - Individual service offerings
- **Service Lines/Categories** - Categories of services
- **Team Members** - Staff or team information
- **Blog Posts** - Blog content
- **Testimonials** - Customer testimonials
- **Portfolio Items** - Work examples
- **Locations** - Business locations
- **Events** - Event listings

### CSV File Naming

Expected CSV file format:
- `[Project Name] - [Collection Name].csv`
- Example: `Brik Designs - Services.csv`
- Example: `Impressionz Salon & Spa - Services.csv`

---

## How to Update CMS Data

### Step 1: Export from Webflow

1. Go to your Webflow CMS Collections
2. Export each collection as CSV
3. Place the exported CSV files in the `/cms` folder
4. Ensure file names match the expected format: `[Project] - [Collection Name].csv`

### Step 2: Update Local Files

```bash
# Copy latest CSV files to root directory (if needed)
cp cms/*.csv .

# This ensures the data is available for local development
```

### Step 3: Update JavaScript Data Binding

The CMS data is bound in `local-cms.js` for local testing. For Webflow production, data comes from the CMS automatically.

#### Standard Data Structure:

**Collection Items Array:**
```javascript
const servicesData = [
  {
    name: 'Service Name',
    slug: 'service-slug',
    description: 'Service description',
    thumbnail: 'https://cdn.../image.jpg',
    // ... other fields
  },
  // ... more items
];
```

**Collection Object (keyed by slug):**
```javascript
const servicesData = {
  'service-slug': {
    name: 'Service Name',
    slug: 'service-slug',
    description: 'Service description',
    // ... other fields
  },
  // ... more items
};
```

**Cross-Collection References:**
```javascript
// Service references Stylists from another collection
{
  name: 'Hair Services',
  slug: 'hair-services',
  stylists: ['joelle', 'maddie', 'nikki'],  // Slugs from Stylists collection
  serviceOfferings: ['cut', 'color', 'style']  // Slugs from Offerings collection
}
```

### Step 4: Test the Updates

1. Open the website locally
2. Check navigation menus
3. Verify collection listings are correct
4. Confirm detail pages display properly
5. Test all CMS-driven components

---

## Pages That Use CMS Data

### Navigation (Global)
- **Services Menu**: Populated from Services/Service Lines data
- **Team Menu**: Populated from Team Members data
- **Other dropdowns**: Based on collection data

### Collection List Pages
- `services.html` - Service listings
- `stylists.html` - Team member listings
- `blog.html` - Blog post listings
- `portfolio.html` - Portfolio item listings

### Collection Detail Pages
- `detail_services.html?service={slug}` - Individual service detail
- `detail_stylists.html?stylist={slug}` - Individual team member detail
- `detail_post.html?post={slug}` - Individual blog post detail

---

## Data Binding Functions

### Standard Pattern in `local-cms.js`:

```javascript
// Global Navigation (runs on all pages)
function initNavigationBinding() {
  // Bind navigation dropdowns
}

// Collection List Pages
if (window.location.pathname.includes('services.html')) {
  function initServicesBinding() {
    // Bind list page
  }
}

// Collection Detail Pages
if (window.location.pathname.includes('detail_services.html')) {
  function initDetailServicesBinding() {
    // Get URL parameter
    // Find item from data
    // Bind to all sections
  }
}
```

### Event Listeners:

The CMS binding runs on multiple events to ensure compatibility:
- `DOMContentLoaded`
- `load`
- `webflow:load` (if available)
- `webflow:page` (if available)

---

## Troubleshooting

### Common Issues:

1. **Data not appearing**: Check browser console for CMS binding logs
2. **Broken links**: Verify slug names match between CSV and JavaScript
3. **Missing images**: Confirm image URLs are accessible
4. **Navigation not working**: Ensure `local-cms.js` is in ALL HTML pages
5. **Cross-collection references not working**: See `GLOBAL-WEBFLOW-WORKFLOW.md` Rule 6

### Debug Commands:

```javascript
// Check if CMS binding is working
console.log('Services Data:', servicesData);
console.log('Current page:', window.location.pathname);

// Test navigation binding
initNavigationBinding();

// Test specific page binding
initServicesBinding();
```

---

## Best Practices

### Data Consistency:
- Always use consistent slug naming between Webflow and local data
- Maintain the same field names across CSV exports
- Keep image URLs up to date
- Document any custom field mappings

### Performance:
- Minimize the size of data objects
- Only include necessary fields in JavaScript objects
- Use efficient selectors for DOM manipulation
- Consider pagination for large collections

### Maintenance:
- Update CMS data regularly (weekly/monthly)
- Test thoroughly after each update
- Keep backup copies of working CSV files
- Document any custom field mappings
- Track cross-collection relationships

---

## File Structure

```
project-name.webflow/
├── cms/                          # Latest CSV exports from Webflow
│   ├── [Project] - Services.csv
│   ├── [Project] - Service Lines.csv
│   ├── [Project] - Team Members.csv
│   └── [other collections].csv
├── local-cms.js                  # CMS data binding (local testing only)
└── README.md                     # Project documentation
```

---

## Quick Update Checklist

- [ ] Export latest CSV files from Webflow CMS
- [ ] Place CSV files in `/cms` folder
- [ ] Update JavaScript data objects in `local-cms.js`
- [ ] Resolve cross-collection references
- [ ] Test navigation functionality
- [ ] Verify all CMS-driven pages work correctly
- [ ] Test detail pages with URL parameters
- [ ] Commit changes to Git
- [ ] Document any new collections or fields

---

## Cross-Collection References

**Important:** CMS data may reference data in other CMS databases/collections. When binding data, identify and resolve relationships between collections.

**Common Relationship Types:**
- **One-to-Many:** Service → Service Offerings (one service has many offerings)
- **Many-to-Many:** Services ↔ Stylists (services can have multiple stylists, stylists can have multiple services)
- **Reference Fields:** Items that link to other collection items via slug

**Resolution Pattern:**
```javascript
// When binding Service detail page, resolve cross-collection references
const currentService = servicesData.find(s => s.slug === serviceSlug);

// Look up related items from other collections
const relatedOfferings = currentService.serviceOfferings.map(slug =>
  offeringsData.find(o => o.slug === slug)
).filter(Boolean);

const relatedStylists = currentService.stylists.map(slug =>
  stylistsData.find(s => s.slug === slug)
).filter(Boolean);
```

For complete details, see `GLOBAL-WEBFLOW-WORKFLOW.md` (Rule 6: Cross-Collection References).

---

## Support

For questions about CMS data management:
1. Check this guide first
2. Review browser console for error messages
3. Compare working data structure with new CSV exports
4. Test changes in local development before deploying
5. See `cms-update-workflow.md` for complete binding workflow
6. See `local-cms-binding.md` for technical implementation patterns

---

**Last Updated:** 2025-01-27  
**Source:** Generalized from brikdesigns CMS-README.md  
**Status:** Universal standard for all Webflow projects

