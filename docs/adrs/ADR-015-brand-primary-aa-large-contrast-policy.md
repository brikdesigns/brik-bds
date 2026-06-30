# ADR-015 — Brand-primary holds the vibrant brand color; its fills + accent text are gated AA-large (3:1)

**Status:** Proposed (2026-06-30) — pending BDS-22 PR review
**Date:** 2026-06-30
**Related:** BDS-22 (Brand Color Update), BDS-18 (Color Pairings), BDS-20 (Expand Color Scale), [#710](https://github.com/brikdesigns/brik-bds/pull/710) + [#719](https://github.com/brikdesigns/brik-bds/pull/719) (the AA darkening this reverses), [ADR-011](./ADR-011-service-line-token-value-model.md) (Figma Brand Kit is SoT), [Color Pairings](../../docs-site/content/docs/primitives/color-pairings.mdx), `tokens/contrast-pairings.json` (rule in force)
**Owner:** Nick Stanerson

## Context

Brik's brand color is **Poppy `#e35335`** (`--color-poppy-light`) — a vibrant red that carries the agency's tone. The Style Dictionary brand-kit (`design-tokens/brand-kits/brik.json`) and the generated `figma-tokens.css` both define **every** brand-primary semantic token as `{color.poppy.light}` at rest (fills, text, link, border), with the darker steps reserved for `-hover`/`-pressed`. Per ADR-011 the Figma Brand Kit is the source of truth for brand values.

The hand-maintained overlay `tokens/theme-brand-brik.css` had **diverged** from that canon. To clear the contrast gate's AA floor (4.5:1), [#710](https://github.com/brikdesigns/brik-bds/pull/710) and [#719](https://github.com/brikdesigns/brik-bds/pull/719) re-pointed the brand-primary *base* tokens (`--surface-/-background-/-text-brand-primary`) from `poppy-light` to `poppy-dark` (`#b0351b` — a darker "blood red"). Because `theme-brand-brik.css` bundles into `dist/tokens.css`, that divergence shipped to every consumer (`brikdesigns.com`, `brik-client-portal`), replacing the brand color with the darker hue across all brand touchpoints.

The root cause is a **threshold mismatch, not a value problem.** White on `poppy-light` is **3.78:1**: it fails WCAG AA for *normal text* (4.5:1) but clears **AA-large (3:1)** — the threshold WCAG defines for large/bold text (1.4.3) and for graphical/UI-component contrast (1.4.11). This is the same call Grubhub/DoorDash/Netflix/Pinterest make for white-on-red CTAs. The BDS contrast gate (`scripts/validate-themes.js` + `tokens/contrast-pairings.json`) already supports an `AA-large: 3` tier (used today for muted text and the service inverse-card fills) — but the brand-primary pairings were assigned `AA`, leaving no path to ship the brand color except darkening it.

## Decision

**Brand-primary tokens hold the vibrant brand color (`poppy-light`) at rest, matching the brand-kit canon. The pairings that this implies at 3.78:1 are gated AA-large (3:1), not AA.**

1. **Restore `theme-brand-brik.css` to the brand-kit value model** — `--surface-/-background-/-text-brand-primary` base = `poppy-light` in both light and dark modes; state siblings darken on interaction in light (`hover → poppy-dark`, `pressed → poppy-darker`) and brighten in dark, per the brand-kit progression. The fix removes a hand-divergence; it does not introduce a new value.

2. **Reclassify three brand pairings `AA → AA-large` in `contrast-pairings.json`**, each carrying an inline `note`:
   - *On-color label on brand fill* (white CTA label on `--background-brand-primary`, 3.78:1) — a UI-component fill with a large/bold label (1.4.11 + 1.4.3 basis), same basis as the already-AA-large service inverse-card fills.
   - *Brand text on page* (`--text-brand-primary` on white, 3.78:1) — the heading/accent role this token serves.
   - *Outline Button label on hover/press fill* (`--text-brand-primary` on the neutral hover fill, 3.38:1 light) — a large/semibold button label.

3. **`contrast-pairings.json` remains the single rule in force.** The gate, the Storybook ContrastCompliance dashboard, and `color-pairings.mdx` all read it. The `policy` string is amended to state the brand-primary AA-large allowance.

The contrast gate passes at exit 0 with the vibrant values restored.

## The three judgment calls (what reviewers must weigh)

1. **"Brand text on page" → AA-large is the softest call.** Following the brand-kit, `--text-brand-primary` is vibrant `poppy-light` (3.78:1 on white). AA-large is correct *only if* the token is used in a heading/accent role. At small body sizes 3.78:1 fails real AA. The safeguard is a **usage rule** ("small body copy uses `--text-primary`, never `--text-brand-primary`") — see § Advisory claim below.
2. **"Outline Button label on hover/press fill" = 3.38:1 is the thinnest margin.** It clears AA-large, but our Button labels are semibold (600) at ~14–16px, and WCAG large-text strictly wants ≥18.66px **bold (700)**. This pairing leans on the UI-component (1.4.11) reading more than the large-text (1.4.3) reading. Defensible, but the narrowest in the set.
3. **Dark-mode hover legibility is a pre-existing gap, deliberately out of scope.** `--surface-brand-primary-hover` brightens to `poppy-lighter` (`#ffa693`) in dark mode, where a white label is illegible. This predates BDS-22 (#710 flagged it) and is not touched here. Tracked separately (new ticket).

## Advisory claim — not yet CI-asserted

Per the Canonical-Claim Lifecycle (documentation-standards skill; motivated by the 2026-05-15 doctrine-drift leak), every "never/required" claim must be CI-asserted, auto-generated, or explicitly marked advisory.

> **Advisory only — not CI-asserted.** "Small body copy never uses `--text-brand-primary`" is currently prose in the `contrast-pairings.json` policy string and the per-pairing notes. **No lint enforces it.** A consumer can today bind `--text-brand-primary` to 12px body text and ship a 3.78:1 violation the gate won't catch (the gate scores token *pairings*, not their rendered font sizes).

The enforcement decision is deferred to **BDS-18**: either build a lint that flags `--text-brand-primary` / `var(--text-brand-primary)` on small-text component contexts, or keep the claim advisory permanently. Until then this remains a known, visible gap — not a silent one.

## Consequences

**Cross-repo, but small.** The blast-radius audit (2026-06-30) found:

- **BDS** — this change (`theme-brand-brik.css` + `contrast-pairings.json` + the two `color-pairings.mdx` rows). `dist/` is rebuilt by the Release workflow.
- **brikdesigns.com** (`^0.107.0`) — consumes the brand-primary semantics directly (cascades automatically), but locally **over-darkens** `--border-brand-primary`, `--background-image-brand`, and `--text-link` to `poppy-dark` (6 lines in `src/app/globals.css`). Those must be removed/reconciled, and the AAA `--text-link` override is a conscious keep-or-drop (the genuine small-link case). Follow-up PR.
- **brik-client-portal** (`^0.111.0`) — `theme-brik-portal.css` mirrors the darkening + state variants; `global-error.tsx` hardcodes `#b0351b`; and it carries **its own** `base-theme-contrast.test.ts` gate that must mirror this AA-large reclassification or its CI fails. Stale legacy `theme-brik.css` (still vibrant) to reconcile. Follow-up PR.
- **renew-pms, freedom-client-portal, brik-website-themes** — **no change.** Each runs its own brand palette; none paints Brik Poppy.

The published doc matrix in `color-pairings.mdx` is a curated subset that has drifted from `--emit-matrix` (17 rows vs 44). Only the two rows this change alters were patched; full regeneration is BDS-18 scope.

## Alternatives considered

- **Keep the darkened `#b0351b`.** Rejected: it is not the brand color, contradicts the brand-kit SoT (ADR-011), and is the symptom BDS-22 exists to fix.
- **Restore vibrant fills only; keep `--text-brand-primary` on `poppy-dark`.** A hybrid that keeps small brand text AA-safe without a usage rule. Rejected as the end state — it diverges from the brand-kit for one token and reintroduces a hand-tuned value, the exact pattern this reverses. Viable as a fallback if the advisory usage rule proves insufficient and enforcement (BDS-18) slips.
- **Add a large-only vibrant text variant** (a separate token that is vibrant and a darker token for small text). Rejected for now: more tokens + a naming decision, deferred to BDS-18 where the usage matrix is designed. The 11-step scale (BDS-20) may make an AA-passing near-Poppy step available, reopening this.
