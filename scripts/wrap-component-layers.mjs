/**
 * wrap-component-layers.mjs
 *
 * Wraps every component CSS file in `components/ui/**\/*.css` with
 * `@layer bds-components { ... }` so client projects can reliably override
 * component styles without specificity fights.
 *
 * Safe to re-run — skips files that already contain `@layer bds-components`.
 *
 * Usage:
 *   node scripts/wrap-component-layers.mjs           # wrap any unlayered files
 *   node scripts/wrap-component-layers.mjs --check   # CI guard: exit 1 if any unlayered (no writes)
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rootDir = join(__dirname, '..');
const componentsDir = join(rootDir, 'components', 'ui');

/**
 * Recursively collect all .css files under a directory.
 */
function collectCssFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      results.push(...collectCssFiles(full));
    } else if (stat.isFile() && entry.endsWith('.css')) {
      results.push(full);
    }
  }
  return results;
}

const cssFiles = collectCssFiles(componentsDir);

// --check: report-only. Exits non-zero if any component CSS is unlayered, so CI
// can gate it (without mutating files). This is the guard for the #1808 bug —
// unlayered component CSS loses the cascade in consumers that layer BDS.
const CHECK = process.argv.includes('--check');

let wrapped = 0;
let skipped = 0;
const unwrapped = [];

for (const filePath of cssFiles) {
  const rel = relative(rootDir, filePath);
  const content = readFileSync(filePath, 'utf8');

  if (content.includes('@layer bds-components')) {
    if (!CHECK) console.log(`  skip   ${rel}`);
    skipped++;
    continue;
  }

  if (CHECK) {
    unwrapped.push(rel);
    continue;
  }

  const wrapped_content = `@layer bds-components {\n${content}}\n`;
  writeFileSync(filePath, wrapped_content, 'utf8');
  console.log(`  wrap   ${rel}`);
  wrapped++;
}

if (CHECK) {
  if (unwrapped.length > 0) {
    console.error(
      `\n✗ ${unwrapped.length} component CSS file(s) are NOT wrapped in @layer bds-components:\n` +
        unwrapped.map((f) => `    ${f}`).join('\n') +
        `\n\nUnlayered component CSS loses the cascade in consumers that layer BDS (e.g. the\n` +
        `portal's \`[class*="bds-"] { all: revert-layer }\` bridge), so the component renders\n` +
        `unstyled — the #1808 invisible-Logo bug. Run \`node scripts/wrap-component-layers.mjs\`\n` +
        `and commit.`,
    );
    process.exit(1);
  }
  console.log(`✓ All ${skipped} component CSS files are layered.`);
  process.exit(0);
}

console.log(`\nDone. Wrapped: ${wrapped}  Skipped (already layered): ${skipped}  Total: ${cssFiles.length}`);
