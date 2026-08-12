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

// Every face the gate renders, bundled by Vite instead of fetched from
// fonts.googleapis.com at run time (#1785). The gate used to hard-depend on a
// live network request from inside the CI container for its own determinism —
// the one dependency whose failure is indistinguishable from a real regression,
// because a fallback render diffs exactly like a changed component.
//
// Safe to swap because @fontsource ships the SAME BYTES Google serves. Verified
// per family, latin/400, sha256 of the woff2 from fonts.gstatic.com against the
// file in the package: poppins 7d93459d, open-sans 0e44026a, newsreader
// e6606781, source-sans-3 0f73f35e, ibm-plex-sans 3b646991, hind aca5dec4,
// playfair-display 1fe9ad5d, ibm-plex-mono 08949f72 — all 8 identical. Same
// bytes means same rasterisation, which is why this lands with ZERO baseline
// churn.
//
// These 8 are pinned to EXACT versions in package.json, not carets, and that is
// load-bearing rather than caution. @fontsource republishes when Google updates
// a family, so a caret would let a routine `npm update` swap the font bytes and
// silently shift every text baseline in the suite — arriving as hundreds of
// "regressions" with no code change to explain them. Pinned, a font update is an
// explicit dependency bump that a reviewer can pair with a baseline regen.
import '@fontsource/poppins/300.css';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '@fontsource/poppins/900.css';
import '@fontsource/open-sans/300.css';
import '@fontsource/open-sans/400.css';
import '@fontsource/open-sans/600.css';
import '@fontsource/open-sans/700.css';
import '@fontsource/newsreader/300.css';
import '@fontsource/newsreader/400.css';
import '@fontsource/newsreader/600.css';
import '@fontsource/newsreader/700.css';
import '@fontsource/source-sans-3/300.css';
import '@fontsource/source-sans-3/400.css';
import '@fontsource/source-sans-3/600.css';
import '@fontsource/source-sans-3/700.css';
import '@fontsource/ibm-plex-sans/300.css';
import '@fontsource/ibm-plex-sans/400.css';
import '@fontsource/ibm-plex-sans/600.css';
import '@fontsource/ibm-plex-sans/700.css';
import '@fontsource/hind/300.css';
import '@fontsource/hind/400.css';
import '@fontsource/hind/500.css';
import '@fontsource/hind/600.css';
import '@fontsource/hind/700.css';
import '@fontsource/playfair-display/400.css';
import '@fontsource/playfair-display/600.css';
import '@fontsource/playfair-display/700.css';
import '@fontsource/playfair-display/900.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/600.css';

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
 * Every family × weight imported above. Warmed eagerly in beforeAll: relying on
 * `document.fonts.ready` after render is a race (the swap can land between the
 * stability check and the reference compare — caught as a real flake on
 * foundation-navigation-archetypes). Keep in sync with the import block and
 * with preview-head.html. The Geist jsdelivr links are NOT mirrored: they 404
 * (verified 2026-08-02), so Geist deterministically never loads in Storybook
 * either.
 *
 * Droid Sans is deliberately absent, and its removal is a fix rather than a
 * regression in coverage. It has no @fontsource package, and it is retired from
 * Google Fonts — `fonts.google.com/metadata/fonts/Droid Sans` answers 404 and
 * the family is absent from the catalog list (verified 2026-08-12), so there is
 * no published license record to vendor a binary against. The legacy css2 route
 * still serves v19, which is exactly the problem: the gate's own assertion
 * below made a retired font a hard requirement, so the day Google stops serving
 * it every story in the suite fails at once.
 *
 * Nothing in the gate renders it. `spacious` is the only theme that names it
 * (design-tokens/themes/spacious/overrides.json heading + display), and that
 * theme has zero baselines (`ls tests/visual/__screenshots__ | grep -c
 * spacious` → 0). The token still references a retired family — tracked
 * separately, not fixed here.
 */
