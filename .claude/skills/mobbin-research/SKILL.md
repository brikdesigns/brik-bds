---
name: mobbin-research
description: Discipline for the Mobbin MCP (`search_screens`, `search_flows`, `search_sections`) and the motion-capture script that fills the gap Mobbin leaves. Mobbin returns rendered screenshots plus four metadata fields — no CSS, no code, no token values, no timing data. This skill enforces research-only use: Mobbin output may inform which components, states, and sections BDS needs, and may never emit a token name, a CSS value, or component code. For animation, Mobbin is not a source at all — `scripts/capture-motion.mjs` reads computed transition/animation values off a live URL and maps them onto the existing `--duration-*` / `--ease-*` scale in dist/tokens.css. Covers per-tool routing, the citation rule, the one-way token mapping, and what the Mobbin ToS permits — publication in limited extent with IP-Holder credit, no caching or re-hosting, no watermark removal, no AI-derived works from Platform materials.
triggers:
  - About to call `mcp__mobbin__search_screens`, `mcp__mobbin__search_flows`, or `mcp__mobbin__search_sections`
  - User asks to research, benchmark, or find references for a UI pattern, screen, flow, or marketing-site section
  - User asks "how do other apps do X" / "what does a good <pattern> look like" / "find examples of X"
  - About to translate a visual reference into a component, a Storybook story, or a page composition
  - User asks to capture, measure, or match the animation or motion of a referenced site
  - User mentions Mobbin, a `mobbin.com` URL, or pattern/competitive research for BDS or a `web/{slug}/` build
last-verified: 2026-08-17
references:
  - https://mobbin.com/terms (ToS, effective 2026-05-16)
---

# mobbin-research — reference in, discipline out

Self-contained; there is no brik-rag corpus behind this one yet. The tool surface
below was read off the live server on 2026-08-17, not from vendor prose.

## What Mobbin actually returns

Three tools, all search-only. Every one returns **rendered screenshots plus four
metadata fields** — `id`, `image_url`, `mobbin_url`, `site_name`:

| Tool              | Scope                                                  | Params                                                           |
| ----------------- | ------------------------------------------------------ | ---------------------------------------------------------------- |
| `search_screens`  | single app screens                                     | `platform` (ios/web) required, `mode` deep/standard, `limit` ≤30 |
| `search_flows`    | multi-step journeys, as evenly-spaced **still frames** | `platform` required, `limit` ≤10                                 |
| `search_sections` | marketing-site sections (hero, pricing, footer)        | web only, `limit` ≤30                                            |

There is no CSS, no DOM, no computed style, no code, no token value, and no
timing data in any response. Anything in those categories that appears in a
report derived from Mobbin was invented.

Query shape matters: one screen or one journey per call, described in plain
language, no negations, no vague style words, no platform in the query string
(use the parameter). Name an app to filter to it.

## The rule

**Mobbin informs _what_ to build. It never supplies _how_ to express it.**

Allowed to come out of a Mobbin session:

- which component or variant BDS is missing
- which states a component fails to model (empty, loading, error, overflow, long-string)
- how a section type is typically composed and ordered
- a written observation, with the reference cited

Never allowed out of a Mobbin session:

