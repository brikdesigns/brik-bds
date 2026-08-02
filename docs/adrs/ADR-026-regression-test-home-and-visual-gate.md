# ADR-026 — Regression-test home + visual-regression cost model

**Status:** Accepted (2026-08-02)
**Date:** 2026-08-01
**Supersedes:** —
**Superseded by:** —
**Owner:** Nick Stanerson
**Related:** [#1616](https://github.com/brikdesigns/brik-bds/issues/1616) (this decision); [ADR-010](./ADR-010-storybook-axes-of-information.md) §Q5 — extended, not amended (the Q5 outcome gains a second tag); [#771](https://github.com/brikdesigns/brik-bds/issues/771) (Chromatic plan evaluation — this ADR supplies the measurement it was waiting for); [#1497](https://github.com/brikdesigns/brik-bds/pull/1497) (the label-gated trigger being reassessed); [#1613](https://github.com/brikdesigns/brik-bds/issues/1613) / [#1614](https://github.com/brikdesigns/brik-bds/pull/1614) (the ToggleSwitch fold that surfaced this)

Ratified by the owner on 2026-08-02 (held at Proposed because Arm B changes what protects the merge path and declines a $179/mo purchase). Follow-on sub-issues filed under #1616: [#1637](https://github.com/brikdesigns/brik-bds/issues/1637) (visual gate), [#1638](https://github.com/brikdesigns/brik-bds/issues/1638) (interaction-test tag), [#1639](https://github.com/brikdesigns/brik-bds/issues/1639) (Chromatic retarget). #771 closes with this ratification (Consequences §4).

## Context

BDS runs two kinds of regression test that the [Storybook docs](https://storybook.js.org/docs/writing-tests/visual-testing) treat as separate concerns:

- **Behavioral** — DOM/interaction assertions in `play` functions, shipped as `InteractionTest…` stories tagged `['!manifest']` per ADR-010 §Q5.
- **Visual** — pixel diffs, owned by Chromatic.

#1616 asked whether a Playwright/Storybook test-runner should own both: giving behavioral assertions a home off the sidebar, and removing the per-snapshot cost that [#771](https://github.com/brikdesigns/brik-bds/issues/771) capped by label-gating Chromatic instead of running it per merge.

### Measured state — behavioral

The Storybook test-runner is **already wired and already green**, which the framing in #1616 did not account for:

- `@storybook/addon-vitest` 10.3.6 is a registered addon ([`.storybook/main.ts:16`](../../.storybook/main.ts)), and [`vitest.config.ts`](../../vitest.config.ts) declares a `storybook` project that runs `storybookTest` in real Chromium via `@vitest/browser-playwright`.
- Measured 2026-08-01: `npx vitest run --project storybook` → **144 test files / 404 tests passed in 70.12s** (73s wall). Every story is a test; all 41 `InteractionTest…` play functions across 19 story files execute there.
- [`.github/workflows/test.yml`](../../.github/workflows/test.yml) runs the full `npm test` (all five vitest projects) on every PR to `main` and every push to `main`.

So the premise "behavioral tests sit in the sidebar rather than a test file" is half wrong. They *run* in a test runner. What is real is **sidebar noise**: `storybook-static/index.json` carries 41 `Interaction Test …` story entries, none tagged `manifest` (so MCP discovery is already clean) but all still listed in the sidebar.

### Measured state — visual

The label-gated Chromatic model is **not currently protecting anything**:

- **Every Chromatic build sampled between 981 (2026-07-26T13:23Z) and 1024 (2026-08-01T17:32Z)** logs `⚠ Snapshot quota reached — This build is limited because your account is out of snapshots for the month.` Sampled 12 builds spanning the window (981, 1011–1013, 1015, 1016, 1018–1021, 1023, 1024) — both endpoints and every build in the last four days, including all three `visual-review`-labelled PR builds on 2026-08-01 (runs 30701834851 / 30706241501 / 30710510846). Intermediate builds were not each fetched (the `gh` GraphQL bucket is fleet-shared), but no build in the sample escaped the limit, so the window is **≥6 days with zero visual coverage**.
- The `visual-review` label is documented in `CLAUDE.md` as "a blocking pre-merge visual diff". While quota is exhausted it blocks on a build that captures nothing.
- #1497's ~2,400-billed/mo projection **never got a clean cycle to be tested against**: 29 push-trigger builds ran on 2026-07-26–27 inside the same billing cycle, before #1497 landed (`30b0f8c`, 2026-07-27), and quota was already exhausted on 07-26.
- The "~80-billed floor per build" premise (403 stories × 0.2 inherited) does **not** appear in build logs. Post-TurboSnap builds report *"Capturing N snapshots and skipping 0 snapshots"* — build 1011: 2/0, 1012: 28/0, 1013: 60/0, 1015: 70/0, 1016: 144/0. Caveat: all were quota-limited, so those are TurboSnap plan lines, not billed outcomes; the floor is neither confirmed nor refuted by a healthy build.
- Pricing (chromatic.com/pricing, fetched 2026-08-01): Free $0 / 5,000 billed snapshots; **Starter $179/mo / 35,000**; Pro $399/mo / 85,000. TurboSnap-skipped snapshots bill at 0.2 (5,000 billed ⇒ "25k turbosnaps").
- Chromatic's *other* job — hosting the Storybook that consumer-repo agents query over MCP — is quota-independent and unaffected. It is the load-bearing half.

### Measured state — self-hosted alternative

- `brik-bds` is a **public** repo (`gh api repos/brikdesigns/brik-bds` → `private: false`), and all 42 workflows run on `ubuntu-latest`. GitHub's billing docs: *"GitHub Actions usage is free for self-hosted runners and for public repositories that use standard GitHub-hosted runners."* → unlimited visual runs at **$0**.
- The expensive part already exists: the 404-story Chromium render pass takes **70s**. Screenshot assertions are incremental on top of it.
- Vitest 4 browser mode ships `toMatchScreenshot()` with `comparatorName`/`comparatorOptions` (`threshold`, `allowedMismatchedPixelRatio`), masking, and stable-screenshot detection ([vitest.dev](https://vitest.dev/guide/browser/visual-regression-testing), fetched 2026-08-01). Installed: `vitest ^4.1.2`, `@vitest/browser ^4.1.10`, `playwright ^1.59.1`.
- Baseline storage, measured on a 40-story spread at 1200×800 from `storybook-static`: mean **24.8 KB**, median 18.8 KB, max 86.3 KB → **~9.8 MB** for all 404 baselines. Fits in git; no LFS.
- The real cost of this path, per the Vitest docs: screenshots are environment-specific (files are named `…-chromium-darwin.png`), and the docs recommend generating them in a stable cloud/Docker environment rather than on a dev machine.

## Decision

### 1. Arm A — behavioral assertions stay as `play`-only stories. No `*.test.tsx` migration.

The 41 `InteractionTest…` stories keep ADR-010 §Q5 shape. Rationale:

- They already run in a real browser under the same runner a migration would move them to, gated on every PR. A migration buys no coverage.
- An RTL `*.test.tsx` would re-render the component **outside** the Storybook decorator stack, so theme classes, token CSS, and toolbar globals from [`.storybook/preview.tsx`](../../.storybook/preview.tsx) would have to be duplicated in a test harness — a second rendering path that can drift from the one agents read over MCP.
- One artifact keeps the assertion pinned to the same rendered story the docs and MCP manifest describe.

### 2. Arm A — sidebar noise is fixed with a tag, not a rename.

Interaction tests gain a second tag alongside `!manifest`, and the tag is configured to drop out of the sidebar:

```ts
// story
tags: ['!manifest', 'interaction-test'],

// .storybook/main.ts
tags: {
  wip: { excludeFromSidebar: true },
  'interaction-test': { excludeFromSidebar: true },
},
```

Storybook 10.3.6's `TagOptions` supports `excludeFromSidebar`, `excludeFromDocsStories`, and `defaultFilterSelection: 'include' | 'exclude'` (verified in the installed `storybook/dist/types/index.d.ts`); `wip: { excludeFromSidebar: true }` is the in-repo precedent at [`.storybook/main.ts:39-41`](../../.storybook/main.ts).

**Do not use the built-in `play-fn` tag as the key.** Measured from `index.json`: 71 story entries carry `play-fn`, of which only 41 are interaction tests — the other 30 are canonical manifest-visible stories with play functions (`Components/button/Default`, `Components/modal/Two Column Form`, …). Excluding `play-fn` would hide 30 stories that must stay visible.

`excludeFromSidebar` (hard hide) over `defaultFilterSelection: 'exclude'` (hidden but toggleable): the test result belongs in the runner's output, not in a sidebar filter a reader has to know to flip.

### 3. Arm B — split Chromatic's two roles. Self-host the visual gate; keep Chromatic for hosting + MCP. Do not buy Starter.

- **Visual regression moves to `toMatchScreenshot()`** inside the existing `storybook` vitest project, running always-on in `test.yml` — free, unlimited, and blocking for real.
- **Chromatic stays** for the hosted Storybook + MCP endpoint that every consumer-repo agent reads. That function never hit the quota and has no free replacement.
- **Starter ($179/mo) is not bought.** It would buy 35,000 billed snapshots to solve a problem the repo's own free CI can solve at $0, and #771's premise for spending — a clean gated cycle exceeding 5,000 — is unmeasurable while the pre-#1497 burn is still inside the current cycle.
- **Baselines are generated in CI only**, in a pinned container image. A baseline committed from a Mac is a guaranteed false positive on `ubuntu-latest` (Vitest names snapshots per browser *and* platform).

### 4. A and B converge on one tool — record the consolidation.

Both arms land on Vitest browser mode + Playwright Chromium, already installed and already in CI. After implementation there is **one test command (`npm test`), one gate ([`test.yml`](../../.github/workflows/test.yml)), covering behavioral and visual regression** — no second runner, no second review surface, no third-party quota in the merge path.

## Alternatives considered

- **Migrate the 41 interaction tests to `*.test.tsx` (Vitest + RTL).** Rejected — duplicates the preview decorator stack outside Storybook and creates a second rendering path; buys no coverage the `storybook` project doesn't already give (404/404 passing, measured).
- **Buy Chromatic Starter.** Rejected — $2,148/yr against a $0 in-repo alternative, and #771's spending trigger cannot be evaluated from a cycle contaminated by 29 pre-#1497 push builds. Revisit only if the self-hosted gate proves unmaintainable.
- **Keep Chromatic snapshots as the only visual gate and wait for the ~26th reset.** Rejected — leaves the merge path unprotected until then and re-runs the same experiment whose failure mode (quota exhaustion mid-cycle, silent no-op gate) is now measured twice.
- **Drop Chromatic entirely.** Rejected — the hosted Storybook/MCP endpoint is what keeps agent-generated code in six consumer repos aligned with the published API (#771).
- **Percy / Argos as a drop-in replacement.** Rejected without a spike — any hosted vendor reintroduces a per-snapshot quota in the merge path, the exact failure being fixed.
- **`play-fn` as the sidebar-exclusion key.** Rejected on measurement — it covers 30 canonical stories (see Decision 2).

## Consequences

### Immediate, before any implementation lands

- **BDS has no visual-regression coverage right now, and no stopgap exists** — the quota is spent, so neither the daily build nor a `visual-review` label can capture anything before the cycle reset (~26th per #771). Token/CSS PRs merging in this window are unguarded; reviewers should assume pixel changes are unverified.
- `CLAUDE.md`'s claim that the `visual-review` label gives "a blocking pre-merge visual diff" is currently false and must be corrected in the same slice that retargets Chromatic.

### Follow-on sub-issues (filed off this ADR)

1. **Visual-gate spike** — add `toMatchScreenshot()` to the `storybook` vitest project; pin a container image; generate baselines in CI; decide the viewport/theme matrix (Chromatic ran no `modes` config, i.e. one theme today); publish diff PNGs as PR artifacts.
2. **Interaction-test tag** — add `'interaction-test'` to the 41 stories + the `main.ts` tag config; extend `scripts/lint-story-shape.js` to require the `['!manifest', 'interaction-test']` pair on `InteractionTest…` exports; update [`.claude/standards/storybook-story-shape.md`](../../.claude/standards/storybook-story-shape.md) §Q5.
3. **Chromatic retarget** — reduce `chromatic.yml` to publish-only (hosting/MCP), drop the blocking-gate wording, and correct the `CLAUDE.md` + workflow-comment budget prose (including the unverified 80-billed floor).
4. **#771 disposition** — close with the measured outcome (not buying; free plan structurally exhausted under both trigger models) rather than waiting on the 2026-08-26 cycle, which the pre-#1497 burn has already contaminated.

### Accepted tradeoffs

- **No hosted review UI.** Chromatic's approve-baseline workflow is replaced by "the diff is a failing check; the fix or the new baseline lands as a reviewed commit." Baseline churn becomes visible in `git log`, which is a gain for auditability and a loss for one-click triage.
- **No TurboSnap.** Every run screenshots everything. Free CI makes that a wall-clock question, not a billing one, on top of an existing 70s pass.
- **Environment pinning becomes load-bearing.** A runner image bump can flag hundreds of stories at once; the container tag must be pinned and bumped deliberately, the same discipline `chromaui/action` already gets (pinned to a SHA).
- **Cross-browser coverage narrows** to the Chromium instance the vitest project already runs. Firefox/WebKit are a later matrix expansion, not a day-one requirement.
