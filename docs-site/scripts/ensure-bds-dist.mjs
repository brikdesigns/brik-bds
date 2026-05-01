#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const bdsRoot = resolve(here, '..', '..');
const sentinel = resolve(bdsRoot, 'dist', 'content-system', 'index.js');

if (existsSync(sentinel)) {
  process.exit(0);
}

console.log('[ensure-bds-dist] dist/content-system/index.js not found — building parent BDS lib once.');
const result = spawnSync('npm', ['run', 'build:lib'], {
  cwd: bdsRoot,
  stdio: 'inherit',
  shell: false,
});

if (result.status !== 0) {
  console.error('[ensure-bds-dist] npm run build:lib failed in parent.');
  process.exit(result.status ?? 1);
}
