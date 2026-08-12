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
  // Mono. Load-bearing for determinism, not just for looks — see the pin in
  // beforeAll. A webfont is the ONLY mono the gate can await (#1785).
  ['IBM Plex Mono', [400, 600]],
];

beforeAll(async () => {
  // The vitest browser runner serves its own tester page — Storybook's
  // .storybook/preview-head.html (which loads the brand webfonts) never runs
  // here. Mirror its font stylesheet so screenshots capture real typography.
  const FONT_CSS_URL =
    'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700;900&family=Open+Sans:wght@300;400;600;700&family=Newsreader:wght@300;400;600;700&family=Source+Sans+3:wght@300;400;600;700&family=IBM+Plex+Sans:wght@300;400;600;700&family=Hind:wght@300;400;500;600;700&family=Playfair+Display:wght@400;600;700;900&family=Droid+Sans:wght@400;700&family=IBM+Plex+Mono:wght@400;600&display=swap';

  // Every face the gate renders comes off this ONE network request, and it used
  // to fail silently: `link.onerror` resolved the same promise as `onload`, and
  // `document.fonts.load()` resolves with an EMPTY array for a family it cannot
  // find rather than rejecting. So a failed or slow fetch produced a complete
  // fallback render with no error anywhere — the story just quietly used
  // different fonts, at different advance widths, and failed the pixel compare
  // as a "regression".
  //
  // That is the shape of the residual #1785 flake: tools-dev-feedback-widget-default
  // failed at EXACTLY 2644 px against two different baselines (runs 31615511652
  // and 31620041578). Identical diff against a changed reference means the story
  // has two rendering states and alternates between them — pixel diffing is
  // symmetric, so whichever state the baseline holds, the other scores the same.
  // Two states = fonts loaded vs fonts not loaded.
  //
  // So retry the fetch, then VERIFY. A font the gate silently failed to load is
  // the one failure mode that cannot be told apart from a real regression by
  // looking at the diff, which makes it the most expensive kind to leave silent.
  // Same URL each attempt, no cache-buster: a fetch that failed left nothing
  // cached to bust. (css2 does tolerate unknown query keys — verified 200 with a
  // `&cb=1` — so a buster could be added if a cached 4xx ever turns up.)
  const loadFontCss = () =>
    new Promise<boolean>((resolve) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = FONT_CSS_URL;
      link.onload = () => resolve(true);
      link.onerror = () => resolve(false);
      document.head.appendChild(link);
    });

  let attempt = 0;
  let cssOk = false;
  while (attempt < 3 && !cssOk) {
    attempt += 1;
    cssOk = await loadFontCss();
    if (!cssOk && attempt < 3) {
      await new Promise((r) => setTimeout(r, 500 * attempt));
    }
  }

  // Force every face into the font cache BEFORE any story renders, so no
  // screenshot can catch a mid-swap frame.
  await Promise.all(
    FONT_WARMUP.flatMap(([family, weights]) =>
      weights.map((weight) =>
        document.fonts.load(`${weight} 16px "${family}"`),
      ),
    ),
  );

  // Assert rather than assume. `document.fonts.check` is true only once the face
  // is actually available, so this is the difference between "we asked for the
  // fonts" and "the fonts are here". Failing loudly here costs one obvious error;
  // failing silently costs a fake regression on an arbitrary story.
  const missing = FONT_WARMUP.flatMap(([family, weights]) =>
    weights
      .filter((weight) => !document.fonts.check(`${weight} 16px "${family}"`))
      .map((weight) => `${family} ${weight}`),
  );
  if (missing.length > 0) {
    throw new Error(
      `Visual gate: ${missing.length} font face(s) never loaded after ${attempt} ` +
        `stylesheet attempt(s) (css ${cssOk ? 'loaded' : 'FAILED'}): ${missing.join(', ')}. ` +
        'Every screenshot in this run would compare a fallback render against a ' +
        'real-typography baseline and fail as a bogus regression (#1785). This is a ' +
        'network dependency on fonts.googleapis.com from inside the CI container — ' +
        'the durable fix is to vendor the woff2 files into the repo and drop the fetch.',
    );
  }

  // Freeze CSS motion so toMatchScreenshot's stable-screenshot detection
  // isn't chasing moving pixels. animation-play-state (not animation: none)
  // keeps animated elements at their current frame instead of unmounting
  // keyframe effects; transition-duration 0 makes interaction end states
  // land instantly; caret-color hides the blinking text cursor in inputs.
  //
  // The mono pin is determinism of the same kind, for the same reason. A bare
  // <code> (e.g. InspectWidget.stories.tsx:44) sets no font-family, so it
  // inherits the generic `monospace`, and Chromium resolves that through
  // fontconfig. The gate's mono stack is all macOS/Windows faces
  // (ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas), so every one
  // misses in the Linux container and the alias is free to land on any of the
  // three installed families — FreeMono, Liberation Mono, WenQuanYi Zen Hei
  // Mono (`fc-list | grep -i mono`, printed by the visual job). Different
  // advance widths, so the span's width changes and shifts the text after it:
  // 372 px of "regression" that is really a font-resolution coin flip (#1785).
  //
  // `document.fonts.ready` below cannot cover this — it settles @font-face
  // webfonts, and there is no mono @font-face to settle.
  //
  // IBM Plex Mono, and the reason it is a WEBFONT is the whole fix. Naming a
  // system face here (the first attempt pinned Liberation Mono) does not work:
  // `document.fonts.load` above can only warm and await an @font-face, so a
  // system font is the one kind of font this gate cannot wait for. That left
  // the declaration racing the fontconfig lookup, and it lost intermittently —
  // the Liberation Mono pin was present in the tree the baselines were
  // regenerated from (ad37e2fd), yet tools-dev-feedback-widget-default matched
  // its PRE-pin baseline during that regen and then failed the gate at 2644 px
  // (run 31615511652). Same declaration, two different faces.
  //
  // IBM Plex Mono is warmed in FONT_WARMUP above like every other brand face,
  // so by the time any story renders it is in the font cache and cannot be
  // resolved to anything else. It also pairs with IBM Plex Sans, which the
  // brand already loads, and it replaces a mono that never actually worked:
  // preview-head.html's Geist Mono link is a jsdelivr 404 (see FONT_WARMUP).
  //
  // Liberation Mono stays as the next fallback — installed in the pinned image,
  // so even a failed webfont fetch lands on something deterministic rather than
  // back on the fontconfig coin flip.
  const style = document.createElement('style');
  style.id = 'bds-visual-freeze';
  style.textContent = `
    *, *::before, *::after {
      animation-play-state: paused !important;
      transition-duration: 0s !important;
      caret-color: transparent !important;
    }
    code, kbd, samp, pre, tt {
      font-family: 'IBM Plex Mono', 'Liberation Mono', ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace !important;
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
