import React, { useLayoutEffect, useState } from 'react';
import type { Preview, Decorator } from '@storybook/react-vite';
import { DocsContainer as DefaultDocsContainer } from '@storybook/addon-docs/blocks';
import { create } from 'storybook/theming';
import type { ThemeNumber } from '../tokens';
import { storybookThemes } from '../tokens/storybook-themes';

// Iconify — register Phosphor icon collection for offline/SSR use
import { addCollection } from '@iconify/react';
import phData from '@iconify-json/ph/icons.json';
addCollection(phData as Parameters<typeof addCollection>[0]);

// Import token CSS in cascade order:
// 1. Font declarations (@font-face from Webflow export)
// 2. Figma tokens (SD output — primitives + semantic defaults)
// 3. Overrides (theme palettes, theme blocks, gap-fill tokens)
// 4. Storybook overrides (.theme-brik, Base mode spacing, UI fixes)
import '../tokens/fonts.css';
import '../tokens/figma-tokens.css';
import '../tokens/overrides.css';
import '../css/animations.css';
import '../css/premium-effects.css';
import './storybook-overrides.css';

/**
 * Build Storybook theme objects for the preview iframe.
 * This makes emotion-styled internal components (Canvas preview,
 * Source blocks, ArgTypes, ActionBar) respect our dark/light themes.
 */
const previewThemes: Record<string, ReturnType<typeof create>> = {};
for (const [themeNum, cfg] of Object.entries(storybookThemes)) {
  previewThemes[themeNum] = create({
    base: cfg.base,
    appContentBg: 'transparent',
    appPreviewBg: 'transparent',
    appBorderColor: cfg.appBorderColor,
    barBg: cfg.barBg,
    barTextColor: cfg.barTextColor,
    barSelectedColor: cfg.barSelectedColor,
    barHoverColor: cfg.barHoverColor,
    textColor: cfg.textColor,
    textMutedColor: cfg.textMutedColor,
    colorPrimary: cfg.colorPrimary,
    colorSecondary: cfg.colorSecondary,
    inputBg: cfg.inputBg,
    inputBorder: cfg.inputBorder,
    inputTextColor: cfg.inputTextColor,
    fontBase: cfg.fontBase,
    fontCode: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
    appBorderRadius: 4,
  });
}

/**
 * Custom DocsContainer — dynamically applies the correct Storybook theme
 * to the preview iframe's emotion-styled components (Canvas preview,
 * Source blocks, ArgTypes, ActionBar) based on the selected BDS theme.
 */
const ThemedDocsContainer: typeof DefaultDocsContainer = (props) => {
  const [themeNum, setThemeNum] = useState('brik');
  const channel = props.context.channel;

  useLayoutEffect(() => {
    const handler = ({ globals }: { globals: Record<string, unknown> }) => {
      const num = globals?.themeNumber as string;
      if (num) setThemeNum(num);
    };
    channel.on('globalsUpdated', handler);
    return () => channel.off('globalsUpdated', handler);
  }, [channel]);

  const theme = previewThemes[themeNum] || previewThemes['brik'];
  return React.createElement(DefaultDocsContainer, { ...props, theme });
};

/**
 * Theme decorator — applies theme classes to the preview <body>
 * for immersive theming. The body carries .body.theme-X so theme
 * CSS variables cascade to the entire page.
 *
 * - Docs mode: stories render directly on the themed page (no wrapper)
 * - Canvas mode: a centering wrapper provides comfortable padding
 */
