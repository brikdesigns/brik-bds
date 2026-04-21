# Brik Healthcare Accessibility & Compliance Standards

**Status:** Canonical — promoted to BDS 2026-04-21.
**Scope:** Marketing sites AND product portals for healthcare clients.
**Owner:** Nick Stanerson (`nick@brikdesigns.com`) — single decision-maker for rule changes, cadence, and enforcement.
**Authors:** Derived from TNCLD (`web/tncld`) remediation work; generalized for all Brik healthcare clients.

---

## Document location

**Canonical:** `@brikdesigns/bds/content-system/compliance/healthcare-ada.md` — ships with BDS to every consumer repo.
**Origin (staging):** `web/tncld/markdown/legal-drafts/BRIK-HEALTHCARE-ADA-STANDARDS.md` — retained only as an historical reference for the TNCLD remediation work that seeded this document.

**Why BDS content-system:**

- Ships via `@brikdesigns/bds/content-system` to all consumer repos (portal, renew-pms, brikdesigns, marketing sites)
- Already the source of truth for content language (industry packs, locked enums, voice patterns)
- Versioned alongside components — updates propagate on `npm update`
- Avoids the "each repo has its own CLAUDE.md copy of the rules" drift problem

**Consumer integration:** A short "Compliance Profile" section in each consumer repo's `CLAUDE.md` points to this document. Project-specific overrides go in the project's CLAUDE.md; the canonical rules stay here.

---

## Step 1 — Classify the client

Before building, determine which regimes apply. Three questions:

| Question | If yes → applies |
|---|---|
| Is the client a "covered entity" under HIPAA? (Healthcare providers, health plans, healthcare clearinghouses) | **HIPAA Privacy + Security Rules** |
| Does the client receive federal financial assistance? (Medicare, Medicaid, HHS grants) | **Section 1557 of ACA + Section 504** (web must conform to WCAG 2.1 AA by HHS 2024 final rule) |
| Is the client a "public accommodation" physically open to patients? (Nearly all in-person providers) | **ADA Title III** (effective communication + WCAG 2.1 AA) |

**Default for healthcare clients:** HIPAA + ADA Title III apply. Confirm Medicare/Medicaid status before assuming Section 1557 applies — this significantly affects the scope of required notices.

Record the answer in the client's project `CLAUDE.md` under a "Compliance Profile" section.

---

## Step 2 — Required content across all healthcare sites

### Always required (ADA Title III)

1. **Accessibility Statement** (published at `/legal/accessibility` or equivalent), including:
   - WCAG 2.1 AA commitment statement
   - Most recent audit date
   - Auxiliary aids available at no charge (sign language interpreters, alternative formats, assistive listening)
   - TTY / relay service info (711)
   - Alternative format availability on request
   - Physical office accessibility statement (if there is a physical location)
   - Non-discrimination statement
   - Contact person for accessibility concerns (named Accessibility Coordinator)
   - Grievance procedure
2. **Visible accessibility touchpoint on /contact** — auxiliary aids, TTY/711, wheelchair access note, link back to full Accessibility Statement

### Additionally required if HIPAA applies

3. **Privacy Policy** (governs the website) — HIPAA-aware but distinct from the NPP
4. **Notice of Privacy Practices** (`/legal/notice-of-privacy-practices`) — HIPAA-mandated patient-facing document per 45 CFR § 164.520; named Privacy Officer required
5. **Patient-facing forms** that collect PHI must be **encrypted in transit + at rest**; intake forms should explicitly warn users not to send detailed health info through unsecured channels

### Additionally required if Section 1557 applies (federal funds received)

6. **Notice of Nondiscrimination** — conspicuous placement (homepage footer recommended)
7. **Taglines in the top 15 languages spoken in the state** — each tagline: "ATTENTION: If you speak [language], language assistance services, free of charge, are available to you."
8. **Civil Rights Coordinator** (named role — can be same person as Accessibility Coordinator)
9. **Grievance procedure** with rights to file with HHS OCR

---

## Step 3 — Required technical standards

### Baseline: WCAG 2.1 AA on every page

