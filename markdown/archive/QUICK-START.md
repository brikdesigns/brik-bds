# Quick Start Guide - CMS Updates

## For Users

### ⚠️ Initial Setup: Custom Code Files

Before running CMS updates, ensure your local HTML pages reference the custom code files:

**Required Files:**
- `header.css` - Custom CSS (for Webflow Head Code transfer)
- `footer.js` - Custom JavaScript (for Webflow Footer Code transfer)

**Setup Steps:**

1. **Add header.css reference** to all HTML files in the `<head>` section:
   ```html
   <link href="header.css" rel="stylesheet" type="text/css">
   ```
   Place this after the main stylesheets but before the closing `</head>` tag.

2. **Add footer.js reference** to all HTML files before the closing `</body>` tag:
   ```html
   <script src="footer.js" type="text/javascript"></script>
   ```
   Place this after `webflow.js` and `local-cms.js` (if present).

**Why This Matters:**
- These files contain custom code that needs to be tested locally before transferring to Webflow
- Local testing ensures the same code works in both environments
- Easy transfer: Copy `header.css` → Webflow Head Code, `footer.js` → Webflow Footer Code

**Note:** If your HTML files currently have inline `<style>` or `<script>` tags with custom code, you should:
1. Extract that code to `header.css` and `footer.js`
2. Replace inline code with file references
3. This keeps code maintainable and matches the Webflow transfer workflow

---

### Trigger Automated CMS Updates

Simply say one of these commands:

```
"update cms"
"update all cms bindings" 
"bind cms data for all pages"
```

The AI will automatically:
1. ✅ Scan all HTML pages
2. ✅ Identify CMS-bound pages
3. ✅ **Identify cross-collection references** - CMS data may reference data in other CMS databases/collections
4. ✅ Update local-cms.js with proper bindings including relationship lookups
5. ✅ **Add local-cms.js script to ALL HTML pages**
6. ✅ Bind navigation dropdowns (global)
7. ✅ Bind list pages (services.html, stylists.html)
8. ✅ Bind detail pages (detail_*.html) with cross-collection relationships resolved
9. ✅ Test all bindings including related items from other collections
10. ✅ Report completion status

**Note:** The AI will also verify that `header.css` and `footer.js` are properly referenced in all HTML pages for local testing.

### ⚠️ Critical: Script Must Be On All Pages

Navigation dropdowns won't work unless `local-cms.js` is referenced in **every HTML page**, including static pages like About and Contact. The script must load on all pages to populate the global navigation.

### Specific Updates

```
"update cms navigation"          → Updates only nav dropdowns
"update cms services"             → Updates services.html and detail_services.html
"update cms stylists"             → Updates stylists.html and detail_stylists.html
"verify cms"                      → Tests all bindings without changes
```

---

## For AI Assistant

When user says **"update cms"** or similar:

### 1. Immediate Response
```
I'll update the CMS bindings for this project. Following the automated workflow...
```

### 2. Follow This Sequence

**Read the workflow:**
- `markdown/workflows/cms-update-workflow.md`

**Execute systematically:**
1. **Verify custom code files are referenced** - Check that `header.css` and `footer.js` are linked in HTML files
2. Identify all pages (Step 1)
3. Check CMS data (Step 2)
4. **Identify cross-collection references** - CMS data may reference data in other CMS databases/collections
5. Analyze HTML structure (Step 3)
6. Update local-cms.js (Step 4) - Include relationship lookups for cross-collection references
7. Test each page type (Step 5)
8. Verify data structure (Step 6) - Verify cross-collection relationships are resolved
9. Run tests (Step 7)
10. Update docs (Step 8)

**Use the standard patterns from:**
- Navigation binding pattern
- List page binding pattern
- Detail page binding pattern
- Cross-collection reference resolution (see `GLOBAL-WEBFLOW-WORKFLOW.md` Rule 6)

### 3. Testing Commands

```bash
# Check pages
ls -1 *.html

# Find CMS pages
grep -l "w-dyn-list" *.html

# Check for errors
# (use read_lints tool on local-cms.js)
```

### 4. Report Completion

After completing all steps, provide a summary:

```
✅ CMS Binding Complete

Navigation:
- Services dropdown (6 items)
- Stylists dropdown (6 items)

Collection Lists:
- services.html (6 service categories)
- stylists.html (6 team members)

Detail Pages:
- detail_services.html (URL param: ?service=slug)
- detail_stylists.html (URL param: ?stylist=slug)

Cross-Collection Relationships:
- Services → Service Offerings (resolved)
- Services → Stylists (resolved)

Testing:
- No JavaScript errors
- All dropdowns populate
- All links work correctly
- No empty states visible
- Cross-collection references working

Files Updated:
- local-cms.js
- README.md (if needed)

Ready for local testing!
```

