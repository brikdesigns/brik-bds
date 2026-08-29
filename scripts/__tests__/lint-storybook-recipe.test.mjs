import { describe, it, expect } from 'vitest';

import {
  collectStoryExports,
  findStoryRefViolations,
} from '../lint-storybook-recipe.js';

describe('collectStoryExports', () => {
  it('collects capitalised named exports and skips the CSF meta', () => {
    const src = [
      'const meta = { title: "ui/Collapsible" };',
      'export default meta;',
      'export const Default = {};',
      'export const Controlled = {};',
      'const helper = 1;',
    ].join('\n');
    const names = collectStoryExports(src);
    expect(names.has('Default')).toBe(true);
    expect(names.has('Controlled')).toBe(true);
    // `export default meta` / a lowercase `meta` is not a story export.
    expect(names.has('meta')).toBe(false);
    expect(names.has('default')).toBe(false);
  });
});

// The #2118 → #2126 regression: PR #2118 removed the `Controlled` and
// `StatTiles` story exports; the sibling MDX kept `<Canvas of={Stories.…}>`
// refs to them, and the check went red on main. `exportsAfter` is the story
// surface as #2118 left it.
describe('findStoryRefViolations — the #2126 regression', () => {
  const exportsAfter = new Set(['Default']);

  it('flags a dangling <Canvas of={Stories.X}> after its export is removed', () => {
    const mdx = [
      '<Meta of={Stories} />',
      '# Collapsible',
      '<Canvas of={Stories.Default} />',
      '<Canvas of={Stories.Controlled} />',
    ].join('\n');
    const v = findStoryRefViolations(mdx, exportsAfter, 'Collapsible');
    expect(v).toHaveLength(1);
    expect(v[0].rule).toBe('story-ref-missing');
    expect(v[0].message).toMatch(/Controlled/);
    expect(v[0].line).toBe(4);
  });

  it('passes once the stale ref is dropped (the #2126 fix)', () => {
    const mdx = [
      '<Meta of={Stories} />',
      '# Collapsible',
      '<Canvas of={Stories.Default} />',
    ].join('\n');
    expect(findStoryRefViolations(mdx, exportsAfter, 'Collapsible')).toHaveLength(0);
  });

  it('covers non-Canvas reference forms the Canvas-only rule missed', () => {
    const mdx = [
      '<Story of={Stories.Controlled} />',
      'The args are {Stories.Controlled.args}.',
    ].join('\n');
    const v = findStoryRefViolations(mdx, exportsAfter, 'Collapsible');
    expect(v.length).toBeGreaterThanOrEqual(1);
    expect(v.every((x) => /Controlled/.test(x.message))).toBe(true);
  });

  it('never flags <Meta of={Stories} /> — the namespace, not a member', () => {
    expect(findStoryRefViolations('<Meta of={Stories} />\n', new Set(), 'Collapsible')).toHaveLength(0);
  });

  it('is silent when every reference resolves', () => {
    const mdx = '<Canvas of={Stories.Default} />\n<Story of={Stories.Controlled} />';
    expect(findStoryRefViolations(mdx, new Set(['Default', 'Controlled']), 'Collapsible')).toHaveLength(0);
  });
});