Enforced via:

- Lighthouse a11y score ≥ 95 on every published page
- axe-core CI check on marketing sites (0 violations at `serious`/`critical`)
- Manual keyboard + VoiceOver pass before any new flow ships

### Patient portal and product app requirements

Portal builds (`product/brik-client-portal`, `product/renew-pms`, `product/freedom-client-portal`) handle PHI, authentication, forms, and records. Same WCAG 2.1 AA standard as marketing sites — **no AAA bump** — but portal-specific implementation details matter because the flows involve irrevocable actions (record export, bill pay, auth):

- WCAG 2.1 AA on every page (portal + marketing, same floor)
- Every form field: visible label + `aria-label` backup + `aria-describedby` for hint text + `aria-invalid` + `aria-live` region for error announcements
- Every modal: focus trap, focus return on close, Escape to dismiss, scrollable content keyboard-navigable
- Session timeout: ARIA-announced warning ≥ 60 seconds before expiry, one-click session extension (no password re-entry)
- File uploads: accessible error messages, progress announcements, accepted-format info exposed to screen readers
- PDF exports of patient records: tagged, readable by screen readers (not image-only), with heading structure
- Color contrast: WCAG 2.1 AA (4.5:1 normal, 3:1 large text) — no stricter bump
- Color never the sole indicator: always pair with icon + text label
- Keyboard-navigable end-to-end without mouse for every core flow (auth, scheduling, records, bill pay, messaging)
- `prefers-reduced-motion` respected
- `prefers-contrast` respected where practical

### Component-level rules (enforced in BDS)

- `Button` component: never renders without accessible text (via children or `aria-label`)
- `Link` wrapping an icon: requires `aria-label` prop
- `Dialog`/`Modal` components: focus trap + restoration built in, not optional
- `Form` components: wire errors to `aria-live` by default
- `Image` components: `alt` prop required; empty string allowed for decorative only

These go into BDS as prop-level requirements (TypeScript + runtime warn in dev), not as documentation the dev must remember.

---

## Step 4 — Audit cadence

| Cadence | Scope | Owner |
|---|---|---|
| Pre-launch | Full WCAG 2.1 AA audit (automated + manual + screen reader) | Brik lead on build |
| Every release to production (portals) | axe-core CI check | CI (blocks merge on serious/critical) |
| Quarterly | Full audit on each live client site (marketing + portal) | Brik QA |
| After any material content change | Targeted re-audit of changed pages | Author of the change |
| Annually | Accessibility Statement "Most recent audit" date refresh | Brik QA |

The Accessibility Statement's audit date must never go more than 12 months stale — that's the #1 signal to a plaintiff's attorney that the statement is decorative.

---

## Step 5 — Documentation and process

### Every healthcare client build gets

1. **Project-level CLAUDE.md section** — "Compliance Profile" listing which regimes apply (HIPAA? 1557? Title III? State law?)
2. **Drafted legal pages** — reuse the TNCLD templates in `web/tncld/markdown/legal-drafts/` as starting points (minus TNCLD-specific content)
3. **Publish checklist** modeled on the TNCLD `PUBLISH-TO-WEBFLOW.md`
4. **Manual test plan** modeled on the TNCLD `MANUAL-A11Y-TEST-PLAN.md`
5. **Signed-off designated roles** — Privacy Officer (HIPAA), Accessibility Coordinator (ADA), Civil Rights Coordinator (1557 if applicable)

### Every new page/feature gets

- An accessibility review before PR merge (what roles/aria needed, what keyboard flow, what error states)
- An entry in the client's accessibility audit log if it introduces new components or flows

---

## Step 6 — Portal-specific integration plan

For each of `product/brik-client-portal`, `product/renew-pms`, `product/freedom-client-portal`:

### 6a. Add a "Compliance Profile" section to the repo's CLAUDE.md

Documents which regimes apply. Example (for renew-pms, a dental PMS — almost certainly touches Medicare for senior patients):

