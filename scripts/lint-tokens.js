#!/usr/bin/env node

/**
 * BDS Token Validation Linter
 *
 * Validates CSS variable usage in BDS components against Style Dictionary token outputs.
 * Catches six types of violations:
 *   1. Primitive token usage (use semantic tokens instead)
 *   2. Hardcoded CSS values (use tokens) — .tsx style objects (checkHardcodedValues)
 *      AND raw px in .css declarations (checkCssRawValues; error when the value
 *      lands on a scale token, warn on a genuine off-scale gap)
 *   3. Unknown tokens (typos or non-existent variables)
 *   4. Spacing values not aligned to 4-point grid (see https://design.brikdesigns.com/docs/foundation/spacing)
 *   5. Token-family pairing mismatch — a token used in a property whose family
 *      it doesn't belong to (e.g. background-color: var(--text-*)). See
 *      docs/TOKEN-PR-CHECKLIST.md for the property↔family table.
 *   6. Raw inline var(--…) in component TSX — styles belong in the component's
 *      .css file (BEM under bds-), never a CSSProperties object. See the
 *      component-build standard §"Styles live in CSS". Errors repo-wide (the
 *      #892 burn-down is complete). Escape hatch: `bds-lint-ignore` for
 *      runtime-calculated values that genuinely cannot live in CSS.
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
const {
  isBareLintIgnore,
  BARE_IGNORE_RULE,
  BARE_IGNORE_MESSAGE,
  BARE_IGNORE_FIX,
  LINT_IGNORE_MARKER,
} = require('./lib/bds-lint-ignore.cjs');

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const SD_CSS_PATH = path.join(
  __dirname, '..', 'build', 'figma', 'css', 'variables.css'
);
const REPO_ROOT = path.join(__dirname, '..');
const COMPONENTS_DIR = path.join(__dirname, '..', 'components', 'ui');
// Roots that get the bare-`bds-lint-ignore` rule ONLY (#1646). Not the token
// suite — these carry story/demo styling the token rules intentionally allow.
const BARE_IGNORE_ONLY_DIRS = [
  path.join(__dirname, '..', 'stories'),
  path.join(__dirname, '..', '.storybook'),
];
const BLUEPRINTS_DIR = path.join(__dirname, '..', 'content-system', 'blueprints');
// Canonical gap/padding rung order (Figma's own ladder, not the retired numeric
// aliases) — shared by spacing-mode-track (4c) and responsive-token-swap (13).
const SPACING_RUNGS = ['tiny', 'xs', 'sm', 'md', 'lg', 'xl', 'huge'];

// Repo-relative POSIX path, stable regardless of cwd or how the file was passed
// (absolute from findFiles, or resolved from a relative --files arg).
function repoRel(file) {
  return path.relative(REPO_ROOT, file).split(path.sep).join('/');
}

// ---------------------------------------------------------------------------
// Tier 4 fallback-literal rule — brik-bds#1043 / #1044 / ADR-014
// ---------------------------------------------------------------------------
// A Tier 4 knob's var() fallback must resolve to a token, never a raw Tier-1
// value (`var(--bds-toast-shadow, var(--shadow-md))`, never
// `var(--bds-toast-shadow, 0 4px 12px …)`). The rule flags raw design values in
// var() fallbacks and errors — the #1043 grandfathering baselines were burned
// down in #1044 (PRs #1853 + this one) and are gone.
//
// Two typed exemptions survive the burn-down (ADR-014 §Decision — the same
// carve-out shape as `BlueprintFallback.*`), because their default genuinely
// CANNOT be a design token:

// 1. Hooks whose fallback is a load-bearing default that no registry token can
//    express. NOT a blanket knob escape hatch — each entry needs a one-line
//    justification, and geometry that DOES land on --size-*/--space-* must adopt
//    the rung (e.g. Slider track/thumb → --size-150/--size-500) instead of being
//    listed here.
const FALLBACK_LITERAL_EXEMPT_TOKENS = new Set([
  '--bds-slider-percent',      // runtime binding — Slider.tsx sets it per render; 50% is the pre-hydration default
  '--bds-grid-min-col-width',  // min-column-width knob; 240px default sits off every registry scale (no container-width scale)
]);

