# [Project Name] Webflow Project

## 📋 Project Overview

[Brief description of the project - what it is, who it's for, main purpose]

**Live Site:** [https://project-name.webflow.io/](https://project-name.webflow.io/)

**Status:** [Development / Production / Maintenance]

---

## 🎯 Project Goals

- [Primary goal 1]
- [Primary goal 2]
- [Primary goal 3]

---

## 📁 Project Structure

```
project-name.webflow/
├── *.html                      # HTML pages
├── local-cms.js                # Local CMS bindings (NEVER transfer to Webflow)
├── header.css                  # Custom CSS for Webflow Head Code
├── footer.js                   # Custom JavaScript for Webflow Footer Code
├── README.md                   # This file - project overview
│
├── css/                        # Stylesheets
│   ├── *.webflow.css          # Webflow exported CSS
│   ├── normalize.css
│   └── webflow.css
│
├── js/                         # JavaScript files
│   └── webflow.js
│
├── fonts/                      # Font files
├── images/                     # Image assets
│
├── cms/                        # CMS data exports from Webflow
│   └── [Project] - [Collection Name].csv
│
├── markdown/                   # Documentation
│   ├── QUICK-START.md         # Quick reference for CMS updates
│   ├── cms-update-workflow.md # Complete CMS binding workflow
│   └── [other workflow docs]
│
└── updates/                    # Temporary folder for Webflow exports
    └── [project-name].webflow/
        └── [exported files]
```

---

## 🔧 Local Development Files

### Essential Files (Create for New Projects)

These files are required for local development and testing:

- **`local-cms.js`** - Local CMS data binding for testing (NEVER transfer to Webflow)
- **`header.css`** - Custom CSS for Webflow Head Code (transfer to Webflow)
- **`footer.js`** - Custom JavaScript for Webflow Footer Code (transfer to Webflow)
- **`README.md`** - This file - project overview and reference guide

See `markdown/GLOBAL-WEBFLOW-WORKFLOW.md` for complete workflow standards.

---

## 📚 Key Documentation

### Workflow Documentation

For detailed workflow processes and universal standards, see:

- **`markdown/GLOBAL-WEBFLOW-WORKFLOW.md`** ⭐ **Start here** - Universal workflow standards for all projects
- **`markdown/QUICK-START.md`** - Quick reference for CMS updates
- **`markdown/cms-update-workflow.md`** - Complete CMS binding workflow (8-step process)
- **`markdown/local-cms-binding.md`** - Technical implementation guide for CMS bindings

### Quality Assurance & Audits

For code audits and quality assurance processes:

- **`markdown/qa-checklist.md`** - Pre-deployment QA checklist (101 items)
- **`markdown/AUDIT-README.md`** - Framework audit overview and process
- **`markdown/framework-audit.md`** - Complete framework audit report
- **`markdown/image-audit-summary.md`** - Image implementation audit
- **`markdown/positioning-audit.md`** - CSS positioning audit

### Quick Reference Guides

For quick reference on specific topics:

- **`markdown/naming-framework.md`** - Naming conventions and standards
- **`markdown/naming-quick-reference.md`** - One-page naming cheat sheet
- **`markdown/positioning-quick-reference.md`** - One-page positioning cheat sheet
- **`markdown/responsive-aspect-ratio-guide.md`** - Image aspect ratio best practices

### Documentation Organization

- **`markdown/README-VS-WORKFLOW-GUIDE.md`** - Clear separation between project-specific README.md and workflow docs
- **`markdown/DOCUMENTATION-STRUCTURE-SUMMARY.md`** - Documentation structure overview

### Project-Specific Documentation

Project-specific guides are in the `markdown/` folder:

- [List any project-specific markdown files]

---

## 🔍 Code Audits & Quality Assurance

### Annual Code Audits

This project follows annual code audit standards:

1. **Framework Audit** - Code structure and naming consistency
   - See `markdown/AUDIT-README.md` for audit process
   - See `markdown/framework-audit.md` for detailed analysis
   - Run quarterly or after major refactoring

2. **QA Audit** - Pre-deployment quality assurance
   - See `markdown/qa-checklist.md` for 101-item checklist
   - Run before every deployment
   - Document findings in `markdown/QA-AUDIT-REPORT.md` format

3. **Image Audit** - Image implementation and optimization
   - See `markdown/image-audit-summary.md` for audit process
   - Run after image implementation changes

4. **Positioning Audit** - CSS positioning and display types
   - See `markdown/positioning-audit.md` for audit process
   - Run after complex layout changes

**Last Audit Date:** [Date]
**Next Scheduled Audit:** [Date]

---

## 🚀 Quick Start

### For Local Development

**Complete setup instructions:** See `markdown/GLOBAL-WEBFLOW-WORKFLOW.md` (Workflow 1: Initial Project Setup)

**Quick Overview:**
1. Export from Webflow → Extract to `updates/[project-name].webflow/`
2. Sync files to root → Copy HTML, CSS, JS, fonts, images
3. Create local files → `local-cms.js`, `header.css`, `footer.js`, `README.md`
4. Add script references → Add to ALL HTML pages
5. Test locally → Verify CMS bindings and navigation work

**Detailed Steps:** See `markdown/GLOBAL-WEBFLOW-WORKFLOW.md` for complete workflow.

### For CMS Updates

Simply say:
```
"update cms"
```

The AI assistant will automatically:
- Scan all HTML pages
- Identify CMS-bound pages
- Update `local-cms.js` with proper bindings
- Test all bindings

See `markdown/QUICK-START.md` for quick reference.

---

## 🔄 Maintenance Tasks

### Common Tasks

For detailed workflow steps, see `markdown/GLOBAL-WEBFLOW-WORKFLOW.md`:

1. **Update CMS Bindings** - See Workflow 2 in `markdown/GLOBAL-WEBFLOW-WORKFLOW.md`
   - Quick command: Say "update cms"
   - Reference: `markdown/QUICK-START.md`

2. **Sync Webflow Updates** - See Workflow 3 in `markdown/GLOBAL-WEBFLOW-WORKFLOW.md`
   - Preserves local-only files
   - Restores script references

3. **Transfer Custom Code** - See Workflow 4 in `markdown/GLOBAL-WEBFLOW-WORKFLOW.md`
   - Copy `header.css` to Webflow Head Code
   - Copy `footer.js` to Webflow Footer Code

4. **Run QA Checklist** - See `markdown/qa-checklist.md`
   - 101-item comprehensive checklist
   - Run before every deployment

**All workflows:** See `markdown/GLOBAL-WEBFLOW-WORKFLOW.md` for complete step-by-step instructions.

---

## 📊 CMS Collections

This project includes the following CMS collections:

- **[Collection Name 1]** - [Description and item count]
- **[Collection Name 2]** - [Description and item count]

### Pages with CMS Binding:

- **[Page Name]** - [Description]
- **[Page Name]** - [Description]

### CMS Data Location:

- **Local testing:** `local-cms.js`
- **Production:** Webflow CMS
- **Exports:** `cms/` folder (CSV files from Webflow)

**Important:** CMS data may reference data in other CMS databases/collections. When binding data, identify and resolve cross-collection relationships. See `markdown/GLOBAL-WEBFLOW-WORKFLOW.md` (Rule 6: Cross-Collection References) for details.

For CMS binding workflow, see:
- `markdown/QUICK-START.md` - Quick reference for CMS updates
- `markdown/cms-update-workflow.md` - Complete CMS binding workflow (8-step process)

---

## 🔗 Important Links

- **Live Site:** [URL]
- **Webflow Designer:** [URL]
- **Figma Design File:** [URL]
- **GitHub Repository:** [URL]

---

## 📝 Project Notes

### Key Decisions

- [Any important architectural or design decisions]
- [Any project-specific conventions or patterns]

### Known Issues

- [Any known issues or limitations]
- [Any technical debt]

### Future Enhancements

- [Planned improvements]
- [Feature requests]

---

## 🎯 Success Metrics

[Define project success metrics if applicable]

---

## 📞 Support & Resources

### During Development

- **CMS questions?** → `markdown/cms-update-workflow.md`
- **Naming questions?** → `markdown/naming-framework.md`
- **Technical patterns?** → `markdown/local-cms-binding.md`
- **Quick reference?** → `markdown/QUICK-START.md`
- **Workflow standards?** → `markdown/GLOBAL-WEBFLOW-WORKFLOW.md`

### Quality Assurance

- **Pre-deployment checklist?** → `markdown/qa-checklist.md`
- **Framework audit?** → `markdown/AUDIT-README.md`
- **Code audit?** → `markdown/framework-audit.md`
- **Image audit?** → `markdown/image-audit-summary.md`
- **Positioning audit?** → `markdown/positioning-audit.md`

### Troubleshooting

- **Navigation not working?** → Check if `local-cms.js` is in ALL pages (see `markdown/GLOBAL-WEBFLOW-WORKFLOW.md` Rule 1)
- **JavaScript errors?** → Verify code is wrapped in functions (see `markdown/local-cms-binding.md`)
- **CMS bindings not showing?** → Check selectors match HTML classes (see `markdown/cms-update-workflow.md`)
- **Cross-collection references?** → See `markdown/GLOBAL-WEBFLOW-WORKFLOW.md` (Rule 6)

---

**Last Updated:** [Date]
**Maintained By:** [Team/Individual Name]
**Project Status:** [Status]

---

*For universal workflow standards applicable to all projects, see `markdown/GLOBAL-WEBFLOW-WORKFLOW.md`*  
*For clear documentation separation guidelines, see `markdown/README-VS-WORKFLOW-GUIDE.md`*

