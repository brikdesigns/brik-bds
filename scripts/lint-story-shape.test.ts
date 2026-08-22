/**
 * Regression for `deprecated-manifest`'s type-alias false positive (#1957).
 *
 * The rule reads a `@deprecated` JSDoc immediately before an export in
 * `<Name>.tsx` as deprecating the component, and demands `!manifest` on its
 * story meta. ADR-033's renames ship the old union name as a deprecated *type*
 * alias, so five live components (Badge, Counter, Dot, Meter, Toast) were told
 * to hide from MCP discovery because a type was renamed.
 *
 * Asserted in both directions: a deprecated type export must not deprecate the
 * component, and a deprecated value export still must.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { componentIsDeprecated } = require('./lint-story-shape.js');

let dir: string;

/** Write `<Name>.tsx` and hand back the story path the predicate reads from. */
function fixture(name: string, source: string): string {
  const componentDir = path.join(dir, name);
  fs.mkdirSync(componentDir, { recursive: true });
  fs.writeFileSync(path.join(componentDir, `${name}.tsx`), source);
  return path.join(componentDir, `${name}.stories.tsx`);
}

beforeAll(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bds-story-shape-'));
});

afterAll(() => {
  fs.rmSync(dir, { recursive: true, force: true });
});

describe('componentIsDeprecated', () => {
  it('is false when only a type alias is @deprecated — the #1957 shape', () => {
    const story = fixture(
      'TypeAliasOnly',
      `export type TypeAliasOnlyTone = 'positive' | 'negative';\n\n` +
        `/** @deprecated Renamed \`TypeAliasOnlyTone\` (ADR-033 § 2). */\n` +
        `export type TypeAliasOnlyStatus = TypeAliasOnlyTone;\n\n` +
        `/** @summary A live component. */\n` +
        `export function TypeAliasOnly() {\n  return null;\n}\n`,
    );
    expect(componentIsDeprecated(story)).toBe(false);
  });

  it('is false when only a deprecated interface is exported', () => {
    const story = fixture(
      'InterfaceOnly',
      `/** @deprecated Use \`NextProps\`. */\n` +
        `export interface InterfaceOnlyProps {\n  a?: string;\n}\n\n` +
        `export function InterfaceOnly() {\n  return null;\n}\n`,
    );
    expect(componentIsDeprecated(story)).toBe(false);
  });

  it('is true when the component value export is @deprecated', () => {
    const story = fixture(
      'ValueExport',
      `/** @deprecated Use \`Successor\` instead. */\n` +
        `export function ValueExport() {\n  return null;\n}\n`,
    );
    expect(componentIsDeprecated(story)).toBe(true);
  });

  it('is true when a deprecated type sits above a deprecated component', () => {
    const story = fixture(
      'BothDeprecated',
      `/** @deprecated Renamed. */\n` +
        `export type BothDeprecatedStatus = string;\n\n` +
        `/** @deprecated Use \`Successor\` instead. */\n` +
        `export const BothDeprecated = () => null;\n`,
    );
    expect(componentIsDeprecated(story)).toBe(true);
  });

  it('is false when the component source does not exist', () => {
    expect(componentIsDeprecated(path.join(dir, 'Missing', 'Missing.stories.tsx'))).toBe(false);
  });
});
