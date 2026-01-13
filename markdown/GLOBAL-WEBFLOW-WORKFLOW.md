# Global Webflow Local Development Workflow

## 📋 Overview

This document establishes a **standardized, global workflow** for all new local Webflow site development. It consolidates best practices from multiple projects (brikdesigns, impressionz, portfolio) to ensure consistency across all future projects.

---

## 🎯 Core Principles

1. **Consistent File Structure** - Every project follows the same directory organization
2. **CMS Testing Workflow** - Standardized approach to local CMS binding
3. **Code Organization** - Clear separation of local-only vs Webflow-transferable code
4. **Documentation Standards** - Comprehensive markdown documentation in `/markdown` folder
5. **Webflow Sync Process** - Systematic approach to syncing updates back to Webflow
6. **Clear Documentation Separation** - `README.md` for project-specific info, `markdown/` for universal standards

**Important:** This document contains **universal workflow standards** applicable to ALL projects. For project-specific information (project overview, goals, CMS collections, audit dates), see the project's `README.md` file.

See `markdown/README-VS-WORKFLOW-GUIDE.md` for clear separation guidelines.

---

## 📁 Standard Project Structure

Every new Webflow project should follow this structure:

```
project-name.webflow/
├── *.html                      # HTML pages
├── local-cms.js                # Local CMS bindings (NEVER transfer to Webflow)
├── header.css                  # Custom CSS for Webflow Head Code
├── footer.js                   # Custom JavaScript for Webflow Footer Code
├── README.md                   # Project overview
│
├── css/                        # Stylesheets
│   ├── *.webflow.css          # Webflow exported CSS
│   ├── normalize.css
│   └── webflow.css
│
├── js/                         # JavaScript files
│   ├── webflow.js
│   └── footer.js              # (legacy - use root footer.js instead)
│
├── fonts/                      # Font files
├── images/                     # Image assets
│
├── cms/                        # CMS data exports from Webflow
│   └── [Project] - [Collection Name].csv
│
├── markdown/                   # Documentation
│   ├── GLOBAL-WEBFLOW-WORKFLOW.md  # Universal workflow standards
│   ├── QUICK-START.md              # Quick reference for CMS updates
│   ├── workflows/                  # CMS & workflow files
│   ├── naming/                     # Naming framework
│   ├── positioning/                # Positioning guides
│   ├── quality-assurance/          # QA & audits
│   ├── resources/                   # Additional guides
│   ├── templates/                  # Project templates
│   └── docs/                       # Documentation guides
│
└── updates/                    # Temporary folder for Webflow exports
    └── [project-name].webflow/
        └── [exported files]
```

---

## 🔄 Core Workflows

### Workflow 1: Initial Project Setup

**When:** Starting a new Webflow project locally

**Steps:**
1. **Export from Webflow**
   - Download site ZIP from Webflow
   - Extract to `updates/[project-name].webflow/`

2. **Sync Files to Root**
   ```bash
   # Copy HTML, CSS, JS, fonts, images from updates/ to root
   # Preserve existing local-only files (local-cms.js, header.css, footer.js)
   ```

3. **Add Local Testing Files**
   - Create `local-cms.js` (start with template)
   - Create `header.css` (for custom styles)
   - Create `footer.js` (for custom JavaScript)
   - Create `README.md` (project overview - use template from `markdown/README-TEMPLATE.md`)

4. **Add Script References**
   - Add `local-cms.js` reference to ALL HTML pages (after jQuery, before closing `</body>`)
   - Add `header.css` link in `<head>` section of all HTML pages
   - Add `footer.js` script before closing `</body>` tag in all HTML pages

5. **Create Documentation**
   - Copy `README.md` template from `markdown/README-TEMPLATE.md`
   - Update with project-specific information
   - Include references to annual code audits
   - Copy standard markdown workflow files from template
   - Document CMS collections and page structure

**Important:** `README.md` should be **project-specific** (overview, goals, CMS collections, audit dates) while workflow standards are in `markdown/GLOBAL-WEBFLOW-WORKFLOW.md`.

---

### Workflow 2: CMS Binding Update

**When:** User says "update cms" or similar commands

