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
- Comparator: `pixelmatch`, `threshold: 0.1`,
  `allowedMismatchedPixels: 10` (set in
  [`vitest.config.ts`](../../vitest.config.ts)) — see
  [Why the floor is absolute](#why-the-floor-is-absolute-not-a-ratio) and
  [Why the threshold is 0.1](#why-the-threshold-is-01-not-02).
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

**The ratio was never the thing absorbing antialiasing noise — `threshold`
is.** That is applied per pixel, before anything is counted as mismatched.
(It was `0.2` when this was measured; #1727 has since moved it to `0.1`, which
does not change the conclusion below — see the next section.)
Measured with `allowedMismatchedPixels: 0` in the pinned container
([run 31119311151](https://github.com/brikdesigns/brik-bds/actions/runs/31119311151)):
**404 of 405 stories report exactly 0 mismatched pixels**, and the counts are
identical across two runner machines and four suite invocations. The 405th was
the stale TextLink baseline above — a real diff, not noise.

So the ratio was removed rather than lowered, and `allowedMismatchedPixels: 10`
is a **noise margin, not a tolerance**: measured noise is 0, and 10 leaves room
for a stray pixel or two from a future font/GPU shift.

It is not free. The smallest real regression measured in this repo is now
**7 px** — `Stepper :: Quantity Selector` under #1695, found in #1732 — which
is under the floor and therefore invisible to the gate *and* to the baseline
regen. The margin is still the right trade against a font/GPU shift flagging
hundreds of stories at once, but it is a trade, not a free win.

If a story ever does flake, do not raise this number — that trades the gate's
whole purpose for one story's convenience. Tag the story `no-visual`, or add a
per-story override, and record why here.

Note this does **not** contradict #1673's "antialiasing is not byte-reproducible
between container runs". PNG bytes can differ while the mismatched-pixel count
stays 0, because `threshold` scores those sub-threshold differences as
matching. Byte-level churn is real; comparator-level churn is not.

## Why the threshold is 0.1, not 0.2

The floor above fixes the *denominator*. `threshold` is the gate in front of
it, and it decides what the comparator can see **at all**: a pixel is only ever
counted as mismatched once its YIQ distance clears `35215 × threshold²`.

At the original `0.2` that bar was **1408.6**, and a light grey against white
does not clear it. One CSS change — `.bds-badge` pill → 8px radius — split the
7 Badge stories straight down the contrast line (#1727):

| Badge story | Fill | YIQ delta vs white | At threshold 0.2 |
| --- | --- | --- | --- |
| Progress | `rgb(47,128,237)` | 11858 | counted → failed |
| Error | `rgb(235,87,87)` | 10258 | counted → failed |
| Positive | `rgb(39,174,96)` | 10039 | counted → failed |
| Warning | `rgb(242,201,76)` | 3017 | counted → failed |
| **Default** | `rgb(212,212,212)` | **934** | **ignored — passed silently** |
| **Neutral** | `rgb(224,224,224)` | **486** | **ignored — passed silently** |

Same component, same regression, opposite verdicts, decided purely by fill
saturation — and no pixel floor could have changed that. Every muted surface in
BDS was in that gap: disabled states, skeletons, dividers, grey borders.

Candidates were swept in the pinned container at `allowedMismatchedPixels: 0`,
clean and with the repro ([run 31137880167](https://github.com/brikdesigns/brik-bds/actions/runs/31137880167)):

| threshold | maxDelta | Clean tree, as measured then | Badge Default / Neutral under the repro |
| --- | --- | --- | --- |
| 0.2 | 1408.6 | 0 nonzero | passed silently / passed silently |
| **0.1** | **352.2** | 1 nonzero — Stepper "Quantity Selector", 7 px | **41 px / 44 px → both fail** |
| 0.05 | 88.0 | 2 nonzero — Stepper 7 px, Pagination "With Result Count" 1043 px | 41 px / 44 px |

`0.1` is pixelmatch's own default. It closes the blind spot and costs nothing:
its one clean-tree count was 7 px, under the 10 px floor, so the full suite
still passed. `0.05` buys no extra sensitivity on the thing being fixed.

**Neither nonzero count was noise.** Both were stale baselines — see below.
After #1732 regenerated them, the clean tree measures **0 mismatched pixels on
all 405 stories at 0.05**
([run 31186002918](https://github.com/brikdesigns/brik-bds/actions/runs/31186002918)).
0.05 is therefore viable on the evidence, and 0.1 is kept only because it is
already sufficient — it catches everything 0.05 does on every regression
measured so far.

### The 0.05 "false positives" were stale baselines (#1732)

`Pagination :: With Result Count` was the reason the row above said "settle
this before going below 0.1". It is settled, and the answer was not
antialiasing.

All **1043** counted pixels carry **one identical** reference→actual pair,
`rgb(243,185,173) → rgb(240,168,153)`, filling a coherent 37×38 disc — the
disabled "previous page" arrow. Antialiasing cannot produce that; it scatters
across many intermediate values along an edge. (pixelmatch's own AA detection
excluded the 39 genuinely-antialiased rim pixels, which is why the solid-fill
count and the reported count are the same number.)

Solving the composite over white gives **alpha 0.400 in the baseline and 0.500
in the render** — `--state-disabled-opacity` 0.4 → 0.5 in
[`64641309`](https://github.com/brikdesigns/brik-bds/commit/64641309) (#1695),
which also moved `.bds-pagination__arrow--disabled` off its `opacity: 0.4`
literal onto the token. `Stepper :: Quantity Selector` is the same commit's
other half: #1695 retired the `--text-muted` swap under the fade on that
button, and its 9×2 disabled minus glyph is the 7 px.

**#1695 ran the baseline regen and it wrote neither file.** At the
then-shipped `threshold: 0.2` the comparator scored both as passing — the
pixels differ by a YIQ delta of 89–114 against a bar of 1408.6 — and
`--update` only rewrites a reference it fails. This is the third instance of
that mechanism, after `TextLink :: In Paragraph` in #1696.

Two things follow, and they are the reason this section exists:

- **A regen run is only as sensitive as the comparator it runs under.** Both
  files were regenerated by dispatching **Update Visual Baselines** with
  `VISUAL_THRESHOLD=0.05`, and Stepper needed `VISUAL_FLOOR_PIXELS=0` on top
  because 7 px sits under the noise margin. If a PR changes something the gate
  cannot see, the regen cannot see it either, and the reference silently rots.
- **Zero mismatched pixels means "nothing above the bar", not "nothing
  changed".** That is exactly what a green run on those two stories meant for
  three months.

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
| A small component on a large canvas | ~~`allowedMismatchedPixelRatio: 0.001` is measured against the whole canvas~~ — **fixed in [#1696](https://github.com/brikdesigns/brik-bds/issues/1696)**. The floor is now `allowedMismatchedPixels: 10`, absolute, so a Badge losing its pill radius fails. | the gate itself |
| A low-contrast change on any canvas | ~~`threshold: 0.2` ignores a pixel unless its YIQ delta clears 1408.6~~ — **fixed in [#1727](https://github.com/brikdesigns/brik-bds/issues/1727)**. The threshold is now 0.1 (bar 352.2), so grey-on-white changes are counted; see [Why the threshold is 0.1](#why-the-threshold-is-01-not-02). | the gate itself |

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

## What the gate is proven to catch (#662 AC 5)

The gate exists because of the portal #512/#553 rollback. That failure had
**two** halves, and only one of them is this gate's job — which is why AC 5
asks for a repro rather than a re-run of the original PR.

**Half 1 — invented token names.**
[portal#553](https://github.com/brikdesigns/brik-client-portal/pull/553)
introduced `--text-on-paper`, `--surface-paper-elevated`,
`--text-on-ink-muted` and nine more that were never in `dist/tokens.css`. In
BDS this is gated **statically**, before a pixel is rendered:

```bash
printf '.probe { color: var(--text-on-paper); background: var(--surface-paper-elevated); }' > /tmp/w2probe.css
node scripts/canonical-check.mjs /tmp/w2probe.css   # exit 1 — both rejected
```

Reconstructing that half against the visual gate proves nothing:
`canonical-check` fails the PR first, so the change never reaches a screenshot.

**Half 2 — a canonical name carrying a wrong value.** No static check can see
this one. The name is legitimate, the value is wrong, and the only evidence is
the render. Reconstructed against `tokens/theme-brand-brik.css` — the
definition that wins in Storybook's `brik` light theme — with the repro applied
and reverted inside the job, so nothing landed on the branch
([run 31185854393](https://github.com/brikdesigns/brik-bds/actions/runs/31185854393)):

| Case | Change | YIQ delta | Shipped gate (0.1 / floor 10) | Pre-#1727 gate (0.2) |
| --- | --- | --- | --- | --- |
| 1 — high contrast | `--text-primary` → `--color-system-red` | 8008.1 | **259 / 405 stories fail** | — |
| 2 — low contrast | `--text-secondary` one grayscale step, `#333333` → `#5a5a5a` | 768.6 | **142 / 403 stories fail** | **1 fails** |

Both tokens pass `canonical-check` (exit 0). Only the render disagrees.

**Case 2 is the load-bearing one.** Its delta of 768.6 sits inside the window
[#1727](https://github.com/brikdesigns/brik-bds/issues/1727) opened — over
0.1's bar of 352.2, under 0.2's 1408.6 — the same window that hid Badge Default
at 934 and Neutral at 486. It is the shape of the real W2 regression, and the
comparator could not see it at all until #1727 landed: at `threshold: 0.2` the
same change passes 141 of the 142 stories the shipped gate now fails.

The one story that still fails at 0.2 is not a counter-example.
`stories/ContrastCompliance.stories.tsx` computes each pairing's contrast ratio
from the live token value and renders it as text
([line 88](../../stories/ContrastCompliance.stories.tsx#L88),
[line 208](../../stories/ContrastCompliance.stories.tsx#L208)) — so the digits
change, not just the colour, and glyph-vs-white easily clears 1408.6. It caught
the change by printing it, not by seeing it.

Both counts exclude the two `InspectWidget` exports. They reported 372 px on a
tree verified byte-identical to `HEAD` in the same job, with `Matcher did not
succeed in time` — that story does not stabilise inside a job that runs the
suite six times, so its counts are not attributable to the repro. It is stable
in a normal single-run job.

## Measuring the gate — only invocation 1 is trustworthy (#1743)

Every calibration pass so far (#1696, #1727, #1729, #1732) used the same
instrument: a temporary CI step that re-runs the suite with
`VISUAL_FLOOR_PIXELS=0` so each story reports its exact mismatch count instead
of silently passing. Reuse it — but know its one failure mode.

**Running the suite repeatedly inside one container job destabilises it.**
Measured on an unmodified tree, six invocations back to back
([run 31199980487](https://github.com/brikdesigns/brik-bds/actions/runs/31199980487)):

| Invocation | Result |
| --- | --- |
| 1 | **0 of 405 failed** |
| 2 | 1 — `Icons :: Setup`, 16623 px |
| 3 | 0 |
| 4, 5, 6 | 1 — `DevFeedbackWidget :: Default`, **2644 px each time** |
| 7 (the job's real gate step) | same, 2644 px |

Two things to take from that shape:

- **It is not one bad story.** Three different stories have been caught this
  way — `Icons :: Setup` and `DevFeedbackWidget :: Default` above, and the two
  `InspectWidget` exports in #1729's job. #1743 was filed blaming InspectWidget
  and the repro falsified that: InspectWidget passed all six times.
- **It is not a timing flake.** Once `DevFeedbackWidget` starts failing it
  fails *identically* — 2644 px, four invocations running, no
  `Matcher did not succeed in time`. A race would vary. Something changes state
  and stays changed, and it survives into the next `vitest run`.

So, when measuring:

1. **Take clean-tree numbers from invocation 1 only.** A later invocation's
   count may be measuring the harness, not the tree.
2. **Corroborate any late-invocation failure** against a fresh single-run job
   before believing it. #1729 excluded InspectWidget on exactly this basis, and
   the repro vindicated that call.
3. **Order the runs so the ones you care about come first**, and treat the
   count of failing stories as the signal — not which story failed.

**The gate itself is unaffected**, which is why this is documented rather than
fixed: [`visual.yml`](../../.github/workflows/visual.yml) runs the suite once,
and invocation 1 is clean. The root cause is unidentified and tracked
separately — tracked in #1746.

## Opting a story out

Tag it `no-visual` (JS-driven animation that can never produce a stable
screenshot — e.g. lottie canvases) — see AnimatedIcon. Stories tagged
`interaction-test` (#1638) are also skipped: behavioral end states aren't
design surfaces.

### `DevFeedbackWidget :: Default` — a regen-proof async story

Excluded because it cannot be fixed by regenerating its baseline, which is the
tell worth recognising: **a story that fails at the same pixel count on every
run is not flaky, and regenerating it is a no-op.**

`--update` writes the first frame it captures. The gate instead polls for a
stable frame, gives up (`Matcher did not succeed in time`), and compares a
post-detection frame against that pre-detection baseline. The widget's
`setInterval(100ms)` under a `setTimeout(2000ms)` DevBar-detection window
(`DevFeedbackWidget.tsx:264-273`) is JS state, so the CSS freeze in
`vitest.visual.setup.ts` does not touch it. Regen kept reporting success while
the gate kept failing at **2644 px** — identical on runs 31619232876 (shard 8),
31620041578 and 31622254489.

It was first read as the #1785 mono flake because the story has two bare
`<code>` spans. It is not: the font-load assertion never fired on any of those
runs, so IBM Plex Mono resolved every time, and a font coin-flip would not
land on the same pixel count three times. Its sibling FABs in
`FeedbackWidget.stories.tsx` were already excluded for this same entrance
animation — this story was the one that got missed.

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

That coupling cuts both ways: **a change the gate cannot see, the regen cannot
record.** Two references rotted for three months that way (#1732 — see
[The 0.05 "false positives"](#the-005-false-positives-were-stale-baselines-1732)).
If a PR moves something below the comparator's bar — a fade, an opacity token,
any low-contrast value — dispatch this workflow with `VISUAL_THRESHOLD` lowered
(and `VISUAL_FLOOR_PIXELS=0` if the change is under 10 px) rather than trusting
an empty regen commit.

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
