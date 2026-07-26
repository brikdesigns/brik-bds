# ADR-021 — Blueprint section shell ships as global CSS, harmonised to one vertical rhythm

**Status:** Accepted (2026-07-26)
**Date:** 2026-07-26
**Supersedes:** —
**Superseded by:** —
**Owner:** Nick Stanerson
**Related:** #1439 (this change), #1438 (blueprint cleanup umbrella), #1443 (token burn-down — canonicalised the token names this shell now consumes), ADR-014 (Tier-4 hook namespace — why rhythm is not hooked), ADR-017 (slot pattern gate — why `bds-blueprint-section__*` needs no allowlist entry), ADR-008 (naming canon)

## Context

Six canonical blueprint families — `bds-hero`, `bds-about`, `bds-features`, `bds-cta`, `bds-card-grid`, `bds-support-plan` — each re-declared the same four things: section vertical rhythm, the centred max-width container, a visually-hidden utility, and the content-needed media stub. Each declaration existed twice, once in `content-system/blueprints/react/*.css` and again in every `content-system/blueprints/astro/*.astro` scoped `<style>`.

The copies had drifted. Measured on `main` at v0.135.0, the rhythm clamp `clamp(var(--padding-xl), Nvw, var(--padding-huge))` used five different values of N:

| Family | React | Astro |
|---|---|---|
| `bds-hero` | 7vw | 8vw (`HeroSplit6040`), 6vw (`HeroInteriorMinimal`), 6vw (`HeroSplitImageCardOverlay`) |
| `bds-about` | 7vw | 7vw (`AboutStorySplit`) |
| `bds-card-grid` | 7vw | 7vw (`CardGrid`) |
| `bds-cta` | 8vw | 8vw (`CtaDarkCentered`), 7vw (`CtaSplitContact`) |
| `bds-features` | 9vw | 9vw (`Features3ColBrandedDark`) |
| `bds-support-plan` | 9vw | 9vw (`SupportPlan`) |

Containers had drifted too: four families on `var(--content-width-xl)`, two on a raw `1280px` literal (the same computed value, un-tokenised), and `bds-cta` deliberately narrower on `var(--content-width-wide)` with a wider `--padding-xl` inline inset.

`.sr-heading` was copy-pasted verbatim into `StatsDarkBar.astro` and `TestimonialsFeaturedLarge.astro`. The content-needed media stub was copy-pasted three times inside the hero family alone (React `Hero.css`, `HeroSplit6040.astro`, `HeroSplitImageCardOverlay.astro`), identical apart from aspect-ratio and corner radius.

A React-only primitive cannot fix this: half the duplication lives in `.astro` files that never import React. The shell has to be **CSS classes** both renderers compose.

## Decision

### 1. Harmonise the rhythm to one value — 7vw

`.bds-blueprint-section` declares `padding-block: clamp(var(--padding-xl), 7vw, var(--padding-huge))` for all six families. 7vw is the plurality across both renderers (5 of 12 declarations).

The 7/8/9vw spread was **not** intentional per-section tuning. The decisive evidence is that the React and Astro twins of the *same* family disagree with each other — hero is 7vw in React and 8vw/6vw/6vw across its three Astro renderers; cta is 8vw in React and 8vw/7vw across its two. One family cannot have two intentional rhythms, so the spread is copy-paste drift. No commit message, comment, or design doc records an intent for any of the values.

**Visible effect is much smaller than the 7-vs-9 spread suggests**, because the clamp saturates. `--padding-xl` / `--padding-huge` are *density-mode* tokens, not viewport-responsive ones, so both bounds are fixed at a given `[data-mode-spacing]` and every `Nvw ≥ 7` pins to `--padding-huge` past a threshold viewport:

| Spacing mode | `--padding-xl` → `--padding-huge` | 9vw saturates | 7vw saturates | Where 7vw and 9vw differ |
|---|---|---|---|---|
| `compact` | 24 → 32px | 356px | 457px | 267–457px only |
| default | 32 → 48px | 533px | 686px | 356–686px, peak ~10px @ 500px |
| `comfortable` | 40 → 80px | 889px | 1143px | 444–1143px, peak ~15px @ 768px |
| `spacious` | 80 → 128px | 1422px | 1829px | 889–1829px, peak ~27px @ 1440px |

