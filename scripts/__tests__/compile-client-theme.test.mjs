import { describe, it, expect } from 'vitest';
import { readFileSync, mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

import { compileClientTheme } from '../compile-client-theme.mjs';
import { ANCHOR_STOPS, STOPS } from '../generate-color-ramps.mjs';

// compileClientTheme is the committed Brik build run in memory (#2836). The
// committed build/figma/css/variables.css is therefore its oracle: the Brik kit
// must compile to it byte for byte, and the tests below that change the kit
// prove that comparison can fail.

const REPO_ROOT = resolve(import.meta.dirname, '..', '..');
const COMPILER = resolve(REPO_ROOT, 'scripts', 'compile-client-theme.mjs');
const REFERENCE_CSS = readFileSync(resolve(REPO_ROOT, 'build', 'figma', 'css', 'variables.css'), 'utf8');
const readBrikKit = () =>
  JSON.parse(readFileSync(resolve(REPO_ROOT, 'design-tokens', 'brand-kits', 'brik.json'), 'utf8'));

/** `--bds-color-<family>-<stop>` → value, read off a compiled sheet. */
function rampValues(css, family) {
  const values = {};
  for (const [, stop, value] of css.matchAll(new RegExp(`--bds-color-${family}-(\\d+): ([^;]+);`, 'g'))) {
    values[stop] = value;
  }
  return values;
}

describe('compileClientTheme', () => {
  it('compiles the Brik kit to the committed build/figma/css/variables.css, byte for byte', async () => {
    expect(await compileClientTheme(readBrikKit())).toBe(REFERENCE_CSS);
  });

  it('a changed kit value changes the output (positive control for the byte comparison)', async () => {
    // Move an anchor and drop the stops derived from it: buildRamp rightly
    // refuses a kit whose committed in-between stops disagree with its anchors.
    const kit = readBrikKit();
    const blue = kit['primitives/value'].color.blue;
    for (const stop of STOPS) if (!Object.values(ANCHOR_STOPS).includes(stop)) delete blue[stop];
    blue['500'].$value = '#123456';
    const css = await compileClientTheme(kit);
    expect(css).not.toBe(REFERENCE_CSS);
    const ramp = rampValues(css, 'blue');
    expect(ramp['500']).toBe('#123456');
    expect(ramp['400']).not.toBe(rampValues(REFERENCE_CSS, 'blue')['400']);
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
    expect(generated).toEqual(rampValues(REFERENCE_CSS, 'blue'));
  });

  it('honours selector', async () => {
    const css = await compileClientTheme(readBrikKit(), { selector: '[data-client="acme"]' });
    expect(css).toContain('[data-client="acme"] {');
    expect(css).not.toContain(':root {');
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
