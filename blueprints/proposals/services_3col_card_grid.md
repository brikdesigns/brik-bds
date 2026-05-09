# Spec: `services_3col_card_grid`

**Status:** Proposed · awaiting review
**Section type:** `services`
**Driver:** brikdesigns.com service-line page (e.g. `/services/information`) renders a 3-col service card grid with a top illustration, service-line badge, name, description, "Has Options" indicator, and "Learn more" link. None of the three existing `services_*` blueprints fit this shape.
**Renderers required:** Astro (parity with existing blueprints) + React (Next.js consumers — brikdesigns.com)

---

## Proposed JSON entry — `blueprint-library.json`

```jsonc
{
  "key": "services_3col_card_grid",
  "name": "3-Column Service Card Grid",
  "section_type": "services",
  "industries": ["universal", "small_business", "creative", "saas", "marketing"],
  "moods": ["approachable", "professional", "modern", "warm"],
  "layout_spec": "Light background section. Centered section header (eyebrow optional + heading + optional one-line subhead). 3-column grid of service cards below. Each card: top image area (3:2 aspect) showing service-specific 3D illustration or photo on a light backdrop; below, a small ServiceTag (icon variant, accent color) + service name (heading/sm, 700 weight) + 1-2 sentence description (body/sm, muted) + 'Learn more' ghost-variant link-button. Optional 'Has Options' positive-status badge anchored top-right of card when the service exposes multiple offerings. Cards have rounded corners (border-radius-md), no border at rest, optional subtle hover lift. Grid gap is generous (24-28px). Collapses to 2-col at <992px, 1-col at <768px.",
  "css_hints": ".services-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--gap-lg); } .service-card { background: var(--surface-primary); border-radius: var(--border-radius-md); overflow: hidden; position: relative; } .service-card__media { aspect-ratio: 3/2; background: var(--surface-secondary); } .service-card__body { padding: var(--padding-lg); display: flex; flex-direction: column; gap: var(--gap-sm); } .service-card__has-options { position: absolute; top: var(--gap-md); right: var(--gap-md); }",
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
| `features_3col_icon_grid` | Icon-led — no top-image area. Service cards lead with a 3D illustration of the deliverable, not an icon glyph. |
| `services_numbered_rows` | Vertical numbered list, not a grid. Different IA. |
| `services_detail_two_column` | Single-service detail layout. Wrong shape for category-index pages. |
| `services_numbered_accordion` | Collapsed sections. No image. |

---

## BDS primitive composition (no one-off CSS)

| Card region | BDS primitive | Notes |
|---|---|---|
| Card frame | `Card` (with `padding="none"` + `radius="md"`) | Body padding handled by inner wrapper |
| Top image area | Slot — accepts `<img>` / Next `<Image>` / Astro `<Image>` | Aspect ratio + bg via component CSS, not consumer CSS |
| Service-line badge | `ServiceTag` `variant="icon"` `size="md"` `serviceName={item.name}` | Resolves the per-service icon |
| Has Options | `Badge` `status="positive"` `size="sm"` (label: "Has Options") | Absolute-positioned top-right of card |
| Service name | Heading slot — uses `heading/sm` token (20px/bold) | No new typography preset |
| Description | Body slot — uses `body/sm` token + `text-secondary` color | |
| Learn more | `LinkButton` `variant="ghost"` `size="sm"` | Brand-color text, no fill |

---

## Content contract — `section.items`

```typescript
interface ServiceCardItem {
  name: string;                    // h3
  href: string;                    // Learn more target
  description?: string;            // body, optional
  imageUrl?: string;               // top image, optional
  badge?: ServiceCategory;         // resolves ServiceTag icon
  hasOptions?: boolean;            // shows "Has Options" badge
}

interface ServicesGridSection extends BlueprintProps {
  section: {
    eyebrow?: string;
    heading: string;
    subheading?: string;
    items: ServiceCardItem[];
  };
}
```

---

## CSS custom properties (variation API)

Per BDS convention, the blueprint exposes `--bp-*` props for safe per-instance variation without forking:

```
--bp-services-grid-bg            (default: var(--page-primary))
--bp-services-grid-card-radius   (default: var(--border-radius-md))
--bp-services-grid-gap           (default: var(--gap-lg))
--bp-services-grid-image-bg      (default: var(--surface-secondary))
--bp-services-grid-hover-lift    (default: 0 — no lift; consumers can opt-in to translateY(-4px))
```

Atmosphere CSS files MUST NOT override `--surface-*`, `--text-*`, `--border-*` per the cascade rules — those stay theme-layer.

---

## WCAG AA contrast — token guardrails

The brikdesigns.com a11y CI surfaced two known BDS-level contrast tensions on `/services/brand/logo-design` that this blueprint must NOT inherit. Authoring discipline:

| Region | Use | Don't use | Why |
|---|---|---|---|
| Card description body | `--text-primary` (passes AA on `--surface-primary`) | `--text-secondary` (#828282 → 3.84:1 on white at 14px, fails AA) | Body copy must clear AA — the gray-on-white tension is tracked in BDS [#40] burndown. |
| Card "Learn more" link | `LinkButton variant="ghost"` size `md` (default 14px label) | `LinkButton variant="primary"` size `sm` on light backgrounds | White-on-poppy `#e35335` = 3.78:1 at 14px. Small primary buttons are an open BDS contrast issue. |
| Section heading | `--text-primary` | — | Always passes. |
| Optional eyebrow | `--text-brand-primary` on light bg | small (<14px) brand-primary on light | Brand-primary at body sizes passes; tiny eyebrow text needs review. |
| Has Options badge | `Badge status="positive"` (uses `--background-positive` + `--text-on-positive`) | inline color overrides | BDS Badge is contrast-tested. |

