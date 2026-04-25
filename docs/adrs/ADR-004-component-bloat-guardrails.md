# ADR-004 — Component Bloat Guardrails

**Status:** Proposed
**Date:** 2026-04-24
**Supersedes:** —
**Superseded by:** —
**Owner:** Nick Stanerson

## Context

A 2026-04-24 Storybook taxonomy audit surfaced a class of bloat that is hard to spot because each instance was created in response to a real problem:

1. **`SheetTypography`** — 4 components (`SheetSectionTitle`, `SheetFieldLabel`, `SheetFieldValue`, `SheetHelperText`) created after the 2026-04-22 portal audit flagged a label-larger-than-heading inversion. The components encode the corrected typography tiers as named primitives. Currently consumed by 5 portal sheets.
2. **`Addable*` family** — 3 components (`AddableTextList`, `AddableComboList`, `AddableEntryList`) with ~80% shared code. Tracked separately in [ADR-003](./ADR-003-addable-list-family.md).
3. **`SheetSection.heading` vs `SheetSectionTitle`** — two separate heading-tier components for the same surface, encoding a legacy uppercase tier and a newer heading-family tier.

The pattern: a real problem → a new named component → that component becomes the precedent → the next surface (Card, Modal, Page) reaches for the same shape and we end up with `CardSectionTitle`, `ModalFieldLabel`, `PageHelperText` ad infinitum (N containers × M typography tiers = N×M components).

Each step was locally reasonable. The aggregate is not.

## Decision

### Resolve the existing instances

1. **Fold `SheetTypography` into existing primitives.** Add `tier?: 'standard' | 'compact'` to `Field` (compact swaps to `--label-sm`); add `helperTone?: 'neutral' | 'error'` to `Field`'s helper slot. Migrate 5 portal sheets. Delete `SheetTypography`. Tracked as a separate task.
2. **Pick one section-heading tier and retire the other.** Either deprecate `SheetSection.heading` (legacy `--label-sm` uppercase muted) in favor of `SheetSectionTitle` (`--heading-sm` semibold) — or vice versa. Update existing consumers. Tracked as a separate task.
3. **Execute [ADR-003](./ADR-003-addable-list-family.md)** for the Addable* family.

### Guardrails for new components going forward

These rules apply to every BDS component PR after this ADR is accepted.

1. **Container-coupled typography is forbidden.** Components named `<Container>X` (e.g., `SheetSectionTitle`, `CardFieldLabel`, `ModalHelperText`) that exist solely to encode "use these typography tokens in this container" must not be added. Encode the rule in the typography token system, in the primitive's props (`tier`, `tone`), or in container-scoped CSS. Discoverability lives in MDX, not in named exports.
2. **The "three uses" test.** Before introducing a new component, identify three real, distinct uses across the codebase or documented near-term roadmap. One or two uses → inline the markup, or extend an existing primitive with a prop. Three+ uses → component is justified. Document the three uses in the PR description.
3. **>70% overlap rule.** If a proposed component shares >70% of props or CSS with an existing primitive, it must be a variant (`tier`, `appearance`, `density`, `mode`) of that primitive — not a new component. The PR must show the prop diff, not the class diff.
4. **Three components for the same shape is a fork.** If components A/B/C have the same value shape and differ only in suggestion source, render-mode, or container, they should be one component with a prop. The Addable* family is the canonical anti-example.
5. **Audit gate.** Every PR adding a `components/ui/*` component must answer in the description:
   - Which existing BDS component does this replace, extend, or sit beside? (link)
   - What 3+ uses justify it? (paths or near-term roadmap items)
   - What would happen if this lived inside an existing component as a variant prop?
   - Does this couple typography or styling to a container? If yes, why is that not solvable at the token layer?
6. **MDX docs are cheaper than components.** A documentation page that says "in this context, use these tokens / pass this prop" is preferred over a wrapper component that encodes the same rule. Wrapper components require: source file, CSS, types, stories, MDX, public export, version-bump on change. Documentation requires: one MDX file.

### Periodic audit

A component-bloat audit runs at least twice yearly (next: 2026-Q4) to retroactively apply these rules to existing components. Findings are tracked as separate ADRs. The first such audit pass is queued as a follow-up project after this ADR lands.

## Rationale

- **The cost of a component is not the line count.** Each component carries: types, CSS, stories, MDX, public API surface, semver impact, mental-model load on consumers, and precedent for the next decision. A wrapper component that adds nothing beyond a className costs the same as a real component.
- **Forks are the most expensive bloat because they look productive.** Three components for the same shape feels like coverage; it's actually three places that have to stay in sync forever. Each subsequent prop addition has to be evaluated 3× and tested 3× and deduplicated 3×.
- **Container-context typography rules belong in the token layer.** "Sheets use tighter typography" is a token-tier statement, not a 4-component statement. Encoding it as components ties the rule to one container and breaks when the same rule applies elsewhere.
- **The audit gate is a forcing function for honesty.** A PR description that has to enumerate three uses, name the existing primitive being skipped, and justify the non-variant choice is a PR description that almost always concludes the component shouldn't be a new component.
- **CLAUDE.md rule 8 already says this for the consumer side** ("Single-source components. Never duplicate a form, view, or interactive component across routes"). This ADR extends the same rule to the BDS internal surface.

## Alternatives considered

- **Soft guidance only.** Rejected — every existing instance of bloat was added with good intent and against soft guidance. Without a written rule and a PR-level audit gate, the next instance will look reasonable in isolation again.
- **Whitelist-only — pre-approve every new component via this ADR's process.** Rejected as too heavy. The audit-gate questions in the PR description are sufficient and don't require ADR amendments.
- **Fix the existing instances but issue no forward rule.** Rejected — leaves no precedent and no enforcement, so the same shape will reappear within a quarter.

## Consequences

### Positive

- Future BDS PRs answer "should this be a component?" before writing the component, not after
- Container-context typography lands in tokens / props / docs, not a tax of N×M wrapper components
- Existing bloat (SheetTypography, Addable*) has a written path to resolution rather than indefinite "we'll get to it"
- Reviewer leverage: the PR-description audit-gate questions are objective and don't require institutional memory to apply

### Negative

- More upfront thinking per component PR. Mitigated by the gate being four short questions in a PR description, not a separate review.
- Some real components may be slower to land while authors confirm the three-uses test. Acceptable tradeoff; bloat compounds, friction does not.

### Neutral

- This ADR may need amendment after the first periodic audit if new bloat patterns surface that aren't covered by the current rules. Expected.

## Enforcement

- ADR linked from BDS CLAUDE.md (Component Bloat Guardrails section, to be added)
- Component-bloat audit follow-up project (tracked in memory) executes the first retroactive pass
- PR review check (manual for now; can be partially automated via a CI step that fails when a `components/ui/*` PR description is missing the four audit-gate answers — separate task)
- Periodic audit cadence: twice yearly minimum
