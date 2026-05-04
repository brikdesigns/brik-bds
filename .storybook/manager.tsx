import { addons } from 'storybook/manager-api';
import { create, themes } from 'storybook/theming';
import { storybookThemes, type StorybookThemeConfig } from '../tokens/storybook-themes';
import type { ThemeNumber } from '../tokens';

/**
 * Brik Design System — Manager Theming
 *
 * `addons.setConfig({ theme })` is called ONCE at startup (its intended
 * use per the Storybook 10 docs and Theming 2.0 RFC). We do NOT re-call
 * it on toolbar switches because that triggers a manager remount, which
 * has shown up as transient "page failed to load" errors.
 *
 * Runtime theme changes happen entirely via `--sb-*` CSS custom
 * properties on `<body>` (see manager-head.html). Storybook's built-in
 * `themes.light` / `themes.dark` are spread as the base of `create()`
 * so chrome surfaces we don't override get sensible defaults instead
 * of fighting emotion-injected styles.
 *
 * The brand logo is swapped on theme change by mutating the rendered
 * <img> src directly — no setConfig needed.
 */

const sharedBrand = {
  brandTitle: 'Brik Design System',
  brandUrl: 'https://brikdesigns.com',
  fontCode: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
  appBorderRadius: 4,
  inputBorderRadius: 4,
};

function brandImageFor(base: 'light' | 'dark'): string {
  return base === 'dark' ? '/brik-logo-white.svg' : '/brik-logo.svg';
}

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
  document.body.setAttribute('data-bds-dark', String(config.base === 'dark'));
  document.body.setAttribute('data-bds-theme', config.base);
}

function swapBrandImage(base: 'light' | 'dark') {
  const next = brandImageFor(base);
  const img = document.querySelector<HTMLImageElement>(
    `img[alt="${sharedBrand.brandTitle}"]`,
  );
  if (img && !img.src.endsWith(next)) img.src = next;
}

const initial = storybookThemes['brik'];
applyThemeVars(initial);

addons.setConfig({
  theme: create({
    ...themes[initial.base],
    ...sharedBrand,
    brandImage: brandImageFor(initial.base),
    base: initial.base,
    colorPrimary: initial.colorPrimary,
    colorSecondary: initial.colorSecondary,
    appBg: initial.appBg,
    appContentBg: initial.appContentBg,
    appPreviewBg: initial.appPreviewBg,
    appBorderColor: initial.appBorderColor,
    textColor: initial.textColor,
    textInverseColor: initial.textInverseColor,
    textMutedColor: initial.textMutedColor,
    barTextColor: initial.barTextColor,
    barSelectedColor: initial.barSelectedColor,
    barHoverColor: initial.barHoverColor,
    barBg: initial.barBg,
    inputBg: initial.inputBg,
    inputBorder: initial.inputBorder,
    inputTextColor: initial.inputTextColor,
    fontBase: initial.fontBase,
  }),
});

if (typeof window !== 'undefined') {
  const channel = addons.getChannel();
  channel.on('globalsUpdated', ({ globals }: { globals: Record<string, unknown> }) => {
    const themeNum = globals.themeNumber as string;
    const config = storybookThemes[themeNum as ThemeNumber];
    if (!config) return;
    applyThemeVars(config);
    swapBrandImage(config.base);
  });
}
