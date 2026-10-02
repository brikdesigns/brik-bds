# ADR-044 — Breakpoint custom media: components read the rungs through `@custom-media`, resolved at build time

**Status:** Accepted 2026-10-02 (#2644)
**Date:** 2026-10-02
**Supersedes:** —
**Superseded by:** —
**Owner:** Nick Stanerson
**Related:** [#2644](https://github.com/brikdesigns/brik-bds/issues/2644), [#2591](https://github.com/brikdesigns/brik-bds/issues/2591) (breakpoint tokens), [ADR-043](./ADR-043-system-id-token-prefix.md) (`--bds-` prefix), [CASCADE.md](../../tokens/CASCADE.md) § Excluded from mode emission ≠ unwired

## The operator's words

OPERATOR SAID 2026-09-30 (Claude Code session): "we still think there's value in a breakpoint collection as these tokens can be referenced in our code vs a hard-coded valuel."

OPERATOR SAID 2026-10-02 (Claude Code chat, reply to the scope on #2644): "yes"

The scope that "yes" ratified is the issue's "Confirmed scope (2026-10-02)" section: the mechanism below and the snap table in § Decision.

## Context

BDS ships breakpoint tokens (`--bds-breakpoint-*`, `mediaQueries` in `tokens/index.ts`), but no CSS used them: `var()` is invalid in a media condition, so every `@media` hard-coded px, and several were off the ladder (991, 639, 640, 767). BDS components reach every consumer only through `dist/styles.css`.

## Decision

1. **Mechanism:** `postcss-custom-media` fed by `@csstools/postcss-global-data`, configured in a root `postcss.config.mjs`. Component CSS writes `@media (--bds-down-tablet)`.
   - Vite applies a PostCSS config to all imported CSS automatically — <https://vite.dev/guide/features.html>
   - `postcss-custom-media` resolves definitions per file only, so `postcss-global-data` runs first to supply `tokens/custom-media.css` to every file — <https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-custom-media>
   - `@custom-media` is not Baseline in browsers (MDN), so it must be fully resolved at build time. `dist/styles.css` contains zero `@custom-media` and zero `(--bds-…)` media conditions.
2. **Rejected:** Lightning CSS. Vite marks `css.transformer: 'lightningcss'` experimental (https://vite.dev/guide/features.html).
3. **Names:** `--bds-up-{mobile,tablet,desktop,wide,wider}` (`min-width`) and `--bds-down-{tablet,desktop,wide,wider}` (`max-width`, rung − 0.02px). They carry the ADR-043 `--bds-` prefix and mirror `mediaQueries` exactly. No new rung is invented.
4. **Snap table** (off-ladder values move onto a rung):

| Rule | Now | Becomes |
|---|---|---|
| `Grid.css` 3+ cols → 2 | max-width 991px | below desktop |
| `Grid.css` → 1 col | max-width 639px | below tablet |
| `Card.css` row stacks | max-width 640px | below tablet |
| `Breadcrumb.css` | max-width 767px | below tablet |
| `Modal.css` ×2, `MediaTabs.css`, `SyncedMediaSteps.css` | min-width 768px | at/above tablet |

## Enforcement (ships with the change)

- `scripts/lint-tokens.js` § 4b-2 `breakpoint-custom-media-drift`: every definition must equal its `--bds-breakpoint-*` rung (down = rung − 0.02px). Drift is an error.
- `media-literal-px` (Rule 14): a literal px in an `@media` under `components/**/*.css` is an error. Budget: one regex per CSS line inside the existing `lint-tokens` pass, no new workflow.
- `scripts/check-dist-custom-media.mjs`, run inside `build:lib` right after the Vite build: fails if `dist/styles.css` holds any `@custom-media` or unresolved `(--bds-…)` condition. Lint checks the names; this checks they resolved, so a build path that skips `postcss.config.mjs` cannot publish. Budget: one regex over one file per `build:lib`.
- Rule 13 (`responsive-token-swap`) resolves `--bds-up-*` / `--bds-down-*` to direction + px, so it keeps checking direction.

## Consequences

- Consumers are unaffected: they consume resolved px via `dist`.
- Client sites are out of scope. `content-system/blueprints/**` still carries literal px and is a filed follow-up.
- Portal AI prompts (the issue's third AC) are a separate repo and a separate PR.
