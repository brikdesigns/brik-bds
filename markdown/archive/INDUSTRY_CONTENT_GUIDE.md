# Industry Content Management System

## Overview

This system allows you to dynamically update your website content based on industry selection using data from your Webflow CMS. When users select an industry from the dropdown, the content (text, images, services) updates automatically to reflect industry-specific information.

## How It Works

### 1. CMS Data Structure

Your CMS data is stored in `Brik Web Templates - Home Pages.csv` with the following structure:

```csv
Name,Slug,Collection ID,Locale ID,Item ID,Archived,Draft,Created On,Updated On,Published On,Industry,Hero Title,Hero Description,image 1 - location,image 2 - location,image 3 - location,image 4 - person,image 5 - person,image 6 - person
```

### 2. Auto-Generated JavaScript Data

The system automatically parses your CMS CSV and generates `js/industry-data.js` with structured data:

```javascript
const industryData = {
  "dental": {
    "hero": {
      "title": "Your Smile is Our Priority – Gentle, Expert Dental Care You Can Trust",
      "description": "Lorem ipsum dolor sit amet..."
    },
    "services": [...],
    "images": [...]
  },
  "finance": { ... },
  "real-estate": { ... },
  "small-business": { ... }
};
```

### 3. Dynamic Content Updates

When an industry is selected, the system updates:

- **Hero Section**: Title and description
- **About Section**: Content
- **Services Section**: Service titles, descriptions, and images
- **CTA Section**: Call-to-action content
- **Images**: Throughout the page
- **Industry-specific sections**: Show/hide based on industry

## Implementation Steps

### Step 1: Update Your CMS Data

1. Export your CMS data to CSV format
2. Update the `Brik Web Templates - Home Pages.csv` file
3. Run the parser to regenerate the JavaScript data:

```bash
node scripts/parse-cms-data.js
```

### Step 2: Add Industry Data Script

Include the generated industry data script in your HTML:

```html
<!-- Add this in the <head> section -->
<script src="js/industry-data.js" type="text/javascript"></script>
```

### Step 3: Update Your HTML Structure

Add `data-industry` attributes to elements that should be industry-specific:

```html
<!-- Industry-specific content sections -->
<div data-industry="dental" class="content-wrapper">
  <!-- Dental-specific content -->
</div>

<div data-industry="finance" class="content-wrapper">
  <!-- Finance-specific content -->
</div>

<!-- Images that should update based on industry -->
<img data-industry-image src="..." alt="...">
```

### Step 4: CSS Filtering

The system uses CSS classes to show/hide content:

```css
/* Hide non-matching industry content */
body.filter-dental [data-industry]:not([data-industry="dental"]) {
  display: none !important;
}

body.filter-finance [data-industry]:not([data-industry="finance"]) {
  display: none !important;
}
```

### Step 5: JavaScript Integration

The system automatically handles:

- Industry selection from dropdown
- Content updates
- Image updates
- localStorage persistence
- Custom events for other scripts

## Usage Examples

### Basic Industry Switching

```javascript
// Switch to dental industry
window.switchToIndustry('dental');

// Switch to finance industry
window.switchToIndustry('finance');
```

### Listening to Industry Changes

```javascript
document.addEventListener('industryChanged', function(event) {
  const industry = event.detail.industry;
  const data = event.detail.data;
  
  console.log(`Industry changed to: ${industry}`);
  // Do something with the industry data
});
```

### Webflow Interactions

You can trigger industry changes from Webflow interactions:

1. Add a custom code action
2. Call `window.switchToIndustry('dental')`
3. The content will update automatically

## Customization

### Adding New Industries

1. Add the industry to your CMS
2. Update the CSV file
3. Run the parser script
4. Add CSS filtering rules
5. Update the dropdown HTML

### Adding New Content Types

1. Update the parser script to include new fields
2. Add the content to your CMS
3. Update the `updateIndustryContent()` function in `footer.js`

### Custom Service Names

Currently, services are named "Service 1", "Service 2", etc. To customize:

1. Add service name fields to your CMS
2. Update the parser script
3. Regenerate the data

## File Structure

```
├── Brik Web Templates - Home Pages.csv    # CMS data export
├── scripts/
│   └── parse-cms-data.js                  # CMS parser
├── js/
│   ├── industry-data.js                   # Auto-generated data
│   └── industry-data.json                 # JSON reference
├── footer.js                              # Main functionality
└── index.html                             # Updated with script inclusion
```

## Troubleshooting

### Content Not Updating

1. Check browser console for errors
2. Verify `js/industry-data.js` is loaded
3. Check that industry data exists for the selected industry
4. Verify HTML selectors match your page structure

### Images Not Loading

1. Check image URLs in the CMS data
2. Verify `data-industry-image` attributes on images
3. Check network tab for failed requests

### Industry Dropdown Not Working

1. Verify dropdown ID is `industry-theme-switcher`
2. Check that dropdown links have correct IDs
3. Ensure `footer.js` is loaded after the dropdown HTML

## Best Practices

1. **Keep CMS data updated**: Regularly export and update your CSV
2. **Test all industries**: Verify content updates for each industry
3. **Use semantic HTML**: Add appropriate `data-industry` attributes
4. **Optimize images**: Use appropriate image sizes and formats
5. **Monitor performance**: Check for any performance impact with large datasets

## Future Enhancements

- **Real-time CMS sync**: Connect directly to Webflow CMS API
- **More content types**: Add support for testimonials, team members, etc.
- **Advanced filtering**: Add multiple industry selection
- **Analytics**: Track industry selection patterns
- **A/B testing**: Test different content variations per industry 