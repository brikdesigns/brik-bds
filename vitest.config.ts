import { defineConfig } from 'vitest/config';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        plugins: [
          storybookTest({ configDir: path.join(dirname, '.storybook') }),
        ],
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
