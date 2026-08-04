# Visual regression baselines (ADR-026)

Committed reference screenshots for every Storybook story, compared by the
`visual` job in [`test.yml`](../../.github/workflows/test.yml) on every PR.
Decision record: [ADR-026](../../docs/adrs/ADR-026-regression-test-home-and-visual-gate.md).

## How it works

- The existing `storybook` vitest project renders every story in headless
  Chromium. With `VISUAL_GATE=1`, an `afterEach`
  ([`.storybook/vitest.visual.setup.ts`](../../.storybook/vitest.visual.setup.ts))
  screenshots `document.body` per story and asserts
  `toMatchScreenshot(storyId)` against `__screenshots__/`.
- Comparator: `pixelmatch`, `threshold: 0.2`,
  `allowedMismatchedPixelRatio: 0.001` (set in
  [`vitest.config.ts`](../../vitest.config.ts)).
- On failure, diff PNGs land in `__diffs__/` and are uploaded as the
  `visual-diffs` workflow artifact. There is no hosted approve-UI — the fix or
  the new baseline lands as a reviewed commit (ADR-026 accepted tradeoff).

## Captured matrix (day-one scope, ADR-026)

| Axis | Value |
| --- | --- |
| Browser | Chromium only (the instance the `storybook` project already runs) |
| Platform | `linux` inside `mcr.microsoft.com/playwright:v1.59.1-noble` — the ONLY environment baselines are valid in |
| Viewport | 1200×900 (addon-vitest default); per-story `parameters.viewport` respected |
| Theme | `brik` light (initial globals) — matches the single mode Chromatic captured |
| Fonts | preview-head webfonts injected by the setup file; screenshots wait on `document.fonts.ready` |
| Motion | frozen (`animation-play-state: paused`, zero transition-duration, caret hidden) |

Expansions (dark theme, Firefox/WebKit, more viewports) are deliberate
follow-ups, not day-one scope.

## Opting a story out

Tag it `no-visual` (JS-driven animation that can never produce a stable
screenshot — e.g. lottie canvases) — see AnimatedIcon. Stories tagged
`interaction-test` (#1638) are also skipped: behavioral end states aren't
design surfaces.

## Updating baselines

Never from a dev machine — baselines are platform-suffixed, so a
Mac-generated PNG is a guaranteed false positive in CI. Run the
**Update Visual Baselines** workflow (Actions → pick your branch). It
regenerates inside the pinned container and pushes the commit to your branch
for review.

The push uses a `brik-ci-bot` App installation token, so the gates re-run on
the new commit on their own. That is deliberate and load-bearing: a push
authenticated with the default `GITHUB_TOKEN` cannot trigger CI, which used to
leave every check parked at `action_required` and the PR showing no results at
all — indistinguishable from "not run yet" (#1662). If you ever see a baseline
commit with no checks against it, the token is the first thing to look at.

The commit contains only the baselines that actually changed. `vitest --update`
rewrites a reference **only when the comparator fails** against the committed
one, so a story that still matches is left untouched — and a branch with no
visual change produces no commit at all (the job summary says so).

Leave `prune` off unless you deleted or renamed a story. `prune: true` wipes
`__screenshots__/` first, which drops references for stories that no longer
exist — but it also makes every remaining reference "missing", so all of them
are written fresh with no comparison. Chromium antialiasing is not
byte-reproducible between container runs, so that rewrites files the comparator
scores as identical (measured: 9 of 10 in one commit had zero mismatched
pixels — #1673). Expect a pruned run to be churn-heavy and review it as such.

## Bumping the container / Playwright

The image tag pins font + GPU stacks; bumping it can flag hundreds of
stories at once. Bump `mcr.microsoft.com/playwright:vX.Y.Z-noble` (both
workflows) in lockstep with the `playwright` npm dependency, and regenerate
baselines in the same PR.
