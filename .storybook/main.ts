import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  staticDirs: ['./public'],
  stories: [
    '../stories/**/*.mdx',
    '../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../components/**/*.mdx',
    '../components/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../content-system/**/*.mdx',
    '../content-system/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-vitest',
    '@storybook/addon-mcp',
    // Emits preview-stats.json so Chromatic TurboSnap (onlyChanged) can trace
    // the Vite module graph and snapshot only stories affected by a diff. #771.
    '@chromatic-com/storybook',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => {
        // Filter out HTML attributes for cleaner docs
        if (prop.parent) {
          return !prop.parent.fileName.includes('node_modules');
        }
        return true;
      },
    },
  },
  tags: {
    wip: { excludeFromSidebar: true },
    // ADR-026 Arm A — play-only `InteractionTest…` stories are assertions, not
    // artifacts to browse: their result belongs in the vitest run (they already
    // execute there via @storybook/addon-vitest), not in the sidebar. Keyed on a
    // dedicated tag rather than the built-in `play-fn` — 71 story entries carry
    // `play-fn` and only 41 are interaction tests; the other 30 (Button/Default,
    // Modal/Two Column Form, …) are canonical stories that must stay visible.
    'interaction-test': { excludeFromSidebar: true },
  },
  features: {
    experimentalCodeExamples: true,
    componentsManifest: true,
  },
  docs: {
    defaultName: 'Overview',
  },
  async viteFinal(config) {
    const { mergeConfig } = await import('vite');
    // Pre-bundle every third-party runtime dep our components import. Storybook
    // lazy-loads story modules, so a dep first seen when navigating to a story
    // (e.g. lottie-react via AnimatedIcon) triggers a mid-session dep re-optimize
    // + full reload — which 404s any module the browser is mid-fetching and
    // surfaces as "Failed to fetch dynamically imported module". Declaring them
    // up front means the optimizer bundles them once at startup and never churns.
    return mergeConfig(config, {
      optimizeDeps: {
        include: [
          '@iconify/react',
          '@radix-ui/react-collapsible',
          '@radix-ui/react-popover',
          'lottie-react',
        ],
      },
    });
  },
};

export default config;
