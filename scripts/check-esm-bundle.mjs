#!/usr/bin/env node
/**
 * check-esm-bundle.js — assert the published ESM entry is import-clean.
 *
 * Why this gate exists:
 *   `@brikdesigns/bds` is consumed as ESM by SSR/prerender builds (Next.js
 *   turbopack, Astro/Vite). If a CJS/UMD dependency (e.g. lottie-web) gets
 *   inlined into `dist/index.esm.js`, the bundle carries a dynamic `require()`
 *   that those builds reject with "dynamic usage of require is not supported"
 *   — breaking every downstream consumer, even though BDS's own CI is green
 *   (BDS never builds itself as an SSR app).
 *
 *   v0.97.2 shipped exactly this regression after a vite 6→8 bump inlined
 *   lottie-web into the ESM entry (peerDependency missing from rollup
 *   `external`). This check makes that class of break publish-blocking.
 *
 * What it does: scans the built ESM entry for `require(` / `__require` and
 * fails if any are present. Run after `build:lib`, before publish.
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const esmEntry = resolve(__dirname, '..', 'dist', 'index.esm.js');

if (!existsSync(esmEntry)) {
  console.error(`\n❌ ESM bundle check: ${esmEntry} not found.`);
  console.error('   Run `npm run build:lib` before this check.\n');
  process.exit(1);
}

const src = readFileSync(esmEntry, 'utf8');
const lines = src.split('\n');

// Match a require call: `require(`, `__require(`, `require_<x>(` — but NOT the
// substring inside identifiers like `requireConfig` that are followed by a
// letter. The offending patterns all call require as a function.
const RE = /(?:^|[^A-Za-z0-9_$])(__require|require)\s*\(/;

const hits = [];
lines.forEach((line, i) => {
  if (RE.test(line)) hits.push({ n: i + 1, text: line.trim().slice(0, 120) });
});

if (hits.length > 0) {
  console.error('\n❌ ESM bundle check FAILED — dist/index.esm.js contains require():');
  console.error('   ESM-prerender consumers (turbopack / Astro) reject dynamic require.');
  console.error('   A CJS/UMD dependency is being inlined into the ESM entry.');
  console.error('   Fix: add the offending dependency to `external` in vite.config.lib.ts.\n');
  hits.slice(0, 10).forEach((h) => console.error(`   L${h.n}: ${h.text}`));
  if (hits.length > 10) console.error(`   …and ${hits.length - 10} more.`);
  console.error('');
  process.exit(1);
}

console.log('✅ ESM bundle check: dist/index.esm.js is require()-free.');
