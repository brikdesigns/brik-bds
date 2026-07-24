import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCRIPT = join(__dirname, '..', 'lint-mdx-deprecations.mjs');

// Hermetic: build a tiny components/ + docs/ tree per test and point the linter
// at them with --components / --docs. Mirrors lint-mdx-tokens' --tokens pattern.
let root;
let componentsDir;
let docsDir;

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'mdx-deprecations-'));
  componentsDir = join(root, 'components');
  docsDir = join(root, 'docs');
  mkdirSync(componentsDir, { recursive: true });
  mkdirSync(docsDir, { recursive: true });
});

afterEach(() => rmSync(root, { recursive: true, force: true }));

function component(name, files) {
  const dir = join(componentsDir, name);
  mkdirSync(dir, { recursive: true });
  for (const [file, body] of Object.entries(files)) writeFileSync(join(dir, file), body);
}

function docPage(slug, body) {
  writeFileSync(join(docsDir, `${slug}.mdx`), body);
}

function run() {
  let code = 0;
  let stdout = '';
  try {
    stdout = execFileSync(
      'node',
      [SCRIPT, '--json', '--components', componentsDir, '--docs', docsDir],
      { encoding: 'utf8' },
    );
  } catch (err) {
    code = err.status ?? 1;
    stdout = err.stdout?.toString() ?? '';
  }
  return { code, json: JSON.parse(stdout) };
}

const deprecatedExport = (name) =>
  `/**\n * @deprecated Use \`<TagList />\` instead.\n */\nexport function ${name}() { return null; }\n`;
const currentExport = (name) => `export function ${name}() { return null; }\n`;
const callout = (name) =>
  `---\ntitle: ${name}\ndescription: x\n---\n\n<Callout type="warn">\n  **${name} is deprecated.** Migrate to TagList.\n</Callout>\n\nBody.\n`;

describe('lint-mdx-deprecations', () => {
  it('passes when a deprecated component page has a callout', () => {
    component('CardControl', { 'CardControl.tsx': deprecatedExport('CardControl') });
    docPage('card-control', callout('CardControl'));
    const { code, json } = run();
    expect(code).toBe(0);
    expect(json.violations).toHaveLength(0);
  });

  it('FAILS when a deprecated component page lacks a callout (the AC)', () => {
    component('CardControl', { 'CardControl.tsx': deprecatedExport('CardControl') });
    docPage('card-control', `---\ntitle: Card control\ndescription: A control card.\n---\n\nCurrent-looking body.\n`);
    const { code, json } = run();
    expect(code).toBe(1);
    expect(json.violations.map((v) => v.name)).toContain('CardControl');
  });

  it('accepts a frontmatter description beginning DEPRECATED', () => {
    component('CardControl', { 'CardControl.tsx': deprecatedExport('CardControl') });
    docPage('card-control', `---\ntitle: Card control\ndescription: DEPRECATED — use Card preset instead.\n---\n\nBody.\n`);
    expect(run().code).toBe(0);
  });

  it('accepts a type="error" deprecation callout', () => {
    component('Dialog', { 'Dialog.tsx': deprecatedExport('Dialog') });
    docPage('dialog', `---\ntitle: Dialog\ndescription: x\n---\n\n<Callout type="error">\n  **Dialog is deprecated.** Use Modal.\n</Callout>\n`);
    expect(run().code).toBe(0);
  });

  it('does NOT flag a member-level @deprecated (prop inside an interface)', () => {
    // @deprecated sits on a prop, not the component export — Tag stays current.
    component('Tag', {
      'Tag.tsx':
        `export interface TagProps {\n  /** @deprecated Use a Button. */\n  interactive?: boolean;\n}\n` +
        currentExport('Tag'),
    });
    docPage('tag', `---\ntitle: Tag\ndescription: An indicator.\n---\n\nBody.\n`);
    const { code, json } = run();
    expect(code).toBe(0);
    expect(json.deprecated).toHaveLength(0);
  });

  it('does NOT flag a current component', () => {
    component('Button', { 'Button.tsx': currentExport('Button') });
    docPage('button', `---\ntitle: Button\ndescription: The button.\n---\n\nBody.\n`);
    const { code, json } = run();
    expect(code).toBe(0);
    expect(json.deprecated).toHaveLength(0);
  });

  it('detects a deprecated secondary export in a shared dir, reports no-page', () => {
    // IconButton lives inside Button/ and has no icon-button.mdx page.
    component('Button', {
      'Button.tsx': currentExport('Button'),
      'IconButton.tsx': deprecatedExport('IconButton'),
    });
    docPage('button', `---\ntitle: Button\ndescription: x\n---\n\nBody.\n`);
    const { code, json } = run();
    expect(code).toBe(0);
    expect(json.deprecated.map((c) => c.name)).toContain('IconButton');
    expect(json.noPage).toContain('IconButton');
    expect(json.violations).toHaveLength(0);
  });

  it('detects deprecation via a Deprecated/ story title', () => {
    component('CardTestimonial', {
      'CardTestimonial.tsx': currentExport('CardTestimonial'),
      'CardTestimonial.stories.tsx': `const meta = { title: 'Deprecated/card-testimonial' };\nexport default meta;\n`,
    });
    docPage('card-testimonial', `---\ntitle: Card testimonial\ndescription: x\n---\n\nBody.\n`);
    const { code, json } = run();
    expect(code).toBe(1);
    expect(json.violations.map((v) => v.name)).toContain('CardTestimonial');
  });

  it('kebab-cases multi-word names to the page slug', () => {
    component('AddableComboList', { 'AddableComboList.tsx': deprecatedExport('AddableComboList') });
    docPage('addable-combo-list', callout('AddableComboList'));
    expect(run().code).toBe(0);
  });
});
