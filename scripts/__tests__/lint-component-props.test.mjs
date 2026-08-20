import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCRIPT = join(__dirname, '..', 'lint-component-props.mjs');

// Hermetic fixture: its own root with a tsconfig + a component .tsx + a docs
// tree. `--root` points tsconfig + marker resolution at it; `--files` selects
// the MDX. The component uses no JSX/React imports so no extra deps are needed.
let root;

const COMPONENT = `
export type WidgetSize = 'sm' | 'md' | 'lg';

export interface WidgetProps {
  /** style variant */
  variant?: 'a' | 'b';
  size?: WidgetSize;
  count?: number;
  loading?: boolean;
  label: string;
  onChange?: (value: string) => void;
}

export function Widget(props: WidgetProps) {
  const { variant = 'a', size = 'md', count = 3, loading = false } = props;
  return null;
}
`;

beforeAll(() => {
  root = mkdtempSync(join(tmpdir(), 'proptable-'));
  writeFileSync(
    join(root, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: { strict: true, skipLibCheck: true, noEmit: true, moduleResolution: 'node', target: 'ES2020' },
    }),
  );
  mkdirSync(join(root, 'components', 'ui', 'Widget'), { recursive: true });
  writeFileSync(join(root, 'components', 'ui', 'Widget', 'Widget.tsx'), COMPONENT);
  mkdirSync(join(root, 'docs'), { recursive: true });
});

afterAll(() => rmSync(root, { recursive: true, force: true }));

const MARKER = '{/* props-check: WidgetProps @ components/ui/Widget/Widget.tsx */}';

// Build a docs page whose single prop table has the given rows, run the linter,
// return { code, json }.
function run(rows) {
  const mdx =
    `# Widget\n\n## API\n\n${MARKER}\n` +
    `| Prop | Type | Default |\n|---|---|---|\n${rows.join('\n')}\n`;
  const file = join(root, 'docs', 'widget.mdx');
  writeFileSync(file, mdx);
  let code = 0;
  let stdout = '';
  try {
    stdout = execFileSync('node', [SCRIPT, '--json', '--root', root, '--files', file], { encoding: 'utf8' });
  } catch (err) {
    code = err.status ?? 1;
    stdout = err.stdout?.toString() ?? '';
  }
  return { code, json: JSON.parse(stdout) };
}

const kinds = (json) => json.violations.map((v) => `${v.prop}:${v.kind}`);

describe('lint-component-props', () => {
  it('passes an accurate table (alias, expanded union, defaults, function, required)', () => {
    const { code, json } = run([
      "| `variant` | `'a' \\| 'b'` | `'a'` |",
      '| `size` | `WidgetSize` | `\'md\'` |',            // alias form
      '| `count` | `number` | `3` |',
      '| `loading` | `boolean` | `false` |',
      '| `label` | `string` *(required)* | — |',
      '| `onChange` | `(value: string) => void` | — |', // function: type-check skipped
    ]);
    expect(json.violations).toEqual([]);
    expect(code).toBe(0);
  });

  it('accepts the expanded literal union for an aliased source type', () => {
    const { code } = run(["| `size` | `'sm' \\| 'md' \\| 'lg'` | `'md'` |"]);
    expect(code).toBe(0);
  });

  it('accepts union members in any order', () => {
    const { code } = run(["| `size` | `'lg' \\| 'sm' \\| 'md'` | `'md'` |"]);
    expect(code).toBe(0);
  });

  it('FAILS on a phantom prop (renamed / removed)', () => {
    const { code, json } = run(['| `variantt` | `\'a\' \\| \'b\'` | `\'a\'` |']);
    expect(code).toBe(1);
    expect(kinds(json)).toContain('variantt:phantom-prop');
  });

  it('FAILS on a wrong type', () => {
    const { code, json } = run(['| `count` | `string` | `3` |']);
    expect(code).toBe(1);
    expect(kinds(json)).toContain('count:type-mismatch');
  });

  // ── Trailing type notes (#1916) ──────────────────────────────────────────
  // A note carries what the source type cannot — a unit, a slot's concrete
  // shape, an example. It is stripped only as a fallback, so it can add
  // information without ever masking drift.

  it('accepts a trailing type note when the remainder matches source', () => {
    const { code, json } = run([
      '| `count` | `number (ms)` | `3` |',
      "| `size` | `WidgetSize (t-shirt scale)` | `'md'` |",
      '| `label` | `string (e.g. \'Save\')` | — |',
    ]);
    expect(json.violations).toEqual([]);
    expect(code).toBe(0);
  });

  it('strips the note before the union sort, so a `|` inside it is inert', () => {
    const { code } = run(['| `count` | `number (ms \\| s)` | `3` |']);
    expect(code).toBe(0);
  });

  it('FAILS on a wrong type inside a note — the note must not mask drift', () => {
    const { code, json } = run(['| `count` | `string (ms)` | `3` |']);
    expect(code).toBe(1);
    expect(kinds(json)).toContain('count:type-mismatch');
  });

  it('reports the cell as written, never the stripped form', () => {
    const { json } = run(['| `count` | `string (ms)` | `3` |']);
    expect(json.violations[0].detail).toContain('"string (ms)"');
  });

  it('only strips a TRAILING note — a leading one still fails', () => {
    const { code, json } = run(['| `count` | `(ms) number` | `3` |']);
    expect(code).toBe(1);
    expect(kinds(json)).toContain('count:type-mismatch');
  });

  it('FAILS on a wrong default', () => {
    const { code, json } = run(["| `size` | `WidgetSize` | `'sm'` |"]);
    expect(code).toBe(1);
    expect(kinds(json)).toContain('size:default-mismatch');
  });

  it('does not default-check a prop with no source default (no false positive)', () => {
    // `label` has no destructured default; documenting one must not flag.
    const { code } = run(['| `label` | `string` | `\'hi\'` |']);
    expect(code).toBe(0);
  });

  it('existence-checks every name in a multi-prop cell', () => {
    const { code, json } = run(['| `variant` / `ghost` | `boolean` | — |']);
    expect(code).toBe(1);
    expect(kinds(json)).toContain('ghost:phantom-prop');
    expect(kinds(json)).not.toContain('variant:phantom-prop');
  });

  it('exits 2 when a marker points at a missing type', () => {
    const mdx = `# X\n\n{/* props-check: NopeProps @ components/ui/Widget/Widget.tsx */}\n| Prop | Type | Default |\n|---|---|---|\n| \`label\` | \`string\` | — |\n`;
    const file = join(root, 'docs', 'bad.mdx');
    writeFileSync(file, mdx);
    let code = 0;
    try {
      execFileSync('node', [SCRIPT, '--json', '--root', root, '--files', file], { encoding: 'utf8' });
    } catch (err) {
      code = err.status ?? 1;
    }
    expect(code).toBe(2);
  });

  it('is a no-op when no markers are present', () => {
    const mdx = '# X\n\n| Prop | Type | Default |\n|---|---|---|\n| `whatever` | `nope` | — |\n';
    const file = join(root, 'docs', 'unmarked.mdx');
    writeFileSync(file, mdx);
    const stdout = execFileSync('node', [SCRIPT, '--json', '--root', root, '--files', file], { encoding: 'utf8' });
    expect(JSON.parse(stdout).violations).toEqual([]);
  });
});
