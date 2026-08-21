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
export type WidgetSpan = 1 | 2 | 3 | 'auto-fit' | 'auto-fill';
export type WidgetLevel = 1 | 2 | 3;

export interface WidgetProps {
  /** style variant */
  variant?: 'a' | 'b';
  size?: WidgetSize;
  span?: WidgetSpan;
  level?: WidgetLevel;
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

const ALL_PROPS = ['variant', 'size', 'span', 'level', 'count', 'loading', 'label', 'onChange'];

// Every prop opted out of the coverage check. The tests below each document ONE
// row to isolate a single axis (type, default, note-stripping); without this
// they would all also trip `undocumented-prop` on the other seven props, which
// is a different axis with its own tests (§ Coverage).
const MARKER = `{/* props-check: WidgetProps @ components/ui/Widget/Widget.tsx omit=${ALL_PROPS.join(',')} */}`;

// Build a docs page whose single prop table has the given rows, run the linter,
// return { code, json }. `marker` overrides the default all-omitted marker.
function run(rows, marker = MARKER) {
  const mdx =
    `# Widget\n\n## API\n\n${marker}\n` +
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

  // ── Mixed literal-kind unions (#1917) ────────────────────────────────────
  // A union of numeric literals — or numeric mixed with string, the
  // `GridColumns` shape — is the same authoring style as an all-string union,
  // and a docs page spells it out for the same reason.

  it('accepts an expanded union mixing numeric and string literals', () => {
    const { code, json } = run(["| `span` | `1 \\| 2 \\| 3 \\| 'auto-fit' \\| 'auto-fill'` | — |"]);
    expect(json.violations).toEqual([]);
    expect(code).toBe(0);
  });

  it('accepts an all-numeric expanded union', () => {
    const { code } = run(['| `level` | `1 \\| 2 \\| 3` | — |']);
    expect(code).toBe(0);
  });

  it('accepts the alias name for a mixed-literal union too', () => {
    const { code } = run(['| `span` | `WidgetSpan` | — |']);
    expect(code).toBe(0);
  });

  it('FAILS on a wrong member in a numeric union — widening is not blanket acceptance', () => {
    const { code, json } = run(['| `level` | `1 \\| 2 \\| 3 \\| 4` | — |']);
    expect(code).toBe(1);
    expect(kinds(json)).toContain('level:type-mismatch');
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

  // ── Coverage: every own-declared prop is documented somewhere ─────────────
  // The reverse of the existence check. `getPropertiesOfType` resolves the full
  // structural type, so this axis can only work off the props DECLARED on the
  // type — inherited HTML attributes are not the component's own contract.

  const BARE = '{/* props-check: WidgetProps @ components/ui/Widget/Widget.tsx */}';

  it('FAILS on a prop declared in source but absent from the table', () => {
    const { code, json } = run(["| `variant` | `'a' \\| 'b'` | `'a'` |"], BARE);
    expect(code).toBe(1);
    expect(kinds(json)).toContain('size:undocumented-prop');
    expect(kinds(json)).toContain('onChange:undocumented-prop');
    expect(kinds(json)).not.toContain('variant:undocumented-prop');
  });

  it('passes when every declared prop has a row', () => {
    const { code, json } = run([
      "| `variant` | `'a' \\| 'b'` | `'a'` |",
      "| `size` | `WidgetSize` | `'md'` |",
      '| `span` | `WidgetSpan` | — |',
      '| `level` | `WidgetLevel` | — |',
      '| `count` | `number` | `3` |',
      '| `loading` | `boolean` | `false` |',
      '| `label` | `string` *(required)* | — |',
      '| `onChange` | `(value: string) => void` | — |',
    ], BARE);
    expect(json.violations).toEqual([]);
    expect(code).toBe(0);
  });

  it('counts a prop documented in a multi-name cell as covered', () => {
    const { code, json } = run([
      "| `variant` / `size` | `'a' \\| 'b'` | — |",
      '| `span` | `WidgetSpan` | — |',
      '| `level` | `WidgetLevel` | — |',
      '| `count` | `number` | `3` |',
      '| `loading` | `boolean` | `false` |',
      '| `label` | `string` *(required)* | — |',
      '| `onChange` | `(value: string) => void` | — |',
    ], BARE);
    expect(kinds(json)).not.toContain('size:undocumented-prop');
    expect(code).toBe(0);
  });

  it('honours omit= for a deliberately-uncurated prop', () => {
    const marker =
      '{/* props-check: WidgetProps @ components/ui/Widget/Widget.tsx omit=span,level,onChange */}';
    const { code, json } = run([
      "| `variant` | `'a' \\| 'b'` | `'a'` |",
      "| `size` | `WidgetSize` | `'md'` |",
      '| `count` | `number` | `3` |',
      '| `loading` | `boolean` | `false` |',
      '| `label` | `string` *(required)* | — |',
    ], marker);
    expect(json.violations).toEqual([]);
    expect(code).toBe(0);
  });

  it('does not require inherited HTML attributes', () => {
    // WidgetProps declares 8 props and inherits nothing; a type that spreads
    // HTMLAttributes must not have its hundreds of DOM props required.
    mkdirSync(join(root, 'components', 'ui', 'Spread'), { recursive: true });
    writeFileSync(
      join(root, 'components', 'ui', 'Spread', 'Spread.tsx'),
      `import type { HTMLAttributes } from 'react';
export interface SpreadProps extends HTMLAttributes<HTMLDivElement> {
  tone?: 'a' | 'b';
}
export function Spread(props: SpreadProps) { return null; }
`,
    );
    const mdx =
      '# Spread\n\n{/* props-check: SpreadProps @ components/ui/Spread/Spread.tsx */}\n' +
      "| Prop | Type | Default |\n|---|---|---|\n| `tone` | `'a' \\| 'b'` | — |\n";
    const file = join(root, 'docs', 'spread.mdx');
    writeFileSync(file, mdx);
    const stdout = execFileSync('node', [SCRIPT, '--json', '--root', root, '--files', file], { encoding: 'utf8' });
    expect(JSON.parse(stdout).violations).toEqual([]);
  });

  it('does not require className / style — the passthrough sentence covers them', () => {
    mkdirSync(join(root, 'components', 'ui', 'Passthru'), { recursive: true });
    writeFileSync(
      join(root, 'components', 'ui', 'Passthru', 'Passthru.tsx'),
      `export interface PassthruProps {
  tone?: 'a' | 'b';
  className?: string;
  style?: Record<string, string>;
}
export function Passthru(props: PassthruProps) { return null; }
`,
    );
    const mdx =
      '# Passthru\n\n{/* props-check: PassthruProps @ components/ui/Passthru/Passthru.tsx */}\n' +
      "| Prop | Type | Default |\n|---|---|---|\n| `tone` | `'a' \\| 'b'` | — |\n";
    const file = join(root, 'docs', 'passthru.mdx');
    writeFileSync(file, mdx);
    const stdout = execFileSync('node', [SCRIPT, '--json', '--root', root, '--files', file], { encoding: 'utf8' });
    expect(JSON.parse(stdout).violations).toEqual([]);
  });

  it('treats several tables for one type as one curation surface', () => {
    // Button / LinkButton / IconButton are three curated views of ButtonProps;
    // a prop documented in any of them is documented.
    const mdx =
      '# Widget\n\n## A\n\n' + BARE + '\n' +
      "| Prop | Type | Default |\n|---|---|---|\n| `variant` | `'a' \\| 'b'` | `'a'` |\n" +
      "| `size` | `WidgetSize` | `'md'` |\n| `span` | `WidgetSpan` | — |\n" +
      '| `level` | `WidgetLevel` | — |\n\n## B\n\n' + BARE + '\n' +
      '| Prop | Type | Default |\n|---|---|---|\n| `count` | `number` | `3` |\n' +
      '| `loading` | `boolean` | `false` |\n| `label` | `string` *(required)* | — |\n' +
      '| `onChange` | `(value: string) => void` | — |\n';
    const file = join(root, 'docs', 'split.mdx');
    writeFileSync(file, mdx);
    const stdout = execFileSync('node', [SCRIPT, '--json', '--root', root, '--files', file], { encoding: 'utf8' });
    expect(JSON.parse(stdout).violations).toEqual([]);
  });
});
