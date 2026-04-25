# 2026-Q2 Component Bloat Audit — Pass 1

**Date:** 2026-04-24
**Auditor:** Nick Stanerson + Claude
**Scope:** First retroactive application of [ADR-004](../adrs/ADR-004-component-bloat-guardrails.md) across `components/ui/`
**Method:** Cluster-based deep read — Card, Form-input variants, Feedback/Alert, Overlay, Stepper/Indicator. Each component evaluated against ADR-004 rules: container-coupled forbidden, three-uses test, >70% overlap rule, forks-as-components.

## Headline

| Cluster | Current | Recommended | Cut |
|---|---|---|---|
| Card | 8 | 4 | −4 |
| Form input variants | 5 | 3 | −2 |
| Feedback / alert | 8 | 6 | −2 |
| Overlay | 5 | 4 | −1 (Dialog only; Menu/Popover merge rejected) |
| Stepper + indicator | 9 | 8 | −1 |
| **Total surveyed** | **35** | **25** | **−10** |

Plus the bloat already booked in [ADR-003](../adrs/ADR-003-addable-list-family.md) (Addable*: −1) and [ADR-004](../adrs/ADR-004-component-bloat-guardrails.md) §"Resolve the existing instances" (SheetTypography fold-in: −4; SheetSection.heading vs SheetSectionTitle dedupe: 0 net but tier consolidation), the full forward path retires **~16 BDS components** — roughly a 19% reduction off the current 84-component surface.

## Findings by cluster

### Card family — 8 → 4 components

**Hard cuts (forks-as-components, fold into `Card` with `variant=`):**

| Component | Evidence | Fold into | Status |
|---|---|---|---|
| `CardSummary` | 85% CSS overlap with `Card`. Fixed template (label + large-value + optional link) plus `formatValue()` helper. No use of Card's subcomponent slots. | `<Card variant="summary" formatValue="price\|numeric" />` | 12 portal consumers — pending #7c |
| `CardControl` | [CardControl.tsx](../../components/ui/CardControl/CardControl.tsx) — same base flex/border/padding-xl/surface as Card. Fixed layout (badge + title/description left, action right). No Card subcomponent reuse. | `<Card variant="control" />` | 1 portal consumer — pending #7b |
| `CardDisplay` | ~80% CSS overlap. Fixed image-header + content-body template. | `<Card variant="display" image={...} />` | **Deleted in PR #241** (zero consumers) |
| `CardFeature` | ~75% CSS overlap. Fixed icon + title/description + action with `align` control. | `<Card variant="feature" icon={...} align="left\|center" />` | **Deleted in PR #241** (zero consumers) |

**Honest:**

- `Card` — flexible composition with named subcomponents (`CardTitle`, `CardDescription`, `CardFooter`). Core primitive.
- `CardTestimonial` — distinct semantic (`<figure>` + `<blockquote>` + rating). Specialized typography (display family for quote mark). Not a Card variant.
- `CollapsibleCard` — adds expansion behavior + uncontrolled state. Real interaction, not a render preset.
- `PricingCard` — pricing-tier-specific structure (price block, feature list with checkmarks, highlighted variant). Distinct from generic Card.

**Review:**

- `CardList` — pure layout wrapper (`<ul>` with flex-gap). No surface styling. Has 3+ uses but violates ADR-004 rule 1 (container-coupled). Should be assessed against demoting to a CSS utility class or merging with a generic `Stack` / `Cluster` primitive if one exists.

### Form input variants — 5 → 3 components

**Hard cuts:**

