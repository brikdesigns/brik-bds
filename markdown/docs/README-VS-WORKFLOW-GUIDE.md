# README.md vs GLOBAL-WEBFLOW-WORKFLOW.md - Clear Separation Guide

## 🎯 Purpose

This document clarifies the **clear separation** between project-specific documentation (`README.md`) and universal workflow standards (`markdown/GLOBAL-WEBFLOW-WORKFLOW.md`) to avoid redundancy and ensure clearer communication.

---

## 📋 README.md - Project-Specific Overview

**Purpose:** Project overview and quick reference guide for THIS specific project

**Location:** Root of project (`/README.md`)

**Should Include:**
- ✅ **Project overview** - What the project is, who it's for, main purpose
- ✅ **Live site URL** - Link to production site
- ✅ **Project structure** - File/folder organization for THIS project
- ✅ **CMS collections** - Collections specific to THIS project
- ✅ **Code audit references** - Links to audit documentation and audit dates
- ✅ **Project-specific goals** - Goals and objectives for THIS project
- ✅ **Project-specific configuration** - Webflow Site ID, Figma file keys, etc.
- ✅ **Project notes** - Key decisions, known issues, future enhancements
- ✅ **Quick links** - Links to workflow documentation (not the workflow itself)

**Should NOT Include:**
- ❌ Detailed workflow steps (those belong in `markdown/GLOBAL-WEBFLOW-WORKFLOW.md`)
- ❌ Universal standards applicable to all projects
- ❌ Step-by-step instructions for common tasks (link to markdown files instead)

**Template:** Use `markdown/README-TEMPLATE.md` as starting point

---

## 📘 markdown/GLOBAL-WEBFLOW-WORKFLOW.md - Universal Standards

**Purpose:** Universal workflow standards applicable to ALL projects

**Location:** Documentation folder (`/markdown/GLOBAL-WEBFLOW-WORKFLOW.md`)

**Should Include:**
- ✅ **Universal workflows** - Step-by-step processes for all projects
- ✅ **Standard file patterns** - Templates and patterns everyone should follow
- ✅ **Critical rules** - Rules applicable to all projects
- ✅ **Standard documentation files** - List of markdown files every project should have
- ✅ **QA and audit workflows** - Universal quality assurance processes
- ✅ **Cross-project best practices** - Standards learned from multiple projects
- ✅ **Getting started guide** - Template workflow for new projects

**Should NOT Include:**
- ❌ Project-specific information (that belongs in `README.md`)
- ❌ Project-specific URLs or configuration
- ❌ Project-specific CMS collections or pages

**Key Principle:** If it applies to ALL projects → goes in GLOBAL-WEBFLOW-WORKFLOW.md

---

## 🔍 Overlap Analysis

### Current Overlap (to be removed from README.md)

The current `README.md` contains workflow steps that overlap with `GLOBAL-WEBFLOW-WORKFLOW.md`:

1. **"Common Maintenance Tasks" section** - These are universal workflows
   - ❌ Should be in `markdown/GLOBAL-WEBFLOW-WORKFLOW.md`
   - ✅ In README.md: Just link to workflow documentation

2. **"Development Setup" section** - Partially universal
   - ✅ Project-specific config (Site ID, tokens) can stay
   - ❌ Universal setup steps should reference `GLOBAL-WEBFLOW-WORKFLOW.md`

3. **"Project Structure" section** - Partially universal
   - ✅ Project-specific files/folders can stay
   - ❌ Universal structure documented in `GLOBAL-WEBFLOW-WORKFLOW.md`

### Recommendation: Split Content

**README.md should say:**
```markdown
## 🔧 Local Development Setup

For complete setup instructions, see `markdown/GLOBAL-WEBFLOW-WORKFLOW.md`

### Project-Specific Configuration

- Webflow Site ID: [project-specific]
- Figma File Key: [project-specific]
- GitHub Repository: [project-specific]
```

**Instead of:**
- Step-by-step installation instructions (universal)
- Complete workflow documentation (universal)
- Universal file structure details (universal)

---

## 📝 Recommended README.md Structure

### ✅ Keep in README.md:

```markdown
# [Project Name] Webflow Project

## 📋 Project Overview
- What the project is
- Who it's for
- Main purpose

## 🚀 Live Site
- Link to production site

## 📁 Project Structure (Project-Specific)
- List any project-specific files/folders
- Link to `markdown/GLOBAL-WEBFLOW-WORKFLOW.md` for standard structure

## 🔧 Local Development Files
- List project-specific files (local-cms.js, header.css, footer.js, README.md)
- Reference workflow docs for setup instructions

## 📚 Key Documentation
- Links to workflow documentation
- Links to project-specific guides

## 🔍 Code Audits & Quality Assurance
- References to audit documentation
- Last audit date
- Next scheduled audit

## 🚀 Quick Start
- Brief overview
- Link to `markdown/GLOBAL-WEBFLOW-WORKFLOW.md` for detailed steps

## 📊 CMS Collections (Project-Specific)
- Collections for THIS project
- Pages with CMS binding

## 🔗 Important Links (Project-Specific)
- Live site URL
- Webflow Designer URL
- Figma file URL
- GitHub repository URL

## 📝 Project Notes (Project-Specific)
- Key decisions
- Known issues
- Future enhancements
```

