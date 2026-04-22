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
    colorMode?: ColorMode;
    typography?: TypographyStack;
    spacing?: SpacingMode;
    border?: BorderMode;
}
/**
 * Default theme configuration
 */
export declare const defaultTheme: BDSThemeConfig;
/**
 * Theme metadata for UI display
 * Verified against actual CSS color palettes in Webflow export.
 */
export declare const themeMetadata: Record<ThemeNumber, {
    name: string;
    description: string;
    isDark: boolean;
}>;
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
export declare function getThemeClasses(config: Partial<BDSThemeConfig>): string;
/**
 * Grayscale color primitives
 */
export declare const grayscale: {
    readonly dark: "#828282";
    readonly darker: "#4f4f4f";
    readonly light: "#bdbdbd";
    readonly lightest: "#f2f2f2";
    readonly lighter: "#e0e0e0";
    readonly darkest: "#333";
    readonly white: "white";
    readonly black: "black";
};
/**
 * Brand color primitive scales
 * Source of truth: Figma Variables → tokens-studio.json → Style Dictionary
 * Each family has 6 steps: lightest → lighter → light [base] → dark → darker → darkest
 */
export declare const poppy: {
    readonly lightest: "#ffefeb";
    readonly lighter: "#ffa693";
    readonly light: "#e35335";
    readonly dark: "#b0351b";
    readonly darker: "#7d1d09";
    readonly darkest: "#4a0d00";
};
export declare const tan: {
    readonly lightest: "#f1f0ec";
    readonly lighter: "#cfcdc5";
    readonly light: "#adaaa0";
    readonly dark: "#8b887d";
    readonly darker: "#69665c";
    readonly darkest: "#47453c";
};
export declare const orange: {
    readonly lightest: "#ffe8dc";
    readonly lighter: "#ffad92";
    readonly light: "#e76134";
    readonly dark: "#b4411a";
    readonly darker: "#812608";
    readonly darkest: "#4e1400";
};
export declare const yellow: {
    readonly lightest: "#fffee1";
    readonly lighter: "#ffecac";
    readonly light: "#f4d364";
    readonly dark: "#c1a443";
    readonly darker: "#8e7729";
    readonly darkest: "#634716";
};
export declare const green: {
    readonly lightest: "#f8fff3";
    readonly lighter: "#daffc0";
    readonly light: "#bcff8c";
    readonly dark: "#9ada6c";
    readonly darker: "#71a74a";
    readonly darkest: "#2a5542";
};
export declare const blue: {
    readonly lightest: "#f8fdff";
    readonly lighter: "#b2e3f5";
    readonly light: "#8ebbcc";
    readonly dark: "#6c95a3";
    readonly darker: "#4d6e7b";
    readonly darkest: "#314952";
};
export declare const purple: {
    readonly lightest: "#f2f0f7";
    readonly lighter: "#c4b0eb";
    readonly light: "#9e8bc2";
    readonly dark: "#796999";
    readonly darker: "#574a71";
    readonly darkest: "#362d48";
};
export declare const pink: {
    readonly lightest: "#ffe9f6";
    readonly lighter: "#ffa8dd";
    readonly light: "#ff67c3";
    readonly dark: "#ff25aa";
    readonly darker: "#d20080";
    readonly darkest: "#8e0057";
};
/**
 * Theme color palettes
 */
