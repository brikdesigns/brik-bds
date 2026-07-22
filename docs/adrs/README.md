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
| [ADR-006](./ADR-006-storybook-taxonomy-and-story-shape.md) | **Accepted** (2026-04-26; Part A amended 2026-05-16 → flat taxonomy; 2026-07-22 → Cards / Navigation / Blueprints / Foundation-Assets; Part B amended 2026-05-18 → canonical first story renamed `Default`) | Flat component top-levels (Components / Cards / Containers / Blocks / Layouts / Navigation / Blueprints / Tools), no subcategory layer, two-shape story files (`Default` + one-story-per-state) |
| [ADR-007](./ADR-007-storybook-page-recipe.md) | **Accepted** (2026-05-04, amended 2026-05-18 → first section renamed `## Default`) | Normative MDX page recipe — Carbon-style triple-link header (ComponentLinks), required sections in fixed order (`## Default` → `## Variants` → `## Props`), lint-enforced via `scripts/lint-storybook-recipe.js` |
| [ADR-010](./ADR-010-storybook-axes-of-information.md) | **Accepted** (2026-05-13, amended 2026-05-14 + 2026-05-18) | Story-vs-control matrix — Q1 toolbar global / Q2 argTypes-only / Q3 dedicated story (Orientation \| Layout \| Semantic-variant) / Q4 irreducible render / Q5 play-only. Canonical first story is `Default` regardless of variant axis. |

These compose: ADR-006 governs *story files* (where stories live, what shape); ADR-007 governs *MDX pages* (how the page is structured around those stories). When they conflicted (ADR-006 forbids `Variants` story exports, ADR-007's original recipe required them), ADR-007's amendment landed first to reconcile.

### Cross-cutting

| ADR | Status | Decision |
|---|---|---|
| [ADR-001](./ADR-001-bds-find.md) | **Accepted** (2026-05-08) | `bds-find` CLI + semantic manifest fields so consumer agents can discover BDS components instead of building local clones |
| [ADR-002](./ADR-002-accessibility-overlays.md) | **Accepted** | Ban third-party accessibility overlay widgets — they harm the users they claim to help and increase ADA legal exposure |
| [ADR-008](./ADR-008-naming-canon-closed-allowlist.md) | **Accepted** (2026-05-11) · §2 superseded by ADR-017 | Naming canon flips from open banlist to closed allowlist — single `bds-` namespace, structural-only modifiers, slot vocabulary enumerated in `docs/SLOT-ALLOWLIST.md`. Stops the `__lead` / `__plan-name` drift mechanism at the source. **§2's closed allowlist is superseded by ADR-017** (structural pattern gate); §1/§3/§4 stand. |
| [ADR-009](./ADR-009-typegen-component-axes.md) | **Accepted** (2026-05-13) | Typegen for component axis matrix — `scripts/generate-component-axes.mjs` derives `manifest/component-axes.json` from TypeScript exports; CI gate + re-introduced `invented-variant` lint rule. Fixes the ADR-008 equivalent for variant/size/appearance values. |
| [ADR-011](./ADR-011-service-line-token-value-model.md) | **Accepted** (2026-06-02) | Service-line token value-model — Brand Kit Figma is SoT. No-suffix default = base hue (mode-invariant); tone/context variants mode-aware; no per-service `-inverse`. Reverses three #563 criteria; mandates a consumer migration (ServiceTag, HeroSplitImageCardOverlay, brikdesigns). |
| [ADR-012](./ADR-012-link-component-escape-hatch.md) | **Accepted** (2026-06-16) | `linkComponent` escape hatch — nav-owning components (`NavItem`/`SidebarNavigation`/`SubNavigation`/`Footer`/`Breadcrumb`/`TabBar`/`TopNavigation`/`Menu`/`Pagination`) accept a router-aware component (Next.js/Remix `Link`) instead of emitting a bare `<a>` that forces a full-page reload; falls back to `<a>` when `disabled` or `href`-less. |
| [ADR-013](./ADR-013-token-last-mile-enforce-contract-complete-emission.md) | Proposed | Token last mile — the system is ~80% built; recurring consumer gaps come from partial mode emission + an unenforced cascade contract, not the design. Complete emission (#340 as a project + source↔emitted CI check), enforce the contract via a BDS-owned redefinition gate consumers import, and make cascade.mdx the canonical adoption contract. |
| [ADR-014](./ADR-014-component-token-hook-namespace.md) | Proposed | Tier 4 component-token hook namespace — `--bds-{component}-{property}` is the sole sanctioned Component-tier shape; retires `--bp-*` and bare `--{component}-*` (migrate). Tier 4 knobs must resolve to a Semantic token, never a raw literal. `lint-tokens` blesses `--bds-*` by rule + flags fallback-literals; fills the "deliberately unspecified" Tier 4 placeholder. |
| [ADR-015](./ADR-015-brand-primary-aa-large-contrast-policy.md) | Proposed | Brand-primary holds the vibrant brand color (`poppy-light` #e35335) per the brand-kit SoT; its CTA fills + accent text are gated **AA-large (3:1)**, not AA — reverses the #710/#719 darkening to `poppy-dark`. Reclassifies three brand pairings in `contrast-pairings.json`. The "small body copy never uses brand-primary" usage rule is **advisory, not yet CI-asserted** (enforcement → BDS-18). |
| [ADR-016](./ADR-016-small-primary-button-contrast.md) | Proposed | **Decision pending owner ratification.** Extends ADR-015: white labels on the vibrant Poppy fill are 3.78:1 and fail AA-normal at *every* button size (all labels are 600-weight, ≤20px — none qualify as WCAG large text). Frames four remedies (A bold+large / B size floor / C AA-passing near-Poppy step via #1065 / D formalize AA-large + add a min-size floor) with tradeoffs; resolves #479. |
| [ADR-017](./ADR-017-slot-pattern-gate-supersedes-closed-allowlist.md) | **Accepted** (2026-07-05) | Slot governance flips from ADR-008 §2's closed enumerated allowlist to a **structural pattern gate** (`scripts/slot-pattern-check.mjs`) enforcing the §4 grammar by shape. Phase C's allowlist lint never shipped; 329 of 396 in-use slots were unlisted, so enumeration was unpayable. New well-formed slots need no canon edit; only off-pattern shapes fail. §1/§3/§4 stand (#1137). |
| [ADR-018](./ADR-018-card-preset-boundary.md) | **Accepted** (2026-07-05) | The far boundary of a `preset` (companion to ADR-004): a preset is legitimate only as the *same bounded surface in a generic, content-agnostic arrangement*; once it becomes content-typed, parent-arranged, or composition-blocking it's a Block/Section/Component. Classifies `Card` — `control`/`summary` keep as presets; `display`/`display-row` kept but re-scoped as `CardGrid` cells (keep-and-clarify: fix `<h3>`/tint rigidity + Storybook hygiene; full extraction rejected on cost — 0 app usage, ~15 web/brikdesigns sites). |
| [ADR-020](./ADR-020-service-surface-inverse.md) | **Accepted** (shipped v0.107.0) | Service-line surface `-inverse` — re-admits a per-service `-inverse` for the **surface** purpose only (white in light → `{hue}-darkest` in dark) for service-identified hero cards. Narrows ADR-011 §Decision pt-3; bg/text/border keep neutral inverse + `-on-*`. (Renumbered from a duplicate ADR-012 — the number belongs to the `linkComponent` escape hatch.) |

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