**Automated Process:**
1. ✅ Scan all HTML pages
2. ✅ Identify CMS-bound pages
3. ✅ Check CMS data in `/cms` folder
4. ✅ **Identify cross-collection references** - CMS data may reference data in other CMS databases/collections
5. ✅ Update `local-cms.js` with proper bindings including relationship lookups
6. ✅ **Ensure `local-cms.js` script reference is in ALL HTML pages**
7. ✅ Bind navigation dropdowns (global - runs on all pages)
8. ✅ Bind list pages (e.g., `services.html`)
9. ✅ Bind detail pages (e.g., `detail_services.html`)
10. ✅ Test all bindings including cross-collection relationships
11. ✅ Report completion status

**Critical Requirements:**
- `local-cms.js` MUST be in ALL HTML pages (including static pages like `about.html`, `contact.html`)
- Navigation binding runs globally and requires script on every page
- Use `.w-dyn-items` selector, not `.layout_1-col`
- Wrap all binding code in functions to avoid "Illegal return statement" errors
- **Understand cross-collection relationships** - CMS data often references other collections (e.g., Services → Stylists, Services → Service Offerings)

**Standard Patterns:**
- See `markdown/workflows/cms-update-workflow.md` for complete step-by-step guide
- See `markdown/workflows/local-cms-binding.md` for technical implementation patterns

---

### Workflow 3: Webflow Updates Sync

**When:** Syncing latest Webflow changes to local project

**Steps:**
1. **Download Latest Export**
   - Export site from Webflow as ZIP
   - Extract to `updates/[project-name].webflow/`

2. **Copy Webflow Files**
   ```bash
   # Copy all HTML, CSS, JS, images, fonts, videos from updates/ to root
   # Overwrite existing files
   ```

3. **Restore Local Files**
   - **CRITICAL:** Immediately add `local-cms.js` script reference to ALL HTML pages
   - Verify `header.css` and `footer.js` references are still present
   - If missing, add them back

4. **Add Script Reference Command:**
   ```bash
   for file in *.html; do 
     sed -i '' 's|<script src="js/webflow.js" type="text/javascript"></script>|<script src="js/webflow.js" type="text/javascript"></script>\n  <script src="local-cms.js"></script>|' "$file"
   done
   ```

5. **Test Everything**
   - Verify CMS bindings still work
   - Check navigation dropdowns
   - Test all pages load correctly

---

### Workflow 4: Custom Code Transfer to Webflow

**When:** Ready to deploy custom code to Webflow

**Files to Transfer:**
- ✅ `header.css` → Webflow Settings → Custom Code → Head Code
  - Wrap in `<style>` tags
- ✅ `footer.js` → Webflow Settings → Custom Code → Footer Code
  - Wrap in `<script>` tags
- ❌ `local-cms.js` → **NEVER transfer** (local testing only)

**Process:**
1. Open `header.css` and copy entire contents
2. In Webflow: Settings → Custom Code → Head Code
3. Wrap in `<style>` tags if not already present
4. Paste and save
5. Repeat for `footer.js` in Footer Code section
6. Publish site to test

**Documentation:**
- See `markdown/workflows/WEBFLOW-CONDITIONS-FILTERING.md` for conditions and filtering

---

## 📝 File Purpose Reference

| File | Purpose | Transfer to Webflow? | Location |
|------|---------|---------------------|----------|
| `local-cms.js` | Simulate CMS data locally | ❌ **NO** - Local only | Root |
| `header.css` | Custom CSS for head | ✅ **YES** - Copy to Head Code | Root |
| `footer.js` | Custom JavaScript | ✅ **YES** - Copy to Footer Code | Root |
| `README.md` | Project overview and reference guide | ❌ **NO** - Local reference only | Root |
| CMS CSV files | CMS data exports | ❌ Reference only | `/cms` folder |
| Documentation | Project guides | ❌ Local reference | `/markdown` folder |

**README.md Purpose:**
- **Project-specific information** (project overview, goals, CMS collections)
- **References to annual code audits** (audit dates, schedules)
- **Quick links to workflow documentation** (references to `markdown/` files)
- **NOT workflow steps** (those belong in `markdown/GLOBAL-WEBFLOW-WORKFLOW.md`)

---

## 🔧 Standard File Patterns

### local-cms.js Structure

