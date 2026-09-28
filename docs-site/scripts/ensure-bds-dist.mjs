#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const docsRoot = resolve(here, '..');
const bdsRoot = resolve(here, '..', '..');

// Both artifacts come out of the parent's `build:lib`. A dist/ built before
// #2616 has the first and not the second, so check for both — checking only
// content-system would early-exit into a missing-manifest hard failure.
const artifacts = [
  resolve(bdsRoot, 'dist', 'content-system', 'index.js'),
  resolve(bdsRoot, 'dist', 'bds-manifest.json'),
];

// Serve the component + token manifest at /bds-manifest.json (#2616). It is
// already built by `build:inspector-manifest` and already published on the
// Storybook host (root package.json `prestorybook`); this mirrors that copy for
// the docs host, so an agent can read the component surface as data.
function publishManifest() {
  mkdirSync(resolve(docsRoot, 'public'), { recursive: true });
  copyFileSync(artifacts[1], resolve(docsRoot, 'public', 'bds-manifest.json'));
}

if (!artifacts.every(existsSync)) {
  const missing = artifacts.filter((path) => !existsSync(path));
  console.log(
    `[ensure-bds-dist] missing ${missing.join(', ')} — building parent BDS lib once.`,
  );
  const result = spawnSync('npm', ['run', 'build:lib'], {
    cwd: bdsRoot,
    stdio: 'inherit',
    shell: false,
  });

  if (result.status !== 0) {
    console.error('[ensure-bds-dist] npm run build:lib failed in parent.');
    process.exit(result.status ?? 1);
  }

  const stillMissing = artifacts.filter((path) => !existsSync(path));
  if (stillMissing.length > 0) {
    console.error(
      `[ensure-bds-dist] still missing after build:lib: ${stillMissing.join(', ')}`,
    );
    process.exit(1);
  }
}

publishManifest();
