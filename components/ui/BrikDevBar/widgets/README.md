# BrikDevBar — vanilla widgets (canonical source)

This directory holds the canonical vanilla-JS source for the four Brik dev widgets:

| File | Slot | What it does |
|------|------|--------------|
| `devbar.js` | shell | Renders the toolbar at the bottom of the page; exposes `window.BrikDevBar.register()` so other widgets can plug in slots. |
| `inspect-widget.js` | inspect | Hover-to-audit token + component inspector. Auto-loaded by `BrikDevBar.tsx`. |
| `feedback-widget.js` | feedback (pin) | Click-anywhere pin-drop overlay; POSTs comments to `portal.brikdesigns.com` with a review token. External-client surface. |
| `events-widget.js` | events | Live-tail of `@brikdesigns/events` MemoryTransport buffer. |

## Source-of-truth move (2026-05)

Until #466, these widgets lived in `brik-llm/scripts/brik-dev-tool/widgets/` and BDS held only the React shells. BDS is now the canonical source — consumers (portal, renew-pms, brik-llm cache, BDS Storybook) are written to by `scripts/sync-devbar-widgets.sh` from this directory.

Edit here, run `npm run sync:devbar-widgets`, commit the diffs in each affected repo.

## Storybook

Each widget has a story under `Dev Tools/widgets/*` exercising its bootstrap path. The `BrikDevBar` shell story (one level up) shows two slots registered via `useDevBarSlot` — that pattern is the React side.

## Adding a new widget

1. Drop the vanilla JS source into this directory.
2. Co-locate a `.stories.tsx` next to it.
3. Add destinations to `scripts/sync-devbar-widgets.sh`.
4. If consumers should auto-load it (like `BrikDevBar.tsx` does for `inspect-widget.js`), add the `inject()` call there too.
