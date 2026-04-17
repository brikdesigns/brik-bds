#!/usr/bin/env node

/**
 * BDS Token Validation Linter
 *
 * Validates CSS variable usage in BDS components against Style Dictionary token outputs.
 * Catches four types of violations:
 *   1. Primitive token usage (use semantic tokens instead)
 *   2. Hardcoded CSS values (use tokens)
 *   3. Unknown tokens (typos or non-existent variables)
 *   4. Spacing values not aligned to 4-point grid (see docs/GRID-SYSTEM.md)
 *
 * Usage:
 *   node scripts/lint-tokens.js              # full report (errors + warnings)
 *   node scripts/lint-tokens.js --errors-only # errors only (for CI)
 *   node scripts/lint-tokens.js --check-grid  # grid adherence warnings
 *
 * Exit codes:
 *   0 = no errors (warnings OK)
 *   1 = errors found
 */

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const SD_CSS_PATH = path.join(
  __dirname, '..', 'build', 'figma', 'css', 'variables.css'
);
const COMPONENTS_DIR = path.join(__dirname, '..', 'components', 'ui');

// Primitive token prefixes that should be replaced with semantic equivalents
// Covers both Webflow (double-dash) and SD (single-dash) naming
const PRIMITIVE_PREFIXES = {
  '--font-size--': '--body-* / --heading-* / --label-*',
  '--font-size-': '--body-* / --heading-* / --label-*',
  '--space--': '--padding-* / --gap-*',
  '--space-': '--padding-* / --gap-*',
  '--grayscale--': '--text-* / --background-* / --surface-*',
  '--color-grayscale-': '--text-* / --background-* / --surface-*',
  '--color-system-': '--background-positive/negative/warning or --text-positive/negative/warning',
  '--border-radius--': '--border-radius-*',
  '--border-width--': '--border-width-*',
  '--size--': '--size-*',
};

// These primitive prefixes are acceptable in components (no semantic layer above them)
const ALLOWED_PRIMITIVES = new Set([
  '--font-weight--',
  '--font-weight-',
  '--font-line-height--',
  '--font-line-height-',
  '--color-annotation-',
  '--_themes---',
  '--theme-',
]);

// ---------------------------------------------------------------------------
// Grid System Configuration (4-point base)
// ---------------------------------------------------------------------------
// Valid spacing values (in pixels). All must be multiples of 4.
// See docs/GRID-SYSTEM.md for details.

const VALID_SPACING_VALUES = {
  // Primitives: --space--[index]: [value]
  '1': '0px',
  '25': '1px',    // ⚠ Micro adjustment - not 4-point aligned
  '50': '2px',    // ⚠ Micro adjustment - not 4-point aligned
  '100': '4px',
  '150': '6px',   // ⚠ Not 4-point aligned (1.5 × 4)
  '200': '8px',
  '250': '10px',  // ⚠ Not 4-point aligned (2.5 × 4)
  '300': '12px',
  '350': '14px',  // ⚠ Not 4-point aligned (3.5 × 4)
  '400': '16px',
  '450': '18px',  // ⚠ Not 4-point aligned (4.5 × 4)
  '500': '20px',
  '600': '24px',
  '700': '28px',
  '800': '32px',
  '900': '36px',
  '1000': '40px',
  '1100': '44px',
  '1200': '48px',
  '1300': '52px',
  '1400': '56px',
  '1500': '60px',
  '1600': '64px',
  '1700': '72px',
  '1800': '80px',
  '1900': '84px',
  '2000': '88px',
  '2100': '96px',
  '2200': '104px',
  '2300': '112px',
  '2400': '128px',
  '2500': '136px',
};

// Extract pixel values and track which ones are NOT 4-point aligned
const SPACING_PX_VALUES = new Map();
const GRID_VIOLATIONS = new Set();

for (const [index, value] of Object.entries(VALID_SPACING_VALUES)) {
  const match = value.match(/^(\d+)px$/);
  if (match) {
    const px = parseInt(match[1], 10);
    SPACING_PX_VALUES.set(px, index);
    
    // Check 4-point alignment (must be divisible by 4)
    if (px > 0 && px % 4 !== 0) {
      GRID_VIOLATIONS.add(px);
    }
  }
}


