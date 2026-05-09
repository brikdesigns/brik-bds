# Spec: `features_3col_branded_dark`

**Status:** Proposed · awaiting review
**Section type:** `features`
**Driver:** brikdesigns.com "Other Service Lines" cross-sell module — dark section with brand-colored cards. Currently rendered as a custom one-off in the consumer repo.
**Renderers required:** Astro + React

---

## Proposed JSON entry — `blueprint-library.json`

```jsonc
{
  "key": "features_3col_branded_dark",
  "name": "3-Column Brand-Colored Card Grid on Dark",
  "section_type": "features",
  "industries": ["universal", "small_business", "creative", "agency", "saas"],
  "moods": ["bold", "modern", "luxury", "energetic"],
  "layout_spec": "Dark section background (page-inverse). 3-column grid of cards, each card filled with its own brand color (passed in via item.brandColor — typically the audience/service-line `--brand-primary` for that subtree). Each card: oversized 3D illustration top (square aspect, 60-70% of card height), then card body with high-contrast title (heading/sm, on-color treatment), 1-sentence description (body/sm, on-color secondary), and ghost-style 'Learn more' link styled for the colored background. Cards are rounded (border-radius-lg), full-bleed image at top, body padding generous. Section header centered above grid, light text on dark surface. Optional eyebrow above heading. Cards collapse to 2-col at <992px, 1-col at <768px. Each card establishes its own data-audience subtree binding so its --brand-primary cascades correctly per the BDS scope-binding pattern.",
  "css_hints": ".features-branded-dark { background: var(--page-inverse); padding-block: var(--padding-huge); } .features-branded-dark__grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--gap-lg); } .features-branded-dark__card { background: var(--bp-card-bg); border-radius: var(--border-radius-lg); overflow: hidden; display: flex; flex-direction: column; } .features-branded-dark__media { aspect-ratio: 1; padding: var(--padding-xl); display: flex; align-items: center; justify-content: center; } .features-branded-dark__body { padding: var(--padding-lg); display: flex; flex-direction: column; gap: var(--gap-sm); }",
  "tier": "internal",
  "version": "1.0.0",
  "is_active": true,
  "required_facts": []
}
```

---

## Why existing blueprints don't cover this

| Existing | Why it doesn't fit |
|---|---|
| `features_3col_icon_grid` | Light bg + icon-led + no per-card brand color. Different visual paradigm. |
| `features_alternating_split` | 2-col alternating, not 3-col grid. |
| `features_bento_asymmetric` | Asymmetric, mood is editorial. Not the cross-sell brand-grid pattern. |
| `services_*` patterns | Different section_type semantics — these are service-line CROSS-SELL cards, not the parent service cards on this page. |

---

## BDS primitive composition

| Card region | BDS primitive | Notes |
|---|---|---|
| Section frame | `<section>` with `--page-inverse` background | Theme-cascade aware |
| Grid container | Layout pattern (Grid/Stack — pending Workstream A primitive layer) | Use plain CSS grid for now via blueprint CSS |
| Card frame | `Card` primitive with `padding="none"` `radius="lg"` | Per-card `data-audience` attribute drives `--brand-primary` cascade |
| Top illustration area | Slot — full-bleed image with brand-colored backdrop | Image background is the card's brand color |
| Card title | Heading slot — `heading/sm`, color via `--text-on-color-primary` | On-color text token (varies per brand contrast — light vs dark text picked automatically when token system supports it) |
| Card description | Body slot — `body/sm`, color via `--text-on-color-secondary` | |
| Learn more | `LinkButton` `variant="ghost"` `size="md"` (on-colored-bg variant) | Brand-color text on the card's bg — needs the on-color ghost variant |

---

## Per-card brand color binding

