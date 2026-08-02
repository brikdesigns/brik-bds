/**
 * Visual-regression hook for the `storybook` vitest project (ADR-026 Arm B).
 *
 * Loaded ONLY when VISUAL_GATE=1 (see vitest.config.ts) — the CI `visual` job
 * sets it inside a pinned Playwright container. Local runs never set it:
 * baselines are named per browser + platform, so a Mac-generated baseline is
 * a guaranteed false positive against the `linux` references in git.
 *
 * How it works: @storybook/addon-vitest already renders every story as a test
 * in real Chromium (`composedStory.run()` leaves the story mounted). This
 * afterEach screenshots the mounted result and compares it against the
 * committed reference in tests/visual/__screenshots__/.
 *
 * Baseline updates happen in CI via the `update-visual-baselines` workflow
 * (vitest --update in the same container), never from a dev machine.
 */
import { afterEach, beforeAll, expect } from 'vitest';
import { page } from '@vitest/browser/context';

/**
 * Story tags that opt a story out of the visual gate:
 * - `no-visual` — JS-driven animation (e.g. lottie canvases) that never
 *   produces a stable screenshot; the pause CSS below can't freeze it.
 * - `interaction-test` — ADR-026 Decision 2's tag for `InteractionTest…`
 *   stories (wired by #1638); their value is behavioral, and their end
 *   states (open overlays mid-flow) aren't design surfaces.
 */
const SKIP_TAGS = ['no-visual', 'interaction-test'];

/**
 * Every family × weight the preview-head Google Fonts request serves. Warmed
 * eagerly in beforeAll: relying on `document.fonts.ready` after render is a
 * race (the swap can land between the stability check and the reference
 * compare — caught as a real flake on foundation-navigation-archetypes).
 * Keep in sync with preview-head.html. The Geist jsdelivr links are NOT
 * mirrored: they 404 (verified 2026-08-02), so Geist deterministically never
 * loads in Storybook either.
 */
const FONT_WARMUP: Array<[family: string, weights: number[]]> = [
  ['Poppins', [300, 400, 600, 700, 900]],
  ['Open Sans', [300, 400, 600, 700]],
  ['Newsreader', [300, 400, 600, 700]],
  ['Source Sans 3', [300, 400, 600, 700]],
  ['IBM Plex Sans', [300, 400, 600, 700]],
  ['Hind', [300, 400, 500, 600, 700]],
  ['Playfair Display', [400, 600, 700, 900]],
  ['Droid Sans', [400, 700]],
];

beforeAll(async () => {
  // The vitest browser runner serves its own tester page — Storybook's
  // .storybook/preview-head.html (which loads the brand webfonts) never runs
  // here. Mirror its font stylesheet so screenshots capture real typography.
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href =
    'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700;900&family=Open+Sans:wght@300;400;600;700&family=Newsreader:wght@300;400;600;700&family=Source+Sans+3:wght@300;400;600;700&family=IBM+Plex+Sans:wght@300;400;600;700&family=Hind:wght@300;400;500;600;700&family=Playfair+Display:wght@400;600;700;900&family=Droid+Sans:wght@400;700&display=swap';
  const cssLoaded = new Promise((resolve) => {
    link.onload = resolve;
    link.onerror = resolve;
  });
  document.head.appendChild(link);
  await cssLoaded;

  // Force every face into the font cache BEFORE any story renders, so no
  // screenshot can catch a mid-swap frame.
  await Promise.all(
    FONT_WARMUP.flatMap(([family, weights]) =>
      weights.map((weight) =>
        document.fonts.load(`${weight} 16px "${family}"`),
      ),
    ),
  );

  // Freeze CSS motion so toMatchScreenshot's stable-screenshot detection
  // isn't chasing moving pixels. animation-play-state (not animation: none)
  // keeps animated elements at their current frame instead of unmounting
  // keyframe effects; transition-duration 0 makes interaction end states
  // land instantly; caret-color hides the blinking text cursor in inputs.
  const style = document.createElement('style');
  style.id = 'bds-visual-freeze';
  style.textContent = `
    *, *::before, *::after {
      animation-play-state: paused !important;
      transition-duration: 0s !important;
      caret-color: transparent !important;
    }
  `;
  document.head.appendChild(style);
  // Cold CI containers fetch ~30 font files here; don't trip the 10s default.
}, 120_000);

afterEach(async (ctx) => {
  // Only story tests carry storyId (set by @storybook/addon-vitest).
  const storyId = (ctx.task.meta as { storyId?: string }).storyId;
  if (!storyId) return;

  // A behavioral failure is already failing this test — a visual diff on top
  // of a broken render is noise.
  if (ctx.task.result?.errors?.length) return;

  // testStory() exposes the composed story on the test context.
  const story = (ctx as { story?: { tags?: string[] } }).story;
  if (story?.tags?.some((tag) => SKIP_TAGS.includes(tag))) return;

  // Webfonts load lazily per font-face use; don't screenshot mid-swap.
  await document.fonts.ready;

  await expect
    .element(page.elementLocator(document.body))
    .toMatchScreenshot(storyId);
});
