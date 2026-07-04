# BDS Slot Allowlist

**Status:** Canon source of truth — ADR-008
**Format:** Each `## Category` heading owns a fenced `slots` code block. The lint reads these blocks; one slot per line, comments start with `#`. Anything in a `slots` code block is *allowed*. Anything not in any `slots` block is *banned* and fails the lint.

This file is the only allowlist. Don't enumerate slots elsewhere. To add a slot, edit this file, justify in the PR description, get review.

## How to read this file

Each slot below is the BEM `__suffix` part — what appears after `__` in a class like `bds-card__title`. The block name (`bds-card`) is allowed; the slot (`__title`) is what's governed here.

A slot may have **modifiers** declared inline as `--mod` suffixes (e.g. `__label--error`). The modifier suffix is part of the allowlist entry; `__label--error` ≠ `__label`. If a slot supports modifiers, list each modifier separately.

For *blueprint* blocks (`bds-hero`, `bds-cta`, …), the BEM modifier syntax governs *layout variants* (`bds-hero--split-image`). Layout modifiers are not slots and are not governed by this file — they're governed by the structural-only modifier rule in ADR-008.

## Text + content slots

```slots
__title
__subtitle
__description
__label
__label--error
__label--sm
__label--md
__label--lg
__value
__text
__heading           # legacy — Sheet section only; new code uses __title
__body              # legacy — being phased out per PR #552; new code uses __description
__name
__inner
__content
__helper
__helper--error
__error
__strict-hint
__hint
__cite              # source attribution on quotes / testimonials
__caption           # <figcaption> text on figure-based media (Image); generic to any captioned figure
```

## Layout + container slots

```slots
__container
__header
__footer
__content           # also appears under text/content for distinct roles — same word, different role
__inner
__row
__rows
__column
__columns
__grid
__top
__bottom
__media             # any aspect-locked media frame; pairs with Frame primitive
__media--sm         # square leading-media size on the Avatar scale (Card media slot)
__media--md         # square leading-media size on the Avatar scale (Card media slot)
__media--lg         # square leading-media size on the Avatar scale (Card media slot)
__media--xl         # square leading-media size on the Avatar scale (Card media slot)
__media-column      # column-shaped media region
__sidebar
__main
```

## Interaction slots

```slots
__actions
__action
__cta
__button
__close
__toggle
__remove
__trigger
__trigger--open
__trigger--error
__trigger--disabled
__caret
__dropdown
__option
__option--active
__placeholder
__link
```

## Visual + icon slots

```slots
__icon
__avatar
__image
__image-fallback
__photo
__illustration
__badge
__dot
__track
__fill
__indicator
__indicator--active
__shape
__tile
__progress
__progress--error
__status
__spinner
__logo
__brand             # logo + brand-text grouping
```

## List + item slots

```slots
__list
__item
__items
__item--active
__item--disabled
__item--pending
__item--in-progress
__item--completed
__item--failed
__item-content      # legacy compound — flag for review (should be __item__content?)
__item-label        # legacy compound — flag for review
__input-row
```

## Form slots

```slots
__input
__field
__fieldset
__legend
__group
__checkbox
__radio
__switch
```

## Navigation slots

```slots
__nav
__nav-link
__breadcrumb
__hamburger
__menu
__menu-item
__menu-item--active
__menu-item--disabled
```

## Modal + popover + tooltip slots

```slots
__modal
__dialog
__sheet
__popover
__bubble
__bubble--top
__bubble--right
__bubble--bottom
__bubble--left
__bubble--visible
__bubble--portal
__arrow
__arrow--top
__arrow--right
__arrow--bottom
__arrow--left
```

## Drawer / mobile-nav slots

```slots
__drawer
__drawer-nav
__drawer-list
__drawer-item
__drawer-link
__drawer-actions
__drawer-phone
__drawer-cta
```

## Specialized slots

These are domain-specific slots that belong to one block but are too useful to forbid outright. Each entry must reference the block that owns it.

```slots
__category-pill         # filter chip / category indicator (FilterBar, CardList)
__category-row          # row of category chips
__cell                  # cell in TimePicker / Calendar tables
__cell--selected
__not-found             # empty state / 404 illustration
__has-options           # combo-list state class
```

## Banned slots (explicit — for clarity, fail the lint)

These are common drift inventions. Listed here so an agent reading the canon sees the wrong word *and* the right one in the same place.

| Banned | Use instead | Reason |
|---|---|---|
| `__eyebrow` | `__subtitle` | Marketing-design term; not BDS vocabulary |
| `__kicker` | `__subtitle` | Same as eyebrow |
| `__overline` | `__subtitle` | Same |
| `__pre-title` | `__subtitle` | Same |
| `__headline` | `__title` | `heading` is a token scale, not a BEM role |
| `__lead` | `__description` | Newspaper-print term; BDS uses `__description` for prose |
| `__quote` | use `CardTestimonial` component | Don't hand-roll blockquote markup |
| `__quote-text` | use `CardTestimonial` | Same |
| `__quote-cite` | use `CardTestimonial`'s `__cite` | Same |
| `__callout` | use `Banner` | Don't hand-roll callout markup |
| `__plan-name` | `__title` | Layout-specific noun for a generic role |
| `__plan-description` | `__description` | Same |
| `__support-title` | `__title` | Same |
| `__statistic` | `__value` | Same |
| `__statistic-value` | `__value` | Same |
| `__method` | `__label` (for the label) + `__value` (for the value) | Domain-specific term for `__label`+`__value` pair |
| `__method-label` | `__label` | Same |
| `__method-value` | `__value` | Same |
| `__role` | `__label` (it labels a name) | Same |
| `__separator` | `Divider` component | Don't hand-roll separator divs |
| `__underline` | CSS, not a slot | Visual treatment, not a role |
| `__hero-title`, `__page-heading` | `__title` | The parent block already says "hero" or "page" |
| `__hero-cta`, `__page-actions` | `__cta` / `__actions` | Same |

## How to add a slot

1. Identify the **role** the slot expresses (text content? container? interaction? icon?). Pick the most generic word that fits.
2. Grep the codebase to see whether an existing allowlist slot already covers the role. **Reuse before invent.**
3. If no existing slot fits, open a PR that:
   - Adds the new slot to the relevant `## Category` block above
   - Justifies in the PR description why no existing slot worked
   - References the block(s) that will use the new slot
4. Reviewer checks that the new slot is generic (would work on more than one block), not layout-specific (`__hero-image` no, `__image` yes), not visual-descriptive (`__dark-cta` no, `__cta` yes).

## How to remove a slot

Three conditions must hold:

1. Zero current uses across BDS + every consumer repo (grep verified)
2. PR description explains why the slot is no longer needed
3. Removal lands in the same PR (or just before) the last code that used it

Removing a slot from the allowlist immediately fails the lint on any consumer code still using it — so the removal PR must coordinate with consumer-repo migrations.
