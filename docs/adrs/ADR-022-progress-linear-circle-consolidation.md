# ADR-022 — Consolidate ProgressBar + ProgressCircle into `Progress`

**Status:** Proposed
**Date:** 2026-07-26
**Supersedes:** —
**Superseded by:** —
**Owner:** Nick Stanerson
**Related:** [ADR-004](./ADR-004-component-bloat-guardrails.md) §3 + Amendment 2026-05-17 (component purpose test) — the precedent this ADR applies; [#1461](https://github.com/brikdesigns/brik-bds/issues/1461) (this decision)

## Context

`ProgressBar` ([`components/ui/ProgressBar/ProgressBar.tsx`](../../components/ui/ProgressBar/ProgressBar.tsx)) and `ProgressCircle` ([`components/ui/ProgressCircle/ProgressCircle.tsx`](../../components/ui/ProgressCircle/ProgressCircle.tsx)) are both fraction-fill progress indicators — a 0–100 `value`, `role="progressbar"`, a 0–100 clamp, and a `fillColor` escape hatch — differing only in geometry (horizontal strip vs. SVG ring).

Confirmed current prop surfaces (line refs re-verified against `main` on 2026-07-26 — issue #1461's citations are accurate):

| Prop | `ProgressBar` ([L8–15](../../components/ui/ProgressBar/ProgressBar.tsx#L8-L15)) | `ProgressCircle` ([L8–23](../../components/ui/ProgressCircle/ProgressCircle.tsx#L8-L23)) |
|---|---|---|
| `value: number` (0–100) | ✅ | ✅ |
| `label?: string` | ✅ | ✅ |
| `fillColor?: string` | ✅ | ✅ |
| `size?: 'sm' \| 'md' \| 'lg'` | ❌ | ✅ (diameter preset — 64/96/128px) |
| `status?: 'default' \| 'positive' \| 'warning' \| 'negative'` | ❌ | ✅ |
| `indeterminate?: boolean` | ❌ | ✅ |
| `showValue?: boolean \| ReactNode` | ❌ | ✅ (centered slot) |

`ProgressBar` has **zero props ProgressCircle lacks** — its entire API (`value`, `label`, `fillColor`) is a strict subset of `ProgressCircle`'s. Both render `role="progressbar"` with an identical `aria-valuenow`/`aria-valuemin`/`aria-valuemax` contract and an identical `Math.min(100, Math.max(0, value))` clamp ([`ProgressBar.tsx:38`](../../components/ui/ProgressBar/ProgressBar.tsx#L38), [`ProgressCircle.tsx:76`](../../components/ui/ProgressCircle/ProgressCircle.tsx#L76) — `ProgressBar.tsx:42` and `ProgressCircle.tsx:93` are the matching `role="progressbar"` lines the issue cites). The two components only diverge in **how** the fraction is drawn (`width: %` on a div vs. `stroke-dasharray`/`stroke-dashoffset` on an SVG circle) and in the extra circle-only affordances (`size`, `status`, `indeterminate`, `showValue`).

### The precedent: ADR-004 §3 + the component-purpose-test amendment

[ADR-004](./ADR-004-component-bloat-guardrails.md) §3 states: *"Three components for the same shape is a fork. If components A/B/C have the same value shape and differ only in suggestion source, render-mode, or container, they should be one component with a prop."* That rule folded the standalone `ProgressDots` into `ProgressStepper`'s `variant="dots"` — documented at [`progress-stepper.mdx:10`](../../docs-site/content/docs/components/progress-stepper.mdx#L10): *"same shape, same logic, different layout = one component with a variant prop, not two."*

ADR-004's later **Amendment 2026-05-17 (component purpose test)** refined this: before applying the overlap rule, ask *"would a designer or developer reach for this by name because it has a distinct UX contract?"* If yes, it's a standalone **Component**. If the difference is a "distinct contextual expression that carries its own semantic signal... a designer would choose it intentionally in a wireframe," it's a **Variant** of one component, not two components. `SearchInput` stayed separate from `TextInput` under this test because it has a distinct UX contract (clear-button interaction, `role="search"`). `ProgressDots`/`ProgressStepper` collapsed because both encode the same job ("where am I in a sequence") with no behavioral divergence — layout only.

Applying the purpose test to `ProgressBar` vs. `ProgressCircle`:

- **Distinct UX contract?** No. Neither has unique interactive behavior, a different ARIA role, or a different data model. Both are a passive, non-interactive fraction-fill display of the same `value: number` (0–100).
- **Would a designer choose the shape intentionally?** Yes — but that's exactly the **Variant** tier definition ("a distinct contextual expression... a designer would choose it intentionally"), not the **Component** tier. A designer picking "circular tile for a dashboard" vs. "linear bar for an upload" is choosing a variant of one job, the same way a designer picks `ProgressStepper`'s `dots` vs. `steps` for one job ("show sequence position").
- **Overlap:** `ProgressBar`'s full API is a strict subset of `ProgressCircle`'s (3/3 props shared, 0 unique). This is a *stronger* overlap signal than `ProgressDots`/`ProgressStepper` had (those diverged on `activeStep`/step-list shape as well as render mode) — `ProgressBar` and `ProgressCircle` diverge on render mode only.

The purpose test places `ProgressBar`/`ProgressCircle` in the same bucket as `ProgressDots`/`ProgressStepper`: same job, Variant-tier divergence, not Component-tier divergence.

## Decision

**Approve consolidation.** Fold `ProgressBar` and `ProgressCircle` into a single `Progress` component with a discriminated-union `variant` prop:

```tsx
type ProgressProps =
  | ({ variant: 'linear' } & ProgressCommonProps)
  | ({ variant: 'circle' } & ProgressCommonProps & { size?: 'sm' | 'md' | 'lg' });

interface ProgressCommonProps {
  value: number;
  label?: string;
  fillColor?: string;
  status?: 'default' | 'positive' | 'warning' | 'negative';
  indeterminate?: boolean;
  showValue?: boolean | ReactNode;
}
```

`variant` defaults to `'linear'` (preserves today's `ProgressBar` as the zero-config path). The internal render still branches into two DOM shapes (a `div` fill for `linear`, an `svg` ring for `circle`) — consolidation is at the **public API / component-identity** level (one export, one Storybook entry, one MDX page), not a claim that the two render paths become one JSX tree.

### API-divergence resolution

The issue asks explicitly whether `size`/`status`/`indeterminate`/`showValue` extend to the linear variant or stay circle-only. Per-prop:

| Prop | Linear | Circle | Why |
|---|---|---|---|
| `status` | **Extends** | Extends (unchanged) | Semantic state color, not a geometry concern — a linear upload bar failing (`status="negative"`) is exactly as valid a state as a circle doing so. |
| `indeterminate` | **Extends** | Extends (unchanged) | Indeterminate linear bars (animated stripe/sweep) are a standard pattern for unknown-duration linear progress — this is not a circle-only concept, it's a value-unknown concept. |
| `showValue` | **Extends** | Extends (unchanged) | A centered/overlaid percentage label is a legitimate linear-bar affordance (label rendered over or alongside the fill) and costs nothing to support since `label` already exists on both. |
| `size` | **Stays circle-only** | Extends (unchanged) | `size` today is a **diameter preset** (`sm` 64px / `md` 96px / `lg` 128px) — a circle-specific geometry concept with no linear analog in the current API. `ProgressBar` has never had a size axis. Inventing a linear "size" (bar height/thickness scale) as part of this consolidation would be a **new feature**, not a migration — out of scope here. If a linear size axis is wanted later, it's a separate, explicitly-scoped addition with its own three-uses justification per ADR-004 §2. |

### Migration is a separate Project

This ADR is the **decision only**. The breaking-change migration — new `Progress` export, deprecation/removal of `ProgressBar` and `ProgressCircle`, and updates across the **6 downstream `@brikdesigns/bds` consumers** — is explicitly **out of scope for this task** and is tracked as a separate follow-up Project once this ADR is accepted. That Project's scope includes:

- Ship `Progress` alongside the existing components (non-breaking additive release)
- Update Storybook + MDX docs (`docs-site/content/docs/components/progress.mdx` replacing `progress-bar.mdx` / `progress-circle.mdx`, with redirects/deprecation notices)
- Migrate the 6 downstream consumer repos off `ProgressBar`/`ProgressCircle` call sites
- Remove `ProgressBar`/`ProgressCircle` exports in a subsequent major/minor per BDS's normal deprecation window

### Out of scope (explicit, per issue #1461)

- **`Stepper`** — numeric +/− input, unrelated job.
- **`ProgressStepper`** — multi-step sequence indicator; already consolidated per ADR-004 §3 and untouched by this decision.
- **`Meter`** and **`Counter`** — unrelated jobs, not part of the linear/circle fraction-fill pair this ADR addresses.

## Rationale

- **The purpose test (ADR-004 amendment) places this at Variant tier, not Component tier.** Neither component has a distinct interactive behavior, ARIA role, or data model — the only difference is render geometry, which is precisely the shape ADR-004 §3 already resolved once (`ProgressDots` → `ProgressStepper` `variant="dots"`).
- **The overlap signal is stronger than the precedent case.** `ProgressBar`'s 3 props are a 100% subset of `ProgressCircle`'s 7 — there is no `ProgressBar`-only prop that would need to be "lost" or awkwardly special-cased in a merge.
- **Four of five diverging props extend cleanly.** `status`, `indeterminate`, and `showValue` are semantic/value concerns, not geometry concerns — they were only circle-only because `ProgressCircle` was built second and accreted them; they're equally meaningful on a bar. Only `size` (a literal diameter number) has no linear equivalent today, and manufacturing one isn't required to consolidate.
- **One progress-bar mental model beats two exports that already tell consumers they're siblings** — both components' own docs already describe each other as "siblings" (`progress-circle.mdx`: *"ProgressCircle is the circular sibling of ProgressBar"*). The sibling framing is the documentation compensating for what should be one component.

## Alternatives considered

- **Keep separate (reject consolidation).** Considered seriously given `ProgressCircle` carries real extra surface (SVG geometry, center-slot layout) that a merged component's internals must still branch on — consolidation doesn't remove that complexity, it only moves the branch point from "two files" to "one file's render function." Rejected because the purpose test doesn't support treating this as two components: there's no distinct UX contract, and the existing precedent (ProgressDots/ProgressStepper) already established that render-mode-only divergence on the same job goes to one component with a variant prop. Keeping them separate would mean the same overlap-rule violation ADR-004 §3 was written to catch (three-components-for-the-same-shape, here two-for-the-same-shape) survives unresolved right next to the ADR that fixed the sibling case.
- **Extend `size` to linear now, as part of the same decision.** Rejected — no existing `ProgressBar` consumer has asked for a bar-height axis, and inventing one to make the merged API "symmetric" would be scope creep beyond what #1461 asks for. If real demand appears, it gets its own three-uses justification.
- **Fold into `ProgressStepper` as a third variant (`variant="fraction"`) instead of a new `Progress` component.** Rejected — `ProgressStepper`'s data model is a step list + `activeStep`; `ProgressBar`/`ProgressCircle`'s data model is a single `value: number`. Forcing both into one component would be exactly the "different shape, same component" anti-pattern ADR-004 warns against in the other direction — a real Component-tier distinction (different value shape) exists between "sequence position" and "fraction complete," even though none exists between "bar" and "circle."

## Consequences

### Positive

- One export, one Storybook entry, one MDX page instead of two near-identical surfaces to keep in sync on every future prop addition (status tokens, a11y fixes, etc. — each currently has to land twice)
- Closes the exact overlap-rule gap ADR-004 §3 exists to catch, applied symmetrically to a pair the original audit didn't reach
- `status`/`indeterminate`/`showValue` become available on the linear variant for free, at zero net-new-prop cost

### Negative

- Breaking-change migration cost across 6 downstream consumers (scoped separately, not free — tracked as its own Project)
- The merged component's internals still branch by variant (different DOM: `div` fill vs. `svg` ring) — consolidation is an API/identity simplification, not an implementation simplification
- Existing `ProgressBar`/`ProgressCircle` MDX pages, Storybook entries, and any external links to them need a deprecation/redirect story as part of the follow-up Project

### Neutral

- `size` staying circle-only means the merged API is intentionally asymmetric across variants — documented above so it isn't read as an oversight during the migration Project's implementation.

## Migration

Not performed by this ADR. Tracked as a separate follow-up Project scoped in the Decision section above, to be sized and queued once this ADR is accepted.

## Enforcement

- ADR status flips to **Accepted** once the follow-up migration Project is scoped and queued (per the ADR-README convention: "Accepted" means the artifacts are real, not merely decided).
- The follow-up Project's PR(s) reference this ADR and satisfy ADR-004 §5's audit-gate questions for the new `Progress` component.