// fontWeight numeric → token mapping
const FONT_WEIGHT_MAP = {
  '300': '--font-weight--light',
  '400': '--font-weight--regular',
  '500': '--font-weight--medium',
  '600': '--font-weight--semi-bold',
  '700': '--font-weight--bold',
  '800': '--font-weight--extra-bold',
  '900': '--font-weight--black',
};

// lineHeight numeric → token mapping
const LINE_HEIGHT_MAP = {
  '0': '--font-line-height--none',
  '1': '--font-line-height--100',
  '1.1': '--font-line-height--100',
  '1.25': '--font-line-height--125',
  '1.4': '--font-line-height--150',
  '1.5': '--font-line-height--150',
  '1.75': '--font-line-height--175',
  '2': '--font-line-height--200',
};

// Properties that are never checked for hardcoded values (layout mechanics)
const SKIP_PROPERTIES = new Set([
  'display', 'position', 'flexDirection', 'alignItems', 'justifyContent',
  'flexWrap', 'overflow', 'overflowY', 'overflowX', 'whiteSpace',
  'textDecoration', 'textTransform', 'textAlign', 'verticalAlign',
  'userSelect', 'pointerEvents', 'cursor', 'opacity', 'zIndex',
  'transform', 'transition', 'animation', 'backdropFilter', 'filter',
  'letterSpacing', 'flex', 'flexShrink', 'flexGrow', 'flexBasis',
  'gridTemplateColumns', 'gridTemplateRows', 'gridColumn', 'gridRow',
  'gridArea', 'top', 'left', 'right', 'bottom', 'outline',
  'color', 'backgroundColor', 'borderColor', 'boxShadow', 'content',
  'visibility', 'resize', 'appearance', 'WebkitAppearance',
  'width', 'height', 'maxWidth', 'minWidth', 'maxHeight', 'minHeight',
  'boxSizing', 'objectFit', 'objectPosition', 'tableLayout',
  'borderCollapse', 'borderSpacing', 'listStyle', 'listStyleType',
]);

// Specific line patterns to allowlist (won't be flagged)
const LINE_ALLOWLIST = [
  "borderRadius: '9999px'",
  "borderRadius: '999px'",
  "borderRadius: '50%'",
  'border: \'none\'',
  'background: \'none\'',
  'background: \'transparent\'',
  'backgroundColor: \'transparent\'',
];

// ---------------------------------------------------------------------------
// Token parser — reads Webflow CSS and extracts all valid custom properties
// ---------------------------------------------------------------------------

