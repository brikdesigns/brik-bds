---
name: Chromatic — BDS Storybook hosting
description: Stable URLs, app ID, publish command, the per-build URL warning, and why a local full build is not a usable pre-merge visual diff under TurboSnap. The endpoint consumer-repo Claude sessions query for live MCP + manifest data.
type: reference
last_updated: 2026-07-26
last-verified: 2026-07-26
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

## ⚠ A local run is NOT a usable pre-merge visual diff (#1472)

`npm run chromatic` runs **without TurboSnap** and re-captures all ~399 stories. CI (`.github/workflows/chromatic.yml`) runs **with** `onlyChanged: true`, which skips almost everything — the run on main for `#1452` captured **0 snapshots and skipped 399**. Most baselines are therefore inherited images from well before current main.

Diffing a full local re-capture against those stale baselines reports **every story as changed**. Observed on build 989: 399 of 399 flagged for a branch touching only `content-system/blueprints/**`. That is baseline staleness, not your change.

**So:**

- Don't read a local full-build change count as a verdict on your branch. Check the *scoped* post-merge run instead (CI picks the affected story files), or verify the specific thing you changed directly.
- For a targeted pre-merge check, render the affected stories from `storybook-static` headless and compare computed styles / screenshots against a build of the base commit. That is how #1439 was verified — see [ADR-021](../../docs/adrs/ADR-021-blueprint-section-shell.md) § "Measured, not asserted".
- The Chromatic workflow triggers on **push to main + `workflow_dispatch` only** — there is no `pull_request` trigger, so opening a PR produces no Chromatic check.

Fixing the underlying staleness is **#1472**.