const FONT_WARMUP: Array<[family: string, weights: number[]]> = [
  ['Poppins', [300, 400, 600, 700, 900]],
  ['Open Sans', [300, 400, 600, 700]],
  ['Newsreader', [300, 400, 600, 700]],
  ['Source Sans 3', [300, 400, 600, 700]],
  ['IBM Plex Sans', [300, 400, 600, 700]],
  ['Hind', [300, 400, 500, 600, 700]],
  ['Playfair Display', [400, 600, 700, 900]],
  // Mono. Load-bearing for determinism, not just for looks — see the pin in
  // beforeAll. A webfont is the ONLY mono the gate can await (#1785).
  ['IBM Plex Mono', [400, 600]],
];

beforeAll(async () => {
  // The vitest browser runner serves its own tester page — Storybook's
  // .storybook/preview-head.html (which loads the brand webfonts) never runs
  // here. The import block at the top of this file replaces it, so the faces
  // arrive over the Vite dev server rather than a Google Fonts request.
  //
  // What that removes: this used to be ONE network fetch from inside the CI
  // container that every face depended on, and it failed silently. `onerror`
  // resolved the same promise as `onload`, and `document.fonts.load()` resolves
  // with an EMPTY array for a family it cannot find rather than rejecting. So a
  // failed or slow fetch produced a complete fallback render with no error
  // anywhere — the story just quietly used different fonts, at different advance
  // widths, and failed the pixel compare as a "regression". A retry-with-verify
  // made that loud, but the dependency was still there; bundling deletes it.
  //
  // The assertion below is KEPT even though the faces are now local. It is cheap,
  // and it still catches the case that actually matters: an import silently
  // dropped from the block above, or a @fontsource layout change that moves the
  // CSS files. Local does not mean guaranteed.

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
      `Visual gate: ${missing.length} bundled font face(s) never registered: ` +
        `${missing.join(', ')}. Every screenshot in this run would compare a ` +
        'fallback render against a real-typography baseline and fail as a bogus ' +
        'regression (#1785). These faces are bundled by Vite from @fontsource, not ' +
        'fetched — so this is no longer a network fault. Check that the family and ' +
        'weight have a matching import at the top of this file, and that the ' +
        '@fontsource package still ships per-weight CSS at `<pkg>/<weight>.css`.',
    );
  }

  // Freeze CSS motion so toMatchScreenshot's stable-screenshot detection
  // isn't chasing moving pixels. animation-play-state (not animation: none)
  // keeps animated elements at their current frame instead of unmounting
  // keyframe effects; transition-duration 0 makes interaction end states
  // land instantly; caret-color hides the blinking text cursor in inputs.
  //
  // The mono rule below is NOT what makes code spans deterministic, and it is
  // important not to read it that way — believing it did cost #1785 three fix
  // attempts. `storybook-overrides.css` styles inline code with
  //
  //     code:not([class*="language-"]):not(pre code) { font-family: … !important }
  //
  // which is specificity (0,1,3) against this rule's bare `code` at (0,0,1).
  // Both carry !important, so the stylesheet wins and this declaration has
  // never applied to an inline <code> in the gate's entire history. Measured,
  // not reasoned: a probe reading getComputedStyle on the InspectWidget span
  // reported `declared="ui-monospace, SFMono-Regular, …"` — the override's
  // stack, with no IBM Plex Mono in it — while this rule was present.
  //
  // That is why the real fix is in storybook-overrides.css, where every mono
  // stack now leads with "IBM Plex Mono" and falls back to "Liberation Mono"
  // (installed in the image) before the generic alias. Storybook and the gate
  // then agree on one face by construction instead of racing.
  //
  // This rule is kept only for `kbd, samp, pre, tt`, which the overrides do not
  // cover. `document.fonts.ready` below cannot substitute for any of it — it
  // settles @font-face webfonts, and says nothing about which family the
  // cascade picked.
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
  // ~30 faces still decode here, now off the Vite dev server rather than the
  // network. Kept generous rather than retuned: the timeout was never the
  // constraint, and lowering it is a separate measurement.
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
