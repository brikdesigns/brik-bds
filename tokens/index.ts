/**
 * BDS Design Token Types
 *
 * Primitive scales and type exports for Storybook docs and ThemeProvider.
 * Source of truth: design-tokens/tokens-studio.json → Style Dictionary → figma-tokens.css
 *
 * Primitive values (spaceScale, sizeScale, etc.) are used in Storybook foundation docs.
 * ThemeNumber and BDSThemeConfig drive the ThemeProvider component.
 *
 * For component development, import from @/lib/tokens (consuming project) instead.
 */

/**
 * Available theme identifiers
 *
 * Brand themes share the `.theme-brand-brik` class and differentiate via the
 * `data-theme` attribute on <html>. Numbered template themes keep the
 * `.theme-X` class pattern (no data-theme attribute).
 *
 * - brik          → `.theme-brand-brik` + `data-theme="light"` (Brik Brand — poppy red, Poppins)
 * - brik-dark     → `.theme-brand-brik` + `data-theme="dark"` (poppy red on near-black)
 * - client-sim    → `.theme-brand-brik.theme-client-sim` + `data-theme="light"` (Font Audit tool)
 *
 * Website template themes (1-8) moved to brik/brik-website-themes repo.
 */
export type ThemeNumber = 'brik' | 'brik-dark' | 'client-sim';

/**
 * Color mode type (friendly names)
 */
export type ColorMode = 'light' | 'dark' | 'brand' | 'accent';

/**
 * Typography stack type
 */
export type TypographyStack = 'default' | 'serif' | 'modern' | 'classic';

/**
 * Spacing density type
 */
export type SpacingMode = 'compact' | 'comfortable' | 'spacious';

/**
 * Border style type
 */
export type BorderMode = 'sharp' | 'rounded' | 'pill';

/**
 * Full theme configuration
 */
export interface BDSThemeConfig {
  themeNumber: ThemeNumber;
  // Legacy support for friendly names
  colorMode?: ColorMode;
  typography?: TypographyStack;
  spacing?: SpacingMode;
  border?: BorderMode;
}

/**
 * Default theme configuration
 */
export const defaultTheme: BDSThemeConfig = {
  themeNumber: 'brik',
  colorMode: 'light',
  typography: 'default',
  spacing: 'comfortable',
  border: 'rounded',
};

/**
 * Theme metadata for UI display
 * Verified against actual CSS color palettes in Webflow export.
 */
export const themeMetadata: Record<ThemeNumber, { name: string; description: string; isDark: boolean }> = {
  'brik': { name: 'Brik Brand', description: 'Company brand — poppy red, near-black, tan (Poppins)', isDark: false },
  'brik-dark': { name: 'Brik Brand (Dark)', description: 'Dark mode — poppy red on near-black (Poppins)', isDark: true },
  'client-sim': { name: 'Client Sim', description: 'Font-family audit tool — Georgia/Verdana/Courier New exposes semantic token misuse', isDark: false },
};

/**
 * Generate CSS class string for theme.
 *
 * Brand themes (brik, brik-dark, client-sim) return `.theme-brand-brik` — the
 * light/dark split is expressed via the `data-theme` attribute on <html>, not
 * the class string. Apply that attribute separately (ThemeProvider does this
 * automatically when `applyToBody` is true).
 *
 * Numbered template themes (theme-1 through theme-8) return their own class.
 */
export function getThemeClasses(config: Partial<BDSThemeConfig>): string {
  const classes: string[] = ['body'];

  if (config.themeNumber === 'brik' || config.themeNumber === 'brik-dark') {
    classes.push('theme-brand-brik');
  } else if (config.themeNumber === 'client-sim') {
    classes.push('theme-brand-brik', 'theme-client-sim');
  } else if (config.themeNumber) {
    classes.push(`theme-${config.themeNumber}`);
  }

  return classes.join(' ');
}

/**
 * Grayscale color primitives
 */
export const grayscale = {
  "dark": "#828282",
  "darker": "#4f4f4f",
  "light": "#bdbdbd",
  "lightest": "#f2f2f2",
  "lighter": "#e0e0e0",
  "darkest": "#333",
  "white": "white",
  "black": "black"
} as const;

/**
 * Brand color primitive scales
 * Source of truth: Figma Variables → tokens-studio.json → Style Dictionary
 * Each family has 6 steps: lightest → lighter → light [base] → dark → darker → darkest
 */
export const poppy = {
  "lightest": "#ffefeb", "lighter": "#ffa693", "light": "#e35335",
  "dark": "#b0351b", "darker": "#7d1d09", "darkest": "#4a0d00"
} as const;

