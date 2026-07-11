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

## Usage

```bash
# <scene> <serviceLine>  → SVG on stdout
node engine/compose.mjs two-person-convo marketing > examples/marketing-convo.svg
node engine/compose.mjs person-at-work back-office > examples/backoffice-work.svg

# rasterize to a hero PNG
rsvg-convert -w 1600 examples/marketing-convo.svg -o marketing-convo.png
```

Scenes: `two-person-convo`, `person-at-work`, `person-at-laptop`.
Service lines: `marketing` (green), `back-office` (orange).

## Extending

- **New part** — export the SVG from the Brand Kit (or the humaaans library) into
  `parts/characters/` or `parts/scenery/`. If it introduces new source hexes for
  clothing/scenery, add them to `SOURCE_ROLE` in `engine/palettes.mjs`; add skin/
  hair/accent hexes to `PRESERVE`.
- **New scene** — add an entry to `SCENES` in `engine/compose.mjs` (an array of
  placed parts + props, back-to-front).
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
    compose.mjs   part loading, recolor, composition, CLI
  examples/       generated sample scenes (SVG)
```

## Status & roadmap

Proven: part export, code recolor to BDS palettes, code composition, per-service
palette swap, character mirroring, standing + seated (at-laptop) poses. Ahead:

- More humaaans poses (gesturing, standing-presenting) and multi-figure seated scenes
- More scenery/props (armchair, side table, window, mug, desk)
- A Storybook brand-standards page documenting the system
- Recompose the two live blog heroes via the engine → CMS `featured_image_url`
- (Future) CMS "generate illustration" feature calling this engine

Provenance, palettes, and retired dead-ends: brik-rag `brik-illustration-locked-style`.
Tracked under brik-bds#1203.
