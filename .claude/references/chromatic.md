---
name: Chromatic — BDS Storybook hosting
description: Stable URLs, app ID, publish command, and the publish-only role Chromatic keeps after ADR-026 moved visual regression to the self-hosted Vitest gate. Chromatic hosts the Storybook; it is NOT the canonical consumer-agent read path (see CLAUDE.md § Reading BDS from a consumer repo).
type: reference
last-verified: 2026-08-25
---

# Chromatic — BDS Storybook hosting

**Chromatic hosts Storybook. It is not a visual-regression gate.** [ADR-026](../../docs/adrs/ADR-026-regression-test-home-and-visual-gate.md) split its two roles: pixel diffing moved to the self-hosted Vitest `toMatchScreenshot` gate — implemented in `visual.yml` (#1637; ADR-026 named `test.yml` but the gate shipped as `visual.yml`) — and what stays here is the half with no free replacement — publishing the hosted Storybook.

> **Not an agent read path.** The Chromatic build also exposes a `/mcp` endpoint, but per [CLAUDE.md § Reading BDS from a consumer repo](../../CLAUDE.md) and the `bds-docs-access` runbook (`brik-rag query "bds docs access"`), the canonical consumer-agent read path is `brik-rag` + in-repo `components/ui/**` source — not the hosted endpoint, which is off the agent egress allowlist. This page documents Chromatic's hosting role, not a read path.

## Stable references

| Resource | Value |
|----------|-------|
| App ID | `69b8918cac3056b39424d5d3` |
| Stable URL (use this everywhere) | https://main--69b8918cac3056b39424d5d3.chromatic.com/ |
| Dashboard | https://www.chromatic.com/builds?appId=69b8918cac3056b39424d5d3 |

⚠ **Never commit a per-build URL** (e.g. `<appid>-<random>.chromatic.com`) — those freeze on the build that produced them and silently rot. The `main--` branch alias above always tracks the latest build on `main`.

## What the stable URL serves

- `/mcp` — `addon-mcp` server exposed by the Chromatic build (not the canonical consumer-agent read path — see the note above)
- `/index.json` — story index, including all `surface-*` tags
- `/manifests/components.json` + `/manifests/components.html` — components manifest from `componentsManifest`

The Netlify deploy at `storybook.brikdesigns.com` is browseable but does **not** serve `/mcp` (static build only). Neither hosted surface is the sanctioned agent read path: agents resolve BDS docs via `brik-rag` and in-repo `components/ui/**` source (CLAUDE.md § Reading BDS from a consumer repo).

## Publish

```bash
npm run chromatic        # TurboSnap-scoped (--only-changed) — the default
npm run chromatic:full   # re-captures every story; only useful if you want fresh snapshots
```

Run after any component CSS or story change is committed. Consumer agents query the published Chromatic build, not your local Storybook — unpublished changes won't reach them.

A local run publishes under your **branch** alias, not `main--`. To refresh the endpoint agents read:

```bash
gh workflow run chromatic.yml --repo brikdesigns/brik-bds --ref main
```

### `main--` refreshes daily, not per-merge

CI publishes on the 09:00 UTC schedule (plus `workflow_dispatch`). So `/mcp`, `/index.json`, and the manifests can lag `main` by up to 24h — relevant to any tool consuming the hosted endpoint, though that is not the sanctioned agent read path (above). Whether that lag is acceptable — and what a per-merge publish would cost — is tracked in [#1498](https://github.com/brikdesigns/brik-bds/issues/1498).

**There is no zero-cost publish mode.** `chromatic --skip` does not upload at all — it exits with `Skipped build for commit … due to --skip` and never builds Storybook (verified 2026-08-02, CLI v15.3.0). That refutes #1498's leading candidate; a publish costs whatever a TurboSnap-scoped build costs, which is why the cadence is daily rather than per-merge.

## ⚠ A green Chromatic check is not visual coverage

When the snapshot quota is spent, `chromaui/action` still exits 0 and the check passes while capturing **nothing**. The only signal is this line inside the *Run Chromatic* step log:

```
⚠ Snapshot quota reached
  This build is limited because your account is out of snapshots for the month.
```

Every build sampled from 981 (2026-07-26) to 1024 (2026-08-01) carried it, including all three `visual-review`-labelled PR builds — which is how a "blocking" gate ran as a no-op for six days unnoticed (ADR-026 § Context). To check whether a build really captured anything:

```bash
gh run view <run-id> --log | rg -i 'quota|Capturing .* snapshots'
```

A quota-limited build *does* still publish (`✔ Storybook published` on build 1020), so hosting keeps working on an empty quota. That is what makes publish-only viable at $0.

## Plan and cost

Free plan: **5,000 billed snapshots/month**, cycle resetting around the 26th. Chromatic bills a captured snapshot at 1 and a TurboSnap-skipped one at 0.2 (chromatic.com/pricing, checked 2026-08-02: Free $0/5,000 · Starter $179/mo/35,000 · Pro $399/mo/85,000). ADR-026 declined Starter — the visual gate it would pay for is free on public-repo CI.

Under publish-only the standing line item is the daily build. Nothing else triggers Chromatic, so there is no PR-time burn to budget for.

## Retired

- **The `visual-review` label** no longer fires anything — the `pull_request` trigger was removed with ADR-026. Pixel drift is caught by `visual.yml`.
- **`workflow_dispatch` `full_capture`** is gone with it: it existed to refresh visual baselines (#1472), and baselines now live with the self-hosted gate.
