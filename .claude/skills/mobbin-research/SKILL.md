---
name: mobbin-research
description: Discipline for the Mobbin MCP (`search_screens`, `search_flows`, `search_sections`) and the motion-capture script that fills the gap Mobbin leaves. Mobbin returns rendered screenshots plus four metadata fields — no CSS, no code, no token values, no timing data. This skill enforces research-only use: Mobbin output may inform which components, states, and sections BDS needs, and may never emit a token name, a CSS value, or component code. For animation, Mobbin is not a source at all — `scripts/capture-motion.mjs` reads computed transition/animation values off a live URL and maps them onto the existing `--duration-*` / `--ease-*` scale in dist/tokens.css. Covers per-tool routing, the citation rule, the one-way token mapping, and the licensing caveat.
triggers:
  - About to call `mcp__mobbin__search_screens`, `mcp__mobbin__search_flows`, or `mcp__mobbin__search_sections`
  - User asks to research, benchmark, or find references for a UI pattern, screen, flow, or marketing-site section
  - User asks "how do other apps do X" / "what does a good <pattern> look like" / "find examples of X"
  - About to translate a visual reference into a component, a Storybook story, or a page composition
  - User asks to capture, measure, or match the animation or motion of a referenced site
  - User mentions Mobbin, a `mobbin.com` URL, or pattern/competitive research for BDS or a `web/{slug}/` build
last-verified: 2026-08-17
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

Mobbin's image licensing terms are **not** stated at
https://docs.mobbin.com/mcp/introduction (fetched 2026-08-17); that page covers
plan availability only — Pro, Team, and Enterprise. Treat returned images as
internal pattern research. Do not paste them into client-facing decks,
Notion pages shared outside Brik, or committed docs until the terms are
confirmed.

The MCP is also in beta and its pricing is stated differently in-product
("included with all paid plans during beta") than in the docs — expect access to
move.
