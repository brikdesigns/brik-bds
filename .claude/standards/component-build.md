---
name: Component build standard (BDS)
description: Canonical rules for building components in components/ui/. File layout, CSS structure, token discipline, primitives-first composition, prop conventions, states, accessibility, sizing.
type: reference
scope: brik-bds
applies-to: "**/components/ui/**/*.{tsx,css}"
retrieved-via: brik-rag query "component build standard"
last-verified: 2026-07-03
---

# Component build standard (BDS)

Rules for `brik-bds/components/ui/**/*.{tsx,css}`. Source of truth lives in this file (git-tracked); agents retrieve via `brik-rag query "component build standard"`.

**Out of scope:** story file shape (see [storybook-story-shape](./storybook-story-shape.md)); MDX page recipe (see [storybook-mdx-recipe](./storybook-mdx-recipe.md)); toolbar globals (see [storybook-toolbar-globals](./storybook-toolbar-globals.md)).

## Pre-implementation — build directly in Storybook

BDS components are designed by building them in `.tsx` + `.css` and iterating in **Storybook** — Storybook + the coded component are the component source of truth. There is no separate mockup gate.

- **Figma** is the *token* source of truth (and an optional visual reference that may legitimately differ from code) — not a component-layout gate.
- **Paper is for website / client builds, NEVER BDS components.** Do not mock BDS components in Paper.
- Prefer **nesting existing token-sized primitives** (they fit any container — card, list row, table cell) over authoring new components. Reach for a new component only when the purpose test below justifies it.

**Discipline:** all values come from BDS token CSS variables — never raw hex / hardcoded sizes (see § Tokens only). Validate component CSS across themes in Storybook, especially the ★ Client Sim theme (it assigns distinct typefaces per family to expose mismatches).

## Component vs variant vs control — decide this first

Before writing any code, place the thing you are building in one of three tiers. The tier determines where it lives, what it exports, and how it appears in Storybook.

### The three tiers

| Tier | Definition | Where it lives | Storybook shape |
| --- | --- | --- | --- |
| **Component** | Standalone purpose + recognizable identity. A designer or developer reaches for it by name because it has a distinct UX contract. | `components/ui/ComponentName/` — own directory, MDX, public export | One or more stories in its own file |
| **Variant** | A distinct contextual expression of a component that carries its own semantic signal: own color logic, icon convention, or behavioral expectation. A designer would choose it intentionally in a wireframe. | Same directory as its component | Dedicated story (ADR-010 Q3) |
| **Control / Prop** | Customization within a variant that does not change the component's identity or contextual meaning. | A prop or `argTypes` entry | `argTypes` only — never a story |

### Decision questions

1. **Would a designer or developer reach for this by name?** If yes → it is a component.
2. **Does it carry a semantic signal a designer would choose deliberately** (own icon, own color logic, distinct behavioral expectation)? If yes → it is a variant (story). If no → it is a control.
3. **Does it share >70% of props or CSS with an existing primitive?** If yes and the purpose test above did not already justify a component → extend the primitive with a prop instead.

### Examples

| Thing | Tier | Reasoning |
| --- | --- | --- |
| `Toast` | Component | Standalone notification surface; reached for by name |
| `Toast` `tone="destructive"` | Variant / story | Own icon + color logic; designer picks it deliberately |
| `Toast` `showActions={false}` | Control | Does not change Toast's identity |
| `TextInput` | Component | Core text-entry primitive |
| `TextInput` on-dark | Variant / story | Borderless visual contract for dark surfaces; designer chooses it intentionally |
| `TextInput` `size="lg"` | Control | Does not change TextInput's identity |
| `SearchInput` | Component | Distinct search affordance, clear-button interaction, `role="search"` — its own UX contract |
| `EmailInput` | ❌ Not a component | `type="email"` is a browser hint; no UX distinction from `TextInput` |

See [ADR-004 §Amendment 2026-05-17](../../docs/adrs/ADR-004-component-bloat-guardrails.md) for the full purpose-test rationale and the corrected input taxonomy.

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
| --- | --- |
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

