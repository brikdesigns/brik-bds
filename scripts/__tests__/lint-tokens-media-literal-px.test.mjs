import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

/**
 * Rule 14 `media-literal-px` (ADR-044, #2644; scope widened in #2731).
 *
 * A literal px in an @media condition is an error under components/,
 * content-system/blueprints/react/ and css/premium-effects.css. Fixtures mirror the
 * real directory shape in a tmp dir and go through --css-files, which routes
 * them down the same branch the full scan uses for those paths.
 */

const REPO_ROOT = resolve(import.meta.dirname, '..', '..');
const LINTER = resolve(REPO_ROOT, 'scripts', 'lint-tokens.js');

function runLinter(cssFiles) {
  const result = spawnSync('node', [LINTER, '--json', '--errors-only', '--css-files', ...cssFiles], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
  });
  const payload = JSON.parse(result.stdout);
  return payload.violations.filter((v) => v.rule === 'media-literal-px');
}

const LITERAL = `
  .a { display: block; }
  @media (min-width: 768px) {
    .a { display: grid; }
  }
`;
const NAMED = `
  .a { display: block; }
  @media (--bds-up-tablet) {
    .a { display: grid; }
  }
`;

describe('lint-tokens Rule 14 (media-literal-px) scope', () => {
  let tmpDir;
  const fixture = (rel, body) => {
    const file = join(tmpDir, rel);
    mkdirSync(join(file, '..'), { recursive: true });
    writeFileSync(file, body);
    return file;
  };

  beforeAll(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'bds-lint-media-literal-px-'));
  });
  afterAll(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it('fails a literal @media px in a content-system blueprint stylesheet', () => {
    const v = runLinter([fixture('content-system/blueprints/react/Lit.css', LITERAL)]);
    expect(v).toHaveLength(1);
  });

  it('fails a literal @media px in css/premium-effects.css', () => {
    const v = runLinter([fixture('css/premium-effects.css', LITERAL)]);
    expect(v).toHaveLength(1);
  });

  it('passes a custom-media name in a blueprint and in premium-effects', () => {
    expect(runLinter([fixture('content-system/blueprints/react/Named.css', NAMED)])).toEqual([]);
    expect(runLinter([fixture('css/premium-effects.css', NAMED)])).toEqual([]);
  });

  it('honours bds-lint-ignore on the line', () => {
    const body = LITERAL.replace('@media (min-width: 768px) {', '@media (min-width: 768px) { /* bds-lint-ignore */');
    expect(runLinter([fixture('content-system/blueprints/react/Ignored.css', body)])).toEqual([]);
  });

  it('does not scan the raw-shipping Astro blueprint CSS (cannot resolve custom media)', () => {
    expect(runLinter([fixture('content-system/blueprints/astro/__generated__/Lit.css', LITERAL)])).toEqual([]);
  });

  it('still fails under components/', () => {
    expect(runLinter([fixture('components/ui/X/X.css', LITERAL)])).toHaveLength(1);
  });
});
