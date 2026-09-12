# ADR-040 — The Astro rail's canonical CSS is covered by mirror, enforced by selector-coverage

**Status:** Accepted (2026-09-12)
**Date:** 2026-09-12
**Supersedes:** —
**Superseded by:** —
**Owner:** Nick Stanerson
**Related:** [ADR-037](./ADR-037-astro-is-the-canonical-blueprint-rail.md) (Astro is the canonical blueprint rail — the reason the gate must reach it), [ADR-039](./ADR-039-astro-blueprints-are-pre-rendered-into-the-react-storybook.md) (the pre-render this gate now scans), [ADR-021](./ADR-021-blueprint-section-shell.md) (`section-shell.css`, the rail's one existing global stylesheet), [#2457](https://github.com/brikdesigns/brik-bds/issues/2457) (this decision), [#2455](https://github.com/brikdesigns/brik-bds/pull/2455) (the `__generated__/` exclusion this reverses), [#2344](https://github.com/brikdesigns/brik-bds/issues/2344) (the React/Astro hero divergences)

## Context

`dist/styles.css` is the allowlist `canonical-class-check` enforces against ([`canonical-class-check.mjs`](../../scripts/canonical-class-check.mjs), a required status check on `main` via [`canonical-class-check.yml`](../../.github/workflows/canonical-class-check.yml)). [#2457](https://github.com/brikdesigns/brik-bds/issues/2457) reported that the Astro rail's CSS — which lives in per-block `<style>` blocks inside the `.astro` files — never enters that bundle, so the rail ADR-037 made canonical was invisible to the gate that governs canonical class names. #2455 had excluded `content-system/blueprints/astro/__generated__/` from the scan to unblock #2339's pre-rendered stories, which had flagged `bds-card-grid--card-grid` and `bds-card-grid--two-column-list` as invented.

#2457 AC1 required the resolution be *recorded* before code. Three options were on the table: emit the Astro `<style>` into `dist/styles.css` at build; ship a second exported stylesheet as the allowlist; or keep the per-block `<style>` and teach the gate to read it.

### What the measurement found (2026-09-12, `task/rail-css-dist-2457`)

The report's premise was overstated. After `npm run build:lib`:

- **Every `bds-*` selector declared in an Astro `<style>` block is already present in `dist/styles.css`** — 0 missing across all 11 blocks. They are covered because each Astro block mirrors its React twin's CSS (`../react/<Block>.css`), and the React twins are bundled into `dist/styles.css` via `lib-entry.ts`. The `Mirrors ../react/<Block>.css` comments are that single-sourcing, not a debt marker.
- **The only uncovered classes in the entire pre-render were two dead modifier hooks** — `bds-card-grid--card-grid` and `bds-card-grid--two-column-list`. `CardGrid.astro` emitted `bds-card-grid--${layout}` on the wrapper, but **no CSS rule backed those selectors in either rail**; the layouts are styled by the blueprint-local `bp-services-grid__*` / `bp-services-two-col__*` classes. The modifier was a dead `bds-*` hook — exactly what the canonical gate exists to catch.
- **15 shared `bds-*` rules already diverge in their declarations between the twins**, and most legitimately: the Astro rail hand-rolls markup (adds `display:flex` to headers, deeper `var(…, fallback)` chains for standalone rendering) where the React rail composes primitives. A byte-equality "keep the twins identical" gate would fail on all 15 and force out-of-scope visual reconciliation.

The repro in the issue (`CardGrid.astro … .includes('bds-card-grid--card-grid') → true`) matched a **doc comment**, not a selector.

## Decision

**The Astro rail's canonical `bds-*` classes are single-sourced by mirror to the React twins — which the lib build already bundles into `dist/styles.css` — and coverage is enforced by scanning the pre-render, not by shipping a separate Astro CSS distribution.** No new stylesheet, no new build step, no new CI job.

> OPERATOR SAID 2026-09-12 (`/resume 2309` session, AskUserQuestion): chose **"Mirror-enforced (recommended)"** over the second exported stylesheet and over emitting Astro CSS into `dist/styles.css`.

> OPERATOR SAID 2026-09-12 (same session, AskUserQuestion): on the gate's shape, chose **"Selector-coverage (recommended)"** — every `bds-*` class in an Astro `<style>` or generated HTML must resolve in `dist/styles.css`; declaration *values* may differ by design — over strict rule-equality and over adding a warn-only divergence report.

Mechanics:

- The `__generated__/` exclusion in `canonical-class-check.mjs` is **removed**. Scanning the pre-render is how a dynamically-composed modifier (which the static `.astro` scan cannot see) is checked against canon. The gate now scans 100 files where it scanned 74.
- The two dead `bds-card-grid--<layout>` hooks are **dropped at source** ([`CardGrid.astro`](../../content-system/blueprints/astro/CardGrid.astro)) rather than excluded — they carried no CSS and no consumer referenced them (`grep` clean outside comments).
- `bp-*` blueprint-local classes stay Astro-only and non-canonical; the gate ignores non-`bds-*` classes by design.
- Declaration divergence between twins is **not** gated. Where it is real drift (e.g. `--heading-3xl` vs `--heading-xl` on section titles) it is a separate, appearance-affecting concern, out of scope for #2457.

## Consequences

**Accepted:**

- Coverage of an Astro-authored `bds-*` class depends on its React twin carrying the same selector into `dist/styles.css`. A genuinely Astro-only `bds-*` class with no React twin would be flagged as invented — correct under ADR-037 (the shared `bds-*` vocabulary is one canon), but it means a net-new Astro block must add its canonical selectors to a bundled stylesheet, not only to its scoped `<style>`.
- Value drift between twins is unenforced. The 15 existing divergences persist; catching them is deferred to a future appearance-scoped pass, not this gate.
- The gate now depends on committed `__generated__` output being fresh. `verify:astro-stories` already fails on stale output, so a `.astro` edit that skips `npm run render:astro-stories` is caught before CI.

**Rejected and why:** emitting Astro `<style>` into `dist/styles.css`, because it would duplicate the React-twin rules already there and pull intentionally-local `bp-*` classes into global canon. A second exported stylesheet, because Astro already scope-emits each block's CSS at consumer build, so a second global artifact is redundant for consumers and adds a new sync surface for no coverage the mirror does not already give.

**Revisit when:** a net-new Astro block has no React twin (the coverage-by-mirror assumption breaks — see [#2312](https://github.com/brikdesigns/brik-bds/issues/2312)), or a decision is taken to reconcile the value divergences, at which point a declaration-level gate becomes worth its brittleness.
