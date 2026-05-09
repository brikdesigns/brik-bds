# Spec: `support_plan_callout_split`

**Status:** Proposed · awaiting review
**Section type:** `cta` (cross-sell callout)
**Driver:** brikdesigns.com "Monthly support services" section — illustration block on left, plan-card on right. Currently rendered as a custom one-off in the consumer repo with NO illustration block.
**Renderers required:** Astro + React

---

## Proposed JSON entry — `blueprint-library.json`

```jsonc
{
  "key": "support_plan_callout_split",
  "name": "Support Plan Callout — Illustration + Plan Card Split",
  "section_type": "cta",
  "industries": ["universal", "small_business", "creative", "agency"],
  "moods": ["approachable", "warm", "professional", "trustworthy"],
  "layout_spec": "Light section. Centered section header (heading + subhead) above. Below: two-column split, content-region (illustration block) left, plan card right. Illustration block: persona/scene composition with floating UI elements (chat bubble, message tile, optional photo) — composed from primitives, NOT a baked-in illustration. Plan card: surface-secondary background, rounded-lg corners, padded generously. Card content: plan name (heading/sm), 2-sentence description (body/sm), 'Learn more' primary CTA. Two-column collapses to stacked at <992px (illustration goes above card on mobile). Section also supports an 'illustration-omitted' variant where the card centers full-width.",
  "css_hints": ".support-plan-callout { padding-block: var(--padding-huge); background: var(--page-primary); } .support-plan-callout__split { display: grid; grid-template-columns: 1fr 1fr; gap: var(--gap-xl); align-items: center; } .support-plan-callout__illustration { aspect-ratio: 1; position: relative; } .support-plan-callout__card { background: var(--surface-secondary); border-radius: var(--border-radius-lg); padding: var(--padding-xl); display: flex; flex-direction: column; gap: var(--gap-md); align-items: flex-start; } @media (max-width: 991px) { .support-plan-callout__split { grid-template-columns: 1fr; } }",
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
| `cta_dark_centered` | Single CTA, dark surface, centered. Not a card-with-illustration shape. |
| `cta_split_contact` | Split, but contact-form on right. Wrong content type. |
| `contact_form_split` | Same — form-based. |
| `features_alternating_split` | Generic feature copy + image. Doesn't represent the plan-card pattern (plan name + price-shaped CTA). |
| Service detail page support CTA | Lives inside the service detail blueprint, not reusable here. |

This is the first reusable cross-sell-to-plan blueprint in the catalog. Gap noted.

---

## BDS primitive composition

| Region | BDS primitive | Notes |
|---|---|---|
| Section frame | Standard `<section>` with `--page-primary` | |
| Section header | Heading + body slot, centered | `heading/lg` + `body/md` muted |
| Illustration block | **Slot — composes from primitives, not a baked image** | See "Illustration composition" below |
| Plan card | `Card` `radius="lg"` `padding="xl"` `surface="secondary"` | |
| Plan card name | Heading slot — `heading/sm` | |
| Plan card description | Body slot — `body/sm`, `--text-secondary` (note: passes AA at 14px on `--surface-secondary`, which is a slightly off-white that increases contrast) — verify when drafting Storybook story |
| Plan card CTA | `LinkButton` `variant="primary"` `size="md"` | 16px label clears AA on `--background-brand-primary` |

---

## Illustration composition (the missing primitive opportunity)

**Gap surfaced — this blueprint reveals BDS doesn't have a generic "illustration scene" primitive.** The Webflow design composes:

- A persona avatar (circle photo)
- A chat-bubble UI tile (rounded card with text)
- A message-bubble (smaller rounded square)
- A secondary photo or shape

These are decorative compositions, not data-bearing UI. Two paths:

**Option A — Build a `<MarketingIllustration>` primitive in BDS** that accepts a slot of "tiles" with an `Avatar`, `Tile`, `Bubble` API. Reusable across blueprints.

**Option B — Inline composition inside this blueprint** (faster, less reusable).

**Recommendation: Option A** — author a small `<MarketingIllustration>` primitive (Avatar + Tile + Bubble, with absolute-positioned layout) as a sibling deliverable to this blueprint. Maintains the system-lens commitment.

For now, **the spec defines the slot contract**. The primitive author or this blueprint's Astro renderer fills it.

```typescript
interface IllustrationSlot {
  type: 'persona-cluster';   // first variant — others can follow (product-cluster, data-cluster, etc.)
  avatar?: { src: string; alt: string };
  tiles?: Array<{
    kind: 'chat-bubble' | 'message' | 'photo' | 'shape';
    content?: string;        // for chat-bubble/message
    src?: string;            // for photo
    fill?: 'brand-primary' | 'positive' | 'neutral';  // canonical token reference
  }>;
}
```

---

## Content contract

```typescript
interface SupportPlanCalloutSection extends BlueprintProps {
  section: {
    eyebrow?: string;
    heading: string;
    subheading?: string;
    illustration?: IllustrationSlot;     // optional — when omitted, plan card centers
    plan: {
      name: string;
      description: string;
      ctaLabel: string;                  // typically "Learn more"
      ctaHref: string;
    };
  };
}
```

---

## CSS custom properties (variation API)

```
--bp-support-plan-callout-bg          (default: var(--page-primary))
--bp-support-plan-callout-card-bg     (default: var(--surface-secondary))
--bp-support-plan-callout-card-radius (default: var(--border-radius-lg))
--bp-support-plan-callout-gap         (default: var(--gap-xl))
--bp-support-plan-callout-card-pad    (default: var(--padding-xl))
```

---

## Mode awareness

| Mode | Section padding-block | Card padding | Split gap |
|---|---|---|---|
| compact | `--padding-xl` | `--padding-lg` | `--gap-lg` |
| default | `--padding-huge` | `--padding-xl` | `--gap-xl` |
| comfortable | `calc(var(--padding-huge) + var(--padding-lg))` | `calc(var(--padding-xl) + var(--padding-md))` | `--gap-huge` |
| spacious | `calc(var(--padding-huge) * 1.5)` | `--padding-huge` | `--gap-huge` |

---

## WCAG AA contrast — token guardrails

| Region | Use | Don't use |
|---|---|---|
| Card description | `--text-primary` on `--surface-secondary` | `--text-secondary` at 14px (still 3.84:1 against light surfaces — `--surface-secondary` improves to ~4.05:1, still fails) |
| CTA primary button | `LinkButton size="md"` (16px label) | `size="sm"` (14px hits the white-on-poppy 3.78:1 fail) |
| Illustration tile text | Per-tile token resolved by `fill` prop | Hardcoded |

**System-level gap noted:** `--text-secondary` fails AA at body sizes on every light surface in the system. This is the same thing tracked in BDS [#40] burndown but worth restating: it shows up in *every* blueprint that puts secondary body text on a light surface. Either (a) darken `--text-secondary` token, or (b) introduce a new `--text-secondary-aa` token reserved for ≤14px usage. **Recommend BDS-side discussion before this blueprint ships** — otherwise we're encoding the failure into a system primitive.

---

## Atmosphere compatibility

| Atmosphere | Behavior |
|---|---|
| `none` | Default |
| `warm-soft` | Adds subtle warm overlay, complements the persona-cluster illustration |
| `clean-bright` | Sharp clean lines, default-friendly |
| `editorial-luxury` | Adds vignette to section corners |

---

## Renderer outputs

- `content-system/blueprints/astro/SupportPlanCalloutSplit.astro`
- `content-system/blueprints/react/SupportPlanCalloutSplit.tsx`
- (Optional sibling deliverable) `<MarketingIllustration>` primitive — see "Illustration composition" gap above
- Storybook stories:
  - **Default** — full split with persona-cluster illustration (brikdesigns Information Design fixture)
  - **No illustration** — card centers full-width
  - **Mode: compact / comfortable**
  - **Atmosphere: warm-soft**

---

## Open questions — please weigh in

1. **Build `<MarketingIllustration>` primitive now or inline it?** Reusable primitive is the system-lens answer. Confirms this is the right scope expansion. **Default proposal: build the primitive** as a sibling deliverable.
2. **Plan card surface.** Webflow uses a slightly off-white surface. Map to `--surface-secondary` (an existing token) or introduce a `--surface-callout` (new token)? **Default proposal: `--surface-secondary`.**
3. **Plan name typography.** Webflow uses heading-sm-weight. Match (`heading/sm`) or use a more visually-prominent `heading/md`? **Default proposal: `heading/sm`** for plan-card density.
4. **Eyebrow on this blueprint.** Webflow has the section title only ("Monthly support services"), no eyebrow. Allow eyebrow as optional prop or omit from API? **Default proposal: optional**, leaving consumer choice.
5. **Mobile order.** When stacked, illustration above or below the plan card? Webflow puts illustration first, but card-first might convert better. **Default proposal: illustration-first** to match Webflow.

---

## Acceptance criteria

- Composes BDS primitives only (assumes `<MarketingIllustration>` ships as sibling)
- Plan card text passes AA on `--surface-secondary` (verify in story)
- CTA passes AA at `size="md"`
- Responds to `data-theme`, `data-mode-spacing`, atmospheres
- Stacks gracefully on mobile, illustration-first
- Tree-shakes when not used

---

## Sequencing

1. Spec sign-off (this PR)
2. Resolve "build `MarketingIllustration` primitive" question — if yes, sibling primitive PR opens first
3. JSON entry + Astro renderer
4. React renderer
5. Storybook stories
6. Consumer adoption — brikdesigns.com service category page
