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
  `allowedMismatchedPixels: 10` (set in
  [`vitest.config.ts`](../../vitest.config.ts)) — see
  [Why the floor is absolute](#why-the-floor-is-absolute-not-a-ratio).
- On failure, diff PNGs land in `__diffs__/` and are uploaded as the
  `visual-diffs` workflow artifact. There is no hosted approve-UI — the fix or
  the new baseline lands as a reviewed commit (ADR-026 accepted tradeoff).

## Why the floor is absolute, not a ratio

The gate shipped with `allowedMismatchedPixelRatio: 0.001`. The effective
allowance is `min(allowedMismatchedPixels, ratio × area)`, and every story
canvas is 960×720 — so that ratio let **691 mismatched pixels** through on
every story, whether the thing under test was a full page or a badge. Two
regressions were measured slipping under it:

| Change | Pixels moved | Verdict at 691 |
| --- | --- | --- |
| `.bds-badge` `border-radius` pill → 8px (synthetic repro, #1696) | 38–155 per Badge story | passed silently |
| `TextLink :: In Paragraph` gaining a persistent underline (#1712, real) | 241 | passed silently — the baseline was never regenerated, and nobody knew |

**The ratio was never the thing absorbing antialiasing noise — `threshold: 0.2`
is.** That is applied per pixel, before anything is counted as mismatched.
Measured with `allowedMismatchedPixels: 0` in the pinned container
([run 31119311151](https://github.com/brikdesigns/brik-bds/actions/runs/31119311151)):
**404 of 405 stories report exactly 0 mismatched pixels**, and the counts are
identical across two runner machines and four suite invocations. The 405th was
the stale TextLink baseline above — a real diff, not noise.

So the ratio was removed rather than lowered, and `allowedMismatchedPixels: 10`
is a **noise margin, not a tolerance**: measured noise is 0, the smallest real
regression measured was 12 px, and 10 leaves room for a stray pixel or two from
a future font/GPU shift without giving up any change we have evidence for.

If a story ever does flake, do not raise this number — that trades the gate's
whole purpose for one story's convenience. Tag the story `no-visual`, or add a
per-story override, and record why here.

### Known remaining blind spot: low-contrast changes

The pixel floor fixes the *denominator*. It does nothing about the *per-pixel*
gate in front of it, and that has its own blind spot worth knowing before you
trust a green run.

`threshold: 0.2` means a pixel only counts as mismatched when its YIQ distance
exceeds `35215 × 0.2² = 1408.6`. A light grey against white does not clear
that bar. Measured on the badge repro — same CSS change, same story file:

| Badge story | Fill | YIQ delta vs white | Gate |
| --- | --- | --- | --- |
| Progress | `rgb(47,128,237)` | 11858 | counted → **failed** |
| Error | `rgb(235,87,87)` | 10258 | counted → **failed** |
| Positive | `rgb(39,174,96)` | 10039 | counted → **failed** |
| Warning | `rgb(242,201,76)` | 3017 | counted → **failed** |
| Default | `rgb(212,212,212)` | 934 | **ignored — passed silently** |
| Neutral | `rgb(224,224,224)` | 486 | **ignored — passed silently** |

So the identical shape regression is caught on the saturated badges and
invisible on the grey ones, at any pixel floor. Lowering `threshold` is the
lever, and pixelmatch's own default (`0.1` → maxDelta 352) would catch both —
but it also re-opens the antialiasing question this file spent #1696 closing,
so it needs the same measurement protocol before it moves. Tracked separately;
do not tune it blind.

Note this does **not** contradict #1673's "antialiasing is not byte-reproducible
between container runs". PNG bytes can differ while the mismatched-pixel count
stays 0, because `threshold: 0.2` scores those sub-threshold differences as
matching. Byte-level churn is real; comparator-level churn is not.

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
