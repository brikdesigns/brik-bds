#!/usr/bin/env node

/**
 * Skew-protection config writer
 *
 * Emits `.netlify/v1/skew-protection.json` (the Netlify Frameworks API file
 * that enables Skew Protection). `.netlify/` is gitignored, so — following
 * Netlify's own framework-author pattern — the file is generated at build time
 * rather than committed. Wired into the `prebuild-storybook` npm hook so it runs
 * on every `npm run build-storybook` (local + Netlify) with no netlify.toml
 * build-command change.
 *
 * What it does: tells Netlify's CDN to pin every `/assets/*` request to the
 * deploy named by the `nf-skew` cookie. That cookie is stamped with the current
 * deploy's token by `netlify/edge-functions/set-skew-cookie.ts`. Together they
 * make an already-open Storybook tab keep resolving its original deploy's
 * content-hashed chunks after a newer deploy lands — no "Failed to fetch
 * dynamically imported module" 404, no reload.
 *
 * Only `/assets/*` is pinned. The HTML entry documents (`/`, `/index.html`,
 * `/iframe.html`) and the story index (`/index.json`) are deliberately NOT
 * matched, so a fresh load always gets the latest deploy and refreshes the
 * cookie to it.
 *
 * Usage:
 *   node scripts/write-skew-protection.mjs
 */

import { mkdir, writeFile } from 'node:fs/promises';

const DIR = '.netlify/v1';
const FILE = `${DIR}/skew-protection.json`;

const config = {
  patterns: ['^/assets/.*'],
  sources: [{ type: 'cookie', name: 'nf-skew' }],
};

await mkdir(DIR, { recursive: true });
await writeFile(FILE, `${JSON.stringify(config, null, 2)}\n`);

if (!process.argv.includes('--quiet')) {
  console.log(`✓ wrote ${FILE}`);
}
