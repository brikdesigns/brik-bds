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
};

export default config;