```markdown
## Compliance Profile

- **HIPAA:** Yes — covered entity (dental practice management handling PHI)
- **Section 1557:** Yes — serves providers who accept Medicare/Medicaid
- **Section 504:** Yes — same rationale as 1557
- **ADA Title III:** Yes — patient-facing portal
- **Canonical standards:** `@brikdesigns/bds/content-system/compliance/healthcare-ada.md`
```

### 6b. Wire accessibility checks into CI

- Add `@axe-core/playwright` (or similar) check on every PR that modifies UI
- **Fail build on any `serious` or `critical` violation — blocks merge**
- Warn-only (non-blocking) for `moderate` and `minor`
- Generate a report artifact attached to each PR so reviewers can see results

Rationale: blocking on `serious`/`critical` is the lowest bar that catches real lawsuit exposure without creating developer friction on borderline issues. Moderate/minor are flagged in the PR for the author's judgement.

### 6c. Extend BDS component types with accessibility-required props

Flip undocumented-but-expected a11y props from "good practice" to "TypeScript-required." Components to update first:

- `Button` — require `aria-label` if no text children (icon-only buttons)
- `IconLink` — require `aria-label`
- `Modal` — require `ariaLabelledBy` + `ariaDescribedBy`
- `FormField` — require `label` prop; no label = TypeScript error
- `Image` — require `alt` prop; decorative images must pass `alt=""` explicitly

### 6d. Add a portal-wide "Accessibility Preferences" panel

Per WCAG 2.1 + best practice for health tech, patients should be able to set preferences persistently:

- High contrast mode toggle
- Text size adjustment
- Reduced motion override
- Preferred contact method (email / text / phone / accessible format)

These preferences should be stored on the user record and applied across the portal.

### 6e. Add a portal-wide "Notice of Privacy Practices" and "Accessibility Statement" route

Served at `/legal/notice-of-privacy-practices` and `/legal/accessibility` on each portal. Content comes from BDS content-system but each tenant/practice can override name/contact/Privacy Officer fields.

---

## Step 7 — Rollout order

Proposed sequence (weeks, not days — each requires review):

1. ✓ **Completed 2026-04-20:** Adopted on TNCLD. Updated Accessibility Statement + other legal pages published.
2. ✓ **Completed 2026-04-21:** Promoted this doc to `brik/brik-bds/content-system/compliance/healthcare-ada.md`. BDS package version bumped; consumers sync on next `npm update`.
3. **Week of 2026-05-04:** Add Compliance Profile section to each portal repo's CLAUDE.md. Wire axe-core CI into `brik-client-portal` as pilot.
4. **Week of 2026-05-11:** Extend the 5 BDS components with required a11y props. One PR per component, merged into BDS main, consumers update on their normal cadence.
5. **Week of 2026-05-18:** Port axe-core CI setup from `brik-client-portal` to `renew-pms` and `freedom-client-portal`.
6. **Week of 2026-06-01:** Build the Accessibility Preferences panel in the shared portal layer.
7. **Week of 2026-06-15:** Full portal audits (automated + manual + screen reader) against the new standards; remediate findings; publish Accessibility Statement on each portal.

Flexible — can compress or extend based on other priorities.

---

## Decisions log

Resolved 2026-04-20 in TNCLD remediation session:

| Decision | Resolution |
|---|---|
| Canonical location | `brik/brik-bds/content-system/compliance/healthcare-ada.md` — ships via BDS to all consumers |
| Ownership | Nick Stanerson — single owner for rule changes, cadence, and enforcement |
| AAA on patient-critical flows | Rejected. WCAG 2.1 AA is the floor everywhere, no AAA bump for portals |
| CI enforcement strictness | Fail build on `serious`/`critical` (blocks merge). Warn-only for `moderate`/`minor` |

Resolved 2026-04-21 during BDS promotion:

| Decision | Resolution |
|---|---|
| Shipping mechanism | Source `.md` ships via `package.json` `files` entry; consumers access at `node_modules/@brikdesigns/bds/content-system/compliance/healthcare-ada.md` |
| Consumer reference format | Each consumer `CLAUDE.md` adds a **Compliance Profile** section that lists applicable regimes and links to the canonical path |
