#!/usr/bin/env node
/**
 * MDX coverage lint — every PUBLIC component export has a docs page that
 * mentions it.
 *
 * For each `components/ui/<Name>/` that ships stories, the component's public
 * API is its `index.ts` re-exports (not raw `.tsx` exports — those include
 * internal building blocks like DataView's skeletons that consumers can't
 * import). A public PascalCase export that never appears in the sibling
 * `.mdx` is a coverage gap: invisible to Chromatic and to the Storybook MCP
 * payload consumer-repo agents rely on.
 *
 * Exemptions (not gaps):
 *  - `wip` / `!manifest` meta tag — placeholder or deliberately hidden (Calendar)
 *  - `Tools/*` bucket — dev-only utilities (BrikDevBar, DevFeedbackWidget)
 *  - EXEMPT set — Foundation galleries whose story IS the documentation (Icons)
 *
 * Usage: node scripts/lint-mdx-coverage.mjs
 * Exits non-zero on any gap.
 */
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const UI = 'components/ui';

// Foundation galleries + other surfaces whose story gallery is the doc.
const EXEMPT = new Set(['Icons']);

/** Public PascalCase export names from a component's index.ts (falls back to
 *  the main .tsx when index re-exports with `export *` or is absent). */
function publicExports(dir, name) {
  const indexPath = join(dir, 'index.ts');
  if (existsSync(indexPath)) {
    const src = readFileSync(indexPath, 'utf8');
    if (!/export\s+\*/.test(src)) {
      const names = new Set();
      // named re-exports: export { A, B, type C, default } from './X'
      for (const block of src.matchAll(/export\s*\{([^}]*)\}/g)) {
        for (const raw of block[1].split(',')) {
          const tok = raw.trim();
          if (!tok || tok.startsWith('type ') || tok === 'default') continue;
          const ident = tok.split(/\s+as\s+/)[0].trim();
          if (/^[A-Z][A-Za-z0-9]+$/.test(ident)) names.add(ident);
        }
      }
      if (names.size) return names;
    }
  }
  // fallback: PascalCase function/const exports in <Name>.tsx
  const tsx = join(dir, `${name}.tsx`);
  const names = new Set();
  if (existsSync(tsx)) {
    const src = readFileSync(tsx, 'utf8');
    for (const m of src.matchAll(/export\s+(?:function|const)\s+([A-Z][A-Za-z0-9]+)/g)) {
      names.add(m[1]);
    }
  }
  return names;
}

const noMdx = [];
const undocumented = [];

for (const name of readdirSync(UI)) {
  const dir = join(UI, name);
  if (name === 'shared' || !statSync(dir).isDirectory()) continue;
  const files = readdirSync(dir);
  const storyFile = files.find((f) => f.endsWith('.stories.tsx'));
  if (!storyFile) continue;

  const story = readFileSync(join(dir, storyFile), 'utf8');
  const tagsMatch = story.match(/tags:\s*\[([^\]]*)\]/);
  const tags = tagsMatch ? tagsMatch[1] : '';
  const titleMatch = story.match(/title:\s*['"]([^'"]+)['"]/);
  const title = titleMatch ? titleMatch[1] : '';

  if (/['"]wip['"]/.test(tags) || /['"]!manifest['"]/.test(tags)) continue;
  if (title.startsWith('Tools/')) continue;
  if (EXEMPT.has(name)) continue;

  const exports = publicExports(dir, name);
  if (exports.size === 0) continue;

  const mdxFile = files.find((f) => f.endsWith('.mdx'));
  if (!mdxFile) {
    noMdx.push({ name, exports: [...exports] });
    continue;
  }
  const mdx = readFileSync(join(dir, mdxFile), 'utf8');
  const missing = [...exports].filter((e) => {
    const re = new RegExp(`(^|[^A-Za-z0-9])${e}([^A-Za-z0-9]|$)`);
    return !re.test(mdx);
  });
  if (missing.length) undocumented.push({ name, missing });
}

const total = noMdx.length + undocumented.length;
console.log('\nMDX coverage lint');
console.log('════════════════════════════════════════════════════════════');
if (total === 0) {
  console.log('✓ Every public component export is referenced in its MDX page.\n');
  process.exit(0);
}
console.log(`✗ ${total} coverage gap(s):\n`);
for (const { name, exports } of noMdx) {
  console.log(`  ${name}: no MDX page (public exports: ${exports.join(', ')})`);
}
for (const { name, missing } of undocumented) {
  console.log(`  ${name}: undocumented public export(s): ${missing.join(', ')}`);
}
console.log('');
process.exit(1);
