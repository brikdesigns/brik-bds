#!/usr/bin/env node
/**
 * BDS Token Build Pipeline
 *
 * Transforms Webflow CSS into:
 * - variables.css (CSS custom properties)
 * - themes.css (theme class definitions)
 * - index.ts (TypeScript types)
 *
 * Source: ../updates/brik-bds.webflow/css/brik-bds.webflow.css
 *
 * Token Structure:
 * - Primitives: --grayscale--, --space--, --size--, --border-width--, etc.
 * - Semantic: --_color---, --_space---, --_size---, --_typography---, etc.
 * - Themes: .body.theme-1 through .body.theme-8
 */

const fs = require('fs');
const path = require('path');

// Paths
const WEBFLOW_CSS = path.join(__dirname, '../updates/brik-bds.webflow/css/brik-bds.webflow.css');
const OUTPUT_DIR = __dirname;

// ============================================
// CSS PARSING
// ============================================

function parseWebflowCSS() {
  const css = fs.readFileSync(WEBFLOW_CSS, 'utf8');

  const result = {
    primitives: {
      grayscale: {},
      themes: {},
      space: {},
      size: {},
      borderWidth: {},
      borderRadius: {},
      shadowSpread: {},
      shadowBlur: {},
      shadowOffset: {},
      fontSize: {},
      fontWeight: {},
      fontLineHeight: {},
      fontFamily: {},
    },
    semantic: {
      color: {},
      space: {},
      size: {},
      typography: {},
      borderWidth: {},
      borderRadius: {},
      boxShadow: {},
      blurRadius: {},
    },
    themeClasses: {},
  };

  // Extract :root variables
  const rootMatch = css.match(/:root\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/);
  if (rootMatch) {
    const rootContent = rootMatch[1];
    parseVariablesFromBlock(rootContent, result);
  }

  // Extract theme class definitions (both numeric and named themes)
  const themeClassRegex = /\.body\.theme-([\w-]+)\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/g;
  let match;
  while ((match = themeClassRegex.exec(css)) !== null) {
    const themeName = match[1];
    const themeContent = match[2];
    result.themeClasses[`theme-${themeName}`] = parseThemeVariables(themeContent);
  }

  return result;
}

function parseVariablesFromBlock(content, result) {
  const varRegex = /--([a-zA-Z0-9_<>|-]+):\s*([^;]+);/g;
  let match;

  while ((match = varRegex.exec(content)) !== null) {
    let varName = match[1];
    let value = match[2].trim();

    // Clean up deleted variable suffixes
    varName = varName.replace(/<deleted\|[^>]+>/g, '');

    // Categorize the variable
    if (varName.startsWith('grayscale--')) {
      const name = varName.replace('grayscale--', '');
      result.primitives.grayscale[name] = value;
    } else if (varName.startsWith('_themes---')) {
      const parts = varName.replace('_themes---', '').split('--');
      const palette = parts[0];
      const colorName = parts[1] || 'primary';
      if (!result.primitives.themes[palette]) {
        result.primitives.themes[palette] = {};
      }
      result.primitives.themes[palette][colorName] = value;
    } else if (varName.startsWith('space--') && !varName.startsWith('space---')) {
      const name = varName.replace('space--', '');
      result.primitives.space[name] = value;
    } else if (varName.startsWith('size--') && !varName.startsWith('size---')) {
      const name = varName.replace('size--', '');
      result.primitives.size[name] = value;
    } else if (varName.startsWith('border-width--')) {
      const name = varName.replace('border-width--', '');
      result.primitives.borderWidth[name] = value;
    } else if (varName.startsWith('border-radius--') && !varName.startsWith('border-radius---')) {
      const name = varName.replace('border-radius--', '');
      result.primitives.borderRadius[name] = value;
    } else if (varName.startsWith('shadow-spread--')) {
      const name = varName.replace('shadow-spread--', '');
      result.primitives.shadowSpread[name] = value;
    } else if (varName.startsWith('shadow-blur--')) {
      const name = varName.replace('shadow-blur--', '');
      result.primitives.shadowBlur[name] = value;
    } else if (varName.startsWith('shadow-offset--')) {
      const name = varName.replace('shadow-offset--', '');
      result.primitives.shadowOffset[name] = value;
    } else if (varName.startsWith('font-size--')) {
      const name = varName.replace('font-size--', '');
      result.primitives.fontSize[name] = value;
    } else if (varName.startsWith('font-weight--')) {
      const name = varName.replace('font-weight--', '');
      result.primitives.fontWeight[name] = value;
    } else if (varName.startsWith('font-line-height--')) {
      const name = varName.replace('font-line-height--', '');
      result.primitives.fontLineHeight[name] = value;
    } else if (varName.startsWith('font-family--')) {
      const name = varName.replace('font-family--', '');
      result.primitives.fontFamily[name] = value;
    }
    // Semantic tokens
    else if (varName.startsWith('_color---')) {
      const name = varName.replace('_color---', '');
      result.semantic.color[name] = value;
    } else if (varName.startsWith('_space---')) {
      const name = varName.replace('_space---', '');
      result.semantic.space[name] = value;
    } else if (varName.startsWith('_size---')) {
      const name = varName.replace('_size---', '');
      result.semantic.size[name] = value;
    } else if (varName.startsWith('_typography---')) {
      const name = varName.replace('_typography---', '');
      result.semantic.typography[name] = value;
    } else if (varName.startsWith('_border-width---')) {
      const name = varName.replace('_border-width---', '');
      result.semantic.borderWidth[name] = value;
    } else if (varName.startsWith('_border-radius---')) {
      const name = varName.replace('_border-radius---', '');
      result.semantic.borderRadius[name] = value;
    } else if (varName.startsWith('_box-shadow---')) {
      const name = varName.replace('_box-shadow---', '');
      result.semantic.boxShadow[name] = value;
    } else if (varName.startsWith('_blur-radius---')) {
      const name = varName.replace('_blur-radius---', '');
      result.semantic.blurRadius[name] = value;
    }
  }
}

