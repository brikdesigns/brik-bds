import { addons } from '@storybook/manager-api';
import { create } from '@storybook/theming';
import { storybookThemes, type StorybookThemeConfig } from '../tokens/storybook-themes';
import type { ThemeNumber } from '../tokens';

/**
 * Brik Design System — Immersive Manager Theming
 *
 * Two-layer approach for reliable, instant theme switching:
 *
 * 1. CSS custom properties on <body> — instant visual update, no React
 *    re-render needed. manager-head.html uses these to style sidebar,
 *    toolbar, search inputs, etc.
 *
 * 2. addons.setConfig({ theme }) — updates Storybook's internal theme
 *    store for anything CSS can't reach (addon panels, deep UI).
 *
 * The preview decorator also sets data-bds-theme on window.parent.body
 * as a fallback, but the channel listener here fires first.
 */

const sharedBrand = {
  brandTitle: 'Brik Design System',
  brandUrl: 'https://brikdesigns.com',
  fontCode: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
  appBorderRadius: 4,
  inputBorderRadius: 4,
};

// Pre-build a Storybook theme object for each BDS theme
const sbThemes: Record<string, ReturnType<typeof create>> = {};
for (const [themeNum, config] of Object.entries(storybookThemes)) {
  sbThemes[themeNum] = create({
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

/**
 * Full theme application — CSS vars (instant) + setConfig (formal).
 */
function applyTheme(themeNum: string) {
  const config = storybookThemes[themeNum as ThemeNumber];
  const sbTheme = sbThemes[themeNum];
  if (!config || !sbTheme) return;

  // Layer 1: Instant CSS custom property update (no React re-render needed)
  applyThemeVars(config);

  // Layer 2: Storybook's internal theme store (for addon panels, etc.)
  addons.setConfig({ theme: sbTheme });
}

// Set initial theme
applyTheme('brik');

// Listen for theme changes via Storybook's channel API.
// This is the primary mechanism — fires when the toolbar global changes,
// without the latency of preview useEffect → parent DOM → MutationObserver.
if (typeof window !== 'undefined') {
  const channel = addons.getChannel();
  channel.on('globalsUpdated', ({ globals }: { globals: Record<string, unknown> }) => {
    const themeNum = globals.themeNumber as string;
    if (themeNum) {
      applyTheme(themeNum);
    }
  });

  // Fallback: MutationObserver catches theme changes set by the preview
  // decorator (e.g., on initial load or when channel event is missed).
  const observer = new MutationObserver(() => {
    const themeNum = document.body.getAttribute('data-bds-theme');
    // Only act on theme NUMBER values (not the name we set above)
    if (themeNum && storybookThemes[themeNum as ThemeNumber]) {
      applyTheme(themeNum);
    }
  });
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['data-bds-theme'],
  });
}
