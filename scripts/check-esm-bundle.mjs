#!/usr/bin/env node
/**
 * check-esm-bundle.mjs — assert the published package is import-clean for
 * plain Node-ESM consumers (Netlify functions, Astro/Vite SSR, turbopack).
 *
 * Two failure classes this gate covers:
 *
 * 1. require() inlined into the ESM root entry.
 *    `@brikdesigns/bds` is consumed as ESM by SSR/prerender builds. If a
 *    CJS/UMD dependency (e.g. lottie-web) gets inlined into the root ESM
 *    bundle, it carries a dynamic `require()` those builds reject with
 *    "dynamic usage of require is not supported". v0.97.2 shipped exactly
 *    this after a vite 6→8 bump.
 *
 * 2. A `.js`/`.cjs` file exposed under an `import` condition.
 *    The package has no `"type": "module"`, so Node treats any `.js` as CJS
 *    regardless of its contents. A subpath whose `import` condition points at
 *    a tsc-emitted `.js` (ESM syntax, CJS extension) loads as CJS under
 *    Node-ESM and named imports fail with
 *    `SyntaxError: Named export '…' not found`. webpack/vitest tolerate it
 *    (looser interop), so it only bites the plain-Node-ESM runtime — which is
 *    how `blueprints-astro/types` silently broke the portal background-function
 *    fleet (brik-client-portal#1465, brik-bds#1008). This gate makes any
 *    CJS-under-`import` subpath publish-blocking, and proves each ESM subpath
 *    actually loads under Node-ESM.
 *
 * Run after `build:lib`, before publish (wired into `prepublishOnly`).
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname, extname } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkgRoot = resolve(__dirname, '..');
const pkg = JSON.parse(readFileSync(resolve(pkgRoot, 'package.json'), 'utf8'));

const isModulePkg = pkg.type === 'module';
let failed = false;
const fail = (msg) => {
  failed = true;
  console.error(msg);
};

/* ── Collect every target exposed under an `import` condition ──────────────
 * (plus the top-level `module` field). These are the entries Node-ESM
 * consumers resolve. `require`/`default`/asset entries are out of scope. */
const importTargets = new Map(); // subpath label -> relative file path
const addTarget = (label, val) => {
  if (typeof val === 'string') importTargets.set(label, val);
  else if (val && typeof val === 'object' && typeof val.import === 'string') {
    importTargets.set(label, val.import);
  }
};
for (const [subpath, val] of Object.entries(pkg.exports ?? {})) {
  if (subpath.includes('*')) continue; // wildcard subpaths can't be smoke-loaded
  // string-valued exports are bare files (json/css/md) — only flag executable JS
  if (typeof val === 'string') {
    if (['.js', '.cjs', '.mjs'].includes(extname(val))) addTarget(subpath, val);
  } else {
    addTarget(subpath, val);
  }
}
if (pkg.module) importTargets.set('(module field)', pkg.module);

const isJs = (p) => ['.js', '.mjs', '.cjs'].includes(extname(p));

/* ── Static rule: no CJS extension under an `import` condition ─────────────
 * Deterministic; would have caught blueprints-astro/types without running. */
for (const [label, rel] of importTargets) {
  const ext = extname(rel);
  if (!isModulePkg && (ext === '.js' || ext === '.cjs')) {
    fail(
      `❌ ESM export check — \`${label}\` resolves to \`${rel}\` (${ext}). ` +
        `Without "type":"module", Node loads it as CJS under \`import\`, so ` +
        `named imports fail. Emit it as \`.mjs\` (see build:content-system).`,
    );
  }
}

/* ── Runtime smoke: actually import each ESM subpath under Node-ESM ────────
 * AC3 of brik-bds#1008 — proves named exports resolve in a plain-Node-ESM
 * context, not just under webpack/vitest. */
for (const [label, rel] of importTargets) {
  if (!isJs(rel)) continue;
  const abs = resolve(pkgRoot, rel);
  if (!existsSync(abs)) {
    fail(`❌ ESM export check — \`${label}\` target \`${rel}\` does not exist (run \`npm run build:lib\`).`);
    continue;
  }
  try {
    await import(pathToFileURL(abs).href);
    console.log(`✅ ESM import OK — ${label} (${rel})`);
  } catch (err) {
    fail(`❌ ESM import FAILED — \`${label}\` (${rel}): ${err.message.split('\n')[0]}`);
  }
}

/* ── require()-free scan on the ESM root entry ────────────────────────────
 * Catches CJS/UMD deps inlined into the bundle (the lottie-web class). */
const esmEntry = resolve(pkgRoot, 'dist', 'index.esm.mjs');
if (!existsSync(esmEntry)) {
  fail(`❌ ESM bundle check — ${esmEntry} not found. Run \`npm run build:lib\` first.`);
} else {
  const RE = /(?:^|[^A-Za-z0-9_$])(__require|require)\s*\(/;
  const hits = [];
  readFileSync(esmEntry, 'utf8')
    .split('\n')
    .forEach((line, i) => {
      if (RE.test(line)) hits.push({ n: i + 1, text: line.trim().slice(0, 120) });
    });
  if (hits.length > 0) {
    fail('❌ ESM bundle check FAILED — dist/index.esm.mjs contains require():');
    console.error('   ESM-prerender consumers (turbopack / Astro) reject dynamic require.');
    console.error('   A CJS/UMD dependency is being inlined into the ESM entry.');
    console.error('   Fix: add the offending dependency to `external` in vite.config.lib.ts.');
    hits.slice(0, 10).forEach((h) => console.error(`   L${h.n}: ${h.text}`));
    if (hits.length > 10) console.error(`   …and ${hits.length - 10} more.`);
  } else {
    console.log('✅ ESM bundle check: dist/index.esm.mjs is require()-free.');
  }
}

if (failed) {
  console.error('\nESM checks failed — see above.\n');
  process.exit(1);
}
console.log('\n✅ All ESM export checks passed.');