function parseCssTokens() {
  const allTokens = new Set();
  const semanticTokens = new Set();
  const primitiveTokens = new Set();

  // SD semantic token prefixes (tokens that are purpose-bound, not raw scale values)
  const SD_SEMANTIC_PREFIXES = [
    '--padding-', '--gap-', '--text-', '--background-', '--surface-',
    '--border-primary', '--border-secondary', '--border-muted', '--border-brand',
    '--border-input', '--border-inverse', '--border-on-color', '--border-width-',
    '--border-radius-', '--page-', '--body-', '--label-', '--heading-',
    '--display-', '--subtitle-', '--icon-', '--font-family-', '--box-shadow-',
    '--blur-radius-', '--size-',
  ];

  // Load tokens from a CSS file
  function loadFromCss(cssPath) {
    const css = fs.readFileSync(cssPath, 'utf8');
    const lines = css.split('\n');

    let i = 0;
    while (i < lines.length) {
      const line = lines[i];

      if (/^(:root|\.body)\s*\{/.test(line) || /^\.body\.theme-\d+/.test(line)) {
        i++;
        let braceDepth = 1;
        while (i < lines.length && braceDepth > 0) {
          if (lines[i].includes('{')) braceDepth++;
          if (lines[i].includes('}')) braceDepth--;

          const match = lines[i].match(/^\s*(--[\w-]+)/);
          if (match) {
            const tokenName = match[1];
            allTokens.add(tokenName);

            // Webflow semantic tokens start with --_
            if (tokenName.startsWith('--_')) {
              semanticTokens.add(tokenName);
            } else {
              // SD tokens: check prefix to classify
              const isSemantic = SD_SEMANTIC_PREFIXES.some(p => tokenName.startsWith(p));
              if (isSemantic) {
                semanticTokens.add(tokenName);
              } else {
                primitiveTokens.add(tokenName);
              }
            }
          }
          i++;
        }
        continue;
      }
      i++;
    }
  }

  // Load Style Dictionary tokens (SD naming convention)
  if (fs.existsSync(SD_CSS_PATH)) {
    loadFromCss(SD_CSS_PATH);
  }

  // Load token files
  const FIGMA_TOKENS = path.join(__dirname, '..', 'tokens', 'figma-tokens.css');
  const GAP_FILLS = path.join(__dirname, '..', 'tokens', 'gap-fills.css');
  const BRIDGE = path.join(__dirname, '..', 'tokens', 'bridge.css');
  if (fs.existsSync(FIGMA_TOKENS)) loadFromCss(FIGMA_TOKENS);
  if (fs.existsSync(GAP_FILLS)) loadFromCss(GAP_FILLS);
  if (fs.existsSync(BRIDGE)) loadFromCss(BRIDGE);

  // Ensure at least one token source was loaded
  if (allTokens.size === 0) {
    console.error('ERROR: No token sources found. Need at least one of:');
    console.error(`  - ${SD_CSS_PATH}`);
    console.error(`  - ${FIGMA_TOKENS}`);
    process.exit(1);
  }

  return { allTokens, semanticTokens, primitiveTokens };
}

// ---------------------------------------------------------------------------
// File discovery
// ---------------------------------------------------------------------------

function findFiles(dir, pattern) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findFiles(fullPath, pattern));
    } else if (pattern.test(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

// ---------------------------------------------------------------------------
// Rules
// ---------------------------------------------------------------------------

/**
 * Rule 1: Primitive token usage
 * Flags var(--font-size--*), var(--space--*), etc. in component code
 */
function checkPrimitiveTokens(line, lineNum, file, isComponent) {
  const violations = [];
  const regex = /var\((--[\w-]+?)--([^)]+)\)/g;
  let match;

  while ((match = regex.exec(line)) !== null) {
    const fullToken = `${match[1]}--${match[2]}`;

    // Skip if this is an allowed primitive (font-weight, line-height, system, themes)
    let isAllowed = false;
    for (const allowed of ALLOWED_PRIMITIVES) {
      if (fullToken.startsWith(allowed.slice(2))) { // strip leading --
        isAllowed = true;
        break;
      }
    }
    if (isAllowed) continue;

    // Check if it matches a primitive prefix that has a semantic alternative
    for (const [primPrefix, semanticSuggestion] of Object.entries(PRIMITIVE_PREFIXES)) {
      if ((`--${fullToken}`).startsWith(primPrefix)) {
        violations.push({
          rule: 'primitive-token',
          severity: isComponent ? 'error' : 'warning',
          file,
          line: lineNum,
          column: match.index + 1,
          message: `Primitive token "var(--${fullToken})" — use a semantic token instead`,
          suggestion: `Replace with var(${semanticSuggestion})`,
        });
        break;
      }
    }
  }

  return violations;
}

/**
 * Rule 2: Hardcoded values in style objects
 * Flags numeric fontWeight, lineHeight, and px values in tokenizable properties
 */
function checkHardcodedValues(line, lineNum, file, isComponent) {
  const violations = [];

  // Skip comment lines
  const trimmed = line.trim();
  if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) {
    return violations;
  }

  // Skip allowlisted patterns
  for (const pattern of LINE_ALLOWLIST) {
    if (line.includes(pattern)) return violations;
  }

  // Skip bds-lint-ignore lines
  if (line.includes('bds-lint-ignore')) return violations;

  // --- fontWeight: numeric ---
  // Must NOT flag: fontWeight: 'var(--font-weight--semi-bold)' as unknown as number
  const fwMatch = line.match(/fontWeight:\s*(\d+)\s*[,}\n]/);
  if (fwMatch && !line.includes('as unknown as number')) {
    const val = fwMatch[1];
    const token = FONT_WEIGHT_MAP[val] || '--font-weight--*';
    violations.push({
      rule: 'hardcoded-value',
      severity: isComponent ? 'error' : 'warning',
      file,
      line: lineNum,
      column: fwMatch.index + 1,
      message: `Hardcoded fontWeight: ${val}`,
      suggestion: `Use: fontWeight: 'var(${token})' as unknown as number`,
    });
  }

  // --- lineHeight: numeric ---
  const lhMatch = line.match(/lineHeight:\s*([\d.]+)\s*[,}\n]/);
  if (lhMatch && !line.includes('var(--font-line-height')) {
    const val = lhMatch[1];
    const token = LINE_HEIGHT_MAP[val] || '--font-line-height--*';
    violations.push({
      rule: 'hardcoded-value',
      severity: isComponent ? 'error' : 'warning',
      file,
      line: lineNum,
      column: lhMatch.index + 1,
      message: `Hardcoded lineHeight: ${val}`,
      suggestion: `Use: lineHeight: 'var(${token})'`,
    });
  }

  // --- fontSize with hardcoded px/rem ---
  const fsMatch = line.match(/fontSize:\s*['"](\d+(?:\.\d+)?(?:px|rem|em))['"]/);
  if (fsMatch) {
    violations.push({
      rule: 'hardcoded-value',
      severity: isComponent ? 'error' : 'warning',
      file,
      line: lineNum,
      column: fsMatch.index + 1,
      message: `Hardcoded fontSize: '${fsMatch[1]}'`,
      suggestion: `Use a typography token: var(--body-*) or var(--heading-*)`,
    });
  }

  // --- fontSize with bare number ---
  const fsNumMatch = line.match(/fontSize:\s*(\d+)\s*[,}\n]/);
  if (fsNumMatch && !line.includes('var(')) {
    violations.push({
      rule: 'hardcoded-value',
      severity: isComponent ? 'error' : 'warning',
      file,
      line: lineNum,
      column: fsNumMatch.index + 1,
      message: `Hardcoded fontSize: ${fsNumMatch[1]}`,
      suggestion: `Use a typography token: var(--body-*) or var(--heading-*)`,
    });
  }

  // --- padding/margin/gap with hardcoded px ---
  const spacingProps = [
    'padding', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight',
    'margin', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight',
    'gap', 'rowGap', 'columnGap', 'borderRadius',
  ];

  for (const prop of spacingProps) {
    // Match property: 'Npx' pattern
    const propRegex = new RegExp(`${prop}:\\s*'(\\d+(?:\\.\\d+)?px)'`);
    const spMatch = line.match(propRegex);
    if (spMatch) {
      // Allow 9999px and 999px for pill radius
      if (prop === 'borderRadius' && (spMatch[1] === '9999px' || spMatch[1] === '999px')) continue;

      const category = prop === 'borderRadius'
        ? 'var(--border-radius-*)'
        : prop === 'gap' || prop === 'rowGap' || prop === 'columnGap'
          ? 'var(--gap-*)'
          : 'var(--padding-*)';

      violations.push({
        rule: 'hardcoded-value',
        severity: isComponent ? 'error' : 'warning',
        file,
        line: lineNum,
        column: spMatch.index + 1,
        message: `Hardcoded ${prop}: '${spMatch[1]}'`,
        suggestion: `Use a spacing token: ${category}`,
      });
    }
  }

  return violations;
}

