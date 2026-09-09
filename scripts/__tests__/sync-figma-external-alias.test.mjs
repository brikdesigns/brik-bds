import { describe, it, expect } from 'vitest';
import { mkdtempSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

// Regression tests for brik-bds#2342: a variable that aliases a SUBSCRIBED
// LIBRARY's variable carries an id of the form `VariableID:<key>/<node>`, which
// no local-variable listing returns. sync-figma-mcp.js resolves aliases by id,
// so before the fix the lookup missed, `resolveValue` returned null, and the
// token was SKIPPED — silently, keeping its previous value. `text/text-link`
// fossilized at `{color.poppy.light}` that way and only broke once the named
// ramp was pruned.
//
// The dump's `externalVariables` supplies the missing id→name pairs. The
// property that matters most is negative: an external entry must resolve
// aliases and NOTHING else — never patched into the file, never pruned from it.

const REPO_ROOT = resolve(import.meta.dirname, '..', '..');
const SYNC = resolve(REPO_ROOT, 'scripts', 'sync-figma-mcp.js');

const EXTERNAL_ID = 'VariableID:5f8745a1fdfa31605425def5cf44ed41c78062ae/28275:0';

// Flat pull shape (shape 1): top-level `variables[]` carrying their own
// `collection`, values keyed by mode NAME.
function dump({ external = [], extra = {} } = {}) {
  return {
    totalCollections: 1,
    totalVariables: 2,
    ...extra,
    externalVariables: external,
    collections: [{ name: 'color', modes: [{ modeId: 'm1', name: 'light' }] }],
    variables: [
      {
        id: 'VariableID:1',
        name: 'text/primary',
        resolvedType: 'COLOR',
        collection: 'color',
        description: '',
        scopes: [],
        valuesByMode: { light: '#111111' },
      },
      {
        id: 'VariableID:2',
        name: 'text/text-link',
        resolvedType: 'COLOR',
        collection: 'color',
        description: '',
        scopes: [],
        valuesByMode: { light: { type: 'VARIABLE_ALIAS', id: EXTERNAL_ID } },
      },
    ],
  };
}

function libraryFile() {
  return {
    $metadata: { tokenSetOrder: ['color/light'] },
    'color/light': {
      text: {
        primary: { $type: 'color', $value: '#000000' },
        // The fossil: a stale reference from a pull that predates the
        // re-pointing of this variable in Figma.
        'text-link': { $type: 'color', $value: '{color.poppy.light}' },
      },
    },
  };
}

function runSync({ external = [] } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'sync-ext-'));
  const dumpPath = join(dir, 'dump.json');
  const libPath = join(dir, 'library.json');
  writeFileSync(dumpPath, JSON.stringify(dump({ external })));
  writeFileSync(libPath, JSON.stringify(libraryFile()));
  const res = spawnSync(
    'node',
    [SYNC, dumpPath, `--target=${libPath}`, `--source-root=${dir}`],
    { encoding: 'utf8' },
  );
  return { res, lib: JSON.parse(readFileSync(libPath, 'utf8')) };
}

describe('sync-figma-mcp cross-library alias resolution (#2342)', () => {
  it('without the map, the alias is skipped and the stale value SURVIVES', () => {
    const { res, lib } = runSync({ external: [] });
    expect(res.status).toBe(0);
    // This is the pre-fix behaviour, pinned so the failure mode stays visible:
    // the token is not corrupted, it is silently left stale.
    expect(lib['color/light'].text['text-link'].$value).toBe('{color.poppy.light}');
  });

  it('without the map, the unresolvable alias is REPORTED as dangling', () => {
    // Before #2342 the dangling check tested only the legacy `{ alias }` shape,
    // so a current-plugin `{ type, id }` alias was skipped without any warning —
    // the silence that let the fossil persist across every pull.
    const { res } = runSync({ external: [] });
    expect(res.stdout + res.stderr).toMatch(/alias/i);
    expect(res.stdout + res.stderr).toContain(EXTERNAL_ID);
  });

  it('with the map, the alias resolves to the external NAME', () => {
    const { res, lib } = runSync({
      external: [{ id: EXTERNAL_ID, name: 'color/system/blue' }],
    });
    expect(res.status).toBe(0);
    expect(lib['color/light'].text['text-link'].$value).toBe('{color.system.blue}');
  });

  it('never writes the external token into the Library file', () => {
    // The whole safety property: externals feed the id→name map only. If one
    // leaked into the patch routine, `color/system/blue` would be authored into
    // a file that does not own it, and the next pull would prune it right back.
    const { lib } = runSync({
      external: [{ id: EXTERNAL_ID, name: 'color/system/blue' }],
    });
    expect(lib['color/light'].color).toBeUndefined();
    expect(JSON.stringify(lib)).not.toContain('"system"');
  });

  it('a local name wins a collision with an external one', () => {
    // Local variables are seeded last on purpose — the file being synced is
    // authoritative for its own ids.
    const { lib } = runSync({
      external: [{ id: 'VariableID:1', name: 'bogus/override' }],
    });
    expect(lib['color/light'].text.primary.$value).toBe('#111111');
    expect(JSON.stringify(lib)).not.toContain('bogus');
  });
});
