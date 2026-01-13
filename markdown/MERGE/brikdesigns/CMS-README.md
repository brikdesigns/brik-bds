# CMS Data Management Guide

## Overview
This guide explains how to update and manage CMS data for the Brik Designs website. All CMS data is stored in CSV files in the `/cms` folder and bound to the website through JavaScript in `app.js` and `footer.js`.

## CMS Data Structure

### Available Collections
- **Services** (`Brik Designs - Services.csv`) - Individual service offerings
- **Service Lines** (`Brik Designs - Service Lines.csv`) - Categories of services
- **Customer Stories** (`Brik Designs - Customer Stories.csv`) - Case studies and testimonials
- **Customers** (`Brik Designs - Customers.csv`) - Client information
- **Blog Posts** (`Brik Designs - Blog Posts.csv`) - Blog content
- **Templates** (`Brik Designs - Templates.csv`) - Design templates
- **Prices** (`Brik Designs - Prices.csv`) - Pricing information

## How to Update CMS Data

### Step 1: Export from Webflow
1. Go to your Webflow CMS Collections
2. Export each collection as CSV
3. Place the exported CSV files in the `/cms` folder
4. Ensure file names match the expected format: `Brik Designs - [Collection Name].csv`

### Step 2: Update Local Files
```bash
# Copy latest CSV files to root directory
cp cms/*.csv .

# This ensures the data is available for local development
```

### Step 3: Update JavaScript Data Binding
The CMS data is bound in two main files:
- `app.js` - Primary CMS binding for mega navigation
- `footer.js` - Backup/mirror implementation

#### Key Data Objects to Update:

**Service Lines** (from `Brik Designs - Service Lines.csv`):
```javascript
const serviceLines = {
  'brand-design': {
    name: 'Brand Design',
    tagline: 'Build a lasting, consistent brand that builds trust',
    services: ['business-card', 'imported-item-5', 'business-listings', 'email-signature', 'stationary'],
    color: '#f4d364'
  },
  // ... other service lines
};
```

**Services Data** (from `Brik Designs - Services.csv`):
```javascript
const servicesData = {
  'imported-item-5': { 
    name: 'Logo Design', 
    slug: 'imported-item-5', 
    primaryBadge: 'https://cdn.prod.website-files.com/...' 
  },
  // ... other services
};
```

**Customer Stories** (from `Brik Designs - Customer Stories.csv`):
```javascript
const customerStoriesData = [
  {
    name: 'A New Chapter for AADP: Brand Identity Refresh and Logo System',
    slug: 'a-new-chapter-brand-identity-refresh-and-logo-system',
    client: 'Atlantic Aluminum Dock Products',
    shortDescription: 'We created a bold, flexible brand identity...',
    industryBadge: 'small-business',
    heroImage: 'https://cdn.prod.website-files.com/...'
  },
  // ... other stories
];
```

### Step 4: Test the Updates
1. Open the website locally
2. Check the mega navigation menus
3. Verify service listings are correct
4. Confirm customer stories are displaying properly
5. Test all CMS-driven components

## Pages That Use CMS Data

### Mega Navigation
- **Services Menu**: Populated from Service Lines and Services data
- **Customer Stories**: Featured story and customer types

### Individual Pages
- `/services` - Service listings
- `/service-lines/[slug]` - Service line detail pages
- `/customer-stories` - Customer story listings
- `/customer-stories/[slug]` - Individual customer story pages
- `/customers` - Customer information
- `/blog` - Blog post listings
- `/templates` - Template listings
- `/pricing` - Pricing information

## Data Binding Functions

### Main Functions in `app.js`:
- `bindDesignServicesMegaNav()` - Binds service lines and services to mega nav
- `bindCustomersMegaNav()` - Binds customer stories and types to mega nav
- `initCMSBinding()` - Initializes all CMS binding on page load

### Event Listeners:
The CMS binding runs on multiple events to ensure compatibility with Webflow:
- `DOMContentLoaded`
- `load`
- `webflow:load`
- `webflow:page`

## Troubleshooting

### Common Issues:
1. **Data not appearing**: Check browser console for CMS binding logs
2. **Broken links**: Verify slug names match between CSV and JavaScript
3. **Missing images**: Confirm image URLs are accessible
4. **Mega nav not working**: Ensure CSS selectors match HTML structure

### Debug Commands:
```javascript
// Check if CMS binding is working
console.log('Service Lines:', serviceLines);
console.log('Services Data:', servicesData);
console.log('Customer Stories:', customerStoriesData);
```

## Best Practices

### Data Consistency:
- Always use consistent slug naming between Webflow and local data
- Maintain the same field names across CSV exports
- Keep image URLs up to date

### Performance:
- Minimize the size of data objects
- Only include necessary fields in JavaScript objects
- Use efficient selectors for DOM manipulation

### Maintenance:
- Update CMS data regularly (weekly/monthly)
- Test thoroughly after each update
- Keep backup copies of working CSV files
- Document any custom field mappings

## File Structure
```
/
├── cms/                          # Latest CSV exports from Webflow
│   ├── Brik Designs - Services.csv
│   ├── Brik Designs - Service Lines.csv
│   ├── Brik Designs - Customer Stories.csv
│   ├── Brik Designs - Customers.csv
│   ├── Brik Designs - Blog Posts.csv
│   ├── Brik Designs - Templates.csv
│   └── Brik Designs - Prices.csv
├── *.csv                         # Working copies in root directory
├── app.js                        # Primary CMS data binding
├── footer.js                     # Secondary CMS implementation
└── CMS-README.md                 # This guide
```

## Quick Update Checklist

- [ ] Export latest CSV files from Webflow CMS
- [ ] Place CSV files in `/cms` folder
- [ ] Copy CSV files to root directory (`cp cms/*.csv .`)
- [ ] Update JavaScript data objects in `app.js` and `footer.js`
- [ ] Test mega navigation functionality
- [ ] Verify all CMS-driven pages work correctly
- [ ] Commit changes to Git
- [ ] Deploy updates to live site

## Support

For questions about CMS data management:
1. Check this README first
2. Review browser console for error messages
3. Compare working data structure with new CSV exports
4. Test changes in local development before deploying

---

*Last updated: [Current Date]*
*For the Impressionz project reference, this system provides similar structured CMS management with clear documentation and update procedures.*

