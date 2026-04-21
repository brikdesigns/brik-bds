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

// Feedback widget — floating FAB in preview iframe
import { FeedbackWidget } from './FeedbackWidget';

// Import token CSS in cascade order:
// 1. Figma tokens (SD output — primitives + semantic defaults)
// 2. Gap-fills (manual tokens not yet in Figma)
// 3. Brik Brand theme (light + dark)
// 4. Font Audit tool (client-sim theme for font-family validation)
// 5. BDS shared keyframe library (bds-spin, bds-pulse, bds-pop, etc.)
// 6. Storybook overrides (Base mode spacing, UI fixes)
import '../tokens/figma-tokens.css';
import '../tokens/gap-fills.css';
import '../tokens/theme-brand-brik.css';
import '../tokens/font-audit.css';
import '../tokens/animations.css';
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

  // Apply theme class to body — pure MDX pages (Color, Typography, etc.)
  // don't embed stories, so the withTheme decorator never fires for them.
  // Without this, CSS vars stay stale when the user switches themes.
  useLayoutEffect(() => {
    const body = document.body;
    const html = document.documentElement;
    body.className = body.className.replace(/\btheme-\S+/g, '');
    if (themeNum === 'brik-dark') {
      body.classList.add('body', 'theme-brand-brik');
      html.setAttribute('data-theme', 'dark');
    } else if (themeNum === 'client-sim') {
      body.classList.add('body', 'theme-brand-brik', 'theme-client-sim');
      html.setAttribute('data-theme', 'light');
    } else if (themeNum === 'brik') {
      body.classList.add('body', 'theme-brand-brik');
      html.setAttribute('data-theme', 'light');
    } else {
      body.classList.add('body', `theme-${themeNum}`);
      html.removeAttribute('data-theme');
    }
    const isDark = storybookThemes[themeNum as ThemeNumber]?.base === 'dark';
    body.setAttribute('data-bds-dark', String(isDark));

    // Force dark overrides on emotion-styled elements (same as withTheme decorator)
    let darkStyle = document.getElementById('bds-theme-overrides') as HTMLStyleElement;
    if (!darkStyle) {
      darkStyle = document.createElement('style');
      darkStyle.id = 'bds-theme-overrides';
      document.head.appendChild(darkStyle);
    }
    if (isDark) {
      darkStyle.textContent = `
        .sbdocs-preview { border-color: var(--border-secondary) !important; background: var(--surface-primary) !important; }
        .docblock-argstable { border-color: var(--border-secondary) !important; }
        .docblock-argstable th, .docblock-argstable td { border-color: var(--border-muted) !important; color: var(--text-primary) !important; }
        .docblock-argstable th { background: var(--surface-secondary) !important; }
        [class*="ActionBar"] button { color: var(--text-muted) !important; }
      `;
    } else {
      darkStyle.textContent = '';
    }
  }, [themeNum]);

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
    const html = document.documentElement;
    // Strip any previous theme classes
    body.className = body.className.replace(/\btheme-\S+/g, '');

    // Apply theme classes:
    // - brik + brik-dark: .theme-brand-brik + data-theme attr (light/dark)
    // - client-sim (Font Audit): .theme-brand-brik.theme-client-sim + data-theme="light"
    // - all others: .theme-X (no data-theme attribute)
    if (themeNumber === 'brik-dark') {
      body.classList.add('body', 'theme-brand-brik');
      html.setAttribute('data-theme', 'dark');
    } else if (themeNumber === 'client-sim') {
      body.classList.add('body', 'theme-brand-brik', 'theme-client-sim');
      html.setAttribute('data-theme', 'light');
    } else if (themeNumber === 'brik') {
      body.classList.add('body', 'theme-brand-brik');
      html.setAttribute('data-theme', 'light');
    } else {
      body.classList.add('body', `theme-${themeNumber}`);
      html.removeAttribute('data-theme');
    }

    // Set dark mode data attribute for CSS selectors that need light/dark branching
    const isDark = storybookThemes[themeNumber]?.base === 'dark';
    body.setAttribute('data-bds-dark', String(isDark));

    // Force dark mode overrides on emotion-styled Storybook elements.
    // Emotion injects CSS AFTER our stylesheets, winning specificity battles.
    // This <style> tag at the end of <head> runs after emotion, guaranteed to win.
    let darkStyle = document.getElementById('bds-theme-overrides') as HTMLStyleElement;
    if (!darkStyle) {
      darkStyle = document.createElement('style');
      darkStyle.id = 'bds-theme-overrides';
      document.head.appendChild(darkStyle);
    }
    if (isDark) {
      darkStyle.textContent = `
        .sbdocs-preview { border-color: var(--border-secondary) !important; background: var(--surface-primary) !important; }
        .docblock-argstable { border-color: var(--border-secondary) !important; }
        .docblock-argstable th, .docblock-argstable td { border-color: var(--border-muted) !important; color: var(--text-primary) !important; }
        .docblock-argstable th { background: var(--surface-secondary) !important; }
        [class*="ActionBar"] button { color: var(--text-muted) !important; }
      `;
    } else {
      darkStyle.textContent = '';
    }

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
          { value: 'brik', title: 'Brik Brand' },
          { value: 'brik-dark', title: 'Brik Brand (Dark)' },
          { value: 'client-sim', title: 'Font Audit' },
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
    devWidgets: {
      name: 'Dev Widgets',
      description: 'Show the Brik DevBar + Feedback widget in the preview',
      defaultValue: 'off',
      toolbar: {
        icon: 'wrench',
        items: [
          { value: 'on', title: 'On' },
          { value: 'off', title: 'Off' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    withTheme,
    // Feedback widget — opt-in via the Dev Widgets toolbar toggle so it
    // doesn't register into the DevBar on every story by default.
    (Story, context) => (
      <>
        <Story />
        {context.globals.devWidgets === 'on' && <FeedbackWidget />}
      </>
    ),
  ],
  parameters: {
    options: {
      storySort: {
        order: [
          'Overview',
          [
            'Welcome',
            'Health',
            ['Health Dashboard', 'Token Coverage'],
          ],
          'Foundations',
          [
            'Design Tokens',
            ['Overview', 'Color', 'Typography', 'Spacing', 'Border Radius', 'Border Width', 'Shadow', 'Size', 'Motion'],
            'Assets',
            '*',
          ],
          'Theming',
          [
            'Overview',
            'Client Themes',
            'Theme Switcher',
            'Blueprints',
            '*',
          ],
          'Motion',
          [
            'Overview',
            'Tiers',
            'Effects',
            'Vocabulary',
            '*',
          ],
          'Content',
          [
            'Overview',
            'Industries',
            'Voices',
            'Vocabularies',
            'Compliance',
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
