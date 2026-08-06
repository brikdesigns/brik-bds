# Visual regression baselines (ADR-026)

Committed reference screenshots for every Storybook story, compared by the
`visual` job in [`visual.yml`](../../.github/workflows/visual.yml) on every PR.
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

## What the suite cannot see

**The suite captures stories, not states.** A state with no story export has no
baseline, however visible it is — so an empty baseline diff means "no *story*
changed", never "no pixels changed". Read this list before concluding a PR has
no visual impact.

| Blind spot | Why | Gated instead by |
| --- | --- | --- |
| `disabled`, `loading`, every boolean toggle + icon slot | ADR-010 Q2 routes them to `argTypes` controls, not stories. Storybook renders the default arg value, so the gate only ever sees the enabled control. | `contrast-gate` (value) + `lint-disabled-fade` (mechanism) — see below |
| `:hover` / `:focus` / `:active` | No story forces a pseudo-class, and the setup file screenshots the mounted render as-is. Zero hover/focus/active baselines exist. | nothing — accepted gap |
| Dark theme, other viewports, Firefox/WebKit | Out of the day-one matrix above. | nothing — deliberate follow-up |
| A small component on a large canvas | `allowedMismatchedPixelRatio: 0.001` is measured against the whole canvas, so a Badge losing its pill radius moves ~0.007% of pixels and passes ([#1696](https://github.com/brikdesigns/brik-bds/issues/1696), measured). | nothing yet — #1696 is open |

Reproduce the first row:

```bash
ls tests/visual/__screenshots__/ | wc -l              # 356
ls tests/visual/__screenshots__/ | grep -i disabled   # 1 — components-button-disabled
```

One disabled baseline out of 356, and it belongs to `Button` — the token-swap
component that #1687 deliberately did **not** touch. That is why #1687 changed
the disabled treatment of 27 components and regenerated exactly one baseline,
which was an unrelated dashboard screenshot.

### Disabled states are gated numerically + structurally, not by pixels (#1697)

The decision, recorded here and in
[ADR-028 § Amendment 2026-08-06](../../docs/adrs/ADR-028-disabled-state-treatment.md):

- **Value** — `npm run contrast-gate` composites the fade through the `alpha`
  field on `tokens/contrast-pairings.json` pairings (#1687) and fails below the
  AA-large 3:1 floor. Retuning `--state-disabled-opacity` below **0.5** fails CI.
- **Mechanism** — `npm run lint-disabled-fade` asserts every disabled-scoped CSS
  rule implements one of ADR-028's two treatments: `opacity:
  var(--state-disabled-opacity)` for a fill-less control, or the
  `--background-disabled` / `--text-disabled` / `--border-disabled` trio for one
  that paints its own fill. A component that hardcodes a literal again, drops
  the fade, or reintroduces the retired muted-text swap fails.

Pixel coverage was considered and rejected: the two routes that would provide it
each fight a standard — a cohort gallery story is the export shape ADR-010 §4
reversed, and capturing args-applied variants makes the baseline set a function
of the arg matrix rather than the sidebar. The rationale is in the ADR amendment.

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
