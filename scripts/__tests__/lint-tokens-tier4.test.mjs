import { describe, it, expect } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

// brik-bds#2651 / ADR-014. Rule 15: every Tier 4 hook is registered in
// manifest/tier4-hooks.json, has the --bds-{component}[-{part}]-{property}
// shape, is read by the component that sets it, and the committed registry
// matches source. Each case plants the defect and requires the rule to fire.

const REPO_ROOT = resolve(import.meta.dirname, '..', '..');
const LINTER = resolve(REPO_ROOT, 'scripts', 'lint-tokens.js');
const REGISTRY = resolve(REPO_ROOT, 'manifest', 'tier4-hooks.json');
const require = createRequire(import.meta.url);
const { scanTier4Hooks, buildTier4Registry, checkTier4Registry, tier4ShapeProblems } = require(LINTER);

function withFixture(files, fn) {
  const dir = mkdtempSync(join(tmpdir(), 'bds-tier4-'));
  try {
    for (const [name, text] of Object.entries(files)) writeFileSync(join(dir, name), text);
    return fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// A fixture's owner is its file name (Widget.css → `widget`), as for a blueprint.
const scan = (files) => withFixture(files, (dir) => scanTier4Hooks(new Set(), [dir]));
const ofHook = (violations, name) => violations.filter((v) => v.message.includes(`"${name}"`));

describe('tier4-shape', () => {
  it('passes --bds-{component}[-{part}]-{property}', () => {
    expect(tier4ShapeProblems('--bds-ambient-field-tint', ['ambient-field'])).toEqual([]);
    expect(tier4ShapeProblems('--bds-slider-thumb-size', ['slider'])).toEqual([]);
    expect(tier4ShapeProblems('--bds-sub-navigation-width', ['sub-navigation'])).toEqual([]);
  });

  it('flags a stem that does not name its component', () => {
    expect(tier4ShapeProblems('--bds-bg-field-tint', ['ambient-field']).join()).toMatch(/does not name its component/);
  });

  it('flags a role word in the property slot', () => {
    expect(tier4ShapeProblems('--bds-social-icon-brand', ['social-icon']).join()).toMatch(/role word "brand"/);
    expect(tier4ShapeProblems('--bds-board-card-accent', ['board']).join()).toMatch(/role word "accent"/);
  });

  it('flags a reserved stem and a missing property', () => {
    expect(tier4ShapeProblems('--bds-text-area-min-width', ['text-area']).join()).toMatch(/reserved word/);
    expect(tier4ShapeProblems('--bds-slider', ['slider']).join()).toMatch(/needs a component stem and a property/);
  });

  // brik-bds#3080: tokens/naming-grammar.json § segments bans abbreviated segments,
  // run-on component names and prop/position/state words in {part}.
  it('flags a banned segment and a prop word in {part}: --bds-table-sticky-end-bg', () => {
    const p = tier4ShapeProblems('--bds-table-sticky-end-bg', ['table']).join();
    expect(p).toMatch(/part "sticky"/);
    expect(p).toMatch(/"bg" is a banned abbreviation — write "background"/);
  });

  it('flags --bds-hero-bg and passes --bds-hero-background', () => {
    expect(tier4ShapeProblems('--bds-hero-bg', ['hero']).join()).toMatch(/"bg" is a banned abbreviation/);
    expect(tier4ShapeProblems('--bds-hero-background', ['hero'])).toEqual([]);
  });

  it('passes --bds-texture-spacing and --bds-cta-background (cta is a declared acronym)', () => {
    expect(tier4ShapeProblems('--bds-texture-spacing', ['texture'])).toEqual([]);
    expect(tier4ShapeProblems('--bds-cta-background', ['cta'])).toEqual([]);
  });

  it('flags a run-on component name: --bds-pageheader-gap', () => {
    expect(tier4ShapeProblems('--bds-pageheader-gap', ['page-header']).join()).toMatch(/write "page-header"/);
  });

  it('no longer accepts an abbreviated stem: --bds-bg-pattern-size', () => {
    expect(tier4ShapeProblems('--bds-bg-pattern-size', ['background-pattern']).join()).toMatch(/does not name its component/);
  });

  it('flags a T-shirt step as a {part}: --bds-chip-sm-icon-size', () => {
    expect(tier4ShapeProblems('--bds-chip-sm-icon-size', ['chip']).join()).toMatch(/T-shirt step/);
  });

  it('keeps every allowed abbreviation out of the banned list', () => {
    const { segments } = require(resolve(REPO_ROOT, 'tokens', 'naming-grammar.json'));
    for (const word of segments.allowedAbbreviations) expect(segments.bannedSegments).not.toContain(word);
  });

  it('exempts a baselined name, and fails a baseline entry that no longer violates', () => {
    const s = scan({ 'Hero.css': '.h {\n  color: var(--bds-hero-bg);\n}\n' });
    const hook = (v) => ofHook(v, '--bds-hero-bg').filter((x) => x.rule === 'tier4-shape');
    // --bds-hero-bg is baselined (TIER4_SHAPE_BASELINE), so the banned segment is waived here...
    expect(hook(checkTier4Registry(s, buildTier4Registry(s), { hooks: {}, aliases: {} }))).toEqual([]);
    // ...and a baselined name the scan no longer finds is reported stale.
    const stale = checkTier4Registry(s, buildTier4Registry(s), { hooks: {}, aliases: {} })
      .filter((x) => x.message.includes('TIER4_SHAPE_BASELINE lists "--bds-ambient-field-src"'));
    expect(stale).toHaveLength(1);
  });

  it('fires through checkTier4Registry, at the first read', () => {
    const s = scan({ 'Widget.css': '.w {\n  color: var(--bds-widget-brand);\n}\n' });
    const v = ofHook(checkTier4Registry(s, buildTier4Registry(s), { hooks: {}, aliases: {} }), '--bds-widget-brand');
    expect(v.find((x) => x.rule === 'tier4-shape')).toMatchObject({ severity: 'error', line: 2 });
  });
});

describe('tier4-unread', () => {
  it('flags a hook that is set and never read', () => {
    const s = scan({ 'Widget.css': '.w { --bds-widget-gap-size: 4px; }\n' });
    const v = ofHook(checkTier4Registry(s, buildTier4Registry(s), { hooks: {}, aliases: {} }), '--bds-widget-gap-size');
    expect(v.map((x) => x.rule)).toContain('tier4-unread');
  });

  it('does not flag a hook the component reads', () => {
    const s = scan({ 'Widget.css': '.w { --bds-widget-gap-size: 4px; gap: var(--bds-widget-gap-size); }\n' });
    const v = ofHook(checkTier4Registry(s, buildTier4Registry(s), { hooks: {}, aliases: {} }), '--bds-widget-gap-size');
    expect(v.map((x) => x.rule)).not.toContain('tier4-unread');
  });
});

describe('kind', () => {
  it('is runtime when the component JS sets the hook, knob otherwise', () => {
    const s = scan({
      'Widget.css': '.w { width: var(--bds-widget-fill-width); color: var(--bds-widget-icon-color); }\n',
      'Widget.tsx': "export const W = () => <div style={{ '--bds-widget-fill-width': '40%' }} />;\n",
    });
    const { hooks } = buildTier4Registry(s);
    expect(hooks['--bds-widget-fill-width'].kind).toBe('runtime');
    expect(hooks['--bds-widget-icon-color'].kind).toBe('knob');
  });
});

describe('tier4-registry-drift', () => {
  const s = () => scan({ 'Widget.css': '.w { color: var(--bds-widget-icon-color); }\n' });

  it('is clean when the committed registry matches source', () => {
    const generated = buildTier4Registry(s());
    expect(ofHook(checkTier4Registry(s(), generated, generated), '--bds-widget-icon-color')).toEqual([]);
  });

  it('flags a registered hook that source no longer reads or sets', () => {
    const generated = buildTier4Registry(s());
    const committed = { ...generated, hooks: { ...generated.hooks, '--bds-widget-gone-color': { kind: 'knob', readBy: ['widget'], readIn: [], setIn: [] } } };
    const v = ofHook(checkTier4Registry(s(), generated, committed), '--bds-widget-gone-color');
    expect(v[0]).toMatchObject({ rule: 'tier4-registry-drift', severity: 'error' });
    expect(v[0].message).toMatch(/no longer read or set/);
  });

  it('flags a changed row', () => {
    const generated = buildTier4Registry(s());
    const committed = { ...generated, hooks: { '--bds-widget-icon-color': { ...generated.hooks['--bds-widget-icon-color'], kind: 'runtime' } } };
    expect(ofHook(checkTier4Registry(s(), generated, committed), '--bds-widget-icon-color')[0].message).toMatch(/has changed/);
  });

  it('flags a missing registry file', () => {
    const v = checkTier4Registry(s(), buildTier4Registry(s()), null);
    expect(v.some((x) => x.rule === 'tier4-registry-drift' && /is missing/.test(x.message))).toBe(true);
  });
});

describe('tier4-unregistered (end to end)', () => {
  function lint(css) {
    return withFixture({ 'Sample.css': css }, (dir) => {
      const result = spawnSync('node', [LINTER, '--json', '--css-files', join(dir, 'Sample.css')], { cwd: REPO_ROOT, encoding: 'utf8' });
      return JSON.parse(result.stdout).violations.filter((v) => v.rule === 'tier4-unregistered');
    });
  }

  it('errors on a component read of a hook the registry does not list', () => {
    const v = lint('.x { color: var(--bds-sample-unlisted-color); }');
    expect(v).toHaveLength(1);
    expect(v[0].severity).toBe('error');
  });

  it('accepts a registered hook and a registered alias', () => {
    const { hooks, aliases } = JSON.parse(readFileSync(REGISTRY, 'utf8'));
    const hook = Object.keys(hooks)[0];
    const alias = Object.keys(aliases)[0];
    expect(lint(`.x { color: var(${hook}); background: var(${alias}, var(${hook})); }`)).toEqual([]);
  });
});

describe('the committed registry', () => {
  it('matches source — npm run tier4:registry leaves no diff', () => {
    const result = spawnSync('node', [LINTER, '--json'], { cwd: REPO_ROOT, encoding: 'utf8' });
    const rules = new Set(['tier4-registry-drift', 'tier4-shape', 'tier4-unread', 'tier4-unregistered']);
    expect(JSON.parse(result.stdout).violations.filter((v) => rules.has(v.rule) && v.severity === 'error')).toEqual([]);
  });
});