- `EmailInput` — entire component is a 5-line wrapper that sets `type="email"` + `autoComplete="email"` + `iconBefore={<Envelope />}`. Zero unique behavior. No CSS file. **Replace with** `<TextInput type="email" autoComplete="email" iconBefore={<Icon icon={Envelope} />} />` at call sites.
- `SearchInput` — 95% wrapper. Only load-bearing piece is [SearchInput.css:39-48](../../components/ui/SearchInput/SearchInput.css#L39-L48): a `::-webkit-search-cancel-button` data-URI hack. **Replace with** `<TextInput type="search" iconBefore={<Icon icon={MagnifyingGlass} />} />` and migrate the webkit CSS into TextInput.css scoped to `[type="search"]`.

**Honest (genuinely unique behavior):**

- `TextInput` — base.
- `PasswordInput` — show/hide toggle + state + custom EyeOpen/EyeClosed SVGs + keyboard handling. Password managers expect the pattern. Load-bearing.
- `AddressInput` — composite: dropdown panel, suggestion API (`suggestions?: AddressSuggestion[]` + `onSuggestionSelect`), outside-click + Escape lifecycle, focus management. Not a wrapper.

### Feedback / alert family — 8 → 6 components

**Hard cuts:**

- `AlertBanner` ↔ `Banner` — same shape (`{title, description, action}`). [Banner.tsx:5-14](../../components/ui/Banner/Banner.tsx#L5-L14) accepts `onDismiss`; [AlertBanner.tsx:10-19](../../components/ui/AlertBanner/AlertBanner.tsx#L10-L19) accepts `variant` (warning/error/information) which adds a status icon badge. Both render the same flex-row + title/description/action layout. **Consolidate into one `Banner`** with both `tone?: 'neutral' \| 'warning' \| 'error' \| 'information'` (drives icon badge) and `onDismiss?` props.
- `Snackbar` ↔ `Toast` — same core shape. Snackbar is portal-rendered + auto-dismissing + edge-positioned + variant-changes-surface; Toast is inline + manually-dismissed + variant-only-changes-badge. **Consolidate into one `Toast`** with `isPortal?: boolean`, `position?: 'top'|'bottom'|'inline'`, `autoDismissMs?: number`, `statusSurface?: boolean` props.

**Honest:**

- `EmptyState` — content-area layout for "no data" states. No shape overlap with notifications.
- `Tooltip` — positional, transient, contextual. Distinct.
- `ProgressBar` — single-purpose progress indicator. Used internally by `TaskConsole` — that composition is correct, not duplication.
- `TaskConsole` — composite (header + ProgressBar + checklist). Distinct from notifications; uses ProgressBar as a sub-component.

### Overlay family — 5 → 3 components

**Axis matrix:**

|              | backdrop | focus-trap | anchored | sliding |
|--------------|----------|------------|----------|---------|
| **Dialog**   | Yes      | Yes        | No       | No      |
| **Modal**    | Yes      | Yes        | No       | No      |
| **Popover**  | No       | No         | Yes      | No      |
| **Sheet**    | Yes¹     | Yes        | No       | Yes     |
| **Menu**     | No       | No         | Yes      | No      |

¹ Sheet's `floating` variant suppresses backdrop.

**Hard cuts:**

- `Dialog` ↔ `Modal` — Dialog replicates Modal's escape/portal/body-overflow/backdrop logic line-for-line ([Dialog.tsx:38-52](../../components/ui/Dialog/Dialog.tsx#L38-L52) vs [Modal.tsx:38-52](../../components/ui/Modal/Modal.tsx#L38-L52)). Dialog hardcodes `closeOnEscape=true`, `closeOnBackdrop=true`, `showCloseButton=false` and a fixed title + description + confirm/cancel button structure. Same axes (backdrop + focus-trap + centered). **Consolidate into `Modal`** with `preset="confirm"` that supplies the locked-down configuration and the title/description/action button shape.
- ~~`Menu` ↔ `Popover` — Menu duplicates Popover's absolute positioning + click-outside + Escape pattern. Hardcoded to click trigger only, no placement control, hardcoded item rendering. CSS is functionally identical ([Menu.css:18-30](../../components/ui/Menu/Menu.css#L18-L30) vs [Popover.css:17-27](../../components/ui/Popover/Popover.css#L17-L27)). **Consolidate into `Popover`** with `preset="menu"` and an `items?: MenuItem[]` slot.~~ **Rejected 2026-04-24** — see "Rejected recommendations" section below.

**Honest:**

- `Modal` — center backdrop overlay primitive.
- `Popover` — anchored non-modal floating panel.
- `Sheet` — sliding edge-anchored panel. Different positioning axis (fixed-edge slide, not center-modal).

### Stepper + indicator — 9 → 8 components

**Hard cuts:**

- `ProgressDots` ↔ `ProgressStepper` — both encode "position in N-step flow." Both support `linear` mode, `activeStep`, `onStepClick`/`onDotClick`, click-to-jump-with-guard. Same prop surface, same logic. ProgressStepper is verbose-vertical (label + description per step); ProgressDots is compact-horizontal. ProgressDots' own docstring describes itself as "lightweight companion to ProgressStepper." That's documentation-as-confession. **Consolidate into `ProgressStepper`** with `variant: 'steps' | 'dots'` (or `layout: 'vertical' | 'horizontal-compact'`).

**Honest:**

- `Stepper` — numeric input ±/—. Different purpose from progress indicators. Not a fork.
- `Counter` — numeric display with overflow cap (`max=99` → "99+"). Distinct content type (numeric, not status).
- `Dot` — pure status circle with optional pulse animation. Numeric overlap with Counter is shallow (size, status color); content shape differs.
- `Skeleton` — content placeholder shimmer. No overlap.
- `Spinner` — rotating loader. No overlap with Skeleton (loader vs placeholder).
- `Badge` — already consolidated with Chip/Tag in [PR #229](https://github.com/brikdesigns/brik-bds/pull/229). Out of scope.
- `ServiceBadge` — domain-specific (Brik service-category icon). The `mode` prop is `@deprecated` ([ServiceBadge.tsx:7](../../components/ui/ServiceBadge/ServiceBadge.tsx#L7)) pointing to `ServiceTag`. **Reviewed 2026-04-24** — component-level `@deprecated` JSDoc added; ServiceTag's `variant="icon"` fully covers the use case. Full deletion queued (blocked on shared utility extraction; see punch-list item #8).

## Prioritized punch-list

Ordered by leverage × low-risk-first:

1. **Form input variants** (`EmailInput`, `SearchInput` deletion) — smallest scope, BDS-only is impossible (portal imports them) but migration is mechanical. **1 BDS PR + 1 portal PR.** Highest signal-to-effort.
2. **Stepper consolidation** (`ProgressDots` → `ProgressStepper variant="dots"`) — clean fork with zero hidden complexity. Author's own docstring already concedes the relationship.
3. **Overlay `Dialog` → `Modal preset="confirm"`** — well-bounded merge. Modal already has all the required props; Dialog is purely a constraint-set wrapper.
4. **Feedback `AlertBanner` ↔ `Banner` merge** — combine on `tone` prop. Slightly more surface-area than #3 but mechanically similar.
5. **Feedback `Snackbar` ↔ `Toast` merge** — needs care with portal lifecycle and auto-dismiss interaction; do after #4 sets the precedent.
6. ~~**Overlay `Menu` → `Popover preset="menu"`** — Menu's hardcoded item rendering needs to become a slot. Larger refactor than #3.~~ **Rejected** — see "Rejected recommendations" section. Different patterns, not forks.
7. **Card variant consolidation** — biggest scope. Split into sub-tasks during execution based on consumer footprint:
    - **7a.** ~~CardDisplay + CardFeature deletion (zero consumers)~~ — completed in PR #241.
    - **7b.** CardControl → Card variant — 1 portal consumer; small additive PR + 1-file portal migration.
    - **7c.** CardSummary → Card variant — 12 portal consumers; full additive-deprecate-migrate-delete cycle.
8. ~~**`ServiceBadge` REVIEW** — verify ServiceTag coverage before retiring.~~ **Reviewed 2026-04-24** — ServiceTag fully covers ServiceBadge via `variant="icon"` (ServiceTag's own docstring already says "replaces ServiceBadge"). Both have zero external consumers. Component-level `@deprecated` JSDoc updated; full deletion queued as `task/bds-service-badge-deletion` (blocked on extracting shared `categoryConfig` + `getServiceIconPath` utilities from ServiceBadge.tsx into a shared module that ServiceTag can continue to import).
9. ~~**`CardList` REVIEW** — assess demotion to CSS utility class vs keeping as layout primitive.~~ **Reviewed 2026-04-24** — Keep as-is. CardList is 51 LOC + 59 LOC CSS that provides a discoverable, semantic-list (`<ul>` + `<li>`) layout for the common "stack of cards" pattern. Zero external consumers today, but BDS has no general layout primitives (no Stack/Cluster/Box) — CardList fills the closest equivalent. **Future watch:** if BDS introduces general layout primitives, revisit whether CardList becomes redundant. For now: honest, justified.

Each numbered item should be its own task branch + PR (per CLAUDE.md scope rule: "one concern per PR").

## Rejected recommendations

After consumer-impact review during execution, two original audit recommendations were overridden:

### #5 Snackbar ↔ Toast merge — **rejected, deleted instead** (PR #238)

The audit recommended merging Snackbar into Toast with `{ isPortal, position, autoDismissMs, statusSurface, showBadge }` props. On execution, Snackbar had **zero consumers**. Adding three orthogonal behavioral flags to Toast for zero current benefit was prop-bag bloat — exactly what ADR-004 §3 forbids. Outcome: deleted Snackbar entirely. If floating + auto-dismissing notifications are needed later, build a dedicated `Toaster` manager component (Sonner / react-hot-toast pattern) rather than overloading Toast.

### #6 Menu → Popover preset — **rejected outright**

The audit identified ~25 lines of shared mechanics (click-outside + Escape + absolute positioning) and suggested folding Menu into Popover via `<Popover preset="menu" items={...} />`. After deeper review:

- Menu and Popover serve **two well-known design system patterns**, not the same pattern with different presets:
  - Menu = items-array dropdown (ARIA `role="menu"`, items have `role="menuitem"`) — the Material UI Menu / Radix DropdownMenu pattern
  - Popover = anchored content panel (ARIA `role="dialog"`) — the Radix Popover pattern
- API shapes are intentionally different: Menu takes `items: MenuItemData[]` with external trigger management; Popover takes `content: ReactNode` with internal trigger as `children`. Forcing a merge would force one of them into the other's pattern.
- **Menu has 7 active renew-pms consumers** all using the items-array pattern. Migrating them to `<Popover preset="menu" items>` would replace a clean items-based API with a less ergonomic content-slot API across 7 files.
- Per ADR-004 §"Audit gate" question — *"What would happen if this lived inside an existing component as a variant?"* — the honest answer is: 7 callers get a worse API and Popover's content-slot abstraction gets polluted with menu-specific knowledge.

The shared mechanics could be extracted into a `useFloatingPanel` internal hook in a small future cleanup, but that's not worth a dedicated PR. Both components stay as separate public exports.

**Lesson for future audits**: shared internal mechanics ≠ same component. If two components encode different *patterns* (different ARIA semantics, different DX conventions), they're honest siblings, not forks.

## Out of scope (already booked)

- Addable* family consolidation — see [ADR-003](../adrs/ADR-003-addable-list-family.md).
- SheetTypography fold-in — see [ADR-004 §1](../adrs/ADR-004-component-bloat-guardrails.md).
- SheetSection.heading vs SheetSectionTitle dedupe — see [ADR-004 §2](../adrs/ADR-004-component-bloat-guardrails.md).

## Methodology notes

- Five parallel cluster-deep-dive passes, each agent applying the four ADR-004 rules independently.
- Every "fold into X" recommendation is backed by a file:line citation showing the structural overlap.
- No consumer-repo grep was run as part of this audit pass — the question "does the portal import this?" was deferred to the execution PRs, where it determines migration scope but not whether to consolidate.
- This audit only surveyed five clusters. The remaining ~50 components (foundations, navigation, structure, and the already-consolidated Badge/Chip/Tag, Form-atomic, Sheet system) were considered out of scope for pass 1 and should be covered in pass 2.

## Pass 2 — recommended scope (separate audit task)

Survey the following clusters next, applying the same method:

- **Navigation family**: `NavBar`, `Footer`, `SidebarNavigation`, `Breadcrumb`, `PageHeader`, `TabBar` — likely overlap between top-level navigation patterns.
- **Form atomic**: `Checkbox`, `Radio`, `Select`, `MultiSelect`, `DatePicker`, `TimePicker`, `CatalogPicker`, `Switch`, `SegmentedControl`, `FileUploader`, `Slider` — large surface; expect clean components but worth verifying.
- **Filter family**: `FilterBar`, `FilterButton`, `FilterToggle` — three components with "filter" in the name is a flag.
- **Card subcomponents post-consolidation** (Pass 1 follow-up): once Card absorbs the four variants, validate the resulting prop surface stays clean and doesn't itself bloat.

Cadence: target the second retroactive audit for **2026-Q4** per ADR-004 §"Periodic audit", or sooner if a third bloat instance appears in unsolicited review.