This blueprint relies on the BDS scope-binding pattern documented in the [cascade docs](https://design.brikdesigns.com/docs/getting-started/cascade): each card sets `data-audience="brand|marketing|product|information|service"` on itself, which re-binds `--brand-primary` for that subtree to the matching service-line color from the canonical token registry.

```html
<div class="features-branded-dark__card" data-audience="brand">
  <!-- card content uses --brand-primary, --on-color-primary, etc. -->
</div>
```

The blueprint **MUST NOT** accept a raw hex color as a prop. Instead, `item.audience` selects the canonical brand. This keeps the card automatically theme-aware (dark mode, density modes) and prevents the parallel-taxonomy drift the BDS canon registry exists to stop.

---

## Content contract — `section.items`

```typescript
interface BrandedCardItem {
  name: string;                    // h3
  href: string;                    // Learn more target
  description?: string;            // 1-sentence body
  imageUrl?: string;               // top illustration
  imageAlt?: string;               // a11y
  audience: 'brand' | 'marketing' | 'information' | 'product' | 'service';
}

interface FeaturesBrandedDarkSection extends BlueprintProps {
  section: {
    eyebrow?: string;
    heading: string;
    subheading?: string;
    items: BrandedCardItem[];      // typically 3, but blueprint handles 2-4
  };
}
```

---

## CSS custom properties (variation API)

```
--bp-features-branded-dark-bg          (default: var(--page-inverse))
--bp-features-branded-dark-card-radius (default: var(--border-radius-lg))
--bp-features-branded-dark-gap         (default: var(--gap-lg))
--bp-features-branded-dark-image-pad   (default: var(--padding-xl))
```

Per-card `--bp-card-bg` resolves from `data-audience` to the bound `--brand-primary` for that subtree.

---

## Mode awareness

Spacing-mode-aware tokens for when BDS [#340] ships:

| Mode | Section padding-block | Grid gap | Card body padding |
|---|---|---|---|
| compact | `--padding-xl` | `--gap-md` | `--padding-md` |
| default | `--padding-huge` | `--gap-lg` | `--padding-lg` |
| comfortable | `calc(var(--padding-huge) + var(--padding-lg))` | `--gap-xl` | `--padding-xl` |
| spacious | `calc(var(--padding-huge) * 1.5)` | `--gap-huge` | `--padding-xl` |

---

## WCAG AA contrast — token guardrails

Cards are filled with brand colors that vary per-audience. Contrast posture must be enforced via on-color tokens, not inline overrides:

| Region | Use | Don't use |
|---|---|---|
| Card title text | `--text-on-color-primary` (resolves per-audience to light or dark, contrast-tested) | Hardcoded white |
| Card description | `--text-on-color-secondary` | Hardcoded gray |
| Learn more text | Brand-primary's contrast-paired link color | Hardcoded white-on-color |

**Open contrast question (this is the real one):** Brik's poppy `#e35335` against white text fails AA at 14px (3.78:1). The brand audience's card is exactly that combination. Three resolution paths, **needs ADR-level decision**:

1. **Bold body text on cards** — `font-weight: 600` boosts perceived contrast and is allowed by AA at 14px.
2. **Larger body size** — promote card description to 16px, which passes at 3:1.
3. **Lighten the brand red** — token-layer change, breaks Brik brand recognition.

Default proposal: **bold weight on card title + body**, ship the rest of the system and queue the brand-red review as a follow-up ADR. Recommend this be a BDS-side decision tracked alongside [#40].

---

## Atmosphere compatibility

| Atmosphere | Behavior |
|---|---|
| `none` | Default — clean dark surface |
| `editorial-luxury` | Adds subtle vignette to card edges; safe |
| `cinematic-dramatic` | Adds film-grain over section; cards still readable |
| `clean-bright` | Off-pattern — doesn't apply to dark sections; consumer should avoid |

Per cascade rule: atmospheres MUST NOT override `--page-*`, `--surface-*`, `--text-*`, `--border-*`. Decoration only.

---

## Renderer outputs

- `content-system/blueprints/astro/Features3ColBrandedDark.astro`
- `content-system/blueprints/react/Features3ColBrandedDark.tsx` (new directory)
- Storybook stories:
  - **Default** — 3 cards with brand/marketing/product audiences (the brikdesigns "Other Service Lines" fixture)
  - **2 cards** — narrow grid
  - **4 cards** — wraps to second row at desktop
  - **No images** — color-block fallback
  - **Mode: compact / comfortable** — spacing axis demonstration
  - **Atmosphere: editorial-luxury** — overlay validation

---

## Open questions — please weigh in

1. **Per-card image background.** Webflow shows the 3D illustration on a slightly-darker shade of the card's brand color (e.g., yellow card → darker-yellow image bg). Use canonical `--brand-primary-dark` from the audience subtree, or keep the same `--brand-primary` and rely on illustration to provide visual contrast? **Default proposal: same brand-primary**, keeps the system simpler.
2. **Card hover.** Webflow has subtle scale-up on hover. Match (with `transform: scale(1.02)` + transition) or static? **Default proposal: subtle scale on hover, opt-out via `--bp-features-branded-dark-hover-scale: 1`.**
3. **Audience scope binding.** The card's `data-audience` re-binds `--brand-primary` for the subtree. Should the blueprint also bind `--text-link` and `--border-brand-primary` to the same audience, or stop at `--brand-primary`? **Default proposal: bind the full brand-token set** so on-card links/borders also follow the audience.
4. **Image fallback.** When no `imageUrl`, render an oversized `ServiceTag` (icon variant) centered, or keep the brand-color block clean with no glyph? **Default proposal: oversized icon fallback**, matches the services blueprint pattern.
5. **Section heading alignment.** Webflow centers it. Allow left-align variant or lock to centered? **Default proposal: lock centered** for this blueprint; left-align is a different blueprint.

---

## Acceptance criteria

- Composes BDS primitives only (zero one-off CSS in the consumer repo for this section)
- Per-card brand color comes from `data-audience` subtree binding, never raw hex
- Passes WCAG AA via on-color tokens (subject to open question #1 resolution on bold-vs-larger text)
- Responds to `data-theme` and `data-mode-spacing` automatically
- Atmospheres compose cleanly without overriding theme tokens
- Tree-shakes when not used

---

## Sequencing

Same as `services_3col_card_grid` — spec sign-off → JSON entry → Astro renderer → React renderer → Storybook stories → consumer adoption.