function parseThemeVariables(content) {
  const vars = {};
  const varRegex = /--([a-zA-Z0-9_<>|-]+):\s*([^;]+);/g;
  let match;

  while ((match = varRegex.exec(content)) !== null) {
    let varName = match[1];
    let value = match[2].trim();
    varName = varName.replace(/<deleted\|[^>]+>/g, '');
    vars[varName] = value;
  }

  return vars;
}

// ============================================
// CSS GENERATION
// ============================================

/**
 * Transform Webflow variable references to our naming convention
 */
function transformVariableReference(value) {
  // Transform --_themes--- to --themes--
  let transformed = value.replace(/var\(--_themes---/g, 'var(--themes--');
  // Transform --grayscale-- stays the same (already correct)
  return transformed;
}

function generateVariablesCSS(tokens) {
  let css = `/* ============================================= */
/*          BDS DESIGN TOKEN VARIABLES           */
/* ============================================= */
/* Auto-generated from Webflow design tokens     */
/* Source: brik-bds.webflow.css                  */
/* Generated: ${new Date().toISOString()}        */
/* DO NOT EDIT DIRECTLY - Run: node build.js    */
/* ============================================= */

:root {
  /* ============================================= */
  /*               PRIMITIVE TOKENS               */
  /* ============================================= */

  /* Grayscale */
`;

  // Grayscale
  for (const [name, value] of Object.entries(tokens.primitives.grayscale)) {
    css += `  --grayscale--${name}: ${value};\n`;
  }

  // Theme color palettes
  css += `\n  /* Theme Color Palettes */\n`;
  for (const [palette, colors] of Object.entries(tokens.primitives.themes)) {
    for (const [colorName, value] of Object.entries(colors)) {
      css += `  --themes--${palette}--${colorName}: ${value};\n`;
    }
  }

  // Space scale
  css += `\n  /* Space Scale */\n`;
  const spaceEntries = Object.entries(tokens.primitives.space).sort((a, b) => {
    const numA = parseInt(a[0]) || 0;
    const numB = parseInt(b[0]) || 0;
    return numA - numB;
  });
  for (const [name, value] of spaceEntries) {
    css += `  --space--${name}: ${value};\n`;
  }

  // Size scale
  css += `\n  /* Size Scale */\n`;
  const sizeEntries = Object.entries(tokens.primitives.size).sort((a, b) => {
    const numA = parseInt(a[0]) || 0;
    const numB = parseInt(b[0]) || 0;
    return numA - numB;
  });
  for (const [name, value] of sizeEntries) {
    css += `  --size--${name}: ${value};\n`;
  }

  // Border width
  css += `\n  /* Border Width Scale */\n`;
  const borderWidthEntries = Object.entries(tokens.primitives.borderWidth).sort((a, b) => {
    const numA = parseInt(a[0]) || 0;
    const numB = parseInt(b[0]) || 0;
    return numA - numB;
  });
  for (const [name, value] of borderWidthEntries) {
    css += `  --border-width--${name}: ${value};\n`;
  }

  // Border radius
  css += `\n  /* Border Radius Scale */\n`;
  const borderRadiusEntries = Object.entries(tokens.primitives.borderRadius).sort((a, b) => {
    const numA = parseInt(a[0]) || 0;
    const numB = parseInt(b[0]) || 0;
    return numA - numB;
  });
  for (const [name, value] of borderRadiusEntries) {
    css += `  --border-radius--${name}: ${value};\n`;
  }

  // Shadow scales
  css += `\n  /* Shadow Scales */\n`;
  for (const [name, value] of Object.entries(tokens.primitives.shadowSpread)) {
    css += `  --shadow-spread--${name}: ${value};\n`;
  }
  for (const [name, value] of Object.entries(tokens.primitives.shadowBlur)) {
    css += `  --shadow-blur--${name}: ${value};\n`;
  }
  for (const [name, value] of Object.entries(tokens.primitives.shadowOffset)) {
    css += `  --shadow-offset--${name}: ${value};\n`;
  }

  // Font size scale
  css += `\n  /* Font Size Scale */\n`;
  const fontSizeEntries = Object.entries(tokens.primitives.fontSize).sort((a, b) => {
    const numA = parseInt(a[0]) || 0;
    const numB = parseInt(b[0]) || 0;
    return numA - numB;
  });
  for (const [name, value] of fontSizeEntries) {
    css += `  --font-size--${name}: ${value};\n`;
  }

  // Font weights
  css += `\n  /* Font Weights */\n`;
  for (const [name, value] of Object.entries(tokens.primitives.fontWeight)) {
    css += `  --font-weight--${name}: ${value};\n`;
  }

  // Font line heights
  css += `\n  /* Font Line Heights */\n`;
  for (const [name, value] of Object.entries(tokens.primitives.fontLineHeight)) {
    css += `  --font-line-height--${name}: ${value};\n`;
  }

  // Font families
  css += `\n  /* Font Families (primitives) */\n`;
  for (const [name, value] of Object.entries(tokens.primitives.fontFamily)) {
    css += `  --font-family--${name}: ${value};\n`;
  }

  // Semantic tokens (defaults) - transform variable references to match our naming
  css += `\n  /* ============================================= */
  /*               SEMANTIC TOKENS                 */
  /* ============================================= */

  /* Color Semantic Tokens (default: light mode) */
`;
  for (const [name, value] of Object.entries(tokens.semantic.color)) {
    css += `  --color-${name.replace(/--/g, '-')}: ${transformVariableReference(value)};\n`;
  }

  css += `\n  /* Space Semantic Tokens */\n`;
  for (const [name, value] of Object.entries(tokens.semantic.space)) {
    css += `  --layout-${name.replace(/--/g, '-')}: ${transformVariableReference(value)};\n`;
  }

  css += `\n  /* Size Semantic Tokens */\n`;
  for (const [name, value] of Object.entries(tokens.semantic.size)) {
    css += `  --size-${name.replace(/--/g, '-')}: ${transformVariableReference(value)};\n`;
  }

  css += `\n  /* Typography Semantic Tokens */\n`;
  for (const [name, value] of Object.entries(tokens.semantic.typography)) {
    css += `  --typography-${name.replace(/--/g, '-')}: ${transformVariableReference(value)};\n`;
  }

  css += `\n  /* Border Width Semantic Tokens */\n`;
  for (const [name, value] of Object.entries(tokens.semantic.borderWidth)) {
    css += `  --border-width-${name}: ${transformVariableReference(value)};\n`;
  }

  css += `\n  /* Border Radius Semantic Tokens */\n`;
  for (const [name, value] of Object.entries(tokens.semantic.borderRadius)) {
    css += `  --border-radius-${name.replace(/--/g, '-')}: ${transformVariableReference(value)};\n`;
  }

  css += `\n  /* Box Shadow Semantic Tokens */\n`;
  for (const [name, value] of Object.entries(tokens.semantic.boxShadow)) {
    css += `  --box-shadow-${name}: ${transformVariableReference(value)};\n`;
  }

  css += `\n  /* Blur Radius Semantic Tokens */\n`;
  for (const [name, value] of Object.entries(tokens.semantic.blurRadius)) {
    css += `  --blur-radius-${name}: ${transformVariableReference(value)};\n`;
  }

  css += `}\n`;

  return css;
}

function generateThemesCSS(tokens) {
  let css = `/* ============================================= */
/*            BDS THEME DEFINITIONS              */
/* ============================================= */
/* Auto-generated from Webflow design tokens     */
/* Source: brik-bds.webflow.css                  */
/* Generated: ${new Date().toISOString()}        */
/* DO NOT EDIT DIRECTLY - Run: node build.js    */
/* ============================================= */

`;

  // Map theme numbers to friendly names for documentation
  // Verified against actual CSS color palettes in Webflow export
  const themeNames = {
    'theme-1': 'Default (Light)',
    'theme-2': 'Dark',
    'theme-3': 'Blue',
    'theme-4': 'Gold',
    'theme-5': 'Peach',
    'theme-6': 'Minimal',
    'theme-7': 'Warm',
    'theme-8': 'Vibrant',
    'theme-brik': 'Brik Brand',
  };

  for (const [themeClass, vars] of Object.entries(tokens.themeClasses)) {
    const themeName = themeNames[themeClass] || themeClass;
    css += `/* ============================================= */\n`;
    css += `/* ${themeName.padEnd(43)} */\n`;
    css += `/* ============================================= */\n`;
    css += `.${themeClass} {\n`;

    // Group variables by category
    const colorVars = {};
    const spaceVars = {};
    const sizeVars = {};
    const typographyVars = {};
    const borderWidthVars = {};
    const borderRadiusVars = {};
    const boxShadowVars = {};
    const blurRadiusVars = {};

    for (const [varName, value] of Object.entries(vars)) {
      if (varName.startsWith('_color---')) {
        colorVars[varName.replace('_color---', '')] = value;
      } else if (varName.startsWith('_space---')) {
        spaceVars[varName.replace('_space---', '')] = value;
      } else if (varName.startsWith('_size---')) {
        sizeVars[varName.replace('_size---', '')] = value;
      } else if (varName.startsWith('_typography---')) {
        typographyVars[varName.replace('_typography---', '')] = value;
      } else if (varName.startsWith('_border-width---')) {
        borderWidthVars[varName.replace('_border-width---', '')] = value;
      } else if (varName.startsWith('_border-radius---')) {
        borderRadiusVars[varName.replace('_border-radius---', '')] = value;
      } else if (varName.startsWith('_box-shadow---')) {
        boxShadowVars[varName.replace('_box-shadow---', '')] = value;
      } else if (varName.startsWith('_blur-radius---')) {
        blurRadiusVars[varName.replace('_blur-radius---', '')] = value;
      }
    }

    // Output grouped variables (preserve BDS naming convention with underscores)
    if (Object.keys(colorVars).length > 0) {
      css += `  /* Color */\n`;
      for (const [name, value] of Object.entries(colorVars)) {
        css += `  --_color---${name}: ${transformVariableReference(value)};\n`;
      }
    }
    if (Object.keys(typographyVars).length > 0) {
      css += `  /* Typography */\n`;
      for (const [name, value] of Object.entries(typographyVars)) {
        css += `  --_typography---${name}: ${transformVariableReference(value)};\n`;
      }
    }
    if (Object.keys(spaceVars).length > 0) {
      css += `  /* Space */\n`;
      for (const [name, value] of Object.entries(spaceVars)) {
        css += `  --_space---${name}: ${transformVariableReference(value)};\n`;
      }
    }
    if (Object.keys(sizeVars).length > 0) {
      css += `  /* Size */\n`;
      for (const [name, value] of Object.entries(sizeVars)) {
        css += `  --_size---${name}: ${transformVariableReference(value)};\n`;
      }
    }
    if (Object.keys(borderWidthVars).length > 0) {
      css += `  /* Border Width */\n`;
      for (const [name, value] of Object.entries(borderWidthVars)) {
        css += `  --_border-width---${name}: ${transformVariableReference(value)};\n`;
      }
    }
    if (Object.keys(borderRadiusVars).length > 0) {
      css += `  /* Border Radius */\n`;
      for (const [name, value] of Object.entries(borderRadiusVars)) {
        css += `  --_border-radius---${name}: ${transformVariableReference(value)};\n`;
      }
    }
    if (Object.keys(boxShadowVars).length > 0) {
      css += `  /* Box Shadow */\n`;
      for (const [name, value] of Object.entries(boxShadowVars)) {
        css += `  --_box-shadow---${name}: ${transformVariableReference(value)};\n`;
      }
    }
    if (Object.keys(blurRadiusVars).length > 0) {
      css += `  /* Blur Radius */\n`;
      for (const [name, value] of Object.entries(blurRadiusVars)) {
        css += `  --_blur-radius---${name}: ${transformVariableReference(value)};\n`;
      }
    }

    css += `}\n\n`;
  }

  return css;
}

// ============================================
// TYPESCRIPT GENERATION
// ============================================

function generateTypeScript(tokens) {
  const themeNumbers = Object.keys(tokens.themeClasses).map(t => t.replace('theme-', ''));

  let ts = `/**
 * BDS Design Token Types
 *
 * Auto-generated from Webflow design tokens
 * Source: brik-bds.webflow.css
 * Generated: ${new Date().toISOString()}
 * DO NOT EDIT DIRECTLY - Run: node build.js
 */

/**
 * Available theme identifiers (maps to .theme-X classes)
 * Verified against actual Webflow CSS color palettes.
 *
 * - theme-1: Default (Light) — :root defaults, blue-green accents
 * - theme-2: Dark — yellow-orange accents, Geist fonts
 * - theme-3: Blue — blue-green accents, IBM Plex Sans
 * - theme-4: Gold — yellow-orange light, Lato
 * - theme-5: Peach — peach-brown tones, Newsreader
 * - theme-6: Minimal — typography-only variant, IBM Plex Sans
 * - theme-7: Warm — tan earth tones, Lato
 * - theme-8: Vibrant — green/purple accents, Playfair Display
 * - theme-brik: Brik Brand — poppy red, Poppins
 */
export type ThemeNumber = ${themeNumbers.map(n => `'${n}'`).join(' | ')};

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
 * Verified against actual CSS color palettes in Webflow export.
 */
export const themeMetadata: Record<ThemeNumber, { name: string; description: string; isDark: boolean }> = {
  '1': { name: 'Default', description: 'Base light theme with blue-green accents (Open Sans)', isDark: false },
  '2': { name: 'Dark', description: 'Dark mode with yellow-orange accents (Geist)', isDark: true },
  '3': { name: 'Blue', description: 'Clean blue accents (IBM Plex Sans / Source Sans 3)', isDark: false },
  '4': { name: 'Gold', description: 'Yellow-orange light accents (Lato / Hind)', isDark: false },
  '5': { name: 'Peach', description: 'Warm peach-brown tones (Newsreader / Open Sans)', isDark: false },
  '6': { name: 'Minimal', description: 'Typography variant, default colors (IBM Plex Sans)', isDark: false },
  '7': { name: 'Warm', description: 'Tan earth tones (Lato / Hind)', isDark: false },
  '8': { name: 'Vibrant', description: 'Bold green and purple accents (Playfair Display / Hind)', isDark: false },
  'brik': { name: 'Brik Brand', description: 'Company brand — poppy red, near-black, tan (Poppins)', isDark: false },
};

/**
 * Generate CSS class string for theme
 */
export function getThemeClasses(config: Partial<BDSThemeConfig>): string {
  const classes: string[] = [];

  if (config.themeNumber && config.themeNumber !== '1') {
    classes.push(\`theme-\${config.themeNumber}\`);
  }

  return classes.join(' ');
}

/**
 * Grayscale color primitives
 */
export const grayscale = ${JSON.stringify(tokens.primitives.grayscale, null, 2)} as const;

/**
 * Theme color palettes
 */
export const themePalettes = ${JSON.stringify(tokens.primitives.themes, null, 2)} as const;

/**
 * Space scale primitives (in px)
 */
export const spaceScale = ${JSON.stringify(tokens.primitives.space, null, 2)} as const;

/**
 * Size scale primitives (in px)
 */
export const sizeScale = ${JSON.stringify(tokens.primitives.size, null, 2)} as const;

/**
 * Border width scale primitives
 */
export const borderWidthScale = ${JSON.stringify(tokens.primitives.borderWidth, null, 2)} as const;

/**
 * Border radius scale primitives
 */
export const borderRadiusScale = ${JSON.stringify(tokens.primitives.borderRadius, null, 2)} as const;

/**
 * Shadow spread scale primitives
 */
export const shadowSpreadScale = ${JSON.stringify(tokens.primitives.shadowSpread, null, 2)} as const;

/**
 * Shadow blur scale primitives
 */
export const shadowBlurScale = ${JSON.stringify(tokens.primitives.shadowBlur, null, 2)} as const;

/**
 * Font size scale primitives
 */
export const fontSizeScale = ${JSON.stringify(tokens.primitives.fontSize, null, 2)} as const;

/**
 * Font weight primitives
 */
export const fontWeights = ${JSON.stringify(tokens.primitives.fontWeight, null, 2)} as const;

/**
 * Font line height primitives
 */
export const fontLineHeights = ${JSON.stringify(tokens.primitives.fontLineHeight, null, 2)} as const;

/**
 * Semantic color tokens (default theme values)
 */
export const semanticColors = ${JSON.stringify(tokens.semantic.color, null, 2)} as const;

/**
 * Semantic space tokens (default values)
 */
export const semanticSpace = ${JSON.stringify(tokens.semantic.space, null, 2)} as const;

/**
 * Semantic typography tokens (default values)
 */
export const semanticTypography = ${JSON.stringify(tokens.semantic.typography, null, 2)} as const;
`;

  return ts;
}

// ============================================
// STORYBOOK THEME GENERATION
// ============================================

/**
 * Build a flat map of all primitive CSS variable names to resolved hex values.
 * Used to resolve var() references in theme definitions to final values.
 */
function buildResolutionMap(tokens) {
  const map = {};

  // Grayscale: --grayscale--X → hex
  for (const [name, value] of Object.entries(tokens.primitives.grayscale)) {
    map[`grayscale--${name}`] = value;
  }

  // Theme palettes: --themes--palette--color → hex
  // Also map the Webflow internal prefix: --_themes---palette--color → hex
  for (const [palette, colors] of Object.entries(tokens.primitives.themes)) {
    for (const [colorName, value] of Object.entries(colors)) {
      map[`themes--${palette}--${colorName}`] = value;
      map[`_themes---${palette}--${colorName}`] = value;
    }
  }

  return map;
}

/**
 * Resolve a CSS value that may contain var() references to a final value.
 * Handles: var(--grayscale--light), var(--themes--peach-brown--peach-lightest),
 * var(--_themes---blue-green--blue-light), and literal values like #333, white, black.
 */
function resolveVar(value, resolutionMap) {
  if (!value) return value;

  // Already a resolved value (hex, named color, etc.)
  const varMatch = value.match(/var\(--([^)]+)\)/);
  if (!varMatch) return value;

  const varName = varMatch[1];
  const resolved = resolutionMap[varName];
  if (resolved) return resolved;

  // Fallback: return the raw value (shouldn't happen for color tokens)
  return value;
}