## Icons in components

### Always use `<Icon>` — never inline SVGs

BDS uses [Phosphor icons](https://phosphoricons.com/) via `@iconify/react`. Named constants live in [`components/icons.ts`](../../components/icons.ts).

```tsx
/* Right — named constant + Icon component */
import { Icon } from '@iconify/react';
import { X, Eye, EyeSlash, MagnifyingGlass } from '../../icons';

<Icon icon={X} />
<Icon icon={showPassword ? EyeSlash : Eye} />

/* Wrong — inline SVG when an icons.ts constant exists */
const XIcon = () => <svg width="14" height="14">...</svg>;

/* Wrong — raw Iconify string, not from icons.ts */
<Icon icon="ph:x" />
```

**Why:** inline SVGs hardcode their own dimensions via `width`/`height` attributes and bypass the font-size sizing system. They also duplicate an icon that's already tested and bundled.

**Before writing any icon SVG inline**, check `components/icons.ts`. If the icon you need isn't there, add it to `icons.ts` as a named constant — don't embed the SVG.

### Size icons via `font-size` — never `width`/`height`

`<Icon>` renders as an inline SVG that scales with the CSS `font-size` of its parent. Set `font-size` on the button or wrapper, not `width`/`height` on the icon element.

```css
/* Right — font-size on the parent button */
.bds-search-input__clear {
  font-size: var(--icon-sm); /* 16px — scales the Icon inside */
}

/* Wrong — hardcoded dimensions on the icon itself */
<Icon icon={X} width={14} height={14} />
```

### Canonical icon sizes for controls (4px grid)

Icons inside form controls and action buttons must be on the 4px grid. Use `font-size` on the parent wrapper.

| Control height | Icon size | CSS value |
| --- | --- | --- |
| `sm` — 32px | 12px | `font-size: 12px` |
| `md` — 40px | 16px | `font-size: var(--icon-sm)` |
| `lg` — 48px | 16px | `font-size: var(--icon-sm)` |
| Standalone / header | 20px | `font-size: var(--icon-lg)` |

**Avoid `--icon-xs` (≈14px) and `--icon-md` (18px)** — both are off the 4px grid. Use 12, 16, or 20 instead.

### Icon containers — padding composes to the 4-point grid

An icon container is any square affordance wrapping a single glyph — a dismiss button, an IconButton, a badge's leading-icon slot. Size the glyph with `font-size` (never `width`/`height` — see above), then reach the 4-point grid (24 / 32 / 40 / 48 / 56) with symmetric `--padding-*`. Don't hardcode the container's `width`/`height` — let padding + font-size resolve it.

Base padding primitives: `--padding-tiny` 8px · `--padding-xs` 10px · `--padding-sm` 12px. Verified on-grid recipes:

| Container | Glyph (`font-size`) | Padding each side | Sum |
| --- | --- | --- | --- |
| 32px (`sm`) | 16px `--icon-sm` | 8px `--padding-tiny` | 8 + 16 + 8 = 32 ✓ |
| 40px (`md`) | 20px `--icon-lg` | 10px `--padding-xs` | 10 + 20 + 10 = 40 ✓ |
| 40px (`md`) | 16px `--icon-sm` | 12px `--padding-sm` | 12 + 16 + 12 = 40 ✓ |

**Reference implementations:** `CloseButton` uses the 10 + 20 + 10 = 40 recipe; `IconButton` follows the `tiny/sm/md/lg/xl` grid in "Button & IconButton sizing" below. Match those before hand-rolling padding — the off-grid glyph sizes above are the usual cause of a container that misses the grid.

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
| --- | --- | --- | --- |
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
2. Bump `last-verified` in frontmatter
3. Stage + commit — the pre-commit hook auto-ingests changed standards into brik-rag and updates `scripts/.standards-hashes` (brik-bds#744). CI verifies the hash matches on every PR.
4. Note the change in the PR description

The skill auto-retrieves on `components/ui/**/*.{tsx,css}` edits — no other propagation needed.
