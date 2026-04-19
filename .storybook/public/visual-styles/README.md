# Visual Style reference images

Hosted at `https://storybook.brikdesigns.com/visual-styles/{filename}`. Consumed by `VISUAL_STYLE_EXAMPLES` in [`content-system/vocabularies/visual-style.ts`](../../../content-system/vocabularies/visual-style.ts).

## Source

All 11 images below are Paper artboards exported from file [`bds-theming`](https://app.paper.design/file/01KPH6ANXVEPBJ4PAVB7V380JH) at 1440×900. Export at 2x scale (2880×1800) for retina-sharp delivery; Storybook and the portal picker will down-scale as needed.

## Required files

### Primary-style heroes (6)

| Filename | Paper artboard | Source of inspiration |
|---|---|---|
| `minimal.png` | Minimal — Hero (`14-0`) | leadify-template.webflow.io |
| `playful.png` | Playful — Hero (`1S-0`) | pizza-guy.webflow.io |
| `luxurious.png` | Luxurious — Hero (`L-0`) | villabliss-wbs.webflow.io |
| `modern.png` | Modern — Hero (`2V-0`) | gradienttemplates.webflow.io |
| `classic.png` | Classic — Hero (`43-0`) | editorial masthead tradition |
| `brutalist.png` | Brutalist — Hero (`1-0`) | blacksmith-sbj.webflow.io |

### Modifier-demo compositions (5)

| Filename | Paper artboard |
|---|---|
| `modern-dark.png` | Modern + Dark (`59-0`) |
| `brutalist-light.png` | Brutalist + Light (`61-0`) |
| `minimal-colorful.png` | Minimal + Colorful (`6K-0`) |
| `luxurious-monochrome.png` | Luxurious + Monochrome (`79-0`) |
| `classic-textural.png` | Classic + Textural (`7S-0`) |

### Pending (2)

No Paper artboards yet — registry entries ship with empty `referenceImageUrl`. Populate when dedicated heroes are authored.

- `bold.png` — Bold primary hero
- `editorial.png` — Editorial primary hero

## Export workflow

In Paper (desktop or web app):

1. Select the artboard listed above.
2. Export → PNG, 2x scale.
3. Rename to the target filename (e.g. `minimal.png`).
4. Drop into this directory.
5. Commit in a data-only PR; Storybook's next deploy picks up the new files automatically (the files are served from `.storybook/public/` → site root).

## Adding a new composition

1. Author the artboard in Paper's `bds-theming` file.
2. Export + drop the PNG here with a filename matching the slug convention (`{primary}.png` for pure, `{primary}-{modifier}.png` for composition).
3. Add a row to `VISUAL_STYLE_EXAMPLES` in `visual-style.ts` referencing the new URL.
4. Ship as one PR.
