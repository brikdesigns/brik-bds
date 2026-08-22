import { afterEach, describe, expect, it, vi } from 'vitest';
import { resolveRetiredValue } from './retiredValue';

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
