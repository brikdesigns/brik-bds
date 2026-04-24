# ADR-002 — Accessibility Overlay Widgets

**Status:** Accepted
**Date:** 2026-04-24
**Supersedes:** —
**Superseded by:** —
**Owner:** Nick Stanerson

## Context

UserWay, AccessiBe, EqualWeb, and similar accessibility overlay widgets are a recurring ask from healthcare clients who have read ADA lawsuit-risk articles and want a visible, fast mitigation. The marketing pitch — "one script tag, WCAG compliance, compliance badge included" — is structurally appealing to clients unfamiliar with the accessibility-practitioner community's view of these products.

The [2026-04-24 article](https://www.dentalmarketing.com/post/how-dentists-can-protect-themselves-against-website-accessibility-lawsuits) that prompted this decision linked to a UserWay-modeled approach. Before investing in either reskinning an open-source overlay or designing a Brik-branded widget, we needed to settle whether we install overlays at all.

## Decision

**Brik does not install accessibility overlay widgets on any client site, marketing or product.** We signal compliance through a first-party Accessibility Preferences panel (BDS), a dated Accessibility Statement at `/legal/accessibility`, and an auditable CI pipeline (axe-core). The full rationale and the "what we do instead" surface inventory is documented in [`content-system/compliance/accessibility-overlays.md`](../../content-system/compliance/accessibility-overlays.md).

## Rationale (summarized from the compliance doc)

1. **Overlays correlate with *more* lawsuits, not fewer.** UsableNet's 2023 report found ~30% of federal ADA website suits targeted sites with overlays installed. *Murphy v. Eyebobs* (2021) and similar federal rulings have established that overlays do not cure non-compliant sites.
2. **The accessibility community actively opposes them.** [overlayfactsheet.com](https://overlayfactsheet.com) is signed by ~900+ practitioners (Karl Groves, Adrian Roselli, Léonie Watson). Overlays frequently break the assistive tech they claim to help.
3. **Screen reader users reject them.** WebAIM survey data is consistent across editions.
4. **Third-party JS on healthcare pages raises HIPAA surface-area questions** that a first-party BDS component avoids.
5. **Overlays contradict our build posture.** If BDS + axe-core + dated statements + quarterly audits are working, an overlay is unnecessary. If they aren't, an overlay can't fix it.

## Alternatives considered

- **Reskin an open-source overlay (e.g., Accessibility Statement Generator, openAI-ADA).** Rejected — the structural problems with overlays are not brand-driven; they're behavioral. A Brik-skinned overlay has the same defects as a UserWay-branded one.
- **Build a Brik-branded floating overlay widget.** Rejected — same behavioral defects. Even if we avoided the specific bugs of existing overlays, the overlay *pattern* (bolt-on JS that tries to rewrite an underlying site's a11y at runtime) is the problem, not the vendor.
- **Install UserWay (or similar) on every healthcare client by default.** Rejected — the lawsuit exposure data points the wrong direction, and the HIPAA surface-area concern is real.
- **Do nothing — rely on the Accessibility Statement alone.** Rejected for a different reason: clients legitimately want an interactive, visible accessibility surface. The first-party Accessibility Preferences panel (BDS) delivers that functionality without the overlay pathology.

## Consequences

### Positive

- Clients who ask for a UserWay-style widget get a documented alternative that's stronger on both compliance and user experience.
- BDS absorbs the Accessibility Preferences panel as a first-party primitive — every consumer (portal, renew-pms, freedom, marketing sites) gets it on `npm update`.
- No third-party JS is injected on patient-facing pages — HIPAA subprocessor review stays small.
- The CI + Accessibility Statement + BDS a11y-prop-required components form a coherent stack, not a veneer over unknown underlying quality.

### Negative

- A small number of clients may push back, believing the floating widget is itself the compliance signal. The conversation documented in [`accessibility-overlays.md` § "What to do when a client asks for UserWay"](../../content-system/compliance/accessibility-overlays.md#what-to-do-when-a-client-asks-for-userway) is the mitigation.
- Building the first-party Accessibility Preferences panel is work we now own. This is tracked separately in the BDS backlog (Step 6d in `healthcare-ada.md`).

### Neutral

- This ADR needs to be revisited if (a) federal ADA jurisprudence meaningfully shifts in a way that changes the lawsuit-exposure calculus, (b) the accessibility-practitioner consensus changes, or (c) a fundamentally new overlay architecture appears (one that does not inject runtime DOM rewrites on top of a site's existing a11y surface).

## Enforcement

- This ADR is linked from the project MEMORY file used by Claude Code sessions across all Brik repos, so agents will recall the decision without re-deriving it.
- The companion doc in `content-system/compliance/accessibility-overlays.md` is the canonical client-facing reference.
- Package manifest includes the doc under `files: ["content-system/compliance/*.md"]` so every consumer repo (portal, renew-pms, freedom, brikdesigns marketing sites) gets it on `npm update @brikdesigns/bds`.
