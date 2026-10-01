/**
 * The "no token values change" gate (ADR-043, #2670). Unit tests prove the
 * comparator CATCHES a changed value, a dropped alias and a missing cascade
 * block; the integration test runs it against the real pre-migration commit.
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BRIDGE_BEGIN, BRIDGE_END } from '../lib/bds-prefix.mjs';
import { MIGRATION_BASE, baseAvailable, compareAgainstRef, compareDist } from '../verify-prefix-equivalence.mjs';

const REPO = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const legacy = { names: ['--text-primary', '--color-poppy-700', '--color-poppy-dark'], wordSteps: { '--color-poppy-dark': '--color-poppy-700' } };

const base = `
:root {
  --color-poppy-700: #b0351b;
  --color-poppy-dark: var(--color-poppy-700); /** DEPRECATED */
  --text-primary: var(--color-poppy-dark);
}
:root[data-theme="dark"] {
  --text-primary: #eee;
}
`;

const head = (canonical, bridge) => `${canonical}\n${BRIDGE_BEGIN}\n${bridge}${BRIDGE_END}\n`;

const goodCanonical = `
:root {
  --bds-color-poppy-700: #b0351b;
  --bds-text-primary: var(--bds-color-poppy-700);
}
:root[data-theme="dark"] {
  --bds-text-primary: #eee;
}
`;
const goodBridge = `
:root {
  --text-primary: var(--bds-text-primary);
  --color-poppy-700: var(--bds-color-poppy-700);
  --color-poppy-dark: var(--bds-color-poppy-700);
}
:root[data-theme="dark"] {
  --text-primary: var(--bds-text-primary);
}
`;

const run = (canonical, bridge) => compareDist({ baseCss: base, headDistCss: head(canonical, bridge), legacy });

describe('compareDist', () => {
  it('passes a faithful rename (word step re-pointed to its numeric step)', () => {
    expect(run(goodCanonical, goodBridge)).toEqual([]);
  });

  it('catches a changed value', () => {
    const failures = run(goodCanonical.replace('#b0351b', '#b0351c'), goodBridge);
    expect(failures.join('\n')).toMatch(/--color-poppy-700 value changed/);
  });

  it('catches a dropped declaration and an extra one', () => {
    expect(run(goodCanonical.replace('  --bds-text-primary: var(--bds-color-poppy-700);\n', ''), goodBridge).join('\n')).toMatch(/--text-primary not declared in head/);
    expect(run(goodCanonical.replace('}\n:root[data', '  --bds-extra: 1px;\n}\n:root[data'), goodBridge).join('\n')).toMatch(/--extra declared in head but not in base/);
  });

  it('catches an alias missing from a cascade block (the dark-mode read bug)', () => {
    const rootOnly = goodBridge.replace(/:root\[data-theme="dark"\] \{[\s\S]*?\}\n/, '');
    expect(run(goodCanonical, rootOnly).join('\n')).toMatch(/--text-primary has no alias in :root\[data-theme="dark"\]/);
  });

  it('catches an alias pointing at the wrong name', () => {
    expect(run(goodCanonical, goodBridge.replace('--color-poppy-dark: var(--bds-color-poppy-700)', '--color-poppy-dark: var(--bds-color-poppy-500)')).join('\n')).toMatch(
      /--color-poppy-dark in :root is var\(--bds-color-poppy-500\)/,
    );
  });

  it('catches a word step left in the canonical part', () => {
    const failures = run(goodCanonical.replace('}\n:root[data', '  --bds-color-poppy-dark: var(--bds-color-poppy-700);\n}\n:root[data'), goodBridge);
    expect(failures.join('\n')).toMatch(/retired word step still canonical/);
  });

  it('catches a missing selector block', () => {
    expect(run(goodCanonical.replace(/:root\[data-theme="dark"\] \{[\s\S]*?\}\n/, ''), goodBridge).join('\n')).toMatch(/selector block missing in head/);
  });
});

describe.skipIf(!baseAvailable(MIGRATION_BASE) || !fs.existsSync(path.join(REPO, 'dist', 'tokens.css')))('real build vs migration base', () => {
  it(`dist/tokens.css has identical values per block vs ${MIGRATION_BASE} and every old name bridged`, () => {
    expect(compareAgainstRef(MIGRATION_BASE)).toEqual([]);
  });
});
