import { defineConfig } from 'vitest/config';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Deps the storybook browser tests pull in transitively through stories but
// that the @storybook/addon-vitest plugin does NOT pre-bundle (it only
// optimizes its own runtime). Listing them in optimizeDeps.include makes the
// browser server's first optimize pass complete; otherwise Vite discovers them
// lazily as stories import mid-run, fires "optimized dependencies changed.
// reloading", and the page reload destroys the running suite → "Vitest failed
// to find the current suite". Warm local caches already hold these, so the
// race only bites cold CI runners — which is why #891's gate had to exclude
// this project until this fix landed. See #571.
// @radix-ui/* is derived from package.json so adding a new primitive to a
// component auto-extends the list — the common BDS change that would otherwise
// silently reintroduce the flake.
const pkg = JSON.parse(
  fs.readFileSync(path.join(dirname, 'package.json'), 'utf8'),
);
// Visual gate (ADR-026 Arm B, #1637). VISUAL_GATE=1 arms a toMatchScreenshot
// afterEach on the `storybook` project (.storybook/vitest.visual.setup.ts).
// CI-only: the `visual` job in test.yml sets it inside a pinned Playwright
// container; baselines are platform-suffixed, so local (darwin) runs can never
// match the committed linux references — leave it unset on dev machines.
const visualGate = process.env.VISUAL_GATE === '1';

const storybookOptimizeInclude = [
  'react',
  'react-dom',
  'react-dom/client',
  'react/jsx-runtime',
  'react/jsx-dev-runtime',
  '@iconify/react',
  'lottie-react',
  'storybook/test',
  'storybook/theming',
  '@storybook/addon-docs',
  '@storybook/addon-docs/blocks',
  ...Object.keys(pkg.dependencies ?? {}).filter((d) =>
    d.startsWith('@radix-ui/'),
  ),
];

export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        plugins: [
          storybookTest({ configDir: path.join(dirname, '.storybook') }),
        ],
        // See storybookOptimizeInclude above — pre-bundles story deps so the
        // cold-cache optimizer reload (#571) can't destroy the suite mid-run.
        optimizeDeps: {
          include: storybookOptimizeInclude,
        },
        test: {
          name: 'storybook',
          // Single string, not an array — the addon-vitest plugin only
          // preserves a pre-existing string setupFiles when it prepends its
          // own internal setup files; an array would be silently dropped.
          ...(visualGate && {
            setupFiles: './.storybook/vitest.visual.setup.ts',
          }),
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
            ...(visualGate && {
              expect: {
                toMatchScreenshot: {
                  // Stable-screenshot detection captures until two consecutive
                  // frames match. The 5s default is too tight for the heaviest
                  // galleries (Icon "Bundled Set" renders ~400 SVGs; each
                  // capture+compare is slow enough that two identical frames
                  // don't land in 5s), and cold CI containers are slower than
                  // a warm dev machine. 20s covers the tail without masking a
                  // genuinely-animating story — that still fails, just later.
                  timeout: 20_000,
                  comparatorName: 'pixelmatch' as const,
                  comparatorOptions: {
                    // Per-pixel YIQ color distance below which a pixel counts
                    // as matching. THIS is what absorbs antialiasing jitter,
                    // and it does the whole job on its own — measured below.
                    threshold: 0.2,
                    // Hard failure floor, in absolute pixels (#1696). NOT a
                    // ratio: the previous allowedMismatchedPixelRatio: 0.001
                    // was measured against the whole 960×720 canvas, so it
                    // allowed 691 px on every story regardless of how small
                    // the component under test was. Flipping .bds-badge from
                    // a pill to an 8px radius moved 38–155 px and passed
                    // silently; so did a real one, TextLink "In Paragraph"
                    // gaining a persistent underline in #1712 (241 px, never
                    // baselined).
                    //
                    // 10 is a noise margin, not a tolerance. With threshold
                    // 0.2 applied per pixel, the measured mismatch count in
                    // the pinned container is ZERO on 404 of 405 stories —
                    // identical across two runner machines and four suite
                    // invocations (run 31119311151). The smallest real
                    // regression measured was 12 px, so 10 catches every
                    // change we have evidence for while still tolerating a
                    // stray pixel or two from a future font/GPU shift.
                    allowedMismatchedPixels: 10,
                  },
                  // Baselines live in one committed tree (not scattered next
                  // to each *.stories.tsx, which is what the per-test-file
                  // default would do across 144 story files).
                  resolveScreenshotPath: (data) =>
                    `${data.root}/tests/visual/__screenshots__/${data.arg}-${data.browserName}-${data.platform}${data.ext}`,
                  // Diffs + actuals are CI artifacts, never committed.
                  resolveDiffPath: (data) =>
                    `${data.root}/tests/visual/__diffs__/${data.arg}-${data.browserName}-${data.platform}${data.ext}`,
                },
              },
            }),
          },
        },
      },
      {
        extends: true,
        test: {
          name: 'content-system',
          environment: 'node',
          include: ['content-system/**/*.test.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'components',
          environment: 'node',
          include: ['components/**/*.test.ts'],
          // Browser-only widget tests run under the `widgets` project below.
          exclude: ['**/*.browser.test.ts'],
          deps: {
            inline: ['react', 'react-dom', '@testing-library/react'],
          },
        },
      },
      {
        // Vanilla DevBar widgets (inspect/feedback) are browser-only IIFEs that
        // attach to `window`; exercise them in a real DOM, not node/jsdom.
        extends: true,
        test: {
          name: 'widgets',
          include: ['components/ui/BrikDevBar/widgets/**/*.browser.test.ts'],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
      {
        extends: true,
        test: {
          name: 'scripts',
          environment: 'node',
          include: ['scripts/**/*.test.{ts,mjs,js}'],
        },
      },
    ],
  },
});
