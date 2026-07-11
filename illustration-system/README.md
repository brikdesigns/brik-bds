# Brik illustration system

Composable editorial illustrations for blog/newsletter heroes and marketing
surfaces. **We compose scenes from vetted parts and recolor them by code — we
do not AI-generate whole scenes, and we never AI-generate people.**

This exists because full-scene image generation is a dice roll and, critically,
image models mangle human anatomy (ghost faces, bad hands). Real illustrator
assets keep faces right; code keeps the palette and composition on-brand.

## How it works

```text
humaaans / scenery part SVGs  →  recolor to a BDS service palette  →  compose on a canvas  →  scene SVG
     (parts/)                        (engine/palettes.mjs)              (engine/compose.mjs)
```

1. **People = [humaaans](https://www.humaaans.com/)** (Pablo Stanley) — real
   illustrator assets, so faces and anatomy are always right. **License: CC0**
   (free for commercial use, no attribution required).
2. **Recolor by code** — each part is authored in a fixed palette; we map every
   source hex to a semantic role (`garmentLight`, `sceneryMid`, …) and each role
   to a per-service-line hex from the BDS ramps in `dist/tokens.css`. Skin, hair
   and one warm accent are **preserved**, so characters stay human in every hue.
3. **Compose by code** — parts are placed on a 16:9 canvas (scaled, optionally
   mirrored to face inward) with code-drawn props (blob backdrop, speech bubble,
   sparkles). Output is a single SVG; rasterize with `rsvg-convert` for a hero PNG.

Figma is only where parts are curated/exported — it is **not** a runtime
dependency. The engine runs anywhere Node runs, which is what makes it
agent-drivable and, later, embeddable as a CMS "generate illustration" feature
(service line + topic → scene).

## Concepts — topic drives composition, service line drives only colour

A **concept** is one editorial idea expressed as a scene. It names a service
line (which drives *only* colour) and an ordered list of layers — parts (vetted
SVGs) and props (code-drawn metaphor objects). Two posts read as two different
*ideas* because they select different layers, **not** because one scene was
recoloured. The topic→concept decision tree (roadmap P2) — and, later, a CMS
"generate illustration" feature — produce one of these `CONCEPTS` objects.

```bash
# <conceptKey>  → SVG on stdout
node engine/compose.mjs ai-readiness > examples/ai-readiness.svg
node engine/compose.mjs marketing-foundation > examples/marketing-foundation.svg

# rasterize to a hero PNG
rsvg-convert -w 1600 examples/ai-readiness.svg -o ai-readiness.png
```

Concepts (see `engine/concepts.mjs`):

- `ai-readiness` — *Before You Use AI in Your Business* (back-office / orange):
  a person at a laptop feeding organized **knowledge cards** into an **AI
  assistant** — give AI your business context.
- `marketing-foundation` — *Why Your Marketing Isn't Working* (marketing /
  green): a person presenting a **megaphone** (public face) standing on a solid
  **brick foundation** (organized back office) — back office first.

Service lines: `marketing` (green), `back-office` (orange).

## Extending

- **New concept** — add an entry to `CONCEPTS` in `engine/concepts.mjs`: a
  service line + a back→front `layers` array. Each layer is a `blob`, a `part`
  (an SVG in `parts/`), or a `prop` (a `props.mjs` object). No engine changes.
- **New metaphor prop** — add a palette-aware `(args, pal) -> svgString`
  function to `engine/props.mjs` and register it in `PROPS`. Draw in canvas
  coordinates; use `pal.*` roles so it recolours per service line for free.
- **New part** — export the SVG from the Brand Kit (or the humaaans library) into
  `parts/characters/` or `parts/scenery/`. If it introduces new source hexes for
  clothing/scenery, add them to `SOURCE_ROLE` in `engine/palettes.mjs`; add skin/
  hair/accent hexes to `PRESERVE`.
- **New service line** — add its ramp to `SERVICE_PALETTES` in `palettes.mjs`,
  using real `--color-*` values from `dist/tokens.css`. Brand / information /
  product families are not yet wired.

## Layout

```text
illustration-system/
  parts/
    characters/   humaaans figures (CC0)
    scenery/      plants, blobs, lamp
  engine/
    palettes.mjs  BDS service ramps + recolor model
    props.mjs     code-drawn, palette-aware metaphor objects (the topical layer)
    concepts.mjs  topic → scene specs (data the engine renders)
    compose.mjs   part loading, recolor, blob motif, concept renderer, CLI
  examples/       generated hero scenes (SVG)
```

## Status & roadmap

Proven: part export, code recolor to BDS palettes, data-driven concept
composition, per-service palette swap, character mirroring, standing + seated
(at-laptop) poses, topical metaphor props, the subtle brick brand motif, and a
hair overlay for the seated figure. The two blog heroes are composed
(`ai-readiness`, `marketing-foundation`) and read as distinct ideas. Ahead:

- More humaaans poses (at-printer, with-patient, on-tablet, thinking) and dental/
  back-office industry equipment
- More scenery/props (armchair, side table, window, mug, desk)
- The topic→concept decision tree (roadmap P2) that authors `CONCEPTS` from a draft
- A Storybook brand-standards page documenting the system
- Wire the two heroes into CMS `featured_image_url`
- (Future) CMS "generate illustration" feature calling this engine

Provenance, palettes, and retired dead-ends: brik-rag `brik-illustration-locked-style`.
Tracked under brik-bds#1203.
