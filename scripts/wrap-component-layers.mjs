/**
 * wrap-component-layers.mjs
 *
 * Wraps every component CSS file in `components/ui/**\/*.css` with
 * `@layer bds-components { ... }` so client projects can reliably override
 * component styles without specificity fights.
 *
 * Safe to re-run — skips files that already contain `@layer bds-components`.
 *
 * Usage: node scripts/wrap-component-layers.mjs
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

let wrapped = 0;
let skipped = 0;

for (const filePath of cssFiles) {
  const rel = relative(rootDir, filePath);
  const content = readFileSync(filePath, 'utf8');

  if (content.includes('@layer bds-components')) {
    console.log(`  skip   ${rel}`);
    skipped++;
    continue;
  }

  const wrapped_content = `@layer bds-components {\n${content}}\n`;
  writeFileSync(filePath, wrapped_content, 'utf8');
  console.log(`  wrap   ${rel}`);
  wrapped++;
}

console.log(`\nDone. Wrapped: ${wrapped}  Skipped (already layered): ${skipped}  Total: ${cssFiles.length}`);