### ❌ Don't Put in README.md:

- Detailed workflow steps (link to `GLOBAL-WEBFLOW-WORKFLOW.md` instead)
- Universal file patterns (reference workflow docs)
- Step-by-step installation (reference workflow docs)
- Universal maintenance tasks (reference workflow docs)

---

## 🎯 Clear Communication Strategy

### For New Projects

1. **Copy `README.md` template**
   ```bash
   # Copy template from markdown/
   cp markdown/README-TEMPLATE.md README.md
   ```

2. **Customize with project-specific info**
   - Project name and overview
   - Live site URL
   - CMS collections
   - Project-specific configuration
   - Audit schedule references

3. **Link to universal workflows**
   - Reference `markdown/GLOBAL-WEBFLOW-WORKFLOW.md` for setup
   - Reference `markdown/QUICK-START.md` for quick commands
   - Reference other markdown files as needed

### For Workflow Questions

- **"How do I set up a new project?"** → `markdown/GLOBAL-WEBFLOW-WORKFLOW.md`
- **"What files should I create?"** → `markdown/GLOBAL-WEBFLOW-WORKFLOW.md`
- **"How do I update CMS bindings?"** → `markdown/QUICK-START.md`
- **"What are the project goals?"** → `README.md`
- **"When was the last audit?"** → `README.md`
- **"What CMS collections exist?"** → `README.md`

---

## 📊 Summary: What Goes Where

| Content Type | README.md | GLOBAL-WEBFLOW-WORKFLOW.md |
|--------------|-----------|---------------------------|
| **Project overview** | ✅ Yes | ❌ No |
| **Live site URL** | ✅ Yes | ❌ No |
| **Project goals** | ✅ Yes | ❌ No |
| **CMS collections (specific)** | ✅ Yes | ❌ No |
| **Audit dates** | ✅ Yes | ❌ No |
| **Workflow steps** | ❌ Link only | ✅ Yes |
| **Universal file patterns** | ❌ Link only | ✅ Yes |
| **Setup instructions** | ❌ Link only | ✅ Yes |
| **QA processes** | ❌ Link only | ✅ Yes |
| **Critical rules** | ❌ Link only | ✅ Yes |

---

## 🔄 Migration Strategy

### For Current Projects

1. **Review existing README.md**
   - Identify project-specific content (keep)
   - Identify universal workflow content (move or link)

2. **Update README.md**
   - Keep project-specific sections
   - Replace workflow steps with links to `markdown/GLOBAL-WEBFLOW-WORKFLOW.md`
   - Add audit schedule references

3. **Verify GLOBAL-WEBFLOW-WORKFLOW.md**
   - Ensure all universal content is documented
   - Add any missing workflows discovered in README.md

### For New Projects

1. **Start with template**
   ```bash
   cp markdown/README-TEMPLATE.md README.md
   ```

2. **Customize with project info**
   - Fill in project-specific sections
   - Add audit schedule
   - Add CMS collections

3. **Reference workflow docs**
   - Link to `markdown/GLOBAL-WEBFLOW-WORKFLOW.md` for workflows
   - Link to other markdown files as needed

---

## ✅ Success Criteria

You've successfully separated concerns when:

- ✅ README.md focuses on THIS project only
- ✅ README.md links to workflow docs instead of duplicating them
- ✅ GLOBAL-WEBFLOW-WORKFLOW.md contains universal standards only
- ✅ No redundancy between README.md and workflow docs
- ✅ New team members can quickly find project overview in README.md
- ✅ New team members can find workflow standards in GLOBAL-WEBFLOW-WORKFLOW.md
- ✅ Audit schedules and dates are tracked in README.md
- ✅ Workflow steps are documented once in GLOBAL-WEBFLOW-WORKFLOW.md

---

## 📞 Quick Reference

### Where to Find Information

| Question | Location |
|----------|----------|
| What is this project about? | `README.md` |
| What are the project goals? | `README.md` |
| When was the last audit? | `README.md` |
| What CMS collections exist? | `README.md` |
| How do I set up a new project? | `markdown/GLOBAL-WEBFLOW-WORKFLOW.md` |
| What are the workflow standards? | `markdown/GLOBAL-WEBFLOW-WORKFLOW.md` |
| How do I update CMS bindings? | `markdown/QUICK-START.md` |
| What files should I create? | `markdown/GLOBAL-WEBFLOW-WORKFLOW.md` |

---

**Key Principle:** 
- **README.md** = "What is this project?" + "Where can I find things?" + Project-specific info
- **GLOBAL-WEBFLOW-WORKFLOW.md** = "How do I do things?" + Universal standards

---

**Last Updated:** 2025-01-27  
**Maintained By:** Development Team  
**Review Schedule:** Quarterly

