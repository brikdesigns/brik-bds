/**
 * Tests for scripts/lint-consumer-shadows.mjs (#2702).
 *
 * Each case plants a throwaway consumer `src/` and a tiny manifest, then runs the CLI against
 * them — the same seam as scripts/lint-hand-rolled-sections.test.mjs.
 */
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { afterEach, describe, expect, it } from 'vitest';

const GATE = join(dirname(fileURLToPath(import.meta.url)), 'lint-consumer-shadows.mjs');

const MANIFEST = {
  components: {
    Button: { name: 'Button', class_prefix: 'bds-button' },
    Field: { name: 'Field', class_prefix: 'bds-field' },
    Divider: { name: 'Divider', class_prefix: 'bds-divider' },
  },
};

/** @type {string[]} */
const dirs = [];
afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

/** Plant a consumer repo: `files` maps a path under the repo to its body. Returns the repo root. */
function plant(files) {
  const root = mkdtempSync(join(tmpdir(), 'lint-consumer-shadows-'));
  dirs.push(root);
  writeFileSync(join(root, 'manifest.json'), JSON.stringify(MANIFEST));
  for (const [rel, body] of Object.entries(files)) {
    const abs = join(root, rel);
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, body, 'utf8');
  }
  return root;
}

/** Run the CLI from the planted repo. Returns `{ status, output }` without throwing on a non-zero exit. */
function run(root, ...args) {
  try {
    const output = execFileSync('node', [GATE, 'src', '--manifest', join(root, 'manifest.json'), ...args], {
      cwd: root,
      encoding: 'utf8',
    });
    return { status: 0, output };
  } catch (err) {
    return { status: err.status, output: `${err.stdout ?? ''}${err.stderr ?? ''}` };
  }
}

describe('shadow-component', () => {
  it('fails a local component named like a BDS export', () => {
    const root = plant({ 'src/a.tsx': 'function Field({ children }) {\n  return <div>{children}</div>;\n}\n' });
    const { status, output } = run(root);
    expect(status).toBe(1);
    expect(output).toContain('src/a.tsx:1');
    expect(output).toContain('shadow-component');
  });

  it('catches exported consts and classes too', () => {
    const root = plant({
      'src/a.tsx': 'export const Divider = () => <hr />;\n',
      'src/b.tsx': 'export class Button extends Component {}\n',
    });
    expect(run(root).output).toMatch(/src\/a\.tsx:1[\s\S]*src\/b\.tsx:1/);
  });

  it('passes a thin wrapper that imports the same name from @brikdesigns/bds', () => {
    const root = plant({
      'src/a.tsx':
        "import { Field as BdsField } from '@brikdesigns/bds';\nexport function Field(props) {\n  return <BdsField {...props} />;\n}\n",
    });
    expect(run(root).status).toBe(0);
  });

  it('passes a name BDS does not export', () => {
    const root = plant({ 'src/a.tsx': 'function FormField() { return null; }\n' });
    expect(run(root).status).toBe(0);
  });

  it('does not flag a lazy import of a component, or a Next metadata default export', () => {
    const root = plant({
      'src/a.tsx': "const Field = dynamic(() => import('./Field'), { ssr: false });\n",
      'src/opengraph-image.tsx': 'export default async function Button() {}\n',
    });
    expect(run(root).status).toBe(0);
  });

  it('skips tests, stories and node_modules', () => {
    const root = plant({
      'src/a.test.tsx': 'function Field() {}\n',
      'src/a.stories.tsx': 'function Field() {}\n',
      'src/node_modules/x/a.tsx': 'function Field() {}\n',
    });
    expect(run(root).status).toBe(0);
  });
});

describe('hand-applied-class', () => {
  it('fails a BDS root class written in a class string', () => {
    const root = plant({ 'src/a.tsx': '<a className="bds-button bds-button--md" href="/x" />\n' });
    const { status, output } = run(root);
    expect(status).toBe(1);
    expect(output).toContain('hand-applied-class');
  });

  it('does not flag modifiers, elements, CSS selectors or comments', () => {
    const root = plant({
      'src/a.tsx':
        "const a = 'bds-button--md';\nconst b = 'bds-button__content';\nconst css = `.bds-button:disabled { color: red }`;\n// className=\"bds-button\" is hand-applied elsewhere\n",
    });
    expect(run(root).status).toBe(0);
  });
});

describe('bds-lint-ignore', () => {
  it('honours a reasoned marker on the line above', () => {
    const root = plant({
      'src/a.tsx': '// bds-lint-ignore shadow-component — wraps the legacy form shell\nfunction Field() {}\n',
    });
    expect(run(root).status).toBe(0);
  });

  it('rejects a bare marker', () => {
    const root = plant({ 'src/a.tsx': 'function Field() {} // bds-lint-ignore shadow-component\n' });
    const { status, output } = run(root);
    expect(status).toBe(1);
    expect(output).toContain('needs a reason');
  });
});

describe('baseline that can only shrink', () => {
  const baselineArgs = (root) => ['--baseline', join(root, 'baseline.json')];

  it('accepts baselined violations, fails a new one, fails a stale entry', () => {
    const root = plant({ 'src/a.tsx': 'function Field() {}\n' });
    expect(run(root, ...baselineArgs(root), '--write-baseline').status).toBe(0);
    expect(run(root, ...baselineArgs(root)).status).toBe(0);

    writeFileSync(join(root, 'src/b.tsx'), 'function Divider() {}\n');
    const added = run(root, ...baselineArgs(root));
    expect(added.status).toBe(1);
    expect(added.output).toContain('src/b.tsx:1');

    rmSync(join(root, 'src/b.tsx'));
    writeFileSync(join(root, 'src/a.tsx'), 'export {};\n');
    const stale = run(root, ...baselineArgs(root));
    expect(stale.status).toBe(1);
    expect(stale.output).toContain('stale baseline');
  });

  it('refuses to grow an existing baseline, and shrinks it when a violation is fixed', () => {
    const root = plant({
      'src/a.tsx': 'function Field() {}\n',
      'src/b.tsx': 'function Divider() {}\n',
    });
    run(root, ...baselineArgs(root), '--write-baseline');

    writeFileSync(join(root, 'src/c.tsx'), 'function Button() {}\n');
    expect(run(root, ...baselineArgs(root), '--write-baseline').status).toBe(2);

    rmSync(join(root, 'src/c.tsx'));
    rmSync(join(root, 'src/b.tsx'));
    expect(run(root, ...baselineArgs(root), '--write-baseline').status).toBe(0);
    const { entries } = JSON.parse(readFileSync(join(root, 'baseline.json'), 'utf8'));
    expect(Object.keys(entries)).toEqual(['src/a.tsx|shadow-component|Field']);
  });
});

describe('invocation', () => {
  it('exits 2 when the manifest is missing', () => {
    const root = plant({});
    rmSync(join(root, 'manifest.json'));
    expect(run(root).status).toBe(2);
  });
});