/**
 * Extract the first font family name from a CSS font-family value.
 * e.g. '"Playfair Display", sans-serif' → 'Playfair Display'
 */
function extractFontFamily(value) {
  if (!value) return null;
  const match = value.match(/["']?([^"',]+)["']?/);
  return match ? match[1].trim() : null;
}

/**
 * Generate storybook-themes.ts with pre-computed resolved hex values
 * for each BDS theme, mapped to Storybook's create() API properties.
 */
function generateStorybookThemes(tokens) {
  const resMap = buildResolutionMap(tokens);

  // Default semantic values from :root (used when themes don't override)
  const defaults = {};
  for (const [name, value] of Object.entries(tokens.semantic.color)) {
    defaults[`color--${name}`] = resolveVar(value, resMap);
  }
  for (const [name, value] of Object.entries(tokens.semantic.typography)) {
    defaults[`typography--${name}`] = value; // Font families are literal strings
  }

  // Theme metadata (must match themeNames in generateThemesCSS)
  const themeMeta = {
    '1': { name: 'Default', isDark: false },
    '2': { name: 'Dark', isDark: true },
    '3': { name: 'Blue', isDark: false },
    '4': { name: 'Gold', isDark: false },
    '5': { name: 'Peach', isDark: false },
    '6': { name: 'Minimal', isDark: false },
    '7': { name: 'Warm', isDark: false },
    '8': { name: 'Vibrant', isDark: false },
    'brik': { name: 'Brik Brand', isDark: false },
  };

  // For each theme, resolve color overrides and build Storybook theme config
  const sbThemes = {};

  for (const [themeClass, vars] of Object.entries(tokens.themeClasses)) {
    const themeNum = themeClass.replace('theme-', '');
    const meta = themeMeta[themeNum] || { name: themeClass, isDark: false };

    // Build resolved color map: start with defaults, overlay theme overrides
    const resolved = { ...defaults };
    for (const [varName, rawValue] of Object.entries(vars)) {
      if (varName.startsWith('_color---')) {
        const name = `color--${varName.replace('_color---', '')}`;
        resolved[name] = resolveVar(rawValue, resMap);
      } else if (varName.startsWith('_typography---')) {
        const name = `typography--${varName.replace('_typography---', '')}`;
        resolved[name] = rawValue;
      }
    }

    // Map BDS tokens → Storybook create() properties
    const fontBase = resolved['typography--font-family--body']
      || defaults['typography--font-family--body']
      || '"Open Sans", sans-serif';

    sbThemes[themeNum] = {
      base: meta.isDark ? 'dark' : 'light',
      name: meta.name,
      colorPrimary: resolved['color--theme--primary'] || '#4665f5',
      colorSecondary: resolved['color--theme--primary'] || '#4665f5',
      appBg: resolved['color--page--primary'] || '#ffffff',
      appContentBg: resolved['color--surface--primary'] || '#ffffff',
      appPreviewBg: 'transparent',
      appBorderColor: resolved['color--border--secondary'] || '#e0e0e0',
      textColor: resolved['color--text--primary'] || '#333333',
      textInverseColor: resolved['color--text--inverse'] || '#ffffff',
      textMutedColor: resolved['color--text--muted'] || '#828282',
      barTextColor: resolved['color--text--muted'] || '#828282',
      barSelectedColor: resolved['color--theme--primary'] || '#4665f5',
      barHoverColor: resolved['color--theme--primary'] || '#4665f5',
      barBg: resolved['color--surface--nav'] || '#ffffff',
      inputBg: resolved['color--background--input'] || '#ffffff',
      inputBorder: resolved['color--border--input'] || '#bdbdbd',
      inputTextColor: resolved['color--text--primary'] || '#333333',
      fontBase: fontBase,
    };
  }

  // Generate TypeScript output
  let ts = `/**
 * Storybook Manager Theme Configs
 *
 * Auto-generated — resolved hex values for each BDS theme,
 * mapped to Storybook's create() API properties.
 *
 * Generated: ${new Date().toISOString()}
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

export const storybookThemes: Record<ThemeNumber, StorybookThemeConfig> = ${JSON.stringify(sbThemes, null, 2)};
`;

  return ts;
}

