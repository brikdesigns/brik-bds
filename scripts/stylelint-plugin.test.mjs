/**
 * Tests for scripts/stylelint-plugin.mjs (#3210).
 *
 * Runs real Stylelint against inline CSS. Each rule has a positive control (a known
 * violation MUST be reported) so a green run cannot mean the rule went blind.
 */
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import stylelint from 'stylelint';
import plugin from './stylelint-plugin.mjs';

// A fixture tokens.css keeps the test hermetic: dist/ is a build output CI's test job does not have.
const tokensPath = join(mkdtempSync(join(tmpdir(), 'bds-stylelint-')), 'tokens.css');
writeFileSync(tokensPath, ':root {\n  --bds-text-negative: red;\n}\n');

const canonical = [true, { tokensPath }];
const config = {
  plugins: [plugin],
  rules: { 'bds/canonical-token-name': canonical, 'bds/cascade-contract': true },
};

async function lint(code, codeFilename = 'consumer.css', rules = config.rules) {
  const { results } = await stylelint.lint({ code, codeFilename, config: { ...config, rules } });
  return results[0].warnings;
}

describe('bds/canonical-token-name', () => {
  it('flags an invented token name (positive control)', async () => {
    const warnings = await lint('.a { color: var(--text-nonexistent-xyz); }');
    expect(warnings.map((w) => w.rule)).toContain('bds/canonical-token-name');
    expect(warnings[0].text).toContain('--text-nonexistent-xyz');
  });

  it('passes a canonical token', async () => {
    expect(await lint('.a { color: var(--bds-text-negative); }')).toEqual([]);
  });

  it('honours the exemptTokens burn-down option', async () => {
    const rules = { 'bds/canonical-token-name': [true, { tokensPath, exemptTokens: ['--text-nonexistent-xyz'] }] };
    expect(await lint('.a { color: var(--text-nonexistent-xyz); }', 'consumer.css', rules)).toEqual([]);
  });

  it('can be switched off', async () => {
    expect(await lint('.a { color: var(--text-nonexistent-xyz); }', 'consumer.css', { 'bds/canonical-token-name': null })).toEqual([]);
  });
});

describe('bds/cascade-contract', () => {
  it('flags redefining a scale token at :root (positive control)', async () => {
    const warnings = await lint(':root {\n  --heading-lg: 2rem;\n}', 'consumer.css', { 'bds/cascade-contract': true });
    expect(warnings.map((w) => w.rule)).toContain('bds/cascade-contract');
    expect(warnings[0].line).toBe(2);
  });

  it('allows a brandable token inside a theme file', async () => {
    expect(await lint(':root {\n  --surface-primary: #fff;\n}', 'theme-acme.css', { 'bds/cascade-contract': true })).toEqual([]);
  });
});
