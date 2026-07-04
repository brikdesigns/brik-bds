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