// ============================================
// TOKEN VALIDATION
// ============================================

/**
 * Required semantic color tokens.
 * If any of these are missing from the parsed CSS, the build warns.
 * This catches drift between Figma exports and the Webflow CSS source.
 */
const REQUIRED_SEMANTIC_COLORS = [
  // Page (page--accent and system--link are portal-level brand tokens, not BDS)
  'page--primary', 'page--secondary',
  // Text
  'text--primary', 'text--secondary', 'text--muted', 'text--inverse', 'text--on-color-dark', 'text--on-color-light', 'text--brand',
  // Surface
  'surface--primary', 'surface--secondary', 'surface--brand-primary',
  // Background
  'background--brand-primary', 'background--primary', 'background--secondary',
  'background--inverse', 'background--input',
  // Border
  'border--primary', 'border--secondary', 'border--muted', 'border--brand',
  'border--input', 'border--inverse', 'border--on-color',
];

const REQUIRED_SEMANTIC_TYPOGRAPHY = [
  'font-family--body', 'font-family--heading', 'font-family--label',
  'body--sm', 'body--md-base', 'body--lg',
  'heading--small', 'heading--medium', 'heading--large',
];

function validateTokens(tokens) {
  let warnings = 0;

  console.log('\n🔎 Validating required tokens...');

  // Check semantic colors
  for (const token of REQUIRED_SEMANTIC_COLORS) {
    if (!(token in tokens.semantic.color)) {
      console.log(`   ⚠️  MISSING semantic color: --_color---${token}`);
      warnings++;
    }
  }

  // Check semantic typography
  for (const token of REQUIRED_SEMANTIC_TYPOGRAPHY) {
    if (!(token in tokens.semantic.typography)) {
      console.log(`   ⚠️  MISSING semantic typography: --_typography---${token}`);
      warnings++;
    }
  }

  // Check theme count
  const themeCount = Object.keys(tokens.themeClasses).length;
  if (themeCount < 8) {
    console.log(`   ⚠️  Expected 8 theme classes, found ${themeCount}`);
    warnings++;
  }

  // Check themes that define border--input also define border--muted
  // (themes inheriting everything from :root don't need to redeclare)
  for (const [themeClass, vars] of Object.entries(tokens.themeClasses)) {
    if ('_color---border--input' in vars && !('_color---border--muted' in vars)) {
      console.log(`   ⚠️  ${themeClass} has border--input but missing border--muted`);
      warnings++;
    }
  }

  if (warnings === 0) {
    console.log('   ✅ All required tokens present');
  } else {
    console.log(`\n   ⚠️  ${warnings} validation warning(s) — check Webflow CSS source`);
  }

  return warnings;
}

