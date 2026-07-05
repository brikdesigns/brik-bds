# BDS Slot Pattern

**Status:** Governing reference — ADR-008 §4 + [ADR-017](adrs/ADR-017-slot-pattern-gate-supersedes-closed-allowlist.md)
**Enforced by:** `scripts/slot-pattern-check.mjs` (pre-commit staged + CI full-tree)

> **This file used to be a closed enumerated allowlist** (ADR-008 §2). That model was superseded by [ADR-017](adrs/ADR-017-slot-pattern-gate-supersedes-closed-allowlist.md) on 2026-07-05: the enforcing lint (Phase C) never shipped, and by 2026-07 only 101 of the 396 slots in use were listed, so enumeration was unpayable. Slots are now governed by **shape**, not by a list. The filename is kept to preserve inbound links — treat it as *SLOT-PATTERN*.

BDS slot names are governed by a **structural pattern**, enforced automatically. There is no list to maintain and no PR needed to introduce a new well-formed slot — a slot is canonical if and only if it matches the grammar below.

## The grammar (ADR-008 §4)

A `bds-*` class is one of:

```text
bds-<block>
bds-<block>--<modifier>
bds-<block>__<slot>
bds-<block>__<slot>--<modifier>
```

where each segment is **kebab-case**:

- `<block>`: `[a-z][a-z0-9]*(-[a-z0-9]+)*` — starts with a letter (`card`, `accordion-item`, `task-console`)
- `<slot>` / `<modifier>`: `[a-z0-9]+(-[a-z0-9]+)*` (`title`, `item-label`, `in-progress`, `md`)

Rules that fall out of the grammar:

- `__` separates a block from its slot; `--` separates a modifier. **No single underscores** (`__title_text` ✗ → `__title-text` ✓).
- No other separators, no doubled `__`/`--`, no uppercase (`__myTitle` ✗, `__Title` ✗).
- No layout name baked into a slot — the parent block already carries it (`bds-hero__title`, never `bds-hero__hero-title`). This is a *shape*-adjacent rule enforced semantically by the banned-slot list below, not by the pattern regex.

### Passes / fails

| Class | Verdict |
|---|---|
| `bds-card`, `bds-card--primary`, `bds-card__title`, `bds-card__title--error` | ✓ |
| `bds-accordion-item__icon`, `bds-task-console__item--in-progress` | ✓ |
| `` `bds-badge--${tone}` `` (dynamic) | ✓ — interpolation is not judged |
| `bds-card__myTitle` | ✗ uppercase |
| `bds-card__title_text` | ✗ single underscore |
| `bds-Card__title` | ✗ uppercase block |
| `bds-card__title__extra` | ✗ doubled `__` |

New vocabulary is free: `bds-card__preset-display-row-tag` passes because it is well-formed. Reuse a generic slot when one fits (see below), but you never edit this file to add a slot.

## Two gates, two jobs

The pattern gate is about *shape*. It does **not** judge whether a well-shaped name is a *good* name — that is a separate, semantic concern:

| Concern | Gate | Example it owns |
|---|---|---|
| Structural shape (kebab-case, `__`/`--` grammar) | `scripts/slot-pattern-check.mjs` (this file) | `__myTitle`, `__title_text` |
| Banned semantic slots (marketing/layout terms) | `scripts/lint-blueprint-naming.mjs` (§3 banlist) | `__eyebrow`, `__hero-title` |
| Parallel-taxonomy class collisions vs `dist/styles.css` | `scripts/canonical-class-check.mjs` | `.button--primary` shadowing `bds-button` |

## Banned slots (semantic — enforced by lint-blueprint-naming, not the pattern gate)

These are well-*shaped* but wrong-*meaning*. Listed so an agent sees the wrong word and the right one together. Owned by `lint-blueprint-naming.mjs` per ADR-008 §3.

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

## Naming a new slot

No canon edit needed — just a well-formed, sensible name:

1. Identify the **role** the slot expresses (text content? container? interaction? icon?). Pick the most generic word that fits.
2. Grep the codebase — reuse an existing generic slot (`__title`, `__label`, `__icon`, `__content`) before inventing. These are intentionally cross-block: `__title` appears on 22 blocks by design.
3. Keep it generic, not layout-specific (`__image` ✓, `__hero-image` ✗) and not visual-descriptive (`__cta` ✓, `__dark-cta` ✗) — those fail the semantic banlist even though they pass the shape gate.
4. If the name is well-shaped and generic, it just works. There is no allowlist to update.
