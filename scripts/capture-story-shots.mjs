#!/usr/bin/env node
/**
 * capture-story-shots.mjs — screenshot the stories of the components a branch
 * changed, so `pr-task.sh --screenshots <dir>` can accept the PNGs as evidence
 * that the change was rendered (#813).
 *
 * Usage:
 *   node scripts/capture-story-shots.mjs <outDir> [--base main] [<component path>...]
 *
 * With no component paths it derives them from `git diff origin/<base>...HEAD`.
 * Reads storybook-static/index.json (run `npm run build-storybook` first), serves
 * the build on an ephemeral port, and writes one `<story-id>.png` per story whose
 * source file sits in a changed component's directory.
 *
 * This is verification evidence, not a pixel gate: visual.yml still owns pixels.
 */
import { execFileSync } from 'node:child_process';
import { createReadStream, existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, join, resolve } from 'node:path';
import { chromium } from 'playwright';

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.woff2': 'font/woff2', '.woff': 'font/woff',
};

const args = process.argv.slice(2);
let base = 'main';
const positional = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--base') base = args[++i];
  else positional.push(args[i]);
}
const [outDir, ...componentArgs] = positional;
if (!outDir) {
  console.error('Usage: capture-story-shots.mjs <outDir> [--base main] [<component path>...]');
  process.exit(2);
}

const root = resolve('storybook-static');
const indexPath = join(root, 'index.json');
if (!existsSync(indexPath)) {
  console.error('✗ storybook-static/index.json not found — run `npm run build-storybook` first.');
  process.exit(1);
}

const changed = componentArgs.length
  ? componentArgs
  : execFileSync('git', ['diff', '--name-only', `origin/${base}...HEAD`], { encoding: 'utf8' })
      .split('\n')
      .filter((f) => /^components\/.*\.(tsx|css)$/.test(f) && !/\.(stories|test|spec)\.|\.d\.ts$/.test(f));
const dirs = new Set(changed.map((f) => dirname(f)));
if (dirs.size === 0) {
  console.error('✗ No changed component files to capture — pass component paths explicitly.');
  process.exit(1);
}

const entries = Object.values(JSON.parse(readFileSync(indexPath, 'utf8')).entries ?? {});
const stories = entries.filter(
  (e) => e.type === 'story' && dirs.has(dirname(e.importPath.replace(/^\.\//, ''))),
);
if (stories.length === 0) {
  console.error(`✗ No stories found beside: ${[...dirs].join(', ')}`);
  process.exit(1);
}

const server = createServer((req, res) => {
  const p = join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(root) || !existsSync(p) || statSync(p).isDirectory()) {
    res.writeHead(404).end();
    return;
  }
  res.writeHead(200, { 'content-type': MIME[extname(p)] ?? 'application/octet-stream' });
  createReadStream(p).pipe(res);
});
await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
const origin = `http://127.0.0.1:${server.address().port}`;

mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();
let captured = 0;
try {
  const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });
  for (const s of stories) {
    await page.goto(`${origin}/iframe.html?id=${s.id}&viewMode=story`, { waitUntil: 'networkidle' });
    await page.waitForSelector('#storybook-root > *, #storybook-docs', { timeout: 15000 });
    await page.screenshot({ path: join(outDir, `${s.id}.png`) });
    captured++;
  }
} finally {
  await browser.close();
  server.close();
}
console.log(`✓ Captured ${captured} story screenshot(s) → ${outDir}`);
