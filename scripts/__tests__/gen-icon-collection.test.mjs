import { describe, it, expect, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  collectReferences,
  isWeighted,
  withBoldTwins,
  buildCollection,
  PH_WEIGHT_SUFFIXES,
} from '../gen-icon-collection.mjs';

// A miniature Phosphor set — just enough shape to exercise bold-twin
// expansion and alias resolution without depending on the real, much larger
// @iconify-json/ph (deterministic across Phosphor releases).
const PH_DATA_FIXTURE = {
  prefix: 'ph',
  width: 256,
  height: 256,
  icons: {
    house: { body: '<path d="house"/>' },
    'house-bold': { body: '<path d="house-bold"/>' },
    gear: { body: '<path d="gear"/>' },
    // No `gear-bold` — exercises the "twin not shipped by Phosphor" branch.
    'arrow-right-fill': { body: '<path d="arrow-right-fill"/>' },
  },
  aliases: {
    cog: { parent: 'gear' },
  },
};

const tmpDirs = [];
function makeTmpSrcTree(files) {
  const root = mkdtempSync(join(tmpdir(), 'gen-icon-collection-test-'));
  tmpDirs.push(root);
  for (const [rel, content] of Object.entries(files)) {
    const full = join(root, rel);
    mkdirSync(join(full, '..'), { recursive: true });
    writeFileSync(full, content, 'utf8');
  }
  return root;
}

afterEach(() => {
  while (tmpDirs.length) rmSync(tmpDirs.pop(), { recursive: true, force: true });
});

describe('collectReferences', () => {
  it('finds distinct bare ph:* references under the given source roots', () => {
    const cwd = makeTmpSrcTree({
      'components/Foo.tsx': `icon="ph:house" other="ph:gear"`,
      'components/Bar.tsx': `icon="ph:house"`, // duplicate, collapses to one
    });
    expect(collectReferences({ srcDirs: ['components'], cwd })).toEqual(['gear', 'house']);
  });

  it('excludes stories/test/spec files', () => {
    const cwd = makeTmpSrcTree({
      'components/Foo.tsx': `icon="ph:house"`,
      'components/Foo.stories.tsx': `icon="ph:cog"`,
      'components/Foo.test.tsx': `icon="ph:gear"`,
    });
    expect(collectReferences({ srcDirs: ['components'], cwd })).toEqual(['house']);
  });

  it('only scans the listed source roots', () => {
    const cwd = makeTmpSrcTree({
      'components/Foo.tsx': `icon="ph:house"`,
      'other/Bar.tsx': `icon="ph:gear"`,
    });
    expect(collectReferences({ srcDirs: ['components'], cwd })).toEqual(['house']);
  });
});

describe('isWeighted', () => {
  it.each(PH_WEIGHT_SUFFIXES)('treats a trailing -%s as already weighted', (suffix) => {
    expect(isWeighted(`house-${suffix}`)).toBe(true);
  });

  it('treats a bare name as not weighted', () => {
    expect(isWeighted('house')).toBe(false);
  });
});

describe('withBoldTwins', () => {
  it('adds the -bold twin when Phosphor ships one', () => {
    expect(withBoldTwins(['house'], PH_DATA_FIXTURE)).toEqual(['house', 'house-bold']);
  });

  it('leaves a name with no bold twin unexpanded', () => {
    expect(withBoldTwins(['gear'], PH_DATA_FIXTURE)).toEqual(['gear']);
  });

  it('does not re-expand a name that already carries a weight suffix', () => {
    expect(withBoldTwins(['arrow-right-fill'], PH_DATA_FIXTURE)).toEqual(['arrow-right-fill']);
  });

  it('finds a bold twin reachable only through an alias', () => {
    // `cog` aliases `gear`, which has no `gear-bold` — so `cog-bold` must not
    // be synthesized from nothing; only a real icons/aliases entry counts.
    expect(withBoldTwins(['cog'], PH_DATA_FIXTURE)).toEqual(['cog']);
  });
});

describe('buildCollection', () => {
  it('copies icon data verbatim for a direct name', () => {
    const { collection, missing } = buildCollection(['house'], PH_DATA_FIXTURE);
    expect(missing).toEqual([]);
    expect(collection.icons.house).toEqual(PH_DATA_FIXTURE.icons.house);
  });

  it('pulls an alias and its parent into a closed collection', () => {
    const { collection, missing } = buildCollection(['cog'], PH_DATA_FIXTURE);
    expect(missing).toEqual([]);
    expect(collection.aliases.cog).toEqual({ parent: 'gear' });
    expect(collection.icons.gear).toEqual(PH_DATA_FIXTURE.icons.gear);
  });

  it('reports a name with no match in icons or aliases as missing', () => {
    const { collection, missing } = buildCollection(['does-not-exist'], PH_DATA_FIXTURE);
    expect(missing).toEqual(['does-not-exist']);
    expect(collection.icons).toEqual({});
  });
});
