import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <span style={{ fontWeight: 600, letterSpacing: '-0.01em' }}>
        Brik Design System
      </span>
    ),
    url: '/',
  },
  links: [
    { text: 'Docs', url: '/docs' },
    { text: 'Storybook', url: 'https://storybook.brikdesigns.com', external: true },
    { text: 'GitHub', url: 'https://github.com/brikdesigns/brik-bds', external: true },
  ],
};
