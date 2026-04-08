/**
 * Storybook Manager Theme Configs
 *
 * Auto-generated — resolved hex values for each BDS theme,
 * mapped to Storybook's create() API properties.
 *
 * Generated: 2026-03-18T09:52:20.054Z
 * DO NOT EDIT DIRECTLY - Run: node build.js
 */

import type { ThemeNumber } from './index';

export interface StorybookThemeConfig {
  base: 'light' | 'dark';
  name: string;
  colorPrimary: string;
  colorSecondary: string;
  appBg: string;
  appContentBg: string;
  appPreviewBg: string;
  appBorderColor: string;
  textColor: string;
  textInverseColor: string;
  textMutedColor: string;
  barTextColor: string;
  barSelectedColor: string;
  barHoverColor: string;
  barBg: string;
  inputBg: string;
  inputBorder: string;
  inputTextColor: string;
  fontBase: string;
}

export const storybookThemes: Record<ThemeNumber, StorybookThemeConfig> = {
  "client-sim": {
    "base": "light",
    "name": "Client Sim",
    "colorPrimary": "#333",
    "colorSecondary": "#333",
    "appBg": "white",
    "appContentBg": "white",
    "appPreviewBg": "transparent",
    "appBorderColor": "#bdbdbd",
    "textColor": "#333",
    "textInverseColor": "white",
    "textMutedColor": "#828282",
    "barTextColor": "#828282",
    "barSelectedColor": "#333",
    "barHoverColor": "#333",
    "barBg": "white",
    "inputBg": "white",
    "inputBorder": "#bdbdbd",
    "inputTextColor": "#333",
    "fontBase": "Verdana, sans-serif"
  },
  "brik": {
    "base": "light",
    "name": "Brik Brand",
    "colorPrimary": "#e35335",
    "colorSecondary": "#e35335",
    "appBg": "white",
    "appContentBg": "white",
    "appPreviewBg": "transparent",
    "appBorderColor": "#e0e0e0",
    "textColor": "#333",
    "textInverseColor": "white",
    "textMutedColor": "#828282",
    "barTextColor": "#555",
    "barSelectedColor": "#e35335",
    "barHoverColor": "#e35335",
    "barBg": "white",
    "inputBg": "white",
    "inputBorder": "#bdbdbd",
    "inputTextColor": "#333",
    "fontBase": "Poppins, sans-serif"
  },
  "brik-dark": {
    "base": "dark",
    "name": "Brik Brand (Dark)",
    "colorPrimary": "#e35335",
    "colorSecondary": "#e35335",
    "appBg": "black",
    "appContentBg": "black",
    "appPreviewBg": "transparent",
    "appBorderColor": "#4f4f4f",
    "textColor": "#f2f2f2",
    "textInverseColor": "#333",
    "textMutedColor": "#828282",
    "barTextColor": "#828282",
    "barSelectedColor": "#e35335",
    "barHoverColor": "#e35335",
    "barBg": "black",
    "inputBg": "#333",
    "inputBorder": "#828282",
    "inputTextColor": "#f2f2f2",
    "fontBase": "Poppins, sans-serif"
  }
};