// 2. Responsive math-function fallbacks — clamp()/min()/max() whose design
//    anchors are all var() tokens. No single Semantic token can express a
//    responsive `clamp(var(--padding-xl), 6vw, var(--padding-huge))`; the
//    vw/%/number literals are the responsive necessity, not off-token leakage.
//    A raw px/rem/hex anchor (`clamp(16px, 6vw, 48px)`) is NOT exempt — that is
//    the Tier-1 leakage the rule exists to catch.
function isResponsiveMathFallback(fallback) {
  if (!/^(clamp|min|max)\s*\(/i.test(fallback)) return false;
  const stripped = fallback.replace(/var\(\s*--[\w-]+\s*\)/g, '');
  if (/var\(/.test(stripped)) return false;                 // a non-simple var() arg — don't reason about it
  if (!/var\(\s*--/.test(fallback)) return false;           // must anchor on ≥1 token
  if (/#[0-9a-f]{3,8}\b/i.test(stripped)) return false;     // raw color anchor
  if (/\d*\.?\d+(px|rem|em|pt|cm|mm|in|pc|ex|ch)\b/i.test(stripped)) return false; // raw length anchor
  return true;
}

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
// See https://design.brikdesigns.com/docs/foundation/spacing for details.

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
// Token-family pairing rules (Rule 5)
// ---------------------------------------------------------------------------
// Each CSS property is paired with the set of token-family prefixes whose
// values are semantically appropriate. Wrong-family usage was the failure
// mode behind portal #512 / #553 (rolled back) and brikdesigns #99 (caught
// in browser review).
//
// Custom-property declarations (e.g. `--background-inverse: var(...)`)
// inherit the rule of the LHS prefix family — see CUSTOM_PROP_TO_RULE.
//
// Documented at docs/TOKEN-PR-CHECKLIST.md.

const TOKEN_FAMILY_RULES = {
  'background-color': {
    allowed: ['--background-', '--surface-'],
    label: 'background',
    suggestion: 'use a --background-* or --surface-* token',
  },
  'background': {
    allowed: ['--background-', '--surface-'],
    label: 'background',
    suggestion: 'use a --background-* or --surface-* token',
  },
  'color': {
    allowed: ['--text-', '--color-'],
    label: 'text',
    suggestion: 'use a --text-* token or a --color-* primitive',
  },
  'border-color': {
    allowed: ['--border-', '--background-'],
    label: 'border',
    suggestion: 'use a --border-* token (or matching --background-* for fill-style borders)',
  },
  'border-top-color': {
    allowed: ['--border-', '--background-'],
    label: 'border',
    suggestion: 'use a --border-* token',
  },
  'border-bottom-color': {
    allowed: ['--border-', '--background-'],
    label: 'border',
    suggestion: 'use a --border-* token',
  },
  'border-left-color': {
    allowed: ['--border-', '--background-'],
    label: 'border',
    suggestion: 'use a --border-* token',
  },
  'border-right-color': {
    allowed: ['--border-', '--background-'],
    label: 'border',
    suggestion: 'use a --border-* token',
  },
  'outline-color': {
    allowed: ['--border-'],
    label: 'outline',
    suggestion: 'use a --border-* token',
  },
};

// TSX inline-style camelCase → kebab-case for properties in TOKEN_FAMILY_RULES.
const TSX_STYLE_PROP_TO_CSS = {
  backgroundColor: 'background-color',
  background: 'background',
  color: 'color',
  borderColor: 'border-color',
  borderTopColor: 'border-top-color',
  borderBottomColor: 'border-bottom-color',
  borderLeftColor: 'border-left-color',
  borderRightColor: 'border-right-color',
  outlineColor: 'outline-color',
};

// CSS custom-property declaration prefixes that inherit a TOKEN_FAMILY_RULES
// allowlist. Lets the rule fire on `--background-foo: var(--text-bar)` too.
const CUSTOM_PROP_TO_RULE = {
  '--background-': 'background-color',
  '--surface-': 'background-color',
  '--text-': 'color',
  '--border-': 'border-color',
};

// Token prefixes the family-pairing rule recognises. Values pointing to other
// prefixes (e.g. --bds-*, --font-*, --space-*) are out of scope.
const FAMILY_PREFIXES_FOR_VALUES = [
  '--background-', '--surface-', '--text-', '--border-', '--color-',
];

function classifyTokenFamily(tokenName) {
  for (const prefix of FAMILY_PREFIXES_FOR_VALUES) {
    if (tokenName.startsWith(prefix)) return prefix;
  }
  return null;
}

function tokenFamilyMatchesAllowlist(tokenName, allowed) {
  const family = classifyTokenFamily(tokenName);
  if (family === null) return true; // unknown family — out of scope; Rule 3 handles unknown tokens
  return allowed.includes(family);
}

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
  const RATIOS = path.join(__dirname, '..', 'tokens', 'ratios.css');
  const BRIDGE = path.join(__dirname, '..', 'tokens', 'compat', 'bridge.css');
  if (fs.existsSync(FIGMA_TOKENS)) loadFromCss(FIGMA_TOKENS);
  if (fs.existsSync(GAP_FILLS)) loadFromCss(GAP_FILLS);
  if (fs.existsSync(RATIOS)) loadFromCss(RATIOS);
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

  // Skip lines carrying a lint-ignore marker
  if (line.includes('bds-lint-ignore')) return violations;

  // Skip lines inside template literal documentation blocks
  if (trimmed.startsWith('*') || trimmed.startsWith('`')) return violations;

  while ((match = regex.exec(line)) !== null) {
    const tokenName = match[1];

    // Check against valid token set
    if (tokens.allTokens.has(tokenName)) continue;

    // --bds-{component}-{property} is the sanctioned Tier 4 component-token
    // namespace (ADR-014): component-local custom properties — either an
    // override knob or a runtime binding set by the component's JS/TSX. It is
    // recognized BY RULE here, not as a blind spot; its var() fallback is
    // separately policed by checkFallbackLiterals (must resolve to a Semantic
    // token, never a raw value). The retired --bp-* and bare --{component}-*
    // shapes are NOT skipped — they fall through to unknown-token / the
    // --bp- regression gate.
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
      suggestion: `Check the canonical registry at https://design.brikdesigns.com/docs/foundation or grep dist/tokens.css for the correct name`,
    });
  }

  return violations;
}

/**
 * The 6-step → numeric primitive map, derived from
 * design-tokens/color-ramps.generated.json (brik-bds#1739).
 *
 * Read, not hand-maintained: the generator already records each anchor's
 * `legacyName` next to the numeric stop it was pinned to, so that file IS the
 * mapping. Hand-listing 54 pairs here would be a second source of truth that
 * drifts the first time a family is retuned.
 *
 * Returns an empty map if the generated file is absent, so the linter still
 * runs in a checkout that has not built tokens.
 */
let deprecatedPrimitivesCache = null;
function loadDeprecatedPrimitives() {
  if (deprecatedPrimitivesCache) return deprecatedPrimitivesCache;

  const RAMPS = path.join(__dirname, '..', 'design-tokens', 'color-ramps.generated.json');
  const map = new Map();
  if (fs.existsSync(RAMPS)) {
    const data = JSON.parse(fs.readFileSync(RAMPS, 'utf8'));
    for (const [kitName, kit] of Object.entries(data)) {
      if (kitName.startsWith('$')) continue;
      for (const [family, stops] of Object.entries(kit['primitives/value'].color)) {
        for (const [stop, entry] of Object.entries(stops)) {
          const ramp = entry.$extensions?.['com.brikdesigns.ramp'];
          if (ramp?.source !== 'anchor') continue;
          map.set(`--color-${family}-${ramp.legacyName}`, `--color-${family}-${stop}`);
        }
      }
    }
  }
  deprecatedPrimitivesCache = map;
  return map;
}

/**
 * Rule 12: deprecated-token — brik-bds#1739
 *
 * The six named color steps (`--color-poppy-light`) still resolve — they are
 * aliases onto the numeric scale — but they are deprecated, and #1740 retires
 * them once no consumer references them. Report each use with its numeric
 * replacement so the migration is mechanical.
 *
 * WARNING, never error, on purpose: the aliases are live and correct today.
 * Erroring would fail the build on 411 in-repo call sites that this PR
 * deliberately did not touch, and would make the deprecation a breaking change
 * rather than a signal.
 */
function checkDeprecatedTokens(line, lineNum, file) {
  const violations = [];
  const trimmed = line.trim();
  if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) {
    return violations;
  }
  if (line.includes('bds-lint-ignore')) return violations;

  const deprecated = loadDeprecatedPrimitives();
  if (deprecated.size === 0) return violations;

  const regex = /var\(\s*(--color-[\w-]+)\s*[,)]/g;
  let match;
  while ((match = regex.exec(line)) !== null) {
    const replacement = deprecated.get(match[1]);
    if (!replacement) continue;
    violations.push({
      rule: 'deprecated-token',
      severity: 'warning',
      file,
      line: lineNum,
      column: match.index + 1,
      message: `"${match[1]}" is deprecated — use "${replacement}"`,
      suggestion: `The 6-step names are aliases onto the 11-step numeric scale (brik-bds#1739) and are retired by #1740`,
    });
  }

  return violations;
}

/**
 * Rule 7: Fallback-literal — brik-bds#1043 / ADR-014
 *
 * A Tier 4 knob's var() fallback must resolve to a Semantic token, never a raw
 * Tier-1 value. A raw literal inside `var(--token, <literal>)` reintroduces an
 * off-token value that ships silently if the token fails to resolve, and the
 * linter's unknown-token rule can't see it (it reads only the canonical name).
 *
 * Flags a fallback that is a raw DESIGN VALUE — contains a digit, a #hex, or a
 * color/easing function. A nested token fallback (`var(--x, var(--y))`) is the
 * correct shape and passes. CSS keywords (transparent, currentColor, uppercase,
 * inherit, …) are not Tier-1 values and are permitted.
 *
 * BlueprintFallback.* is exempt — it is a deliberate loud-stub renderer whose
 * literal defaults are intentional (mirrors scripts/lint-blueprint-naming.mjs).
 * Two further typed exemptions (ADR-014 §Decision): FALLBACK_LITERAL_EXEMPT_TOKENS
 * (runtime bindings + off-scale geometry knobs) and isResponsiveMathFallback()
 * (clamp()/min()/max() anchored on tokens). Everything else errors.
 *
 * Line-wrapped declarations (#1473): the rule reads whole logical declarations,
 * not single lines. It originally bailed on any `var(` whose parens didn't close
 * on the same line, so a formatter line-break silently defeated it — the same
 * declaration errored on one line and passed when wrapped. Four real ADR-014
 * violations shipped in the blueprints that way. When a line leaves a `var(`
 * open, following lines are appended (up to FALLBACK_LITERAL_MAX_WRAP_LINES)
 * until the parens balance; the violation is reported at the opening line.
 */
// How many following lines a wrapped `var(` may span before we give up. A
// formatter-wrapped declaration is 2-4 lines; the cap stops a stray unbalanced
// paren from swallowing the rest of the file.
const FALLBACK_LITERAL_MAX_WRAP_LINES = 8;

/**
 * Net unclosed `(` in a chunk of CSS — >0 means a declaration is still open at
 * the end of it. Parens inside quoted strings (e.g. `content: "("`) are
 * ignored so a decorative bracket can't fake an open declaration.
 */
function countUnbalancedParens(text) {
  let depth = 0;
  let quote = null;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quote) {
      if (c === '\\') i++;
      else if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'") quote = c;
    else if (c === '(') depth++;
    else if (c === ')') depth--;
  }
  return depth;
}

