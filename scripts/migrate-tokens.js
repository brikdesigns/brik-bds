#!/usr/bin/env node
/**
 * Migrate Webflow token names → Style Dictionary names
 *
 * Replaces all --_webflow---style token references with clean
 * CSS custom property names from the Style Dictionary build.
 *
 * Usage: node scripts/migrate-tokens.js [--dry-run]
 *
 * Targets: components, .storybook, tokens CSS files
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DRY_RUN = process.argv.includes('--dry-run');
const ROOT = path.join(__dirname, '..');

// ─── Complete Webflow → SD Token Mapping ─────────────────────
// Order matters: longer/more-specific patterns first to avoid
// partial matches (e.g. --_space---gap--sm before --_space---sm)

const MAPPING = [
  // ── Space: Gap tokens ──
  ['--_space---gap--none', '--gap-none'],
  ['--_space---gap--tiny', '--gap-tiny'],
  ['--_space---gap--xs', '--gap-xs'],
  ['--_space---gap--sm', '--gap-sm'],
  ['--_space---gap--md', '--gap-md'],
  ['--_space---gap--lg', '--gap-lg'],
  ['--_space---gap--xl', '--gap-xl'],
  ['--_space---gap--xxl', '--gap-xl'], // deprecated alias
  ['--_space---gap--huge', '--gap-huge'],

  // ── Space: Padding tokens ──
  ['--_space---none', '--padding-none'],
  ['--_space---tiny', '--padding-tiny'],
  ['--_space---xs', '--padding-xs'],
  ['--_space---sm', '--padding-sm'],
  ['--_space---md', '--padding-md'],
  ['--_space---lg', '--padding-lg'],
  ['--_space---xl', '--padding-xl'],
  ['--_space---xxl', '--padding-xl'], // deprecated alias
  ['--_space---huge', '--padding-huge'],
  ['--_space---button', '--padding-tiny'], // button padding = space-200 = 8px = padding-tiny
  ['--_space---input', '--padding-tiny'],  // input padding = space-200 = 8px = padding-tiny

  // ── Color: Text ──
  ['--_color---text--on-color-dark', '--text-on-color-dark'],
  ['--_color---text--on-color-light', '--text-on-color-light'],
  ['--_color---text--brand', '--text-brand-primary'],
  ['--_color---text--inverse', '--text-inverse'],
  ['--_color---text--muted', '--text-muted'],
  ['--_color---text--primary', '--text-primary'],
  ['--_color---text--secondary', '--text-secondary'],

  // ── Color: Background ──
  ['--_color---background--brand-primary', '--background-brand-primary'],
  ['--_color---background--brand-secondary', '--background-brand-secondary'],
  ['--_color---background--input', '--background-input'],
  ['--_color---background--inverse', '--background-inverse'],
  ['--_color---background--primary', '--background-primary'],
  ['--_color---background--secondary', '--background-secondary'],
  ['--_color---background--image-brand', '--background-image-brand'],
  ['--_color---background--image', '--background-image'],
  ['--_color---background--muted', '--background-muted'],
  ['--_color---background--on-color-dark', '--background-on-color-dark'],
  ['--_color---background--on-color-light', '--background-on-color-light'],

  // ── Color: Surface ──
  ['--_color---surface--brand-primary', '--surface-brand-primary'],
  ['--_color---surface--brand-secondary', '--surface-brand-secondary'],
  ['--_color---surface--nav', '--surface-nav'],
  ['--_color---surface--overlay', '--surface-overlay'],
  ['--_color---surface--primary', '--surface-primary'],
  ['--_color---surface--secondary', '--surface-secondary'],
  ['--_color---surface--inverse', '--surface-inverse'],

  // ── Color: Border ──
  ['--_color---border--brand', '--border-brand-primary'],
  ['--_color---border--input', '--border-input'],
  ['--_color---border--inverse', '--border-inverse'],
  ['--_color---border--muted', '--border-muted'],
  ['--_color---border--on-color', '--border-on-color-dark'],
  ['--_color---border--primary', '--border-primary'],
  ['--_color---border--secondary', '--border-secondary'],

  // ── Color: Page ──
  ['--_color---page--brand', '--page-brand-primary'],
  ['--_color---page--primary', '--page-primary'],
  ['--_color---page--secondary', '--page-secondary'],

  // ── Color: Theme (brand palette) ──
  ['--_color---theme--primary', '--theme-blue-blue-light'],
  ['--_color---theme--secondary', '--theme-blue-blue-lighter'],
  ['--_color---theme--tertiary', '--theme-blue-blue-lightest'],
  ['--_color---theme--accent', '--theme-blue-green'],
  ['--_color---theme--fourth', '--theme-blue-blue-dark'],

  // ── Typography: Font Family ──
  ['--_typography---font-family--body', '--font-family-body'],
  ['--_typography---font-family--display', '--font-family-display'],
  ['--_typography---font-family--heading', '--font-family-heading'],
  ['--_typography---font-family--icon', '--font-family-icon'],
  ['--_typography---font-family--label', '--font-family-label'],

  // ── Typography: Body sizes ──
  ['--_typography---body--huge', '--body-huge'],
  ['--_typography---body--lg', '--body-lg'],
  ['--_typography---body--md-base', '--body-md'],
  ['--_typography---body--md', '--body-md'],
  ['--_typography---body--sm', '--body-sm'],
  ['--_typography---body--tiny', '--body-tiny'],
  ['--_typography---body--xl', '--body-xl'],
  ['--_typography---body--xs', '--body-xs'],

  // ── Typography: Heading sizes ──
  ['--_typography---heading--huge', '--heading-huge'],
  ['--_typography---heading--large', '--heading-lg'],
  ['--_typography---heading--medium', '--heading-md'],
  ['--_typography---heading--small', '--heading-sm'],
  ['--_typography---heading--tiny', '--heading-tiny'],
  ['--_typography---heading--x-large', '--heading-xl'],
  ['--_typography---heading--xx-large', '--heading-xxl'],
  ['--_typography---heading--xxx-large', '--heading-huge'], // alias

  // ── Typography: Label sizes ──
  ['--_typography---label--lg', '--label-lg'],
  ['--_typography---label--md-base', '--label-md'],
  ['--_typography---label--md', '--label-md'],
  ['--_typography---label--sm', '--label-sm'],
  ['--_typography---label--tiny', '--label-tiny'],
  ['--_typography---label--xl', '--label-xl'],
  ['--_typography---label--xs', '--label-xs'],

  // ── Typography: Display sizes ──
  ['--_typography---display--large', '--display-lg'],
  ['--_typography---display--medium', '--display-md'],
  ['--_typography---display--small', '--display-sm'],

  // ── Typography: Subtitle sizes ──
  ['--_typography---subtitle--lg', '--subtitle-lg'],
  ['--_typography---subtitle--md', '--subtitle-md'],
  ['--_typography---subtitle--sm', '--subtitle-sm'],

  // ── Typography: Icon sizes ──
  ['--_typography---icon--huge', '--icon-huge'],
  ['--_typography---icon--large', '--icon-lg'],
  ['--_typography---icon--medium-base', '--icon-md'],
  ['--_typography---icon--medium', '--icon-md'],
  ['--_typography---icon--small', '--icon-sm'],
  ['--_typography---icon--tiny', '--icon-tiny'],
  ['--_typography---icon--x-large', '--icon-xl'],
  ['--_typography---icon--xs', '--icon-xs'],

  // ── Border Radius ──
  ['--_border-radius---button', '--border-radius-50'], // 2px, no semantic alias
  ['--_border-radius---input', '--border-radius-50'],  // 2px, no semantic alias
  ['--_border-radius---lg', '--border-radius-lg'],
  ['--_border-radius---md', '--border-radius-md'],
  ['--_border-radius---none', '--border-radius-none'],
  ['--_border-radius---sm', '--border-radius-sm'],

  // ── Border Width ──
  ['--_border-width---lg', '--border-width-lg'],
  ['--_border-width---md', '--border-width-md'],
  ['--_border-width---none', '--border-width-none'],
  ['--_border-width---sm', '--border-width-sm'],

  // ── Box Shadow ──
  ['--_box-shadow---lg', '--box-shadow-lg'],
  ['--_box-shadow---md', '--box-shadow-md'],
  ['--_box-shadow---none', '--box-shadow-none'],
  ['--_box-shadow---sm', '--box-shadow-sm'],

  // ── Blur Radius ──
  ['--_blur-radius---lg', '--blur-radius-lg'],
  ['--_blur-radius---md', '--blur-radius-md'],
  ['--_blur-radius---none', '--blur-radius-sm'], // fallback
  ['--_blur-radius---sm', '--blur-radius-sm'],

  // ── Size ──
  ['--_size---none', '--size-0'],
  ['--_size---tiny', '--size-50'],
  ['--_size---sm', '--size-200'],
  ['--_size---md', '--size-400'],
  ['--_size---lg', '--size-600'],
  ['--_size---xl', '--size-800'],
  ['--_size---xxl', '--size-1000'],
  ['--_size---huge', '--size-1200'],

  // ── Primitive renames (double-dash → single-dash) ──
  // Colors
  ['--grayscale--', '--color-grayscale-'],
  ['--system--', '--color-system-'],
  ['--_themes---', '--theme-'],

  // Scales (-- separator → single -)
  ['--font-size--', '--font-size-'],
  ['--font-weight--', '--font-weight-'],
  ['--font-line-height--100', '--font-line-height-tight'], // 100% → 110% (closest)
  ['--font-line-height--125', '--font-line-height-snug'],
  ['--font-line-height--138', '--font-line-height-moderate'],
  ['--font-line-height--150', '--font-line-height-normal'],
  ['--font-line-height--175', '--font-line-height-relaxed'],
  ['--font-line-height--200', '--font-line-height-loose'],
  ['--font-line-height--none', '--font-line-height-none'],
  ['--space--', '--space-'],
  ['--size--', '--size-'],
  ['--border-radius--', '--border-radius-'],
  ['--border-width--', '--border-width-'],
  ['--shadow-spread--', '--shadow-spread-'],
  ['--shadow-blur--', '--shadow-blur-'],
  ['--shadow-offset--', '--shadow-offset-'],
];

// ─── File discovery ──────────────────────────────────────────

function findFiles(patterns) {
  const files = [];
  for (const p of patterns) {
    try {
      const result = execSync(`find ${ROOT} -path "${p}" -not -path "*/node_modules/*"`, {
        encoding: 'utf8',
      });
      files.push(...result.trim().split('\n').filter(Boolean));
    } catch {
      // No matches
    }
  }
  return [...new Set(files)];
}

const TARGET_FILES = findFiles([
  `${ROOT}/components/ui/*/*.tsx`,
  `${ROOT}/components/ui/*/*.ts`,
  `${ROOT}/components/providers/*.tsx`,
  `${ROOT}/.storybook/preview.tsx`,
  `${ROOT}/.storybook/storybook-overrides.css`,
  `${ROOT}/tokens/themes.css`,
  `${ROOT}/tokens/webflow-tokens.css`,
  `${ROOT}/tokens/bridge.css`,
]);

// ─── Migration ───────────────────────────────────────────────

let totalReplacements = 0;
let filesChanged = 0;

for (const filePath of TARGET_FILES) {
  const original = fs.readFileSync(filePath, 'utf8');
  let content = original;

  for (const [from, to] of MAPPING) {
    // Escape special regex characters in the "from" string
    const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'g');
    content = content.replace(regex, to);
  }

  if (content !== original) {
    const relPath = path.relative(ROOT, filePath);
    const count = countDiffs(original, content);
    totalReplacements += count;
    filesChanged++;

    if (DRY_RUN) {
      console.log(`  [DRY] ${relPath} — ${count} replacements`);
    } else {
      fs.writeFileSync(filePath, content);
      console.log(`  [OK]  ${relPath} — ${count} replacements`);
    }
  }
}

function countDiffs(a, b) {
  const aLines = a.split('\n');
  const bLines = b.split('\n');
  let diffs = 0;
  const maxLen = Math.max(aLines.length, bLines.length);
  for (let i = 0; i < maxLen; i++) {
    if (aLines[i] !== bLines[i]) diffs++;
  }
  return diffs;
}

console.log(`\n  ${DRY_RUN ? '[DRY RUN] ' : ''}${filesChanged} files, ${totalReplacements} lines changed`);
if (DRY_RUN) {
  console.log('  Run without --dry-run to apply changes.\n');
}