export declare const themePalettes: {
    readonly "blue-green": {
        readonly "blue-light": "#4665f5";
        readonly "blue-dark": "#0e212a";
        readonly green: "#79d799";
        readonly "blue-lighter": "#79b0d9";
        readonly "blue-lightest": "#edf2f6";
    };
    readonly neon: {
        readonly "neon-green": "#42ff00";
        readonly "neon-blue": "#00f6ff";
        readonly "neon-purple": "#ae00ff";
        readonly "neon-orange": "#ff5c00";
        readonly "neon-yellow": "#fffc00";
        readonly "neon-pink": "#f0c";
    };
    readonly "blue-orange": {
        readonly blue: "#3d5b83";
        readonly yellow: "#f16b4d";
        readonly "blue-dark": "#263343";
        readonly "blue-light": "#98c0d9";
        readonly "blue-lightest": "#ddfbfa";
    };
    readonly "yellow-orange": {
        readonly yellow: "#e8ea76";
        readonly "yellow-dark": "#d8d96a";
        readonly orange: "#ef8f4b";
        readonly black: "black";
    };
    readonly "peach-brown": {
        readonly peach: "#ed8059";
        readonly "peach-light": "#efc7a2";
        readonly "peach-lightest": "#f2eee5";
        readonly "peach-darkest": "#443b2b";
    };
    readonly "yellow-brown": {
        readonly yellow: "#f3b94d";
        readonly green: "#615f36";
        readonly brown: "#372d2b";
        readonly tan: "#fffaeb";
    };
    readonly "green-orange": {
        readonly "yellow-light": "#fdd595";
        readonly "brown-light": "#656153";
        readonly yellow: "#ffa600";
        readonly "green-light": "#9eb28d";
        readonly brown: "#322b2f";
    };
    readonly vibrant: {
        readonly blue: "#5889f7";
        readonly green: "#4aa35b";
        readonly orange: "#ed7648";
        readonly yellow: "#f6c647";
        readonly purple: "#7a78f7";
        readonly tan: "#fcf9f2";
    };
    readonly "blue-red": {
        readonly green: "#74b4a8";
        readonly "green-blue": "#317d9e";
        readonly red: "#fe1755";
        readonly "blue-dark": "#f5ffbe";
        readonly "green-light": "#b2dbc0";
    };
    readonly "orange-green": {
        readonly green: "#1bb58c";
        readonly "orange-light": "#ffae26";
        readonly "orange-lightest": "#fef2cd";
        readonly red: "#fd2253";
        readonly orange: "#ff7828";
    };
    readonly pastel: {
        readonly purple: "#c8aff4";
        readonly green: "#b9fd98";
        readonly blue: "#384ce2";
        readonly "orange-light": "#fdf2d5";
        readonly black: "black";
    };
};
/**
 * Space scale primitives (in px)
 */
export declare const spaceScale: {
    readonly "0": "0px";
    readonly "25": "1px";
    readonly "50": "2px";
    readonly "100": "4px";
    readonly "150": "6px";
    readonly "200": "8px";
    readonly "250": "10px";
    readonly "300": "12px";
    readonly "350": "14px";
    readonly "400": "16px";
    readonly "450": "18px";
    readonly "500": "20px";
    readonly "600": "24px";
    readonly "700": "28px";
    readonly "800": "32px";
    readonly "900": "36px";
    readonly "1000": "40px";
    readonly "1100": "44px";
    readonly "1200": "48px";
    readonly "1300": "52px";
    readonly "1400": "56px";
    readonly "1500": "60px";
    readonly "1600": "64px";
    readonly "1700": "72px";
    readonly "1800": "80px";
    readonly "1900": "84px";
    readonly "2000": "88px";
    readonly "2100": "96px";
    readonly "2200": "104px";
    readonly "2300": "112px";
    readonly "2400": "128px";
    readonly "2500": "136px";
    readonly "2600": "144px";
    readonly "2700": "152px";
    readonly "2800": "160px";
    readonly "2900": "168px";
    readonly "3000": "176px";
};
/**
 * Size scale primitives (in px)
 */
export declare const sizeScale: {
    readonly "0": "0px";
    readonly "25": "1px";
    readonly "50": "2px";
    readonly "100": "4px";
    readonly "150": "6px";
    readonly "200": "8px";
    readonly "300": "12px";
    readonly "400": "16px";
    readonly "500": "20px";
    readonly "600": "24px";
    readonly "700": "28px";
    readonly "800": "32px";
    readonly "900": "36px";
    readonly "1000": "40px";
    readonly "1100": "44px";
    readonly "1200": "48px";
    readonly "1300": "48px";
    readonly "1400": "52px";
    readonly "1500": "56px";
    readonly "1600": "60px";
    readonly "1700": "64px";
    readonly "1800": "72px";
    readonly "1900": "80px";
    readonly "2000": "84px";
    readonly "2100": "88px";
    readonly "2200": "96px";
};
/**
 * Border width scale primitives
 */
export declare const borderWidthScale: {
    readonly "0": "0px";
    readonly "25": ".25px";
    readonly "50": ".5px";
    readonly "100": "1px";
    readonly "200": "2px";
    readonly "300": "3px";
    readonly "400": "4px";
    readonly "500": "5px";
    readonly "600": "6px";
};
/**
 * Border radius scale primitives
 */
