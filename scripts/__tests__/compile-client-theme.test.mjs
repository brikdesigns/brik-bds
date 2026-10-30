import { describe, it, expect } from 'vitest';
import { readFileSync, mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

import { compileClientTheme } from '../compile-client-theme.mjs';
import { ANCHOR_STOPS, STOPS } from '../generate-color-ramps.mjs';

// compileClientTheme is the committed build run in memory (#2836). Since #2910
// that build is Foundations alone, so build/figma/css/variables.css is the
// oracle for an empty kit, byte for byte. The Brik kit's own compile is pinned
// by `npm run build:brand-brik:check`; the tests below compare against it.

const REPO_ROOT = resolve(import.meta.dirname, '..', '..');
const COMPILER = resolve(REPO_ROOT, 'scripts', 'compile-client-theme.mjs');
const REFERENCE_CSS = readFileSync(resolve(REPO_ROOT, 'build', 'figma', 'css', 'variables.css'), 'utf8');
const readBrikKit = () =>
  JSON.parse(readFileSync(resolve(REPO_ROOT, 'design-tokens', 'brand-kits', 'brik.json'), 'utf8'));
const compileBrik = () => compileClientTheme(readBrikKit());

/** `--bds-color-<family>-<stop>` → value, read off a compiled sheet. */
function rampValues(css, family) {
  const values = {};
  for (const [, stop, value] of css.matchAll(new RegExp(`--bds-color-${family}-(\\d+): ([^;]+);`, 'g'))) {
    values[stop] = value;
  }
  return values;
}

describe('compileClientTheme', () => {
  it('compiles an empty kit to the committed build/figma/css/variables.css, byte for byte', async () => {
    expect(await compileClientTheme({})).toBe(REFERENCE_CSS);
  });

  it('the Brik kit adds to Foundations (positive control for the byte comparison)', async () => {
    const css = await compileBrik();
    expect(css).not.toBe(REFERENCE_CSS);
    expect(rampValues(css, 'poppy')).not.toEqual({});
    expect(rampValues(REFERENCE_CSS, 'poppy')).toEqual({});
  });

  it('a changed kit value changes the output (positive control for the byte comparison)', async () => {
    // Move an anchor and drop the stops derived from it: buildRamp rightly
    // refuses a kit whose committed in-between stops disagree with its anchors.
    const kit = readBrikKit();
    const blue = kit['primitives/value'].color.blue;
    for (const stop of STOPS) if (!Object.values(ANCHOR_STOPS).includes(stop)) delete blue[stop];
    blue['500'].$value = '#123456';
    const css = await compileClientTheme(kit);
    const brik = await compileBrik();
    expect(css).not.toBe(brik);
    const ramp = rampValues(css, 'blue');
    expect(ramp['500']).toBe('#123456');
    expect(ramp['400']).not.toBe(rampValues(brik, 'blue')['400']);
  });

  it('never mutates the kit it is given', async () => {
    const kit = readBrikKit();
    const before = JSON.stringify(kit);
    await compileClientTheme(kit);
    expect(JSON.stringify(kit)).toBe(before);
  });

  it('generates a ramp for a kit that carries only the six named anchors', async () => {
    // Strip blue to its six named steps, as literals — the shape a client kit
    // arrives in. Its five in-between stops then exist only if the compiler ran
    // generate-color-ramps.mjs's applyRamp, and they must equal the stops that
    // generator committed for the same anchors.
    const kit = readBrikKit();
    const blue = kit['primitives/value'].color.blue;
    kit['primitives/value'].color.blue = Object.fromEntries(
      Object.entries(ANCHOR_STOPS).map(([name, stop]) => [name, { $type: 'color', $value: blue[stop].$value }]),
    );

    const generated = rampValues(await compileClientTheme(kit), 'blue');
    expect(Object.keys(generated).sort()).toEqual([...STOPS].sort());
    expect(generated).toEqual(rampValues(await compileBrik(), 'blue'));
  });

  it('compiles a client kit that carries no grayscale family', async () => {
    // A client kit names its own families only. Foundations keeps grayscale as
    // literal word steps, which bds/retire-word-steps refuses unless applyRamp
    // has aliased them, so the compiler ramps the Foundations grayscale.
    const blue = readBrikKit()['primitives/value'].color.blue;
    const kit = {
      'primitives/value': {
        color: {
          acme: Object.fromEntries(
            Object.entries(ANCHOR_STOPS).map(([name, stop]) => [name, { $type: 'color', $value: blue[stop].$value }]),
          ),
        },
      },
    };
    const css = await compileClientTheme(kit);
    expect(rampValues(css, 'acme')).toEqual(rampValues(await compileBrik(), 'blue'));
    expect(Object.keys(rampValues(css, 'grayscale')).sort()).toEqual([...STOPS].sort());
    expect(kit['primitives/value'].color).not.toHaveProperty('grayscale');
  });

  it('honours selector', async () => {
    const css = await compileClientTheme(readBrikKit(), { selector: '[data-client="acme"]' });
    expect(css).toContain('[data-client="acme"] {');
    expect(css).not.toContain(':root {');
  });

  // A consumer's server build bundles this subpath (the portal's Netlify
  // functions use esbuild), and inside a bundle import.meta.url is the bundle's
  // own path. Data the compiler read from disk relative to its source file
  // would then be looked up beside the bundle, and the import would throw
  // before compileClientTheme ever ran.
  it('compiles the same sheet when bundled and loaded from outside the package', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'compile-client-theme-bundle-'));
    try {
      const outfile = join(dir, 'bundle.mjs');
      await build({ entryPoints: [COMPILER], bundle: true, platform: 'node', format: 'esm', outfile, logLevel: 'silent' });
      const { compileClientTheme: bundled } = await import(pathToFileURL(outfile).href);
      expect(await bundled({})).toBe(REFERENCE_CSS);
      expect(await bundled(readBrikKit())).toBe(await compileBrik());
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  // The "writes no file" claim is checked in a child process that wraps every
  // write-shaped node:fs entry point before Style Dictionary loads (and syncs the
  // named ESM exports, so `import { writeFile }` is caught too). The control run
  // builds the same CSS platform to disk through the same wrapper and must record
  // writes — otherwise an empty list would only mean the wrapper saw nothing.
  describe('writes no file', () => {
    const CHILD = `
      import fs from 'node:fs';
      import { syncBuiltinESMExports } from 'node:module';
      const writes = [];
      for (const m of ['writeFileSync', 'writeFile', 'appendFileSync', 'appendFile', 'mkdirSync', 'mkdir',
        'copyFileSync', 'copyFile', 'renameSync', 'rename', 'createWriteStream']) {
        const orig = fs[m];
        fs[m] = function (p, ...rest) { writes.push(m + ' ' + p); return orig.call(this, p, ...rest); };
      }
      for (const m of ['writeFile', 'appendFile', 'mkdir', 'copyFile', 'rename']) {
        const orig = fs.promises[m];
        fs.promises[m] = function (p, ...rest) { writes.push('promises.' + m + ' ' + p); return orig.call(this, p, ...rest); };
      }
      syncBuiltinESMExports();

      const [, mode, compiler, outDir] = process.argv;
      const { pathToFileURL } = await import('node:url');
      await import(pathToFileURL(compiler).href);
      const kit = JSON.parse(fs.readFileSync('design-tokens/brand-kits/brik.json', 'utf8'));
      if (mode === 'compile') {
        const { compileClientTheme } = await import(pathToFileURL(compiler).href);
        await compileClientTheme(kit);
      } else {
        const { default: StyleDictionary } = await import('style-dictionary');
        const { cssPlatform } = await import(pathToFileURL('scripts/lib/sd-bds.mjs').href);
        const sd = new StyleDictionary({
          source: ['design-tokens/tokens-figma.json'],
          preprocessors: ['tokens-studio', 'bds/retire-word-steps'],
          log: { verbosity: 'silent', warnings: 'disabled' },
          platforms: { css: cssPlatform({ buildPath: outDir + '/', selector: ':root' }) },
        });
        await sd.buildPlatform('css');
      }
      process.stdout.write(JSON.stringify(writes));
    `;

    function run(mode, outDir) {
      const res = spawnSync(process.execPath, ['--input-type=module', '-e', CHILD, mode, COMPILER, outDir], {
        cwd: REPO_ROOT,
        encoding: 'utf8',
      });
      expect(res.status, res.stderr).toBe(0);
      return JSON.parse(res.stdout);
    }

    it('control: building the same platform to disk is recorded', () => {
      const outDir = mkdtempSync(join(tmpdir(), 'compile-client-theme-'));
      try {
        const writes = run('build', outDir);
        expect(writes.some((w) => w.includes(outDir))).toBe(true);
        expect(readdirSync(outDir)).toContain('variables.css');
      } finally {
        rmSync(outDir, { recursive: true, force: true });
      }
    });

    it('compileClientTheme records no write', () => {
      const outDir = mkdtempSync(join(tmpdir(), 'compile-client-theme-'));
      try {
        expect(run('compile', outDir)).toEqual([]);
        expect(readdirSync(outDir)).toEqual([]);
      } finally {
        rmSync(outDir, { recursive: true, force: true });
      }
    });
  });
});
