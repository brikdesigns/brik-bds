# Pre-Deployment QA Checklist
**Version 1.0** | Updated: November 2025

Complete this checklist before deploying any website to production. Each section must be verified and checked off.

---

## 📋 Quick Overview

| Category | Items | Priority |
|----------|-------|----------|
| [Naming Standards](#-naming-standards) | 10 | 🔴 Critical |
| [Semantic HTML](#-semantic-html--accessibility) | 12 | 🔴 Critical |
| [Accessibility (A11y)](#-accessibility-wcag-21-aa) | 15 | 🔴 Critical |
| [Performance](#-performance) | 8 | 🟡 High |
| [SEO](#-seo) | 10 | 🟡 High |
| [Functionality](#-functionality--interaction) | 12 | 🔴 Critical |
| [Content](#-content--copy) | 6 | 🟡 High |
| [Cross-Browser Testing](#-cross-browser-testing) | 5 | 🟡 High |
| [Mobile Responsive](#-mobile--responsive) | 8 | 🔴 Critical |
| [Forms](#-forms) | 7 | 🟡 High |
| [Final Checks](#-final-pre-deployment) | 8 | 🔴 Critical |

**Total Checks:** 101

---

## 🏷️ Naming Standards

Reference: See [naming-framework.md](./naming-framework.md) for complete guidelines.

### Section Naming
- [ ] All `section_[name]` classes use `<section>` HTML element
- [ ] All sections use underscore separator (not hyphen): `section_hero` ✅ not `section-hero` ❌
- [ ] Multi-word sections follow pattern: `section_word-word` (e.g., `section_hero-interior`)
- [ ] No `<div class="section_*">` found (should be `<section>`)

### Layout & Structure
- [ ] Standard layouts use hyphens: `layout-1-col`, `layout-2-col`, `layout-3-col`
- [ ] Custom layouts use underscore: `layout_nav`, `layout_footer`, `layout_services`
- [ ] No generic `layout-item` without descriptive name
- [ ] All layout items follow pattern: `layout-item_descriptive-name`

### Container & Wrapper Naming
- [ ] Containers follow pattern: `container_[name]`
- [ ] Wrappers follow pattern: `[type]-wrapper` (e.g., `content-wrapper`, `button-wrapper`)

### CMS Naming
- [ ] CMS items use pattern: `item_[collection-name]`
- [ ] CMS wrappers use: `cms-wrapper`

**Pass Criteria:** All 10 items checked ✅

---

## 🏗️ Semantic HTML & Accessibility

### Document Structure
- [ ] One and only ONE `<h1>` per page
- [ ] Heading hierarchy is logical (no skipped levels: h1 → h2 → h3, not h1 → h3)
- [ ] `<main>` element wraps main content area
- [ ] `<nav>` element wraps navigation areas
- [ ] `<footer>` element for footer content
- [ ] `<article>` used for self-contained content (blog posts, products)
- [ ] `<aside>` used for tangential content (sidebars, related content)

### Semantic Elements
- [ ] Buttons use `<button>` for actions or `<a>` for links (not `<div>` styled as buttons)
- [ ] Lists use `<ul>`, `<ol>`, or `<dl>` (not divs with bullets)
- [ ] Tables use proper table markup (`<table>`, `<thead>`, `<tbody>`, `<th>`, `<td>`)
- [ ] Forms use proper form elements (`<form>`, `<label>`, `<input>`, etc.)

### ARIA & Roles
- [ ] Landmark roles present where semantic HTML isn't used
- [ ] `role="navigation"` on navigation areas
- [ ] `role="main"` on main content (if `<main>` not used)
- [ ] `role="complementary"` on aside content

**Pass Criteria:** All 12 items checked ✅

---

## ♿ Accessibility (WCAG 2.1 AA)

### Images & Media
- [ ] All images have descriptive `alt` attributes (not empty unless decorative)
- [ ] Decorative images have `alt=""` (empty alt)
- [ ] Background images don't contain critical information
- [ ] SVGs have `<title>` or `aria-label` when meaningful
- [ ] Videos have captions/subtitles available
- [ ] Audio descriptions provided for video content

### Color & Contrast
- [ ] Text has minimum 4.5:1 contrast ratio (AA standard)
- [ ] Large text (18pt+) has minimum 3:1 contrast ratio
- [ ] Test with [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [ ] Color is not the only indicator of meaning (use icons, text, patterns)
- [ ] Links are distinguishable from surrounding text (underline, icon, bold)

### Keyboard Navigation
- [ ] All interactive elements accessible via keyboard (Tab, Enter, Space)
- [ ] Focus indicators visible on all interactive elements
- [ ] Keyboard trap test: Can navigate through entire page without getting stuck
- [ ] Skip navigation link present (skip to main content)
- [ ] Tab order is logical (follows visual order)

### Forms & Inputs
- [ ] All form inputs have associated `<label>` elements
- [ ] Required fields clearly marked (not just with color)
- [ ] Error messages are clear and associated with fields
- [ ] Form validation doesn't rely solely on color
- [ ] Placeholder text is not used as labels

### Interactive Elements
- [ ] Modals/dialogs trap focus and have close button
- [ ] Dropdowns accessible via keyboard
- [ ] Accordions properly labeled and keyboard accessible
- [ ] Carousels can be paused and navigated via keyboard

**Testing Tools:**
- [ ] Run [axe DevTools](https://www.deque.com/axe/devtools/) (0 violations)
- [ ] Run [WAVE Web Accessibility Tool](https://wave.webaim.org/)
- [ ] Test with keyboard only (no mouse)
- [ ] Test with screen reader (NVDA, JAWS, or VoiceOver)

**Pass Criteria:** All 15 items checked ✅ and 0 critical violations in automated tools

---

## ⚡ Performance

### Image Optimization
- [ ] All images compressed (TinyPNG, ImageOptim, or Webflow auto-compression)
- [ ] Appropriate image formats (WebP with fallbacks, AVIF where supported)
- [ ] Images sized appropriately (not using 2000px image for 400px display)
- [ ] Lazy loading enabled for below-fold images
- [ ] Responsive images using `srcset` and `sizes`

### Loading Performance
- [ ] Page Speed Insights score: Desktop > 90, Mobile > 80
- [ ] First Contentful Paint (FCP) < 1.8s
- [ ] Largest Contentful Paint (LCP) < 2.5s
- [ ] Total Blocking Time (TBT) < 200ms
- [ ] Cumulative Layout Shift (CLS) < 0.1

### Code Optimization
- [ ] Minimize custom CSS in header (use external CSS when possible)
- [ ] Minimize custom JS in footer (use external JS when possible)
- [ ] No unused CSS or JavaScript
- [ ] Critical CSS inlined for above-fold content (if applicable)

**Testing Tools:**
- [ ] [Google PageSpeed Insights](https://pagespeed.web.dev/)
- [ ] [GTmetrix](https://gtmetrix.com/)
- [ ] Chrome DevTools Lighthouse

**Pass Criteria:** All performance budgets met ✅

---

## 🔍 SEO

### Meta Tags
- [ ] Unique `<title>` on every page (50-60 characters)
- [ ] Unique meta description on every page (150-160 characters)
- [ ] Open Graph tags present (`og:title`, `og:description`, `og:image`)
- [ ] Twitter Card tags present
- [ ] Favicon present and displays correctly
- [ ] Canonical URL set (if needed)

### Content & Structure
- [ ] One `<h1>` per page containing primary keyword
- [ ] Headings follow logical hierarchy
- [ ] URLs are clean and descriptive (no ?id=123 when avoidable)
- [ ] Internal linking structure logical
- [ ] No broken links (use [Broken Link Checker](https://www.brokenlinkcheck.com/))
- [ ] robots.txt file present and correct
- [ ] XML sitemap generated and submitted to search engines

### Schema Markup
- [ ] Schema.org markup for business (LocalBusiness, Organization)
- [ ] Schema for articles/blog posts (if applicable)
- [ ] Validate schema with [Schema Validator](https://validator.schema.org/)

**Pass Criteria:** All 10 items checked ✅

---

## ⚙️ Functionality & Interaction

### Navigation
- [ ] All navigation links work correctly
- [ ] Mobile menu opens and closes properly
- [ ] Dropdowns work on hover and click
- [ ] Active page indicated in navigation
- [ ] Breadcrumbs accurate (if present)

### Forms
- [ ] All forms submit successfully
- [ ] Form validation works correctly
- [ ] Success/error messages display properly
- [ ] Required fields enforced
- [ ] Email validation works
- [ ] Phone number formatting works (if applicable)

### Interactive Elements
- [ ] All buttons perform expected actions
- [ ] Modals/popups open and close correctly
- [ ] Image galleries/carousels function properly
- [ ] Video/audio players work
- [ ] Animations trigger correctly and don't cause layout shift
- [ ] CMS dynamic content loads properly (if applicable)

### Links
- [ ] All internal links go to correct pages
- [ ] All external links open in new tab (where appropriate)
- [ ] No 404 errors
- [ ] Email links work: `mailto:email@domain.com`
- [ ] Phone links work: `tel:+1234567890`
- [ ] Social media links go to correct profiles

**Pass Criteria:** All 12 items checked ✅

---

## 📝 Content & Copy

### Text Content
- [ ] No placeholder text (Lorem ipsum, etc.)
- [ ] No spelling or grammar errors
- [ ] Consistent tone and voice throughout
- [ ] Phone numbers, addresses, and emails are correct
- [ ] Copyright year is current
- [ ] Privacy policy and terms of service linked (if required)

**Pass Criteria:** All 6 items checked ✅

---

## 🌐 Cross-Browser Testing

Test on the following browsers:

### Desktop Browsers
- [ ] Chrome (latest version)
- [ ] Firefox (latest version)
- [ ] Safari (latest version)
- [ ] Edge (latest version)

### Mobile Browsers
- [ ] iOS Safari (latest version)
- [ ] Chrome Mobile (Android)

**Testing Checklist per Browser:**
- Layout displays correctly
- All interactions work
- Forms submit properly
- No console errors
- Fonts load correctly

**Tools:**
- [BrowserStack](https://www.browserstack.com/) (paid)
- [LambdaTest](https://www.lambdatest.com/) (paid)
- Manual testing on physical devices

**Pass Criteria:** Works correctly on all 5 browsers ✅

---

## 📱 Mobile & Responsive

### Responsive Breakpoints
Test at the following widths:
- [ ] Mobile: 375px (iPhone SE)
- [ ] Mobile: 390px (iPhone 12/13/14)
- [ ] Mobile: 414px (iPhone Plus)
- [ ] Tablet: 768px (iPad Portrait)
- [ ] Tablet: 1024px (iPad Landscape)
- [ ] Desktop: 1280px
- [ ] Desktop: 1920px
- [ ] Large Desktop: 2560px+

### Mobile-Specific Checks
- [ ] Text is readable without zooming (minimum 16px)
- [ ] Touch targets are at least 44x44px
- [ ] No horizontal scrolling on any breakpoint
- [ ] Images scale properly
- [ ] Forms are easy to fill out on mobile
- [ ] Mobile menu works correctly
- [ ] Phone numbers are clickable (tap to call)
- [ ] Spacing is appropriate for touch (not cramped)

**Testing Tools:**
- Chrome DevTools (Device Mode)
- Firefox Responsive Design Mode
- Physical device testing

**Pass Criteria:** All 8 items checked ✅ at all breakpoints

---

## 📋 Forms

If the website has forms, complete this section:

### Form Structure
- [ ] All fields have proper labels
- [ ] Required fields marked with asterisk (*) or "(required)"
- [ ] Field types appropriate (email for email, tel for phone, etc.)
- [ ] Autocomplete attributes set correctly

### Form Validation
- [ ] Client-side validation works
- [ ] Server-side validation works (if applicable)
- [ ] Error messages are clear and helpful
- [ ] Error messages appear next to the field with the error

### Form Submission
- [ ] Form submits successfully
- [ ] Success message displays after submission
- [ ] Email notifications sent correctly (if applicable)
- [ ] Form data saved to database/CMS (if applicable)
- [ ] Thank you page loads correctly (if applicable)

**Testing:**
- [ ] Test with valid data
- [ ] Test with invalid data (check validation)
- [ ] Test required field enforcement

**Pass Criteria:** All 7 items checked ✅

---

## 🚀 Final Pre-Deployment

### Technical Checks
- [ ] Google Analytics / tracking code installed and working
- [ ] Google Tag Manager configured (if used)
- [ ] Facebook Pixel installed (if applicable)
- [ ] Cookie consent banner present (if required by region)
- [ ] SSL certificate installed and valid (HTTPS working)
- [ ] All API keys and secrets secured (not exposed in code)
- [ ] Custom domain connected correctly
- [ ] 301 redirects set up for old URLs (if site redesign)

### Webflow-Specific (if applicable)
- [ ] CMS collections published
- [ ] All pages published (check Pages panel)
- [ ] Custom code (header.css and footer.js) transferred to Webflow
- [ ] Forms connected to proper notifications
- [ ] Backup of site exported before major changes

### Final Review
- [ ] Client approval received
- [ ] Staging site matches production expectations
- [ ] All QA checklist items completed
- [ ] Team review completed
- [ ] Launch plan documented (rollback plan if issues occur)

**Pass Criteria:** All 8 items checked ✅

---

## 📊 QA Summary Report

Use this template to report QA results:

```
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

---

## 🔧 Recommended Tools

### Browser Extensions
- **axe DevTools** - Accessibility testing
- **WAVE** - Web accessibility evaluation
- **Lighthouse** - Performance, SEO, accessibility
- **ColorZilla** - Color picker and contrast checker
- **WhatFont** - Font identifier

### Online Tools
- [Google PageSpeed Insights](https://pagespeed.web.dev/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [WAVE Web Accessibility Tool](https://wave.webaim.org/)
- [Schema Validator](https://validator.schema.org/)
- [Broken Link Checker](https://www.brokenlinkcheck.com/)
- [GTmetrix](https://gtmetrix.com/)
- [W3C Markup Validator](https://validator.w3.org/)
- [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)

### Testing Services
- **BrowserStack** - Cross-browser testing
- **LambdaTest** - Cross-browser testing
- **Screenfly** - Responsive testing

---

## 📝 QA Process

### When to Run QA

1. **Before initial client review** - Ensure quality before presenting
2. **After major changes** - Any significant updates require re-testing affected areas
3. **Before final deployment** - Complete checklist before going live
4. **Quarterly audits** - Review live sites for ongoing quality

### Who Performs QA

- **Developer** - Initial QA after development (self-review)
- **QA Lead/Peer** - Secondary review by another team member
- **Client** - Final approval after internal QA passes

### QA Workflow

```
Development Complete
    ↓
Developer Self-QA (Quick Check)
    ↓
Peer Review QA (Full Checklist)
    ↓
Fixes Applied
    ↓
Final QA Review
    ↓
Client Review
    ↓
Client Approval
    ↓
Deploy to Production
    ↓
Post-Launch Verification (Smoke Test)
```

---

## 🚨 Critical vs. Non-Critical Issues

### 🔴 Critical (Must Fix Before Launch)
- Broken functionality
- Accessibility violations (WCAG A/AA)
- Security vulnerabilities
- Naming standard violations
- Missing semantic HTML
- Forms don't work
- Major browser incompatibilities
- Mobile layout broken
- SEO meta tags missing

### 🟡 High Priority (Should Fix Before Launch)
- Performance issues (scores < 80)
- Minor accessibility improvements
- Content typos
- Inconsistent spacing
- Missing alt text on non-critical images
- Minor browser inconsistencies

### 🟢 Low Priority (Can Fix Post-Launch)
- Nice-to-have features
- Optimization opportunities
- Minor visual inconsistencies
- Enhancement requests

---

## 📅 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Nov 6, 2025 | Initial release |

---

**Last Updated:** November 6, 2025  
**Version:** 1.0  
**Maintained by:** Brik Designs

**Questions?** Refer to [naming-framework.md](./naming-framework.md) for naming standards details.

