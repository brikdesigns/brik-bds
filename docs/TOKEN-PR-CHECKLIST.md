# Token PR Checklist

Run `./scripts/pr-checklist.sh` (or `./brik-bds/scripts/pr-checklist.sh` from a consuming project) before raising any PR that touches a token file, theme file, component CSS, or consuming project stylesheet.

---

## Scope rule — one concern per PR

| Concern | Standalone PR |
|---------|--------------|
| Theme file changes (`theme-{client}.css`) | Yes |
| BDS component CSS changes | Yes |
| BDS submodule sync | Yes |
| Consuming project component fixes | Yes |

Never combine theme changes + component fixes + submodule sync in a single PR. Each is independently reviewable — mixing them makes regressions invisible.

---

## Automated checks (run by `pr-checklist.sh`)

| Check | What it catches |
|-------|----------------|
| `lint-tokens.js --errors-only` | Primitive tokens in component CSS, hardcoded values, unknown vars, **wrong-family token in property slot (see table below)** |
| `token-audit.sh` (consuming projects) | Raw hex, hardcoded px, raw `var()` strings in style props, wrong element types |
| Tier 2 hex scan | Raw hex values in the semantic section of theme files |

All three must pass before the PR is ready for review.

---

## Token-family ↔ property pairing

Even when a token name resolves to the visually right hue, the **family** must match the property's slot. Mixing them up was the failure mode behind portal #512 / #553 (rolled back) and brikdesigns #99 — caught only in browser review. `lint-tokens.js` Rule 5 now enforces this as a hard gate.

| Property | Allowed token families |
|---|---|
| `background-color`, `background` | `--background-*`, `--surface-*` |
| `color` | `--text-*`, `--color-*` (primitives) |
| `border-color`, `border-{side}-color` | `--border-*`, `--background-*` (fill-matching borders) |
| `outline-color` | `--border-*` |

Custom-property declarations inherit the allowlist of their LHS prefix family — e.g. `--background-inverse: var(--text-foo)` fails because `--background-*` declarations follow the `background-color` rule, which doesn't include the text family.

**TSX inline styles follow the same rule** — `style={{ backgroundColor: 'var(--text-service-marketing)' }}` is the canonical failure case.

**Escape hatch:** when a cross-family alias is intentional (e.g. a divider line rendered as a 1px `background-color` of `--border-muted`), add an inline `bds-lint-ignore token-family — <reason>` comment and link to a tracking issue. The comment must justify the design intent, not silently suppress the rule.

### Examples

```css
/* ✅ Pass — same family */
background-color: var(--background-primary);
color: var(--text-primary);
border-color: var(--border-negative);

/* ✅ Pass — border allows fill-matching --background-* */
border-color: var(--background-brand-primary);

/* ❌ Fail — text family in background slot */
background-color: var(--text-service-marketing);

/* ❌ Fail — background family in text slot */
color: var(--background-warning);

/* ❌ Fail — text family in border slot (use --border-negative instead) */
border-color: var(--text-negative);
```

### Registry of intentional cross-family aliases

The aliases below are reviewed, design-approved exceptions — each is a `bds-lint-ignore token-family` site whose cross-family use is the correct call, not a deferred swap. Adding to this list requires the same justification bar as the escape hatch above. Tracked under [#777](https://github.com/brikdesigns/brik-bds/issues/777).

**`--border-*` rendered as `background` — thin lines / hairline UI (border semantics, fill mechanics).**
A 1–2px line or a thin neutral UI element has no content box to hang a `border` on, so it is painted as a `background` fill. The hue is the border-family neutral by intent — these *are* borders, mechanically expressed as fills.

| Site | Token | Element |
|---|---|---|
| `ActivityTimeline.css` | `--border-muted` | hairline connector (2px) |
| `Board.css` | `--border-muted`, `--border-secondary` | scrollbar thumb |
| `ProgressStepper.css` | `--border-secondary` | connector line (2px) + inactive dot |
| `Slider.css` | `--border-secondary` | track rail + disabled thumb |

**`--surface-muted` rendered as `border-color` — `TaskConsole` in-progress spinner track.**
The spinner ring's 3/4 track must stay *subtle on whatever surface it sits on* across themes. No border-family token does this: `--border-primary` resolves to `grayscale-darkest` (#1b1b1b) under `.theme-brand-brik` and reads dark on white; `--border-muted` is mid-grey (#828282) in `:root`. `--surface-muted` is the only token that tracks surface lightness per theme (#f2f2f2 light / #1b1b1b dark), keeping the track subtle in both modes while the leading quadrant carries `--border-brand-primary`. This is a surface-tracking fill in a border slot by design, not a hue mismatch.

| Site | Token | Element |
|---|---|---|
| `TaskConsole.css` | `--surface-muted` | spinner track (`border-color`, 3/4 ring) |

---

## Author checklist

- [ ] `./scripts/pr-checklist.sh` passes with zero errors
- [ ] PR diff is scoped to one concern (see scope rule above)
- [ ] Every semantic token in theme file references a primitive via `var()` — hex appears only in the Tier 1 primitives block
- [ ] Token used in the correct semantic category:
  - `page-*` → page-level backgrounds only
  - `background-*` → UI element fills (cards, buttons, inputs)
  - `color-system-*` → status/error/success/warning only — never for brand
  - `color-department-*` → department color chips only — never for UI state

---

## Reviewer checklist

- [ ] **DevTools → Computed Styles** — confirm no raw hex on at least:
  - Primary button background
  - Page background
  - Body text color
- [ ] If **font families changed**: switch to ★ Font Audit theme in Storybook — heading, body, and label must be visually distinct typefaces
- [ ] If **spacing changed**: eyeball padding/gap on affected components before and after
- [ ] If **BDS submodule synced**: spot-check one component that uses the changed tokens still renders correctly
- [ ] Diff is one concern — if it's not, send back for splitting

---

## Architecture reference

### 2-tier client theme structure

```
Tier 1 — BDS Foundations (figma-tokens.css + gap-fills.css)
  Defines default values. Never edited in consuming projects.

Tier 2 — Client Theme (theme-{client}.css)
  Overrides semantic token VALUES only. Token names stay the same.
  All hex values appear exactly once — in the Tier 1 primitives block.
  All semantic tokens reference those primitives via var().
```

### Correct theme file structure

```css
.theme-client {

  /* TIER 1 — Brand primitives. Hex appears ONCE, here. */
  --color-brand-purple-base: #ba9cc5;
  --color-grayscale-black:   #0a0a0a;

  /* TIER 2 — Semantic overrides. var() references only. */
  --background-brand-primary: var(--color-brand-purple-base);
  --text-primary:             var(--color-grayscale-black);
}
```

### What raw hex in Tier 2 breaks

When semantic tokens hold raw hex instead of `var()` references, every future color change requires hunting down every occurrence instead of changing one primitive. It also makes dark mode impossible — the override block can't flip values it doesn't control.

---

## Common violations

| Violation | Fix |
|-----------|-----|
| `--background-brand-primary: #ba9cc5` in Tier 2 | Move hex to Tier 1 as `--color-purple-base`, reference with `var()` |
| Using `color.department.red` for overdue/error state | Use `color.system.red` — department colors are for chips only |
| `size="xs"` on Badge with label text | Use `size="sm"` — xs is icon-only |
| `padding: '40px'` in style prop | Add to `space` in `tokens.ts`, use `space['2xl']` |
| `font-family-body` on a heading element | Use `font-family-heading` — misuse is invisible until a client theme assigns distinct typefaces |