export const tan = {
  "lightest": "#f1f0ec", "lighter": "#cfcdc5", "light": "#adaaa0",
  "dark": "#8b887d", "darker": "#69665c", "darkest": "#47453c"
} as const;

export const orange = {
  "lightest": "#ffe8dc", "lighter": "#ffad92", "light": "#e76134",
  "dark": "#b4411a", "darker": "#812608", "darkest": "#4e1400"
} as const;

export const yellow = {
  "lightest": "#fffee1", "lighter": "#ffecac", "light": "#f4d364",
  "dark": "#c1a443", "darker": "#8e7729", "darkest": "#634716"
} as const;

export const green = {
  "lightest": "#f8fff3", "lighter": "#daffc0", "light": "#bcff8c",
  "dark": "#9ada6c", "darker": "#71a74a", "darkest": "#2a5542"
} as const;

export const blue = {
  "lightest": "#f8fdff", "lighter": "#b2e3f5", "light": "#8ebbcc",
  "dark": "#6c95a3", "darker": "#4d6e7b", "darkest": "#314952"
} as const;

export const purple = {
  "lightest": "#f2f0f7", "lighter": "#c4b0eb", "light": "#9e8bc2",
  "dark": "#796999", "darker": "#574a71", "darkest": "#362d48"
} as const;

export const pink = {
  "lightest": "#ffe9f6", "lighter": "#ffa8dd", "light": "#ff67c3",
  "dark": "#ff25aa", "darker": "#d20080", "darkest": "#8e0057"
} as const;

/**
 * Theme color palettes
 */
export const themePalettes = {
  "blue-green": {
    "blue-light": "#4665f5",
    "blue-dark": "#0e212a",
    "green": "#79d799",
    "blue-lighter": "#79b0d9",
    "blue-lightest": "#edf2f6"
  },
  "neon": {
    "neon-green": "#42ff00",
    "neon-blue": "#00f6ff",
    "neon-purple": "#ae00ff",
    "neon-orange": "#ff5c00",
    "neon-yellow": "#fffc00",
    "neon-pink": "#f0c"
  },
  "blue-orange": {
    "blue": "#3d5b83",
    "yellow": "#f16b4d",
    "blue-dark": "#263343",
    "blue-light": "#98c0d9",
    "blue-lightest": "#ddfbfa"
  },
  "yellow-orange": {
    "yellow": "#e8ea76",
    "yellow-dark": "#d8d96a",
    "orange": "#ef8f4b",
    "black": "black"
  },
  "peach-brown": {
    "peach": "#ed8059",
    "peach-light": "#efc7a2",
    "peach-lightest": "#f2eee5",
    "peach-darkest": "#443b2b"
  },
  "yellow-brown": {
    "yellow": "#f3b94d",
    "green": "#615f36",
    "brown": "#372d2b",
    "tan": "#fffaeb"
  },
  "green-orange": {
    "yellow-light": "#fdd595",
    "brown-light": "#656153",
    "yellow": "#ffa600",
    "green-light": "#9eb28d",
    "brown": "#322b2f"
  },
  "vibrant": {
    "blue": "#5889f7",
    "green": "#4aa35b",
    "orange": "#ed7648",
    "yellow": "#f6c647",
    "purple": "#7a78f7",
    "tan": "#fcf9f2"
  },
  "blue-red": {
    "green": "#74b4a8",
    "green-blue": "#317d9e",
    "red": "#fe1755",
    "blue-dark": "#f5ffbe",
    "green-light": "#b2dbc0"
  },
  "orange-green": {
    "green": "#1bb58c",
    "orange-light": "#ffae26",
    "orange-lightest": "#fef2cd",
    "red": "#fd2253",
    "orange": "#ff7828"
  },
  "pastel": {
    "purple": "#c8aff4",
    "green": "#b9fd98",
    "blue": "#384ce2",
    "orange-light": "#fdf2d5",
    "black": "black"
  }
} as const;

/**
 * Space scale primitives (in px)
 */
export const spaceScale = {
  "0": "0px",
  "25": "1px",
  "50": "2px",
  "100": "4px",
  "150": "6px",
  "200": "8px",
  "250": "10px",
  "300": "12px",
  "350": "14px",
  "400": "16px",
  "450": "18px",
  "500": "20px",
  "600": "24px",
  "700": "28px",
  "800": "32px",
  "900": "36px",
  "1000": "40px",
  "1100": "44px",
  "1200": "48px",
  "1300": "52px",
  "1400": "56px",
  "1500": "60px",
  "1600": "64px",
  "1700": "72px",
  "1800": "80px",
  "1900": "84px",
  "2000": "88px",
  "2100": "96px",
  "2200": "104px",
  "2300": "112px",
  "2400": "128px",
  "2500": "136px",
  "2600": "144px",
  "2700": "152px",
  "2800": "160px",
  "2900": "168px",
  "3000": "176px"
} as const;

