import { describe, it, expect } from 'vitest';

import {
  extractOnTriggers,
  extractContexts,
  auditReadiness,
} from '../lint-merge-queue-readiness.mjs';

// ── extractOnTriggers — the three YAML shapes GitHub accepts ──

describe('extractOnTriggers', () => {
  it('reads block form and finds merge_group alongside pull_request', () => {
    const wf = `name: Example
on:
  pull_request:
    branches: [main]
  merge_group:
jobs:
  build:
    runs-on: ubuntu-latest
`;
    const t = extractOnTriggers(wf);
    expect(t.has('pull_request')).toBe(true);
    expect(t.has('merge_group')).toBe(true);
  });

  it('reads a flow list', () => {
    const t = extractOnTriggers(`on: [pull_request, merge_group]\njobs:\n`);
    expect([...t].sort()).toEqual(['merge_group', 'pull_request']);
  });

  it('reads an inline scalar', () => {
    const t = extractOnTriggers(`on: push\njobs:\n`);
    expect(t.has('push')).toBe(true);
    expect(t.has('merge_group')).toBe(false);
  });

  it('reports the absence of merge_group on a pull_request-only workflow', () => {
    const wf = `on:
  pull_request:
    types: [opened, synchronize, reopened]
jobs:
  gate:
    runs-on: ubuntu-latest
`;
    expect(extractOnTriggers(wf).has('merge_group')).toBe(false);
  });

  it('ignores a comment mentioning merge_group and a nested `on` key', () => {
    const wf = `# on: merge_group would go here one day
on:
  pull_request_target:
    types: [labeled]
concurrency:
  group: x
jobs:
  gate:
    runs-on: ubuntu-latest
`;
    const t = extractOnTriggers(wf);
    expect(t.has('pull_request_target')).toBe(true);
    expect(t.has('merge_group')).toBe(false);
  });

  it('stops the block at the first column-0 key', () => {
    const wf = `on:
  pull_request:
permissions:
  contents: read
  merge_group: write
jobs:
  gate:
`;
    // The `merge_group:` under permissions must NOT be read as a trigger.
    expect(extractOnTriggers(wf).has('merge_group')).toBe(false);
  });
});

// ── extractContexts — job id, or job-level name override ──

describe('extractContexts', () => {
  it('uses the job id when no name is set', () => {
    const wf = `jobs:
  canonical-check:
    runs-on: ubuntu-latest
    steps:
      - run: echo hi
`;
    expect(extractContexts(wf)).toEqual(['canonical-check']);
  });

  it('uses a job-level name over the id (the name != file case)', () => {
    const wf = `jobs:
  label:
    name: require-area-label
    runs-on: ubuntu-latest
`;
    expect(extractContexts(wf)).toEqual(['require-area-label']);
  });

  it('does not mistake a step-level name for the context', () => {
    const wf = `jobs:
  gate:
    runs-on: ubuntu-latest
    steps:
      - name: a step called something else
        run: echo hi
`;
    expect(extractContexts(wf)).toEqual(['gate']);
  });

  it('collects multiple jobs', () => {
    const wf = `jobs:
  first:
    runs-on: ubuntu-latest
  second:
    name: second-display
    runs-on: ubuntu-latest
`;
    expect(extractContexts(wf)).toEqual(['first', 'second-display']);
  });
});

// ── auditReadiness — the cross of required contexts × producers ──

describe('auditReadiness', () => {
  const workflows = [
    { file: 'a.yml', triggers: new Set(['pull_request', 'merge_group']), contexts: ['ready-gate'] },
    { file: 'b.yml', triggers: new Set(['pull_request']), contexts: ['stale-gate'] },
    { file: 'c.yml', triggers: new Set(['pull_request']), contexts: ['renamed-context'] },
  ];

  it('marks a merge_group-triggering context ready', () => {
    const [row] = auditReadiness(['ready-gate'], workflows);
    expect(row).toMatchObject({ context: 'ready-gate', file: 'a.yml', ready: true });
  });

  it('marks a pull_request-only context not ready', () => {
    const [row] = auditReadiness(['stale-gate'], workflows);
    expect(row).toMatchObject({ context: 'stale-gate', ready: false });
    expect(row.error).toBeUndefined();
  });

  it('flags a required context no workflow produces', () => {
    const [row] = auditReadiness(['ghost'], workflows);
    expect(row.ready).toBe(false);
    expect(row.error).toMatch(/no workflow/);
  });

  it('flags a context produced by more than one workflow', () => {
    const dup = [
      { file: 'x.yml', triggers: new Set(['merge_group']), contexts: ['dup'] },
      { file: 'y.yml', triggers: new Set(['merge_group']), contexts: ['dup'] },
    ];
    const [row] = auditReadiness(['dup'], dup);
    expect(row.ready).toBe(false);
    expect(row.error).toMatch(/2 workflows/);
  });

  it('preserves the required order and counts readiness', () => {
    const rows = auditReadiness(['ready-gate', 'stale-gate', 'renamed-context'], workflows);
    expect(rows.map((r) => r.context)).toEqual(['ready-gate', 'stale-gate', 'renamed-context']);
    expect(rows.filter((r) => r.ready).length).toBe(1);
  });
});