/**
 * Rule 3: Unknown tokens
 * Flags any var(--...) reference that doesn't exist in the Webflow CSS
 */
function checkUnknownTokens(line, lineNum, file, tokens, isComponent) {
  const violations = [];
  const regex = /var\((--[\w-]+)(?:\s*,\s*[^)]+)?\)/g;
  let match;

  // Skip comment lines
  const trimmed = line.trim();
  if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) {
    return violations;
  }

  // Skip bds-lint-ignore
  if (line.includes('bds-lint-ignore')) return violations;

  // Skip lines inside template literal documentation blocks
  if (trimmed.startsWith('*') || trimmed.startsWith('`')) return violations;

  while ((match = regex.exec(line)) !== null) {
    const tokenName = match[1];

    // Check against valid token set
    if (tokens.allTokens.has(tokenName)) continue;

    // --bds-* tokens are component-local custom properties (e.g. --bds-slider-percent).
    // They are set by the component's JS/TSX and are not global BDS tokens — skip.
    if (tokenName.startsWith('--bds-')) continue;

    // Some component-specific CSS properties (e.g. in Storybook theme wrappers)
    // use tokens that are defined in .body.theme-N blocks — already in allTokens.
    // If still not found, it's genuinely unknown.

    violations.push({
      rule: 'unknown-token',
      severity: isComponent ? 'error' : 'warning',
      file,
      line: lineNum,
      column: match.index + 1,
      message: `Unknown token "var(${tokenName})" — not found in token sources`,
      suggestion: `Check TOKEN-REFERENCE.md or grep build/figma/css/variables.css for the correct name`,
    });
  }

  return violations;
}

