import { addons } from '@storybook/manager-api';
import { create } from '@storybook/theming';

/**
 * Brik Design System — Manager Theme
 *
 * Styles the Storybook sidebar, toolbar, and panels with
 * Brik brand colors and Poppins typography.
 *
 * Supports dynamic light/dark switching via data-bds-dark attribute
 * set on the manager body by the preview decorator.
 */

const sharedBrand = {
  brandTitle: 'Brik Design System',
  brandUrl: 'https://brikdesigns.com',
  fontBase: '"Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  fontCode: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
  appBorderRadius: 4,
  inputBorderRadius: 4,
};

const brikLight = create({
  base: 'light',
  ...sharedBrand,
  colorPrimary: '#e35335',
  colorSecondary: '#e35335',
  appBg: '#fafafa',
  appContentBg: '#ffffff',
  appPreviewBg: 'transparent',
  appBorderColor: '#e0e0e0',
  textColor: '#333333',
  textInverseColor: '#f2f2f2',
  textMutedColor: '#828282',
  barTextColor: '#828282',
  barSelectedColor: '#e35335',
  barHoverColor: '#e35335',
  barBg: '#ffffff',
  inputBg: '#ffffff',
  inputBorder: '#e0e0e0',
  inputTextColor: '#333333',
});

const brikDark = create({
  base: 'dark',
  ...sharedBrand,
  colorPrimary: '#e35335',
  colorSecondary: '#79d799',
  appBg: '#1a1a2e',
  appContentBg: '#16213e',
  appPreviewBg: 'transparent',
  appBorderColor: '#333',
  textColor: '#e0e0e0',
  textInverseColor: '#333333',
  textMutedColor: '#999',
  barTextColor: '#999',
  barSelectedColor: '#79d799',
  barHoverColor: '#79d799',
  barBg: '#1a1a2e',
  inputBg: '#16213e',
  inputBorder: '#333',
  inputTextColor: '#e0e0e0',
});

// Set initial theme
addons.setConfig({ theme: brikLight });

// Watch for theme changes from preview decorator (via data-bds-dark attribute)
if (typeof window !== 'undefined') {
  const observer = new MutationObserver(() => {
    const isDark = document.body.getAttribute('data-bds-dark') === 'true';
    addons.setConfig({ theme: isDark ? brikDark : brikLight });
  });
  observer.observe(document.body, { attributes: true, attributeFilter: ['data-bds-dark'] });
}
