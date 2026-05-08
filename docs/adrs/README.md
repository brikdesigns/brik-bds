# Architecture Decision Records

This directory holds the BDS architecture decisions that don't fit in component-level documentation. Each ADR is a single decision, immutable once accepted, superseded only by a newer ADR.

## Why ADRs

ADRs answer "**why** did we do it this way?" — the question that disappears the moment a PR merges, and that future-you (or a new contributor, or an agent in a fresh session) can't reconstruct from the diff alone.

Component documentation, the writing guide, and CLAUDE.md tell you **what** the rules are today. ADRs tell you **why** those rules exist, what alternatives were considered, and what tradeoffs were accepted.

## Index — by topic cluster

### Component design discipline

The "how do we keep BDS lean" cluster. Each ADR is one decision in a longer story.

| ADR | Status | Decision |
|---|---|---|
| [ADR-003](./ADR-003-addable-list-family.md) | Proposed | Collapse the Addable\* family from 3 components to 2 (AddableTagList + AddableEntryList) |
| [ADR-004](./ADR-004-component-bloat-guardrails.md) | **Accepted** (2026-05-08) | Rules that prevent new bloat — three-uses test, >70% overlap rule, container-coupled typography ban, audit-gate questions in every component PR |
| [ADR-005](./ADR-005-addable-field-row-list.md) | **Accepted** (2026-05-08) | Introduce `AddableFieldRowList` as a new BDS primitive — the multi-field-row shape the portal had hand-rolled three times |

These compose: ADR-004 sets the rules; ADR-003 applies them to consolidate Addable\*; ADR-005 uses the three-uses test to justify a *new* primitive (the shape that's hand-rolled three times in portal warrants a BDS abstraction).

### Storybook standards

The "how do component pages look and behave" cluster.

| ADR | Status | Decision |
|---|---|---|
| [ADR-006](./ADR-006-storybook-taxonomy-and-story-shape.md) | **Accepted** (2026-04-26, amended 2026-05-05) | Four content top-levels (Foundations / Components / Patterns / Theming), one alphabetical subcategory layer under Components, two-shape story files (Playground + one-story-per-state) |
| [ADR-007](./ADR-007-storybook-page-recipe.md) | **Accepted** (2026-05-04) | Normative MDX page recipe — Carbon-style triple-link header (ComponentLinks), six required sections in a fixed order, lint-enforced via `scripts/lint-storybook-recipe.js` |

These compose: ADR-006 governs *story files* (where stories live, what shape); ADR-007 governs *MDX pages* (how the page is structured around those stories). When they conflicted (ADR-006 forbids `Variants` story exports, ADR-007's original recipe required them), ADR-007's amendment landed first to reconcile.

### Cross-cutting

| ADR | Status | Decision |
|---|---|---|
| [ADR-001](./ADR-001-bds-find.md) | **Accepted** (2026-05-08) | `bds-find` CLI + semantic manifest fields so consumer agents can discover BDS components instead of building local clones |
| [ADR-002](./ADR-002-accessibility-overlays.md) | **Accepted** | Ban third-party accessibility overlay widgets — they harm the users they claim to help and increase ADA legal exposure |

## Status field — what each value means

- **Proposed** — Decision drafted but the work to make it real hasn't shipped, OR the decision is genuinely awaiting team buy-in.
- **Accepted** — Decision is in effect. The artifacts that enforce it (lint scripts, components, audit checks) exist and are wired up. New work is expected to conform.
- **Superseded by ADR-NNN** — A newer ADR replaces this decision. The file stays for history; read the superseder for current rules.

When you bump a Proposed ADR to Accepted, also fill the date in the format `Accepted (YYYY-MM-DD)`. The original `Date:` line stays — that's when the decision was authored, not when it took effect.

## Authoring a new ADR

Use [the template](./TEMPLATE.md) if it exists. Otherwise, copy the shape of any recent ADR (ADR-006 or ADR-007 are good models). Required frontmatter:

```markdown
# ADR-NNN — Short title

**Status:** Proposed
**Date:** YYYY-MM-DD
**Supersedes:** — (or ADR-NNN if this replaces an earlier decision)
**Superseded by:** —
**Owner:** Your Name
```

Number sequentially. Don't reuse numbers, even for superseded ADRs — the file stays, the new decision gets a new number.

Required sections: `## Context`, `## Decision`. Recommended: `## Rationale`, `## Alternatives considered`, `## Consequences`, `## Migration`, `## Enforcement`. Add an `## Amendments` section at the bottom if the decision evolves *without* full supersession (see ADR-006 for an example).

Open the ADR in a PR like any other change. Once merged, the status starts as Proposed; bump to Accepted when the enforcement artifacts ship.