```javascript
// ===== LOCAL CMS DATA BINDING =====
// This file is for local testing only
// DO NOT transfer this to Webflow

console.log('Local CMS script loaded!');

// ===== GLOBAL NAVIGATION BINDING =====
// Runs on all pages
(function() {
  if (typeof $ === 'undefined') {
    window.addEventListener('load', initNavigationBinding);
  } else {
    $(document).ready(initNavigationBinding);
  }
  
  function initNavigationBinding() {
    // Navigation binding logic
  }
})();

// ===== PAGE-SPECIFIC BINDINGS =====
if (window.location.pathname.includes('page-name.html')) {
  if (typeof $ === 'undefined') {
    window.addEventListener('load', initPageBinding);
  } else {
    $(document).ready(initPageBinding);
  }
  
  function initPageBinding() {
    // Page binding logic - MUST be wrapped in function
    
    // IMPORTANT: CMS data may reference data in other CMS collections
    // Define all collections needed for this page
    const servicesData = [/* ... */];
    const stylistsData = [/* ... */];
    const offeringsData = [/* ... */];
    
    // When binding data, resolve cross-collection references
    const currentItem = servicesData.find(s => s.slug === slug);
    if (currentItem.stylists) {
      // Look up related items from other collections
      currentItem.stylists.forEach(stylistSlug => {
        const stylist = stylistsData.find(s => s.slug === stylistSlug);
        // Render related item
      });
    }
  }
}
```

### CMS Data Structure with Cross-Collection References

**Important:** CMS data may reference data in other CMS databases/collections. Understanding these relationships is crucial when binding data.

```javascript
// Example: Service collection item
{
  // Required fields
  name: "Hair Services",
  slug: "hair-services",
  
  // Cross-collection references (reference other CMS collections by slug)
  stylists: ["stylist-alyssa", "stylist-kelly"], // References Stylist collection
  serviceOfferings: ["offering-1", "offering-2"], // References Offerings collection
  category: "services", // References Category collection
  
  // Standard fields
  description: "Full service description",
  image: "https://cdn.../image.jpg"
}

// When binding, resolve relationships:
function bindServiceDetail(serviceSlug) {
  const service = servicesData.find(s => s.slug === serviceSlug);
  
  // Resolve Stylist references
  if (service.stylists && service.stylists.length > 0) {
    const relatedStylists = service.stylists.map(stylistSlug => 
      stylistsData.find(s => s.slug === stylistSlug)
    ).filter(Boolean);
    // Render related stylists
  }
  
  // Resolve Service Offerings references
  if (service.serviceOfferings && service.serviceOfferings.length > 0) {
    const relatedOfferings = service.serviceOfferings.map(offeringSlug =>
      offeringsData.find(o => o.slug === offeringSlug)
    ).filter(Boolean);
    // Render related offerings
  }
}
```

**Common Relationship Types:**
- **Reference Field:** Single item from another collection (`stylist: "stylist-slug"`)
- **Multi-Reference Field:** Multiple items from another collection (`stylists: ["slug1", "slug2"]`)
- **Category/Tag Relationships:** One-to-many relationships (`category: "category-slug"`)

### header.css Structure

```css
/* ============================================= */
/*           PROJECT NAME - CUSTOM CSS           */
/*     Copy to Webflow: Settings > Custom Code  */
/*              > Head Code                      */
/* ============================================= */

/* Module 1: Navigation Fixes */
/* Module 2: Component Styles */
/* Module 3: Theme Support */
```

### footer.js Structure

```javascript
// =============================================
//       PROJECT NAME - CUSTOM JAVASCRIPT
//  Copy to Webflow: Settings > Custom Code
//              > Footer Code
// =============================================

// Module 1: Theme Switcher
// Module 2: Component Interactions
// Module 3: Utility Functions
```

---

## ✅ Standard Documentation Files