/**
 * Rule 4: 4-point grid compliance
 * Checks hardcoded px values in component style objects for 4px divisibility.
 * Also audits CSS token declaration files for off-grid primitive values.
 * Only runs with --check-grid flag. Warning-only — never blocks CI.
 */
function checkGridCompliance(line, lineNum, file) {
  const violations = [];

  const trimmed = line.trim();
  if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) {
    return violations;
  }
  if (line.includes('bds-lint-ignore')) return violations;

  // --- Mode A: CSS token declarations (--space--NNN: Ypx) ---
  const declRegex = /(--space--)(\d+):\s*(\d+)px/g;
  let declMatch;
  while ((declMatch = declRegex.exec(line)) !== null) {
    const px = parseInt(declMatch[3], 10);
    if (px === 0 || px <= 2) continue; // micro exempt
    if (px % 4 !== 0) {
      const lower = Math.floor(px / 4) * 4;
      const upper = lower + 4;
      violations.push({
        rule: 'grid-4pt',
        severity: 'warning',
        file,
        line: lineNum,
        column: declMatch.index + 1,
        message: `Token --space--${declMatch[2]}: ${px}px is not on the 4-point grid`,
        suggestion: `Nearest grid values: ${lower}px or ${upper}px`,
      });
    }
  }

  // --- Mode B: Component style objects (prop: 'Npx') ---
  const GRID_PROPS = new Set([
    'padding', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight',
    'margin', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight',
    'gap', 'rowGap', 'columnGap',
    'width', 'height', 'maxWidth', 'minWidth', 'maxHeight', 'minHeight',
    'top', 'left', 'right', 'bottom',
  ]);

  const styleRegex = /(\w+):\s*'(\d+(?:\.\d+)?)px'/g;
  let styleMatch;
  while ((styleMatch = styleRegex.exec(line)) !== null) {
    const prop = styleMatch[1];
    const px = parseFloat(styleMatch[2]);

    if (!GRID_PROPS.has(prop)) continue;
    if (px === 0 || px <= 2 || px === 999 || px === 9999) continue;

    if (px % 4 !== 0) {
      const lower = Math.floor(px / 4) * 4;
      const upper = lower + 4;
      violations.push({
        rule: 'grid-4pt',
        severity: 'warning',
        file,
        line: lineNum,
        column: styleMatch.index + 1,
        message: `${prop}: '${styleMatch[2]}px' is not on the 4-point grid`,
        suggestion: `Nearest grid values: ${lower}px or ${upper}px (use a spacing token instead)`,
      });
    }
  }

  return violations;
}

// ---------------------------------------------------------------------------
// Reporter
// ---------------------------------------------------------------------------