---

## Standard Response Template

```markdown
I'll update the CMS bindings following the documented workflow:

**Phase 1: Analysis**
- Scanning HTML pages...
- Identifying CMS collections...
- Analyzing page structure...
- Identifying cross-collection references...

**Phase 2: Implementation**
- Verifying header.css and footer.js references...
- Updating local-cms.js...
- Adding navigation binding...
- Adding list page bindings...
- Adding detail page bindings...
- Resolving cross-collection relationships...

**Phase 3: Testing**
- Verifying syntax...
- Checking all bindings...
- Testing navigation...
- Testing cross-collection references...

**Phase 4: Documentation**
- Updating README...
- Recording changes...

Status: [In Progress / Complete]
```

---

## Common Variations

User might say:
- "update cms"
- "bind cms data"
- "fix cms bindings"
- "populate cms content"
- "update all cms pages"
- "refresh cms data"

All mean the same thing → Follow the automated workflow.

---

## Success Indicators

You've completed the workflow successfully when:

1. ✅ Navigation dropdowns work on every page
2. ✅ List pages show all collection items
3. ✅ Detail pages load via URL parameters
4. ✅ Cross-collection relationships are resolved (e.g., Services show related Service Offerings)
5. ✅ No "No items found" messages visible
6. ✅ No JavaScript errors in console
7. ✅ All links navigate correctly
8. ✅ No linter errors in local-cms.js
9. ✅ User can navigate full site locally
10. ✅ `header.css` and `footer.js` are referenced in all HTML files

---

## Files to Reference

| File | Purpose |
|------|---------|
| `workflows/cms-update-workflow.md` | Complete step-by-step workflow |
| `workflows/local-cms-binding.md` | Technical implementation guide |
| `GLOBAL-WEBFLOW-WORKFLOW.md` | Universal workflow standards (Rule 6: Cross-Collection References) |
| `README.md` | Project overview and commands |
| `local-cms.js` | CMS binding code (edit this file) |
| `header.css` | Custom CSS for local testing & Webflow transfer |
| `footer.js` | Custom JavaScript for local testing & Webflow transfer |

**Custom Code Files:**
- `header.css` → Copy to Webflow Custom Code (Head Code section)
- `footer.js` → Copy to Webflow Custom Code (Footer Code section)
- These files must be referenced in all local HTML files for proper testing

---

## Emergency Debugging

If issues occur:

1. **Navigation dropdowns empty?** → Check if `local-cms.js` is in ALL HTML pages
2. **Check console** - Look for JavaScript errors or "404 local-cms.js"
3. **Verify jQuery** - Make sure it's loaded before local-cms.js
4. **Check selectors** - Ensure they match HTML classes (use `.w-dyn-items`)
5. **Read workflow** - Follow troubleshooting section
6. **Review patterns** - Compare to working examples
7. **Custom code not working?** → Verify `header.css` and `footer.js` are referenced in HTML files
8. **Cross-collection references not working?** → See `GLOBAL-WEBFLOW-WORKFLOW.md` Rule 6

**Most common fixes:**
- Add `local-cms.js` to ALL pages (not just CMS pages)
- Add `header.css` link in `<head>` section of all HTML files
- Add `footer.js` script before closing `</body>` tag in all HTML files
- Wrap code in function to avoid "Illegal return statement" error
- Use correct selector: `.w-dyn-items` not `.layout_1-col`
- Resolve cross-collection references by looking up related items from other collections

See `workflows/cms-update-workflow.md` Step 4 for correct pattern.

---

## Cross-Collection References

**Important:** CMS data may reference data in other CMS databases/collections. When binding data, identify and resolve relationships between collections.

**Example:**
- Service items may reference Service Offerings by slug
- When binding, look up offerings from `offeringsData` collection
- Service items may reference Stylists by slug
- When binding, look up stylists from `stylistsData` collection

**Pattern:**
```javascript
// Example: Service references Stylists and Service Offerings
{
  name: "Hair Services",
  slug: "hair-services",
  stylists: ["joelle", "maddie", "nikki"],  // Slugs from Stylists collection
  offerings: ["cut", "color", "style"]      // Slugs from Offerings collection
}

// When binding, look up the actual items:
const relatedStylists = service.stylists.map(slug => 
  stylistsData.find(s => s.slug === slug)
).filter(Boolean);
```

For complete details, see `markdown/GLOBAL-WEBFLOW-WORKFLOW.md` (Rule 6: Cross-Collection References).

---

**Last Updated:** 2025-01-27  
**Source:** Consolidated from brikdesigns, impressionz, and portfolio MERGE folders  
**Status:** Universal standard for all Webflow projects