**Template Files (Copy to Root):**
- `markdown/templates/README-TEMPLATE.md` → `README.md` (project-specific overview)
  - Copy to root and customize with project-specific information
  - Include audit schedule references
  - Link to workflow documentation (don't duplicate workflow steps)

**Standard Documentation Files:**

Every project should have these markdown files in `/markdown`:

**Core Files (Root):**
1. **QUICK-START.md** - Quick reference for common tasks
   - CMS update commands
   - Standard response templates
   - Emergency debugging

**Workflow Files (`workflows/`):**
2. **workflows/cms-update-workflow.md** - Complete CMS binding workflow
   - Step-by-step process (8 steps)
   - Standard patterns
   - Testing checklist

3. **workflows/local-cms-binding.md** - Technical implementation guide
   - Code patterns
   - Common errors and solutions
   - Function wrapping requirements

4. **workflows/CMS-DATA-MANAGEMENT.md** - CMS data management guide
   - CSV export/import process
   - Data structure standards
   - Cross-collection relationships

5. **workflows/CMS-BINDING-TROUBLESHOOTING.md** - CMS binding troubleshooting
   - Common challenges and solutions
   - Selector mismatch prevention
   - Automated solutions

6. **workflows/WEBFLOW-CONDITIONS-FILTERING.md** - Conditions and filtering guide
   - Webflow conditions handling
   - Filtering system setup
   - Sorting implementation

**Naming Framework (`naming/`):**
7. **naming/naming-framework.md** - Naming conventions
   - Class naming standards
   - Structure patterns
   - Best practices

8. **naming/naming-quick-reference.md** - One-page naming cheat sheet

**Positioning (`positioning/`):**
9. **positioning/positioning-audit.md** - CSS positioning audit
   - Display types analysis
   - Positioning strategies review
   - Z-index management

10. **positioning/positioning-quick-reference.md** - One-page positioning cheat sheet

**Quality Assurance (`quality-assurance/`):**
11. **quality-assurance/qa-checklist.md** - Quality assurance
    - Pre-deployment checks (101-item comprehensive checklist)
    - Testing procedures
    - QA workflow and process

12. **quality-assurance/QA-AUDIT-REPORT-TEMPLATE.md** - QA audit report template

13. **quality-assurance/AUDIT-README.md** - Framework audit overview
    - Audit process documentation
    - Progress tracking
    - Audit findings summary

14. **quality-assurance/framework-audit.md** - Complete framework audit report
    - Detailed code analysis
    - Naming consistency checks
    - Semantic HTML verification

15. **quality-assurance/image-audit-summary.md** - Image implementation audit
    - Image optimization review
    - Responsive image implementation
    - Aspect ratio and object-fit patterns

**Resources (`resources/`):**
16. **resources/responsive-aspect-ratio-guide.md** - Image aspect ratio best practices

17. **resources/GITHUB-SETUP.md** - GitHub backup setup guide

18. **resources/MODULAR-CODE-ARCHITECTURE.md** - Advanced code organization (optional)

19. **resources/FIGMA_SETUP.md** - Figma integration guide

**Templates (`templates/`):**
20. **templates/README-TEMPLATE.md** - Project README template

**Documentation (`docs/`):**
21. **docs/README-VS-WORKFLOW-GUIDE.md** - Clear separation guidelines between project-specific README.md and universal workflow docs

**Key Principle:** 
- `README.md` = Project-specific information (what this project is, audit dates, CMS collections)
- `markdown/GLOBAL-WEBFLOW-WORKFLOW.md` = Universal workflow standards (how to do things, applicable to all projects)

Avoid redundancy: Link to workflow docs from README.md instead of duplicating workflow steps.

---

## 📝 README.md for Each Project

Every new project should have a **project-specific `README.md`** in the root directory.

**Purpose:** Project overview, goals, CMS collections, audit references (NOT workflow steps)

**Template:** `markdown/templates/README-TEMPLATE.md`

**Key Sections:**
- Project overview and goals
- Live site URL
- Project-specific file structure
- CMS collections for THIS project
- **Code audit references** (audit dates, schedules)
- Quick links to workflow documentation
- Project notes (decisions, issues, enhancements)

**Important Distinction:**
- **README.md** = Project-specific information (what this project is, audit dates, CMS collections)
- **markdown/GLOBAL-WEBFLOW-WORKFLOW.md** = Universal workflow standards (how to do things, applicable to all projects)

See `markdown/docs/README-VS-WORKFLOW-GUIDE.md` for complete separation guidelines.

---

## 🔍 Quality Assurance & Audit Workflows

### QA Process Overview

Every project should have a **comprehensive QA process** before deployment:

1. **Pre-Deployment QA** - Run full QA checklist (101 items)
2. **Framework Audit** - Code structure and naming consistency audit
3. **Image Audit** - Image implementation and optimization review
4. **Positioning Audit** - CSS positioning and display type review
5. **Accessibility Audit** - WCAG 2.1 AA compliance check

### QA Checklist Workflow

**File:** `markdown/quality-assurance/qa-checklist.md`

**When to Run:**
- Before initial client review
- After major changes
- Before final deployment
- Quarterly audits for live sites

**Process:**
1. **Developer Self-QA** - Quick check after development
2. **Peer Review QA** - Full checklist by another team member
3. **Fix Issues** - Address critical and high-priority items
4. **Final QA Review** - Verify all fixes
5. **Client Review** - Present for approval
6. **Deploy** - After client approval

**QA Checklist Categories (101 items total):**
- **Naming Standards** (10 items) - 🔴 Critical
- **Semantic HTML** (12 items) - 🔴 Critical
- **Accessibility** (15 items) - 🔴 Critical
- **Performance** (8 items) - 🟡 High
- **SEO** (10 items) - 🟡 High
- **Functionality** (12 items) - 🔴 Critical
- **Content** (6 items) - 🟡 High
- **Cross-Browser** (5 items) - 🟡 High
- **Mobile Responsive** (8 items) - 🔴 Critical
- **Forms** (7 items) - 🟡 High
- **Final Checks** (8 items) - 🔴 Critical

**QA Tools:**
- **Browser Extensions:** axe DevTools, WAVE, Lighthouse
- **Online Tools:** PageSpeed Insights, WebAIM Contrast Checker, Schema Validator
- **Testing Services:** BrowserStack, LambdaTest

### Framework Audit Workflow

**File:** `markdown/quality-assurance/AUDIT-README.md`

**Purpose:** Review code structure and naming consistency against framework standards

**Audit Process:**
1. **Code Analysis** - Review HTML structure and class naming
2. **Documentation Comparison** - Compare actual code to framework docs
3. **Find Inconsistencies** - Identify deviations from standards
4. **Document Findings** - Create audit report with scores
5. **Prioritize Fixes** - Categorize issues (Critical, High, Low)
6. **Create Action Plan** - Phased implementation timeline

**Audit Categories:**
- **Naming Standards** - Underscore vs hyphen patterns
- **Semantic HTML** - Proper use of `<section>`, `<main>`, etc.
- **Layout Consistency** - Layout naming and structure
- **Container Naming** - Container and wrapper patterns
- **Framework Compliance** - Overall framework score (target: 9/10)

**Audit Files Structure:**
- `AUDIT-README.md` - Overview and document guide
- `audit-summary.md` - Executive summary with scores
- `framework-audit.md` - Complete detailed analysis
- `framework-comparison.md` - Side-by-side docs vs reality
- `naming-fixes.md` - Step-by-step fix instructions
- `naming-framework.md` - Naming standards reference
- `naming-quick-reference.md` - One-page cheat sheet

### Image Audit Workflow

**File:** `markdown/quality-assurance/image-audit-summary.md`

**Purpose:** Review image implementation, optimization, and responsive patterns

**Audit Areas:**
- **Image Optimization** - Compression, formats (WebP, AVIF)
- **Responsive Images** - `srcset`, `sizes` attributes
- **Aspect Ratios** - `aspect-ratio` CSS property usage
- **Object Fit** - `object-fit` on images (not wrappers)
- **Lazy Loading** - Below-fold image lazy loading
- **Alt Text** - Accessibility and SEO

**Common Issues Found:**
- `object-fit` applied to wrapper `<div>` instead of `<img>`
- Missing `position: relative` on image frame wrappers
- Inconsistent aspect ratio implementations
- Missing responsive image attributes

### Positioning Audit Workflow

**File:** `markdown/positioning/positioning-audit.md`

**Purpose:** Review CSS positioning, display types, and z-index management

**Audit Areas:**
- **Display Types** - Flexbox, Grid, Block usage
- **Positioning Types** - Static, Relative, Absolute, Fixed, Sticky
- **Z-Index Management** - Layering strategy
- **Complex Patterns** - Card flips, dropdowns, overlays

**Audit Files:**
- `positioning-audit.md` - Complete positioning analysis
- `positioning-audit-summary.md` - Summary findings
- `positioning-examples.md` - Real code examples
- `positioning-quick-reference.md` - One-page cheat sheet

### QA Audit Report Template

**File:** `markdown/quality-assurance/QA-AUDIT-REPORT-TEMPLATE.md`

**Purpose:** Document QA audit findings in a structured format

**Report Structure:**
- **Executive Summary** - Overall status and score
- **Detailed Findings** - Findings by category
- **Critical Issues** - Must-fix before launch
- **High Priority Issues** - Should-fix before launch
- **Low Priority Issues** - Can-fix post-launch
- **Action Plan** - Phased approach to fixes
- **Files Requiring Updates** - Specific file list
- **Testing Checklist** - Manual and automated testing required

**QA Summary Report Template:**
```markdown
PROJECT: [Project Name]
DATE: [Date]
QA PERFORMED BY: [Name]
VERSION: [Version/Commit]

RESULTS:
✅ Naming Standards: [10/10] Pass
✅ Semantic HTML: [12/12] Pass
✅ Accessibility: [15/15] Pass - 0 violations
✅ Performance: [8/8] Pass - Desktop: 95, Mobile: 82
✅ SEO: [10/10] Pass
✅ Functionality: [12/12] Pass
✅ Content: [6/6] Pass
✅ Cross-Browser: [5/5] Pass
✅ Mobile Responsive: [8/8] Pass
✅ Forms: [7/7] Pass
✅ Final Checks: [8/8] Pass

TOTAL: [101/101] ✅ READY FOR DEPLOYMENT

ISSUES FOUND: [List any issues]
NOTES: [Additional notes]
```

### Automated Audit Scripts (Future Enhancement)

**Recommended Automation:**
- **Naming Audit Script** - Check class naming against framework
- **Semantic HTML Check** - Verify proper HTML element usage
- **Accessibility Scan** - Run automated a11y tools
- **Performance Audit** - Lighthouse CI integration
- **Image Optimization Check** - Verify image formats and sizes

**Note:** Currently, audits are manual processes documented in markdown. Consider automating common checks in the future.

### Audit Schedule

**When to Run Audits:**
- **Framework Audit** - Quarterly or after major refactoring
- **Image Audit** - After adding new images or responsive changes
- **Positioning Audit** - After implementing new complex layouts
- **QA Audit** - Before every deployment (full checklist)

**Audit Workflow:**
```
Code Changes Made
    ↓
Developer Self-Review
    ↓
Run Relevant Audits (QA, Framework, etc.)
    ↓
Document Findings
    ↓
Prioritize Fixes
    ↓
Apply Fixes
    ↓
Re-run Audits to Verify
    ↓
Ready for Deployment
```

---

## 🚨 Critical Rules

### Rule 1: local-cms.js Must Be On ALL Pages
**Why:** Navigation binding is global and runs on every page  
**Fix:** Add script reference to ALL HTML pages, including static pages  
**Command:** Use sed command after syncing Webflow updates

### Rule 2: Always Wrap Binding Code in Functions
**Why:** Prevents "Illegal return statement" errors  
**Pattern:** Use `function initBinding() { ... }` wrapper

### Rule 3: Use Correct Selectors
**Why:** Webflow CMS uses specific class names  
**Correct:** `.w-dyn-items` (container for dynamic items)  
**Incorrect:** `.layout_1-col` or other layout classes

### Rule 4: Never Transfer local-cms.js to Webflow
**Why:** It's only for local testing; Webflow has its own CMS  
**Action:** Only transfer `header.css` and `footer.js`

### Rule 5: Template Literals for Long Text
**Why:** Prevents JavaScript syntax errors with quotes/apostrophes  
**Pattern:** Use backticks for strings containing quotes: `` `She said, "Hello!"` ``

### Rule 6: Understand Cross-Collection References
**Why:** CMS data often references data in other CMS databases/collections  
**Important:** When binding data, identify and resolve relationships between collections  
**Pattern:** Use slug arrays to reference items in other collections, then look them up:
```javascript
// Example: Service references Stylists and Service Offerings
{
  name: "Hair Services",
  slug: "hair-services",
  stylists: ["stylist-1", "stylist-2"], // References Stylist collection
  serviceOfferings: ["offering-1", "offering-2"] // References Offerings collection
}

// Then look up related items:
service.stylists.forEach(stylistSlug => {
  const stylist = stylistsData.find(s => s.slug === stylistSlug);
  // Render stylist information
});
```
**Common Relationships:**
- **One-to-Many:** Service → Service Offerings
- **Many-to-Many:** Services ↔ Stylists
- **References:** Items that link to other collection items via slug

---

## 🎯 Success Indicators

You've successfully followed the workflow when:

- ✅ Navigation dropdowns work on every page
- ✅ All CMS list pages show data correctly
- ✅ All detail pages populate via URL parameters
- ✅ No "No items found" messages visible (when data exists)
- ✅ No JavaScript errors in browser console
- ✅ `local-cms.js` referenced in ALL HTML pages
- ✅ `header.css` and `footer.js` referenced in ALL HTML pages
- ✅ Documentation is up to date
- ✅ Ready for local testing

---

## 📚 Quick Command Reference

### CMS Updates
```
"update cms"                    → Full CMS binding update
"update cms navigation"         → Navigation only
"update cms [collection]"       → Specific collection
"verify cms"                    → Test without changes
```

### File Management
```bash
# List HTML pages
ls -1 *.html

# Find CMS-bound pages
grep -l "w-dyn-list" *.html

# Check for script references
grep -l "local-cms.js" *.html

# Count CMS exports
ls -1 cms/*.csv
```

### Testing
```bash
# Open pages in browser
open index.html
open services.html
open "detail_services.html?service=slug"
```

---

## 🔍 Workflow Variations Across Projects

### Impressionz Project (Most Complete)
- ✅ Has `WEBFLOW-TRANSFER-GUIDE.md`
- ✅ Has `modular-code-architecture.md`
- ✅ Mentions `header.css` and `footer.js` in QUICK-START
- ✅ Most comprehensive documentation

**Takeaway:** Use impressionz as the template for new projects

### Brikdesigns & Portfolio
- ✅ Core workflow documentation
- ✅ Standard CMS binding patterns
- ⚠️ Missing some advanced guides

**Takeaway:** Add impressionz extras to these if needed

---

## 🚀 Getting Started with New Project

### Step 1: Clone Template
```bash
# Copy standard markdown files from template project
# Copy project structure
# Initialize git repository
```

### Step 2: Export from Webflow
```bash
# Download site ZIP
# Extract to updates/[project-name].webflow/
```

### Step 3: Sync to Local
```bash
# Run sync command (automated via AI assistant)
# This copies HTML, CSS, JS, fonts, images to root
```

### Step 4: Add Local Files
```bash
# Create local-cms.js
# Create header.css
# Create footer.js
# Create README.md (from markdown/README-TEMPLATE.md)
# Add script references to all HTML files
```

### Step 5: Document
```bash
# Copy README.md template to root and customize
# Copy markdown workflow templates
# Update project-specific information in README.md
# Document CMS collections in README.md
# Update audit schedule references in README.md
```

**Key Distinction:**
- **README.md** = Project-specific overview, goals, CMS info, audit references
- **markdown/GLOBAL-WEBFLOW-WORKFLOW.md** = Universal workflow standards for all projects

### Step 6: Test
```bash
# Update CMS bindings
# Test all pages
# Verify navigation works
```

---

## 📋 Pre-Deployment Checklist

Before deploying custom code to Webflow:

- [ ] `header.css` is finalized and tested locally
- [ ] `footer.js` is finalized and tested locally
- [ ] No `local-cms.js` code is accidentally included
- [ ] All custom code wrapped in appropriate tags (`<style>`, `<script>`)
- [ ] Code works in local testing environment
- [ ] Documentation updated if needed
- [ ] Backup of current Webflow custom code (if updating existing)

---

## 🔄 Maintenance Schedule

### Weekly
- [ ] Spot-check new sections for CMS binding needs
- [ ] Verify no new generic class names introduced

### Before Each Webflow Sync
- [ ] Backup local changes
- [ ] Document any custom modifications
- [ ] Prepare to restore `local-cms.js` references after sync

### After Each Webflow Sync
- [ ] Immediately add `local-cms.js` to ALL HTML pages
- [ ] Verify `header.css` and `footer.js` references
- [ ] Test all CMS bindings still work
- [ ] Update documentation if structure changed

### Quarterly
- [ ] Review workflow effectiveness
- [ ] Update documentation based on learnings
- [ ] Audit code quality and consistency

---

## 📞 Support Resources

### During Development
- **CMS questions?** → `markdown/workflows/cms-update-workflow.md`
- **CMS data management?** → `markdown/workflows/CMS-DATA-MANAGEMENT.md`
- **CMS binding issues?** → `markdown/workflows/CMS-BINDING-TROUBLESHOOTING.md`
- **Conditions/filtering?** → `markdown/workflows/WEBFLOW-CONDITIONS-FILTERING.md`
- **Naming questions?** → `markdown/naming/naming-framework.md`
- **Technical patterns?** → `markdown/workflows/local-cms-binding.md`
- **Quick reference?** → `markdown/QUICK-START.md`
- **Workflow standards?** → `markdown/GLOBAL-WEBFLOW-WORKFLOW.md`

### Troubleshooting
- **Navigation not working?** → Check if `local-cms.js` is in ALL pages
- **JavaScript errors?** → Verify code is wrapped in functions
- **CMS bindings not showing?** → Check selectors match HTML classes
- **Empty states visible?** → Hide with `.hide()` after binding

---

## 🎓 Key Learnings from Project Analysis

### What Works Well Across All Projects
1. ✅ Standardized CMS binding workflow
2. ✅ Comprehensive documentation structure
3. ✅ Clear separation of local vs Webflow code
4. ✅ Function-wrapped binding patterns
5. ✅ Navigation binding approach

### What Needs Standardization
1. ⚠️ `header.css` and `footer.js` setup (only impressionz fully documents)
2. ⚠️ Webflow sync process variations
3. ⚠️ Some projects missing advanced guides

### Best Practices to Adopt
1. ✅ Use impressionz project as template for new projects
2. ✅ Always document `header.css` and `footer.js` setup
3. ✅ Include `WEBFLOW-TRANSFER-GUIDE.md` in all projects
4. ✅ Maintain comprehensive audit documentation

---

## 📊 Workflow Comparison Summary

| Feature | Brikdesigns | Impressionz | Portfolio | Standard |
|---------|------------|-------------|-----------|----------|
| Core CMS Workflow | ✅ | ✅ | ✅ | ✅ |
| QUICK-START.md | ✅ | ✅ | ✅ | ✅ |
| cms-update-workflow.md | ✅ | ✅ | ✅ | ✅ |
| local-cms-binding.md | ✅ | ✅ | ✅ | ✅ |
| header.css/footer.js docs | ⚠️ | ✅ | ⚠️ | ✅ |
| WEBFLOW-TRANSFER-GUIDE | ❌ | ✅ | ❌ | ✅ |
| modular-code-architecture | ❌ | ✅ | ❌ | Optional |
| Framework Audit | ✅ | ✅ | ✅ | Optional |

**Standard:** What every new project should include

---

## 🎯 Next Steps

### For Current Projects
1. Review this global workflow
2. Add any missing documentation files
3. Ensure `header.css` and `footer.js` setup is documented
4. Standardize Webflow sync process

### For New Projects
1. Use this document as template
2. Copy standard markdown files from impressionz project
3. Follow workflow step-by-step
4. Customize project-specific documentation
5. Set up QA checklist and audit processes

### For Workflow Improvement
1. Document any project-specific variations
2. Run QA audits before each deployment
3. Run framework audits quarterly or after major changes
4. Update this document with new learnings
5. Share improvements across all projects

### For Quality Assurance
1. Run full QA checklist (101 items) before deployment
2. Document QA findings in `quality-assurance/QA-AUDIT-REPORT-TEMPLATE.md` format
3. Run framework audit quarterly or after major refactoring
4. Run image audit after image implementation changes
5. Run positioning audit after complex layout changes

---

**Last Updated:** 2025-01-27  
**Maintained By:** Development Team  
**Review Schedule:** Quarterly