/**
 * Size scale primitives (in px)
 */
export const sizeScale = {
  "0": "0px",
  "25": "1px",
  "50": "2px",
  "100": "4px",
  "150": "6px",
  "200": "8px",
  "300": "12px",
  "400": "16px",
  "500": "20px",
  "600": "24px",
  "700": "28px",
  "800": "32px",
  "900": "36px",
  "1000": "40px",
  "1100": "44px",
  "1200": "48px",
  "1300": "48px",
  "1400": "52px",
  "1500": "56px",
  "1600": "60px",
  "1700": "64px",
  "1800": "72px",
  "1900": "80px",
  "2000": "84px",
  "2100": "88px",
  "2200": "96px"
} as const;

/**
 * Border width scale primitives
 */
export const borderWidthScale = {
  "0": "0px",
  "25": ".25px",
  "50": ".5px",
  "100": "1px",
  "200": "2px",
  "300": "3px",
  "400": "4px",
  "500": "5px",
  "600": "6px"
} as const;

/**
 * Border radius scale primitives
 */
export const borderRadiusScale = {
  "0": "0px",
  "50": "2px",
  "100": "4px",
  "200": "8px",
  "300": "10px",
  "400": "12px",
  "500": "14px",
  "600": "16px",
  "700": "20px",
  "800": "24px",
  "900": "28px",
  "1000": "32px",
  "1100": "36px",
  "1200": "40px",
  "1300": "44px",
  "1400": "48px",
  "1500": "999px",
  "1600": "9999px",
  "pill": "999px",
  "circle": "9999px"
} as const;

/**
 * Shadow spread scale primitives
 */
export const shadowSpreadScale = {
  "0": "0px",
  "100": "2px",
  "200": "4px",
  "300": "8px",
  "400": "10px",
  "500": "12px",
  "600": "14px",
  "700": "16px",
  "800": "16px"
} as const;

/**
 * Shadow blur scale primitives
 */
export const shadowBlurScale = {
  "0": "0px",
  "100": "2px",
  "200": "4px",
  "300": "6px",
  "400": "8px",
  "500": "10px",
  "600": "12px",
  "700": "14px",
  "800": "16px"
} as const;

/**
 * Font size scale primitives
 */
export const fontSizeScale = {
  "25": "10.26px",
  "50": "11.54px",
  "75": "14px",
  "100": "16px",
  "200": "18px",
  "300": "20px",
  "400": "22.5px",
  "500": "25.3px",
  "600": "28.5px",
  "700": "32px",
  "800": "36px",
  "900": "40.5px",
  "1000": "45.5px",
  "1100": "51px",
  "1200": "57.5px",
  "1300": "64.7px",
  "1400": "72.8px",
  "1500": "81.9px",
  "1600": "92.2px",
  "1700": "103.9px",
  "1800": "116.9px",
  "1900": "143px",
  "2000": "171px",
  "2100": "205px",
  "2200": "247px",
  "2300": "296px",
  "2400": "355px",
  "2500": "426px",
  "2600": "515px"
} as const;

/**
 * Font weight primitives
 */
export const fontWeights = {
  "bold": "700",
  "regular": "400",
  "semi-bold": "600",
  "light": "300",
  "medium": "500",
  "extra-bold": "800",
  "black": "900",
  "thin": "300"
} as const;

/**
 * Font line height primitives
 */
export const fontLineHeights = {
  "100": "100%",
  "125": "125%",
  "150": "150%",
  "175": "175%",
  "200": "200%",
  "none": "0%"
} as const;

/**
 * Semantic space tokens (default values)
 * Used by Storybook Spacing.mdx to render the semantic spacing scale.
 * Maps to SD single-dash --space-* variables (NOT the legacy --space-- double-dash format).
 */
export const semanticSpace = {
  "none": "var(--space-0)",
  "tiny": "var(--space-200)",
  "xs": "var(--space-250)",
  "sm": "var(--space-300)",
  "md": "var(--space-400)",
  "lg": "var(--space-600)",
  "xl": "var(--space-800)",
  "huge": "var(--space-1200)",
  "gap--none": "var(--space-0)",
  "gap--tiny": "var(--space-50)",
  "gap--xs": "var(--space-100)",
  "gap--sm": "var(--space-150)",
  "gap--md": "var(--space-200)",
  "gap--lg": "var(--space-400)",
  "gap--xl": "var(--space-600)",
  "gap--huge": "var(--space-800)",
  "button": "var(--space-200)",
  "input": "var(--space-200)"
} as const;