So in the **default** mode every desktop width renders identically before and after — the harmonisation is a no-op above 686px. The change is visible on mobile/tablet in default mode (≤10px) and on desktop only under `spacious` (up to ~27px at 1440px). The same saturation applies to the 8vw → 7vw moves.

An earlier draft of this ADR claimed a 108px → 84px shift at 1200px in the *default* mode. That was wrong — it misread the `[data-mode-spacing]` blocks in `dist/tokens.css` as viewport breakpoints. The numbers above are computed from the actual token values.

**The shell's own rhythm is deliberately not a Tier-4 hook.** ADR-014 requires a Tier-4 fallback to resolve to a Semantic token, never a raw `clamp()` literal, so `var(--bds-blueprint-section-padding-y, clamp(…))` is out. A family that genuinely needs different rhythm re-declares `padding-block` on its own selector and wins by being unlayered (see decision 2).

**Two rhythm exceptions survive, both because they are twin-consistent:**

- `bds-card-grid` keeps a heavier `padding-block-end` — deliberate asymmetry, more air under the last card row than above the header.
- `.bds-hero--with-pricing-card` keeps `clamp(var(--padding-xl), 6vw, var(--padding-huge))` behind the pre-existing `--bds-hero-padding-y` hook. Unlike the drifted values, this one is *identical* in React `Hero.css` and `HeroSplitImageCardOverlay.astro` and is documented as a published hook in both file headers — a modifier-level decision about interior pages, not copy-paste. (Its `var(--hook, clamp(…))` shape does contradict ADR-014's fallback rule; it survives lint only because the declaration is line-wrapped and the rule is line-based. Left as-is — reconciling it is ADR-014's burn-down, not #1439's.)

`HeroInteriorMinimal.astro`'s 6vw does **not** qualify: React's `.bds-hero--interior-minimal` carries no rhythm override, so the two renderers disagreed. It harmonises to 7vw.

### 2. Ship the shell as global (unlayered-safe) CSS, layered under `bds-components`

One physical file, `content-system/blueprints/section-shell.css`, imported by both renderers:

- **React** — each family's `.tsx` side-effect-imports it; Vite bundles it into `dist/styles.css` exactly once. No consumer-visible change.
- **Astro** — each blueprint's frontmatter imports it, which makes Astro emit it as a **global, unscoped** stylesheet. Astro dedupes it and only ships it on pages that render a blueprint. `<style is:global>` was rejected: it would duplicate the CSS text in every component.

This is a package-contract change. `@brikdesigns/bds/blueprints-astro` has never shipped global CSS before — every blueprint was fully scoped. The file is added to `package.json` `files` so it reaches the tarball; no new export entry is needed because consumers never import it directly, the shipped `.astro` source does.

**The cascade risk is closed by a layer.** Every rule in the shell sits in `@layer bds-components` — the layer BDS components already use. All existing blueprint CSS (React `.css` and Astro scoped `<style>`) is unlayered, and an unlayered rule always outranks a layered one regardless of source order. Two properties follow:

1. A family override needs no `!important`, no specificity bump, and no dependence on bundler import order.
2. A consumer site's own unlayered CSS can never be outranked by CSS this package injects globally.

That second property is what makes shipping global CSS to six consumer repos safe, and it holds unconditionally — a layer that a consumer never declares is still ordered below unlayered rules.

### 3. Keep `bds-cta` narrower via a documented Tier-4 hook, not a shared default

The container exposes two hooks whose fallbacks resolve to Semantic tokens, satisfying ADR-014:

```css
.bds-blueprint-section__container {
  max-width: var(--bds-blueprint-section-content-width, var(--content-width-xl));
  margin-inline: auto;
  padding-inline: var(--bds-blueprint-section-padding-inline, var(--padding-lg));
}
```

`bds-cta`'s narrower centred band stays a deliberate exception, declared on the container it applies to:

```css
.bds-cta__container {
  --bds-blueprint-section-content-width: var(--content-width-wide);
  --bds-blueprint-section-padding-inline: var(--padding-xl);
}
```

Folding 1024px into the shared default would have widened nothing and narrowed five families; folding it away would have widened the CTA band by 256px. Neither is a change #1439 asked for. The hook keeps the exception visible and overridable instead of hidden in a family stylesheet.

### 4. Compose alongside family slots — and retire the four the shell fully absorbed

The shell classes are added **alongside** the family classes (`class="bds-blueprint-section bds-hero"`, `class="bds-blueprint-section__container bds-hero__container"`), so a family slot that still styles something stays published and every consumer override targeting it keeps working. Per ADR-017 the new names need no allowlist entry — they are well-formed under the slot grammar.

Four slots ended up with **zero** remaining declarations once the shell absorbed them, and were removed from the markup rather than left as classes BDS no longer defines:

| Removed slot | Why |
|---|---|
| `bds-card-grid__container` | container styling was its only content |
| `bds-features__container` | same |
| `bds-support-plan__container` | same |
| `bds-hero__missing-label` | label styling was identical in all three copies |

Keeping them would leave a `bds-*` class in shipped markup with no rule anywhere in `dist/styles.css` — precisely the undefined-`bds-*` shape `canonical-class-check` exists to reject, and it fails the gate. `bds-hero__container`, `bds-about__container`, `bds-cta__container` and `bds-hero__missing` all retain family-specific declarations and stay.

**Naming.** The block is `bds-blueprint-section`, not the shorter `bds-section`, and the utility is `bds-visually-hidden`, not `bds-sr-only`. Both short names were tried first and both broke `canonical-class-check`: publishing a `bds-<root>` class makes the bare `<root>` a "shadow root" violation everywhere it appears. `section` is the name of the core `BlueprintProps.section` field, so `.section` matched JS property access (`...section`) in blueprint source and would fire in every consumer page; `.sr-only` is the near-universal Tailwind/Bootstrap utility name and would fire in every consumer stylesheet. `blueprint-section` and `visually-hidden` are both collision-free.

## Consequences

- **Four blocks have one definition each** instead of 12, 12, 2 and 3. A rhythm change is now a one-line edit, not a twelve-file sweep.
- **React and Astro twins can no longer drift** on rhythm or container width — they read the same file.
- **The rhythm change is invisible at desktop widths in the default spacing mode** (the clamp saturates above 686px) and caps at ~10px on mobile/tablet. It is only materially visible under `[data-mode-spacing="spacious"]`, where `bds-features` / `bds-support-plan` / `HeroSplit6040` / `CtaDarkCentered` tighten by up to ~27px at 1440px and `HeroInteriorMinimal` loosens. See the saturation table above — these are the only intended visual changes.
- **Four family slots are retired** (table above). A consumer stylesheet targeting `bds-card-grid__container`, `bds-features__container`, `bds-support-plan__container` or `bds-hero__missing-label` must retarget the shell class. Per the package spec §1.4 new-architecture client repos hand-roll no sections and take fixes via `npm update`, so the exposure is limited to bespoke override CSS.
- **A gate ships with the fix.** `lint-blueprint-naming.mjs` gains a `section-shell-redeclared` rule that fails any bare `.bds-<family> { padding-block }` or `.bds-<family>__container { max-width | margin-inline | padding-inline }`, and it now runs in `npm run validate` and the release workflow, not just pre-commit. It caught a real inconsistency in this change's own first draft.
- **The Astro package now ships one global stylesheet.** Consumers get it automatically on `npm update`; nothing to import. The layer guarantees it cannot outrank their own CSS.
- **`bds-hero__missing` keeps only what varies** (aspect-ratio, corner radius). `bds-features__image-fallback` is *not* folded in — it is a genuinely different treatment (a scaled `ServiceTag` icon, not a dashed stub) and stays where it is.
- **Legacy `bp-*` blueprints adopt only `bds-visually-hidden`.** `StatsDarkBar` and `TestimonialsFeaturedLarge` are outside the six canonical families; their rhythm and containers are untouched. Migrating them is follow-up work, not this decision.
