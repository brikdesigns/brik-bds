# ADR-039 — Astro blueprints are pre-rendered to static HTML and displayed in the React Storybook

**Status:** Accepted (2026-09-11)
**Date:** 2026-09-11
**Supersedes:** —
**Superseded by:** —
**Owner:** Nick Stanerson
**Related:** [ADR-037](./ADR-037-astro-is-the-canonical-blueprint-rail.md) (Astro is the canonical blueprint rail — the reason this coverage gap matters), [ADR-006](./ADR-006-storybook-taxonomy-and-story-shape.md) (flat `<Bucket>/<name>` taxonomy), [ADR-010](./ADR-010-storybook-axes-of-information.md) (Q4 irreducible render-mode stories), [#2339](https://github.com/brikdesigns/brik-bds/issues/2339) (this ADR + the integration), [#2431](https://github.com/brikdesigns/brik-bds/issues/2431) (the sibling `SiteHeader` application)

## Context

ADR-037 made Astro the canonical blueprint rail. Storybook could not render it at all: the framework is `@storybook/react-vite` (`.storybook/main.ts:22-25`), the story globs match `*.mdx` and `*.stories.@(js|jsx|mjs|ts|tsx)` only (`.storybook/main.ts:5-12`), and `astro` was in neither `dependencies` nor `devDependencies`. Every `Blueprints/*` entry rendered the React twin, so a reviewer comparing rails was comparing one rail against nothing.

[#2339](https://github.com/brikdesigns/brik-bds/issues/2339) AC1 required the path be *recorded* before the integration was built. Three were on the table.

### What the probes found (2026-09-11)

**An "Astro renderer alongside react-vite" does not exist.** The only maintained package — `@storybook-astro/framework@1.12.0` (23,357 downloads/week, published 2026-09-10, peers `astro ^5.5.3 || ^6 || ^7`, `storybook ^10`) — *replaces* the root framework; React demotes to `framework.options.integrations: [react({...})]` ([README](https://github.com/storybook-astro/storybook-astro), fetched 2026-09-11). That is a migration across 164 story files, 167 files importing `@storybook/react-vite` types, and 389 visual baselines. Its own README also notes that in a static `storybook build` — which is what Chromatic hosts — changing Astro story args via Controls has no effect. The alternative, `storybook-astro@0.2.1`, last published 2026-04-24 with 241 downloads/week, was not considered viable.

**A second Storybook** avoids the framework swap but puts the two rails at different URLs, which defeats the side-by-side comparison the coverage exists to enable, and adds a build, a host, and a CI lane.

**The Container API works today.** `experimental_AstroContainer.renderToString()` from `astro/container` compiled and rendered `Hero.astro` under Vitest with `getViteConfig()` on the first spike, no dev server. Two constraints came out of that spike and shape the implementation rather than the decision:

1. `astro/container` imports `node:path` (`node_modules/astro/dist/container/index.js`), so it cannot run inside Storybook's browser bundle. The render must happen in Node, ahead of time.
2. `renderToString()` returns markup only — the `<style>` block every one of the eight blocks carries is dropped (0 `<style>` in the 2,970-byte `Hero` output). The stylesheet has to be emitted alongside.

All eight blocks are static: `grep -c '<script'` returns 0 for each. Nothing is lost by rendering them server-side and shipping the result.

## Decision

**Pre-render the Astro blocks to static HTML + CSS in Node, and display that output in the existing React Storybook.** The framework stays `@storybook/react-vite`.

> OPERATOR SAID 2026-09-11 (chat, `/resume 2309` session): chose **"C — Container API into React shell"** from the three paths, over the framework swap and the second Storybook.

Mechanics:

- `scripts/render-astro-blueprints.mjs` runs `experimental_AstroContainer` over the eight blocks and their layout axes, emitting `content-system/blueprints/astro/__generated__/*.html` and `*.css`.
- Fixtures live in `content-system/blueprints/astro/__fixtures__/sections.ts` and are the **same section shapes the React twins' stories use**. Fixture divergence would hide rail divergence.
- Stories are render-mode by necessity ([ADR-010](./ADR-010-storybook-axes-of-information.md) Q4) — the subject is server-rendered markup, which no arg can express. `AstroFrame` injects it.
- Output is committed. `npm run verify:astro-stories` re-renders and fails on a diff, wired into `npm run validate` (2.0s).
- Sidebar titles are flat per [ADR-006](./ADR-006-storybook-taxonomy-and-story-shape.md) — `Blueprints/astro-hero`, `Blueprints/astro-cta`, … — never a `Blueprints/Astro/` subfolder, which the flat-taxonomy rule forbids (ADR-006:96).

## Consequences

**Accepted:**

- The Container API is experimental — Astro's own docs warn of "breaking changes, even in minor or patch releases." The blast radius is one script and a `--check` gate that fails loudly, not the Storybook framework.
- Astro stories are static. Nothing on the eight blocks is interactive, so this costs nothing today; a block that grows a `<script>` would not have its behaviour covered. `SiteHeader.astro` already carries 2 `<script>` blocks, which is why [#2431](https://github.com/brikdesigns/brik-bds/issues/2431) must re-test this path rather than assume it.
- Generated output is committed, so a `.astro` edit that skips `npm run render:astro-stories` shows as stale — the gate catches it on `validate`, before CI.
- The extracted CSS is unscoped, where `astro build` scopes it with `data-astro-cid-*`. Equivalent for a story rendering one block in isolation; not equivalent if a story ever composed two blocks whose rules collide.

**Rejected and why:** the framework swap, for a blast radius (164 story files, 389 baselines) out of proportion to the gap, and for inert Controls in the hosted build. The second Storybook, for separating the two things a reviewer needs beside each other.

**Revisit when:** the Container API stabilises out of experimental, or a blueprint block needs interactive coverage. At that point `@storybook-astro/framework` is the natural re-evaluation — by then it may also have a longer track record than the 2026-09 snapshot above.
