// Compiles input.css with the recipe in postcss.config.mjs and prints the result.
//   node examples/consumer-breakpoints/build.mjs
// Run from a project that has @brikdesigns/bds, postcss, postcss-custom-media and
// @csstools/postcss-global-data installed (this repo resolves @brikdesigns/bds to itself).
import fs from 'node:fs';
import postcss from 'postcss';
import config from './postcss.config.mjs';

const from = new URL('./input.css', import.meta.url);
const result = await postcss(config.plugins).process(fs.readFileSync(from, 'utf8'), { from: from.pathname });
if (/--bds-(up|down)-|@custom-media/.test(result.css)) {
  console.error('unresolved breakpoint custom media in output');
  process.exit(1);
}
process.stdout.write(result.css);
