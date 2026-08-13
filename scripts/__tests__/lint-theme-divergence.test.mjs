import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCRIPT = join(__dirname, '..', 'lint-theme-divergence.mjs');

// Hermetic: --brand / --gen-light / --gen-dark point the gate at fixtures, the
// same injection pattern lint-mdx-headings.test.mjs uses for --files.
let dir;
beforeAll(() => {
  dir = mkdtempSync(join(tmpdir(), 'theme-divergence-'));
});
afterAll(() => rmSync(dir, { recursive: true, force: true }));

// A generated light file needs the --color-* primitives too: the gate resolves
// aliases through them so `white` and var(--color-grayscale-white) compare equal.
// `--color-grayscale-lightest` carries the #1739 shape on purpose: a 6-step
// name is an ALIAS onto a numeric stop, not a literal. The gate has to follow
// that hop, or a #1740 rename to the numeric stop reads as a divergence.
const PRIMS = `
  --color-grayscale-white: #ffffff;
  --color-grayscale-black: #000000;
  --color-grayscale-darkest: #1b1b1b;
  --color-grayscale-dark: #5a5a5a;
  --color-grayscale-light: #828282;
  --color-grayscale-100: #f2f2f2;
  --color-grayscale-lightest: var(--color-grayscale-100);
`;

function run({ light = '', dark = '', brandLight = '', brandDark = '' }) {
  const genLight = join(dir, 'gen-light.css');
  const genDark = join(dir, 'gen-dark.css');
  const brand = join(dir, 'brand.css');
  writeFileSync(genLight, `:root {\n${PRIMS}${light}\n}\n`);
  writeFileSync(genDark, `:root[data-theme="dark"] {\n${dark}\n}\n`);
  writeFileSync(
    brand,
    `.theme-brand-brik {\n${brandLight}\n}\n:root[data-theme="dark"] .theme-brand-brik {\n${brandDark}\n}\n`,
  );

  let code = 0;
  let stdout = '';
  try {
    stdout = execFileSync(
      'node',
      [SCRIPT, '--json', '--brand', brand, '--gen-light', genLight, '--gen-dark', genDark],
      { encoding: 'utf8' },
    );
  } catch (err) {
    code = err.status ?? 1;
    stdout = err.stdout?.toString() ?? '';
  }
  return { code, json: JSON.parse(stdout) };
}

const names = (json) => json.unexplained.map((u) => u.name);

describe('lint-theme-divergence', () => {
  it('passes when the brand value matches the generated value', () => {
    const { code, json } = run({
      light: '  --text-primary: var(--color-grayscale-darkest);',
      brandLight: '  --text-primary: var(--color-grayscale-darkest);',
    });
    expect(code).toBe(0);
    expect(json.total).toBe(0);
  });

  // The negative control. A gate that cannot fail is the failure mode this
  // whole area keeps producing (#1639's quota-exhausted Chromatic, #1687's
  // token-name-only contrast scoring). If this test ever passes with code 0,
  // the gate has stopped gating.
  it('FAILS on an uncommented divergence — the #1686 shape', () => {
    const { code, json } = run({
      dark: '  --background-inverse: var(--color-grayscale-light);',
      brandDark: '  --background-inverse: var(--color-grayscale-black);',
    });
    expect(code).toBe(1);
    expect(names(json)).toEqual(['--background-inverse']);
  });

  it('passes the same divergence once a comment sits directly above it', () => {
    const { code, json } = run({
      dark: '  --background-inverse: var(--color-grayscale-light);',
      brandDark:
        '  /* Deliberate: the dark page is true black, so inverse must be dark (#1689). */\n' +
        '  --background-inverse: var(--color-grayscale-black);',
    });
    expect(code).toBe(0);
    expect(json.rows[0].explained).toBe(true);
  });

  it('does not let a grouping label count as an explanation', () => {
    const { code, json } = run({
      dark: '  --surface-primary: var(--color-grayscale-darkest);',
      brandDark: '  /* Surface */\n  --surface-primary: var(--color-grayscale-black);',
    });
    expect(code).toBe(1);
    expect(names(json)).toEqual(['--surface-primary']);
  });

  // The bug found while building this: a comment used to carry to every
  // declaration beneath it, so one real explanation marked the whole block
  // explained — including --background-secondary, the value #1689 exists to
  // resolve.
  it('does not let a comment explain a LATER unrelated declaration', () => {
    const { code, json } = run({
      dark:
        '  --surface-primary: var(--color-grayscale-darkest);\n' +
        '  --background-secondary: var(--color-grayscale-black);',
      brandDark:
        '  /* A real explanation about surfaces and nothing else (#1689). */\n' +
        '  --surface-primary: var(--color-grayscale-black);\n' +
        '  --background-secondary: var(--color-grayscale-light);',
    });
    expect(code).toBe(1);
    expect(names(json)).toEqual(['--background-secondary']);
  });

  it('lets one comment cover a state family by naming its members', () => {
    const { code } = run({
      dark:
        '  --surface-brand-primary: var(--color-grayscale-darkest);\n' +
        '  --surface-brand-primary-hover: var(--color-grayscale-dark);',
      brandDark:
        '  /* Brand fills hold poppy and darken on interaction. Covers\n' +
        '     --surface-brand-primary and --surface-brand-primary-hover (#1055). */\n' +
        '  --surface-brand-primary: var(--color-grayscale-white);\n' +
        '  --surface-brand-primary-hover: var(--color-grayscale-black);',
    });
    expect(code).toBe(0);
  });

  it('treats an alias and its literal as the same value, not a divergence', () => {
    const { code, json } = run({
      light: '  --border-on-color-dark: var(--color-grayscale-white);',
      brandLight: '  --border-on-color-dark: white;',
    });
    expect(code).toBe(0);
    expect(json.total).toBe(0);
  });

  // #1740. Renaming a brand override from the deprecated 6-step name to the
  // numeric stop it already aliases changes no colour, so it must not surface as
  // a divergence needing a comment. Before the primitives() alias-hop fix this
  // reported all 25 renamed declarations in theme-brand-brik.css as unexplained.
  it('treats a 6-step name and the numeric stop it aliases as the same value', () => {
    const { code, json } = run({
      light: '  --page-secondary: var(--color-grayscale-lightest);',
      brandLight: '  --page-secondary: var(--color-grayscale-100);',
    });
    expect(code).toBe(0);
    expect(json.total).toBe(0);
  });

  // The paired negative control: the alias hop must not flatten genuinely
  // different stops into each other.
  it('still reports a divergence when the numeric stop is a different colour', () => {
    const { code, json } = run({
      light: '  --page-secondary: var(--color-grayscale-lightest);',
      brandLight: '  --page-secondary: var(--color-grayscale-dark);',
    });
    expect(code).toBe(1);
    expect(names(json)).toEqual(['--page-secondary']);
  });

  it('ignores a brand-only token with nothing generated to diverge from', () => {
    const { code, json } = run({
      brandLight: '  --brand-only-token: var(--color-grayscale-black);',
    });
    expect(code).toBe(0);
    expect(json.total).toBe(0);
  });
});