- a `--text-*` / `--surface-*` / `--background-*` / `--border-*` / `--color-*` name
- any hex, px, rem, ms, or cubic-bezier value read off a screenshot
- component code or CSS "matching" a reference
- a duration or easing — see [Motion](#motion-mobbin-is-not-a-source)

`dist/tokens.css` is the sole token authority (root `CLAUDE.md`). For any token
question arising from a reference, stop and invoke `canon-css` /
`validate-token-names`. Describing a screenshot in token vocabulary is the exact
failure mode those skills exist to prevent — a screenshot is the easiest place to
invent a plausibly-shaped name, because nothing in the response contradicts it.

## Citation

Every screen, flow, or section you mention in a user-facing report is cited as a
markdown link to its `mobbin_url`. A described-but-uncited reference is
unverifiable — the operator cannot check what you actually looked at.

## Routing — which tool for which BDS question

| Question                                     | Tool              | What to do with the result                                                                                                                   |
| -------------------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Is BDS missing a component or variant?       | `search_screens`  | Diff the pattern against `src/components/`; file a sized issue per gap. No code.                                                             |
| Which states does a component fail to model? | `search_flows`    | Frames expose empty / loading / error / partial states. Feed to one-per-state stories under ADR-010 — see the `storybook-story-shape` skill. |
| How should a page or section stack?          | `search_sections` | Evidence for `docs-site/content/docs/build-standards/composition-layers.mdx`; use when composing `web/{slug}/` pages.                        |
| What are the durations and easings?          | **none**          | Mobbin has no motion data. Use the script below.                                                                                             |

Read the returned images. Do not describe a screen from its metadata — the
metadata is four fields, one of which is the app name.

## Motion — Mobbin is not a source

`search_flows` returns evenly-spaced still frames. Frames carry no duration and
no easing. Any timing "read" from them is fabricated.

BDS already has a motion vocabulary, and the job is to map onto it, never to
widen it from a reference:

| Token                                        | Value                                |
| -------------------------------------------- | ------------------------------------ |
| `--duration-100` … `--duration-600`          | 100 / 200 / 300 / 500 / 800 / 1000ms |
| `--duration-fast` / `-normal` / `-slow`      | aliases of 100 / 200 / 300ms         |
| `--ease-in` / `-out` / `-in-out` / `-spring` | four cubic-beziers                   |

Utility layer: `tokens/motion-classes.css` (`.bds-enter-*`, `.bds-anim-*`) over
eight `bds-*` keyframes in `tokens/animations.css`. Prefer an existing class
before writing a new animation.

### capture-motion.mjs

Point it at the **real site** behind a reference. It drives Playwright, reads
computed `transition-*` and `animation-*` off the live DOM, tallies what it
finds, and maps each value to the nearest existing token.

```bash
npm run build:dist-tokens          # dist/ is gitignored — a fresh worktree has no registry
node .claude/skills/mobbin-research/scripts/capture-motion.mjs <url>
```

Flags: `--video` (record the page), `--no-scroll` (skip scroll re-sampling),
`--out <dir>`, `--json`, `--timeout <ms>`. Output defaults to a temp dir outside
the repo, so a capture can never dirty the working tree.

Verified run against `https://stripe.com` on 2026-08-17 — 32 distinct
transitions, 5 running animations:

```
0.5s   x8  -> --duration-400  exact
0.25s  x4  -> NO MATCH        0.25s
0.12s  x1  -> --duration-100  ~off by 20ms
cubic-bezier(0.65, 0, 0.35, 1)  x4  -> --ease-in-out  exact
cubic-bezier(0.4, 0, 0.2, 1)    x2  -> NO MATCH
```

**The mapping is one-way.** Observed timing → nearest existing token, within
30ms/15% for durations and 0.25 control-point distance for easings. Outside
tolerance it prints `NO MATCH` with the raw value rather than rounding it in — a
silent round is how a foreign scale gets laundered into BDS vocabulary.

A `NO MATCH` is a finding, not a licence. File it and let a human decide whether
the scale should widen. The script reads `dist/tokens.css` at runtime and writes
nothing back to `tokens/` or `dist/`.

Two limits worth knowing: transitions sit in computed style at rest, so they are
always visible, but **animations only appear while running** — the script scrolls
the page in six steps to catch scroll-triggered reveals, and a motion that fires
only on hover or on a route change will be missed. And a value read off a live
page is that site's scale, not a recommendation.

## Licensing

Source: [Mobbin Terms of Service](https://mobbin.com/terms), effective
2026-05-16, read 2026-08-17. The MCP docs carry no licensing page — the terms
live on the main site. Re-read before relying on any summary below.

Using the MCP for Brik's own design research is expressly covered:

> Mobbin's API or MCP Services are provided for (i) your personal or internal
> business use, or (ii) integration into your own proprietary products or
> services ("Permitted Use").

**Publishing a reference is allowed, with conditions.** Per §10.3, Mobbin does
not own the captured interfaces — the app's owner does:

> Citations, images, and paraphrasing may only be published elsewhere in limited
> extent, and only if crediting the respective IP Holders.

So a screen can go in a deck or a doc if you keep it to a few and credit the
**IP Holder** — the app's owner (Stripe, Duolingo), not Mobbin.

Five prohibitions from §3 and §10 that bear on normal use:

| Don't                                                   | Clause                                                                                                                        |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Crop or remove the "curated by Mobbin" watermark        | §3 — "remove any copyright or other proprietary notations"                                                                    |
| Cache, archive, mirror, or re-host returned images      | §3 — no "aggregate, 'mirror', cache, archive or re-host […] on any other website, server or platform" without written consent |
| Sell, sublicense, or resell access or content           | §3 — no "exploit for any commercial purposes"; no "resell, sublicense or lease access to the API or MCP Services"             |
| Build a standalone repository from retrieved content    | §3 — no "standalone content repository", nothing "competitive to Mobbin's Platform"                                           |
| Use AI to create derivative works of Platform materials | §3 — no automated tools "to create derivative works of any materials, software or content contained on the Platform"          |

Link the `mobbin_url` rather than saving the asset. That satisfies both the
citation rule and the no-cache rule in one move.

The last row is why [the research-only rule](#the-rule) is a licensing position
and not only token discipline. Keeping code, CSS, and token values out of a
Mobbin session is what keeps an agent clear of the derivative-works prohibition.

**Open question — do not resolve in code.** §10.1 says _"All derivative works
produced with the use of the Services […] belong to Mobbin."_ How far that
reaches is a commercial/legal call, tracked in #1885. Until it is answered, hold
the research-only line.

The MCP is in beta, and pricing is stated differently in-product ("included with
all paid plans during beta") than in the docs (Pro, Team, Enterprise) — expect
access to move.
