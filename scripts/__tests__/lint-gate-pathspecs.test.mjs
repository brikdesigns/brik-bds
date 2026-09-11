import { describe, it, expect } from 'vitest';

import {
  pathspecsIn,
  quotedPathspecs,
  diffForwardersIn,
  deadPathspecs,
} from '../lint-gate-pathspecs.mjs';

/** A fixture tree, in the shape `deadPathspecs` expects. */
function treeOf(paths) {
  const tracked = new Set(paths);
  const trackedDirs = new Set();
  for (const f of paths) {
    const parts = f.split('/');
    for (let i = 1; i < parts.length; i += 1) {
      trackedDirs.add(parts.slice(0, i).join('/'));
    }
  }
  return { tracked, trackedDirs };
}

// ── quotedPathspecs — the noise filter both call shapes share ──

describe('quotedPathspecs', () => {
  it('keeps single-quoted paths and globs', () => {
    expect(quotedPathspecs("'tokens/**' 'package.json'")).toEqual([
      'tokens/**',
      'package.json',
    ]);
  });

  it('drops flags, unexpanded variables, and prose', () => {
    expect(quotedPathspecs("'--name-only' '\"$@\"' '$BASE_SHA' 'not a path'")).toEqual([]);
  });
});

// ── diffForwardersIn — which helpers forward to `git diff` ──

describe('diffForwardersIn', () => {
  it('names a function that pipes "$@" into git diff', () => {
    const body = `
          diff_matches() {
            local out
            if ! out="$(git diff --name-only "$BASE_SHA" "$HEAD_SHA" -- "$@")"; then
              return 2
            fi
            printf '%s' "$out"
          }
`;
    expect([...diffForwardersIn(body)]).toEqual(['diff_matches']);
  });

  it('ignores a helper that never reaches git diff', () => {
    const body = `
          emit() {
            echo "$1=$2" >> "$GITHUB_OUTPUT"
          }
`;
    expect(diffForwardersIn(body).size).toBe(0);
  });

  it('ignores a git-diff helper that does NOT forward its arguments', () => {
    // Its pathspecs are inline, so shape 1 already reads them; treating it as a
    // forwarder would collect every quoted token at its call sites instead.
    const body = `
          fixed_diff() {
            git diff --name-only "$BASE_SHA" "$HEAD_SHA" -- 'tokens/**'
          }
`;
    expect(diffForwardersIn(body).size).toBe(0);
  });
});

// ── pathspecsIn — shape 1 (inline) still works ──

describe('pathspecsIn — inline `git diff`', () => {
  it('collects pathspecs after the standalone `--`', () => {
    const body = `
          if ! CHANGED="$(git diff --name-only "$BASE_SHA" "$HEAD_SHA" -- \\
            'scripts/**' \\
            'package.json')"; then
            exit 1
          fi
`;
    expect(pathspecsIn(body).map((p) => p.spec)).toEqual([
      'scripts/**',
      'package.json',
    ]);
  });

  it('does not read a revision as a pathspec (update-visual-baselines.yml:249)', () => {
    const body = `          git diff --name-only 'HEAD^' HEAD -- 'tests/visual/**'\n`;
    expect(pathspecsIn(body).map((p) => p.spec)).toEqual(['tests/visual/**']);
  });

  it('does not read a grep pattern as a pathspec (sync-figma-variables.yml:39)', () => {
    const body = `          git diff --name-only HEAD | grep -q 'tokens-studio.json'\n`;
    expect(pathspecsIn(body)).toEqual([]);
  });
});

// ── pathspecsIn — shape 2 (via a helper), the #2450 gap ──

describe('pathspecsIn — helper call sites', () => {
  const body = `
          diff_matches() {
            local out
            if ! out="$(git diff --name-only "$BASE_SHA" "$HEAD_SHA" -- "$@")"; then
              return 2
            fi
            printf '%s' "$out"
          }

          LINTS="$(diff_matches \\
            'docs-site/content/docs/**' \\
            'components/ui/**' \\
            'package.json')"

          DOCSSITE="$(diff_matches \\
            'docs-site/**' \\
            '.github/workflows/docs-gate.yml')"
`;

  it('reads the pathspecs off every call, across multiple arms', () => {
    expect(pathspecsIn(body).map((p) => p.spec)).toEqual([
      'docs-site/content/docs/**',
      'components/ui/**',
      'package.json',
      'docs-site/**',
      '.github/workflows/docs-gate.yml',
    ]);
  });

  it('cites the line the pathspec is actually on', () => {
    const lines = body.split('\n');
    for (const { spec, line } of pathspecsIn(body)) {
      expect(lines[line - 1]).toContain(spec);
    }
  });

  it('does not double-count the helper definition itself', () => {
    // The definition's own `-- "$@"` carries no single-quoted token, so shape 1
    // yields nothing there — the count must be exactly the five call-site specs.
    expect(pathspecsIn(body)).toHaveLength(5);
  });

  // AC2: end to end — a dead pathspec behind a helper is REPORTED, not merely
  // extracted. Before #2450 this fixture produced zero findings because the
  // extractor never reached the call sites.
  it('reports a dead pathspec behind a helper', () => {
    const withDead = body.replace(
      "'components/ui/**'",
      "'docs-site/content/docs/primitives/**'",
    );
    const tree = treeOf([
      'docs-site/content/docs/foundation/color-pairings.mdx',
      'package.json',
      '.github/workflows/docs-gate.yml',
    ]);

    const findings = deadPathspecs(pathspecsIn(withDead), {
      ...tree,
      file: '.github/workflows/docs-gate.yml',
    });

    expect(findings.map((f) => f.spec)).toContain(
      'docs-site/content/docs/primitives/**',
    );
    expect(findings.find((f) => f.spec === 'docs-site/content/docs/primitives/**').why).toMatch(
      /contains no tracked file/,
    );
  });
});

// ── deadPathspecs — the rule itself, against a fixture tree ──

describe('deadPathspecs', () => {
  const tree = treeOf(['tokens/base.json', 'package.json']);
  const at = (spec) => deadPathspecs([{ spec, line: 1 }], { ...tree, file: 'wf.yml' });

  it('passes a live literal and a live glob prefix', () => {
    expect(at('package.json')).toEqual([]);
    expect(at('tokens/**')).toEqual([]);
  });

  it('flags a literal that is not tracked', () => {
    expect(at('scripts/gone.mjs')[0].why).toMatch(/not in `git ls-files`/);
  });

  it('flags a glob whose directory prefix is empty', () => {
    expect(at('docs-site/content/docs/primitives/**')[0].why).toMatch(
      /contains no tracked file/,
    );
  });

  it('permits a top-level glob, which has no prefix to verify', () => {
    expect(at('**/*.md')).toEqual([]);
  });
});
