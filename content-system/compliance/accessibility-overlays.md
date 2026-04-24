# Brik Position: No Accessibility Overlay Widgets

**Status:** Canonical — applies to every Brik-built site, marketing or product.
**Owner:** Nick Stanerson (`nick@brikdesigns.com`).
**Established:** 2026-04-24.
**Formal record:** [ADR-002 — Accessibility Overlay Widgets](../../docs/adrs/ADR-002-accessibility-overlays.md).
**Companion doc:** [`healthcare-ada.md`](./healthcare-ada.md) — the full compliance substrate this policy reinforces.

---

## TL;DR

Brik does not install accessibility overlay widgets (UserWay, AccessiBe, EqualWeb, UserCentric, and their competitors) on any client site. We signal compliance through a first-party **Accessibility Preferences panel**, a dated **Accessibility Statement**, and an auditable CI pipeline — not a floating button that injects third-party JS.

This is not a style preference. Overlays measurably *increase* ADA lawsuit exposure. We take the opposite approach on principle and on evidence.

---

## What an overlay is (and why clients ask for them)

Overlays are third-party JavaScript widgets (UserWay's is the most recognizable) that inject a floating button onto a page. Clicking it opens a menu with contrast toggles, text-size adjustments, "screen-reader optimization," and similar controls. Vendors market them as a one-line-of-code path to ADA compliance, often with an accompanying compliance statement the client can display.

The appeal is obvious. A single script tag, a visible badge, and a marketing promise of "WCAG compliance." Clients who've read lawsuit-risk articles (like the dental-marketing piece that prompted this policy) naturally ask whether adding one would protect them.

The evidence says the opposite.

---

## Why Brik won't install them

### 1. Overlays attract lawsuits, not deflect them

**UsableNet's 2023 ADA Lawsuit Report** found that roughly **30% of federal website accessibility lawsuits filed in 2023 named defendants whose sites had an overlay installed**. The overlay is read by plaintiff's counsel as a public admission that the underlying site was built without accessibility as a first-class concern. The widget becomes Exhibit A, not a shield.

AccessiBe — one of UserWay's largest competitors — has been the direct defendant in multiple federal suits brought by blind plaintiffs whose screen readers were broken by the overlay itself. *Murphy v. Eyebobs* (S.D.N.Y., 2021) and similar rulings have established that overlay installation does not convert a non-compliant site into a compliant one.

### 2. The accessibility community actively opposes them

**[overlayfactsheet.com](https://overlayfactsheet.com)** is signed by ~900+ accessibility practitioners — including Karl Groves, Adrian Roselli, Léonie Watson, and other authorities whose published work is cited in court. The factsheet documents how overlays:

- Frequently break the keyboard and screen-reader behaviors they claim to enhance
- Interfere with user-installed assistive technology that was already working
- Paper over structural issues (semantic markup, landmark roles, focus order) that only real remediation can fix
- Provide a false sense of compliance to site owners and their vendors

### 3. Screen reader users overwhelmingly turn them off

**WebAIM's Screen Reader User Survey #10** and subsequent editions consistently show that the majority of blind and low-vision users find overlays either unhelpful or actively harmful. Many disable them as a first action on any site where one appears. The users whose needs the overlay claims to serve are the same users telling the industry the overlay is in the way.

### 4. HIPAA surface-area concerns on healthcare sites

Healthcare clients (dental, medical, behavioral health) serve as the primary business case for Brik's compliance posture. Injecting a third-party JavaScript bundle onto pages that also host patient intake forms, membership-plan checkouts, or provider credentials creates data-flow questions we would rather not answer for a cosmetic compliance signal. Every overlay vendor's privacy posture becomes a subprocessor review the client has to sign off on.

First-party components ship from BDS, live in source control, and raise no new data-handling questions.

### 5. Overlays contradict our build discipline

Brik's compliance substrate — documented in [`healthcare-ada.md`](./healthcare-ada.md) — is built on:

- WCAG 2.1 AA as the floor on every page
- axe-core CI checks that fail merges on `serious` or `critical` violations
- Component-level a11y prop requirements baked into BDS (via TypeScript + runtime warn)
- Manual keyboard and screen-reader passes before any new flow ships
- Quarterly audits with a 12-month-max statement cadence

A widget bolt-on is fundamentally at odds with this posture. If we build it right, the widget is unnecessary. If we build it wrong, the widget cannot fix it.

---

## What we do instead — the visible-signal path

The "abundantly clear that our websites pass accessibility" instinct is correct. Clients, patients, and plaintiff's counsel all read visible signals. We earn those signals through four concrete surfaces:

### 1. Dedicated `/legal/accessibility` page

Required on every healthcare client site per [`healthcare-ada.md`](./healthcare-ada.md#step-2--required-content-across-all-healthcare-sites). The statement includes:

- WCAG 2.1 AA commitment
- Most recent audit date (never >12 months stale — plaintiff's counsel looks for this first)
- Auxiliary aids available at no charge
- TTY / relay service info (711)
- Named Accessibility Coordinator
- Grievance procedure

**Plaintiff's attorneys specifically look for a dated statement with a named coordinator.** Its absence is the strongest single signal that a site is undefended. Its presence is meaningful evidence of a maintained accessibility program.

### 2. First-party Accessibility Preferences panel (BDS component)

This is the component that performs the *function* UserWay claims to perform — contrast mode, text-size adjustment, reduced-motion override, preferred contact method — implemented as a first-party BDS primitive. It ships with:

- No third-party JavaScript
- TypeScript-required a11y props
- Preferences persisted on the user record (portal) or localStorage (marketing sites)
- Every BDS component already responds to the underlying CSS custom properties (`--font-size-scale`, `--contrast-mode`, etc.)

Spec and rollout are tracked as a separate BDS issue referenced from [`healthcare-ada.md` §6d](./healthcare-ada.md#6d-add-a-portal-wide-accessibility-preferences-panel). This is the component we'd reach for if a client explicitly asks for "a UserWay-style widget" — it delivers the same functionality, auditably, without the overlay.

### 3. Prominent footer treatment

Every healthcare client site gets:

- A footer link to `/legal/accessibility`
- An adjacent footer link to `/legal/notice-of-privacy-practices` (HIPAA sites)
- An adjacent footer link to `/legal/notice-of-nondiscrimination` + language taglines (Section 1557 sites)
- Optional WCAG 2.1 AA compliance badge component (BDS), rendered with the statement's audit date, linking to the statement page

The badge does not claim certification. It states the conformance target and the last audit date. A dated conformance claim is substantively stronger than a floating overlay.

### 4. Auditable CI pipeline

The substrate under the visible signals. Client portal runs `@axe-core/playwright` on every PR via `tests/e2e/a11y/public-routes.spec.ts`, failing the build on any new `serious` or `critical` violation. This is the check that keeps the Accessibility Statement honest. When a suit arrives, the CI history is the evidence that the site was actively audited during the period in question.

---

## What to do when a client asks for UserWay

1. Acknowledge the concern — ADA lawsuit exposure in dental, medical, and healthcare-adjacent verticals is real and rising.
2. Share this doc and [`healthcare-ada.md`](./healthcare-ada.md) as the Brik position.
3. Walk through the four surfaces above. The first-party panel is the closest functional equivalent to what they're asking for.
4. If the client insists after the conversation, escalate to Nick Stanerson before installing anything. The answer is still no, but the escalation is how we make sure the client understands what they're asking us to sign off on.

## What to do when a referral article recommends UserWay

Referral articles (marketing blogs, dental-practice-management newsletters, legal-risk advisories) will sometimes recommend an overlay as a quick mitigation. Two observations:

- The *specific* article that prompted this policy — [dentalmarketing.com/post/how-dentists-can-protect-themselves-against-website-accessibility-lawsuits](https://www.dentalmarketing.com/post/how-dentists-can-protect-themselves-against-website-accessibility-lawsuits) — **does not recommend an overlay**. It recommends alt text, keyboard navigation, captions, and contrast. Real remediation. Even the sources clients cite at us usually agree with the Brik position when read carefully.
- When an article *does* recommend an overlay, treat it as a marketing surface for the overlay vendor, not as independent accessibility guidance. Follow the footnotes; they usually lead back to UserWay or AccessiBe affiliates.

---

## Related reading

- [`healthcare-ada.md`](./healthcare-ada.md) — the full Brik healthcare compliance substrate
- [ADR-002](../../docs/adrs/ADR-002-accessibility-overlays.md) — formal decision record
- [overlayfactsheet.com](https://overlayfactsheet.com) — accessibility community position
- [UsableNet ADA Web and App Lawsuit Report](https://info.usablenet.com/2023-year-end-digital-accessibility-lawsuit-report) — annual lawsuit data
- [WebAIM Screen Reader User Survey](https://webaim.org/projects/screenreadersurvey10/) — user sentiment data
