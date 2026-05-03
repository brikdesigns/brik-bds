---
name: Chromatic — BDS Storybook hosting
description: Stable URLs, app ID, publish command, and the per-build URL warning for BDS Storybook on Chromatic. The endpoint consumer-repo Claude sessions query for live MCP + manifest data.
type: reference
last_updated: 2026-05-03
last-verified: 2026-05-03
---

# Chromatic — BDS Storybook hosting

BDS Storybook is published to Chromatic for two purposes:

1. **Visual regression testing** — pixel-level diffs between builds.
2. **Storybook MCP endpoint** — the `/mcp` route consumer-repo Claude sessions query for live component specs.

## Stable references

| Resource | Value |
|----------|-------|
| App ID | `69b8918cac3056b39424d5d3` |
| Stable URL (use this everywhere) | https://main--69b8918cac3056b39424d5d3.chromatic.com/ |
| Dashboard | https://www.chromatic.com/builds?appId=69b8918cac3056b39424d5d3 |

⚠ **Never commit a per-build URL** (e.g. `<appid>-<random>.chromatic.com`) — those freeze on the build that produced them and silently rot. The `main--` branch alias above always tracks the latest build on `main`.

## What the stable URL serves

- `/mcp` — live `addon-mcp` server (the endpoint consumer agents query)
- `/index.json` — story index, including all `surface-*` tags
- `/manifests/components.json` + `/manifests/components.html` — components manifest from `componentsManifest`

The Netlify deploy at `storybook.brikdesigns.com` is browseable but does **not** serve `/mcp` (static build only). Agent MCP queries must use the Chromatic stable URL.

## Publish

```bash
npm run chromatic
```

Run after any component CSS or story changes are committed. Consumer agents query the published Chromatic build, not your local Storybook — unpublished changes won't reach them.