export declare const borderRadiusScale: {
    readonly "0": "0px";
    readonly "50": "2px";
    readonly "100": "4px";
    readonly "200": "8px";
    readonly "300": "10px";
    readonly "400": "12px";
    readonly "500": "14px";
    readonly "600": "16px";
    readonly "700": "20px";
    readonly "800": "24px";
    readonly "900": "28px";
    readonly "1000": "32px";
    readonly "1100": "36px";
    readonly "1200": "40px";
    readonly "1300": "44px";
    readonly "1400": "48px";
    readonly "1500": "999px";
    readonly "1600": "9999px";
    readonly pill: "999px";
    readonly circle: "9999px";
};
/**
 * Shadow spread scale primitives
 */
export declare const shadowSpreadScale: {
    readonly "0": "0px";
    readonly "100": "2px";
    readonly "200": "4px";
    readonly "300": "8px";
    readonly "400": "10px";
    readonly "500": "12px";
    readonly "600": "14px";
    readonly "700": "16px";
    readonly "800": "16px";
};
/**
 * Shadow blur scale primitives
 */
export declare const shadowBlurScale: {
    readonly "0": "0px";
    readonly "100": "2px";
    readonly "200": "4px";
    readonly "300": "6px";
    readonly "400": "8px";
    readonly "500": "10px";
    readonly "600": "12px";
    readonly "700": "14px";
    readonly "800": "16px";
};
/**
 * Font size scale primitives
 */
export declare const fontSizeScale: {
    readonly "25": "10.26px";
    readonly "50": "11.54px";
    readonly "75": "14px";
    readonly "100": "16px";
    readonly "200": "18px";
    readonly "300": "20px";
    readonly "400": "22.5px";
    readonly "500": "25.3px";
    readonly "600": "28.5px";
    readonly "700": "32px";
    readonly "800": "36px";
    readonly "900": "40.5px";
    readonly "1000": "45.5px";
    readonly "1100": "51px";
    readonly "1200": "57.5px";
    readonly "1300": "64.7px";
    readonly "1400": "72.8px";
    readonly "1500": "81.9px";
    readonly "1600": "92.2px";
    readonly "1700": "103.9px";
    readonly "1800": "116.9px";
    readonly "1900": "143px";
    readonly "2000": "171px";
    readonly "2100": "205px";
    readonly "2200": "247px";
    readonly "2300": "296px";
    readonly "2400": "355px";
    readonly "2500": "426px";
    readonly "2600": "515px";
};
/**
 * Font weight primitives
 */
export declare const fontWeights: {
    readonly bold: "700";
    readonly regular: "400";
    readonly "semi-bold": "600";
    readonly light: "300";
    readonly medium: "500";
    readonly "extra-bold": "800";
    readonly black: "900";
    readonly thin: "300";
};
/**
 * Font line height primitives
 */
export declare const fontLineHeights: {
    readonly "100": "100%";
    readonly "125": "125%";
    readonly "150": "150%";
    readonly "175": "175%";
    readonly "200": "200%";
    readonly none: "0%";
};
/**
 * Semantic space tokens (default values)
 * Used by Storybook Spacing.mdx to render the semantic spacing scale.
 * Maps to SD single-dash --space-* variables (NOT the legacy --space-- double-dash format).
 */
export declare const semanticSpace: {
    readonly none: "var(--space-0)";
    readonly tiny: "var(--space-200)";
    readonly xs: "var(--space-250)";
    readonly sm: "var(--space-300)";
    readonly md: "var(--space-400)";
    readonly lg: "var(--space-600)";
    readonly xl: "var(--space-800)";
    readonly huge: "var(--space-1200)";
    readonly "gap--none": "var(--space-0)";
    readonly "gap--tiny": "var(--space-50)";
    readonly "gap--xs": "var(--space-100)";
    readonly "gap--sm": "var(--space-150)";
    readonly "gap--md": "var(--space-200)";
    readonly "gap--lg": "var(--space-400)";
    readonly "gap--xl": "var(--space-600)";
    readonly "gap--huge": "var(--space-800)";
    readonly button: "var(--space-200)";
    readonly input: "var(--space-200)";
};
export { type ThemeSpec, BUILT_IN_THEMES, registerClientTheme, getAllThemes, } from './theme-registry';
