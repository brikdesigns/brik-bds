import { afterEach, describe, expect, it, vi } from 'vitest';
import { resolveRetiredValue, resolveRetiredProp } from './retiredValue';

/**
 * The runtime half of ADR-033's rename. The compiler already rejects a retired
 * spelling at a typed call site; this covers what it cannot see — a value that
 * arrives from a database column, a CMS field, or an `as string` cast in one of
 * the eight consumer repos.
 */
describe('resolveRetiredValue', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('maps a retired spelling onto its canonical one', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(resolveRetiredValue('Badge', 'tone', 'error', { error: 'negative' })).toBe('negative');
    expect(warn).toHaveBeenCalledOnce();
    expect(warn.mock.calls[0][0]).toContain('[BDS Badge]');
    expect(warn.mock.calls[0][0]).toContain('`tone="error"` is retired');
    expect(warn.mock.calls[0][0]).toContain('`tone="negative"`');
  });

  it('passes a canonical value through untouched and silent', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(resolveRetiredValue('Badge', 'tone', 'negative', { error: 'negative' })).toBe('negative');
    expect(warn).not.toHaveBeenCalled();
  });

  it('passes undefined through so the caller default applies', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(resolveRetiredValue('Badge', 'tone', undefined, { error: 'negative' })).toBeUndefined();
    expect(warn).not.toHaveBeenCalled();
  });

  it('warns once per component + prop + value, not once per render', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    for (let i = 0; i < 200; i += 1) {
      resolveRetiredValue('Counter', 'tone', 'progress', { progress: 'info' });
    }
    expect(warn).toHaveBeenCalledOnce();
  });

  it('keys the once-only warning per component, so two components each warn', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    resolveRetiredValue('Dot', 'tone', 'error', { error: 'negative' });
    resolveRetiredValue('Meter', 'tone', 'error', { error: 'negative' });
    expect(warn).toHaveBeenCalledTimes(2);
  });
});

/**
 * The prop-name half of the same migration (#1925). `resolveRetiredValue`
 * cannot see it: `tone="brand"` carries a canonical VALUE on a retired PROP,
 * so the value path stays silent and the caller never learns to move.
 */
describe('resolveRetiredProp', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('passes the retired prop through and names both spellings once', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(resolveRetiredProp('TextLink', 'tone', 'emphasis', 'neutral', undefined)).toBe('neutral');
    expect(warn).toHaveBeenCalledOnce();
    expect(warn.mock.calls[0][0]).toContain('[BDS TextLink]');
    expect(warn.mock.calls[0][0]).toContain('`tone`');
    expect(warn.mock.calls[0][0]).toContain('`emphasis`');
  });

  it('is silent when only the canonical prop is passed', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(resolveRetiredProp('SocialIcon', 'tone', 'emphasis', undefined, 'brand')).toBe('brand');
    expect(warn).not.toHaveBeenCalled();
  });

  it('lets the canonical prop win when both are passed, and still warns', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(resolveRetiredProp('ContactIcon', 'tone', 'emphasis', 'accent', 'neutral')).toBe('neutral');
    expect(warn).toHaveBeenCalledOnce();
  });

  it('passes undefined through so the caller default applies', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(resolveRetiredProp('Foo', 'tone', 'emphasis', undefined, undefined)).toBeUndefined();
    expect(warn).not.toHaveBeenCalled();
  });

  it('warns once per component + prop pair, not once per render', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    for (let i = 0; i < 200; i += 1) {
      resolveRetiredProp('Bar', 'tone', 'emphasis', 'neutral', undefined);
    }
    expect(warn).toHaveBeenCalledOnce();
  });
});
