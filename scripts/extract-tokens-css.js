#!/usr/bin/env node

/**
 * Extract Tokens CSS
 *
 * Reads the full Webflow CSS export and extracts ONLY:
 *   1. @font-face declarations → tokens/fonts.css
 *   2. :root { ... } block (primitives) → tokens/webflow-tokens.css
 *   3. .body { ... } block (default semantic tokens) → tokens/webflow-tokens.css
 *   4. .body.theme-N { ... } blocks (theme overrides) → tokens/webflow-tokens.css
 *
 * This eliminates ~6,300 lines of Webflow layout/component CSS that
 * contaminates Storybook's code blocks and UI rendering.
 */

const fs = require('fs');
const path = require('path');

const WEBFLOW_CSS_PATH = path.join(
  __dirname,
  '..',
  'updates',
  'brik-bds.webflow',
  'css',
  'brik-bds.webflow.css'
);
const TOKENS_OUTPUT = path.join(__dirname, '..', 'tokens', 'webflow-tokens.css');
const FONTS_OUTPUT = path.join(__dirname, '..', 'tokens', 'fonts.css');

// Font path: from tokens/ dir, fonts are at ../updates/brik-bds.webflow/fonts/
const FONT_PATH_PREFIX = '../updates/brik-bds.webflow/fonts';

function extractTokensCSS() {
  if (!fs.existsSync(WEBFLOW_CSS_PATH)) {
    console.error(`ERROR: Webflow CSS not found at ${WEBFLOW_CSS_PATH}`);
    process.exit(1);
  }

  const css = fs.readFileSync(WEBFLOW_CSS_PATH, 'utf8');
  const lines = css.split('\n');

  const fontFaceBlocks = [];
  const tokenBlocks = [];

  let i = 0;
  const seenFontFaces = new Set();

  while (i < lines.length) {
    const line = lines[i];

    // Capture @font-face blocks
    if (line.trim().startsWith('@font-face')) {
      const block = [];
      block.push(line);
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('}')) {
        block.push(lines[i]);
        i++;
      }
      if (i < lines.length) {
        block.push(lines[i]); // closing }
        i++;
      }

      // Deduplicate (Webflow CSS has font-face blocks at both top and bottom
      // with different quote styles: Lato vs 'Lato', "Font..." vs 'Font...')
      const normalized = block
        .map((l) => l.trim().replace(/['"]/g, ''))
        .join('');
      if (!seenFontFaces.has(normalized)) {
        seenFontFaces.add(normalized);
        fontFaceBlocks.push(block.join('\n'));
      }
      continue;
    }

    // Capture :root { ... } block
    if (line.trim().startsWith(':root')) {
      const block = [];
      block.push(line);
      i++;
      let braceDepth = 1;
      while (i < lines.length && braceDepth > 0) {
        if (lines[i].includes('{')) braceDepth++;
        if (lines[i].includes('}')) braceDepth--;
        block.push(lines[i]);
        i++;
      }
      tokenBlocks.push(block.join('\n'));
      continue;
    }

    // Capture .body { ... } block (default theme)
    // Only match at column 0 — skip .body blocks nested inside @media queries
    if (/^\.body\s*\{/.test(line)) {
      const block = [];
      block.push(line);
      i++;
      let braceDepth = 1;
      while (i < lines.length && braceDepth > 0) {
        if (lines[i].includes('{')) braceDepth++;
        if (lines[i].includes('}')) braceDepth--;
        block.push(lines[i]);
        i++;
      }
      tokenBlocks.push(block.join('\n'));
      continue;
    }

    // Capture .body.theme-N { ... } blocks
    // Only match at column 0 — skip theme blocks nested inside @media queries
    if (/^\.body\.theme-\d+/.test(line)) {
      const block = [];
      block.push(line);
      i++;
      let braceDepth = 1;
      while (i < lines.length && braceDepth > 0) {
        if (lines[i].includes('{')) braceDepth++;
        if (lines[i].includes('}')) braceDepth--;
        block.push(lines[i]);
        i++;
      }
      tokenBlocks.push(block.join('\n'));
      continue;
    }

    i++;
  }

  // Rewrite font paths for the tokens/ output directory
  const fontCSS = fontFaceBlocks
    .map((block) =>
      block.replace(/url\(['"]?\.\.\/fonts\//g, `url('${FONT_PATH_PREFIX}/`).replace(
        /format\("(\w+)"\)/g,
        "format('$1')"
      )
    )
    .join('\n\n');

  const tokensCSS = tokenBlocks.join('\n\n');

  // Ensure output directory exists
  const tokensDir = path.dirname(TOKENS_OUTPUT);
  if (!fs.existsSync(tokensDir)) {
    fs.mkdirSync(tokensDir, { recursive: true });
  }

  // Write fonts.css
  const fontsHeader = `/**
 * BDS Font Declarations
 *
 * Auto-generated from Webflow CSS export.
 * DO NOT EDIT — re-run: npm run extract-tokens
 *
 * Source: updates/brik-bds.webflow/css/brik-bds.webflow.css
 */

`;
  fs.writeFileSync(FONTS_OUTPUT, fontsHeader + fontCSS + '\n');

  // Write webflow-tokens.css
  const tokensHeader = `/**
 * BDS Design Tokens (CSS Custom Properties)
 *
 * Auto-generated from Webflow CSS export.
 * DO NOT EDIT — re-run: npm run extract-tokens
 *
 * Contains:
 *   - :root primitives (grayscale, system colors, palettes, scales)
 *   - .body semantic tokens (default theme mappings)
 *   - .body.theme-N overrides (8 theme variations)
 *
 * Source: updates/brik-bds.webflow/css/brik-bds.webflow.css
 */

`;
  fs.writeFileSync(TOKENS_OUTPUT, tokensHeader + tokensCSS + '\n');

  // Report
  const totalWebflow = lines.length;
  const fontLines = fontCSS.split('\n').length;
  const tokenLines = tokensCSS.split('\n').length;

  console.log('Extract Tokens CSS');
  console.log('==================');
  console.log(`Source:  ${path.relative(process.cwd(), WEBFLOW_CSS_PATH)} (${totalWebflow} lines)`);
  console.log(`Output:  tokens/fonts.css (${fontLines} lines, ${fontFaceBlocks.length} @font-face rules)`);
  console.log(`Output:  tokens/webflow-tokens.css (${tokenLines} lines, ${tokenBlocks.length} blocks)`);
  console.log(`Removed: ~${totalWebflow - fontLines - tokenLines} lines of Webflow layout/component CSS`);
}

extractTokensCSS();
