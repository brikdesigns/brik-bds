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
 * 4. A `require` condition target that does not load at all.
 *    Mirror of class 1 on the other side of `exports`. v0.177.0–0.186.0 shipped
 *    a CJS entry that threw `SyntaxError` on the first `require()`: vite's
 *    pure-CSS-chunk replacer destroyed an unrelated specifier whose basename
 *    happened to end in a component name (brik-bds#2255, fixed by
 *    `entryFileNamesFor` in vite.config.lib.ts). Every gate here was ESM-only,
 *    so six releases published a package no CJS consumer could load — and the
 *    error pointed at `AmbientField` rather than at the build. Loading the
 *    `require` targets is the check that would have caught it.
 *
 * Run after `build:lib`, before publish (wired into `prepublishOnly`).
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname, extname, join, relative } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
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

/* ── The same walk on the `require` side (brik-bds#2255) ───────────────────
 * Only conditions that name `require` explicitly, plus the `main` field. A
 * bare-string export is reachable under both conditions and is already
 * smoke-loaded above, so it is not re-collected here. */
const requireTargets = new Map(); // subpath label -> relative file path
for (const [subpath, val] of Object.entries(pkg.exports ?? {})) {
  if (subpath.includes('*')) continue; // wildcard subpaths can't be smoke-loaded
  if (val && typeof val === 'object' && typeof val.require === 'string') {
    requireTargets.set(subpath, val.require);
  }
}
if (pkg.main) requireTargets.set('(main field)', pkg.main);

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

/* ── Runtime smoke: actually require() each CJS target ────────────────────
 * brik-bds#2255. `require` resolves a different file than `import` for every
 * dual-condition subpath, so an ESM-only smoke pass proves nothing about it.
 * A broken emit anywhere in the CJS graph throws here, because CJS resolution
 * is eager and the entry re-exports the whole barrel. */
const requireFromPkg = createRequire(pathToFileURL(join(pkgRoot, 'package.json')).href);
for (const [label, rel] of requireTargets) {
  if (!isJs(rel)) continue;
  const abs = resolve(pkgRoot, rel);
  if (!existsSync(abs)) {
    fail(`❌ CJS export check — \`${label}\` target \`${rel}\` does not exist (run \`npm run build:lib\`).`);
    continue;
  }
  try {
    requireFromPkg(abs);
    console.log(`✅ CJS require OK — ${label} (${rel})`);
  } catch (err) {
    fail(
      `❌ CJS require FAILED — \`${label}\` (${rel}): ${err.message.split('\n')[0]}\n` +
        `   Every CJS consumer (node scripts, jest configs, codemods) is hard-broken at import time.\n` +
        `   If the message points at a component file, suspect the build, not the component — see brik-bds#2255.`,
    );
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

/* ── `@brikdesigns/bds/tokens` — the server-safe preset entry ─────────────
 * brik-client-portal#7430 / brik-bds#3396. A Next.js Server Component must be
 * able to READ `text` / `heading` / `label`. That needs three things at once,
 * and each fails silently somewhere else: the subpath exists in `exports`, the
 * emitted module carries no 'use client' banner (it would be a client
 * reference), and it pulls no React in (the module would not be server-safe
 * even banner-free). The values must also be the SAME ones the package root
 * exports — a copy that drifted would defeat the point. */
{
  const TOKENS_SUBPATH = './tokens';
  const entry = pkg.exports?.[TOKENS_SUBPATH];
  if (!entry || typeof entry !== 'object' || !entry.import || !entry.require || !entry.types) {
    fail(
      `❌ tokens entry check FAILED — package.json "exports" has no complete \`${TOKENS_SUBPATH}\` ` +
        `(types + import + require). Server components have no banner-free path to the presets.`,
    );
  } else {
    const bannerRe = /^\s*(['"])use client\1\s*;?/;
    const reactRe = /(?:from\s*|import\s*\(?\s*|require\(\s*)['"]react(?:\/[^'"]*)?['"]/;
    let entryOk = true;
    for (const cond of ['import', 'require']) {
      const rel = entry[cond];
      const abs = resolve(pkgRoot, rel);
      if (!existsSync(abs)) {
        fail(`❌ tokens entry check FAILED — \`${TOKENS_SUBPATH}\` ${cond} target \`${rel}\` does not exist.`);
        entryOk = false;
        continue;
      }
      // The entry plus every module it pulls in by relative import: a banner or
      // a React import one hop in still makes the subpath unsafe.
      const src = readFileSync(abs, 'utf8');
      const hops = [...src.matchAll(/(?:from\s*|require\()\s*["'](\.[^"']+)["']/g)].map((m) =>
        join(dirname(abs), m[1]),
      );
      for (const file of [abs, ...hops]) {
        if (!existsSync(file)) continue;
        const text = readFileSync(file, 'utf8');
        const where = relative(pkgRoot, file);
        if (bannerRe.test(text)) {
          fail(
            `❌ tokens entry check FAILED — \`${where}\` carries 'use client'. A server component would ` +
              `receive client references for text/heading/label. Keep it in SERVER_SAFE_MODULES.`,
          );
          entryOk = false;
        }
        if (reactRe.test(text)) {
          fail(`❌ tokens entry check FAILED — \`${where}\` imports React; the entry must stay pure data.`);
          entryOk = false;
        }
      }
    }
    // `types` is asserted present above; this job runs `vite build` only, so the
    // .d.ts emit (build:types) is not on disk here.
    if (entryOk) {
      const sub = await import(pathToFileURL(resolve(pkgRoot, entry.import)).href);
      const root = await import(pathToFileURL(resolve(pkgRoot, pkg.module)).href);
      const missing = ['text', 'heading', 'label'].filter(
        (k) => !sub[k] || JSON.stringify(sub[k]) !== JSON.stringify(root[k]),
      );
      if (missing.length) {
        fail(
          `❌ tokens entry check FAILED — ${missing.join(', ')} missing from \`${TOKENS_SUBPATH}\` ` +
            `or different from the package root's value.`,
        );
      } else {
        console.log(`✅ tokens entry: \`${TOKENS_SUBPATH}\` banner-free, React-free, text/heading/label match the root.`);
      }
    }
  }
}

if (failed) {
  console.error('\nESM checks failed — see above.\n');
  process.exit(1);
}
console.log('\n✅ All ESM export checks passed.');
