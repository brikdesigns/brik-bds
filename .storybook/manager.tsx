import { addons } from '@storybook/manager-api';
import { create } from '@storybook/theming';
import { storybookThemes } from '../tokens/storybook-themes';
import type { ThemeNumber } from '../tokens';

/**
 * Brik Design System — Immersive Manager Theming
 *
 * Creates a Storybook theme for EACH BDS theme so the sidebar,
 * toolbar, and panels all change colors/fonts when switching themes.
 *
 * The preview decorator sets data-bds-theme="<themeNumber>" on the
 * manager body. A MutationObserver watches this attribute and swaps
 * the full Storybook theme to match.
 */

const sharedBrand = {
  brandTitle: 'Brik Design System',
  brandUrl: 'https://brikdesigns.com',
  fontCode: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
  appBorderRadius: 4,
  inputBorderRadius: 4,
};

// Build a Storybook theme for each BDS theme
const themes: Record<string, ReturnType<typeof create>> = {};
for (const [themeNum, config] of Object.entries(storybookThemes)) {
  themes[themeNum] = create({
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
  });
}

// Set initial theme (Brik brand is default)
addons.setConfig({ theme: themes['brik'] || themes['1'] });

// Watch for theme changes from the preview decorator
if (typeof window !== 'undefined') {
  const applyTheme = () => {
    const themeNum = document.body.getAttribute('data-bds-theme') as ThemeNumber;
    if (themeNum && themes[themeNum]) {
      addons.setConfig({ theme: themes[themeNum] });
    }
  };

  const observer = new MutationObserver(applyTheme);
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['data-bds-theme'],
  });
}