// ============================================
// MAIN BUILD
// ============================================

console.log('🔧 BDS Token Build Pipeline\n');
console.log(`📖 Reading: ${WEBFLOW_CSS}\n`);

// Parse Webflow CSS
console.log('🔍 Parsing Webflow CSS...');
const tokens = parseWebflowCSS();
console.log(`   ✅ Found ${Object.keys(tokens.themeClasses).length} theme classes`);
console.log(`   ✅ Found ${Object.keys(tokens.primitives.grayscale).length} grayscale colors`);
console.log(`   ✅ Found ${Object.keys(tokens.primitives.themes).length} theme palettes`);
console.log(`   ✅ Found ${Object.keys(tokens.primitives.space).length} space scale values`);
console.log(`   ✅ Found ${Object.keys(tokens.semantic.color).length} semantic color tokens`);
console.log(`   ✅ Found ${Object.keys(tokens.semantic.typography).length} semantic typography tokens`);

// Validate parsed tokens against expected set
const validationWarnings = validateTokens(tokens);

// Generate variables.css
console.log('\n📦 Generating variables.css...');
const variablesCSS = generateVariablesCSS(tokens);
fs.writeFileSync(path.join(OUTPUT_DIR, 'variables.css'), variablesCSS);
console.log('   ✅ variables.css written');

