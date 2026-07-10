import { afterEach, describe, expect, it, vi } from 'vitest';
import { detectPageSlug } from './DevFeedbackWidget';

/**
 * Unit coverage for the no-selection page fallback (brik-bds#890).
 *
 * Runs in the `components` (node) project, so there is no ambient DOM — we stub
 * `window` / `document` per case. This mirrors the inspector's `detectPage()`
 * contract: the URL pathname slug is canonical; `document.title` is only the
 * root-path fallback.
 */
describe('detectPageSlug', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const stub = (pathname: string, title = 'Brik Client Portal') => {
    vi.stubGlobal('window', { location: { pathname } });
    vi.stubGlobal('document', { title });
  };

  it('returns the route slug on a non-root path, not document.title', () => {
    stub('/admin', 'Brik Client Portal');
    expect(detectPageSlug()).toBe('admin');
  });

  it('strips leading and trailing slashes and preserves nested slugs', () => {
    stub('/settings/services/', 'Brik Client Portal');
    expect(detectPageSlug()).toBe('settings/services');
  });

  it('falls back to document.title on the root path (empty slug)', () => {
    stub('/', 'Brik Client Portal');
    expect(detectPageSlug()).toBe('Brik Client Portal');
  });

  it('returns undefined when both the slug and title are empty', () => {
    stub('/', '   ');
    expect(detectPageSlug()).toBeUndefined();
  });

  it('returns undefined in a non-browser (SSR) environment', () => {
    // No window/document stubbed — both are undefined in node.
    expect(detectPageSlug()).toBeUndefined();
  });
});
