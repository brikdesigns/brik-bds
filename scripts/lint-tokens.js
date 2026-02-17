#!/usr/bin/env node

/**
 * BDS Token Validation Linter
 *
 * Validates CSS variable usage in BDS components against the Webflow CSS export.
 * Catches three types of violations:
 *   1. Primitive token usage (use semantic tokens instead)
 *   2. Hardcoded CSS values (use tokens)
 *   3. Unknown tokens (typos or non-existent variables)
 *
 * Usage:
 *   node scripts/lint-tokens.js              # full report (errors + warnings)
 *   node scripts/lint-tokens.js --errors-only # errors only (for CI)
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

const WEBFLOW_CSS_PATH = path.join(
  __dirname, '..', 'updates', 'brik-bds.webflow', 'css', 'brik-bds.webflow.css'
);
const COMPONENTS_DIR = path.join(__dirname, '..', 'components', 'ui');

// Primitive token prefixes that should be replaced with semantic equivalents
const PRIMITIVE_PREFIXES = {
  '--font-size--': '--_typography---*',
  '--space--': '--_space---*',
  '--grayscale--': '--_color---*',
  '--border-radius--': '--_border-radius---*',
  '--border-width--': '--_border-width---*',
  '--size--': '--_size---*',
};

// These primitive prefixes are acceptable in components (no semantic layer above them)
const ALLOWED_PRIMITIVES = new Set([
  '--font-weight--',
  '--font-line-height--',
  '--system--',
  '--_themes---',
]);

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
  if (!fs.existsSync(WEBFLOW_CSS_PATH)) {
    console.error(`ERROR: Webflow CSS not found at ${WEBFLOW_CSS_PATH}`);
    process.exit(1);
  }

  const css = fs.readFileSync(WEBFLOW_CSS_PATH, 'utf8');
  const lines = css.split('\n');

  const allTokens = new Set();
  const semanticTokens = new Set();
  const primitiveTokens = new Set();

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Match :root {, .body {, .body.theme-N { at column 0
    if (/^(:root|\.body)\s*\{/.test(line) || /^\.body\.theme-\d+/.test(line)) {
      i++;
      let braceDepth = 1;
      while (i < lines.length && braceDepth > 0) {
        if (lines[i].includes('{')) braceDepth++;
        if (lines[i].includes('}')) braceDepth--;

        // Extract custom property declarations
        const match = lines[i].match(/^\s*(--[\w-]+)/);
        if (match) {
          const tokenName = match[1];
          allTokens.add(tokenName);

          if (tokenName.startsWith('--_')) {
            semanticTokens.add(tokenName);
          } else {
            primitiveTokens.add(tokenName);
          }
        }
        i++;
      }
      continue;
    }
    i++;
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
    const prefix = `${match[1]}--`;

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
      suggestion: `Use a typography token: var(--_typography---body--*) or var(--_typography---heading--*)`,
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
      suggestion: `Use a typography token: var(--_typography---*)`,
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
        ? 'var(--_border-radius---*)'
        : prop === 'gap' || prop === 'rowGap' || prop === 'columnGap'
          ? 'var(--_space---gap--*)'
          : 'var(--_space---*)';

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
function checkUnknownTokens(line, lineNum, file, tokens) {
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

    // Some component-specific CSS properties (e.g. in Storybook theme wrappers)
    // use tokens that are defined in .body.theme-N blocks — already in allTokens.
    // If still not found, it's genuinely unknown.

    violations.push({
      rule: 'unknown-token',
      severity: 'error',
      file,
      line: lineNum,
      column: match.index + 1,
      message: `Unknown token "var(${tokenName})" — not found in Webflow CSS`,
      suggestion: `Check TOKEN-REFERENCE.md or grep the Webflow CSS for the correct name`,
    });
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

  console.log('\n🔍 BDS Token Linter\n');

  // 1. Parse CSS tokens
  const tokens = parseCssTokens();
  console.log(`  Loaded ${tokens.allTokens.size} tokens (${tokens.semanticTokens.size} semantic, ${tokens.primitiveTokens.size} primitive)`);

  // 2. Find files
  const tsxFiles = findFiles(COMPONENTS_DIR, /\.tsx$/);
  console.log(`  Scanning ${tsxFiles.length} files...\n`);

  // 3. Scan
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
      allViolations.push(...checkUnknownTokens(line, lineNum, file, tokens));
    }
  }

  // 4. Filter
  const filtered = errorsOnly
    ? allViolations.filter(v => v.severity === 'error')
    : allViolations;

  // 5. Report
  if (filtered.length === 0) {
    console.log('  ✅ All clear! No violations found.\n');
    process.exit(0);
  }

  const errorCount = formatViolations(filtered);
  process.exit(errorCount > 0 ? 1 : 0);
}

main();
