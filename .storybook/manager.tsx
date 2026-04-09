import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';
import { storybookThemes, type StorybookThemeConfig } from '../tokens/storybook-themes';
import type { ThemeNumber } from '../tokens';

/**
 * Brik Design System — Manager Theming
 *
 * CSS custom properties on <body> handle all visual updates instantly.
 * manager-head.html references --sb-* variables to style sidebar,
 * toolbar, search inputs, and chrome elements.
 *
 * addons.setConfig({ theme }) is called ONCE at startup (its intended
 * use). It is NOT called on theme switches — it triggers expensive
 * React re-renders of the entire manager UI (Storybook Theming 2.0
 * RFC confirms this is a startup-time API, not a runtime API).
 */

const sharedBrand = {
  brandTitle: 'Brik Design System',
  brandUrl: 'https://brikdesigns.com',
  fontCode: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
  appBorderRadius: 4,
  inputBorderRadius: 4,
};

/**
 * Apply CSS custom properties to the manager <body>.
 * manager-head.html references these --sb-* variables to style
 * sidebar, toolbar, and other chrome elements instantly.
 */
function applyThemeVars(config: StorybookThemeConfig) {
  const s = document.body.style;
  s.setProperty('--sb-app-bg', config.appBg);
  s.setProperty('--sb-content-bg', config.appContentBg);
  s.setProperty('--sb-border-color', config.appBorderColor);
  s.setProperty('--sb-text-color', config.textColor);
  s.setProperty('--sb-text-inverse', config.textInverseColor);
  s.setProperty('--sb-text-muted', config.textMutedColor);
  s.setProperty('--sb-bar-bg', config.barBg);
  s.setProperty('--sb-bar-text', config.barTextColor);
  s.setProperty('--sb-bar-selected', config.barSelectedColor);
  s.setProperty('--sb-bar-hover', config.barHoverColor);
  s.setProperty('--sb-input-bg', config.inputBg);
  s.setProperty('--sb-input-border', config.inputBorder);
  s.setProperty('--sb-input-text', config.inputTextColor);
  s.setProperty('--sb-color-primary', config.colorPrimary);
  s.setProperty('--sb-color-secondary', config.colorSecondary);
  s.setProperty('--sb-font-base', config.fontBase);
  // Dark mode flag for CSS selectors that need light/dark branching
  document.body.setAttribute('data-bds-dark', String(config.base === 'dark'));
}

// Set initial theme — setConfig() at startup (its intended use)
const initialConfig = storybookThemes['brik'];
applyThemeVars(initialConfig);
addons.setConfig({
  theme: create({
    ...sharedBrand,
    brandImage: '/brik-logo.svg',
    base: initialConfig.base,
    colorPrimary: initialConfig.colorPrimary,
    colorSecondary: initialConfig.colorSecondary,
    appBg: initialConfig.appBg,
    appContentBg: initialConfig.appContentBg,
    appPreviewBg: initialConfig.appPreviewBg,
    appBorderColor: initialConfig.appBorderColor,
    textColor: initialConfig.textColor,
    textInverseColor: initialConfig.textInverseColor,
    textMutedColor: initialConfig.textMutedColor,
    barTextColor: initialConfig.barTextColor,
    barSelectedColor: initialConfig.barSelectedColor,
    barHoverColor: initialConfig.barHoverColor,
    barBg: initialConfig.barBg,
    inputBg: initialConfig.inputBg,
    inputBorder: initialConfig.inputBorder,
    inputTextColor: initialConfig.inputTextColor,
    fontBase: initialConfig.fontBase,
  }),
});

// Listen for theme changes — update both CSS vars (instant visual) and
// manager emotion theme (api.setOptions). This is the standard approach
// used by storybook-dark-mode addon and major design systems.
if (typeof window !== 'undefined') {
  const channel = addons.getChannel();
  channel.on('globalsUpdated', ({ globals }: { globals: Record<string, unknown> }) => {
    const themeNum = globals.themeNumber as string;
    const config = storybookThemes[themeNum as ThemeNumber];
    if (config) {
      // 1. CSS vars — instant visual update for sidebar/toolbar
      applyThemeVars(config);

      // 2. Emotion theme — updates all emotion-styled manager components
      //    (tabs, panels, borders, etc. that CSS vars don't reach)
      addons.setConfig({
        theme: create({
          ...sharedBrand,
          brandImage: config.base === 'dark' ? '/brik-logo-white.svg' : '/brik-logo.svg',
          base: config.base,
          colorPrimary: config.colorPrimary,
          colorSecondary: config.colorSecondary,
          appBg: config.appBg,
          appContentBg: config.appContentBg,
          appPreviewBg: config.appPreviewBg,
          appBorderColor: config.appBorderColor,
          textColor: config.textColor,
          textInverseColor: config.textInverseColor,
          textMutedColor: config.textMutedColor,
          barTextColor: config.barTextColor,
          barSelectedColor: config.barSelectedColor,
          barHoverColor: config.barHoverColor,
          barBg: config.barBg,
          inputBg: config.inputBg,
          inputBorder: config.inputBorder,
          inputTextColor: config.inputTextColor,
          fontBase: config.fontBase,
        }),
      });
    }
  });
}
