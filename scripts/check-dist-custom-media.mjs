#!/usr/bin/env node
// Built-output half of the ADR-044 gate (#2644). lint-tokens checks the SOURCE
// names; this checks they were RESOLVED. A browser ignores an unresolved
// `@media (--bds-down-tablet)` — the rule silently never applies in any
// consumer — so a build path that skips postcss.config.mjs must fail here.
import fs from 'node:fs';

const file = new URL('../dist/styles.css', import.meta.url);
const css = fs.readFileSync(file, 'utf8');
const hits = css.match(/@custom-media[^;]*;|@media[^{]*\(--bds-[^)]*\)/g) || [];

if (hits.length) {
  console.error(`✗ dist/styles.css has ${hits.length} unresolved custom media (ADR-044):`);
  for (const h of hits.slice(0, 5)) console.error(`    ${h}`);
  console.error('  postcss.config.mjs did not run on this build path.');
  process.exit(1);
}
console.log('✓ dist/styles.css: every breakpoint custom media resolved to px');