const withTheme: Decorator = (Story, context) => {
  const themeNumber = (context.globals.themeNumber || 'brik') as ThemeNumber;
  const baseFont = (context.globals.baseFont || '16') as string;
  const animations = (context.globals.animations || 'on') as string;

  // Apply theme classes + toolbar globals to the preview iframe <body>.
  // Manager theming is handled primarily by the channel API in manager.tsx
  // (listens to globalsUpdated). The parent bridge below is a fallback.
  // useLayoutEffect runs synchronously before paint — no flash of old theme.
  useLayoutEffect(() => {
    const body = document.body;
    // Strip any previous theme class
    body.className = body.className.replace(/\btheme-\S+/g, '');
    // .body.theme-X matches our CSS selectors in themes.css
    body.classList.add('body', `theme-${themeNumber}`);

    // Set dark mode data attribute for CSS selectors that need light/dark branching
    const isDark = storybookThemes[themeNumber]?.base === 'dark';
    body.setAttribute('data-bds-dark', String(isDark));

    // Base font size — scales all rem-based tokens
    body.style.fontSize = `${baseFont}px`;

    // Animations toggle
    if (animations === 'off') {
      body.style.setProperty('--bds-duration-multiplier', '0');
      body.classList.add('bds-no-animations');
    } else {
      body.style.removeProperty('--bds-duration-multiplier');
      body.classList.remove('bds-no-animations');
    }

    // Note: Manager theming is handled by the channel API in manager.tsx
    // (globalsUpdated event). No DOM bridge needed.
  }, [themeNumber, baseFont, animations]);

  // Docs mode: render story directly on the themed page — no wrapper,
  // no extra padding layers. The body bg IS the story bg.
  if (context.viewMode === 'docs') {
    return <Story />;
  }

  // Canvas mode: center the story with padding for comfortable viewing.
  // No .body class here — the <body> element handles theme variables.
  return (
    <div
      style={{
        padding: 'var(--padding-md)',
        minHeight: '100vh',
        width: '100%',
        boxSizing: 'border-box' as const,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Story />
    </div>
  );
};

const preview: Preview = {
  globalTypes: {
    themeNumber: {
      name: 'Themes',
      description: 'BDS theme (bundled color, typography, spacing)',
      defaultValue: 'brik',
      toolbar: {
        icon: 'paintbrush',
        items: [
          { value: 'brik', title: 'Brik Brand (Poppins)' },
          { value: '1', title: '1: Default (Open Sans)' },
          { value: '2', title: '2: Dark (Geist)' },
          { value: '3', title: '3: Blue (Source Sans 3)' },
          { value: '4', title: '4: Gold (Hind / Lato)' },
          { value: '5', title: '5: Peach (Open Sans / Newsreader)' },
          { value: '6', title: '6: Minimal (Source Sans 3)' },
          { value: '7', title: '7: Warm (Hind / Lato)' },
          { value: '8', title: '8: Vibrant (Hind / Playfair)' },
        ],
        dynamicTitle: true,
      },
    },
    baseFont: {
      name: 'Base Font',
      description: 'Root font size (scales all rem-based tokens)',
      defaultValue: '16',
      toolbar: {
        icon: 'grow',
        items: [
          { value: '14', title: '14px' },
          { value: '16', title: '16px' },
          { value: '18', title: '18px' },
          { value: '20', title: '20px' },
        ],
        dynamicTitle: true,
      },
    },
    animations: {
      name: 'Animations',
      description: 'Toggle CSS animations and transitions',
      defaultValue: 'on',
      toolbar: {
        icon: 'lightning',
        items: [
          { value: 'on', title: 'On' },
          { value: 'off', title: 'Off' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [withTheme],
  parameters: {
    options: {
      storySort: {
        order: [
          'Overview',
          ['Welcome', 'ThemeSwitcher'],
          'Foundations',
          [
            'Design Tokens',
            ['Overview', 'Color', 'Typography', 'Spacing', 'Border Radius', 'Border Width', 'Shadow', 'Size'],
            'Assets',
            '*',
          ],
          'Components',
          [
            'Action',
            'Form',
            'Input',
            'Control',
            'Indicator',
            'Feedback',
            'Structure',
            '*',
          ],
          'Navigation',
          ['breadcrumb', 'menu', 'page-header', 'sidebar-navigation', 'tab-bar', '*'],
          'Displays',
          [
            'Card',
            'Accordion',
            'Table',
            'Overlay',
            '*',
          ],
          '*',
        ],
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'fullscreen',
    backgrounds: {
      disabled: true,
    },
    docs: {
      toc: true,
      container: ThemedDocsContainer,
      source: {
        type: 'dynamic',
        excludeDecorators: true,
        format: false,
      },
    },
  },
};

export default preview;
