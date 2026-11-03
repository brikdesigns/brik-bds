# Changelog

Consumer-facing changes to `@brikdesigns/bds`, newest first.

This file is **not** the release record — the GitHub Release for each tag is,
and it is auto-generated from the PRs since the previous tag
([`docs/RELEASE.md`](docs/RELEASE.md) § Flow step 4). What lives here is the one
thing a generated note cannot carry: a **Breaking (consumer CSS)** mapping.

A consumer targets BDS class hooks from its own override CSS. When BDS renames
or removes one, the consumer's selector silently stops matching — no build
error, no type error, no lint ([#1186](https://github.com/brikdesigns/brik-bds/issues/1186)).
So a rename or removal of a public class hook gets an old → new table here, and
a consumer greps this file before bumping.

> `#1186` will add the manifest + CI check that *enforces* this section. Until
> it lands, the entry is a convention, not a gate.

## Unreleased

Indicators share one anatomy: Badge and Tag take `appearance` `solid | subtle | outline`, Avatar takes `solid | subtle`, and Tag takes a `color` (`neutral` or an accent hue). `subtle` is always a pale `--bds-background-*-light` fill with the dark-ink label `--bds-text-on-color-light`; `outline` is transparent with `--bds-text-primary` and a border. Badge, Tag and Avatar CSS read no `--bds-surface-*` and no `--bds-color-*` primitive ([#2943](https://github.com/brikdesigns/brik-bds/issues/2943)). Target: 0.222.0 (a minor, per `docs/RELEASE.md` on 0.x).

**Breaking (`<Tag appearance>`):** the two old values swap meaning, and `muted` is removed. A consumer must migrate in one pass: a find/replace done in two steps turns every `muted` Tag into `outline`. Run `node node_modules/@brikdesigns/bds/scripts/codemod-tag-appearance.mjs --dry-run src`, then once without `--dry-run`. It rewrites only `<Tag>`, lists any dynamic `appearance={...}` as `needs review`, and is not idempotent: never re-run it on a migrated tree.

| Old | New |
|---|---|
| `<Tag appearance="subtle">` (transparent + border) | `<Tag appearance="outline">` |
| `<Tag appearance="muted">` (quiet neutral fill) | `<Tag appearance="subtle">` |
| `.bds-tag--subtle` (transparent + border) | `.bds-tag--outline` |
| `.bds-tag--muted` | `.bds-tag--subtle` |

**Also (consumer CSS):** every `.bds-tag` now carries a `.bds-tag--{color}` class (default `.bds-tag--neutral`), and Tag fills are now keyed on `appearance` x `color` compound selectors, so an override of `.bds-tag--solid` alone may lose on specificity. The subtle Badge tones now read `--bds-background-{tone}-light` (pale fills) and brand subtle reads `--bds-background-brand-secondary`; the dark-mode override on brand subtle is gone. New: `.bds-badge--outline`, `.bds-avatar--subtle`.

`--font-weight-thin` (value 300, which is CSS *Light*) is renamed `--font-weight-light` at the Figma source; the value is unchanged. **Breaking (consumer CSS):** `--bds-font-weight-thin`, `--bds-font-weight--thin`, `--font-weight-thin`, `--font-weight--thin` and `weight.thin` ship one minor as deprecated aliases of the `light` names, then drop. The JS `fontWeights` mirror now matches the CSS tokens exactly: `light` stays, the duplicate `thin` key is removed, and `semi-bold` / `extra-bold` become `semibold` / `extrabold` (no downstream repo reads those keys). No `100` / `200` rungs ship, and none are implied ([#2222](https://github.com/brikdesigns/brik-bds/issues/2222)).

| Old | New |
|---|---|
| `--font-weight-thin` | `--font-weight-light` |
| `--font-weight--thin` | `--font-weight--light` |
| `weight.thin` | `weight.light` |

## v0.220.1 — 2026-11-01

The selected `SegmentedControl` item now carries a `--bds-border-brand-primary` border, because its fill alone measured 1.12:1 against the track and WCAG 1.4.11 wants 3:1 for a selected-state indicator ([brikdesigns#1427](https://github.com/brikdesigns/brikdesigns/issues/1427)). No class hook renamed or removed. **Box change:** every `.bds-segmented-control-item` now has a `--bds-border-width-md` transparent border, and its padding is reduced by that width so the item's size is unchanged. If a consumer overrides `padding` or `border` on `.bds-segmented-control-item`, re-check it.

## v0.220.0 — 2026-11-01

`FieldGrid` `columns` is now a maximum that steps down with its container width (`4` → 3 → 2 below `720px` / `480px`, `3` → 2 below `480px`; `2` is unchanged), and `Field` takes `span="full"` (class `.bds-field--span-full`). No class hook renamed or removed. **Structure change:** `FieldGrid` renders a new child `.bds-field-grid__cells`. For `columns={2}` (the default) nothing else changes: `.bds-field-grid` is still the grid and the child is `display: contents`. For `columns={3}` / `{4}` the root becomes the size container (`container-type: inline-size`) and the grid is the child, so an override of `grid-template-columns` or `gap` on `.bds-field-grid` must target `.bds-field-grid__cells`. **Constraint (3 / 4):** inline-size containment removes the root's intrinsic width, so in a shrink-to-fit parent (centered layout, inline-block, a flex item without a basis) the grid collapses to the parent's other content; give that parent a definite width or the flex item a `flex` basis.

## v0.202.0 — 2026-10-20

Adds an opt-in `lazy` prop to `GhlForm` (React + Astro). Additive; no class-hook changes. With `lazy`, the iframe omits `src` and carries the URL on `data-src`; the page sets `frame.src = frame.dataset.src` when the form is first shown. Default output is unchanged.

## v0.201.0 — 2026-10-19

**Breaking (consumer CSS + exports).** Adds `GhlForm` (React + Astro).

| Old | New |
|---|---|
| `.bds-about`, `.bds-about--align-center`, `.bds-about__{callout,container,lead,narrative,subtitle,title}` | `.bds-narrative…` (same suffixes) |
| `.bds-stats-dark-bar`, `.bds-stats-dark-bar__{item,label,list,value}` | `.bds-stats-bar…` |
| `--bds-about-{bg,body-color,eyebrow-color,heading-color}` | `--bds-narrative-…` |
| `--bds-stats-dark-bar-{bg,divider,label-color,padding-y,value-color}` | `--bds-stats-bar-…` |

Exports: `About`→`Narrative`, `StatsDarkBar`→`StatsBar` (React + `blueprints-astro`).

Removed ([#2794](https://github.com/brikdesigns/brik-bds/pull/2794)): `HeroSplit6040`, `HeroInteriorMinimal` → `Hero`; `Services3ColCardGrid`, `ServicesDetailTwoColumn` → `CardGrid`; `CalloutSplit` → `CalloutPanel`; `Features3ColBrandedDark` → `Features`; `AboutStorySplit` → `Narrative`; `CtaDarkCentered`, `CtaSplitContact` → `Cta`.

## v0.193.1 — 2026-10-01

No class hook is renamed or removed, so there is **no breaking class-hook
table**. But this release is a **visual change for every consumer**: the
layout tier ([ADR-042](docs/adrs/ADR-042-layout-tier-device-clamp.md), [#2660](https://github.com/brikdesigns/brik-bds/issues/2660)).

| Token | 320px | 768px | 1440px+ | Was |
|---|---|---|---|---|
| `--page-inset` | 16px | 32px | 96px | 24px fixed |
| `--section-padding-block` (new) | 64px | 80px | 104px | `.bds-blueprint-section`: `clamp(var(--padding-xl), 7vw, var(--padding-huge))` |

- Both tokens scale fluidly between those widths. They are flat above 1440px.
- `[data-mode-spacing]` no longer changes `--page-inset`.
- `layout-fluid.css` loads after `gap-fills.css` in `dist/tokens.css`. A
  consumer that redefines `--page-inset` in `:root` *before* `tokens.css` is
  now overridden.
- Check visual regression on your bump PR before merging it.

## v0.184.0 — 2026-09-06

Additive only — **no breaking class-hook changes**. Three new presentational,
non-interactive hero media-card exports (`HeroMediaCard`, `HeroMediaCardImage`,
`HeroMediaCardPrice`) extracted from the `@deprecated` `HeroSplitImageCardOverlay`
adapter, so a consumer can render `.bds-hero__media-card` markup inside an
interactive `<Card href>` / `<a>` without hand-copying the class strings or
nesting an interactive BDS component. `Hero` now owns the `.bds-hero__breadcrumb`
wrapper on its `breadcrumb` slot — consumers no longer inject that magic class
string themselves ([#2284](https://github.com/brikdesigns/brik-bds/issues/2284)).
Every class name is pre-existing; the adapter's output is unchanged.

## v0.183.0 — 2026-09-04

Breaking, in the minor slot: pre-1.0, npm's `^0.182.0` resolves `>=0.182.0 <0.183.0`,
so no consumer auto-upgrades across it ([`docs/RELEASE.md`](docs/RELEASE.md) § Flow).

### Breaking (consumer CSS)

ADR-033 § 2 assigns `tone` to the valence axis and mints `emphasis` for the
hue-source axis, so the three components whose `tone` was the hue source rename
their prop, their exported union, and their BEM modifier
([#1925](https://github.com/brikdesigns/brik-bds/issues/1925)). Resolved colors
are unchanged — this is a vocabulary change, not a visual one.

| Old class hook | New class hook |
|---|---|
| `.bds-text-link--tone-neutral` | `.bds-text-link--emphasis-neutral` |
| `.bds-social-icon--grayscale` | `.bds-social-icon--emphasis-neutral` |
| `.bds-social-icon--brand` | `.bds-social-icon--emphasis-brand` |
| `.bds-social-icon--accent` | `.bds-social-icon--emphasis-accent` |
| `.bds-contact-icon--grayscale` | `.bds-contact-icon--emphasis-neutral` |
| `.bds-contact-icon--accent` | `.bds-contact-icon--emphasis-accent` |

`.bds-social-icon--badge` / `--glyph` and `.bds-contact-icon--badge` / `--glyph`
are the `type` axis and are **unchanged**.

### Deprecated — honoured for one minor, then removed

| Old | New |
|---|---|
| `<TextLink tone>` | `<TextLink emphasis>` |
| `<SocialIcon tone>` | `<SocialIcon emphasis>` |
| `<ContactIcon tone>` | `<ContactIcon emphasis>` |
| `SocialIcon` / `ContactIcon` value `"grayscale"` | `"neutral"` |
| type `TextLinkTone` | `TextLinkEmphasis` |
| type `SocialIconTone` | `SocialIconEmphasis` |
| type `ContactIconTone` | `ContactIconEmphasis` |

Passing the old prop or the old value still renders the new modifier and logs
one `console.warn` per component + prop + value. `emphasis` wins when both
props are passed.

### Added

- **`<SocialIcon emphasis="inverse">`** — near-black badge, the default treatment
  for a monochrome social row on a light surface
  ([#2274](https://github.com/brikdesigns/brik-bds/issues/2274)). `type="badge"`
  fills `--surface-inverse`; `type="glyph"` takes the `--color-grayscale-950`
  primitive that resolves to. Replaces reaching into `.bds-social-icon__bg`, a
  BDS-internal part. New class hooks — nothing renamed:
  `.bds-social-icon--emphasis-inverse` on both types.
- **`inverse` admitted to ADR-033 § 2's `emphasis` axis**, whose closed value
  list is now `neutral · brand · accent · inverse`
  ([#2279](https://github.com/brikdesigns/brik-bds/issues/2279)). Affects any
  consumer authoring an `emphasis`-named prop union against the naming canon.