**Acceptance:** Storybook story renders zero new color-contrast violations against the brikdesigns axe baseline. If the surfaced tokens force a regression, **this blueprint is the wrong shape — redesign rather than baseline-bypass**.

## Mode awareness

The blueprint's spacing should respond to the `data-mode-spacing` attribute (BDS issue #340 — currently dormant). Recommend wiring this blueprint with the spacing-mode tokens at author time so it lights up when the dormant modes ship:

| Mode | Padding | Gap |
|---|---|---|
| compact | `--padding-md` | `--gap-md` |
| default | `--padding-lg` | `--gap-lg` |
| comfortable | `--padding-xl` | `--gap-xl` |
| spacious | `--padding-huge` | `--gap-huge` |

---

## Renderer outputs

- `content-system/blueprints/astro/Services3ColCardGrid.astro` — Astro implementation, conforms to existing `BlueprintProps`
- `content-system/blueprints/react/Services3ColCardGrid.tsx` — React implementation, same prop contract (new directory)
- `BlueprintDispatcher.tsx` — React dispatcher, mirrors existing Astro dispatcher
- Storybook stories:
  - **Default** — 6 service cards (the brikdesigns Information Design fixture)
  - **No images** — fallback to ServiceTag-only display
  - **With Has Options badge** — one card flagged
  - **Mode: compact / comfortable / spacious** — spacing axis demonstration once #340 is wired
  - **Atmosphere: minimal-clinical / clean-bright / warm-soft** — atmosphere overlay validation

---

## Open questions — please weigh in

1. **Hover treatment.** Webflow has no hover effect on service cards. `features_3col_icon_grid` has translateY + shadow. Match Webflow (no hover, opt-in via `--bp-services-grid-hover-lift`) or align with the `features_*` pattern (hover lift on by default)? **Default proposal: no hover.**
2. **Image fallback.** When `imageUrl` is missing, show oversized `ServiceTag` (variant: icon, size: lg) centered in the image area, or collapse the image area entirely? **Default proposal: oversized icon fallback** so the grid keeps consistent rhythm.
3. **"Has Options" badge wording.** Webflow uses literal "Has Options". Other Brik surfaces use "Multiple Tiers". Canonical label here? **Default proposal: "Has Options"** to match Webflow.
4. **Card border-radius.** Webflow ~12px. `--border-radius-md` is currently 8px. Use existing token, or add a `--border-radius-card` (12px) as a card-specific token? **Default proposal: use `--border-radius-md`.** If we want a card-specific value, that's a token-layer decision, not blueprint-layer.
5. **Section background.** Webflow uses a light-grey. Map to `--surface-secondary` or stay on `--page-primary`? **Default proposal: `--page-primary` with consumers free to override via atmosphere.**

---

## Acceptance criteria

A consumer site (Astro or Next.js) renders this blueprint with `BlueprintDispatcher`, supplies a `section.items` array, and gets a pixel-faithful service-card grid that:

- Composes BDS primitives only (no inline styles, no custom CSS in the consumer repo for this section)
- Responds to `data-theme="dark"` automatically (token cascade)
- Respects `data-mode-spacing` (once #340 ships)
- Supports per-instance variation via `--bp-*` props
- Passes WCAG 2.1 AA (semantic h3 list, aria-labelledby on the section, keyboard-focusable Learn more links)
- Tree-shakes cleanly when not used

---

## Sequencing

1. Spec review + sign-off (this PR)
2. Author Astro renderer + JSON entry (existing blueprint pattern)
3. Author React renderer + dispatcher (new for BDS)
4. Storybook stories (5 variants above)
5. Consumer adoption — `web/brikdesigns` service category page swaps custom CSS for `<BlueprintDispatcher blueprintKey="services_3col_card_grid" />`
