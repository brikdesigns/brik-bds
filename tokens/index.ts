/**
 * BDS Design Token Types
 *
 * Auto-generated from Webflow design tokens
 * Source: brik-bds.webflow.css
 * Generated: 2026-02-27T09:38:23.651Z
 * DO NOT EDIT DIRECTLY - Run: node build.js
 */

/**
 * Available theme identifiers (maps to .theme-X classes)
 * - theme-1: Blue-Green (Default Light)
 * - theme-2: Yellow-Orange (Dark)
 * - theme-3: Peach-Brown
 * - theme-4: Yellow-Brown
 * - theme-5: Green-Orange
 * - theme-6: Blue-Orange
 * - theme-7: Neon
 * - theme-8: Vibrant
 * - theme-brik: Brik Designs Brand
 */
export type ThemeNumber = '1' | '8' | '2' | '3' | '4' | '5' | '6' | '7' | 'brik';

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
  themeNumber: '1',
  colorMode: 'light',
  typography: 'default',
  spacing: 'comfortable',
  border: 'rounded',
};

/**
 * Theme metadata for UI display
 */
export const themeMetadata: Record<ThemeNumber, { name: string; description: string; isDark: boolean }> = {
  '1': { name: 'Blue-Green', description: 'Default light theme with blue/green accents', isDark: false },
  '2': { name: 'Yellow-Orange', description: 'Dark theme with yellow/orange accents', isDark: true },
  '3': { name: 'Peach-Brown', description: 'Warm earthy tones', isDark: false },
  '4': { name: 'Yellow-Brown', description: 'Golden warm tones', isDark: false },
  '5': { name: 'Green-Orange', description: 'Nature-inspired palette', isDark: false },
  '6': { name: 'Blue-Orange', description: 'Complementary contrast', isDark: false },
  '7': { name: 'Neon', description: 'Vibrant neon colors', isDark: true },
  '8': { name: 'Vibrant', description: 'Bold saturated colors', isDark: false },
  'brik': { name: 'Brik Designs', description: 'Company brand theme — poppy red, near-black, tan', isDark: false },
};

/**
 * Generate CSS class string for theme
 */
export function getThemeClasses(config: Partial<BDSThemeConfig>): string {
  const classes: string[] = [];

  if (config.themeNumber && config.themeNumber !== '1') {
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
 * Semantic color tokens (default theme values)
 */
export const semanticColors = {
  "border--secondary": "var(--grayscale--light)",
  "surface--nav": "var(--grayscale--white)",
  "background--brand-primary": "var(--_themes---blue-green--blue-light)",
  "text--inverse": "var(--grayscale--white)",
  "text--on-color-dark": "var(--grayscale--white)",
  "text--on-color-light": "var(--grayscale--black)",
  "border--brand": "var(--_themes---blue-green--blue-light)",
  "background--primary": "var(--grayscale--white)",
  "border--inverse": "var(--grayscale--white)",
  "text--primary": "var(--grayscale--darkest)",
  "text--brand": "var(--_themes---blue-green--blue-light)",
  "surface--primary": "var(--grayscale--white)",
  "border--primary": "var(--grayscale--dark)",
  "surface--secondary": "var(--grayscale--lightest)",
  "page--primary": "var(--grayscale--white)",
  "text--muted": "var(--grayscale--dark)",
  "surface--brand-primary": "var(--_themes---blue-green--blue-light)",
  "border--input": "var(--grayscale--light)",
  "border--muted": "var(--grayscale--lighter)",
  "border--on-color": "white",
  "surface--brand-secondary": "var(--_themes---blue-green--green)",
  "text--secondary": "var(--grayscale--darker)",
  "background--secondary": "var(--grayscale--lightest)",
  "theme--accent": "var(--_themes---blue-green--green)",
  "theme--tertiary": "var(--_themes---blue-green--blue-dark)",
  "theme--secondary": "var(--_themes---blue-green--blue-lighter)",
  "theme--primary": "var(--_themes---blue-green--blue-light)",
  "page--brand": "var(--_themes---blue-green--blue-light)",
  "background--brand-secondary": "white",
  "background--inverse": "var(--grayscale--white)",
  "background--input": "var(--grayscale--white)",
  "background--image": "#17171799",
  "background--image-brand": "var(--_themes---blue-green--blue-light)",
  "page--secondary": "var(--grayscale--lighter)",
  "theme--fourth": "white"
} as const;

/**
 * Semantic space tokens (default values)
 */
export const semanticSpace = {
  "none": "var(--space--0)",
  "lg": "var(--space--600)",
  "md": "var(--space--400)",
  "xl": "var(--space--800)",
  "gap--md": "var(--space--200)",
  "gap--lg": "var(--space--400)",
  "gap--xl": "var(--space--600)",
  "gap--none": "var(--space--0)",
  "huge": "var(--space--1200)",
  "xxl": "var(--space--800)",
  "xs": "var(--space--250)",
  "sm": "var(--space--300)",
  "gap--xs": "var(--space--100)",
  "gap--sm": "var(--space--150)",
  "gap--xxl": "var(--space--600)",
  "gap--huge": "var(--space--800)",
  "tiny": "var(--space--200)",
  "gap--tiny": "var(--space--50)",
  "button": "var(--space--200)",
  "input": "var(--space--200)"
} as const;

/**
 * Semantic typography tokens (default values)
 */
export const semanticTypography = {
  "font-family--label": "\"Open Sans\", sans-serif",
  "body--sm": "var(--font-size--75)",
  "label--md-base": "var(--font-size--100)",
  "font-family--body": "\"Open Sans\", sans-serif",
  "body--md-base": "var(--font-size--100)",
  "font-family--heading": "\"Droid Sans\", sans-serif",
  "heading--xxx-large": "var(--font-size--1200)",
  "heading--large": "var(--font-size--700)",
  "label--lg": "var(--font-size--200)",
  "label--xl": "var(--font-size--300)",
  "label--sm": "var(--font-size--75)",
  "body--xl": "var(--font-size--300)",
  "font-family--display": "\"Droid Sans\", sans-serif",
  "display--large": "var(--font-size--1400)",
  "display--medium": "var(--font-size--1500)",
  "display--small": "var(--font-size--1600)",
  "heading--xx-large": "var(--font-size--1000)",
  "heading--x-large": "var(--font-size--900)",
  "heading--medium": "var(--font-size--500)",
  "heading--small": "var(--font-size--300)",
  "body--lg": "var(--font-size--200)",
  "heading--tiny": "var(--font-size--100)",
  "font-family--icon": "\"Font Awesome 6 Pro Solid 900\", Arial, sans-serif",
  "body--tiny": "var(--font-size--25)",
  "body--xs": "var(--font-size--50)",
  "icon--small": "var(--font-size--75)",
  "icon--medium-base": "var(--font-size--100)",
  "icon--large": "var(--font-size--200)"
} as const;
