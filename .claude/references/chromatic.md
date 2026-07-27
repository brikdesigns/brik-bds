---
name: Chromatic — BDS Storybook hosting
description: Stable URLs, app ID, publish command, the snapshot budget model and trigger table, the `visual-review` PR gate, why a local full build is not a usable pre-merge visual diff under TurboSnap, and the on-demand full_capture path for refreshing the baseline floor. The endpoint consumer-repo Claude sessions query for live MCP + manifest data.
type: reference
last_updated: 2026-07-27
last-verified: 2026-07-27
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

### ⚠ `main--` now refreshes daily, not per-merge

The `main--` alias tracks the latest build **on `main`**, and since #771 that is the 09:00 UTC scheduled build. So `/mcp`, `/index.json`, and the manifests can lag `main` by up to 24h, and a consumer-repo agent may read a component API one day stale.

A local `npm run chromatic` does **not** fix this — it publishes under your *branch* alias, not `main--`. To refresh the endpoint immediately, fire the workflow on `main`:

```bash
gh workflow run chromatic.yml --repo brikdesigns/brik-bds --ref main
```

That costs the ~80-billed floor. Accepting a ≤24h lag is the deliberate trade for staying on the free plan; if it bites in practice, that is the evidence for revisiting #771.

## Snapshot budget — read before triggering any build (#771)

Chromatic bills a **captured** snapshot at 1 and a TurboSnap-skipped ("turbosnap") story at **0.2**. With ~403 stories, *every* build costs a floor of ~80 billed even when it captures nothing. The free plan allows **5,000 billed/month**, and the cycle resets around the **26th** (observed: quota exhausted through 2026-07-25 21:37Z, capturing again by 2026-07-26 13:53Z).

| Trigger | Frequency | Approx. billed |
|---|---|---|
| Daily scheduled build on `main` | ~30/mo | ~2,400 |
| `visual-review`-labelled PR | opt-in | ~80 each |
| `workflow_dispatch` with `full_capture` | rare | ~403 each |

That leaves roughly 2,600 billed/month of headroom. Two things blow it: a burst of full captures, and re-labelling PRs casually. The per-build Slack message reports an approximate billed figure — the Chromatic billing page is the ground truth.

## Publish

```bash
npm run chromatic        # TurboSnap-scoped (--only-changed) — the default
npm run chromatic:full   # full re-capture, ~403 billed (~8% of the month)
```

Run after any component CSS or story changes are committed. Consumer agents query the published Chromatic build, not your local Storybook — unpublished changes won't reach them. Both scripts publish the Storybook (so the `/mcp` endpoint updates either way); they differ only in how many stories get re-captured.

## Getting a pre-merge visual diff

Add the **`visual-review`** label to the PR. That fires the Chromatic workflow on the PR *without* `exitOnceUploaded`, so unreviewed visual changes fail the check and block merge. Pushing more commits to a labelled PR re-runs it (~80 billed each), so label when you're ready for review, not at open.

It is opt-in rather than always-on for cost: 49% of merges touch component/CSS paths (154 of 313 over 30 days), and an always-on PR gate would bill ~12,300/month against a 5,000 allotment.

## ⚠ A local full run is NOT a usable pre-merge visual diff (#1472)

`npm run chromatic:full` re-captures all ~403 stories. CI runs **with** `onlyChanged: true`, which skips almost everything — the run on main for `#1452` captured **0 snapshots and skipped 399**. Most baselines are therefore inherited images from well before current main.

Diffing a full local re-capture against those stale baselines reports **every story as changed**. Observed on build 989: 399 of 399 flagged for a branch touching only `content-system/blueprints/**`. That is baseline staleness, not your change.

**So:**

- Don't read a local full-build change count as a verdict on your branch. Use the `visual-review` label instead, or verify the specific thing you changed directly.
- For a targeted pre-merge check without spending snapshots at all, render the affected stories from `storybook-static` headless and compare computed styles / screenshots against a build of the base commit. That is how #1439 was verified — see [ADR-021](../../docs/adrs/ADR-021-blueprint-section-shell.md) § "Measured, not asserted".
- The workflow triggers on a **daily schedule**, a **`visual-review`-labelled PR**, and **`workflow_dispatch`**. It no longer runs on every push to `main` — a per-push trigger billed ~22,600/month against a 5,000 allotment (#771).

Until the baselines are reset (#1472), even a labelled PR run can over-report on stories TurboSnap invalidates broadly. See the `full_capture` section below for the reset.

## Refreshing the baseline floor — `full_capture` (#1472)

TurboSnap keeps per-merge cost near zero, but it also means the baselines it diffs against go stale. The fix is not to disable TurboSnap; it is to re-capture the floor on `main` on demand.

**How to run one:**

```bash
gh workflow run chromatic.yml --ref main -f full_capture=true
```

Or in the UI: Actions → Chromatic → *Run workflow* → tick **full_capture**.

That sets `onlyChanged: false` for the run, so every story is re-captured against `main`. Then triage the changed-story list in the Chromatic UI and accept the baselines you've confirmed. A subsequent full capture on an unmodified `main` should report **0 changes** — that is the signal the floor is trustworthy again.

**Cost and cadence.** One run is ~399 snapshots against the quota #771 tracks. It is deliberately **on-demand, not scheduled** — there is no standing snapshot cost, and the trade-off is that baselines drift again between runs. Run one:

- before you need a full build to be readable (i.e. before relying on a visual verdict for a risky change),
- after a merge you expect to move many stories (token, theme, or `preview.tsx` edits),
- not routinely.

**Two things it deliberately does not do:**

- **No auto-accept.** `autoAcceptChanges` is unset, so a full capture surfaces changes for review instead of silently moving baselines. Don't set it to `false` to "be explicit" — the action forwards that input to `--auto-accept-changes`, which takes an optional branch glob, so a literal `false` is ambiguous.
- **No PR-scoped diff.** A full capture runs on `main`, not on your branch. It makes a *later* build readable; it is not itself a pre-merge check. For a per-branch verdict, use the headless render-and-diff above.

Full captures also run in their own concurrency group, so a routine push to `main` can't cancel one mid-flight.
