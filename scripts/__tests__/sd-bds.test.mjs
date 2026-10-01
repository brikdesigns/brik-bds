/**
 * Style Dictionary hooks for the System ID prefix (ADR-043, #2670): the word-step
 * filter is driven by the grammar, and word-step references are re-pointed at the
 * numeric step they alias.
 */
import { describe, it, expect } from 'vitest';
import StyleDictionary from 'style-dictionary';
import { isRetiredWordStep, prefixName, unprefixName } from '../lib/bds-prefix.mjs';
import { isCanonicalCssToken, registerBdsHooks } from '../lib/sd-bds.mjs';

describe('isRetiredWordStep', () => {
  it.each(['lightest', 'lighter', 'light', 'dark', 'darker', 'darkest', 'base'])('retires color.poppy.%s', (step) => {
    expect(isRetiredWordStep(['color', 'poppy', step])).toBe(true);
  });
  it.each([['500'], ['50'], ['950']])('keeps color.poppy.%s', (step) => {
    expect(isRetiredWordStep(['color', 'poppy', step])).toBe(false);
  });
  it('keeps non-ramp colour names and other tiers', () => {
    expect(isRetiredWordStep(['color', 'grayscale', 'black'])).toBe(false);
    expect(isRetiredWordStep(['color', 'system', 'blue'])).toBe(false);
    expect(isRetiredWordStep(['text', 'dark'])).toBe(false);
  });
  it('filters from CSS output by token path', () => {
    expect(isCanonicalCssToken({ path: ['color', 'tan', 'darkest'] })).toBe(false);
    expect(isCanonicalCssToken({ path: ['color', 'tan', '950'] })).toBe(true);
  });
});

describe('prefix helpers', () => {
  it('prefixes once', () => {
    expect(prefixName('--text-primary')).toBe('--bds-text-primary');
    expect(prefixName('--bds-slider-thumb-size')).toBe('--bds-slider-thumb-size');
    expect(unprefixName('--bds-text-primary')).toBe('--text-primary');
  });
});

describe('Style Dictionary emission', () => {
  it('emits --bds- names, re-points word-step refs, and drops the word steps', async () => {
    registerBdsHooks(StyleDictionary);
    const sd = new StyleDictionary({
      tokens: {
        color: {
          poppy: {
            500: { $value: '#e35335', $type: 'color' },
            700: { $value: '#b0351b', $type: 'color' },
            dark: { $value: '{color.poppy.700}', $type: 'color' },
          },
        },
        text: { brand: { $value: '{color.poppy.dark}', $type: 'color' } },
      },
      preprocessors: ['bds/retire-word-steps'],
      platforms: {
        css: {
          prefix: 'bds',
          transforms: ['name/kebab'],
          buildPath: '/tmp/sd-bds-test/',
          files: [{ destination: 'v.css', format: 'css/variables', filter: isCanonicalCssToken, options: { outputReferences: true } }],
        },
      },
      log: { verbosity: 'silent' },
    });
    const files = await sd.formatPlatform('css');
    const css = files[0].output;
    expect(css).toContain('--bds-color-poppy-500: #e35335;');
    expect(css).toContain('--bds-text-brand: var(--bds-color-poppy-700);');
    expect(css).not.toMatch(/poppy-dark/);
    expect(css).not.toMatch(/^\s*--(color|text)-/m);
  });
});
