import { addons } from '@storybook/manager-api';
import { create } from '@storybook/theming';

/**
 * Brik Design System — Manager Theme
 *
 * Styles the Storybook sidebar, toolbar, and panels with
 * Brik brand colors and Poppins typography.
 */
const brikTheme = create({
  base: 'light',

  // Brand
  brandTitle: 'Brik Design System',
  brandUrl: 'https://brikdesigns.com',

  // UI colors
  colorPrimary: '#e35335',
  colorSecondary: '#e35335',

  // App chrome
  appBg: '#fafafa',
  appContentBg: '#ffffff',
  appPreviewBg: 'transparent',
  appBorderColor: '#e0e0e0',
  appBorderRadius: 4,

  // Text
  textColor: '#333333',
  textInverseColor: '#f2f2f2',
  textMutedColor: '#828282',

  // Toolbar
  barTextColor: '#828282',
  barSelectedColor: '#e35335',
  barHoverColor: '#e35335',
  barBg: '#ffffff',

  // Form inputs
  inputBg: '#ffffff',
  inputBorder: '#e0e0e0',
  inputTextColor: '#333333',
  inputBorderRadius: 4,

  // Typography
  fontBase: '"Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  fontCode: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
});

addons.setConfig({
  theme: brikTheme,
});
