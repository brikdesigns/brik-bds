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
| `lint-tokens.js --errors-only` | Primitive tokens in component CSS, hardcoded values, unknown vars |
| `token-audit.sh` (consuming projects) | Raw hex, hardcoded px, raw `var()` strings in style props, wrong element types |
| Tier 2 hex scan | Raw hex values in the semantic section of theme files |

All three must pass before the PR is ready for review.

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
