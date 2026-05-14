# ADR-010 — Storybook axes of information: story vs. control vs. toolbar

**Status:** Accepted (2026-05-13); Amended (2026-05-14 — Q3 axis clarification + Patterns/Forms relocation; 2026-05-14 §2 — input-component specialization rule, all driven by [#618](https://github.com/brikdesigns/brik-bds/issues/618))
**Date:** 2026-05-13
**Supersedes:** Part of [ADR-006 §Part B](./ADR-006-storybook-taxonomy-and-story-shape.md) — operational decision about *which axis becomes a story* now lives here. ADR-006 retains the two-shape model.
**Superseded by:** —
**Related:** [ADR-006](./ADR-006-storybook-taxonomy-and-story-shape.md) (story shape + sidebar taxonomy), [ADR-007](./ADR-007-storybook-page-recipe.md) (MDX page recipe), [ADR-009](./ADR-009-typegen-component-axes.md) (manifest-typegen for axis names), [#569](https://github.com/brikdesigns/brik-bds/issues/569) (story-shape lint), [#587](https://github.com/brikdesigns/brik-bds/issues/587) (parent: rearchitect Storybook standards)
**Owner:** Nick Stanerson

## Context

ADR-006 §Part B answered "how many story shapes does a file ship" — two: `Playground` + one story per meaningful state. It did **not** answer the operational question authors actually hit at the moment of writing a file:

> I have N props. Which ones become stories, which become controls, and which become global toolbar switches?

The 2026-04 audit and the ADR-006 sweep that followed gave us the *shape* of a story file but not the *decision procedure* for what populates it. Three concrete symptoms in the current corpus:

1. **[`Button.stories.tsx`](../../components/ui/Button/Button.stories.tsx) exports 22 stories.** `Disabled`, `Loading`, `WithIconBefore`, `WithIconAfter` — all of these are *boolean / icon-content* states that should be Controls on every variant story, not standalone stories. The file's a gallery again, just spread across exports instead of stacked in a `render`.
2. **No standard names the toolbar-global axis.** Theme, density, viewport, locale, motion reframe every story — but the existing writing guide treats them as ad-hoc decorator territory. Authors keep inventing per-component `Dark` / `Mobile` stories that should be a global switch.
3. **`argTypes` is treated as decoration, not load-bearing.** Several files omit `argTypes` entries on props that *do* have a discrete union, leaning on inferred Controls. That works for the local dev experience but breaks the MCP `get-documentation` payload — agents in consumer repos can't see the option list, so they invent values that don't exist.

The missing piece is a **first-yes-wins matrix** that takes a prop / state / scenario and routes it to its correct home. That matrix is this ADR.

ADR-010 is the operational layer ADR-006 needed. ADR-006 stays canonical for taxonomy + the two-shape rule; ADR-010 governs which axis becomes which kind of artifact.

**Named reference: [Carbon Design System's Accordion page](https://react.carbondesignsystem.com/?path=/story/components-accordion--default&args=isFlush:!true).** Carbon ships ~6 stories per component, with the bulk of the prop matrix driven by Controls on a single canonical story. Our target is the same ratio.

## Decision

For every prop, state, or scenario, ask the matrix below in order. **First yes wins.**

### The story-vs-control matrix

| Q | Question | Outcome |
|---|---|---|
| 1 | Is this an orthogonal environmental axis that should reframe **every** story? (theme · density · viewport · locale · motion) | **Toolbar global** — a decorator wired in `.storybook/preview.tsx`. Never a story export. |
| 2 | Is this a prop on the component whose value is a state but **not** a semantic starting point an agent would reach for? (`disabled`, `loading`, `fullWidth`, icon presence, content length) | **`argTypes` only** — no story export. Surfaces in Controls + MCP. |
| 3 | Is this a prop value an agent would reach for as a **starting template**? (`variant: 'destructive'` for a delete CTA; `variant: 'outline'` for a secondary action; `tone: 'warning'` for a recoverable error) | **Dedicated args-driven story** named after the value (`Destructive`, `OutlineSecondary`, `Warning`). |
| 4 | Is this a multi-component composition or hook-driven state machine that args genuinely can't express? | **Irreducible render-mode story** under the ADR-006 §exception. Name it after the composition (`InsideForm`, `WithControlledToggle`). |
| 5 | Is this an interaction assertion that requires a `play` function? | **`play`-only `InteractionTest…` story** tagged `['!manifest']` so it doesn't pollute MCP discovery. |

Q1 wins over Q2 wins over Q3 wins over Q4 wins over Q5. If a candidate hits Q1, do not also ship it as a story under Q3 just because "it'd be nice to see." That's how files grow back to 22 exports.

### `argTypes` is load-bearing

The discipline behind Q2 is that **`argTypes` is the single declaration that feeds three consumers at once**:

- The MCP `get-documentation` payload (agents in `brik-client-portal`, `renew-pms`, `freedom-client-portal` read it to pick BDS primitives correctly)
- The `<ArgTypes>` MDX table on the docs page (ADR-007 recipe)
- The Controls panel in the Storybook dev UI

The Controls panel is a free byproduct of doing `argTypes` correctly — agents don't drag sliders, but they do read the enum unions. **Every prop on a component gets an `argTypes` entry** with its `control` shape + (when TS can't infer the union) an explicit `options` array. Description is required when the prop name doesn't already say it.

Treating `argTypes` as decoration is the failure mode that produces Q3 inflation: authors compensate for missing Controls by adding stories.

### Composite components — the 3-col-grid problem

When a component composes multiple primitives (a `PricingCard` with a `Header`, a `FeatureList`, and a `CTAButton`; a `Hero` with a media slot, a title, and an action row), naive `argTypes` produces a flat shape that buries the composition.

The pattern, promoted from the pre-reorg `docs/STORYBOOK-WRITING-GUIDE.md` "Args composition for blueprints" section (folded into [`.claude/standards/storybook-story-shape.md`](../../.claude/standards/storybook-story-shape.md) and canonical here):

```tsx
// args is composed: slot props are typed as the leaf component's args shape
type PricingCardArgs = {
  header: Args<typeof PricingHeader>;
  features: Args<typeof FeatureList>;
  cta: Args<typeof Button>;
};

export const Playground: Story = {
  args: {
    header: { plan: 'Pro', price: '$49' },
    features: { items: ['Unlimited', 'Priority support'] },
    cta: { variant: 'primary', label: 'Start trial' },
  },
};
```

The composite reads as one story; each leaf-slot still has its own `argTypes` shape feeding MCP / Controls. Don't flatten to `headerPlan`, `headerPrice`, `feature1`, `feature2` — that erases the slot structure agents need to recognize the pattern.

### Applied — Button before / after

The Button story file is the named test case. **Before the audit: 22 exports.**

| Today | ADR-010 disposition | Why |
|---|---|---|
| `Playground` | Keep | Canonical sandbox |
| `Primary` `Secondary` `Outline` `Ghost` `Inverse` `OnColor` `Danger` `DangerOutline` `DangerGhost` `Destructive` `Positive` `Selected` | Keep (12) | Q3 — each is a semantic starting point an agent reaches for |
| `Disabled` `Loading` | Collapse | Q2 — boolean state, becomes Control on every variant |
| `WithIconBefore` `WithIconAfter` | Collapse | Q2 — icon-slot prop, becomes Control |
| `FullWidth` | Collapse | Q2 — boolean, becomes Control |
| `Sizes` | Keep | ADR-006 axis-only-gallery exception (one axis, side-by-side comparison) |
| `Tiny` `Small` `Medium` `Large` `ExtraLarge` | Collapse into `Sizes` | Q2 — covered by the axis gallery |

**After: ~13 exports** (Playground + 12 semantic variants + 1 `Sizes` axis gallery). Same coverage, ~40% fewer exports, every state navigable via Controls on every story.

### Applied — components without a variant axis

> **Amendment 2026-05-14** — clarifies Q3 for non-variant components and adds the
> `Patterns/Forms/` relocation rule. Driven by [#618](https://github.com/brikdesigns/brik-bds/issues/618).

The Button example demonstrates the matrix when a component HAS a variant axis (Q3 stories = one-per-variant). The case that needed clarification: **components with no variant axis** (`Checkbox`, `Radio`, `TextInput`, `Select`, `TextArea`, `CompletionToggle`, etc.).

For these, Q3 candidates collapse to one of three named axes — any other axis falls through to Q2 (Controls):

| Q3 axis | When to split | Example |
|---|---|---|
| **Orientation** | Component arranges children differently along one axis | `Radio`: `Horizontal` + `Vertical` (radio group orientation) |
| **Layout** | Multi-component arrangement that can't be a single prop | `ButtonGroup`: `Segmented` + `Spaced` |
| **Distinct semantic variant** | Each variant has different ARIA role, leading icon, or contextual semantics | `Banner`: `Announcement` (`role="banner"`) vs `Information`/`Warning`/`Error` (`role="alert"` + Badge); `Toast` follows same logic |

If none of the three apply, the file ships **one** `Default` story — interactive on first render, with all props as Controls. Carbon's [Checkbox page](https://react.carbondesignsystem.com/?path=/story/components-checkbox--default) is the named target shape.

This closes the loophole where authors looked at `Checkbox` / `TextInput` and added per-state stories (`Checked`, `WithLabel`, `WithError`, `Disabled`) because the matrix's "semantic starting point" phrase was read permissively. Those are Q2 — Controls.

### Multi-component compositions live in `Patterns/Forms/`

> **Amendment 2026-05-14** — relocation rule for Form compositions.

When a story demonstrates a composition of multiple primitives (a `ContactForm` with `TextInput` + `Select` + `Button`; a `LoginForm` with `TextInput` + `PasswordInput` + `Button`), the composition lives in `Patterns/Forms/<pattern>.stories.tsx`, **not** on the primitive's story file.

Rationale:

1. The composition is not a starting template for the primitive — it's a Form pattern that happens to use the primitive
2. Co-locating with the primitive would duplicate the same composition across N primitive files (the `ContactForm` story would belong on `TextInput` AND `Select` AND `Button`)
3. `Patterns/` is the reserved-but-empty sidebar group named in [ADR-006](./ADR-006-storybook-taxonomy-and-story-shape.md) — this populates it

Scope: applies to compositions that combine **multiple distinct primitives**. A `Radio` group of multiple `Radio` instances showing orientation stays on the primitive (single-primitive composition demonstrating an Orientation axis per the table above).

### When does a specialized input deserve its own component?

> **Amendment 2026-05-14 §2** — input-component specialization rule.
> Driven by [#618](https://github.com/brikdesigns/brik-bds/issues/618) Batch A
> (TextInput / EmailInput / PhoneInput question).

The matrix decides which AXIS becomes a story. This section decides which AXIS warrants a whole new component in `Components/Input/` vs. living as a `<TextInput type="..." iconBefore={...} />` usage pattern on the existing generic primitive.

A specialized input component (`Components/Input/<Name>`) is justified IFF it has at least one of:

1. **Unique interactive behavior** beyond the `type` attribute — visibility toggles, autocomplete dropdowns, debounced onChange, clear buttons
2. **Format mask or input transformation** — auto-formatting (phone `(555) 123-4567`), increment / decrement steppers, currency rounding
3. **Composed sub-controls** — country-code selector, currency selector, unit toggle

If the only differences from `TextInput` are **defaults** (icon convention, `type` attribute, `autoComplete`), it's a **usage pattern**, not a component. The consumer sets those props inline; we don't ship a wrapper.

| Specialized | Verdict | Rationale |
|---|---|---|
| `PasswordInput` (existing) | ✅ Keep | Visibility toggle is unique behavior |
| `AddressInput` (existing) | ✅ Keep | Suggestion dropdown is unique behavior |
| `PhoneInput` | 🟡 Future-scope | Format mask + country-code selector |
| `NumberInput` | 🟡 Future-scope | Increment / decrement steppers |
| `SearchInput` | 🟡 Future-scope | Clear button + debounced onChange |
| `EmailInput` | ❌ Never | No unique behavior — just `type="email"` defaults |
| `URLInput` | ❌ Never | Same as Email |

Rationale: 5 specialized inputs that all wrap TextInput introduce drift risk (focus ring, error styling, sizing tokens diverging across siblings), maintenance overhead (every TextInput improvement propagated to N wrappers), and MCP discovery noise (agents disambiguating between TextInput and EmailInput when the only difference is a default). The bar for promotion has to be real behavior, not naming.

The decision rule applies symmetrically to other primitive families — `Button` doesn't get `SaveButton` / `DeleteButton` wrappers because those are usage patterns of `variant` + `children`. The same logic applies here.

### The five toolbar globals

Names and intent locked here, even when not yet wired:

| Axis | Values | Wired? | Standard |
|---|---|---|---|
| **theme** | `brik` (light) · `brik-dark` · `client-sim` (font audit) | Yes (existing — `themeNumber` global) | [storybook-toolbar-globals](../../.claude/standards/storybook-toolbar-globals.md) |
| **base font** | `14` · `16` · `18` · `20` px | Yes (existing — `baseFont` global; partial density proxy via rem scaling) | storybook-toolbar-globals |
| **motion** | `on` · `off` | Yes (existing — `animations` global) | storybook-toolbar-globals |
| **viewport** | `mobile` (375) · `tablet` (768) · `desktop` (1280) | **Phase 1 wires** — see #587 PR-B | storybook-toolbar-globals |
| **density** | `compact` · `comfortable` · `spacious` | Future — true density-token tier; `baseFont` is the proxy today | storybook-toolbar-globals |
| **locale** | `en-US` · `en-US-pseudo` (length sim) | Future — i18n decorator infra | storybook-toolbar-globals |

A future viewport / density / locale / motion story export is **always wrong** — those are toolbar globals by Q1. The standard is the source of truth for the values; this ADR is the source of truth for the rule.

### `play`-only stories tag with `!manifest`

Q5 stories exist for interaction assertions; they are not artifacts an agent should recommend from `get-documentation`. Tag them `['!manifest']` so MCP discovery skips them, and name them with the `InteractionTest…` prefix so a human reader knows what they are at a glance.

## Migration

**Forward-only**, consistent with ADR-006's posture.

- **New component story files** apply the matrix from day one. No `Disabled` / `Loading` / icon-slot stories — those are Controls.
- **Existing files** keep whatever shape ADR-007's recipe pass + the storybook-writing skill left them in. **Do not retroactively rewrite** to match this ADR.
- **Phase 2 picks one reference component** (recommend `Banner` — tone axis, small surface, clean state matrix) and migrates it end-to-end as the gold-standard template.
- **Phase 3 batch-migrates** in groups of 9–12 components, ordered by complexity (mechanical → narrative → authoring), one PR per batch. Pattern mirrors the ADR-007 rollout.
- **Phase 4 wires the lint** that bans `Variants` / `Tones` / `Patterns` / `Examples` story exports in new files (closes [#569](https://github.com/brikdesigns/brik-bds/issues/569)).

## Rationale

- **Story files were drifting back into gallery shape via per-state exports.** ADR-006 banned `Variants` containers; it didn't ban `Disabled` + `Loading` + `WithIconBefore` + `WithIconAfter` as separate stories. ADR-010 closes that loophole.
- **`argTypes` is the load-bearing declaration**, not the Controls panel. Naming `argTypes` first in the matrix surfaces what actually feeds MCP and the docs page.
- **Toolbar globals are an unmarked axis today.** Naming them as Q1 makes the axis explicit and tells authors where future viewport / density / locale stories *don't* go.
- **Carbon's accordion page is the named target.** Six stories, the rest is Controls. We've shipped 22-export files because no decision rule said "fewer." The matrix is that rule.
- **Composite components needed a canonical pattern.** The slot-typed `args` shape was in the writing guide as an example; promoting it to ADR makes it the answer when the question recurs.

## Alternatives considered

- **No matrix, soft rule "prefer Controls."** Rejected — soft guidance is what produced 22 Button stories. The same shape of pushback ADR-006 already resolved at the file layer.
- **Story-shape lint as the gate, no ADR.** Rejected — lint catches *named* violations (`Variants`, `Patterns`). It doesn't catch `Disabled` and `Loading` as separate exports because those are valid identifier names. The rule has to live above the lint.
- **Per-component overrides.** Rejected — every component author would self-justify an override. The matrix's strength is that it applies to all components without negotiation.
- **Merge into ADR-006.** Rejected — ADR-006 is already amended once for taxonomy table top-ups; folding the matrix in would re-open it for renegotiation each time the matrix evolves. Separate ADR keeps the layers clean.

## Consequences

### Positive

- File-level story counts drop ~30–40% (Button: 22 → ~13) without losing coverage
- MCP `get-documentation` payloads carry the full prop matrix via `argTypes`, not a stories-only sample
- Toolbar globals get a canonical home — no more per-component `Dark` / `Mobile` stories
- Composite components have a single canonical args shape (the slot pattern) instead of ad-hoc flattening
- New authors have a single decision procedure that fits in five questions

### Negative

- One-time review pressure when the lint flips — Phase 4 forces authors to apply the matrix retroactively to any file they touch
- Slot-typed args produces more complex `argTypes` declarations on composite components (mitigated by the [storybook-story-shape standard](../../.claude/standards/storybook-story-shape.md) carrying the canonical example)

### Neutral

- The Controls panel becomes more crowded on individual stories (every prop has an entry). This is desired — fewer stories, richer controls.

## Enforcement

- **PR review** against the matrix is the primary gate. The [storybook-story-shape skill](../../.claude/skills/storybook-story-shape/SKILL.md) auto-invokes on `*.stories.tsx` edits and pulls the matrix from brik-rag.
- **Story-shape lint** (closes [#569](https://github.com/brikdesigns/brik-bds/issues/569)) — Phase 4 wires the lint that bans the named story-export anti-patterns (`Variants`, `Tones`, `Patterns`, `Examples`) in new files. The matrix's broader rule (Q2 collapses) stays PR-review-enforced.
- **MCP audit** — the `extract-component-inventory.ts` script (PR-C of #587 Phase 1) walks `*.stories.tsx`, surfaces export counts + `argTypes` coverage gaps, and upserts to the Notion Components DB. The Notion view becomes the "outliers" dashboard for review.
- **Existing files are not retroactively swept.** Phase 2 picks one reference; Phase 3 batch-migrates; the matrix applies to new files from acceptance date forward.

## Open questions tracked separately

- **Density tier.** Token-side work hasn't landed; the standard names the axis but doesn't wire it. Re-open when density tokens ship.
- **Locale decorator.** Pseudo-locale (length simulation for layout-bug discovery) is cheaper than real i18n infrastructure and gives 80% of the value. Decision deferred to whichever PR wires the addon.
- **Motion decorator.** `prefers-reduced-motion` is straightforward to wire but needs a story-level opt-in for components that genuinely don't have motion (most). Defer until a motion-heavy component (e.g., toast cascade, skeleton shimmer) needs the gate.
