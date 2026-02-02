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

  // Extract theme class definitions
  const themeClassRegex = /\.body\.theme-(\d+)\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/g;
  let match;
  while ((match = themeClassRegex.exec(css)) !== null) {
    const themeNum = match[1];
    const themeContent = match[2];
    result.themeClasses[`theme-${themeNum}`] = parseThemeVariables(themeContent);
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
  const themeNames = {
    'theme-1': 'Blue-Green (Default Light)',
    'theme-2': 'Yellow-Orange (Dark)',
    'theme-3': 'Peach-Brown',
    'theme-4': 'Yellow-Brown',
    'theme-5': 'Green-Orange',
    'theme-6': 'Blue-Orange',
    'theme-7': 'Neon',
    'theme-8': 'Vibrant',
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

    // Output grouped variables (transform variable references to match our naming)
    if (Object.keys(colorVars).length > 0) {
      css += `  /* Color */\n`;
      for (const [name, value] of Object.entries(colorVars)) {
        css += `  --color-${name.replace(/--/g, '-')}: ${transformVariableReference(value)};\n`;
      }
    }
    if (Object.keys(typographyVars).length > 0) {
      css += `  /* Typography */\n`;
      for (const [name, value] of Object.entries(typographyVars)) {
        css += `  --typography-${name.replace(/--/g, '-')}: ${transformVariableReference(value)};\n`;
      }
    }
    if (Object.keys(spaceVars).length > 0) {
      css += `  /* Space */\n`;
      for (const [name, value] of Object.entries(spaceVars)) {
        css += `  --layout-${name.replace(/--/g, '-')}: ${transformVariableReference(value)};\n`;
      }
    }
    if (Object.keys(sizeVars).length > 0) {
      css += `  /* Size */\n`;
      for (const [name, value] of Object.entries(sizeVars)) {
        css += `  --size-${name.replace(/--/g, '-')}: ${transformVariableReference(value)};\n`;
      }
    }
    if (Object.keys(borderWidthVars).length > 0) {
      css += `  /* Border Width */\n`;
      for (const [name, value] of Object.entries(borderWidthVars)) {
        css += `  --border-width-${name}: ${transformVariableReference(value)};\n`;
      }
    }
    if (Object.keys(borderRadiusVars).length > 0) {
      css += `  /* Border Radius */\n`;
      for (const [name, value] of Object.entries(borderRadiusVars)) {
        css += `  --border-radius-${name.replace(/--/g, '-')}: ${transformVariableReference(value)};\n`;
      }
    }
    if (Object.keys(boxShadowVars).length > 0) {
      css += `  /* Box Shadow */\n`;
      for (const [name, value] of Object.entries(boxShadowVars)) {
        css += `  --box-shadow-${name}: ${transformVariableReference(value)};\n`;
      }
    }
    if (Object.keys(blurRadiusVars).length > 0) {
      css += `  /* Blur Radius */\n`;
      for (const [name, value] of Object.entries(blurRadiusVars)) {
        css += `  --blur-radius-${name}: ${transformVariableReference(value)};\n`;
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
 * Available theme numbers (maps to .theme-X classes)
 * - theme-1: Blue-Green (Default Light)
 * - theme-2: Yellow-Orange (Dark)
 * - theme-3: Peach-Brown
 * - theme-4: Yellow-Brown
 * - theme-5: Green-Orange
 * - theme-6: Blue-Orange
 * - theme-7: Neon
 * - theme-8: Vibrant
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

console.log('\n✨ Token build complete!\n');
console.log('Files generated:');
console.log(`  - ${path.join(OUTPUT_DIR, 'variables.css')}`);
console.log(`  - ${path.join(OUTPUT_DIR, 'themes.css')}`);
console.log(`  - ${path.join(OUTPUT_DIR, 'index.ts')}`);
