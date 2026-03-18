#!/usr/bin/env node
/**
 * Copy token CSS files to dist/ after Vite library build.
 * Called by: npm run build:lib (as the final step)
 *
 * Produces:
 *   dist/tokens.css  — figma-tokens.css + overrides.css concatenated
 *   dist/bridge.css  — clean name ↔ Webflow internal name aliases
 */
const fs = require('fs');
const path = require('path');

const TOKENS_DIR = path.join(__dirname, '../tokens');
const DIST_DIR = path.join(__dirname, '../dist');

// Ensure dist exists (Vite should have created it, but be safe)
if (!fs.existsSync(DIST_DIR)) {
  fs.mkdirSync(DIST_DIR, { recursive: true });
}

// Build tokens.css: figma-tokens.css (SD output) + overrides.css (themes + gap-fill)
const figmaTokens = fs.readFileSync(path.join(TOKENS_DIR, 'figma-tokens.css'), 'utf8');
const overrides = fs.readFileSync(path.join(TOKENS_DIR, 'overrides.css'), 'utf8');
const header = '/* @brikdesigns/bds — Token Cascade (auto-generated, do not edit) */\n\n';
fs.writeFileSync(path.join(DIST_DIR, 'tokens.css'), header + figmaTokens + '\n\n' + overrides);
console.log('  ✓ dist/tokens.css');

// Copy bridge.css
const bridge = fs.readFileSync(path.join(TOKENS_DIR, 'bridge.css'), 'utf8');
fs.writeFileSync(path.join(DIST_DIR, 'bridge.css'), bridge);
console.log('  ✓ dist/bridge.css');

console.log('Token CSS build complete.');