function formatViolations(violations) {
  const errors = violations.filter(v => v.severity === 'error');
  const warnings = violations.filter(v => v.severity === 'warning');

  // Group by file
  const byFile = {};
  for (const v of violations) {
    const relPath = path.relative(process.cwd(), v.file);
    if (!byFile[relPath]) byFile[relPath] = [];
    byFile[relPath].push(v);
  }

  for (const [file, fileViolations] of Object.entries(byFile)) {
    console.log(`\n  ${file}`);
    for (const v of fileViolations.sort((a, b) => a.line - b.line)) {
      const icon = v.severity === 'error' ? '\x1b[31mERROR\x1b[0m' : '\x1b[33mWARN \x1b[0m';
      const loc = `${v.line}:${v.column}`.padEnd(10);
      console.log(`    ${loc} ${icon}  ${v.message}  \x1b[2m[${v.rule}]\x1b[0m`);
      console.log(`    ${' '.repeat(10)} \x1b[36mFix:\x1b[0m ${v.suggestion}`);
    }
  }

  console.log('\n' + '─'.repeat(60));
  console.log(`  Token Lint: \x1b[31m${errors.length} error(s)\x1b[0m, \x1b[33m${warnings.length} warning(s)\x1b[0m`);
  if (errors.length > 0) {
    console.log('  Fix errors before committing.');
  }
  console.log('─'.repeat(60) + '\n');

  return errors.length;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const args = process.argv.slice(2);
  const errorsOnly = args.includes('--errors-only');
  const checkGrid = args.includes('--check-grid');
  const jsonMode = args.includes('--json');
  const filesIdx = args.indexOf('--files');
  const explicitFiles = filesIdx !== -1 ? args.slice(filesIdx + 1).filter(f => !f.startsWith('--')) : null;

  if (!jsonMode) console.log('\n🔍 BDS Token Linter\n');

  // 1. Parse CSS tokens
  const tokens = parseCssTokens();
  if (!jsonMode) console.log(`  Loaded ${tokens.allTokens.size} tokens (${tokens.semanticTokens.size} semantic, ${tokens.primitiveTokens.size} primitive)`);
  if (checkGrid && !jsonMode) {
    console.log('  📐 4-point grid check enabled');
  }

  // 2. Find files — use explicit list if provided, otherwise scan all
  const tsxFiles = explicitFiles
    ? explicitFiles.filter(f => /\.tsx$/.test(f)).map(f => path.resolve(f))
    : findFiles(COMPONENTS_DIR, /\.tsx$/);

  // CSS files: explicit list (from pre-commit hook) or full scan
  const cssFilesIdx = args.indexOf('--css-files');
  const explicitCssFiles = cssFilesIdx !== -1
    ? args.slice(cssFilesIdx + 1).filter(f => !f.startsWith('--'))
    : null;
  const cssFiles = explicitCssFiles
    ? explicitCssFiles.filter(f => /\.css$/.test(f)).map(f => path.resolve(f))
    : findFiles(COMPONENTS_DIR, /\.css$/);

  const totalFiles = tsxFiles.length + cssFiles.length;
  if (totalFiles === 0) {
    if (!jsonMode) console.log('  No files to scan — skipping.\n');
    if (jsonMode) {
      console.log(JSON.stringify({ errors: 0, warnings: 0, totalFiles: 0, totalTokens: tokens.allTokens.size, violations: [] }, null, 2));
    }
    process.exit(0);
  }
  if (!jsonMode) console.log(`  Scanning ${tsxFiles.length} .tsx + ${cssFiles.length} .css files...\n`);

  // 3. Scan components for token usage violations
  const allViolations = [];

  for (const file of tsxFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    const isStory = /\.stories\.tsx$/.test(file);
    const isComponent = !isStory;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;

      allViolations.push(...checkPrimitiveTokens(line, lineNum, file, isComponent));
      allViolations.push(...checkHardcodedValues(line, lineNum, file, isComponent));
      allViolations.push(...checkUnknownTokens(line, lineNum, file, tokens, isComponent));

      // Rule 4: grid compliance (opt-in via --check-grid)
      if (checkGrid) {
        allViolations.push(...checkGridCompliance(line, lineNum, file));
      }
    }
  }

  // CSS files: apply token-reference rules only (no TSX style-object rules)
  for (const file of cssFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;

      // Rule 1: primitive token usage in CSS
      allViolations.push(...checkPrimitiveTokens(line, lineNum, file, true));
      // Rule 3: unknown token references in CSS (catches stale var() after renames)
      allViolations.push(...checkUnknownTokens(line, lineNum, file, tokens, true));

      if (checkGrid) {
        allViolations.push(...checkGridCompliance(line, lineNum, file));
      }
    }
  }

  // 4. Gap-fill drift detection — flag gap-fill tokens that duplicate figma-tokens.css
  const FIGMA_TOKENS_PATH = path.join(__dirname, '..', 'tokens', 'figma-tokens.css');
  const GAP_FILLS_PATH = path.join(__dirname, '..', 'tokens', 'gap-fills.css');
  if (fs.existsSync(FIGMA_TOKENS_PATH) && fs.existsSync(GAP_FILLS_PATH)) {
    // Collect token names from figma-tokens.css
    const figmaCSS = fs.readFileSync(FIGMA_TOKENS_PATH, 'utf8');
    const figmaTokenNames = new Set();
    for (const m of figmaCSS.matchAll(/^\s*(--[\w-]+)\s*:/gm)) {
      figmaTokenNames.add(m[1]);
    }

    // Scan gap-fills.css for duplicates
    const gapCSS = fs.readFileSync(GAP_FILLS_PATH, 'utf8');
    const gapLines = gapCSS.split('\n');
    for (let i = 0; i < gapLines.length; i++) {
      const line = gapLines[i];
      if (line.includes('bds-lint-ignore') || line.includes('DEPRECATED') || line.includes('backward-compat')) continue;
      const decl = line.match(/^\s*(--[\w-]+)\s*:/);
      if (decl && figmaTokenNames.has(decl[1])) {
        allViolations.push({
          rule: 'gap-fill-drift',
          severity: 'warning',
          file: GAP_FILLS_PATH,
          line: i + 1,
          column: 1,
          message: `"${decl[1]}" exists in figma-tokens.css — gap-fill is stale`,
          suggestion: `Remove from gap-fills.css (already generated by Style Dictionary)`,
        });
      }
    }
  }

  // 5. If --check-grid, also scan the token CSS source for off-grid token values
  if (checkGrid) {
    const FIGMA_CSS = path.join(__dirname, '..', 'tokens', 'figma-tokens.css');
    if (fs.existsSync(FIGMA_CSS)) {
      const css = fs.readFileSync(FIGMA_CSS, 'utf8');
      const cssLines = css.split('\n');
      for (let i = 0; i < cssLines.length; i++) {
        allViolations.push(...checkGridCompliance(cssLines[i], i + 1, FIGMA_CSS));
      }
    }
  }

  // 6. Filter
  const filtered = errorsOnly
    ? allViolations.filter(v => v.severity === 'error')
    : allViolations;

  // 7. JSON mode — structured output for dashboards
  if (jsonMode) {
    const errors = filtered.filter(v => v.severity === 'error');
    const warnings = filtered.filter(v => v.severity === 'warning');
    console.log(JSON.stringify({
      errors: errors.length,
      warnings: warnings.length,
      totalFiles: totalFiles,
      totalTokens: tokens.allTokens.size,
      violations: filtered.map(v => ({
        rule: v.rule,
        severity: v.severity,
        file: path.relative(process.cwd(), v.file),
        line: v.line,
        message: v.message,
      })),
    }, null, 2));
    process.exit(errors.length > 0 ? 1 : 0);
  }

  // 8. Report
  if (filtered.length === 0) {
    console.log('  ✅ All clear! No violations found.\n');
    process.exit(0);
  }

  const errorCount = formatViolations(filtered);

  // Add grid context if grid violations found
  const hasGridViolations = filtered.some(v => v.rule === 'grid-4pt');
  if (hasGridViolations) {
    console.log('  📐 Grid: BDS uses a 4-point grid. All spacing should be divisible by 4.');
    console.log('     Exempt: 0, 1px, 2px (micro). See docs/GRID-SYSTEM.md\n');
  }

  process.exit(errorCount > 0 ? 1 : 0);
}

main();
