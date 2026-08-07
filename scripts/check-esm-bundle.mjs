#!/usr/bin/env node
/**
 * check-esm-bundle.mjs — assert the published package is import-clean for
 * plain Node-ESM consumers (Netlify functions, Astro/Vite SSR, turbopack).
 *
 * Three failure classes this gate covers:
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
 * 3. A 'use client' banner on a module whose exports the server must READ.
 *    'use client' makes a module a client boundary, so a Next.js App Router
 *    server component receives opaque client references instead of values —
 *    `SOCIAL_ICON_PLATFORMS` arrived as `typeof 'function'` and `.includes()`
 *    threw (brik-bds#1721). Node-ESM and `tsc` both see a real array, so
 *    nothing else catches it. This gate pins the banner to exactly the modules
 *    outside `SERVER_SAFE_MODULES` — both directions, so neither a stray banner
 *    nor a silently-dropped one can ship. It is a static check: that a
 *    banner-free module still works under SSR is proven by `npm run test:rsc`.
 *
 * Run after `build:lib`, before publish (wired into `prepublishOnly`).
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname, extname, join, relative } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { SERVER_SAFE_MODULES } from './server-safe-modules.mjs';

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

/* ── require()-free scan on every emitted ESM module ──────────────────────
 * Catches CJS/UMD deps inlined into the output (the lottie-web class). The lib
 * build emits per-module output (#1060), so a CJS dep could be inlined into any
 * `.mjs`, not just the root entry — scan them all. */
const RE = /(?:^|[^A-Za-z0-9_$])(__require|require)\s*\(/;
const distDir = resolve(pkgRoot, 'dist');
const collectMjs = (dir) => {
  const out = [];
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, ent.name);
    if (ent.isDirectory()) out.push(...collectMjs(full));
    else if (ent.name.endsWith('.mjs')) out.push(full);
  }
  return out;
};
if (!existsSync(distDir)) {
  fail(`❌ ESM bundle check — ${distDir} not found. Run \`npm run build:lib\` first.`);
} else {
  const mjsFiles = collectMjs(distDir);
  const offenders = [];
  for (const file of mjsFiles) {
    readFileSync(file, 'utf8')
      .split('\n')
      .forEach((line, i) => {
        if (RE.test(line)) {
          offenders.push({ file: relative(pkgRoot, file), n: i + 1, text: line.trim().slice(0, 120) });
        }
      });
  }
  if (offenders.length > 0) {
    fail(`❌ ESM bundle check FAILED — ${offenders.length} require() call(s) in emitted .mjs:`);
    console.error('   ESM-prerender consumers (turbopack / Astro) reject dynamic require.');
    console.error('   A CJS/UMD dependency is being inlined into an ESM module.');
    console.error('   Fix: add the offending dependency to `external` in vite.config.lib.ts.');
    offenders.slice(0, 10).forEach((h) => console.error(`   ${h.file}:${h.n}: ${h.text}`));
    if (offenders.length > 10) console.error(`   …and ${offenders.length - 10} more.`);
  } else {
    console.log(`✅ ESM bundle check: all ${mjsFiles.length} emitted .mjs modules are require()-free.`);
  }

  /* ── 'use client' banner matches the server-safe allowlist ───────────────
   * brik-bds#1721. Checked in BOTH directions: a stray banner on an allowlisted
   * module silently re-breaks RSC data reads, and a dropped banner on a
   * component module breaks SSR with "createContext is not a function". Neither
   * shows up in Node-ESM or `tsc`.
   *
   * Scoped to the vite lib output. The two entries below are emitted by
   * `build:content-system` (esbuild, see package.json) which never applies the
   * banner, so the rule does not apply to them. */
  const NON_VITE_OUTPUTS = new Set([
    'content-system/index.mjs',
    'content-system/blueprints/astro/types.mjs',
  ]);
  const bannerRe = /^\s*(['"])use client\1\s*;?/;
  const missingBanner = [];
  const strayBanner = [];
  for (const file of mjsFiles) {
    const rel = relative(distDir, file);
    if (NON_VITE_OUTPUTS.has(rel)) continue;
    const moduleName = rel.replace(/\.mjs$/, '');
    const hasBanner = bannerRe.test(readFileSync(file, 'utf8').slice(0, 200));
    const shouldBeServerSafe = SERVER_SAFE_MODULES.includes(moduleName);
    if (shouldBeServerSafe && hasBanner) strayBanner.push(moduleName);
    if (!shouldBeServerSafe && !hasBanner) missingBanner.push(moduleName);
  }
  if (strayBanner.length > 0) {
    fail(
      `❌ 'use client' check FAILED — ${strayBanner.length} server-safe module(s) carry the banner:`,
    );
    console.error("   These are listed in SERVER_SAFE_MODULES, so a server component must be able");
    console.error('   to READ their exports. With the banner it receives opaque client references');
    console.error('   instead (brik-bds#1721). Fix: `bannerFor` in vite.config.lib.ts.');
    strayBanner.forEach((m) => console.error(`   ${m}`));
  }
  if (missingBanner.length > 0) {
    fail(`❌ 'use client' check FAILED — ${missingBanner.length} module(s) missing the banner:`);
    console.error('   Next.js App Router needs the directive on any module touching a client-only');
    console.error('   React API; without it SSR fails with "createContext is not a function".');
    console.error('   Fix: either restore the banner, or — if the module is genuinely pure data —');
    console.error('   add it to SERVER_SAFE_MODULES and prove it with `npm run test:rsc`.');
    missingBanner.forEach((m) => console.error(`   ${m}`));
  }
  if (strayBanner.length === 0 && missingBanner.length === 0) {
    console.log(
      `✅ 'use client' check: ${SERVER_SAFE_MODULES.length} server-safe module(s) banner-free, ` +
        `all others banner-stamped.`,
    );
  }
}

if (failed) {
  console.error('\nESM checks failed — see above.\n');
  process.exit(1);
}
console.log('\n✅ All ESM export checks passed.');
