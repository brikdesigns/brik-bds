#!/usr/bin/env node
/**
 * Docs-host surface drift check — every agent-readable endpoint this repo's
 * CLAUDE.md documents on design.brikdesigns.com must actually be live.
 *
 * #2632 shipped `/bds-manifest.json` (route: docs-site/app/bds-manifest.json/route.ts)
 * then reverted it, then re-shipped it, with nothing catching the gap in
 * between — the docs host 404ing on a documented route went unnoticed because
 * no check ever asked it. This is that check.
 *
 * Scope note: this only verifies the deployed surface, not that the Netlify
 * build command matches netlify.toml's `command` (that half needs a
 * NETLIFY_AUTH_TOKEN this repo's CI does not currently have — tracked
 * separately, not duplicated here as a stub).
 *
 * Usage: node scripts/check-docs-surfaces.mjs
 * Exits non-zero if any documented surface fails to resolve.
 */
const HOST = 'https://design.brikdesigns.com';

// Keep this list in sync with the brik-bds CLAUDE.md "agent-readable surface" bullet.
const SURFACES = [
  '/llms.txt',
  '/llms-full.txt',
  '/bds-manifest.json',
  '/docs/getting-started/documentation-system.md',
];

let failed = false;

for (const path of SURFACES) {
  const url = `${HOST}${path}`;
  try {
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) {
      failed = true;
      console.error(`✗ ${url} → ${res.status}`);
    } else {
      console.log(`✓ ${url} → ${res.status}`);
    }
  } catch (err) {
    failed = true;
    console.error(`✗ ${url} → ${err.message}`);
  }
}

if (failed) {
  console.error(
    '\nA surface this repo\'s CLAUDE.md documents as live on design.brikdesigns.com ' +
      'is not resolving. Either the deploy is broken or the doc is stale — fix the ' +
      'deploy, or remove the claim from CLAUDE.md if the surface is retired.'
  );
  process.exit(1);
}
