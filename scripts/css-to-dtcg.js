#!/usr/bin/env node
/**
 * CSS → DTCG Token Extraction
 *
 * Parses the Webflow CSS export and produces W3C Design Tokens Community Group
 * (DTCG) format JSON. This canonical format is consumed by Style Dictionary
 * to generate platform-specific outputs (CSS, Swift, Kotlin, etc.).
 *
 * Source: updates/brik-bds.webflow/css/brik-bds.webflow.css
 * Output: design-tokens/tokens.json (full) + per-category files
 *
 * Zero dependencies — uses only Node.js stdlib.
 */

const fs = require('fs');
const path = require('path');

const WEBFLOW_CSS = path.join(__dirname, '../updates/brik-bds.webflow/css/brik-bds.webflow.css');
const OUTPUT_DIR = path.join(__dirname, '../design-tokens');
const THEMES_DIR = path.join(OUTPUT_DIR, 'themes');

// ─── CSS Parsing ─────────────────────────────────────────────────

function parseCSS() {
  const css = fs.readFileSync(WEBFLOW_CSS, 'utf8');

  // Extract :root block
  const rootMatch = css.match(/:root\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/);
  const rootVars = rootMatch ? parseVarBlock(rootMatch[1]) : {};

  // Extract .body block (spacious mode overrides)
  const bodyMatch = css.match(/\.body\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/);
  const bodyVars = bodyMatch ? parseVarBlock(bodyMatch[1]) : {};

  // Extract theme class blocks
  const themes = {};
  const themeRegex = /\.body\.theme-([\w-]+)\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/g;
  let match;
  while ((match = themeRegex.exec(css)) !== null) {
    themes[match[1]] = parseVarBlock(match[2]);
  }

  return { rootVars, bodyVars, themes };
}

function parseVarBlock(content) {
  const vars = {};
  const regex = /--([a-zA-Z0-9_<>|-]+):\s*([^;]+);/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    let name = match[1].replace(/<deleted\|[^>]+>/g, '');
    let value = match[2].trim();
    // Skip deleted/untitled variables
    if (name.startsWith('untitled')) continue;
    vars[name] = value;
  }
  return vars;
}

// ─── DTCG Token Building ─────────────────────────────────────────

/**
 * Resolve a CSS value to a DTCG $value.
 * - var(--foo--bar) → "{foo.bar}" (DTCG reference)
 * - raw values → kept as-is
 */
function toDTCGValue(cssValue) {
  // Handle var() references
  const varRef = cssValue.match(/^var\(--([^)]+)\)$/);
  if (varRef) {
    return `{${cssNameToDTCGPath(varRef[1])}}`;
  }
  return cssValue;
}

/**
 * Convert a CSS variable name to a DTCG dot-path.
 * --_color---text--primary → color.text.primary
 * --grayscale--dark → grayscale.dark
 * --font-size--300 → font-size.300
 * --_themes---blue-green--blue-light → themes.blue-green.blue-light
 */
function cssNameToDTCGPath(cssName) {
  // Semantic tokens: _category---type--variant
  if (cssName.startsWith('_')) {
    const withoutUnderscore = cssName.slice(1);
    const parts = withoutUnderscore.split('---');
    const category = parts[0];
    const rest = parts[1] || '';
    const subParts = rest.split('--');
    return [category, ...subParts].filter(Boolean).join('.');
  }
  // Primitives: category--name
  const parts = cssName.split('--');
  return parts.filter(Boolean).join('.');
}

/**
 * Infer DTCG $type from CSS value and variable name.
 */
function inferType(name, value) {
  // Color tokens
  if (name.startsWith('_color---') || name.startsWith('grayscale--') || name.startsWith('_themes---')) {
    return 'color';
  }
  if (value.startsWith('#') || value.startsWith('rgb') || value.startsWith('hsl')) {
    return 'color';
  }
  // Font family
  if (name.startsWith('font-family--') || name.startsWith('_typography---font-family')) {
    return 'fontFamily';
  }
  // Font weight
  if (name.startsWith('font-weight--')) {
    return 'fontWeight';
  }
  // Font size / typography size tokens
  if (name.startsWith('font-size--') || name.startsWith('_typography---')) {
    return 'dimension';
  }
  // Line height (percentages)
  if (name.startsWith('font-line-height--')) {
    return 'number';
  }
  // Space / size / dimension tokens
  if (name.startsWith('space--') || name.startsWith('size--') ||
      name.startsWith('_space---') || name.startsWith('_size---') ||
      name.startsWith('border-width--') || name.startsWith('border-radius--') ||
      name.startsWith('_border-width---') || name.startsWith('_border-radius---') ||
      name.startsWith('shadow-spread--') || name.startsWith('shadow-blur--') || name.startsWith('shadow-offset--')) {
    return 'dimension';
  }
  // Box shadow
  if (name.startsWith('_box-shadow---')) {
    return 'dimension';
  }
  // Blur radius
  if (name.startsWith('_blur-radius---')) {
    return 'dimension';
  }
  return undefined;
}

/**
 * Set a value at a dot-separated path in a nested object.
 */
function setNestedValue(obj, dotPath, value) {
  const parts = dotPath.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    if (!current[key] || typeof current[key] !== 'object' || current[key].$value !== undefined) {
      current[key] = {};
    }
    current = current[key];
  }
  current[parts[parts.length - 1]] = value;
}

