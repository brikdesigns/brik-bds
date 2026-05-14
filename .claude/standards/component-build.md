---
name: Component build standard (BDS)
description: Canonical rules for building components in components/ui/. File layout, CSS structure, token discipline, primitives-first composition, prop conventions, states, accessibility, sizing.
type: reference
scope: brik-bds
applies-to: "**/components/ui/**/*.{tsx,css}"
retrieved-via: brik-rag query "component build standard"
last-verified: 2026-05-14
---

# Component build standard (BDS)

Rules for `brik-bds/components/ui/**/*.{tsx,css}`. Source of truth lives in this file (git-tracked); agents retrieve via `brik-rag query "component build standard"`.

**Out of scope:** story file shape (see [storybook-story-shape](./storybook-story-shape.md)); MDX page recipe (see [storybook-mdx-recipe](./storybook-mdx-recipe.md)); toolbar globals (see [storybook-toolbar-globals](./storybook-toolbar-globals.md)).

## Pre-implementation — design in Paper for composite or novel work

Use Paper (Claude Code's HTML canvas) to iterate visually before writing `.tsx` and `.css` for:

- New composite components (data tables, date pickers, kanban, calendars)
- Complex interaction states (multi-step forms, nested menus, drag-and-drop)
- First-time patterns with no existing BDS analog
- Any case where the right visual solution isn't obvious from a Figma spec alone

**Skip Paper for:** simple variants of existing components, icon swaps, copy changes, components with a clear unambiguous Figma spec.

**Discipline:** Paper HTML uses BDS token CSS variables exclusively — never raw hex / hardcoded sizes. The Paper → CSS translation maps 1:1.

```html
<!-- Right -->
<div style="padding: var(--padding-lg); color: var(--text-primary); border: var(--border-width-md) solid var(--border-secondary);">

<!-- Wrong -->
<div style="padding: 24px; color: #1a1a1a; border: 1px solid #e0e0e0;">
```

## File structure

```
components/ui/ComponentName/
├── ComponentName.tsx           Logic + class composition
├── ComponentName.css           All visual styles
├── ComponentName.stories.tsx   Storybook stories
├── ComponentName.mdx           Documentation page
├── index.ts                    Public exports
└── VariantName.tsx             Semantic variant (rare)
```

## Styles live in CSS — never inline

`.tsx` handles logic, `.css` handles appearance. No `CSSProperties` objects, no `as unknown as number` casts.

```tsx
import './Badge.css';

return (
  <span className={bdsClass('bds-badge', `bds-badge--${size}`, `bds-badge--${status}`, className)}
        style={style} {...props}>
    {children}
  </span>
);
```

Inline `style` is acceptable only for:

- Pass-through of user-provided `style` prop
- Runtime-calculated values (percentages, positions)
- Story layout helpers (`.stories.tsx` only)

## Class naming — BEM under the `bds-` namespace

```
.bds-{component}                       base
.bds-{component}--{variant}            variant or size
.bds-{component}--{state}              state (loading, active, disabled)
.bds-{component}__{slot}               child element (slot)
.bds-{component}__{slot}--{modifier}   slot modifier
```

**The `__slot` suffix is not free-form.** It must come from the closed allowlist in [`docs/SLOT-ALLOWLIST.md`](../../docs/SLOT-ALLOWLIST.md). Inventing a new slot name fails the lint. See [ADR-008](../../docs/adrs/ADR-008-naming-canon-closed-allowlist.md) for the rationale.

| What | Canon source |
|---|---|
| BEM rules, `bds-` namespace, structural-only modifier rule, id generation | [Naming Conventions](../../docs-site/content/docs/primitives/naming-conventions.mdx) |
| Closed allowlist of every `__slot` name | [`docs/SLOT-ALLOWLIST.md`](../../docs/SLOT-ALLOWLIST.md) |
| Why the system runs on a closed allowlist instead of a banlist | [ADR-008](../../docs/adrs/ADR-008-naming-canon-closed-allowlist.md) |

When this standard and the canon disagree, the canon wins. Open a PR to align this file.

## Tokens only — no hardcoded values, no primitives

All values come from **semantic** tokens. The canonical registry is `dist/tokens.css`.

```css
/* Right — semantic tokens */
.bds-card {
  padding: var(--padding-lg);
  border: var(--border-width-md) solid var(--border-secondary);
  font-size: var(--body-md);
}

/* Wrong — hardcoded */
.bds-card { padding: 24px; border: 1px solid #e0e0e0; font-size: 16px; }

/* Wrong — primitives leak through */
.bds-card { padding: var(--space--700); font-size: var(--font-size--400); }
```

**Tokens in TS/TSX** — import from `@/lib/tokens` and `@/lib/styles`. Never write raw `var(--...)` strings inline (this is a brik-bds CLAUDE.md non-negotiable).

```tsx
/* Right */
import { color, font } from '@/lib/tokens';
import { text } from '@/lib/styles';
style={{ color: color.text.primary, fontSize: font.size.body.md }}
style={text.body}  // family + size + lineHeight as one preset

/* Wrong — raw var() string defeats the token import discipline */
style={{ color: 'var(--text-primary)', fontSize: '16px' }}
```

Validate every token reference against `dist/tokens.css` before using it — the [`validate-token-names`](../../) skill auto-invokes on relevant edits.

## Compose primitives — never reimplement them

Blueprints and BDS components MUST compose existing primitives instead of reimplementing them with raw HTML and custom CSS.

```tsx
/* Right — compose */
import { LinkButton } from '../../components/ui/Button/LinkButton';
import { Breadcrumb } from '../../components/ui/Breadcrumb/Breadcrumb';

<Breadcrumb items={breadcrumb} />
<LinkButton href={cta.url} variant="primary" size="md">{cta.label}</LinkButton>

/* Wrong — raw HTML with custom classes */
<nav className="bp-hero__breadcrumb"><ol>...</ol></nav>
<a href={cta.url} className="bp-hero__cta">{cta.label}</a>
```

```astro
{/* Astro composes BDS classes via the canonical button pattern */}
<a href={cta.url} class="bds-button bds-button--primary bds-button--md">
  <span class="bds-button__content">{cta.label}</span>
</a>
```

**Why:** reimplementing a primitive (a) breaks variant + size consistency, (b) duplicates a11y handling, (c) duplicates token logic, (d) drifts away from the BDS story shape.

**Before writing JSX**, query `bds-find` or the Storybook MCP to confirm which primitives exist. If a primitive doesn't exist that the blueprint needs, build the primitive first (separate PR) and consume it from the blueprint, not the other way around.

## Props — canonical shape

```
variant     union type for visual style
size        'sm' | 'md' | 'lg' (some add 'xs' / 'xl' / 'tiny')
className   composed via bdsClass(), user classes last
style       pass-through for overrides
...props    spread remaining HTML attributes
```

Extend from the matching HTML attributes interface:

```tsx
interface BadgeProps extends HTMLAttributes<HTMLSpanElement> { ... }
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { ... }
```

The canonical `variant` / `size` union values per component live in [`manifest/component-axes.json`](../../manifest/component-axes.json) — auto-generated from the exported types via [ADR-009](../../docs/adrs/ADR-009-typegen-component-axes.md). Don't invent new values; if a new union member is needed, update the type and re-run `npm run typegen:axes`.

## Class composition

```tsx
import { bdsClass } from '../../utils';

const classes = bdsClass(
  'bds-component',                       // base
  `bds-component--${variant}`,           // variant
  `bds-component--${size}`,              // size
  loading && 'bds-component--loading',   // conditional
  className                              // user classes (last)
);
```

Falsy values are filtered automatically.

## Interactive states

For any component with hover, focus, or active behavior:

```css
.bds-component { }
.bds-component:hover:not(:disabled):not(.bds-component--loading) { }
.bds-component:active:not(:disabled) { }
.bds-component:focus-visible { }
.bds-component:disabled { }
```

## Semantic splitting

Split a component when different props render different HTML elements, require different prop sets, or carry different a11y contracts:

```
Button      → <button>     in-page actions
LinkButton  → <a>          navigation styled as button
IconButton  → <button>     icon-only with aria-label
```

Don't split for visual variants — that's what the `variant` prop is for.

## Danger variants

Interactive components that trigger destructive actions get danger variants:

```
danger           filled red
danger-outline   red border
danger-ghost     red text only
```

Not every component needs all three. Only add what makes sense.

## Accessibility — required minimums

```
Icon-only buttons     aria-label required (via label prop)
Loading state         aria-busy="true"
Disabled state        native disabled attribute (never aria-disabled alone)
Focus                 focus-visible outline, never removed
Links as buttons      role="button" on <a>
Danger actions        color + text/icon (never color alone)
```

A11y behavior — keyboard nav, focus management, dismissal handlers — composes from **Radix UI primitives** (`@radix-ui/react-*`). BDS owns the styling. Never use shadcn/ui or other CSS-variable libraries (brik-bds CLAUDE.md non-negotiable).

## Button & IconButton sizing — the 4-point grid

All sizes follow the 4px grid (24, 32, 40, 48, 56 px).

```
tiny  (24px)   Compact UI — sidebar icons, inline badges, dense lists
sm    (32px)   Secondary controls — filter bar, toolbar, card footers
md    (40px)   Default — table row actions, form controls, most content
lg    (48px)   Primary actions — page-level CTAs, dialog footers
xl    (56px)   Hero actions — landing pages, mobile touch targets
```

**Context rules:**

- **Table cells** → always `md`. Never `sm` — too small for click targets in data rows.
- **Filter bars / toolbars** → `sm` is acceptable for dense horizontal groupings.
- **Dialog / sheet actions** → `md` for secondary, `lg` for primary confirm.
- **Card footers** → `sm` for compact cards, `md` for standard cards.
- **Inline with text** → `tiny` only, and only when the button is decorative.

**IconButton ≠ smaller Button.** An icon-only button at `md` is the same 40 px height as a labeled `md` Button. Don't use `sm` IconButton as a "compact alternative" to `md` Button in the same row.

## Table cell patterns

Table cells accept any ReactNode. Consistent patterns per column type:

```
Status column       Badge or StatusBadge (never raw text for status)
Action column       IconButton (md, right-aligned, flex row with gap-xs)
Name/title column   TextLink (font-weight-medium, text-primary color)
Metadata column     Plain text (text-secondary, body-sm)
Tag column          Tag component (sm size)
```

**Action column rules:**

- Use `IconButton` at `md` size for all row-level actions.
- Right-align actions with `justify-content: flex-end`.
- Group multiple actions in a flex row with `gap-xs`.
- Primary action first (leftmost), destructive last.
- Use `title` prop on every IconButton — it is the only label visible on hover.

**Text links in cells:**

- Use `TextLink` (not raw `<a>`) for navigable names.
- Color: `text-primary`, never `text-brand` inside table rows.
- No underline by default — underline on hover only.
- If the entire row is clickable, don't also make the name a link (double navigation).

## Anti-patterns — re-read before component work

```tsx
// ❌ Ghost variant on a primary action
<IconButton variant="ghost" icon={<Play />} label="Start" />
// ✅ Preserve the action's hierarchy
<IconButton variant="primary" icon={<Play />} label="Start" />
// Rule: Converting Button → IconButton doesn't change the action's importance.

// ❌ Raw var() string in style prop
style={{ color: 'var(--text-primary)', fontSize: '16px' }}
// ✅ Import from the token layer
import { color, font } from '@/lib/tokens';
style={{ color: color.text.primary, fontSize: font.size.body.md }}

// ❌ Hardcoded hex
style={{ backgroundColor: '#E35335' }}
// ✅ Always look up the semantic token
style={{ backgroundColor: color.brand.primary }}

// ❌ Font family with wrong size scale
style={{ fontSize: font.size.body.md, fontFamily: font.family.heading }}
// ✅ Use composed style presets
import { text } from '@/lib/styles';
style={text.body}  // family + size + lineHeight matched correctly

// ❌ Heading element using body font family
.bds-card__name { font-family: var(--font-family-body); }
// ✅ Semantic family matches element role
.bds-card__name { font-family: var(--font-family-heading); }
// Heading/title/name → --font-family-heading
// Label/badge/tag/button/caption → --font-family-label
// Body copy/description → --font-family-body
//
// WHY: BDS defaults all three tokens to Poppins, so misuse is invisible during
// BDS development. The violation surfaces only when a client theme assigns
// distinct typefaces per family. Always validate component CSS with the
// ★ Client Sim theme in Storybook — it assigns Georgia/Verdana/Courier New
// to expose mismatches instantly.
//
// HEADING SCALE STARTS AT 18px: --heading-tiny = font-size/200 = 18px.
// font-size/100 (16px) is body/label territory. Never use it on a heading element.

// ❌ Editing the submodule directly
// brik-client-portal/brik-bds/components/ui/Button/Button.css
// ✅ Edit in the standalone repo, sync to consumers
// ~/Documents/GitHub/brik/brik-bds/
// Then: ./scripts/bds-sync.sh in each consuming project
```

## Retiring a `@deprecated` component

A `@deprecated` JSDoc tag is a *promise to remove the component*, not a permanent label. Without a retirement schedule, deprecated components ship banned-shape stories indefinitely — the AlertBanner case ([#605](https://github.com/brikdesigns/brik-bds/issues/605)) is the prototype: a `Variants` + `Patterns` story file lingered after the component was superseded by `<Banner tone="warning|error|information" />`, hidden from MCP via `tags: ['!manifest']` but still visible to humans in Storybook.

Every deprecation moves through three stages:

| Stage | When | What happens | What stays |
|---|---|---|---|
| **1. Deprecation lands** | A `@deprecated` JSDoc tag is added to the exported component | Story file gets `tags: ['!manifest']`; MDX `## Notes` adds *"Deprecated — use `<X>` instead. Stories will be retired in `vN.M`."*; file a retirement-tracker issue with the target version | Component continues to ship; consumers keep working |
| **2. Stories retired** | **Two minor releases after Stage 1** (default; override via the JSDoc sentinel below) | Delete `Component.stories.tsx` + `Component.mdx`; PR references the tracker issue | `Component.tsx` + `Component.css` + `index.ts` export remain — consumers on the old API don't break |
| **3. Component removed** | At the next **major** release | Delete the component directory; remove `index.ts` export; confirm consumer audit (portal / renew / web/{slug}) before merge | Tracker issue closes |

### `@deprecated` JSDoc shape

Every `@deprecated` tag must name the replacement and (optionally) override the default retirement schedule:

```tsx
/**
 * @deprecated Use `<Banner tone="warning" />` instead.
 *   Slated for retirement in v0.70 (current: v0.67).
 */
export function AlertBanner(...) { ... }
```

The sentinel `Slated for retirement in vN.M` parses cleanly for future linting (deferred — see #607). Omit it to accept the default (two minors after the tag was added).

### Default schedule (N=2 minors)

Two minor releases is the Carbon-aligned default — long enough for downstream consumers to migrate at a comfortable cadence, short enough that drift doesn't accumulate. Override with the JSDoc sentinel when:

- A consumer has explicitly asked for more time (rare; capture the ask in the tracker issue)
- The replacement isn't shipped yet (the deprecation is aspirational; pick a target after replacement lands)
- The deprecation is part of a coordinated multi-component sweep (use one shared target across the sweep)

### What this rule does NOT cover

- Cross-repo deprecation policy for `content-system/blueprints/**` or BCS resolvers — separate concern.
- Retroactive audit of currently-`@deprecated` components in `components/ui/**` — file individual retirement-tracker issues; this rule applies forward-only to new deprecations.
- Enforcement (`lint-jsdoc.js` extension) — deferred; today the rule is enforced by review.

## Migration checklist — updating an existing component

- [ ] Move styles to `.css` — remove all `CSSProperties` objects and `as unknown as number` casts
- [ ] Use `bdsClass` for class composition — pass through `className` and `style`
- [ ] Verify every token reference is semantic — run `npm run lint-tokens`
- [ ] Verify every `__slot` is in `docs/SLOT-ALLOWLIST.md`
- [ ] Add danger variants if the component triggers destructive actions
- [ ] Split into sub-components if it renders different HTML elements
- [ ] Migrate stories to the [storybook-story-shape](./storybook-story-shape.md) two-shape model
- [ ] Update `.mdx` per [storybook-mdx-recipe](./storybook-mdx-recipe.md)

## When this standard updates

1. Edit this file (the source of truth)
2. Re-run `scripts/ingest-component-build-standard.sh` to push to brik-rag
3. Bump `last-verified` in frontmatter
4. Note the change in the PR description

The skill auto-retrieves on `components/ui/**/*.{tsx,css}` edits — no other propagation needed.