// Generate themes.css
console.log('📦 Generating themes.css...');
const themesCSS = generateThemesCSS(tokens);
fs.writeFileSync(path.join(OUTPUT_DIR, 'themes.css'), themesCSS);
console.log('   ✅ themes.css written');

// Generate index.ts
console.log('📦 Generating index.ts...');
const typescript = generateTypeScript(tokens);
fs.writeFileSync(path.join(OUTPUT_DIR, 'index.ts'), typescript);
console.log('   ✅ index.ts written');

// Generate storybook-themes.ts (resolved hex values for manager frame)
console.log('📦 Generating storybook-themes.ts...');
const sbThemes = generateStorybookThemes(tokens);
fs.writeFileSync(path.join(OUTPUT_DIR, 'storybook-themes.ts'), sbThemes);
console.log('   ✅ storybook-themes.ts written');

console.log('\n✨ Token build complete!\n');
console.log('Files generated:');
console.log(`  - ${path.join(OUTPUT_DIR, 'variables.css')}`);
console.log(`  - ${path.join(OUTPUT_DIR, 'themes.css')}`);
console.log(`  - ${path.join(OUTPUT_DIR, 'index.ts')}`);
console.log(`  - ${path.join(OUTPUT_DIR, 'storybook-themes.ts')}`);
