/**
 * Proof that lint-token-purpose-slots actually fails.
 *
 * `assertions-must-be-proven-to-fail`: an assertion that has never failed is
 * decoration. These cases plant an unregistered slot, confirm non-zero, remove
 * it, confirm zero — the sabotage step wired so it re-runs on every change
 * instead of living in one session's shell history.
 *
 * The case that matters most is `longest slot wins`: the gate keys
 * `--border-radius-100` to the `border-radius` property slot, not to the
 * `border` color purpose. Get that backwards and 38 length tokens read as
 * colors, which is precisely the one-name-two-concepts collision brik-bds#1910
 * exists to catalogue.
 */

import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const GATE = path.join(HERE, '..', 'lint-token-purpose-slots.mjs');
const REPO = path.join(HERE, '..', '..');

/** Run the gate over `css` from the repo root, so DOC_PATH resolves. */
function run(css, args = []) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'purpose-slots-'));
  const file = path.join(dir, 'tokens.css');
  fs.writeFileSync(file, css);
  // The gate reports progress + findings on stderr (stderr-for-progress, per
  // brik-script-standards), so stdout alone is empty on a passing run.
  const res = spawnSync('node', [GATE, file, ...args], { encoding: 'utf8', cwd: REPO });
  if (res.error) throw res.error;
  return { code: res.status, out: `${res.stdout ?? ''}${res.stderr ?? ''}` };
}

/**
 * A minimum viable registry: one token per slot the doc tables name, so the
 * undocumented-slot check has nothing to complain about and a failure can only
 * come from the sabotage.
 */
const CLEAN = `:root {
  --color-poppy-500: #e35335;
  --background-brand-primary: var(--color-poppy-500);
  --font-size-100: 16px;
  --font-weight-semibold: 600;
  --font-family-body: Poppins;
  --font-line-height-normal: 1.5;
  --font-casing-uppercase: uppercase;
  --letter-spacing-wide: 0.05em;
  --space-400: 16px;
  --size-600: 24px;
  --border-radius-400: 12px;
  --border-width-100: 2px;
  --shadow-blur-400: 8px;
  --shadow-offset-300: 8px;
  --shadow-spread-200: 4px;
  --blur-radius-md: 12px;
  --duration-200: 200ms;
  --delay-100: 100ms;
  --iteration-infinite: infinite;
  --breakpoint-desktop: 1024px;
  --aspect-16-9: 16 / 9;
  --gap-md: var(--space-400);
  --padding-lg: var(--space-400);
  --heading-xl: var(--font-size-100);
  --display-lg: var(--font-size-100);
  --body-md: var(--font-size-100);
  --label-sm: var(--font-size-100);
  --subtitle-md: var(--font-size-100);
  --icon-md: var(--font-size-100);
  --shadow-md: 0px 4px 12px rgba(0, 0, 0, 0.12);
  --box-shadow-md: var(--shadow-md);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --content-width-wide: 1024px;
  --measure-md: 60ch;
  --state-disabled-opacity: 0.5;
  --bds-slider-percent: 0%;
}
`;

describe('lint-token-purpose-slots', () => {
  it('fixture must be valid — the clean registry passes', () => {
    const { code, out } = run(CLEAN);
    expect(out).toMatch(/clean —/);
    expect(code).toBe(0);
  });

  it('fails on an unregistered slot', () => {
    const { code, out } = run(CLEAN.replace('}\n', '  --elevation-md: 4px;\n}\n'));
    expect(code).toBe(1);
    expect(out).toMatch(/--elevation-\* — UNREGISTERED/);
  });

  it('passes an unregistered slot that is dispositioned as drift', () => {
    // `--tooltip-*` is in DRIFT_BACKLOG with a tracking issue.
    const { code, out } = run(CLEAN.replace('}\n', '  --tooltip-background: #000;\n}\n'));
    expect(out).toMatch(/--tooltip-\* — drift, rename owed \(#1910\)/);
    expect(code).toBe(0);
  });

  it('a slotless exception is not reported as drift', () => {
    // `--web` is in SLOTLESS_EXCEPTIONS: decided carve-out, no rename owed.
    // A gate that prints "drift" here re-opens a settled question every run.
    const { code, out } = run(CLEAN.replace('}\n', '  --web: 1200;\n}\n'));
    expect(out).toMatch(/--web — slotless by exception/);
    expect(out).not.toMatch(/--web.*rename owed/);
    expect(code).toBe(0);
  });

  it('drift and exception are different verdicts, not one bucket', () => {
    const css = CLEAN.replace('}\n', '  --web: 1200;\n  --tooltip-background: #000;\n}\n');
    const json = JSON.parse(run(css, ['--json']).out);
    expect(json.slots.find((s) => s.slot === 'web').family).toBe('exception');
    expect(json.slots.find((s) => s.slot === 'tooltip').family).toBe('drift');
  });

  it('longest slot wins — --border-radius-* is a length, not a color', () => {
    const json = JSON.parse(run(CLEAN, ['--json']).out);
    const radius = json.slots.find((s) => s.slot === 'border-radius');
    expect(radius).toBeDefined();
    expect(radius.family).toBe('property');
    // The color `border` slot must not have swallowed it.
    expect(json.slots.find((s) => s.slot === 'border')).toBeUndefined();
  });

  it('measures mixed step vocabularies rather than trusting a declaration', () => {
    // `--border-width-*` really does carry three: numeric (`100`), t-shirt
    // (`md`), and word (`bold`) — dist/tokens.css:255, :400, :1482.
    const css = CLEAN.replace('}\n', '  --border-width-md: 2px;\n  --border-width-bold: 3px;\n}\n');
    const json = JSON.parse(run(css, ['--json']).out);
    const bw = json.slots.find((s) => s.slot === 'border-width');
    expect(bw.stepVocabularies.sort()).toEqual(['numeric', 't-shirt', 'word']);
  });

  it('a reset step is not a second vocabulary', () => {
    const json = JSON.parse(run(CLEAN.replace('}\n', '  --gap-none: 0;\n}\n'), ['--json']).out);
    const gap = json.slots.find((s) => s.slot === 'gap');
    expect(gap.stepVocabularies.sort()).toEqual(['reset', 't-shirt']);
  });

  it('exit 2 on a scan that parsed nothing — never reads as clean', () => {
    const { code, out } = run(':root {\n}\n');
    expect(code).toBe(2);
    expect(out).toMatch(/A zero denominator is a broken scan/);
  });

  it('exit 2 when the registry file is missing', () => {
    const res = spawnSync('node', [GATE, path.join(os.tmpdir(), 'no-such-tokens.css')], {
      encoding: 'utf8', cwd: REPO,
    });
    expect(res.status).toBe(2);
    expect(`${res.stdout}${res.stderr}`).toMatch(/build:dist-tokens/);
  });
});
