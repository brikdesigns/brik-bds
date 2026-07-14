# ADR-011 — Service-line token value-model: Figma Brand Kit is the source of truth

**Status:** Accepted (2026-06-02) · Amended 2026-06-16 (#865 — dark-step variants are mode-invariant; see Amendment)
**Date:** 2026-06-02
**Supersedes:** Reverses three locked criteria in [#563](https://github.com/brikdesigns/brik-bds/issues/563) (see §Supersedes below)
**Superseded by:** — (§Decision pt-3 "no per-service `-inverse`" partially narrowed by [ADR-020](./ADR-020-service-surface-inverse.md) for the surface purpose only)
**Related:** [#563](https://github.com/brikdesigns/brik-bds/issues/563) (service-token reconciliation), [#564](https://github.com/brikdesigns/brik-bds/issues/564) (token-name anatomy — naming formula now in [token-anatomy](../../docs-site/content/docs/primitives/token-anatomy.mdx) via [#809](https://github.com/brikdesigns/brik-bds/pull/809)), [#761](https://github.com/brikdesigns/brik-bds/issues/761) (Brand Kit semantic audit), [Figma Library Architecture](../../docs-site/content/docs/getting-started/figma-library-architecture.mdx)
**Owner:** Nick Stanerson

## Context

Issue #563 set out to move service-line tokens from the hand-maintained `tokens/gap-fills.css` stopgap into the Brik Brand Kit so Style Dictionary emits them systematically. A live cross-check of the Brand Kit Figma (variable pull, 2026-06-02) revealed the repo canon (gap-fills, locked in #563's criteria, and what every consumer is built on) and the Brand Kit Figma are **two complete, internally-consistent but different models.**

Per the documented Library architecture, the **Brand Kit Figma is the source of truth** for the service layer. The repo canon is therefore the divergent side and must converge to Figma — not the reverse.

The naming half of the divergence (`on-color` vs scoped `-on-light`/`-on-dark` vs `-inverse` vs tone) was resolved and documented in #809 — **no rename**, the constructs are distinct. This ADR governs the remaining half: the **value model** (what each token resolves to, and how it behaves across light/dark mode).

The four service-token consumers today (ServiceTag, the HeroSplitImageCardOverlay blueprint, brikdesigns.com, and the `--services--*` shadows in portal/renew) are built on the canon model. Adopting Figma's model is therefore a **migration**, not a drop-in.

## Decision

Adopt the Brand Kit Figma value-model verbatim. `design-tokens/brand-kits/brik.json` is rebuilt from a Brand Kit pull (not hand-authored), SD emits to `figma-tokens.css` (`:root`) + `figma-tokens-dark.css`. Five service lines (`marketing/brand/information/product/back-office` → `green/yellow/blue/purple/orange`); no `service-template`.

Per line, per purpose (light-mode → dark-mode primitive tier):

| Token | Purposes | light → dark | Behavior |
|---|---|---|---|
| `{purpose}-service-{line}` (no suffix) | surface, background, text, border, **page** | base → base | **Mode-invariant base hue** — "the service color" |
| `surface-service-{line}-light` | surface | lightest → lighter | Tone, mode-aware (softens one tier in dark) |
| `surface-service-{line}-dark` | surface | darkest → **darkest** | Tone, **mode-invariant** — amended by #865 (see below) |
| `{bg,text}-service-{line}-on-light` | background, text | darkest → **darkest** | Context, **mode-invariant** — amended by #865 (see below) |
| `{bg,text}-service-{line}-on-dark` | background, text | lightest → lighter | Context, mode-aware |

Three structural consequences vs the #563 canon:

1. **No-suffix default = base hue, mode-invariant, identical across all purposes.** It is the swatch, not a ready-to-use foreground. Readable text/fills come from the `-on-light`/`-on-dark` context variants.
2. **Context and tone variants are mode-AWARE** — they soften one tier toward mid-scale in dark mode (`darkest→darker`, `lightest→lighter`). The #563 canon pinned them mode-invariant. **(Amended by #865 — see Amendment below: the dark-*step* variants `-on-light` / `surface-*-dark` are in fact mode-INVARIANT, because they pair with fixed-light service surfaces.)**
3. **No per-service `-inverse`, and no `border-*-on-*`.** Theme-inversion is a brand/theme concern owned by the neutral `--background-inverse` / `--text-inverse`; service lines adapt to a backdrop via `-on-light`/`-on-dark` (see ADR rationale in token-anatomy #809). `page/service-*` is kept (Figma has it).

## Consequences

**This is a breaking, cross-repo migration — not value-neutral.** The no-suffix `text-service-{line}` flips from "readable dark text" (canon) to the base hue (Figma). Any consumer pairing no-suffix `background-service-X` with no-suffix `text-service-X` renders hue-on-hue (e.g. `#bcff8c` on `#bcff8c`) until migrated to `-on-light`/`-on-dark`.

Migration scope (verified 2026-06-02):

- **ServiceTag** — 5 variants pair no-suffix bg + no-suffix text → migrate text to `-on-light`/`-on-dark`.
- **HeroSplitImageCardOverlay** (astro + react blueprints) — drops `--background-service-X-inverse` (11 refs); rebind `--background-inverse` to the neutral inverse or `surface-service-X-dark`.
- **brikdesigns.com** — ~100s of `text-service-X` refs used as readable text + 18 `-inverse` refs + **116 stale `service-service` refs** (the pre-#563 bug name) + its `service-token-decision-tree.md`.
- **portal / renew** — shadow service tokens with stale local `--services--*` / `--services-*` copies (the rolled-back #512/#553 anti-pattern); separate cleanup, not blocking.

Sequencing (each a discrete PR; consumers are staging-targeted per repo):

1. **This ADR** + amend #563 criteria (no code).
2. **Update Brand Kit Figma** to the locked model (largely already matches; confirm naming, no per-service inverse, `page` set).
3. **Rebuild `brik.json`** from the Brand Kit pull → SD → dist. Lands the breaking token change in BDS. Replace-not-merge on the pull until [#754](https://github.com/brikdesigns/brik-bds/issues/754).
4. **Migrate BDS consumers** in the same release: ServiceTag, HeroSplitImageCardOverlay.
5. **Migrate site consumers** (brikdesigns first — it's the trigger), codemod-assisted: `text-service-X` → `-on-light`/`-on-dark` where used as readable text, drop `-inverse`, fix the 116 `service-service` refs, rewrite the decision-tree doc.
6. Retire the gap-fills service block (the parked `task/tokens-service-brand-kit` checkpoint is discarded — its canon-model `brik.json` is superseded by the Figma rebuild).

## Supersedes — #563 locked criteria reversed

- "Context-suffix tokens are MODE-INVARIANT" → **mode-aware** (soften one tier in dark).
- Per-service `-inverse` family + `border-*-on-light/-on-dark` family → **removed** (not in Figma).
- No-suffix defaults as purpose-tuned mode-aware tiers → **base hue, mode-invariant**.

The #563 naming decisions that still hold (drop `-color-` from scoped variants; `service-service` → `service-back-office`; eliminate `--services--*`) are unaffected.

## Amendment (2026-06-16) — #865: dark-*step* context/tone variants are mode-INVARIANT

The original Decision table marked **all** context and tone variants mode-aware (soften one tier in dark). That was wrong for the **dark-step** half of the set. [#827](https://github.com/brikdesigns/brik-bds/issues/827) (light) and [#865](https://github.com/brikdesigns/brik-bds/issues/865) (dark, fixed via [#866](https://github.com/brikdesigns/brik-bds/pull/866)) established:

- `{bg,text}-service-{line}-on-light` and `surface-service-{line}-dark` pair with the service **surface tints, which are fixed-light in both themes** (the no-suffix base hue doesn't theme-flip). Softening their foreground/fill one step lighter in dark mode (`darkest → darker`) therefore lands a lighter mark on the *same* light surface → drops below WCAG AA.
- Fix: pin these to **`darkest` in both modes** (mode-invariant). The **light-step** variants (`-on-dark`, `surface-*-light`) stay mode-aware (`lightest → lighter`) — they pair with dark backdrops, where softening is correct.

**SoT reconciliation (this session, 2026-06-16):** #866 applied the pin to `brik.json` source only; the Figma `color/dark` collection still held the stale `darker` aliases, so a fresh Brand Kit pull would have silently reverted the fix (9 dark service pairings back below AA). The 15 dark-mode variables (`{background,text}/service-{line}-on-light` + `surface/service-{line}-dark`, 5 hues) were rebound `…/darker → …/darkest` directly in Figma; a verifying re-pull now shows **zero delta** against the repo. The Library SoT and the repo agree.

## Alternatives considered

- **Canon-as-SoT, fix Figma instead.** Rejected: contradicts the documented Library SoT, and would mean re-authoring a coherent, design-built Brand Kit to match a hand-authored gap-fill.
- **Hybrid (Figma variant values, keep canon's readable no-suffix defaults + `-inverse` as BDS extensions).** Rejected as the end state: keeps two parallel mental models for the no-suffix default — the exact ambiguity this effort exists to remove. May still be used as a *transitional* shim during migration if a clean cutover proves too disruptive (revisit at step 4).