function checkFallbackLiterals(line, lineNum, file, isComponent, lines = null) {
  const violations = [];
  const trimmed = line.trim();
  if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return violations;
  if (line.includes('bds-lint-ignore')) return violations;
  if (/BlueprintFallback\.(astro|css|tsx)$/.test(file)) return violations;

  // Text this line's `var(`s are parsed against. Normally the line itself; when
  // a `var(` is left open at end-of-line, the following lines are appended so a
  // formatter-wrapped declaration parses as the single logical declaration it
  // is (#1473). Without this the rule was defeated by a line break — the same
  // declaration errored on one line and passed when wrapped, which is exactly
  // how the offending blueprint declarations happened to be formatted.
  let scanText = line;
  if (lines && countUnbalancedParens(line) > 0) {
    const start = lineNum - 1; // lineNum is 1-based
    for (let k = start + 1; k < lines.length && k <= start + FALLBACK_LITERAL_MAX_WRAP_LINES; k++) {
      // An ignore marker anywhere in the logical declaration suppresses it.
      if (lines[k].includes('bds-lint-ignore')) return violations;
      scanText += '\n' + lines[k];
      if (countUnbalancedParens(scanText) === 0) break;
    }
  }

  // Walk every `var(` and balance-parse its argument list so nested parens
  // (rgba(), cubic-bezier(), nested var()) split correctly on the top-level
  // comma. Only `var(`s that START on this line are considered — ones opening
  // on a continuation line are reported when that line is itself scanned, so
  // nothing is double-counted.
  for (let i = 0; i + 4 <= line.length; i++) {
    if (scanText.slice(i, i + 4) !== 'var(') continue;
    let depth = 0;
    let commaIdx = -1;
    let j = i + 3;
    for (; j < scanText.length; j++) {
      const c = scanText[j];
      if (c === '(') depth++;
      else if (c === ')') { depth--; if (depth === 0) break; }
      else if (c === ',' && depth === 1 && commaIdx === -1) commaIdx = j;
    }
    if (depth !== 0 || j >= scanText.length) continue; // still unbalanced — skip
    if (commaIdx === -1) continue;                 // no fallback
    const token = scanText.slice(i + 4, commaIdx).trim();
    if (!/^--[\w-]+$/.test(token)) continue;       // not a simple var() reference
    // Collapse the wrap so the reported literal reads as one declaration.
    const fallback = scanText.slice(commaIdx + 1, j).replace(/\s+/g, ' ').trim();
    if (fallback.startsWith('var(')) continue;     // nested token fallback — correct shape

    const isRawValue = /[#\d]/.test(fallback) || /\b(rgb|rgba|hsl|hsla|cubic-bezier)\s*\(/i.test(fallback);
    if (!isRawValue) continue;                     // CSS keyword fallback — permitted

    // Typed exemptions (ADR-014 §Decision) — defaults that no token can express.
    if (FALLBACK_LITERAL_EXEMPT_TOKENS.has(token)) continue; // runtime binding / off-scale geometry knob
    if (isResponsiveMathFallback(fallback)) continue;        // clamp()/min()/max() anchored on tokens

    violations.push({
      rule: 'fallback-literal',
      severity: 'error',
      file,
      line: lineNum,
      column: i + 1,
      message: `Raw literal "${fallback}" in var(${token}, …) fallback — Tier 4 must resolve to a token, never a raw value`,
      suggestion: `Point the fallback at a token: var(${token}, var(--<token>)) — or drop the fallback if ${token} already resolves. See ADR-014.`,
    });
  }
  return violations;
}

/**
 * Rule 8: Retired --bp-* namespace gate — brik-bds#1043 / ADR-014
 *
 * `--bp-{blueprint}-{slot}-{prop}` is a retired Tier 4 namespace. The sanctioned
 * shape is `--bds-{component}-{property}`. Flags both definitions (`--bp-…:`) and
 * references (`var(--bp-…)`) so a re-introduction fails CI instead of accreting.
 */
function checkRetiredBpNamespace(line, lineNum, file) {
  const violations = [];
  const trimmed = line.trim();
  if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return violations;
  if (line.includes('bds-lint-ignore')) return violations;

  const regex = /(--bp-[\w-]+)/g;
  let match;
  const seen = new Set();
  while ((match = regex.exec(line)) !== null) {
    const name = match[1];
    if (seen.has(name + match.index)) continue;
    seen.add(name + match.index);
    violations.push({
      rule: 'retired-bp-namespace',
      severity: 'error',
      file,
      line: lineNum,
      column: match.index + 1,
      message: `Retired Tier 4 namespace "${name}" — use --bds-${name.slice('--bp-'.length)} instead`,
      suggestion: `Rename to the sanctioned --bds-{component}-{property} shape (ADR-014 / #1043).`,
    });
  }
  return violations;
}

/**
 * Deprecated gap/padding rung aliases — read from tokens/gap-fills.css's own
 * "DEPRECATED numeric-rung aliases (#2594)" block rather than hand-listing
 * `2xs`/`2xl`. ADR-033 §3's numeric rename was superseded by #2594 in the
 * OPPOSITE direction (Figma's tiny/xs/sm/md/lg/xl/huge ladder is canonical;
 * 2xs/2xl are the retired aliases) — hardcoding either set here would drift
 * the next time Figma's ladder changes. Mirrors loadDeprecatedPrimitives()
 * (Rule 12) for --color-*, keyed off the same DEPRECATED marker instead of a
 * generated JSON's $extensions metadata.
 *
 * Returns an empty map if gap-fills.css is absent, so the linter still runs
 * in a checkout that has not built tokens.
 */
let deprecatedGapPaddingCache = null;
function loadDeprecatedGapPadding() {
  if (deprecatedGapPaddingCache) return deprecatedGapPaddingCache;

  const GAP_FILLS = path.join(__dirname, '..', 'tokens', 'gap-fills.css');
  const map = new Map();
  if (fs.existsSync(GAP_FILLS)) {
    const content = fs.readFileSync(GAP_FILLS, 'utf8');
    const regex = /^\s*(--(?:gap|padding)-[\w-]+)\s*:\s*var\((--(?:gap|padding)-[\w-]+)\)\s*;.*DEPRECATED/gm;
    for (const m of content.matchAll(regex)) {
      map.set(m[1], m[2]);
    }
  }
  deprecatedGapPaddingCache = map;
  return map;
}

/**
 * Resolves a --gap-* or --padding-* token to its rung name on SPACING_RUNGS,
 * following a deprecated alias (e.g. --gap-2xs) to its canonical rung
 * (tiny) first. Returns null for anything else (a raw --space-* primitive,
 * an unrecognized rung like the brikdesigns-only --gap-comfortable hack).
 */
function resolveSpacingRung(token, deprecatedMap) {
  const canonical = deprecatedMap.get(token) || token;
  const m = canonical.match(/^--(?:gap|padding)-([\w-]+)$/);
  return m ? m[1] : null;
}

/**
 * Rule 13: responsive token-family swap — brik-bds#2592
 *
 * A base declaration and its @media override for the same selector + property
 * must draw from the same semantic family (gap vs padding vs a raw --space-*
 * primitive are never mixed across the break) and must not invert direction:
 * a `max-width` override (narrower viewports) stepping to a LARGER rung than
 * the base, or a `min-width` override (wider viewports) stepping to a
 * SMALLER one, is backwards — spacing should ease, not fight, the viewport.
 * Either side using a deprecated rung (2xs/2xl today, loadDeprecatedGapPadding)
 * is flagged too. `bds-lint-ignore` on the override's own line is the escape
 * hatch, same as every other rule in this file.
 *
 * CSS custom properties cannot appear inside an `@media` condition (ADR-025
 * §4 / brik-bds#2591), so detection reads literal min-width/max-width px from
 * the condition text — never a --breakpoint-* name — and keys purely on the
 * declared values inside each block.
 *
 * Operates on a whole file at once (unlike every other rule here, which is
 * per-line): correlating a base declaration against its @media override needs
 * to track selector/property state across non-adjacent lines. The brace
 * tracker below is deliberately simple — flat `@media { selector { ... } }`
 * nesting only, matching every .css file in components/ui and blueprints
 * today; it does not need to handle selector-nested @media since this
 * codebase's build pipeline doesn't emit that shape.
 */
function checkResponsiveTokenSwap(content, file) {
  const violations = [];
  const deprecatedMap = loadDeprecatedGapPadding();
  const lines = content.split('\n');

  const declRegex = /^\s*([\w-]+)\s*:\s*var\((--[\w-]+)\)\s*;?\s*/;
  const stack = [];
  // key `${selector}::${property}` -> { base: {token,line}|null, overrides: [{condition,token,line}] }
  const tracks = new Map();
  let selectorBuffer = '';
  let inComment = false;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const lineNum = i + 1;
    const trimmed = rawLine.trim();

    if (inComment) {
      if (trimmed.includes('*/')) inComment = false;
      continue;
    }
    if (trimmed === '') continue;
    if (trimmed.startsWith('/*')) {
      if (!trimmed.includes('*/')) inComment = true;
      continue;
    }

    if (/^\}/.test(trimmed)) {
      stack.pop();
      continue;
    }

    const atMediaMatch = trimmed.match(/^@media\s*\(([^)]+)\)\s*\{/);
    if (atMediaMatch) {
      stack.push({ type: 'media', condition: atMediaMatch[1].trim() });
      selectorBuffer = '';
      continue;
    }
    if (trimmed.startsWith('@') && trimmed.endsWith('{')) {
      stack.push({ type: 'other' });
      selectorBuffer = '';
      continue;
    }

    if (trimmed.endsWith('{')) {
      const selectorText = `${selectorBuffer} ${trimmed.slice(0, -1)}`.trim();
      const selectors = selectorText.split(',').map(s => s.trim()).filter(Boolean);
      stack.push({ type: 'selector', selectors });
      selectorBuffer = '';
      continue;
    }

    const decl = rawLine.match(declRegex);
    if (decl && (decl[1] === 'gap' || decl[1].startsWith('padding'))) {
      const selectorFrame = [...stack].reverse().find(f => f.type === 'selector');
      if (selectorFrame) {
        const mediaFrame = [...stack].reverse().find(f => f.type === 'media');
        const property = decl[1];
        const token = decl[2];
        for (const selector of selectorFrame.selectors) {
          const key = `${selector}::${property}`;
          if (!tracks.has(key)) tracks.set(key, { base: null, overrides: [] });
          const track = tracks.get(key);
          if (mediaFrame) {
            track.overrides.push({ condition: mediaFrame.condition, token, line: lineNum });
          } else if (!track.base) {
            track.base = { token, line: lineNum };
          }
        }
      }
      continue;
    }

    // Not a close-brace, open-brace, or recognized declaration — a fragment
    // of a multi-line comma-separated selector list (e.g. Grid.css's
    // `.bds-grid--cols-3,\n  .bds-grid--cols-4 {`).
    selectorBuffer = `${selectorBuffer} ${trimmed}`.trim();
  }

  for (const [key, { base, overrides }] of tracks) {
    if (!base || overrides.length === 0) continue;
    const [selector, property] = key.split('::');
    if (lines[base.line - 1].includes('bds-lint-ignore')) continue;

    for (const override of overrides) {
      if (lines[override.line - 1].includes('bds-lint-ignore')) continue;

      const baseFamily = base.token.match(/^--(gap|padding)-/);
      const overrideFamily = override.token.match(/^--(gap|padding)-/);
      if (!baseFamily || !overrideFamily || baseFamily[1] !== overrideFamily[1]) {
        violations.push({
          rule: 'responsive-token-swap',
          severity: 'error',
          file,
          line: override.line,
          column: 1,
          message: `${selector} { ${property} } swaps families at @media (${override.condition}): ${base.token} (line ${base.line}) → ${override.token}`,
          suggestion: `Keep both sides of a responsive ${property} swap in the same --gap-*/--padding-* family — never a raw --space-* primitive on one side. Annotate with bds-lint-ignore if this is intentional.`,
        });
        continue;
      }

      for (const side of [base, override]) {
        if (!deprecatedMap.has(side.token)) continue;
        violations.push({
          rule: 'responsive-token-swap',
          severity: 'error',
          file,
          line: side.line,
          column: 1,
          message: `${selector} { ${property} } uses deprecated ${side.token} in a responsive swap`,
          suggestion: `Replace ${side.token} with ${deprecatedMap.get(side.token)} (#2594), or annotate with bds-lint-ignore.`,
        });
      }

      const widthMatch = override.condition.match(/(min|max)-width:\s*(\d+(?:\.\d+)?)px/);
      if (!widthMatch) continue;

      const baseRung = resolveSpacingRung(base.token, deprecatedMap);
      const overrideRung = resolveSpacingRung(override.token, deprecatedMap);
      const baseRank = SPACING_RUNGS.indexOf(baseRung);
      const overrideRank = SPACING_RUNGS.indexOf(overrideRung);
      if (baseRank === -1 || overrideRank === -1) {
        violations.push({
          rule: 'responsive-token-swap',
          severity: 'error',
          file,
          line: override.line,
          column: 1,
          message: `${selector} { ${property} } swaps to an unrecognized rung — cannot verify responsive direction (${base.token} → ${override.token})`,
          suggestion: `Use a canonical --${property}-* rung (${SPACING_RUNGS.join('/')}) so this guard can check direction, or annotate with bds-lint-ignore.`,
        });
        continue;
      }

      const direction = widthMatch[1];
      const inverted = direction === 'max' ? overrideRank > baseRank : overrideRank < baseRank;
      if (inverted) {
        violations.push({
          rule: 'responsive-token-swap',
          severity: 'error',
          file,
          line: override.line,
          column: 1,
          message: `${selector} { ${property} } inverts at @media (${override.condition}): ${direction === 'max' ? 'narrower' : 'wider'} viewport gets ${base.token} → ${override.token} (a ${direction === 'max' ? 'larger' : 'smaller'} rung)`,
          suggestion: `${direction === 'max' ? 'A max-width override should step to the same or a smaller rung than the base' : 'A min-width override should step to the same or a larger rung than the base'} — fix the rung, or annotate with bds-lint-ignore if intentional.`,
        });
      }
    }
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

  // --- Mode A: CSS token declarations (--space-NNN / --gap-* / --padding-*) ---
  // Single-dash `--space-NNN` is the emitted name; the old `--space--NNN` this
  // matched until #2588 has not existed for some time, and no --gap-* or
  // --padding-* name ever matched it, so Mode A was dead against every spacing
  // family it is meant to audit.
  const declRegex = /(--(?:space|gap|padding)-[\w-]+):\s*(\d+(?:\.\d+)?)px/g;
  let declMatch;
  while ((declMatch = declRegex.exec(line)) !== null) {
    const px = parseFloat(declMatch[2]);
    if (px <= 2) continue; // micro exempt (0, 1px, 2px)
    // Half-step rungs are deliberately off-grid. The ramp carries one 2px-offset
    // step between each pair of 4pt rungs from --space-100 to --space-500
    // (150/250/350/450 = 6/10/14/18px) for optical adjustments finer than a full
    // step; above 500 the ramp stops half-stepping. They are Figma-backed and
    // permanent, so flagging them was four-fifths of grid-4pt's output (#2613).
    // Enumerated, not `\d?50` — that pattern also carved out --space-50, which
    // is not a half-step, and would silently absorb a future --space-050.
    if (/^--space-(?:150|250|350|450)$/.test(declMatch[1])) continue;
    if (px % 4 !== 0) {
      const lower = Math.floor(px / 4) * 4;
      const upper = lower + 4;
      violations.push({
        rule: 'grid-4pt',
        severity: 'warning',
        file,
        line: lineNum,
        column: declMatch.index + 1,
        message: `Token ${declMatch[1]}: ${px}px is not on the 4-point grid`,
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

/**
 * Rule 5: Token-family pairing
 *
 * Flags `var(--TOKEN)` uses where the token's family doesn't match the
 * property's allowlist. Three usage shapes are checked:
 *
 *   • CSS property in a rule body:        background-color: var(--text-foo);
 *   • CSS custom-property declaration:    --background-inverse: var(--text-foo);
 *   • TSX inline-style object:            style={{ backgroundColor: 'var(--text-foo)' }}
 *
 * Skips lines with `bds-lint-ignore` (escape hatch for cross-family aliases
 * that are intentional — e.g. hue-sharing across families).
 */
function checkTokenFamilyPairing(line, lineNum, file, isComponent) {
  const violations = [];

  const trimmed = line.trim();
  if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) {
    return violations;
  }
  if (line.includes('bds-lint-ignore')) return violations;

  const isTsx = /\.tsx?$/.test(file);
  const isCss = /\.css$/.test(file);

  function pushViolation(prop, tokenName, ruleKey, column) {
    const rule = TOKEN_FAMILY_RULES[ruleKey];
    if (!rule) return;
    if (tokenFamilyMatchesAllowlist(tokenName, rule.allowed)) return;
    violations.push({
      rule: 'token-family',
      severity: isComponent ? 'error' : 'warning',
      file,
      line: lineNum,
      column: column + 1,
      message: `"${prop}: var(${tokenName})" — ${classifyTokenFamily(tokenName)?.slice(2, -1) || 'unknown'}-family token in ${rule.label} slot`,
      suggestion: rule.suggestion,
    });
  }

  if (isCss) {
    // Shape A: standard CSS property `<prop>: var(--token)`
    // Must match an exact key in TOKEN_FAMILY_RULES (so `border-color`
    // matches but `border` shorthand doesn't — shorthands bundle width/style
    // and are out of scope).
    const propRegex = /(^|[\s;{])(background-color|background|color|border-color|border-top-color|border-bottom-color|border-left-color|border-right-color|outline-color)\s*:\s*var\((--[\w-]+)(?:\s*,[^)]*)?\)/g;
    let m;
    while ((m = propRegex.exec(line)) !== null) {
      pushViolation(m[2], m[3], m[2], m.index + m[1].length);
    }

    // Shape B: custom-property declaration `<--family-...>: var(--token)`
    // Only LHS prefixes in CUSTOM_PROP_TO_RULE trigger the rule. Pure
    // numeric-suffix or skipped prefixes (--bds-*, --font-*, etc.) are
    // out of scope.
    const declRegex = /(^|[\s;{])(--[\w-]+)\s*:\s*var\((--[\w-]+)(?:\s*,[^)]*)?\)/g;
    while ((m = declRegex.exec(line)) !== null) {
      const lhs = m[2];
      if (lhs.startsWith('--bds-')) continue;
      const ruleKey = Object.entries(CUSTOM_PROP_TO_RULE).find(([prefix]) => lhs.startsWith(prefix))?.[1];
      if (!ruleKey) continue;
      pushViolation(lhs, m[3], ruleKey, m.index + m[1].length);
    }
  }

  if (isTsx) {
    // Shape C: TSX inline-style object property `<camelProp>: 'var(--token)'`
    const tsxRegex = /\b(backgroundColor|background|color|borderColor|borderTopColor|borderBottomColor|borderLeftColor|borderRightColor|outlineColor)\s*:\s*['"]var\((--[\w-]+)(?:\s*,[^)]*)?\)['"]/g;
    let m;
    while ((m = tsxRegex.exec(line)) !== null) {
      const cssProp = TSX_STYLE_PROP_TO_CSS[m[1]];
      if (!cssProp) continue;
      pushViolation(m[1], m[2], cssProp, m.index);
    }
  }

  return violations;
}

/**
 * Rule 6: Raw inline var(--…) in component TSX
 *
 * The component-build standard (§"Styles live in CSS") forbids CSSProperties
 * objects in component .tsx — appearance belongs in the component's .css file
 * as bds- BEM classes. A raw `var(--…)` string in a .tsx is the fingerprint of
 * an inline style object, so this rule flags every such reference.
 *
 * Every consuming inline var() in a component .tsx is an error — the #892
 * burn-down is complete, so there is no longer a grandfathered baseline.
 *
 * Only runs for component .tsx (callers exclude .stories.tsx / .test.tsx, where
 * inline style is allowed for layout helpers). Skips comment lines and any line
 * carrying `bds-lint-ignore` — the escape hatch for runtime-calculated values
 * (percentages, positions) that genuinely cannot live in static CSS.
 */
function checkInlineVarTsx(line, lineNum, file) {
  const violations = [];

  const trimmed = line.trim();
  if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*') || trimmed.startsWith('`')) {
    return violations;
  }
  if (line.includes('bds-lint-ignore')) return violations;

  const severity = 'error';

  const regex = /var\((--[\w-]+)/g;
  let match;
  while ((match = regex.exec(line)) !== null) {
    violations.push({
      rule: 'inline-var',
      severity,
      file,
      line: lineNum,
      column: match.index + 1,
      message: `Raw inline "var(${match[1]})" in component TSX — styles belong in the .css file`,
      suggestion: `Move this declaration into the component's .css as a bds- BEM class (see component-build standard §"Styles live in CSS"). Runtime-calculated value? Append a bds-lint-ignore comment.`,
    });
  }

  return violations;
}

/**
 * Rule 9: bare `bds-lint-ignore` — the marker must carry a reason
 * (brikdesigns/brik-bds#1469). This is the authoritative bare-marker gate. The
 * sibling gates (token-coverage, slot-pattern-check, canonical-class-check)
 * share the marker-detection helper for their skip predicate but do not
 * re-emit this error, to avoid duplicate output on lines they also scan.
 *
 * "Authoritative" was aspirational until #1646: the scan walked `components/ui`
 * + blueprints only, so `stories/` and `.storybook/` — which no other gate
 * walks either — could carry bare markers indefinitely, and 16 did. Those roots
 * now get this rule via BARE_IGNORE_ONLY_DIRS, and only this rule: the token
 * rules deliberately tolerate inline demo styling there, but an unexplained
 * escape hatch is wrong everywhere, so its coverage must be repo-wide even
 * where the rules it can suppress are not.
 */
function checkBareLintIgnore(line, lineNum, file) {
  if (!isBareLintIgnore(line)) return [];
  return [{
    rule: BARE_IGNORE_RULE,
    severity: 'error',
    file,
    line: lineNum,
    column: line.indexOf(LINT_IGNORE_MARKER) + 1,
    message: BARE_IGNORE_MESSAGE,
    suggestion: BARE_IGNORE_FIX,
  }];
}
/**
 * Rule 2-CSS: Hardcoded raw values in component .css — brik-bds (raw-value gate)
 *
 * The pre-existing Rule 2 (checkHardcodedValues) only ever ran on .tsx and only
 * matched JS style-object syntax (`padding: '16px'`). Component appearance lives
 * in .css, where a bare `font-size: 10px` / `height: 24px` / `border: 2px …`
 * used a raw literal instead of a token and sailed through CI — the token rules
 * police var() *references*, never raw *values*. This rule closes that gap: it
 * scans .css declarations for raw px on tokenizable properties and maps each
 * back to its scale token.
 *
 * ERROR when the value lands exactly on the property's scale (value-preserving
 * swap: `height: 24px` → `var(--size-600)`). ALSO ERROR when it lands off every
 * scale (container widths, off-scale type) — the fix there is not a token snap
 * (this rule never invents one) but a conscious choice: park the literal in a
 * component-local --bds-{component}-{property} knob (ADR-014), or bds-lint-ignore
 * it with a reason + a filed scale-gap issue. Warning-severity let raw values
 * accrete silently, which is the drift this gate exists to stop (#2133).
 *
 * Skips: comments, bds-lint-ignore lines, responsive math (calc/clamp/min/max),
 * and any px inside a var() fallback (policed by checkFallbackLiterals). Micro
 * nudges (≤2px) are exempt for dimensional/spacing families (matches the
 * 4-point grid rule's micro carve-out); border-width and font-size are not — 1/2/3px
 * are real --border-width-* rungs and off-scale type is exactly the drift to catch.
 */

// property (kebab) → { fam, noMicro } — the scale a raw value on this property
// should reference. margin shares the padding scale; per-side props inherit the
// base property's family.
const CSS_RAW_VALUE_PROPS = {
  width: { fam: 'size' }, height: { fam: 'size' },
  'min-width': { fam: 'size' }, 'min-height': { fam: 'size' },
  'max-width': { fam: 'size' }, 'max-height': { fam: 'size' },
  padding: { fam: 'padding' }, 'padding-top': { fam: 'padding' },
  'padding-right': { fam: 'padding' }, 'padding-bottom': { fam: 'padding' },
  'padding-left': { fam: 'padding' },
  margin: { fam: 'padding' }, 'margin-top': { fam: 'padding' },
  'margin-right': { fam: 'padding' }, 'margin-bottom': { fam: 'padding' },
  'margin-left': { fam: 'padding' },
  gap: { fam: 'gap' }, 'row-gap': { fam: 'gap' }, 'column-gap': { fam: 'gap' },
  'border-radius': { fam: 'borderRadius' },
  'font-size': { fam: 'fontSize', noMicro: true },
  'border-width': { fam: 'borderWidth', noMicro: true },
  'border-top-width': { fam: 'borderWidth', noMicro: true },
  'border-right-width': { fam: 'borderWidth', noMicro: true },
  'border-bottom-width': { fam: 'borderWidth', noMicro: true },
  'border-left-width': { fam: 'borderWidth', noMicro: true },
  // border shorthands — the leading width literal maps to --border-width-*
  border: { fam: 'borderWidth', noMicro: true },
  'border-top': { fam: 'borderWidth', noMicro: true },
  'border-right': { fam: 'borderWidth', noMicro: true },
  'border-bottom': { fam: 'borderWidth', noMicro: true },
  'border-left': { fam: 'borderWidth', noMicro: true },
};

// Human-readable family labels for the off-scale WARN suggestion.
const FAM_LABEL = {
  size: '--size-*', padding: '--padding-*', gap: '--gap-*',
  borderRadius: '--border-radius-*', fontSize: '--body-*/--label-*/--heading-*',
  borderWidth: '--border-width-*',
};

/**
 * Build px → token maps from the token CSS sources, resolving one level of
 * var() aliasing (`--padding-md: var(--space-400)` → `--space-400: 16px` → 16).
 * Read from the same files parseCssTokens() reads so the maps track the scale;
 * returns empty maps in a checkout that has not built tokens (rule then no-ops).
 */
function buildValueMaps() {
  const SOURCES = [
    SD_CSS_PATH,
    path.join(REPO_ROOT, 'tokens', 'figma-tokens.css'),
    path.join(REPO_ROOT, 'tokens', 'gap-fills.css'),
    path.join(REPO_ROOT, 'tokens', 'ratios.css'),
    path.join(REPO_ROOT, 'tokens', 'compat', 'bridge.css'),
  ].filter(f => fs.existsSync(f));

  const raw = new Map(); // token name → raw value string (first definition wins)
  for (const f of SOURCES) {
    const css = fs.readFileSync(f, 'utf8');
    for (const m of css.matchAll(/^\s*(--[\w-]+)\s*:\s*([^;]+);/gm)) {
      if (!raw.has(m[1])) raw.set(m[1], m[2].trim());
    }
  }

  function toPx(name, depth = 0) {
    if (depth > 5) return null;
    const v = raw.get(name);
    if (v === undefined) return null;
    if (/^0$/.test(v)) return 0;
    const px = v.match(/^(\d+(?:\.\d+)?)px$/);
    if (px) return parseFloat(px[1]);
    const alias = v.match(/^var\(\s*(--[\w-]+)\s*\)$/);
    if (alias) return toPx(alias[1], depth + 1);
    return null;
  }

  const FAMILIES = {
    size: /^--size-\d+$/,
    padding: /^--padding-[a-z]+$/,
    gap: /^--gap-[a-z]+$/,
    borderRadius: /^--border-radius-[a-z]+$/,
    borderWidth: /^--border-width-[a-z]+$/,
    fontSize: /^--(?:body|label|heading|display|subtitle)-[a-z]+$/,
  };

  const maps = {};
  for (const [key, re] of Object.entries(FAMILIES)) {
    const m = new Map();
    for (const name of raw.keys()) {
      if (!re.test(name)) continue;
      const px = toPx(name);
      if (px === null || px === 0) continue;
      if (!m.has(px)) m.set(px, name); // first canonical token at this px wins
    }
    maps[key] = m;
  }
  return maps;
}

function checkCssRawValues(line, lineNum, file, valueMaps) {
  const violations = [];
  const trimmed = line.trim();
  if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return violations;
  if (line.includes('bds-lint-ignore')) return violations;

  // One declaration per line (BDS CSS house style). Grab `prop: value`.
  const decl = line.match(/^\s*(-?[a-z][a-z-]*)\s*:\s*([^;{}]+);?/i);
  if (!decl) return violations;
  const prop = decl[1].toLowerCase();
  const cfg = CSS_RAW_VALUE_PROPS[prop];
  if (!cfg) return violations;

  let value = decl[2];
  // Responsive math anchors its own literals (vw/%); the fallback-literal and
  // math rules cover token discipline there. Don't second-guess it.
  if (/\b(?:calc|clamp|min|max|env)\s*\(/.test(value)) return violations;
  // Strip var(...) spans — a px inside a var() fallback is checkFallbackLiterals'
  // job; here we only want bare literals.
  const bare = value.replace(/var\([^)]*\)/g, ' ');

  const map = valueMaps[cfg.fam] || new Map();
  const seen = new Set();
  for (const pm of bare.matchAll(/(\d+(?:\.\d+)?)px/g)) {
    const px = parseFloat(pm[1]);
    if (px === 0 || seen.has(px)) continue;
    seen.add(px);
    if (!cfg.noMicro && px <= 2) continue; // micro nudge — exempt (4-pt grid carve-out)

    const token = map.get(px);
    const col = line.indexOf(pm[0]) + 1;
    if (token) {
      violations.push({
        rule: 'css-raw-value',
        severity: 'error',
        file, line: lineNum, column: col,
        message: `Hardcoded ${prop}: ${pm[0]} — maps exactly to var(${token})`,
        suggestion: `Replace ${pm[0]} with var(${token}). Runtime-calculated value? Append a bds-lint-ignore with a reason.`,
      });
    } else {
      violations.push({
        rule: 'css-raw-value-offscale',
        severity: 'error',
        file, line: lineNum, column: col,
        message: `Hardcoded ${prop}: ${pm[0]} — no ${FAM_LABEL[cfg.fam]} rung for ${pm[0]} (off every scale)`,
        suggestion: `No token expresses ${pm[0]}. Park it in a component-local --bds-{component}-{property} knob, or bds-lint-ignore with a reason (file the scale gap) — never snap to a near value.`,
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
  // px → scale-token maps for the CSS raw-value rule (css-raw-value).
  const valueMaps = buildValueMaps();
  if (!jsonMode) console.log(`  Loaded ${tokens.allTokens.size} tokens (${tokens.semanticTokens.size} semantic, ${tokens.primitiveTokens.size} primitive)`);
  if (checkGrid && !jsonMode) {
    console.log('  📐 4-point grid check enabled');
  }

  // 2. Find files — use explicit list if provided, otherwise scan all
  // Match both absolute (from findFiles) and relative (staged paths from the
  // pre-commit hook) forms — hence no leading-slash anchor.
  const isBlueprint = (f) => f.split(path.sep).join('/').includes('content-system/blueprints/');

  // CSS files: explicit list (from pre-commit hook) or full scan
  const cssFilesIdx = args.indexOf('--css-files');
  const explicitCssFiles = cssFilesIdx !== -1
    ? args.slice(cssFilesIdx + 1).filter(f => !f.startsWith('--'))
    : null;

  // Explicit mode: when EITHER list is passed, only the listed files are scanned
  // — the other list defaults to empty rather than a full repo scan. (Lets the
  // pre-commit hook lint staged blueprints via --files alone without dragging in
  // every component .css.) The pre-#1043 hook always passed both, so this is a
  // no-op for it.
  const anyExplicit = explicitFiles !== null || explicitCssFiles !== null;

  const tsxFiles = (explicitFiles
    ? explicitFiles.filter(f => /\.tsx$/.test(f)).map(f => path.resolve(f))
    : (anyExplicit ? [] : findFiles(COMPONENTS_DIR, /\.tsx$/))
  ).filter(f => !isBlueprint(f));

  const cssFiles = (explicitCssFiles
    ? explicitCssFiles.filter(f => /\.css$/.test(f)).map(f => path.resolve(f))
    : (anyExplicit ? [] : findFiles(COMPONENTS_DIR, /\.css$/))
  ).filter(f => !isBlueprint(f));

  // Blueprint files (.css / .astro / .tsx under content-system/blueprints) get
  // the Tier 4 rule subset ONLY (fallback-literal + retired-bp namespace) —
  // brik-bds#1043. The full token suite (unknown-token, primitive, family) is
  // intentionally NOT run here: blueprints carry pre-existing --theme-* drift
  // (#712) and other debt out of #1043's scope. From explicit args, take any
  // staged blueprint paths (deduped across both lists); otherwise scan the whole
  // tree (the CI validate run).
  const explicitAll = [...(explicitFiles || []), ...(explicitCssFiles || [])];
  const blueprintFiles = anyExplicit
    ? [...new Set(explicitAll.filter(f => isBlueprint(f) && /\.(css|astro|tsx)$/.test(f)).map(f => path.resolve(f)))]
    : findFiles(BLUEPRINTS_DIR, /\.(css|astro|tsx)$/);

  // Rule 9 is repo-wide, unlike every other rule here (#1646).
  //
  // The token rules are deliberately scoped to components/ui + blueprints —
  // `stories/` and `.storybook/` carry inline demo styling the suite would
  // drown in. But the bare-marker rule is about the *escape hatch*, not about
  // tokens: a `bds-lint-ignore` with no reason is an ungated bypass wherever it
  // sits (#1469). Scoping it to components/ui meant 7 bare markers sat in
  // stories/theming/AspectRatios.stories.tsx passing CI indefinitely — and
  // suppressing nothing, since the rules they'd have silenced don't apply to
  // stories anyway. These roots therefore get rule 9 ONLY.
  const bareOnlyFiles = anyExplicit
    ? [...new Set(explicitAll
        .map(f => path.resolve(f))
        .filter(f => BARE_IGNORE_ONLY_DIRS.some(d => f.startsWith(d))
                  && /\.(tsx|ts|css|astro|mdx)$/.test(f)))]
    : BARE_IGNORE_ONLY_DIRS.flatMap(d =>
        fs.existsSync(d) ? findFiles(d, /\.(tsx|ts|css|astro|mdx)$/) : []);

  const totalFiles = tsxFiles.length + cssFiles.length + blueprintFiles.length + bareOnlyFiles.length;
  if (totalFiles === 0) {
    if (!jsonMode) console.log('  No files to scan — skipping.\n');
    if (jsonMode) {
      console.log(JSON.stringify({ errors: 0, warnings: 0, totalFiles: 0, totalTokens: tokens.allTokens.size, violations: [] }, null, 2));
    }
    process.exit(0);
  }
  if (!jsonMode) console.log(`  Scanning ${tsxFiles.length} .tsx + ${cssFiles.length} .css + ${blueprintFiles.length} blueprint + ${bareOnlyFiles.length} marker-only files...\n`);

  // 3. Scan components for token usage violations
  const allViolations = [];

  for (const file of tsxFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    const isStory = /\.stories\.tsx$/.test(file);
    const isTest = /\.test\.tsx$/.test(file);
    const isComponent = !isStory;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;

      allViolations.push(...checkBareLintIgnore(line, lineNum, file));
      allViolations.push(...checkPrimitiveTokens(line, lineNum, file, isComponent));
      allViolations.push(...checkHardcodedValues(line, lineNum, file, isComponent));
      allViolations.push(...checkUnknownTokens(line, lineNum, file, tokens, isComponent));
      allViolations.push(...checkDeprecatedTokens(line, lineNum, file));
      allViolations.push(...checkTokenFamilyPairing(line, lineNum, file, isComponent));

      // Rule 6: raw inline var() — component .tsx only (stories/tests may use
      // inline style for layout helpers).
      if (isComponent && !isTest) {
        allViolations.push(...checkInlineVarTsx(line, lineNum, file));
      }

      // Rule 7 + 8: Tier 4 hook discipline (#1043) — apply to component source too.
      allViolations.push(...checkFallbackLiterals(line, lineNum, file, isComponent, lines));
      allViolations.push(...checkRetiredBpNamespace(line, lineNum, file));

      // Rule 4: grid compliance (opt-in via --check-grid)
      if (checkGrid) {
        allViolations.push(...checkGridCompliance(line, lineNum, file));
      }
    }
  }

  // Rule 9 only — see BARE_IGNORE_ONLY_DIRS (#1646).
  for (const file of bareOnlyFiles) {
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    for (let i = 0; i < lines.length; i++) {
      allViolations.push(...checkBareLintIgnore(lines[i], i + 1, file));
    }
  }

  // CSS files: apply token-reference rules only (no TSX style-object rules)
  for (const file of cssFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;

      allViolations.push(...checkBareLintIgnore(line, lineNum, file));
      // Rule 1: primitive token usage in CSS
      allViolations.push(...checkPrimitiveTokens(line, lineNum, file, true));
      // Rule 2-CSS: hardcoded raw px values in CSS (the .tsx Rule 2's blind spot)
      allViolations.push(...checkCssRawValues(line, lineNum, file, valueMaps));
      // Rule 3: unknown token references in CSS (catches stale var() after renames)
      allViolations.push(...checkUnknownTokens(line, lineNum, file, tokens, true));
      allViolations.push(...checkDeprecatedTokens(line, lineNum, file));
      // Rule 5: token-family pairing
      allViolations.push(...checkTokenFamilyPairing(line, lineNum, file, true));
      // Rule 7 + 8: Tier 4 hook discipline (#1043)
      allViolations.push(...checkFallbackLiterals(line, lineNum, file, true, lines));
      allViolations.push(...checkRetiredBpNamespace(line, lineNum, file));

      if (checkGrid) {
        allViolations.push(...checkGridCompliance(line, lineNum, file));
      }
    }

    // Rule 13: responsive token-family swap (#2592) — always-on/error, same
    // reasoning as spacing-mode-track (4c): a rule reachable only via
    // --check-grid gates nothing, since npm run validate never passes it.
    allViolations.push(...checkResponsiveTokenSwap(content, file));
  }

  // Blueprint files: Tier 4 hook discipline (fallback-literal + retired-bp) PLUS
  // the unknown-token gate (#491). The unknown-token rule is the specific check
  // that would have caught the fictional `--space-*` / `--size-container-*` /
  // `--line-height-*` names that shipped to Astro consumers rendering as zero
  // padding. Rule 1 (primitive-in-CSS) and Rule 2 (hardcoded value) stay OFF for
  // blueprints for now — the primitive `--color-*` service-mapping and the raw
  // rgba box-shadow are separate debt tracked under #1438.
  for (const file of blueprintFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;

      allViolations.push(...checkBareLintIgnore(line, lineNum, file));
      allViolations.push(...checkUnknownTokens(line, lineNum, file, tokens, true));
      allViolations.push(...checkDeprecatedTokens(line, lineNum, file));
      allViolations.push(...checkFallbackLiterals(line, lineNum, file, true, lines));
      allViolations.push(...checkRetiredBpNamespace(line, lineNum, file));
    }

    // Rule 13 (#2592): .css only — the brace/selector tracker assumes plain
    // CSS syntax and would misparse .astro frontmatter or .tsx JSX.
    if (/\.css$/.test(file)) {
      allViolations.push(...checkResponsiveTokenSwap(content, file));
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

  // 4b. Breakpoint TS↔CSS drift — the `breakpoints` export in tokens/index.ts is
  // hand-maintained (that file is not emitted by Style Dictionary), but its values
  // must equal the generated --breakpoint-* in figma-tokens.css. CSS custom props
  // can't be read inside @media (ADR-025 §4), so the TS literal is the only thing
  // a real media query sees: a silent drift there is a layout defect no CSS lint
  // can catch. Extends this script rather than adding a gate (#2591).
  const TOKENS_INDEX_PATH = path.join(__dirname, '..', 'tokens', 'index.ts');
  if (fs.existsSync(FIGMA_TOKENS_PATH) && fs.existsSync(TOKENS_INDEX_PATH)) {
    const figmaCSS = fs.readFileSync(FIGMA_TOKENS_PATH, 'utf8');
    const cssBreakpoints = new Map();
    for (const m of figmaCSS.matchAll(/^\s*--breakpoint-([\w-]+)\s*:\s*([^;]+);/gm)) {
      cssBreakpoints.set(m[1], m[2].trim());
    }

    const indexTS = fs.readFileSync(TOKENS_INDEX_PATH, 'utf8');
    const indexLines = indexTS.split('\n');
    const blockStart = indexLines.findIndex(l => /^export const breakpoints = \{/.test(l));
    if (blockStart === -1) {
      allViolations.push({
        rule: 'breakpoint-ts-drift',
        severity: 'error',
        file: TOKENS_INDEX_PATH,
        line: 1,
        column: 1,
        message: '`export const breakpoints = {` not found — the drift check cannot run',
        suggestion: 'Restore the export, or update this rule if it was renamed (brik-bds#2591)',
      });
    } else {
      const tsBreakpoints = new Map();
      for (let i = blockStart + 1; i < indexLines.length; i++) {
        if (/^\}/.test(indexLines[i])) break;
        const entry = indexLines[i].match(/^\s*([\w-]+)\s*:\s*'([^']+)'\s*,/);
        if (entry) tsBreakpoints.set(entry[1], { value: entry[2], line: i + 1 });
      }

      for (const [name, { value, line }] of tsBreakpoints) {
        const cssValue = cssBreakpoints.get(name);
        if (cssValue === undefined) {
          allViolations.push({
            rule: 'breakpoint-ts-drift',
            severity: 'error',
            file: TOKENS_INDEX_PATH,
            line,
            column: 1,
            message: `breakpoints.${name} has no --breakpoint-${name} in figma-tokens.css`,
            suggestion: `Add "${name}" to the ❖ Brik Foundations \`breakpoint\` collection and re-run npm run build:all-tokens, or drop it here`,
          });
        } else if (cssValue !== value) {
          allViolations.push({
            rule: 'breakpoint-ts-drift',
            severity: 'error',
            file: TOKENS_INDEX_PATH,
            line,
            column: 1,
            message: `breakpoints.${name} is ${value} but --breakpoint-${name} is ${cssValue}`,
            suggestion: 'Fix the value in Figma, re-run npm run build:all-tokens, then match it here — never edit the TS literal alone',
          });
        }
      }

      for (const name of cssBreakpoints.keys()) {
        if (tsBreakpoints.has(name)) continue;
        allViolations.push({
          rule: 'breakpoint-ts-drift',
          severity: 'error',
          file: TOKENS_INDEX_PATH,
          line: blockStart + 1,
          column: 1,
          message: `--breakpoint-${name} is generated but missing from the \`breakpoints\` export`,
          suggestion: `Add ${name}: '${cssBreakpoints.get(name)}' — a rung CSS ships but TS omits is unreachable from @media`,
        });
      }
    }
  }

  // 4c. Spacing mode-track integrity — every `[data-mode-spacing]` track must stay a
  // strictly increasing 7-rung scale, on the 4-point grid, with no rung at 0px.
  // A mode block only emits the rungs that DIFFER from the base, so the track a
  // consumer renders is base ∪ override: reading modes-spacing.css on its own cannot
  // see the scale, which is why the collapsed rungs in #2588 were invisible.
  //
  // Error-severity and always-on rather than behind --check-grid: `npm run validate`
  // runs `lint-tokens --errors-only` and never passes that flag, and grid-4pt is
  // warning-only by design — a rule reachable only via `lint-tokens:grid` gates
  // nothing. Extends this script rather than adding a gate (#2588).
  //
  // Covers both spacing families. `--gap-*` landed in #2588; `--padding-*` was held
  // back there only because `compact` would have failed the rule on day one
  // (tiny == xs == 4px, md off-grid at 10px). #2613 fixed those two rungs in Figma,
  // so the family joins the gate here.
  const MODES_SPACING_PATH = path.join(__dirname, '..', 'tokens', 'modes-spacing.css');
  if (fs.existsSync(FIGMA_TOKENS_PATH) && fs.existsSync(MODES_SPACING_PATH)) {
    const RUNGS = SPACING_RUNGS;
    const FAMILIES = ['gap', 'padding'];
    const figmaCSS = fs.readFileSync(FIGMA_TOKENS_PATH, 'utf8');
    const modeLines = fs.readFileSync(MODES_SPACING_PATH, 'utf8').split('\n');

    // Primitives, for the one deref hop a base declaration makes:
    // `--gap-x: var(--space-NNN)`.
    const primitives = new Map();
    for (const m of figmaCSS.matchAll(/^\s*(--space-[\w-]+)\s*:\s*(-?[\d.]+)px\s*;/gm)) {
      primitives.set(m[1], parseFloat(m[2]));
    }

    for (const family of FAMILIES) {
      const baseTrack = new Map();
      const baseRegex = new RegExp(`^\\s*--${family}-([\\w-]+)\\s*:\\s*([^;]+);`, 'gm');
      for (const m of figmaCSS.matchAll(baseRegex)) {
        const raw = m[2].trim();
        const alias = raw.match(/^var\((--[\w-]+)\)$/);
        const px = alias ? primitives.get(alias[1])
          : (/^-?[\d.]+px$/.test(raw) ? parseFloat(raw) : undefined);
        if (px !== undefined && !baseTrack.has(m[1])) baseTrack.set(m[1], px);
      }

      // Mode overrides, with the line each one is declared on.
      const declRegex = new RegExp(`^\\s*--${family}-([\\w-]+)\\s*:\\s*(-?[\\d.]+)px\\s*;`);
      const tracks = [];
      let openTrack = null;
      for (let i = 0; i < modeLines.length; i++) {
        const open = modeLines[i].match(/^\s*\[data-mode-spacing="([\w-]+)"\]\s*\{/);
        if (open) {
          openTrack = { mode: open[1], line: i + 1, overrides: new Map() };
          tracks.push(openTrack);
          continue;
        }
        if (!openTrack) continue;
        if (/^\s*\}/.test(modeLines[i])) { openTrack = null; continue; }
        const decl = modeLines[i].match(declRegex);
        if (decl) openTrack.overrides.set(decl[1], { px: parseFloat(decl[2]), line: i + 1 });
      }

      const missingBase = RUNGS.filter(r => !baseTrack.has(r));
      if (missingBase.length > 0) {
        allViolations.push({
          rule: 'spacing-mode-track',
          severity: 'error',
          file: FIGMA_TOKENS_PATH,
          line: 1,
          column: 1,
          message: `Base ${family} scale is missing ${missingBase.map(r => `--${family}-${r}`).join(', ')} — the mode-track check cannot resolve a full track`,
          suggestion: `Restore the rung in the ❖ Brik Foundations \`spacing\` collection and re-run npm run build:all-tokens, or update RUNGS if the scale was renamed (brik-bds#2588)`,
        });
        continue;
      }
      if (tracks.length === 0) {
        allViolations.push({
          rule: 'spacing-mode-track',
          severity: 'error',
          file: MODES_SPACING_PATH,
          line: 1,
          column: 1,
          message: 'No [data-mode-spacing] blocks found — the mode-track check cannot run',
          suggestion: 'Re-run scripts/generate-modes-css.mjs, or update this rule if the selector contract changed (brik-bds#2588)',
        });
        continue;
      }

      for (const { mode, line: trackLine, overrides } of tracks) {
        // Resolved track = the override where one exists, the base rung otherwise.
        const resolved = RUNGS.map(rung => {
          const o = overrides.get(rung);
          return { rung, px: o ? o.px : baseTrack.get(rung), line: o ? o.line : trackLine, overridden: Boolean(o) };
        });

        for (const { rung, px, line, overridden } of resolved) {
          if (px === 0) {
            allViolations.push({
              rule: 'spacing-mode-track',
              severity: 'error',
              file: MODES_SPACING_PATH,
              line,
              column: 1,
              message: `[${mode}] --${family}-${rung} is 0px — a named rung collapsed onto --${family}-none`,
              suggestion: `Give spacing/${family}/${rung} a non-zero value in the "${mode}" mode of the ❖ Brik Foundations \`spacing\` collection, then re-pull and re-run npm run build:all-tokens`,
            });
          }
          // Off-grid is an error only for a value this file declares; the base
          // track is out of scope and already covered by grid-4pt's warning.
          if (overridden && px > 2 && px % 4 !== 0) {
            allViolations.push({
              rule: 'spacing-mode-track',
              severity: 'error',
              file: MODES_SPACING_PATH,
              line,
              column: 1,
              message: `[${mode}] --${family}-${rung} is ${px}px — off the 4-point grid`,
              suggestion: `Point spacing/${family}/${rung} at a space primitive divisible by 4 (nearest: ${Math.floor(px / 4) * 4}px or ${Math.floor(px / 4) * 4 + 4}px)`,
            });
          }
        }

        for (let i = 1; i < resolved.length; i++) {
          const prev = resolved[i - 1];
          const cur = resolved[i];
          if (cur.px > prev.px) continue;
          allViolations.push({
            rule: 'spacing-mode-track',
            severity: 'error',
            file: MODES_SPACING_PATH,
            line: cur.line,
            column: 1,
            message: `[${mode}] ${family} scale is not strictly increasing: --${family}-${cur.rung} (${cur.px}px) is not greater than --${family}-${prev.rung} (${prev.px}px)`,
            suggestion: `Re-space the "${mode}" track in Figma so ${RUNGS.join(' < ')} holds, then re-pull and re-run npm run build:all-tokens — never hand-edit tokens/modes-spacing.css`,
          });
        }
      }
    }
  }

  // 5. If --check-grid, also scan the token CSS sources for off-grid token values.
  // modes-spacing.css joined the scan in #2588 — the base track was audited while
  // every [data-mode-spacing] override went unread.
  if (checkGrid) {
    const GRID_CSS_SOURCES = [
      path.join(__dirname, '..', 'tokens', 'figma-tokens.css'),
      path.join(__dirname, '..', 'tokens', 'modes-spacing.css'),
    ];
    for (const gridCssPath of GRID_CSS_SOURCES) {
      if (!fs.existsSync(gridCssPath)) continue;
      const cssLines = fs.readFileSync(gridCssPath, 'utf8').split('\n');
      for (let i = 0; i < cssLines.length; i++) {
        allViolations.push(...checkGridCompliance(cssLines[i], i + 1, gridCssPath));
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
    console.log('     Exempt: 0, 1px, 2px (micro). See https://design.brikdesigns.com/docs/foundation/spacing\n');
  }

  process.exit(errorCount > 0 ? 1 : 0);
}

/* Run only as a CLI, so unit tests can import the pure helpers below without
   executing a full repo scan (mirrors lint-story-shape.js). */
if (require.main === module) main();

module.exports = {
  buildValueMaps,
  checkCssRawValues,
  CSS_RAW_VALUE_PROPS,
};
