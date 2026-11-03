# ADR-046 — The on-color family gains one muted step each: text at 70%, hairline at 12%, composed with `color-mix()`

**Status:** **Accepted** 2026-11-03 (AGENT DECIDED, revisable — § Decision)
**Date:** 2026-11-03
**Supersedes:** —
**Superseded by:** —
**Owner:** Nick Stanerson
**Related:** [#2970](https://github.com/brikdesigns/brik-bds/issues/2970) (this ADR is its AC1 + AC2), [#2851](https://github.com/brikdesigns/brik-bds/issues/2851) (umbrella), [vale-partners#36](https://github.com/brikdesigns/vale-partners/issues/36) (the 9 baselined local tokens), [ADR-015](./ADR-015-brand-primary-aa-large-contrast-policy.md) (white on brand fill is 3.78:1), [ADR-033](./ADR-033-naming-canon-one-word-per-concept.md) (one word per concept), [ADR-043](./ADR-043-system-id-token-prefix.md) (`--{id}-{body}`)

## Context

The on-color family has one step: solid white and solid grayscale-950.

- `--bds-text-on-color-{dark,light}` — `tokens/figma-tokens.css:324-325`
- `--bds-border-on-color-{dark,light}` — `tokens/figma-tokens.css:340-341`

Client sites need a second, quieter step over brand fills, photos and dark sections. They write it by hand. #2970 counted it on 2026-11-03 across 9 `web/*` repos (vendor CSS excluded): 131 site-authored alpha uses in 6 of 9 sites.

| Role | Uses | Base | Alpha cluster |
|---|---|---|---|
| Muted text | 29 | 27 light-on-dark | 22 of 29 at .5–.7 |
| Hairline / border | 28 | 12 light-on-dark, 10 dark-on-light, 6 tinted | 22 of 28 at .06–.16 |
| Fill | 17 | mixed | no cluster (9 distinct values in 12 parsed uses) |
| Scrim | 3 | — | already `--bds-background-overlay` (`tokens/gap-fills.css:329`) |

Muted text and hairlines cluster. Fills do not.

BDS components already make translucency by composing a semantic token, not by baking an RGBA value. `components/ui/Form/Form.css:67` is `color-mix(in srgb, var(--bds-text-negative) 8%, transparent)`.

## Decision

AGENT DECIDED (revisable): four tokens, one muted step per on-color token — evidence: the #2970 table above — revert: delete the four lines in `tokens/gap-fills.css` and the two `contrast-pairings.json` rows.

```css
--bds-text-on-color-dark-muted:    color-mix(in srgb, var(--bds-text-on-color-dark) 70%, transparent);
--bds-text-on-color-light-muted:   color-mix(in srgb, var(--bds-text-on-color-light) 70%, transparent);
--bds-border-on-color-dark-muted:  color-mix(in srgb, var(--bds-border-on-color-dark) 12%, transparent);
--bds-border-on-color-light-muted: color-mix(in srgb, var(--bds-border-on-color-light) 12%, transparent);
```

### 1. The word is `muted`, placed last

`muted` is already the third step of both families this extends: `--bds-text-muted` and `--bds-border-muted` sit beside `primary` and `secondary`. ADR-033 allows one word per concept, so the quieter step reuses that word rather than adding `faint`, `dim` or `subtle`.

The step goes after the whole parent name. A modifier on an on-color or brand token already sits last: `--bds-text-service-brand-on-dark`, `--bds-text-brand-primary-strong`.

No gate enforces the word. Positive control, 2026-11-03: a temporary `--bds-text-on-color-dark-faint` passed both `lint-naming-canon` and `lint-token-purpose-slots`. The choice rests on the precedent above, not on a check.

### 2. Mechanism: `color-mix()` of the parent, in `gap-fills.css`

- **`color-mix()`, not RGBA primitives.** The step follows its parent. A kit that rebinds `--bds-text-on-color-dark` to cream on `:root` gets a cream muted step with no extra line. An RGBA primitive would bake white in and need a second rebind.
- **`gap-fills.css`, not Figma.** A Figma variable cannot hold `color-mix()`. Figma could only hold a baked RGBA, which loses the point above.

### 3. The alphas

- **Text: 70%.** That is the top of the 22-of-29 cluster (.5–.7). It leaves the most headroom on the lighter dark surfaces a client may use.
- **Hairline: 12%.** That is the centre of the 22-of-28 cluster (.06–.16).

One step each. A second, dimmer text step (Vale's `ink-dim` at .42) and a stronger hairline (Vale's `hairline-strong` at .22) stay local until more sites need them.

### 4. Muted text is not for the brand fill

White on the Brik brand fill is already 3.78:1 ([ADR-015](./ADR-015-brand-primary-aa-large-contrast-policy.md)). At 70% it drops to 2.57:1, below every WCAG threshold. On a brand fill, body copy stays solid white. The hairline is still fine there.

### 5. Mode

The four steps are the same in light and dark mode, because their parents are: both on-color tokens resolve to the same value in `figma-tokens.css` and `figma-tokens-dark.css`. The contrast gate scores both modes.

## Consequences

- **Where the derivation computes.** A `color-mix()` over `var()` resolves on the element where it is declared, which is `:root`. A theme that rebinds a parent on `:root` carries the step with it, and `compileClientTheme` defaults to the `:root` selector. A theme that rebinds a parent only on a non-root element (`.theme-brand-brik` on `body` rebinds `--bds-text-on-color-light` to black) leaves the step on the `:root` parent. For Brik that is black vs grayscale-950 at 70%, which is not a visible difference. A theme where it matters must re-declare the step beside its rebind.
- **The hairline has no contrast pairing.** A divider is decorative, so WCAG 1.4.11 does not apply to it.
- **Out of scope:** translucent fills (no shared ramp in the data), scrims (`--bds-background-overlay` covers them), and migrating any consumer.

## Migration

None in BDS. Consumers adopt the tokens site by site. [vale-partners#36](https://github.com/brikdesigns/vale-partners/issues/36) gets the mapping from its Bucket B tokens to these names.

## Enforcement

This extends the contrast gate. It adds no new gate.

- `scripts/validate-themes.js` now scores a translucent foreground (`color-mix(in srgb, <colour> N%, transparent)`) composited over its background. Before, it could not resolve one.
- `tokens/contrast-pairings.json` adds two AA rows for muted text:
  - over `--bds-surface-inverse`: 8.97:1
  - over `--bds-surface-accent-purple`, the darkest accent tint: 5.27:1 light, 7.11:1 dark
- Positive control: a temporary row pairing muted text with the brand fill failed at 2.57:1 with exit 1.
- `stories/foundation/OnColor.stories.tsx` shows each step over a brand fill, a dark surface, a photo stand-in and a light tint. Its `InteractionTestMutedAlpha` reads the computed alpha (0.7 / 0.12). A control expecting 0.5 failed.
