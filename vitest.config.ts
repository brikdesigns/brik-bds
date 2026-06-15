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