/**
 * Build DTCG tokens object from parsed CSS variables.
 */
function buildDTCG(vars) {
  const tokens = {};

  for (const [cssName, cssValue] of Object.entries(vars)) {
    const dotPath = cssNameToDTCGPath(cssName);
    const dtcgValue = toDTCGValue(cssValue);
    const type = inferType(cssName, cssValue);
    const isSemantic = cssName.startsWith('_');

    const token = { $value: dtcgValue };
    if (type) token.$type = type;
    if (isSemantic) {
      token.$extensions = { 'com.brikdesigns.bds': { semantic: true } };
    }

    setNestedValue(tokens, dotPath, token);
  }

  return tokens;
}

/**
 * Build theme override tokens (only include tokens that differ from :root).
 */
function buildThemeDTCG(themeVars) {
  const tokens = {};

  for (const [cssName, cssValue] of Object.entries(themeVars)) {
    const dotPath = cssNameToDTCGPath(cssName);
    const dtcgValue = toDTCGValue(cssValue);
    const type = inferType(cssName, cssValue);
    const isSemantic = cssName.startsWith('_');

    const token = { $value: dtcgValue };
    if (type) token.$type = type;
    if (isSemantic) {
      token.$extensions = { 'com.brikdesigns.bds': { semantic: true } };
    }

    setNestedValue(tokens, dotPath, token);
  }

  return tokens;
}

// ─── Category Splitting ──────────────────────────────────────────

/**
 * Extract tokens matching a top-level key prefix into a separate object.
 */
function extractCategory(tokens, ...keys) {
  const result = {};
  for (const key of keys) {
    if (tokens[key]) {
      result[key] = tokens[key];
    }
  }
  return result;
}

// ─── Main ────────────────────────────────────────────────────────

console.log('Extracting DTCG tokens from Webflow CSS...\n');

const { rootVars, bodyVars, themes } = parseCSS();

console.log(`  :root variables: ${Object.keys(rootVars).length}`);
console.log(`  .body overrides: ${Object.keys(bodyVars).length}`);
console.log(`  Theme classes: ${Object.keys(themes).length}`);

// Build core tokens from :root
const coreTokens = buildDTCG(rootVars);

// Count tokens
let tokenCount = 0;
function countTokens(obj) {
  for (const value of Object.values(obj)) {
    if (value && typeof value === 'object') {
      if (value.$value !== undefined) tokenCount++;
      else countTokens(value);
    }
  }
}
countTokens(coreTokens);
console.log(`  DTCG tokens generated: ${tokenCount}`);

// Write full tokens.json
fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.writeFileSync(
  path.join(OUTPUT_DIR, 'tokens.json'),
  JSON.stringify(coreTokens, null, 2) + '\n'
);
console.log(`\n  Written: design-tokens/tokens.json`);

// Write per-category files
const categories = {
  'color.json': extractCategory(coreTokens, 'color', 'grayscale', 'themes'),
  'typography.json': extractCategory(coreTokens, 'typography', 'font-size', 'font-weight', 'font-line-height', 'font-family'),
  'space.json': extractCategory(coreTokens, 'space', 'size'),
  'border.json': extractCategory(coreTokens, 'border-width', 'border-radius'),
  'shadow.json': extractCategory(coreTokens, 'shadow-spread', 'shadow-blur', 'shadow-offset', 'box-shadow', 'blur-radius'),
};

for (const [filename, data] of Object.entries(categories)) {
  if (Object.keys(data).length > 0) {
    fs.writeFileSync(
      path.join(OUTPUT_DIR, filename),
      JSON.stringify(data, null, 2) + '\n'
    );
    console.log(`  Written: design-tokens/${filename}`);
  }
}

// Write theme overrides
fs.mkdirSync(THEMES_DIR, { recursive: true });
for (const [themeName, themeVars] of Object.entries(themes)) {
  const themeDir = path.join(THEMES_DIR, `theme-${themeName}`);
  fs.mkdirSync(themeDir, { recursive: true });
  const themeTokens = buildThemeDTCG(themeVars);
  fs.writeFileSync(
    path.join(themeDir, 'overrides.json'),
    JSON.stringify(themeTokens, null, 2) + '\n'
  );
  console.log(`  Written: design-tokens/themes/theme-${themeName}/overrides.json`);
}

// Write .body overrides (spacious mode)
if (Object.keys(bodyVars).length > 0) {
  const spaciousDir = path.join(THEMES_DIR, 'spacious');
  fs.mkdirSync(spaciousDir, { recursive: true });
  const spaciousTokens = buildThemeDTCG(bodyVars);
  fs.writeFileSync(
    path.join(spaciousDir, 'overrides.json'),
    JSON.stringify(spaciousTokens, null, 2) + '\n'
  );
  console.log(`  Written: design-tokens/themes/spacious/overrides.json`);
}

// Update metadata
fs.writeFileSync(
  path.join(OUTPUT_DIR, 'metadata.json'),
  JSON.stringify({
    source: 'updates/brik-bds.webflow/css/brik-bds.webflow.css',
    format: 'W3C Design Tokens (DTCG)',
    generatedAt: new Date().toISOString(),
    tokenCount,
    themes: Object.keys(themes).map(t => `theme-${t}`),
  }, null, 2) + '\n'
);

console.log(`\nDone. ${tokenCount} tokens extracted.\n`);
