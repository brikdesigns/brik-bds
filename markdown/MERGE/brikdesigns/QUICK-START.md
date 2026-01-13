# Quick Start Guide - CMS Updates

## For Users

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
3. ✅ Update local-cms.js with proper bindings
4. ✅ **Add local-cms.js script to ALL HTML pages**
5. ✅ Bind navigation dropdowns (global)
6. ✅ Bind list pages (services.html, stylists.html)
7. ✅ Bind detail pages (detail_*.html)
8. ✅ Test all bindings
9. ✅ Report completion status

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
- `/markdown/cms-update-workflow.md`

**Execute systematically:**
1. Identify all pages (Step 1)
2. Check CMS data (Step 2)
3. Analyze HTML structure (Step 3)
4. Update local-cms.js (Step 4)
5. Test each page type (Step 5)
6. Verify data structure (Step 6)
7. Run tests (Step 7)
8. Update docs (Step 8)

**Use the standard patterns from:**
- Navigation binding pattern
- List page binding pattern
- Detail page binding pattern

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

Testing:
- No JavaScript errors
- All dropdowns populate
- All links work correctly
- No empty states visible

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

**Phase 2: Implementation**
- Updating local-cms.js...
- Adding navigation binding...
- Adding list page bindings...
- Adding detail page bindings...

**Phase 3: Testing**
- Verifying syntax...
- Checking all bindings...
- Testing navigation...

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

## Project-Specific Info

### IMPRESSIONZ Project

**Collections:**
- Services (6 items)
- Service Offerings (18 items)
- Stylists (6 items)

**Pages Requiring Binding:**
- Navigation (all pages)
- services.html
- detail_services.html
- stylists.html (if exists)
- detail_stylists.html (if exists)

**Key Data Relationships:**
- Services → Service Offerings (one-to-many)
- Services → Stylists (many-to-many)

---

## Success Indicators

You've completed the workflow successfully when:

1. ✅ Navigation dropdowns work on every page
2. ✅ List pages show all collection items
3. ✅ Detail pages load via URL parameters
4. ✅ No "No items found" messages visible
5. ✅ No JavaScript errors in console
6. ✅ All links navigate correctly
7. ✅ No linter errors in local-cms.js
8. ✅ User can navigate full site locally

---

## Files to Reference

| File | Purpose |
|------|---------|
| `cms-update-workflow.md` | Complete step-by-step workflow |
| `local-cms-binding.md` | Technical implementation guide |
| `README.md` | Project overview and commands |
| `local-cms.js` | CMS binding code (edit this file) |

---

## Emergency Debugging

If issues occur:

1. **Navigation dropdowns empty?** → Check if `local-cms.js` is in ALL HTML pages
2. **Check console** - Look for JavaScript errors or "404 local-cms.js"
3. **Verify jQuery** - Make sure it's loaded before local-cms.js
4. **Check selectors** - Ensure they match HTML classes (use `.w-dyn-items`)
5. **Read workflow** - Follow troubleshooting section
6. **Review patterns** - Compare to working examples

**Most common fixes:**
- Add `local-cms.js` to ALL pages (not just CMS pages)
- Wrap code in function to avoid "Illegal return statement" error
- Use correct selector: `.w-dyn-items` not `.layout_1-col`

See `cms-update-workflow.md` Step 4 for correct pattern.

